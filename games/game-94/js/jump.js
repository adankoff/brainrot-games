/**
 * MEME JUMP -- Game Engine
 * Doodle Jump clone with procedural platform generation.
 * Pure state + update functions, no rendering.
 */

export const W = 400;
export const H = 700;

const GRAVITY = 0.15;
const BOUNCE_VY = -8;
const SPRING_VY = -14;
const PLAYER_W = 30;
const PLAYER_H = 30;
const PLATFORM_W = 60;
const PLATFORM_H = 12;
const MOVE_SPEED = 5;
const MOVING_PLAT_SPEED = 1.2;

// Difficulty curve: how far apart platforms get
const MIN_GAP_BASE = 60;
const MAX_GAP_BASE = 100;
const GAP_INCREASE_RATE = 0.003; // per 1000 height pixels

/**
 * Platform types:
 *   'normal'   - green, always solid
 *   'moving'   - blue, slides left/right
 *   'breakable'- brown, crumbles on touch (one use)
 *   'spring'   - red, extra high bounce
 */

/**
 * Create initial game state.
 *
 * @returns {Object} Game state
 */
export function createJumpState() {
  const state = {
    player: {
      x: W / 2 - PLAYER_W / 2,
      y: H - 100,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      facingRight: true,
    },
    platforms: [],
    camera: 0,        // how far the camera has scrolled up (positive = up)
    maxHeight: 0,     // highest y the player has reached (in world coords, lower = higher)
    score: 0,
    gameOver: false,
    particles: [],     // crumble particles
    heightGenerated: 0, // lowest world-y we've generated platforms up to
  };

  // Generate initial platforms
  // Place a guaranteed platform under the player
  state.platforms.push({
    x: W / 2 - PLATFORM_W / 2,
    y: H - 60,
    w: PLATFORM_W,
    h: PLATFORM_H,
    type: 'normal',
    dir: 0,
    broken: false,
  });

  // Fill the screen with platforms
  generatePlatforms(state, H - 120, -H * 2);

  return state;
}

/**
 * Generate platforms from startY up to endY (endY < startY since y decreases upward).
 *
 * @param {Object} state
 * @param {number} startY - Start generating from this y (world coords)
 * @param {number} endY - Generate up to this y
 */
function generatePlatforms(state, startY, endY) {
  let y = startY;

  while (y > endY) {
    const heightScore = Math.max(0, (H - y + state.camera));
    const difficulty = Math.min(heightScore * GAP_INCREASE_RATE, 20);

    const minGap = MIN_GAP_BASE + difficulty;
    const maxGap = MAX_GAP_BASE + difficulty * 1.5;
    const gap = minGap + Math.random() * (maxGap - minGap);

    y -= gap;

    const x = Math.random() * (W - PLATFORM_W);

    // Choose platform type based on difficulty
    let type = 'normal';
    const roll = Math.random();
    if (heightScore > 2000) {
      // Higher up = more variety
      if (roll < 0.15) type = 'spring';
      else if (roll < 0.35) type = 'moving';
      else if (roll < 0.50) type = 'breakable';
    } else if (heightScore > 800) {
      if (roll < 0.10) type = 'spring';
      else if (roll < 0.25) type = 'moving';
      else if (roll < 0.35) type = 'breakable';
    } else if (heightScore > 300) {
      if (roll < 0.05) type = 'spring';
      else if (roll < 0.15) type = 'moving';
    }

    state.platforms.push({
      x,
      y,
      w: PLATFORM_W,
      h: PLATFORM_H,
      type,
      dir: Math.random() < 0.5 ? 1 : -1,
      broken: false,
    });
  }

  state.heightGenerated = endY;
}

/**
 * Update game state by one tick.
 *
 * @param {Object} state - Game state from createJumpState()
 * @param {number} inputX - Horizontal input: -1 (left), 0 (none), +1 (right), or fractional
 * @param {number} dt - Delta time normalized to 60fps (1.0 = one frame)
 * @returns {{ sounds: string[] }} Events that occurred (sounds to play)
 */
