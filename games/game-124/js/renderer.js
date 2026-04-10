/**
 * MEME THREES -- Renderer
 * Draws the 4x4 grid, tiles, score HUD, and next-tile preview.
 */

import { ROWS, COLS, tileScore } from './threes.js';
import { lerp } from '../../shared/utils.js';

// Layout constants (for 400x700 canvas)
const GRID_PADDING = 20;
const GRID_TOP = 120;
const GRID_SIZE = 360;         // 400 - 40 padding
const CELL_GAP = 8;
const CELL_SIZE = (GRID_SIZE - CELL_GAP * (COLS + 1)) / COLS;
const CORNER_RADIUS = 8;
const TILE_CORNER_RADIUS = 6;

// Color map for tile values
const TILE_COLORS = {
  1:    { bg: '#5eb5f7', fg: '#ffffff' },
  2:    { bg: '#f76e6e', fg: '#ffffff' },
  3:    { bg: '#f0f0f0', fg: '#1a1a2e' },
  6:    { bg: '#f5d76e', fg: '#1a1a2e' },
  12:   { bg: '#f7a94b', fg: '#ffffff' },
  24:   { bg: '#e94560', fg: '#ffffff' },
  48:   { bg: '#8b5cf6', fg: '#ffffff' },
  96:   { bg: '#06d6a0', fg: '#1a1a2e' },
  192:  { bg: '#ef476f', fg: '#ffffff' },
  384:  { bg: '#ffd166', fg: '#1a1a2e' },
  768:  { bg: '#118ab2', fg: '#ffffff' },
  1536: { bg: '#073b4c', fg: '#ffffff' },
  3072: { bg: '#ff006e', fg: '#ffffff' },
  6144: { bg: '#fb5607', fg: '#ffffff' },
};

function getTileColors(value) {
  return TILE_COLORS[value] || { bg: '#333', fg: '#fff' };
}

/**
 * Get the pixel position of a cell.
 */
function cellPos(row, col) {
  const x = GRID_PADDING + CELL_GAP + col * (CELL_SIZE + CELL_GAP);
  const y = GRID_TOP + CELL_GAP + row * (CELL_SIZE + CELL_GAP);
  return { x, y };
}

/**
 * Draw a rounded rectangle.
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
 * Draw the background grid.
 */
function drawGridBackground(ctx) {
  // Grid background
  ctx.fillStyle = '#16213e';
  roundRect(ctx, GRID_PADDING, GRID_TOP, GRID_SIZE, GRID_SIZE, CORNER_RADIUS);
  ctx.fill();

  // Empty cell slots
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { x, y } = cellPos(r, c);
      ctx.fillStyle = '#0f3460';
      roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, TILE_CORNER_RADIUS);
      ctx.fill();
    }
  }
}

/**
 * Draw a single tile at pixel position (px, py).
 */
