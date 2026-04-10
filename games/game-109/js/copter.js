/**
 * MEME COPTER -- Copter Physics & Cave Generation
 * Handles helicopter state, cave terrain, and obstacle logic.
 */

import { clamp } from '../../shared/utils.js';

/** Canvas dimensions */
export const W = 400;
export const H = 700;

/** Copter constants */
const COPTER_SIZE = 16;
const COPTER_X = 80;
const GRAVITY = 0.35;
const THRUST = -0.55;
const MAX_VEL_DOWN = 6;
const MAX_VEL_UP = -5;

/** Cave constants */
const CAVE_SEGMENT_WIDTH = 4;
const INITIAL_GAP = 250;
const MIN_GAP = 120;
const GAP_NARROW_RATE = 0.015;
const CAVE_WANDER_SPEED = 0.6;
const CAVE_SMOOTH = 0.92;

/** Obstacle constants */
const OBSTACLE_WIDTH = 30;
const MIN_OBSTACLE_SPACING = 180;
const MAX_OBSTACLE_SPACING = 350;
const MIN_OBSTACLE_HEIGHT = 30;
const MAX_OBSTACLE_HEIGHT_FRAC = 0.35;

/** Trail length */
const TRAIL_LENGTH = 20;

/**
 * Create a fresh game state.
 *
 * @returns {Object} Game state
 */
export function createGameState() {
  const state = {
    copterY: H / 2,
    copterVelY: 0,
    thrusting: false,
    distance: 0,
    speed: 2.5,
    alive: true,
    score: 0,
    lastMilestone: 0,

    // Cave terrain arrays: each entry is { ceiling, floor } for one column
    cave: [],
    caveOffset: 0,

    // Internal cave generation state
    _caveCenterY: H / 2,
    _caveCenterVel: 0,
    _caveGap: INITIAL_GAP,
    _caveGenerated: 0,

    // Obstacles: { x, y, width, height, fromTop }
    obstacles: [],
    _nextObstacleDist: 300,

    // Trail positions
    trail: [],

    // Milestone callback (set externally)
    onMilestone: null,
  };

  // Pre-generate enough cave to fill the screen
  generateCaveTo(state, W + 200);

  return state;
}

/**
 * Generate cave terrain up to a given world-x position.
 *
 * @param {Object} state
 * @param {number} worldX - Target world x to generate up to
 */
function generateCaveTo(state, worldX) {
  while (state._caveGenerated < worldX) {
    // Random walk the cave center with smoothing
    state._caveCenterVel += (Math.random() - 0.5) * CAVE_WANDER_SPEED;
    state._caveCenterVel *= CAVE_SMOOTH;

    // Clamp center to keep gap within canvas
    const halfGap = state._caveGap / 2;
    state._caveCenterY += state._caveCenterVel;
    state._caveCenterY = clamp(state._caveCenterY, halfGap + 20, H - halfGap - 20);

    const ceiling = state._caveCenterY - halfGap;
    const floor = state._caveCenterY + halfGap;

    state.cave.push({ ceiling, floor });
    state._caveGenerated += CAVE_SEGMENT_WIDTH;

    // Gradually narrow the gap
    state._caveGap = Math.max(MIN_GAP, state._caveGap - GAP_NARROW_RATE);
  }
}

/**
 * Generate obstacles ahead of the camera.
 *
 * @param {Object} state
 */
function generateObstacles(state) {
  const cameraRight = state.distance + W + 100;

  while (state._nextObstacleDist < cameraRight) {
    const gap = state._caveGap;
    const maxH = gap * MAX_OBSTACLE_HEIGHT_FRAC;
    const obsHeight = MIN_OBSTACLE_HEIGHT + Math.random() * (maxH - MIN_OBSTACLE_HEIGHT);
    const fromTop = Math.random() < 0.5;

    // Find the cave bounds at this x
    const segIndex = Math.floor(state._nextObstacleDist / CAVE_SEGMENT_WIDTH) - Math.floor(state.caveOffset / CAVE_SEGMENT_WIDTH);
    const seg = state.cave[Math.max(0, Math.min(segIndex, state.cave.length - 1))];

    let obsY;
    if (fromTop) {
      obsY = seg.ceiling;
    } else {
      obsY = seg.floor - obsHeight;
    }

    state.obstacles.push({
      x: state._nextObstacleDist,
      y: obsY,
      width: OBSTACLE_WIDTH,
      height: obsHeight,
      fromTop,
    });

    state._nextObstacleDist += MIN_OBSTACLE_SPACING + Math.random() * (MAX_OBSTACLE_SPACING - MIN_OBSTACLE_SPACING);
  }
}

