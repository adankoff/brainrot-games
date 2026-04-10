/**
 * BRAINROT NINJA -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state, theme switching,
 * 60-second timer, object spawning, slice processing, combo tracking.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { lerp } from '../../shared/utils.js';
import { THEMES, getThemeById } from './themes.js';
import { ThrowObject, SlicedHalf, createSliceParticles } from './physics.js';
import { createSliceTracker, lineIntersectsCircle } from './slicer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const GAME_DURATION_FRAMES = 60 * 60; // 60 seconds at 60fps
const BOMB_PENALTY = 10;
const COMBO_THRESHOLD = 3;
const SPAWN_INTERVAL_START = 30; // frames between spawns at start
const SPAWN_INTERVAL_END = 15;   // frames between spawns at end
const BOMB_CHANCE = 0.12;        // 12% chance each spawn is a bomb

// ---- Game State ----

const GAME_ID = 'brainrot-ninja';
let audioInitialized = false;
let lastDeathMessage = '';

/** @type {ThrowObject[]} */
let objects = [];
/** @type {SlicedHalf[]} */
let slicedHalves = [];
/** @type {Particle[]} */
let particles = [];

let score = 0;
let timer = 0; // counts up in frames
let spawnTimer = 0;
let comboCount = 0;       // objects sliced in current continuous swipe
let comboActive = false;   // whether the current swipe has started slicing
let totalSliced = 0;
let bombFlashTimer = 0;

/** @type {{ text: string, x: number, y: number, life: number }[]} */
let floatingTexts = [];

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'skibidi';
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
  theme: 'brainrot-ninja',
  subtitle: 'swipe to slice. avoid bombs.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-08/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('ninja-slice', {
    notes: [
      { type: 'sawtooth', frequency: 800, endFrequency: 1200, duration: 0.06, gain: 0.15 },
      { type: 'square', frequency: 600, endFrequency: 900, duration: 0.04, delay: 0.02, gain: 0.1 },
    ],
  });

  registerSound('ninja-combo', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.06, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.06, delay: 0.04, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.08, gain: 0.25 },
    ],
  });

  registerSound('ninja-bomb', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 60, duration: 0.3, gain: 0.3 },
      { type: 'square', frequency: 100, duration: 0.15, delay: 0.05, gain: 0.2 },
    ],
  });
}

// ---- Slice Tracker ----

let sliceTracker = null;

// ---- Helper: reset game state ----

function resetGame() {
  objects = [];
  slicedHalves = [];
  particles = [];
  floatingTexts = [];
  score = 0;
  timer = 0;
  spawnTimer = 0;
  comboCount = 0;
  comboActive = false;
  totalSliced = 0;
  bombFlashTimer = 0;
  if (sliceTracker) sliceTracker.reset();
}

// ---- Spawning ----

function getSpawnInterval() {
  const progress = timer / GAME_DURATION_FRAMES;
  return Math.round(lerp(SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, progress));
}

function spawnObject() {
  const isBomb = Math.random() < BOMB_CHANCE;
  objects.push(new ThrowObject(LOGICAL_WIDTH, LOGICAL_HEIGHT, isBomb));
}

// ---- Slice Processing ----

function processSlices(segments) {
  if (segments.length === 0) {
    // If not dragging, finalize combo
    if (!sliceTracker.getIsDragging() && comboActive) {
      finalizeCombo();
    }
    return;
  }

  let slicedThisFrame = 0;

  for (const seg of segments) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.sliced) continue;

      const hit = lineIntersectsCircle(seg.from, seg.to, obj);
      if (!hit) continue;

      obj.sliced = true;

      if (obj.isBomb) {
        // Bomb penalty
        score -= BOMB_PENALTY;
        if (score < 0) score = 0;
        bombFlashTimer = 15;
        comboCount = 0;
        comboActive = false;
        playSound('ninja-bomb');

        addFloatingText(currentTheme.bombLabel, obj.x, obj.y);

        // Still create sliced halves for visual effect
        slicedHalves.push(new SlicedHalf(obj.x, obj.y, obj.vx, obj.vy, obj.radius, true, obj.variant, true));
        slicedHalves.push(new SlicedHalf(obj.x, obj.y, obj.vx, obj.vy, obj.radius, false, obj.variant, true));
      } else {
        // Successful slice
        totalSliced++;
        slicedThisFrame++;
        comboCount++;
        comboActive = true;
        score += 1;

        playSound('ninja-slice');

        // Create two halves
        slicedHalves.push(new SlicedHalf(obj.x, obj.y, obj.vx, obj.vy, obj.radius, true, obj.variant, false));
        slicedHalves.push(new SlicedHalf(obj.x, obj.y, obj.vx, obj.vy, obj.radius, false, obj.variant, false));

        // Particles
        const newParticles = createSliceParticles(obj.x, obj.y, currentTheme.id);
        particles.push(...newParticles);
      }

      // Remove original object
      objects.splice(i, 1);
    }
  }
}

function finalizeCombo() {
  if (comboCount >= COMBO_THRESHOLD) {
    const bonus = comboCount - COMBO_THRESHOLD + 2;
    score += bonus;
    playSound('ninja-combo');
    addFloatingText(`COMBO x${comboCount}! +${bonus}`, LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 3);
  }
  comboCount = 0;
  comboActive = false;
}

