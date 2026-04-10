/**
 * MEME MIND -- Renderer
 * Canvas rendering for the Mastermind board, pegs, palette, and feedback.
 */

import { MAX_GUESSES } from './mastermind.js';

/** Canvas logical dimensions */
export const W = 400;
export const H = 700;

/** Color hex map for peg colors */
const COLOR_HEX = {
  red:    '#e74c3c',
  blue:   '#3498db',
  green:  '#2ecc71',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
  pink:   '#ff69b4',
  cyan:   '#00bcd4',
};

/** Darker shade for peg borders */
const COLOR_DARK = {
  red:    '#c0392b',
  blue:   '#2980b9',
  green:  '#27ae60',
  yellow: '#d4ac0d',
  purple: '#8e44ad',
  orange: '#d35400',
  pink:   '#e05aa0',
  cyan:   '#0097a7',
};

// -- Layout Constants --

/** Board area */
const BOARD_TOP = 40;
const BOARD_BOTTOM = 560;
const BOARD_LEFT = 20;
const BOARD_RIGHT = 310;

/** Feedback area (right of board) */
const FEEDBACK_LEFT = 320;
const FEEDBACK_RIGHT = 390;

/** Color palette area */
const PALETTE_TOP = 580;
const PALETTE_HEIGHT = 50;

/** Submit / undo buttons */
const BUTTON_TOP = 640;
const BUTTON_HEIGHT = 36;

/** Peg sizing */
const PEG_RADIUS = 16;
const PEG_RADIUS_SMALL = 6; // feedback pegs

/**
 * Calculate row Y position (rows stack from bottom).
 * Row 0 = bottom-most row (first guess).
 *
 * @param {number} rowIndex - 0-based row index
 * @param {number} totalRows - Total number of rows (MAX_GUESSES)
 * @returns {number} Center Y of the row
 */
function rowY(rowIndex, totalRows = MAX_GUESSES) {
  const rowHeight = (BOARD_BOTTOM - BOARD_TOP) / totalRows;
  return BOARD_BOTTOM - rowHeight * rowIndex - rowHeight / 2;
}

/**
 * Calculate peg X position within a row.
 *
 * @param {number} pegIndex - 0-based peg index
 * @param {number} numPegs - Total pegs per row
 * @returns {number} Center X of the peg
 */
function pegX(pegIndex, numPegs) {
  const totalWidth = BOARD_RIGHT - BOARD_LEFT;
  const spacing = totalWidth / (numPegs + 1);
  return BOARD_LEFT + spacing * (pegIndex + 1);
}

/**
 * Get the layout info for a peg slot given row and slot index.
 *
 * @param {number} rowIndex
 * @param {number} slotIndex
 * @param {number} numPegs
 * @returns {{ x: number, y: number, radius: number }}
 */
export function getPegSlotPos(rowIndex, slotIndex, numPegs) {
  return {
    x: pegX(slotIndex, numPegs),
    y: rowY(rowIndex),
    radius: PEG_RADIUS,
  };
}

/**
 * Get the layout info for a color palette button.
 *
 * @param {number} colorIndex
 * @param {number} totalColors
 * @returns {{ x: number, y: number, radius: number }}
 */
export function getPalettePos(colorIndex, totalColors) {
  const paletteWidth = W - 40;
  const spacing = paletteWidth / totalColors;
  return {
    x: 20 + spacing * colorIndex + spacing / 2,
    y: PALETTE_TOP + PALETTE_HEIGHT / 2,
    radius: PEG_RADIUS + 2,
  };
}

/**
 * Get submit button bounds.
 *
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getSubmitBounds() {
  return {
    x: W / 2 - 80,
    y: BUTTON_TOP,
    width: 100,
    height: BUTTON_HEIGHT,
  };
}

/**
 * Get undo button bounds.
 *
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getUndoBounds() {
  return {
    x: W / 2 + 30,
    y: BUTTON_TOP,
    width: 70,
    height: BUTTON_HEIGHT,
  };
}

/**
 * Draw a colored peg on the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Center X
 * @param {number} y - Center Y
 * @param {number} radius
 * @param {string} color - Color name from palette
 * @param {boolean} [highlight=false] - Draw highlight ring
 */
