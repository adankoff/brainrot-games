/**
 * OHIO SURVIVAL RUN -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Side-scrolling endless runner with 3 swappable meme themes.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { checkCollisionAABB, clamp, randomBetween, formatScore } from '../../shared/utils.js';
import { THEMES, THEME_ORDER } from './themes.js';
import { Player, Obstacle, Coin, GROUND_Y_CONST } from './entities.js';
import { BackgroundRenderer, ParticleSystem } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 600;
const GROUND_Y = GROUND_Y_CONST; // 480
const GROUND_H = 120;
const GAME_ID = 'ohio-survival-run';

// Physics
const BASE_SPEED = 3.0;
const MAX_SPEED = 8.0;
const SPEED_SCORE_FACTOR = 0.001;

// Spawning
const BASE_SPACING = 300;
const MIN_SPACING = 150;
const SPACING_SCORE_FACTOR = 0.5;

// Scoring
const COIN_VALUE = 10;

// Obstacle type weights
const OBSTACLE_TYPES = ['ground', 'flying', 'tall'];
const OBSTACLE_WEIGHTS = [0.45, 0.30, 0.25];

// Screen shake
const SHAKE_MAGNITUDE = 4;
const SHAKE_DURATION = 300;
const DEATH_DELAY = 600;

// Coin spawning
const COIN_SPACING_MIN = 180;
const COIN_SPACING_MAX = 350;

// ---- Module-scoped game state ----

let player = new Player();
let background = new BackgroundRenderer();
let particles = new ParticleSystem();
let obstacles = [];
let coins = [];
let distanceScore = 0;
let coinScore = 0;
let currentSpeed = BASE_SPEED;
let internalState = 'ready'; // 'ready' | 'active'
let tapFlag = false;
let readyTime = 0;
let deathTimer = 0;
let screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
let lastDeathMessage = '';
let audioInitialized = false;
let wasOnGround = true;
let currentTheme = null;

// ---- Theme Management ----

function getSelectedThemeId() {
  const stored = getData(GAME_ID, 'theme');
  if (stored && THEMES[stored]) return stored;
  return 'ohio';
}

function setSelectedThemeId(id) {
  setData(GAME_ID, 'theme', id);
}

function loadTheme() {
  const id = getSelectedThemeId();
  currentTheme = THEMES[id];

  // Update body data-theme
  document.body.setAttribute('data-theme', currentTheme.dataTheme);

  // Update shell title display
  shell._config.accentColor = currentTheme.accentColor;

  return currentTheme;
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'OHIO SURVIVAL RUN',
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'ohio',
  subtitle: 'run. jump. survive.',
  accentColor: '#ff6b2b',
  shareUrl: 'https://brainrotgames.com/games/game-04/',
});

// ---- Callbacks ----

shell.onStart = () => {
  loadTheme();
  internalState = 'ready';
  player = new Player();
  player.reset();
  obstacles = [];
  coins = [];
  distanceScore = 0;
  coinScore = 0;
  currentSpeed = BASE_SPEED;
  background.reset();
  particles.reset();
  screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
  deathTimer = 0;
  readyTime = 0;
  tapFlag = false;
  wasOnGround = true;
};

shell.onUpdate = (dt) => {
  const tapped = tapFlag;
  tapFlag = false;

  // ---- READY sub-state: waiting for first tap ----
  if (internalState === 'ready') {
    readyTime += dt * 16.67;

    // Idle bob
    player.y = GROUND_Y - player.h - 2 + Math.sin(readyTime * 0.003) * 4;

    // Slow background scroll
    background.update(dt, BASE_SPEED * 0.3);

    if (tapped) {
      internalState = 'active';
      player.y = GROUND_Y - player.h;
      player.jump();
      playSound('jump');
    }
    return;
  }

  // ---- DEATH sub-state ----
  if (!player.alive) {
    deathTimer -= dt * 16.67;
    updateScreenShake(dt);
    particles.update(dt);

    if (deathTimer <= 0) {
      shell.setState('game-over');
    }
    return;
  }

  // ---- ACTIVE sub-state ----

  // Player input
  if (tapped && player.alive) {
    const jumped = player.jump();
    if (jumped) {
      playSound('jump');
    }
  }

  // Track ground state for landing particles
  const wasOnGroundPrev = wasOnGround;

  // Player physics
  player.update(dt);

  wasOnGround = player.onGround;

  // Landing dust particles
  if (!wasOnGroundPrev && wasOnGround) {
    particles.emitDust(player.x + player.w / 2, GROUND_Y);
  }

  // Scroll speed
  const totalScore = getTotalScore();
  currentSpeed = clamp(
    BASE_SPEED + totalScore * SPEED_SCORE_FACTOR,
    BASE_SPEED,
    MAX_SPEED
  );

  // Distance scoring (1 point per frame at base speed)
  distanceScore += (currentSpeed / BASE_SPEED) * dt;

  // Update obstacles
  for (const obs of obstacles) {
    obs.update(dt, currentSpeed);
  }

  // Remove off-screen obstacles
  obstacles = obstacles.filter((obs) => !obs.isOffScreen());

  // Spawn new obstacles when rightmost is far enough left
  const spacing = Math.max(MIN_SPACING, BASE_SPACING - totalScore * SPACING_SCORE_FACTOR);
  const rightmostObsRight = obstacles.length > 0
    ? Math.max(...obstacles.map((o) => o.x + o.w))
    : -999;

  if (obstacles.length === 0 || rightmostObsRight < LOGICAL_WIDTH - spacing) {
    const type = pickObstacleType();
    const obs = new Obstacle(LOGICAL_WIDTH + 10, type);
    obstacles.push(obs);
  }

  // Update coins
  for (const coin of coins) {
    coin.update(dt, currentSpeed);
  }

  // Remove off-screen coins
  coins = coins.filter((c) => !c.isOffScreen());

  // Spawn coins between obstacles
  const rightmostCoinX = coins.length > 0
    ? Math.max(...coins.map((c) => c.x))
    : -999;
  const coinSpacing = randomBetween(COIN_SPACING_MIN, COIN_SPACING_MAX);

  if (coins.length === 0 || rightmostCoinX < LOGICAL_WIDTH - coinSpacing) {
    const newCoinX = LOGICAL_WIDTH + 10;

    // Position: either slightly above ground or at jump height
    const coinY = Math.random() < 0.5
      ? GROUND_Y - 30 - Math.random() * 20  // Above ground
      : 250 + Math.random() * 100;            // Jump height
    coins.push(new Coin(newCoinX, coinY));
  }

  // Coin collection
  const pcx = player.getCenterX();
  const pcy = player.getCenterY();
  for (const coin of coins) {
    if (!coin.collected && coin.collidesWith(pcx, pcy)) {
      coin.collected = true;
      coinScore += COIN_VALUE;
      particles.emitSparkle(coin.x, coin.y, currentTheme.accentColor);
      playSound('coin');
    }
  }

  // Collision detection with obstacles
  const playerHitbox = player.getHitbox();
  let died = false;

  for (const obs of obstacles) {
    if (checkCollisionAABB(playerHitbox, obs.getHitbox())) {
      died = true;
      break;
    }
  }

  if (died) {
    player.alive = false;
    playSound('death');
    startScreenShake(SHAKE_MAGNITUDE, SHAKE_DURATION);
    deathTimer = DEATH_DELAY;
  }

  // Background
  background.update(dt, currentSpeed);

  // Particles
  particles.update(dt);

  // Screen shake
  updateScreenShake(dt);
};

shell.onRender = (ctx) => {
  if (!currentTheme) loadTheme();

  ctx.save();
  ctx.translate(screenShake.offsetX, screenShake.offsetY);

  // Background layers
  background.draw(ctx, currentTheme);

  // Ground
  background.drawGround(ctx, currentTheme);

  // Coins
  for (const coin of coins) {
    coin.draw(ctx, currentTheme);
  }

  // Obstacles
  for (const obs of obstacles) {
    obs.draw(ctx, currentTheme);
  }

  // Player
  player.draw(ctx, currentTheme);

  // Particles
  particles.draw(ctx);

  ctx.restore();

  // HUD (not affected by screen shake)
  drawHUD(ctx);

  // "Tap to run" hint
  if (internalState === 'ready') {
    drawReadyHint(ctx);
  }
};

shell.onGameOver = () => {
  const score = getTotalScore();
  const message = getDeathMessage();

  return {
    score,
    message,
    scoreLabel: 'distance',
  };
};

// ---- HUD Drawing ----

function drawHUD(ctx) {
  if (internalState === 'ready') return;
  if (!player.alive && deathTimer > 0) {
    // Still show HUD during death animation
  }

  const score = getTotalScore();

  // Score background bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, 36);

  // Distance score
  ctx.save();
  ctx.font = '18px "Bungee", Impact, sans-serif';
  ctx.fillStyle = '#f0f0f0';
  ctx.textAlign = 'left';
  ctx.fillText(formatScore(score), 12, 26);

  // Coin count on right side
  ctx.textAlign = 'right';
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillStyle = currentTheme ? currentTheme.accentColor : '#ff6b2b';
  ctx.fillText('x' + Math.floor(coinScore / COIN_VALUE), LOGICAL_WIDTH - 12, 25);

  // Coin icon
  ctx.fillStyle = currentTheme ? currentTheme.accentColor : '#ff6b2b';
  ctx.beginPath();
  ctx.arc(LOGICAL_WIDTH - 50, 20, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawReadyHint(ctx) {
  const pulse = 0.5 + Math.sin(readyTime * 0.005) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.6;
  ctx.font = '20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('tap to run', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 40);
  ctx.restore();
}

// ---- Helpers ----

function getTotalScore() {
  return Math.floor(distanceScore) + coinScore;
}

function pickObstacleType() {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < OBSTACLE_TYPES.length; i++) {
    cumulative += OBSTACLE_WEIGHTS[i];
    if (r < cumulative) return OBSTACLE_TYPES[i];
  }
  return OBSTACLE_TYPES[0];
}

function getDeathMessage() {
  if (!currentTheme) return '';
  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;
  return msg;
}

// ---- Screen Shake ----

function startScreenShake(magnitude, durationMs) {
  screenShake.timer = durationMs;
  screenShake.magnitude = magnitude;
}

function updateScreenShake(dt) {
  if (screenShake.timer <= 0) {
    screenShake.offsetX = 0;
    screenShake.offsetY = 0;
    return;
  }
  screenShake.timer -= dt * 16.67;
  const intensity = Math.max(0, screenShake.timer / SHAKE_DURATION);
  screenShake.offsetX = (Math.random() * 2 - 1) * screenShake.magnitude * intensity;
  screenShake.offsetY = (Math.random() * 2 - 1) * screenShake.magnitude * intensity;
}

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('jump', {
    notes: [
      { type: 'square', frequency: 400, endFrequency: 600, duration: 0.08, gain: 0.12 },
    ],
  });

  registerSound('coin', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.06, gain: 0.15 },
      { type: 'sine', frequency: 1200, duration: 0.06, delay: 0.06, gain: 0.12 },
    ],
  });
}

// ---- Initialize ----

// Load theme before shell init so menu reflects theme
currentTheme = THEMES[getSelectedThemeId()];
document.body.setAttribute('data-theme', currentTheme.dataTheme);

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTap(() => {
  tapFlag = true;
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game plays fine without sound
    }
  }
});

// ---- Theme Selector UI ----

setupThemeSelector();

function setupThemeSelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'theme-select';

  const selectedId = getSelectedThemeId();

  for (const themeId of THEME_ORDER) {
    const theme = THEMES[themeId];
    const btn = document.createElement('button');
    btn.className = 'theme-select__btn';
    btn.textContent = theme.name;

    if (themeId === selectedId) {
      btn.classList.add('theme-select__btn--selected');
    }

    btn.addEventListener('click', () => {
      setSelectedThemeId(themeId);
      currentTheme = THEMES[themeId];
      document.body.setAttribute('data-theme', currentTheme.dataTheme);

      // Update shell config title
      const titleEl = document.querySelector('.menu-screen__title');
      if (titleEl) {
        titleEl.textContent = theme.name;
      }

      // Re-render selector to update selected state
      setupThemeSelector();

      playSound('uiclick');
    });

    container.appendChild(btn);
  }

  secondary.appendChild(container);
}
