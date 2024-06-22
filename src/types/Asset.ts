
export interface RawGameAsset {
    name: string // Used for texture resolution later by Objects
    source: string // Path to img
}

export interface LoadedGameAsset {
    name: string
    asset: HTMLImageElement
}