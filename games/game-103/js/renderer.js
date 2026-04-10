/**
 * BALL SORT -- Renderer
 * Draws tubes, balls, HUD, and animations on the canvas.
 */

import { TUBE_CAPACITY, BALL_COLORS, DIFFICULTY_CONFIG } from './ballsort.js';
import { lerp, easeOutCubic } from '../../shared/utils.js';

// ---- Layout Constants ----

const BG_COLOR = '#1a1a2e';
const TUBE_COLOR = 'rgba(255, 255, 255, 0.12)';
const TUBE_BORDER_COLOR = 'rgba(255, 255, 255, 0.25)';
const TUBE_HIGHLIGHT_COLOR = 'rgba(200, 255, 0, 0.35)';
const HUD_Y = 40;

/**
 * Compute tube layout positions for the current difficulty.
 *
 * @param {number} numTubes
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {{ tubeWidth: number, tubeHeight: number, ballRadius: number, positions: Array<{x: number, y: number}>, ballSpacing: number }}
 */
export function computeLayout(numTubes, canvasW, canvasH) {
  // Arrange tubes in two rows if > 6
  const rows = numTubes > 6 ? 2 : 1;
  const tubesPerRow = Math.ceil(numTubes / rows);

  const maxTubeWidth = 48;
  const padding = 16;
  const availW = canvasW - padding * 2;
  const tubeWidth = Math.min(maxTubeWidth, Math.floor(availW / tubesPerRow) - 10);
  const ballRadius = Math.floor(tubeWidth / 2 - 3);
  const ballSpacing = ballRadius * 2 + 4;
  const tubeHeight = TUBE_CAPACITY * ballSpacing + 16;

  // Vertical positioning
  const totalRowsHeight = rows * tubeHeight + (rows - 1) * 40;
  const startY = canvasH / 2 - totalRowsHeight / 2 + 30;

  const positions = [];
  for (let i = 0; i < numTubes; i++) {
    const row = Math.floor(i / tubesPerRow);
    const col = i % tubesPerRow;
    const rowTubeCount = row === rows - 1 ? numTubes - tubesPerRow * row : tubesPerRow;
    const rowWidth = rowTubeCount * (tubeWidth + 10) - 10;
    const rowStartX = (canvasW - rowWidth) / 2;

    positions.push({
      x: rowStartX + col * (tubeWidth + 10) + tubeWidth / 2,
      y: startY + row * (tubeHeight + 40),
    });
  }

  return { tubeWidth, tubeHeight, ballRadius, positions, ballSpacing };
}

/**
 * Draw the entire game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {Object} game - Game state from ballsort.js
 * @param {Object} anim - Animation state from main.js
 * @param {Object} layout - Layout from computeLayout
 */
export function render(ctx, canvasW, canvasH, game, anim, layout) {
  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw decorative background pattern
  drawBackground(ctx, canvasW, canvasH);

  // Draw HUD
  drawHUD(ctx, canvasW, game);

  // Draw tubes and balls
  const { tubeWidth, tubeHeight, ballRadius, positions, ballSpacing } = layout;

  for (let i = 0; i < game.tubes.length; i++) {
    const tube = game.tubes[i];
    const pos = positions[i];
    const isSelected = anim.selectedTube === i;
    const isValidTarget = anim.selectedTube !== null && anim.validTargets && anim.validTargets.includes(i);

    // Draw tube container
    drawTube(ctx, pos.x, pos.y, tubeWidth, tubeHeight, isSelected, isValidTarget);

    // Draw balls in tube
    for (let j = 0; j < tube.length; j++) {
      // Skip the top ball of selected tube if it's being animated
      if (isSelected && j === tube.length - 1 && anim.liftedBall !== null) continue;

      const ballX = pos.x;
      const ballY = pos.y + tubeHeight - 12 - j * ballSpacing;
      drawBall(ctx, ballX, ballY, ballRadius, tube[j]);
    }

    // Draw lifted ball animation
    if (isSelected && anim.liftedBall !== null) {
      const liftY = pos.y - 20;
      const fromY = pos.y + tubeHeight - 12 - (tube.length) * ballSpacing;
      const t = easeOutCubic(Math.min(anim.liftProgress, 1));
      const currentY = lerp(fromY, liftY, t);
      drawBall(ctx, pos.x, currentY, ballRadius, anim.liftedBall, true);
    }
  }

  // Draw dropping ball animation
  if (anim.dropping) {
    const t = easeOutCubic(Math.min(anim.dropProgress, 1));
    const currentX = lerp(anim.dropFromX, anim.dropToX, t);
    const currentY = lerp(anim.dropFromY, anim.dropToY, t);
    drawBall(ctx, currentX, currentY, ballRadius, anim.dropColor, true);
  }

  // Draw win overlay
  if (anim.won) {
    drawWinOverlay(ctx, canvasW, canvasH, anim.winTimer);
  }

  // Draw tap hint on first play
  if (anim.showHint && !anim.won) {
    drawHint(ctx, canvasW, canvasH, anim.hintTimer);
  }
}

