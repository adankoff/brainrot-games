/**
 * PEG SOLITAIRE -- Renderer
 * Draws the board, pegs, holes, selections, highlights, and animations.
 */

import { GRID_SIZE, W, H } from './pegsolitaire.js';
import { lerp, easeOutCubic } from '../../shared/utils.js';

// -- Layout Constants --

/** Board drawing area */
const BOARD_TOP = 120;
const CELL_SIZE = 48;
const PEG_RADIUS = 18;
const HOLE_RADIUS = 10;
const BOARD_PIXEL_SIZE = GRID_SIZE * CELL_SIZE;
const BOARD_LEFT = (W - BOARD_PIXEL_SIZE) / 2;

// -- Colors --

const COLOR_BG = '#1a1a2e';
const COLOR_BOARD_BG = '#16213e';
const COLOR_HOLE = '#0f1629';
const COLOR_HOLE_BORDER = '#2a2a4a';
const COLOR_PEG = '#e8a43a';
const COLOR_PEG_DARK = '#c4852a';
const COLOR_PEG_LIGHT = '#f0c060';
const COLOR_SELECTED = '#ff6b6b';
const COLOR_SELECTED_GLOW = 'rgba(255, 107, 107, 0.4)';
const COLOR_VALID_DEST = 'rgba(100, 255, 100, 0.5)';
const COLOR_VALID_DEST_BORDER = '#66ff66';
const COLOR_TEXT = '#e0e0e0';
const COLOR_TEXT_DIM = '#888';
const COLOR_UNDO_BG = '#2a2a4a';
const COLOR_UNDO_HOVER = '#3a3a5a';

// -- Undo Button Layout --

const UNDO_BTN = { x: W / 2 - 50, y: H - 70, w: 100, h: 40 };

/**
 * Convert grid row/col to pixel center x/y.
 *
 * @param {number} r
 * @param {number} c
 * @returns {{ x: number, y: number }}
 */
export function gridToPixel(r, c) {
  return {
    x: BOARD_LEFT + c * CELL_SIZE + CELL_SIZE / 2,
    y: BOARD_TOP + r * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * Convert pixel x/y to grid row/col (nearest cell).
 * Returns null if outside the board area.
 *
 * @param {number} px
 * @param {number} py
 * @returns {{ r: number, c: number }|null}
 */
export function pixelToGrid(px, py) {
  const c = Math.floor((px - BOARD_LEFT) / CELL_SIZE);
  const r = Math.floor((py - BOARD_TOP) / CELL_SIZE);
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null;
  return { r, c };
}

/**
 * Check if a point is inside the undo button.
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function isUndoHit(x, y) {
  return (
    x >= UNDO_BTN.x &&
    x <= UNDO_BTN.x + UNDO_BTN.w &&
    y >= UNDO_BTN.y &&
    y <= UNDO_BTN.y + UNDO_BTN.h
  );
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from pegsolitaire.js
 * @param {number} time - Elapsed time in frames (for pulse effects)
 */
export function render(ctx, state, time) {
  const { board, selectedPeg, validMoves, pegsRemaining, moveHistory, animation, removeAnimation } = state;

  // Clear
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // Title / HUD
  drawHUD(ctx, pegsRemaining, moveHistory.length);

  // Board background
  drawBoardBackground(ctx, board);

  // Holes (empty positions)
  drawHoles(ctx, board, animation, removeAnimation);

  // Valid move destinations
  if (selectedPeg && !animation) {
    drawValidDestinations(ctx, validMoves, time);
  }

  // Pegs
  drawPegs(ctx, board, selectedPeg, time, animation, removeAnimation);

  // Jump animation
  if (animation) {
    drawJumpAnimation(ctx, animation);
  }

  // Remove animation (fading peg)
  if (removeAnimation) {
    drawRemoveAnimation(ctx, removeAnimation);
  }

  // Undo button
  if (moveHistory.length > 0 && !animation && !state.gameOver) {
    drawUndoButton(ctx);
  }

  // Game over message
  if (state.gameOver && !animation && !removeAnimation) {
    drawGameOverHint(ctx, pegsRemaining);
  }
}

/**
 * Draw the HUD (score, pegs remaining).
 */
function drawHUD(ctx, pegsRemaining, moveCount) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = COLOR_PEG;
  ctx.fillText('PEG SOLITAIRE', W / 2, 30);

  // Stats
  ctx.font = '14px monospace';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.fillText(`pegs: ${pegsRemaining}`, W / 2 - 70, 60);
  ctx.fillText(`moves: ${moveCount}`, W / 2 + 70, 60);

  // Score
  const score = 32 - pegsRemaining;
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = COLOR_TEXT;
  ctx.fillText(`score: ${score}`, W / 2, 85);
}

/**
 * Draw the board background (rounded rect behind the cross).
 */
function drawBoardBackground(ctx, board) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === -1) continue;
      const { x, y } = gridToPixel(r, c);
      ctx.fillStyle = COLOR_BOARD_BG;
      ctx.fillRect(x - CELL_SIZE / 2 + 1, y - CELL_SIZE / 2 + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    }
  }
}

