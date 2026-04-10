/**
 * MEME INVADERS -- Game Engine
 * Core game logic: aliens, player, bullets, waves, collisions.
 */

export const W = 400;
export const H = 700;

const COLS = 8;
const ROWS = 5;
const ALIEN_W = 30;
const ALIEN_H = 24;
const ALIEN_PAD_X = 12;
const ALIEN_PAD_Y = 10;
const GRID_LEFT = 20;
const GRID_TOP = 80;

const PLAYER_W = 36;
const PLAYER_H = 24;
const PLAYER_Y = H - 50;
const PLAYER_SPEED = 4.5;

const BULLET_W = 3;
const BULLET_H = 10;
const BULLET_SPEED = 7;

const ALIEN_BULLET_W = 3;
const ALIEN_BULLET_H = 12;
const ALIEN_BULLET_SPEED = 3.5;

const UFO_W = 40;
const UFO_H = 18;
const UFO_SPEED = 1.8;

/** Point values by row index (0 = top row). */
const ROW_POINTS = [30, 20, 20, 10, 10];

/** Emoji per row type. */
export const ROW_EMOJI = ['👾', '🛸', '🛸', '🤖', '🤖'];

/**
 * Create initial game state.
 * @returns {Object} Fresh game state
 */
export function createGameState() {
  return {
    player: { x: W / 2, y: PLAYER_Y },
    playerBullets: [],
    alienBullets: [],
    aliens: buildAlienGrid(),
    alienDir: 1,        // 1 = right, -1 = left
    alienSpeed: 0.4,
    alienMoveTimer: 0,
    alienMoveInterval: 40, // frames between moves
    alienDropNext: false,
    score: 0,
    lives: 3,
    wave: 1,
    gameOver: false,
    shootCooldown: 0,
    alienShootTimer: 0,
    alienShootInterval: 80, // frames between alien shots
    ufo: null,
    ufoTimer: 0,
    ufoInterval: 600 + Math.random() * 400, // frames until next UFO
    explosions: [],
    hitFlash: 0,        // frames of player hit flash remaining
    waveTransition: 0,  // frames of wave transition remaining
  };
}

/**
 * Build the alien grid for a fresh wave.
 * @returns {Array<Object>} Array of alien objects
 */
function buildAlienGrid() {
  const aliens = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      aliens.push({
        row,
        col,
        x: GRID_LEFT + col * (ALIEN_W + ALIEN_PAD_X),
        y: GRID_TOP + row * (ALIEN_H + ALIEN_PAD_Y),
        alive: true,
        width: ALIEN_W,
        height: ALIEN_H,
        points: ROW_POINTS[row],
        emoji: ROW_EMOJI[row],
      });
    });
  }
  return aliens;
}

/**
 * Update the game state by one tick.
 * @param {Object} state - Game state
 * @param {Object} input - Input state { left, right, shoot }
 * @param {number} dt - Delta time (1.0 = one frame at 60fps)
 * @returns {Array<string>} Array of sound event names to play
 */