function drawTile(ctx, value, px, py, scale = 1) {
  const colors = getTileColors(value);
  const s = CELL_SIZE * scale;
  const offset = (CELL_SIZE - s) / 2;

  ctx.fillStyle = colors.bg;
  roundRect(ctx, px + offset, py + offset, s, s, TILE_CORNER_RADIUS * scale);
  ctx.fill();

  // Value text
  ctx.fillStyle = colors.fg;
  const fontSize = value >= 1000 ? 18 * scale : value >= 100 ? 22 * scale : 26 * scale;
  ctx.font = `bold ${fontSize}px "Inter", "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), px + CELL_SIZE / 2, py + CELL_SIZE / 2);
}

/**
 * Main render function.
 */
export function render(ctx, state) {
  const { W, H } = state.dimensions;

  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Score HUD
  drawHUD(ctx, state);

  // Grid background
  drawGridBackground(ctx);

  // Draw tiles
  drawTiles(ctx, state);

  // Next tile preview
  drawNextPreview(ctx, state);

  // Instructions at bottom
  drawInstructions(ctx, state);
}

/**
 * Draw the score HUD at the top.
 */
function drawHUD(ctx, state) {
  // Title
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 22px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('MEME THREES', GRID_PADDING, 15);

  // Score
  ctx.fillStyle = '#eaeaea';
  ctx.font = 'bold 28px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(String(state.score), 400 - GRID_PADDING, 12);

  // Score label
  ctx.fillStyle = '#a0a0b0';
  ctx.font = '13px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.fillText('score', 400 - GRID_PADDING, 44);

  // High score
  if (state.highScore > 0) {
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '13px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`best: ${state.highScore}`, GRID_PADDING, 44);
  }

  // Highest tile
  if (state.highestTile >= 3) {
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '13px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`top tile: ${state.highestTile}`, GRID_PADDING, 62);
  }

  // Moves count
  ctx.fillStyle = '#a0a0b0';
  ctx.font = '13px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`moves: ${state.moveCount}`, 400 - GRID_PADDING, 62);

  // Divider line
  ctx.strokeStyle = '#2a2a4e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GRID_PADDING, 85);
  ctx.lineTo(400 - GRID_PADDING, 85);
  ctx.stroke();
}

/**
 * Draw tiles, including animation interpolation.
 */
function drawTiles(ctx, state) {
  const { grid, animatingTiles, animProgress, spawnTile: spawnInfo, mergedPositions } = state;

  // Track which grid cells are covered by animating tiles (don't double-draw)
  const animatedCells = new Set();

  // Draw animating tiles
  if (animatingTiles && animProgress < 1) {
    for (const anim of animatingTiles) {
      const fromPos = cellPos(anim.fromRow, anim.fromCol);
      const toPos = cellPos(anim.toRow, anim.toCol);
      const px = lerp(fromPos.x, toPos.x, easeOut(animProgress));
      const py = lerp(fromPos.y, toPos.y, easeOut(animProgress));

      drawTile(ctx, anim.tile.value, px, py);
      animatedCells.add(`${anim.fromRow},${anim.fromCol}`);
      animatedCells.add(`${anim.toRow},${anim.toCol}`);
    }
  }

  // Draw static tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = grid[r][c];
      if (!tile) continue;

      // Skip if this cell is being animated
      if (animatingTiles && animProgress < 1 && animatedCells.has(`${r},${c}`)) continue;

      const { x, y } = cellPos(r, c);

      // Pop animation for recently merged tiles
      let scale = 1;
      if (mergedPositions && animProgress >= 1) {
        const key = `${r},${c}`;
        if (mergedPositions.has(key) && state.mergePopProgress < 1) {
          const t = state.mergePopProgress;
          scale = 1 + 0.15 * Math.sin(t * Math.PI);
        }
      }

      // Spawn animation
      if (spawnInfo && spawnInfo.row === r && spawnInfo.col === c && state.spawnProgress < 1) {
        scale = easeOut(state.spawnProgress);
      }

      drawTile(ctx, tile.value, x, y, scale);
    }
  }
}

/**
 * Draw the next tile preview near the edge where it will spawn.
 */
function drawNextPreview(ctx, state) {
  if (!state.nextTileValue || state.gameOver) return;

  const previewSize = 32;
  const colors = getTileColors(state.nextTileValue);
  let px, py;

  // Show at the bottom of the grid for now (generic)
  px = 400 / 2 - previewSize / 2;
  py = GRID_TOP + GRID_SIZE + 14;

  // Label
  ctx.fillStyle = '#a0a0b0';
  ctx.font = '11px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('NEXT', 400 / 2, py - 2);

  py += 14;

  ctx.fillStyle = colors.bg;
  roundRect(ctx, px, py, previewSize, previewSize, 4);
  ctx.fill();

  ctx.fillStyle = colors.fg;
  ctx.font = 'bold 14px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(state.nextTileValue), px + previewSize / 2, py + previewSize / 2);
}

/**
 * Draw subtle instructions at the bottom.
 */
function drawInstructions(ctx, state) {
  if (state.moveCount > 5) return; // Hide after a few moves
  ctx.fillStyle = '#555570';
  ctx.font = '12px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('swipe or arrow keys to slide tiles', 200, 690);
}

function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

export { cellPos, CELL_SIZE, GRID_TOP, GRID_SIZE, GRID_PADDING };
