import { Map } from "../../types/Map";
import { Size } from "../../types/Size";
import { CONSTANTS } from "../constants";

export interface GameShape {
    size: Size,
    txtName: string // Will be needed later, when the shape is initialized
}

export const BASE_GAME_SHAPES: Map<GameShape> = {

    // ==== Boss cage
    bossCageFloorShape: {
        size: {
            width: CONSTANTS.MAP_WIDTH_BL,
            height: CONSTANTS.WALL_THICKNESS_BL,
        },
        txtName: "Grey"
    },

    bossCageWallShape: {
        size: {
            width: CONSTANTS.WALL_THICKNESS_BL,
            height: CONSTANTS.MAP_HEIGHT_BL,
        },
        txtName: "Grey"
    },

    // === player
    playerShape: {
        size: {
            width: CONSTANTS.PLAYER_WIDTH_BL,
            height: CONSTANTS.PLAYER_HEIGHT_BL,
        },
        txtName: "Player"
    },

    projectileShape: {
        size: {
            width: CONSTANTS.PROJECTILE_SIZE_BL,
            height: CONSTANTS.PROJECTILE_SIZE_BL,
        },
        txtName: "Yellow"
    }
}