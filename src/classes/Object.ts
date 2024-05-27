
type Texture = ''

export interface ObjectShape {
    width: number // in BLOCKS, not pixels
    height: number // in BLOCKS
    texture: Texture | string // Path to .jpg, .png texture of CSS colorstring
    collision: boolean
}

// Object is a blueprint for creating new Models and modifying the shapes, 
// textures of existing Models.

export class Object {

    private shape: ObjectShape

    constructor(shape: ObjectShape) {
        this.shape = shape
    }

    getShape() { return this.shape }

    changeShape(newShape: ObjectShape) {
        this.shape = newShape
    }

    changeCollision(newCollisionStatus: boolean) {
        this.shape.collision = newCollisionStatus
    }

}


