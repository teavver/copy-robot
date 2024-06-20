import { ObjectShape } from "../classes/base/Object"
import { CONSTANTS } from "./constants"

// shapes for models.ts

// ======== BOSS CAGE ========
const bossCageFloorShape: ObjectShape = {
    size: {
        width: CONSTANTS.MAP_WIDTH_BL,
        height: 2,
    },
    texture: "Grey",
}
const bossCageWallShape: ObjectShape = {
    size: {
        width: 2,
        height: CONSTANTS.MAP_HEIGHT_BL,
    },
    texture: "Grey",
}

const playerModelShape: ObjectShape = {
    size: {
        width: CONSTANTS.PLAYER_WIDTH_BL,
        height: CONSTANTS.PLAYER_HEIGHT_BL,
    },
    texture: "DimGrey",
}

export { bossCageFloorShape, bossCageWallShape, playerModelShape }