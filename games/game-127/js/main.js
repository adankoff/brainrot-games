/**
 * MEME FLOW -- Main entry point
 * Wires up GameShell, input handling, sound, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createFlowState,
  generatePuzzle,
  startPath,
  continuePath,
  endPath,
  checkWin,
  countFilledCells,
  isColorConnected,
} from './flow.js';
import {
  computeLayout,
  pixelToGrid,
  render,
  renderGameOver,
  QUIT_BTN,
} from './renderer.js';

// ---- Constants ----
const CANVAS_W = 400;
const CANVAS_H = 700;
const GAME_ID = 'meme-flow';

// ---- Game State ----
let state = null;
let layout = null;
let difficulty = 'easy';
let level = 1;
let elapsedTime = 0;
let moveCount = 0;
let totalScore = 0;
let isDrawing = false;
let lastGridCell = null;
let winAnimTime = 0;
let winAnimActive = false;
let winHandled = false;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME FLOW',
  gameId: GAME_ID,
  logicalWidth: CANVAS_W,
  logicalHeight: CANVAS_H,
  maxDisplayWidth: 480,
  theme: 'flow',
  subtitle: 'connect the dots. fill the grid.',
  accentColor: '#00ffcc',
});

// ---- Sound Registration ----
function registerSounds() {
  registerSound('draw', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.04, gain: 0.06 },
    ],
  });

  registerSound('connect', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.12 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.08, gain: 0.12 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.15, delay: 0.3, gain: 0.25 },
    ],
  });

  registerSound('clear', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 200, duration: 0.08, gain: 0.08 },
    ],
  });
}

// ---- Input Handling ----
// We need drag support, so we manage pointer events ourselves rather than
// using the shared input-manager (which only supports tap).

function setupInput() {
  const canvas = shell.getCanvas();

  function getLogicalPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (CANVAS_W / rect.width),
      y: (clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }

  function handlePointerDown(px, py) {
    if (!state) return;
    initAudio();

    // Check quit button
    if (px >= QUIT_BTN.x && px <= QUIT_BTN.x + QUIT_BTN.w &&
        py >= QUIT_BTN.y && py <= QUIT_BTN.y + QUIT_BTN.h) {
      // Add score for current puzzle progress before ending
      shell.setState('game-over');
      return;
    }

    if (state.solved) return;

    const cell = pixelToGrid(layout, px, py);
    if (!cell) return;

    const result = startPath(state, cell.r, cell.c);
    if (result.started) {
      isDrawing = true;
      lastGridCell = cell;
      moveCount++;
      playSound('draw');
    }
  }

  function handlePointerMove(px, py) {
    if (!isDrawing || !state || state.solved) return;

    const cell = pixelToGrid(layout, px, py);
    if (!cell) return;
    if (lastGridCell && cell.r === lastGridCell.r && cell.c === lastGridCell.c) return;

    // If we jumped more than one cell, interpolate
    if (lastGridCell) {
      const dr = cell.r - lastGridCell.r;
      const dc = cell.c - lastGridCell.c;
      const dist = Math.abs(dr) + Math.abs(dc);

      if (dist === 1) {
        // Adjacent: normal continue
        const result = continuePath(state, cell.r, cell.c);
        if (result.added) {
          playSound('draw');
          if (result.connected) {
            playSound('connect');
            isDrawing = false;
          }
          if (result.erasedColor) {
            playSound('clear');
          }
        } else if (result.erased) {
          playSound('clear');
        }
        lastGridCell = cell;
      } else if (dist > 1) {
        // Jumped cells -- step through one at a time along the path
        const steps = interpolateCells(lastGridCell, cell);
        for (const step of steps) {
          const result = continuePath(state, step.r, step.c);
          if (result.added) {
            playSound('draw');
            if (result.connected) {
              playSound('connect');
              isDrawing = false;
              break;
            }
            if (result.erasedColor) {
              playSound('clear');
            }
          } else if (result.erased) {
            playSound('clear');
          }
          lastGridCell = step;
        }
        if (isDrawing) lastGridCell = cell;
      }
    }
  }

  function handlePointerUp() {
    if (isDrawing) {
      endPath(state);
      isDrawing = false;
      lastGridCell = null;
    }
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    const pos = getLogicalPos(e.clientX, e.clientY);
    handlePointerDown(pos.x, pos.y);
  });
  canvas.addEventListener('mousemove', (e) => {
    const pos = getLogicalPos(e.clientX, e.clientY);
    handlePointerMove(pos.x, pos.y);
  });
  canvas.addEventListener('mouseup', handlePointerUp);
  canvas.addEventListener('mouseleave', handlePointerUp);

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

  canvas.addEventListener('touchcancel', handlePointerUp);
}

/**
 * Interpolate cells between two non-adjacent grid positions.
 * Steps along the axis with the larger delta first.
 */
