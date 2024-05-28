import {
    SECOND_IN_MS,
    GLOBALS,
    MAP_WIDTH,
    MAP_HEIGHT,
} from "../game/globals"
import { Layer } from "./Layer"
import { ObjectShape } from "./Object"
import { Model, ModelType, ModelState } from "./Model"
import { Direction } from "../types/Direction"
import { PerformanceStats } from "../types/Performance"
import { blocksToCanvas } from "../game/utils"

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

    // model objects
    platformModelShape: ObjectShape = {
        size: {
            width: MAP_WIDTH * (2 / 3),
            height: 2,
        },
        texture: "Grey",
        collision: true,
    }

    pillarModelShape: ObjectShape = {
        size: {
            width: 2,
            height: MAP_HEIGHT,
        },
        texture: "LightSlateGrey",
        collision: false,
    }

    playerModelShape: ObjectShape = {
        size: {
            width: 1,
            height: 2,
        },
        texture: "DimGrey",
        collision: true,
    }

    // models TODO: create a separate class for Player and move the models somewhere
    player = new Model(
        {
            type: ModelType.PLAYER,
            state: ModelState.NORMAL,
            gravity: true,
            displayCollision: true,
        },
        this.playerModelShape,
        "Player",
        { x: 60, y: 240 },
    )

    platform = new Model(
        {
            type: ModelType.TERRAIN,
            state: ModelState.NORMAL,
            gravity: false,
            displayCollision: true,
        },
        this.platformModelShape,
        "Platform",
        { x: 0, y: blocksToCanvas(MAP_HEIGHT) - blocksToCanvas(2) },
    ) // 2-block high platform

    pillar = new Model(
        {
            type: ModelType.TERRAIN,
            state: ModelState.NORMAL,
            gravity: false,
            displayCollision: false,
        },
        this.pillarModelShape,
        "Pillar",
        { x: blocksToCanvas((MAP_WIDTH * 3) / 4), y: blocksToCanvas(0) },
    )

    constructor(canvas: HTMLCanvasElement | null, targetFps: number = 60) {
        this.baseCanvas = canvas
        this.frameDuration = SECOND_IN_MS / targetFps
        this.fpsInterval = SECOND_IN_MS

        if (this.baseCanvas) {
            this.baseContext = this.baseCanvas.getContext("2d")
            if (!this.baseContext)
                throw new Error("Base context is not initialized")
            this.layers[GLOBALS.LAYERS.BACKGROUND] = new Layer(
                this.createLayerContext(),
                "BG",
            )
            this.layers[GLOBALS.LAYERS.FOREGROUND] = new Layer(
                this.createLayerContext(),
                "FG",
            )
            console.log("[CC] init OK")
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
        this.layers[layer]?.clear()
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
            this.baseContext.drawImage(
                this.layers[GLOBALS.LAYERS.BACKGROUND].getContext().canvas,
                0,
                0,
            )
            this.baseContext.drawImage(
                this.layers[GLOBALS.LAYERS.FOREGROUND].getContext().canvas,
                0,
                0,
            )
        }
    }

    // main draw loop
    private draw() {
        this.clearLayer(GLOBALS.LAYERS.BACKGROUND)
        this.clearLayer(GLOBALS.LAYERS.FOREGROUND)

        // bg
        this.layers[GLOBALS.LAYERS.BACKGROUND].drawModel(
            this.pillar,
            this.pillar.pos.x,
            this.pillar.pos.y,
        )

        // fg
        this.layers[GLOBALS.LAYERS.FOREGROUND].simulatePhysics()
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(
            this.platform,
            this.platform.pos.x,
            this.platform.pos.y,
        )
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(
            this.player,
            this.player.pos.x,
            this.player.pos.y,
        )

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

    movePlayer(dir: Direction) {
        if (!this.isRunning) return
        this.player.addMoveIntent(dir)
    }

    getPerfStats(): PerformanceStats {
        const fps = parseFloat(this.fps.toFixed(2))
        const bgLayerPerf =
            this.layers[GLOBALS.LAYERS.BACKGROUND].getPerfStats()
        const fgLayerPerf =
            this.layers[GLOBALS.LAYERS.FOREGROUND].getPerfStats()
        return {
            fps,
            layerStats: [bgLayerPerf, fgLayerPerf],
        }
    }

    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true
            this.lastFrameTime = performance.now()
            this.lastFpsUpdateTime = this.lastFrameTime
            this.frameCount = 0
            this.frameRequestID = requestAnimationFrame(this.drawLoop)

            // add active models to layers on init
            this.layers[GLOBALS.LAYERS.BACKGROUND].addModel(this.pillar)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(this.platform)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(this.player)
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

        this.layers[GLOBALS.LAYERS.BACKGROUND].removeModel(this.pillar)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(this.platform)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(this.player)
    }
}
