/**
 * AIM TRAINER -- Renderer
 * Draws all game visuals: targets, crosshair, HUD, effects.
 */

import { lerp } from '../../shared/utils.js';

const BG_COLOR = '#0a0a12';
const GRID_COLOR = 'rgba(255, 51, 85, 0.04)';
const TARGET_COLOR = '#ff3355';
const TARGET_OUTLINE = '#ff6680';
const TARGET_INNER = '#ff1133';
const CROSSHAIR_COLOR = '#ffffff';
const HUD_COLOR = '#e8e8f0';
const HUD_SECONDARY = '#7a7a8e';
const HIT_RING_COLOR = '#ff3355';
const PARTICLE_COLOR = '#ff6680';
const TIMER_WARN_COLOR = '#ffaa00';
const TIMER_DANGER_COLOR = '#ff3355';

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./aim.js').AimGame} game
 * @param {number} W - canvas width
 * @param {number} H - canvas height
 */
export function render(ctx, game, W, H) {
  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  drawGrid(ctx, W, H);

  // Targets
  for (const t of game.targets) {
    drawTarget(ctx, t);
  }

  // Hit effects
  for (const fx of game.hitEffects) {
    drawHitEffect(ctx, fx);
  }

  // HUD
  drawHUD(ctx, game, W);

  // Crosshair (drawn last, on top of everything)
  drawCrosshair(ctx, game.cursor.x, game.cursor.y);
}

/**
 * Draw a subtle background grid.
 */
function drawGrid(ctx, W, H) {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  const spacing = 40;
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw a single target with pulsing glow.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./aim.js').Target} t
 */
function drawTarget(ctx, t) {
  const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.05;
  const r = t.radius * pulse;

  // Outer glow
  const gradient = ctx.createRadialGradient(t.x, t.y, r * 0.3, t.x, t.y, r * 1.5);
  gradient.addColorStop(0, `rgba(255, 51, 85, ${0.3 * t.life})`);
  gradient.addColorStop(1, 'rgba(255, 51, 85, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(t.x, t.y, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main circle
  ctx.fillStyle = TARGET_COLOR;
  ctx.globalAlpha = 0.3 + 0.7 * t.life;
  ctx.beginPath();
  ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = TARGET_OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = TARGET_INNER;
  ctx.beginPath();
  ctx.arc(t.x, t.y, r * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Life indicator ring (shrinking arc)
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * t.life})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t.life);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/**
 * Draw a hit effect (expanding ring + particles).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./aim.js').HitEffect} fx
 */
function drawHitEffect(ctx, fx) {
  const alpha = 1 - fx.t;

  // Expanding ring
  const ringRadius = lerp(10, 60, fx.t);
  ctx.strokeStyle = `rgba(255, 51, 85, ${alpha * 0.8})`;
  ctx.lineWidth = lerp(4, 1, fx.t);
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Second ring (slower)
  const ring2 = lerp(5, 40, fx.t);
  ctx.strokeStyle = `rgba(255, 102, 128, ${alpha * 0.5})`;
  ctx.lineWidth = lerp(2, 0.5, fx.t);
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, ring2, 0, Math.PI * 2);
  ctx.stroke();

  // Particles
  for (const p of fx.particles) {
    if (p.life <= 0) continue;
    ctx.fillStyle = `rgba(255, 102, 128, ${p.life * 0.9})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw the HUD bar at the top.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./aim.js').AimGame} game
 * @param {number} W
 */
function drawHUD(ctx, game, W) {
  // HUD background
  ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
  ctx.fillRect(0, 0, W, 56);

  // Bottom border
  ctx.strokeStyle = 'rgba(255, 51, 85, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(W, 56);
  ctx.stroke();

  // Timer
  const timeStr = game.timeLeft.toFixed(1) + 's';
  let timerColor = HUD_COLOR;
  if (game.timeLeft <= 5) timerColor = TIMER_DANGER_COLOR;
  else if (game.timeLeft <= 10) timerColor = TIMER_WARN_COLOR;

  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = timerColor;
  ctx.fillText(timeStr, 12, 28);

  // Hits
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = HUD_SECONDARY;
  ctx.fillText('HITS', W / 2, 16);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = HUD_COLOR;
  ctx.fillText(String(game.hits), W / 2, 38);

  // Accuracy
  const accStr = game.getAccuracy() + '%';
  ctx.font = '14px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = HUD_SECONDARY;
  ctx.fillText('ACC', W - 12, 16);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = HUD_COLOR;
  ctx.fillText(accStr, W - 12, 38);
}

/**
 * Draw the crosshair at cursor position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 */
function drawCrosshair(ctx, x, y) {
  const size = 12;
  const gap = 4;

  ctx.strokeStyle = CROSSHAIR_COLOR;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Top
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y - gap);
  ctx.stroke();

  // Bottom
  ctx.beginPath();
  ctx.moveTo(x, y + gap);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // Left
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x - gap, y);
  ctx.stroke();

  // Right
  ctx.beginPath();
  ctx.moveTo(x + gap, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = CROSSHAIR_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Render the game-over stats overlay on canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./aim.js').AimGame} game
 * @param {number} W
 * @param {number} H
 */
export function renderGameOver(ctx, game, W, H) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  // Stats panel
  const stats = [
    { label: 'HITS', value: String(game.hits) },
    { label: 'MISSES', value: String(game.misses) },
    { label: 'ACCURACY', value: game.getAccuracy() + '%' },
    { label: 'AVG REACT', value: game.getAvgReactionTime() + 'ms' },
  ];

  const startY = H * 0.35;
  const lineH = 36;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < stats.length; i++) {
    const y = startY + i * lineH;
    ctx.font = '13px monospace';
    ctx.fillStyle = HUD_SECONDARY;
    ctx.fillText(stats[i].label, W / 2 - 50, y);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = HUD_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText(stats[i].value, W / 2 + 50, y);
    ctx.textAlign = 'center';
  }
}
