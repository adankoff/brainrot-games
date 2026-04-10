/**
 * MEME GALAGA -- Renderer
 * All canvas drawing logic.
 */

import { W, H } from './galaga.js';
import { formatScore } from '../../shared/utils.js';

export { W, H };

/**
 * Render the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
export function render(ctx, state) {
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Stars
  drawStars(ctx, state.stars);

  // Aliens
  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    drawAlien(ctx, alien);
  }

  // Player
  if (!state.player.dead) {
    drawPlayer(ctx, state.player);
  }

  // Player bullets
  ctx.fillStyle = '#00ffcc';
  for (const b of state.playerBullets) {
    ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
  }

  // Alien bullets
  for (const b of state.alienBullets) {
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Explosions
  for (const ex of state.explosions) {
    drawExplosion(ctx, ex);
  }

  // HUD
  drawHUD(ctx, state);

  // Wave banner
  if (state.waveBannerTimer > 0) {
    drawWaveBanner(ctx, state);
  }
}

/**
 * Draw starfield.
 */
function drawStars(ctx, stars) {
  for (const star of stars) {
    ctx.globalAlpha = star.brightness;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the player ship (triangle/arrow).
 */
function drawPlayer(ctx, player) {
  const { x, y, invincible } = player;

  // Blink during invincibility
  if (invincible > 0 && Math.floor(invincible / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  // Ship body (triangle pointing up)
  ctx.fillStyle = '#00ffcc';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(-12, 10);
  ctx.lineTo(-4, 6);
  ctx.lineTo(0, 8);
  ctx.lineTo(4, 6);
  ctx.lineTo(12, 10);
  ctx.closePath();
  ctx.fill();

  // Cockpit glow
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-4, 2);
  ctx.lineTo(4, 2);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  ctx.fillStyle = '#00ff88';
  ctx.globalAlpha = 0.6 + Math.random() * 0.4;
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(0, 14 + Math.random() * 4);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw an alien based on its type.
 */
function drawAlien(ctx, alien) {
  const { x, y, type, color, size } = alien;

  ctx.save();
  ctx.translate(x, y);

  if (type === 'commander') {
    drawCommander(ctx, color, size);
  } else if (type === 'butterfly') {
    drawButterfly(ctx, color, size);
  } else {
    drawBee(ctx, color, size);
  }

  ctx.restore();
}

/**
 * Draw commander alien (crown shape).
 */
function drawCommander(ctx, color, size) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size, size * 0.6);
  ctx.lineTo(-size, -size * 0.3);
  ctx.lineTo(-size * 0.6, -size * 0.7);
  ctx.lineTo(-size * 0.3, -size * 0.3);
  ctx.lineTo(0, -size);
  ctx.lineTo(size * 0.3, -size * 0.3);
  ctx.lineTo(size * 0.6, -size * 0.7);
  ctx.lineTo(size, -size * 0.3);
  ctx.lineTo(size, size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.35, size * 0.1, 3, 0, Math.PI * 2);
  ctx.arc(size * 0.35, size * 0.1, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw butterfly alien (wing shape).
 */
function drawButterfly(ctx, color, size) {
  ctx.fillStyle = color;
  // Left wing
  ctx.beginPath();
  ctx.ellipse(-size * 0.5, 0, size * 0.7, size * 0.5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.ellipse(size * 0.5, 0, size * 0.7, size * 0.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2, -size * 0.6, 4, size * 1.2);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-3, -size * 0.2, 2, 0, Math.PI * 2);
  ctx.arc(3, -size * 0.2, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw bee alien (hexagonal).
 */
function drawBee(ctx, color, size) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = Math.cos(angle) * size;
    const py = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Stripes
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-size, -2, size * 2, 4);

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.2, 2.5, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.2, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw an explosion effect.
 */
function drawExplosion(ctx, ex) {
  const progress = ex.t / ex.duration;
  if (progress >= 1) return;

  ctx.save();
  ctx.translate(ex.x, ex.y);

  const numParticles = 8;
  const maxRadius = ex.size * 2;
  const radius = maxRadius * progress;
  const alpha = 1 - progress;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = ex.color;

  for (let i = 0; i < numParticles; i++) {
    const angle = (Math.PI * 2 / numParticles) * i;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    const pSize = (1 - progress) * 4;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center flash
  if (progress < 0.3) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = (1 - progress / 0.3) * 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, ex.size * (1 - progress), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw the HUD (score, lives, wave).
 */
function drawHUD(ctx, state) {
  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(formatScore(state.score), 10, 24);

  // Wave
  ctx.textAlign = 'right';
  ctx.fillStyle = '#888888';
  ctx.font = '12px monospace';
  ctx.fillText(`WAVE ${state.wave}`, W - 10, 24);

  // Lives
  ctx.textAlign = 'left';
  for (let i = 0; i < state.player.lives; i++) {
    drawMiniShip(ctx, 14 + i * 22, 42);
  }
}

/**
 * Draw a small ship icon for lives display.
 */
function drawMiniShip(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#00ffcc';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-5, 4);
  ctx.lineTo(5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the wave transition banner.
 */
function drawWaveBanner(ctx, state) {
  const alpha = Math.min(state.waveBannerTimer / 30, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#00ffcc';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${state.wave}`, W / 2, H / 2 - 10);

  if (state.wave > 1) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText('incoming hostiles detected', W / 2, H / 2 + 20);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText('defend the galaxy no cap', W / 2, H / 2 + 20);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
