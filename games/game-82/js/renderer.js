/**
 * MEME SUDOKU -- Canvas Renderer
 * All drawing logic for the Sudoku grid, number pad, HUD, and selection.
 */

const GRID_SIZE = 9;
const CELL_SIZE = 36;
const GRID_PX = CELL_SIZE * GRID_SIZE; // 324
const THIN_LINE = 1;
const THICK_LINE = 3;

// Layout constants (for 400x700 canvas)
const GRID_OFFSET_X = (400 - GRID_PX) / 2; // 38
const GRID_OFFSET_Y = 60;

// Number pad
const PAD_Y = GRID_OFFSET_Y + GRID_PX + 30;
const PAD_CELL = 38;
const PAD_GAP = 3;
const PAD_TOTAL_W = PAD_CELL * 9 + PAD_GAP * 8;
const PAD_OFFSET_X = (400 - PAD_TOTAL_W) / 2;

// Action buttons
const ACTION_Y = PAD_Y + PAD_CELL + 20;
const ACTION_BTN_W = 90;
const ACTION_BTN_H = 34;
const ERASE_X = 400 / 2 - ACTION_BTN_W - 10;
const HINT_X = 400 / 2 + 10;

// Colors
const BG_COLOR = '#0a0a0f';
const GRID_LINE_COLOR = '#333';
const GRID_THICK_COLOR = '#888';
const GIVEN_COLOR = '#ffffff';
const PLAYER_COLOR = '#00e5ff';
const ERROR_COLOR = '#ff3366';
const SELECTED_BG = 'rgba(0, 229, 255, 0.12)';
const HIGHLIGHT_BG = 'rgba(0, 229, 255, 0.06)';
const HINT_COLOR = '#7c4dff';
const PAD_BG = '#1a1a2e';
const PAD_TEXT = '#ffffff';
const PAD_ACTIVE_BG = '#00e5ff';
const PAD_ACTIVE_TEXT = '#000000';
const HUD_COLOR = '#aaa';

/**
 * Render the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state - Game state
 */
export function render(ctx, state) {
  const { grid, solution, given, selectedRow, selectedCol, errors, elapsed, errorCount, hintsUsed, completed } = state;

  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, 400, 700);

  // HUD (timer + errors)
  drawHUD(ctx, elapsed, errorCount, hintsUsed);

  // Grid
  drawGrid(ctx, grid, solution, given, selectedRow, selectedCol, errors, completed);

  // Number pad
  drawNumberPad(ctx, state.selectedNumber);

  // Action buttons
  drawActionButtons(ctx);
}

/**
 * Draw the HUD: timer, error count, hints used.
 */
function drawHUD(ctx, elapsed, errorCount, hintsUsed) {
  ctx.save();
  ctx.font = '600 16px monospace';
  ctx.textBaseline = 'middle';

  // Timer (left)
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  ctx.fillStyle = HUD_COLOR;
  ctx.textAlign = 'left';
  ctx.fillText(timeStr, GRID_OFFSET_X, 35);

  // Errors (center)
  ctx.textAlign = 'center';
  ctx.fillStyle = errorCount > 0 ? ERROR_COLOR : HUD_COLOR;
  ctx.fillText(`${errorCount} error${errorCount !== 1 ? 's' : ''}`, 200, 35);

  // Hints (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = hintsUsed > 0 ? HINT_COLOR : HUD_COLOR;
  ctx.fillText(`${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}`, 400 - GRID_OFFSET_X, 35);

  ctx.restore();
}

/**
 * Draw the 9x9 Sudoku grid with numbers and selection highlights.
 */
function drawGrid(ctx, grid, solution, given, selR, selC, errors, completed) {
  ctx.save();
  ctx.translate(GRID_OFFSET_X, GRID_OFFSET_Y);

  // Highlight selected row, column, and 3x3 box
  if (selR >= 0 && selC >= 0) {
    ctx.fillStyle = HIGHLIGHT_BG;
    // Row
    ctx.fillRect(0, selR * CELL_SIZE, GRID_PX, CELL_SIZE);
    // Column
    ctx.fillRect(selC * CELL_SIZE, 0, CELL_SIZE, GRID_PX);
    // 3x3 box
    const boxR = Math.floor(selR / 3) * 3;
    const boxC = Math.floor(selC / 3) * 3;
    ctx.fillRect(boxC * CELL_SIZE, boxR * CELL_SIZE, CELL_SIZE * 3, CELL_SIZE * 3);

    // Selected cell
    ctx.fillStyle = SELECTED_BG;
    ctx.fillRect(selC * CELL_SIZE, selR * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Selection border
    ctx.strokeStyle = PLAYER_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(selC * CELL_SIZE + 1, selR * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }

  // Grid lines (thin)
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = THIN_LINE;
  for (let i = 0; i <= 9; i++) {
    if (i % 3 === 0) continue; // drawn separately
    const pos = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, GRID_PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(GRID_PX, pos);
    ctx.stroke();
  }

  // Grid lines (thick for 3x3 borders)
  ctx.strokeStyle = GRID_THICK_COLOR;
  ctx.lineWidth = THICK_LINE;
  for (let i = 0; i <= 3; i++) {
    const pos = i * CELL_SIZE * 3;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, GRID_PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(GRID_PX, pos);
    ctx.stroke();
  }

  // Numbers
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val === 0) continue;

      const cx = c * CELL_SIZE + CELL_SIZE / 2;
      const cy = r * CELL_SIZE + CELL_SIZE / 2;

      if (given[r][c]) {
        // Given clue
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = GIVEN_COLOR;
      } else {
        // Player-placed number
        const isError = errors[r] && errors[r][c];
        ctx.font = '600 20px monospace';
        ctx.fillStyle = isError ? ERROR_COLOR : PLAYER_COLOR;
      }

      ctx.fillText(String(val), cx, cy);
    }
  }

  // Completion flash effect
  if (completed) {
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fillRect(0, 0, GRID_PX, GRID_PX);
  }

  ctx.restore();
}

