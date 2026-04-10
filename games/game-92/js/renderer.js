/**
 * MEME INVADERS -- Renderer
 * Canvas drawing for all game entities.
 */

import { W, H, PLAYER_W, PLAYER_H, UFO_W, UFO_H, ROW_EMOJI } from './invaders.js';

const STAR_COUNT = 80;
let stars = null;

/**
 * Initialize starfield (lazy, once).
 */
function initStars() {
  if (stars) return;
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.5 + Math.random() * 1.5,
      brightness: 0.3 + Math.random() * 0.7,
    });
  }
}

/**
 * Render the full game scene.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} entities - From getEntities()
 */
export function render(ctx, entities) {
  initStars();

  const { player, playerBullets, alienBullets, aliens, ufo, explosions,
          score, lives, wave, gameOver, hitFlash, waveTransition } = entities;

  // -- Background --
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // -- Starfield --
  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.brightness * 0.6})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // -- HUD --
  drawHUD(ctx, score, lives, wave);

  // -- Wave transition overlay --
  if (waveTransition > 0) {
    ctx.save();
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = Math.min(1, waveTransition / 20);
    ctx.fillText(`WAVE ${wave}`, W / 2, H / 2);
    ctx.restore();
    // Still draw everything underneath
  }

  // -- Aliens --
  ctx.font = '22px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const alien of aliens) {
    if (!alien.alive) continue;
    ctx.fillText(alien.emoji, alien.x + alien.width / 2, alien.y + alien.height / 2);
  }

  // -- UFO --
  if (ufo) {
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛸', ufo.x + UFO_W / 2, ufo.y + UFO_H / 2);

    // Glow effect
    ctx.save();
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255,0,255,0.15)';
    ctx.fillRect(ufo.x, ufo.y, UFO_W, UFO_H);
    ctx.restore();
  }

  // -- Player bullets --
  ctx.fillStyle = '#00ff41';
  for (const b of playerBullets) {
    ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
    // Glow trail
    ctx.fillStyle = 'rgba(0,255,65,0.3)';
    ctx.fillRect(b.x - b.width / 2 - 1, b.y, b.width + 2, b.height * 0.6);
    ctx.fillStyle = '#00ff41';
  }

  // -- Alien bullets --
  ctx.fillStyle = '#ff3333';
  for (const b of alienBullets) {
    ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
    // Glow trail
    ctx.fillStyle = 'rgba(255,51,51,0.3)';
    ctx.fillRect(b.x - b.width / 2 - 1, b.y - b.height * 0.4, b.width + 2, b.height * 0.4);
    ctx.fillStyle = '#ff3333';
  }

  // -- Explosions --
  for (const ex of explosions) {
    const progress = 1 - (ex.life / 20);
    const radius = 8 + progress * 16;
    const alpha = 1 - progress;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // -- Player ship --
  drawPlayer(ctx, player.x, player.y, hitFlash > 0);

  // -- Game Over text on canvas --
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText(`final score: ${score}`, W / 2, H / 2 + 20);
    ctx.restore();
  }
}

/**
 * Draw the player ship.
 */
function drawPlayer(ctx, x, y, flashing) {
  ctx.save();

  if (flashing && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.3;
  }

  // Ship body (triangle-ish)
  const hw = PLAYER_W / 2;
  const hh = PLAYER_H / 2;

  ctx.fillStyle = '#00ff41';
  ctx.beginPath();
  ctx.moveTo(x, y - hh);           // tip
  ctx.lineTo(x - hw, y + hh);       // bottom-left
  ctx.lineTo(x - hw * 0.3, y + hh * 0.4); // inner-left
  ctx.lineTo(x + hw * 0.3, y + hh * 0.4); // inner-right
  ctx.lineTo(x + hw, y + hh);       // bottom-right
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#00cc33';
  ctx.beginPath();
  ctx.arc(x, y - 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Engine glow
  ctx.fillStyle = 'rgba(0,255,100,0.4)';
  ctx.fillRect(x - 4, y + hh * 0.4, 8, 6);

  ctx.restore();
}

/**
 * Draw the HUD (score, lives, wave).
 */
function drawHUD(ctx, score, lives, wave) {
  ctx.save();

  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 24);

  ctx.font = 'bold 13px monospace';
  ctx.textBaseline = 'middle';

  // Score (left)
  ctx.fillStyle = '#00ff41';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 8, 13);

  // Wave (center)
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${wave}`, W / 2, 13);

  // Lives (right) - draw small ship icons
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00ff41';
  const livesText = '♥'.repeat(Math.max(0, lives));
  ctx.fillText(livesText, W - 8, 13);

  ctx.restore();
}
