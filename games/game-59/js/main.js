/**
 * BRAINROT COLOR SWITCH -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Color Switch mechanic: tap to jump, pass through matching color segments.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { clamp, randomInt, randomBetween } from '../../shared/utils.js';
import { THEMES, getThemeById } from './themes.js';
import {
  drawBackground, drawParticles, drawCircleBarrier, drawBarBarrier,
  drawBall, drawColorSwitcher, drawStar, drawScore, drawColorIndicator,
  drawDeathFlash,
} from './renderer.js';

// ---- Constants ----
const W = 360;
const H = 640;
const GRAVITY = 0.15;
const JUMP_IMPULSE = -6.5;
const BALL_RADIUS = 12;
const BALL_START_Y = 500;
const BARRIER_SPACING = 220;
const BARRIER_RADIUS = 55;
const BARRIER_THICKNESS = 14;
const BAR_BARRIER_WIDTH = 300;
const BAR_BARRIER_THICKNESS = 18;
const SWITCHER_SIZE = 14;
const STAR_SIZE = 10;
const BASE_ROTATION_SPEED = 0.02;
const ROTATION_SPEED_INCREMENT = 0.001;
const MAX_ROTATION_SPEED = 0.06;
const NUM_PARTICLES = 40;
const CAMERA_LERP = 0.08;

// ---- Game State (module-scoped) ----
let currentTheme = null;
let ball = null;
let barriers = [];
let switchers = [];
let stars = [];
let particles = [];
let score = 0;
let cameraY = 0;
let targetCameraY = 0;
let gameTime = 0;
let deathFlashAge = 1;
let highestBarrierPassed = 0;
let nextBarrierY = 0;
let barrierCount = 0;
let isDead = false;

// ---- Theme persistence ----
const GAME_ID = 'brainrot-color-switch';

function loadThemeId() {
  const saved = getData(GAME_ID, 'theme');
  return saved || THEMES[0].id;
}

function saveThemeId(id) {
  setData(GAME_ID, 'theme', id);
}

// Initialize theme
currentTheme = getThemeById(loadThemeId());

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'BRAINROT COLOR SWITCH',
  gameId: 'brainrot-color-switch',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'color-switch',
  subtitle: 'tap to jump. match the color. don\'t die.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-25/',
});

// ---- Particle System ----

function initParticles() {
  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: randomBetween(0, W),
      y: randomBetween(0, H * 2),
      size: randomBetween(1, 3),
      alpha: randomBetween(0.05, 0.2),
      speed: randomBetween(0.3, 1),
    });
  }
}

// ---- Barrier Generation ----

function createBarrier(y, index) {
  const rotSpeed = Math.min(
    MAX_ROTATION_SPEED,
    BASE_ROTATION_SPEED + index * ROTATION_SPEED_INCREMENT
  );
  // Alternate rotation direction
  const dir = index % 2 === 0 ? 1 : -1;

  // Alternate between circle and bar barriers
  const type = index % 3 === 0 ? 'bar' : 'circle';

  // Shuffle the color order for this barrier
  const colorOrder = shuffleColors();

  return {
    type,
    x: W / 2,
    y,
    radius: type === 'circle' ? BARRIER_RADIUS : 0,
    width: type === 'bar' ? BAR_BARRIER_WIDTH : 0,
    thickness: type === 'circle' ? BARRIER_THICKNESS : BAR_BARRIER_THICKNESS,
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: rotSpeed * dir,
    colorOrder,
    passed: false,
    index,
  };
}

function shuffleColors() {
  const indices = [0, 1, 2, 3];
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function createSwitcher(y) {
  return {
    x: W / 2,
    y,
    size: SWITCHER_SIZE,
    rotation: 0,
    collected: false,
  };
}

function createStar(y) {
  // Offset star from center randomly
  const xOffset = randomBetween(-40, 40);
  return {
    x: W / 2 + xOffset,
    y: y + randomBetween(-20, 20),
    size: STAR_SIZE,
    rotation: 0,
    collected: false,
  };
}

function generateInitialLevel() {
  barriers = [];
  switchers = [];
  stars = [];
  barrierCount = 0;
  nextBarrierY = BALL_START_Y - BARRIER_SPACING;

  // Generate first batch of barriers above the start
  for (let i = 0; i < 8; i++) {
    addNextBarrier();
  }
}

function addNextBarrier() {
  const barrier = createBarrier(nextBarrierY, barrierCount);
  barriers.push(barrier);

  // Add a color switcher between each barrier
  const switcherY = nextBarrierY + BARRIER_SPACING / 2;
  switchers.push(createSwitcher(switcherY));

  // Sometimes add a star near the switcher
  if (randomBetween(0, 1) < 0.4) {
    stars.push(createStar(switcherY));
  }

  nextBarrierY -= BARRIER_SPACING;
  barrierCount++;
}

// ---- Collision Detection ----

/**
 * Check if ball collides with a circular barrier.
 * The ball can pass through the segment matching its color.
 */
