import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { renderGame, updateGame } from './engine';
import type { GameState } from './types';

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  stateRef: MutableRefObject<GameState>,
  onTick: (state: GameState) => void,
) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let lastTime = performance.now();

    const loop = (t: number) => {
      const dt = Math.min((t - lastTime) / 1000, 0.05) || 0.016;
      lastTime = t;

      const next = updateGame(stateRef.current, dt);
      stateRef.current = next;
      renderGame(ctx, next);
      onTickRef.current(next);

      frame = requestAnimationFrame(loop);
    };

    renderGame(ctx, stateRef.current);
    frame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frame);
  }, [canvasRef, stateRef]);
}
