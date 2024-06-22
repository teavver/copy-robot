import { ModelType, ModelState, Model } from "../classes/base/Model"
import { CONSTANTS } from "./constants"
import { GAME_SHAPES } from "./shapes"
import { blocksToPixels } from "./utils"
import { Direction } from "../types/Direction"
import ENV from "../environment"
import { Character } from "../classes/base/Character"

// keep this here for now
const bossCageBase = {
    type: ModelType.TERRAIN,
    state: ModelState.NORMAL,
    gravityDirection: Direction.NONE,
    displayCollision: ENV.DRAW_COLLISION,
}

// data for all models
const gameModels: Model[] = [

    // Player
    new Character(
        {
            health: 100,
            faceDir: Direction.RIGHT,
        },
        new Model({
            type: ModelType.PLAYER,
            state: ModelState.NORMAL,
            gravityDirection: Direction.DOWN,
            displayCollision: ENV.DRAW_COLLISION,
        },
            GAME_SHAPES.playerModelShape,
            "Player",
            { x: blocksToPixels(4), y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL) - blocksToPixels(5) },
        )
    ),

    // Boss
    new Character(
        {
            health: 500,
            faceDir: Direction.LEFT
        },
        new Model({
            type: ModelType.ENEMY,
            state: ModelState.NORMAL,
            gravityDirection: Direction.DOWN,
            displayCollision: ENV.DRAW_COLLISION,
        },
            GAME_SHAPES.playerModelShape,
            "Boss",
            { x: blocksToPixels(14), y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL) - blocksToPixels(5) }
        )
    ),

    // Boss cage all 4 walls
    new Model(
        bossCageBase,
        GAME_SHAPES.bossCageWallShape,
        "BossCageLeftWall",
        { x: 0, y: 0 }
    ),

    new Model(
        bossCageBase,
        GAME_SHAPES.bossCageWallShape,
        "BossCageRightWall",
        { x: blocksToPixels(CONSTANTS.MAP_WIDTH_BL - CONSTANTS.WALL_WIDTH_BL), y: 0 }
    ),

    new Model(
        bossCageBase,
        GAME_SHAPES.bossCageFloorShape,
        "BossCageFloor",
        { x: 0, y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL - CONSTANTS.WALL_WIDTH_BL) }
    ),

    new Model(
        bossCageBase,
        GAME_SHAPES.bossCageFloorShape,
        "BossCageCeiling",
        { x: 0, y: 0 }
    ),

    //
]

// type GameModel = Model | Character | Boss | Projectile
export interface GameModels {
    [key: string]: Model
}

// Pack all models to obj
export const GAME_MODELS: GameModels = gameModels.reduce((acc: GameModels, model: Model) => {
    acc[model.name] = model
    return acc
}, {})
