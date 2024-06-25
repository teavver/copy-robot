import { logger } from "../game/logger"
import { Map } from "../types/Map"
import { Status } from "../types/Status"
import { LoadedObjectTexture, SourceObjectTexture } from "../types/Texture"

// Resolves object textures
export class AssetManager {

    private status: Status
    private assets: Map<string | HTMLImageElement> = {}

    private fallbackTexture: LoadedObjectTexture = {
        type: "color",
        color: "lime"
    }

    constructor(gameTextures: SourceObjectTexture[]) {
        this.status = "loading"
        this.loadTextures(gameTextures)
    }

    private loadTextures(textures: SourceObjectTexture[]) {
        logger("(AM) loading textures...")
        textures.forEach(sTxt => {
            if (sTxt.type === "color") {
                this.assets[sTxt.srcOrColor] = sTxt.srcOrColor
            } else {
                const img = new Image()
                img.src = sTxt.srcOrColor
                this.assets[sTxt.srcOrColor] = img
            }
        })
        logger(`Loaded textures: ${this.assets}`)
        this.status = "ready"
    }

    getTexture(srcOrColor: string): LoadedObjectTexture {
        if (this.status !== "ready") {
            logger("Can't getTexture - assetManager has not finished initializing!", 0)
            return this.fallbackTexture
        }
        const res = this.assets[srcOrColor]
        if (!res) {
            logger(`getTexture: failed to find the texture. src: '${srcOrColor}'`)
            return this.fallbackTexture
        }

        if (res instanceof HTMLImageElement) {
            return { type: "image", img: res }
        }
        return { type: "color", color: res }
    }

    getStatus(): Status {
        return this.status
    }
}