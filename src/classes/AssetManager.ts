import { Status } from "../types/Status"
import { ResolvedObjectTexture, UnresolvedObjectTexture } from "../types/Texture"

// Resolves object textures
export class AssetManager {

    private status: Status
    private assets: ResolvedObjectTexture[] = []

    private fallbackTexture: ResolvedObjectTexture = {
        type: "Color",
        name: "FALLBACK_TEXTURE",
        txt: "Pink"
    }

    constructor(gameTextures: UnresolvedObjectTexture[]) {
        this.status = "loading"
        this.assets = this.loadTextures(gameTextures)
    }

    private loadTextures(textures: UnresolvedObjectTexture[]): ResolvedObjectTexture[] {
        console.log("(AM) loading textures...")
        const resolved: ResolvedObjectTexture[] = []
        textures.forEach(txt => {
            if (txt.type === "Color") {
                resolved.push({ ...txt, txt: txt.color })
            } else {
                const img = new Image()
                img.src = txt.src
                // document.body.appendChild(img);

                if (txt.type === "Sprite") {
                    resolved.push({
                        ...txt,
                        txt: img,
                    })
                } else {
                    resolved.push({
                        ...txt,
                        txt: img
                    })
                }
            }
        })

        this.status = "ready"
        console.log("(AM) textures loaded")
        console.log("(AM) textures: ", resolved)
        return resolved
    }

    getTexture(name: string): ResolvedObjectTexture {
        if (this.status !== "ready") {
            console.error("Can't getTexture - assetManager has not finished initializing!")
            return this.fallbackTexture
        }
        const found = this.assets.find(asset => asset.name === name)
        return found ? found : this.fallbackTexture
    }

    getStatus(): Status {
        return this.status
    }
}