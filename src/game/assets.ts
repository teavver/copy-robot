import { UnresolvedObjectTexture } from "../types/Texture"
// asset files
import Player from "./assets/Player.png"


export const GAME_ASSETS: UnresolvedObjectTexture[] = [
    {
        name: "Grey",
        type: "Color",
        color: "Grey"
    },
    {
        name: "Player",
        type: "Image",
        src: Player
    }
]