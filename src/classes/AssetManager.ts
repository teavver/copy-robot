import { logger } from "../game/logger"
import { Status } from "../types/Status"
import { ResolvedObjectTexture, UnresolvedObjectTexture } from "../types/Texture"

// Resolves object textures
export class AssetManager {

    private status: Status
    private assets: ResolvedObjectTexture[] = []

    private fallbackTexture: ResolvedObjectTexture = {
        type: "Color",
        name: "FALLBACK_TEXTURE",
        txt: "Lime"
    }

    constructor(gameTextures: UnresolvedObjectTexture[]) {
        this.status = "loading"
        this.assets = this.loadTextures(gameTextures)
    }

    private loadTextures(textures: UnresolvedObjectTexture[]): ResolvedObjectTexture[] {
        logger("(AM) loading textures...")
        const resolved: ResolvedObjectTexture[] = []
        textures.forEach(uTxt => {
            if (uTxt.type === "Color") {
                resolved.push({ ...uTxt, txt: uTxt.color })
            } else {
                // TODO: Remove "Sprite" in Texture.ts and add function to cut a Sprite out of Image
                const img = new Image()
                img.src = uTxt.src
                resolved.push({
                    ...uTxt,
                    txt: img,
                })
            }
        })

        this.status = "ready"
        logger(`(AM) textures loaded: ${JSON.stringify(resolved, null, 2)}`)
        return resolved
    }

    getTexture(name: string): ResolvedObjectTexture {
        if (this.status !== "ready") {
            logger("Can't getTexture - assetManager has not finished initializing!", 0)
            return this.fallbackTexture
        }
        const found = this.assets.find(asset => asset.name === name)
        return found ? found : this.fallbackTexture
    }

    getStatus(): Status {
        return this.status
    }
}