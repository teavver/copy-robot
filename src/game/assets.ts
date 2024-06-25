// asset files
import { SourceObjectTexture } from "../types/Texture"
import PlayerImg from "./assets/Player.png"
import PlayerSprite from "./assets/player_sprite.png"


export const GAME_ASSETS: SourceObjectTexture[] = [

    // Supported colors-as-textures
    {
        type: "color",
        srcOrColor: "grey"
    },

    // Image textures
    {
        type: "image",
        srcOrColor: PlayerImg
    },
    {
        type: "image",
        srcOrColor: PlayerSprite
    }

]