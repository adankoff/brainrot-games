/**
 * MEME MATCH -- Renderer
 * All canvas drawing: board, gems, HUD, animations.
 */

import { COLS, ROWS, NUM_TYPES } from './match3.js';

// Layout constants
const BOARD_PADDING_X = 12;
const BOARD_TOP = 100;
const CANVAS_W = 400;
const CANVAS_H = 700;

const CELL_SIZE = (CANVAS_W - BOARD_PADDING_X * 2) / COLS; // ~47
const GEM_RADIUS = CELL_SIZE * 0.38;

const GEM_EMOJIS = ['\uD83D\uDD34', '\uD83D\uDD35', '\uD83D\uDFE2', '\uD83D\uDFE1', '\uD83D\uDFE3', '\uD83D\uDFE0'];
const GEM_COLORS = ['#ff4444', '#4488ff', '#44cc44', '#ffcc00', '#bb44ff', '#ff8800'];
const GEM_GLOW   = ['#ff666644', '#6699ff44', '#66ee6644', '#ffdd4444', '#cc66ff44', '#ffaa4444'];

/**
 * Convert grid position to pixel center.
 */
export function cellToPixel(row, col) {
  return {
    x: BOARD_PADDING_X + col * CELL_SIZE + CELL_SIZE / 2,
    y: BOARD_TOP + row * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * Convert pixel to grid position. Returns {r, c} or null if out of bounds.
 */
export function pixelToCell(x, y) {
  const c = Math.floor((x - BOARD_PADDING_X) / CELL_SIZE);
  const r = Math.floor((y - BOARD_TOP) / CELL_SIZE);
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
  return { r, c };
}

/**
 * Draw the full game frame.
 */
export function render(ctx, state) {
  // Background
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawHUD(ctx, state);
  drawBoard(ctx, state);
  drawGems(ctx, state);
  drawFloatingScores(ctx, state);

  if (state.shuffleMessage > 0) {
    drawShuffleMessage(ctx, state);
  }
}

function drawHUD(ctx, state) {
  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${state.score}`, 16, 16);

  // Cascade multiplier
  if (state.cascadeLevel > 0) {
    ctx.fillStyle = '#ff6b9d';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`x${state.cascadeLevel + 1} COMBO`, 16, 50);
  }

  // Timer
  const timeLeft = Math.max(0, Math.ceil(state.timeLeft / 1000));
  ctx.fillStyle = timeLeft <= 10 ? '#ff4444' : '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${timeLeft}s`, CANVAS_W - 16, 16);

  // Timer bar
  const barY = 80;
  const barW = CANVAS_W - 32;
  const barH = 8;
  const pct = Math.max(0, state.timeLeft / state.totalTime);
  ctx.fillStyle = '#333';
  ctx.fillRect(16, barY, barW, barH);

  const hue = pct * 120; // green -> red
  ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
  ctx.fillRect(16, barY, barW * pct, barH);
}

function drawBoard(ctx, state) {
  // Board background
  ctx.fillStyle = '#0d0520';
  const bx = BOARD_PADDING_X - 4;
  const by = BOARD_TOP - 4;
  const bw = COLS * CELL_SIZE + 8;
  const bh = ROWS * CELL_SIZE + 8;
  ctx.beginPath();
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();

  // Grid lines (subtle)
  ctx.strokeStyle = '#1e1040';
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    const y = BOARD_TOP + r * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING_X, y);
    ctx.lineTo(BOARD_PADDING_X + COLS * CELL_SIZE, y);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    const x = BOARD_PADDING_X + c * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, BOARD_TOP);
    ctx.lineTo(x, BOARD_TOP + ROWS * CELL_SIZE);
    ctx.stroke();
  }
}

function drawGems(ctx, state) {
  const { board, selected, animatingGems, clearingGems } = state;

  // Build a set of currently animating positions for skipping static draw
  const animKeys = new Set();
  for (const ag of animatingGems) {
    animKeys.add(ag.r * COLS + ag.c);
  }
  const clearKeys = new Set();
  for (const cg of clearingGems) {
    clearKeys.add(cg.r * COLS + cg.c);
  }

  // Draw static gems
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = board[r][c];
      if (type < 0) continue;
      const key = r * COLS + c;
      if (animKeys.has(key) || clearKeys.has(key)) continue;

      const { x, y } = cellToPixel(r, c);
      const isSelected = selected && selected.r === r && selected.c === c;

      drawGem(ctx, x, y, type, isSelected ? 1.15 : 1.0, 1.0);

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, GEM_RADIUS + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Draw animating gems (swap / fall / spawn)
  for (const ag of animatingGems) {
    if (ag.type < 0) continue;
    drawGem(ctx, ag.x, ag.y, ag.type, ag.scale || 1.0, ag.alpha !== undefined ? ag.alpha : 1.0);
  }

  // Draw clearing gems (pop animation)
  for (const cg of clearingGems) {
    if (cg.type < 0) continue;
    drawGem(ctx, cg.x, cg.y, cg.type, cg.scale, cg.alpha);
  }
}

function drawGem(ctx, x, y, type, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Glow
  ctx.fillStyle = GEM_GLOW[type] || '#ffffff22';
  ctx.beginPath();
  ctx.arc(0, 0, GEM_RADIUS + 4, 0, Math.PI * 2);
  ctx.fill();

  // Main circle
  ctx.fillStyle = GEM_COLORS[type];
  ctx.beginPath();
  ctx.arc(0, 0, GEM_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = '#ffffff33';
  ctx.beginPath();
  ctx.arc(-GEM_RADIUS * 0.2, -GEM_RADIUS * 0.25, GEM_RADIUS * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Emoji
  ctx.font = `${Math.round(GEM_RADIUS * 1.1)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(GEM_EMOJIS[type], 0, 1);

  ctx.restore();
}

function drawFloatingScores(ctx, state) {
  for (const fs of state.floatingScores) {
    ctx.save();
    ctx.globalAlpha = fs.alpha;
    ctx.fillStyle = '#ff6b9d';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${fs.value}`, fs.x, fs.y);
    ctx.restore();
  }
}

function drawShuffleMessage(ctx, state) {
  const alpha = Math.min(1, state.shuffleMessage / 500);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(0, CANVAS_H / 2 - 30, CANVAS_W, 60);
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHUFFLING...', CANVAS_W / 2, CANVAS_H / 2);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export { CELL_SIZE, BOARD_TOP, BOARD_PADDING_X, GEM_RADIUS, CANVAS_W, CANVAS_H };
