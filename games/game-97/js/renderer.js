/**
 * MEME BLACKJACK -- Renderer
 * All canvas drawing: cards, chips, buttons, HUD.
 */

import { getHandValue } from './blackjack.js';

const W = 400;
const H = 700;

// Colors
const FELT_GREEN = '#1a6b1a';
const FELT_DARK = '#0f4f0f';
const CARD_WHITE = '#fff';
const CARD_BACK = '#2244aa';
const CARD_BACK_PATTERN = '#1a3388';
const RED = '#e53935';
const BLACK = '#222';
const GOLD = '#ffd700';
const BTN_GREEN = '#00c853';
const BTN_BLUE = '#2979ff';
const BTN_RED = '#ff5252';
const BTN_DISABLED = '#555';
const CHIP_COLORS = ['#e53935', '#2979ff', '#00c853', '#ffd700'];

// Card dimensions
const CARD_W = 58;
const CARD_H = 82;
const CARD_R = 6;
const CARD_GAP = 8;

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
  clubs: BLACK,
  spades: BLACK,
};

/**
 * Draw a rounded rectangle.
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
function drawCardFace(ctx, x, y, card) {
  // Card body
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_R);
  ctx.fillStyle = CARD_WHITE;
  ctx.fill();
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.stroke();

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  // Rank top-left
  ctx.fillStyle = color;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, x + 5, y + 4);

  // Suit top-left below rank
  ctx.font = '13px serif';
  ctx.fillText(symbol, x + 6, y + 21);

  // Large center suit
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, x + CARD_W / 2, y + CARD_H / 2);

  // Rank bottom-right (inverted)
  ctx.fillStyle = color;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(card.rank, x + CARD_W - 5, y + CARD_H - 4);
}

/**
 * Draw a face-down card.
 */
function drawCardBack(ctx, x, y) {
  // Card body
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_R);
  ctx.fillStyle = CARD_BACK;
  ctx.fill();
  ctx.strokeStyle = '#1a3388';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pattern - diamond crosshatch
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x + 4, y + 4, CARD_W - 8, CARD_H - 8, CARD_R - 2);
  ctx.clip();

  ctx.strokeStyle = CARD_BACK_PATTERN;
  ctx.lineWidth = 1;
  for (let i = -CARD_H; i < CARD_W + CARD_H; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + CARD_H, y + CARD_H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + i, y + CARD_H);
    ctx.lineTo(x + i + CARD_H, y);
    ctx.stroke();
  }

  // Center diamond
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  const cx = x + CARD_W / 2;
  const cy = y + CARD_H / 2;
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx + 10, cy);
  ctx.lineTo(cx, cy + 15);
  ctx.lineTo(cx - 10, cy);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw a hand of cards centered at a given y position.
 */
function drawHand(ctx, cards, centerY, showValue, hideHole) {
  if (cards.length === 0) return;

  const totalW = cards.length * CARD_W + (cards.length - 1) * CARD_GAP;
  let startX = (W - totalW) / 2;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cx = startX + i * (CARD_W + CARD_GAP);
    const cy = centerY - CARD_H / 2;

    if (card.faceUp) {
      drawCardFace(ctx, cx, cy, card);
    } else {
      drawCardBack(ctx, cx, cy);
    }
  }

  // Show hand value
  if (showValue) {
    const visibleCards = cards.filter(c => c.faceUp);
    if (visibleCards.length > 0) {
      const value = getHandValue(visibleCards);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelY = centerY + CARD_H / 2 + 18;
      ctx.fillText(String(value), W / 2, labelY);
    }
  }
}

/**
 * Draw a button. Returns bounds for hit testing.
 */
function drawButton(ctx, x, y, w, h, label, color, enabled = true) {
  const fill = enabled ? color : BTN_DISABLED;

  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = fill;
  ctx.fill();

  // Slight bevel
  if (enabled) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, x, y, w, h / 2, 8);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();

  ctx.fillStyle = enabled ? '#fff' : '#999';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2);

  return { x, y, width: w, height: h };
}

/**
 * Draw chip icon.
 */
