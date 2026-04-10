/**
 * MEME CROSSWORD -- Main Entry Point
 * Integrates with GameShell, manages state, handles input.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getRandomPuzzle } from './crossword.js';
import { render } from './renderer.js';

// ---- Constants ----
const W = 400;
const H = 700;
const GRID_SIZE = 5;
const CELL_SIZE = 56;
const GRID_TOP = 88;
const GRID_LEFT = (W - GRID_SIZE * CELL_SIZE) / 2;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME CROSSWORD',
  gameId: 'meme-crossword',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'solve the brainrot',
  accentColor: '#e94560',
});

// ---- Game State ----
let state = createDefaultState();

function createDefaultState() {
  return {
    puzzle: null,
    puzzleIndex: -1,
    userGrid: [],         // 5x5 of user-entered letters (or '')
    cellNumbers: [],      // 5x5 of cell numbers (0 = no number)
    selectedRow: -1,
    selectedCol: -1,
    direction: 'across',  // 'across' or 'down'
    currentClue: null,
    highlightedCells: [], // [[r,c], ...] for current word
    elapsedSeconds: 0,
    errors: 0,
    completed: false,
    cursorVisible: true,
    cursorTimer: 0,
    cellFlashes: {},      // { 'r,c': { type, timer } }
    pressedKey: null,
    pressedKeyTimer: 0,
    keyboardRows: buildKeyboardLayout(),
  };
}

// ---- Keyboard Layout ----
function buildKeyboardLayout() {
  const keyW = 32;
  const wideKeyW = 50;
  const rows = [
    'QWERTYUIOP'.split('').map(ch => ({ label: ch, w: keyW })),
    'ASDFGHJKL'.split('').map(ch => ({ label: ch, w: keyW })),
    [
      { label: 'DEL', w: wideKeyW },
      ...'ZXCVBNM'.split('').map(ch => ({ label: ch, w: keyW })),
      { label: 'ENT', w: wideKeyW },
    ],
  ];
  return rows;
}

// ---- Sound Registration ----
function registerSounds() {
  registerSound('type', {
    notes: [
      { type: 'sine', frequency: 800, duration: 0.04, gain: 0.08 },
    ],
  });
  registerSound('correct', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.16, gain: 0.2 },
    ],
  });
  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 150, duration: 0.15, gain: 0.15 },
    ],
  });
  registerSound('complete', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.15, delay: 0.3, gain: 0.2 },
    ],
  });
}

// ---- Cell Numbering ----
function computeCellNumbers(puzzle) {
  const nums = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  let num = 1;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (puzzle.grid[r][c] === null) continue;

      const startsAcross = (c === 0 || puzzle.grid[r][c - 1] === null) &&
        c + 1 < GRID_SIZE && puzzle.grid[r][c + 1] !== null;
      const startsDown = (r === 0 || puzzle.grid[r - 1][c] === null) &&
        r + 1 < GRID_SIZE && puzzle.grid[r + 1][c] !== null;

      if (startsAcross || startsDown) {
        nums[r][c] = num++;
      }
    }
  }
  return nums;
}

// ---- Word Highlight ----
function getWordCells(clue) {
  const cells = [];
  let r = clue.row;
  let c = clue.col;
  for (let i = 0; i < clue.answer.length; i++) {
    cells.push([r, c]);
    if (clue.direction === 'across') c++;
    else r++;
  }
  return cells;
}

function findClueForCell(puzzle, row, col, direction) {
  // Find the clue that contains this cell in the given direction
  for (const clue of puzzle.clues) {
    if (clue.direction !== direction) continue;
    const cells = getWordCells(clue);
    if (cells.some(([r, c]) => r === row && c === col)) {
      return clue;
    }
  }
  return null;
}

function updateSelection() {
  if (state.selectedRow < 0 || state.selectedCol < 0) {
    state.currentClue = null;
    state.highlightedCells = [];
    return;
  }
  const clue = findClueForCell(state.puzzle, state.selectedRow, state.selectedCol, state.direction);
  if (clue) {
    state.currentClue = clue;
    state.highlightedCells = getWordCells(clue);
  } else {
    // Try the other direction
    const alt = state.direction === 'across' ? 'down' : 'across';
    const altClue = findClueForCell(state.puzzle, state.selectedRow, state.selectedCol, alt);
    if (altClue) {
      state.direction = alt;
      state.currentClue = altClue;
      state.highlightedCells = getWordCells(altClue);
    } else {
      state.currentClue = null;
      state.highlightedCells = [];
    }
  }
}

// ---- Check Completion ----
function isWordCorrect(clue) {
  const cells = getWordCells(clue);
  for (const [r, c] of cells) {
    if (state.userGrid[r][c] !== state.puzzle.grid[r][c]) return false;
  }
  return true;
}

function isPuzzleComplete() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.puzzle.grid[r][c] === null) continue;
      if (state.userGrid[r][c] !== state.puzzle.grid[r][c]) return false;
    }
  }
  return true;
}

// ---- Move to Next Cell ----
function moveToNextCell() {
  if (!state.currentClue) return;
  const cells = getWordCells(state.currentClue);
  const idx = cells.findIndex(([r, c]) => r === state.selectedRow && c === state.selectedCol);
  if (idx >= 0 && idx < cells.length - 1) {
    const [nr, nc] = cells[idx + 1];
    state.selectedRow = nr;
    state.selectedCol = nc;
  } else {
    // Word complete, try to jump to next incomplete word
    moveToNextWord();
  }
  updateSelection();
}

function moveToPrevCell() {
  if (!state.currentClue) return;
  const cells = getWordCells(state.currentClue);
  const idx = cells.findIndex(([r, c]) => r === state.selectedRow && c === state.selectedCol);
  if (idx > 0) {
    const [nr, nc] = cells[idx - 1];
    state.selectedRow = nr;
    state.selectedCol = nc;
    updateSelection();
  }
}

function moveToNextWord() {
  if (!state.puzzle) return;
  const clues = state.puzzle.clues;
  const curIdx = clues.findIndex(cl =>
    cl.num === state.currentClue?.num && cl.direction === state.currentClue?.direction
  );
  // Find next incomplete clue
  for (let i = 1; i <= clues.length; i++) {
    const nextClue = clues[(curIdx + i) % clues.length];
    if (!isWordCorrect(nextClue)) {
      const cells = getWordCells(nextClue);
      // Find first empty cell in this word
      const emptyCell = cells.find(([r, c]) => !state.userGrid[r][c]) || cells[0];
      state.selectedRow = emptyCell[0];
      state.selectedCol = emptyCell[1];
      state.direction = nextClue.direction;
      updateSelection();
      return;
    }
  }
}

// ---- Handle Letter Input ----
function handleLetter(letter) {
  if (state.completed) return;
  if (state.selectedRow < 0 || state.selectedCol < 0) return;
  if (state.puzzle.grid[state.selectedRow][state.selectedCol] === null) return;

  initAudio();

  const r = state.selectedRow;
  const c = state.selectedCol;
  const correct = state.puzzle.grid[r][c];

  state.userGrid[r][c] = letter;
  state.pressedKey = letter;
  state.pressedKeyTimer = 0.1;

  if (letter === correct) {
    playSound('type');
    // Check if word is complete
    if (state.currentClue && isWordCorrect(state.currentClue)) {
      playSound('correct');
      // Flash the word cells
      const cells = getWordCells(state.currentClue);
      for (const [cr, cc] of cells) {
        state.cellFlashes[`${cr},${cc}`] = { type: 'correct', timer: 0.4 };
      }
    }
    // Check puzzle complete
    if (isPuzzleComplete()) {
      state.completed = true;
      playSound('complete');
      setTimeout(() => {
        shell.setState('game-over');
      }, 1200);
      return;
    }
    moveToNextCell();
  } else {
    state.errors++;
    playSound('error');
    state.cellFlashes[`${r},${c}`] = { type: 'error', timer: 0.3 };
    // Clear wrong letter after brief display
    setTimeout(() => {
      if (state.userGrid[r][c] === letter && letter !== correct) {
        state.userGrid[r][c] = '';
      }
    }, 300);
  }
}

function handleDelete() {
  if (state.completed) return;
  if (state.selectedRow < 0 || state.selectedCol < 0) return;

  const r = state.selectedRow;
  const c = state.selectedCol;

  if (state.userGrid[r][c]) {
    state.userGrid[r][c] = '';
  } else {
    moveToPrevCell();
    state.userGrid[state.selectedRow][state.selectedCol] = '';
  }
}

// ---- Handle Grid Tap ----
function handleGridTap(x, y) {
  const col = Math.floor((x - GRID_LEFT) / CELL_SIZE);
  const row = Math.floor((y - GRID_TOP) / CELL_SIZE);

  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
  if (state.puzzle.grid[row][col] === null) return;

  initAudio();

  // If tapping same cell, toggle direction
  if (state.selectedRow === row && state.selectedCol === col) {
    state.direction = state.direction === 'across' ? 'down' : 'across';
  } else {
    state.selectedRow = row;
    state.selectedCol = col;
  }

  updateSelection();
}

// ---- Handle Keyboard Tap ----
function handleKeyboardTap(x, y) {
  for (const row of state.keyboardRows) {
    for (const key of row) {
      if (key.x === undefined) continue;
      if (x >= key.x && x <= key.x + key.w && y >= key.y && y <= key.y + key.h) {
        if (key.label === 'DEL') {
          handleDelete();
        } else if (key.label === 'ENT') {
          // Submit / move to next word
          moveToNextWord();
        } else {
          handleLetter(key.label);
        }
        return true;
      }
    }
  }
  return false;
}

// ---- Shell Callbacks ----
shell.onStart = () => {
  initAudio();
  registerSounds();

  const { puzzle, index } = getRandomPuzzle(state.puzzleIndex);
  state = createDefaultState();
  state.puzzle = puzzle;
  state.puzzleIndex = index;
  state.userGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  state.cellNumbers = computeCellNumbers(puzzle);

  // Select first white cell
  outer:
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (puzzle.grid[r][c] !== null) {
        state.selectedRow = r;
        state.selectedCol = c;
        state.direction = 'across';
        break outer;
      }
    }
  }
  updateSelection();
};

shell.onUpdate = (dt) => {
  if (state.completed) return;

  // Timer
  state.elapsedSeconds += dt * (1 / 60);

  // Cursor blink
  state.cursorTimer += dt * (1 / 60);
  if (state.cursorTimer > 0.5) {
    state.cursorVisible = !state.cursorVisible;
    state.cursorTimer = 0;
  }

  // Flash timers
  for (const key of Object.keys(state.cellFlashes)) {
    state.cellFlashes[key].timer -= dt * (1 / 60);
    if (state.cellFlashes[key].timer <= 0) {
      delete state.cellFlashes[key];
    }
  }

  // Key press visual feedback
  if (state.pressedKeyTimer > 0) {
    state.pressedKeyTimer -= dt * (1 / 60);
    if (state.pressedKeyTimer <= 0) {
      state.pressedKey = null;
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  const seconds = Math.floor(state.elapsedSeconds);
  const score = Math.max(5000 - seconds * 5, 100);
  const errorPenalty = state.errors * 50;
  const finalScore = Math.max(score - errorPenalty, 50);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${minutes}m ${secs}s`;
  const message = `Solved in ${timeStr} with ${state.errors} error${state.errors !== 1 ? 's' : ''}`;

  return {
    score: finalScore,
    message,
    scoreLabel: 'score',
  };
};

// ---- Input Setup ----
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();
  const input = createInputManager(canvas, W, H);

  input.onTapAt((pos) => {
    if (shell.state !== 'playing') return;

    // Check keyboard first
    if (handleKeyboardTap(pos.x, pos.y)) return;

    // Check grid
    handleGridTap(pos.x, pos.y);
  });

  // Physical keyboard support
  document.addEventListener('keydown', (e) => {
    if (shell.state !== 'playing') return;
    if (state.completed) return;

    const key = e.key.toUpperCase();

    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      e.preventDefault();
      handleLetter(key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleDelete();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      moveToNextWord();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveArrow(0, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveArrow(0, -1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveArrow(1, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveArrow(-1, 0);
    }
  });
});

function moveArrow(dr, dc) {
  let r = state.selectedRow + dr;
  let c = state.selectedCol + dc;

  // Skip black cells
  while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
    if (state.puzzle.grid[r][c] !== null) {
      state.selectedRow = r;
      state.selectedCol = c;
      // Set direction based on arrow direction
      if (dc !== 0) state.direction = 'across';
      if (dr !== 0) state.direction = 'down';
      updateSelection();
      return;
    }
    r += dr;
    c += dc;
  }
}
