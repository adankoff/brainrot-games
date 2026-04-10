/**
 * MEME SWEEPER -- Main Entry
 * Procedurally generated minesweeper with brainrot theming.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { createMinefield, reveal, toggleFlag, checkWin } from './minefield.js';
import { computeLayout, posToCell, renderFrame } from './renderer.js';

// --- Constants ---

const LOGICAL_W = 400;
const LOGICAL_H = 700;
const HUD_HEIGHT = 44;
const LONG_PRESS_MS = 400;

const DIFFICULTIES = {
  easy:   { rows: 9,  cols: 9,  mines: 10, label: 'easy' },
  medium: { rows: 12, cols: 12, mines: 30, label: 'mid' },
  hard:   { rows: 16, cols: 16, mines: 60, label: 'hard' },
};

// --- Game State ---

let field = null;
let layout = null;
let difficulty = 'medium';
let startTime = 0;
let elapsed = 0;
let timerRunning = false;
let gameEnded = false;

// Long press tracking
let pressStart = 0;
let pressPos = null;
let longPressTimeout = null;
let longPressFired = false;

// --- Shell Setup ---

const shell = new GameShell({
  title: 'MEME SWEEPER',
  gameId: 'meme-sweeper',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'minesweeper',
  subtitle: 'don\'t be sus -- sweep the mines',
  accentColor: '#e94560',
});

// --- Sounds ---

function registerSounds() {
  registerSound('reveal', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.04, gain: 0.1 },
    ],
  });

  registerSound('flag', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.05, gain: 0.12 },
      { type: 'square', frequency: 550, duration: 0.05, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('boom', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 40, duration: 0.4, gain: 0.3 },
      { type: 'sine', frequency: 80, duration: 0.3, delay: 0.05, gain: 0.2, noise: true },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// --- Input Handling ---

/**
 * Handle a short tap (reveal cell).
 */
function handleTap(x, y) {
  if (!field || gameEnded) return;

  const cellPos = posToCell(x, y, layout.gridOffsetX, layout.gridOffsetY, layout.cellSize, field.rows, field.cols);
  if (!cellPos) return;

  const { r, c } = cellPos;
  const cell = field.cells[r][c];
  if (cell.revealed || cell.flagged) return;

  // Start timer on first reveal
  if (!timerRunning && !field.minesPlaced) {
    startTime = performance.now();
    timerRunning = true;
  }

  const hitMine = reveal(field, r, c);

  if (hitMine) {
    playSound('boom');
    timerRunning = false;
    gameEnded = true;
    // Delay game-over screen so player sees the board
    setTimeout(() => {
      shell.setState('game-over');
    }, 1500);
  } else {
    playSound('reveal');
    if (checkWin(field)) {
      playSound('win');
      timerRunning = false;
      gameEnded = true;
      setTimeout(() => {
        shell.setState('game-over');
      }, 1000);
    }
  }
}

/**
 * Handle a long press (toggle flag).
 */
function handleLongPress(x, y) {
  if (!field || gameEnded) return;

  const cellPos = posToCell(x, y, layout.gridOffsetX, layout.gridOffsetY, layout.cellSize, field.rows, field.cols);
  if (!cellPos) return;

  const { r, c } = cellPos;
  toggleFlag(field, r, c);
  playSound('flag');
}

// --- Custom Input (long-press support) ---

function setupInput() {
  const canvas = shell.getCanvas();

  function getLogicalPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (LOGICAL_W / rect.width),
      y: (clientY - rect.top) * (LOGICAL_H / rect.height),
    };
  }

  function onPointerDown(x, y) {
    pressStart = performance.now();
    pressPos = { x, y };
    longPressFired = false;
    longPressTimeout = setTimeout(() => {
      longPressFired = true;
      handleLongPress(x, y);
    }, LONG_PRESS_MS);
  }

  function onPointerUp() {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }
    if (!longPressFired && pressPos) {
      handleTap(pressPos.x, pressPos.y);
    }
    pressPos = null;
  }

  function onPointerCancel() {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }
    pressPos = null;
    longPressFired = false;
  }

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const pos = getLogicalPos(e.clientX, e.clientY);
    onPointerDown(pos.x, pos.y);
  });
  canvas.addEventListener('mouseup', () => onPointerUp());
  canvas.addEventListener('mouseleave', () => onPointerCancel());

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const pos = getLogicalPos(t.clientX, t.clientY);
    onPointerDown(pos.x, pos.y);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    onPointerUp();
  }, { passive: false });
  canvas.addEventListener('touchcancel', () => onPointerCancel());

  // Keyboard: 'f' to flag (use last tap position)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      if (pressPos) {
        handleLongPress(pressPos.x, pressPos.y);
      }
    }
  });
}

// --- Difficulty Selector ---

function buildDifficultySelector() {
  const visual = document.getElementById('menu-visual');
  if (!visual) return;

  // Load saved difficulty
  const saved = getData('meme-sweeper', 'difficulty');
  if (saved && DIFFICULTIES[saved]) {
    difficulty = saved;
  }

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  for (const [key, cfg] of Object.entries(DIFFICULTIES)) {
    const btn = document.createElement('button');
    btn.textContent = cfg.label;
    btn.dataset.difficulty = key;
    if (key === difficulty) btn.classList.add('active');

    btn.addEventListener('click', () => {
      difficulty = key;
      setData('meme-sweeper', 'difficulty', key);
      container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });

    container.appendChild(btn);
  }

  visual.appendChild(container);
}

// --- Shell Callbacks ---

shell.onStart = () => {
  initAudio();
  registerSounds();

  const cfg = DIFFICULTIES[difficulty];
  field = createMinefield(cfg.rows, cfg.cols, cfg.mines);
  layout = computeLayout(cfg.rows, cfg.cols, LOGICAL_W, LOGICAL_H, HUD_HEIGHT);

  startTime = 0;
  elapsed = 0;
  timerRunning = false;
  gameEnded = false;
  pressPos = null;
  longPressFired = false;
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
  }
};

shell.onUpdate = (dt) => {
  if (timerRunning) {
    elapsed = (performance.now() - startTime) / 1000;
  }
};

shell.onRender = (ctx) => {
  if (!field || !layout) return;

  renderFrame(ctx, LOGICAL_W, LOGICAL_H, {
    field,
    gridOffsetX: layout.gridOffsetX,
    gridOffsetY: layout.gridOffsetY,
    cellSize: layout.cellSize,
    elapsed,
  });
};

shell.onGameOver = () => {
  const won = field && field.won;

  if (won) {
    // Count wrong flags
    let wrongFlags = 0;
    for (let r = 0; r < field.rows; r++) {
      for (let c = 0; c < field.cols; c++) {
        const cell = field.cells[r][c];
        if (cell.flagged && !cell.mine) wrongFlags++;
      }
    }
    const score = Math.max(5000 - Math.floor(elapsed) * 5 - wrongFlags * 100, 100);
    return {
      score,
      message: 'no cap you ate that',
      scoreLabel: 'score',
    };
  }

  return {
    score: 0,
    message: 'skill issue fr fr',
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!field || !layout) return;
  renderFrame(ctx, LOGICAL_W, LOGICAL_H, {
    field,
    gridOffsetX: layout.gridOffsetX,
    gridOffsetY: layout.gridOffsetY,
    cellSize: layout.cellSize,
    elapsed,
  });
};

// --- Init ---

shell.init();
setupInput();
buildDifficultySelector();
