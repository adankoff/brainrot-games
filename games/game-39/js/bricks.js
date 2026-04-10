/**
 * BRAINROT BREAKER -- Brick Grid & Power-ups
 * Brick grid generation, hit detection, power-up drops.
 */

import { LOGICAL_WIDTH } from './physics.js';

// ---- Constants ----

export const BRICK_COLS = 8;
export const BRICK_ROWS = 5;
export const BRICK_GAP = 4;
export const BRICK_TOP_OFFSET = 60;
export const BRICK_POINTS = 10;

// Computed dimensions
const TOTAL_GAP_X = BRICK_GAP * (BRICK_COLS + 1);
export const BRICK_WIDTH = Math.floor((LOGICAL_WIDTH - TOTAL_GAP_X) / BRICK_COLS);
export const BRICK_HEIGHT = 20;

// Power-up types
export const POWERUP_NONE = 0;
export const POWERUP_WIDE = 1;
export const POWERUP_MULTI = 2;

const POWERUP_DROP_CHANCE = 0.12; // 12% chance per brick
const POWERUP_FALL_SPEED = 2.5;
const POWERUP_SIZE = 16;

// ---- Brick ----

/**
 * @typedef {Object} Brick
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} hp - Hit points remaining (1 or 2)
 * @property {number} col - Column index
 * @property {number} row - Row index
 * @property {number} colorIndex - Index into theme brickColors
 * @property {boolean} alive
 */

/**
 * Generate a full brick grid for a given level.
 *
 * @param {number} level - Current level (1-based). Higher levels = more 2-hp bricks.
 * @returns {Brick[]} Array of brick objects
 */
export function generateBricks(level) {
  const bricks = [];
  const twoHitChance = Math.min(0.1 + (level - 1) * 0.1, 0.5);

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = BRICK_GAP + col * (BRICK_WIDTH + BRICK_GAP);
      const y = BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_GAP);
      const hp = Math.random() < twoHitChance ? 2 : 1;

      bricks.push({
        x,
        y,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hp,
        col,
        row,
        colorIndex: row % 5,
        alive: true,
      });
    }
  }

  return bricks;
}

/**
 * Count alive bricks.
 *
 * @param {Brick[]} bricks
 * @returns {number}
 */
export function countAliveBricks(bricks) {
  let count = 0;
  for (let i = 0; i < bricks.length; i++) {
    if (bricks[i].alive) count++;
  }
  return count;
}

// ---- Ball-Brick Collision ----

/**
 * Test ball against all alive bricks. Returns the first brick hit (if any)
 * and reflects the ball. Modifies ball velocity in place.
 *
 * @param {{ x: number, y: number, vx: number, vy: number, radius: number }} ball
 * @param {Brick[]} bricks
 * @returns {Brick|null} The brick that was hit, or null
 */
export function collideBallWithBricks(ball, bricks) {
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.alive) continue;

    // Find closest point on brick to ball center
    const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
    const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));

    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= ball.radius * ball.radius) {
      // Determine reflection axis
      const overlapX = ball.radius - Math.abs(dx);
      const overlapY = ball.radius - Math.abs(dy);

      if (overlapX < overlapY) {
        ball.vx = -ball.vx;
        // Push ball out
        ball.x += dx > 0 ? overlapX : -overlapX;
      } else {
        ball.vy = -ball.vy;
        ball.y += dy > 0 ? overlapY : -overlapY;
      }

      return b;
    }
  }

  return null;
}

// ---- Power-ups ----

/**
 * @typedef {Object} PowerUp
 * @property {number} x - Center X
 * @property {number} y - Center Y
 * @property {number} type - POWERUP_WIDE or POWERUP_MULTI
 * @property {boolean} active
 */

/**
 * Maybe spawn a power-up from a destroyed brick.
 *
 * @param {Brick} brick - The destroyed brick
 * @returns {PowerUp|null}
 */
export function maybeSpawnPowerUp(brick) {
  if (Math.random() > POWERUP_DROP_CHANCE) return null;

  const type = Math.random() < 0.5 ? POWERUP_WIDE : POWERUP_MULTI;

  return {
    x: brick.x + brick.width / 2,
    y: brick.y + brick.height / 2,
    type,
    active: true,
  };
}

/**
 * Update power-up positions (fall down).
 *
 * @param {PowerUp[]} powerUps
 * @param {number} dt
 */
export function updatePowerUps(powerUps, dt) {
  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i];
    if (!p.active) continue;
    p.y += POWERUP_FALL_SPEED * dt;
    // Off screen
    if (p.y > 720) {
      p.active = false;
    }
  }
}

/**
 * Check if paddle catches a power-up.
 *
 * @param {PowerUp[]} powerUps
 * @param {{ x: number, width: number }} paddle
 * @param {number} paddleY
 * @param {number} paddleH
 * @returns {PowerUp|null} The caught power-up, or null
 */
export function catchPowerUp(powerUps, paddle, paddleY, paddleH) {
  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i];
    if (!p.active) continue;

    const halfSize = POWERUP_SIZE / 2;
    if (
      p.x + halfSize > paddle.x &&
      p.x - halfSize < paddle.x + paddle.width &&
      p.y + halfSize > paddleY &&
      p.y - halfSize < paddleY + paddleH
    ) {
      p.active = false;
      return p;
    }
  }
  return null;
}

/**
 * Draw a power-up.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {PowerUp} powerUp
 */
export function drawPowerUp(ctx, powerUp) {
  if (!powerUp.active) return;

  const { x, y, type } = powerUp;
  const s = POWERUP_SIZE / 2;

  if (type === POWERUP_WIDE) {
    // Wide paddle icon - horizontal arrows
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.roundRect(x - s, y - s, POWERUP_SIZE, POWERUP_SIZE, 3);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2194', x, y);
  } else {
    // Multi-ball icon - scattered dots
    ctx.fillStyle = '#ff9100';
    ctx.beginPath();
    ctx.roundRect(x - s, y - s, POWERUP_SIZE, POWERUP_SIZE, 3);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 3, y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(x, y + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
