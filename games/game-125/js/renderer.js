/**
 * MEME CHECKERS -- Renderer
 * Canvas rendering for the checkers board, pieces, and UI.
 */

import { BOARD_SIZE, EMPTY, RED, BLACK, RED_KING, BLACK_KING, isRed, isBlack, isKing } from './checkers.js';

// ---- Colors ----

const LIGHT_SQUARE = '#F0D9B5';
const DARK_SQUARE = '#B58863';
const SELECTED_SQUARE = 'rgba(255, 255, 0, 0.35)';
const VALID_MOVE_DOT = 'rgba(0, 200, 80, 0.5)';
const VALID_JUMP_DOT = 'rgba(255, 80, 0, 0.5)';
const RED_PIECE = '#CC2222';
const RED_PIECE_LIGHT = '#EE4444';
const BLACK_PIECE = '#222222';
const BLACK_PIECE_LIGHT = '#555555';
const CROWN_COLOR = '#FFD700';
const HUD_BG = 'rgba(0, 0, 0, 0.7)';
const HUD_TEXT = '#FFFFFF';

// ---- Layout ----

const BOARD_PADDING_TOP = 60;
const BOARD_PADDING_SIDE = 10;
const HUD_HEIGHT = 50;

/**
 * Compute layout metrics for the board.
 *
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Object}
 */
