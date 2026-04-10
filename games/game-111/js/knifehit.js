/**
 * KNIFE HIT -- Game Logic
 * Manages log rotation, knife throwing, collision detection, and level progression.
 */

/** Log radius in logical pixels */
export const LOG_RADIUS = 120;

/** Knife blade length */
export const KNIFE_BLADE_LENGTH = 60;

/** Knife blade width */
export const KNIFE_BLADE_WIDTH = 6;

/** Knife handle length */
export const KNIFE_HANDLE_LENGTH = 24;

/** Distance from log center to where knife tip sticks */
export const KNIFE_STICK_DISTANCE = LOG_RADIUS + KNIFE_BLADE_LENGTH - 12;

/** Collision angular tolerance (radians) -- how close two knives can be */
const KNIFE_COLLISION_ANGLE = 0.18;

/** Knife throw speed (pixels per normalized frame) */
const THROW_SPEED = 18;

/**
 * Create a fresh game state.
 *
 * @returns {Object} Initial game state
 */
export function createGameState() {
  const state = {
    // Log
    logX: 200,
    logY: 200,
    logAngle: 0,
    logSpeed: 1.0, // radians per second (at 60fps: divided by 60)
    logDirection: 1, // 1 or -1

    // Stuck knives: array of { angle: number } -- angle relative to log
    stuckKnives: [],

    // Flying knife (only one at a time)
    flyingKnife: null, // { x, y, speed } or null

    // Level
    level: 1,
    knivesPerLevel: 5,
    knivesRemaining: 5,

    // Score
    score: 0,
    totalKnivesStuck: 0,

    // State flags
    ended: false,
    levelClearing: false,
    levelClearTimer: 0,
    hitKnife: false,
    hitFlashTimer: 0,

    // Direction change timer
    dirChangeTimer: 0,
    dirChangeInterval: 180, // frames (~3 seconds)
  };

  return state;
}

/**
 * Start a new level, resetting the log and knife queue.
 *
 * @param {Object} state - Game state
 */
export function startNewLevel(state) {
  state.stuckKnives = [];
  state.logAngle = 0;
  state.levelClearing = false;
  state.levelClearTimer = 0;
  state.flyingKnife = null;

  // Increase difficulty
  state.logSpeed = 1.0 + (state.level - 1) * 0.15;
  state.knivesPerLevel = 5 + Math.floor((state.level - 1) * 1.5);
  state.knivesRemaining = state.knivesPerLevel;

  // Randomize initial direction
  state.logDirection = Math.random() < 0.5 ? 1 : -1;
  state.dirChangeTimer = 0;
  state.dirChangeInterval = Math.max(90, 180 - (state.level - 1) * 10);
}

/**
 * Attempt to throw a knife from the bottom.
 *
 * @param {Object} state - Game state
 * @returns {boolean} Whether the throw started
 */
export function throwKnife(state) {
  if (state.ended || state.levelClearing) return false;
  if (state.flyingKnife !== null) return false;
  if (state.knivesRemaining <= 0) return false;

  state.flyingKnife = {
    x: state.logX,
    y: 620,
    speed: THROW_SPEED,
  };

  return true;
}

/**
 * Update the game state by one frame.
 *
 * @param {Object} state - Game state
 * @param {number} dt - Delta time normalized to 60fps
 * @returns {{ event: string|null }} Events: 'stick', 'hit', 'levelUp', null
 */
export function updateState(state, dt) {
  if (state.ended) return { event: null };

  // Level clear animation
  if (state.levelClearing) {
    state.levelClearTimer += dt;
    if (state.levelClearTimer > 90) { // ~1.5 seconds
      state.level++;
      startNewLevel(state);
      return { event: 'levelUp' };
    }
    return { event: null };
  }

  // Hit flash
  if (state.hitFlashTimer > 0) {
    state.hitFlashTimer -= dt;
  }

  // Rotate log
  const angleStep = (state.logSpeed / 60) * dt * state.logDirection;
  state.logAngle += angleStep;

  // Direction changes
  state.dirChangeTimer += dt;
  if (state.dirChangeTimer >= state.dirChangeInterval) {
    state.dirChangeTimer = 0;
    if (Math.random() < 0.4) {
      state.logDirection *= -1;
    }
    // Vary the interval
    state.dirChangeInterval = Math.max(60, 120 + Math.random() * 120 - (state.level - 1) * 5);
  }

  // Update flying knife
  if (state.flyingKnife) {
    state.flyingKnife.y -= state.flyingKnife.speed * dt;

    // Check if knife reached the log edge
    const knifeTopY = state.flyingKnife.y;
    const logBottomEdge = state.logY + LOG_RADIUS;

    if (knifeTopY <= logBottomEdge) {
      // Knife arrives from below, so in world space it sticks at the bottom of the log.
      // In the log's local frame (which is rotated by logAngle), the world "down" (+Y)
      // direction corresponds to local angle = -logAngle.
      const localAngle = normalizeAngle(-state.logAngle);

      if (checkKnifeCollision(state, localAngle)) {
        // Hit another knife -- game over
        state.hitKnife = true;
        state.hitFlashTimer = 30;
        state.ended = true;
        state.flyingKnife = null;
        return { event: 'hit' };
      }

      // Stick the knife
      state.stuckKnives.push({ angle: localAngle });
      state.flyingKnife = null;
      state.knivesRemaining--;
      state.totalKnivesStuck++;
      state.score += 10;

      // Check level complete
      if (state.knivesRemaining <= 0) {
        state.levelClearing = true;
        state.levelClearTimer = 0;
        state.score += state.level * 50; // Level bonus
        return { event: 'stick' }; // stick event, levelUp comes after timer
      }

      return { event: 'stick' };
    }
  }

  return { event: null };
}

/**
 * Check if a knife at the given local angle collides with any stuck knife.
 *
 * @param {Object} state - Game state
 * @param {number} angle - Local angle of the new knife
 * @returns {boolean} True if collision detected
 */
function checkKnifeCollision(state, angle) {
  for (const knife of state.stuckKnives) {
    const diff = Math.abs(normalizeAngleDiff(angle - knife.angle));
    if (diff < KNIFE_COLLISION_ANGLE) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize an angle to [-PI, PI].
 *
 * @param {number} a - Angle in radians
 * @returns {number} Normalized angle
 */
function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Normalize angle difference to [-PI, PI].
 *
 * @param {number} diff - Angle difference
 * @returns {number} Normalized difference
 */
function normalizeAngleDiff(diff) {
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Calculate the final score for game-over.
 *
 * @param {Object} state - Game state
 * @returns {number} Final score
 */
export function calculateScore(state) {
  return state.score;
}
