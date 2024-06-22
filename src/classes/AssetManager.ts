import { Status } from "../types/Status"
import { RawGameAsset, LoadedGameAsset } from "../types/Asset"
import { logger } from "../game/logger"

// Load all game assets from files to memory
export class AssetManager {

    private status: Status
    assets: LoadedGameAsset[] = []

    constructor(assets: RawGameAsset[]) {
        this.status = "loading"
        this.loadAssets(assets)
    }

    async loadAssets(rawAssets: RawGameAsset[]) {
        console.log("Loading assets")
        const loadedAssets: LoadedGameAsset[] = []
        rawAssets.forEach(asset => {
            const img = new Image()
            img.src = asset.source
            const rAsset: LoadedGameAsset = {
                name: asset.name,
                asset: img
            }
            loadedAssets.push(rAsset)
        })

        this.assets = loadedAssets
        this.status = "ready"
        console.log("Assets loaded")
    }

    getAsset(name: string): LoadedGameAsset | undefined {
        return this.assets.find(asset => asset.name === name)
    }

    getStatus(): Status {
        return this.status
    }
}