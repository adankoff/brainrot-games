/**
 * MEME PIANO -- Renderer
 * All canvas drawing functions for tiles, lanes, HUD, and effects.
 */

/**
 * Draw the background gradient and lane dividers.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas logical width
 * @param {number} h - Canvas logical height
 * @param {Object} theme - Current theme object
 */
export function drawBackground(ctx, w, h, theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.bgGradientTop);
  grad.addColorStop(1, theme.bgGradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Lane dividers
  const colW = w / 4;
  ctx.strokeStyle = theme.laneLineColor;
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(colW * i, 0);
    ctx.lineTo(colW * i, h);
    ctx.stroke();
  }

  // Bottom deadline line
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, h - 2);
  ctx.lineTo(w, h - 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Draw a single tile.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} tile - Tile object { lane, y, height, tapped }
 * @param {number} colW - Column width
 * @param {Object} theme - Current theme object
 * @param {number} time - Game time for animation effects
 */
export function drawTile(ctx, tile, colW, theme, time) {
  const x = tile.lane * colW;
  const y = tile.y;
  const w = colW;
  const h = tile.height;
  const r = 6; // border radius
  const pad = 2; // padding between tiles and lane edges

  const dx = x + pad;
  const dy = y;
  const dw = w - pad * 2;
  const dh = h;

  if (tile.tapped) {
    // Tapped tile: flash bright then fade
    ctx.fillStyle = theme.tileActiveColor;
    ctx.globalAlpha = Math.max(0, 1 - tile.tapAge * 3);
    roundRect(ctx, dx, dy, dw, dh, r);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  // Active tile
  ctx.fillStyle = theme.tileColor;
  roundRect(ctx, dx, dy, dw, dh, r);
  ctx.fill();

  // Border
  ctx.strokeStyle = theme.tileBorderColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, dx, dy, dw, dh, r);
  ctx.stroke();

  // Inner glow at top
  const glowGrad = ctx.createLinearGradient(dx, dy, dx, dy + dh * 0.3);
  glowGrad.addColorStop(0, theme.tileBorderColor + '44');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  roundRect(ctx, dx, dy, dw, dh, r);
  ctx.fill();

  // Emoji / symbol
  const emojiSize = Math.min(dw, dh) * 0.35;
  ctx.font = `${emojiSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.tileActiveColor;

  // Alternate emoji every other tile for variety
  const emoji = tile.variant % 2 === 0 ? theme.tileEmoji : theme.tileEmojiAlt;
  ctx.fillText(emoji, dx + dw / 2, dy + dh / 2);
}

/**
 * Draw the score HUD at the top center.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} score - Current score
 * @param {Object} theme - Current theme object
 */
export function drawScore(ctx, w, score, theme) {
  ctx.save();
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Shadow
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.5;
  ctx.fillText(String(score), w / 2 + 1, 13);

  // Score text
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.scoreColor;
  ctx.fillText(String(score), w / 2, 12);
  ctx.restore();
}

/**
 * Draw the combo counter when active.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} combo - Current combo count
 * @param {Object} theme - Current theme object
 */
export function drawCombo(ctx, w, combo, theme) {
  if (combo < 3) return;

  ctx.save();
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Pulse effect via translate + scale (preserves DPR transform)
  const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.05;
  ctx.translate(w / 2, 52);
  ctx.scale(pulse, pulse);

  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;
  ctx.fillText(`${combo}x COMBO`, 1, 1);

  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.comboColor;
  ctx.fillText(`${combo}x COMBO`, 0, 0);

  ctx.restore();
}

/**
 * Draw the speed indicator bar at the top.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} speed - Current tile speed
 * @param {number} baseSpeed - Starting speed
 * @param {number} maxSpeed - Max speed for display
 * @param {Object} theme - Current theme object
 */
export function drawSpeedBar(ctx, w, speed, baseSpeed, maxSpeed, theme) {
  const barY = 2;
  const barH = 4;
  const progress = Math.min(1, (speed - baseSpeed) / (maxSpeed - baseSpeed));

  // Background track
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, barY, w, barH);

  // Fill
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, barY, w * progress, barH);
  ctx.globalAlpha = 1;
}

/**
 * Draw floating text effects (combo milestone announcements).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} floatingTexts - Array of { text, x, y, color, age, maxAge, size }
 */
export function drawFloatingTexts(ctx, floatingTexts) {
  for (const ft of floatingTexts) {
    const progress = ft.age / ft.maxAge;
    const alpha = 1 - progress;
    const yOffset = progress * -40;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${ft.size}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = '#000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + yOffset + 1);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y + yOffset);
    ctx.restore();
  }
}

/**
 * Draw the tap flash effect on a lane.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} tapFlashes - Array of { lane, age }
 * @param {number} colW - Column width
 * @param {number} h - Canvas height
 * @param {Object} theme - Current theme object
 */
export function drawTapFlashes(ctx, tapFlashes, colW, h, theme) {
  for (const flash of tapFlashes) {
    const alpha = Math.max(0, 1 - flash.age * 4);
    if (alpha <= 0) continue;

    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = theme.tileActiveColor;
    ctx.fillRect(flash.lane * colW, 0, colW, h);
    ctx.restore();
  }
}

/**
 * Draw a miss indicator flash (red flash on the missed lane or full screen).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} missFlashAge - Age of the miss flash (0 = just happened)
 */
export function drawMissFlash(ctx, w, h, missFlashAge) {
  if (missFlashAge >= 1) return;

  const alpha = Math.max(0, 0.4 * (1 - missFlashAge));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---- Helper: Rounded Rectangle Path ----

/**
 * Create a rounded rectangle path (does not fill or stroke).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
 */
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
