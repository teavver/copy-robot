export interface SpriteTextureData {
    srcX: number
    srcY: number
    width: number
    height: number
    flip: boolean
}

export type SourceObjectTexture =
    { type: "color", srcOrColor: string } |// Basic css colorstring (case insensitive) (fillStyle)
    { type: "image", srcOrColor: string } // Static image or sprite 

export type LoadedObjectTexture =
    { type: "color", color: string } |
    { type: "image", img: HTMLImageElement }