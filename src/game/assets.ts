import { UnresolvedObjectTexture } from "../types/Texture"
// asset files
import Player from "./assets/Player.png"


export const GAME_ASSETS: UnresolvedObjectTexture[] = [

    // Supported colors-as-textures
    {
        name: "Grey",
        type: "Color",
        color: "Grey"
    },

    // Image textures
    {
        name: "Player",
        type: "Image",
        src: Player
    }

]