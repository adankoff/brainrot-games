/**
 * FLAPPY TRALALERO -- UI Components
 * ScoreDisplay (on-canvas HUD), character select, unlock notifications.
 */

import {
  SCORE_POP_DURATION, SCORE_FLASH_DURATION,
  COLOR_SCORE, COLOR_SCORE_FLASH, COLOR_SCORE_69,
} from './constants.js';
import { lerp } from '../../shared/utils.js';

// ---- ScoreDisplay: on-canvas HUD score ----

export class ScoreDisplay {
  constructor() {
    this.score = 0;
    this.popTimer = 0;
    this.flashTimer = 0;
    this.popScale = 1.0;
  }

  /**
   * Increment score by 1 and trigger animations.
   */
  increment() {
    this.score++;
    this.popTimer = SCORE_POP_DURATION;
    this.flashTimer = SCORE_FLASH_DURATION;
  }

  /**
   * Per-frame animation update.
   * @param {number} dt
   */
  update(dt) {
    if (this.popTimer > 0) {
      this.popTimer -= dt * 16.67;
      const progress = 1 - (this.popTimer / SCORE_POP_DURATION);
      if (progress < 0.5) {
        this.popScale = lerp(1.0, 1.2, progress * 2);
      } else {
        this.popScale = lerp(1.2, 1.0, (progress - 0.5) * 2);
      }
    } else {
      this.popScale = 1.0;
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= dt * 16.67;
    }
  }

  /**
   * Draw the score on canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   */
  draw(ctx, canvasWidth) {
    const fontSize = Math.round(56 * this.popScale);

    // Easter egg: score 69 flashes Hot Magenta with double pop
    let color = COLOR_SCORE;
    if (this.score === 69 && this.flashTimer > 0) {
      color = COLOR_SCORE_69;
    } else if (this.flashTimer > 0) {
      color = COLOR_SCORE_FLASH;
    }

    ctx.save();
    ctx.font = `${fontSize}px "Bungee", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Text shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(String(this.score), canvasWidth / 2 + 2, 18);

    // Main text
    ctx.fillStyle = color;
    ctx.fillText(String(this.score), canvasWidth / 2, 16);

    ctx.restore();
  }

  /**
   * Reset to 0 and clear animations.
   */
  reset() {
    this.score = 0;
    this.popTimer = 0;
    this.flashTimer = 0;
    this.popScale = 1.0;
  }
}
