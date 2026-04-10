/**
 * SLICE THE BRAINROT -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state, timer, spawning, combos.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { randomInt, formatScore } from '../../shared/utils.js';
import { THEMES, getThemeById } from './themes.js';
import {
  LOGICAL_WIDTH, LOGICAL_HEIGHT, GAME_DURATION,
  createObject, createSlicedHalves, updateObject, updateHalf,
  createSplatterParticles, updateParticle, createFloatingText, updateFloatingText,
  createSplatterStain, createSparkleParticles, getDifficultyParams,
} from './physics.js';
import { createSlicer, lineCircleIntersect, segmentAngle } from './slicer.js';

// ---- Game Constants ----

const GAME_ID = 'slice-brainrot';

// ---- Game State ----

let score = 0;
let combo = 0;
let bestCombo = 0;
let objectsSliced = 0;
let timeLeft = GAME_DURATION;
let spawnTimer = 0;
let audioInitialized = false;
let lastDeathMessage = '';
let bombFlashText = '';
let bombFlashTimer = 0;
let brainrotTimeActive = false;
let brainrotTimeTimer = 0;
let perfectComboCount = 0;
let freezeTimer = 0; // sus theme emergency meeting freeze
let swipeHitCount = 0; // hits in current drag gesture
let wasDragging = false; // track swipe end

/** @type {Array<Object>} Active objects in the air */
let objects = [];

/** @type {Array<Object>} Sliced halves falling */
let halves = [];

/** @type {Array<Object>} Splatter particles (temporary) */
let particles = [];

/** @type {Array<Object>} Floating score texts */
let floatingTexts = [];

/** @type {Array<Object>} Persistent splatter stains (Grimace accumulation) */
let stains = [];

/** @type {Object|null} Slicer instance */
let slicer = null;

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'grimace';
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
  theme: 'slice-brainrot',
  subtitle: 'swipe to slice. avoid the bombs.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-09/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('slice', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 800, duration: 0.08, gain: 0.15 },
      { type: 'square', frequency: 600, endFrequency: 900, duration: 0.05, delay: 0.02, gain: 0.1 },
    ],
  });

  registerSound('slice-combo', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.06, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.06, delay: 0.04, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.08, gain: 0.25 },
    ],
  });

  registerSound('bomb-hit', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 60, duration: 0.3, gain: 0.25 },
      { type: 'square', frequency: 80, duration: 0.15, delay: 0.05, gain: 0.2 },
    ],
  });

  registerSound('imposter-slice', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 1320, duration: 0.1, delay: 0.12, gain: 0.25 },
    ],
  });
}

// ---- Reset ----

function resetGame() {
  score = 0;
  combo = 0;
  bestCombo = 0;
  objectsSliced = 0;
  timeLeft = GAME_DURATION;
  spawnTimer = 0;
  bombFlashText = '';
  bombFlashTimer = 0;
  brainrotTimeActive = false;
  brainrotTimeTimer = 0;
  perfectComboCount = 0;
  freezeTimer = 0;
  swipeHitCount = 0;
  wasDragging = false;
  objects = [];
  halves = [];
  particles = [];
  floatingTexts = [];
  stains = [];
}

// ---- Callbacks ----

shell.onStart = () => {
  resetGame();
};

shell.onUpdate = (dt) => {
  if (!slicer) return;

  // Timer
  const timeStep = dt * (1 / 60);
  timeLeft -= timeStep;
  if (timeLeft <= 0) {
    timeLeft = 0;
    shell.setState('game-over');
    return;
  }

  // Bomb flash timer
  if (bombFlashTimer > 0) {
    bombFlashTimer -= dt;
  }

  // Brainrot time (slow-mo bonus)
  if (brainrotTimeActive) {
    brainrotTimeTimer -= dt;
    if (brainrotTimeTimer <= 0) {
      brainrotTimeActive = false;
    }
    // Halve the effective dt during brainrot time
    dt *= 0.5;
  }

  // Emergency meeting freeze (sus theme)
  if (freezeTimer > 0) {
    freezeTimer -= dt;
    // Don't update objects during freeze, but still update slicer + effects
    slicer.update(dt);
    updateEffects(dt);
    return;
  }

  // Spawning
  const elapsed = GAME_DURATION - timeLeft;
  const diff = getDifficultyParams(elapsed);
  spawnTimer -= timeStep;
  if (spawnTimer <= 0) {
    spawnTimer = diff.spawnInterval;
    spawnWave(diff);
  }

  // Update slicer
  slicer.update(dt);

  // Process swipe segments for hit detection
  const segments = slicer.consumeSegments();
  const currentlyDragging = slicer.isDragging();
  let frameHits = 0;

  for (const seg of segments) {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (!obj.alive || obj.sliced) continue;

      if (lineCircleIntersect(seg.x, seg.y, seg.x2, seg.y2, obj.x, obj.y, obj.radius)) {
        const angle = segmentAngle(seg.x, seg.y, seg.x2, seg.y2);
        handleSlice(obj, angle);
        frameHits++;
      }
    }
  }

  // Accumulate hits during this swipe gesture
  swipeHitCount += frameHits;
  combo += frameHits;
  if (combo > bestCombo) bestCombo = combo;

  // Detect swipe end: was dragging last frame, not dragging now
  if (wasDragging && !currentlyDragging) {
    // Evaluate combo bonus for the completed swipe
    if (swipeHitCount >= 3) {
      const comboBonus = swipeHitCount * 2;
      score += comboBonus;
      floatingTexts.push(createFloatingText(
        LOGICAL_WIDTH / 2,
        LOGICAL_HEIGHT / 2 - 40,
        `COMBO x${swipeHitCount}! +${comboBonus}`,
        currentTheme.trailColor,
      ));
      playSound('slice-combo');
    }

    // Track perfect combos for brainrot time
    if (swipeHitCount >= 4) {
      perfectComboCount++;
      if (perfectComboCount >= 3 && !brainrotTimeActive) {
        brainrotTimeActive = true;
        brainrotTimeTimer = 120; // ~2 seconds at 60fps
        perfectComboCount = 0;
        floatingTexts.push(createFloatingText(
          LOGICAL_WIDTH / 2,
          LOGICAL_HEIGHT / 3,
          'BRAINROT TIME!',
          '#FFD700',
        ));
      }
    }

    swipeHitCount = 0;
    combo = 0;
  }

  // Track drag state for next frame
  wasDragging = currentlyDragging;

  // Update objects
  for (const obj of objects) {
    if (obj.alive && !obj.sliced) {
      updateObject(obj, dt);
    }
  }
  objects = objects.filter((o) => o.alive);

  // Update effects
  updateEffects(dt);
};

