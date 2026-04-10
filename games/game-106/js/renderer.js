/**
 * MEME BUBBLES -- Renderer
 * All canvas drawing for the bubble shooter game.
 */

import { BUBBLE_RADIUS, COLORS } from './bubbles.js';

const TAU = Math.PI * 2;

/**
 * Draw the game background.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 */
export function drawBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#1a0a2e');
  grad.addColorStop(1, '#0d0520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a single bubble.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} colorIndex
 * @param {number} [alpha=1]
 * @param {number} [scale=1]
 */
export function drawBubble(ctx, x, y, colorIndex, alpha = 1, scale = 1) {
  const r = BUBBLE_RADIUS * scale;
  const color = COLORS[colorIndex] || COLORS[0];

  ctx.save();
  ctx.globalAlpha = alpha;

  // Main bubble body
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner highlight (glossy effect)
  const highlightGrad = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, r * 0.1,
    x, y, r
  );
  highlightGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
  highlightGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
  highlightGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = highlightGrad;
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(x, y, r - 0.5, 0, TAU);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw all bubbles in the grid.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./bubbles.js').BubbleGrid} grid
 */
export function drawGrid(ctx, grid) {
  for (const [, bubble] of grid.grid) {
    drawBubble(ctx, bubble.x, bubble.y, bubble.colorIndex);
  }
}

/**
 * Draw falling bubbles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./bubbles.js').BubbleGrid} grid
 */
export function drawFallingBubbles(ctx, grid) {
  for (const fb of grid.fallingBubbles) {
    drawBubble(ctx, fb.x, fb.y, fb.colorIndex, fb.alpha);
  }
}

/**
 * Draw pop effects (expanding rings).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./bubbles.js').BubbleGrid} grid
 */
export function drawPopEffects(ctx, grid) {
  for (const pe of grid.popEffects) {
    const progress = pe.timer / pe.maxTimer;
    const alpha = 1 - progress;
    const radius = BUBBLE_RADIUS * (1 + progress * 1.5);

    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.arc(pe.x, pe.y, radius, 0, TAU);
    ctx.strokeStyle = COLORS[pe.colorIndex];
    ctx.lineWidth = 3 * (1 - progress);
    ctx.stroke();

    // Small particles
    const particleCount = 4;
    for (let i = 0; i < particleCount; i++) {
      const angle = (TAU / particleCount) * i + progress * 2;
      const dist = BUBBLE_RADIUS * progress * 2;
      const px = pe.x + Math.cos(angle) * dist;
      const py = pe.y + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(px, py, 2 * (1 - progress), 0, TAU);
      ctx.fillStyle = COLORS[pe.colorIndex];
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draw the aiming line from shooter position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX
 * @param {number} startY
 * @param {number} angle - Radians from vertical (negative = left, positive = right)
 * @param {number} canvasWidth
 */
export function drawAimLine(ctx, startX, startY, angle, canvasWidth) {
  const speed = 12;
  let x = startX;
  let y = startY;
  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);

  const steps = 60;
  for (let i = 0; i < steps; i++) {
    x += vx;
    y += vy;

    // Bounce off walls
    if (x < BUBBLE_RADIUS) {
      x = BUBBLE_RADIUS;
      vx = -vx;
    } else if (x > canvasWidth - BUBBLE_RADIUS) {
      x = canvasWidth - BUBBLE_RADIUS;
      vx = -vx;
    }

    // Stop at top
    if (y < BUBBLE_RADIUS) {
      ctx.lineTo(x, y);
      break;
    }

    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw the shooter area (current + next bubble).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} shooterX
 * @param {number} shooterY
 * @param {number} currentColor
 * @param {number} nextColor
 * @param {number} angle
 */
export function drawShooter(ctx, shooterX, shooterY, currentColor, nextColor, angle) {
  // Current bubble at shooter position
  drawBubble(ctx, shooterX, shooterY, currentColor);

  // Direction indicator on current bubble
  ctx.save();
  ctx.translate(shooterX, shooterY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -BUBBLE_RADIUS - 4);
  ctx.lineTo(-4, -BUBBLE_RADIUS + 2);
  ctx.lineTo(4, -BUBBLE_RADIUS + 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();
  ctx.restore();

  // Next bubble preview (small, to the left)
  const nextX = shooterX - 50;
  const nextY = shooterY;

  ctx.save();
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('NEXT', nextX, nextY - 20);
  ctx.restore();

  drawBubble(ctx, nextX, nextY, nextColor, 0.7, 0.7);
}

/**
 * Draw the death line.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} y
 * @param {number} width
 */
export function drawDeathLine(ctx, y, width) {
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = 'rgba(255,71,87,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw the HUD (score, shots until next row).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} shotsLeft - Shots until next row pushes down
 * @param {number} width
 */
export function drawHUD(ctx, score, shotsLeft, width) {
  ctx.save();

  // Score - top left
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#f0e6ff';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 25);

  // Shots remaining indicator - top right
  ctx.textAlign = 'right';
  ctx.font = '13px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`next row: ${shotsLeft}`, width - 10, 25);

  ctx.restore();
}

/**
 * Draw the top border/ceiling.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 */
export function drawCeiling(ctx, width) {
  ctx.save();
  ctx.fillStyle = 'rgba(45,27,78,0.8)';
  ctx.fillRect(0, 0, width, 5);
  ctx.restore();
}