/**
 * Draw the 1-9 number pad below the grid.
 */
function drawNumberPad(ctx, selectedNumber) {
  ctx.save();

  for (let i = 0; i < 9; i++) {
    const num = i + 1;
    const x = PAD_OFFSET_X + i * (PAD_CELL + PAD_GAP);
    const y = PAD_Y;

    const isActive = selectedNumber === num;

    // Button background
    ctx.fillStyle = isActive ? PAD_ACTIVE_BG : PAD_BG;
    ctx.beginPath();
    roundRect(ctx, x, y, PAD_CELL, PAD_CELL, 6);
    ctx.fill();

    // Number text
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? PAD_ACTIVE_TEXT : PAD_TEXT;
    ctx.fillText(String(num), x + PAD_CELL / 2, y + PAD_CELL / 2);
  }

  ctx.restore();
}

/**
 * Draw erase and hint buttons.
 */
function drawActionButtons(ctx) {
  ctx.save();

  // Erase button
  ctx.fillStyle = PAD_BG;
  ctx.beginPath();
  roundRect(ctx, ERASE_X, ACTION_Y, ACTION_BTN_W, ACTION_BTN_H, 6);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, ERASE_X, ACTION_Y, ACTION_BTN_W, ACTION_BTN_H, 6);
  ctx.stroke();

  ctx.font = '600 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff6b6b';
  ctx.fillText('ERASE', ERASE_X + ACTION_BTN_W / 2, ACTION_Y + ACTION_BTN_H / 2);

  // Hint button
  ctx.fillStyle = PAD_BG;
  ctx.beginPath();
  roundRect(ctx, HINT_X, ACTION_Y, ACTION_BTN_W, ACTION_BTN_H, 6);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, HINT_X, ACTION_Y, ACTION_BTN_W, ACTION_BTN_H, 6);
  ctx.stroke();

  ctx.fillStyle = HINT_COLOR;
  ctx.fillText('HINT', HINT_X + ACTION_BTN_W / 2, ACTION_Y + ACTION_BTN_H / 2);

  ctx.restore();
}

/**
 * Helper: draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
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

// ---- Hit-testing exports ----

/**
 * Convert canvas tap coordinates to a grid cell.
 * @param {number} x - Logical canvas x
 * @param {number} y - Logical canvas y
 * @returns {{ row: number, col: number } | null}
 */
export function hitTestGrid(x, y) {
  const gx = x - GRID_OFFSET_X;
  const gy = y - GRID_OFFSET_Y;
  if (gx < 0 || gy < 0 || gx >= GRID_PX || gy >= GRID_PX) return null;
  return {
    row: Math.floor(gy / CELL_SIZE),
    col: Math.floor(gx / CELL_SIZE),
  };
}

/**
 * Convert canvas tap coordinates to a number pad digit (1-9).
 * @param {number} x
 * @param {number} y
 * @returns {number | null} 1-9 or null
 */
export function hitTestNumberPad(x, y) {
  if (y < PAD_Y || y > PAD_Y + PAD_CELL) return null;
  for (let i = 0; i < 9; i++) {
    const bx = PAD_OFFSET_X + i * (PAD_CELL + PAD_GAP);
    if (x >= bx && x <= bx + PAD_CELL) {
      return i + 1;
    }
  }
  return null;
}

/**
 * Check if tap hit the erase button.
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function hitTestErase(x, y) {
  return x >= ERASE_X && x <= ERASE_X + ACTION_BTN_W &&
         y >= ACTION_Y && y <= ACTION_Y + ACTION_BTN_H;
}

/**
 * Check if tap hit the hint button.
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function hitTestHint(x, y) {
  return x >= HINT_X && x <= HINT_X + ACTION_BTN_W &&
         y >= ACTION_Y && y <= ACTION_Y + ACTION_BTN_H;
}
