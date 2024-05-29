import { SECOND_IN_MS, GLOBALS } from "../game/globals"
import { Layer } from "./Layer"
import { Direction } from "../types/Direction"
import { PerformanceStats } from "../types/Performance"
import { player, bossCageCeiling, bossCageFloor, bossCageLeftWall, bossCageRightWall } from "../game/models"

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

        // fg
        this.layers[GLOBALS.LAYERS.FOREGROUND].simulatePhysics()
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(bossCageFloor)
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(bossCageCeiling)
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(bossCageLeftWall)
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(bossCageRightWall)
        this.layers[GLOBALS.LAYERS.FOREGROUND].drawModel(player)

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
        player.move(dir)
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
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(bossCageRightWall)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(bossCageLeftWall)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(bossCageCeiling)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(bossCageFloor)
            this.layers[GLOBALS.LAYERS.FOREGROUND].addModel(player)
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

        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(bossCageRightWall)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(bossCageLeftWall)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(bossCageCeiling)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(bossCageFloor)
        this.layers[GLOBALS.LAYERS.FOREGROUND].removeModel(player)
    }
}