/**
 * Draw empty holes on the board.
 */
function drawHoles(ctx, board, animation, removeAnimation) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === -1) continue;

      // Always draw the hole indent
      const { x, y } = gridToPixel(r, c);

      ctx.beginPath();
      ctx.arc(x, y, HOLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_HOLE;
      ctx.fill();
      ctx.strokeStyle = COLOR_HOLE_BORDER;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

/**
 * Draw valid move destination indicators.
 */
function drawValidDestinations(ctx, validMoves, time) {
  const pulse = Math.sin(time * 0.08) * 0.3 + 0.7;

  for (const move of validMoves) {
    const { x, y } = gridToPixel(move.toR, move.toC);

    ctx.beginPath();
    ctx.arc(x, y, PEG_RADIUS * pulse, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_VALID_DEST;
    ctx.fill();
    ctx.strokeStyle = COLOR_VALID_DEST_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/**
 * Draw all pegs on the board.
 */
function drawPegs(ctx, board, selectedPeg, time, animation, removeAnimation) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== 1) continue;

      // Skip the peg being animated (jump from)
      if (animation && animation.fromR === r && animation.fromC === c) continue;

      // Skip the peg being removed (fade out)
      if (removeAnimation && removeAnimation.r === r && removeAnimation.c === c) continue;

      const { x, y } = gridToPixel(r, c);
      const isSelected = selectedPeg && selectedPeg.r === r && selectedPeg.c === c;

      drawPeg(ctx, x, y, isSelected, time);
    }
  }
}

/**
 * Draw a single peg.
 */
function drawPeg(ctx, x, y, isSelected, time) {
  if (isSelected) {
    // Glow effect
    const glowPulse = Math.sin(time * 0.1) * 3 + 8;
    ctx.beginPath();
    ctx.arc(x, y, PEG_RADIUS + glowPulse, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_SELECTED_GLOW;
    ctx.fill();
  }

  // Shadow
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, PEG_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();

  // Main peg body
  ctx.beginPath();
  ctx.arc(x, y, PEG_RADIUS, 0, Math.PI * 2);

  const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, PEG_RADIUS);
  if (isSelected) {
    grad.addColorStop(0, '#ff9090');
    grad.addColorStop(1, COLOR_SELECTED);
  } else {
    grad.addColorStop(0, COLOR_PEG_LIGHT);
    grad.addColorStop(1, COLOR_PEG_DARK);
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // Border
  ctx.strokeStyle = isSelected ? '#ff4444' : '#a06020';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Highlight dot
  ctx.beginPath();
  ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();
}

/**
 * Draw the jump animation (peg sliding).
 */
function drawJumpAnimation(ctx, anim) {
  const t = easeOutCubic(anim.progress);
  const from = gridToPixel(anim.fromR, anim.fromC);
  const to = gridToPixel(anim.toR, anim.toC);

  const x = lerp(from.x, to.x, t);
  const y = lerp(from.y, to.y, t);

  drawPeg(ctx, x, y, false, 0);
}

/**
 * Draw the remove animation (fading peg).
 */
function drawRemoveAnimation(ctx, anim) {
  const { x, y } = gridToPixel(anim.r, anim.c);
  const alpha = 1 - anim.progress;
  const scale = 1 + anim.progress * 0.3;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, PEG_RADIUS * scale, 0, Math.PI * 2);

  const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, PEG_RADIUS * scale);
  grad.addColorStop(0, COLOR_PEG_LIGHT);
  grad.addColorStop(1, COLOR_PEG_DARK);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the undo button.
 */
function drawUndoButton(ctx) {
  const { x, y, w, h } = UNDO_BTN;

  // Background
  ctx.fillStyle = COLOR_UNDO_BG;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();

  // Border
  ctx.strokeStyle = COLOR_TEXT_DIM;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Text
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNDO', x + w / 2, y + h / 2);
}

/**
 * Draw a game-over hint message.
 */
function drawGameOverHint(ctx, pegsRemaining) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (pegsRemaining === 1) {
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#66ff66';
    ctx.fillText('PERFECT!', W / 2, H - 120);
    ctx.font = '14px monospace';
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.fillText('only one peg remains', W / 2, H - 95);
  } else {
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = COLOR_SELECTED;
    ctx.fillText('NO MOVES LEFT', W / 2, H - 120);
    ctx.font = '14px monospace';
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.fillText(`${pegsRemaining} pegs remaining`, W / 2, H - 95);
  }
}

/**
 * Rounded rectangle helper.
 */
function roundRect(ctx, x, y, w, h, r) {
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
