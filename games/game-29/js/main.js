/**
 * YEET -- Main Entry Point
 * Paper toss physics game. Swipe to throw a projectile into a bin.
 * Wind affects trajectory. 3 misses = game over. Streak bonuses.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { randomBetween, clamp } from '../../shared/utils.js';
import { readThemeColor } from '../../shared/theme-utils.js';
import { THEMES, getThemeById } from './themes.js';
import {
  drawBackground, drawBin, drawThemedProjectile, drawWindIndicator,
  drawScore, drawMisses, drawStreak, drawTrail, drawFloatingTexts,
  drawSwipeGuide, drawFlash,
} from './renderer.js';

// UI colors from CSS variables (outside in-game theme system)
const MISS_COLOR = readThemeColor('--game-miss', '#ff3838');

// ---- Constants ----

const W = 400;
const H = 700;
const GAME_ID = 'yeet';
const MAX_MISSES = 3;
const BALL_RADIUS = 14;
const GRAVITY = 0.2;
const BIN_WIDTH = 80;
const BIN_HEIGHT = 55;
const BALL_START_Y = H * 0.78;
const BALL_START_X = W / 2;

// Swipe mapping
const SWIPE_VX_SCALE = 0.08;
const SWIPE_VY_SCALE = 0.12;
const MIN_SWIPE_DY = -30; // Must swipe upward at least 30px (negative = up)

// ---- Game State ----

let score = 0;
let misses = 0;
let streak = 0;
let bestStreak = 0;
let wind = 0;

// Ball physics
let ballX = BALL_START_X;
let ballY = BALL_START_Y;
let ballVX = 0;
let ballVY = 0;
let ballRotation = 0;
let ballRotSpeed = 0;
let ballInFlight = false;
let ballLanded = false; // True after ball finished its arc (hit or miss resolved)

// Bin position
let binX = W / 2;
let binY = 120;

// Trail
let trail = [];
const MAX_TRAIL = 30;

// Floating texts
let floatingTexts = [];

// Flash effects
let flashColor = '';
let flashAlpha = 0;

// Swipe tracking
let swipeStartX = 0;
let swipeStartY = 0;
let swipeCurrentX = 0;
let swipeCurrentY = 0;
let isSwiping = false;

// Round reset delay
let resetTimer = 0;
const RESET_DELAY_MS = 800;

// Last death message to avoid repeat
let lastDeathMsg = '';

// Audio
let audioReady = false;

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'skibidi-yeet';
}

function saveTheme(id) {
  setData(GAME_ID, 'theme', id);
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: currentTheme.name,
  gameId: GAME_ID,
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'yeet',
  subtitle: 'swipe to yeet. wind is mid. 3 misses and you\'re cooked.',
  accentColor: currentTheme.accentColor || readThemeColor('--game-accent', '#aaaaaa'),
  shareUrl: 'https://brainrotgames.com/games/game-29/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('throw', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 600, duration: 0.12, gain: 0.1 },
      { type: 'sine', frequency: 200, endFrequency: 100, duration: 0.08, delay: 0.04, gain: 0.06, noise: true },
    ],
  });

  registerSound('basket', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 550, duration: 0.1, gain: 0.15 },
      { type: 'triangle', frequency: 660, duration: 0.08, delay: 0.08, gain: 0.12 },
    ],
  });

  registerSound('miss', {
    notes: [
      { type: 'sawtooth', frequency: 120, endFrequency: 60, duration: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 80, duration: 0.1, delay: 0.05, gain: 0.1, noise: true },
    ],
  });

  registerSound('streak', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.06, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.06, delay: 0.06, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.06, delay: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.08, delay: 0.18, gain: 0.2 },
    ],
  });
}

// ---- Helper Functions ----

function generateWind() {
  wind = randomBetween(-0.15, 0.15);
}

function repositionBin() {
  // Vary bin horizontal position slightly each round
  binX = W / 2 + randomBetween(-80, 80);
  binX = clamp(binX, BIN_WIDTH / 2 + 20, W - BIN_WIDTH / 2 - 20);

  // Vary bin vertical position slightly
  binY = 100 + randomBetween(0, 60);
}

function resetBall() {
  ballX = BALL_START_X;
  ballY = BALL_START_Y;
  ballVX = 0;
  ballVY = 0;
  ballRotation = 0;
  ballRotSpeed = 0;
  ballInFlight = false;
  ballLanded = false;
  trail = [];
  resetTimer = 0;
  isSwiping = false;
}

function spawnFloatingText(text, x, y, color, size) {
  floatingTexts.push({
    text,
    x,
    y,
    color,
    alpha: 1.0,
    vy: -1.2,
    size: size || 18,
  });
}

function getStreakBonus(currentStreak) {
  if (currentStreak >= 10) return 5;
  if (currentStreak >= 7) return 4;
  if (currentStreak >= 5) return 3;
  if (currentStreak >= 3) return 2;
  return 0;
}

function getDeathMessage() {
  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMsg && pool.length > 1);
  lastDeathMsg = msg;
  return msg;
}

function getWinMessage() {
  const pool = currentTheme.winMessages;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Check if ball has entered the bin opening.
 * The bin opening is a horizontal zone at the top of the bin.
 */
