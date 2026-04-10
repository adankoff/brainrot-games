/**
 * MEME BUBBLES -- Main Entry
 * Bubble shooter game: aim, fire, match 3+ to pop, survive the descent.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { clamp } from '../../shared/utils.js';
import { BubbleGrid, BUBBLE_RADIUS, BUBBLE_DIAMETER } from './bubbles.js';
import {
  drawBackground,
  drawGrid,
  drawFallingBubbles,
  drawPopEffects,
  drawAimLine,
  drawShooter,
  drawDeathLine,
  drawHUD,
  drawCeiling,
  drawBubble,
} from './renderer.js';

// ---- Constants ----
const WIDTH = 400;
const HEIGHT = 700;
const SHOOTER_Y = HEIGHT - 55;
const SHOOTER_X = WIDTH / 2;
const DEATH_LINE_Y = HEIGHT - 110;
const INITIAL_ROWS = 6;
const SHOTS_PER_ROW = 5;
const BULLET_SPEED = 14;
const MIN_ANGLE = -1.3; // ~75 degrees left
const MAX_ANGLE = 1.3;  // ~75 degrees right

// ---- Game State ----
let grid = null;
let score = 0;
let shotsFired = 0;
let currentColor = 0;
let nextColor = 0;
let aimAngle = 0;
let isAiming = false;
let isFiring = false;
let gameOver = false;

/** @type {{x: number, y: number, vx: number, vy: number, colorIndex: number}|null} */
let bullet = null;

// Keyboard aiming state
let keyLeft = false;
let keyRight = false;

// Pointer tracking
let pointerDown = false;
let pointerX = SHOOTER_X;
let pointerY = SHOOTER_Y - 100;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME BUBBLES',
  gameId: 'meme-bubbles',
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
  subtitle: 'pop the bubbles, feed the brainrot',
  accentColor: '#ff6ec7',
  theme: 'memebubbles',
});

// ---- Register Sounds ----
function registerGameSounds() {
  registerSound('shoot', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 660, duration: 0.08, gain: 0.15 },
    ],
  });

  registerSound('pop', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 1200, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 1000, endFrequency: 600, duration: 0.08, delay: 0.04, gain: 0.1 },
    ],
  });

  registerSound('fall', {
    notes: [
      { type: 'triangle', frequency: 300, endFrequency: 100, duration: 0.25, gain: 0.15 },
    ],
  });
}

// ---- Input Handling ----
function setupInput() {
  const canvas = shell.getCanvas();

  // Convert client coords to logical coords
  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (WIDTH / rect.width),
      y: (clientY - rect.top) * (HEIGHT / rect.height),
    };
  }

  function updateAimFromPointer(lx, ly) {
    const dx = lx - SHOOTER_X;
    const dy = ly - SHOOTER_Y;
    // Only aim if pointer is above the shooter
    if (dy < -10) {
      aimAngle = clamp(Math.atan2(dx, -dy), MIN_ANGLE, MAX_ANGLE);
    }
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    registerGameSounds();
    e.preventDefault();
    const pos = toLogical(e.clientX, e.clientY);
    pointerDown = true;
    pointerX = pos.x;
    pointerY = pos.y;
    isAiming = true;
    updateAimFromPointer(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!pointerDown) return;
    const pos = toLogical(e.clientX, e.clientY);
    pointerX = pos.x;
    pointerY = pos.y;
    updateAimFromPointer(pos.x, pos.y);
  });

  canvas.addEventListener('mouseup', (e) => {
    if (pointerDown && isAiming) {
      fire();
    }
    pointerDown = false;
    isAiming = false;
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    initAudio();
    registerGameSounds();
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    pointerDown = true;
    pointerX = pos.x;
    pointerY = pos.y;
    isAiming = true;
    updateAimFromPointer(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!pointerDown) return;
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    pointerX = pos.x;
    pointerY = pos.y;
    updateAimFromPointer(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (pointerDown && isAiming) {
      fire();
    }
    pointerDown = false;
    isAiming = false;
  }, { passive: false });

  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (shell.state !== 'playing') return;
    initAudio();
    registerGameSounds();

    if (e.code === 'ArrowLeft') {
      keyLeft = true;
      e.preventDefault();
    } else if (e.code === 'ArrowRight') {
      keyRight = true;
      e.preventDefault();
    } else if (e.code === 'Space') {
      fire();
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keyLeft = false;
    if (e.code === 'ArrowRight') keyRight = false;
  });
}

// ---- Game Logic ----

function fire() {
  if (shell.state !== 'playing' || bullet || gameOver) return;

  const vx = Math.sin(aimAngle) * BULLET_SPEED;
  const vy = -Math.cos(aimAngle) * BULLET_SPEED;

  bullet = {
    x: SHOOTER_X,
    y: SHOOTER_Y,
    vx,
    vy,
    colorIndex: currentColor,
  };

  currentColor = nextColor;
  nextColor = grid.getRandomGridColor();

  playSound('shoot');
}

