/**
 * FLAPPY TRALALERO -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
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
  GAP_BUFFER, OBSTACLE_TYPES, OBSTACLE_WIDTH,
  SHAKE_MAGNITUDE, SHAKE_DURATION, DEATH_DELAY,
  DEATH_MESSAGES, CHARACTER_UNLOCKS,
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
let readyTime = 0; // for idle bob animation
let lastDeathMessage = '';
let audioInitialized = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'FLAPPY TRALALERO',
  gameId: 'flappy-tralalero',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'italian-brainrot',
  subtitle: 'tap. die. share. repeat.',
  accentColor: '#ff3838',
  shareUrl: 'https://brainrotgames.com/games/game-01/',
});

// ---- Callbacks ----

shell.onStart = () => {
  internalState = 'ready';
  player = new Player();
  player.characterId = getSelectedCharacter();
  player.reset(LOGICAL_HEIGHT);
  obstacles = [];
  scoreDisplay = new ScoreDisplay();
  background.reset();
  currentScrollSpeed = BASE_SCROLL_SPEED;
  currentSpacing = BASE_SPACING;
  screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
  deathTimer = 0;
  readyTime = 0;
  tapFlag = false;
};

shell.onUpdate = (dt) => {
  // Consume tap flag
  const tapped = tapFlag;
  tapFlag = false;

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

    // Keep background/obstacles rendered but don't scroll
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
  if (
    obstacles.length === 0 ||
    obstacles[obstacles.length - 1].x < LOGICAL_WIDTH + OBSTACLE_WIDTH - currentSpacing
  ) {
    const gapSize = clamp(BASE_GAP_SIZE - scoreDisplay.score * GAP_SHRINK_PER_SCORE, MIN_GAP_SIZE, BASE_GAP_SIZE);
    const minGapY = gapSize / 2 + GAP_BUFFER;
    const maxGapY = LOGICAL_HEIGHT - FLOOR_HEIGHT - gapSize / 2 - GAP_BUFFER;
    const gapY = randomBetween(minGapY, maxGapY);
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    obstacles.push(new Obstacle(LOGICAL_WIDTH + OBSTACLE_WIDTH, gapY, gapSize, type));
  }

  // Scoring
  for (const obs of obstacles) {
    if (!obs.scored && player.x > obs.x) {
      obs.scored = true;
      obs.triggerPassEffect();
      scoreDisplay.increment();
      playSound('score');
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

  for (const obs of obstacles) {
    if (checkCollisionAABB(playerHitbox, obs.getTopHitbox())) {
      died = true;
      break;
    }
    if (checkCollisionAABB(playerHitbox, obs.getBottomHitbox(LOGICAL_HEIGHT - FLOOR_HEIGHT))) {
      died = true;
      break;
    }
  }

  // Floor collision
  if (player.y + player.height / 2 > LOGICAL_HEIGHT - FLOOR_HEIGHT) {
    died = true;
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
    // Increment death counter
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
  // Apply screen shake
  ctx.save();
  ctx.translate(screenShake.offsetX, screenShake.offsetY);

  // Background
  background.draw(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Obstacles
  for (const obs of obstacles) {
    obs.draw(ctx, LOGICAL_HEIGHT - FLOOR_HEIGHT);
  }

  // Player
  player.draw(ctx);

  // Restore screen shake
  ctx.restore();

  // HUD (not affected by screen shake)
  scoreDisplay.draw(ctx, LOGICAL_WIDTH);

  // "Tap to flap" hint in ready state
  if (internalState === 'ready') {
    drawReadyHint(ctx);
  }
};

shell.onGameOver = () => {
  const score = scoreDisplay.score;
  const message = getDeathMessage(score);
  const newlyUnlocked = checkUnlocks(score);

  // Show unlock notification in extra area
  if (newlyUnlocked.length > 0) {
    requestAnimationFrame(() => {
      const extra = document.getElementById('gameover-extra');
      if (extra) {
        extra.innerHTML = '';
        for (const id of newlyUnlocked) {
          const charDef = CHARACTERS[id];
          if (charDef) {
            const el = document.createElement('p');
            el.className = 'unlock-notification';
            el.textContent = `UNLOCKED: ${charDef.name.toUpperCase()}`;
            extra.appendChild(el);
          }
        }
      }
    });
  }

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

// ---- Character Select in Menu ----

setupCharacterSelect();

// ---- Title Tap Easter Egg (La Vaca unlock) ----

setupTitleTapEasterEgg();

// ---- Helper Functions ----

function getSelectedCharacter() {
  const selected = getData('flappy-tralalero', 'selected');
  if (selected && CHARACTERS[selected]) {
    // Verify it's unlocked
    const unlocks = JSON.parse(getData('flappy-tralalero', 'unlocks') || '{}');
    if (selected === 'tralalero' || unlocks[selected]) {
      return selected;
    }
  }
  return 'tralalero';
}

function getDeathMessage(score) {
  let tier;
  if (score >= 100) tier = 100;
  else if (score >= 50) tier = 50;
  else if (score >= 25) tier = 25;
  else if (score >= 15) tier = 15;
  else if (score >= 6) tier = 6;
  else if (score >= 1) tier = 1;
  else tier = 0;

  const pool = DEATH_MESSAGES[tier];
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;
  return msg;
}

function checkUnlocks(score) {
  const unlocks = JSON.parse(getData('flappy-tralalero', 'unlocks') || '{}');

  const conditions = {
    bombardiro: score >= 10,
    lirili: score >= 25,
    tungtung: score >= 50,
    cappuccino: score >= 100,
  };

  const newlyUnlocked = [];
  for (const [id, condition] of Object.entries(conditions)) {
    if (condition && !unlocks[id]) {
      unlocks[id] = true;
      newlyUnlocked.push(id);
    }
  }

  if (newlyUnlocked.length > 0) {
    setData('flappy-tralalero', 'unlocks', JSON.stringify(unlocks));
    // Refresh character select UI
    requestAnimationFrame(() => setupCharacterSelect());
  }

  return newlyUnlocked;
}

function incrementDeaths() {
  try {
    const deaths = parseInt(getData('flappy-tralalero', 'deaths') || '0', 10) || 0;
    setData('flappy-tralalero', 'deaths', String(deaths + 1));
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

function drawReadyHint(ctx) {
  const pulse = 0.5 + Math.sin(readyTime * 0.005) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.6;
  ctx.font = '20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('tap to flap', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 60);
  ctx.restore();
}

// ---- Character Select UI ----

function setupCharacterSelect() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'character-select';

  const unlocks = JSON.parse(getData('flappy-tralalero', 'unlocks') || '{}');
  const selected = getSelectedCharacter();

  const charIds = Object.keys(CHARACTERS);
  for (const id of charIds) {
    const charDef = CHARACTERS[id];
    const isUnlocked = id === 'tralalero' || unlocks[id];

    const icon = document.createElement('canvas');
    icon.width = 40;
    icon.height = 40;
    icon.className = 'character-select__icon';
    if (id === selected) icon.classList.add('character-select__icon--selected');
    if (!isUnlocked) icon.classList.add('character-select__icon--locked');

    // Draw mini character on icon canvas
    const iconCtx = icon.getContext('2d');
    iconCtx.save();
    iconCtx.translate(20, 20);
    iconCtx.scale(0.45, 0.45);
    if (isUnlocked) {
      charDef.draw(iconCtx, 0, false);
    } else {
      // Silhouette
      iconCtx.globalAlpha = 0.3;
      charDef.draw(iconCtx, 0, false);
      iconCtx.globalAlpha = 1;
    }
    iconCtx.restore();

    if (isUnlocked) {
      icon.addEventListener('click', () => {
        setData('flappy-tralalero', 'selected', id);
        setupCharacterSelect(); // Re-render to update selection
        playSound('uiclick');
      });
      icon.title = charDef.name;
    } else {
      const unlock = CHARACTER_UNLOCKS[id];
      if (unlock) {
        if (unlock.type === 'score') {
          icon.title = `Score ${unlock.value}+ to unlock`;
        } else if (unlock.type === 'ads') {
          icon.title = `Watch ${unlock.value} reward videos`;
        } else if (unlock.type === 'titletaps') {
          icon.title = '???';
        }
      }
    }

    container.appendChild(icon);
  }

  secondary.appendChild(container);
}

// ---- Title Tap Easter Egg ----

function setupTitleTapEasterEgg() {
  let titleTapCount = 0;

  // Wait for menu to build, then attach listener
  requestAnimationFrame(() => {
    const title = document.querySelector('.menu-screen__title');
    if (!title) return;

    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
      titleTapCount++;
      if (titleTapCount >= 10) {
        const unlocks = JSON.parse(getData('flappy-tralalero', 'unlocks') || '{}');
        if (!unlocks.lavaca) {
          unlocks.lavaca = true;
          setData('flappy-tralalero', 'unlocks', JSON.stringify(unlocks));
          // Show toast
          showToast('la vaca has been summoned.');
          // Refresh character select
          setupCharacterSelect();
          titleTapCount = 0;
        }
      }
    });
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}
