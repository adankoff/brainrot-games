/**
 * MEME GALAGA -- Core Game Logic
 * Handles aliens, player, bullets, formations, diving, waves.
 */

import { clamp, randomBetween, randomInt } from '../../shared/utils.js';
import { readThemeColor } from '../../shared/theme-utils.js';

export const W = 400;
export const H = 700;

// Player constants
const PLAYER_SPEED = 4.5;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 24;
const PLAYER_Y = H - 50;
const BULLET_SPEED = 7;
const PLAYER_FIRE_COOLDOWN = 12; // frames

// Alien constants
const COLS = 6;
const ROWS = 3;
const ALIEN_SPACING_X = 48;
const ALIEN_SPACING_Y = 42;
const FORMATION_TOP = 80;
const ALIEN_SIZE = 16;

// Alien bullet
const ALIEN_BULLET_SPEED = 3.5;

// Alien types by row
const ALIEN_TYPES = [
  { name: 'commander', points: 40, color: readThemeColor('--game-alien-commander', '#999999'), size: 18 },
  { name: 'butterfly', points: 20, color: readThemeColor('--game-alien-butterfly', '#888888'), size: 16 },
  { name: 'bee',       points: 10, color: readThemeColor('--game-alien-bee',       '#777777'), size: 14 },
];

/**
 * Create the initial game state.
 * @returns {Object}
 */
export function createGameState() {
  const state = {
    // Player
    player: {
      x: W / 2,
      y: PLAYER_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      lives: 3,
      fireCooldown: 0,
      invincible: 0, // invincibility frames after hit
      dead: false,
      respawnTimer: 0,
    },

    // Bullets
    playerBullets: [],
    alienBullets: [],

    // Aliens
    aliens: [],

    // Formation wave motion
    formationTime: 0,
    formationOffsetX: 0,

    // Wave
    wave: 1,
    waveTransition: 0, // countdown timer for wave banner
    waveBannerTimer: 0,
    waveCleared: false,

    // Dive system
    diveTimer: 0,
    diveInterval: 180, // frames between dive attempts
    activeDivers: [],

    // Scoring
    score: 0,
    perfectWave: true, // no player hits this wave

    // Explosions (visual)
    explosions: [],

    // Stars (background)
    stars: [],

    // Input
    input: { left: false, right: false, fire: false },

    // Game state
    ended: false,
    gameOverTimer: 0,

    // Stats
    aliensDestroyedThisWave: 0,
    totalAliensThisWave: 0,
  };

  // Generate starfield
  for (let i = 0; i < 60; i++) {
    state.stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: randomBetween(0.3, 1.2),
      brightness: randomBetween(0.3, 1.0),
      size: randomBetween(0.5, 2.0),
    });
  }

  spawnWave(state);
  return state;
}

/**
 * Spawn a formation of aliens for the current wave.
 * @param {Object} state
 */
function spawnWave(state) {
  state.aliens = [];
  state.activeDivers = [];
  state.alienBullets = [];
  state.perfectWave = true;
  state.aliensDestroyedThisWave = 0;
  state.waveCleared = false;
  state.waveBannerTimer = 120;

  const formationLeft = (W - (COLS - 1) * ALIEN_SPACING_X) / 2;

  for (let row = 0; row < ROWS; row++) {
    const type = ALIEN_TYPES[row];
    for (let col = 0; col < COLS; col++) {
      state.aliens.push({
        row, col,
        type: type.name,
        points: type.points,
        color: type.color,
        size: type.size,
        // Formation home position
        homeX: formationLeft + col * ALIEN_SPACING_X,
        homeY: FORMATION_TOP + row * ALIEN_SPACING_Y,
        // Current position
        x: formationLeft + col * ALIEN_SPACING_X,
        y: -40 - row * 30, // spawn above screen, fly in
        alive: true,
        // Dive state
        diving: false,
        divePhase: 0,
        divePath: null,
        diveT: 0,
        returning: false,
        // Entry animation
        entering: true,
        enterT: 0,
      });
    }
  }

  state.totalAliensThisWave = state.aliens.length;

  // Scale difficulty with wave
  const waveMult = Math.min(state.wave, 20);
  state.diveInterval = Math.max(60, 180 - waveMult * 6);
  state.diveTimer = state.diveInterval;
}

