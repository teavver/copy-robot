import { Map } from "../../types/Map";
import { Size } from "../../types/Size";
import { SourceObjectTexture } from "../../types/Texture";
import PlayerSprite from "../assets/player_sprite.png"
import { CONSTANTS } from "../constants";

export interface GameShape {
    size: Size,
    srcTxt: SourceObjectTexture
}

export const BASE_GAME_SHAPES: Map<GameShape> = {

    // ==== Boss cage
    bossCageFloorShape: {
        size: {
            width: CONSTANTS.MAP_WIDTH_BL,
            height: CONSTANTS.WALL_THICKNESS_BL,
        },
        srcTxt: { type: "color", srcOrColor: "grey" }
    },

    bossCageWallShape: {
        size: {
            width: CONSTANTS.WALL_THICKNESS_BL,
            height: CONSTANTS.MAP_HEIGHT_BL,
        },
        srcTxt: { type: "color", srcOrColor: "grey" }
    },

    // === player
    playerShape: {
        size: {
            width: CONSTANTS.PLAYER_WIDTH_BL,
            height: CONSTANTS.PLAYER_HEIGHT_BL,
        },
        // srcTxt: { type: "image", srcOrColor: PlayerImg }
        srcTxt: { type: "image", srcOrColor: PlayerSprite }
    },

    projectileShape: {
        size: {
            width: CONSTANTS.PROJECTILE_SIZE_BL,
            height: CONSTANTS.PROJECTILE_SIZE_BL,
        },
        srcTxt: { type: "color", srcOrColor: "yellow" }
    }
}