/**
 * MEME PICROSS -- Renderer
 * Canvas drawing for the nonogram grid, clues, HUD, and cell states.
 */

const COLORS = {
  bg: '#0a0a1a',
  surface: '#141428',
  gridLine: '#2a2a4a',
  gridLineThick: '#3a3a6a',
  cellEmpty: '#1a1a30',
  cellFilled: '#00e5ff',
  cellFilledAlt: '#00b8d4',
  cellCross: '#ff4466',
  cellError: '#ff2244',
  clueText: '#8888aa',
  clueDone: '#445566',
  clueHighlight: '#ccccee',
  hudText: '#ccccdd',
  hudAccent: '#00e5ff',
  hudError: '#ff4466',
  highlight: 'rgba(0, 229, 255, 0.08)',
  winGlow: '#00e5ff',
  white: '#eeeeff',
};

const LOGICAL_W = 400;
const LOGICAL_H = 700;

/**
 * Calculate layout dimensions for the current puzzle size.
 *
 * @param {Object} state
 * @returns {Object} Layout info
 */
function calcLayout(state) {
  const size = state.size;
  const maxClueChars = size <= 5 ? 2 : 3;

  // Clue area sizes scale with grid
  const clueAreaLeft = size <= 5 ? 60 : size <= 8 ? 75 : 85;
  const clueAreaTop = size <= 5 ? 80 : size <= 8 ? 90 : 100;

  const hudHeight = 45;
  const gridAreaW = LOGICAL_W - clueAreaLeft - 10;
  const gridAreaH = LOGICAL_H - clueAreaTop - hudHeight - 20;

  const cellSize = Math.min(
    Math.floor(gridAreaW / size),
    Math.floor(gridAreaH / size)
  );

  const gridW = cellSize * size;
  const gridH = cellSize * size;
  const gridX = clueAreaLeft + Math.floor((gridAreaW - gridW) / 2);
  const gridY = clueAreaTop + hudHeight;

  return {
    hudHeight,
    clueAreaLeft,
    clueAreaTop,
    gridX,
    gridY,
    gridW,
    gridH,
    cellSize,
  };
}

/**
 * Get the grid cell coordinate from a tap position.
 *
 * @param {Object} state
 * @param {{ x: number, y: number }} pos
 * @returns {{ row: number, col: number }|null}
 */
export function getCellFromPos(state, pos) {
  const layout = calcLayout(state);
  const { gridX, gridY, cellSize } = layout;
  const size = state.size;

  const col = Math.floor((pos.x - gridX) / cellSize);
  const row = Math.floor((pos.y - gridY) / cellSize);

  if (row >= 0 && row < size && col >= 0 && col < size) {
    return { row, col };
  }
  return null;
}

/**
 * Check if a row's clue is satisfied.
 *
 * @param {boolean[][]} grid - Player's filled cells
 * @param {boolean[][]} crossGrid - Player's crossed cells
 * @param {number[]} clue - Expected clue
 * @param {number} row
 * @param {number} size
 * @returns {boolean}
 */
function isRowComplete(grid, crossGrid, clue, row, size) {
  // A row is complete when every cell is either filled or crossed
  // and the filled pattern matches the clue
  const runs = [];
  let run = 0;
  for (let c = 0; c < size; c++) {
    if (grid[row][c]) {
      run++;
    } else {
      if (run > 0) runs.push(run);
      run = 0;
    }
  }
  if (run > 0) runs.push(run);
  if (runs.length === 0) runs.push(0);

  if (runs.length !== clue.length) return false;
  for (let i = 0; i < runs.length; i++) {
    if (runs[i] !== clue[i]) return false;
  }

  // Also check all cells are decided
  for (let c = 0; c < size; c++) {
    if (!grid[row][c] && !crossGrid[row][c]) return false;
  }
  return true;
}

/**
 * Check if a column's clue is satisfied.
 */
function isColComplete(grid, crossGrid, clue, col, size) {
  const runs = [];
  let run = 0;
  for (let r = 0; r < size; r++) {
    if (grid[r][col]) {
      run++;
    } else {
      if (run > 0) runs.push(run);
      run = 0;
    }
  }
  if (run > 0) runs.push(run);
  if (runs.length === 0) runs.push(0);

  if (runs.length !== clue.length) return false;
  for (let i = 0; i < runs.length; i++) {
    if (runs[i] !== clue[i]) return false;
  }

  for (let r = 0; r < size; r++) {
    if (!grid[r][col] && !crossGrid[r][col]) return false;
  }
  return true;
}

