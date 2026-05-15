import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  renderGame,
  resetGame,
  resizeState,
  spawnSoul,
  toHud,
} from '../game/engine';
import type { GameState } from '../game/types';
import { useGameLoop } from '../game/useGameLoop';
import { GameOverOverlay } from './GameOverOverlay';
import { Hud } from './Hud';
import { StartOverlay } from './StartOverlay';
import './GameCanvas.css';

export function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(400, 500));

  const [hud, setHud] = useState(() => toHud(stateRef.current));
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const syncCanvasSize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stateRef.current = resizeState(stateRef.current, w, h);
    if (ctx) renderGame(ctx, stateRef.current);
  }, []);

  useEffect(() => {
    syncCanvasSize();
    const ro = new ResizeObserver(syncCanvasSize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  const onTick = useCallback((state: GameState) => {
    setHud(toHud(state));
    if (started && state.lives <= 0 && state.running === false) {
      setGameOver(true);
    }
  }, [started]);

  useGameLoop(canvasRef, stateRef, onTick);

  const handleStart = () => {
    stateRef.current = resetGame(stateRef.current);
    setStarted(true);
    setGameOver(false);
    setPaused(false);
    setHud(toHud(stateRef.current));
  };

  const handleDrop = (clientX: number) => {
    if (!started || paused || gameOver) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    stateRef.current = spawnSoul(stateRef.current, x);
    stateRef.current = { ...stateRef.current, chaliceTarget: x };
    setShowHint(false);
  };

  return (
    <div className="game-shell">
      <Hud hud={hud} />
      <div
        ref={wrapRef}
        className="arena-wrap"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          handleDrop(e.clientX);
        }}
        onMouseMove={(e) => {
          if (!started || paused) return;
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return;
          stateRef.current = {
            ...stateRef.current,
            chaliceTarget: e.clientX - rect.left,
          };
        }}
        onTouchStart={(e) => {
          if (!started || paused) return;
          e.preventDefault();
          const t = e.touches[0];
          handleDrop(t.clientX);
        }}
      >
        <canvas ref={canvasRef} id="arena" />
        {showHint && started && !gameOver && (
          <span className="lane-hint">Click or tap to release a soul</span>
        )}
        {!started && <StartOverlay onStart={handleStart} />}
        {gameOver && (
          <GameOverOverlay score={hud.score} onRetry={handleStart} />
        )}
      </div>
      <footer className="game-footer">
        <button
          type="button"
          className="btn"
          disabled={!started}
          onClick={() => {
            if (!started) return;
            stateRef.current = { ...stateRef.current, paused: !paused };
            setPaused((p) => !p);
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!started || paused || gameOver}
          onClick={() => {
            const rect = wrapRef.current?.getBoundingClientRect();
            if (!rect) return;
            handleDrop(stateRef.current.chaliceX + rect.left);
          }}
        >
          Drop soul
        </button>
      </footer>
    </div>
  );
}
