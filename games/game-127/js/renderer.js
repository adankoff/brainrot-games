/**
 * MEME FLOW -- Renderer
 * All canvas drawing logic for the Flow Free puzzle.
 */

// 8 distinct bright colors for flow paths
export const FLOW_COLORS = [
  '#ff3366', // hot pink / red
  '#33ccff', // cyan / blue
  '#66ff33', // lime green
  '#ffcc00', // yellow / gold
  '#ff6633', // orange
  '#cc33ff', // purple
  '#ff66cc', // pink
  '#33ffcc', // teal
];

const BG_COLOR = '#0a0a1a';
const GRID_BG = '#111133';
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.08)';
const GRID_LINE_COLOR_STRONG = 'rgba(255, 255, 255, 0.15)';
const DOT_RADIUS_RATIO = 0.32;
const PATH_WIDTH_RATIO = 0.45;
const HUD_HEIGHT = 80;
const GRID_PADDING = 12;
const BOTTOM_PADDING = 20;

// Quit button bounds (for hit testing)
export const QUIT_BTN = { x: 150, y: 56, w: 100, h: 24 };

/**
 * @typedef {Object} RenderConfig
 * @property {number} canvasW
 * @property {number} canvasH
 * @property {number} gridSize
 * @property {number} cellSize
 * @property {number} gridX - Top-left X of grid
 * @property {number} gridY - Top-left Y of grid
 */

/**
 * Compute layout for the grid on the canvas.
 *
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {number} gridSize
 * @returns {RenderConfig}
 */
export function computeLayout(canvasW, canvasH, gridSize) {
  const availW = canvasW - GRID_PADDING * 2;
  const availH = canvasH - HUD_HEIGHT - GRID_PADDING - BOTTOM_PADDING;
  const cellSize = Math.floor(Math.min(availW / gridSize, availH / gridSize));
  const gridW = cellSize * gridSize;
  const gridH = cellSize * gridSize;
  const gridX = Math.floor((canvasW - gridW) / 2);
  const gridY = HUD_HEIGHT + Math.floor((availH - gridH) / 2);

  return { canvasW, canvasH, gridSize, cellSize, gridX, gridY };
}

/**
 * Convert pixel coordinates to grid row/col.
 *
 * @returns {{ r: number, c: number } | null}
 */
export function pixelToGrid(layout, px, py) {
  const { gridX, gridY, cellSize, gridSize } = layout;
  const c = Math.floor((px - gridX) / cellSize);
  const r = Math.floor((py - gridY) / cellSize);
  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null;
  return { r, c };
}

/**
 * Get the center pixel position of a grid cell.
 */
function cellCenter(layout, r, c) {
  const { gridX, gridY, cellSize } = layout;
  return {
    x: gridX + c * cellSize + cellSize / 2,
    y: gridY + r * cellSize + cellSize / 2,
  };
}

/**
 * Render the entire game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {RenderConfig} layout
 * @param {import('./flow.js').FlowState} state
 * @param {Object} hud - { time, moves, level, difficulty, filledPct }
 * @param {Object} [anim] - Animation state { winFlash, winTime }
 */
