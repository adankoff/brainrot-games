/**
 * MEME TOWER -- Renderer
 * Draws the tower, pendulum, HUD, and effects on the canvas.
 */

const W = 400;
const H = 700;

// Sky gradient colors
const SKY_TOP = '#0f0f23';
const SKY_BOTTOM = '#1a1a2e';

/**
 * Draw the background gradient.
 * @param {CanvasRenderingContext2D} ctx
 */
function drawBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines for depth
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw the tower blocks with wobble and camera offset.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./tower.js').Tower} tower
 */
function drawTower(ctx, tower) {
  ctx.save();

  // Apply camera scroll
  ctx.translate(0, tower.cameraY);

  // Apply tower wobble (rotate around the base)
  if (!tower.toppled) {
    const pivotX = W / 2;
    const pivotY = 650; // base of tower
    ctx.translate(pivotX, pivotY);
    ctx.rotate(tower.wobbleAngle);
    ctx.translate(-pivotX, -pivotY);
  } else {
    // Topple animation: progressive lean
    const pivotX = W / 2;
    const pivotY = 650;
    const toppleAngle = tower.toppleProgress * (tower.imbalance > 0 ? 1.2 : -1.2);
    ctx.translate(pivotX, pivotY);
    ctx.rotate(toppleAngle);
    ctx.translate(-pivotX, -pivotY);
  }

  // Draw blocks from bottom to top
  for (let i = 0; i < tower.blocks.length; i++) {
    const block = tower.blocks[i];

    // Block shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(block.x + 3, block.y + 3, block.width, block.height);

    // Block body
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);

    // Highlight (top edge)
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(block.x, block.y, block.width, 3);

    // Dark edge (bottom)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(block.x, block.y + block.height - 2, block.width, 2);

    // Perfect placement star indicator
    if (block.perfect && i > 0) {
      ctx.fillStyle = '#ffd93d';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('*', block.x + block.width / 2, block.y + block.height / 2 + 4);
    }
  }

  // Draw trimmed piece (falling off)
  if (tower.trimmedPiece && tower.trimmedPieceTimer > 0) {
    const tp = tower.trimmedPiece;
    const alpha = tower.trimmedPieceTimer;
    const fallOffset = (1 - alpha) * 80;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = tp.color;
    ctx.fillRect(tp.x, tp.y + fallOffset, tp.width, tp.height);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/**
 * Draw the swinging pendulum block.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x of the swinging block
 * @param {number} width - block width
 * @param {number} color - block color string
 * @param {number} anchorX - anchor point x
 * @param {number} anchorY - anchor point y
 * @param {number} blockY - block y position
 */
function drawPendulum(ctx, x, width, color, anchorX, anchorY, blockY) {
  const blockLeft = x - width / 2;
  const blockHeight = 28;

  // Dotted line from anchor to block
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.lineTo(x, blockY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Anchor point
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(anchorX, anchorY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Block shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(blockLeft + 3, blockY + 3, width, blockHeight);

  // Block body
  ctx.fillStyle = color;
  ctx.fillRect(blockLeft, blockY, width, blockHeight);

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(blockLeft, blockY, width, 3);

  // Dark edge
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(blockLeft, blockY + blockHeight - 2, width, 2);
}

/**
 * Draw the HUD (score, block count).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} blockCount
 * @param {number} imbalance
 */
function drawHUD(ctx, score, blockCount, imbalance) {
  // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(score.toString(), 15, 35);

  // Block count
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`blocks: ${blockCount}`, 15, 55);

  // Imbalance meter
  const meterX = W - 30;
  const meterY = 30;
  const meterH = 100;
  const fillRatio = Math.min(Math.abs(imbalance) / 55, 1);

  // Meter background
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(meterX - 5, meterY, 10, meterH);

  // Meter fill (green to red)
  const r = Math.round(fillRatio * 255);
  const g = Math.round((1 - fillRatio) * 255);
  ctx.fillStyle = `rgb(${r},${g},80)`;
  ctx.fillRect(meterX - 5, meterY + meterH * (1 - fillRatio), 10, meterH * fillRatio);

  // Meter label
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('BAL', meterX, meterY + meterH + 14);
}

/**
 * Draw a placement feedback flash.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type - 'perfect' | 'trimmed' | 'stacked'
 * @param {number} alpha - fade alpha 0-1
 * @param {number} y - y position (camera-adjusted)
 * @param {number} cameraY
 */
function drawFeedback(ctx, type, alpha, y, cameraY) {
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';

  if (type === 'perfect') {
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ffd93d';
    ctx.fillText('PERFECT!', W / 2, y + cameraY - 10);
  } else if (type === 'trimmed') {
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('TRIMMED', W / 2, y + cameraY - 10);
  } else {
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#6bff6b';
    ctx.fillText('NICE', W / 2, y + cameraY - 10);
  }

  ctx.restore();
}

/**
 * Draw "tap to drop" instruction.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pulseAlpha
 */
function drawInstruction(ctx, pulseAlpha) {
  ctx.save();
  ctx.globalAlpha = 0.3 + pulseAlpha * 0.4;
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('tap to drop', W / 2, H - 30);
  ctx.restore();
}

export const Renderer = {
  drawBackground,
  drawTower,
  drawPendulum,
  drawHUD,
  drawFeedback,
  drawInstruction,
  W,
  H,
};