export function update(state, input, dt) {
  const events = [];

  if (state.gameOver) return events;

  // Wave transition pause
  if (state.waveTransition > 0) {
    state.waveTransition -= dt;
    return events;
  }

  // Hit flash countdown
  if (state.hitFlash > 0) {
    state.hitFlash -= dt;
  }

  // Update explosions
  for (let i = state.explosions.length - 1; i >= 0; i--) {
    state.explosions[i].life -= dt;
    if (state.explosions[i].life <= 0) {
      state.explosions.splice(i, 1);
    }
  }

  // -- Player movement --
  if (input.left) {
    state.player.x -= PLAYER_SPEED * dt;
  }
  if (input.right) {
    state.player.x += PLAYER_SPEED * dt;
  }
  state.player.x = Math.max(PLAYER_W / 2, Math.min(W - PLAYER_W / 2, state.player.x));

  // -- Player shooting --
  if (state.shootCooldown > 0) {
    state.shootCooldown -= dt;
  }
  if (input.shoot && state.shootCooldown <= 0 && state.playerBullets.length < 3) {
    state.playerBullets.push({
      x: state.player.x,
      y: state.player.y - PLAYER_H / 2,
      width: BULLET_W,
      height: BULLET_H,
    });
    state.shootCooldown = 15; // frames
    events.push('shoot');
  }

  // -- Move player bullets --
  for (let i = state.playerBullets.length - 1; i >= 0; i--) {
    state.playerBullets[i].y -= BULLET_SPEED * dt;
    if (state.playerBullets[i].y < -BULLET_H) {
      state.playerBullets.splice(i, 1);
    }
  }

  // -- Move alien bullets --
  for (let i = state.alienBullets.length - 1; i >= 0; i--) {
    state.alienBullets[i].y += ALIEN_BULLET_SPEED * dt;
    if (state.alienBullets[i].y > H + ALIEN_BULLET_H) {
      state.alienBullets.splice(i, 1);
    }
  }

  // -- Alien movement (step-based) --
  state.alienMoveTimer += dt;
  if (state.alienMoveTimer >= state.alienMoveInterval) {
    state.alienMoveTimer = 0;
    moveAliens(state);
  }

  // -- Alien shooting --
  state.alienShootTimer += dt;
  if (state.alienShootTimer >= state.alienShootInterval) {
    state.alienShootTimer = 0;
    fireAlienBullet(state);
  }

  // -- UFO --
  updateUFO(state, dt);

  // -- Collision: player bullets vs aliens --
  for (let bi = state.playerBullets.length - 1; bi >= 0; bi--) {
    const b = state.playerBullets[bi];
    let hit = false;

    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      if (aabb(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height,
               alien.x, alien.y, alien.width, alien.height)) {
        alien.alive = false;
        state.score += alien.points;
        state.explosions.push({ x: alien.x + alien.width / 2, y: alien.y + alien.height / 2, life: 12 });
        hit = true;
        events.push('explode');
        break;
      }
    }

    if (hit) {
      state.playerBullets.splice(bi, 1);
    }
  }

  // -- Collision: player bullets vs UFO --
  if (state.ufo) {
    for (let bi = state.playerBullets.length - 1; bi >= 0; bi--) {
      const b = state.playerBullets[bi];
      if (aabb(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height,
               state.ufo.x, state.ufo.y, UFO_W, UFO_H)) {
        state.score += state.ufo.points;
        state.explosions.push({ x: state.ufo.x + UFO_W / 2, y: state.ufo.y + UFO_H / 2, life: 20 });
        state.ufo = null;
        state.playerBullets.splice(bi, 1);
        events.push('explode');
        break;
      }
    }
  }

  // -- Collision: alien bullets vs player --
  for (let i = state.alienBullets.length - 1; i >= 0; i--) {
    const b = state.alienBullets[i];
    if (aabb(b.x - b.width / 2, b.y, b.width, b.height,
             state.player.x - PLAYER_W / 2, state.player.y - PLAYER_H / 2, PLAYER_W, PLAYER_H)) {
      state.alienBullets.splice(i, 1);
      state.lives--;
      state.hitFlash = 30;
      events.push('playerHit');

      if (state.lives <= 0) {
        state.gameOver = true;
        return events;
      }
    }
  }

  // -- Check aliens reaching player level --
  for (const alien of state.aliens) {
    if (alien.alive && alien.y + alien.height >= PLAYER_Y - PLAYER_H / 2) {
      state.gameOver = true;
      state.lives = 0;
      return events;
    }
  }

  // -- Check wave cleared --
  const aliensAlive = state.aliens.filter(a => a.alive).length;
  if (aliensAlive === 0) {
    nextWave(state);
    events.push('wave');
  }

  // Adjust alien shoot rate based on remaining aliens
  const totalAliens = ROWS * COLS;
  const aliveRatio = aliensAlive / totalAliens;
  // More aggressive when fewer aliens remain
  state.alienShootInterval = Math.max(20, 80 * aliveRatio);

  return events;
}

