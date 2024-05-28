import { useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import { CanvasController } from "../classes/CanvasController"
import { GameCanvasHandle, GameCanvasProps } from "../types/GameCanvas"
import { Direction } from "../types/Direction"

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
    ({ width, height, framerate }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const controllerRef = useRef<CanvasController | null>(null)
        const keysPressed = useRef<Set<string>>(new Set())

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

            const handleKeyDown = (e: KeyboardEvent) => {
                keysPressed.current.add(e.key)
            }

            const handleKeyUp = (e: KeyboardEvent) => {
                keysPressed.current.delete(e.key)
            }

            const updateMovement = () => {
                if (!canvasRef.current) return

                if (keysPressed.current.has("w")) {
                    controllerRef.current?.movePlayer(Direction.UP)
                }
                if (keysPressed.current.has("a")) {
                    controllerRef.current?.movePlayer(Direction.LEFT)
                }
                if (keysPressed.current.has("s")) {
                    controllerRef.current?.movePlayer(Direction.DOWN)
                }
                if (keysPressed.current.has("d")) {
                    controllerRef.current?.movePlayer(Direction.RIGHT)
                }

                requestAnimationFrame(updateMovement)
            }

            window.addEventListener("keydown", handleKeyDown)
            window.addEventListener("keyup", handleKeyUp)
            requestAnimationFrame(updateMovement)

            return () => {
                window.removeEventListener("keydown", handleKeyDown)
                window.removeEventListener("keyup", handleKeyUp)
            }
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
