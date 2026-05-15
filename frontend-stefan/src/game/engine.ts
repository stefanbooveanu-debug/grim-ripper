import { CHALICE_Y_RATIO, GRAVITY, MAX_COMBO, MAX_LIVES, SOUL_RADIUS } from './constants';
import type { GameState, HudSnapshot, Particle, Soul } from './types';

export function createInitialState(w: number, h: number): GameState {
  const chaliceW = Math.min(100, w * 0.28);
  return {
    w,
    h,
    chaliceY: h * CHALICE_Y_RATIO,
    chaliceW,
    running: false,
    paused: false,
    score: 0,
    combo: 1,
    lives: MAX_LIVES,
    souls: [],
    particles: [],
    chaliceX: w / 2,
    chaliceTarget: w / 2,
    chaliceSpeed: 0,
    missCooldown: 0,
  };
}

export function resizeState(state: GameState, w: number, h: number): GameState {
  const chaliceW = Math.min(100, w * 0.28);
  return {
    ...state,
    w,
    h,
    chaliceY: h * CHALICE_Y_RATIO,
    chaliceW,
    chaliceX: state.running ? state.chaliceX : w / 2,
    chaliceTarget: state.running ? state.chaliceTarget : w / 2,
  };
}

export function resetGame(state: GameState): GameState {
  return {
    ...state,
    score: 0,
    combo: 1,
    lives: MAX_LIVES,
    souls: [],
    particles: [],
    chaliceX: state.w / 2,
    chaliceTarget: state.w / 2,
    chaliceSpeed: 0,
    missCooldown: 0,
    running: true,
    paused: false,
  };
}

export function toHud(state: GameState): HudSnapshot {
  return { score: state.score, combo: state.combo, lives: state.lives };
}

function burst(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
    const sp = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1,
      life: 1,
      color,
    });
  }
  return particles;
}

export function spawnSoul(state: GameState, x: number): GameState {
  const soul: Soul = {
    x: Math.max(SOUL_RADIUS, Math.min(state.w - SOUL_RADIUS, x)),
    y: SOUL_RADIUS + 8,
    vy: 0,
    hue: 260 + Math.random() * 40,
    glow: 0.6 + Math.random() * 0.4,
  };
  return { ...state, souls: [...state.souls, soul] };
}

export function updateGame(state: GameState, dt: number): GameState {
  if (!state.running || state.paused) return state;

  let {
    chaliceX,
    chaliceTarget,
    chaliceSpeed,
    souls,
    particles,
    score,
    combo,
    lives,
    missCooldown,
  } = state;

  chaliceSpeed += (chaliceTarget - chaliceX) * 0.08;
  chaliceX += chaliceSpeed;
  chaliceSpeed *= 0.85;

  const left = chaliceX - state.chaliceW / 2 + 8;
  const right = chaliceX + state.chaliceW / 2 - 8;
  let newParticles = [...particles];

  souls = souls.filter((s) => {
    const vy = s.vy + GRAVITY;
    const y = s.y + vy;
    const next = { ...s, vy, y };

    if (y >= state.chaliceY - 4 && y <= state.chaliceY + 36) {
      if (s.x >= left && s.x <= right) {
        score += 10 * combo;
        combo = Math.min(MAX_COMBO, combo + 1);
        newParticles = newParticles.concat(burst(s.x, y, `hsl(${s.hue}, 70%, 60%)`));
        return false;
      }
    }

    if (y > state.h + SOUL_RADIUS) {
      if (missCooldown <= 0) {
        missCooldown = 0.5;
        lives -= 1;
        combo = 1;
        newParticles = newParticles.concat(
          burst(chaliceX, state.chaliceY, 'rgba(139, 26, 43, 0.9)'),
        );
      }
      return false;
    }

    Object.assign(s, next);
    return true;
  });

  newParticles = newParticles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.08,
      life: p.life - dt * 2.2,
    }))
    .filter((p) => p.life > 0);

  if (missCooldown > 0) missCooldown -= dt;

  chaliceTarget =
    chaliceX + Math.sin(performance.now() * 0.0012) * (state.w * 0.22);
  chaliceTarget = Math.max(
    state.chaliceW / 2 + 10,
    Math.min(state.w - state.chaliceW / 2 - 10, chaliceTarget),
  );

  const running = lives > 0;

  return {
    ...state,
    chaliceX,
    chaliceTarget,
    chaliceSpeed,
    souls,
    particles: newParticles,
    score,
    combo,
    lives,
    missCooldown,
    running,
  };
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { w, h } = state;
  ctx.clearRect(0, 0, w, h);

  const gridGrad = ctx.createLinearGradient(0, 0, 0, h);
  gridGrad.addColorStop(0, '#1a1a24');
  gridGrad.addColorStop(1, '#0a0a10');
  ctx.fillStyle = gridGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  drawChalice(ctx, state);
  state.souls.forEach((s) => drawSoul(ctx, s));
  state.particles.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (state.paused && state.running) {
    ctx.fillStyle = 'rgba(5,5,8,0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e8e4dc';
    ctx.font = '12px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', w / 2, h / 2);
  }
}

function drawSoul(ctx: CanvasRenderingContext2D, s: Soul): void {
  const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, SOUL_RADIUS * 1.8);
  g.addColorStop(0, `hsla(${s.hue}, 70%, 65%, ${0.35 * s.glow})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s.x, s.y, SOUL_RADIUS * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `hsl(${s.hue}, 55%, 72%)`;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, SOUL_RADIUS * 0.7, SOUL_RADIUS, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawChalice(ctx: CanvasRenderingContext2D, state: GameState): void {
  const cx = state.chaliceX;
  const cy = state.chaliceY;
  const hw = state.chaliceW / 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(196, 60, 74, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - 8);
  ctx.lineTo(cx - hw + 12, cy + 28);
  ctx.quadraticCurveTo(cx, cy + 42, cx + hw - 12, cy + 28);
  ctx.lineTo(cx + hw, cy - 8);
  ctx.closePath();
  ctx.stroke();

  const grad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 35);
  grad.addColorStop(0, 'rgba(139, 26, 43, 0.25)');
  grad.addColorStop(1, 'rgba(107, 76, 255, 0.15)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}
