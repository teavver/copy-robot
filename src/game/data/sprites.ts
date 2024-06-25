import { Map } from "../../types/Map";
import { Position } from "../../types/Position";
import { Size } from "../../types/Size";
import { CONSTANTS } from "../constants";

export interface SpriteData {
    size: Size
    pos: Position
}

// player_sprite.png
export const playerSpriteData: Map<SpriteData> = {
    idle: { size: { width: CONSTANTS.PLAYER_WIDTH_BL, height: CONSTANTS.PLAYER_HEIGHT_BL }, pos: { x: 0, y: 0 } },
    jumping: { size: { width: CONSTANTS.PLAYER_WIDTH_BL, height: CONSTANTS.PLAYER_HEIGHT_BL }, pos: { x: 2, y: 0 } },
    running: { size: { width: CONSTANTS.PLAYER_WIDTH_BL, height: CONSTANTS.PLAYER_HEIGHT_BL }, pos: { x: 4, y: 0 } },
}