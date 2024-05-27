import { Direction } from "./Direction"
import { PerformanceStats } from "./Performance"

export type GameCanvasProps = {
    width: number
    height: number
    framerate: number
}

export type GameCanvasHandle = {
    startLoop: () => void
    stopLoop: () => void
    movePlayer: (dir: Direction) => void
    getPerfStats: () => PerformanceStats
}
