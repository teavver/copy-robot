import {
    COLLISION_DETECTION_FIELD_SIZE_PX,
    PLAYER_MOVE_SPEED,
} from "../game/globals"
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
    ENEMY, // this usually means the model is "killable"
    TERRAIN, // collision on, but not killable
    PROJECTILE // bullets
}

export interface ModelData {
    type: ModelType
    state: ModelState
    gravityDirection?: Direction                            // Defaults to 'DOWN'. To disable use 'NONE'
    displayCollision?: boolean                              // Defaults to DRAW_COLLISION value in environment.ts
    collisionScope?: ModelCollisionScope<CollisionScope>    // Defaults to 'SAME_LAYER'
}

export enum CollisionScope {
    NONE, // Model with disabled collision
    SAME_LAYER,
    GLOBAL,
    SINGLE_MODEL_TYPE
}

type ModelCollisionScope<T extends CollisionScope> = T extends CollisionScope.SINGLE_MODEL_TYPE
    ? { modelType: ModelType }
    : T

export enum CollisionRectType {
    DETECT,
    ACTUAL,
}

export class Model extends Object {
    name: string // used for texture resolution
    type: ModelType
    pos: Position
    state: ModelState
    gravityDirection: Direction
    displayCollision: boolean
    // Map of active collision directions. E.g. if on the ground: will include Direction.DOWN
    private collisionMap: Set<Direction>
    // moveIntent holds a set of direction instructions, which are later evaluated by `simulatePhysics`
    private moveIntent: Set<Direction>
    private collisionScope: ModelCollisionScope<CollisionScope>

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
        this.collisionScope = data.collisionScope || CollisionScope.SAME_LAYER
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

    getCollisionScope(): ModelCollisionScope<CollisionScope> {
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
