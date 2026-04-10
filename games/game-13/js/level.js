/**
 * ANIME DASH -- Level Generator
 * Procedural level generation with seed-based reproducibility.
 * Produces a fixed sequence of obstacles with increasing difficulty.
 */

// ---- Constants ----

export const LEVEL_LENGTH = 3000;
export const GROUND_Y = 480;
export const SCROLL_SPEED = 4;

/** Obstacle types */
export const OBS_SPIKE = 'spike';
export const OBS_BLOCK = 'block';
export const OBS_FLYING_SPIKE = 'flying_spike';
export const OBS_GAP = 'gap';

// ---- Obstacle dimensions ----

const SPIKE_W = 20;
const SPIKE_H = 20;
const BLOCK_W = 30;
const BLOCK_H = 30;
const FLYING_W = 20;
const FLYING_H = 16;
const GAP_W = 50;

// ---- Seeded RNG ----

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 *
 * @param {number} seed
 * @returns {function(): number} Returns float in [0, 1)
 */
function seededRng(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Obstacle Definition ----

/**
 * @typedef {Object} Obstacle
 * @property {string} type - One of OBS_SPIKE, OBS_BLOCK, OBS_FLYING_SPIKE, OBS_GAP
 * @property {number} x - World x position (left edge)
 * @property {number} y - World y position (top edge)
 * @property {number} w - Width
 * @property {number} h - Height
 */

// ---- Level Generation ----

/**
 * Generate a complete level as an array of obstacles.
 * Uses a seed for deterministic output -- same seed = same level every attempt.
 *
 * Difficulty segments:
 *   0-30%:  Easy -- single obstacles, wide spacing
 *   30-60%: Medium -- pairs of obstacles, moderate spacing
 *   60-100%: Hard -- tight sequences of 3-4 obstacles
 *
 * @param {number} [seed=42] - RNG seed for reproducibility
 * @returns {Obstacle[]} Sorted array of obstacles by x position
 */
export function generateLevel(seed = 42) {
  const rng = seededRng(seed);
  const obstacles = [];

  // Start placing obstacles after a safe zone
  let cursor = 200;
  const endZone = LEVEL_LENGTH - 100;

  while (cursor < endZone) {
    const pct = cursor / LEVEL_LENGTH;

    // Determine difficulty segment
    let segmentSize;
    let spacing;

    if (pct < 0.30) {
      // Easy: single obstacles, moderate spacing
      segmentSize = 1;
      spacing = 70 + rng() * 40;
    } else if (pct < 0.60) {
      // Medium: 1-3 obstacles in quick succession
      segmentSize = 1 + Math.floor(rng() * 3);
      spacing = 50 + rng() * 30;
    } else {
      // Hard: 2-4 obstacles, tight spacing
      segmentSize = 2 + Math.floor(rng() * 3);
      spacing = 35 + rng() * 25;
    }

    // Place a segment of obstacles
    for (let i = 0; i < segmentSize && cursor < endZone; i++) {
      const obs = pickObstacle(rng, pct, cursor);
      if (obs) {
        obstacles.push(obs);
      }
      cursor += 30 + rng() * 20; // intra-segment spacing
    }

    cursor += spacing;
  }

  return obstacles;
}

/**
 * Pick an obstacle type and create it based on difficulty.
 *
 * @param {function(): number} rng - Seeded RNG
 * @param {number} pct - Level progress 0-1
 * @param {number} x - World x position
 * @returns {Obstacle|null}
 */
function pickObstacle(rng, pct, x) {
  const roll = rng();

  if (pct < 0.30) {
    // Easy: mostly ground spikes, occasional low blocks
    if (roll < 0.60) {
      return makeSpike(x);
    } else if (roll < 0.85) {
      return makeBlock(x, false);
    } else {
      return makeGap(x, false);
    }
  } else if (pct < 0.60) {
    // Medium: all types, some tall blocks and flying spikes
    if (roll < 0.35) {
      return makeSpike(x);
    } else if (roll < 0.55) {
      return makeBlock(x, rng() > 0.5);
    } else if (roll < 0.75) {
      return makeFlyingSpike(x, false);
    } else {
      return makeGap(x, rng() > 0.5);
    }
  } else {
    // Hard: aggressive mix, taller obstacles, wider gaps
    if (roll < 0.30) {
      return makeSpike(x);
    } else if (roll < 0.50) {
      return makeBlock(x, true);
    } else if (roll < 0.70) {
      return makeFlyingSpike(x, rng() > 0.4);
    } else {
      return makeGap(x, true);
    }
  }
}

/**
 * Create a ground spike.
 *
 * @param {number} x
 * @returns {Obstacle}
 */
function makeSpike(x) {
  return {
    type: OBS_SPIKE,
    x,
    y: GROUND_Y - SPIKE_H,
    w: SPIKE_W,
    h: SPIKE_H,
  };
}

/**
 * Create a block obstacle.
 *
 * @param {number} x
 * @param {boolean} tall - If true, make the block taller (harder to jump over)
 * @returns {Obstacle}
 */
function makeBlock(x, tall) {
  const h = tall ? BLOCK_H + 15 : BLOCK_H;
  return {
    type: OBS_BLOCK,
    x,
    y: GROUND_Y - h,
    w: BLOCK_W,
    h,
  };
}

/**
 * Create a flying spike (airborne obstacle).
 *
 * @param {number} x
 * @param {boolean} low - If true, place lower (harder to avoid)
 * @returns {Obstacle}
 */
function makeFlyingSpike(x, low) {
  const flyY = low ? GROUND_Y - 60 : GROUND_Y - 90;
  return {
    type: OBS_FLYING_SPIKE,
    x,
    y: flyY,
    w: FLYING_W,
    h: FLYING_H,
  };
}

/**
 * Create a gap in the ground.
 *
 * @param {number} x
 * @param {boolean} wide - If true, make the gap wider
 * @returns {Obstacle}
 */
function makeGap(x, wide) {
  const w = wide ? GAP_W + 20 : GAP_W;
  return {
    type: OBS_GAP,
    x,
    y: GROUND_Y,
    w,
    h: 120,
  };
}

/**
 * Get the hitbox for collision detection.
 * Spikes use a slightly smaller hitbox for fairness (triangle inscribed).
 *
 * @param {Obstacle} obs
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getObstacleHitbox(obs) {
  if (obs.type === OBS_SPIKE || obs.type === OBS_FLYING_SPIKE) {
    // Shrink hitbox for triangular obstacles -- be fair
    return {
      x: obs.x + obs.w * 0.2,
      y: obs.y + obs.h * 0.3,
      width: obs.w * 0.6,
      height: obs.h * 0.7,
    };
  }
  if (obs.type === OBS_GAP) {
    // Gap hitbox is the empty space below ground level
    return {
      x: obs.x + 4,
      y: obs.y + 2,
      width: obs.w - 8,
      height: obs.h,
    };
  }
  // Block: standard AABB with slight shrink
  return {
    x: obs.x + 2,
    y: obs.y + 2,
    width: obs.w - 4,
    height: obs.h - 4,
  };
}
