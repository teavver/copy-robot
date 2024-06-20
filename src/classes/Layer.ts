import { Model, ModelState, ModelType } from "./Model"
import { CollisionRectType, CollisionScope } from "../types/Collision"
import { areRectsIntersecting, blockRectToCanvas } from "../game/utils"
import { Position } from "../types/Position"
import { Size } from "../types/Size"
import { LayerPerformanceStats } from "../types/Performance"
import { Direction } from "../types/Direction"
import { Player } from "./Player"
import { PLAYER_MOVE_SPEED, PROJECTILE_MOVE_SPEED } from "../game/globals"
import { logger } from "../game/logger"
import { Bullet } from "./Bullet"

enum CollisionContactType {
    NONE, // far away, not even in detection range
    CLOSE, // in detect range, but no collision yet
    DIRECT, // objects colliding (red border)
}

export interface ModelPositionData {
    pos: Position
    size: Size
}

type ModelMap = {
    [ModelType.ENEMY]: Player
    [ModelType.PLAYER]: Player
    [ModelType.PROJECTILE]: Bullet
    [ModelType.TERRAIN]: Model
}

// For each ModelType, store an array of active Models of that type
// e.g. [ModelType.PLAYER]: Player[]
type ActiveModelsArrayMap = {
    [K in ModelType]: ModelMap[K][]
}

export class Layer {
    name: string
    private context: CanvasRenderingContext2D

    // List of active (visible) models that this layer is responsible for rendering
    private activeEnemyModels: Player[] = []
    private activePlayerModels: Player[] = []
    private activeProjectileModels: Bullet[] = []
    private activeTerrainModels: Model[] = []

    // Keep this array in-memory for faster access. Requires an update on each frame
    private allActiveModels: Model[] = []

    // This solution seems verbose, but by grouping activeModels by the Model type inside them,
    // it's easier to manage them and keep track of garbage collection
    private ActiveModelListMap: ActiveModelsArrayMap = {
        [ModelType.ENEMY]: this.activeEnemyModels,
        [ModelType.PLAYER]: this.activePlayerModels,
        [ModelType.PROJECTILE]: this.activeProjectileModels,
        [ModelType.TERRAIN]: this.activeTerrainModels,
    }

    constructor(context: CanvasRenderingContext2D, name: string) {
        this.name = name
        this.context = context
    }

    private isModelActive(model: Model) {
        return this.getActiveModelsByType(model.type).includes(model)
    }

    // Get all activeModels of one specific ModelType
    private getActiveModelsByType<T extends ModelType>(modelType: T): ModelMap[T][] {
        return this.ActiveModelListMap[modelType]
    }

    // (GC check) Destroy all objects that are outside the canvas view
    private isModelOutOfBounds(mPosData: ModelPositionData): boolean {
        const { width, height } = this.context.canvas
        const canvasPosData: ModelPositionData = {
            pos: { x: 0, y: 0 },
            size: { width, height },
        }
        const [inBounds] = areRectsIntersecting(mPosData, canvasPosData)
        if (!inBounds) return true
        return false
    }

    // (GC check) Check if ModelState is "DESTROYED" - if yes, remove it from the render loop
    private isModelDestroyed(model: Model) {
        return model.state === ModelState.DESTROYED
    }

    // (GC) Remove model from its model type active models array
    private destroyActiveModel(model: Model) {
        model.modifyState(ModelState.DESTROYED)
        this.removeModel(model)
        if (model.onDestroy) model.onDestroy()
    }

    // detect & return list of models in detection range from baseModel
    // modelSize in px
    private detectNearbyModels(baseModel: Model): Model[] {
        const nearbyModels: Model[] = []
        const baseModelColRect = baseModel.getCollisionRect(
            CollisionRectType.DETECT,
        )

        this.allActiveModels.forEach((model: Model) => {
            // skip checking the base model with itself
            if (
                baseModel.pos.x === model.pos.x &&
                baseModel.pos.y === model.pos.y
            )
                return

            // check if DETECT radiuses are intersecting
            const activeModelColRect = model.getCollisionRect(
                CollisionRectType.DETECT,
            )
            if (areRectsIntersecting(baseModelColRect, activeModelColRect)) {
                nearbyModels.push(model)
            }
        })
        return nearbyModels
    }

    // Calc distance between two objects and 
    private detectCollisionType(
        baseModel: Model,
        targetModel: Model,
    ): [CollisionContactType, Direction] {

        // return early if the baseModel is set to collide only with a specific Model type
        // and the targetModel is not the targetType of that collision setting
        if (
            baseModel.collisionScope.scope === CollisionScope.SINGLE_MODEL_TYPE
        ) {
            if (targetModel.type !== baseModel.collisionScope.targetModelType)
                return [CollisionContactType.NONE, Direction.NONE]
        }

        // check direct object intersection
        const baseModelPosData: ModelPositionData = baseModel.getCollisionRect(
            CollisionRectType.ACTUAL,
        )
        const targetModelPosData: ModelPositionData =
            targetModel.getCollisionRect(CollisionRectType.ACTUAL)
        const [intersect, dir] = areRectsIntersecting(
            baseModelPosData,
            targetModelPosData,
        )
        if (intersect) {
            return [CollisionContactType.DIRECT, dir]
        }

        // detection field range
        const baseModelDetectPosData: ModelPositionData =
            baseModel.getCollisionRect(CollisionRectType.DETECT)
        const targetModelDetectPosData: ModelPositionData =
            targetModel.getCollisionRect(CollisionRectType.DETECT)
        const [detected, detectDir] = areRectsIntersecting(
            baseModelDetectPosData,
            targetModelDetectPosData,
        )
        if (detected) {
            return [CollisionContactType.CLOSE, detectDir]
        }
        return [CollisionContactType.NONE, Direction.NONE]
    }

