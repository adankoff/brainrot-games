/**
 * MEME PONG -- Renderer
 * Canvas rendering for the pong game.
 */

import { W, H, PADDLE_H, BALL_RADIUS, PADDLE_RADIUS } from './pong.js';

const BG_COLOR = '#0a0a14';
const LINE_COLOR = 'rgba(255, 255, 255, 0.08)';
const PADDLE_PLAYER_COLOR = '#00ff88';
const PADDLE_AI_COLOR = '#ff4466';
const BALL_COLOR = '#ffffff';
const SCORE_COLOR = 'rgba(255, 255, 255, 0.12)';
const SCORE_FLASH_COLOR = 'rgba(0, 255, 136, 0.3)';
const ACCENT = '#00ff88';

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Pong game state
 */
export function render(ctx, state) {
  ctx.save();

  // -- Background --
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // -- Center line (dashed net) --
  drawNet(ctx);

  // -- Scores --
  drawScores(ctx, state);

  // -- Ball trail --
  drawBallTrail(ctx, state);

  // -- Ball --
  if (!state.serving) {
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();

    // Subtle glow
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_RADIUS + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
  }

  // -- Paddles --
  drawPaddle(ctx, state.playerX, state.playerY, state.paddleWidth, PADDLE_PLAYER_COLOR);
  drawPaddle(ctx, state.aiX, state.aiY, state.paddleWidth, PADDLE_AI_COLOR);

  // -- Serving indicator --
  if (state.serving && !state.gameOver) {
    drawServingIndicator(ctx, state);
  }

  // -- Rally counter --
  if (state.rallyCount > 2 && !state.serving) {
    drawRallyCounter(ctx, state);
  }

  // -- Game over overlay on canvas --
  if (state.gameOver) {
    drawGameOverBanner(ctx, state);
  }

  // -- Quit button --
  drawQuitButton(ctx);

  ctx.restore();
}

/**
 * Draw the dashed center net line.
 */
function drawNet(ctx) {
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw the large score numbers in each half.
 */
function drawScores(ctx, state) {
  const flashAlpha = state.scoreFlash > 0 ? state.scoreFlash / 60 : 0;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px monospace';

  // AI score (top half)
  ctx.fillStyle = flashAlpha > 0
    ? lerpColor(SCORE_COLOR, 'rgba(255, 68, 102, 0.3)', flashAlpha)
    : SCORE_COLOR;
  ctx.fillText(String(state.aiScore), W / 2, H * 0.28);

  // Player score (bottom half)
  ctx.fillStyle = flashAlpha > 0
    ? lerpColor(SCORE_COLOR, SCORE_FLASH_COLOR, flashAlpha)
    : SCORE_COLOR;
  ctx.fillText(String(state.playerScore), W / 2, H * 0.72);

  ctx.restore();
}

/**
 * Draw the ball trail (fading positions).
 */
function drawBallTrail(ctx, state) {
  const trail = state.ballTrail;
  if (trail.length === 0) return;

  for (let i = 0; i < trail.length; i++) {
    const alpha = ((i + 1) / trail.length) * 0.3;
    const radius = BALL_RADIUS * ((i + 1) / trail.length) * 0.8;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

/**
 * Draw a rounded paddle.
 */
function drawPaddle(ctx, cx, cy, width, color) {
  const x = cx - width / 2;
  const y = cy - PADDLE_H / 2;

  ctx.save();

  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, width, PADDLE_H, PADDLE_RADIUS);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
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

/**
 * Draw the serving indicator (pulsing "tap to serve").
 */
function drawServingIndicator(ctx, state) {
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.004);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '16px monospace';
  ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.7})`;
  ctx.fillText('tap to serve', W / 2, H / 2);

  // Draw ball at center as visual cue
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 30, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
  ctx.fill();

  ctx.restore();
}

/**
 * Draw the rally counter when rally is going.
 */
function drawRallyCounter(ctx, state) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = `rgba(0, 255, 136, 0.5)`;
  ctx.fillText(`rally: ${state.rallyCount}`, W / 2, H / 2 - 4);
  ctx.restore();
}

/**
 * Draw game over banner on the canvas.
 */
function drawGameOverBanner(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (state.winner === 'player') {
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = ACCENT;
    ctx.fillText('YOU WIN', W / 2, H / 2 - 20);
  } else {
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ff4466';
    ctx.fillText('YOU LOSE', W / 2, H / 2 - 20);
  }

  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText(`${state.playerScore} - ${state.aiScore}`, W / 2, H / 2 + 20);

  ctx.restore();
}

/**
 * Draw the quit button (top-right).
 */
function drawQuitButton(ctx) {
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('quit', W - 12, 10);
  ctx.restore();
}

/**
 * Simple color interpolation for flash effects.
 * Only works with rgba strings for this use case.
 */
function lerpColor(a, b, t) {
  // Just return b at full t, a at 0 -- simple alpha blend approach
  if (t <= 0) return a;
  if (t >= 1) return b;
  return b; // good enough for a flash effect
}
