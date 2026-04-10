/**
 * CONNECT FOUR -- Renderer
 * Canvas-based rendering for the Connect Four board, discs, and UI.
 */

import { ROWS, COLS, EMPTY, PLAYER, AI } from './connect4.js';

export const W = 400;
export const H = 700;

// Layout constants
const BOARD_TOP = 120;
const BOARD_LEFT = 15;
const BOARD_WIDTH = W - BOARD_LEFT * 2;
const BOARD_HEIGHT = (BOARD_WIDTH / COLS) * ROWS;
const CELL_SIZE = BOARD_WIDTH / COLS;
const DISC_RADIUS = CELL_SIZE * 0.38;
const BOARD_BOTTOM = BOARD_TOP + BOARD_HEIGHT;

// Colors
const COLOR_BG = '#0a0a2e';
const COLOR_BOARD = '#1565c0';
const COLOR_BOARD_DARK = '#0d47a1';
const COLOR_YELLOW = '#ffeb3b';
const COLOR_YELLOW_DARK = '#f9a825';
const COLOR_RED = '#f44336';
const COLOR_RED_DARK = '#c62828';
const COLOR_HOLE = '#0a0a2e';
const COLOR_TEXT = '#ffffff';
const COLOR_TEXT_DIM = 'rgba(255,255,255,0.5)';
const COLOR_HIGHLIGHT = 'rgba(255,255,255,0.15)';
const COLOR_WIN_GLOW = 'rgba(255,255,255,0.8)';

/**
 * Render the full game state to the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from main.js
 * @returns {Object} Column bounds for hit-testing
 */
export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // Header
  drawHeader(ctx, state);

  // Column hover highlight
  if (state.hoverCol >= 0 && state.hoverCol < COLS && state.turn === PLAYER && !state.winner && !state.draw && !state.animating) {
    drawColumnHighlight(ctx, state.hoverCol);
  }

  // Preview disc above board
  if (state.hoverCol >= 0 && state.hoverCol < COLS && state.turn === PLAYER && !state.winner && !state.draw && !state.animating) {
    drawPreviewDisc(ctx, state.hoverCol);
  }

  // Board background
  drawBoard(ctx);

  // Discs (skip the animating disc position)
  drawDiscs(ctx, state);

  // Drop animation
  if (state.animating && state.animDisc) {
    drawAnimatingDisc(ctx, state.animDisc);
  }

  // Winning cells highlight
  if (state.winCells && state.winCells.length > 0) {
    drawWinHighlight(ctx, state.winCells, state.winPulse || 0);
  }

  // Status text below board
  drawStatus(ctx, state);

  // Return column bounds for click detection
  return getColumnBounds();
}

/**
 * Draw the header showing turn info and difficulty.
 */
function drawHeader(ctx, state) {
  // Game title
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CONNECT FOUR', W / 2, 30);

  // Difficulty badge
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.fillText(`AI: ${state.difficulty.toUpperCase()}`, W / 2, 50);

  // Turn indicator
  if (!state.winner && !state.draw) {
    const turnText = state.turn === PLAYER ? 'YOUR TURN' : 'AI THINKING...';
    const turnColor = state.turn === PLAYER ? COLOR_YELLOW : COLOR_RED;

    // Disc icon
    const iconX = W / 2 - 60;
    const iconY = 78;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 10, 0, Math.PI * 2);
    ctx.fillStyle = turnColor;
    ctx.fill();
    ctx.strokeStyle = state.turn === PLAYER ? COLOR_YELLOW_DARK : COLOR_RED_DARK;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = turnColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(turnText, iconX + 18, 83);
  }

  // Move counter
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`moves: ${state.moveCount}`, W - 20, 105);

  ctx.textAlign = 'center';
}

/**
 * Draw column highlight on hover.
 */
function drawColumnHighlight(ctx, col) {
  const x = BOARD_LEFT + col * CELL_SIZE;
  ctx.fillStyle = COLOR_HIGHLIGHT;
  ctx.fillRect(x, BOARD_TOP, CELL_SIZE, BOARD_HEIGHT);
}

/**
 * Draw preview disc above the board.
 */
function drawPreviewDisc(ctx, col) {
  const cx = BOARD_LEFT + col * CELL_SIZE + CELL_SIZE / 2;
  const cy = BOARD_TOP - 20;

  ctx.beginPath();
  ctx.arc(cx, cy, DISC_RADIUS * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 235, 59, 0.5)';
  ctx.fill();
}

/**
 * Draw the blue board with holes.
 */
function drawBoard(ctx) {
  // Board body with rounded corners
  const r = 8;
  const x = BOARD_LEFT;
  const y = BOARD_TOP;
  const w = BOARD_WIDTH;
  const h = BOARD_HEIGHT;

  ctx.fillStyle = COLOR_BOARD;
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
  ctx.fill();

  // Darker bottom edge for depth
  ctx.fillStyle = COLOR_BOARD_DARK;
  ctx.beginPath();
  ctx.moveTo(x, y + h - 12);
  ctx.lineTo(x + w, y + h - 12);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.closePath();
  ctx.fill();

  // Holes (will be drawn over by discs where present)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_LEFT + col * CELL_SIZE + CELL_SIZE / 2;
      const cy = BOARD_TOP + row * CELL_SIZE + CELL_SIZE / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, DISC_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_HOLE;
      ctx.fill();
    }
  }
}

