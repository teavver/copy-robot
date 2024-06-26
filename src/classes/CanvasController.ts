import { CONSTANTS } from "../game/constants"
import { Layer } from "./Layer"
import { Direction } from "../types/Direction"
import { PerformanceStats } from "../types/Performance"
import { logger } from "../game/logger"
import { Model, ModelParams, ModelState, ModelType } from "./base/Model"
import { GameModelParams } from "../game/data/models"
import { Character } from "./base/Character"
import { assetManager } from "../components/GameCanvas"
import { Map } from "../types/Map"
import { blocksToPixels } from "../game/utils"
import { Projectile } from "./base/Projectile"

export class CanvasController {

    // ctx, layers
    private baseCanvas: HTMLCanvasElement | null = null

    // drawing ops are done on respective layers in the main loop, the baseContext
    // is used to render the final composited image that combines layers
    private baseContext: CanvasRenderingContext2D | null = null
    private layers: Map<Layer> = {}
    private models: Map<Model> = {}

    // framerate, render loop, fps stats
    private frameDuration: number
    private lastFrameTime: number = 0
    private frameRequestID: number | null = null
    private fps: number = 0
    private frameCount: number = 0
    private fpsInterval: number
    private lastFpsUpdateTime: number = 0

    // misc
    private isRunning: boolean = false

    // s2nd platform for testing gravity & collisions
    constructor(canvas: HTMLCanvasElement | null, baseModels: Map<GameModelParams>, targetFps: number = CONSTANTS.TARGET_FPS) {

        this.baseCanvas = canvas
        this.frameDuration = CONSTANTS.SECOND_IN_MS / targetFps
        this.fpsInterval = CONSTANTS.SECOND_IN_MS

        if (this.baseCanvas) {

            // Init base context
            this.baseContext = this.baseCanvas.getContext("2d")
            if (!this.baseContext)
                throw new Error("(CC) Base context is not initialized")

            // Init layetrs
            this.layers[CONSTANTS.LAYERS.BACKGROUND] = new Layer(
                this.createLayerContext(),
                CONSTANTS.LAYERS.BACKGROUND,
            )
            this.layers[CONSTANTS.LAYERS.FOREGROUND] = new Layer(
                this.createLayerContext(),
                CONSTANTS.LAYERS.FOREGROUND,
            )

            this.models = this.initBaseModels(baseModels)
            logger("(CC) init OK")
        }
    }

    // NOTE: This could be much better
    private initBaseModels(bM: Map<GameModelParams>): Map<Model> {
        const models: Map<Model> = {}
        Object.entries(bM).forEach(([, gModel]) => {
            try {
                // Simple Model
                if (gModel.cls === "Model") {
                    const params: ModelParams = {
                        ...gModel.params,
                        shape: {
                            size: gModel.params.shape.size,
                            txt: assetManager.getTexture(gModel.params.shape.srcTxt.srcOrColor)
                        }
                    }
                    const m = new Model(params)
                    models[m.name] = m
                } else {
                    // Character Model
                    const mp = gModel.params[1]
                    const mParams: ModelParams = {
                        ...mp,
                        shape: {
                            size: mp.shape.size,
                            txt: assetManager.getTexture(mp.shape.srcTxt.srcOrColor)
                        }
                    }
                    const c = new Character(gModel.params[0], mParams)
                    models[c.name] = c
                }
            } catch (error) {
                logger(`(CC) Init model failed: ${error as string}`, 0)
            }
        })
        logger(`(CC) Base models initialized`)
        return models
    }

    private createLayerContext(): CanvasRenderingContext2D {
        if (!this.baseCanvas) throw new Error("Base canvas is not initialized")
        const offscreenCanvas = document.createElement("canvas")
        offscreenCanvas.width = this.baseCanvas.width
        offscreenCanvas.height = this.baseCanvas.height
        return offscreenCanvas.getContext("2d")!
    }

    private clearLayer(layer: string) {
        if (!this.layers[layer]) {
            logger(`[CC] cannot clear layer: does not exist (${layer})`)
            return
        }
        this.layers[layer].clear()
    }

