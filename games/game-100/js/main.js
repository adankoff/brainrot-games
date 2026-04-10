/**
 * MEME REVERSI -- Main Entry
 * Flip discs, dominate the board, out-brain the AI.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createBoard, getFlips, getValidMoves, placeDisc, countDiscs,
  isGameOver, aiMove, SIZE, EMPTY, BLACK, WHITE,
} from './reversi.js';
import { render, posToCell, W, H } from './renderer.js';

// -- Game State --
let state = null;

/** @type {string} Selected difficulty */
let difficulty = 'medium';

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME REVERSI',
  gameId: 'meme-reversi',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'flip discs, dominate the board',
  accentColor: '#c8ff00',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 250, duration: 0.06, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.03, delay: 0.04, gain: 0.08, noise: true },
    ],
  });

  registerSound('flip', {
    notes: [
      { type: 'sine', frequency: 500, endFrequency: 600, duration: 0.08, gain: 0.1 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'square', frequency: 150, endFrequency: 100, duration: 0.12, gain: 0.15 },
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

  registerSound('pass', {
    notes: [
      { type: 'sine', frequency: 330, duration: 0.1, gain: 0.12 },
      { type: 'sine', frequency: 260, duration: 0.1, delay: 0.1, gain: 0.12 },
    ],
  });
}

/**
 * Create a fresh game state.
 */
function createState() {
  const board = createBoard();
  const validMoves = getValidMoves(board, BLACK);
  const counts = countDiscs(board);

  return {
    board,
    turn: BLACK,
    difficulty,
    validMoves,
    counts,
    lastMove: null,
    animating: false,
    flipAnims: [],       // Array of { row, col, fromPlayer, toPlayer, progress, delay }
    placeAnim: null,     // { row, col, player, scale }
    ended: false,
    passed: false,
    passMessage: '',
    passTimer: 0,
    gameOverDelay: 0,
    _gameOverTriggered: false,
    _aiDelay: 0,
  };
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createState();
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Pass message timer
  if (state.passed) {
    state.passTimer -= dt;
    if (state.passTimer <= 0) {
      state.passed = false;
      state.passMessage = '';
    }
  }

  // Placement scale-in animation
  if (state.placeAnim) {
    state.placeAnim.scale += 0.12 * dt;
    if (state.placeAnim.scale >= 1.0) {
      state.placeAnim.scale = 1.0;
      state.placeAnim = null;
    }
  }

  // Flip animations
  if (state.flipAnims.length > 0) {
    state.animating = true;
    let allDone = true;

    for (const anim of state.flipAnims) {
      if (anim.delay > 0) {
        anim.delay -= dt * (1 / 60) * 1000; // dt is normalized to 60fps frames
        if (anim.delay > 0) {
          allDone = false;
          continue;
        }
      }
      anim.progress += 0.04 * dt;
      if (anim.progress < 1.0) {
        allDone = false;
      } else {
        anim.progress = 1.0;
      }
    }

    if (allDone) {
      // Play flip sound for batch
      playSound('flip');
      state.flipAnims = [];
      state.animating = false;
      // Update counts after flip animation completes
      state.counts = countDiscs(state.board);
      afterMoveComplete();
    }
    return;
  }

  // AI turn
  if (state.turn === WHITE && !state.ended && !state.animating && !state.passed) {
    if (!state._aiDelay) state._aiDelay = 0;
    state._aiDelay += dt;
    if (state._aiDelay > 30) { // ~0.5 seconds
      state._aiDelay = 0;
      executeAiMove();
    }
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

  const counts = state.counts || countDiscs(state.board);
  const score = counts.black * 10;
  let message = '';

  if (counts.black > counts.white) {
    message = getDifficultyWinMessage();
  } else if (counts.white > counts.black) {
    message = 'the AI flipped you no cap';
  } else {
    message = 'perfectly balanced, as all things should be';
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
    case 'medium': return 'you ate that up fr fr';
    case 'hard': return 'you cooked the hard AI no cap';
    default: return 'W';
  }
}

/**
 * Execute a move (player or AI): place disc, start flip animations.
 * @param {number} row
 * @param {number} col
 * @param {number} player
 */
function executeMove(row, col, player) {
  const flips = getFlips(state.board, row, col, player);
  if (flips.length === 0) return;

  // Place the disc on the board immediately (including flips)
  placeDisc(state.board, row, col, player, flips);

  state.lastMove = { row, col };
  state.animating = true;

  // Place animation (scale in)
  state.placeAnim = { row, col, player, scale: 0.3 };

  playSound('place');

  // Build flip animations with staggered delays
  state.flipAnims = flips.map((flip, i) => ({
    row: flip[0],
    col: flip[1],
    fromPlayer: player === BLACK ? WHITE : BLACK,
    toPlayer: player,
    progress: 0,
    delay: i * 40, // stagger by 40ms
  }));

  // If no flips to animate, immediately proceed
  if (state.flipAnims.length === 0) {
    state.animating = false;
    state.counts = countDiscs(state.board);
    afterMoveComplete();
  }
}

/**
 * Called after a move's animations are fully complete.
 * Handles turn switching, pass detection, game over.
 */
function afterMoveComplete() {
  // Check game over
  if (isGameOver(state.board)) {
    state.ended = true;
    const counts = countDiscs(state.board);
    state.counts = counts;
    if (counts.black > counts.white) {
      playSound('win');
    } else {
      playSound('lose');
    }
    return;
  }

  // Switch turns
  const nextPlayer = state.turn === BLACK ? WHITE : BLACK;
  const nextMoves = getValidMoves(state.board, nextPlayer);

  if (nextMoves.length > 0) {
    state.turn = nextPlayer;
    state.validMoves = nextMoves;
    state._aiDelay = 0;
  } else {
    // Next player has no moves -- pass
    const currentMoves = getValidMoves(state.board, state.turn);
    if (currentMoves.length > 0) {
      // Keep current player's turn, show pass message
      state.passed = true;
      state.passMessage = nextPlayer === BLACK ? 'NO MOVES -- YOUR TURN PASSED' : 'AI HAS NO MOVES -- YOUR TURN';
      state.passTimer = 90; // ~1.5 seconds at 60fps
      state.validMoves = currentMoves;
      state._aiDelay = 0;
      playSound('pass');
    } else {
      // Neither player can move -- game over
      state.ended = true;
      const counts = countDiscs(state.board);
      state.counts = counts;
      if (counts.black > counts.white) {
        playSound('win');
      } else {
        playSound('lose');
      }
    }
  }
}

/**
 * Execute the AI's move.
 */
function executeAiMove() {
  const moves = getValidMoves(state.board, WHITE);
  if (moves.length === 0) return;

  const chosen = aiMove(state.board, state.difficulty);
  // The aiMove works on a separate evaluation; we need to apply it to the actual board
  // Verify the chosen move is valid on the current board
  const flips = getFlips(state.board, chosen.row, chosen.col, WHITE);
  if (flips.length === 0) {
    // Fallback: pick first valid move
    executeMove(moves[0].row, moves[0].col, WHITE);
    return;
  }
  executeMove(chosen.row, chosen.col, WHITE);
}

/**
 * Handle player tapping a cell.
 */
function playerMove(row, col) {
  if (!state) return;
  if (state.turn !== BLACK) return;
  if (state.ended) return;
  if (state.animating) return;

  initAudio();

  // Check if this is a valid move
  const flips = getFlips(state.board, row, col, BLACK);
  if (flips.length === 0) {
    playSound('invalid');
    return;
  }

  executeMove(row, col, BLACK);
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
  const cell = posToCell(pos.x, pos.y);
  if (cell) {
    playerMove(cell.row, cell.col);
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

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = clientToLogical(touch.clientX, touch.clientY);
    handleTapAt(pos);
  }, { passive: false });
});
