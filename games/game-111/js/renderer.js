/**
 * KNIFE HIT -- Renderer
 * All canvas drawing logic for the knife hit game.
 */

import { LOG_RADIUS, KNIFE_BLADE_LENGTH, KNIFE_BLADE_WIDTH, KNIFE_HANDLE_LENGTH, KNIFE_STICK_DISTANCE } from './knifehit.js';

/** Canvas logical dimensions */
export const W = 400;
export const H = 700;

// Colors
const BG_COLOR = '#0d0d1a';
const LOG_COLOR = '#8B5E3C';
const LOG_DARK = '#6B4226';
const LOG_RING_COLOR = '#A0744F';
const LOG_CENTER_COLOR = '#C4956A';
const KNIFE_BLADE_COLOR = '#d0d0d0';
const KNIFE_EDGE_COLOR = '#ffffff';
const KNIFE_HANDLE_COLOR = '#3a3a3a';
const KNIFE_HANDLE_ACCENT = '#ff6b35';
const HUD_COLOR = '#ffffff';
const HUD_DIM = 'rgba(255,255,255,0.4)';
const LEVEL_CLEAR_COLOR = '#ff6b35';
const REMAINING_KNIFE_COLOR = 'rgba(255,255,255,0.6)';
const REMAINING_KNIFE_ACTIVE = '#ff6b35';

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from knifehit.js
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Draw log
  drawLog(ctx, state);

  // Draw stuck knives (rotate with the log)
  drawStuckKnives(ctx, state);

  // Draw flying knife
  if (state.flyingKnife) {
    drawFlyingKnife(ctx, state.flyingKnife);
  }

  // Draw remaining knives indicator
  drawRemainingKnives(ctx, state);

  // Draw HUD
  drawHUD(ctx, state);

  // Draw level clear overlay
  if (state.levelClearing) {
    drawLevelClear(ctx, state);
  }

  // Draw hit flash
  if (state.hitKnife && state.hitFlashTimer > 0) {
    const alpha = Math.min(state.hitFlashTimer / 15, 0.4);
    ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/**
 * Draw the wooden log/circle.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawLog(ctx, state) {
  const { logX, logY, logAngle } = state;

  ctx.save();
  ctx.translate(logX, logY);
  ctx.rotate(logAngle);

  // Outer circle (bark)
  ctx.beginPath();
  ctx.arc(0, 0, LOG_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = LOG_COLOR;
  ctx.fill();

  // Wood grain rings
  ctx.strokeStyle = LOG_RING_COLOR;
  ctx.lineWidth = 1.5;
  for (let r = 20; r < LOG_RADIUS - 10; r += 22) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.globalAlpha = 0.3;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Inner dark ring
  ctx.beginPath();
  ctx.arc(0, 0, LOG_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = LOG_DARK;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = LOG_CENTER_COLOR;
  ctx.fill();

  // Wood grain lines (radial)
  ctx.strokeStyle = LOG_DARK;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
    ctx.lineTo(Math.cos(angle) * (LOG_RADIUS - 5), Math.sin(angle) * (LOG_RADIUS - 5));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw all knives stuck in the log.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawStuckKnives(ctx, state) {
  const { logX, logY, logAngle, stuckKnives } = state;

  ctx.save();
  ctx.translate(logX, logY);
  ctx.rotate(logAngle);

  for (const knife of stuckKnives) {
    ctx.save();
    ctx.rotate(knife.angle);

    // Knife points outward from center at this angle
    // Blade tip is at LOG_RADIUS, extends outward
    const tipY = LOG_RADIUS - 12; // tip embedded slightly in log
    const baseY = tipY + KNIFE_BLADE_LENGTH;
    const handleEnd = baseY + KNIFE_HANDLE_LENGTH;

    // Blade
    ctx.fillStyle = KNIFE_BLADE_COLOR;
    ctx.beginPath();
    ctx.moveTo(0, tipY);
    ctx.lineTo(-KNIFE_BLADE_WIDTH / 2, tipY + 10);
    ctx.lineTo(-KNIFE_BLADE_WIDTH / 2, baseY);
    ctx.lineTo(KNIFE_BLADE_WIDTH / 2, baseY);
    ctx.lineTo(KNIFE_BLADE_WIDTH / 2, tipY + 10);
    ctx.closePath();
    ctx.fill();

    // Blade edge highlight
    ctx.strokeStyle = KNIFE_EDGE_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, tipY);
    ctx.lineTo(0, baseY);
    ctx.stroke();

    // Handle
    ctx.fillStyle = KNIFE_HANDLE_COLOR;
    const hw = 5;
    roundRect(ctx, -hw, baseY, hw * 2, KNIFE_HANDLE_LENGTH, 2);
    ctx.fill();

    // Handle accent stripe
    ctx.fillStyle = KNIFE_HANDLE_ACCENT;
    ctx.fillRect(-hw + 1, baseY + 4, hw * 2 - 2, 3);

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw the knife currently flying toward the log.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} knife - { x, y }
 */
function drawFlyingKnife(ctx, knife) {
  ctx.save();
  ctx.translate(knife.x, knife.y);

  // Blade (pointing up)
  const tipY = 0;
  const baseY = KNIFE_BLADE_LENGTH;
  const handleEnd = baseY + KNIFE_HANDLE_LENGTH;

  // Blade
  ctx.fillStyle = KNIFE_BLADE_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, tipY);
  ctx.lineTo(-KNIFE_BLADE_WIDTH / 2, tipY + 10);
  ctx.lineTo(-KNIFE_BLADE_WIDTH / 2, baseY);
  ctx.lineTo(KNIFE_BLADE_WIDTH / 2, baseY);
  ctx.lineTo(KNIFE_BLADE_WIDTH / 2, tipY + 10);
  ctx.closePath();
  ctx.fill();

  // Blade edge
  ctx.strokeStyle = KNIFE_EDGE_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, tipY);
  ctx.lineTo(0, baseY);
  ctx.stroke();

  // Handle
  ctx.fillStyle = KNIFE_HANDLE_COLOR;
  const hw = 5;
  roundRect(ctx, -hw, baseY, hw * 2, KNIFE_HANDLE_LENGTH, 2);
  ctx.fill();

  // Handle accent stripe
  ctx.fillStyle = KNIFE_HANDLE_ACCENT;
  ctx.fillRect(-hw + 1, baseY + 4, hw * 2 - 2, 3);

  ctx.restore();
}

