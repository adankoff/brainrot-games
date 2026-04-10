/**
 * MEME MEMORY -- Renderer
 * All canvas drawing: background, cards (face-up/face-down), flip animation,
 * match glow, mismatch flash, HUD (moves + timer).
 */

// ---- Constants ----

const GRID_COLS = 4;
const GRID_ROWS = 4;
const CARD_GAP = 10;
const CARD_RADIUS = 8;
const GRID_TOP_Y = 110; // leave room for HUD at top
const GRID_SIDE_PAD = 20;

/**
 * Compute card dimensions and positions based on canvas size.
 *
 * @param {number} w - Logical canvas width
 * @param {number} h - Logical canvas height
 * @returns {{ cardW: number, cardH: number, gridX: number, gridY: number }}
 */
export function getGridLayout(w, h) {
  const availW = w - GRID_SIDE_PAD * 2;
  const cardW = (availW - (GRID_COLS - 1) * CARD_GAP) / GRID_COLS;
  const cardH = cardW; // square cards
  const gridW = GRID_COLS * cardW + (GRID_COLS - 1) * CARD_GAP;
  const gridH = GRID_ROWS * cardH + (GRID_ROWS - 1) * CARD_GAP;
  const gridX = (w - gridW) / 2;
  const gridY = GRID_TOP_Y + (h - GRID_TOP_Y - 40 - gridH) / 2; // center vertically in play area
  return { cardW, cardH, gridX, gridY };
}

/**
 * Get the bounding rect for a card at grid position (col, row).
 *
 * @param {number} col
 * @param {number} row
 * @param {Object} layout - From getGridLayout
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function getCardRect(col, row, layout) {
  const x = layout.gridX + col * (layout.cardW + CARD_GAP);
  const y = layout.gridY + row * (layout.cardH + CARD_GAP);
  return { x, y, w: layout.cardW, h: layout.cardH };
}

/**
 * Draw the background gradient.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {Object} theme
 */
export function drawBackground(ctx, w, h, theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.bgGradientTop);
  grad.addColorStop(1, theme.bgGradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw a single card. Handles face-down, face-up, flip animation,
 * match glow, and mismatch flash states.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} card - Card state object
 * @param {number} col
 * @param {number} row
 * @param {Object} layout
 * @param {Object} theme
 */