function snapBullet() {
  if (!bullet) return;

  // Find where to snap
  let snapPos = grid.findSnapPosition(bullet.x, bullet.y);

  // If no snap found (e.g., bullet reached top), snap to row 0
  if (!snapPos) {
    const col = Math.round((bullet.x - BUBBLE_RADIUS) / BUBBLE_DIAMETER);
    const clampedCol = clamp(col, 0, grid.getColCount(0) - 1);
    snapPos = { row: 0, col: clampedCol };

    // If that position is occupied, find nearest empty in row 0-1
    if (grid.getBubble(snapPos.row, snapPos.col)) {
      snapPos = findNearestEmpty(bullet.x, bullet.y);
      if (!snapPos) {
        // Grid is totally full
        bullet = null;
        gameOver = true;
        return;
      }
    }
  }

  // Place the bubble
  grid.setBubble(snapPos.row, snapPos.col, bullet.colorIndex);

  // Process matches
  const result = grid.processMatches(snapPos.row, snapPos.col);

  if (result.popped > 0) {
    score += result.popped * 10;
    playSound('pop');
  }
  if (result.fallen > 0) {
    score += result.fallen * 20;
    playSound('fall');
  }

  // Track shots for row pushing
  shotsFired++;
  if (shotsFired >= SHOTS_PER_ROW) {
    shotsFired = 0;
    grid.pushDown();
  }

  // Check game over
  if (grid.isGameOver(DEATH_LINE_Y)) {
    gameOver = true;
    playSound('gameover');
  }

  bullet = null;
}

/**
 * Find nearest empty cell in grid to coordinates.
 * @param {number} x
 * @param {number} y
 * @returns {{row: number, col: number}|null}
 */
function findNearestEmpty(x, y) {
  let bestDist = Infinity;
  let best = null;

  for (let row = 0; row < 20; row++) {
    const cols = grid.getColCount(row);
    for (let col = 0; col < cols; col++) {
      if (grid.getBubble(row, col)) continue;
      const cx = grid.getBubbleX(row, col);
      const cy = grid.getBubbleY(row);
      const dx = x - cx;
      const dy = y - cy;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = { row, col };
      }
    }
  }

  return best;
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  grid = new BubbleGrid(WIDTH, HEIGHT);
  grid.generateRows(INITIAL_ROWS);
  score = 0;
  shotsFired = 0;
  aimAngle = 0;
  bullet = null;
  gameOver = false;
  keyLeft = false;
  keyRight = false;
  pointerDown = false;
  isAiming = false;

  currentColor = grid.getRandomGridColor();
  nextColor = grid.getRandomGridColor();
};

shell.onUpdate = (dt) => {
  if (gameOver) {
    shell.setState('game-over');
    return;
  }

  // Keyboard aiming
  if (keyLeft) {
    aimAngle = clamp(aimAngle - 0.04 * dt, MIN_ANGLE, MAX_ANGLE);
  }
  if (keyRight) {
    aimAngle = clamp(aimAngle + 0.04 * dt, MIN_ANGLE, MAX_ANGLE);
  }

  // Update bullet
  if (bullet) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    // Wall bounce
    if (bullet.x < BUBBLE_RADIUS) {
      bullet.x = BUBBLE_RADIUS;
      bullet.vx = -bullet.vx;
    } else if (bullet.x > WIDTH - BUBBLE_RADIUS) {
      bullet.x = WIDTH - BUBBLE_RADIUS;
      bullet.vx = -bullet.vx;
    }

    // Ceiling collision
    if (bullet.y < grid.topOffset) {
      bullet.y = grid.topOffset;
      snapBullet();
    }

    // Grid collision
    if (bullet && grid.checkCollision(bullet.x, bullet.y)) {
      snapBullet();
    }
  }

  // Update effects
  grid.updateEffects(dt);
};

shell.onRender = (ctx) => {
  drawBackground(ctx, WIDTH, HEIGHT);
  drawCeiling(ctx, WIDTH);
  drawDeathLine(ctx, DEATH_LINE_Y, WIDTH);

  // Draw grid
  drawGrid(ctx, grid);

  // Draw effects
  drawPopEffects(ctx, grid);
  drawFallingBubbles(ctx, grid);

  // Draw aim line (only when not firing)
  if (!bullet) {
    drawAimLine(ctx, SHOOTER_X, SHOOTER_Y, aimAngle, WIDTH);
  }

  // Draw flying bullet
  if (bullet) {
    drawBubble(ctx, bullet.x, bullet.y, bullet.colorIndex);
  }

  // Draw shooter
  drawShooter(ctx, SHOOTER_X, SHOOTER_Y, currentColor, nextColor, aimAngle);

  // HUD
  const shotsLeft = SHOTS_PER_ROW - shotsFired;
  drawHUD(ctx, score, shotsLeft, WIDTH);
};

shell.onGameOver = () => {
  return {
    score,
    message: 'the bubbles got you fr fr',
    scoreLabel: 'score',
  };
};

// ---- Init ----
setupInput();
shell.init();