function checkBinCollision() {
  const halfBinW = BIN_WIDTH / 2;
  // Ball must be within bin horizontal bounds
  const inX = ballX > binX - halfBinW + 8 && ballX < binX + halfBinW - 8;
  // Ball must be at the bin opening vertical zone (within a few pixels of bin top)
  const inY = ballY > binY - 5 && ballY < binY + BIN_HEIGHT * 0.4;
  // Ball must be moving downward (falling into bin)
  const fallingDown = ballVY > 0;

  return inX && inY && fallingDown;
}

/**
 * Check if ball has gone off screen or hit the floor.
 */
function checkMiss() {
  const floorY = H * 0.82;
  return ballY > floorY || ballX < -50 || ballX > W + 50 || ballY < -100;
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  score = 0;
  misses = 0;
  streak = 0;
  bestStreak = 0;
  floatingTexts = [];
  flashAlpha = 0;

  resetBall();
  generateWind();
  repositionBin();
};

shell.onUpdate = (dt) => {
  // Update floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= 0.018 * dt;
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // Decay flash
  if (flashAlpha > 0) {
    flashAlpha -= 0.04 * dt;
    if (flashAlpha < 0) flashAlpha = 0;
  }

  // If ball is not in flight, nothing more to do (waiting for swipe)
  if (!ballInFlight) return;

  // If ball landed, wait for reset timer
  if (ballLanded) {
    resetTimer += dt * 16.67;
    if (resetTimer >= RESET_DELAY_MS) {
      // Check game over
      if (misses >= MAX_MISSES) {
        playSound('gameover');
        shell.setState('game-over');
        return;
      }
      // Reset for next throw
      resetBall();
      generateWind();
      repositionBin();
    }
    return;
  }

  // Physics update
  ballVY += GRAVITY * dt;
  ballVX += wind * dt;
  ballX += ballVX * dt;
  ballY += ballVY * dt;
  ballRotation += ballRotSpeed * dt;

  // Trail
  trail.push({ x: ballX, y: ballY });
  if (trail.length > MAX_TRAIL) {
    trail.shift();
  }

  // Check bin collision
  if (checkBinCollision()) {
    ballLanded = true;
    ballInFlight = true; // Keep true so we don't allow new swipes

    // Score!
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    const bonus = getStreakBonus(streak);
    const points = 1 + bonus;
    score += points;

    // Visual feedback
    spawnFloatingText('+' + points, binX, binY - 20, currentTheme.scoreColor, 22);
    if (bonus > 0) {
      spawnFloatingText('streak x' + streak, binX, binY - 45, currentTheme.streakColor, 14);
      playSound('streak');
    } else {
      playSound('basket');
    }

    flashColor = currentTheme.accentColor;
    flashAlpha = 0.15;

    // Snap ball into bin
    ballVX = 0;
    ballVY = 0;
    ballRotSpeed = 0;
    return;
  }

  // Check miss
  if (checkMiss()) {
    ballLanded = true;
    ballInFlight = true;

    misses++;
    streak = 0;

    // Visual feedback
    spawnFloatingText('MISS', ballX, Math.min(ballY, H * 0.75), MISS_COLOR, 20);
    playSound('miss');

    flashColor = MISS_COLOR;
    flashAlpha = 0.2;
    return;
  }
};

