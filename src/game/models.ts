import { Model, ModelType, ModelState } from "../classes/Model"
import { MAP_WIDTH, MAP_HEIGHT } from "./globals"
import { Player } from "../classes/Player"
import {
    playerModelShape,
    bossCageWallShape,
    bossCageFloorShape
} from "./shapes"
import { blocksToCanvas } from "./utils"
import { Direction } from "../types/Direction"

// data for all models

// \====== PLAYER
const playerModel = new Model(
    {
        type: ModelType.PLAYER,
        state: ModelState.NORMAL,
        gravity: true,
        gravityDirection: Direction.DOWN,
        displayCollision: true,
    },
    playerModelShape,
    "Player",
    { x: blocksToCanvas(4), y: blocksToCanvas(MAP_HEIGHT) - blocksToCanvas(5) },
)
const player = new Player(playerModel)

// ======== BOSS CAGE
const bossCageWidth = 2 //blocks
const bossCageBase = {
    type: ModelType.TERRAIN,
    state: ModelState.NORMAL,
    gravity: false,
    gravityDirection: Direction.NONE,
    displayCollision: true,
}
const bossCageLeftWall = new Model(
    bossCageBase,
    bossCageWallShape,
    "BossCageLeftWall",
    { x: 0, y: 0 },
)
const bossCageRightWall = new Model(
    bossCageBase,
    bossCageWallShape,
    "BossCageRightWall",
    { x: blocksToCanvas(MAP_WIDTH - bossCageWidth), y: 0 },
)
const bossCageFloor = new Model(
    bossCageBase,
    bossCageFloorShape,
    "BossCageRightWall",
    { x: 0, y: blocksToCanvas(MAP_HEIGHT - bossCageWidth) },
)
const bossCageCeiling = new Model(
    bossCageBase,
    bossCageFloorShape,
    "BossCageRightWall",
    { x: 0, y: 0 },
)

export { playerModel, player, bossCageLeftWall, bossCageRightWall, bossCageFloor, bossCageCeiling }
