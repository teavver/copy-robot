import { CONSTANTS } from "../../game/constants"
import { ModelCollisionScope, CollisionScope, CollisionRectType } from "../../types/Collision"
import { blockRectToCanvas, blocksToPixels } from "../../game/utils"
import { Direction } from "../../types/Direction"
import { Position } from "../../types/Position"
import { ModelPositionData } from "../Layer"
import { Object, ObjectShape } from "./Object"
import ENV from "../../environment"

// Model is an extension of a `Shape`
// contains non-abstract logic and can be drawn and manipulated from a Layer.

// The state determines if and what of this model should be drawn
export enum ModelState {
    NORMAL, // is ok
    KILLED, // player destroyed model by shooting at it
    DESTROYED, // killed animation is over - model destroyed (should not be visible)
}

export enum ModelType {
    PLAYER, // reserved for player
    ENEMY, // reserved for enemies (Boss included)
    TERRAIN, // collision on, but not killable
    PROJECTILE // bullets
}

export interface ModelData {
    type: ModelType
    state: ModelState
    gravityDirection?: Direction                            // Defaults to 'DOWN'. To disable use 'NONE'
    displayCollision?: boolean                              // Defaults to DRAW_COLLISION value in environment.ts
    collisionScope?: ModelCollisionScope                    // Defaults to 'SAME_LAYER'

    // Custom per-model callbacks on specific events during game loop
    onDirectCollision?: (self: Model, targetModel: Model) => void
    onDestroy?: (self: Model) => void
}

export interface ModelParams {
    data: ModelData,
    shape: ObjectShape,
    name: string,
    initialPos: Position,
}

export interface ModelCallbacks extends Pick<ModelData, 'onDirectCollision' | 'onDestroy'> { }

export class Model extends Object {
    name: string // used for texture resolution
    type: ModelType
    pos: Position
    state: ModelState
    gravityDirection: Direction
    displayCollision: boolean
    // This determines this Models' behavior during collisions
    collisionScope: ModelCollisionScope
    // Map of active collision directions. E.g. if on the ground: will include Direction.DOWN
    private collisionMap: Set<Direction>
    // moveIntent holds a set of direction instructions, which are later evaluated by `simulatePhysics`
    private moveIntent: Set<Direction>
    onDirectCollision: ((s: Model, tM: Model) => void) | undefined
    onDestroy: ((s: Model) => void) | undefined

    constructor(
        params: ModelParams
    ) {
        super(params.shape)
        this.name = params.name
        this.pos = params.initialPos
        this.type = params.data.type
        this.state = params.data.state
        this.moveIntent = new Set<Direction>()
        this.gravityDirection = params.data.gravityDirection || Direction.DOWN
        this.displayCollision = params.data.displayCollision || ENV.DRAW_COLLISION
        this.collisionMap = new Set<Direction>()
        this.collisionScope = params.data.collisionScope || { scope: CollisionScope.SAME_LAYER }
        this.onDirectCollision = params.data.onDirectCollision
        this.onDestroy = params.data.onDestroy
    }

    // pretty useful for debugging
    // give DETECT for the big one, ACTUAL for the real collision rect of Model
    getCollisionRect(type: CollisionRectType): ModelPositionData {
        const modelSizePx = blockRectToCanvas(this.getShape().size)
        if (type === CollisionRectType.ACTUAL) {
            return { pos: this.pos, size: modelSizePx }
        }
        const data: ModelPositionData = {
            pos: {
                x: this.pos.x - blocksToPixels(CONSTANTS.COLLISION_DETECTION_FIELD_BL) / 2,
                y: this.pos.y - blocksToPixels(CONSTANTS.COLLISION_DETECTION_FIELD_BL) / 2,
            },
            size: {
                width: modelSizePx.width + blocksToPixels(CONSTANTS.COLLISION_DETECTION_FIELD_BL),
                height: modelSizePx.height + blocksToPixels(CONSTANTS.COLLISION_DETECTION_FIELD_BL),
            },
        }
        return data
    }

    applyGravity() {
        if (this.gravityDirection !== Direction.NONE) {
            this.addMoveIntent(this.gravityDirection)
        }
    }

    modifyState(newState: ModelState) {
        this.state = newState
    }

    addMoveIntent(direction: Direction) {
        this.moveIntent.add(direction)
    }

    addCollision(direction: Direction) {
        this.collisionMap.add(direction)
    }

    removeMoveIntent(direction: Direction) {
        this.moveIntent.delete(direction)
    }

    resetMoveIntent() {
        this.moveIntent = new Set<Direction>()
    }

    resetCollisionMap() {
        this.collisionMap = new Set<Direction>()
    }

    getMoveIntentMap(): Direction[] {
        return Array.from(this.moveIntent)
    }

    getCollisionMap(): Direction[] {
        return Array.from(this.collisionMap)
    }

    getCollisionScope(): ModelCollisionScope {
        return this.collisionScope
    }

    // force = px per tick/frame
    applyMoveIntentForce(force: number = CONSTANTS.PLAYER_MOVE_SPEED) {
        this.moveIntent.forEach((dir: Direction) => {
            switch (dir) {
                case Direction.UP:
                    this.pos.y -= force
                    break
                case Direction.LEFT:
                    this.pos.x -= force
                    break
                case Direction.DOWN:
                    this.pos.y += force
                    break
                case Direction.RIGHT:
                    this.pos.x += force
                    break
            }
        })
    }
}
