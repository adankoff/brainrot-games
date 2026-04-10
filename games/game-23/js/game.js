/**
 * CLASSIC MEME WHACK -- Game Orchestrator
 * SpawnScheduler, GameTimer: core game loop components.
 */

import { CHARACTER_TYPES } from './characters.js';
import {
  getDisplayTime, getSpawnInterval, getMaxActive, getPenaltyWeight,
  ROUND_DURATION,
} from './constants.js';
import { randomBetween, randomInt } from '../../shared/utils.js';

// ---- SpawnScheduler ----

export class SpawnScheduler {
  constructor() {
    this.spawnTimer = 0;
    this.gameTime = 0;
  }

  /**
   * Per-frame update. Spawns characters when ready.
   * @param {number} dt - Normalized delta time
   * @param {import('./holes.js').Hole[]} holes - 9 holes
   * @param {number} effectiveWave
   */
  update(dt, holes, effectiveWave) {
    const ms = dt * 16.67;
    this.gameTime += ms;
    this.spawnTimer -= ms;

    if (this.spawnTimer <= 0) {
      const interval = getSpawnInterval(effectiveWave);
      this.spawnTimer = interval + randomBetween(-50, 50);

      const maxActive = getMaxActive(effectiveWave);
      const currentActive = holes.filter(h => h.state !== 'empty').length;
      if (currentActive >= maxActive) return;

      // Pick random available hole
      const available = holes.filter(h => h.isAvailable());
      if (available.length === 0) return;
      const hole = available[randomInt(0, available.length - 1)];

      // Pick character type
      const charType = this.selectCharacterType(effectiveWave);
      const baseDisplayTime = getDisplayTime(effectiveWave);
      const displayTime = baseDisplayTime * charType.displayTimeMultiplier;
      hole.spawn(charType, displayTime);
    }
  }

  /**
   * Select a character type using weighted random.
   * @param {number} effectiveWave
   * @returns {Object} Character type from CHARACTER_TYPES
   */
  selectCharacterType(effectiveWave) {
    // Determine weight tier
    let tier;
    if (effectiveWave <= 2) tier = 'early';
    else if (effectiveWave <= 4) tier = 'mid';
    else tier = 'late';

    // Build weight table
    const weights = {};
    for (const [id, char] of Object.entries(CHARACTER_TYPES)) {
      if (effectiveWave < char.appearsFromWave) {
        weights[id] = 0;
      } else {
        weights[id] = char.spawnWeights[tier];
      }
    }

    // Override penalty weight with formula
    weights.rickroll = getPenaltyWeight(effectiveWave);

    // Zero out characters that haven't appeared yet (redundant but safe)
    if (effectiveWave < CHARACTER_TYPES.harambe.appearsFromWave) {
      weights.harambe = 0;
    }

    // Normalize to sum to 1.0
    let total = 0;
    for (const w of Object.values(weights)) total += w;
    if (total === 0) return CHARACTER_TYPES.trollface; // fallback

    const r = Math.random() * total;
    let cumulative = 0;
    for (const [id, w] of Object.entries(weights)) {
      cumulative += w;
      if (r <= cumulative) return CHARACTER_TYPES[id];
    }

    // Fallback
    return CHARACTER_TYPES.trollface;
  }

  /**
   * Reset for new round.
   */
  reset() {
    this.spawnTimer = 0;
    this.gameTime = 0;
  }
}

// ---- GameTimer ----

export class GameTimer {
  constructor() {
    this.remaining = ROUND_DURATION;
    this.isWarning = false;
    this.paused = false;
  }

  /**
   * Per-frame update.
   * @param {number} dt - Normalized delta time
   * @returns {boolean} true if timer just reached 0
   */
  update(dt) {
    if (this.paused) return false;
    const seconds = (dt * 16.67) / 1000;
    this.remaining -= seconds;
    this.isWarning = this.remaining < 10.0;
    if (this.remaining <= 0) {
      this.remaining = 0;
      return true;
    }
    return false;
  }

  /**
   * Draw the timer on canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time - Game time in ms (for pulse animation)
   */
  draw(ctx, time) {
    const seconds = Math.ceil(this.remaining);
    let text;
    if (this.remaining < 10) {
      text = '00:' + this.remaining.toFixed(1).padStart(4, '0');
    } else {
      text = '00:' + String(seconds).padStart(2, '0');
    }

    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    if (this.isWarning) {
      const pulse = 1.0 + 0.05 * Math.sin(time * 0.012);
      ctx.translate(370, 14);
      ctx.scale(pulse, pulse);
      ctx.translate(-370, -14);
      ctx.fillStyle = '#ff2d78';
    } else {
      ctx.fillStyle = '#222222';
    }

    ctx.font = '28px Bungee, sans-serif';
    ctx.fillText(text, 370, 14);
    ctx.restore();
  }

  /**
   * Reset to 60 seconds.
   */
  reset() {
    this.remaining = ROUND_DURATION;
    this.isWarning = false;
    this.paused = false;
  }

  /**
   * Pause/resume.
   * @param {boolean} paused
   */
  setPaused(paused) {
    this.paused = paused;
  }
}
