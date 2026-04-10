/**
 * MEME KAKURO -- Renderer
 * Draws the Kakuro grid, clue cells, fill cells, number pad, and HUD.
 */

import { isFillCell, isClueCell, isBlackCell } from './kakuro.js';

const COLORS = {
  bg: '#1a1a2e',
  gridBg: '#16213e',
  blackCell: '#0f0f23',
  clueCell: '#1a1a3e',
  clueDiag: '#2a2a5e',
  fillCell: '#e8e8f0',
  fillCellSelected: '#c8ff00',
  fillCellError: '#ff4444',
  fillCellCorrect: '#44ff88',
  textDark: '#1a1a2e',
  textLight: '#f0f0f0',
  textClue: '#ffcc00',
  textMuted: '#888899',
  padBg: '#222244',
  padBtn: '#333366',
  padBtnActive: '#c8ff00',
  padBtnText: '#f0f0f0',
  padBtnActiveText: '#1a1a2e',
  accent: '#c8ff00',
  hudBg: 'rgba(15, 15, 35, 0.85)',
};

/**
 * @typedef {Object} RenderState
 * @property {Object} puzzle
 * @property {Array<Array<number>>} playerGrid
 * @property {number} selectedRow
 * @property {number} selectedCol
 * @property {Set<string>} conflicts
 * @property {number} timer
 * @property {number} errors
 * @property {boolean} completed
 * @property {string} puzzleName
 */

/**
 * Compute grid layout metrics for the given puzzle.
 * @param {Object} puzzle
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {Object}
 */
export function computeLayout(puzzle, canvasW, canvasH) {
  const { rows, cols } = puzzle;
  const gridPadding = 12;
  const hudHeight = 48;
  const padHeight = 180;
  const availW = canvasW - gridPadding * 2;
  const availH = canvasH - hudHeight - padHeight - gridPadding * 3;
  const cellSize = Math.floor(Math.min(availW / cols, availH / rows));
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const gridX = Math.floor((canvasW - gridW) / 2);
  const gridY = hudHeight + Math.floor((availH - gridH) / 2) + gridPadding;
  const padY = canvasH - padHeight;

  return { cellSize, gridW, gridH, gridX, gridY, hudHeight, padY, padHeight };
}

/**
 * Draw the full game scene.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - canvas logical width
 * @param {number} H - canvas logical height
 * @param {RenderState} state
 */
export function renderGame(ctx, W, H, state) {
  const { puzzle, playerGrid, selectedRow, selectedCol, conflicts, timer, errors, completed, puzzleName } = state;
  const layout = computeLayout(puzzle, W, H);
  const { cellSize, gridX, gridY, padY, padHeight } = layout;
  const { rows, cols, grid } = puzzle;

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // HUD
  drawHUD(ctx, W, layout.hudHeight, timer, errors, puzzleName);

  // Grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      const cell = grid[r][c];

      if (isBlackCell(cell)) {
        drawBlackCell(ctx, x, y, cellSize);
      } else if (isClueCell(cell)) {
        drawClueCell(ctx, x, y, cellSize, cell);
      } else if (isFillCell(cell)) {
        const isSelected = r === selectedRow && c === selectedCol;
        const hasConflict = conflicts.has(`${r},${c}`);
        const value = playerGrid[r][c];
        drawFillCell(ctx, x, y, cellSize, value, isSelected, hasConflict, completed);
      }
    }
  }

  // Grid border
  ctx.strokeStyle = '#444466';
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, cols * cellSize, rows * cellSize);

  // Number pad
  drawNumberPad(ctx, W, padY, padHeight, state.selectedDigit);

  // Completion overlay
  if (completed) {
    drawCompletionBanner(ctx, W, H);
  }
}

/**
 * Draw a black (empty) cell.
 */
function drawBlackCell(ctx, x, y, size) {
  ctx.fillStyle = COLORS.blackCell;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#222244';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, size, size);
}

/**
 * Draw a clue cell with diagonal split.
 * Top-right triangle: across sum. Bottom-left triangle: down sum.
 */
function drawClueCell(ctx, x, y, size, clue) {
  // Fill background
  ctx.fillStyle = COLORS.clueCell;
  ctx.fillRect(x, y, size, size);

  // Diagonal line
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y + size);
  ctx.strokeStyle = COLORS.clueDiag;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Border
  ctx.strokeStyle = '#333355';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, size, size);

  const fontSize = Math.max(9, Math.floor(size * 0.28));
  ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = COLORS.textClue;

  // Across sum (top-right area)
  if (clue.across !== undefined) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(clue.across), x + size - 3, y + size / 2 - 2);
  }

  // Down sum (bottom-left area)
  if (clue.down !== undefined) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(String(clue.down), x + 3, y + size / 2 + 2);
  }
}

/**
 * Draw a fill (white) cell.
 */
function drawFillCell(ctx, x, y, size, value, isSelected, hasConflict, completed) {
  // Cell background
  if (completed) {
    ctx.fillStyle = COLORS.fillCellCorrect;
  } else if (isSelected) {
    ctx.fillStyle = COLORS.fillCellSelected;
  } else if (hasConflict && value > 0) {
    ctx.fillStyle = '#ffdddd';
  } else {
    ctx.fillStyle = COLORS.fillCell;
  }
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // Border
  ctx.strokeStyle = isSelected ? COLORS.accent : '#aaaacc';
  ctx.lineWidth = isSelected ? 2 : 0.5;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

  // Value
  if (value > 0) {
    const fontSize = Math.max(14, Math.floor(size * 0.5));
    ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = hasConflict ? COLORS.fillCellError : COLORS.textDark;
    ctx.fillText(String(value), x + size / 2, y + size / 2 + 1);
  }
}

