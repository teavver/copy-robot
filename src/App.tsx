import { GLOBALS } from "./game/globals"
import { useEffect, useRef, useState } from "react"
import { GameCanvasHandle } from "./types/GameCanvas"
import { Status } from "./types/Status"
import GameCanvas from "./components/GameCanvas"
import { LayerPerformanceStats, PerformanceStats } from "./types/Performance"

function App() {
    const TARGET_FRAMERATE = 60 // 60 =max
    const gc = useRef<GameCanvasHandle>(null)
    const [ready, setReady] = useState<Status>("loading")

    const [bgLayerPerf, setBgLayerPerf] = useState<LayerPerformanceStats>()
    const [fgLayerPerf, setFgLayerPerf] = useState<LayerPerformanceStats>()
    const [fps, setFps] = useState<number>(0)

    useEffect(() => {
        if (gc.current) {
            setReady("ready")
            return
        }
    }, [ready, gc])

    useEffect(() => {
        if (gc.current) {
            const intervalId = setInterval(() => {
                const perfStats: PerformanceStats | undefined = gc.current?.getPerfStats()
                if (perfStats) {
                    // console.log(perfStats)
                    setBgLayerPerf(perfStats.layerStats[0])
                    setFgLayerPerf(perfStats.layerStats[1])
                    setFps(perfStats.fps)
                }

            }, 1000)

            return () => {
                clearInterval(intervalId)
            }
        }
    }, [gc])

    return (
        <div className="flex flex-col gap-3 w-screen h-screen justify-center items-center bg-black text-gray-500">
            <GameCanvas
                ref={gc}
                width={GLOBALS.CANVAS.WIDTH}
                height={GLOBALS.CANVAS.HEIGHT}
                framerate={TARGET_FRAMERATE}
            />

            {ready !== "ready" ? (
                <p>...</p>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            className="select-none focus:outline-none"
                            onClick={() => gc.current?.startLoop()}
                        >
                            Start game loop
                        </button>
                        <button
                            className="select-none focus:outline-none"
                            onClick={() => gc.current?.stopLoop()}
                        >
                            Stop game loop
                        </button>

                    </div>

                    <div className="flex gap-3">
                        <p>fps: {fps}</p>
                        <div className="flex flex-col">
                            <p>BG layer models:</p>
                            {(bgLayerPerf?.activeModels.length! > 0)
                                ? bgLayerPerf?.activeModels.map((model, i) => (
                                    <p key={i}>"{model}"</p>
                                ))
                                : <p>-</p>
                            }
                        </div>
                        <div className="flex flex-col">
                            <p>FG layer models:</p>
                            {(fgLayerPerf?.activeModels.length! > 0)
                                ? fgLayerPerf?.activeModels.map((model, i) => (
                                    <p key={i}>"{model}"</p>
                                ))
                                : <p>-</p>
                            }
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default App
