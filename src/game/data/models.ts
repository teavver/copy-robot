import { CharacterData } from "../../classes/base/Character";
import { ModelData, ModelParams, ModelState, ModelType } from "../../classes/base/Model";
import ENV from "../../environment";
import { CollisionScope } from "../../types/Collision";
import { Direction } from "../../types/Direction";
import { Map } from "../../types/Map";
import { CONSTANTS } from "../constants";
import { blocksToPixels } from "../utils";
import { BASE_GAME_SHAPES, GameShape } from "./shapes";

// List of modelData used for constructing Models, Characters, etc.

// Instead of requiring a resolved Texture inside the 'shape' property,
// we only need its name in this stage
export type BaseModelParams = Omit<ModelParams, 'shape'> & { shape: GameShape }

export type GameModelParams =
    { cls: "Model", params: BaseModelParams } |
    { cls: "Character", params: [CharacterData, BaseModelParams] }

// Temp here
const bossCageBase: ModelData = {
    type: ModelType.TERRAIN,
    state: ModelState.NORMAL,
    gravityDirection: Direction.NONE,
    displayCollision: ENV.DRAW_COLLISION,
    collisionScope: { scope: CollisionScope.NONE }
}

export const BASE_GAME_MODELS: Map<GameModelParams> = {

    player: {
        cls: "Character",
        params: [
            {
                health: 100,
                faceDir: Direction.RIGHT
            },
            {
                data: {
                    type: ModelType.PLAYER,
                    state: ModelState.NORMAL,
                    gravityDirection: Direction.DOWN,
                    displayCollision: ENV.DRAW_COLLISION,
                },
                name: "Player",
                initialPos: { x: blocksToPixels(4), y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL) - blocksToPixels(5) },
                shape: BASE_GAME_SHAPES.playerShape,
            }]
    },

    bossCageLeftWall: {
        cls: "Model",
        params: {
            data: bossCageBase,
            name: "BossCageLeftWall",
            initialPos: { x: 0, y: 0 },
            shape: BASE_GAME_SHAPES.bossCageWallShape
        }
    },

    bossCageRightWall: {
        cls: "Model",
        params: {
            data: bossCageBase,
            name: "BossCageRightWall",
            initialPos: { x: blocksToPixels(CONSTANTS.MAP_WIDTH_BL - CONSTANTS.WALL_THICKNESS_BL), y: 0 },
            shape: BASE_GAME_SHAPES.bossCageWallShape
        }
    },

    bossCageCeiling: {
        cls: "Model",
        params: {
            data: bossCageBase,
            name: "BossCageCeiling",
            initialPos: { x: 0, y: 0 },
            shape: BASE_GAME_SHAPES.bossCageFloorShape
        }
    },

    bossCageFloor: {
        cls: "Model",
        params: {
            data: bossCageBase,
            name: "BossCageFloor",
            initialPos: { x: 0, y: blocksToPixels(CONSTANTS.MAP_HEIGHT_BL - CONSTANTS.WALL_THICKNESS_BL) },
            shape: BASE_GAME_SHAPES.bossCageFloorShape
        }
    }

}