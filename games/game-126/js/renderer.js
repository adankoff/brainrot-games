/**
 * MEME MANCALA -- Renderer
 * Draws the board, pits, stores, stones, and UI on the canvas.
 */

import {
  PITS_PER_SIDE, STONE_COLORS,
  PLAYER_STORE, AI_STORE,
  PLAYER_PITS_START, PLAYER_PITS_END,
  AI_PITS_START, AI_PITS_END,
} from './mancala.js';

// ---- Layout Constants ----

const W = 400;
const H = 700;

// Board dimensions
const BOARD_X = 20;
const BOARD_Y = 120;
const BOARD_W = 360;
const BOARD_H = 460;
const BOARD_RADIUS = 40;

// Stores (mancalas)
const STORE_W = 52;
const STORE_H = 180;
const STORE_RADIUS = 26;
const LEFT_STORE_X = BOARD_X + 14;
const RIGHT_STORE_X = BOARD_X + BOARD_W - STORE_W - 14;
const STORE_Y_OFFSET = (BOARD_H - STORE_H) / 2;

// Pits
const PIT_RADIUS = 28;
const PIT_AREA_LEFT = LEFT_STORE_X + STORE_W + 10;
const PIT_AREA_RIGHT = RIGHT_STORE_X - 10;
const PIT_AREA_W = PIT_AREA_RIGHT - PIT_AREA_LEFT;
const PIT_SPACING = PIT_AREA_W / PITS_PER_SIDE;

// Row Y positions (center of pit)
const TOP_ROW_Y = BOARD_Y + BOARD_H / 2 - 65;
const BOTTOM_ROW_Y = BOARD_Y + BOARD_H / 2 + 65;

// Stone rendering
const STONE_RADIUS = 5;
const MAX_VISIBLE_STONES = 20; // Don't render more than this per pit

/**
 * Get the center position of a pit/store by board index.
 *
 * @param {number} index - Board index (0-13)
 * @returns {{ x: number, y: number }}
 */
export function getPitCenter(index) {
  if (index === PLAYER_STORE) {
    return {
      x: RIGHT_STORE_X + STORE_W / 2,
      y: BOARD_Y + STORE_Y_OFFSET + STORE_H / 2,
    };
  }
  if (index === AI_STORE) {
    return {
      x: LEFT_STORE_X + STORE_W / 2,
      y: BOARD_Y + STORE_Y_OFFSET + STORE_H / 2,
    };
  }

  // Player pits: indices 1-6 (left to right on bottom row)
  if (index >= PLAYER_PITS_START && index <= PLAYER_PITS_END) {
    const i = index - PLAYER_PITS_START;
    return {
      x: PIT_AREA_LEFT + PIT_SPACING * i + PIT_SPACING / 2,
      y: BOTTOM_ROW_Y,
    };
  }

  // AI pits: indices 8-13 (right to left on top row)
  if (index >= AI_PITS_START && index <= AI_PITS_END) {
    const i = AI_PITS_END - index;
    return {
      x: PIT_AREA_LEFT + PIT_SPACING * i + PIT_SPACING / 2,
      y: TOP_ROW_Y,
    };
  }

  return { x: 0, y: 0 };
}

/**
 * Get the hit radius for a pit (for tap detection).
 */
export function getPitHitRadius() {
  return PIT_RADIUS + 4;
}

/**
 * Main render function.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./mancala.js').MancalaGame} game
 * @param {Object} state - Animation/UI state from main.js
 */
export function render(ctx, game, state) {
  // Clear
  ctx.clearRect(0, 0, W, H);

  // Background
  drawBackground(ctx);

  // Board
  drawBoard(ctx);

  // Stores
  drawStore(ctx, LEFT_STORE_X, BOARD_Y + STORE_Y_OFFSET, game.board[AI_STORE], game.stoneColors[AI_STORE], 'AI');
  drawStore(ctx, RIGHT_STORE_X, BOARD_Y + STORE_Y_OFFSET, game.board[PLAYER_STORE], game.stoneColors[PLAYER_STORE], 'YOU');

  // Pits
  for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
    const center = getPitCenter(i);
    const highlight = state.highlightedPits && state.highlightedPits.has(i);
    const isHovered = state.hoveredPit === i;
    drawPit(ctx, center.x, center.y, game.board[i], game.stoneColors[i], highlight, isHovered);
  }
  for (let i = AI_PITS_START; i <= AI_PITS_END; i++) {
    const center = getPitCenter(i);
    const highlight = state.highlightedPits && state.highlightedPits.has(i);
    drawPit(ctx, center.x, center.y, game.board[i], game.stoneColors[i], highlight, false);
  }

  // Stone counts on pits
  drawPitCounts(ctx, game);

  // Sowing animation stones
  if (state.animatingStones && state.animatingStones.length > 0) {
    for (const stone of state.animatingStones) {
      if (stone.visible) {
        drawStone(ctx, stone.x, stone.y, stone.colorIndex, STONE_RADIUS + 1);
      }
    }
  }

  // Capture animation
  if (state.captureAnim && state.captureAnim.active) {
    drawCaptureEffect(ctx, state.captureAnim);
  }

  // Turn indicator / status text
  drawStatusBar(ctx, game, state);

  // Score display
  drawScoreBar(ctx, game, state);
}

