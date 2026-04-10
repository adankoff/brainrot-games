/**
 * MEME PICROSS -- Main
 * GameShell integration, nonogram gameplay, input, sound, scoring.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generatePuzzle } from './nonogram.js';
import { render, getCellFromPos } from './renderer.js';

// ---- Constants ----
const LOGICAL_W = 400;
const LOGICAL_H = 700;
const DEFAULT_SIZE = 5;

// ---- Game State ----
const state = {
  size: DEFAULT_SIZE,
  solution: [],
  rowClues: [],
  colClues: [],
  grid: [],        // boolean[][] -- player filled cells
  crossGrid: [],   // boolean[][] -- player X-marked cells
  errorCells: [],  // boolean[][] -- cells that were errors (for display)
  timer: 0,
  errors: 0,
  won: false,
  winFlash: 0,
  highlightRow: -1,
  highlightCol: -1,
  gameActive: false,
  selectedSize: DEFAULT_SIZE,
};

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME PICROSS',
  gameId: 'meme-picross',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'picross',
  subtitle: 'solve the nonogram',
  accentColor: '#00e5ff',
  shareUrl: '',
});

let input = null;
let unsubTapAt = null;

// ---- Sound Registration ----
function registerSounds() {
  registerSound('fill', {
    notes: [
      { type: 'square', frequency: 220, endFrequency: 260, duration: 0.06, gain: 0.15 },
    ],
  });

  registerSound('cross', {
    notes: [
      { type: 'sawtooth', frequency: 600, endFrequency: 400, duration: 0.06, gain: 0.08 },
    ],
  });

  registerSound('clear', {
    notes: [
      { type: 'sine', frequency: 400, duration: 0.03, gain: 0.06 },
    ],
  });

  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 80, duration: 0.2, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.08, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Check Win Condition ----
function checkWin() {
  const size = state.size;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (state.solution[r][c] && !state.grid[r][c]) return false;
      if (!state.solution[r][c] && state.grid[r][c]) return false;
    }
  }
  return true;
}

// ---- Calculate Score ----
function calcScore() {
  const seconds = Math.floor(state.timer);
  return Math.max(8000 - seconds * 8 - state.errors * 300, 100);
}

// ---- Score Message ----
function getScoreMessage(score) {
  if (score >= 7000) return 'speedrun picross god';
  if (score >= 5000) return 'certified puzzle brain';
  if (score >= 3000) return 'not bad, not bad';
  if (score >= 1000) return 'you got there eventually';
  return 'at least you finished';
}

// ---- Handle Tap ----
function handleTapAt(pos) {
  if (!state.gameActive || state.won) return;

  initAudio();

  const cell = getCellFromPos(state, pos);
  if (!cell) return;

  const { row, col } = cell;
  state.highlightRow = row;
  state.highlightCol = col;

  // Cycle: empty -> filled -> crossed -> empty
  if (!state.grid[row][col] && !state.crossGrid[row][col]) {
    // Empty -> Filled
    state.grid[row][col] = true;

    // Check if this is an error (filling a cell that should be empty)
    if (!state.solution[row][col]) {
      state.errors++;
      state.errorCells[row][col] = true;
      playSound('error');
      // Auto-revert the error after a brief flash -- mark as cross instead
      state.grid[row][col] = false;
      state.crossGrid[row][col] = true;
    } else {
      playSound('fill');
    }
  } else if (state.grid[row][col]) {
    // Filled -> Crossed
    state.grid[row][col] = false;
    state.crossGrid[row][col] = true;
    playSound('cross');
  } else {
    // Crossed -> Empty
    state.crossGrid[row][col] = false;
    // Clear error marker too
    state.errorCells[row][col] = false;
    playSound('clear');
  }

  // Check win
  if (checkWin()) {
    state.won = true;
    state.winFlash = 1;
    state.gameActive = false;
    playSound('win');
    // Delay game-over transition for the win animation
    setTimeout(() => {
      shell.setState('game-over');
    }, 1200);
  }
}

// ---- Initialize Puzzle ----
function initPuzzle() {
  const size = state.selectedSize;
  const puzzle = generatePuzzle(size);

  state.size = size;
  state.solution = puzzle.solution;
  state.rowClues = puzzle.rowClues;
  state.colClues = puzzle.colClues;
  state.grid = Array.from({ length: size }, () => new Array(size).fill(false));
  state.crossGrid = Array.from({ length: size }, () => new Array(size).fill(false));
  state.errorCells = Array.from({ length: size }, () => new Array(size).fill(false));
  state.timer = 0;
  state.errors = 0;
  state.won = false;
  state.winFlash = 0;
  state.highlightRow = -1;
  state.highlightCol = -1;
  state.gameActive = true;
}

// ---- Build Difficulty Selector in Menu ----
function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const label = document.createElement('p');
  label.className = 'text-secondary text-sm';
  label.textContent = 'difficulty';
  label.style.marginBottom = '8px';
  secondary.appendChild(label);

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '8px';
  btnGroup.style.justifyContent = 'center';

  const sizes = [
    { size: 5, label: '5x5', name: 'easy' },
    { size: 8, label: '8x8', name: 'medium' },
    { size: 10, label: '10x10', name: 'hard' },
  ];

  for (const { size, label: sizeLabel, name } of sizes) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost';
    btn.textContent = `${sizeLabel}`;
    btn.style.fontSize = '12px';
    btn.style.padding = '6px 14px';
    btn.style.minWidth = '70px';

    if (size === state.selectedSize) {
      btn.style.borderColor = '#00e5ff';
      btn.style.color = '#00e5ff';
    }

    btn.addEventListener('click', () => {
      state.selectedSize = size;
      // Rebuild to update active state
      buildDifficultySelector();
    });

    btnGroup.appendChild(btn);
  }

  secondary.appendChild(btnGroup);
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();
  initPuzzle();

  // Set up input
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
  }
  input = createInputManager(shell.getCanvas(), LOGICAL_W, LOGICAL_H);
  unsubTapAt = input.onTapAt(handleTapAt);
};

shell.onUpdate = (dt) => {
  if (!state.gameActive) {
    // Win flash animation
    if (state.won && state.winFlash > 0) {
      state.winFlash -= dt * 0.02;
      if (state.winFlash < 0) state.winFlash = 0;
    }
    return;
  }

  const deltaSeconds = dt * (1 / 60);
  state.timer += deltaSeconds;
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
    input = null;
    unsubTapAt = null;
  }

  const score = calcScore();
  return {
    score,
    message: getScoreMessage(score),
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  render(ctx, state);
};

// ---- Init ----
shell.init();

// Build the difficulty selector after shell init builds the menu DOM
buildDifficultySelector();
