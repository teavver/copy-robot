export interface SpritesheetTxtData {
    srcX: number
    srcY: number
    width: number
    height: number
}

export type TextureType = "Color" | "StaticImg" | "SpriteImg"

export type UnresolvedTextureData<T extends TextureType> =
    T extends "Color" ? { type: T, color: string } :
    T extends "StaticImg" ? { type: T, assetName: string } :
    T extends "SpriteImg" ? { type: T, assetName: string, spriteData: SpritesheetTxtData }
    : never

export type ResolvedTextureData<T extends TextureType> =
    T extends "Color"
    ? { type: T, txt: string }
    : T extends "StaticImg"
    ? { type: T, txt: HTMLImageElement }
    : T extends "SpriteImg"
    ? { type: T, txt: HTMLImageElement, spriteData: SpritesheetTxtData }
    : never;