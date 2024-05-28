export interface LayerPerformanceStats {
    layerName: string
    activeModels: string[]
}

export interface PerformanceStats {
    fps: number
    layerStats: LayerPerformanceStats[]
}