/**
 * Main update tick.
 * @param {Object} state
 * @param {number} dt - Normalized delta time (1.0 = 60fps frame)
 */
export function update(state, dt) {
  if (state.ended) {
    state.gameOverTimer += dt;
    return;
  }

  // Wave banner countdown
  if (state.waveBannerTimer > 0) {
    state.waveBannerTimer -= dt;
  }

  // Update stars
  for (const star of state.stars) {
    star.y += star.speed * dt;
    if (star.y > H) {
      star.y = 0;
      star.x = Math.random() * W;
    }
  }

  // Update explosions
  for (let i = state.explosions.length - 1; i >= 0; i--) {
    state.explosions[i].t += dt;
    if (state.explosions[i].t > state.explosions[i].duration) {
      state.explosions.splice(i, 1);
    }
  }

  // Update alien entry animation
  for (const alien of state.aliens) {
    if (alien.entering && alien.alive) {
      alien.enterT += dt * 0.02;
      if (alien.enterT >= 1) {
        alien.enterT = 1;
        alien.entering = false;
      }
      // Lerp from spawn position to home
      alien.y = lerp(-40 - alien.row * 30, alien.homeY, easeOutCubic(alien.enterT));
      alien.x = alien.homeX;
    }
  }

  // Formation wave motion
  state.formationTime += dt * 0.03;
  state.formationOffsetX = Math.sin(state.formationTime) * 20;

  // Update aliens in formation (not diving)
  for (const alien of state.aliens) {
    if (!alien.alive) continue;
    if (!alien.diving && !alien.entering) {
      alien.x = alien.homeX + state.formationOffsetX;
      alien.y = alien.homeY + Math.sin(state.formationTime * 2 + alien.col * 0.5) * 4;
    }
  }

  // Player
  updatePlayer(state, dt);

  // Player bullets
  updatePlayerBullets(state, dt);

  // Alien diving
  updateDiving(state, dt);

  // Alien bullets
  updateAlienBullets(state, dt);

  // Collision: player bullets vs aliens
  checkPlayerBulletCollisions(state);

  // Collision: alien bullets vs player
  checkAlienBulletCollisions(state);

  // Collision: diving aliens vs player
  checkDiverCollisions(state);

  // Check wave clear
  const aliveCount = state.aliens.filter(a => a.alive).length;
  if (aliveCount === 0 && !state.waveCleared) {
    state.waveCleared = true;

    // Perfect wave bonus
    if (state.perfectWave) {
      state.score += state.wave * 100;
    }

    state.waveTransition = 90; // frames before next wave
  }

  if (state.waveCleared) {
    state.waveTransition -= dt;
    if (state.waveTransition <= 0) {
      state.wave++;
      spawnWave(state);
    }
  }
}

/**
 * Update the player ship.
 */
function updatePlayer(state, dt) {
  const p = state.player;

  if (p.dead) {
    p.respawnTimer -= dt;
    if (p.respawnTimer <= 0) {
      p.dead = false;
      p.x = W / 2;
      p.invincible = 120;
    }
    return;
  }

  // Movement
  if (state.input.left) {
    p.x -= PLAYER_SPEED * dt;
  }
  if (state.input.right) {
    p.x += PLAYER_SPEED * dt;
  }
  p.x = clamp(p.x, PLAYER_WIDTH / 2, W - PLAYER_WIDTH / 2);

  // Invincibility countdown
  if (p.invincible > 0) {
    p.invincible -= dt;
  }

  // Fire
  if (p.fireCooldown > 0) {
    p.fireCooldown -= dt;
  }
  if (state.input.fire && p.fireCooldown <= 0 && state.playerBullets.length < 3) {
    state.playerBullets.push({
      x: p.x,
      y: p.y - p.height / 2,
      width: 3,
      height: 10,
    });
    p.fireCooldown = PLAYER_FIRE_COOLDOWN;
    return; // sound handled externally via flag
  }
}

