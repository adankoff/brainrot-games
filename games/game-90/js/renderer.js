/**
 * MEME TETRIS -- Renderer
 * All canvas drawing logic. No game state mutation.
 */

import { COLS, ROWS, PIECES, getPieceCells, getGhostRow } from './tetris.js';

// Layout constants
const CELL_SIZE = 28;
const GRID_X = 10;
const GRID_Y = 50;
const GRID_W = COLS * CELL_SIZE;  // 280
const GRID_H = ROWS * CELL_SIZE;  // 560
const PANEL_X = GRID_X + GRID_W + 14; // 304
const PANEL_W = 86;

const MINI_CELL = 14;

const BG_COLOR = '#0a0a0a';
const GRID_BG = '#111118';
const GRID_LINE_COLOR = 'rgba(255,255,255,0.04)';
const BORDER_COLOR = 'rgba(255,255,255,0.12)';

export function render(ctx, game, W, H) {
  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = '#00f0f0';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MEME TETRIS', GRID_X, 32);

  drawGrid(ctx, game);
  drawPlacedBlocks(ctx, game);

  if (game.clearingLines !== null) {
    drawLineClearAnim(ctx, game);
  }

  if (!game.gameOver && game.clearingLines === null) {
    drawGhostPiece(ctx, game);
    drawCurrentPiece(ctx, game);
  }

  drawGridBorder(ctx);
  drawPanel(ctx, game);

  // Touch hint at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('arrows/WASD: move+rotate | space: drop | C: hold', W / 2, H - 8);
}

function drawGrid(ctx, game) {
  // Background
  ctx.fillStyle = GRID_BG;
  ctx.fillRect(GRID_X, GRID_Y, GRID_W, GRID_H);

  // Grid lines
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    const x = GRID_X + c * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, GRID_Y);
    ctx.lineTo(x, GRID_Y + GRID_H);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    const y = GRID_Y + r * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(GRID_X, y);
    ctx.lineTo(GRID_X + GRID_W, y);
    ctx.stroke();
  }
}

function drawGridBorder(ctx) {
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X, GRID_Y, GRID_W, GRID_H);
}

function drawBlock(ctx, x, y, size, color, alpha) {
  const a = alpha !== undefined ? alpha : 1;
  ctx.globalAlpha = a;

  // Main fill
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // Highlight (top-left bevel)
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x + 1, y + 1, size - 2, 2);
  ctx.fillRect(x + 1, y + 1, 2, size - 2);

  // Shadow (bottom-right bevel)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 1, y + size - 3, size - 2, 2);
  ctx.fillRect(x + size - 3, y + 1, 2, size - 2);

  ctx.globalAlpha = 1;
}

function drawPlacedBlocks(ctx, game) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = game.grid[r][c];
      if (color) {
        const x = GRID_X + c * CELL_SIZE;
        const y = GRID_Y + r * CELL_SIZE;
        drawBlock(ctx, x, y, CELL_SIZE, color);
      }
    }
  }
}

function drawCurrentPiece(ctx, game) {
  const { currentPiece, currentRotation, currentRow, currentCol } = game;
  if (!currentPiece) return;
  const color = PIECES[currentPiece].color;
  const cells = getPieceCells(currentPiece, currentRotation, currentRow, currentCol);
  for (const [r, c] of cells) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const x = GRID_X + c * CELL_SIZE;
      const y = GRID_Y + r * CELL_SIZE;
      drawBlock(ctx, x, y, CELL_SIZE, color);
    }
  }
}

function drawGhostPiece(ctx, game) {
  const { currentPiece, currentRotation, currentRow, currentCol } = game;
  if (!currentPiece) return;
  const ghostRow = getGhostRow(game.grid, currentPiece, currentRotation, currentRow, currentCol);
  if (ghostRow === currentRow) return;

  const color = PIECES[currentPiece].color;
  const cells = getPieceCells(currentPiece, currentRotation, ghostRow, currentCol);
  for (const [r, c] of cells) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const x = GRID_X + c * CELL_SIZE;
      const y = GRID_Y + r * CELL_SIZE;
      drawBlock(ctx, x, y, CELL_SIZE, color, 0.2);
    }
  }
}

function drawLineClearAnim(ctx, game) {
  const progress = game.clearTimer / game.CLEAR_ANIM_FRAMES;
  const flash = Math.sin(progress * Math.PI * 3) * 0.5 + 0.5;

  for (const lineRow of game.clearingLines) {
    const y = GRID_Y + lineRow * CELL_SIZE;
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.8})`;
    ctx.fillRect(GRID_X, y, GRID_W, CELL_SIZE);
  }
}

function drawPanel(ctx, game) {
  const x = PANEL_X;
  let y = GRID_Y + 4;

  // -- NEXT piece --
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('NEXT', x, y + 10);
  y += 18;

  drawMiniPiece(ctx, game.nextPiece, x, y);
  y += MINI_CELL * 4 + 8;

  // -- HOLD piece --
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('HOLD', x, y + 10);
  y += 18;

  if (game.holdPiece) {
    drawMiniPiece(ctx, game.holdPiece, x, y, game.holdUsed ? 0.4 : 1);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillText('--', x + 16, y + 24);
  }
  y += MINI_CELL * 4 + 16;

  // -- Score --
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SCORE', x, y + 10);
  y += 16;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(game.score.toLocaleString(), x, y + 14);
  y += 28;

  // -- Level --
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('LEVEL', x, y + 10);
  y += 16;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(String(game.level), x, y + 14);
  y += 28;

  // -- Lines --
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('LINES', x, y + 10);
  y += 16;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(String(game.lines), x, y + 14);
}

function drawMiniPiece(ctx, type, px, py, alpha) {
  if (!type) return;
  const a = alpha !== undefined ? alpha : 1;
  const color = PIECES[type].color;
  const cells = PIECES[type].states[0]; // rotation 0

  // Center the mini piece in a 4x4 box
  const minC = Math.min(...cells.map(([, c]) => c));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const minR = Math.min(...cells.map(([r]) => r));
  const maxR = Math.max(...cells.map(([r]) => r));
  const pieceW = (maxC - minC + 1) * MINI_CELL;
  const pieceH = (maxR - minR + 1) * MINI_CELL;
  const boxW = 4 * MINI_CELL;
  const boxH = 3 * MINI_CELL;
  const offsetX = px + (boxW - pieceW) / 2 - minC * MINI_CELL;
  const offsetY = py + (boxH - pieceH) / 2 - minR * MINI_CELL;

  for (const [r, c] of cells) {
    const bx = offsetX + c * MINI_CELL;
    const by = offsetY + r * MINI_CELL;
    drawBlock(ctx, bx, by, MINI_CELL, color, a);
  }
}

export { GRID_X, GRID_Y, GRID_W, GRID_H, CELL_SIZE };
