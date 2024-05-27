import { BLOCK_SIZE_PX } from "./globals";
import { Size } from "../types/Size";
// utils for drawing, calkculating stuff etc

// conv size in blocks {2x2} to canvas px dimensions {32x32px}
export const blockToCanvas = (shapeSize: Size): Size => {
    return {
        width: shapeSize.width * BLOCK_SIZE_PX,
        height: shapeSize.height * BLOCK_SIZE_PX,
    }
}

// same but backwards
export const canvasToBlock = (shapeSize: Size): Size => {
    return {
        width: Math.round(shapeSize.width / BLOCK_SIZE_PX),
        height: Math.round(shapeSize.height / BLOCK_SIZE_PX)
    }
}