export function drawCard(ctx, card, col, row, layout, theme) {
  const rect = getCardRect(col, row, layout);

  // If card is fully matched and done with glow animation, draw completed card
  if (card.matched && card.glowTimer <= 0) {
    drawMatchedCard(ctx, rect, card, theme);
    return;
  }

  // Flip animation: scaleX from 1 -> 0 -> 1
  // flipProgress: 0 = face down, 1 = face up
  const flipProgress = card.flipProgress;
  // Convert to scaleX: at 0 and 1 scaleX=1, at 0.5 scaleX=0
  const scaleX = Math.abs(flipProgress - 0.5) * 2;
  // Determine which side to show: past halfway means face up
  const showFace = flipProgress > 0.5;

  ctx.save();

  // Apply horizontal scale from center of card
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.translate(cx, cy);
  ctx.scale(scaleX, 1);
  ctx.translate(-cx, -cy);

  // Match glow effect
  if (card.glowTimer > 0) {
    const glowAlpha = card.glowTimer * 0.6;
    ctx.shadowColor = theme.matchGlowColor;
    ctx.shadowBlur = 15 * card.glowTimer;
    ctx.globalAlpha = 1;
    drawRoundRect(ctx, rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, CARD_RADIUS + 2);
    ctx.fillStyle = theme.matchGlowColor;
    ctx.globalAlpha = glowAlpha * 0.3;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Mismatch flash
  if (card.mismatchTimer > 0) {
    ctx.shadowColor = theme.mismatchFlashColor;
    ctx.shadowBlur = 12 * card.mismatchTimer;
  }

  if (showFace && scaleX > 0.01) {
    drawFaceUp(ctx, rect, card, theme);
  } else if (scaleX > 0.01) {
    drawFaceDown(ctx, rect, theme);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Draw a face-down card (back side).
 */
function drawFaceDown(ctx, rect, theme) {
  // Card body
  drawRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, CARD_RADIUS);
  ctx.fillStyle = theme.cardBackColor;
  ctx.fill();
  ctx.strokeStyle = theme.cardBackBorderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Back symbol
  ctx.font = `bold ${rect.w * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.cardBackSymbolColor;
  ctx.globalAlpha = 0.5;
  ctx.fillText(theme.cardBackSymbol, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.globalAlpha = 1;
}

/**
 * Draw a face-up card showing emoji and label.
 */
function drawFaceUp(ctx, rect, card, theme) {
  // Card body
  drawRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, CARD_RADIUS);
  ctx.fillStyle = theme.cardFaceColor;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Emoji
  const emojiSize = rect.w * 0.4;
  ctx.font = `${emojiSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(card.emoji, rect.x + rect.w / 2, rect.y + rect.h * 0.42);

  // Label
  const labelSize = Math.max(9, rect.w * 0.13);
  ctx.font = `bold ${labelSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = theme.accentColor;
  ctx.fillText(card.label, rect.x + rect.w / 2, rect.y + rect.h * 0.78);
}

/**
 * Draw a matched card (subtle, dimmed appearance to show completion).
 */
function drawMatchedCard(ctx, rect, card, theme) {
  ctx.save();
  ctx.globalAlpha = 0.5;

  drawRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, CARD_RADIUS);
  ctx.fillStyle = theme.cardFaceColor;
  ctx.fill();
  ctx.strokeStyle = theme.matchGlowColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Emoji (dimmed)
  const emojiSize = rect.w * 0.35;
  ctx.font = `${emojiSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(card.emoji, rect.x + rect.w / 2, rect.y + rect.h * 0.42);

  // Label
  const labelSize = Math.max(9, rect.w * 0.13);
  ctx.font = `bold ${labelSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = theme.matchGlowColor;
  ctx.fillText(card.label, rect.x + rect.w / 2, rect.y + rect.h * 0.78);

  // Checkmark
  ctx.globalAlpha = 0.4;
  ctx.font = `bold ${rect.w * 0.2}px sans-serif`;
  ctx.fillStyle = theme.matchGlowColor;
  ctx.fillText('\u2713', rect.x + rect.w / 2, rect.y + rect.h * 0.95);

  ctx.restore();
}

/**
 * Draw the HUD: moves counter, timer, and pairs remaining.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} moves
 * @param {number} elapsedSeconds
 * @param {number} pairsLeft
 * @param {number} totalPairs
 * @param {Object} theme
 */
export function drawHUD(ctx, w, moves, elapsedSeconds, pairsLeft, totalPairs, theme) {
  const y = 20;

  ctx.save();

  // Moves (left)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.fillStyle = theme.movesColor;
  ctx.fillText(`${moves} moves`, 16, y);

  // Timer (right)
  ctx.textAlign = 'right';
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  ctx.fillStyle = theme.timerColor;
  ctx.fillText(timeStr, w - 16, y);

  // Pairs remaining (center)
  ctx.textAlign = 'center';
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.fillStyle = theme.hudColor;
  ctx.globalAlpha = 0.7;
  const matched = totalPairs - pairsLeft;
  ctx.fillText(`${matched}/${totalPairs} pairs`, w / 2, y + 2);
  ctx.globalAlpha = 1;

  // Progress bar under HUD
  const barY = y + 26;
  const barH = 3;
  const barPad = 16;
  const barW = w - barPad * 2;
  const progress = matched / totalPairs;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  drawRoundRect(ctx, barPad, barY, barW, barH, 2);
  ctx.fill();

  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.7;
  if (progress > 0) {
    drawRoundRect(ctx, barPad, barY, barW * progress, barH, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw a full-screen mismatch flash overlay.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} flashTimer - 0 to 1, 1 = just started
 */
export function drawMismatchFlash(ctx, w, h, flashTimer) {
  if (flashTimer <= 0) return;
  ctx.save();
  ctx.globalAlpha = flashTimer * 0.15;
  ctx.fillStyle = '#ff2244';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---- Helper: Rounded Rectangle Path ----

/**
 * Create a rounded rectangle path (does not fill or stroke).
 */
function drawRoundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  if (w <= 0 || h <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
