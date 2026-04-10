/**
 * BRAINROT BREAKER -- Physics
 * Ball class (position, velocity, wall/paddle/brick reflection)
 * and Paddle class (follow mouse/touch, keyboard fallback).
 */

import { clamp } from '../../shared/utils.js';

// ---- Constants ----

export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 700;
export const BALL_RADIUS = 8;
export const BALL_BASE_SPEED = 5;
export const BALL_SPEED_INCREMENT = 0.5;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 12;
export const PADDLE_Y = 650;
export const PADDLE_SPEED = 8; // keyboard movement per frame

// ---- Ball ----

export class Ball {
  /**
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} vx - Velocity X
   * @param {number} vy - Velocity Y
   */
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = BALL_RADIUS;
    this.active = true;
  }

  /**
   * Update ball position, bounce off walls and ceiling.
   *
   * @param {number} dt - Delta time (1.0 = one frame at 60fps)
   * @returns {boolean} true if ball fell below screen (lost)
   */
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Left wall
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    }

    // Right wall
    if (this.x + this.radius >= LOGICAL_WIDTH) {
      this.x = LOGICAL_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }

    // Ceiling
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
    }

    // Fell below screen
    if (this.y - this.radius > LOGICAL_HEIGHT) {
      this.active = false;
      return true;
    }

    return false;
  }

  /**
   * Check and handle collision with the paddle.
   * Adjusts ball angle based on hit position on paddle.
   *
   * @param {Paddle} paddle
   * @param {number} speed - Current ball speed
   */
  bounceOffPaddle(paddle, speed) {
    // Only bounce if ball is moving downward
    if (this.vy < 0) return;

    const px = paddle.x;
    const py = PADDLE_Y;
    const pw = paddle.width;
    const ph = PADDLE_HEIGHT;

    // AABB check: ball bounding box vs paddle rect
    if (
      this.x + this.radius > px &&
      this.x - this.radius < px + pw &&
      this.y + this.radius > py &&
      this.y - this.radius < py + ph
    ) {
      // Place ball above paddle
      this.y = py - this.radius;

      // Calculate angle based on hit position
      // -1 = left edge, 0 = center, +1 = right edge
      const hitPos = (this.x - (px + pw / 2)) / (pw / 2);
      const maxAngle = Math.PI * 0.38; // ~68 degrees from vertical
      const angle = clamp(hitPos, -1, 1) * maxAngle;

      this.vx = speed * Math.sin(angle);
      this.vy = -speed * Math.cos(angle);
    }
  }

  /**
   * Get bounding box for AABB collision tests.
   *
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }
}

// ---- Paddle ----

export class Paddle {
  constructor() {
    this.width = PADDLE_WIDTH;
    this.x = (LOGICAL_WIDTH - PADDLE_WIDTH) / 2;
    /** @type {number|null} Pointer-tracked X position (null = no pointer active) */
    this._pointerX = null;
    /** @type {Set<string>} Currently pressed keys */
    this._keys = new Set();
  }

  /**
   * Set pointer X position in logical coordinates.
   *
   * @param {number} logicalX
   */
  setPointerX(logicalX) {
    this._pointerX = logicalX;
  }

  /**
   * Mark a key as pressed.
   *
   * @param {string} code - KeyboardEvent.code
   */
  keyDown(code) {
    this._keys.add(code);
  }

  /**
   * Mark a key as released.
   *
   * @param {string} code - KeyboardEvent.code
   */
  keyUp(code) {
    this._keys.delete(code);
  }

  /**
   * Update paddle position. Pointer takes priority over keyboard.
   *
   * @param {number} dt - Delta time
   */
  update(dt) {
    if (this._pointerX !== null) {
      // Center paddle on pointer
      this.x = this._pointerX - this.width / 2;
    } else {
      // Keyboard fallback
      if (this._keys.has('ArrowLeft') || this._keys.has('KeyA')) {
        this.x -= PADDLE_SPEED * dt;
      }
      if (this._keys.has('ArrowRight') || this._keys.has('KeyD')) {
        this.x += PADDLE_SPEED * dt;
      }
    }

    // Clamp to screen bounds
    this.x = clamp(this.x, 0, LOGICAL_WIDTH - this.width);
  }

  /**
   * Reset paddle to default state and width.
   */
  reset() {
    this.width = PADDLE_WIDTH;
    this.x = (LOGICAL_WIDTH - PADDLE_WIDTH) / 2;
    this._pointerX = null;
    this._keys.clear();
  }

  /**
   * Set wide paddle (power-up).
   */
  setWide() {
    this.width = PADDLE_WIDTH * 2;
    this.x = clamp(this.x, 0, LOGICAL_WIDTH - this.width);
  }

  /**
   * Reset paddle to normal width.
   */
  setNormal() {
    this.width = PADDLE_WIDTH;
    this.x = clamp(this.x, 0, LOGICAL_WIDTH - this.width);
  }
}
