/**
 * MEME TANGRAM -- Renderer
 * Draws the tangram board, target silhouette, pieces, and HUD.
 */

import { GRID, BOARD_X, BOARD_Y, BOARD_COLS, BOARD_ROWS, getPieceWorldVerts } from './tangram.js';

const W = 400;
const H = 700;

/**
 * Draw the full game frame.
 */
export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);

  drawBackground(ctx);
  drawGrid(ctx);
  drawTarget(ctx, state.targetVerts);
  drawPieces(ctx, state.pieces, state.dragPieceId, state.highlightWin, state.selectedPieceId);
  drawHUD(ctx, state);

  if (state.highlightWin) {
    drawWinEffect(ctx, state.winTimer);
  }

  if (state.showHint) {
    drawHint(ctx);
  }
}

/**
 * Render for the menu screen.
 */
export function renderMenu(ctx) {
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx);

  // Draw some decorative tangram pieces
  const demoVerts = [
    { verts: [[80,200],[160,200],[80,280]], color: '#ff4444' },
    { verts: [[160,200],[240,200],[240,280]], color: '#ff8800' },
    { verts: [[80,280],[160,280],[120,320]], color: '#ffcc00' },
    { verts: [[200,300],[240,300],[240,340],[200,340]], color: '#aa44ff' },
    { verts: [[240,280],[280,280],[300,320],[260,320]], color: '#ff44aa' },
    { verts: [[140,320],[180,320],[140,360]], color: '#44cc44' },
    { verts: [[180,320],[220,320],[220,360]], color: '#4488ff' },
  ];

  ctx.globalAlpha = 0.3;
  for (const shape of demoVerts) {
    ctx.fillStyle = shape.color;
    ctx.beginPath();
    ctx.moveTo(shape.verts[0][0], shape.verts[0][1]);
    for (let i = 1; i < shape.verts.length; i++) {
      ctx.lineTo(shape.verts[i][0], shape.verts[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBackground(ctx) {
  // Dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Subtle board area
  ctx.fillStyle = '#16213e';
  ctx.fillRect(BOARD_X, BOARD_Y, BOARD_COLS * GRID, BOARD_ROWS * GRID);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= BOARD_COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(BOARD_X + x * GRID, BOARD_Y);
    ctx.lineTo(BOARD_X + x * GRID, BOARD_Y + BOARD_ROWS * GRID);
    ctx.stroke();
  }

  for (let y = 0; y <= BOARD_ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(BOARD_X, BOARD_Y + y * GRID);
    ctx.lineTo(BOARD_X + BOARD_COLS * GRID, BOARD_Y + y * GRID);
    ctx.stroke();
  }
}

function drawTarget(ctx, targetVerts) {
  if (!targetVerts || targetVerts.length === 0) return;

  const worldVerts = targetVerts.map(([x, y]) => [BOARD_X + x * GRID, BOARD_Y + y * GRID]);

  // Fill silhouette
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(worldVerts[0][0], worldVerts[0][1]);
  for (let i = 1; i < worldVerts.length; i++) {
    ctx.lineTo(worldVerts[i][0], worldVerts[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawPieces(ctx, pieces, dragPieceId, highlightWin, selectedPieceId) {
  // Draw non-dragged pieces first, then dragged piece on top
  const sorted = [...pieces].sort((a, b) => {
    if (a.id === dragPieceId) return 1;
    if (b.id === dragPieceId) return -1;
    return 0;
  });

  for (const piece of sorted) {
    const wv = getPieceWorldVerts(piece);
    const isDragging = piece.id === dragPieceId;

    ctx.save();

    // Shadow for dragged piece
    if (isDragging) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }

    // Fill
    ctx.fillStyle = highlightWin ? lightenColor(piece.color, 0.3) : piece.color;
    ctx.globalAlpha = isDragging ? 0.85 : 0.9;

    ctx.beginPath();
    ctx.moveTo(wv[0][0], wv[0][1]);
    for (let i = 1; i < wv.length; i++) {
      ctx.lineTo(wv[i][0], wv[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Border
    const isSelected = piece.id === selectedPieceId;
    ctx.strokeStyle = isDragging ? '#fff' : isSelected ? '#ffcc00' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = isDragging ? 2.5 : isSelected ? 2 : 1.5;
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.moveTo(wv[0][0], wv[0][1]);
    for (let i = 1; i < wv.length; i++) {
      ctx.lineTo(wv[i][0], wv[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawHUD(ctx, state) {
  // Top bar
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, W, BOARD_Y - 10);

  // Puzzle name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(state.puzzleName || 'TANGRAM', W / 2, 12);

  // Level indicator
  ctx.font = '13px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`puzzle ${state.puzzleIndex + 1} / ${state.totalPuzzles}`, W / 2, 34);

  // Timer
  const elapsed = Math.floor(state.elapsedSeconds);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#ff6b35';
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, W / 2, 58);

  // Coverage indicator
  if (state.coveragePercent !== undefined) {
    const pct = Math.round(state.coveragePercent * 100);
    ctx.font = '12px monospace';
    ctx.fillStyle = pct >= 80 ? '#44cc44' : 'rgba(255,255,255,0.5)';
    ctx.fillText(`coverage: ${pct}%`, W / 2, 88);
  }

  // Rotate button area (bottom of canvas, centered in remaining space)
  const btnY = BOARD_Y + BOARD_ROWS * GRID + 30;
  const btnW = 120;
  const btnH = 36;
  const btnX = W / 2 - btnW / 2;

  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  roundRect(ctx, btnX, btnY, btnW, btnH, 8);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ROTATE', W / 2, btnY + btnH / 2);

  // Skip button
  const skipX = W - 80;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  roundRect(ctx, skipX, btnY, 60, btnH, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px monospace';
  ctx.fillText('SKIP', skipX + 30, btnY + btnH / 2);

  // Reset button
  const resetX = 20;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  roundRect(ctx, resetX, btnY, 60, btnH, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px monospace';
  ctx.fillText('RESET', resetX + 30, btnY + btnH / 2);

  // Total score display
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'right';
  ctx.fillText(`score: ${state.totalScore}`, W - 15, 14);
  ctx.textAlign = 'center';
}

function drawWinEffect(ctx, timer) {
  const alpha = Math.min(timer / 30, 0.5);
  ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.15})`;
  ctx.fillRect(0, 0, W, H);

  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 2})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOLVED!', W / 2, H / 2 - 20);

  const score = Math.round(timer);
  if (timer > 20) {
    ctx.font = '16px monospace';
    ctx.fillStyle = `rgba(255,255,255,${Math.min((timer - 20) / 20, 1)})`;
    ctx.fillText('tap to continue', W / 2, H / 2 + 30);
  }
}

function drawHint(ctx) {
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('drag pieces onto the outline', W / 2, H - 20);
  ctx.fillText('double-tap a piece to rotate', W / 2, H - 6);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.min(255, r + Math.round(amount * (255 - r)));
  g = Math.min(255, g + Math.round(amount * (255 - g)));
  b = Math.min(255, b + Math.round(amount * (255 - b)));
  return `rgb(${r},${g},${b})`;
}
