/**
 * WHACK-A-ROT -- UI Components
 * ComboCounter, ScoreDisplay, wave progress bar, mute icon.
 */

import { COMBO_MILESTONES, COMBO_MULTIPLIER_CAP, COMBO_INCREMENT } from './constants.js';
import { formatScore } from '../../shared/utils.js';

// ---- ComboCounter ----

export class ComboCounter {
  constructor() {
    this.count = 0;
    this.maxCombo = 0;
    this.multiplier = 1.0;
    this.lastMilestoneShown = 0;
  }

  /**
   * Increment combo on successful (non-penalty) hit.
   * @returns {{ milestone: Object|null }}
   */
  increment() {
    this.count++;
    if (this.count > this.maxCombo) this.maxCombo = this.count;
    this.multiplier = Math.min(COMBO_MULTIPLIER_CAP, 1 + this.count * COMBO_INCREMENT);

    // Check milestones
    for (const m of COMBO_MILESTONES) {
      if (m.threshold <= this.count && m.threshold > this.lastMilestoneShown) {
        this.lastMilestoneShown = m.threshold;
        return { milestone: m };
      }
    }
    return { milestone: null };
  }

  /**
   * Reset combo to 0.
   */
  resetCombo() {
    this.count = 0;
    this.multiplier = 1.0;
    // Don't reset lastMilestoneShown -- allows re-triggering if they reach again
    this.lastMilestoneShown = 0;
  }

  /**
   * Calculate score for a hit.
   * @param {number} basePoints
   * @returns {number}
   */
  calculateScore(basePoints) {
    // Penalty is always flat, never multiplied
    if (basePoints < 0) return basePoints;
    return Math.floor(basePoints * this.multiplier);
  }

  /**
   * Draw combo counter on HUD.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   */
  draw(ctx, canvasWidth) {
    if (this.count <= 0) return;

    ctx.save();
    ctx.font = '500 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00ffaa';
    ctx.fillText(`combo x${this.count}`, canvasWidth / 2, 78);
    ctx.restore();
  }

  /**
   * Reset all state for new round.
   */
  reset() {
    this.count = 0;
    this.maxCombo = 0;
    this.multiplier = 1.0;
    this.lastMilestoneShown = 0;
  }
}

// ---- ScoreDisplay ----

export class ScoreDisplay {
  constructor() {
    this.displayScore = 0;
    this.targetScore = 0;
    this.flashTimer = 0;
    this.scaleTimer = 0;
  }

  /**
   * Update the score display with animation.
   * @param {number} dt
   * @param {number} score - Current actual score
   */
  update(dt, score) {
    const ms = dt * 16.67;

    if (score !== this.targetScore) {
      this.targetScore = score;
      this.flashTimer = 200;
      this.scaleTimer = 150;
    }

    // Animate display score towards target
    if (this.displayScore < this.targetScore) {
      const diff = this.targetScore - this.displayScore;
      const step = Math.max(1, Math.ceil(diff * 0.15));
      this.displayScore = Math.min(this.targetScore, this.displayScore + step);
    } else if (this.displayScore > this.targetScore) {
      const diff = this.displayScore - this.targetScore;
      const step = Math.max(1, Math.ceil(diff * 0.15));
      this.displayScore = Math.max(this.targetScore, this.displayScore - step);
    }

    if (this.flashTimer > 0) this.flashTimer -= ms;
    if (this.scaleTimer > 0) this.scaleTimer -= ms;
  }

  /**
   * Draw score on HUD.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {boolean} [transcendent=false] - Continuous lime glow when combo >= 20
   */
  draw(ctx, canvasWidth, transcendent = false) {
    const cx = canvasWidth / 2;

    // "AURA POINTS" label
    ctx.save();
    ctx.font = '500 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#8888a0';
    ctx.fillText('AURA POINTS', cx, 16);
    ctx.restore();

    // Score number
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const scale = this.scaleTimer > 0 ? 1 + 0.15 * (this.scaleTimer / 150) : 1;
    ctx.translate(cx, 38);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -38);

    if (this.flashTimer > 0) {
      ctx.fillStyle = '#c8ff00';
    } else if (transcendent) {
      ctx.fillStyle = '#c8ff00';
      ctx.shadowColor = '#c8ff00';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#f0f0f0';
    }

    ctx.font = '48px Bungee, sans-serif';
    ctx.fillText(formatScore(this.displayScore), cx, 38);
    ctx.restore();
  }

  /**
   * Reset for new round.
   */
  reset() {
    this.displayScore = 0;
    this.targetScore = 0;
    this.flashTimer = 0;
    this.scaleTimer = 0;
  }
}

// ---- Wave Progress Bar ----

/**
 * Draw the wave progress bar at the bottom.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} wave - Current wave 1-4
 * @param {number} waveProgress - 0.0-1.0 within current wave
 * @param {number} canvasWidth
 */
export function drawWaveProgress(ctx, wave, waveProgress, canvasWidth) {
  const barWidth = 320;
  const barHeight = 4;
  const barX = (canvasWidth - barWidth) / 2;
  const barY = 585;
  const segWidth = barWidth / 4;

  // Background
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Filled segments
  ctx.fillStyle = '#555570';
  const filledWaves = wave - 1;
  const filledWidth = filledWaves * segWidth + waveProgress * segWidth;
  ctx.fillRect(barX, barY, Math.min(filledWidth, barWidth), barHeight);
}

// ---- Mute Icon ----

/**
 * Draw a mute/unmute icon.
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} muted
 */
export function drawMuteIcon(ctx, muted) {
  const x = 12;
  const y = 12;
  const size = 20;

  ctx.save();
  ctx.strokeStyle = '#8888a0';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Speaker body
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 6);
  ctx.lineTo(x + 8, y + 6);
  ctx.lineTo(x + 13, y + 2);
  ctx.lineTo(x + 13, y + size - 2);
  ctx.lineTo(x + 8, y + size - 6);
  ctx.lineTo(x + 4, y + size - 6);
  ctx.closePath();
  ctx.stroke();

  if (muted) {
    // X mark
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 7);
    ctx.lineTo(x + 22, y + 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 7);
    ctx.lineTo(x + 16, y + 13);
    ctx.stroke();
  } else {
    // Sound waves
    ctx.beginPath();
    ctx.arc(x + 15, y + size / 2, 4, -0.6, 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 15, y + size / 2, 8, -0.5, 0.5);
    ctx.stroke();
  }

  ctx.restore();
}
