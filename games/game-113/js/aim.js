/**
 * AIM TRAINER -- Core game logic
 * Manages targets, scoring, timing, and hit detection.
 */

import { randomBetween, checkCollisionCirclePoint } from '../../shared/utils.js';

const GAME_DURATION = 30;       // seconds
const TARGET_LIFESPAN = 2000;   // ms before target expires
const BASE_RADIUS = 40;
const MIN_RADIUS = 30;
const SPAWN_MARGIN = 50;        // keep targets away from edges
const MULTI_TARGET_THRESHOLD = 10; // spawn 2 at once after this score

/**
 * @typedef {Object} Target
 * @property {number} x
 * @property {number} y
 * @property {number} radius       - current radius (shrinks over time)
 * @property {number} maxRadius    - starting radius
 * @property {number} spawnTime    - performance.now() when spawned
 * @property {number} life         - 0..1 remaining fraction
 * @property {boolean} hit         - was this target hit?
 */

/**
 * @typedef {Object} HitEffect
 * @property {number} x
 * @property {number} y
 * @property {number} t            - progress 0..1
 * @property {Array<{x:number, y:number, vx:number, vy:number, life:number}>} particles
 */

export class AimGame {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  constructor(canvasWidth, canvasHeight) {
    this.W = canvasWidth;
    this.H = canvasHeight;
    this.reset();
  }

  reset() {
    /** @type {Target[]} */
    this.targets = [];

    /** @type {HitEffect[]} */
    this.hitEffects = [];

    this.hits = 0;
    this.misses = 0;
    this.totalReactionTime = 0;   // sum of reaction times for hits (ms)
    this.timeLeft = GAME_DURATION;
    this.elapsed = 0;             // total elapsed ms
    this.gameOver = false;
    this.score = 0;

    /** @type {{x:number, y:number}} */
    this.cursor = { x: this.W / 2, y: this.H / 2 };

    this._spawnTargets();
  }

  /**
   * Get the max radius for current difficulty level.
   * @returns {number}
   */
  _currentMaxRadius() {
    // Shrink from BASE_RADIUS to MIN_RADIUS as hits increase (over 30 hits)
    const progress = Math.min(this.hits / 30, 1);
    return BASE_RADIUS - (BASE_RADIUS - MIN_RADIUS) * progress;
  }

  /**
   * Spawn one or more targets depending on current score.
   */
  _spawnTargets() {
    const count = this.hits >= MULTI_TARGET_THRESHOLD ? 2 : 1;
    // Only spawn enough to fill up — don't double-stack
    const needed = count - this.targets.length;
    for (let i = 0; i < needed; i++) {
      this._spawnOne();
    }
  }

  _spawnOne() {
    const maxR = this._currentMaxRadius();
    const x = randomBetween(SPAWN_MARGIN, this.W - SPAWN_MARGIN);
    // Keep targets below a top HUD bar (60px) and above bottom
    const y = randomBetween(70, this.H - SPAWN_MARGIN);
    this.targets.push({
      x,
      y,
      radius: maxR,
      maxRadius: maxR,
      spawnTime: performance.now(),
      life: 1,
      hit: false,
    });
  }

  /**
   * Update cursor position (called from mousemove/touchmove).
   * @param {number} x
   * @param {number} y
   */
  setCursor(x, y) {
    this.cursor.x = x;
    this.cursor.y = y;
  }

  /**
   * Handle a click/tap at logical coordinates.
   * @param {{x: number, y: number}} pos
   * @returns {'hit'|'miss'}
   */
  handleTap(pos) {
    if (this.gameOver) return 'miss';

    // Check targets in reverse (newest on top)
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (checkCollisionCirclePoint(t, pos)) {
        // Hit!
        const reactionTime = performance.now() - t.spawnTime;
        this.totalReactionTime += reactionTime;
        this.hits++;
        t.hit = true;

        // Create hit effect
        this._createHitEffect(t.x, t.y);

        // Remove target
        this.targets.splice(i, 1);

        // Spawn replacements
        this._spawnTargets();

        return 'hit';
      }
    }

    // Miss — clicked but didn't hit any target
    this.misses++;
    return 'miss';
  }

  /**
   * Create expanding ring + particles at hit location.
   * @param {number} x
   * @param {number} y
   */
  _createHitEffect(x, y) {
    const particles = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + randomBetween(-0.3, 0.3);
      const speed = randomBetween(1.5, 4);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    }
    this.hitEffects.push({ x, y, t: 0, particles });
  }

  /**
   * Update game state.
   * @param {number} dt - normalized delta (1.0 = one frame at 60fps)
   * @returns {Object} events that occurred { expired: boolean, finished: boolean }
   */
  update(dt) {
    if (this.gameOver) return { expired: false, finished: false };

    const dtMs = dt * (1000 / 60);
    this.elapsed += dtMs;
    this.timeLeft = Math.max(0, GAME_DURATION - this.elapsed / 1000);

    let expired = false;

    // Update targets
    const now = performance.now();
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const age = now - t.spawnTime;
      t.life = Math.max(0, 1 - age / TARGET_LIFESPAN);
      // Shrink radius proportional to remaining life
      t.radius = t.maxRadius * (0.3 + 0.7 * t.life);

      if (t.life <= 0) {
        // Expired — count as miss
        this.misses++;
        this.targets.splice(i, 1);
        expired = true;
      }
    }

    // Spawn replacements if any expired
    if (expired) {
      this._spawnTargets();
    }

    // Update hit effects
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const fx = this.hitEffects[i];
      fx.t += 0.04 * dt;
      for (const p of fx.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.03 * dt;
      }
      if (fx.t >= 1) {
        this.hitEffects.splice(i, 1);
      }
    }

    // Check game over
    let finished = false;
    if (this.timeLeft <= 0) {
      this.gameOver = true;
      this._calculateScore();
      finished = true;
    }

    return { expired, finished };
  }

  _calculateScore() {
    const accuracy = this.getAccuracy();
    const accuracyBonus = Math.round(accuracy * 5); // up to 500 bonus
    this.score = this.hits * 100 + accuracyBonus;
  }

  /**
   * @returns {number} accuracy as percentage 0-100
   */
  getAccuracy() {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round((this.hits / total) * 100);
  }

  /**
   * @returns {number} average reaction time in ms, or 0 if no hits
   */
  getAvgReactionTime() {
    if (this.hits === 0) return 0;
    return Math.round(this.totalReactionTime / this.hits);
  }
}
