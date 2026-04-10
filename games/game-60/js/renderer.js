/**
 * Brainrotle -- Canvas Renderer
 * Draws the letter grid, on-screen keyboard, and animations.
 */

// ---- Constants ----

const COLS = 5;
const ROWS = 6;

// Grid layout
const GRID_TOP = 20;
const TILE_SIZE = 52;
const TILE_GAP = 6;
const GRID_WIDTH = COLS * TILE_SIZE + (COLS - 1) * TILE_GAP;

// Keyboard layout
const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];
const KB_TOP = 380;
const KB_KEY_HEIGHT = 42;
const KB_KEY_GAP = 4;
const KB_ROW_GAP = 4;

// Colors
const COLORS = {
  bg: '#121213',
  tileBorder: '#3a3a3c',
  tileFilled: '#565758',
  correct: '#538d4e',
  present: '#b59f3b',
  absent: '#3a3a3c',
  keyDefault: '#818384',
  textWhite: '#ffffff',
  textDark: '#121213',
};

/**
 * Tile state enum.
 * @readonly
 * @enum {string}
 */
export const TileState = {
  EMPTY: 'empty',
  FILLED: 'filled',
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
};

// ---- Key Layout Computation ----

/** @type {Array<Array<{letter: string, x: number, y: number, w: number, h: number}>>} */
let keyLayout = [];

/**
 * Precompute keyboard key positions.
 *
 * @param {number} logicalWidth
 */
function buildKeyLayout(logicalWidth) {
  keyLayout = [];
  const totalW = logicalWidth - 16; // 8px margin each side

  for (let r = 0; r < KB_ROWS.length; r++) {
    const row = KB_ROWS[r];
    const rowY = KB_TOP + r * (KB_KEY_HEIGHT + KB_ROW_GAP);
    const keyCount = row.length;

    // Wide keys for ENT and DEL
    const wideCount = row.filter(k => k === 'ENT' || k === 'DEL').length;
    const normalCount = keyCount - wideCount;
    const wideKeyW = 48;
    const availableW = totalW - wideCount * wideKeyW - (keyCount - 1) * KB_KEY_GAP;
    const normalKeyW = availableW / normalCount;

    const rowTotalW = normalCount * normalKeyW + wideCount * wideKeyW + (keyCount - 1) * KB_KEY_GAP;
    let x = (logicalWidth - rowTotalW) / 2;

    const rowKeys = [];
    for (const letter of row) {
      const isWide = letter === 'ENT' || letter === 'DEL';
      const w = isWide ? wideKeyW : normalKeyW;
      rowKeys.push({ letter, x, y: rowY, w, h: KB_KEY_HEIGHT });
      x += w + KB_KEY_GAP;
    }
    keyLayout.push(rowKeys);
  }
}

// Build on first import (will be rebuilt if needed)
buildKeyLayout(400);

/**
 * Hit-test the on-screen keyboard.
 *
 * @param {{ x: number, y: number }} pos - Logical coordinates
 * @returns {string|null} Key letter/action or null if no hit
 */
export function hitTestKeyboard(pos) {
  for (const row of keyLayout) {
    for (const key of row) {
      if (
        pos.x >= key.x && pos.x <= key.x + key.w &&
        pos.y >= key.y && pos.y <= key.y + key.h
      ) {
        if (key.letter === 'ENT') return 'ENTER';
        if (key.letter === 'DEL') return 'BACKSPACE';
        return key.letter;
      }
    }
  }
  return null;
}

/**
 * Get the color for a tile state.
 *
 * @param {string} state - TileState value
 * @returns {string} CSS color string
 */
function tileColor(state) {
  switch (state) {
    case TileState.CORRECT: return COLORS.correct;
    case TileState.PRESENT: return COLORS.present;
    case TileState.ABSENT: return COLORS.absent;
    case TileState.FILLED: return COLORS.tileFilled;
    default: return 'transparent';
  }
}

/**
 * Get the border color for a tile state.
 *
 * @param {string} state
 * @returns {string}
 */
