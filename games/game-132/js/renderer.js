/**
 * MEME LINKS -- Renderer
 * Draws the NumberLink puzzle grid, paths, numbers, and HUD.
 */

const PAIR_COLORS = [
  '#ff4444', // 1 - red
  '#44aaff', // 2 - blue
  '#44ff66', // 3 - green
  '#ffaa00', // 4 - orange
  '#ff44ff', // 5 - magenta
  '#ffff44', // 6 - yellow
  '#44ffff', // 7 - cyan
  '#ff8844', // 8 - coral
  '#aa88ff', // 9 - purple
  '#88ff88', // 10 - light green
];

/**
 * Get color for a pair ID.
 *
 * @param {number} pairId - 1-based
 * @returns {string}
 */
export function getPairColor(pairId) {
  return PAIR_COLORS[(pairId - 1) % PAIR_COLORS.length];
}

/**
 * Compute grid layout metrics based on canvas dimensions.
 *
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {number} cols
 * @param {number} rows
 * @returns {{ offsetX: number, offsetY: number, cellSize: number }}
 */
export function getGridLayout(canvasW, canvasH, cols, rows) {
  const headerHeight = 60;
  const footerHeight = 40;
  const padding = 16;

  const availW = canvasW - padding * 2;
  const availH = canvasH - headerHeight - footerHeight - padding * 2;

  const cellSize = Math.floor(Math.min(availW / cols, availH / rows));

  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  const offsetX = Math.floor((canvasW - gridW) / 2);
  const offsetY = headerHeight + Math.floor((availH - gridH) / 2) + padding;

  return { offsetX, offsetY, cellSize };
}

/**
 * Convert canvas pixel coordinates to grid row/col.
 *
 * @param {number} px
 * @param {number} py
 * @param {{ offsetX: number, offsetY: number, cellSize: number }} layout
 * @param {number} cols
 * @param {number} rows
 * @returns {{ r: number, c: number }|null}
 */
export function pixelToGrid(px, py, layout, cols, rows) {
  const { offsetX, offsetY, cellSize } = layout;
  const c = Math.floor((px - offsetX) / cellSize);
  const r = Math.floor((py - offsetY) / cellSize);
  if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
  return { r, c };
}

/**
 * Render the complete game state.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {Object} gameState
 * @param {Object} uiState
 */
export function renderGame(ctx, canvasW, canvasH, gameState, uiState) {
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvasW, canvasH);

  if (!gameState) return;

  const layout = getGridLayout(canvasW, canvasH, gameState.cols, gameState.rows);
  const { offsetX, offsetY, cellSize } = layout;

  // Draw grid background
  drawGridBackground(ctx, offsetX, offsetY, cellSize, gameState);

  // Draw player paths
  drawPaths(ctx, offsetX, offsetY, cellSize, gameState);

  // Draw grid lines
  drawGridLines(ctx, offsetX, offsetY, cellSize, gameState.cols, gameState.rows);

  // Draw endpoint numbers
  drawEndpoints(ctx, offsetX, offsetY, cellSize, gameState);

  // HUD
  drawHUD(ctx, canvasW, canvasH, gameState, uiState);
}

/**
 * Draw grid cell backgrounds.
 */
function drawGridBackground(ctx, ox, oy, size, state) {
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const x = ox + c * size;
      const y = oy + r * size;

      const pairId = state.playerGrid[r][c];
      if (pairId > 0) {
        const color = getPairColor(pairId);
        ctx.fillStyle = hexToRGBA(color, 0.15);
      } else {
        ctx.fillStyle = '#12122a';
      }
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    }
  }
}

/**
 * Draw the paths (thick colored lines through cell centers).
 */
function drawPaths(ctx, ox, oy, size, state) {
  const half = size / 2;
  const lineW = Math.max(size * 0.35, 6);

  for (let pairId = 1; pairId <= state.numPairs; pairId++) {
    const path = state.playerPaths[pairId];
    if (!path || path.length < 2) continue;

    const color = getPairColor(pairId);
    const isComplete = state.completed.has(pairId);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = isComplete ? 0.9 : 0.7;

    ctx.beginPath();
    ctx.moveTo(ox + path[0][1] * size + half, oy + path[0][0] * size + half);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(ox + path[i][1] * size + half, oy + path[i][0] * size + half);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draw grid lines.
 */
function drawGridLines(ctx, ox, oy, size, cols, rows) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let c = 0; c <= cols; c++) {
    const x = ox + c * size;
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, oy + rows * size);
    ctx.stroke();
  }

  // Horizontal lines
  for (let r = 0; r <= rows; r++) {
    const y = oy + r * size;
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(ox + cols * size, y);
    ctx.stroke();
  }

  // Outer border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(ox, oy, cols * size, rows * size);
}

/**
 * Draw endpoint numbers.
 */
function drawEndpoints(ctx, ox, oy, size, state) {
  const half = size / 2;
  const fontSize = Math.max(Math.floor(size * 0.5), 12);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const pairId = state.endpoints[r][c];
      if (pairId === 0) continue;

      const cx = ox + c * size + half;
      const cy = oy + r * size + half;
      const color = getPairColor(pairId);
      const isComplete = state.completed.has(pairId);

      // Circle background
      ctx.beginPath();
      ctx.arc(cx, cy, half * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = isComplete ? color : hexToRGBA(color, 0.3);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Number text
      ctx.font = `bold ${fontSize}px "Space Grotesk", monospace, sans-serif`;
      ctx.fillStyle = isComplete ? '#0a0a1a' : '#ffffff';
      ctx.fillText(String(pairId), cx, cy + 1);
    }
  }
}

/**
 * Draw HUD: timer, level, completion status.
 */
function drawHUD(ctx, w, h, state, ui) {
  // Top bar
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`LVL ${ui.level}`, 16, 16);

  // Timer
  ctx.textAlign = 'right';
  const seconds = Math.floor(ui.elapsed / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  ctx.fillText(timeStr, w - 16, 16);

  // Difficulty label
  ctx.textAlign = 'center';
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#888';
  ctx.fillText(ui.difficultyLabel, w / 2, 18);

  // Completion counter at bottom
  const completed = state.completed.size;
  const total = state.numPairs;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillStyle = completed === total ? '#44ff66' : '#aaa';
  ctx.fillText(`${completed}/${total} linked`, w / 2, h - 14);

  // Check if all cells filled
  let filledCells = 0;
  const totalCells = state.rows * state.cols;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.playerGrid[r][c] !== 0) filledCells++;
    }
  }
  ctx.font = '12px "Space Grotesk", sans-serif';
  ctx.fillStyle = filledCells === totalCells ? '#44ff66' : '#666';
  ctx.fillText(`${filledCells}/${totalCells} cells`, w / 2, h - 2);
}

/**
 * Render win animation overlay.
 */
export function renderWinOverlay(ctx, w, h, progress) {
  ctx.save();
  ctx.globalAlpha = Math.min(progress * 2, 0.6);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = Math.min(progress * 3, 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText('LINKED!', w / 2, h / 2 - 20);

  ctx.font = '18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText('no cap', w / 2, h / 2 + 20);
  ctx.restore();
}

/**
 * Convert hex color to rgba string.
 */
function hexToRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
