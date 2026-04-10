/**
 * MEME SWEEPER -- Canvas Renderer
 * Draws the minefield grid, HUD (mine counter, timer, reset), and game-over state.
 */

const NUMBER_COLORS = {
  1: '#4a90d9',  // blue
  2: '#50b848',  // green
  3: '#e94560',  // red
  4: '#9b59b6',  // purple
  5: '#800000',  // maroon
  6: '#16a085',  // teal
  7: '#222222',  // black
  8: '#888888',  // gray
};

const BG_COLOR = '#1a1a2e';
const HUD_BG = '#0f3460';
const CELL_UNREVEALED = '#2c3e6e';
const CELL_UNREVEALED_LIGHT = '#3a4f80';
const CELL_REVEALED = '#1a1a2e';
const CELL_REVEALED_BORDER = '#2a2a3e';
const CELL_HOVER = '#3e5590';
const ACCENT = '#e94560';

/**
 * @typedef {object} RenderState
 * @property {object} field - Minefield state
 * @property {number} gridOffsetX - X offset for centering grid
 * @property {number} gridOffsetY - Y offset (below HUD)
 * @property {number} cellSize - Pixel size of each cell
 * @property {number} elapsed - Seconds elapsed
 * @property {boolean} gameOver
 * @property {boolean} won
 */

/**
 * Compute grid layout metrics.
 *
 * @param {number} rows
 * @param {number} cols
 * @param {number} canvasW - Logical canvas width
 * @param {number} canvasH - Logical canvas height
 * @param {number} hudHeight - Height reserved for HUD
 * @returns {{ cellSize: number, gridOffsetX: number, gridOffsetY: number }}
 */
export function computeLayout(rows, cols, canvasW, canvasH, hudHeight) {
  const availW = canvasW - 16;   // 8px padding each side
  const availH = canvasH - hudHeight - 16;

  const cellW = Math.floor(availW / cols);
  const cellH = Math.floor(availH / rows);
  const cellSize = Math.min(cellW, cellH, 36);

  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const gridOffsetX = Math.floor((canvasW - gridW) / 2);
  const gridOffsetY = hudHeight + Math.floor((canvasH - hudHeight - gridH) / 2);

  return { cellSize, gridOffsetX, gridOffsetY };
}

/**
 * Convert a logical canvas position to grid row/col.
 *
 * @param {number} x - Logical X
 * @param {number} y - Logical Y
 * @param {number} gridOffsetX
 * @param {number} gridOffsetY
 * @param {number} cellSize
 * @param {number} rows
 * @param {number} cols
 * @returns {{ r: number, c: number } | null}
 */
export function posToCell(x, y, gridOffsetX, gridOffsetY, cellSize, rows, cols) {
  const col = Math.floor((x - gridOffsetX) / cellSize);
  const row = Math.floor((y - gridOffsetY) / cellSize);
  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  return { r: row, c: col };
}

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {RenderState} state
 */
export function renderFrame(ctx, canvasW, canvasH, state) {
  const { field, gridOffsetX, gridOffsetY, cellSize, elapsed } = state;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // HUD
  drawHUD(ctx, canvasW, field, elapsed);

  // Grid
  drawGrid(ctx, field, gridOffsetX, gridOffsetY, cellSize);

  // Game over overlay text
  if (field.gameOver) {
    drawGameOverBanner(ctx, canvasW, canvasH, field.won);
  }
}

/**
 * Draw the top HUD bar.
 */
function drawHUD(ctx, canvasW, field, elapsed) {
  const hudH = 44;

  // Background
  ctx.fillStyle = HUD_BG;
  ctx.fillRect(0, 0, canvasW, hudH);

  // Mine counter (left)
  const remaining = field.mineCount - field.flagCount;
  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`\u{1F4A3} ${remaining}`, 10, hudH / 2);

  // Timer (right)
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillText(timeStr, canvasW - 10, hudH / 2);

  // Reset button hint (center)
  ctx.fillStyle = '#eaeaea';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('\u{1F61C}', canvasW / 2, hudH / 2);
}

/**
 * Draw the minefield grid.
 */
function drawGrid(ctx, field, offsetX, offsetY, size) {
  const { rows, cols, cells } = field;
  const gap = 1;
  const inner = size - gap * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const x = offsetX + c * size + gap;
      const y = offsetY + r * size + gap;

      if (cell.revealed) {
        // Revealed cell background
        ctx.fillStyle = CELL_REVEALED;
        ctx.fillRect(x, y, inner, inner);

        // Border
        ctx.strokeStyle = CELL_REVEALED_BORDER;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, inner, inner);

        if (cell.mine) {
          // Draw mine (skull)
          ctx.font = `${Math.floor(inner * 0.6)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('\u{1F480}', x + inner / 2, y + inner / 2 + 1);
        } else if (cell.adjacent > 0) {
          // Draw number
          ctx.fillStyle = NUMBER_COLORS[cell.adjacent] || '#eaeaea';
          ctx.font = `bold ${Math.floor(inner * 0.55)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cell.adjacent), x + inner / 2, y + inner / 2 + 1);
        }
      } else {
        // Unrevealed cell -- raised 3D look
        ctx.fillStyle = CELL_UNREVEALED;
        ctx.fillRect(x, y, inner, inner);

        // Highlight (top/left)
        ctx.fillStyle = CELL_UNREVEALED_LIGHT;
        ctx.fillRect(x, y, inner, 2);
        ctx.fillRect(x, y, 2, inner);

        // Shadow (bottom/right)
        ctx.fillStyle = '#1a2850';
        ctx.fillRect(x, y + inner - 2, inner, 2);
        ctx.fillRect(x + inner - 2, y, 2, inner);

        if (cell.flagged) {
          // Draw flag
          ctx.font = `${Math.floor(inner * 0.55)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('\u{1F6A9}', x + inner / 2, y + inner / 2 + 1);
        }
      }
    }
  }
}

/**
 * Draw game over banner on the grid.
 */
function drawGameOverBanner(ctx, canvasW, canvasH, won) {
  // Semi-transparent overlay
  ctx.fillStyle = won ? 'rgba(80, 184, 72, 0.25)' : 'rgba(233, 69, 96, 0.25)';
  ctx.fillRect(0, 44, canvasW, canvasH - 44);

  // Banner
  const bannerY = canvasH / 2 - 20;
  ctx.fillStyle = won ? 'rgba(80, 184, 72, 0.9)' : 'rgba(233, 69, 96, 0.9)';
  ctx.fillRect(0, bannerY, canvasW, 40);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(won ? 'NO CAP -- YOU CLEARED IT' : 'BOOM -- L + RATIO', canvasW / 2, bannerY + 20);
}
