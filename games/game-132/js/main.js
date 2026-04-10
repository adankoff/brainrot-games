/**
 * MEME LINKS -- Main Entry Point
 * NumberLink puzzle game. Connect matching numbers with paths that fill the grid.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';

import { generatePuzzle, createGameState, startDraw, extendPath, endDraw } from './numberlink.js';
import { renderGame, renderWinOverlay, getGridLayout, pixelToGrid } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

const DIFFICULTIES = {
  easy:   { cols: 5, rows: 5, pairs: 4, label: 'EASY (5x5)' },
  medium: { cols: 6, rows: 6, pairs: 6, label: 'MEDIUM (6x6)' },
  hard:   { cols: 7, rows: 7, pairs: 8, label: 'HARD (7x7)' },
};

// ---- Module state ----

let gameState = null;
let difficulty = 'easy';
let level = 1;
let startTime = 0;
let elapsed = 0;
let winTimer = 0;
let winDelay = 1500;
let audioInitialized = false;
let pointerDown = false;
let lastGridCell = null;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME LINKS',
  gameId: 'meme-links',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-links',
  subtitle: 'connect the numbers. fill the grid. no cap.',
  accentColor: '#00e5ff',
  shareUrl: 'https://brainrotgames.com/games/game-132/',
});

// ---- Register sounds ----

function ensureAudio() {
  if (audioInitialized) return;
  try {
    initAudio();
    registerSound('draw', {
      notes: [
        { type: 'sine', frequency: 440, endFrequency: 480, duration: 0.04, gain: 0.08 },
      ],
    });
    registerSound('connect', {
      notes: [
        { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.2 },
        { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.08, gain: 0.2 },
      ],
    });
    registerSound('win', {
      notes: [
        { type: 'sine', frequency: 523, duration: 0.1, gain: 0.2 },
        { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
        { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
        { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
      ],
    });
    registerSound('clear', {
      notes: [
        { type: 'sawtooth', frequency: 300, endFrequency: 200, duration: 0.1, gain: 0.1 },
      ],
    });
    audioInitialized = true;
  } catch {
    // Audio failed -- game works without it
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  const diff = DIFFICULTIES[difficulty];
  const puzzle = generatePuzzle(diff.cols, diff.rows, diff.pairs);
  gameState = createGameState(puzzle);
  startTime = performance.now();
  elapsed = 0;
  winTimer = 0;
  pointerDown = false;
  lastGridCell = null;
};

shell.onUpdate = (dt) => {
  if (!gameState) return;

  if (gameState.solved) {
    winTimer += dt * 16.67;
    if (winTimer >= winDelay) {
      shell.setState('game-over');
    }
    return;
  }

  elapsed = performance.now() - startTime;
};

shell.onRender = (ctx) => {
  const uiState = {
    level,
    elapsed,
    difficultyLabel: DIFFICULTIES[difficulty].label,
  };

  renderGame(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, gameState, uiState);

  if (gameState && gameState.solved) {
    const progress = Math.min(winTimer / winDelay, 1);
    renderWinOverlay(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, progress);
  }
};

shell.onGameOver = () => {
  const seconds = Math.floor(elapsed / 1000);
  const score = Math.max(5000 - seconds * 10, 100);

  // Advance level for next play
  level++;

  return {
    score,
    message: getWinMessage(seconds),
    scoreLabel: 'aura points',
  };
};

// ---- Initialize ----

shell.init();

// ---- Pointer / Touch Input (custom drag handling) ----

const canvas = shell.getCanvas();

function getLogicalPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (LOGICAL_WIDTH / rect.width),
    y: (clientY - rect.top) * (LOGICAL_HEIGHT / rect.height),
  };
}

function handlePointerDown(px, py) {
  ensureAudio();

  if (!gameState || gameState.solved) return;

  const layout = getGridLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT, gameState.cols, gameState.rows);
  const cell = pixelToGrid(px, py, layout, gameState.cols, gameState.rows);
  if (!cell) return;

  const pairId = startDraw(gameState, cell.r, cell.c);
  if (pairId > 0) {
    pointerDown = true;
    lastGridCell = cell;
    playSound('draw');
  }
}

function handlePointerMove(px, py) {
  if (!pointerDown || !gameState || gameState.solved) return;

  const layout = getGridLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT, gameState.cols, gameState.rows);
  const cell = pixelToGrid(px, py, layout, gameState.cols, gameState.rows);
  if (!cell) return;

  // Same cell, skip
  if (lastGridCell && cell.r === lastGridCell.r && cell.c === lastGridCell.c) return;

  const result = extendPath(gameState, cell.r, cell.c);
  lastGridCell = cell;

  switch (result) {
    case 'extended':
      playSound('draw');
      break;
    case 'connected':
      playSound('connect');
      if (gameState.solved) {
        playSound('win');
      }
      break;
    case 'backtrack':
      playSound('clear');
      break;
    default:
      break;
  }
}

function handlePointerUp() {
  if (!gameState) return;
  if (pointerDown) {
    endDraw(gameState);
    pointerDown = false;
    lastGridCell = null;
  }
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  const pos = getLogicalPos(e.clientX, e.clientY);
  handlePointerDown(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e) => {
  const pos = getLogicalPos(e.clientX, e.clientY);
  handlePointerMove(pos.x, pos.y);
});

canvas.addEventListener('mouseup', () => handlePointerUp());
canvas.addEventListener('mouseleave', () => handlePointerUp());

// Touch events
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const pos = getLogicalPos(touch.clientX, touch.clientY);
  handlePointerDown(pos.x, pos.y);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const pos = getLogicalPos(touch.clientX, touch.clientY);
  handlePointerMove(pos.x, pos.y);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  handlePointerUp();
}, { passive: false });

canvas.addEventListener('touchcancel', () => handlePointerUp());

// ---- Difficulty Selector in Menu ----

setupDifficultySelect();

function setupDifficultySelect() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    for (const [key, diff] of Object.entries(DIFFICULTIES)) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (key === difficulty) btn.classList.add('difficulty-select__btn--selected');
      btn.textContent = diff.label;
      btn.addEventListener('click', () => {
        difficulty = key;
        level = 1;
        setupDifficultySelect();
        playSound('uiclick');
      });
      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}

// ---- Helper ----

function getWinMessage(seconds) {
  if (seconds < 15) return 'speedrun any%';
  if (seconds < 30) return 'built different';
  if (seconds < 60) return 'clean links fr';
  if (seconds < 120) return 'took a minute but valid';
  return 'got there eventually';
}
