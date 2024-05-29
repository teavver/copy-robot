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


    playerMove: (dir: Direction) => void
    playerShoot: () => void

    // debug
    getPerfStats: () => PerformanceStats
}
