import { Size } from "../types/Size"

type Texture = ""

export interface ObjectShape {
    size: Size
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

    getShape() {
        return this.shape
    }

    changeTexture(newTexture: Texture | string) {
        this.shape.texture = newTexture
    }

    changeCollision(newCollisionStatus: boolean) {
        this.shape.collision = newCollisionStatus
    }
}