// ---- Drawing Helpers ----

function drawBackground(ctx) {
  // Dark wooden gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a0f08');
  grad.addColorStop(0.5, '#2a1810');
  grad.addColorStop(1, '#1a0f08');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle wood grain lines
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.1) * 3);
    ctx.lineTo(W, y + Math.sin(y * 0.1 + 2) * 3);
    ctx.stroke();
  }
}

function drawBoard(ctx) {
  // Board shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;

  // Main board shape
  ctx.fillStyle = '#5c3a1e';
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_W, BOARD_H, BOARD_RADIUS);
  ctx.fill();
  ctx.restore();

  // Wood grain overlay
  const woodGrad = ctx.createLinearGradient(BOARD_X, BOARD_Y, BOARD_X + BOARD_W, BOARD_Y + BOARD_H);
  woodGrad.addColorStop(0, 'rgba(139, 90, 43, 0.3)');
  woodGrad.addColorStop(0.3, 'rgba(101, 67, 33, 0.1)');
  woodGrad.addColorStop(0.7, 'rgba(139, 90, 43, 0.2)');
  woodGrad.addColorStop(1, 'rgba(101, 67, 33, 0.3)');
  ctx.fillStyle = woodGrad;
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_W, BOARD_H, BOARD_RADIUS);
  ctx.fill();

  // Board border
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 3;
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_W, BOARD_H, BOARD_RADIUS);
  ctx.stroke();

  // Inner rim
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx, BOARD_X + 4, BOARD_Y + 4, BOARD_W - 8, BOARD_H - 8, BOARD_RADIUS - 2);
  ctx.stroke();

  // Center divider line
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(PIT_AREA_LEFT, BOARD_Y + BOARD_H / 2);
  ctx.lineTo(PIT_AREA_RIGHT, BOARD_Y + BOARD_H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStore(ctx, x, y, count, colors, label) {
  // Store cavity
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  const grad = ctx.createLinearGradient(x, y, x, y + STORE_H);
  grad.addColorStop(0, '#3d2517');
  grad.addColorStop(0.5, '#2a1810');
  grad.addColorStop(1, '#3d2517');
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, STORE_W, STORE_H, STORE_RADIUS);
  ctx.fill();
  ctx.restore();

  // Store border
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, STORE_W, STORE_H, STORE_RADIUS);
  ctx.stroke();

  // Draw stones inside store
  const maxStones = Math.min(count, MAX_VISIBLE_STONES);
  const cx = x + STORE_W / 2;
  const storeInnerH = STORE_H - 30;
  for (let i = 0; i < maxStones; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx = cx - 10 + col * 10;
    const sy = y + 20 + row * 12;
    if (sy < y + storeInnerH) {
      const colorIdx = colors[i] !== undefined ? colors[i] : 0;
      drawStone(ctx, sx, sy, colorIdx, STONE_RADIUS - 1);
    }
  }

  // Count
  ctx.fillStyle = '#f0e6d2';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(String(count), x + STORE_W / 2, y + STORE_H - 6);

  // Label
  ctx.fillStyle = 'rgba(240, 230, 210, 0.5)';
  ctx.font = '10px "Space Grotesk", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(label, x + STORE_W / 2, y + 4);
}

