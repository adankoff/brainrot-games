/**
 * MEME 2048 -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state,
 * swipe/arrow input handling, animation state management, theme switching.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { THEMES, getThemeById } from './themes.js';
import { BoardState } from './board.js';
import { renderFrame, LOGICAL_WIDTH, LOGICAL_HEIGHT, getCellPos } from './renderer.js';

// ---- Game State ----

const GAME_ID = 'meme-2048';
let board = new BoardState();
let audioInitialized = false;
let lastDeathMessage = '';

// ---- Animation State ----

const SLIDE_DURATION_MS = 120;
const MERGE_DURATION_MS = 150;
const SPAWN_DURATION_MS = 120;

const anim = {
  /** @type {'idle'|'sliding'|'merging'} */
  phase: 'idle',
  slideProgress: 0,  // 0 -> 1 during slide
  mergeProgress: 0,  // 0 -> 1 during merge pulse
  spawnProgress: 0,  // 0 -> 1 during spawn fade-in
  moves: [],         // MoveAnim[]
  mergedIds: [],     // merged tile IDs
  spawns: [],        // SpawnAnim[]
  floatingTexts: [], // floating "+N" score popups
  frameCount: 0,     // global frame counter for aura animation
  inputQueue: [],    // buffered direction inputs
};

/**
 * Reset animation state.
 */
function resetAnim() {
  anim.phase = 'idle';
  anim.slideProgress = 0;
  anim.mergeProgress = 0;
  anim.spawnProgress = 0;
  anim.moves = [];
  anim.mergedIds = [];
  anim.spawns = [];
  anim.floatingTexts = [];
  anim.frameCount = 0;
  anim.inputQueue = [];
}

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'classic';
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
  theme: 'meme-2048',
  subtitle: 'merge memes. reach 2048.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-20/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('merge', {
    notes: [
      { type: 'sine', frequency: 330, endFrequency: 440, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 440, endFrequency: 550, duration: 0.06, delay: 0.05, gain: 0.15 },
    ],
  });

  registerSound('slide', {
    notes: [
      { type: 'square', frequency: 200, endFrequency: 250, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('spawn', {
    notes: [
      { type: 'sine', frequency: 500, duration: 0.05, gain: 0.1 },
    ],
  });

  registerSound('gameover', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 100, duration: 0.4, gain: 0.15 },
      { type: 'square', frequency: 100, endFrequency: 60, duration: 0.3, delay: 0.2, gain: 0.1 },
    ],
  });
}

// ---- Callbacks ----

shell.onStart = () => {
  board = new BoardState();
  resetAnim();
};

shell.onUpdate = (dt) => {
  const dtMs = dt * 16.67;
  anim.frameCount++;

  // Update floating texts
  for (const ft of anim.floatingTexts) {
    ft.timer -= dt;
  }
  anim.floatingTexts = anim.floatingTexts.filter((ft) => ft.timer > 0);

  // Animation state machine
  if (anim.phase === 'sliding') {
    anim.slideProgress += dtMs / SLIDE_DURATION_MS;
    if (anim.slideProgress >= 1) {
      anim.slideProgress = 1;
      // Transition to merge/spawn phase
      anim.phase = 'merging';
      anim.mergeProgress = 0;
      anim.spawnProgress = 0;
      anim.mergedIds = board.lastMergedIds;
      anim.spawns = board.lastSpawns;

      if (anim.mergedIds.length > 0) {
        playSound('merge');
      }
      playSound('spawn');
    }
    return;
  }

  if (anim.phase === 'merging') {
    const increment = dtMs / MERGE_DURATION_MS;
    anim.mergeProgress += increment;
    anim.spawnProgress += dtMs / SPAWN_DURATION_MS;

    if (anim.mergeProgress >= 1 && anim.spawnProgress >= 1) {
      anim.phase = 'idle';
      anim.moves = [];
      anim.mergedIds = [];
      anim.spawns = [];

      // Check game over
      if (board.gameOver) {
        playSound('gameover');
        setTimeout(() => {
          shell.setState('game-over');
        }, 300);
        return;
      }

      // Process queued input
      processNextInput();
    }
    return;
  }

  // Idle: process input immediately
  processNextInput();
};

shell.onRender = (ctx) => {
  renderFrame(ctx, board, currentTheme, anim);
};

shell.onGameOver = () => {
  const message = getDeathMessage();
  return {
    score: board.score,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

shell.onGameOverRender = (ctx) => {
  renderFrame(ctx, board, currentTheme, anim);
};

// ---- Input Processing ----

/**
 * Queue a direction input.
 *
 * @param {'left'|'right'|'up'|'down'} direction
 */
function queueInput(direction) {
  // Limit queue size to prevent input spam
  if (anim.inputQueue.length < 3) {
    anim.inputQueue.push(direction);
  }
}

/**
 * Process the next queued input if we're in idle state.
 */
function processNextInput() {
  if (anim.phase !== 'idle') return;
  if (anim.inputQueue.length === 0) return;
  if (board.gameOver) return;

  const direction = anim.inputQueue.shift();
  const moved = board.move(direction);

  if (moved) {
    playSound('slide');

    // Set up slide animation
    anim.phase = 'sliding';
    anim.slideProgress = 0;
    anim.moves = board.lastMoves;

    // Add floating score text if there was a merge
    if (board.lastMoveScore > 0) {
      // Find the center of the merge (use first merged tile position)
      const firstMerge = anim.moves.find((m) => m.merged);
      if (firstMerge) {
        const pos = getCellPos(firstMerge.toRow, firstMerge.toCol);
        anim.floatingTexts.push({
          text: `+${board.lastMoveScore}`,
          x: pos.x + 41, // center of cell
          y: pos.y + 20,
          timer: 45,
          maxTimer: 45,
        });
      }
    }
  }
}

// ---- Swipe Detection ----

let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;
const SWIPE_THRESHOLD = 30;

function handleTouchStart(e) {
  if (shell.state !== 'playing') return;
  e.preventDefault();
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
}

function handleTouchEnd(e) {
  if (!touchActive) return;
  touchActive = false;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

  ensureAudio();

  if (absDx > absDy) {
    queueInput(dx > 0 ? 'right' : 'left');
  } else {
    queueInput(dy > 0 ? 'down' : 'up');
  }
}

function handleMouseDown(e) {
  if (shell.state !== 'playing') return;
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  touchActive = true;
}

function handleMouseUp(e) {
  if (!touchActive) return;
  touchActive = false;
  const dx = e.clientX - touchStartX;
  const dy = e.clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

  if (absDx > absDy) {
    queueInput(dx > 0 ? 'right' : 'left');
  } else {
    queueInput(dy > 0 ? 'down' : 'up');
  }
}

function handleKeyDown(e) {
  if (shell.state !== 'playing') return;
  ensureAudio();

  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      e.preventDefault();
      queueInput('left');
      break;
    case 'ArrowRight':
    case 'KeyD':
      e.preventDefault();
      queueInput('right');
      break;
    case 'ArrowUp':
    case 'KeyW':
      e.preventDefault();
      queueInput('up');
      break;
    case 'ArrowDown':
    case 'KeyS':
      e.preventDefault();
      queueInput('down');
      break;
  }
}

// ---- Audio Init ----

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

// Input: swipe + arrow keys
const canvas = shell.getCanvas();

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('keydown', handleKeyDown);

// Also use InputManager for tap (audio init on any interaction)
const input = createInputManager(canvas, LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTap(() => {
  ensureAudio();
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
