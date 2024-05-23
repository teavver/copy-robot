import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CanvasController } from '../classes/CanvasController';
import { GameCanvasHandle, GameCanvasProps } from '../types/GameCanvas';

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(({ width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const controllerRef = useRef<CanvasController | null>(null);

    useImperativeHandle(ref, () => controllerRef.current as CanvasController);

    useEffect(() => {
        if (canvasRef.current) {
            controllerRef.current = new CanvasController(canvasRef.current);
            console.log('[game canvas] init ctx')
        }
    }, [canvasRef.current, controllerRef.current]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="bg-gray-600/50 border border-black"
        />
    );
});

export default GameCanvas;
