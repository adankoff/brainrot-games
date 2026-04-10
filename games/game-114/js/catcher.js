/**
 * MEME CATCH -- Catcher (Basket)
 * The player-controlled basket at the bottom of the screen.
 */

import { clamp } from '../../shared/utils.js';

const BASKET_WIDTH = 70;
const BASKET_HEIGHT = 30;
const BASKET_Y_OFFSET = 40; // distance from bottom
const MOVE_SPEED = 7; // px per frame for keyboard

export class Catcher {
  constructor(canvasWidth, canvasHeight) {
    this.width = BASKET_WIDTH;
    this.height = BASKET_HEIGHT;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2; // center x
    this.y = canvasHeight - BASKET_Y_OFFSET;
    this.targetX = this.x;
    this.usePointer = false; // true when pointer/touch is active
  }

  reset(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - BASKET_Y_OFFSET;
    this.targetX = this.x;
    this.usePointer = false;
  }

  /**
   * Set the target x from pointer/touch input (logical coordinates).
   * @param {number} lx - Logical x coordinate
   */
  setPointerX(lx) {
    this.usePointer = true;
    this.targetX = clamp(lx, this.width / 2, this.canvasWidth - this.width / 2);
  }

  /**
   * Move left/right via keyboard.
   * @param {number} dir - -1 for left, +1 for right
   * @param {number} dt - Delta time multiplier
   */
  moveKeyboard(dir, dt) {
    this.usePointer = false;
    this.x = clamp(
      this.x + dir * MOVE_SPEED * dt,
      this.width / 2,
      this.canvasWidth - this.width / 2
    );
  }

  /**
   * Update position each frame.
   * @param {number} dt - Delta time multiplier
   */
  update(dt) {
    if (this.usePointer) {
      // Smooth follow towards pointer
      const diff = this.targetX - this.x;
      this.x += diff * 0.3 * dt;
      this.x = clamp(this.x, this.width / 2, this.canvasWidth - this.width / 2);
    }
  }

  /**
   * Get the AABB hitbox for collision detection.
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
