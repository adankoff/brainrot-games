/**
 * CONNECT FOUR -- Main Entry
 * Drop discs, get four in a row, outsmart the AI.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createBoard, dropDisc, checkWin, aiMove, getValidColumns,
  isBoardFull, ROWS, COLS, EMPTY, PLAYER, AI,
} from './connect4.js';
import { render, xToCol, W, H } from './renderer.js';

// -- Game State --
let state = null;

/** @type {string} Selected difficulty */
let difficulty = 'medium';

/** @type {number} Keyboard-selected column (-1 = none) */
let kbCol = 3;

// -- Shell Setup --
const shell = new GameShell({
  title: 'CONNECT FOUR',
  gameId: 'connect-four',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'drop discs, get four in a row',
  accentColor: '#ffeb3b',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('drop', {
    notes: [
      { type: 'sine', frequency: 200, endFrequency: 120, duration: 0.08, gain: 0.25 },
      { type: 'square', frequency: 80, duration: 0.05, delay: 0.06, gain: 0.1, noise: true },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.25, delay: 0.3, gain: 0.3 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 100, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.15, delay: 0.2, gain: 0.1, noise: true },
    ],
  });

  registerSound('draw', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.15, gain: 0.15 },
      { type: 'sine', frequency: 440, duration: 0.15, delay: 0.2, gain: 0.15 },
    ],
  });
}

/**
 * Create a fresh game state.
 */
function createState() {
  return {
    board: createBoard(),
    turn: PLAYER,
    winner: null,       // PLAYER or AI or null
    winCells: null,     // Array of [row, col]
    draw: false,
    moveCount: 0,
    difficulty,
    hoverCol: -1,
    animating: false,
    animDisc: null,     // { col, targetRow, currentY, player }
    gameOverDelay: 0,
    ended: false,
    winPulse: 0,
  };
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createState();
  kbCol = 3;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Drop animation
  if (state.animating && state.animDisc) {
    const anim = state.animDisc;
    const speed = 0.25 * dt; // rows per frame
    anim.currentY += speed;

    if (anim.currentY >= anim.targetRow) {
      anim.currentY = anim.targetRow;
      state.animating = false;
      state.animDisc = null;

      playSound('drop');

      // Place the disc on the board
      state.board[anim.targetRow][anim.col] = anim.player;

      // Check win/draw after animation
      afterMove(anim.player);
    }
    return; // Don't process other logic during animation
  }

  // AI turn
  if (state.turn === AI && !state.winner && !state.draw && !state.animating) {
    // Small delay before AI moves
    if (!state._aiDelay) state._aiDelay = 0;
    state._aiDelay += dt;
    if (state._aiDelay > 30) { // ~0.5 seconds
      state._aiDelay = 0;
      const col = aiMove(state.board, state.difficulty);
      startDrop(col, AI);
    }
  }

  // Win pulse animation
  if (state.winCells) {
    state.winPulse += 0.08 * dt;
  }

  // Game over delay
  if (state.ended && !state._gameOverTriggered) {
    state.gameOverDelay += dt;
    if (state.gameOverDelay > 120) { // ~2 seconds
      state._gameOverTriggered = true;
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  let score = 0;
  let message = '';

  if (state.winner === PLAYER) {
    score = Math.max(100, 1000 - state.moveCount * 20);
    message = getDifficultyWinMessage();
  } else if (state.winner === AI) {
    score = 0;
    message = 'the AI got you fr fr';
  } else {
    score = 200;
    message = 'nobody wins, mid game ngl';
  }

  return {
    score,
    message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) {
    render(ctx, state);
  }
};

/**
 * Get a fun win message based on difficulty.
 */
function getDifficultyWinMessage() {
  switch (state.difficulty) {
    case 'easy': return 'ez clap, try harder difficulty';
    case 'medium': return 'nice W, you ate that up';
    case 'hard': return 'you cooked the hard AI no cap';
    default: return 'W';
  }
}

/**
 * Start a disc drop animation.
 */
function startDrop(col, player) {
  const valid = getValidColumns(state.board);
  if (!valid.includes(col)) return;

  // Find target row
  let targetRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state.board[r][col] === EMPTY) {
      targetRow = r;
      break;
    }
  }
  if (targetRow < 0) return;

  state.moveCount++;
  state.animating = true;
  state.animDisc = {
    col,
    targetRow,
    currentY: -1, // Start above the board
    player,
  };
}

/**
 * Process game state after a disc lands.
 */
function afterMove(player) {
  const winResult = checkWin(state.board);

  if (winResult) {
    state.winner = winResult.winner;
    state.winCells = winResult.cells;
    state.ended = true;

    if (winResult.winner === PLAYER) {
      playSound('win');
    } else {
      playSound('lose');
    }
    return;
  }

  if (isBoardFull(state.board)) {
    state.draw = true;
    state.ended = true;
    playSound('draw');
    return;
  }

  // Switch turns
  state.turn = player === PLAYER ? AI : PLAYER;
}

/**
 * Handle player tapping a column.
 */
function playerMove(col) {
  if (!state) return;
  if (state.turn !== PLAYER) return;
  if (state.winner || state.draw) return;
  if (state.animating) return;

  const valid = getValidColumns(state.board);
  if (!valid.includes(col)) return;

  initAudio();
  startDrop(col, PLAYER);
}

// -- Input Helpers --

function clientToLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

function handleTapAt(pos) {
  if (shell.state !== 'playing') return;
  const col = xToCol(pos.x);
  if (col >= 0) {
    playerMove(col);
  }
}

function handleMouseMove(e) {
  if (!state || shell.state !== 'playing') return;
  const pos = clientToLogical(e.clientX, e.clientY);
  state.hoverCol = xToCol(pos.x);
}

function handleMouseLeave() {
  if (state) state.hoverCol = -1;
}

function handleKeyDown(e) {
  if (!state || shell.state !== 'playing') return;
  if (state.turn !== PLAYER || state.winner || state.draw || state.animating) return;

  initAudio();

  // Number keys 1-7
  const numKey = parseInt(e.key, 10);
  if (numKey >= 1 && numKey <= 7) {
    e.preventDefault();
    playerMove(numKey - 1);
    return;
  }

  // Arrow keys
  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    kbCol = Math.max(0, kbCol - 1);
    state.hoverCol = kbCol;
    return;
  }
  if (e.code === 'ArrowRight') {
    e.preventDefault();
    kbCol = Math.min(COLS - 1, kbCol + 1);
    state.hoverCol = kbCol;
    return;
  }
  if (e.code === 'Enter' || e.code === 'Space') {
    e.preventDefault();
    playerMove(kbCol);
    return;
  }
}

// -- Difficulty Selector in Menu --

function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const levels = ['easy', 'medium', 'hard'];
  for (const level of levels) {
    const btn = document.createElement('button');
    btn.className = `difficulty-btn${level === difficulty ? ' active' : ''}`;
    btn.textContent = level;
    btn.addEventListener('click', () => {
      difficulty = level;
      // Update active state
      container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  }

  secondary.appendChild(container);
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();
  buildDifficultySelector();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    const pos = clientToLogical(e.clientX, e.clientY);
    handleTapAt(pos);
  });

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = clientToLogical(touch.clientX, touch.clientY);
    handleTapAt(pos);
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
});
