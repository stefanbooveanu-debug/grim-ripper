import type { HudSnapshot } from '../game/types';
import './Hud.css';

interface HudProps {
  hud: HudSnapshot;
}

export function Hud({ hud }: HudProps) {
  return (
    <section className="hud" aria-live="polite">
      <div className="hud-block">
        <span className="hud-label">Score</span>
        <span className="hud-value">{hud.score}</span>
      </div>
      <div className="hud-block">
        <span className="hud-label">Combo</span>
        <span className="hud-value hud-combo">×{hud.combo}</span>
      </div>
      <div className="hud-block">
        <span className="hud-label">Lives</span>
        <span className="hud-value">{'♥ '.repeat(hud.lives).trim() || '—'}</span>
      </div>
    </section>
  );
}
