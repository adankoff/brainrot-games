/**
 * FLAPPY DOGE -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Theme select (doge/nyan/troll) instead of character select.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { checkCollisionAABB, clamp, randomBetween } from '../../shared/utils.js';
import { Player } from './player.js';
import { Obstacle } from './obstacle.js';
import { Background } from './background.js';
import { ScoreDisplay } from './ui.js';
import { CHARACTERS } from './characters.js';
import {
  LOGICAL_WIDTH, LOGICAL_HEIGHT, FLOOR_HEIGHT,
  BASE_SCROLL_SPEED, MAX_SCROLL_SPEED, SPEED_PER_SCORE,
  BASE_GAP_SIZE, MIN_GAP_SIZE, GAP_SHRINK_PER_SCORE,
  BASE_SPACING, MIN_SPACING, SPACING_SHRINK_PER_SCORE,
  GAP_BUFFER, OBSTACLE_WIDTH,
  SHAKE_MAGNITUDE, SHAKE_DURATION, DEATH_DELAY,
  THEMES, DEFAULT_THEME,
} from './constants.js';

// ---- Module-scoped game state ----

let player = new Player();
let background = new Background();
let scoreDisplay = new ScoreDisplay();
let obstacles = [];
let internalState = 'ready'; // 'ready' | 'active'
let currentScrollSpeed = BASE_SCROLL_SPEED;
let currentSpacing = BASE_SPACING;
let screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
let deathTimer = 0;
let tapFlag = false;
let readyTime = 0;
let lastDeathMessage = '';
let audioInitialized = false;
let currentThemeId = DEFAULT_THEME;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'FLAPPY DOGE',
  gameId: 'flappy-doge',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'flappy-meme',
  subtitle: 'much flap. very die. wow.',
  accentColor: '#c4a265',
  shareUrl: 'https://brainrotgames.com/games/game-17/',
});

// ---- Helper: get current theme data ----

function getTheme() {
  return THEMES[currentThemeId] || THEMES[DEFAULT_THEME];
}

function getFloorHeight() {
  const theme = getTheme();
  return theme.hasFloor ? FLOOR_HEIGHT : 0;
}

// ---- Callbacks ----

shell.onStart = () => {
  currentThemeId = getSelectedTheme();
  internalState = 'ready';
  player = new Player();
  // Character matches theme (one character per theme)
  player.characterId = currentThemeId;
  player.reset(LOGICAL_HEIGHT);
  obstacles = [];
  scoreDisplay = new ScoreDisplay();
  background.setTheme(currentThemeId);
  background.reset();
  currentScrollSpeed = BASE_SCROLL_SPEED;
  currentSpacing = BASE_SPACING;
  screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
  deathTimer = 0;
  readyTime = 0;
  tapFlag = false;

  // Update shell accent color per theme
  const theme = getTheme();
  const accent = document.querySelector('meta[name="theme-color"]');
  if (accent) accent.content = theme.accent;
};

shell.onUpdate = (dt) => {
  const tapped = tapFlag;
  tapFlag = false;

  const theme = getTheme();
  const floorH = getFloorHeight();

  // ---- READY sub-state ----
  if (internalState === 'ready') {
    readyTime += dt * 16.67;

    // Player idle bob
    player.y = LOGICAL_HEIGHT / 2 + Math.sin(readyTime * 0.003) * 8;

    // Slow decorative background scroll
    background.update(dt, BASE_SCROLL_SPEED * 0.3, 0);

    if (tapped) {
      internalState = 'active';
      player.flap();
      playSound('flap');
    }
    return;
  }

  // ---- ACTIVE sub-state ----

  // Player dying -- wait for death delay then transition to game over
  if (!player.alive) {
    deathTimer -= dt * 16.67;
    player.update(dt);
    updateScreenShake(dt);

    if (deathTimer <= 0) {
      shell.setState('game-over');
    }
    return;
  }

  // Player input
  if (tapped && player.alive) {
    player.flap();
    playSound('flap');
  }

  // Player physics
  player.update(dt);

  // Obstacle management
  for (const obs of obstacles) {
    obs.update(dt, currentScrollSpeed);
  }

  // Remove off-screen obstacles
  obstacles = obstacles.filter((obs) => !obs.isOffScreen());

  // Spawn new obstacle
  const obstacleType = theme.obstacle;
  if (
    obstacles.length === 0 ||
    obstacles[obstacles.length - 1].x < LOGICAL_WIDTH + OBSTACLE_WIDTH - currentSpacing
  ) {
    const gapSize = clamp(BASE_GAP_SIZE - scoreDisplay.score * GAP_SHRINK_PER_SCORE, MIN_GAP_SIZE, BASE_GAP_SIZE);
    const usableHeight = LOGICAL_HEIGHT - floorH;
    const minGapY = gapSize / 2 + GAP_BUFFER;
    const maxGapY = usableHeight - gapSize / 2 - GAP_BUFFER;
    const gapY = randomBetween(minGapY, maxGapY);
    obstacles.push(new Obstacle(LOGICAL_WIDTH + OBSTACLE_WIDTH, gapY, gapSize, obstacleType));
  }

  // Scoring
  for (const obs of obstacles) {
    if (!obs.scored && player.x > obs.x) {
      obs.scored = true;
      obs.triggerPassEffect();
      scoreDisplay.increment();
      playSound('score');
      // Doge theme: spawn "wow" text
      if (currentThemeId === 'doge') {
        player.spawnWow();
      }
    }
  }

  // Difficulty update
  currentScrollSpeed = clamp(
    BASE_SCROLL_SPEED + scoreDisplay.score * SPEED_PER_SCORE,
    BASE_SCROLL_SPEED,
    MAX_SCROLL_SPEED
  );
  currentSpacing = clamp(
    BASE_SPACING - scoreDisplay.score * SPACING_SHRINK_PER_SCORE,
    MIN_SPACING,
    BASE_SPACING
  );

  // Collision detection
  const playerHitbox = player.getHitbox();
  let died = false;
  const usableHeight = LOGICAL_HEIGHT - floorH;

  for (const obs of obstacles) {
    if (checkCollisionAABB(playerHitbox, obs.getTopHitbox())) {
      died = true;
      break;
    }
    if (checkCollisionAABB(playerHitbox, obs.getBottomHitbox(usableHeight))) {
      died = true;
      break;
    }
  }

  // Floor collision (if theme has floor)
  if (theme.hasFloor) {
    if (player.y + player.height / 2 > LOGICAL_HEIGHT - FLOOR_HEIGHT) {
      died = true;
    }
  } else {
    // No floor -- die if fall off bottom of screen
    if (player.y + player.height / 2 > LOGICAL_HEIGHT) {
      died = true;
    }
  }

  // Ceiling collision
  if (player.y - player.height / 2 < 0) {
    died = true;
  }

  if (died) {
    player.die();
    playSound('death');
    startScreenShake(SHAKE_MAGNITUDE, SHAKE_DURATION);
    deathTimer = DEATH_DELAY;
    incrementDeaths();
  }

  // Background
  background.update(dt, currentScrollSpeed, scoreDisplay.score);

  // Score HUD animations
  scoreDisplay.update(dt);

  // Screen shake
  updateScreenShake(dt);
};

shell.onRender = (ctx) => {
  const theme = getTheme();

  // Apply screen shake
  ctx.save();
  ctx.translate(screenShake.offsetX, screenShake.offsetY);

  // Background
  background.draw(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Obstacles
  const floorH = getFloorHeight();
  const usableHeight = LOGICAL_HEIGHT - floorH;
  for (const obs of obstacles) {
    obs.draw(ctx, usableHeight);
  }

  // Player
  player.draw(ctx);

  // Restore screen shake
  ctx.restore();

  // HUD (not affected by screen shake)
  scoreDisplay.draw(ctx, LOGICAL_WIDTH, theme.scoreColor, theme.scoreFlashColor);

  // "Tap to flap" hint in ready state
  if (internalState === 'ready') {
    drawReadyHint(ctx, theme);
  }
};

shell.onGameOver = () => {
  const score = scoreDisplay.score;
  const message = getDeathMessage(score);

  return {
    score,
    message,
    scoreLabel: 'aura points',
  };
};

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTap(() => {
  tapFlag = true;
  if (!audioInitialized) {
    try {
      initAudio();
      audioInitialized = true;
    } catch {
      // Audio failed to init -- game plays fine without sound
    }
  }
});

// ---- Theme Select in Menu ----

setupThemeSelect();

// ---- Helper Functions ----

function getSelectedTheme() {
  const selected = getData('flappy-doge', 'theme');
  if (selected && THEMES[selected]) {
    return selected;
  }
  return DEFAULT_THEME;
}

function getDeathMessage(score) {
  const theme = getTheme();
  const messages = theme.deathMessages;

  let tier;
  if (score >= 100) tier = 100;
  else if (score >= 50) tier = 50;
  else if (score >= 25) tier = 25;
  else if (score >= 15) tier = 15;
  else if (score >= 6) tier = 6;
  else if (score >= 1) tier = 1;
  else tier = 0;

  const pool = messages[tier];
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;
  return msg;
}

function incrementDeaths() {
  try {
    const deaths = parseInt(getData('flappy-doge', 'deaths') || '0', 10) || 0;
    setData('flappy-doge', 'deaths', String(deaths + 1));
  } catch {
    // Ignore
  }
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

// ---- Ready Hint ----

function drawReadyHint(ctx, theme) {
  const pulse = 0.5 + Math.sin(readyTime * 0.005) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.6;
  ctx.font = '20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  // Use contrasting color based on theme sky
  ctx.fillStyle = currentThemeId === 'troll' ? '#333333' : '#f0f0f0';
  ctx.fillText('tap to flap', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 60);
  ctx.restore();
}

// ---- Theme Select UI ----

function setupThemeSelect() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'theme-select';

  const selected = getSelectedTheme();

  const themeIds = Object.keys(THEMES);
  for (const id of themeIds) {
    const themeDef = THEMES[id];

    const btn = document.createElement('button');
    btn.className = 'theme-select__btn';
    if (id === selected) btn.classList.add('theme-select__btn--active');
    btn.textContent = themeDef.name;
    btn.style.setProperty('--color-primary', themeDef.accent);

    btn.addEventListener('click', () => {
      setData('flappy-doge', 'theme', id);
      currentThemeId = id;

      // Update accent color on shell
      const accentEl = document.documentElement;
      accentEl.style.setProperty('--color-primary', themeDef.accent);

      setupThemeSelect(); // Re-render to update selection
      playSound('uiclick');
    });

    container.appendChild(btn);
  }

  secondary.appendChild(container);
}
