/**
 * MEME 2048 -- Renderer
 * All Canvas drawing: board grid, tiles with slide/merge/spawn animations,
 * score HUD, and game-over board state.
 */

import { GRID_SIZE } from './board.js';
import { getTileColor } from './themes.js';
import { lerp, clamp, formatScore } from '../../shared/utils.js';

// ---- Board Layout Constants ----

export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 700;

const BOARD_PADDING = 16;
const CELL_GAP = 8;
const BOARD_SIZE = LOGICAL_WIDTH - BOARD_PADDING * 2; // 368
const CELL_SIZE = (BOARD_SIZE - CELL_GAP * (GRID_SIZE + 1)) / GRID_SIZE; // ~82
const BOARD_X = BOARD_PADDING;
const BOARD_Y = 140;
const BOARD_RADIUS = 10;
const CELL_RADIUS = 6;

/**
 * Get the pixel position of a cell's top-left corner.
 *
 * @param {number} row
 * @param {number} col
 * @returns {{ x: number, y: number }}
 */
export function getCellPos(row, col) {
  return {
    x: BOARD_X + CELL_GAP + col * (CELL_SIZE + CELL_GAP),
    y: BOARD_Y + CELL_GAP + row * (CELL_SIZE + CELL_GAP),
  };
}

// ---- Rounded Rectangle Helper ----

/**
 * Draw a rounded rectangle.
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

// ---- Main Render Function ----

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./board.js').BoardState} board
 * @param {Object} theme - Current theme definition
 * @param {Object} anim - Animation state from main.js
 */
export function renderFrame(ctx, board, theme, anim) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  ctx.save();

  // ---- Background ----
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, W, H);

  // Gaming theme: subtle scan lines
  if (theme.id === 'gaming') {
    ctx.fillStyle = 'rgba(0,255,0,0.02)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 1);
    }
  }

  // Cat theme: subtle paw prints in background
  if (theme.id === 'cats') {
    ctx.fillStyle = 'rgba(255,105,180,0.04)';
    for (let i = 0; i < 8; i++) {
      const px = (i * 157.3 + 40) % W;
      const py = (i * 113.7 + 60) % H;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.arc(px - 4, py - 5, 2, 0, Math.PI * 2);
      ctx.arc(px + 4, py - 5, 2, 0, Math.PI * 2);
      ctx.arc(px - 6, py - 1, 2, 0, Math.PI * 2);
      ctx.arc(px + 6, py - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- HUD: Score ----
  drawHUD(ctx, board, theme, W, anim);

  // ---- Board Background ----
  ctx.fillStyle = theme.boardBgColor;
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_SIZE, BOARD_SIZE, BOARD_RADIUS);
  ctx.fill();

  // ---- Empty Cells ----
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const pos = getCellPos(r, c);
      ctx.fillStyle = theme.cellEmptyColor;
      roundRect(ctx, pos.x, pos.y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
      ctx.fill();
    }
  }

  // ---- Tiles ----
  if (anim.phase === 'sliding') {
    // During slide animation, draw tiles at interpolated positions
    drawSlidingTiles(ctx, board, theme, anim);
  } else if (anim.phase === 'merging') {
    // After slide, show merge pulse and spawn fade-in
    drawMergingTiles(ctx, board, theme, anim);
  } else {
    // Static: draw tiles at grid positions
    drawStaticTiles(ctx, board, theme, anim.frameCount);
  }

  // ---- Floating score text ----
  for (const ft of anim.floatingTexts) {
    drawFloatingText(ctx, ft, theme);
  }

  ctx.restore();
}

// ---- Tile Drawing ----

/**
 * Draw a single tile at a given pixel position with optional scale.
 */
