/**
 * MEME REVERSI -- Renderer
 * Canvas-based rendering for the Reversi board, discs, animations, and UI.
 */

import { SIZE, EMPTY, BLACK, WHITE } from './reversi.js';

export const W = 400;
export const H = 700;

// Layout constants
const BOARD_TOP = 120;
const BOARD_LEFT = 16;
const BOARD_SIZE = W - BOARD_LEFT * 2;
const CELL_SIZE = BOARD_SIZE / SIZE;
const DISC_RADIUS = CELL_SIZE * 0.4;
const BOARD_BOTTOM = BOARD_TOP + BOARD_SIZE;

// Colors
const COLOR_BG = '#1a3a1a';
const COLOR_FELT = '#2d7a2d';
const COLOR_FELT_DARK = '#1f5e1f';
const COLOR_GRID = '#1a5a1a';
const COLOR_BLACK_DISC = '#1a1a1a';
const COLOR_BLACK_DISC_LIGHT = '#3a3a3a';
const COLOR_WHITE_DISC = '#f0f0f0';
const COLOR_WHITE_DISC_DARK = '#c8c8c8';
const COLOR_TEXT = '#ffffff';
const COLOR_TEXT_DIM = 'rgba(255,255,255,0.5)';
const COLOR_VALID_DOT = 'rgba(200,255,0,0.45)';
const COLOR_LAST_MOVE = 'rgba(255,235,0,0.5)';
const COLOR_ACCENT = '#c8ff00';

/**
 * Render the full game state to the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from main.js
 */
export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // Header
  drawHeader(ctx, state);

  // Board
  drawBoard(ctx);

  // Last move indicator
  if (state.lastMove) {
    drawLastMove(ctx, state.lastMove.row, state.lastMove.col);
  }

  // Valid move indicators
  if (state.turn === BLACK && !state.animating && !state.ended) {
    drawValidMoves(ctx, state.validMoves);
  }

  // Discs
  drawDiscs(ctx, state);

  // Flip animations
  if (state.flipAnims && state.flipAnims.length > 0) {
    drawFlipAnims(ctx, state.flipAnims);
  }

  // Status text below board
  drawStatus(ctx, state);
}

/**
 * Draw header with title, turn info, difficulty, and score counters.
 */