function updateEffects(dt) {
  // Update halves
  for (const h of halves) {
    updateHalf(h, dt);
  }
  halves = halves.filter((h) => h.life > 0);

  // Update particles
  for (const p of particles) {
    updateParticle(p, dt);
  }
  particles = particles.filter((p) => p.life > 0);

  // Update floating texts
  for (const ft of floatingTexts) {
    updateFloatingText(ft, dt);
  }
  floatingTexts = floatingTexts.filter((ft) => ft.life > 0);
}

// ---- Slice Handling ----

function handleSlice(obj, angle) {
  obj.sliced = true;
  obj.alive = false;

  if (obj.type === 'bomb') {
    // Bomb hit: lose combo, show flash
    combo = 0;
    bombFlashText = currentTheme.bombFlash;
    bombFlashTimer = 45; // ~0.75s

    // Sus theme: freeze all objects
    if (currentTheme.id === 'sus') {
      freezeTimer = 60; // ~1 second freeze
    }

    playSound('bomb-hit');
    return;
  }

  // Score calculation
  let points = 1;
  let pointText = '+1';

  if (obj.type === 'imposter') {
    points = 3;
    pointText = '+3 SUS!';
    playSound('imposter-slice');
  } else {
    playSound('slice');
  }

  score += points;
  objectsSliced++;

  // Create sliced halves
  const newHalves = createSlicedHalves(obj, angle);
  halves.push(...newHalves);

  // Create effects based on theme
  if (currentTheme.id === 'grimace') {
    // Purple splatter
    const splatters = createSplatterParticles(obj.x, obj.y, currentTheme.getSplatterColor(), 18);
    particles.push(...splatters);
    // Persistent stain
    stains.push(createSplatterStain(obj.x, obj.y, currentTheme.getSplatterColor()));
  } else if (currentTheme.id === 'looksmaxxing') {
    // Sparkle/glow-up
    const sparkles = createSparkleParticles(obj.x, obj.y, 15);
    particles.push(...sparkles);
  } else {
    // Sus theme: colored blood
    const color = currentTheme.getSplatterColor(obj.seed);
    const splatters = createSplatterParticles(obj.x, obj.y, color, 15);
    particles.push(...splatters);
  }

  // Floating score text
  floatingTexts.push(createFloatingText(obj.x, obj.y - 20, pointText, currentTheme.trailColor));
}

// ---- Spawning ----

function spawnWave(diff) {
  const count = randomInt(diff.minObjects, diff.maxObjects);
  let hasBomb = false;

  for (let i = 0; i < count; i++) {
    let type = 'normal';

    // Bomb chance
    if (!hasBomb && Math.random() < diff.bombChance) {
      type = 'bomb';
      hasBomb = true;
    } else if (currentTheme.id === 'sus' && Math.random() < diff.imposterChance) {
      type = 'imposter';
    }

    const obj = createObject(type, randomInt(0, 999));
    objects.push(obj);
  }
}

// ---- Rendering ----

