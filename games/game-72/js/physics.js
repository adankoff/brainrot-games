/**
 * BRAINROT NINJA -- Physics
 * Object class (launched from bottom, parabolic arc), SlicedHalf class
 * (two halves falling apart after slice), Particle class for effects.
 */

import { randomBetween, randomInt } from '../../shared/utils.js';

export const GRAVITY = 0.3;
export const OBJECT_RADIUS = 25;

/**
 * A throwable object that follows a parabolic arc.
 */
export class ThrowObject {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {boolean} isBomb
   */
  constructor(canvasWidth, canvasHeight, isBomb = false) {
    this.x = randomBetween(OBJECT_RADIUS + 20, canvasWidth - OBJECT_RADIUS - 20);
    this.y = canvasHeight + OBJECT_RADIUS;
    this.vx = randomBetween(-3, 3);
    this.vy = randomBetween(-14, -10);
    this.radius = OBJECT_RADIUS;
    this.isBomb = isBomb;
    this.sliced = false;
    this.variant = randomInt(0, 4);
    this.rotation = 0;
    this.rotationSpeed = randomBetween(-0.04, 0.04);
  }

  /**
   * Update position with gravity.
   * @param {number} dt - Delta time normalized to 60fps
   */
  update(dt) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;
  }

  /**
   * Check if object has fallen below the canvas.
   * @param {number} canvasHeight
   * @returns {boolean}
   */
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.radius * 2;
  }
}

/**
 * A half of a sliced object that tumbles and falls.
 */
export class SlicedHalf {
  /**
   * @param {number} x - Starting x
   * @param {number} y - Starting y
   * @param {number} vx - Horizontal velocity
   * @param {number} vy - Vertical velocity
   * @param {number} radius - Size reference
   * @param {boolean} isLeft - Left or right half
   * @param {number} variant - Color variant from parent
   * @param {boolean} isBomb - Whether the parent was a bomb
   */
  constructor(x, y, vx, vy, radius, isLeft, variant, isBomb) {
    this.x = x;
    this.y = y;
    this.vx = vx + (isLeft ? -2 : 2);
    this.vy = vy - 1;
    this.radius = radius;
    this.isLeft = isLeft;
    this.variant = variant;
    this.isBomb = isBomb;
    this.rotation = 0;
    this.rotationSpeed = isLeft ? -0.08 : 0.08;
    this.alpha = 1;
  }

  /**
   * Update falling half with gravity and fading.
   * @param {number} dt
   */
  update(dt) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;
    this.alpha -= 0.008 * dt;
    if (this.alpha < 0) this.alpha = 0;
  }

  /**
   * Check if this half has fallen off screen and faded.
   * @param {number} canvasHeight
   * @returns {boolean}
   */
  isDead(canvasHeight) {
    return this.y > canvasHeight + 100 || this.alpha <= 0;
  }
}

/**
 * A small visual particle for slice effects.
 */
export class Particle {
  /**
   * @param {number} x
   * @param {number} y
   * @param {Object} [opts]
   */
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.vx = opts.vx ?? randomBetween(-4, 4);
    this.vy = opts.vy ?? randomBetween(-6, -1);
    this.size = opts.size ?? randomBetween(2, 5);
    this.life = 1.0;
    this.decay = opts.decay ?? randomBetween(0.02, 0.05);
    this.color = opts.color || null;
    this.golden = opts.golden || false;
    this.angle = opts.angle ?? randomBetween(0, Math.PI * 2);
    this.angleSpeed = randomBetween(-0.1, 0.1);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.15 * dt;
    this.life -= this.decay * dt;
    this.angle += this.angleSpeed * dt;
    if (this.life < 0) this.life = 0;
  }

  /** @returns {boolean} */
  isDead() {
    return this.life <= 0;
  }
}

/**
 * Create slice particles for a given position and theme.
 * @param {number} x
 * @param {number} y
 * @param {string} themeId
 * @returns {Particle[]}
 */
export function createSliceParticles(x, y, themeId) {
  const particles = [];
  const count = 8;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = randomBetween(2, 6);
    const opts = {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: randomBetween(2, 5),
      decay: randomBetween(0.02, 0.04),
    };

    if (themeId === 'aura') {
      opts.golden = Math.random() > 0.5;
      opts.angle = randomBetween(0, Math.PI * 2);
    } else if (themeId === 'fanum') {
      const colors = ['#e8a030', '#ffd700', '#cc3300', '#55cc33', '#d4960f'];
      opts.color = colors[Math.floor(Math.random() * colors.length)];
    }

    particles.push(new Particle(x, y, opts));
  }
  return particles;
}
