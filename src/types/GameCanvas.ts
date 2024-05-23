import { Direction } from "./Direction"

export type GameCanvasProps = {
    width: number
    height: number
    framerate: number
}

export type GameCanvasHandle = {
    startLoop: () => void
    stopLoop: () => void
    movePlayer: (dir: Direction) => void
    getFPS: () => number
}
