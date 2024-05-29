import { ObjectShape } from "../classes/Object"
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_HEIGHT, PLAYER_WIDTH } from "./globals"

// shapes for models.ts

// ======== BOSS CAGE ========
const bossCageFloorShape: ObjectShape = {
    size: {
        width: MAP_WIDTH,
        height: 2,
    },
    texture: "Grey",
    collision: true,
}
const bossCageWallShape: ObjectShape = {
    size: {
        width: 2,
        height: MAP_HEIGHT,
    },
    texture: "Grey",
    collision: true,
}

const playerModelShape: ObjectShape = {
    size: {
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
    },
    texture: "DimGrey",
    collision: true,
}

export { bossCageFloorShape, bossCageWallShape, playerModelShape }