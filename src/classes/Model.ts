import {
    COLLISION_DETECTION_FIELD_SIZE_PX,
    PLAYER_MOVE_SPEED,
} from "../game/globals"
import { blockRectToCanvas } from "../game/utils"
import { Direction } from "../types/Direction"
import { Position } from "../types/Position"
import { ModelPositionData } from "./Layer"
import { Object, ObjectShape } from "./Object"

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
}

export interface ModelData {
    type: ModelType
    state: ModelState
    gravity: boolean
    displayCollision: boolean
}

export enum CollisionRectType {
    DETECT,
    ACTUAL,
}

export class Model extends Object {
    name: string // used for texture resolution
    type: ModelType
    pos: Position
    state: ModelState
    gravity: boolean
    displayCollision: boolean
    // placeholder for where model wants to move before applying physics
    private moveIntent: Set<Direction>
    // map for active collision contacts.
    // so if the model is 'on the ground', the map will include Direction.DOWN
    private collisionMap: Set<Direction>

    constructor(
        data: ModelData,
        shape: ObjectShape,
        name: string,
        initialPos: Position,
    ) {
        super(shape)
        this.name = name
        this.type = data.type
        this.pos = initialPos
        this.state = data.state
        this.gravity = data.gravity
        this.displayCollision = data.displayCollision
        this.moveIntent = new Set<Direction>()
        this.collisionMap = new Set<Direction>()
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
        if (this.gravity) {
            this.addMoveIntent(Direction.DOWN)
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
        this.collisionMap = new Set<Direction>
    }

    getMoveIntent(): Direction[] {
        return Array.from(this.moveIntent)
    }

    getCollisionMap(): Direction[] {
        return Array.from(this.collisionMap)
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
