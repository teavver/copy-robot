import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
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

export class Model extends Object {

    name: string // used for texture resolution
    type: ModelType
    pos: Position
    state: ModelState
    gravity: boolean
    displayCollision: boolean

    constructor(data: ModelData, shape: ObjectShape, name: string, initialPos: Position) {
        super(shape)
        this.name = name
        this.type = data.type
        this.pos = initialPos
        this.state = data.state
        this.gravity = data.gravity
        this.displayCollision = data.displayCollision
    }

    // amount in px
    move(dir: Direction, amount: number) {
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
    }

    modifyState(newState: ModelState) {
        this.state = newState
    }
}