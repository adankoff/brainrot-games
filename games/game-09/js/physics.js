/**
 * SLICE THE BRAINROT -- Physics Module
 * Object arcs, sliced halves, gravity, and spawning.
 */

import { randomBetween, randomInt } from '../../shared/utils.js';

// ---- Constants ----

export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 700;
export const GRAVITY = 0.3;
export const OBJECT_RADIUS = 25;
export const GAME_DURATION = 60; // seconds

// ---- Object Factory ----

/**
 * Create a launchable object.
 * @param {string} type - 'normal' | 'bomb' | 'imposter'
 * @param {number} [seed] - visual variation seed
 * @returns {Object} A game object ready to be launched
 */
export function createObject(type = 'normal', seed) {
  const s = seed !== undefined ? seed : randomInt(0, 999);
  const spawnX = randomBetween(60, LOGICAL_WIDTH - 60);
  const vx = randomBetween(-3, 3);
  const vy = randomBetween(-14, -10);

  return {
    x: spawnX,
    y: LOGICAL_HEIGHT + OBJECT_RADIUS,
    vx,
    vy,
    radius: OBJECT_RADIUS,
    type,
    seed: s,
    alive: true,
    sliced: false,
    /** For imposter: frames the tell has been shown */
    tellTimer: 0,
    /** For imposter: whether tell is currently visible */
    showTell: false,
    /** For imposter: peak reached flag */
    peakReached: false,
    /** Rotation for visual spin */
    rotation: 0,
    rotationSpeed: randomBetween(-0.04, 0.04),
  };
}

// ---- Sliced Half ----

/**
 * Create two halves from a sliced object.
 * @param {Object} obj - The sliced object
 * @param {number} sliceAngle - Angle of the slice
 * @returns {Array<Object>} Two half objects
 */
export function createSlicedHalves(obj, sliceAngle) {
  const perpAngle = sliceAngle + Math.PI / 2;
  const sep = 2;

  const half1 = {
    x: obj.x + Math.cos(perpAngle) * sep,
    y: obj.y + Math.sin(perpAngle) * sep,
    vx: obj.vx + Math.cos(perpAngle) * 2,
    vy: obj.vy - 1,
    radius: obj.radius * 0.7,
    rotation: obj.rotation,
    rotationSpeed: randomBetween(-0.1, -0.03),
    type: obj.type,
    seed: obj.seed,
    alpha: 1,
    life: 40,
    clipAngle: sliceAngle,
    clipSide: 1,
  };

  const half2 = {
    x: obj.x - Math.cos(perpAngle) * sep,
    y: obj.y - Math.sin(perpAngle) * sep,
    vx: obj.vx - Math.cos(perpAngle) * 2,
    vy: obj.vy - 1,
    radius: obj.radius * 0.7,
    rotation: obj.rotation,
    rotationSpeed: randomBetween(0.03, 0.1),
    type: obj.type,
    seed: obj.seed,
    alpha: 1,
    life: 40,
    clipAngle: sliceAngle,
    clipSide: -1,
  };

  return [half1, half2];
}

// ---- Update Functions ----

/**
 * Update an in-flight object (gravity, position).
 * @param {Object} obj
 * @param {number} dt - Delta time normalized to 60fps
 */
export function updateObject(obj, dt) {
  obj.vy += GRAVITY * dt;
  obj.x += obj.vx * dt;
  obj.y += obj.vy * dt;
  obj.rotation += obj.rotationSpeed * dt;

  // Imposter tell: show briefly at peak height
  if (obj.type === 'imposter') {
    // Detect peak (vy transitions from negative to positive)
    if (!obj.peakReached && obj.vy >= 0) {
      obj.peakReached = true;
      obj.showTell = true;
      obj.tellTimer = 0;
    }
    if (obj.showTell) {
      obj.tellTimer += dt;
      // ~200ms at 60fps = ~12 frames
      if (obj.tellTimer > 12) {
        obj.showTell = false;
      }
    }
  }

  // Off-screen check (below bottom)
  if (obj.y > LOGICAL_HEIGHT + OBJECT_RADIUS * 2) {
    obj.alive = false;
  }
}

/**
 * Update a sliced half (gravity, fade).
 * @param {Object} half
 * @param {number} dt
 */
export function updateHalf(half, dt) {
  half.vy += GRAVITY * dt;
  half.x += half.vx * dt;
  half.y += half.vy * dt;
  half.rotation += half.rotationSpeed * dt;
  half.life -= dt;
  half.alpha = Math.max(0, half.life / 40);
}

// ---- Splatter Particle ----

/**
 * Create splatter particles from a slice.
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} count
 * @returns {Array<Object>}
 */
export function createSplatterParticles(x, y, color, count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(1, 5);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      radius: randomBetween(1.5, 4),
      color,
      alpha: 1,
      life: randomBetween(15, 30),
      maxLife: 30,
    });
  }
  return particles;
}

/**
 * Update a splatter particle.
 * @param {Object} p
 * @param {number} dt
 */
export function updateParticle(p, dt) {
  p.vy += GRAVITY * 0.3 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  p.alpha = Math.max(0, p.life / p.maxLife);
}

// ---- Floating Text ----

/**
 * Create a floating score text.
 * @param {number} x
 * @param {number} y
 * @param {string} text
 * @param {string} color
 * @returns {Object}
 */
export function createFloatingText(x, y, text, color) {
  return {
    x,
    y,
    text,
    color,
    alpha: 1,
    life: 40,
    vy: -1.5,
  };
}

/**
 * Update floating text.
 * @param {Object} ft
 * @param {number} dt
 */
export function updateFloatingText(ft, dt) {
  ft.y += ft.vy * dt;
  ft.life -= dt;
  ft.alpha = Math.max(0, ft.life / 40);
}

// ---- Persistent Splatter (Grimace stains) ----

/**
 * Create a persistent splatter stain.
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @returns {Object}
 */
export function createSplatterStain(x, y, color) {
  return {
    x,
    y,
    radius: randomBetween(8, 20),
    color,
    alpha: randomBetween(0.15, 0.3),
    drips: [],
  };
}

// ---- Sparkle Particle (Looksmaxxing) ----

/**
 * Create sparkle particles for looksmaxxing glow-up effect.
 * @param {number} x
 * @param {number} y
 * @param {number} count
 * @returns {Array<Object>}
 */
export function createSparkleParticles(x, y, count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(1, 4);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      radius: randomBetween(1, 3),
      color: '#FFE066',
      alpha: 1,
      life: randomBetween(20, 35),
      maxLife: 35,
      sparkle: true,
    });
  }
  return particles;
}

// ---- Difficulty ----

/**
 * Get spawn parameters based on elapsed time.
 * @param {number} elapsed - Seconds elapsed
 * @returns {{ minObjects: number, maxObjects: number, bombChance: number, spawnInterval: number, imposterChance: number }}
 */
export function getDifficultyParams(elapsed) {
  if (elapsed < 15) {
    return { minObjects: 1, maxObjects: 2, bombChance: 0, spawnInterval: 1.4, imposterChance: 0.15 };
  }
  if (elapsed < 30) {
    return { minObjects: 2, maxObjects: 3, bombChance: 0.12, spawnInterval: 1.1, imposterChance: 0.2 };
  }
  if (elapsed < 45) {
    return { minObjects: 3, maxObjects: 4, bombChance: 0.18, spawnInterval: 0.9, imposterChance: 0.25 };
  }
  return { minObjects: 4, maxObjects: 5, bombChance: 0.22, spawnInterval: 0.7, imposterChance: 0.3 };
}