export function render(ctx, layout, state, hud, anim = {}) {
  const { canvasW, canvasH, gridSize, cellSize, gridX, gridY } = layout;

  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw HUD
  drawHUD(ctx, canvasW, hud);

  // Draw grid background
  ctx.fillStyle = GRID_BG;
  const gridW = cellSize * gridSize;
  const gridH = cellSize * gridSize;
  ctx.fillRect(gridX, gridY, gridW, gridH);

  // Draw grid lines
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) {
    const x = gridX + i * cellSize;
    const y = gridY + i * cellSize;

    ctx.beginPath();
    ctx.moveTo(x, gridY);
    ctx.lineTo(x, gridY + gridH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX + gridW, y);
    ctx.stroke();
  }

  // Draw grid border
  ctx.strokeStyle = GRID_LINE_COLOR_STRONG;
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // Draw cell fills (subtle colored background for filled cells)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const color = state.grid[r][c];
      if (color > 0) {
        ctx.fillStyle = hexToRGBA(FLOW_COLORS[color - 1], 0.08);
        ctx.fillRect(gridX + c * cellSize, gridY + r * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw paths
  const pathWidth = cellSize * PATH_WIDTH_RATIO;
  for (let colorIdx = 1; colorIdx <= state.numColors; colorIdx++) {
    const path = state.paths.get(colorIdx);
    if (!path || path.length < 2) continue;

    ctx.strokeStyle = FLOW_COLORS[colorIdx - 1];
    ctx.lineWidth = pathWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const first = cellCenter(layout, path[0].r, path[0].c);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < path.length; i++) {
      const pt = cellCenter(layout, path[i].r, path[i].c);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }

  // Draw endpoints (dots)
  const dotRadius = cellSize * DOT_RADIUS_RATIO;
  for (const ep of state.endpoints) {
    const center = cellCenter(layout, ep.r, ep.c);
    const color = FLOW_COLORS[ep.color - 1];

    // Outer glow
    ctx.beginPath();
    ctx.arc(center.x, center.y, dotRadius + 3, 0, Math.PI * 2);
    ctx.fillStyle = hexToRGBA(color, 0.25);
    ctx.fill();

    // Main dot
    ctx.beginPath();
    ctx.arc(center.x, center.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(center.x - dotRadius * 0.2, center.y - dotRadius * 0.2, dotRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }

  // Win animation overlay
  if (anim.winFlash && anim.winTime !== undefined) {
    const t = Math.min(anim.winTime / 1.0, 1);
    const alpha = Math.sin(t * Math.PI) * 0.15;
    ctx.fillStyle = `rgba(0, 255, 204, ${alpha})`;
    ctx.fillRect(gridX, gridY, gridW, gridH);
  }

  // Progress bar at bottom
  drawProgressBar(ctx, layout, hud.filledPct || 0);
}

/**
 * Draw the HUD (timer, moves, level).
 */
function drawHUD(ctx, canvasW, hud) {
  const y = 20;

  // Level
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`LVL ${hud.level}`, 16, y);

  // Difficulty
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px monospace';
  ctx.fillText(hud.difficulty.toUpperCase(), 16, y + 24);

  // Timer (center)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  const mins = Math.floor(hud.time / 60);
  const secs = Math.floor(hud.time % 60);
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, canvasW / 2, y);

  // Moves (right)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${hud.moves} moves`, canvasW - 16, y);

  // Flows connected
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px monospace';
  ctx.fillText(`${hud.flowsComplete}/${hud.totalFlows} flows`, canvasW - 16, y + 24);

  // End session button (center-bottom of HUD)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  roundRect(ctx, QUIT_BTN.x, QUIT_BTN.y, QUIT_BTN.w, QUIT_BTN.h, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END SESSION', QUIT_BTN.x + QUIT_BTN.w / 2, QUIT_BTN.y + QUIT_BTN.h / 2);

  // Separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, HUD_HEIGHT - 8);
  ctx.lineTo(canvasW - 16, HUD_HEIGHT - 8);
  ctx.stroke();
}

/**
 * Draw a progress bar showing grid fill percentage.
 */
function drawProgressBar(ctx, layout, pct) {
  const { canvasW, gridX, cellSize, gridSize } = layout;
  const gridW = cellSize * gridSize;
  const barY = layout.gridY + gridSize * cellSize + 10;
  const barH = 6;
  const barW = gridW;

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, gridX, barY, barW, barH, 3);
  ctx.fill();

  // Fill
  if (pct > 0) {
    const fillW = barW * Math.min(pct, 1);
    const gradient = ctx.createLinearGradient(gridX, barY, gridX + fillW, barY);
    gradient.addColorStop(0, '#00ffcc');
    gradient.addColorStop(1, '#33ccff');
    ctx.fillStyle = gradient;
    roundRect(ctx, gridX, barY, fillW, barH, 3);
    ctx.fill();
  }

  // Percentage text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${Math.floor(pct * 100)}% filled`, canvasW / 2, barY + barH + 4);
}

/**
 * Render a game-over background (dimmed final board).
 */
export function renderGameOver(ctx, layout, state) {
  render(ctx, layout, state, {
    time: 0, moves: 0, level: 0, difficulty: '',
    filledPct: 1, flowsComplete: state.numColors, totalFlows: state.numColors,
  });

  // Dim overlay
  ctx.fillStyle = 'rgba(10, 10, 26, 0.7)';
  ctx.fillRect(0, 0, layout.canvasW, layout.canvasH);
}

// ---- Helpers ----

function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
