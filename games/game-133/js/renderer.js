/**
 * MEME LAUNCH -- Renderer Module
 * Handles drawing the game world: sky, ground, blocks, target, HUD.
 */

const W = 400;
const H = 700;
const GROUND_Y = 580;

/**
 * Draw the background sky gradient and ground.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawBackground(ctx) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, '#4FC3F7');
  skyGrad.addColorStop(0.7, '#81D4FA');
  skyGrad.addColorStop(1, '#B3E5FC');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // Clouds
  drawCloud(ctx, 60, 80, 40);
  drawCloud(ctx, 200, 50, 30);
  drawCloud(ctx, 320, 100, 35);
  drawCloud(ctx, 150, 140, 25);

  // Ground
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  groundGrad.addColorStop(0, '#4CAF50');
  groundGrad.addColorStop(0.3, '#388E3C');
  groundGrad.addColorStop(1, '#2E7D32');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Ground line
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = '#66BB6A';
  ctx.lineWidth = 1.5;
  for (let x = 10; x < W; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x - 3, GROUND_Y - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 3, GROUND_Y - 5);
    ctx.stroke();
  }
}

/**
 * Draw a simple cloud.
 */
function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y - size * 0.2, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y + size * 0.1, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a block.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} block
 */
export function drawBlock(ctx, block) {
  if (block.destroyed) return;

  const { x, y, w, h, hp, maxHp, type } = block;

  // Block color based on type and damage
  const damageRatio = hp / maxHp;

  let baseColor, darkColor, crackColor;
  if (type === 'wood') {
    baseColor = lerpColor('#8D6E63', '#D7CCC8', 1 - damageRatio);
    darkColor = '#5D4037';
    crackColor = '#4E342E';
  } else if (type === 'stone') {
    baseColor = lerpColor('#78909C', '#CFD8DC', 1 - damageRatio);
    darkColor = '#455A64';
    crackColor = '#37474F';
  } else {
    baseColor = lerpColor('#A1887F', '#D7CCC8', 1 - damageRatio);
    darkColor = '#6D4C41';
    crackColor = '#4E342E';
  }

  // Block body with shake when damaged
  let drawX = x;
  let drawY = y;
  if (block.shakeTimer > 0) {
    drawX += (Math.random() - 0.5) * 4;
    drawY += (Math.random() - 0.5) * 4;
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(drawX, drawY, w, h);

  // Border
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(drawX, drawY, w, h);

  // Damage cracks
  if (damageRatio < 0.7) {
    ctx.strokeStyle = crackColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawX + w * 0.3, drawY);
    ctx.lineTo(drawX + w * 0.5, drawY + h * 0.4);
    ctx.lineTo(drawX + w * 0.4, drawY + h);
    ctx.stroke();
  }
  if (damageRatio < 0.4) {
    ctx.beginPath();
    ctx.moveTo(drawX + w * 0.7, drawY);
    ctx.lineTo(drawX + w * 0.6, drawY + h * 0.6);
    ctx.lineTo(drawX + w * 0.8, drawY + h);
    ctx.stroke();
  }

  // Wood grain lines
  if (type === 'wood') {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    for (let ly = drawY + 5; ly < drawY + h - 2; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(drawX + 2, ly);
      ctx.lineTo(drawX + w - 2, ly);
      ctx.stroke();
    }
  }
}

/**
 * Draw the target enemy.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} target
 */
export function drawTarget(ctx, target) {
  if (target.destroyed) return;

  const { x, y, radius } = target;

  // Green body
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Smug face
  const r = radius;

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // Smug grin
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.35, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Crown/hat (target indicator)
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.7);
  ctx.lineTo(x - r * 0.35, y - r * 1.1);
  ctx.lineTo(x - r * 0.1, y - r * 0.8);
  ctx.lineTo(x + r * 0.1, y - r * 1.15);
  ctx.lineTo(x + r * 0.35, y - r * 0.8);
  ctx.lineTo(x + r * 0.5, y - r * 1.1);
  ctx.lineTo(x + r * 0.5, y - r * 0.7);
  ctx.closePath();
  ctx.fill();

  // Shake on damage
  if (target.shakeTimer > 0) {
    // visual already handled by position offset in game logic
  }
}

/**
 * Draw the HUD (score, level).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} level
 */
export function drawHUD(ctx, score, level) {
  // Score
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'right';
  ctx.strokeText(`${score}`, W - 15, 28);
  ctx.fillText(`${score}`, W - 15, 28);

  // Level
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px monospace';
  ctx.strokeText(`LVL ${level}`, W / 2, 28);
  ctx.fillText(`LVL ${level}`, W / 2, 28);
}

/**
 * Draw level transition text.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} alpha
 */
export function drawLevelText(ctx, text, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(text, W / 2, H / 2 - 40);
  ctx.fillText(text, W / 2, H / 2 - 40);
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw floating score popup.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} popups
 */
export function drawScorePopups(ctx, popups) {
  for (const p of popups) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color || '#FFD700';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText(`+${p.value}`, p.x, p.y);
    ctx.fillText(`+${p.value}`, p.x, p.y);
    ctx.restore();
  }
}

/**
 * Linear interpolation between two hex colors.
 */
function lerpColor(colorA, colorB, t) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * Convert hex color to RGB object.
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export const GROUND_Y_EXPORT = GROUND_Y;
