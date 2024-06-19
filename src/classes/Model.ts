import {
    COLLISION_DETECTION_FIELD_SIZE_PX,
    PLAYER_MOVE_SPEED,
} from "../game/globals"
import { ModelCollisionScope, CollisionScope, CollisionRectType } from "../types/Collision"
import { blockRectToCanvas } from "../game/utils"
import { Direction } from "../types/Direction"
import { Position } from "../types/Position"
import { ModelPositionData } from "./Layer"
import { Object, ObjectShape } from "./Object"
import ENV from "../environment"

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
    onDestroy?: () => void
}

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
    onDestroy: (() => void) | undefined

    constructor(
        data: ModelData,
        shape: ObjectShape,
        name: string,
        initialPos: Position,
    ) {
        super(shape)
        this.name = name
        this.pos = initialPos
        this.type = data.type
        this.state = data.state
        this.moveIntent = new Set<Direction>()
        this.gravityDirection = data.gravityDirection || Direction.DOWN
        this.displayCollision = data.displayCollision || ENV.DRAW_COLLISION
        this.collisionMap = new Set<Direction>()
        this.collisionScope = data.collisionScope || { scope: CollisionScope.SAME_LAYER }
        this.onDirectCollision = data.onDirectCollision
        this.onDestroy = data.onDestroy
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
                x: this.pos.x - COLLISION_DETECTION_FIELD_SIZE_PX / 2,
                y: this.pos.y - COLLISION_DETECTION_FIELD_SIZE_PX / 2,
            },
            size: {
                width: modelSizePx.width + COLLISION_DETECTION_FIELD_SIZE_PX,
                height: modelSizePx.height + COLLISION_DETECTION_FIELD_SIZE_PX,
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
    applyMoveIntentForce(force: number = PLAYER_MOVE_SPEED) {
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
