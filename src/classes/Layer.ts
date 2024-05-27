import { Model } from "./Model"
import { blockToCanvas } from "../game/utils"

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
     * posX, posY are in px
     */
    drawModel(model: Model, posX: number, posY: number) {
        this.context.fillStyle = model.getShape().texture
        const { width, height } = blockToCanvas(model.getShape().size)
        this.context.fillRect(posX, posY, width, height)
    }

}
