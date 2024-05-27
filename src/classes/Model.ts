import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
import { Object, ObjectShape } from "./Object";

// Model is an extension of a `Shape` - not abstract like Shape,
// can be drawn and manipulated from a Layer.

// The state holds information about what should be visible when 'drawing'
// the Model and which frame of current state should be visible
export enum ModelState {
    NORMAL,
    DESTROYED,
}

export enum ModelType {
    PLAYER,
    ENEMY,
    TERRAIN
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