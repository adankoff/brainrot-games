/**
 * Lights Out -- Canvas Renderer
 * Handles all drawing: grid, HUD, animations.
 */

const W = 400;
const H = 700;

// Colors
const COLOR_BG = '#0a0a12';
const COLOR_CELL_ON = '#00e5ff';
const COLOR_CELL_ON_INNER = '#80f0ff';
const COLOR_CELL_OFF = '#1a1a2e';
const COLOR_CELL_OFF_BORDER = '#2a2a44';
const COLOR_FLASH = '#ffffff';
const COLOR_TEXT = '#e0e0e0';
const COLOR_TEXT_DIM = '#666680';
const COLOR_ACCENT = '#00e5ff';
const COLOR_GOLD = '#ffd600';

// Layout
const HUD_TOP = 60;
const GRID_TOP = 120;
const GRID_BOTTOM = H - 80;
const GAP = 6;
const CELL_RADIUS = 6;

/**
 * @typedef {Object} FlashCell
 * @property {number} row
 * @property {number} col
 * @property {number} timer - Remaining flash time (0-1)
 */

/**
 * Calculate grid layout for the current puzzle size.
 *
 * @param {number} size - Grid dimension
 * @returns {{ cellSize: number, gridX: number, gridY: number, totalSize: number }}
 */
function calcLayout(size) {
  const availableH = GRID_BOTTOM - GRID_TOP;
  const availableW = W - 40;
  const available = Math.min(availableW, availableH);
  const totalSize = available;
  const cellSize = (totalSize - GAP * (size - 1)) / size;
  const gridX = (W - totalSize) / 2;
  const gridY = GRID_TOP + (availableH - totalSize) / 2;
  return { cellSize, gridX, gridY, totalSize };
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

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state
 * @param {boolean[][]} state.grid - Current puzzle grid
 * @param {number} state.size - Grid dimension
 * @param {number} state.moves - Moves taken this level
 * @param {number} state.level - Current level number
 * @param {number} state.totalScore - Cumulative score
 * @param {number} state.difficulty - 0=easy, 1=medium, 2=hard
 * @param {FlashCell[]} state.flashes - Active flash animations
 * @param {number} state.winTimer - Win animation timer (0 = not winning)
 * @param {string} state.difficultyLabel - 'easy'|'medium'|'hard'
 */
export function render(ctx, state) {
  const { grid, size, moves, level, totalScore, flashes, winTimer, difficultyLabel } = state;

  // Clear
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // HUD
  drawHUD(ctx, level, moves, totalScore, difficultyLabel);

  // Grid
  const layout = calcLayout(size);
  drawGrid(ctx, grid, size, layout, flashes);

  // Win overlay
  if (winTimer > 0) {
    drawWinOverlay(ctx, winTimer);
  }

  // Bottom hint
  drawHint(ctx);
}

/**
 * Draw the heads-up display.
 */
function drawHUD(ctx, level, moves, totalScore, difficultyLabel) {
  // Level
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.font = '500 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`LEVEL ${level}`, 20, 28);

  // Difficulty badge
  const diffColors = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336' };
  ctx.fillStyle = diffColors[difficultyLabel] || COLOR_TEXT_DIM;
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(difficultyLabel.toUpperCase(), 20, 50);

  // Score
  ctx.fillStyle = COLOR_ACCENT;
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(totalScore.toLocaleString('en-US'), W - 20, 28);

  // Moves
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = '500 14px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`moves: ${moves}`, W - 20, 50);

  // Divider line
  ctx.strokeStyle = '#1e1e36';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, HUD_TOP + 10);
  ctx.lineTo(W - 20, HUD_TOP + 10);
  ctx.stroke();
}

/**
 * Draw the puzzle grid.
 */
