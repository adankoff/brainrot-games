/**
 * ANIME SNAKE -- Main Entry Point
 * Creates GameShell, wires callbacks, manages tick-based game loop and theme switching.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { THEMES, getThemeById } from './themes.js';
import { Snake } from './snake.js';

// ---- Constants ----

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 640;
const CELL_SIZE = 20;
const GRID_COLS = 18;
const GRID_ROWS = 18;
const GRID_X = 0;
const GRID_Y = 80; // Top 80px reserved for HUD. Grid: y=80 to y=440 (360px).
const GAME_ID = 'anime-snake';

// ---- Game State ----

let snake = new Snake(GRID_COLS, GRID_ROWS);
let audioInitialized = false;
let lastDeathMessage = '';
let frameCount = 0;

// Tick-based movement
let tickTimer = 0;

// Score float texts
let scoreFloats = [];

// Screen flash on death
let flashAlpha = 0;

// Swipe detection state
let swipeStartX = 0;
let swipeStartY = 0;
let swipeTracking = false;

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'dragonball';
}

function saveTheme(id) {
  setData(GAME_ID, 'theme', id);
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: currentTheme.name,
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'anime-snake',
  subtitle: 'eat everything. avoid yourself.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-22/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('snake-eat', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 660, duration: 0.06, delay: 0.06, gain: 0.12 },
    ],
  });

  registerSound('snake-turn', {
    notes: [
      { type: 'sine', frequency: 500, duration: 0.03, gain: 0.06 },
    ],
  });

  registerSound('snake-death', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.35, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.15, delay: 0.1, gain: 0.15 },
    ],
  });
}

// ---- Tick-Based Movement ----

function startTicking() {
  stopTicking();
  tickTimer = 0;
}

function stopTicking() {
  tickTimer = 0;
}

/**
 * Called each frame with dt. Accumulates time and fires ticks at the snake's tick interval.
 *
 * @param {number} dt - Frame delta (normalized to 60fps, 1.0 = ~16.67ms)
 */
function updateTick(dt) {
  if (!snake.alive) return;

  // Convert dt back to ms (dt is normalized to 60fps frames)
  const elapsedMs = dt * 16.67;
  tickTimer += elapsedMs;

  // Fire as many ticks as accumulated (usually 0 or 1)
  while (tickTimer >= snake.tickInterval && snake.alive) {
    tickTimer -= snake.tickInterval;
    doTick();
  }
}