function interpolateCells(from, to) {
  const cells = [];
  let r = from.r;
  let c = from.c;

  while (r !== to.r || c !== to.c) {
    const dr = to.r - r;
    const dc = to.c - c;

    // Move one step toward target, preferring the axis with more distance
    if (Math.abs(dr) >= Math.abs(dc)) {
      r += Math.sign(dr);
    } else {
      c += Math.sign(dc);
    }
    cells.push({ r, c });
  }

  return cells;
}

// ---- Difficulty Selector ----
function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  ['easy', 'medium', 'hard'].forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'difficulty-btn' + (d === difficulty ? ' active' : '');
    btn.textContent = d;
    btn.addEventListener('click', () => {
      difficulty = d;
      container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      initAudio();
      playSound('uiclick');
    });
    container.appendChild(btn);
  });

  secondary.appendChild(container);
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  const puzzle = generatePuzzle(difficulty);
  state = createFlowState(puzzle);
  layout = computeLayout(CANVAS_W, CANVAS_H, state.gridSize);

  elapsedTime = 0;
  moveCount = 0;
  winAnimActive = false;
  winAnimTime = 0;
  winHandled = false;
  isDrawing = false;
  lastGridCell = null;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  const dtSec = dt * (1 / 60);

  if (!state.solved) {
    elapsedTime += dtSec;

    // Check win
    if (checkWin(state)) {
      state.solved = true;
      winAnimActive = true;
      winAnimTime = 0;
      playSound('win');
    }
  } else {
    // Win animation
    winAnimTime += dtSec;

    if (winAnimTime > 1.5 && !winHandled) {
      winHandled = true;

      // Calculate score for this puzzle
      const puzzleScore = Math.max(5000 - Math.floor(elapsedTime) * 10, 100);
      totalScore += puzzleScore;
      level++;

      // Start next puzzle after brief delay
      setTimeout(() => {
        if (shell.state !== 'playing') return;
        const puzzle = generatePuzzle(difficulty);
        state = createFlowState(puzzle);
        layout = computeLayout(CANVAS_W, CANVAS_H, state.gridSize);
        elapsedTime = 0;
        moveCount = 0;
        winAnimActive = false;
        winAnimTime = 0;
        winHandled = false;
        isDrawing = false;
        lastGridCell = null;
      }, 500);
    }
  }
};

shell.onRender = (ctx) => {
  if (!state || !layout) return;

  const totalCells = state.gridSize * state.gridSize;
  const filled = countFilledCells(state);
  let flowsComplete = 0;
  for (let c = 1; c <= state.numColors; c++) {
    if (isColorConnected(state, c)) flowsComplete++;
  }

  render(ctx, layout, state, {
    time: elapsedTime,
    moves: moveCount,
    level,
    difficulty,
    filledPct: filled / totalCells,
    flowsComplete,
    totalFlows: state.numColors,
  }, {
    winFlash: winAnimActive,
    winTime: winAnimTime,
  });
};

shell.onGameOver = () => {
  return {
    score: totalScore,
    message: `${level - 1} puzzle${level - 1 !== 1 ? 's' : ''} solved`,
    scoreLabel: 'total score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state && layout) {
    renderGameOver(ctx, layout, state);
  }
};

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  shell.init();
  setupInput();
  buildDifficultySelector();

  // Reset score tracking when starting from menu
  const origSetState = shell.setState.bind(shell);
  shell.setState = (name) => {
    if (name === 'playing' && shell.state === 'menu') {
      totalScore = 0;
      level = 1;
    }
    origSetState(name);
  };
});
