/**
 * MEME BOGGLE -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generateGrid, isAdjacent, isValidPath, getWordFromPath, scoreWord, isValidWord, findAllWords } from './boggle.js';
import { render, getTileAt } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const TOTAL_TIME = 180; // 3 minutes
const FLASH_DURATION = 0.4; // seconds (as dt-normalized frames)

// ---- Module-scoped game state ----

let grid = [];
let path = [];
let foundWords = [];
let foundWordSet = new Set();
let score = 0;
let timeLeft = TOTAL_TIME;
let flashType = ''; // 'valid' | 'invalid' | ''
let flashTimer = 0;
let currentWord = '';
let isDragging = false;
let audioInitialized = false;
let allPossibleWords = new Set();

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME BOGGLE',
  gameId: 'meme-boggle',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: '',
  subtitle: 'trace words. get points. no cap.',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-135/',
});

// ---- Register custom sounds ----

function ensureAudio() {
  if (audioInitialized) return;
  audioInitialized = true;
  initAudio();

  // Register pitched select sounds for ascending feedback
  const selectFreqs = [392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760];
  for (let i = 0; i < selectFreqs.length; i++) {
    registerSound(`select${i}`, {
      notes: [
        { type: 'sine', frequency: selectFreqs[i], duration: 0.06, gain: 0.1 },
      ],
    });
  }

  registerSound('valid', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 880, duration: 0.1, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.2, gain: 0.2 },
    ],
  });

  registerSound('finish', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 349, duration: 0.15, delay: 0.15, gain: 0.2 },
      { type: 'square', frequency: 261, duration: 0.3, delay: 0.3, gain: 0.2 },
    ],
  });
}

// ---- Input Handling (custom drag-based, not using input-manager) ----

function toLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (LOGICAL_WIDTH / rect.width),
    y: (clientY - rect.top) * (LOGICAL_HEIGHT / rect.height),
  };
}

function handlePointerDown(clientX, clientY) {
  if (shell.state !== 'playing') return;
  ensureAudio();

  const pos = toLogical(clientX, clientY);
  const tile = getTileAt(pos.x, pos.y);
  if (!tile) return;

  isDragging = true;
  path = [tile];
  currentWord = grid[tile.row][tile.col];
  playSound('select0');
}

function handlePointerMove(clientX, clientY) {
  if (!isDragging || shell.state !== 'playing') return;

  const pos = toLogical(clientX, clientY);
  const tile = getTileAt(pos.x, pos.y);
  if (!tile) return;

  const last = path[path.length - 1];

  // Same tile as last? Ignore.
  if (tile.row === last.row && tile.col === last.col) return;

  // Allow backtracking: if this tile is the second-to-last, pop the last
  if (path.length >= 2) {
    const prev = path[path.length - 2];
    if (tile.row === prev.row && tile.col === prev.col) {
      path.pop();
      currentWord = getWordFromPath(grid, path);
      return;
    }
  }

  // Must be adjacent to last tile
  if (!isAdjacent(last.row, last.col, tile.row, tile.col)) return;

  // Must not already be in path
  const alreadyInPath = path.some(p => p.row === tile.row && p.col === tile.col);
  if (alreadyInPath) return;

  path.push(tile);
  currentWord = getWordFromPath(grid, path);
  playSound(`select${Math.min(path.length - 1, 15)}`);
}

function handlePointerUp() {
  if (!isDragging) return;
  isDragging = false;

  if (path.length >= 3 && isValidPath(path)) {
    const word = getWordFromPath(grid, path);
    if (isValidWord(word) && !foundWordSet.has(word)) {
      // Valid new word
      const points = scoreWord(word);
      score += points;
      foundWords.push({ word, points });
      foundWordSet.add(word);
      flashType = 'valid';
      flashTimer = 1.0;
      playSound('valid');
    } else {
      // Invalid or duplicate
      flashType = 'invalid';
      flashTimer = 1.0;
      playSound('invalid');
    }
  } else if (path.length > 0) {
    // Too short
    flashType = 'invalid';
    flashTimer = 0.5;
  }

  path = [];
  currentWord = '';
}

function setupInput() {
  const canvas = shell.getCanvas();

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseup', () => {
    handlePointerUp();
  });
  canvas.addEventListener('mouseleave', () => {
    handlePointerUp();
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePointerUp();
  }, { passive: false });
  canvas.addEventListener('touchcancel', () => {
    handlePointerUp();
  });
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  grid = generateGrid();
  path = [];
  foundWords = [];
  foundWordSet = new Set();
  score = 0;
  timeLeft = TOTAL_TIME;
  flashType = '';
  flashTimer = 0;
  currentWord = '';
  isDragging = false;

  // Pre-compute all possible words for end-of-game stats
  allPossibleWords = findAllWords(grid);

  ensureAudio();
};

shell.onUpdate = (dt) => {
  // dt is normalized to 60fps (1.0 = one frame at 60fps)
  const dtSeconds = dt / 60;

  // Update timer
  timeLeft -= dtSeconds;
  if (timeLeft <= 0) {
    timeLeft = 0;
    playSound('finish');
    shell.setState('game-over');
    return;
  }

  // Update flash
  if (flashTimer > 0) {
    flashTimer -= dtSeconds * 3; // fade out over ~0.33s
    if (flashTimer < 0) flashTimer = 0;
  }
};

shell.onRender = (ctx) => {
  render(ctx, {
    grid,
    path,
    foundWords,
    score,
    timeLeft,
    totalTime: TOTAL_TIME,
    flashType,
    flashTimer,
    currentWord,
  });
};

shell.onGameOver = () => {
  const wordsFound = foundWords.length;
  const totalPossible = allPossibleWords.size;
  let message = '';
  if (wordsFound === 0) {
    message = 'literally zero words found. bruh.';
  } else if (wordsFound <= 5) {
    message = 'not even trying fr fr';
  } else if (wordsFound <= 15) {
    message = 'mid performance tbh';
  } else if (wordsFound <= 25) {
    message = 'lowkey valid wordsmith';
  } else {
    message = 'absolute boggle goat no cap';
  }

  return {
    score,
    message,
    scoreLabel: `${wordsFound} words found (${totalPossible} possible)`,
  };
};

// ---- Init ----

shell.init();
setupInput();

// Init audio on first user gesture on overlays
document.addEventListener('click', () => ensureAudio(), { once: true });
document.addEventListener('touchstart', () => ensureAudio(), { once: true });
