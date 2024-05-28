import { COLLISION_DETECTION_FIELD_SIZE_PX } from "../game/globals";
import { blockRectToCanvas } from "../game/utils";
import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
import { ModelPositionData } from "./Layer";
import { Object, ObjectShape } from "./Object";

// Model is an extension of a `Shape`
// contains non-abstract logic and can be drawn and manipulated from a Layer.

// The state determines if and what of this model should be drawn
export enum ModelState {
    NORMAL,     // is ok
    KILLED,     // player destroyed model by shooting at it
    DESTROYED,  // killed animation is over - model destroyed (should not be visible)
}

export enum ModelType {
    PLAYER,     // reserved for player
    ENEMY,      // this usually means the model is "killable"
    TERRAIN     // collision on, but not killable
}

export interface ModelData {
    type: ModelType
    state: ModelState
    gravity: boolean
    displayCollision: boolean
}

export enum CollisionRectType {
    DETECT,
    ACTUAL
}

export class Model extends Object {

    name: string // used for texture resolution
    type: ModelType
    pos: Position
    state: ModelState
    gravity: boolean
    displayCollision: boolean
    isMoving: boolean

    constructor(data: ModelData, shape: ObjectShape, name: string, initialPos: Position) {
        super(shape)
        this.name = name
        this.type = data.type
        this.pos = initialPos
        this.state = data.state
        this.gravity = data.gravity
        this.displayCollision = data.displayCollision
        this.isMoving = true // FIX THIS 
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
                x: (this.pos.x - (COLLISION_DETECTION_FIELD_SIZE_PX / 2)),
                y: (this.pos.y - (COLLISION_DETECTION_FIELD_SIZE_PX / 2)),
            },
            size: {
                width: (modelSizePx.width + (COLLISION_DETECTION_FIELD_SIZE_PX)),
                height: (modelSizePx.height + (COLLISION_DETECTION_FIELD_SIZE_PX))
            }
        }
        return data
    }

    // amount in px
    move(dir: Direction, amount: number) {
        // this.isMoving = true
        switch (dir) {
            case Direction.UP:
                this.pos.y -= amount
                break;
            case Direction.DOWN:
                this.pos.y += amount
                break;
            case Direction.RIGHT:
                this.pos.x += amount
                break;
            case Direction.LEFT:
                this.pos.x -= amount
                break;
        }
        // this.isMoving = false
    }

    applyGravity() {
        if (this.gravity) {
            this.isMoving = true
            this.pos.y += 4
            this.isMoving = false
        }
    }

    modifyState(newState: ModelState) {
        this.state = newState
    }
}