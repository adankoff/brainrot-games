/**
 * HIGHER LOWER -- Renderer
 * All canvas drawing: cards, buttons, HUD, animations.
 */

import { rankValue } from './highlow.js';

export const W = 400;
export const H = 700;

// Colors
const BG_DARK = '#1a1a2e';
const BG_MID = '#16213e';
const CARD_WHITE = '#fff';
const CARD_BACK = '#2244aa';
const CARD_BACK_PATTERN = '#1a3388';
const RED = '#e53935';
const BLACK_COL = '#222';
const ACCENT = '#c8ff00';
const BTN_HIGHER = '#00c853';
const BTN_LOWER = '#e53935';
const GOLD = '#ffd700';

// Card dimensions
const CARD_W = 120;
const CARD_H = 170;
const CARD_R = 10;

// Suit symbols
const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const SUIT_COLORS = {
  hearts: RED,
  diamonds: RED,
  clubs: BLACK_COL,
  spades: BLACK_COL,
};

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

/**
 * Draw a face-up card.
 */
function drawCardFace(ctx, cx, cy, card, scaleX) {
  const sx = scaleX !== undefined ? scaleX : 1;
  const drawW = CARD_W * sx;
  const x = cx - drawW / 2;
  const y = cy - CARD_H / 2;

  ctx.save();

  // Card body
  roundRect(ctx, x, y, drawW, CARD_H, CARD_R * sx);
  ctx.fillStyle = CARD_WHITE;
  ctx.fill();
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (sx < 0.15) {
    ctx.restore();
    return;
  }

  // Clip to card
  ctx.save();
  roundRect(ctx, x, y, drawW, CARD_H, CARD_R * sx);
  ctx.clip();

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  // Rank top-left
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(24 * sx)}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, x + 8 * sx, y + 8);

  // Suit top-left below rank
  ctx.font = `${Math.round(20 * sx)}px serif`;
  ctx.fillText(symbol, x + 9 * sx, y + 34);

  // Large center suit
  ctx.font = `${Math.round(52 * sx)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, cy);

  // Rank bottom-right (inverted)
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(24 * sx)}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(card.rank, x + drawW - 8 * sx, y + CARD_H - 8);

  ctx.restore(); // clip
  ctx.restore(); // save
}

/**
 * Draw a face-down card.
 */
function drawCardBack(ctx, cx, cy, scaleX) {
  const sx = scaleX !== undefined ? scaleX : 1;
  const drawW = CARD_W * sx;
  const x = cx - drawW / 2;
  const y = cy - CARD_H / 2;

  // Card body
  roundRect(ctx, x, y, drawW, CARD_H, CARD_R * sx);
  ctx.fillStyle = CARD_BACK;
  ctx.fill();
  ctx.strokeStyle = '#1a3388';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (sx < 0.15) return;

  // Pattern
  ctx.save();
  const pad = 6 * sx;
  roundRect(ctx, x + pad, y + pad, drawW - pad * 2, CARD_H - pad * 2, (CARD_R - 2) * sx);
  ctx.clip();

  ctx.strokeStyle = CARD_BACK_PATTERN;
  ctx.lineWidth = 1;
  for (let i = -CARD_H; i < drawW + CARD_H; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + CARD_H, y + CARD_H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + i, y + CARD_H);
    ctx.lineTo(x + i + CARD_H, y);
    ctx.stroke();
  }

  // Center question mark
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = `bold ${Math.round(40 * sx)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', cx, cy);

  ctx.restore();
}

/**
 * Draw a button. Returns bounds for hit testing.
 */
function drawButton(ctx, x, y, w, h, label, color, enabled = true) {
  const fill = enabled ? color : '#555';

  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = fill;
  ctx.fill();

  // Top highlight
  if (enabled) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, x, y, w, h / 2, 10);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();

  ctx.fillStyle = enabled ? '#fff' : '#999';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2);

  return { x, y, width: w, height: h };
}

/**
 * Animation state holder -- managed externally in main.js.
 *
 * @typedef {Object} AnimState
 * @property {number} flipProgress  - 0 to 1, card flip animation
 * @property {number} flashTimer    - countdown for correct/wrong flash
 * @property {string|null} flashColor - '#00c853' or '#e53935'
 * @property {number} streakPopTimer - countdown for streak milestone pop
 * @property {number} streakPopValue - the milestone streak number
 */

/**
 * Create a fresh animation state.
 *
 * @returns {AnimState}
 */
export function createAnimState() {
  return {
    flipProgress: 0,
    flashTimer: 0,
    flashColor: null,
    streakPopTimer: 0,
    streakPopValue: 0,
  };
}

/**
 * Main render function. Returns button bounds.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - game state from highlow.js
 * @param {AnimState} anim - animation state
 * @returns {Object} bounds
 */
