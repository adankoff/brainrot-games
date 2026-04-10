/**
 * MEME CATCH -- Renderer
 * All canvas drawing logic: background, catcher, falling objects, HUD, particles.
 */

const BG_COLOR = '#1a0a2e';
const BG_GRADIENT_TOP = '#1a0a2e';
const BG_GRADIENT_BOTTOM = '#0d0221';
const BASKET_COLOR = '#ff6bff';
const BASKET_BORDER = '#d44fd4';
const BASKET_INNER = '#2a1040';
const HUD_FONT = '"Space Grotesk", "Segoe UI", sans-serif';

// Background stars (static, generated once)
let stars = null;

function ensureStars(width, height) {
  if (stars) return;
  stars = [];
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
    });
  }
}

/**
 * Draw the background gradient and stars.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} time - Elapsed game time for animation
 */
export function drawBackground(ctx, w, h, time) {
  ensureStars(w, h);

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, BG_GRADIENT_TOP);
  grad.addColorStop(1, BG_GRADIENT_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Twinkling stars
  for (const s of stars) {
    const twinkle = Math.sin(time * 0.002 * s.speed + s.x) * 0.3 + 0.7;
    ctx.globalAlpha = s.alpha * twinkle;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the basket/catcher.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./catcher.js').Catcher} catcher
 */
export function drawCatcher(ctx, catcher) {
  const x = catcher.x - catcher.width / 2;
  const y = catcher.y - catcher.height / 2;
  const w = catcher.width;
  const h = catcher.height;
  const r = 8;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(255, 107, 255, 0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;

  // Outer shape (rounded rect)
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

  ctx.fillStyle = BASKET_COLOR;
  ctx.fill();
  ctx.strokeStyle = BASKET_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Inner dark area (the "basket opening")
  const inset = 5;
  const ix = x + inset;
  const iy = y + 3;
  const iw = w - inset * 2;
  const ih = h - 8;
  const ir = 4;

  ctx.beginPath();
  ctx.moveTo(ix + ir, iy);
  ctx.lineTo(ix + iw - ir, iy);
  ctx.quadraticCurveTo(ix + iw, iy, ix + iw, iy + ir);
  ctx.lineTo(ix + iw, iy + ih - ir);
  ctx.quadraticCurveTo(ix + iw, iy + ih, ix + iw - ir, iy + ih);
  ctx.lineTo(ix + ir, iy + ih);
  ctx.quadraticCurveTo(ix, iy + ih, ix, iy + ih - ir);
  ctx.lineTo(ix, iy + ir);
  ctx.quadraticCurveTo(ix, iy, ix + ir, iy);
  ctx.closePath();

  ctx.fillStyle = BASKET_INNER;
  ctx.fill();
}

/**
 * Draw a falling object (emoji).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} obj - Falling object { x, y, emoji, size, rotation }
 */
export function drawFallingObject(ctx, obj) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(obj.rotation || 0);
  ctx.font = `${obj.size || 28}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obj.emoji, 0, 0);
  ctx.restore();
}

/**
 * Draw the HUD (score, lives, multiplier).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} score - Current score
 * @param {number} lives - Current lives
 * @param {number} multiplier - Current score multiplier
 * @param {number} streak - Current catch streak
 */
export function drawHUD(ctx, w, score, lives, multiplier, streak) {
  ctx.save();

  // Score
  ctx.font = `bold 28px ${HUD_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(score.toLocaleString('en-US'), w / 2, 36);

  // Lives (hearts)
  ctx.font = '20px serif';
  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;
  let heartsStr = '';
  for (let i = 0; i < 3; i++) {
    heartsStr += i < lives ? '\u2764\uFE0F' : '\u2661';
  }
  ctx.fillText(heartsStr, 10, 34);

  // Multiplier
  if (multiplier > 1) {
    ctx.font = `bold 18px ${HUD_FONT}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = 'rgba(255,221,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fillText(`x${multiplier}`, w - 10, 34);

    // Streak bar (small indicator under multiplier)
    const nextThreshold = multiplier === 2 ? 10 : 999;
    const progress = Math.min(streak / nextThreshold, 1);
    const barW = 40;
    const barH = 3;
    const barX = w - 10 - barW;
    const barY = 40;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(barX, barY, barW * progress, barH);
  }

  ctx.restore();
}

/**
 * Draw floating score text particles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles - Array of { x, y, text, color, alpha, life }
 */
export function drawParticles(ctx, particles) {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.font = `bold 18px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
}

/**
 * Draw the "ready" hint on first frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} time - Elapsed time for pulse animation
 */
export function drawReadyHint(ctx, w, h, time) {
  const pulse = 0.5 + Math.sin(time * 0.005) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.6;
  ctx.font = `20px ${HUD_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('move to catch!', w / 2, h / 2 + 40);

  // Draw arrow hints
  ctx.font = '16px serif';
  ctx.fillText('\u2190 \u2192', w / 2, h / 2 + 70);
  ctx.restore();
}