function drawHeader(ctx, state) {
  // Game title
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MEME REVERSI', W / 2, 28);

  // Difficulty badge
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.fillText(`AI: ${state.difficulty.toUpperCase()}`, W / 2, 46);

  // Disc counts
  const counts = state.counts || { black: 2, white: 2 };

  // Player (black) count - left side
  const leftX = 55;
  const counterY = 78;

  // Black disc icon
  ctx.beginPath();
  ctx.arc(leftX - 22, counterY, 12, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_BLACK_DISC;
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Shine
  ctx.beginPath();
  ctx.arc(leftX - 26, counterY - 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(counts.black), leftX - 4, counterY + 7);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.fillText('YOU', leftX - 4, counterY + 21);

  // AI (white) count - right side
  const rightX = W - 55;

  // White disc icon
  ctx.beginPath();
  ctx.arc(rightX + 22, counterY, 12, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_WHITE_DISC;
  ctx.fill();
  ctx.strokeStyle = COLOR_WHITE_DISC_DARK;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Shine
  ctx.beginPath();
  ctx.arc(rightX + 18, counterY - 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(String(counts.white), rightX + 4, counterY + 7);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.textAlign = 'right';
  ctx.fillText('AI', rightX + 4, counterY + 21);

  // Turn indicator
  if (!state.ended) {
    const turnText = state.turn === BLACK ? 'YOUR TURN' : 'AI THINKING...';
    const turnColor = state.turn === BLACK ? COLOR_ACCENT : COLOR_WHITE_DISC;

    ctx.fillStyle = turnColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(turnText, W / 2, 108);
  }

  ctx.textAlign = 'center';
}

/**
 * Draw the green felt board with grid lines.
 */
function drawBoard(ctx) {
  // Board shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, BOARD_LEFT + 3, BOARD_TOP + 3, BOARD_SIZE, BOARD_SIZE, 6);
  ctx.fill();

  // Board felt background
  ctx.fillStyle = COLOR_FELT;
  roundRect(ctx, BOARD_LEFT, BOARD_TOP, BOARD_SIZE, BOARD_SIZE, 6);
  ctx.fill();

  // Subtle felt texture gradient
  const grad = ctx.createRadialGradient(
    BOARD_LEFT + BOARD_SIZE / 2, BOARD_TOP + BOARD_SIZE / 2, 0,
    BOARD_LEFT + BOARD_SIZE / 2, BOARD_TOP + BOARD_SIZE / 2, BOARD_SIZE * 0.6
  );
  grad.addColorStop(0, 'rgba(255,255,255,0.04)');
  grad.addColorStop(1, 'rgba(0,0,0,0.06)');
  roundRect(ctx, BOARD_LEFT, BOARD_TOP, BOARD_SIZE, BOARD_SIZE, 6);
  ctx.fillStyle = grad;
  ctx.fill();

  // Grid lines
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 1;

  for (let i = 0; i <= SIZE; i++) {
    // Vertical lines
    const x = BOARD_LEFT + i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, BOARD_TOP);
    ctx.lineTo(x, BOARD_TOP + BOARD_SIZE);
    ctx.stroke();

    // Horizontal lines
    const y = BOARD_TOP + i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(BOARD_LEFT, y);
    ctx.lineTo(BOARD_LEFT + BOARD_SIZE, y);
    ctx.stroke();
  }

  // Small dots at the 4 star points (standard Othello board markings)
  const dotPositions = [[2, 2], [2, 6], [6, 2], [6, 6]];
  ctx.fillStyle = COLOR_GRID;
  for (const [r, c] of dotPositions) {
    const cx = BOARD_LEFT + c * CELL_SIZE;
    const cy = BOARD_TOP + r * CELL_SIZE;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Board border
  ctx.strokeStyle = COLOR_FELT_DARK;
  ctx.lineWidth = 2;
  roundRect(ctx, BOARD_LEFT, BOARD_TOP, BOARD_SIZE, BOARD_SIZE, 6);
  ctx.stroke();
}

/**
 * Draw valid move indicator dots.
 */
function drawValidMoves(ctx, validMoves) {
  if (!validMoves) return;
  ctx.fillStyle = COLOR_VALID_DOT;
  for (const move of validMoves) {
    const cx = BOARD_LEFT + move.col * CELL_SIZE + CELL_SIZE / 2;
    const cy = BOARD_TOP + move.row * CELL_SIZE + CELL_SIZE / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL_SIZE * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw last move indicator.
 */
function drawLastMove(ctx, row, col) {
  const x = BOARD_LEFT + col * CELL_SIZE;
  const y = BOARD_TOP + row * CELL_SIZE;
  ctx.strokeStyle = COLOR_LAST_MOVE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
}

/**
 * Draw all placed discs (skipping those currently being flip-animated).
 */
function drawDiscs(ctx, state) {
  // Build set of cells currently animating
  const animatingCells = new Set();
  if (state.flipAnims) {
    for (const anim of state.flipAnims) {
      animatingCells.add(`${anim.row},${anim.col}`);
    }
  }
  // Also skip the placement animation cell
  if (state.placeAnim) {
    animatingCells.add(`${state.placeAnim.row},${state.placeAnim.col}`);
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = state.board[r][c];
      if (cell === EMPTY) continue;
      if (animatingCells.has(`${r},${c}`)) continue;

      drawDisc(ctx, r, c, cell, 1.0);
    }
  }

  // Draw placement animation (scale in)
  if (state.placeAnim) {
    const a = state.placeAnim;
    drawDisc(ctx, a.row, a.col, a.player, a.scale);
  }
}

/**
 * Draw a single disc at a board position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} row
 * @param {number} col
 * @param {number} player - BLACK or WHITE
 * @param {number} scaleX - Horizontal scale for flip animation (1.0 = normal)
 */
function drawDisc(ctx, row, col, player, scaleX) {
  const cx = BOARD_LEFT + col * CELL_SIZE + CELL_SIZE / 2;
  const cy = BOARD_TOP + row * CELL_SIZE + CELL_SIZE / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleX, 1);

  const isBlack = player === BLACK;
  const mainColor = isBlack ? COLOR_BLACK_DISC : COLOR_WHITE_DISC;
  const edgeColor = isBlack ? '#333' : COLOR_WHITE_DISC_DARK;

  // Shadow
  ctx.beginPath();
  ctx.arc(1, 2, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // Main disc
  const discGrad = ctx.createRadialGradient(
    -DISC_RADIUS * 0.3, -DISC_RADIUS * 0.3, 0,
    0, 0, DISC_RADIUS
  );
  if (isBlack) {
    discGrad.addColorStop(0, '#3a3a3a');
    discGrad.addColorStop(1, '#0a0a0a');
  } else {
    discGrad.addColorStop(0, '#ffffff');
    discGrad.addColorStop(1, '#d0d0d0');
  }

  ctx.beginPath();
  ctx.arc(0, 0, DISC_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = discGrad;
  ctx.fill();

  // Edge ring
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Highlight shine
  ctx.beginPath();
  ctx.arc(-DISC_RADIUS * 0.25, -DISC_RADIUS * 0.25, DISC_RADIUS * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)';
  ctx.fill();

  ctx.restore();
}

/**
 * Draw flip animations (disc squeeze + color change).
 */
function drawFlipAnims(ctx, flipAnims) {
  for (const anim of flipAnims) {
    // During first half, show original color squeezing. During second half, show new color expanding.
    const displayPlayer = anim.progress < 0.5 ? anim.fromPlayer : anim.toPlayer;
    const scaleX = anim.progress < 0.5
      ? 1.0 - anim.progress * 2  // squeeze from 1 to 0
      : (anim.progress - 0.5) * 2;  // expand from 0 to 1

    drawDisc(ctx, anim.row, anim.col, displayPlayer, Math.max(0.02, scaleX));
  }
}

/**
 * Draw status text below the board.
 */
function drawStatus(ctx, state) {
  const y = BOARD_BOTTOM + 32;
  ctx.textAlign = 'center';

  if (state.ended) {
    const counts = state.counts || { black: 0, white: 0 };
    ctx.font = 'bold 16px monospace';
    if (counts.black > counts.white) {
      ctx.fillStyle = COLOR_ACCENT;
      ctx.fillText('YOU WIN!', W / 2, y);
    } else if (counts.white > counts.black) {
      ctx.fillStyle = '#ff6666';
      ctx.fillText('AI WINS!', W / 2, y);
    } else {
      ctx.fillStyle = COLOR_TEXT;
      ctx.fillText('DRAW!', W / 2, y);
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.fillText(`${counts.black} - ${counts.white}`, W / 2, y + 22);
  } else if (state.passed) {
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(state.passMessage || 'TURN PASSED', W / 2, y);
  } else if (state.turn === BLACK && !state.animating) {
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.font = '12px monospace';
    ctx.fillText('tap a highlighted cell to place', W / 2, y);
  }
}

/**
 * Convert logical canvas position to board cell.
 * @param {number} x - Logical x
 * @param {number} y - Logical y
 * @returns {{ row: number, col: number } | null}
 */
export function posToCell(x, y) {
  const col = Math.floor((x - BOARD_LEFT) / CELL_SIZE);
  const row = Math.floor((y - BOARD_TOP) / CELL_SIZE);
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
  return { row, col };
}

/**
 * Helper: draw a rounded rectangle path.
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
