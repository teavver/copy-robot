export interface SpriteTextureData {
    srcX: number
    srcY: number
    width: number
    height: number
}

type ObjectTextureBase = {
    name: string
}

export type UnresolvedObjectTexture =
    | (ObjectTextureBase & { type: "Color", color: string }) // CSS colorstring
    | (ObjectTextureBase & { type: "Image", src: string })

export type ResolvedObjectTexture =
    | (ObjectTextureBase & { type: "Color", txt: string })
    | (ObjectTextureBase & { type: "Image", txt: HTMLImageElement })
    | (ObjectTextureBase & { type: "Sprite", txt: HTMLImageElement, sData?: SpriteTextureData })