/**
 * Move aliens one step (march pattern).
 */
function moveAliens(state) {
  const alive = state.aliens.filter(a => a.alive);
  if (alive.length === 0) return;

  if (state.alienDropNext) {
    // Drop down
    for (const a of alive) {
      a.y += ALIEN_H * 0.6;
    }
    state.alienDir *= -1;
    state.alienDropNext = false;
    return;
  }

  // Horizontal move
  const step = (ALIEN_W * 0.5) * state.alienDir;
  for (const a of alive) {
    a.x += step;
  }

  // Check edges
  let hitEdge = false;
  for (const a of alive) {
    if (a.x < 4 || a.x + a.width > W - 4) {
      hitEdge = true;
      break;
    }
  }

  if (hitEdge) {
    state.alienDropNext = true;
  }
}

/**
 * Fire a bullet from a random bottom-row alien.
 */
function fireAlienBullet(state) {
  // Find the bottom-most alive alien in each column
  const bottomAliens = [];
  for (let col = 0; col < COLS; col++) {
    let bottom = null;
    for (const a of state.aliens) {
      if (a.alive && a.col === col) {
        if (!bottom || a.row > bottom.row) {
          bottom = a;
        }
      }
    }
    if (bottom) bottomAliens.push(bottom);
  }

  if (bottomAliens.length === 0) return;

  const shooter = bottomAliens[Math.floor(Math.random() * bottomAliens.length)];
  state.alienBullets.push({
    x: shooter.x + shooter.width / 2,
    y: shooter.y + shooter.height,
    width: ALIEN_BULLET_W,
    height: ALIEN_BULLET_H,
  });
}

/**
 * Manage UFO spawning and movement.
 */
function updateUFO(state, dt) {
  if (!state.ufo) {
    state.ufoTimer += dt;
    if (state.ufoTimer >= state.ufoInterval) {
      state.ufoTimer = 0;
      state.ufoInterval = 600 + Math.random() * 400;
      const dir = Math.random() < 0.5 ? 1 : -1;
      state.ufo = {
        x: dir === 1 ? -UFO_W : W,
        y: 30,
        dir,
        points: 100 + Math.floor(Math.random() * 3) * 100, // 100, 200, or 300
        width: UFO_W,
        height: UFO_H,
      };
    }
  } else {
    state.ufo.x += UFO_SPEED * state.ufo.dir * dt;
    if (state.ufo.x < -UFO_W * 2 || state.ufo.x > W + UFO_W) {
      state.ufo = null;
    }
  }
}

/**
 * Advance to the next wave.
 */
function nextWave(state) {
  state.wave++;
  state.aliens = buildAlienGrid();
  state.alienBullets = [];
  state.playerBullets = [];
  state.alienDir = 1;
  state.alienDropNext = false;
  state.alienMoveTimer = 0;
  state.alienShootTimer = 0;

  // Each wave gets progressively harder
  state.alienMoveInterval = Math.max(10, 40 - (state.wave - 1) * 3);
  state.alienSpeed = 0.4 + (state.wave - 1) * 0.1;
  state.waveTransition = 60; // 1 second pause
}

/**
 * AABB collision check (x,y = top-left).
 */
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Get all drawable entities for the renderer.
 * @param {Object} state
 * @returns {Object}
 */
export function getEntities(state) {
  return {
    player: state.player,
    playerBullets: state.playerBullets,
    alienBullets: state.alienBullets,
    aliens: state.aliens,
    ufo: state.ufo,
    explosions: state.explosions,
    score: state.score,
    lives: state.lives,
    wave: state.wave,
    gameOver: state.gameOver,
    hitFlash: state.hitFlash,
    waveTransition: state.waveTransition,
  };
}

export { PLAYER_W, PLAYER_H, UFO_W, UFO_H, BULLET_W, BULLET_H, ALIEN_BULLET_W, ALIEN_BULLET_H };
