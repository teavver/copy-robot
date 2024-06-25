// asset files
import { SourceObjectTexture } from "../types/Texture"
import Player from "./assets/Player.png"


export const GAME_ASSETS: SourceObjectTexture[] = [

    // Supported colors-as-textures
    {
        type: "color",
        srcOrColor: "grey"
    },

    // Image textures
    {
        type: "image",
        srcOrColor: Player
    }

]