function doTick() {
  const prevScore = snake.score;
  const alive = snake.move();

  if (!alive) {
    // Death
    flashAlpha = 0.6;
    playSound('snake-death');
    stopTicking();
    setTimeout(() => {
      shell.setState('game-over');
    }, 500);
    return;
  }

  if (snake.score > prevScore) {
    // Ate food
    playSound('snake-eat');
    const head = snake.getHead();
    scoreFloats.push({
      x: GRID_X + head.x * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_Y + head.y * CELL_SIZE,
      text: '+1',
      alpha: 1.0,
      vy: -1.5,
    });
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  snake.reset();
  frameCount = 0;
  scoreFloats = [];
  flashAlpha = 0;
  swipeTracking = false;
  startTicking();
};

shell.onUpdate = (dt) => {
  frameCount++;
  updateTick(dt);

  // Update score floats
  for (let i = scoreFloats.length - 1; i >= 0; i--) {
    const sf = scoreFloats[i];
    sf.y += sf.vy;
    sf.alpha -= 0.02;
    if (sf.alpha <= 0) {
      scoreFloats.splice(i, 1);
    }
  }

  // Decay flash
  if (flashAlpha > 0) {
    flashAlpha -= 0.03;
    if (flashAlpha < 0) flashAlpha = 0;
  }
};

shell.onRender = (ctx) => {
  const gridW = GRID_COLS * CELL_SIZE;
  const gridH = GRID_ROWS * CELL_SIZE;

  // Background
  currentTheme.drawBackground(ctx, GRID_X, GRID_Y, gridW, gridH, CELL_SIZE, GRID_COLS, GRID_ROWS);

  // Grid border
  ctx.strokeStyle = currentTheme.accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X, GRID_Y, gridW, gridH);

  // Food
  if (snake.food.x >= 0) {
    const fx = GRID_X + snake.food.x * CELL_SIZE;
    const fy = GRID_Y + snake.food.y * CELL_SIZE;
    currentTheme.drawFood(ctx, fx, fy, CELL_SIZE, frameCount);
  }

  // Snake body (draw from tail to head so head is on top)
  for (let i = snake.segments.length - 1; i >= 1; i--) {
    const seg = snake.segments[i];
    const px = GRID_X + seg.x * CELL_SIZE;
    const py = GRID_Y + seg.y * CELL_SIZE;
    currentTheme.drawSegment(ctx, px, py, CELL_SIZE, i - 1);
  }

  // Snake head
  if (snake.segments.length > 0) {
    const head = snake.segments[0];
    const hx = GRID_X + head.x * CELL_SIZE;
    const hy = GRID_Y + head.y * CELL_SIZE;
    currentTheme.drawHead(ctx, hx, hy, CELL_SIZE, snake.direction);
  }

  // Score floats
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  for (const sf of scoreFloats) {
    ctx.globalAlpha = Math.max(0, sf.alpha);
    ctx.fillStyle = currentTheme.scoreColor;
    ctx.fillText(sf.text, sf.x, sf.y);
  }
  ctx.globalAlpha = 1;

  // Death flash
  if (flashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 50, 50, ${flashAlpha})`;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  // HUD
  drawHUD(ctx);
};

shell.onGameOver = () => {
  const message = getDeathMessage();
  return {
    score: snake.score,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

// Render frozen game state behind game-over overlay
shell.onGameOverRender = (ctx) => {
  const gridW = GRID_COLS * CELL_SIZE;
  const gridH = GRID_ROWS * CELL_SIZE;

  currentTheme.drawBackground(ctx, GRID_X, GRID_Y, gridW, gridH, CELL_SIZE, GRID_COLS, GRID_ROWS);

  ctx.strokeStyle = currentTheme.accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X, GRID_Y, gridW, gridH);

  // Draw snake body
  for (let i = snake.segments.length - 1; i >= 1; i--) {
    const seg = snake.segments[i];
    const px = GRID_X + seg.x * CELL_SIZE;
    const py = GRID_Y + seg.y * CELL_SIZE;
    currentTheme.drawSegment(ctx, px, py, CELL_SIZE, i - 1);
  }

  // Draw snake head
  if (snake.segments.length > 0) {
    const head = snake.segments[0];
    const hx = GRID_X + head.x * CELL_SIZE;
    const hy = GRID_Y + head.y * CELL_SIZE;
    currentTheme.drawHead(ctx, hx, hy, CELL_SIZE, snake.direction);
  }

  drawHUD(ctx);
};

// ---- HUD Drawing ----

function drawHUD(ctx) {
  const hudY = 20;

  // Score label
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = currentTheme.hudColor;
  ctx.globalAlpha = 0.6;
  ctx.fillText(currentTheme.scoreLabel, 12, hudY);
  ctx.globalAlpha = 1;

  // Score value
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = currentTheme.scoreColor;
  ctx.fillText(String(snake.score), 12, hudY + 32);

  // High score on right
  ctx.textAlign = 'right';
  ctx.font = 'bold 11px monospace';
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = currentTheme.hudColor;
  const hs = shell.getHighScore();
  if (hs > 0) {
    ctx.fillText(`BEST: ${hs}`, LOGICAL_WIDTH - 12, hudY);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // Speed indicator
  ctx.font = '10px monospace';
  ctx.fillStyle = currentTheme.hudColor;
  ctx.globalAlpha = 0.3;
  const speedTier = Math.floor(snake.score / 10);
  if (speedTier > 0) {
    ctx.textAlign = 'right';
    ctx.fillText(`SPD ${speedTier + 1}`, LOGICAL_WIDTH - 12, hudY + 18);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;
}

// ---- Death Messages ----

function getDeathMessage() {
  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;
  return msg;
}

// ---- Input Handling ----

function handleDirectionInput(dir) {
  if (shell.state !== 'playing') return;
  if (!snake.alive) return;

  snake.setDirection(dir);
  playSound('snake-turn');
}

// Keyboard arrows
function handleKeyDown(e) {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      e.preventDefault();
      handleDirectionInput('up');
      break;
    case 'ArrowDown':
    case 'KeyS':
      e.preventDefault();
      handleDirectionInput('down');
      break;
    case 'ArrowLeft':
    case 'KeyA':
      e.preventDefault();
      handleDirectionInput('left');
      break;
    case 'ArrowRight':
    case 'KeyD':
      e.preventDefault();
      handleDirectionInput('right');
      break;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Swipe detection via raw touch events on canvas
function setupSwipeDetection(canvas) {
  canvas.addEventListener('touchstart', (e) => {
    if (shell.state !== 'playing') return;
    const touch = e.changedTouches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeTracking = true;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (!swipeTracking) return;
    swipeTracking = false;
    if (shell.state !== 'playing') return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - swipeStartX;
    const dy = touch.clientY - swipeStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe distance (in CSS pixels)
    const MIN_SWIPE = 15;
    if (absDx < MIN_SWIPE && absDy < MIN_SWIPE) return;

    if (absDx > absDy) {
      handleDirectionInput(dx > 0 ? 'right' : 'left');
    } else {
      handleDirectionInput(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });
}

// ---- Initialize ----

shell.init();

const canvas = shell.getCanvas();
const input = createInputManager(canvas, LOGICAL_WIDTH, LOGICAL_HEIGHT);

// Use onTap for audio init only (swipe is handled separately)
input.onTap(() => {
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

// Set up swipe detection
setupSwipeDetection(canvas);

// ---- Theme Selector in Menu ----

setupThemeSelector();

function setupThemeSelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'theme-select';

    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.className = 'theme-select__btn';
      if (theme.id === currentTheme.id) {
        btn.classList.add('theme-select__btn--active');
      }
      btn.textContent = theme.name;
      btn.style.borderColor = theme.accentColor;

      btn.addEventListener('click', () => {
        currentTheme = theme;
        saveTheme(theme.id);

        // Update shell title
        const titleEl = document.querySelector('.menu-screen__title');
        if (titleEl) titleEl.textContent = theme.name;

        // Re-render selector to update active state
        setupThemeSelector();

        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
