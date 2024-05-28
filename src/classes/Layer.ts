import { Model, ModelState, CollisionRectType } from "./Model"
import { areRectsIntersecting, blockRectToCanvas } from "../game/utils"
import { Position } from "../types/Position"
import { Size } from "../types/Size"
import { LayerPerformanceStats } from "../types/Performance"
import { Direction } from "../types/Direction"

enum CollisionContactType {
    NONE,  // far away, not even in detection range
    CLOSE, // in detect range, but no collision yet
    DIRECT // objects colliding (red border)
}

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
    private isModelOutOfBounds(model: Model, mPosData: ModelPositionData): boolean {
        const { width, height } = this.context.canvas
        const canvasPosData: ModelPositionData = { pos: { x: 0, y: 0 }, size: { width, height } }
        const inBounds = areRectsIntersecting(mPosData, canvasPosData)
        if (!inBounds) {
            model.modifyState(ModelState.DESTROYED)
            this.removeModel(model)
            return true
        }
        return false
    }

    // detect & return list of models in detection range from baseModel
    // modelSize in px
    private detectNearbyModels(baseModel: Model): Model[] {
        const nearbyModels: Model[] = []
        const baseModelColRect = baseModel.getCollisionRect(CollisionRectType.DETECT)
        this.activeModels.forEach((model: Model, idx) => {
            // skip checking the base model with itself
            if (baseModel.pos.x === model.pos.x && baseModel.pos.y === model.pos.y) return

            // check if DETECT radiuses are intersecting
            const activeModelColRect = model.getCollisionRect(CollisionRectType.DETECT)
            if (areRectsIntersecting(baseModelColRect, activeModelColRect)) {
                nearbyModels.push(this.activeModels[idx])
            }
        })
        return nearbyModels
    }

    // not sure if i'll need a more sophisticated collisionType in the future
    private detectCollisionType(baseModel: Model, targetModel: Model): [CollisionContactType, Direction] {

        // check intersection first
        const baseModelPosData: ModelPositionData = baseModel.getCollisionRect(CollisionRectType.ACTUAL)
        const targetModelPosData: ModelPositionData = targetModel.getCollisionRect(CollisionRectType.ACTUAL)
        const [intersect, dir] = areRectsIntersecting(baseModelPosData, targetModelPosData)
        if (intersect) {
            return [CollisionContactType.DIRECT, dir]
        }

        // detection field range
        const baseModelDetectPosData: ModelPositionData = baseModel.getCollisionRect(CollisionRectType.DETECT)
        const targetModelDetectPosData: ModelPositionData = targetModel.getCollisionRect(CollisionRectType.DETECT)
        const [detected, detectDir] = areRectsIntersecting(baseModelDetectPosData, targetModelDetectPosData)
        if (detected) {
            return [CollisionContactType.CLOSE, detectDir]
        }
        return [CollisionContactType.NONE, Direction.NONE]


    }

    // check collision type and handle it appropriately
    private handleCollision(baseModel: Model, targetModel: Model, colType: CollisionContactType, colDir: Direction) {
        console.log(`baseModel: ${baseModel.name} collision type: ${CollisionContactType[colType]}, colDir: ${Direction[colDir]}`)
        // if (colType === CollisionContactType.DIRECT) {

        // }
        // console.log(`collision type: ${CollisionContactType[colType]}`)
    }

    getContext(): CanvasRenderingContext2D {
        return this.context
    }

    clear() {
        const canvas = this.context.canvas
        this.context.clearRect(0, 0, canvas.width, canvas.height)
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

        const mShape = model.getShape()
        const mSizePx = blockRectToCanvas(mShape.size)
        const mPosData: ModelPositionData = { pos: model.pos, size: mSizePx }
        // console.log(`model name: ${model.name}, isOutOfBounds: ${this.isModelOutOfBounds(model)}`)

        if (!this.isModelActive(model) || this.isModelOutOfBounds(model, mPosData)) return
        this.context.fillStyle = mShape.texture

        this.context.fillRect(posX, posY, mSizePx.width, mSizePx.height)
        if (model.displayCollision) {
            // draw col detection field rect
            this.context.strokeStyle = "rgba(255, 255, 200, 1)"
            const colDR = model.getCollisionRect(CollisionRectType.DETECT)
            this.context.strokeRect(colDR.pos.x, colDR.pos.y, colDR.size.width, colDR.size.height)
            // draw actual col rect
            this.context.strokeStyle = "rgba(255, 0, 0, 1)"
            const colR = model.getCollisionRect(CollisionRectType.ACTUAL)
            this.context.strokeRect(colR.pos.x, colR.pos.y, colR.size.width, colR.size.height)
        }
    }

    // Simulate physics for all models that belong to this layer
    // The order of physics ops in this case is:
    // Read Movement intent from objects => Apply Gravity => Apply Collision checks => Movement execution
    simulatePhysics() {
        this.activeModels.forEach(model => {

            const moveIntent = model.getMoveIntent()
            if (model.name === "Player") {
                console.log(`player move intent: ${moveIntent}`)
            }

            model.applyGravity()

            // if there are models nearby, run a collision check
            const nearbyModels = this.detectNearbyModels(model)
            if (nearbyModels.length > 0) {
                nearbyModels.forEach(nearbyModel => {
                    const [colType, colDir] = this.detectCollisionType(model, nearbyModel)
                    if (colType !== CollisionContactType.NONE) {
                        this.handleCollision(model, nearbyModel, colType, colDir)
                    }
                })
            }

            model.applyMoveIntentForce()
            model.resetMoveIntent()
        })
    }

}
