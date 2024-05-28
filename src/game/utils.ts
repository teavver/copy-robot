import { BLOCK_SIZE_PX } from "./globals";
import { Size } from "../types/Size";
import { ModelPositionData } from "../classes/Layer";
import { Direction } from "../types/Direction";

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
// also returns the direction from which the intersection happens (NONE if no contact)
export const areRectsIntersecting = (rect1: ModelPositionData, rect2: ModelPositionData): [boolean, Direction] => {
    const isIntersecting = !(
        rect1.pos.x + rect1.size.width < rect2.pos.x ||
        rect1.pos.x > rect2.pos.x + rect2.size.width ||
        rect1.pos.y + rect1.size.height < rect2.pos.y ||
        rect1.pos.y > rect2.pos.y + rect2.size.height
    )

    if (!isIntersecting) {
        return [isIntersecting, Direction.NONE]
    }

    let direction = Direction.NONE
    const rect1CenterX = rect1.pos.x + rect1.size.width / 2
    const rect1CenterY = rect1.pos.y + rect1.size.height / 2
    const rect2CenterX = rect2.pos.x + rect2.size.width / 2
    const rect2CenterY = rect2.pos.y + rect2.size.height / 2

    const deltaX = rect1CenterX - rect2CenterX
    const deltaY = rect1CenterY - rect2CenterY

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? Direction.RIGHT : Direction.LEFT
    } else {
        direction = deltaY > 0 ? Direction.DOWN : Direction.UP
    }

    return [isIntersecting, direction]
}