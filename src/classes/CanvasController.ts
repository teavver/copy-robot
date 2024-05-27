import { SECOND_IN_MS, GLOBALS, MAP_HEIGHT, MAP_WIDTH, BLOCK_SIZE_PX } from "../game/globals"
import { Layer } from "./Layer"
import { Direction } from "../types/Direction"
import { Player } from "./Player"

export class CanvasController {
    // ctx, layers
    private baseCanvas: HTMLCanvasElement | null = null

    // all the drawing ops done on the different layers
    // baseContext is used to render the final composited image that combines
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
    private player: Player

    constructor(canvas: HTMLCanvasElement | null, targetFps: number = 60) {
        this.baseCanvas = canvas
        this.frameDuration = SECOND_IN_MS / targetFps
        this.fpsInterval = SECOND_IN_MS
        this.player = new Player({ x: 0, y: 300 })

        if (this.baseCanvas) {
            this.baseContext = this.baseCanvas.getContext("2d")
            if (!this.baseContext)
                throw new Error("Base context is not initialized")
            this.layers[GLOBALS.LAYERS.BACKGROUND] = new Layer(
                this.createLayerContext(),
            )
            this.layers[GLOBALS.LAYERS.FOREGROUND] = new Layer(
                this.createLayerContext(),
            )
            console.log("[gc controller] init OK")
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

    private draw() {
        const playerPos = this.player.getPosition()
        this.clearLayer(GLOBALS.LAYERS.BACKGROUND)
        this.clearLayer(GLOBALS.LAYERS.FOREGROUND)

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

    getFPS(): number {
        return parseFloat(this.fps.toFixed(2))
    }

    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true
            this.lastFrameTime = performance.now()
            this.lastFpsUpdateTime = this.lastFrameTime
            this.frameCount = 0
            this.frameRequestID = requestAnimationFrame(this.drawLoop)
        }
    }

    stopLoop() {
        this.isRunning = false
        if (this.frameRequestID !== null) {
            cancelAnimationFrame(this.frameRequestID)
            this.frameRequestID = null
        }
    }

    movePlayer(dir: Direction) {
        if (!this.isRunning) return
        this.player.move(dir)
    }
}
