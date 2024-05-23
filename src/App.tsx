import { useEffect, useRef, useState } from "react"
import { GameCanvasHandle } from "./types/GameCanvas"
import { Status } from "./types/Status"
import { GLOBALS } from "./game/globals"
import GameCanvas from "./components/GameCanvas"

function App() {

    const canvasRef = useRef<GameCanvasHandle>(null)
    const [ready, setReady] = useState<Status>("loading")

    useEffect(() => {
        if (canvasRef.current) {
            setReady("ready")
            return
        }
    }, [ready, canvasRef, canvasRef.current])

    return (
        <div className="flex flex-col gap-3 w-screen h-screen justify-center items-center bg-black text-gray-500">

            <GameCanvas ref={canvasRef} width={500} height={500} />

            {(ready !== "ready")
                ? <p>...</p>
                :
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <p>
                            context:{" "}
                            {canvasRef.current?.getContext() !== null ? "OK" : "ERR"}
                        </p>
                        <button
                            onClick={() =>
                                canvasRef.current?.drawBlock(2, 2, GLOBALS.COLORS.CYAN)
                            }
                        >
                            Draw cyan
                        </button>
                        <button onClick={() => canvasRef.current?.drawBlock(4, 4)}>
                            Draw gray
                        </button>
                        <button onClick={() => canvasRef.current?.clearCanvas()}>
                            Clear Canvas
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}

export default App