function checkCircleBarrierCollision(ballObj, barrier) {
  const dx = ballObj.x - barrier.x;
  const dy = ballObj.y - barrier.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Check if ball is within the ring (between inner and outer radius)
  const innerRadius = barrier.radius - barrier.thickness / 2;
  const outerRadius = barrier.radius + barrier.thickness / 2;

  if (dist + BALL_RADIUS < innerRadius || dist - BALL_RADIUS > outerRadius) {
    return false; // Not touching the ring
  }

  // Ball is in the ring zone. Determine which color segment it's in.
  let angle = Math.atan2(dy, dx) - barrier.rotation;
  // Normalize to [0, 2*PI)
  angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  const segmentIndex = Math.floor(angle / (Math.PI / 2));
  const colorIndex = barrier.colorOrder[segmentIndex];

  // If the segment color matches ball color, pass through
  if (colorIndex === ballObj.colorIndex) {
    return false;
  }

  return true; // Collision with wrong color
}

/**
 * Check if ball collides with a bar barrier.
 */
function checkBarBarrierCollision(ballObj, barrier) {
  // Transform ball position into barrier's rotated local space
  const dx = ballObj.x - barrier.x;
  const dy = ballObj.y - barrier.y;
  const cos = Math.cos(-barrier.rotation);
  const sin = Math.sin(-barrier.rotation);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  // Check if ball is within the bar's bounding box
  const halfW = barrier.width / 2;
  const halfH = barrier.thickness / 2;

  if (
    localX + BALL_RADIUS < -halfW || localX - BALL_RADIUS > halfW ||
    localY + BALL_RADIUS < -halfH || localY - BALL_RADIUS > halfH
  ) {
    return false; // Not touching bar
  }

  // Determine which segment the ball center is in
  const segW = barrier.width / 4;
  const segIndex = clamp(Math.floor((localX + halfW) / segW), 0, 3);
  const colorIndex = barrier.colorOrder[segIndex];

  if (colorIndex === ballObj.colorIndex) {
    return false; // Matching color
  }

  return true; // Wrong color collision
}

/**
 * Check if ball overlaps a circle pickup (switcher or star).
 */
function checkPickupCollision(ballObj, pickup, pickupRadius) {
  const dx = ballObj.x - pickup.x;
  const dy = ballObj.y - pickup.y;
  const dist = dx * dx + dy * dy;
  const radSum = BALL_RADIUS + pickupRadius;
  return dist <= radSum * radSum;
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  score = 0;
  gameTime = 0;
  deathFlashAge = 1;
  highestBarrierPassed = 0;
  isDead = false;

  ball = {
    x: W / 2,
    y: BALL_START_Y,
    vy: 0,
    colorIndex: randomInt(0, 3),
    radius: BALL_RADIUS,
  };

  cameraY = ball.y - H * 0.65;
  targetCameraY = cameraY;

  initParticles();
  generateInitialLevel();
};

