import { ModelType } from "./classes/base/Model"
import { CONSTANTS } from "./game/constants"
import { useEffect, useRef, useState } from "react"
import { GameCanvasHandle } from "./types/GameCanvas"
import { Status } from "./types/Status"
import GameCanvas from "./components/GameCanvas"
import { LayerPerformanceStats } from "./types/Performance"

function App() {
    const gc = useRef<GameCanvasHandle>(null)
    const [ready, setReady] = useState<Status>("loading")

    // Performance debugging/logging
    const [debugMode, setDebugMode] = useState<boolean>(true)
    const [layerPerfStats, setLayerPerfStats] = useState<LayerPerformanceStats[]>([])
    const [fps, setFps] = useState<number>(0)

    useEffect(() => {
        if (gc.current) {
            setReady("ready")
            return
        }
    }, [ready, gc])

    useEffect(() => {
        if (!gc || !gc.current) return
        const intervalId = setInterval(() => {
            const perfStats = gc.current!.getPerfStats()
            setFps(perfStats.fps)
            setLayerPerfStats(perfStats.layerStats)
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [gc])

    return (
        <div className="flex flex-col gap-3 w-screen h-screen justify-center items-center bg-black text-gray-500">
            <GameCanvas
                ref={gc}
                width={CONSTANTS.CANVAS.WIDTH}
                height={CONSTANTS.CANVAS.HEIGHT}
                framerate={CONSTANTS.TARGET_FPS}
            />

            {ready !== "ready" ? (
                <p>...</p>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            tabIndex={-1}
                            className="select-none focus:outline-none"
                            onClick={() => gc.current?.startLoop()}
                        >
                            Start game loop
                        </button>
                        <button
                            tabIndex={-1}
                            className="select-none focus:outline-none"
                            onClick={() => gc.current?.stopLoop()}
                        >
                            Stop game loop
                        </button>
                        <button
                            tabIndex={-1}
                            onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                            className="select-none focus:outline-none"
                            onClick={() => setDebugMode(debugMode => !debugMode)}
                        >
                            Toggle debug mode ({debugMode.toString()})
                        </button>
                        <p>fps: {fps}</p>
                    </div>

                    {debugMode &&
                        <div className="flex gap-3">
                            {layerPerfStats.map((layerStats, idx) => (
                                <div className="flex flex-col gap-1" key={idx}>
                                    <p className="underline">{layerStats.layerName}</p>
                                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                                        <ul>
                                            {layerStats.activeModels.map((model, idx) => (
                                                <li key={idx}>{model.name} [{ModelType[model.type]}]</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            )}
        </div>
    )
}

export default App
