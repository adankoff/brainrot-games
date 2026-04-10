/**
 * ANIME DASH -- Player Physics
 * Gravity, jump, rotation, ground collision, obstacle collision.
 * The player is a 20x20 cube at fixed x=80, auto-scrolling handled by camera.
 */

import { checkCollisionAABB } from '../../shared/utils.js';
import { GROUND_Y, LEVEL_LENGTH, SCROLL_SPEED, OBS_GAP, getObstacleHitbox } from './level.js';

// ---- Constants ----

export const PLAYER_SIZE = 20;
export const PLAYER_X = 80;
const GRAVITY = 0.7;
const JUMP_VEL = -11;
// Rotation is handled by targetRotation interpolation in updatePlayer

// ---- Player State ----

/**
 * @typedef {Object} PlayerState
 * @property {number} y - Top edge y position
 * @property {number} vy - Vertical velocity
 * @property {number} rotation - Current visual rotation in radians
 * @property {number} targetRotation - Target rotation to snap to
 * @property {boolean} grounded - Whether player is on ground
 * @property {boolean} dead - Whether player hit an obstacle
 * @property {number} scrollX - Horizontal scroll offset (camera position)
 * @property {number} deathPct - Progress percentage at death
 */

/**
 * Create a fresh player state.
 *
 * @returns {PlayerState}
 */
export function createPlayer() {
  return {
    y: GROUND_Y - PLAYER_SIZE,
    vy: 0,
    rotation: 0,
    targetRotation: 0,
    grounded: true,
    dead: false,
    scrollX: 0,
    deathPct: 0,
  };
}

/**
 * Make the player jump (only if grounded).
 *
 * @param {PlayerState} player
 */
export function playerJump(player) {
  if (!player.grounded || player.dead) return;

  player.vy = JUMP_VEL;
  player.grounded = false;
  player.targetRotation += Math.PI / 2; // 90 degrees per jump
}

/**
 * Update player physics for one frame.
 *
 * @param {PlayerState} player
 * @param {import('./level.js').Obstacle[]} obstacles
 * @param {number} dt - Normalized delta time (1.0 = one frame at 60fps)
 * @returns {{ dead: boolean, progress: number }}
 */
export function updatePlayer(player, obstacles, dt) {
  if (player.dead) {
    return { dead: true, progress: player.deathPct };
  }

  // Auto-scroll
  player.scrollX += SCROLL_SPEED * dt;

  // Gravity
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  // Determine if there is ground beneath the player
  const playerWorldX = player.scrollX + PLAYER_X;
  let groundLevel = GROUND_Y;
  let overGap = false;

  // Check if player is over a gap
  for (const obs of obstacles) {
    if (obs.type !== OBS_GAP) continue;
    if (playerWorldX + PLAYER_SIZE > obs.x + 4 && playerWorldX < obs.x + obs.w - 4) {
      overGap = true;
      break;
    }
  }

  // Ground collision
  if (!overGap && player.y + PLAYER_SIZE >= groundLevel) {
    player.y = groundLevel - PLAYER_SIZE;
    player.vy = 0;
    player.grounded = true;
  } else if (overGap && player.y + PLAYER_SIZE >= groundLevel) {
    // Falling into a gap
    player.grounded = false;
  }

  // Fell off screen (into gap or below)
  if (player.y > GROUND_Y + 100) {
    return die(player);
  }

  // Rotation animation (smooth interpolation toward target)
  if (player.grounded) {
    // Snap to nearest 90-degree multiple when grounded
    const snapped = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
    player.rotation += (snapped - player.rotation) * 0.3 * dt;
  } else {
    // Rotate toward target while in air
    const diff = player.targetRotation - player.rotation;
    player.rotation += diff * 0.15 * dt;
  }

  // Obstacle collision detection
  const playerBox = {
    x: playerWorldX + 2,
    y: player.y + 2,
    width: PLAYER_SIZE - 4,
    height: PLAYER_SIZE - 4,
  };

  for (const obs of obstacles) {
    // Skip obstacles that are far away (performance)
    if (obs.x + obs.w < playerWorldX - 20) continue;
    if (obs.x > playerWorldX + PLAYER_SIZE + 20) break;

    // Skip gap type for AABB collision (gaps kill by falling, not touching)
    if (obs.type === OBS_GAP) continue;

    const hitbox = getObstacleHitbox(obs);
    if (checkCollisionAABB(playerBox, hitbox)) {
      return die(player);
    }
  }

  // Calculate progress
  const progress = Math.min(100, Math.floor((player.scrollX / LEVEL_LENGTH) * 100));

  // Level complete
  if (player.scrollX >= LEVEL_LENGTH) {
    return { dead: false, progress: 100 };
  }

  return { dead: false, progress };
}

/**
 * Mark the player as dead and record death percentage.
 *
 * @param {PlayerState} player
 * @returns {{ dead: boolean, progress: number }}
 */
function die(player) {
  player.dead = true;
  player.deathPct = Math.min(100, Math.floor((player.scrollX / LEVEL_LENGTH) * 100));
  return { dead: true, progress: player.deathPct };
}

/**
 * Get the player's hitbox in world space for rendering.
 *
 * @param {PlayerState} player
 * @returns {{ x: number, y: number, size: number, rotation: number }}
 */
export function getPlayerWorldPos(player) {
  return {
    x: PLAYER_X,
    y: player.y,
    size: PLAYER_SIZE,
    rotation: player.rotation,
  };
}
