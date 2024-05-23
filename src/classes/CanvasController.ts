import { BLOCK_SIZE_PX } from "../game/globals"

export class CanvasController {
    private canvas: HTMLCanvasElement | null = null

    constructor(canvas: HTMLCanvasElement | null) {
        this.canvas = canvas
    }

    getContext(): CanvasRenderingContext2D | null {
        return this.canvas ? this.canvas.getContext("2d") : null
    }

    clearCanvas(): void {
        const context = this.getContext()
        if (context && this.canvas) {
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    drawBlock(x: number, y: number, color?: string): void {
        const context = this.getContext()
        if (context) {
            context.fillStyle = color ? color : "gray"
            context.fillRect(
                x * BLOCK_SIZE_PX,
                y * BLOCK_SIZE_PX,
                BLOCK_SIZE_PX,
                BLOCK_SIZE_PX,
            )
        }
    }
}
