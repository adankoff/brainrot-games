/**
 * MEME KAKURO -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  getRandomPuzzle, findRuns, findConflicts, isSolved, isFillCell,
} from './kakuro.js';
import { renderGame, hitTestGrid, hitTestPad } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

// ---- Module State ----

let currentPuzzle = null;
let currentPuzzleIndex = -1;
let playerGrid = [];
let runs = [];
let selectedRow = -1;
let selectedCol = -1;
let selectedDigit = 0;
let conflicts = new Set();
let timer = 0;
let errors = 0;
let completed = false;
let completionDelay = 0;
let audioInitialized = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME KAKURO',
  gameId: 'meme-kakuro',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'kakuro',
  subtitle: 'fill cells. sum runs. no cap.',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-138/',
});

// ---- Callbacks ----

shell.onStart = () => {
  const { puzzle, index } = getRandomPuzzle(currentPuzzleIndex);
  currentPuzzle = puzzle;
  currentPuzzleIndex = index;
  runs = findRuns(puzzle);

  // Initialize empty player grid
  playerGrid = [];
  for (let r = 0; r < puzzle.rows; r++) {
    playerGrid.push([]);
    for (let c = 0; c < puzzle.cols; c++) {
      playerGrid[r].push(0);
    }
  }

  selectedRow = -1;
  selectedCol = -1;
  selectedDigit = 0;
  conflicts = new Set();
  timer = 0;
  errors = 0;
  completed = false;
  completionDelay = 0;

  // Select the first fill cell
  selectFirstFillCell();
};

shell.onUpdate = (dt) => {
  if (completed) {
    completionDelay += dt * 16.67;
    if (completionDelay >= 2500) {
      shell.setState('game-over');
    }
    return;
  }

  timer += dt * 16.67 / 1000;
};

shell.onRender = (ctx) => {
  if (!currentPuzzle) return;

  renderGame(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, {
    puzzle: currentPuzzle,
    playerGrid,
    selectedRow,
    selectedCol,
    conflicts,
    timer,
    errors,
    completed,
    puzzleName: currentPuzzle.name,
    selectedDigit,
  });
};

shell.onGameOver = () => {
  const seconds = Math.floor(timer);
  const score = Math.max(8000 - seconds * 5 - errors * 200, 100);

  const messages = [
    'absolutely bussin',
    'certified brain moment',
    'kakuro king behavior',
    'main character energy',
    'the grid fears you',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    score,
    message,
    scoreLabel: 'brain points',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!currentPuzzle) return;
  renderGame(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, {
    puzzle: currentPuzzle,
    playerGrid,
    selectedRow: -1,
    selectedCol: -1,
    conflicts: new Set(),
    timer,
    errors,
    completed: true,
    puzzleName: currentPuzzle.name,
    selectedDigit: 0,
  });
};

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();

  if (shell.state !== 'playing' || completed) return;

  // Check grid tap
  const gridHit = hitTestGrid(currentPuzzle, LOGICAL_WIDTH, LOGICAL_HEIGHT, pos.x, pos.y);
  if (gridHit) {
    selectedRow = gridHit.row;
    selectedCol = gridHit.col;
    playSound('select');

    // If a digit is selected, place it
    if (selectedDigit > 0) {
      placeDigit(selectedDigit);
    }
    return;
  }

  // Check pad tap
  const padHit = hitTestPad(LOGICAL_WIDTH, LOGICAL_HEIGHT, pos.x, pos.y, currentPuzzle);
  if (padHit !== null) {
    if (typeof padHit === 'number') {
      selectedDigit = padHit;
      playSound('select');

      // If a cell is selected, place the digit
      if (selectedRow >= 0 && selectedCol >= 0) {
        placeDigit(padHit);
      }
    } else if (padHit === 'CLR') {
      selectedDigit = 0;
      if (selectedRow >= 0 && selectedCol >= 0) {
        playerGrid[selectedRow][selectedCol] = 0;
        conflicts = findConflicts(runs, playerGrid);
        playSound('select');
      }
    } else if (padHit === 'CHECK') {
      checkPuzzle();
    }
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (shell.state !== 'playing' || completed) return;

  const digit = parseInt(e.key, 10);
  if (digit >= 1 && digit <= 9) {
    ensureAudio();
    selectedDigit = digit;
    if (selectedRow >= 0 && selectedCol >= 0) {
      placeDigit(digit);
    }
    return;
  }

  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    ensureAudio();
    selectedDigit = 0;
    if (selectedRow >= 0 && selectedCol >= 0) {
      playerGrid[selectedRow][selectedCol] = 0;
      conflicts = findConflicts(runs, playerGrid);
    }
    return;
  }

  // Arrow key navigation
  if (e.key.startsWith('Arrow') && selectedRow >= 0 && selectedCol >= 0) {
    e.preventDefault();
    ensureAudio();
    let nr = selectedRow;
    let nc = selectedCol;

    if (e.key === 'ArrowUp') nr--;
    else if (e.key === 'ArrowDown') nr++;
    else if (e.key === 'ArrowLeft') nc--;
    else if (e.key === 'ArrowRight') nc++;

    // Find nearest fill cell in that direction
    if (nr >= 0 && nr < currentPuzzle.rows && nc >= 0 && nc < currentPuzzle.cols) {
      if (isFillCell(currentPuzzle.grid[nr][nc])) {
        selectedRow = nr;
        selectedCol = nc;
        playSound('select');
      }
    }
    return;
  }

  if (e.key === 'Enter') {
    ensureAudio();
    checkPuzzle();
  }
});

// ---- Helpers ----

function placeDigit(digit) {
  if (selectedRow < 0 || selectedCol < 0) return;
  if (!isFillCell(currentPuzzle.grid[selectedRow][selectedCol])) return;

  playerGrid[selectedRow][selectedCol] = digit;
  conflicts = findConflicts(runs, playerGrid);

  if (conflicts.has(`${selectedRow},${selectedCol}`)) {
    playSound('error');
    errors++;
  } else {
    playSound('place');
  }

  // Auto-check if all cells filled
  if (isSolved(currentPuzzle, playerGrid, runs)) {
    completed = true;
    completionDelay = 0;
    playSound('complete');
  }
}

function checkPuzzle() {
  conflicts = findConflicts(runs, playerGrid);

  if (conflicts.size > 0) {
    errors++;
    playSound('error');
  } else if (isSolved(currentPuzzle, playerGrid, runs)) {
    completed = true;
    completionDelay = 0;
    playSound('complete');
  } else {
    // Not all filled, but no conflicts so far
    playSound('select');
  }
}

function selectFirstFillCell() {
  for (let r = 0; r < currentPuzzle.rows; r++) {
    for (let c = 0; c < currentPuzzle.cols; c++) {
      if (isFillCell(currentPuzzle.grid[r][c])) {
        selectedRow = r;
        selectedCol = c;
        return;
      }
    }
  }
}

function ensureAudio() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game plays fine without
    }
  }
}

function registerGameSounds() {
  registerSound('select', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 520, duration: 0.06, gain: 0.1 },
      { type: 'sine', frequency: 780, duration: 0.06, delay: 0.04, gain: 0.08 },
    ],
  });

  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 140, duration: 0.2, gain: 0.15 },
    ],
  });

  registerSound('complete', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.2 },
    ],
  });
}
