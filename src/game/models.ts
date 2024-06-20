import { Model, ModelType, ModelState } from "../classes/Model"
import { CONSTANTS } from "./constants"
import { Character, CharacterData } from "../classes/Character"
import {
    playerModelShape,
    bossCageWallShape,
    bossCageFloorShape
} from "./shapes"
import { blocksToPixels } from "./utils"
import { Direction } from "../types/Direction"
import ENV from "../environment"

// data for all models

// \====== PLAYER
const playerModel = new Model(
    {
        type: ModelType.PLAYER,
        state: ModelState.NORMAL,
        gravityDirection: Direction.DOWN,
        displayCollision: ENV.DRAW_COLLISION,
    },
    playerModelShape,
    "Player",
    { x: blocksToPixels(4), y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL) - blocksToPixels(5) },
)

const playerData: CharacterData = {
    health: 100,
    faceDir: Direction.RIGHT
}

const player = new Character(playerData, playerModel)

// ======= BOSS
const bossModel = new Model(
    {
        type: ModelType.ENEMY,
        state: ModelState.NORMAL,
        gravityDirection: Direction.DOWN,
        displayCollision: ENV.DRAW_COLLISION,
    },
    playerModelShape,
    "Boss",
    { x: blocksToPixels(14), y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL) - blocksToPixels(5) },
)

const bossData: CharacterData = {
    health: 300,
    faceDir: Direction.LEFT
}

// TODO: Implement 'BOss' class later
const boss = new Character(bossData, bossModel)

// ======== BOSS CAGE
const bossCageWidth = 2 //blocks
const bossCageBase = {
    type: ModelType.TERRAIN,
    state: ModelState.NORMAL,
    gravityDirection: Direction.NONE,
    displayCollision: ENV.DRAW_COLLISION,
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
    { x: blocksToPixels(CONSTANTS.MAP_WIDTH_BL - bossCageWidth), y: 0 },
)
const bossCageFloor = new Model(
    bossCageBase,
    bossCageFloorShape,
    "BossCageRightWall",
    { x: 0, y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL - bossCageWidth) },
)
const bossCageCeiling = new Model(
    bossCageBase,
    bossCageFloorShape,
    "BossCageRightWall",
    { x: 0, y: 0 },
)

export { playerModel, player, boss, bossCageLeftWall, bossCageRightWall, bossCageFloor, bossCageCeiling }
