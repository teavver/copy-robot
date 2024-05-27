import { Model, ModelState } from "./Model"
import { blockToCanvas } from "../game/utils"
import { Position } from "../types/Position"
import { ObjectShape } from "./Object"

export class Layer {

    name: string
    private context: CanvasRenderingContext2D
    // List of active (visible) models that should be rendered in game loop
    private activeModels: Model[]

    constructor(context: CanvasRenderingContext2D, name: string) {
        this.name = name
        this.context = context
        this.activeModels = []
    }


    private isModelActive(model: Model) {
        return this.activeModels.includes(model)
    }

    // in order for the model to be out of bounds, 
    // it needs to be entirely outside of canvas view
    private isModelOutOfBounds(model: Model) {
        const { width, height } = this.context.canvas
        const modelSize = blockToCanvas(model.getShape().size)
        const outOfBounds = (
            model.pos.x + modelSize.width < 20 ||
            model.pos.x > width ||
            model.pos.y + modelSize.height < 0 ||
            model.pos.y > height
        )
        if (outOfBounds) {
            model.modifyState(ModelState.DESTROYED)// destroy the object
            this.removeModel(model)
            return true
        }
        return false
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

    addModel(model: Model) {
        this.activeModels.push(model)
        console.log(`[${this.name}] layer model added: ${JSON.stringify(model, null, 2)}`)
    }

    removeModel(model: Model) {
        this.activeModels = this.activeModels.filter(m => m !== model)
        console.log(`[${this.name}] layer model removed: ${JSON.stringify(model, null, 2)}`)
    }

    /**
     * @param posXposY in px
     * @description Will not draw model on canvas if its not active or out of bounds
     */
    drawModel(model: Model, posX: number, posY: number) {
        // do not draw inactive and destroyed models
        if (model.state === ModelState.DESTROYED) return
        console.log(`model name: ${model.name}, isOutOfBounds: ${this.isModelOutOfBounds(model)}`)
        if (!this.isModelActive(model) || this.isModelOutOfBounds(model)) return
        const shape = model.getShape()
        const { width, height } = blockToCanvas(shape.size)
        this.context.fillStyle = shape.texture
        this.context.fillRect(posX, posY, width, height)
        if (model.displayCollision) {
            this.context.strokeStyle = "rgba(255, 255, 0, 1)"
            this.context.strokeRect(posX, posY, width, height)
        }
    }

}