/**
 * Draw all placed discs.
 */
function drawDiscs(ctx, state) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = state.board[r][c];
      if (cell === EMPTY) continue;

      // Skip the disc being animated
      if (state.animating && state.animDisc && state.animDisc.col === c && state.animDisc.targetRow === r) {
        continue;
      }

      drawDisc(ctx, r, c, cell);
    }
  }
}

/**
 * Draw a single disc at a board position.
 */
function drawDisc(ctx, row, col, player) {
  const cx = BOARD_LEFT + col * CELL_SIZE + CELL_SIZE / 2;
  const cy = BOARD_TOP + row * CELL_SIZE + CELL_SIZE / 2;

  const mainColor = player === PLAYER ? COLOR_YELLOW : COLOR_RED;
  const darkColor = player === PLAYER ? COLOR_YELLOW_DARK : COLOR_RED_DARK;

  // Shadow
  ctx.beginPath();
  ctx.arc(cx, cy + 2, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = darkColor;
  ctx.fill();

  // Main disc
  ctx.beginPath();
  ctx.arc(cx, cy, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.fill();

  // Highlight shine
  ctx.beginPath();
  ctx.arc(cx - DISC_RADIUS * 0.25, cy - DISC_RADIUS * 0.25, DISC_RADIUS * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
}

/**
 * Draw the disc that is currently animating (falling).
 */
function drawAnimatingDisc(ctx, anim) {
  const cx = BOARD_LEFT + anim.col * CELL_SIZE + CELL_SIZE / 2;
  const cy = BOARD_TOP + anim.currentY * CELL_SIZE + CELL_SIZE / 2;

  const mainColor = anim.player === PLAYER ? COLOR_YELLOW : COLOR_RED;
  const darkColor = anim.player === PLAYER ? COLOR_YELLOW_DARK : COLOR_RED_DARK;

  // Shadow
  ctx.beginPath();
  ctx.arc(cx, cy + 2, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = darkColor;
  ctx.fill();

  // Main disc
  ctx.beginPath();
  ctx.arc(cx, cy, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.fill();

  // Shine
  ctx.beginPath();
  ctx.arc(cx - DISC_RADIUS * 0.25, cy - DISC_RADIUS * 0.25, DISC_RADIUS * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
}

/**
 * Draw the winning 4 cells with a pulsing glow.
 */
function drawWinHighlight(ctx, winCells, pulse) {
  const glowAlpha = 0.4 + 0.4 * Math.sin(pulse);

  for (const [r, c] of winCells) {
    const cx = BOARD_LEFT + c * CELL_SIZE + CELL_SIZE / 2;
    const cy = BOARD_TOP + r * CELL_SIZE + CELL_SIZE / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, DISC_RADIUS + 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${glowAlpha.toFixed(2)})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

/**
 * Draw status text below the board.
 */
function drawStatus(ctx, state) {
  const y = BOARD_BOTTOM + 40;

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px monospace';

  if (state.winner === PLAYER) {
    ctx.fillStyle = COLOR_YELLOW;
    ctx.fillText('YOU WIN!', W / 2, y);
  } else if (state.winner === AI) {
    ctx.fillStyle = COLOR_RED;
    ctx.fillText('AI WINS!', W / 2, y);
  } else if (state.draw) {
    ctx.fillStyle = COLOR_TEXT;
    ctx.fillText('DRAW!', W / 2, y);
  } else if (state.turn === PLAYER && !state.animating) {
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.font = '12px monospace';
    ctx.fillText('tap a column or press 1-7', W / 2, y);
  }

  // Key hints
  if (!state.winner && !state.draw && state.turn === PLAYER && !state.animating) {
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.font = '10px monospace';
    ctx.fillText('arrow keys + enter also work', W / 2, y + 20);
  }
}

/**
 * Get column bounding rectangles for click detection.
 * @returns {Object} Map of col index -> { x, y, width, height }
 */
function getColumnBounds() {
  const bounds = {};
  for (let c = 0; c < COLS; c++) {
    bounds[c] = {
      x: BOARD_LEFT + c * CELL_SIZE,
      y: 0,
      width: CELL_SIZE,
      height: BOARD_BOTTOM + 10,
    };
  }
  return bounds;
}

/**
 * Convert a logical x position to a column index (or -1 if out of bounds).
 * @param {number} x
 * @returns {number}
 */
export function xToCol(x) {
  const col = Math.floor((x - BOARD_LEFT) / CELL_SIZE);
  if (col < 0 || col >= COLS) return -1;
  return col;
}