shell.onUpdate = (dt) => {
  if (isDead) return;

  gameTime += dt * 16.67;

  // ---- Physics ----
  ball.vy += GRAVITY * dt;
  ball.y += ball.vy * dt;

  // Prevent falling below the start area (only early on)
  if (score === 0 && ball.y > BALL_START_Y + 50) {
    ball.y = BALL_START_Y + 50;
    ball.vy = 0;
  }

  // ---- Camera ----
  targetCameraY = ball.y - H * 0.65;
  // Only scroll up, not down
  if (targetCameraY < cameraY) {
    cameraY += (targetCameraY - cameraY) * CAMERA_LERP * dt;
  }

  // ---- Barrier rotation ----
  for (const barrier of barriers) {
    barrier.rotation += barrier.rotationSpeed * dt;
  }

  // ---- Switcher rotation ----
  for (const sw of switchers) {
    sw.rotation += 0.03 * dt;
  }

  // ---- Star rotation ----
  for (const star of stars) {
    star.rotation += 0.02 * dt;
  }

  // ---- Collision: barriers ----
  for (const barrier of barriers) {
    // Skip barriers far away (use generous bounding for rotated elements)
    const checkDist = barrier.type === 'circle'
      ? barrier.radius + barrier.thickness / 2 + BALL_RADIUS + 5
      : Math.max(barrier.width, barrier.thickness) / 2 + BALL_RADIUS + 5;
    if (Math.abs(ball.y - barrier.y) > checkDist) continue;

    let hit = false;
    if (barrier.type === 'circle') {
      hit = checkCircleBarrierCollision(ball, barrier);
    } else {
      hit = checkBarBarrierCollision(ball, barrier);
    }

    if (hit) {
      die();
      return;
    }

    // Check if ball passed through barrier
    if (!barrier.passed && ball.y < barrier.y - BALL_RADIUS - 5) {
      barrier.passed = true;
      score++;
      playSound('collect');
    }
  }

  // ---- Collision: switchers ----
  for (const sw of switchers) {
    if (sw.collected) continue;
    if (checkPickupCollision(ball, sw, sw.size)) {
      sw.collected = true;
      // Change ball color to a different random color
      let newColor;
      do {
        newColor = randomInt(0, 3);
      } while (newColor === ball.colorIndex);
      ball.colorIndex = newColor;
      playSound('colorswitch');
    }
  }

  // ---- Collision: stars ----
  for (const star of stars) {
    if (star.collected) continue;
    if (checkPickupCollision(ball, star, star.size)) {
      star.collected = true;
      score++;
      playSound('collect');
    }
  }

  // ---- Generate more barriers as player goes up ----
  while (nextBarrierY > cameraY - BARRIER_SPACING) {
    addNextBarrier();
  }

  // ---- Remove off-screen barriers below camera ----
  const cullY = cameraY + H + 200;
  barriers = barriers.filter(b => b.y < cullY);
  switchers = switchers.filter(s => s.y < cullY);
  stars = stars.filter(s => s.y < cullY);

  // ---- Death: fell off bottom of screen ----
  if (ball.y > cameraY + H + 100) {
    die();
  }
};

function die() {
  if (isDead) return;
  isDead = true;
  deathFlashAge = 0;
  playSound('death');

  // Small delay before showing game over to let death flash play
  setTimeout(() => {
    shell.setState('game-over');
  }, 400);
}

shell.onRender = (ctx) => {
  // Background
  drawBackground(ctx, W, H, currentTheme);

  // Particles
  drawParticles(ctx, particles, currentTheme, cameraY);

  // Barriers
  for (const barrier of barriers) {
    const screenY = barrier.y - cameraY;
    if (screenY < -100 || screenY > H + 100) continue;

    const orderedColors = barrier.colorOrder.map(i => currentTheme.colors[i]);

    if (barrier.type === 'circle') {
      drawCircleBarrier(ctx, barrier, orderedColors, cameraY);
    } else {
      drawBarBarrier(ctx, barrier, orderedColors, cameraY);
    }
  }

  // Color switchers
  for (const sw of switchers) {
    if (sw.collected) continue;
    const screenY = sw.y - cameraY;
    if (screenY < -50 || screenY > H + 50) continue;
    drawColorSwitcher(ctx, sw, currentTheme.colors, cameraY);
  }

  // Stars
  for (const star of stars) {
    if (star.collected) continue;
    const screenY = star.y - cameraY;
    if (screenY < -50 || screenY > H + 50) continue;
    drawStar(ctx, star, cameraY, currentTheme.accentColor);
  }

  // Ball
  if (ball) {
    const ballColor = currentTheme.colors[ball.colorIndex];
    drawBall(ctx, ball, ballColor, currentTheme, cameraY, gameTime);
  }

  // HUD (not affected by camera)
  drawScore(ctx, W, score, currentTheme.scoreColor);
  if (ball) {
    drawColorIndicator(ctx, W, currentTheme.colors[ball.colorIndex]);
  }

  // Death flash
  if (deathFlashAge < 1) {
    drawDeathFlash(ctx, W, H, deathFlashAge);
    deathFlashAge += 0.05;
  }
};

