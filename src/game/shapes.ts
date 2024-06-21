import { CONSTANTS } from "./constants"

// shapes for models.ts

// ======== BOSS CAGE ========
const bossCageFloorShape = {
    size: {
        width: CONSTANTS.MAP_WIDTH_BL,
        height: 2,
    },
    txtData: { type: "Color" as "Color", color: "Grey" }
}
const bossCageWallShape = {
    size: {
        width: 2,
        height: CONSTANTS.MAP_HEIGHT_BL,
    },
    txtData: { type: "Color" as "Color", color: "Grey" }
}

const playerModelShape = {
    size: {
        width: CONSTANTS.PLAYER_WIDTH_BL,
        height: CONSTANTS.PLAYER_HEIGHT_BL,
    },
    // txtData: { type: "StaticImg" as "StaticImg", assetName: "Player" }
    txtData: { type: "Color" as "Color", color: "LightGrey" }
}

export { bossCageFloorShape, bossCageWallShape, playerModelShape }