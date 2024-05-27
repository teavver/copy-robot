import { Object, ObjectShape } from "./Object";

// Model is an extension of a `Shape` - not abstract like Shape,
// can be drawn and manipulated from a Layer.

// The state holds information about what should be visible when 'drawing'
// the Model and which frame of current state should be visible
enum ModelState {
    NORMAL,
    DESTROYED,
}

enum ModelType {
    PLAYER,
    ENEMY,
    TERRAIN
}

interface ModelData {
    type: ModelType
    state: ModelState
    gravity: boolean
    displayCollision: boolean
}

export class Model extends Object {

    private type: ModelType
    private state: ModelState
    private gravity: boolean
    private displayCollision: boolean

    constructor(data: ModelData, shape: ObjectShape) {

        super(shape)

        this.type = data.type
        this.state = data.state
        this.gravity = data.gravity
        this.displayCollision = data.displayCollision
    }

}