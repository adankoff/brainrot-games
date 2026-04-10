/**
 * MEME JUMP -- Renderer
 * Draws the game world onto a 2D canvas context.
 */

import { W, H } from './jump.js';

const BG_COLOR = '#1a1a2e';
const BG_GRID_COLOR = 'rgba(255, 255, 255, 0.03)';

const PLATFORM_COLORS = {
  normal: '#44ff44',
  moving: '#4488ff',
  breakable: '#aa7744',
  spring: '#ff4444',
};

const PLATFORM_HIGHLIGHT = {
  normal: '#66ff88',
  moving: '#66aaff',
  breakable: '#cc9966',
  spring: '#ff6666',
};

const PLAYER_COLOR = '#ffdd44';
const PLAYER_EYE_COLOR = '#111';
const PLAYER_MOUTH_COLOR = '#111';

const SCORE_FONT = 'bold 18px monospace';
const SCORE_COLOR = 'rgba(255, 255, 255, 0.8)';

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ player: Object, platforms: Object[], camera: number, score: number, particles: Object[], gameOver: boolean }} entities
 */
export function render(ctx, entities) {
  const { player, platforms, camera, score, particles } = entities;

  ctx.save();

  // -- Background --
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid for depth
  drawGrid(ctx, camera);

  // -- Translate for camera --
  ctx.save();
  ctx.translate(0, -camera);

  // -- Platforms --
  for (const plat of platforms) {
    drawPlatform(ctx, plat);
  }

  // -- Particles --
  for (const part of particles) {
    const alpha = Math.max(0, part.life);
    ctx.fillStyle = `rgba(170, 119, 68, ${alpha})`;
    ctx.fillRect(part.x - 3, part.y - 3, 6, 6);
  }

  // -- Player --
  drawPlayer(ctx, player);

  ctx.restore();

  // -- HUD (score) --
  drawHUD(ctx, score);

  ctx.restore();
}

/**
 * Draw a subtle background grid for parallax depth.
 */
function drawGrid(ctx, camera) {
  ctx.strokeStyle = BG_GRID_COLOR;
  ctx.lineWidth = 1;

  const gridSize = 50;
  const offsetY = (camera * 0.3) % gridSize;

  for (let y = -gridSize + offsetY; y < H + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw a platform with style based on type.
 */
function drawPlatform(ctx, plat) {
  const color = PLATFORM_COLORS[plat.type] || PLATFORM_COLORS.normal;
  const highlight = PLATFORM_HIGHLIGHT[plat.type] || PLATFORM_HIGHLIGHT.normal;

  // Main body
  ctx.fillStyle = color;
  roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 4);
  ctx.fill();

  // Top highlight
  ctx.fillStyle = highlight;
  roundRect(ctx, plat.x + 2, plat.y + 1, plat.w - 4, 3, 2);
  ctx.fill();

  // Spring indicator: draw a coil
  if (plat.type === 'spring') {
    ctx.fillStyle = '#ffaa00';
    const coilX = plat.x + plat.w / 2 - 5;
    const coilY = plat.y - 8;
    ctx.fillRect(coilX, coilY, 10, 8);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(coilX + 2, coilY + 2, 6, 2);
    ctx.fillRect(coilX + 2, coilY + 5, 6, 2);
  }
}

/**
 * Draw the player character -- a bouncy meme face.
 */
function drawPlayer(ctx, player) {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  const r = player.w / 2;

  // Squash/stretch based on velocity
  const stretchY = 1.0 + Math.max(-0.2, Math.min(0.3, player.vy * 0.02));
  const stretchX = 1.0 / stretchY;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(stretchX, stretchY);

  // Body (circle)
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Outline
  ctx.strokeStyle = '#cc9900';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  const eyeOffX = player.facingRight ? 4 : -4;
  const eyeY = -4;

  ctx.fillStyle = PLAYER_EYE_COLOR;
  // Left eye
  ctx.beginPath();
  ctx.arc(-6 + eyeOffX, eyeY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(6 + eyeOffX, eyeY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-5 + eyeOffX, eyeY - 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7 + eyeOffX, eyeY - 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Mouth -- smile when going up, open mouth when falling
  ctx.strokeStyle = PLAYER_MOUTH_COLOR;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  if (player.vy < -2) {
    // Big smile going up
    ctx.beginPath();
    ctx.arc(eyeOffX * 0.5, 4, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (player.vy > 3) {
    // Open mouth -- falling
    ctx.fillStyle = PLAYER_MOUTH_COLOR;
    ctx.beginPath();
    ctx.ellipse(eyeOffX * 0.5, 6, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Neutral
    ctx.beginPath();
    ctx.arc(eyeOffX * 0.5, 3, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw the score HUD.
 */
function drawHUD(ctx, score) {
  ctx.font = SCORE_FONT;
  ctx.fillStyle = SCORE_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${score}`, 12, 12);
}

/**
 * Draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