export function render(ctx, state, anim) {
  const bounds = {};

  // -- Background --
  ctx.fillStyle = BG_DARK;
  ctx.fillRect(0, 0, W, H);

  // Subtle gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(22, 33, 62, 0.8)');
  grad.addColorStop(1, 'rgba(26, 26, 46, 1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // -- Flash overlay --
  if (anim.flashTimer > 0 && anim.flashColor) {
    ctx.fillStyle = anim.flashColor;
    ctx.globalAlpha = Math.min(anim.flashTimer / 10, 0.25);
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // -- Streak + Score HUD --
  renderHUD(ctx, state, anim);

  // -- Cards --
  const currentCardX = 130;
  const nextCardX = 270;
  const cardY = 280;

  // Current card (always face-up)
  drawCardFace(ctx, currentCardX, cardY, state.currentCard, 1);

  // "vs" label between cards
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('vs', W / 2, cardY);

  // Next card: face-down or flipping
  if (state.phase === 'guessing' && !state.nextCard) {
    // Face-down, no flip
    drawCardBack(ctx, nextCardX, cardY, 1);
  } else if (state.phase === 'revealing' && state.nextCard) {
    // Flip animation
    const p = anim.flipProgress;
    if (p < 0.5) {
      // First half: shrink face-down
      const sx = 1 - p * 2; // 1 -> 0
      drawCardBack(ctx, nextCardX, cardY, Math.max(sx, 0.01));
    } else {
      // Second half: expand face-up
      const sx = (p - 0.5) * 2; // 0 -> 1
      drawCardFace(ctx, nextCardX, cardY, state.nextCard, Math.max(sx, 0.01));
    }
  } else if (state.nextCard) {
    // After flip: show face-up
    drawCardFace(ctx, nextCardX, cardY, state.nextCard, 1);
  } else {
    drawCardBack(ctx, nextCardX, cardY, 1);
  }

  // Card value labels
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`value: ${rankValue(state.currentCard.rank)}`, currentCardX, cardY + CARD_H / 2 + 12);

  if (state.phase === 'revealing' && anim.flipProgress >= 1 && state.nextCard) {
    ctx.fillText(`value: ${rankValue(state.nextCard.rank)}`, nextCardX, cardY + CARD_H / 2 + 12);
  } else if (state.phase === 'gameover' && state.nextCard) {
    ctx.fillText(`value: ${rankValue(state.nextCard.rank)}`, nextCardX, cardY + CARD_H / 2 + 12);
  }

  // -- Buttons / Phase UI --
  if (state.phase === 'guessing') {
    renderGuessingButtons(ctx, bounds);
  } else if (state.phase === 'revealing') {
    // Result text once flip is done
    if (anim.flipProgress >= 1) {
      renderResultText(ctx, state);
    }
  } else if (state.phase === 'gameover') {
    renderResultText(ctx, state);
  }

  // -- Streak milestone pop --
  if (anim.streakPopTimer > 0) {
    const popAlpha = Math.min(anim.streakPopTimer / 20, 1);
    const popScale = 1 + (1 - anim.streakPopTimer / 40) * 0.3;
    ctx.save();
    ctx.globalAlpha = popAlpha;
    ctx.font = `bold ${Math.round(28 * popScale)}px monospace`;
    ctx.fillStyle = GOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${anim.streakPopValue} STREAK!`, W / 2, 180);
    ctx.restore();
  }

  return bounds;
}

/**
 * Render the top HUD: streak counter and score.
 */
function renderHUD(ctx, state, anim) {
  // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(String(state.score), W / 2, 30);

  // Score label
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px monospace';
  ctx.fillText('SCORE', W / 2, 14);

  // Streak counter
  if (state.streak > 0) {
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`streak: ${state.streak}`, W / 2, 72);

    // Next points indicator
    ctx.fillStyle = 'rgba(200, 255, 0, 0.5)';
    ctx.font = '12px monospace';
    ctx.fillText(`next correct: +${state.streak + 1}`, W / 2, 96);
  }

  // Decorative line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 120);
  ctx.lineTo(W - 40, 120);
  ctx.stroke();
}

/**
 * Render HIGHER and LOWER buttons.
 */
function renderGuessingButtons(ctx, bounds) {
  const btnW = 150;
  const btnH = 56;
  const gap = 20;
  const totalW = btnW * 2 + gap;
  const startX = (W - totalW) / 2;
  const btnY = 510;

  bounds.higher = drawButton(ctx, startX, btnY, btnW, btnH, 'HIGHER', BTN_HIGHER, true);
  bounds.lower = drawButton(ctx, startX + btnW + gap, btnY, btnW, btnH, 'LOWER', BTN_LOWER, true);

  // Arrow hints on buttons
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u25B2', startX + btnW / 2, btnY - 14);
  ctx.fillText('\u25BC', startX + btnW + gap + btnW / 2, btnY - 14);

  // Keyboard hint
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('UP/H = higher   DOWN/L = lower', W / 2, btnY + btnH + 18);
}

/**
 * Render result text after card reveal.
 */
function renderResultText(ctx, state) {
  const y = 460;

  if (state.lastResult === 'correct') {
    ctx.fillStyle = '#00c853';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORRECT!', W / 2, y);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px monospace';
    ctx.fillText(`+${state.streak} points`, W / 2, y + 26);
  } else {
    ctx.fillStyle = '#e53935';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WRONG!', W / 2, y);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px monospace';
    ctx.fillText('game over', W / 2, y + 26);
  }
}
