import { SECOND_IN_MS, GLOBALS, PLAYER_HEIGHT, PLAYER_WIDTH, TARGET_FPS } from "../game/globals"
import { Layer } from "./Layer"
import { Direction } from "../types/Direction"
import { PerformanceStats } from "../types/Performance"
import { player, boss, bossCageCeiling, bossCageFloor, bossCageLeftWall, bossCageRightWall } from "../game/models"
import { blocksToCanvas } from "../game/utils"
import { Bullet } from "./Bullet"
import { logger } from "../game/logger"
import { ModelType } from "./Model"

// Spawn these models at the beginning of a run
const initFgModels = [bossCageCeiling, bossCageFloor, bossCageLeftWall, bossCageRightWall, player, boss]

export class CanvasController {
    // ctx, layers
    private baseCanvas: HTMLCanvasElement | null = null

    // drawing ops are done on respective layers in the main loop, the baseContext
    // is used to render the final composited image that combines layers
    private baseContext: CanvasRenderingContext2D | null = null
    private layers: { [key: string]: Layer } = {}

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
    constructor(canvas: HTMLCanvasElement | null, targetFps: number = TARGET_FPS) {
        this.baseCanvas = canvas
        this.frameDuration = SECOND_IN_MS / targetFps
        this.fpsInterval = SECOND_IN_MS

        if (this.baseCanvas) {
            // Init base context
            this.baseContext = this.baseCanvas.getContext("2d")
            if (!this.baseContext)
                throw new Error("Base context is not initialized")
            // Init layetrs
            this.layers[GLOBALS.LAYERS.BACKGROUND] = new Layer(
                this.createLayerContext(),
                GLOBALS.LAYERS.BACKGROUND,
            )
            this.layers[GLOBALS.LAYERS.FOREGROUND] = new Layer(
                this.createLayerContext(),
                GLOBALS.LAYERS.FOREGROUND,
            )
            logger("[CC] init OK")
        }
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
        this.layers[GLOBALS.LAYERS.FOREGROUND].simulatePhysics()

        // PLAYER SHOOT DEMO
        if (player.data.isShooting) {
            const bulletStartPosX = (player.data.faceDir === Direction.LEFT)
                ? player.pos.x - blocksToCanvas(PLAYER_WIDTH)
                : player.pos.x + blocksToCanvas(PLAYER_WIDTH)
            const playerBulletPos = {
                x: bulletStartPosX,
                y: player.pos.y + blocksToCanvas(PLAYER_HEIGHT / 2),
            }

            const bulletModel = new Bullet({
                owner: player.name,
                startingPos: playerBulletPos,
                targetModelType: ModelType.ENEMY,
                gravityDirection: player.data.faceDir,
            })

            this.layers[GLOBALS.LAYERS.FOREGROUND].addActiveModels([bulletModel])
            player.data.isShooting = false
        }

        this.layers[GLOBALS.LAYERS.FOREGROUND].drawActiveModels()
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
            this.fps = (this.frameCount / elapsed) * SECOND_IN_MS
            this.frameCount = 0
            this.lastFpsUpdateTime = timestamp
        }
    }


    //// user
    playerMove(dir: Direction) {
        player.move(dir)
    }

    playerShoot() {
        player.shoot()
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
            this.layers[GLOBALS.LAYERS.FOREGROUND].addActiveModels(initFgModels)
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
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeActiveModels(initFgModels)
    }
}