/**
 * Draw the HUD bar (timer, errors, puzzle name).
 */
function drawHUD(ctx, W, hudH, timer, errors, puzzleName) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, W, hudH);

  ctx.font = 'bold 14px "Space Grotesk", sans-serif';
  ctx.textBaseline = 'middle';
  const cy = hudH / 2;

  // Timer (left)
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.textLight;
  const mins = Math.floor(timer / 60);
  const secs = Math.floor(timer % 60);
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, 12, cy);

  // Puzzle name (center)
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText(puzzleName.toUpperCase(), W / 2, cy);

  // Errors (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = errors > 0 ? COLORS.fillCellError : COLORS.textMuted;
  ctx.fillText(`${errors} err`, W - 12, cy);
}

/**
 * Draw the number pad (digits 1-9 + clear + check).
 */
function drawNumberPad(ctx, W, padY, padH, selectedDigit) {
  ctx.fillStyle = COLORS.padBg;
  ctx.fillRect(0, padY, W, padH);

  const padPadding = 8;
  const gap = 4;
  const cols = 5;
  const rowCount = 2;
  const btnW = Math.floor((W - padPadding * 2 - gap * (cols - 1)) / cols);
  const btnH = Math.floor((padH - padPadding * 2 - gap * (rowCount + 1)) / (rowCount + 1));
  const startX = Math.floor((W - (btnW * cols + gap * (cols - 1))) / 2);

  // Row 1: 1-5
  // Row 2: 6-9, clear
  // Row 3: check button (full width)
  const buttons = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 'CLR'],
  ];

  for (let row = 0; row < buttons.length; row++) {
    for (let col = 0; col < buttons[row].length; col++) {
      const val = buttons[row][col];
      const bx = startX + col * (btnW + gap);
      const by = padY + padPadding + row * (btnH + gap);

      const isActive = typeof val === 'number' && val === selectedDigit;

      // Button background
      ctx.fillStyle = isActive ? COLORS.padBtnActive : COLORS.padBtn;
      const radius = 6;
      drawRoundedRect(ctx, bx, by, btnW, btnH, radius);
      ctx.fill();

      // Button text
      const fontSize = typeof val === 'number' ? Math.floor(btnH * 0.5) : Math.floor(btnH * 0.35);
      ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? COLORS.padBtnActiveText : COLORS.padBtnText;
      ctx.fillText(String(val), bx + btnW / 2, by + btnH / 2);
    }
  }

  // Check button (full width, bottom row)
  const checkY = padY + padPadding + 2 * (btnH + gap);
  const checkW = W - padPadding * 2;
  const checkX = padPadding;

  ctx.fillStyle = COLORS.accent;
  drawRoundedRect(ctx, checkX, checkY, checkW, btnH, 6);
  ctx.fill();

  ctx.font = `bold ${Math.floor(btnH * 0.4)}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.textDark;
  ctx.fillText('CHECK', checkX + checkW / 2, checkY + btnH / 2);
}

/**
 * Draw a completion banner.
 */
function drawCompletionBanner(ctx, W, H) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, H / 2 - 40, W, 80);

  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText('SOLVED', W / 2, H / 2 - 8);

  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.textLight;
  ctx.fillText('no cap, you got it', W / 2, H / 2 + 20);
}

/**
 * Rounded rectangle helper.
 */
function drawRoundedRect(ctx, x, y, w, h, r) {
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
 * Hit-test: which grid cell was tapped?
 * @returns {{ row: number, col: number } | null}
 */
export function hitTestGrid(puzzle, canvasW, canvasH, tapX, tapY) {
  const layout = computeLayout(puzzle, canvasW, canvasH);
  const { cellSize, gridX, gridY } = layout;
  const { rows, cols, grid } = puzzle;

  const col = Math.floor((tapX - gridX) / cellSize);
  const row = Math.floor((tapY - gridY) / cellSize);

  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  if (!isFillCell(grid[row][col])) return null;

  return { row, col };
}

/**
 * Hit-test: which number pad button was tapped?
 * @returns {number | 'CLR' | 'CHECK' | null}
 */
export function hitTestPad(canvasW, canvasH, tapX, tapY, puzzle) {
  const layout = computeLayout(puzzle, canvasW, canvasH);
  const { padY, padHeight } = layout;

  if (tapY < padY) return null;

  const padPadding = 8;
  const gap = 4;
  const colCount = 5;
  const rowCount = 2;
  const btnW = Math.floor((canvasW - padPadding * 2 - gap * (colCount - 1)) / colCount);
  const btnH = Math.floor((padHeight - padPadding * 2 - gap * (rowCount + 1)) / (rowCount + 1));
  const startX = Math.floor((canvasW - (btnW * colCount + gap * (colCount - 1))) / 2);

  const buttons = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 'CLR'],
  ];

  for (let row = 0; row < buttons.length; row++) {
    for (let col = 0; col < buttons[row].length; col++) {
      const bx = startX + col * (btnW + gap);
      const by = padY + padPadding + row * (btnH + gap);
      if (tapX >= bx && tapX <= bx + btnW && tapY >= by && tapY <= by + btnH) {
        return buttons[row][col];
      }
    }
  }

  // Check button
  const checkY = padY + padPadding + 2 * (btnH + gap);
  const checkW = canvasW - padPadding * 2;
  const checkX = padPadding;
  if (tapX >= checkX && tapX <= checkX + checkW && tapY >= checkY && tapY <= checkY + btnH) {
    return 'CHECK';
  }

  return null;
}