export function update(state, inputX, dt) {
  if (state.gameOver) return { sounds: [] };

  const sounds = [];
  const p = state.player;

  // -- Horizontal movement --
  p.vx = inputX * MOVE_SPEED * dt;
  p.x += p.vx;

  // Track facing direction
  if (inputX > 0.1) p.facingRight = true;
  else if (inputX < -0.1) p.facingRight = false;

  // Horizontal wrapping
  if (p.x + p.w < 0) p.x = W;
  if (p.x > W) p.x = -p.w;

  // -- Gravity --
  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;

  // -- Moving platforms --
  for (const plat of state.platforms) {
    if (plat.type === 'moving' && !plat.broken) {
      plat.x += MOVING_PLAT_SPEED * plat.dir * dt;
      if (plat.x <= 0) {
        plat.x = 0;
        plat.dir = 1;
      } else if (plat.x + plat.w >= W) {
        plat.x = W - plat.w;
        plat.dir = -1;
      }
    }
  }

  // -- Platform collision (only when falling) --
  if (p.vy > 0) {
    for (const plat of state.platforms) {
      if (plat.broken) continue;

      // Check if player feet overlap platform
      const playerBottom = p.y + p.h;
      const playerPrevBottom = playerBottom - p.vy * dt;

      if (
        p.x + p.w > plat.x &&
        p.x < plat.x + plat.w &&
        playerBottom >= plat.y &&
        playerPrevBottom <= plat.y + plat.h
      ) {
        if (plat.type === 'breakable') {
          plat.broken = true;
          sounds.push('break');
          // Spawn crumble particles
          for (let i = 0; i < 6; i++) {
            state.particles.push({
              x: plat.x + Math.random() * plat.w,
              y: plat.y,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 2,
              life: 1.0,
            });
          }
        } else if (plat.type === 'spring') {
          p.vy = SPRING_VY;
          p.y = plat.y - p.h;
          sounds.push('spring');
        } else {
          p.vy = BOUNCE_VY;
          p.y = plat.y - p.h;
          sounds.push('bounce');
        }
        break;
      }
    }
  }

  // -- Camera tracking --
  // Camera follows player when they go above the middle of the screen
  const screenY = p.y - state.camera;
  const threshold = H * 0.4;

  if (screenY < threshold) {
    state.camera = p.y - threshold;
  }

  // -- Score = max height --
  const currentHeight = -(p.y - (H - 100)); // how far above start
  if (currentHeight > state.maxHeight) {
    state.maxHeight = currentHeight;
    state.score = Math.floor(state.maxHeight / 10);
  }

  // -- Generate more platforms above --
  const generateThreshold = state.camera - H;
  if (generateThreshold < state.heightGenerated) {
    generatePlatforms(state, state.heightGenerated, state.heightGenerated - H * 2);
  }

  // -- Cull platforms far below screen --
  const cullY = state.camera + H + 200;
  state.platforms = state.platforms.filter((plat) => plat.y < cullY);

  // -- Update particles --
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const part = state.particles[i];
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vy += 0.1 * dt;
    part.life -= 0.03 * dt;
    if (part.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // -- Game over: fell below screen --
  if (p.y - state.camera > H + 50) {
    state.gameOver = true;
    sounds.push('gameover');
  }

  return { sounds };
}

/**
 * Get all renderable entities from state.
 *
 * @param {Object} state
 * @returns {{ player: Object, platforms: Object[], camera: number, score: number, particles: Object[], gameOver: boolean }}
 */
export function getEntities(state) {
  return {
    player: state.player,
    platforms: state.platforms.filter((p) => !p.broken),
    camera: state.camera,
    score: state.score,
    particles: state.particles,
    gameOver: state.gameOver,
  };
}
