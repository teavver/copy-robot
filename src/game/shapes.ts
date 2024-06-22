import { CONSTANTS } from "./constants"
import PlayerImg from "./assets/Player.png"

// shapes for models.ts
export const GAME_SHAPES = {
    bossCageFloorShape: {
        size: {
            width: CONSTANTS.MAP_WIDTH_BL,
            height: 2,
        },
        txtData: { type: "Color" as "Color", color: "Grey" }
    },

    bossCageWallShape: {
        size: {
            width: 2,
            height: CONSTANTS.MAP_HEIGHT_BL,
        },
        txtData: { type: "Color" as "Color", color: "Grey" }
    },

    playerModelShape: {
        size: {
            width: CONSTANTS.PLAYER_WIDTH_BL,
            height: CONSTANTS.PLAYER_HEIGHT_BL,
        },
        txtData: { type: "StaticImg" as "StaticImg", assetName: PlayerImg } // texture demo
        // txtData: { type: "Color" as "Color", color: "LightGrey" }
    }

}