function drawChip(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Main render function. Returns button bounds for input handling.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 * @returns {Object} bounds - Map of button name to {x, y, width, height}
 */
export function render(ctx, state) {
  const bounds = {};

  // Background - felt table
  ctx.fillStyle = FELT_GREEN;
  ctx.fillRect(0, 0, W, H);

  // Felt texture lines
  ctx.strokeStyle = FELT_DARK;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < H; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(W, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Decorative table edge
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  roundRect(ctx, 8, 8, W - 16, H - 16, 16);
  ctx.stroke();

  // Title / Dealer label
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('DEALER', W / 2, 20);

  // Dealer hand
  drawHand(ctx, state.dealerHand, 100, true, false);

  // Player label
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR HAND', W / 2, 235);

  // Player hand
  drawHand(ctx, state.playerHand, 300, true, false);

  // Chips display
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawChip(ctx, W / 2 - 60, 420, 12, '#e53935');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText(`${state.chips}`, W / 2 - 42, 420);

  // Current bet display
  if (state.currentBet > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BET: ${state.currentBet}`, W / 2, 450);
  }

  // Phase-specific rendering
  if (state.phase === 'betting') {
    renderBettingPhase(ctx, state, bounds);
  } else if (state.phase === 'playing') {
    renderPlayingPhase(ctx, state, bounds);
  } else if (state.phase === 'result') {
    renderResultPhase(ctx, state, bounds);
  }

  return bounds;
}

/**
 * Render betting phase buttons.
 */
function renderBettingPhase(ctx, state, bounds) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLACE YOUR BET', W / 2, 490);

  const btnW = 80;
  const btnH = 44;
  const gap = 10;
  const bets = state.betOptions;
  const totalW = bets.length * btnW + (bets.length - 1) * gap;
  const startX = (W - totalW) / 2;
  const btnY = 520;

  for (let i = 0; i < bets.length; i++) {
    const bet = bets[i];
    const bx = startX + i * (btnW + gap);
    const enabled = bet <= state.chips;
    const color = CHIP_COLORS[i % CHIP_COLORS.length];
    const b = drawButton(ctx, bx, btnY, btnW, btnH, `${bet}`, color, enabled);
    bounds[`bet_${bet}`] = b;
  }

  // Keyboard hint
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('keys: 1/2/3/4 to bet', W / 2, 585);
}

/**
 * Render playing phase buttons.
 */
function renderPlayingPhase(ctx, state, bounds) {
  const btnW = 100;
  const btnH = 48;
  const gap = 12;

  const canDouble = state.canDoubleDown && state.chips >= state.currentBet;
  const numBtns = 3;
  const totalW = numBtns * btnW + (numBtns - 1) * gap;
  const startX = (W - totalW) / 2;
  const btnY = 520;

  bounds.hit = drawButton(ctx, startX, btnY, btnW, btnH, 'HIT (H)', BTN_GREEN, true);
  bounds.stand = drawButton(ctx, startX + btnW + gap, btnY, btnW, btnH, 'STAND (S)', BTN_BLUE, true);
  bounds.double = drawButton(ctx, startX + 2 * (btnW + gap), btnY, btnW, btnH, 'DBL (D)', BTN_RED, canDouble);

  // Keyboard hint
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('H = hit, S = stand, D = double', W / 2, 585);
}

/**
 * Render result phase.
 */
function renderResultPhase(ctx, state, bounds) {
  // Result banner
  let bannerColor;
  switch (state.resultType) {
    case 'win': bannerColor = '#00c853'; break;
    case 'blackjack': bannerColor = GOLD; break;
    case 'lose': bannerColor = '#e53935'; break;
    case 'push': bannerColor = '#ff9800'; break;
    default: bannerColor = '#fff';
  }

  // Banner background
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(20, 190, W - 40, 50);

  ctx.fillStyle = bannerColor;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.resultMessage, W / 2, 215);

  if (state.gameOver) {
    // Show game over message
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OUT OF CHIPS - GAME OVER', W / 2, 490);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px monospace';
    ctx.fillText(`peak chips: ${state.peakChips}`, W / 2, 515);
  } else {
    // Next hand button
    const btnW = 160;
    const btnH = 48;
    const bx = (W - btnW) / 2;
    const by = 520;
    bounds.nextHand = drawButton(ctx, bx, by, btnW, btnH, 'NEXT HAND', BTN_GREEN, true);

    // Keyboard hint
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('press SPACE for next hand', W / 2, 585);
  }
}

export { W, H };
