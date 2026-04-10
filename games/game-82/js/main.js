/**
 * MEME SUDOKU -- Main Game Module
 * GameShell setup, state management, input handling, game loop.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generatePuzzle, isComplete, getHint } from './sudoku.js';
import { render, hitTestGrid, hitTestNumberPad, hitTestErase, hitTestHint } from './renderer.js';

// ---- Constants ----
const LOGICAL_W = 400;
const LOGICAL_H = 700;

// ---- Game State ----
let grid = [];
let solution = [];
let given = [];
let errors = [];
let selectedRow = -1;
let selectedCol = -1;
let selectedNumber = 0;
let elapsed = 0;
let errorCount = 0;
let hintsUsed = 0;
let completed = false;
let difficulty = 'medium';
let generating = false;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME SUDOKU',
  gameId: 'meme-sudoku',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'sudoku',
  subtitle: 'fill the grid. no cap.',
  accentColor: '#00e5ff',
  shareUrl: '',
});

// ---- Register Sounds ----
function registerGameSounds() {
  registerSound('select', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.04, gain: 0.08 },
    ],
  });
  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 880, duration: 0.04, delay: 0.04, gain: 0.08 },
    ],
  });
  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 120, duration: 0.2, gain: 0.2 },
    ],
  });
  registerSound('complete', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
  registerSound('erase', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 330, duration: 0.08, gain: 0.1 },
    ],
  });
  registerSound('hint', {
    notes: [
      { type: 'sine', frequency: 784, duration: 0.06, gain: 0.1 },
      { type: 'sine', frequency: 1047, duration: 0.06, delay: 0.06, gain: 0.1 },
    ],
  });
}

// ---- Callbacks ----

shell.onStart = () => {
  initAudio();
  registerGameSounds();

  // Reset state
  selectedRow = -1;
  selectedCol = -1;
  selectedNumber = 0;
  elapsed = 0;
  errorCount = 0;
  hintsUsed = 0;
  completed = false;

  // Generate puzzle (may take a moment for hard difficulty)
  generating = true;
  // Use setTimeout to allow the frame to paint before heavy computation
  setTimeout(() => {
    const puzzle = generatePuzzle(difficulty);
    grid = puzzle.grid;
    solution = puzzle.solution;
    given = puzzle.given;
    errors = Array.from({ length: 9 }, () => new Array(9).fill(false));
    generating = false;
  }, 50);
};

shell.onUpdate = (dt) => {
  if (generating || completed) return;
  // dt=1.0 at 60fps => 1/60 second per frame
  elapsed += dt / 60;
};

shell.onRender = (ctx) => {
  if (generating) {
    // Show loading screen
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.font = '600 18px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('generating puzzle...', LOGICAL_W / 2, LOGICAL_H / 2);
    return;
  }

  render(ctx, {
    grid,
    solution,
    given,
    selectedRow,
    selectedCol,
    selectedNumber,
    errors,
    elapsed,
    errorCount,
    hintsUsed,
    completed,
  });
};

shell.onGameOver = () => {
  const seconds = Math.floor(elapsed);
  const score = Math.max(10000 - seconds * 10 - errorCount * 200, 100);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
  return {
    score,
    message: `completed in ${timeStr} with ${errorCount} error${errorCount !== 1 ? 's' : ''} (${difficulty})`,
    scoreLabel: 'score',
  };
};

// ---- Input Handling ----

function handleTapAt({ x, y }) {
  if (generating || completed) return;

  // Check grid tap
  const cell = hitTestGrid(x, y);
  if (cell) {
    initAudio();
    if (cell.row === selectedRow && cell.col === selectedCol) {
      // Deselect
      selectedRow = -1;
      selectedCol = -1;
    } else {
      selectedRow = cell.row;
      selectedCol = cell.col;
      playSound('select');
    }
    return;
  }

  // Check number pad tap
  const num = hitTestNumberPad(x, y);
  if (num) {
    initAudio();
    selectedNumber = num;
    placeNumber(num);
    return;
  }

  // Check erase button
  if (hitTestErase(x, y)) {
    initAudio();
    eraseCell();
    return;
  }

  // Check hint button
  if (hitTestHint(x, y)) {
    initAudio();
    useHint();
    return;
  }
}

function placeNumber(num) {
  if (selectedRow < 0 || selectedCol < 0) return;
  if (given[selectedRow][selectedCol]) return; // can't overwrite given

  grid[selectedRow][selectedCol] = num;

  // Check correctness
  if (num !== solution[selectedRow][selectedCol]) {
    errors[selectedRow][selectedCol] = true;
    errorCount++;
    playSound('error');
  } else {
    errors[selectedRow][selectedCol] = false;
    playSound('place');

    // Check completion
    if (isComplete(grid, solution)) {
      completed = true;
      playSound('complete');
      setTimeout(() => {
        shell.setState('game-over');
      }, 1500);
    }
  }
}

function eraseCell() {
  if (selectedRow < 0 || selectedCol < 0) return;
  if (given[selectedRow][selectedCol]) return;
  if (grid[selectedRow][selectedCol] === 0) return;

  grid[selectedRow][selectedCol] = 0;
  errors[selectedRow][selectedCol] = false;
  playSound('erase');
}

function useHint() {
  const hint = getHint(grid, solution, given);
  if (!hint) return;

  grid[hint.row][hint.col] = hint.value;
  errors[hint.row][hint.col] = false;
  hintsUsed++;
  selectedRow = hint.row;
  selectedCol = hint.col;
  playSound('hint');

  // Check completion after hint
  if (isComplete(grid, solution)) {
    completed = true;
    playSound('complete');
    setTimeout(() => {
      shell.setState('game-over');
    }, 1500);
  }
}

// ---- Keyboard Support ----

function handleKeyDown(e) {
  if (shell.state !== 'playing' || generating || completed) return;

  const key = e.key;

  // Number keys 1-9
  if (key >= '1' && key <= '9') {
    e.preventDefault();
    initAudio();
    const num = parseInt(key, 10);
    selectedNumber = num;
    placeNumber(num);
    return;
  }

  // Arrow keys for navigation
  if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
    e.preventDefault();
    initAudio();
    if (selectedRow < 0) {
      selectedRow = 4;
      selectedCol = 4;
    } else {
      if (key === 'ArrowUp') selectedRow = Math.max(0, selectedRow - 1);
      if (key === 'ArrowDown') selectedRow = Math.min(8, selectedRow + 1);
      if (key === 'ArrowLeft') selectedCol = Math.max(0, selectedCol - 1);
      if (key === 'ArrowRight') selectedCol = Math.min(8, selectedCol + 1);
    }
    playSound('select');
    return;
  }

  // Delete/Backspace to erase
  if (key === 'Delete' || key === 'Backspace') {
    e.preventDefault();
    initAudio();
    eraseCell();
    return;
  }

  // H for hint
  if (key === 'h' || key === 'H') {
    e.preventDefault();
    initAudio();
    useHint();
    return;
  }
}

document.addEventListener('keydown', handleKeyDown);

// ---- Difficulty Selector (injected into menu) ----

function setupDifficultySelector() {
  const menuVisual = document.getElementById('menu-visual');
  if (!menuVisual || menuVisual.querySelector('.difficulty-selector')) return;

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const difficulties = ['easy', 'medium', 'hard'];
  for (const diff of difficulties) {
    const btn = document.createElement('button');
    btn.textContent = diff;
    btn.className = diff === difficulty ? 'active' : '';
    btn.addEventListener('click', () => {
      difficulty = diff;
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  }

  menuVisual.appendChild(container);
}

// ---- Init ----

shell.init();
setupDifficultySelector();

const inputMgr = createInputManager(
  document.getElementById('game-canvas'),
  LOGICAL_W,
  LOGICAL_H,
);
inputMgr.onTapAt(handleTapAt);
