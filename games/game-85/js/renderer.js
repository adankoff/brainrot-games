/**
 * MEME SLIDE -- Renderer
 * Canvas drawing for tiles, HUD, and animations.
 */

import { lerp, easeOutCubic } from '../../shared/utils.js';

const W = 400;
const H = 700;

// Colors
const BG_COLOR = '#0a0e1a';
const TILE_GRADIENT_TOP = '#1a3a5c';
const TILE_GRADIENT_BOT = '#0d1f33';
const TILE_BORDER = '#00e5ff';
const TILE_TEXT = '#e0f7fa';
const TILE_SOLVED_GLOW = '#00e5ff';
const EMPTY_COLOR = '#060b14';
const HUD_TEXT = '#b0bec5';
const HUD_ACCENT = '#00e5ff';

// Layout cache per size
const layoutCache = {};

/**
 * Compute grid layout for a given puzzle size.
 *
 * @param {number} size
 * @returns {{ tileSize: number, gap: number, gridX: number, gridY: number, gridSize: number }}
 */
function getLayout(size) {
  if (layoutCache[size]) return layoutCache[size];

  const maxGridWidth = 360;
  const gap = size <= 3 ? 6 : (size <= 4 ? 5 : 4);
  const totalGap = (size + 1) * gap;
  const tileSize = Math.floor((maxGridWidth - totalGap) / size);
  const gridSize = tileSize * size + (size + 1) * gap;
  const gridX = (W - gridSize) / 2;
  const gridY = 120;

  const layout = { tileSize, gap, gridX, gridY, gridSize };
  layoutCache[size] = layout;
  return layout;
}

/**
 * Get the pixel position of a tile at (row, col).
 *
 * @param {number} row
 * @param {number} col
 * @param {Object} layout
 * @returns {{ x: number, y: number }}
 */
function tilePos(row, col, layout) {
  const { tileSize, gap, gridX, gridY } = layout;
  return {
    x: gridX + gap + col * (tileSize + gap),
    y: gridY + gap + row * (tileSize + gap),
  };
}

/**
 * Convert a canvas position to grid (row, col).
 *
 * @param {number} px - Canvas x
 * @param {number} py - Canvas y
 * @param {number} size - Grid size
 * @returns {{ row: number, col: number } | null}
 */
export function canvasToGrid(px, py, size) {
  const layout = getLayout(size);
  const { tileSize, gap, gridX, gridY, gridSize } = layout;

  const lx = px - gridX;
  const ly = py - gridY;

  if (lx < 0 || ly < 0 || lx >= gridSize || ly >= gridSize) return null;

  const col = Math.floor((lx - gap) / (tileSize + gap));
  const row = Math.floor((ly - gap) / (tileSize + gap));

  if (row < 0 || row >= size || col < 0 || col >= size) return null;

  // Verify the tap is actually on the tile, not in the gap
  const tp = tilePos(row, col, layout);
  if (px < tp.x || px > tp.x + tileSize || py < tp.y || py > tp.y + tileSize) return null;

  return { row, col };
}

/**
 * Draw a single tile.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} tileSize
 * @param {number} value - Tile number (0 = empty)
 * @param {boolean} solved - Whether puzzle is solved (for glow effect)
 * @param {number} solvedGlow - 0-1 glow intensity
 */
function drawTile(ctx, x, y, tileSize, value, solved, solvedGlow) {
  if (value === 0) {
    // Empty space
    ctx.fillStyle = EMPTY_COLOR;
    roundRect(ctx, x, y, tileSize, tileSize, 8);
    ctx.fill();
    return;
  }

  const radius = 8;

  // Tile background gradient
  const grad = ctx.createLinearGradient(x, y, x, y + tileSize);
  if (solved && solvedGlow > 0) {
    const g = solvedGlow;
    grad.addColorStop(0, lerpColor('#1a3a5c', '#0d4a3a', g));
    grad.addColorStop(1, lerpColor('#0d1f33', '#062a1a', g));
  } else {
    grad.addColorStop(0, TILE_GRADIENT_TOP);
    grad.addColorStop(1, TILE_GRADIENT_BOT);
  }

  ctx.fillStyle = grad;
  roundRect(ctx, x, y, tileSize, tileSize, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = solved && solvedGlow > 0
    ? lerpColor(TILE_BORDER, '#00ff88', solvedGlow)
    : TILE_BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, tileSize, tileSize, radius);
  ctx.stroke();

  // Solved glow
  if (solved && solvedGlow > 0) {
    ctx.save();
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12 * solvedGlow;
    ctx.strokeStyle = `rgba(0, 255, 136, ${0.6 * solvedGlow})`;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, tileSize, tileSize, radius);
    ctx.stroke();
    ctx.restore();
  }

  // Number text
  const fontSize = tileSize <= 50 ? 18 : (tileSize <= 70 ? 24 : 30);
  ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = solved && solvedGlow > 0
    ? lerpColor(TILE_TEXT, '#00ff88', solvedGlow)
    : TILE_TEXT;
  ctx.fillText(String(value), x + tileSize / 2, y + tileSize / 2 + 1);
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state
 */
