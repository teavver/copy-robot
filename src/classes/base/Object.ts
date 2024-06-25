import { Size } from "../../types/Size"
import { LoadedObjectTexture } from "../../types/Texture"

export interface ObjectShape {
    size: Size
    txt: LoadedObjectTexture
}

/**
 * Object is a 'Shape' blueprint for a Model:
 * it contains information about a texture and its dimensions.  
 */
export class Object {

    private shape: ObjectShape

    constructor(shape: ObjectShape) {
        this.shape = shape
    }

    getShape(): ObjectShape {
        return this.shape
    }
}
