
const SECOND_IN_MS = 1000
const BLOCK_SIZE_PX = 16
const MAP_WIDTH = 48
const MAP_HEIGHT = 24

const GLOBALS = {
    CANVAS: {
        WIDTH: BLOCK_SIZE_PX * MAP_WIDTH,
        HEIGHT: BLOCK_SIZE_PX * MAP_HEIGHT,
    },

    COLORS: {
        GRAY: "#404040",
        CYAN: "#42d8e3",
    },

    LAYERS: {
        BACKGROUND: "BG",
        FOREGROUND: "FG",
    },
}

export { SECOND_IN_MS, BLOCK_SIZE_PX, MAP_WIDTH, MAP_HEIGHT, GLOBALS }