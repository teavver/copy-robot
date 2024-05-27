import { BLOCK_SIZE_PX } from "./globals";
import { Size } from "../types/Size";
import { ModelPositionData } from "../classes/Layer";

// simple value converters
export const blocksToCanvas = (blocks: number) => { return blocks * BLOCK_SIZE_PX }
export const pxToBlocks = (px: number) => { return Math.round(px / BLOCK_SIZE_PX) }

// conv size in blocks {2x2} to canvas px dimensions {32x32px}
export const blockRectToCanvas = (shapeSize: Size): Size => {
    return {
        width: shapeSize.width * BLOCK_SIZE_PX,
        height: shapeSize.height * BLOCK_SIZE_PX,
    }
}

// same but backwards
export const pxRectToBlock = (shapeSize: Size): Size => {
    return {
        width: Math.round(shapeSize.width / BLOCK_SIZE_PX),
        height: Math.round(shapeSize.height / BLOCK_SIZE_PX)
    }
}

// check if 2 rectangles are intersecting in any point
export const areRectsIntersecting = (rect1: ModelPositionData, rect2: ModelPositionData): boolean => {
    return !(
        rect1.pos.x + rect1.size.width < rect2.pos.x ||
        rect1.pos.x > rect2.pos.x + rect2.size.width ||
        rect1.pos.y + rect1.size.height < rect2.pos.y ||
        rect1.pos.y > rect2.pos.y + rect2.size.height
    );
}