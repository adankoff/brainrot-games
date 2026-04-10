/**
 * MEME KENKEN -- Renderer
 * All canvas drawing for the KenKen puzzle.
 */

const COLORS = {
  bg: '#0a0a0a',
  surface: '#1a1a2e',
  gridBg: '#16213e',
  cellBg: '#0f3460',
  cellSelected: '#1a5276',
  cellHighlight: '#1b2838',
  cellError: 'rgba(231, 76, 60, 0.25)',
  cageBorder: '#c8ff00',
  gridLine: '#2c3e6e',
  text: '#e0e0e0',
  textDim: '#7f8c8d',
  textAccent: '#c8ff00',
  textError: '#e74c3c',
  numPadBg: '#1a1a2e',
  numPadBtn: '#16213e',
  numPadBtnActive: '#1a5276',
  numPadText: '#e0e0e0',
  timerBg: '#1a1a2e',
  cageLabel: '#c8ff00',
  complete: '#2ecc71',
};

/**
 * @typedef {Object} RenderState
 * @property {import('./kenken.js').KenKenPuzzle} puzzle
 * @property {number[][]} playerGrid
 * @property {number} selectedRow
 * @property {number} selectedCol
 * @property {Set<string>} errors
 * @property {number} elapsed - seconds
 * @property {number} errorCount
 * @property {string} difficulty
 * @property {boolean} solved
 */

/**
 * Render the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - logical width
 * @param {number} H - logical height
 * @param {RenderState} state
 */
export function render(ctx, W, H, state) {
  const { puzzle, playerGrid, selectedRow, selectedCol, errors, elapsed, errorCount, difficulty, solved } = state;
  const n = puzzle.size;

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Layout
  const topBarH = 50;
  const padding = 16;
  const gridSize = W - padding * 2;
  const cellSize = gridSize / n;
  const gridX = padding;
  const gridY = topBarH + 10;
  const numPadY = gridY + gridSize + 16;

  // Draw top bar (timer + errors + difficulty)
  drawTopBar(ctx, W, topBarH, elapsed, errorCount, difficulty);

  // Draw grid background
  ctx.fillStyle = COLORS.gridBg;
  ctx.fillRect(gridX, gridY, gridSize, gridSize);

  // Draw cells
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      drawCell(ctx, x, y, cellSize, r, c, state);
    }
  }

  // Draw grid lines (thin)
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= n; i++) {
    // Vertical
    ctx.beginPath();
    ctx.moveTo(gridX + i * cellSize, gridY);
    ctx.lineTo(gridX + i * cellSize, gridY + gridSize);
    ctx.stroke();
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cellSize);
    ctx.lineTo(gridX + gridSize, gridY + i * cellSize);
    ctx.stroke();
  }

  // Draw cage borders (thick)
  drawCageBorders(ctx, puzzle, gridX, gridY, cellSize, n);

  // Draw cage labels
  drawCageLabels(ctx, puzzle, gridX, gridY, cellSize, n);

  // Draw number pad
  drawNumberPad(ctx, W, numPadY, n, playerGrid, selectedRow, selectedCol, solved);

  // Draw solved overlay
  if (solved) {
    drawSolvedOverlay(ctx, W, H, gridX, gridY, gridSize);
  }
}

/**
 * Draw the top bar with timer and error count.
 */
function drawTopBar(ctx, W, h, elapsed, errorCount, difficulty) {
  ctx.fillStyle = COLORS.timerBg;
  ctx.fillRect(0, 0, W, h);

  // Timer
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, 16, h / 2);

  // Difficulty
  ctx.fillStyle = COLORS.textAccent;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(difficulty.toUpperCase(), W / 2, h / 2);

  // Errors
  ctx.fillStyle = errorCount > 0 ? COLORS.textError : COLORS.textDim;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`err: ${errorCount}`, W - 16, h / 2);
}

/**
 * Draw an individual cell.
 */