function drawPeg(ctx, x, y, radius, color, highlight = false) {
  const hex = COLOR_HEX[color] || '#555';
  const dark = COLOR_DARK[color] || '#333';

  // Shadow
  ctx.beginPath();
  ctx.arc(x + 1, y + 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Main peg
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Shine
  ctx.beginPath();
  ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  // Highlight ring
  if (highlight) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#c8ff00';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

/**
 * Draw an empty peg slot.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {boolean} [active=false] - If true, draw with brighter border
 */
function drawEmptySlot(ctx, x, y, radius, active = false) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = active ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.strokeStyle = active ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash(active ? [] : [4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw feedback pegs (black and white small pegs).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} rowIndex
 * @param {{ black: number, white: number }} feedback
 * @param {number} numPegs
 */
function drawFeedback(ctx, rowIndex, feedback, numPegs) {
  const centerX = (FEEDBACK_LEFT + FEEDBACK_RIGHT) / 2;
  const centerY = rowY(rowIndex);
  const total = feedback.black + feedback.white;

  // Arrange feedback pegs in a small grid
  const cols = Math.min(numPegs, 3);
  const rows = Math.ceil(numPegs / cols);
  const spacing = PEG_RADIUS_SMALL * 2.8;

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= numPegs) break;
      const fx = centerX + (c - (cols - 1) / 2) * spacing;
      const fy = centerY + (r - (rows - 1) / 2) * spacing;

      ctx.beginPath();
      ctx.arc(fx, fy, PEG_RADIUS_SMALL, 0, Math.PI * 2);

      if (idx < feedback.black) {
        // Black peg: right color, right position
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (idx < total) {
        // White peg: right color, wrong position
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Empty feedback slot
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      idx++;
    }
  }
}

/**
 * Draw the secret code (revealed on game end).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} secret
 * @param {boolean} revealed
 */
function drawSecret(ctx, secret, revealed) {
  const numPegs = secret.length;
  const y = 22;

  ctx.save();
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('SECRET CODE', (BOARD_LEFT + BOARD_RIGHT) / 2, y - 7);
  ctx.restore();

  for (let i = 0; i < numPegs; i++) {
    const x = pegX(i, numPegs);
    if (revealed) {
      drawPeg(ctx, x, y + 8, PEG_RADIUS - 3, secret[i]);
    } else {
      // Hidden: draw question marks
      ctx.beginPath();
      ctx.arc(x, y + 8, PEG_RADIUS - 3, 0, Math.PI * 2);
      ctx.fillStyle = '#2a2a3e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText('?', x, y + 9);
      ctx.restore();
    }
  }
}

/**
 * Draw a rounded rectangle button.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 * @param {string} text
 * @param {boolean} enabled
 * @param {string} [bgColor]
 */
function drawButton(ctx, bounds, text, enabled, bgColor) {
  const r = 8;
  ctx.beginPath();
  ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, r);

  if (enabled) {
    ctx.fillStyle = bgColor || '#c8ff00';
    ctx.fill();
    ctx.save();
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0a0a12';
    ctx.fillText(text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText(text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    ctx.restore();
  }
}

/**
 * Draw the guess counter.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} guessCount
 * @param {number} maxGuesses
 */
function drawGuessCounter(ctx, guessCount, maxGuesses) {
  ctx.save();
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`${guessCount}/${maxGuesses}`, FEEDBACK_RIGHT, BOARD_BOTTOM + 16);
  ctx.restore();
}

/**
 * Main render function. Draws the complete game board.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from mastermind.js
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, W, H);

  // Draw board background
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.beginPath();
  ctx.roundRect(BOARD_LEFT - 5, BOARD_TOP - 5, BOARD_RIGHT - BOARD_LEFT + 10, BOARD_BOTTOM - BOARD_TOP + 10, 12);
  ctx.fill();

  // Draw feedback column background
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.beginPath();
  ctx.roundRect(FEEDBACK_LEFT - 5, BOARD_TOP - 5, FEEDBACK_RIGHT - FEEDBACK_LEFT + 10, BOARD_BOTTOM - BOARD_TOP + 10, 12);
  ctx.fill();

  // Draw secret code at top
  drawSecret(ctx, state.secret, state.ended);

  // Draw past guesses (from bottom up)
  for (let i = 0; i < state.guesses.length; i++) {
    const entry = state.guesses[i];
    for (let j = 0; j < entry.guess.length; j++) {
      const pos = getPegSlotPos(i, j, state.pegs);
      drawPeg(ctx, pos.x, pos.y, PEG_RADIUS, entry.guess[j]);
    }
    drawFeedback(ctx, i, entry.feedback, state.pegs);
  }

  // Draw current guess row (if game not ended)
  if (!state.ended) {
    const currentRow = state.guesses.length;

    // Row highlight
    const rowHeight = (BOARD_BOTTOM - BOARD_TOP) / MAX_GUESSES;
    const highlightY = rowY(currentRow) - rowHeight / 2;
    ctx.fillStyle = 'rgba(200,255,0,0.03)';
    ctx.fillRect(BOARD_LEFT - 5, highlightY, BOARD_RIGHT - BOARD_LEFT + 10, rowHeight);

    for (let j = 0; j < state.pegs; j++) {
      const pos = getPegSlotPos(currentRow, j, state.pegs);
      const color = state.currentGuess[j] || null;
      if (color) {
        drawPeg(ctx, pos.x, pos.y, PEG_RADIUS, color);
      } else {
        drawEmptySlot(ctx, pos.x, pos.y, PEG_RADIUS, true);
      }
    }

    // Draw empty future rows
    for (let i = currentRow + 1; i < MAX_GUESSES; i++) {
      for (let j = 0; j < state.pegs; j++) {
        const pos = getPegSlotPos(i, j, state.pegs);
        drawEmptySlot(ctx, pos.x, pos.y, PEG_RADIUS - 2, false);
      }
    }
  }

  // Draw guess counter
  drawGuessCounter(ctx, state.guessCount, state.maxGuesses);

  // Draw color palette
  if (!state.ended) {
    drawPalette(ctx, state);
  }

  // Draw buttons
  if (!state.ended) {
    const guessComplete = state.currentGuess.length === state.pegs &&
      state.currentGuess.every(c => c !== null);
    drawButton(ctx, getSubmitBounds(), 'SUBMIT', guessComplete);
    drawButton(ctx, getUndoBounds(), 'UNDO', state.currentGuess.length > 0, 'rgba(255,255,255,0.15)');
  }

  // Draw end-game message on canvas
  if (state.ended && !state._gameOverTriggered) {
    drawEndMessage(ctx, state);
  }
}

/**
 * Draw the color palette at the bottom.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawPalette(ctx, state) {
  // Palette label
  ctx.save();
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('TAP COLOR, THEN TAP SLOT', W / 2, PALETTE_TOP - 6);
  ctx.restore();

  for (let i = 0; i < state.colors.length; i++) {
    const pos = getPalettePos(i, state.colors.length);
    const isSelected = state.selectedColor === state.colors[i];
    drawPeg(ctx, pos.x, pos.y, pos.radius, state.colors[i], isSelected);
  }
}

/**
 * Draw the end-game message overlay on canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawEndMessage(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,10,18,0.6)';
  ctx.fillRect(0, H / 2 - 40, W, 80);

  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (state.won) {
    ctx.fillStyle = '#c8ff00';
    ctx.fillText('CODE CRACKED', W / 2, H / 2);
  } else {
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('BRAIN ROTTED', W / 2, H / 2);
  }
  ctx.restore();
}