/**
 * Update player bullets.
 */
function updatePlayerBullets(state, dt) {
  for (let i = state.playerBullets.length - 1; i >= 0; i--) {
    const b = state.playerBullets[i];
    b.y -= BULLET_SPEED * dt;
    if (b.y < -10) {
      state.playerBullets.splice(i, 1);
    }
  }
}

/**
 * Update alien dive system.
 */
function updateDiving(state, dt) {
  const waveMult = Math.min(state.wave, 20);

  // Countdown to next dive
  state.diveTimer -= dt;
  if (state.diveTimer <= 0 && !state.waveCleared) {
    state.diveTimer = state.diveInterval;
    launchDive(state);
  }

  // Update active divers
  for (const alien of state.aliens) {
    if (!alien.alive || !alien.diving) continue;

    alien.diveT += dt * (0.008 + waveMult * 0.0003);

    if (alien.diveT >= 1) {
      // Dive complete - return to formation
      if (!alien.returning) {
        alien.returning = true;
        alien.diveT = 0;
        alien.divePath = createReturnPath(alien);
      } else {
        // Returned to formation
        alien.diving = false;
        alien.returning = false;
        alien.divePath = null;
      }
    } else {
      // Follow dive path
      const path = alien.divePath;
      if (path) {
        const pos = evaluateBezier(path, alien.diveT);
        alien.x = pos.x;
        alien.y = pos.y;
      }
    }

    // Alien fires while diving
    if (alien.diving && !alien.returning && Math.random() < 0.015 * dt) {
      state.alienBullets.push({
        x: alien.x,
        y: alien.y + alien.size,
        speed: ALIEN_BULLET_SPEED + waveMult * 0.08,
      });
    }
  }
}

/**
 * Launch a dive from formation.
 */
function launchDive(state) {
  const candidates = state.aliens.filter(a => a.alive && !a.diving && !a.entering);
  if (candidates.length === 0) return;

  // Commanders dive in pairs
  const pick = candidates[randomInt(0, candidates.length - 1)];
  startDive(state, pick);

  if (pick.type === 'commander') {
    // Try to find a partner
    const partner = candidates.find(a =>
      a !== pick && a.alive && !a.diving && a.row > 0
    );
    if (partner) {
      startDive(state, partner);
    }
  }
}

/**
 * Start a single alien's dive.
 */
function startDive(state, alien) {
  alien.diving = true;
  alien.returning = false;
  alien.diveT = 0;
  alien.divePath = createDivePath(alien, state.player.x);
  state._diveStarted = true;
}

/**
 * Create a bezier curve for a diving alien.
 * @returns {Array<{x: number, y: number}>} Control points
 */
function createDivePath(alien, playerX) {
  const startX = alien.x;
  const startY = alien.y;

  // Swoop direction
  const swoopDir = Math.random() < 0.5 ? -1 : 1;
  const swoopAmount = randomBetween(60, 140);

  return [
    { x: startX, y: startY },
    { x: startX + swoopDir * swoopAmount, y: startY + 150 },
    { x: playerX + randomBetween(-60, 60), y: H - 100 },
    { x: playerX + randomBetween(-80, 80), y: H + 40 },
  ];
}

/**
 * Create a return path from bottom back to formation.
 */
function createReturnPath(alien) {
  const startX = alien.x;
  const startY = alien.y;
  // Wrap around: go off bottom, come from top
  return [
    { x: startX, y: startY },
    { x: startX + randomBetween(-50, 50), y: H + 60 },
    { x: alien.homeX + randomBetween(-30, 30), y: -40 },
    { x: alien.homeX, y: alien.homeY },
  ];
}

/**
 * Evaluate a cubic bezier at parameter t.
 */
function evaluateBezier(points, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * points[0].x + 3 * uu * t * points[1].x + 3 * u * tt * points[2].x + ttt * points[3].x,
    y: uuu * points[0].y + 3 * uu * t * points[1].y + 3 * u * tt * points[2].y + ttt * points[3].y,
  };
}

/**
 * Update alien bullets.
 */
