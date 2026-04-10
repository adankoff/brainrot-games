/**
 * MEME STACK -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state and theme switching.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { THEMES, getThemeById } from './themes.js';
import { StackState, LOGICAL_WIDTH, LOGICAL_HEIGHT } from './stack.js';
import { renderFrame } from './renderer.js';

// ---- Game State ----

const GAME_ID = 'meme-stack';
let stack = new StackState();
let internalState = 'ready'; // 'ready' | 'active'
let tapFlag = false;
let readyTime = 0;
let audioInitialized = false;
let lastDeathMessage = '';

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'trollface';
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
  theme: 'meme-stack',
  subtitle: 'stack memes. don\'t miss.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-16/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('stack-place', {
    notes: [
      { type: 'square', frequency: 220, endFrequency: 280, duration: 0.06, gain: 0.2 },
    ],
  });

  registerSound('stack-perfect', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.08, delay: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.12, gain: 0.25 },
    ],
  });

  registerSound('stack-slice', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.12, gain: 0.15 },
    ],
  });

  registerSound('stack-fall', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.2, delay: 0.1, gain: 0.15 },
    ],
  });
}

// ---- Callbacks ----

shell.onStart = () => {
  internalState = 'ready';
  stack = new StackState();
  readyTime = 0;
  tapFlag = false;
};

shell.onUpdate = (dt) => {
  const tapped = tapFlag;
  tapFlag = false;

  // ---- READY sub-state ----
  if (internalState === 'ready') {
    readyTime += dt * 16.67;

    // Block oscillates for preview
    stack.updateMovingBlock(dt);
    stack.updateCamera(dt);

    if (tapped) {
      internalState = 'active';
      handleDrop();
    }
    return;
  }

  // ---- ACTIVE sub-state ----
  if (stack.gameOver) {
    // Keep updating slice pieces for the falling animation
    stack.updateSlicePieces(dt);
    stack.updateComboTexts(dt);
    return;
  }

  // Update moving block
  stack.updateMovingBlock(dt);

  // Handle tap -> drop
  if (tapped) {
    handleDrop();
  }

  // Update effects
  stack.updateSlicePieces(dt);
  stack.updateComboTexts(dt);
  stack.updateFlash(dt);
  stack.updateCamera(dt);

  readyTime += dt * 16.67;
};

shell.onRender = (ctx) => {
  renderFrame(ctx, stack, currentTheme, internalState, readyTime);
};

shell.onGameOver = () => {
  const message = getDeathMessage();
  return {
    score: stack.score,
    message,
    scoreLabel: 'blocks stacked',
  };
};

// ---- Drop Logic ----

function handleDrop() {
  const result = stack.dropBlock(currentTheme.comboTexts);

  if (result.gameOver) {
    playSound('stack-fall');
    // Short delay then game over
    setTimeout(() => {
      shell.setState('game-over');
    }, 600);
    return;
  }

  if (result.placed) {
    if (result.perfect) {
      playSound('stack-perfect');
    } else {
      playSound('stack-place');
      playSound('stack-slice');
    }
  }
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

// ---- Initialize ----

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

// ---- Theme Selector in Menu ----

setupThemeSelector();

function setupThemeSelector() {
  // Wait for menu DOM to build
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