    private compositeLayers() {
        // composite the layers onto the base context and draw the final image
        if (this.baseContext) {
            this.baseContext.clearRect(
                0,
                0,
                this.baseCanvas!.width,
                this.baseCanvas!.height,
            )
            Object.entries(this.layers).forEach(([, layer]) => this.baseContext!.drawImage(layer.getContext().canvas, 0, 0))
        }
    }

    // main draw loop
    private draw() {

        // clear
        Object.keys(this.layers).forEach(layer => this.clearLayer(layer))

        // update models
        Object.values(this.layers).forEach((layer: Layer) => layer.updateActiveModels())

        // fg
        this.layers[CONSTANTS.LAYERS.FOREGROUND].simulatePhysics()

        // PLAYER SHOOT DEMO (WIP)
        const player = this.models["Player"] as Character
        if (player.data.isShooting) {
            const bulletStartPosX = (player.data.faceDir === Direction.LEFT)
                ? player.pos.x - blocksToPixels(CONSTANTS.PLAYER_WIDTH_BL)
                : player.pos.x + blocksToPixels(CONSTANTS.PLAYER_WIDTH_BL)
            const playerBulletPos = {
                x: bulletStartPosX,
                y: player.pos.y + blocksToPixels(CONSTANTS.PLAYER_HEIGHT_BL / 2),
            }

            const bulletModel = new Projectile({
                owner: player.name,
                startingPos: playerBulletPos,
                targetModelType: ModelType.ENEMY,
                gravityDirection: player.data.faceDir,

                onDirectCollision(self: Model, targetModel: Model) {
                    self.modifyState(ModelState.DESTROYED)
                    if (targetModel instanceof Character) {
                        targetModel.applyDamage(CONSTANTS.HIT_DAMAGE)
                    }
                },
            })

            this.layers[CONSTANTS.LAYERS.FOREGROUND].addActiveModels([bulletModel])
            player.data.isShooting = false
        }

        this.layers[CONSTANTS.LAYERS.FOREGROUND].drawActiveModels()
        this.compositeLayers()
    }

    private drawLoop = (timestamp: number) => {
        if (!this.isRunning) return
        const delta = timestamp - this.lastFrameTime
        if (delta >= this.frameDuration) {
            this.lastFrameTime = timestamp - (delta % this.frameDuration)
            this.draw()
            this.updateFps(timestamp)
        }

        this.frameRequestID = requestAnimationFrame(this.drawLoop)
    }

    private updateFps(timestamp: number) {
        this.frameCount++
        const elapsed = timestamp - this.lastFpsUpdateTime
        if (elapsed >= this.fpsInterval) {
            this.fps = (this.frameCount / elapsed) * CONSTANTS.SECOND_IN_MS
            this.frameCount = 0
            this.lastFpsUpdateTime = timestamp
        }
    }


    //// user
    playerMove(dir: Direction) {
        (this.models["Player"] as Character).move(dir)
    }

    playerShoot() {
        (this.models["Player"] as Character).shoot()
    }

    ///// performance logging
    getPerfStats(): PerformanceStats {
        const fps = parseFloat(this.fps.toFixed(2))
        const layerStats = Object.entries(this.layers).map(([, layer]) => layer.getPerfStats())
        return {
            fps,
            layerStats,
        }
    }

    ///// game
    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true
            this.lastFrameTime = performance.now()
            this.lastFpsUpdateTime = this.lastFrameTime
            this.frameCount = 0
            this.frameRequestID = requestAnimationFrame(this.drawLoop)
            this.layers[CONSTANTS.LAYERS.FOREGROUND].addActiveModels(Object.values(this.models))
        }
    }

    stopLoop() {
        this.isRunning = false
        if (this.frameRequestID !== null) {
            cancelAnimationFrame(this.frameRequestID)
            this.frameRequestID = null
        }

        this.lastFrameTime = 0
        this.fps = 0
        this.frameCount = 0
        this.lastFpsUpdateTime = 0
        this.layers[CONSTANTS.LAYERS.FOREGROUND].removeActiveModels(Object.values(this.models))
    }
}
