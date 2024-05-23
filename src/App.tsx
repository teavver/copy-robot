import { GLOBALS } from "./game/globals"
import { useEffect, useRef, useState } from "react"
import { GameCanvasHandle } from "./types/GameCanvas"
import { Status } from "./types/Status"
import GameCanvas from "./components/GameCanvas"

function App() {
    const TARGET_FRAMERATE = 60 // 60 =max
    const gc = useRef<GameCanvasHandle>(null)
    const [ready, setReady] = useState<Status>("loading")
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
                const currentFPS = gc.current?.getFPS() || 0
                setFps(currentFPS)
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
                        <p>fps: {fps}</p>
                    </div>
                    {/* <div className="flex flex-col gap-3"> */}
                    {/* <p>configuration</p>
                        <div className="flex gap-3">
                            <p>target fps:</p>
                            <input type="number" name="fps" id="fps" value={fps} onChange={(e) => setFps(+e.target.value)} />
                        </div> */}
                    {/* </div> */}
                </div>
            )}
        </div>
    )
}

export default App