function drawTile(ctx, theme, value, px, py, scale, animFrame) {
  const color = getTileColor(theme, value);
  const sz = CELL_SIZE * scale;
  const offset = (CELL_SIZE - sz) / 2;
  const tx = px + offset;
  const ty = py + offset;

  ctx.save();

  // Tile background
  ctx.fillStyle = color;
  roundRect(ctx, tx, ty, sz, sz, CELL_RADIUS * scale);
  ctx.fill();

  // Subtle highlights
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, tx, ty, sz, sz * 0.08, CELL_RADIUS * scale);
  ctx.fill();

  // Character drawing
  const cx = tx + sz / 2;
  const cy_char = ty + sz * 0.45;
  theme.drawChar(ctx, cx, cy_char, sz, value, animFrame);

  // Value text at bottom of tile
  const fontSize = value >= 1024 ? 10 : (value >= 128 ? 11 : 12);
  ctx.font = `bold ${fontSize * scale}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = theme.textColor;
  ctx.globalAlpha = 0.9;
  ctx.fillText(String(value), tx + sz / 2, ty + sz - 3 * scale);
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw tiles at their static grid positions (no animation).
 */
function drawStaticTiles(ctx, board, theme, frameCount) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tile = board.grid[r][c];
      if (!tile) continue;
      const pos = getCellPos(r, c);
      drawTile(ctx, theme, tile.value, pos.x, pos.y, 1.0, frameCount);
    }
  }
}

/**
 * Draw tiles interpolating from old position to new position during slide.
 * During slide phase, render exclusively from the moves array.
 * The grid already contains the final state (including spawned tile)
 * but we only show pre-spawn state during slide.
 */
function drawSlidingTiles(ctx, board, theme, anim) {
  const t = clamp(anim.slideProgress, 0, 1);
  const eased = easeOutQuad(t);

  for (const move of anim.moves) {
    const fromPos = getCellPos(move.fromRow, move.fromCol);
    const toPos = getCellPos(move.toRow, move.toCol);
    const px = lerp(fromPos.x, toPos.x, eased);
    const py = lerp(fromPos.y, toPos.y, eased);

    // For merged tiles, draw at the pre-merge value (value / 2)
    const drawValue = move.merged ? move.value / 2 : move.value;
    drawTile(ctx, theme, drawValue, px, py, 1.0, anim.frameCount);
  }
}

/**
 * Draw tiles with merge pulse and spawn fade-in after slide completes.
 */
function drawMergingTiles(ctx, board, theme, anim) {
  const mergeT = clamp(anim.mergeProgress, 0, 1);
  const spawnT = clamp(anim.spawnProgress, 0, 1);

  // Merge pulse: scale 1.0 -> 1.2 -> 1.0
  let mergeScale;
  if (mergeT < 0.5) {
    mergeScale = lerp(1.0, 1.2, mergeT * 2);
  } else {
    mergeScale = lerp(1.2, 1.0, (mergeT - 0.5) * 2);
  }

  // Spawn: scale from 0.5 to 1.0
  const spawnScale = lerp(0.5, 1.0, easeOutQuad(spawnT));
  const spawnAlpha = clamp(spawnT, 0, 1);

  const mergedIds = new Set(anim.mergedIds);
  const spawnPositions = new Set(anim.spawns.map((s) => `${s.row},${s.col}`));

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tile = board.grid[r][c];
      if (!tile) continue;
      const pos = getCellPos(r, c);
      const key = `${r},${c}`;

      if (mergedIds.has(tile.id)) {
        // Merged tile: pulse animation
        drawTile(ctx, theme, tile.value, pos.x, pos.y, mergeScale, anim.frameCount);
      } else if (spawnPositions.has(key)) {
        // Spawned tile: fade-in and scale-up
        ctx.save();
        ctx.globalAlpha = spawnAlpha;
        drawTile(ctx, theme, tile.value, pos.x, pos.y, spawnScale, anim.frameCount);
        ctx.restore();
      } else {
        // Regular tile
        drawTile(ctx, theme, tile.value, pos.x, pos.y, 1.0, anim.frameCount);
      }
    }
  }
}

// ---- HUD ----

/**
 * Draw the score display and theme label.
 */
function drawHUD(ctx, board, theme, W, anim) {
  ctx.save();

  // Score label
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.7;
  ctx.fillText(theme.scoreLabel, W / 2, 20);
  ctx.globalAlpha = 1;

  // Score value
  ctx.font = 'bold 40px "Space Grotesk", sans-serif';
  ctx.fillStyle = theme.textColor;
  ctx.fillText(formatScore(board.score), W / 2, 38);

  // Highest tile indicator
  const highest = board.getHighestTile();
  if (highest >= 8) {
    const tierName = theme.tiers[highest]?.name || String(highest);
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.6;
    ctx.fillText(tierName, W / 2, 86);
    ctx.globalAlpha = 1;
  }

  // Swipe hint below board (only when no moves have been made yet)
  if (board.score === 0 && anim.phase === 'idle') {
    const hintY = BOARD_Y + BOARD_SIZE + 30;
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.3 + Math.sin(anim.frameCount * 0.05) * 0.2;
    ctx.fillText('swipe or arrow keys to play', W / 2, hintY);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ---- Floating Score Text ----

function drawFloatingText(ctx, ft, theme) {
  const progress = 1 - ft.timer / ft.maxTimer;
  const alpha = progress > 0.6 ? lerp(1, 0, (progress - 0.6) / 0.4) : 1;
  const yOff = progress * -40;
  const scale = progress < 0.2 ? lerp(0.5, 1.1, progress / 0.2) : (progress < 0.3 ? lerp(1.1, 1.0, (progress - 0.2) / 0.1) : 1.0);

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(ft.x, ft.y + yOff);
  ctx.scale(scale, scale);
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(ft.text, 1, 1);
  ctx.fillStyle = theme.accentColor;
  ctx.fillText(ft.text, 0, 0);
  ctx.restore();
}

// ---- Easing ----

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
