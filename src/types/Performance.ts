import { ModelType } from "../classes/base/Model"

export interface ActiveModelInfo {
    name: string
    type: ModelType
}

export interface LayerPerformanceStats {
    layerName: string
    activeModels: ActiveModelInfo[]
}

export interface PerformanceStats {
    fps: number
    layerStats: LayerPerformanceStats[]
}
