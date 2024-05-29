import { ObjectShape } from "../classes/Object"
import { MAP_WIDTH, MAP_HEIGHT } from "./globals"

// shapes for models.ts


const platformModelShape: ObjectShape = {
    size: {
        width: MAP_WIDTH,
        height: 2,
    },
    texture: "Grey",
    collision: true,
}

const platform2Shape: ObjectShape = {
    size: {
        width: MAP_WIDTH,
        height: 2,
    },
    texture: "Gray",
    collision: true,
}

const pillarModelShape: ObjectShape = {
    size: {
        width: 2,
        height: MAP_HEIGHT,
    },
    texture: "LightSlateGrey",
    collision: false,
}

const playerModelShape: ObjectShape = {
    size: {
        width: 1,
        height: 2,
    },
    texture: "DimGrey",
    collision: true,
}


export {
    platformModelShape,
    platform2Shape,
    pillarModelShape,
    playerModelShape
}