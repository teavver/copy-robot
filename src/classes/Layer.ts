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
     * Draw a rectangular shape
     * @param x start X (always px)
     * @param y start Y (always px)
     * @param sizeX length of object (default = px, multiplied by BLOCK_SIZE_PX if `block=true`)
     * @param sizeY same but height
     * @param color any CSS compatible colorstring
     * @param block will draw BLOCK_SIZE_PX sized cubes instead of pixels if `true`
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
        const targetX = block ? sizeX * BLOCK_SIZE_PX : sizeX
        const targetY = block ? sizeY * BLOCK_SIZE_PX : sizeY
        this.context.fillRect(x, y, targetX, targetY)
    }
}