shell.onRender = (ctx) => {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  // Background
  currentTheme.drawBackground(ctx, W, H, timeLeft, GAME_DURATION, score);

  // Persistent stains (Grimace theme accumulation)
  if (stains.length > 0) {
    for (const stain of stains) {
      ctx.save();
      ctx.globalAlpha = stain.alpha;
      ctx.fillStyle = stain.color;
      ctx.beginPath();
      ctx.arc(stain.x, stain.y, stain.radius, 0, Math.PI * 2);
      ctx.fill();

      // Drip effect
      ctx.beginPath();
      ctx.ellipse(stain.x, stain.y + stain.radius * 1.2, stain.radius * 0.3, stain.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw objects
  for (const obj of objects) {
    if (!obj.alive || obj.sliced) continue;

    ctx.save();

    if (obj.type === 'bomb') {
      currentTheme.drawBomb(ctx, obj.x, obj.y, obj.radius);
    } else if (obj.type === 'imposter' && currentTheme.drawImposter) {
      currentTheme.drawImposter(ctx, obj.x, obj.y, obj.radius, obj.seed, obj.showTell);
    } else {
      currentTheme.drawObject(ctx, obj.x, obj.y, obj.radius, obj.seed);
    }

    ctx.restore();
  }

  // Draw sliced halves as smaller tumbling pieces
  for (const half of halves) {
    ctx.save();
    ctx.globalAlpha = half.alpha;
    ctx.translate(half.x, half.y);
    ctx.rotate(half.rotation);
    ctx.translate(-half.x, -half.y);

    if (half.type === 'imposter' && currentTheme.drawImposter) {
      currentTheme.drawImposter(ctx, half.x, half.y, half.radius, half.seed, false);
    } else {
      currentTheme.drawObject(ctx, half.x, half.y, half.radius, half.seed);
    }

    ctx.restore();
  }

  // Draw particles
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.sparkle) {
      // Sparkle: draw a 4-pointed star
      drawStar(ctx, p.x, p.y, p.radius);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Swipe trail
  if (slicer) {
    slicer.renderTrail(ctx, currentTheme.trailColor);
  }

  // Floating texts
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 16px "Bungee", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // Bomb flash overlay
  if (bombFlashTimer > 0) {
    const flashAlpha = Math.min(1, bombFlashTimer / 20);
    ctx.save();
    ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha * 0.2})`;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#FF1744';
    ctx.font = 'bold 22px "Bungee", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(bombFlashText, W / 2, H / 2);
    ctx.restore();
  }

  // Brainrot time overlay
  if (brainrotTimeActive) {
    ctx.save();
    const pulseAlpha = 0.08 + Math.sin(Date.now() * 0.01) * 0.04;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.008) * 0.3;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px "Bungee", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText('BRAINROT TIME', W / 2, 80);
    ctx.restore();
  }

  // Freeze overlay (sus emergency meeting)
  if (freezeTimer > 0) {
    ctx.save();
    const freezeAlpha = Math.min(1, freezeTimer / 20);
    ctx.fillStyle = `rgba(255, 255, 0, ${freezeAlpha * 0.1})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = freezeAlpha;
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 20px "Bungee", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText('EMERGENCY MEETING!', W / 2, H / 2);
    ctx.restore();
  }

  // HUD: score, timer, combo
  drawHUD(ctx, W, H);
};

// ---- HUD ----

function drawHUD(ctx, W, H) {
  ctx.save();

  // Timer bar at top
  const timerFraction = timeLeft / GAME_DURATION;
  const barWidth = W - 20;
  const barHeight = 6;
  const barX = 10;
  const barY = 10;

  // Background bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Fill bar
  const timerColor = timerFraction > 0.3 ? currentTheme.trailColor : '#FF1744';
  ctx.fillStyle = timerColor;
  ctx.fillRect(barX, barY, barWidth * timerFraction, barHeight);

  // Timer text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(Math.ceil(timeLeft) + 's', W - 12, barY + barHeight + 16);

  // Score
  ctx.fillStyle = currentTheme.trailColor;
  ctx.font = 'bold 28px "Bungee", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(formatScore(score), 12, barY + barHeight + 38);

  // Score label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '10px "Space Grotesk", sans-serif';
  ctx.fillText(currentTheme.scoreLabel, 12, barY + barHeight + 52);

  // Combo indicator
  if (combo >= 3) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px "Bungee", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${combo} COMBO`, W / 2, H - 20);
  }

  ctx.restore();
}

// ---- Helper: Draw 4-pointed star ----

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const sx = x + Math.cos(angle) * radius;
    const sy = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
}

// ---- Game Over ----

shell.onGameOver = () => {
  const message = getDeathMessage();
  return {
    score,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

function getDeathMessage() {
  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;

  // Replace [X] placeholders with score
  return msg.replace(/\[X\]/g, String(objectsSliced));
}

// ---- Initialize ----

shell.init();

// Create slicer bound to the canvas
slicer = createSlicer(shell.getCanvas());

// Audio init on first user gesture
function initAudioOnce() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game works without it
    }
  }
}

// Listen for first interaction to init audio
shell.getCanvas().addEventListener('mousedown', initAudioOnce, { once: true });
shell.getCanvas().addEventListener('touchstart', initAudioOnce, { once: true });

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
