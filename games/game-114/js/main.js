/**
 * MEME CATCH -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Catch falling good items, avoid bad ones. 3 lives. Speed ramps up.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { clamp, checkCollisionAABB, randomBetween } from '../../shared/utils.js';
import { Catcher } from './catcher.js';
import {
  drawBackground,
  drawCatcher,
  drawFallingObject,
  drawHUD,
  drawParticles,
  drawReadyHint,
} from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

const GOOD_ITEMS = [
  { emoji: '\uD83C\uDF69', name: 'donut' },     // doughnut
  { emoji: '\uD83C\uDF55', name: 'pizza' },      // pizza
  { emoji: '\uD83C\uDF54', name: 'burger' },     // burger
  { emoji: '\u2B50', name: 'star' },              // star
  { emoji: '\uD83D\uDC8E', name: 'gem' },        // gem
];

const BAD_ITEMS = [
  { emoji: '\uD83D\uDCA3', name: 'bomb' },       // bomb
  { emoji: '\u2620\uFE0F', name: 'skull' },       // skull
  { emoji: '\uD83D\uDD25', name: 'fire' },       // fire
];

const BASE_FALL_SPEED = 2;         // px per frame at start
const SPEED_INCREMENT = 0.01;      // added per second of play
const BASE_SPAWN_INTERVAL = 60;    // frames between spawns at start
const MIN_SPAWN_INTERVAL = 25;     // fastest spawn rate
const SPAWN_RAMP_RATE = 0.5;       // frames reduced per second of play
const BAD_ITEM_CHANCE = 0.25;      // 25% chance each spawn is bad
const OBJECT_SIZE = 28;            // emoji font size
const OBJECT_HITBOX = 24;          // hitbox size for collision
const MAX_LIVES = 3;

// Multiplier thresholds
const MULTIPLIER_2X_STREAK = 5;
const MULTIPLIER_3X_STREAK = 10;

// ---- Module State ----

let catcher = new Catcher(LOGICAL_WIDTH, LOGICAL_HEIGHT);
let fallingObjects = [];
let particles = [];
let score = 0;
let lives = MAX_LIVES;
let streak = 0;
let multiplier = 1;
let elapsedTime = 0;     // seconds since game started
let spawnTimer = 0;
let gameTime = 0;         // ms for animations
let internalState = 'ready'; // 'ready' | 'active' | 'dying'
let readyTime = 0;
let audioInitialized = false;
let dyingTimer = 0;

// Keyboard state
const keys = { left: false, right: false };

// Pointer tracking state
let pointerDown = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME CATCH',
  gameId: 'meme-catch',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-catch',
  subtitle: 'catch the drip. dodge the bombs.',
  accentColor: '#ff6bff',
  shareUrl: 'https://brainrotgames.com/games/game-114/',
});

// ---- Register Game Sounds ----

function registerGameSounds() {
  // Catch sound (pleasant ding)
  registerSound('catch', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 1320, duration: 0.08, delay: 0.05, gain: 0.15 },
    ],
  });

  // Bomb sound (explosion)
  registerSound('bomb', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 40, duration: 0.25, gain: 0.3 },
      { type: 'square', frequency: 80, duration: 0.15, gain: 0.2, noise: true },
    ],
  });

  // Miss sound (whoosh)
  registerSound('miss', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 200, duration: 0.15, gain: 0.08 },
    ],
  });
}

// ---- Spawn Logic ----

function getCurrentFallSpeed() {
  return BASE_FALL_SPEED + elapsedTime * SPEED_INCREMENT;
}

function getCurrentSpawnInterval() {
  return clamp(
    BASE_SPAWN_INTERVAL - elapsedTime * SPAWN_RAMP_RATE,
    MIN_SPAWN_INTERVAL,
    BASE_SPAWN_INTERVAL
  );
}

function spawnObject() {
  const isBad = Math.random() < BAD_ITEM_CHANCE;
  const pool = isBad ? BAD_ITEMS : GOOD_ITEMS;
  const item = pool[Math.floor(Math.random() * pool.length)];

  const margin = 20;
  const x = randomBetween(margin, LOGICAL_WIDTH - margin);

  fallingObjects.push({
    x,
    y: -OBJECT_SIZE,
    emoji: item.emoji,
    name: item.name,
    isBad,
    size: OBJECT_SIZE,
    rotation: randomBetween(-0.3, 0.3),
    rotSpeed: randomBetween(-0.03, 0.03),
    speed: getCurrentFallSpeed() * randomBetween(0.9, 1.1),
  });
}

// ---- Particle Effects ----

function spawnScoreParticle(x, y, text, color) {
  particles.push({
    x,
    y,
    text,
    color,
    alpha: 1,
    life: 1,
    vy: -1.5,
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= 0.02 * dt;
    p.alpha = clamp(p.life, 0, 1);
    p.y += p.vy * dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ---- Multiplier Logic ----

function updateMultiplier() {
  if (streak >= MULTIPLIER_3X_STREAK) {
    multiplier = 3;
  } else if (streak >= MULTIPLIER_2X_STREAK) {
    multiplier = 2;
  } else {
    multiplier = 1;
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  internalState = 'ready';
  catcher = new Catcher(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  fallingObjects = [];
  particles = [];
  score = 0;
  lives = MAX_LIVES;
  streak = 0;
  multiplier = 1;
  elapsedTime = 0;
  spawnTimer = 0;
  gameTime = 0;
  readyTime = 0;
  dyingTimer = 0;
  keys.left = false;
  keys.right = false;
  pointerDown = false;
};

shell.onUpdate = (dt) => {
  gameTime += dt * 16.67;

  // ---- READY sub-state (waiting for first input) ----
  if (internalState === 'ready') {
    readyTime += dt * 16.67;

    // Still allow catcher movement during ready state
    handleCatcherInput(dt);
    catcher.update(dt);

    // Transition to active on any input
    if (keys.left || keys.right || pointerDown) {
      internalState = 'active';
    }
    return;
  }

  // ---- DYING sub-state ----
  if (internalState === 'dying') {
    dyingTimer -= dt * 16.67;
    updateParticles(dt);
    if (dyingTimer <= 0) {
      playSound('gameover');
      shell.setState('game-over');
    }
    return;
  }

  // ---- ACTIVE sub-state ----

  elapsedTime += dt * 16.67 / 1000; // convert to seconds

  // Catcher movement
  handleCatcherInput(dt);
  catcher.update(dt);

  // Spawn timer
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnObject();
    spawnTimer = getCurrentSpawnInterval();
  }

  // Update falling objects
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    const obj = fallingObjects[i];
    obj.y += obj.speed * dt;
    obj.rotation += obj.rotSpeed * dt;

    // Check collision with catcher
    const objHitbox = {
      x: obj.x - OBJECT_HITBOX / 2,
      y: obj.y - OBJECT_HITBOX / 2,
      width: OBJECT_HITBOX,
      height: OBJECT_HITBOX,
    };
    const catcherHitbox = catcher.getHitbox();

    if (checkCollisionAABB(objHitbox, catcherHitbox)) {
      if (obj.isBad) {
        // Caught a bad item -- lose a life
        lives--;
        streak = 0;
        updateMultiplier();
        playSound('bomb');
        spawnScoreParticle(obj.x, obj.y, '-1 \u2764\uFE0F', '#ff4444');
        fallingObjects.splice(i, 1);

        if (lives <= 0) {
          internalState = 'dying';
          dyingTimer = 600;
        }
      } else {
        // Caught a good item
        const points = 10 * multiplier;
        score += points;
        streak++;
        updateMultiplier();
        playSound('catch');

        const color = multiplier > 1 ? '#ffdd00' : '#44ff88';
        spawnScoreParticle(obj.x, obj.y, `+${points}`, color);

        // Play combo sound on multiplier thresholds
        if (streak === MULTIPLIER_2X_STREAK || streak === MULTIPLIER_3X_STREAK) {
          playSound('bonus');
        }

        fallingObjects.splice(i, 1);
      }
      continue;
    }

    // Fell off screen (missed)
    if (obj.y > LOGICAL_HEIGHT + OBJECT_SIZE) {
      if (!obj.isBad) {
        // Missed a good item -- reset streak (no life penalty)
        streak = 0;
        updateMultiplier();
        playSound('miss');
      }
      // Bad items falling off screen is fine -- no penalty
      fallingObjects.splice(i, 1);
    }
  }

  // Update particles
  updateParticles(dt);
};

shell.onRender = (ctx) => {
  const w = LOGICAL_WIDTH;
  const h = LOGICAL_HEIGHT;

  // Background
  drawBackground(ctx, w, h, gameTime);

  // Falling objects
  for (const obj of fallingObjects) {
    drawFallingObject(ctx, obj);
  }

  // Catcher
  drawCatcher(ctx, catcher);

  // Particles
  drawParticles(ctx, particles);

  // HUD
  drawHUD(ctx, w, score, lives, multiplier, streak);

  // Ready hint
  if (internalState === 'ready') {
    drawReadyHint(ctx, w, h, readyTime);
  }
};

shell.onGameOver = () => {
  const message = getGameOverMessage(score);
  return {
    score,
    message,
    scoreLabel: 'memes caught',
  };
};

// ---- Input Handling ----

function handleCatcherInput(dt) {
  if (keys.left) {
    catcher.moveKeyboard(-1, dt);
  }
  if (keys.right) {
    catcher.moveKeyboard(1, dt);
  }
}

function ensureAudio() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game plays fine without sound
    }
  }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    e.preventDefault();
    keys.left = true;
    ensureAudio();
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    e.preventDefault();
    keys.right = true;
    ensureAudio();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    keys.left = false;
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    keys.right = false;
  }
});

// Pointer/touch input -- track continuous position for smooth basket control
function getLogicalPos(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (LOGICAL_WIDTH / rect.width),
    y: (clientY - rect.top) * (LOGICAL_HEIGHT / rect.height),
  };
}

const canvas = (() => {
  // We need the canvas after shell.init(), so defer access
  return {
    get el() { return shell.getCanvas(); }
  };
})();

function onPointerMove(clientX, clientY) {
  ensureAudio();
  const pos = getLogicalPos(clientX, clientY);
  catcher.setPointerX(pos.x);
  pointerDown = true;
}

document.addEventListener('mousedown', (e) => {
  // Only handle if game is in playing state and click is on/near canvas
  if (shell.state !== 'playing') return;
  onPointerMove(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (shell.state !== 'playing') return;
  if (e.buttons > 0 || pointerDown) {
    onPointerMove(e.clientX, e.clientY);
  }
});

document.addEventListener('mouseup', () => {
  // Keep pointer tracking active -- basket stays where you left it
});

document.addEventListener('touchstart', (e) => {
  if (shell.state !== 'playing') return;
  const touch = e.touches[0];
  if (touch) {
    onPointerMove(touch.clientX, touch.clientY);
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (shell.state !== 'playing') return;
  const touch = e.touches[0];
  if (touch) {
    onPointerMove(touch.clientX, touch.clientY);
  }
}, { passive: true });

// ---- Game Over Messages ----

function getGameOverMessage(finalScore) {
  if (finalScore >= 500) return 'absolute sigma catcher';
  if (finalScore >= 300) return 'goated with the sauce';
  if (finalScore >= 150) return 'no cap that was fire';
  if (finalScore >= 80) return 'respectful grind';
  if (finalScore >= 30) return 'decent vibes';
  if (finalScore >= 10) return 'skill issue detected';
  return 'bro didnt even try';
}

// ---- Initialize ----

shell.init();
