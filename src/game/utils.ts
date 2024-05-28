import { BLOCK_SIZE_PX } from "./globals"
import { Size } from "../types/Size"
import { ModelPositionData } from "../classes/Layer"
import { Direction } from "../types/Direction"

// simple value converters
export const blocksToCanvas = (blocks: number) => {
    return blocks * BLOCK_SIZE_PX
}
export const pxToBlocks = (px: number) => {
    return Math.round(px / BLOCK_SIZE_PX)
}

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
        height: Math.round(shapeSize.height / BLOCK_SIZE_PX),
    }
}

// check if 2 rectangles are intersecting in any point
// also returns the direction from which the intersection happens (NONE if no contact)
export const areRectsIntersecting = (
    rect1: ModelPositionData,
    rect2: ModelPositionData,
): [boolean, Direction] => {
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
    const rect1Top = rect1.pos.y
    const rect1Bottom = rect1.pos.y + rect1.size.height
    const rect1Left = rect1.pos.x
    const rect1Right = rect1.pos.x + rect1.size.width
    const rect2Top = rect2.pos.y
    const rect2Bottom = rect2.pos.y + rect2.size.height
    const rect2Left = rect2.pos.x
    const rect2Right = rect2.pos.x + rect2.size.width
    const topOverlap = rect1Bottom - rect2Top
    const bottomOverlap = rect2Bottom - rect1Top
    const leftOverlap = rect1Right - rect2Left
    const rightOverlap = rect2Right - rect1Left
    const minOverlap = Math.min(
        topOverlap,
        bottomOverlap,
        leftOverlap,
        rightOverlap,
    )

    if (minOverlap === topOverlap) {
        direction = Direction.DOWN
    } else if (minOverlap === bottomOverlap) {
        direction = Direction.UP
    } else if (minOverlap === leftOverlap) {
        direction = Direction.RIGHT
    } else if (minOverlap === rightOverlap) {
        direction = Direction.LEFT
    }
    return [isIntersecting, direction]
}
