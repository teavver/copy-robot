import { Model, ModelType, ModelState } from "../classes/Model"
import { MAP_WIDTH, MAP_HEIGHT } from "./globals"
import { Player } from "../classes/Player"
import { pillarModelShape, platform2Shape, platformModelShape, playerModelShape } from "./shapes"
import { blocksToCanvas } from "./utils"

// data for all models

const platform2 = new Model(
    {
        type: ModelType.TERRAIN,
        state: ModelState.NORMAL,
        gravity: false,
        displayCollision: true,
    },
    platform2Shape,
    "Platform2",
    { x: blocksToCanvas((MAP_WIDTH / 2)), y: blocksToCanvas(MAP_HEIGHT) - blocksToCanvas(4) },
) // 2-block high platform

const playerModel = new Model(
    {
        type: ModelType.PLAYER,
        state: ModelState.NORMAL,
        gravity: true,
        displayCollision: true,
    },
    playerModelShape,
    "Player",
    { x: 60, y: 240 },
)

const player = new Player(playerModel)

const platform = new Model(
    {
        type: ModelType.TERRAIN,
        state: ModelState.NORMAL,
        gravity: false,
        displayCollision: false,
    },
    platformModelShape,
    "Platform",
    { x: 0, y: blocksToCanvas(MAP_HEIGHT) - blocksToCanvas(2) },
) // 2-block high platform

const pillar = new Model(
    {
        type: ModelType.TERRAIN,
        state: ModelState.NORMAL,
        gravity: false,
        displayCollision: false,
    },
    pillarModelShape,
    "Pillar",
    { x: blocksToCanvas((MAP_WIDTH * 3) / 4), y: blocksToCanvas(0) },
)

export {
    playerModel,
    player,
    platform,
    platform2,
    pillar
}