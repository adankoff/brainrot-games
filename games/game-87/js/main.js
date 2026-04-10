/**
 * MEME WORD SEARCH -- Main Entry Point
 * Wires up GameShell, input handling, grid generation, and rendering.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generateGrid } from './wordsearch.js';
import { render } from './renderer.js';

// ---- Constants ----
const W = 400;
const H = 700;

const DIFFICULTY = {
  easy:   { size: 8,  wordCount: 6  },
  medium: { size: 10, wordCount: 8  },
  hard:   { size: 12, wordCount: 10 },
};

// ---- Game State ----
let grid = [];
let words = [];
let placements = [];
let foundWords = new Set();
let wordColorMap = new Map();
let foundColorIndex = 0;

let selStart = null;   // { row, col }
let selEnd = null;     // { row, col }
let isDragging = false;

let gridSize = 10;
let cellSize = 0;
let gridOffsetX = 0;
let gridOffsetY = 0;

let elapsed = 0;   // seconds
let gameWon = false;
let difficulty = 'medium';

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME WORD SEARCH',
  gameId: 'meme-wordsearch',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'wordsearch',
  subtitle: 'find the brainrot words',
  accentColor: '#00e5ff',
});

// ---- Register Sounds ----
function registerGameSounds() {
  registerSound('select', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('found', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.16, gain: 0.25 },
    ],
  });

  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 140, duration: 0.15, gain: 0.1 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.36, gain: 0.25 },
    ],
  });
}

// ---- Coordinate Helpers ----

/**
 * Convert logical canvas coords to grid row/col.
 * Returns null if outside grid.
 */
function posToCell(x, y) {
  const col = Math.floor((x - gridOffsetX) / cellSize);
  const row = Math.floor((y - gridOffsetY) / cellSize);
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
  return { row, col };
}

/**
 * Snap selEnd so it forms a valid line (horizontal, vertical, or diagonal)
 * from selStart to the given cell.
 */
function snapToLine(start, end) {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  // Determine dominant direction
  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  if (absDr === 0 && absDc === 0) {
    return { row: start.row, col: start.col };
  }

  // Pick the best axis-aligned or diagonal direction
  let stepR, stepC, steps;

  if (absDc >= absDr * 2) {
    // Horizontal
    stepR = 0;
    stepC = dc > 0 ? 1 : -1;
    steps = absDc;
  } else if (absDr >= absDc * 2) {
    // Vertical
    stepR = dr > 0 ? 1 : -1;
    stepC = 0;
    steps = absDr;
  } else {
    // Diagonal
    stepR = dr > 0 ? 1 : -1;
    stepC = dc > 0 ? 1 : -1;
    steps = Math.max(absDr, absDc);
  }

  // Clamp steps to grid bounds
  let maxSteps = steps;
  for (let s = 1; s <= steps; s++) {
    const nr = start.row + stepR * s;
    const nc = start.col + stepC * s;
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
      maxSteps = s - 1;
      break;
    }
  }

  return {
    row: start.row + stepR * maxSteps,
    col: start.col + stepC * maxSteps,
  };
}

/**
 * Get the word formed by the current selection.
 */
function getSelectedWord() {
  if (!selStart || !selEnd) return '';

  const dr = selEnd.row - selStart.row;
  const dc = selEnd.col - selStart.col;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return grid[selStart.row][selStart.col];

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  let word = '';
  for (let i = 0; i <= steps; i++) {
    const r = selStart.row + stepR * i;
    const c = selStart.col + stepC * i;
    word += grid[r][c];
  }
  return word;
}

/**
 * Check if current selection matches any unfound word.
 */
function checkSelection() {
  const selected = getSelectedWord();
  if (!selected || selected.length < 2) {
    playSound('wrong');
    return;
  }

  // Check against all unfound words
  for (const p of placements) {
    if (foundWords.has(p.word)) continue;

    // Build the word from this placement
    let pWord = '';
    const steps = p.word.length - 1;
    for (let i = 0; i <= steps; i++) {
      pWord += grid[p.startRow + p.dirRow * i][p.startCol + p.dirCol * i];
    }

    // Check if selection matches this placement exactly (position and direction)
    const selDr = selEnd.row - selStart.row;
    const selDc = selEnd.col - selStart.col;
    const selSteps = Math.max(Math.abs(selDr), Math.abs(selDc));
    const selStepR = selSteps === 0 ? 0 : selDr / selSteps;
    const selStepC = selSteps === 0 ? 0 : selDc / selSteps;

    // Forward match
    if (selStart.row === p.startRow && selStart.col === p.startCol &&
        selStepR === p.dirRow && selStepC === p.dirCol &&
        selSteps === steps) {
      markFound(p.word);
      return;
    }

    // Reverse match (selecting from end to start)
    const pEndRow = p.startRow + p.dirRow * steps;
    const pEndCol = p.startCol + p.dirCol * steps;
    if (selStart.row === pEndRow && selStart.col === pEndCol &&
        selStepR === -p.dirRow && selStepC === -p.dirCol &&
        selSteps === steps) {
      markFound(p.word);
      return;
    }
  }

  playSound('wrong');
}

