import { GLOBALS, BLOCK_SIZE_PX } from "../game/globals"

export class Layer {
    private context: CanvasRenderingContext2D

    constructor(context: CanvasRenderingContext2D) {
        this.context = context
    }

    getContext(): CanvasRenderingContext2D {
        return this.context
    }

    /**
     * Clear the entire layer
     */
    clear() {
        const canvas = this.context.canvas
        this.context.clearRect(0, 0, canvas.width, canvas.height)
        // console.log('[layer] clear ok')
    }

    /**
     * Draw a single Pixel or Block on target layer
     */
    draw(
        x: number,
        y: number,
        sizeX: number = BLOCK_SIZE_PX,
        sizeY: number = BLOCK_SIZE_PX,
        color: string = GLOBALS.COLORS.GRAY,
        block: boolean = false,
    ) {
        this.context.fillStyle = color
        const targetX = block ? x * BLOCK_SIZE_PX : x
        const targetY = block ? y * BLOCK_SIZE_PX : y
        this.context.fillRect(targetX, targetY, sizeX, sizeY)
    }
}