/**
 * Render the full game canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
export function render(ctx, state) {
  const layout = calcLayout(state);
  const {
    hudHeight, clueAreaLeft, clueAreaTop,
    gridX, gridY, gridW, gridH, cellSize,
  } = layout;
  const size = state.size;

  // ---- Clear ----
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  // ---- HUD: timer + errors ----
  renderHUD(ctx, state, layout);

  // ---- Row/column highlight ----
  if (state.highlightRow >= 0 && state.highlightRow < size) {
    ctx.fillStyle = COLORS.highlight;
    ctx.fillRect(0, gridY + state.highlightRow * cellSize, LOGICAL_W, cellSize);
  }
  if (state.highlightCol >= 0 && state.highlightCol < size) {
    ctx.fillStyle = COLORS.highlight;
    ctx.fillRect(gridX + state.highlightCol * cellSize, 0, cellSize, LOGICAL_H);
  }

  // ---- Column clues (top) ----
  renderColumnClues(ctx, state, layout);

  // ---- Row clues (left) ----
  renderRowClues(ctx, state, layout);

  // ---- Grid ----
  renderGrid(ctx, state, layout);

  // ---- Win flash ----
  if (state.won && state.winFlash > 0) {
    ctx.globalAlpha = state.winFlash * 0.3;
    ctx.fillStyle = COLORS.winGlow;
    ctx.fillRect(gridX, gridY, gridW, gridH);
    ctx.globalAlpha = 1;
  }

  // ---- Difficulty label ----
  ctx.fillStyle = COLORS.clueText;
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const diffLabel = size <= 5 ? 'EASY 5x5' : size <= 8 ? 'MEDIUM 8x8' : 'HARD 10x10';
  ctx.fillText(diffLabel, LOGICAL_W - 8, LOGICAL_H - 6);
}

/**
 * Render the HUD bar (timer + errors).
 */
function renderHUD(ctx, state, layout) {
  const y = 12;

  // Timer
  ctx.fillStyle = COLORS.hudAccent;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const minutes = Math.floor(state.timer / 60);
  const seconds = Math.floor(state.timer % 60);
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  ctx.fillText(timerStr, 12, y);

  // Errors
  ctx.fillStyle = state.errors > 0 ? COLORS.hudError : COLORS.clueText;
  ctx.font = '14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`errors: ${state.errors}`, LOGICAL_W - 12, y + 2);
}

/**
 * Render column clues above the grid.
 */
function renderColumnClues(ctx, state, layout) {
  const { gridX, gridY, cellSize } = layout;
  const size = state.size;
  const fontSize = size <= 5 ? 12 : size <= 8 ? 10 : 9;
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  for (let c = 0; c < size; c++) {
    const clue = state.colClues[c];
    const done = isColComplete(state.grid, state.crossGrid, clue, c, size);
    const isHighlighted = c === state.highlightCol;

    const cx = gridX + c * cellSize + cellSize / 2;
    const lineHeight = fontSize + 2;

    for (let i = 0; i < clue.length; i++) {
      const cy = gridY - (clue.length - i) * lineHeight - 2;
      ctx.fillStyle = done ? COLORS.clueDone : isHighlighted ? COLORS.clueHighlight : COLORS.clueText;
      ctx.fillText(String(clue[i]), cx, cy + lineHeight);
    }
  }
}

/**
 * Render row clues to the left of the grid.
 */
function renderRowClues(ctx, state, layout) {
  const { gridX, gridY, cellSize } = layout;
  const size = state.size;
  const fontSize = size <= 5 ? 12 : size <= 8 ? 10 : 9;
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < size; r++) {
    const clue = state.rowClues[r];
    const done = isRowComplete(state.grid, state.crossGrid, clue, r, size);
    const isHighlighted = r === state.highlightRow;

    const cy = gridY + r * cellSize + cellSize / 2;
    const clueStr = clue.join(' ');

    ctx.fillStyle = done ? COLORS.clueDone : isHighlighted ? COLORS.clueHighlight : COLORS.clueText;
    ctx.fillText(clueStr, gridX - 6, cy);
  }
}

/**
 * Render the grid cells.
 */
function renderGrid(ctx, state, layout) {
  const { gridX, gridY, cellSize } = layout;
  const size = state.size;
  const pad = 1;

  // Draw cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;

      // Cell background
      if (state.grid[r][c]) {
        // Filled cell
        const isError = state.errorCells[r] && state.errorCells[r][c];
        if (isError) {
          ctx.fillStyle = COLORS.cellError;
        } else {
          ctx.fillStyle = COLORS.cellFilled;
        }
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
      } else if (state.crossGrid[r][c]) {
        // Crossed cell
        ctx.fillStyle = COLORS.cellEmpty;
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);

        // Draw X
        const inset = cellSize * 0.25;
        ctx.strokeStyle = COLORS.cellCross;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + inset, y + inset);
        ctx.lineTo(x + cellSize - inset, y + cellSize - inset);
        ctx.moveTo(x + cellSize - inset, y + inset);
        ctx.lineTo(x + inset, y + cellSize - inset);
        ctx.stroke();
      } else {
        // Empty cell
        ctx.fillStyle = COLORS.cellEmpty;
        ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= size; i++) {
    // Vertical
    const x = gridX + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, gridY);
    ctx.lineTo(x, gridY + size * cellSize);
    ctx.stroke();

    // Horizontal
    const y = gridY + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX + size * cellSize, y);
    ctx.stroke();
  }

  // Thick lines every 5 cells for larger grids
  if (size > 5) {
    ctx.strokeStyle = COLORS.gridLineThick;
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= size; i += 5) {
      const x = gridX + i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, gridY);
      ctx.lineTo(x, gridY + size * cellSize);
      ctx.stroke();

      const y = gridY + i * cellSize;
      ctx.beginPath();
      ctx.moveTo(gridX, y);
      ctx.lineTo(gridX + size * cellSize, y);
      ctx.stroke();
    }
  }

  // Border
  ctx.strokeStyle = COLORS.gridLineThick;
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, size * cellSize, size * cellSize);
}
