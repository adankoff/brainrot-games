/**
 * MEME SOLITAIRE -- Renderer
 * Draws all game elements on the canvas: cards, piles, HUD.
 */

// Card dimensions
export const CARD_W = 48;
export const CARD_H = 68;
export const CARD_GAP = 6;
export const STACK_OFFSET_Y = 18;
export const CARD_RADIUS = 4;

// Layout constants
export const MARGIN_X = 8;
export const MARGIN_TOP = 40;
export const COL_SPACING = (400 - MARGIN_X * 2) / 7; // ~54.8px per column
export const TABLEAU_TOP = MARGIN_TOP + CARD_H + 16;

// Stock/waste position
export const STOCK_X = MARGIN_X + (COL_SPACING - CARD_W) / 2;
export const STOCK_Y = MARGIN_TOP;
export const WASTE_X = STOCK_X + COL_SPACING;
export const WASTE_Y = MARGIN_TOP;

// Foundation positions (right 4 columns)
export function foundationX(idx) {
  return MARGIN_X + (3 + idx) * COL_SPACING + (COL_SPACING - CARD_W) / 2;
}
export const FOUNDATION_Y = MARGIN_TOP;

// Tableau column X
export function tableauX(col) {
  return MARGIN_X + col * COL_SPACING + (COL_SPACING - CARD_W) / 2;
}

// Suit symbols and colors
const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const SUIT_COLORS = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
};

/**
 * Draw a rounded rectangle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
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
 * Draw a face-down card (blue back with pattern).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 */
export function drawCardBack(ctx, x, y) {
  ctx.save();
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlurX = 2;
  ctx.shadowOffsetY = 1;

  // Card body
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.fillStyle = '#2563eb';
  ctx.fill();
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Inner pattern
  ctx.shadowColor = 'transparent';
  roundRect(ctx, x + 3, y + 3, CARD_W - 6, CARD_H - 6, 2);
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Cross pattern
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < CARD_W; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + 3);
    ctx.lineTo(x + i, y + CARD_H - 3);
    ctx.stroke();
  }
  for (let i = 0; i < CARD_H; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + 3, y + i);
    ctx.lineTo(x + CARD_W - 3, y + i);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a face-up card.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {{suit: string, rank: string}} card
 * @param {boolean} [highlighted=false]
 */
export function drawCardFace(ctx, x, y, card, highlighted = false) {
  ctx.save();
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlurX = 2;
  ctx.shadowOffsetY = 1;

  // Card body
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.fillStyle = highlighted ? '#fffde7' : '#ffffff';
  ctx.fill();
  ctx.strokeStyle = highlighted ? '#f59e0b' : '#d1d5db';
  ctx.lineWidth = highlighted ? 1.5 : 0.8;
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  // Rank (top-left)
  ctx.font = 'bold 11px "Space Grotesk", monospace, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, x + 3, y + 3);

  // Small suit symbol under rank
  ctx.font = '9px sans-serif';
  ctx.fillText(symbol, x + 4, y + 15);

  // Large suit symbol (center)
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, x + CARD_W / 2, y + CARD_H / 2 + 2);

  // Bottom-right rank (inverted)
  ctx.save();
  ctx.translate(x + CARD_W - 3, y + CARD_H - 3);
  ctx.rotate(Math.PI);
  ctx.font = 'bold 11px "Space Grotesk", monospace, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, 0, 0);
  ctx.restore();

  ctx.restore();
}

/**
 * Draw an empty pile placeholder.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {string} [label='']
 */
export function drawEmptyPile(ctx, x, y, label = '') {
  ctx.save();
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  if (label) {
    ctx.font = '10px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + CARD_W / 2, y + CARD_H / 2);
  }

  ctx.restore();
}

/**
 * Draw the stock pile icon (recycling arrows when empty).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} stockCount
 */
export function drawStockPile(ctx, stockCount) {
  if (stockCount > 0) {
    drawCardBack(ctx, STOCK_X, STOCK_Y);
    // Count badge
    ctx.save();
    ctx.font = '8px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(stockCount), STOCK_X + CARD_W / 2, STOCK_Y + CARD_H + 10);
    ctx.restore();
  } else {
    // Empty stock — draw recycle icon
    drawEmptyPile(ctx, STOCK_X, STOCK_Y);
    ctx.save();
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u21BB', STOCK_X + CARD_W / 2, STOCK_Y + CARD_H / 2);
    ctx.restore();
  }
}

/**
 * Draw the waste pile (top card only).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} waste
 * @param {boolean} highlighted
 */
export function drawWastePile(ctx, waste, highlighted) {
  if (waste.length === 0) {
    drawEmptyPile(ctx, WASTE_X, WASTE_Y);
  } else {
    const card = waste[waste.length - 1];
    drawCardFace(ctx, WASTE_X, WASTE_Y, card, highlighted);
  }
}

/**
 * Draw the four foundation piles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Array>} foundations
 */
export function drawFoundations(ctx, foundations) {
  const suitLabels = ['\u2665', '\u2666', '\u2663', '\u2660'];
  for (let f = 0; f < 4; f++) {
    const x = foundationX(f);
    const y = FOUNDATION_Y;
    if (foundations[f].length === 0) {
      drawEmptyPile(ctx, x, y, suitLabels[f]);
    } else {
      const top = foundations[f][foundations[f].length - 1];
      drawCardFace(ctx, x, y, top);
    }
  }
}

/**
 * Draw the seven tableau columns.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Array>} tableau
 * @param {{col: number, cardIdx: number}|null} selection
 */
export function drawTableau(ctx, tableau, selection) {
  for (let col = 0; col < 7; col++) {
    const x = tableauX(col);
    const pile = tableau[col];

    if (pile.length === 0) {
      drawEmptyPile(ctx, x, TABLEAU_TOP, 'K');
      continue;
    }

    for (let i = 0; i < pile.length; i++) {
      const y = TABLEAU_TOP + i * STACK_OFFSET_Y;
      const card = pile[i];
      const isSelected = selection && selection.col === col && i >= selection.cardIdx;

      if (card.faceUp) {
        drawCardFace(ctx, x, y, card, isSelected);
      } else {
        drawCardBack(ctx, x, y);
      }
    }
  }
}

/**
 * Draw the HUD (score, moves, time).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} moves
 * @param {number} elapsed
 * @param {number} canvasWidth
 */
export function drawHUD(ctx, score, moves, elapsed, canvasWidth) {
  ctx.save();
  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.textBaseline = 'top';

  // Score
  ctx.fillStyle = '#c8ff00';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 8, 6);

  // Moves
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.textAlign = 'center';
  ctx.fillText(`MOVES: ${moves}`, canvasWidth / 2, 6);

  // Time
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  ctx.textAlign = 'right';
  ctx.fillText(timeStr, canvasWidth - 8, 6);

  // Thin separator
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(canvasWidth, 22);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw the "new deal" button area at bottom.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 */
export function drawNewDealButton(ctx, canvasWidth, canvasHeight) {
  ctx.save();
  ctx.font = '10px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('tap here for new deal', canvasWidth / 2, canvasHeight - 6);
  ctx.restore();
}

/**
 * Draw the win celebration overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} alpha - animation alpha 0-1
 */
export function drawWinOverlay(ctx, canvasWidth, canvasHeight, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.6;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.globalAlpha = alpha;
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#c8ff00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOU WIN!', canvasWidth / 2, canvasHeight / 2 - 30);

  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('absolute sigma move', canvasWidth / 2, canvasHeight / 2 + 10);

  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('tap to continue', canvasWidth / 2, canvasHeight / 2 + 45);

  ctx.restore();
}