function tileBorderColor(state) {
  switch (state) {
    case TileState.CORRECT: return COLORS.correct;
    case TileState.PRESENT: return COLORS.present;
    case TileState.ABSENT: return COLORS.absent;
    case TileState.FILLED: return COLORS.tileFilled;
    default: return COLORS.tileBorder;
  }
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state
 * @param {string[][]} state.grid - 6x5 grid of letters
 * @param {string[][]} state.gridStates - 6x5 grid of TileState values
 * @param {number} state.currentRow - Current guess row (0-5)
 * @param {number} state.currentCol - Current column within guess
 * @param {Object<string, string>} state.keyboardStates - Letter -> TileState for keyboard coloring
 * @param {Object} state.animations - Active animations
 * @param {number} state.logicalWidth
 * @param {number} state.logicalHeight
 * @param {string} state.message - Toast message to display
 * @param {number} state.messageTimer - Remaining time for message display
 */
export function render(ctx, state) {
  const { logicalWidth, logicalHeight } = state;

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Draw grid
  drawGrid(ctx, state);

  // Draw keyboard
  drawKeyboard(ctx, state);

  // Draw toast message
  if (state.messageTimer > 0 && state.message) {
    drawToast(ctx, state);
  }
}

/**
 * Draw the 6x5 letter grid.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawGrid(ctx, state) {
  const gridLeft = (state.logicalWidth - GRID_WIDTH) / 2;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = gridLeft + col * (TILE_SIZE + TILE_GAP);
      const y = GRID_TOP + row * (TILE_SIZE + TILE_GAP);
      const letter = state.grid[row][col];
      const tileState = state.gridStates[row][col];

      // Check for flip animation
      const flipAnim = state.animations.flips?.[row]?.[col];
      // Check for shake animation
      const shakeAnim = state.animations.shake;
      // Check for bounce animation (win)
      const bounceAnim = state.animations.bounce?.[col];

      let offsetX = 0;
      let offsetY = 0;
      let scaleY = 1;
      let drawState = tileState;
      let drawLetter = letter;

      // Shake: offset entire row horizontally
      if (shakeAnim && shakeAnim.row === row && shakeAnim.timer > 0) {
        offsetX = Math.sin(shakeAnim.timer * 0.8) * 4;
      }

      // Flip animation
      if (flipAnim && flipAnim.timer > 0) {
        const progress = 1 - (flipAnim.timer / flipAnim.duration);
        if (progress < 0.5) {
          // First half: shrink Y, show old state
          scaleY = 1 - progress * 2;
          drawState = TileState.FILLED;
          drawLetter = letter;
        } else {
          // Second half: grow Y, show new state
          scaleY = (progress - 0.5) * 2;
          drawState = flipAnim.targetState;
          drawLetter = letter;
        }
      }

      // Bounce animation (after win)
      if (bounceAnim && bounceAnim.timer > 0 && row === state.currentRow - 1) {
        const progress = 1 - (bounceAnim.timer / bounceAnim.duration);
        // Bounce up then down
        offsetY = -Math.sin(progress * Math.PI) * 12;
      }

      // Draw tile
      const tileX = x + offsetX;
      const tileY = y + offsetY;

      ctx.save();
      ctx.translate(tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2);
      ctx.scale(1, scaleY);
      ctx.translate(-(tileX + TILE_SIZE / 2), -(tileY + TILE_SIZE / 2));

      // Fill
      const bgColor = tileColor(drawState);
      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        roundRect(ctx, tileX, tileY, TILE_SIZE, TILE_SIZE, 4);
        ctx.fill();
      }

      // Border
      ctx.strokeStyle = tileBorderColor(drawState);
      ctx.lineWidth = 2;
      roundRect(ctx, tileX, tileY, TILE_SIZE, TILE_SIZE, 4);
      ctx.stroke();

      // Letter
      if (drawLetter && scaleY > 0.1) {
        ctx.fillStyle = COLORS.textWhite;
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(drawLetter, tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2 + 1);
      }

      ctx.restore();
    }
  }
}

/**
 * Draw the on-screen keyboard.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawKeyboard(ctx, state) {
  for (const row of keyLayout) {
    for (const key of row) {
      const letterForState = key.letter === 'ENT' || key.letter === 'DEL' ? null : key.letter;
      const keyState = letterForState ? state.keyboardStates[letterForState] : null;

      // Key background
      let bgColor;
      switch (keyState) {
        case TileState.CORRECT: bgColor = COLORS.correct; break;
        case TileState.PRESENT: bgColor = COLORS.present; break;
        case TileState.ABSENT: bgColor = COLORS.absent; break;
        default: bgColor = COLORS.keyDefault; break;
      }

      ctx.fillStyle = bgColor;
      roundRect(ctx, key.x, key.y, key.w, key.h, 4);
      ctx.fill();

      // Key label
      ctx.fillStyle = COLORS.textWhite;
      const isSpecial = key.letter === 'ENT' || key.letter === 'DEL';
      ctx.font = isSpecial ? 'bold 11px Arial, sans-serif' : 'bold 15px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let label = key.letter;
      if (key.letter === 'DEL') label = '\u232B'; // backspace symbol
      if (key.letter === 'ENT') label = 'ENTER';

      ctx.fillText(label, key.x + key.w / 2, key.y + key.h / 2 + 1);
    }
  }
}

/**
 * Draw a toast message at the top of the screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawToast(ctx, state) {
  const text = state.message;
  ctx.font = 'bold 14px Arial, sans-serif';
  const metrics = ctx.measureText(text);
  const padding = 14;
  const boxW = metrics.width + padding * 2;
  const boxH = 32;
  const boxX = (state.logicalWidth - boxW) / 2;
  const boxY = GRID_TOP + ROWS * (TILE_SIZE + TILE_GAP) + 8;

  // Fade out in last 0.3s
  const alpha = Math.min(1, state.messageTimer / 0.3);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, boxX, boxY, boxW, boxH, 6);
  ctx.fill();

  ctx.fillStyle = COLORS.textDark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, state.logicalWidth / 2, boxY + boxH / 2);
  ctx.globalAlpha = 1;
}

/**
 * Draw a rounded rectangle path.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
