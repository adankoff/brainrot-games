/**
 * MEME KENKEN -- Main Entry Point
 * Wires up GameShell, input, sound, puzzle generation, and rendering.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generatePuzzle, findErrors, isSolved } from './kenken.js';
import { render, getLayout } from './renderer.js';

// ---- Constants ----
const W = 400;
const H = 700;
const GAME_ID = 'meme-kenken';

const DIFFICULTIES = {
  easy: 4,
  medium: 5,
  hard: 6,
};

// ---- Game State ----
let puzzle = null;
let playerGrid = null;
let selectedRow = -1;
let selectedCol = -1;
let errors = new Set();
let errorCount = 0;
let startTime = 0;
let elapsed = 0;
let solved = false;
let difficulty = 'easy';
let inputManager = null;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME KENKEN',
  gameId: GAME_ID,
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'kenken',
  subtitle: 'math puzzle but make it brainrot',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-131/',
});

// ---- Register Sounds ----
function registerGameSounds() {
  registerSound('select', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.05, gain: 0.08 },
    ],
  });

  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 520, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 680, duration: 0.06, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 120, duration: 0.2, gain: 0.2 },
    ],
  });

  registerSound('complete', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Difficulty Selector ----
function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const label = document.createElement('p');
  label.className = 'text-secondary text-sm';
  label.textContent = 'difficulty';
  label.style.marginBottom = '8px';
  secondary.appendChild(label);

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '8px';
  btnContainer.style.justifyContent = 'center';

  for (const diff of Object.keys(DIFFICULTIES)) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost';
    btn.textContent = diff;
    btn.style.padding = '6px 14px';
    btn.style.fontSize = '14px';
    btn.style.border = diff === difficulty ? '2px solid #c8ff00' : '2px solid transparent';
    btn.style.color = diff === difficulty ? '#c8ff00' : '#888';

    btn.addEventListener('click', () => {
      initAudio();
      playSound('select');
      difficulty = diff;
      // Rebuild to update selection highlight
      buildDifficultySelector();
    });

    btnContainer.appendChild(btn);
  }

  secondary.appendChild(btnContainer);
}

// ---- Input Handling ----
function handleTapAt(pos) {
  if (solved) return;
  if (!puzzle) return;

  initAudio();

  const n = puzzle.size;
  const layout = getLayout(W, n);
  const { gridX, gridY, cellSize, numPadY } = layout;

  // Check if tap is on the grid
  if (pos.x >= gridX && pos.x <= gridX + cellSize * n &&
      pos.y >= gridY && pos.y <= gridY + cellSize * n) {
    const col = Math.floor((pos.x - gridX) / cellSize);
    const row = Math.floor((pos.y - gridY) / cellSize);
    if (row >= 0 && row < n && col >= 0 && col < n) {
      selectedRow = row;
      selectedCol = col;
      playSound('select');
    }
    return;
  }

  // Check if tap is on number pad
  if (pos.y >= numPadY && pos.y <= numPadY + 48) {
    const padding = 16;
    const totalW = W - padding * 2;
    const btnCount = n + 1;
    const gap = 6;
    const btnW = (totalW - (btnCount - 1) * gap) / btnCount;

    const relX = pos.x - padding;
    if (relX < 0) return;

    const btnIndex = Math.floor(relX / (btnW + gap));
    // Verify the tap is actually within the button (not in the gap)
    const btnStartX = btnIndex * (btnW + gap);
    if (relX > btnStartX + btnW) return;

    if (btnIndex >= 0 && btnIndex <= n) {
      placeNumber(btnIndex === n ? 0 : btnIndex + 1);
    }
  }
}

function handleKeyDown(e) {
  if (solved) return;
  if (!puzzle) return;

  const n = puzzle.size;

  // Arrow keys for navigation
  if (e.key === 'ArrowUp' || e.key === 'w') {
    e.preventDefault();
    if (selectedRow > 0) { selectedRow--; playSound('select'); }
    else if (selectedRow < 0) { selectedRow = 0; selectedCol = 0; playSound('select'); }
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    e.preventDefault();
    if (selectedRow < n - 1) { selectedRow++; playSound('select'); }
    else if (selectedRow < 0) { selectedRow = 0; selectedCol = 0; playSound('select'); }
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    e.preventDefault();
    if (selectedCol > 0) { selectedCol--; playSound('select'); }
    else if (selectedCol < 0) { selectedRow = 0; selectedCol = 0; playSound('select'); }
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    e.preventDefault();
    if (selectedCol < n - 1) { selectedCol++; playSound('select'); }
    else if (selectedCol < 0) { selectedRow = 0; selectedCol = 0; playSound('select'); }
    return;
  }

  // Number keys
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= n) {
    e.preventDefault();
    placeNumber(num);
    return;
  }

  // Delete/Backspace to erase
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    e.preventDefault();
    placeNumber(0);
  }
}

function placeNumber(num) {
  if (selectedRow < 0 || selectedCol < 0) return;

  initAudio();

  const n = puzzle.size;
  const prevValue = playerGrid[selectedRow][selectedCol];

  if (num === 0) {
    // Erase
    if (prevValue !== 0) {
      playerGrid[selectedRow][selectedCol] = 0;
      playSound('select');
    }
    errors = findErrors(playerGrid, n);
    return;
  }

  // Place number
  playerGrid[selectedRow][selectedCol] = num;

  // Check for errors
  const newErrors = findErrors(playerGrid, n);
  const hadError = errors.has(`${selectedRow},${selectedCol}`);
  const hasError = newErrors.has(`${selectedRow},${selectedCol}`);

  if (hasError && !hadError) {
    errorCount++;
    playSound('error');
  } else {
    playSound('place');
  }

  errors = newErrors;

  // Check if solved
  if (isSolved(playerGrid, puzzle.solution, n)) {
    solved = true;
    playSound('complete');
    // Small delay before game over
    setTimeout(() => {
      shell.setState('game-over');
    }, 1500);
  }
}

// ---- Shell Callbacks ----
shell.onStart = () => {
  initAudio();
  registerGameSounds();

  const n = DIFFICULTIES[difficulty];
  puzzle = generatePuzzle(n);
  playerGrid = Array.from({ length: n }, () => new Array(n).fill(0));
  selectedRow = -1;
  selectedCol = -1;
  errors = new Set();
  errorCount = 0;
  elapsed = 0;
  solved = false;
  startTime = performance.now();

  // Set up input
  if (inputManager) inputManager.destroy();
  const canvas = shell.getCanvas();
  inputManager = createInputManager(canvas, W, H);
  inputManager.onTapAt(handleTapAt);

  // Remove old keyboard listener, add new
  document.removeEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleKeyDown);
};

shell.onUpdate = (dt) => {
  if (!solved) {
    elapsed = (performance.now() - startTime) / 1000;
  }
};

shell.onRender = (ctx) => {
  if (!puzzle) return;

  render(ctx, W, H, {
    puzzle,
    playerGrid,
    selectedRow,
    selectedCol,
    errors,
    elapsed,
    errorCount,
    difficulty,
    solved,
  });
};

shell.onGameOver = () => {
  const seconds = Math.floor(elapsed);
  const score = Math.max(8000 - seconds * 5 - errorCount * 200, 100);

  // Clean up input
  document.removeEventListener('keydown', handleKeyDown);

  return {
    score,
    message: `${difficulty} ${puzzle.size}x${puzzle.size} in ${formatTime(seconds)} | ${errorCount} errors`,
    scoreLabel: 'score',
  };
};

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ---- Init ----
shell.init();
buildDifficultySelector();

// Rebuild difficulty selector when returning to menu
const origSetState = shell.setState.bind(shell);
shell.setState = (state) => {
  origSetState(state);
  if (state === 'menu') {
    buildDifficultySelector();
  }
};