shell.onRender = (ctx) => {
  // Background
  drawBackground(ctx, W, H, currentTheme);

  // Bin
  drawBin(ctx, binX, binY, BIN_WIDTH, BIN_HEIGHT, currentTheme);

  // Wind indicator
  drawWindIndicator(ctx, W, wind, currentTheme);

  // Score HUD
  drawScore(ctx, score, currentTheme);

  // Miss indicators
  drawMisses(ctx, W, misses, MAX_MISSES);

  // Streak
  drawStreak(ctx, W, streak, currentTheme);

  // Trail (only while in flight)
  if (ballInFlight && !ballLanded) {
    drawTrail(ctx, trail, currentTheme);
  }

  // Ball
  if (!ballLanded) {
    drawThemedProjectile(ctx, ballX, ballY, BALL_RADIUS, ballRotation, currentTheme, false);
  } else if (ballLanded && checkBinCollision()) {
    // Draw ball slightly inside bin
    drawThemedProjectile(ctx, binX, binY + 12, BALL_RADIUS * 0.8, ballRotation, currentTheme, false);
  }

  // Swipe guide
  if (isSwiping && !ballInFlight) {
    drawSwipeGuide(ctx, swipeStartX, swipeStartY, swipeCurrentX, swipeCurrentY, currentTheme);
  }

  // Floating texts
  drawFloatingTexts(ctx, floatingTexts);

  // Flash
  drawFlash(ctx, W, H, flashColor, flashAlpha);
};

shell.onGameOver = () => {
  const isHighScore = score >= shell.getHighScore() && score > 0;
  const message = isHighScore ? getWinMessage() : getDeathMessage();
  return {
    score,
    message,
    scoreLabel: currentTheme.scoreLabel,
  };
};

shell.onGameOverRender = (ctx) => {
  drawBackground(ctx, W, H, currentTheme);
  drawBin(ctx, binX, binY, BIN_WIDTH, BIN_HEIGHT, currentTheme);
  drawWindIndicator(ctx, W, wind, currentTheme);
  drawScore(ctx, score, currentTheme);
  drawMisses(ctx, W, misses, MAX_MISSES);
};

// ---- Swipe Input Handling ----

/**
 * Convert client coordinates to logical canvas coordinates.
 *
 * @param {number} clientX
 * @param {number} clientY
 * @returns {{ x: number, y: number }}
 */
function toLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

function handleSwipeStart(clientX, clientY) {
  if (shell.state !== 'playing') return;
  if (ballInFlight) return;

  const pos = toLogical(clientX, clientY);
  swipeStartX = pos.x;
  swipeStartY = pos.y;
  swipeCurrentX = pos.x;
  swipeCurrentY = pos.y;
  isSwiping = true;
}

function handleSwipeMove(clientX, clientY) {
  if (!isSwiping) return;
  const pos = toLogical(clientX, clientY);
  swipeCurrentX = pos.x;
  swipeCurrentY = pos.y;
}

function handleSwipeEnd(clientX, clientY) {
  if (!isSwiping) return;
  isSwiping = false;

  if (shell.state !== 'playing') return;
  if (ballInFlight) return;

  const pos = toLogical(clientX, clientY);
  const dx = pos.x - swipeStartX;
  const dy = pos.y - swipeStartY;

  // Must swipe upward enough
  if (dy > MIN_SWIPE_DY) return; // dy is negative for upward

  // Launch!
  ballVX = dx * SWIPE_VX_SCALE;
  ballVY = dy * SWIPE_VY_SCALE;
  ballRotSpeed = ballVX * 0.15;
  ballInFlight = true;

  playSound('throw');
}

// ---- Event Listeners (raw touch/mouse for swipe) ----

function setupSwipeDetection(canvas) {
  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleSwipeStart(e.clientX, e.clientY);
  });

  canvas.addEventListener('mousemove', (e) => {
    handleSwipeMove(e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseup', (e) => {
    handleSwipeEnd(e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseleave', (e) => {
    if (isSwiping) {
      handleSwipeEnd(e.clientX, e.clientY);
    }
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleSwipeStart(touch.clientX, touch.clientY);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleSwipeMove(touch.clientX, touch.clientY);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleSwipeEnd(touch.clientX, touch.clientY);
  }, { passive: false });
}

// ---- Initialize ----

shell.init();

const canvas = shell.getCanvas();
const input = createInputManager(canvas, W, H);

// Audio init on first interaction
input.onTap(() => {
  if (!audioReady) {
    try {
      initAudio();
      registerGameSounds();
      audioReady = true;
    } catch {
      // Audio failed -- game still plays fine
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

        if (audioReady) playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
