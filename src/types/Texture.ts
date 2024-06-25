export interface SpriteTextureData {
    srcX: number
    srcY: number
    width: number
    height: number
}

export type SourceObjectTexture =
    { type: "color", srcOrColor: string } |                                  // Basic css colorstring (case insensitive) (fillStyle)
    { type: "image", srcOrColor: string, spriteData?: SpriteTextureData } // Static image or sprite 

export type LoadedObjectTexture =
    { type: "color", color: string } |
    { type: "image", img: HTMLImageElement, spriteData?: SpriteTextureData }