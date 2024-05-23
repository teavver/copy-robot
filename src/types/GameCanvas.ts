export type GameCanvasProps = {
    width: number
    height: number
}

export type GameCanvasHandle = {
    getContext: () => CanvasRenderingContext2D | null
    clearCanvas: () => void
    drawBlock: (x: number, y: number, color?: string) => void
}