function drawGrid(ctx, grid, size, layout, flashes) {
  const { cellSize, gridX, gridY } = layout;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = gridX + c * (cellSize + GAP);
      const y = gridY + r * (cellSize + GAP);
      const isOn = grid[r][c];

      // Check for flash on this cell
      let flashAmount = 0;
      for (const f of flashes) {
        if (f.row === r && f.col === c) {
          flashAmount = f.timer;
          break;
        }
      }

      // Draw cell
      if (isOn) {
        // Glow shadow
        ctx.shadowColor = COLOR_CELL_ON;
        ctx.shadowBlur = 18 + flashAmount * 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Outer fill
        roundRect(ctx, x, y, cellSize, cellSize, CELL_RADIUS);
        ctx.fillStyle = COLOR_CELL_ON;
        ctx.fill();

        // Inner highlight
        const inset = cellSize * 0.15;
        roundRect(ctx, x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2, CELL_RADIUS - 2);
        ctx.fillStyle = COLOR_CELL_ON_INNER;
        ctx.globalAlpha = 0.3 + flashAmount * 0.4;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0;
      } else {
        // Off cell
        ctx.shadowBlur = 0;
        roundRect(ctx, x, y, cellSize, cellSize, CELL_RADIUS);
        ctx.fillStyle = COLOR_CELL_OFF;
        ctx.fill();
        ctx.strokeStyle = COLOR_CELL_OFF_BORDER;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Flash overlay (white flash on toggle)
      if (flashAmount > 0) {
        roundRect(ctx, x, y, cellSize, cellSize, CELL_RADIUS);
        ctx.fillStyle = COLOR_FLASH;
        ctx.globalAlpha = flashAmount * 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

/**
 * Draw the win level-complete overlay.
 */
function drawWinOverlay(ctx, timer) {
  // Semi-transparent overlay
  ctx.fillStyle = COLOR_BG;
  ctx.globalAlpha = timer * 0.6;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Text
  const scale = 1 + (1 - timer) * 0.3;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(scale, scale);
  ctx.globalAlpha = timer;

  ctx.fillStyle = COLOR_GOLD;
  ctx.font = '900 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 214, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText('LIGHTS OUT!', 0, -10);
  ctx.shadowBlur = 0;

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = '500 16px system-ui, sans-serif';
  ctx.fillText('next puzzle loading...', 0, 30);

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw the bottom hint text.
 */
function drawHint(ctx) {
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.font = '400 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('tap a cell to toggle it + neighbors', W / 2, H - 30);
}

/**
 * Hit-test a tap position against the grid.
 *
 * @param {number} x - Logical x coordinate
 * @param {number} y - Logical y coordinate
 * @param {number} size - Grid dimension
 * @returns {{ row: number, col: number } | null}
 */
export function hitTestGrid(x, y, size) {
  const { cellSize, gridX, gridY } = calcLayout(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cx = gridX + c * (cellSize + GAP);
      const cy = gridY + r * (cellSize + GAP);
      if (x >= cx && x <= cx + cellSize && y >= cy && y <= cy + cellSize) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Render game-over state on canvas (dim the grid).
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderGameOver(ctx) {
  ctx.fillStyle = COLOR_BG;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

/**
 * Render the difficulty selector on the menu canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} selectedDifficulty - 0, 1, or 2
 */
export function renderMenuPreview(ctx, selectedDifficulty) {
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // Draw a small preview grid
  const previewSize = [3, 4, 5][selectedDifficulty];
  const cellPx = 30;
  const gap = 4;
  const totalPx = previewSize * cellPx + (previewSize - 1) * gap;
  const ox = (W - totalPx) / 2;
  const oy = 200;

  for (let r = 0; r < previewSize; r++) {
    for (let c = 0; c < previewSize; c++) {
      const x = ox + c * (cellPx + gap);
      const y = oy + r * (cellPx + gap);
      const lit = (r + c) % 2 === 0;

      if (lit) {
        ctx.shadowColor = COLOR_CELL_ON;
        ctx.shadowBlur = 10;
        roundRect(ctx, x, y, cellPx, cellPx, 4);
        ctx.fillStyle = COLOR_CELL_ON;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        roundRect(ctx, x, y, cellPx, cellPx, 4);
        ctx.fillStyle = COLOR_CELL_OFF;
        ctx.fill();
        ctx.strokeStyle = COLOR_CELL_OFF_BORDER;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}
