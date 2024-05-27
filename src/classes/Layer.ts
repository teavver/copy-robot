import { Model, ModelState } from "./Model"
import { areRectsIntersecting, blockRectToCanvas } from "../game/utils"
import { COLLISION_CHECK_FIELD_SIZE_PX, COLLISION_DETECTION_FIELD_SIZE_PX } from "../game/globals"
import { Position } from "../types/Position"
import { Size } from "../types/Size"
import { LayerPerformanceStats } from "../types/Performance"

type CollisionContactType = "none" | "close" | "direct"
type CollisionRectType = "DETECT" | "CHECK"

export interface ModelPositionData {
    pos: Position
    size: Size
}

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
        const modelSize = blockRectToCanvas(model.getShape().size)
        const outOfBounds = (
            model.pos.x + modelSize.width < 0 ||
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

    private getActiveModelPositions(): ModelPositionData[] {
        const posArr: ModelPositionData[] = []
        this.activeModels.forEach(model => {
            const posData: ModelPositionData = {
                pos: model.pos,
                size: blockRectToCanvas(model.getShape().size)
            }
            posArr.push(posData)
        })
        return posArr
    }

    // pretty useful for debugging
    // give DETECT for the big one, CHECK for small
    private getCollisionRect(modelPosData: ModelPositionData, colRectType: CollisionRectType): ModelPositionData {
        const modelSizePx = blockRectToCanvas(modelPosData.size)
        const colRectSize = colRectType === "DETECT" ? COLLISION_DETECTION_FIELD_SIZE_PX : COLLISION_CHECK_FIELD_SIZE_PX
        const data: ModelPositionData = {
            pos: {
                x: (modelPosData.pos.x - (colRectSize / 2)),
                y: (modelPosData.pos.y - (colRectSize / 2)),
            },
            size: {
                width: (modelSizePx.width + (colRectSize)),
                height: (modelSizePx.height + (colRectSize))
            }
        }
        return data
    }

    // detect all models in range from a certain model (radius)
    // will return list of ones that contact with the passed `model` (if any)
    // TODO: classify collision as "NONE", "CLOSE" or "DIRECT"
    private detectNearbyModels(model: Model): ModelPositionData[] {
        const nearbyModels: ModelPositionData[] = []
        const baseModelPosData: ModelPositionData = { pos: model.pos, size: model.getShape().size }
        const modelCollisionRect: ModelPositionData = this.getCollisionRect(baseModelPosData, "DETECT")
        const activeModelsPositions: ModelPositionData[] = this.getActiveModelPositions()
        activeModelsPositions.forEach(activeModel => {
            // skip the base model
            if (activeModel.pos.x === model.pos.x && activeModel.pos.y === model.pos.y) return

            // check if DETECT radiuses are intersecting
            const activeModelColRect = this.getCollisionRect(activeModel, "DETECT")
            if (areRectsIntersecting(modelCollisionRect, activeModelColRect)) {
                nearbyModels.push(activeModel)
            }
        })
        return nearbyModels
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

    getPerfStats(): LayerPerformanceStats {
        return {
            layerName: this.name,
            activeModels: this.activeModels.map(model => model.name)
        }
    }

    /**
     * @param posXposY in px
     * @description Will not draw model on canvas if its not active or out of bounds
     */
    drawModel(model: Model, posX: number, posY: number) {
        // do not draw inactive and destroyed models
        if (model.state === ModelState.DESTROYED) return

        // console.log(`model name: ${model.name}, isOutOfBounds: ${this.isModelOutOfBounds(model)}`)
        if (!this.isModelActive(model) || this.isModelOutOfBounds(model)) return
        const shape = model.getShape()
        const { width, height } = blockRectToCanvas(shape.size)
        this.context.fillStyle = shape.texture
        this.context.fillRect(posX, posY, width, height)
        if (model.displayCollision) {

            // draw collisision detection field
            this.context.strokeStyle = "rgba(255, 255, 200, 1)"
            const colDR = this.getCollisionRect({ pos: model.pos, size: shape.size }, "DETECT")
            this.context.strokeRect(colDR.pos.x, colDR.pos.y, colDR.size.width, colDR.size.height)

            // draw collision check field (and center it)
            this.context.strokeStyle = "rgba(255, 255, 0, 1)"
            const colCR = this.getCollisionRect({ pos: model.pos, size: shape.size }, "CHECK")
            this.context.strokeRect(colCR.pos.x, colCR.pos.y, colCR.size.width, colCR.size.height)

            // test2
            // this.context.strokeRect((posX - (COLLISION_FIELD_SIZE_PX / 2)),
            //     (posY - (COLLISION_FIELD_SIZE_PX / 2)),
            //     (width + (COLLISION_FIELD_SIZE_PX)),
            //     (height + (COLLISION_FIELD_SIZE_PX)))

            // draw actual model collision rect
            this.context.strokeStyle = "rgba(255, 0, 0, 1)"
            this.context.strokeRect(posX, posY, width, height)
        }
    }

    // Simulate physics for all models that belong to this layer
    // The flow of physics in this case is: collision -> gravity -> other 
    simulatePhysics() {
        // get positions of all objects for this tick
        this.activeModels.forEach(model => {
            // console.log(`model ${model.name}, ismoving: ${model.isMoving}`)
            if (model.name === "Player") {
                console.log(`baseModel: ${model.name}, nearby models: ${this.detectNearbyModels(model)}`)
            }
            model.applyGravity()
        })
    }

}
