import { Size } from "../../types/Size"
import { ResolvedObjectTexture } from "../../types/Texture"

export interface ObjectShape {
    size: Size
    txt: ResolvedObjectTexture
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
