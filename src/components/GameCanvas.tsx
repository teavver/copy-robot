import { useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import { CanvasController } from "../classes/CanvasController"
import { AssetManager } from "../classes/AssetManager"
import { BASE_GAME_MODELS } from "../game/data/models"
import { GameCanvasHandle, GameCanvasProps } from "../types/GameCanvas"
import { Direction } from "../types/Direction"
import { logger } from "../game/logger"
import { GAME_ASSETS } from "../game/assets"

export const assetManager = new AssetManager(GAME_ASSETS)

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
                    BASE_GAME_MODELS,
                    framerate,
                )
                logger("[game canvas] init ctx")
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
                    controllerRef.current?.playerMove(Direction.UP)
                }
                if (keysPressed.current.has("a")) {
                    controllerRef.current?.playerMove(Direction.LEFT)
                }
                if (keysPressed.current.has("s")) {
                    controllerRef.current?.playerMove(Direction.DOWN)
                }
                if (keysPressed.current.has("d")) {
                    controllerRef.current?.playerMove(Direction.RIGHT)
                }
                if (keysPressed.current.has(" ")) {
                    controllerRef.current?.playerShoot()
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
        }, [canvasRef, controllerRef, assetManager])

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