function updateAlienBullets(state, dt) {
  for (let i = state.alienBullets.length - 1; i >= 0; i--) {
    const b = state.alienBullets[i];
    b.y += b.speed * dt;
    if (b.y > H + 10) {
      state.alienBullets.splice(i, 1);
    }
  }
}

/**
 * Check player bullets hitting aliens.
 */
function checkPlayerBulletCollisions(state) {
  for (let bi = state.playerBullets.length - 1; bi >= 0; bi--) {
    const b = state.playerBullets[bi];
    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      const dx = Math.abs(b.x - alien.x);
      const dy = Math.abs(b.y - alien.y);
      if (dx < alien.size + b.width / 2 && dy < alien.size + b.height / 2) {
        // Hit!
        alien.alive = false;
        state.playerBullets.splice(bi, 1);
        state.score += alien.points;
        state.aliensDestroyedThisWave++;

        // Explosion
        state.explosions.push({
          x: alien.x,
          y: alien.y,
          color: alien.color,
          t: 0,
          duration: 20,
          size: alien.size * 1.5,
        });

        // Flag for sound
        alien._justDestroyed = true;
        break;
      }
    }
  }
}

/**
 * Check alien bullets hitting player.
 */
function checkAlienBulletCollisions(state) {
  const p = state.player;
  if (p.dead || p.invincible > 0) return;

  for (let i = state.alienBullets.length - 1; i >= 0; i--) {
    const b = state.alienBullets[i];
    const dx = Math.abs(b.x - p.x);
    const dy = Math.abs(b.y - p.y);
    if (dx < PLAYER_WIDTH / 2 + 3 && dy < PLAYER_HEIGHT / 2 + 3) {
      state.alienBullets.splice(i, 1);
      hitPlayer(state);
      return;
    }
  }
}

/**
 * Check diving aliens colliding with player.
 */
function checkDiverCollisions(state) {
  const p = state.player;
  if (p.dead || p.invincible > 0) return;

  for (const alien of state.aliens) {
    if (!alien.alive || !alien.diving) continue;
    const dx = Math.abs(alien.x - p.x);
    const dy = Math.abs(alien.y - p.y);
    if (dx < alien.size + PLAYER_WIDTH / 2 - 4 && dy < alien.size + PLAYER_HEIGHT / 2 - 4) {
      alien.alive = false;
      state.score += alien.points;
      state.explosions.push({
        x: alien.x,
        y: alien.y,
        color: alien.color,
        t: 0,
        duration: 20,
        size: alien.size * 1.5,
      });
      hitPlayer(state);
      return;
    }
  }
}

/**
 * Handle player being hit.
 */
function hitPlayer(state) {
  const p = state.player;
  state.perfectWave = false;
  p.lives--;
  p._justHit = true;

  // Explosion at player position
  state.explosions.push({
    x: p.x,
    y: p.y,
    color: readThemeColor('--game-ship', '#cccccc'),
    t: 0,
    duration: 30,
    size: 20,
  });

  if (p.lives <= 0) {
    p.dead = true;
    state.ended = true;
    state.gameOverTimer = 0;
  } else {
    p.dead = true;
    p.respawnTimer = 60;
  }
}

/**
 * Check if the player just fired (for sound).
 */
export function consumeFireEvent(state) {
  if (state.player.fireCooldown === PLAYER_FIRE_COOLDOWN) {
    return true;
  }
  return false;
}

/**
 * Get aliens that were just destroyed (for sound), then clear flags.
 */
export function consumeDestroyedAliens(state) {
  const destroyed = state.aliens.filter(a => a._justDestroyed);
  for (const a of destroyed) {
    delete a._justDestroyed;
  }
  return destroyed;
}

/**
 * Check if a dive just started (for sound), then clear flag.
 */
export function consumeDiveEvent(state) {
  if (state._diveStarted) {
    delete state._diveStarted;
    return true;
  }
  return false;
}

/**
 * Check if player was just hit (for sound), then clear flag.
 */
export function consumePlayerHit(state) {
  if (state.player._justHit) {
    delete state.player._justHit;
    return true;
  }
  return false;
}

// -- Local helpers --

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
