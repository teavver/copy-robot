import { Model, ModelState } from "./Model"
import { areRectsIntersecting, blockRectToCanvas } from "../game/utils"
import { COLLISION_CHECK_FIELD_SIZE_PX, COLLISION_DETECTION_FIELD_SIZE_PX } from "../game/globals"
import { Position } from "../types/Position"
import { Size } from "../types/Size"
import { LayerPerformanceStats } from "../types/Performance"

enum CollisionContactType {
    CLOSE, // in detect range, but no collision yet
    DIRECT // objects colliding (red border)
}
type CollisionRectType = "DETECT" | "ACTUAL"

export interface ModelPositionData {
    pos: Position
    size: Size
}

export class Layer {

    name: string
    private context: CanvasRenderingContext2D

    // List of active (visible) models that this layer is responsible for rendering
    private activeModels: Model[]

    constructor(context: CanvasRenderingContext2D, name: string) {
        this.name = name
        this.context = context
        this.activeModels = []
    }

    private isModelActive(model: Model) {
        return this.activeModels.includes(model)
    }

    // destroy objects that fall out of the map (basic GC)
    private isModelOutOfBounds(model: Model) {
        const modelSize = blockRectToCanvas(model.getShape().size)
        const modelPosData: ModelPositionData = { pos: model.pos, size: modelSize }
        const { width, height } = this.context.canvas
        const canvasPosData: ModelPositionData = { pos: { x: 0, y: 0 }, size: { width, height } }
        const inBounds = areRectsIntersecting(modelPosData, canvasPosData)
        if (!inBounds) {
            model.modifyState(ModelState.DESTROYED)
            this.removeModel(model)
            return true
        }
        return false
    }

    // get ModelPositionData for each activeModel in the layer (pre-collision detection util)
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
    // give DETECT for the big one, CHECK for small, NONE for basic conversion Model size -> ModelPositionData
    private getCollisionRect(modelPosData: ModelPositionData, colRectType: CollisionRectType): ModelPositionData {
        const modelSizePx = blockRectToCanvas(modelPosData.size)
        const colRectSize = (colRectType === "DETECT")
            ? COLLISION_DETECTION_FIELD_SIZE_PX
            : COLLISION_CHECK_FIELD_SIZE_PX
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

    // detect & return list of models in detection range from baseModel
    private detectNearbyModels(model: Model): Model[] {

        const baseModelPosData: ModelPositionData = { pos: model.pos, size: model.getShape().size }
        const modelCollisionRect: ModelPositionData = this.getCollisionRect(baseModelPosData, "DETECT")
        const nearbyModels: Model[] = []
        const activeModelsPositions: ModelPositionData[] = this.getActiveModelPositions()

        activeModelsPositions.forEach((activeModel, idx) => {
            // skip checking the base model with itself
            if (activeModel.pos.x === model.pos.x && activeModel.pos.y === model.pos.y) return

            // check if DETECT radiuses are intersecting
            const activeModelColRect = this.getCollisionRect(activeModel, "DETECT")
            if (areRectsIntersecting(modelCollisionRect, activeModelColRect)) {
                nearbyModels.push(this.activeModels[idx])
                // nearbyModels.push(activeModel)
            }
        })
        return nearbyModels
    }

    // not sure if i'll need a more sophisticated collisionType in the future
    private detectCollisionType(baseModel: Model, targetModel: Model): CollisionContactType {
        const baseModelPosData: ModelPositionData = { pos: baseModel.pos, size: blockRectToCanvas(baseModel.getShape().size) }
        const targetModelPosData: ModelPositionData = { pos: targetModel.pos, size: blockRectToCanvas(targetModel.getShape().size) }
        console.log(baseModelPosData)
        if (areRectsIntersecting(baseModelPosData, targetModelPosData)) {
            return CollisionContactType.DIRECT
        }
        return CollisionContactType.CLOSE
    }

    // check collision type and handle it appropriately
    private handleCollision(baseModel: Model, targetModel: Model) {
        const colType: CollisionContactType = this.detectCollisionType(baseModel, targetModel)
        console.log(`collision type: ${CollisionContactType[colType]}`)
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

        // FIRST modelpos
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

            // // draw collision check field (and center it)
            // this.context.strokeStyle = "rgba(255, 255, 0, 1)"
            // const colCR = this.getCollisionRect({ pos: model.pos, size: shape.size }, "CHECK")
            // this.context.strokeRect(colCR.pos.x, colCR.pos.y, colCR.size.width, colCR.size.height)

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
    // The flow of physics in this case is: gravity -> collision check -> other 
    simulatePhysics() {
        this.activeModels.forEach(model => {
            model.applyGravity()
            // TODO: apply collision checks for all MOVING objects
            if (model.name === "Player") {
                const nearbyModels = this.detectNearbyModels(model)
                console.log(`nearby models: ${nearbyModels.map(m => `"${m.name}"`)}`)
                nearbyModels.forEach(targetModel => {
                    this.handleCollision(model, targetModel)
                })
            }
        })
    }

}