export function render(ctx, state) {
  const { puzzle, moves, elapsed, solved, solvedGlow, animatingTile, difficulty } = state;
  if (!puzzle) return;

  const { grid, size } = puzzle;
  const layout = getLayout(size);
  const { tileSize, gridX, gridY, gridSize } = layout;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // HUD: difficulty label
  ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HUD_ACCENT;
  const diffLabels = { 3: 'EASY (3x3)', 4: 'MEDIUM (4x4)', 5: 'HARD (5x5)' };
  ctx.fillText(diffLabels[size] || `${size}x${size}`, W / 2, 16);

  // HUD: moves + timer
  ctx.font = "bold 18px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HUD_TEXT;
  ctx.fillText(`moves: ${moves}`, gridX, 48);

  ctx.textAlign = 'right';
  const secs = Math.floor(elapsed);
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  const timeStr = `${mins}:${String(remSecs).padStart(2, '0')}`;
  ctx.fillText(`time: ${timeStr}`, gridX + gridSize, 48);

  // HUD: title
  ctx.font = "bold 28px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = HUD_ACCENT;
  ctx.fillText('MEME SLIDE', W / 2, 80);

  // Grid background
  ctx.fillStyle = '#0d1222';
  roundRect(ctx, gridX, gridY, gridSize, gridSize, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, gridX, gridY, gridSize, gridSize, 12);
  ctx.stroke();

  // Draw tiles
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = grid[r][c];

      // Skip if this tile is currently animating
      if (animatingTile && animatingTile.value === value && value !== 0) {
        continue;
      }

      const pos = tilePos(r, c, layout);
      drawTile(ctx, pos.x, pos.y, tileSize, value, solved, solvedGlow);
    }
  }

  // Draw animating tile on top
  if (animatingTile) {
    const { fromRow, fromCol, toRow, toCol, progress, value } = animatingTile;
    const fromPos = tilePos(fromRow, fromCol, layout);
    const toPos = tilePos(toRow, toCol, layout);
    const t = easeOutCubic(progress);
    const ax = lerp(fromPos.x, toPos.x, t);
    const ay = lerp(fromPos.y, toPos.y, t);
    drawTile(ctx, ax, ay, tileSize, value, false, 0);
  }

  // Instructions at bottom
  if (!solved) {
    ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(176, 190, 197, 0.5)';
    ctx.fillText('tap a tile next to the gap to slide it', W / 2, H - 30);
    ctx.fillText('or use arrow keys', W / 2, H - 12);
  }

  // Solved message
  if (solved) {
    const yBase = gridY + gridSize + 40;
    ctx.font = "bold 32px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00ff88';
    ctx.fillText('SOLVED!', W / 2, yBase);

    ctx.font = "18px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = HUD_TEXT;
    ctx.fillText(`${moves} moves in ${timeStr}`, W / 2, yBase + 44);
  }
}

// ---- Helpers ----

/**
 * Draw a rounded rectangle path.
 */
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

/**
 * Linearly interpolate between two hex colors.
 */
function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const rr = Math.round(lerp(ar, br, t));
  const rg = Math.round(lerp(ag, bg, t));
  const rb = Math.round(lerp(ab, bb, t));
  return `#${rr.toString(16).padStart(2, '0')}${rg.toString(16).padStart(2, '0')}${rb.toString(16).padStart(2, '0')}`;
}