/**
 * Draw the remaining knives queue at the bottom.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawRemainingKnives(ctx, state) {
  const { knivesRemaining, flyingKnife } = state;

  // Show remaining as small knife icons stacked at bottom center
  // If a knife is flying, that one is already deducted visually
  const startY = 620;
  const spacing = 18;
  const displayRemaining = knivesRemaining;

  for (let i = 0; i < Math.min(displayRemaining, 8); i++) {
    const y = startY + i * spacing;
    if (y > H - 20) break;

    ctx.save();
    ctx.translate(W / 2, y);
    ctx.scale(0.5, 0.5);

    // Mini knife
    const isNext = i === 0 && !flyingKnife;
    ctx.fillStyle = isNext ? REMAINING_KNIFE_ACTIVE : REMAINING_KNIFE_COLOR;
    ctx.globalAlpha = isNext ? 1 : Math.max(0.2, 0.8 - i * 0.1);

    // Blade
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-3, 8);
    ctx.lineTo(-3, KNIFE_BLADE_LENGTH);
    ctx.lineTo(3, KNIFE_BLADE_LENGTH);
    ctx.lineTo(3, 8);
    ctx.closePath();
    ctx.fill();

    // Handle
    ctx.fillRect(-4, KNIFE_BLADE_LENGTH, 8, KNIFE_HANDLE_LENGTH);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Show remaining count if more than displayed
  if (displayRemaining > 8) {
    ctx.fillStyle = HUD_DIM;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+${displayRemaining - 8}`, W / 2, H - 12);
  }
}

/**
 * Draw the HUD (score, level).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawHUD(ctx, state) {
  // Score (top-left)
  ctx.fillStyle = HUD_COLOR;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(state.score), 20, 40);

  // Level (top-right)
  ctx.fillStyle = HUD_DIM;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`LVL ${state.level}`, W - 20, 36);

  // Knives remaining count near the queue
  ctx.fillStyle = HUD_COLOR;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(state.knivesRemaining), W / 2, 600);
}

/**
 * Draw the level clear celebration overlay.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawLevelClear(ctx, state) {
  const progress = Math.min(state.levelClearTimer / 60, 1);

  // Fade background
  ctx.fillStyle = `rgba(13, 13, 26, ${progress * 0.5})`;
  ctx.fillRect(0, 0, W, H);

  // Level text
  if (progress > 0.2) {
    const textAlpha = Math.min((progress - 0.2) / 0.3, 1);
    ctx.globalAlpha = textAlpha;

    ctx.fillStyle = LEVEL_CLEAR_COLOR;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`LEVEL ${state.level}`, W / 2, H / 2 - 20);

    ctx.fillStyle = HUD_COLOR;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('CLEAR', W / 2, H / 2 + 25);

    // Bonus points
    const bonus = state.level * 50;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`+${bonus} BONUS`, W / 2, H / 2 + 55);

    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }
}

/**
 * Draw a rounded rectangle path.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
 */
function roundRect(ctx, x, y, w, h, r) {
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