shell.onGameOver = () => {
  const messages = currentTheme.deathMessages;
  const message = messages[randomInt(0, messages.length - 1)];
  return {
    score,
    message,
    scoreLabel: 'barriers cleared',
  };
};

shell.onGameOverRender = (ctx) => {
  drawBackground(ctx, W, H, currentTheme);
  drawParticles(ctx, particles, currentTheme, cameraY);

  // Draw barriers in their last state
  for (const barrier of barriers) {
    const screenY = barrier.y - cameraY;
    if (screenY < -100 || screenY > H + 100) continue;
    const orderedColors = barrier.colorOrder.map(i => currentTheme.colors[i]);
    if (barrier.type === 'circle') {
      drawCircleBarrier(ctx, barrier, orderedColors, cameraY);
    } else {
      drawBarBarrier(ctx, barrier, orderedColors, cameraY);
    }
  }
};

// ---- Input Setup ----
shell.init();

const input = createInputManager(shell.getCanvas(), W, H);

let audioReady = false;

input.onTap(() => {
  initAudio();
  if (!audioReady) {
    audioReady = true;
    // Register game-specific sounds
    registerSound('jump', {
      notes: [
        { type: 'sine', frequency: 400, endFrequency: 600, duration: 0.08, gain: 0.12 },
      ],
    });
    registerSound('collect', {
      notes: [
        { type: 'sine', frequency: 880, duration: 0.06, gain: 0.15 },
        { type: 'sine', frequency: 1100, duration: 0.06, delay: 0.06, gain: 0.15 },
      ],
    });
    registerSound('colorswitch', {
      notes: [
        { type: 'triangle', frequency: 600, endFrequency: 1200, duration: 0.12, gain: 0.1 },
        { type: 'sine', frequency: 1000, endFrequency: 800, duration: 0.08, delay: 0.05, gain: 0.08 },
      ],
    });
    registerSound('death', {
      notes: [
        { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.35, gain: 0.2 },
        { type: 'square', frequency: 100, duration: 0.15, delay: 0.1, gain: 0.1 },
      ],
    });
  }

  if (shell.state === 'playing' && !isDead) {
    ball.vy = JUMP_IMPULSE;
    playSound('jump');
  }
});

// ---- Theme Selector ----

function buildThemeSelector() {
  // Wait for shell to build DOM, then populate #menu-secondary
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const container = document.createElement('div');
  container.className = 'theme-select';

  for (const theme of THEMES) {
    const btn = document.createElement('button');
    btn.className = 'theme-select__btn';
    btn.textContent = theme.name;
    btn.dataset.themeId = theme.id;

    if (theme.id === currentTheme.id) {
      btn.classList.add('theme-select__btn--active');
    }

    btn.addEventListener('click', () => {
      currentTheme = getThemeById(theme.id);
      saveThemeId(theme.id);

      // Update active button
      container.querySelectorAll('.theme-select__btn').forEach(b => {
        b.classList.remove('theme-select__btn--active');
      });
      btn.classList.add('theme-select__btn--active');

      // Update shell accent
      shell._config.accentColor = currentTheme.accentColor;
    });

    container.appendChild(btn);
  }

  secondary.appendChild(container);
}

// Build theme selector after shell init (DOM is ready)
buildThemeSelector();
