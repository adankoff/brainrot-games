/**
 * MEME SIMON -- Renderer
 * All canvas drawing for the Simon game.
 */

import { COLORS, W, H } from './simon.js';

/** Layout constants */
const BOARD_CENTER_X = W / 2;
const BOARD_CENTER_Y = 310;
const QUADRANT_SIZE = 130;
const QUADRANT_GAP = 8;
const QUADRANT_RADIUS = 16;
const CENTER_RADIUS = 40;

/**
 * Get the bounding rectangle for a quadrant button.
 *
 * @param {number} index - 0=TL, 1=TR, 2=BL, 3=BR
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function getQuadrantRect(index) {
  const halfGap = QUADRANT_GAP / 2;
  const offsets = [
    { x: BOARD_CENTER_X - QUADRANT_SIZE - halfGap, y: BOARD_CENTER_Y - QUADRANT_SIZE - halfGap },
    { x: BOARD_CENTER_X + halfGap,                  y: BOARD_CENTER_Y - QUADRANT_SIZE - halfGap },
    { x: BOARD_CENTER_X - QUADRANT_SIZE - halfGap, y: BOARD_CENTER_Y + halfGap },
    { x: BOARD_CENTER_X + halfGap,                  y: BOARD_CENTER_Y + halfGap },
  ];
  return { x: offsets[index].x, y: offsets[index].y, w: QUADRANT_SIZE, h: QUADRANT_SIZE };
}

/**
 * Hit test: which quadrant does a point land in? Returns -1 if none.
 *
 * @param {number} px
 * @param {number} py
 * @returns {number}
 */
export function hitTestQuadrant(px, py) {
  for (let i = 0; i < 4; i++) {
    const r = getQuadrantRect(i);
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
      return i;
    }
  }
  return -1;
}

/**
 * Draw a rounded rectangle.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
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
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./simon.js').SimonState} state
 */
export function render(ctx, state) {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Header area
  drawHeader(ctx, state);

  // Draw quadrant buttons
  drawQuadrants(ctx, state);

  // Draw center circle with round number
  drawCenter(ctx, state);

  // Draw phase indicator
  drawPhaseIndicator(ctx, state);

  // Draw score at bottom
  drawScore(ctx, state);
}

/**
 * Draw the header with title.
 */
function drawHeader(ctx, state) {
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('MEME SIMON', W / 2, 20);
}

/**
 * Draw the four quadrant buttons.
 */
function drawQuadrants(ctx, state) {
  for (let i = 0; i < 4; i++) {
    const rect = getQuadrantRect(i);
    const color = COLORS[i];
    const isLit = state.litButton === i;

    // Shadow
    ctx.save();
    if (isLit) {
      ctx.shadowColor = color.lit;
      ctx.shadowBlur = 30;
    }

    // Button fill
    if (isLit) {
      ctx.fillStyle = color.lit;
    } else if (state.phase === 'fail' && state.gameOver) {
      ctx.fillStyle = color.dark;
    } else {
      ctx.fillStyle = color.base;
    }

    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, QUADRANT_RADIUS);
    ctx.fill();
    ctx.restore();

    // Border
    ctx.strokeStyle = isLit ? '#ffffff44' : '#ffffff15';
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, QUADRANT_RADIUS);
    ctx.stroke();

    // Label
    ctx.fillStyle = isLit ? '#ffffffcc' : '#ffffff44';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labels = ['1', '2', '3', '4'];
    ctx.fillText(labels[i], rect.x + rect.w / 2, rect.y + rect.h / 2);
  }
}

/**
 * Draw the center circle with round number.
 */
function drawCenter(ctx, state) {
  ctx.beginPath();
  ctx.arc(BOARD_CENTER_X, BOARD_CENTER_Y, CENTER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#16213e';
  ctx.fill();
  ctx.strokeStyle = '#ffffff22';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Round number
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.round > 0 ? String(state.round) : '-', BOARD_CENTER_X, BOARD_CENTER_Y);
}

/**
 * Draw the phase indicator text.
 */
function drawPhaseIndicator(ctx, state) {
  const y = 500;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (state.phase === 'idle') {
    ctx.fillStyle = '#ffffff66';
    ctx.font = '18px monospace';
    ctx.fillText('tap START to begin', W / 2, y);
  } else if (state.phase === 'playback') {
    ctx.fillStyle = '#ff884488';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('WATCH...', W / 2, y);

    // Playback progress dots
    drawProgressDots(ctx, state, y + 30);
  } else if (state.phase === 'input') {
    // Pulse effect
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
    ctx.fillStyle = `rgba(68, 221, 68, ${pulse})`;
    ctx.font = 'bold 22px monospace';
    ctx.fillText('YOUR TURN', W / 2, y);

    // Input progress dots
    drawInputProgress(ctx, state, y + 30);
  } else if (state.phase === 'success') {
    ctx.fillStyle = '#44dd44';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('NICE', W / 2, y);
  } else if (state.phase === 'fail') {
    const shake = Math.sin(Date.now() * 0.03) * 3;
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('WRONG', W / 2 + shake, y);
  }
}

/**
 * Draw progress dots during playback.
 */
function drawProgressDots(ctx, state, y) {
  const count = state.sequence.length;
  if (count === 0) return;

  const maxDots = Math.min(count, 20);
  const dotSpacing = 14;
  const startX = W / 2 - ((maxDots - 1) * dotSpacing) / 2;

  for (let i = 0; i < maxDots; i++) {
    const x = startX + i * dotSpacing;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);

    if (i < state.playbackIndex) {
      ctx.fillStyle = '#ff884466';
    } else if (i === state.playbackIndex && state.litButton !== -1) {
      ctx.fillStyle = '#ff8844';
    } else {
      ctx.fillStyle = '#ffffff22';
    }
    ctx.fill();
  }
}

/**
 * Draw input progress dots.
 */
function drawInputProgress(ctx, state, y) {
  const count = state.sequence.length;
  if (count === 0) return;

  const maxDots = Math.min(count, 20);
  const dotSpacing = 14;
  const startX = W / 2 - ((maxDots - 1) * dotSpacing) / 2;

  for (let i = 0; i < maxDots; i++) {
    const x = startX + i * dotSpacing;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);

    if (i < state.inputIndex) {
      ctx.fillStyle = '#44dd44';
    } else if (i === state.inputIndex) {
      ctx.fillStyle = '#44dd4488';
    } else {
      ctx.fillStyle = '#ffffff22';
    }
    ctx.fill();
  }
}

/**
 * Draw the score display at the bottom.
 */
function drawScore(ctx, state) {
  const y = 600;

  // Score
  ctx.fillStyle = '#ffffff88';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`rounds completed: ${state.score}`, W / 2, y);

  // Keyboard hints
  ctx.fillStyle = '#ffffff33';
  ctx.font = '12px monospace';
  ctx.fillText('keys: 1-4 or arrow keys', W / 2, y + 50);
}