    // check collision type and handle it appropriately
    private handleCollision(
        baseModel: Model,
        targetModel: Model,
        colType: CollisionContactType,
        colDir: Direction,
    ) {
        logger(
            `collision detected: (${baseModel.name}) => (${targetModel.name}) type: ${CollisionContactType[colType]}, dir: ${Direction[colDir]}`,
        )
        if (colType === CollisionContactType.DIRECT) {
            baseModel.removeMoveIntent(colDir)
            baseModel.addCollision(colDir)
            if (baseModel.onDirectCollision) baseModel.onDirectCollision(baseModel, targetModel)
        }
    }

    private addModel(model: Model) {
        logger(`[${this.name}]: Model added: ${JSON.stringify(model, null)}`);
        (this.ActiveModelListMap[model.type] as (typeof model)[]).push(model)
    }

    private removeModel(model: Model) {
        // TODO: Implement a better solution (type-safe)
        // @ts-ignore
        var index = this.ActiveModelListMap[model.type].indexOf(model);
        if (index !== -1) {
            this.ActiveModelListMap[model.type].splice(index, 1);
            logger(`[${this.name}]: Model removed: ${JSON.stringify(model, null, 2)}`);
        }
    }

    /**
     * @param posXposY in px
     * @description By default draw on model's pos, but can change
     * @description Will not draw model on canvas if: - model not in active list, - model is destroyed
     */
    private drawModel(
        model: Model,
        posX: number = model.pos.x,
        posY: number = model.pos.y,
    ) {

        const mShape = model.getShape()
        const mSizePx = blockRectToCanvas(mShape.size)
        this.context.fillStyle = mShape.texture

        this.context.fillRect(posX, posY, mSizePx.width, mSizePx.height)
        if (model.displayCollision) {
            // draw col detection field rect
            this.context.strokeStyle = "rgba(255, 255, 200, 1)"
            const colDR = model.getCollisionRect(CollisionRectType.DETECT)
            this.context.strokeRect(
                colDR.pos.x,
                colDR.pos.y,
                colDR.size.width,
                colDR.size.height,
            )
            // draw actual col rect
            this.context.strokeStyle = "rgba(255, 0, 0, 1)"
            const colR = model.getCollisionRect(CollisionRectType.ACTUAL)
            this.context.strokeRect(
                colR.pos.x,
                colR.pos.y,
                colR.size.width,
                colR.size.height,
            )
        }
    }

    // Active models are updated on each frame, before any logic is executed
    updateActiveModels() {
        this.allActiveModels = Object.values(this.ActiveModelListMap).flat()
    }

    // Remove Model(s) from activeModels list
    removeActiveModels(models: Model[]) {
        models.forEach(m => this.removeModel(m))
    }

    // Add Model(s) to activeModels list
    addActiveModels(models: Model[]) {
        models.forEach(m => this.addModel(m))
    }

    getPerfStats(): LayerPerformanceStats {
        return {
            layerName: this.name,
            activeModels: this.allActiveModels.map((m) => ({
                type: m.type,
                name: m.name,
            })),
        }
    }

    drawActiveModels() {
        this.allActiveModels.forEach(model => {
            this.drawModel(model)
        })
    }

    getContext(): CanvasRenderingContext2D {
        return this.context
    }

    clear() {
        const canvas = this.context.canvas
        this.context.clearRect(0, 0, canvas.width, canvas.height)
    }

    private checkForModelCleanup(model: Model): boolean {
        const mShape = model.getShape()
        const mSizePx = blockRectToCanvas(mShape.size)
        const mPosData: ModelPositionData = { pos: model.pos, size: mSizePx }
        // TODO: add garbage collection logs for LOG=2
        if (
            !this.isModelActive(model) ||
            this.isModelDestroyed(model) ||
            this.isModelOutOfBounds(mPosData)
        ) {
            this.destroyActiveModel(model)
            return true
        }
        return false
    }

    // Simulate physics for all models that belong to this layer
    // The order of physics ops in this case is:
    // Read Movement intent from objects => Apply Gravity => Apply Collision checks => Movement execution
    simulatePhysics() {
        this.allActiveModels.forEach((model) => {


            // run per-model GC routine
            if (this.checkForModelCleanup(model)) return

            model.applyGravity()

            // if there are models nearby, run a collision check
            const nearbyModels = this.detectNearbyModels(model)
            if (nearbyModels.length > 0) {
                nearbyModels.forEach((nearbyModel) => {
                    const [colType, colDir] = this.detectCollisionType(
                        model,
                        nearbyModel,
                    )
                    if (colType !== CollisionContactType.NONE) {
                        this.handleCollision(
                            model,
                            nearbyModel,
                            colType,
                            colDir,
                        )
                    }
                })
            }

            // TODO: simplify this once Enemy/Boss class is implemented
            if (model.type === ModelType.PLAYER || model.type === ModelType.ENEMY) {
                const player = model as Player
                player.updateData()
            }

            // TEMP HERE
            const moveForce = (model.type === ModelType.PROJECTILE)
                ? PROJECTILE_MOVE_SPEED
                : PLAYER_MOVE_SPEED
            model.applyMoveIntentForce(moveForce)
            model.resetMoveIntent()
            model.resetCollisionMap()
        })
    }
}