/**
 * Draw decorative background dots.
 */
function drawBackground(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let x = 20; x < w; x += 40) {
    for (let y = 20; y < h; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Draw the HUD: move counter and difficulty label.
 */
function drawHUD(ctx, canvasW, game) {
  ctx.save();

  // Moves counter
  ctx.font = '600 18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`moves: ${game.moves}`, 16, HUD_Y);

  // Difficulty label
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '500 14px "Space Grotesk", sans-serif';
  ctx.fillText(game.difficulty.toUpperCase(), canvasW - 16, HUD_Y);

  ctx.restore();
}

/**
 * Draw a single tube (rounded-bottom rectangle).
 */
function drawTube(ctx, cx, topY, width, height, isSelected, isValidTarget) {
  const x = cx - width / 2;
  const y = topY;
  const r = width / 2; // bottom corner radius

  ctx.save();

  // Tube fill
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height - r);
  ctx.arcTo(x, y + height, x + r, y + height, r);
  ctx.arcTo(x + width, y + height, x + width, y + height - r, r);
  ctx.lineTo(x + width, y);
  ctx.closePath();

  if (isSelected) {
    ctx.fillStyle = TUBE_HIGHLIGHT_COLOR;
  } else if (isValidTarget) {
    ctx.fillStyle = 'rgba(200, 255, 0, 0.1)';
  } else {
    ctx.fillStyle = TUBE_COLOR;
  }
  ctx.fill();

  // Tube border
  ctx.strokeStyle = isSelected ? '#c8ff00' : (isValidTarget ? 'rgba(200, 255, 0, 0.4)' : TUBE_BORDER_COLOR);
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a ball (colored circle with highlight).
 */
function drawBall(ctx, cx, cy, radius, colorIdx, glow = false) {
  const color = BALL_COLORS[colorIdx] || '#888';

  ctx.save();

  // Glow effect for lifted/dropping ball
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }

  // Main circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw win celebration overlay.
 */
function drawWinOverlay(ctx, w, h, timer) {
  const alpha = Math.min(timer / 500, 0.6);

  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, w, h);

  if (timer > 300) {
    const textAlpha = Math.min((timer - 300) / 400, 1);
    ctx.globalAlpha = textAlpha;
    ctx.font = '700 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8ff00';
    ctx.fillText('SORTED!', w / 2, h / 2 - 10);

    ctx.font = '500 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('no cap, that was clean', w / 2, h / 2 + 25);
  }

  ctx.restore();
}

/**
 * Draw tap hint.
 */
function drawHint(ctx, w, h, timer) {
  const pulse = 0.4 + Math.sin(timer * 0.004) * 0.4;

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = '500 16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('tap a tube to pick up a ball', w / 2, h - 40);
  ctx.restore();
}