function addFloatingText(text, x, y) {
  floatingTexts.push({ text, x, y, life: 1.0 });
}

// ---- Callbacks ----

shell.onStart = () => {
  resetGame();
};

shell.onUpdate = (dt) => {
  // Initialize audio on first interaction
  if (!audioInitialized && sliceTracker && sliceTracker.getIsDragging()) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed
    }
  }

  // Timer
  timer += dt;
  if (timer >= GAME_DURATION_FRAMES) {
    if (comboActive) finalizeCombo();
    shell.setState('game-over');
    return;
  }

  // Spawning
  spawnTimer += dt;
  const interval = getSpawnInterval();
  if (spawnTimer >= interval) {
    spawnTimer -= interval;
    spawnObject();
  }

  // Update objects
  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].update(dt);
    if (objects[i].isOffScreen(LOGICAL_HEIGHT)) {
      objects.splice(i, 1);
    }
  }

  // Update sliced halves
  for (let i = slicedHalves.length - 1; i >= 0; i--) {
    slicedHalves[i].update(dt);
    if (slicedHalves[i].isDead(LOGICAL_HEIGHT)) {
      slicedHalves.splice(i, 1);
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(dt);
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  // Update floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].life -= 0.015 * dt;
    floatingTexts[i].y -= 1.2 * dt;
    if (floatingTexts[i].life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // Bomb flash
  if (bombFlashTimer > 0) {
    bombFlashTimer -= dt;
    if (bombFlashTimer < 0) bombFlashTimer = 0;
  }

  // Process slicing
  if (sliceTracker) {
    const segments = sliceTracker.drainSegments();
    processSlices(segments);
    sliceTracker.updateTrail(dt);
  }
};

shell.onRender = (ctx) => {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  // Background
  currentTheme.drawBackground(ctx, W, H, timer);

  // Sliced halves (behind active objects)
  for (const half of slicedHalves) {
    ctx.save();
    ctx.globalAlpha = half.alpha;
    ctx.translate(half.x, half.y);
    ctx.rotate(half.rotation);

    // Clip to show only left or right half
    ctx.beginPath();
    if (half.isLeft) {
      ctx.rect(-half.radius * 1.5, -half.radius * 1.5, half.radius * 1.5, half.radius * 3);
    } else {
      ctx.rect(0, -half.radius * 1.5, half.radius * 1.5, half.radius * 3);
    }
    ctx.clip();

    if (half.isBomb) {
      currentTheme.drawBomb(ctx, 0, 0, half.radius);
    } else {
      currentTheme.drawObject(ctx, 0, 0, half.radius, half.variant);
    }
    ctx.restore();
  }

  // Active objects
  for (const obj of objects) {
    if (obj.sliced) continue;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation);
    if (obj.isBomb) {
      currentTheme.drawBomb(ctx, 0, 0, obj.radius);
    } else {
      currentTheme.drawObject(ctx, 0, 0, obj.radius, obj.variant);
    }
    ctx.restore();
  }

  // Slice particles
  currentTheme.drawSliceEffect(ctx, 0, 0, particles);

  // Swipe trail
  if (sliceTracker) {
    sliceTracker.renderTrail(ctx, currentTheme.trailColor);
  }

  // Bomb flash overlay
  if (bombFlashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = (bombFlashTimer / 15) * 0.4;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // HUD: Timer
  const secondsLeft = Math.max(0, Math.ceil((GAME_DURATION_FRAMES - timer) / 60));
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.9;
  ctx.fillText(`${secondsLeft}s`, 12, 12);

  // HUD: Score
  ctx.textAlign = 'right';
  ctx.fillText(`${score}`, W - 12, 12);
  ctx.font = '11px sans-serif';
  ctx.globalAlpha = 0.6;
  ctx.fillText(currentTheme.scoreLabel, W - 12, 34);
  ctx.restore();

  // HUD: Combo indicator
  if (comboActive && comboCount >= 2) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = currentTheme.accentColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText(`${comboCount}x COMBO`, W / 2, 12);
    ctx.restore();
  }

  // Floating texts
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = ft.life;
    ctx.fillStyle = currentTheme.accentColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
};

shell.onGameOver = () => {
  const message = getDeathMessage();
  return {
    score,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

// ---- Death Messages ----

function getDeathMessage() {
  const pool = currentTheme.deathMessages;
  // Substitute counts in messages
  const processed = pool.map((m) => m.replace(/\bN\b/, String(totalSliced)));
  let msg;
  do {
    msg = processed[Math.floor(Math.random() * processed.length)];
  } while (msg === lastDeathMessage && processed.length > 1);
  lastDeathMessage = msg;
  return msg;
}

// ---- Initialize ----

shell.init();

// Create slice tracker (handles its own mouse/touch events)
sliceTracker = createSliceTracker(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

// Also init audio on first tap via the menu button path
shell.getCanvas().addEventListener('pointerdown', function initOnce() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed
    }
  }
  shell.getCanvas().removeEventListener('pointerdown', initOnce);
}, { once: true });

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

        setupThemeSelector();
        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
