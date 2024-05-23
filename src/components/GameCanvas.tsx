import { useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import { CanvasController } from "../classes/CanvasController"
import { GameCanvasHandle, GameCanvasProps } from "../types/GameCanvas"
import { Direction } from "../types/Direction"

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
    ({ width, height, framerate }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const controllerRef = useRef<CanvasController | null>(null)

        useImperativeHandle(
            ref,
            () => controllerRef.current as CanvasController,
        )

        useEffect(() => {
            if (canvasRef.current) {
                controllerRef.current = new CanvasController(
                    canvasRef.current,
                    framerate,
                )
                console.log("[game canvas] init ctx")
            }

            const handleMovement = (e: KeyboardEvent) => {
                if (!canvasRef.current) return
                switch (e.key) {
                    case "w":
                        controllerRef.current?.movePlayer(Direction.UP)
                        break
                    case "a":
                        controllerRef.current?.movePlayer(Direction.LEFT)
                        break
                    case "s":
                        controllerRef.current?.movePlayer(Direction.DOWN)
                        break
                    case "d":
                        controllerRef.current?.movePlayer(Direction.RIGHT)
                        break
                }
            }

            window.addEventListener("keydown", handleMovement)
            return () => window.removeEventListener("keydown", handleMovement)
        }, [canvasRef, controllerRef, framerate])

        return (
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="bg-gray-600/50 border border-black"
            />
        )
    },
)

export default GameCanvas