function drawPit(ctx, cx, cy, count, colors, highlight, hovered) {
  // Pit cavity (circular)
  ctx.save();

  if (highlight) {
    ctx.shadowColor = '#f4a623';
    ctx.shadowBlur = 12;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
  }

  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, PIT_RADIUS);
  grad.addColorStop(0, '#2a1810');
  grad.addColorStop(1, highlight ? '#4a2e18' : '#3d2517');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.arc(cx, cy, PIT_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pit rim
  ctx.strokeStyle = highlight ? '#f4a623' : '#6b4226';
  ctx.lineWidth = highlight ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, PIT_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Hover glow
  if (hovered && count > 0) {
    ctx.strokeStyle = 'rgba(244, 166, 35, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, PIT_RADIUS + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw stones
  const maxStones = Math.min(count, MAX_VISIBLE_STONES);
  if (maxStones <= 6) {
    // Spread in a ring pattern
    for (let i = 0; i < maxStones; i++) {
      const angle = (Math.PI * 2 * i) / Math.max(maxStones, 1) - Math.PI / 2;
      const r = maxStones === 1 ? 0 : 12;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      const colorIdx = colors[i] !== undefined ? colors[i] : 0;
      drawStone(ctx, sx, sy, colorIdx, STONE_RADIUS);
    }
  } else {
    // Pack them tighter
    const cols = 4;
    const startX = cx - 14;
    const startY = cy - 14;
    for (let i = 0; i < maxStones; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = startX + col * 8 + (row % 2) * 4;
      const sy = startY + row * 8;
      const colorIdx = colors[i] !== undefined ? colors[i] : 0;
      drawStone(ctx, sx, sy, colorIdx, STONE_RADIUS - 1);
    }
  }
}

function drawStone(ctx, x, y, colorIndex, radius) {
  const color = STONE_COLORS[colorIndex] || STONE_COLORS[0];

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  // Gradient for 3D look
  const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
  grad.addColorStop(0, lightenColor(color, 40));
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, darkenColor(color, 30));
  ctx.fillStyle = grad;
  ctx.fill();

  // Tiny highlight
  ctx.beginPath();
  ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  ctx.restore();
}

function drawPitCounts(ctx, game) {
  ctx.font = '11px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(240, 230, 210, 0.7)';

  // Player pits (count below pit)
  for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
    const center = getPitCenter(i);
    ctx.fillText(String(game.board[i]), center.x, center.y + PIT_RADIUS + 4);
  }

  // AI pits (count above pit)
  ctx.textBaseline = 'bottom';
  for (let i = AI_PITS_START; i <= AI_PITS_END; i++) {
    const center = getPitCenter(i);
    ctx.fillText(String(game.board[i]), center.x, center.y - PIT_RADIUS - 4);
  }
}

function drawCaptureEffect(ctx, captureAnim) {
  const { x, y, progress } = captureAnim;
  const alpha = 1 - progress;
  const scale = 1 + progress * 2;

  ctx.save();
  ctx.globalAlpha = alpha * 0.6;
  ctx.strokeStyle = '#f4a623';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, PIT_RADIUS * scale, 0, Math.PI * 2);
  ctx.stroke();

  // "YOINK" text
  if (progress < 0.7) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f4a623';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOINK', x, y - PIT_RADIUS * scale - 10);
  }
  ctx.restore();
}

function drawStatusBar(ctx, game, state) {
  const y = 60;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (game.gameOver) {
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f4a623';
    if (game.winner === 'player') {
      ctx.fillText('YOU WIN', W / 2, y);
    } else if (game.winner === 'ai') {
      ctx.fillText('AI WINS', W / 2, y);
    } else {
      ctx.fillText('TIE GAME', W / 2, y);
    }
  } else if (state.animating) {
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(240, 230, 210, 0.6)';
    ctx.fillText('...', W / 2, y);
  } else if (state.message) {
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f4a623';
    ctx.fillText(state.message, W / 2, y);
  } else if (game.currentPlayer === 'player') {
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f0e6d2';
    ctx.fillText('your turn -- tap a pit', W / 2, y);
  } else {
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(240, 230, 210, 0.6)';
    ctx.fillText('AI is thinking...', W / 2, y);
  }

  ctx.restore();
}

function drawScoreBar(ctx, game, state) {
  const y = H - 35;

  ctx.save();
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.textBaseline = 'middle';

  // Player score (right side)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f0e6d2';
  ctx.fillText(`YOU: ${game.board[PLAYER_STORE]}`, W - 20, y);

  // AI score (left side)
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(240, 230, 210, 0.7)';
  ctx.fillText(`AI: ${game.board[AI_STORE]}`, 20, y);

  // Difficulty indicator
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(240, 230, 210, 0.4)';
  ctx.font = '11px "Space Grotesk", sans-serif';
  if (state && state.difficulty) {
    ctx.fillText(state.difficulty.toUpperCase(), W / 2, y);
  }

  ctx.restore();
}

// ---- Utility ----

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

function lightenColor(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
