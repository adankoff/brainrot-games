/**
 * WHACK-A-ROT -- Effects Manager
 * Visual effects: floating text, screen shake, ambient particles.
 */

import { randomBetween } from '../../shared/utils.js';

export class EffectsManager {
  constructor() {
    /** @type {Array<{ text: string, x: number, y: number, color: string, alpha: number, timer: number, maxTimer: number, fontSize: number }>} */
    this.floatingTexts = [];

    /** @type {{ timer: number, duration: number, magnitude: number, offsetX: number, offsetY: number }} */
    this.screenShake = { timer: 0, duration: 0, magnitude: 0, offsetX: 0, offsetY: 0 };

    /** @type {Array<{ x: number, y: number, vy: number, alpha: number, radius: number }>} */
    this.particles = [];
  }

  /**
   * Spawn a floating score text.
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} [duration=500]
   * @param {number} [fontSize=20]
   */
  spawnFloatingText(text, x, y, color, duration = 500, fontSize = 20) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1.0,
      timer: 0,
      maxTimer: duration,
      fontSize,
    });
  }

  /**
   * Start screen shake.
   * @param {number} magnitude - Max displacement in px
   * @param {number} durationMs
   */
  startScreenShake(magnitude, durationMs) {
    this.screenShake.timer = 0;
    this.screenShake.duration = durationMs;
    this.screenShake.magnitude = magnitude;
  }

  /**
   * Initialize ambient particles.
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  initParticles(canvasWidth, canvasHeight) {
    this.particles = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: randomBetween(0, canvasWidth),
        y: randomBetween(0, canvasHeight),
        vy: -randomBetween(0.1, 0.4),
        alpha: randomBetween(0.1, 0.2),
        radius: randomBetween(1, 2),
      });
    }
  }

  /**
   * Per-frame update.
   * @param {number} dt
   */
  update(dt) {
    const ms = dt * 16.67;

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timer += ms;
      const progress = ft.timer / ft.maxTimer;
      ft.y -= 0.8 * dt; // rise
      ft.alpha = 1.0 - progress;
      if (ft.timer >= ft.maxTimer) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.timer += ms;
      if (this.screenShake.timer >= this.screenShake.duration) {
        this.screenShake.duration = 0;
        this.screenShake.offsetX = 0;
        this.screenShake.offsetY = 0;
      } else {
        const intensity = 1 - (this.screenShake.timer / this.screenShake.duration);
        const mag = this.screenShake.magnitude * intensity;
        this.screenShake.offsetX = (Math.random() - 0.5) * 2 * mag;
        this.screenShake.offsetY = (Math.random() - 0.5) * 2 * mag;
      }
    }

    // Particles
    for (const p of this.particles) {
      p.y += p.vy * dt;
      if (p.y < -5) {
        p.y = 605;
        p.x = randomBetween(0, 400);
      }
    }
  }

  /**
   * Draw ambient particles.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,255,0,${p.alpha})`;
      ctx.fill();
    }
  }

  /**
   * Draw floating texts.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `${ft.fontSize}px Bungee, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  /**
   * Get current screen shake offset.
   * @returns {{ x: number, y: number }}
   */
  getShakeOffset() {
    return { x: this.screenShake.offsetX, y: this.screenShake.offsetY };
  }

  /**
   * Clear all effects.
   */
  reset() {
    this.floatingTexts = [];
    this.screenShake = { timer: 0, duration: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
    // Keep particles alive -- they'll be re-init'd if needed
  }
}
