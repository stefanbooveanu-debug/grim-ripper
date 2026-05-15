export interface Soul {
  x: number;
  y: number;
  vy: number;
  hue: number;
  glow: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface GameState {
  w: number;
  h: number;
  chaliceY: number;
  chaliceW: number;
  running: boolean;
  paused: boolean;
  score: number;
  combo: number;
  lives: number;
  souls: Soul[];
  particles: Particle[];
  chaliceX: number;
  chaliceTarget: number;
  chaliceSpeed: number;
  missCooldown: number;
}

export interface HudSnapshot {
  score: number;
  combo: number;
  lives: number;
}