function drawCell(ctx, x, y, size, row, col, state) {
  const { playerGrid, selectedRow, selectedCol, errors, puzzle } = state;
  const isSelected = row === selectedRow && col === selectedCol;
  const isError = errors.has(`${row},${col}`);
  const value = playerGrid[row][col];

  // Highlight selected row/col
  const inSelectedRowCol = (selectedRow >= 0 && selectedCol >= 0) &&
    (row === selectedRow || col === selectedCol);

  // Cell background
  if (isSelected) {
    ctx.fillStyle = COLORS.cellSelected;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  } else if (inSelectedRowCol) {
    ctx.fillStyle = COLORS.cellHighlight;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  }

  // Error highlight
  if (isError && value > 0) {
    ctx.fillStyle = COLORS.cellError;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  }

  // Number
  if (value > 0) {
    ctx.fillStyle = isError ? COLORS.textError : COLORS.text;
    ctx.font = `bold ${Math.floor(size * 0.5)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), x + size / 2, y + size / 2 + 2);
  }
}

/**
 * Draw thick cage borders by checking adjacency.
 */
function drawCageBorders(ctx, puzzle, gridX, gridY, cellSize, n) {
  const { cageMap } = puzzle;
  ctx.strokeStyle = COLORS.cageBorder;
  ctx.lineWidth = 3;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      const id = cageMap[r][c];

      // Top border
      if (r === 0 || cageMap[r - 1][c] !== id) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      // Bottom border
      if (r === n - 1 || cageMap[r + 1][c] !== id) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      // Left border
      if (c === 0 || cageMap[r][c - 1] !== id) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
      // Right border
      if (c === n - 1 || cageMap[r][c + 1] !== id) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
    }
  }
}

/**
 * Draw cage target+operation labels in top-left of each cage.
 */
function drawCageLabels(ctx, puzzle, gridX, gridY, cellSize, n) {
  const { cages } = puzzle;

  for (const cage of cages) {
    // Find top-left cell of cage (min row, then min col)
    let topLeft = cage.cells[0];
    for (const cell of cage.cells) {
      if (cell[0] < topLeft[0] || (cell[0] === topLeft[0] && cell[1] < topLeft[1])) {
        topLeft = cell;
      }
    }

    const [r, c] = topLeft;
    const x = gridX + c * cellSize + 4;
    const y = gridY + r * cellSize + 4;

    const label = cage.op ? `${cage.target}${cage.op}` : `${cage.target}`;

    ctx.fillStyle = COLORS.cageLabel;
    const fontSize = Math.max(10, Math.floor(cellSize * 0.2));
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y);
  }
}

/**
 * Draw the number pad at the bottom.
 */
function drawNumberPad(ctx, W, startY, n, playerGrid, selRow, selCol, solved) {
  if (solved) return;

  const padding = 16;
  const totalW = W - padding * 2;
  // n number buttons + 1 erase button
  const btnCount = n + 1;
  const gap = 6;
  const btnW = (totalW - (btnCount - 1) * gap) / btnCount;
  const btnH = 48;

  for (let i = 0; i <= n; i++) {
    const x = padding + i * (btnW + gap);
    const y = startY;

    const isErase = i === n;
    const label = isErase ? 'X' : String(i + 1);

    ctx.fillStyle = COLORS.numPadBtn;
    ctx.beginPath();
    roundRect(ctx, x, y, btnW, btnH, 8);
    ctx.fill();

    ctx.fillStyle = isErase ? COLORS.textError : COLORS.numPadText;
    ctx.font = `bold ${Math.floor(btnH * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + btnW / 2, y + btnH / 2);
  }
}

/**
 * Draw the completion overlay.
 */
function drawSolvedOverlay(ctx, W, H, gridX, gridY, gridSize) {
  // Subtle green glow on grid
  ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
  ctx.fillRect(gridX, gridY, gridSize, gridSize);

  ctx.fillStyle = COLORS.complete;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOLVED', W / 2, gridY + gridSize + 40);
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

/**
 * Get grid layout parameters (used by main.js for hit testing).
 * @param {number} W
 * @param {number} n
 * @returns {{ gridX: number, gridY: number, cellSize: number, gridSize: number, numPadY: number }}
 */
export function getLayout(W, n) {
  const topBarH = 50;
  const padding = 16;
  const gridSize = W - padding * 2;
  const cellSize = gridSize / n;
  const gridX = padding;
  const gridY = topBarH + 10;
  const numPadY = gridY + gridSize + 16;
  return { gridX, gridY, cellSize, gridSize, numPadY };
}