export function computeLayout(canvasWidth, canvasHeight) {
  const boardSize = canvasWidth - BOARD_PADDING_SIDE * 2;
  const squareSize = boardSize / BOARD_SIZE;
  const boardX = BOARD_PADDING_SIDE;
  const boardY = BOARD_PADDING_TOP;
  const pieceRadius = squareSize * 0.38;

  return {
    boardX,
    boardY,
    boardSize,
    squareSize,
    pieceRadius,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Convert board coordinates to canvas pixel center of that square.
 *
 * @param {number} row
 * @param {number} col
 * @param {Object} layout
 * @returns {{ x: number, y: number }}
 */
export function boardToPixel(row, col, layout) {
  return {
    x: layout.boardX + col * layout.squareSize + layout.squareSize / 2,
    y: layout.boardY + row * layout.squareSize + layout.squareSize / 2,
  };
}

/**
 * Convert canvas pixel coordinates to board coordinates.
 *
 * @param {number} px
 * @param {number} py
 * @param {Object} layout
 * @returns {{ row: number, col: number }|null}
 */
export function pixelToBoard(px, py, layout) {
  const col = Math.floor((px - layout.boardX) / layout.squareSize);
  const row = Math.floor((py - layout.boardY) / layout.squareSize);

  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    return { row, col };
  }
  return null;
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {Object} gameState
 * @param {Object} animState
 * @param {Object} layout
 */
export function render(ctx, canvasWidth, canvasHeight, gameState, animState, layout) {
  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw HUD
  drawHUD(ctx, canvasWidth, gameState, animState);

  // Draw board
  drawBoard(ctx, layout);

  // Draw highlights
  if (gameState.selectedPiece && !animState.animating) {
    drawSelectedHighlight(ctx, gameState.selectedPiece, layout);
    drawValidMoves(ctx, gameState.validMoves, layout);
  }

  // Draw pieces
  drawPieces(ctx, gameState.board, layout, gameState.selectedPiece, animState);

  // Draw animation
  if (animState.animating) {
    drawAnimatedPiece(ctx, animState, layout);
  }

  // Draw turn indicator
  drawTurnIndicator(ctx, canvasWidth, canvasHeight, gameState, layout);

  // Draw game over message on canvas
  if (gameState.gameOver && !animState.animating) {
    drawGameOverBanner(ctx, canvasWidth, canvasHeight, gameState);
  }
}

/**
 * Draw the HUD bar at top.
 */
function drawHUD(ctx, canvasWidth, gameState, animState) {
  ctx.fillStyle = HUD_BG;
  ctx.fillRect(0, 0, canvasWidth, HUD_HEIGHT);

  ctx.font = 'bold 14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Player info (left)
  ctx.fillStyle = RED_PIECE;
  ctx.beginPath();
  ctx.arc(16, HUD_HEIGHT / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HUD_TEXT;
  ctx.fillText(`YOU: ${gameState.redCaptured}`, 30, HUD_HEIGHT / 2);

  // AI info (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = HUD_TEXT;
  ctx.fillText(`${gameState.blackCaptured} :AI`, canvasWidth - 30, HUD_HEIGHT / 2);
  ctx.fillStyle = BLACK_PIECE;
  ctx.beginPath();
  ctx.arc(canvasWidth - 16, HUD_HEIGHT / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Score center
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c8ff00';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.fillText(`${gameState.score}`, canvasWidth / 2, HUD_HEIGHT / 2);
}

/**
 * Draw the checkers board.
 */
function drawBoard(ctx, layout) {
  const { boardX, boardY, squareSize } = layout;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? LIGHT_SQUARE : DARK_SQUARE;
      ctx.fillRect(
        boardX + c * squareSize,
        boardY + r * squareSize,
        squareSize,
        squareSize,
      );
    }
  }

  // Board border
  ctx.strokeStyle = '#3a2510';
  ctx.lineWidth = 2;
  ctx.strokeRect(boardX, boardY, squareSize * BOARD_SIZE, squareSize * BOARD_SIZE);
}

/**
 * Draw highlight on selected square.
 */
function drawSelectedHighlight(ctx, selected, layout) {
  const { boardX, boardY, squareSize } = layout;
  ctx.fillStyle = SELECTED_SQUARE;
  ctx.fillRect(
    boardX + selected.col * squareSize,
    boardY + selected.row * squareSize,
    squareSize,
    squareSize,
  );
}

/**
 * Draw valid move indicators.
 */
function drawValidMoves(ctx, validMoves, layout) {
  for (const move of validMoves) {
    const pos = boardToPixel(move.row, move.col, layout);
    const isJump = move.jumps && move.jumps.length > 0;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, layout.squareSize * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = isJump ? VALID_JUMP_DOT : VALID_MOVE_DOT;
    ctx.fill();

    if (isJump) {
      // Draw a ring for jumps
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, layout.squareSize * 0.28, 0, Math.PI * 2);
      ctx.strokeStyle = VALID_JUMP_DOT;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

/**
 * Draw a single checker piece.
 */
function drawPiece(ctx, x, y, radius, piece, dimmed = false) {
  const alpha = dimmed ? 0.35 : 1.0;
  const isRedPiece = isRed(piece);
  const baseColor = isRedPiece ? RED_PIECE : BLACK_PIECE;
  const lightColor = isRedPiece ? RED_PIECE_LIGHT : BLACK_PIECE_LIGHT;

  // Shadow
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * alpha})`;
  ctx.fill();

  // Main circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.globalAlpha = alpha;
  ctx.fill();

  // Inner ring
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Shine highlight
  ctx.beginPath();
  ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * alpha})`;
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = isRedPiece
    ? `rgba(180, 0, 0, ${alpha})`
    : `rgba(100, 100, 100, ${alpha})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Crown for kings
  if (isKing(piece)) {
    drawCrown(ctx, x, y, radius * 0.55, alpha);
  }

  ctx.globalAlpha = 1.0;
}

/**
 * Draw a crown symbol on a king piece.
 */
function drawCrown(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = CROWN_COLOR;
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 1;

  const w = size * 1.4;
  const h = size * 0.9;
  const cx = x;
  const cy = y + size * 0.05;

  ctx.beginPath();
  // Crown base
  ctx.moveTo(cx - w / 2, cy + h / 2);
  // Left point
  ctx.lineTo(cx - w / 2, cy - h / 4);
  // Left inner valley
  ctx.lineTo(cx - w / 4, cy + h / 8);
  // Center point (tallest)
  ctx.lineTo(cx, cy - h / 2);
  // Right inner valley
  ctx.lineTo(cx + w / 4, cy + h / 8);
  // Right point
  ctx.lineTo(cx + w / 2, cy - h / 4);
  // Right base
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  // Crown jewels
  const jewelRadius = size * 0.08;
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(cx, cy - h / 2 + jewelRadius * 2, jewelRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw all pieces on the board.
 */
function drawPieces(ctx, board, layout, selectedPiece, animState) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece === EMPTY) continue;

      // Skip the piece being animated
      if (animState.animating &&
          animState.fromRow === r && animState.fromCol === c) {
        continue;
      }

      const pos = boardToPixel(r, c, layout);
      const isSelected = selectedPiece &&
        selectedPiece.row === r && selectedPiece.col === c;

      // Lift selected piece slightly
      const yOffset = isSelected ? -4 : 0;

      drawPiece(ctx, pos.x, pos.y + yOffset, layout.pieceRadius, piece);
    }
  }
}

/**
 * Draw the animated moving piece.
 */
function drawAnimatedPiece(ctx, animState, layout) {
  const fromPos = boardToPixel(animState.fromRow, animState.fromCol, layout);
  const toPos = boardToPixel(animState.toRow, animState.toCol, layout);

  const t = easeOutQuad(animState.progress);
  const x = fromPos.x + (toPos.x - fromPos.x) * t;
  const y = fromPos.y + (toPos.y - fromPos.y) * t;

  // Arc the piece upward during animation
  const arcHeight = -20;
  const arcY = y + arcHeight * Math.sin(t * Math.PI);

  drawPiece(ctx, x, arcY, layout.pieceRadius, animState.piece);
}

/**
 * Draw turn indicator below the board.
 */
function drawTurnIndicator(ctx, canvasWidth, canvasHeight, gameState, layout) {
  const y = layout.boardY + layout.squareSize * BOARD_SIZE + 20;

  if (gameState.gameOver) return;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 14px "Space Grotesk", sans-serif';

  if (gameState.turn === RED) {
    ctx.fillStyle = RED_PIECE_LIGHT;
    ctx.fillText('YOUR TURN', canvasWidth / 2, y);
  } else {
    ctx.fillStyle = '#999';
    ctx.fillText('AI THINKING...', canvasWidth / 2, y);
  }

  // Message
  if (gameState.message) {
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#c8ff00';
    ctx.fillText(gameState.message, canvasWidth / 2, y + 20);
  }
}

/**
 * Draw game over banner on the canvas.
 */
function drawGameOverBanner(ctx, canvasWidth, canvasHeight, gameState) {
  // This is just a subtle overlay; the shell handles the real game-over screen
}

/**
 * Ease-out quadratic.
 */
function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