function markFound(word) {
  foundWords.add(word);
  wordColorMap.set(word, foundColorIndex);
  foundColorIndex++;
  playSound('found');

  if (foundWords.size === words.length) {
    gameWon = true;
    setTimeout(() => {
      playSound('win');
      shell.setState('game-over');
    }, 500);
  }
}

// ---- Layout Calculation ----
function calculateLayout() {
  const padding = 10;
  const hudHeight = 35;
  // Reserve space for word list below grid
  const wordListHeight = Math.ceil(words.length / 2) * 20 + 20;
  const availableH = H - hudHeight - wordListHeight - padding * 2;
  const availableW = W - padding * 2;

  cellSize = Math.floor(Math.min(availableW / gridSize, availableH / gridSize));
  const gridPixelW = cellSize * gridSize;
  const gridPixelH = cellSize * gridSize;

  gridOffsetX = Math.floor((W - gridPixelW) / 2);
  gridOffsetY = hudHeight + padding;
}

// ---- Input Handling ----
function setupInput() {
  const canvas = shell.getCanvas();

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }

  function handleStart(x, y) {
    if (shell.state !== 'playing' || gameWon) return;
    initAudio();
    const cell = posToCell(x, y);
    if (!cell) return;
    isDragging = true;
    selStart = cell;
    selEnd = cell;
    playSound('select');
  }

  function handleMove(x, y) {
    if (!isDragging || !selStart) return;
    const cell = posToCell(x, y);
    if (!cell) return;
    const snapped = snapToLine(selStart, cell);
    if (!selEnd || snapped.row !== selEnd.row || snapped.col !== selEnd.col) {
      selEnd = snapped;
    }
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (selStart && selEnd) {
      checkSelection();
    }
    selStart = null;
    selEnd = null;
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const pos = toLogical(e.clientX, e.clientY);
    handleStart(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    const pos = toLogical(e.clientX, e.clientY);
    handleMove(pos.x, pos.y);
  });

  canvas.addEventListener('mouseup', () => handleEnd());
  canvas.addEventListener('mouseleave', () => handleEnd());

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    handleStart(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    handleMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleEnd();
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => handleEnd());
}

// ---- Difficulty Selector ----
function buildDifficultySelector() {
  const menuVisual = document.getElementById('menu-visual');
  if (!menuVisual) return;

  const container = document.createElement('div');
  container.style.cssText = 'display:flex; gap:8px; justify-content:center; margin-top:12px;';

  for (const key of ['easy', 'medium', 'hard']) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = key;
    btn.style.cssText = 'text-transform:uppercase; min-width:70px; font-size:13px; padding:6px 14px;';

    if (key === difficulty) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    }

    btn.addEventListener('click', () => {
      difficulty = key;
      // Update button styles
      container.querySelectorAll('button').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      initAudio();
      playSound('select');
    });

    container.appendChild(btn);
  }

  menuVisual.appendChild(container);

  // Info text
  const info = document.createElement('p');
  info.style.cssText = 'color:#666688; font-size:12px; margin-top:8px; text-align:center; font-family:monospace;';
  info.textContent = 'drag across letters to find words';
  menuVisual.appendChild(info);
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerGameSounds();

  const diff = DIFFICULTY[difficulty];
  gridSize = diff.size;

  const result = generateGrid(diff.size, diff.wordCount);
  grid = result.grid;
  words = result.words;
  placements = result.placements;

  foundWords = new Set();
  wordColorMap = new Map();
  foundColorIndex = 0;
  selStart = null;
  selEnd = null;
  isDragging = false;
  elapsed = 0;
  gameWon = false;

  calculateLayout();
};

shell.onUpdate = (dt) => {
  if (!gameWon) {
    elapsed += dt * (1 / 60); // dt is normalized to 60fps frames
  }
};

shell.onRender = (ctx) => {
  render(ctx, {
    grid,
    words,
    foundWords,
    placements,
    selStart,
    selEnd,
    elapsed,
    gridSize,
    cellSize,
    gridOffsetX,
    gridOffsetY,
    foundColorIndex,
    wordColorMap,
  }, W, H);
};

shell.onGameOver = () => {
  const seconds = Math.floor(elapsed);
  const score = Math.max(8000 - seconds * 5, 100);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return {
    score,
    message: `all ${words.length} words found in ${timeStr}`,
    scoreLabel: 'score',
  };
};

// ---- Init ----
shell.init();
buildDifficultySelector();
setupInput();