/**
 * Update the game state by one tick.
 *
 * @param {Object} state
 * @param {number} dt - Delta time normalized to 60fps
 * @returns {string|null} Event name: 'crash', 'milestone', or null
 */
export function update(state, dt) {
  if (!state.alive) return null;

  // Speed ramps up slowly over time
  state.speed = 2.5 + state.distance * 0.0003;
  const moveX = state.speed * dt;

  // Apply thrust or gravity
  if (state.thrusting) {
    state.copterVelY += THRUST * dt;
  } else {
    state.copterVelY += GRAVITY * dt;
  }
  state.copterVelY = clamp(state.copterVelY, MAX_VEL_UP, MAX_VEL_DOWN);
  state.copterY += state.copterVelY * dt;

  // Advance distance
  state.distance += moveX;

  // Generate more cave ahead
  generateCaveTo(state, state.distance + W + 300);

  // Generate obstacles ahead
  generateObstacles(state);

  // Calculate score
  state.score = Math.floor(state.distance / 10);

  // Trail
  state.trail.push({ x: COPTER_X, y: state.copterY });
  if (state.trail.length > TRAIL_LENGTH) {
    state.trail.shift();
  }

  // Collision: cave walls
  const worldX = state.distance + COPTER_X;
  const segIndex = Math.floor(worldX / CAVE_SEGMENT_WIDTH) - Math.floor(state.caveOffset / CAVE_SEGMENT_WIDTH);
  const seg = state.cave[segIndex];
  if (seg) {
    const halfSize = COPTER_SIZE / 2;
    if (state.copterY - halfSize <= seg.ceiling || state.copterY + halfSize >= seg.floor) {
      state.alive = false;
      return 'crash';
    }
  }

  // Collision: obstacles
  const copterLeft = state.distance + COPTER_X - COPTER_SIZE / 2;
  const copterRight = copterLeft + COPTER_SIZE;
  const copterTop = state.copterY - COPTER_SIZE / 2;
  const copterBottom = state.copterY + COPTER_SIZE / 2;

  for (const obs of state.obstacles) {
    if (obs.x + obs.width < copterLeft) continue;
    if (obs.x > copterRight) break;

    if (
      copterRight > obs.x &&
      copterLeft < obs.x + obs.width &&
      copterBottom > obs.y &&
      copterTop < obs.y + obs.height
    ) {
      state.alive = false;
      return 'crash';
    }
  }

  // Prune off-screen obstacles
  state.obstacles = state.obstacles.filter(o => o.x + o.width > state.distance - 50);

  // Prune old cave segments (keep a buffer behind camera)
  const pruneThreshold = Math.floor((state.distance - 100) / CAVE_SEGMENT_WIDTH);
  if (pruneThreshold > 100) {
    state.cave.splice(0, pruneThreshold - 50);
    state.caveOffset += (pruneThreshold - 50) * CAVE_SEGMENT_WIDTH;
  }

  // Milestone check
  const milestoneInterval = 100;
  const currentMilestone = Math.floor(state.score / milestoneInterval) * milestoneInterval;
  if (currentMilestone > state.lastMilestone && state.score >= milestoneInterval) {
    state.lastMilestone = currentMilestone;
    return 'milestone';
  }

  return null;
}

/**
 * Get copter bounding info for rendering.
 *
 * @returns {{ size: number, x: number }}
 */
export function getCopterConstants() {
  return { size: COPTER_SIZE, x: COPTER_X };
}

/**
 * Get cave segment width for rendering.
 *
 * @returns {number}
 */
export function getCaveSegmentWidth() {
  return CAVE_SEGMENT_WIDTH;
}
