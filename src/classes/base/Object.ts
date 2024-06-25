import { SpriteData } from "../../game/data/sprites"
import { logger } from "../../game/logger"
import { blocksToPixels } from "../../game/utils"
import { Size } from "../../types/Size"
import { LoadedObjectTexture, SpriteTextureData } from "../../types/Texture"

export interface ObjectShape {
    size: Size
    txt: LoadedObjectTexture

    sData?: SpriteTextureData
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

    /**
     * @param sData: SpriteData object from sprites.ts
     * Modify the object's spriteData to a set frame or image.
     */
    setSpriteData(sData: SpriteData, flip: boolean) {
        if (this.shape.txt.type !== "image") {
            logger(`(Object)
                Failed to set sprite frame.
                Either Object texture is not set to 'image',
                or you're trying to access a Texture that's
                not initialized through assets.ts`, 0
            )
            return
        }
        this.shape.sData = {
            srcX: blocksToPixels(sData.pos.x),
            srcY: blocksToPixels(sData.pos.y),
            width: blocksToPixels(sData.size.width),
            height: blocksToPixels(sData.size.height),
            flip: flip
        }
    }

    getShape(): ObjectShape {
        return this.shape
    }
}
