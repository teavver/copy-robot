import { logger } from "../../game/logger"
import { Size } from "../../types/Size"
import { UnresolvedTextureData, ResolvedTextureData, TextureType } from "../../types/Texture"

interface ObjectInternalData extends ObjectShape {
    // Keep this, as long as performance is OK
    // It's useful for debugging and extending Models more easily
    srcTxt: UnresolvedTextureData<TextureType>
}

interface ObjectShape {
    size: Size
    txtData: ResolvedTextureData<TextureType>
}

export interface ObjectShapeArgs<T extends TextureType> {
    size: Size,
    txtData: UnresolvedTextureData<T>
}

/**
 * Object is a 'Shape' blueprint for a Model:
 * it contains information about a texture and its dimensions.  
 * NOTE: The Object itself is not responsible for managing its own texture state,
 * but it is responsible for resolving the color/path to the texture passed to its Constructor.
 */
export class Object {
    oData: ObjectInternalData

    constructor(shape: { size: Size, txtData: UnresolvedTextureData<TextureType> }) {
        this.oData = {
            size: shape.size,
            srcTxt: shape.txtData,
            txtData: this.resolveSourceTexture(shape.txtData),
        }
    }

    private resolveSourceTexture(src: UnresolvedTextureData<TextureType>): ResolvedTextureData<TextureType> {
        const asset = new Image()
        switch (src.type) {
            case "Color":
                return {
                    ...src,
                    txt: src.color
                }
            case "StaticImg":
                asset.src = src.assetName
                return { ...src, txt: asset }
            case "SpriteImg":
                asset.src = src.assetName
                return { ...src, txt: asset, spriteData: src.spriteData }
            default:
                // Return Pink fallback texture (Missing or Corrupted)
                logger(`(Object): Failed to resolve src txt. Using fallback`, 0)
                return {
                    type: "Color",
                    txt: "Pink"
                }

        }
    }

    getSrcTxt(): UnresolvedTextureData<TextureType> {
        return this.oData.srcTxt
    }

    getShape(): ObjectShape {
        return {
            size: this.oData.size,
            txtData: this.oData.txtData
        }
    }
}
