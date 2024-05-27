import { Model } from "./Model"
import { blockToCanvas } from "../game/utils"

export class Layer {

    private context: CanvasRenderingContext2D
    // List of active (visible) models that should be rendered in game loop
    private models: Model[]

    constructor(context: CanvasRenderingContext2D) {
        this.context = context
        this.models = []
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
        const { width, height } = blockToCanvas(model.getShape().size)
        this.context.fillStyle = model.getShape().texture
        this.context.fillRect(posX, posY, width, height)
        if (model.displayCollision) {
            this.context.strokeStyle = "rgba(255, 255, 0, 1)"
            this.context.strokeRect(posX, posY, width, height)
        }
    }

}
