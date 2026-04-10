/**
 * PEG SOLITAIRE -- Main Entry
 * Clear the board, leave one peg. Pure logic, zero luck.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createGameState,
  getMovesForPeg,
  executeMove,
  undoMove,
  checkGameOver,
  isPerfect,
  getScore,
  W,
  H,
} from './pegsolitaire.js';
import { render, pixelToGrid, isUndoHit } from './renderer.js';

// -- Game State --

/** @type {Object|null} */
let state = null;

/** @type {number} Elapsed time in frames for animation pulses */
let elapsed = 0;

/** @type {number} Timer before transitioning to game-over screen */
let gameOverTimer = 0;

/** @type {boolean} Whether game-over transition has been triggered */
let gameOverTriggered = false;

// -- Animation Constants --

const JUMP_ANIM_DURATION = 12;    // frames (~200ms)
const REMOVE_ANIM_DURATION = 10;  // frames (~167ms)
const GAME_OVER_DELAY = 120;      // frames (~2s)

// -- Shell Setup --

const shell = new GameShell({
  title: 'PEG SOLITAIRE',
  gameId: 'peg-solitaire',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'clear the board, leave one peg',
  accentColor: '#e8a43a',
});

// -- Sound Registration --

function registerSounds() {
  registerSound('select', {
    notes: [
      { type: 'sine', frequency: 600, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 800, duration: 0.04, delay: 0.04, gain: 0.08 },
    ],
  });

  registerSound('jump', {
    notes: [
      { type: 'triangle', frequency: 440, endFrequency: 660, duration: 0.1, gain: 0.15 },
    ],
  });

  registerSound('remove', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 100, duration: 0.15, gain: 0.1 },
    ],
  });

  registerSound('noMoves', {
    notes: [
      { type: 'square', frequency: 200, endFrequency: 120, duration: 0.3, gain: 0.15 },
      { type: 'square', frequency: 160, endFrequency: 80, duration: 0.3, delay: 0.3, gain: 0.12 },
    ],
  });

  registerSound('perfect', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.15, delay: 0.3, gain: 0.25 },
      { type: 'sine', frequency: 1319, duration: 0.2, delay: 0.45, gain: 0.2 },
    ],
  });

  registerSound('undo', {
    notes: [
      { type: 'sine', frequency: 500, endFrequency: 350, duration: 0.08, gain: 0.08 },
    ],
  });
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState();
  elapsed = 0;
  gameOverTimer = 0;
  gameOverTriggered = false;
};

shell.onUpdate = (dt) => {
  if (!state) return;
  elapsed += dt;

  // Handle jump animation
  if (state.animation) {
    state.animation.progress += dt / JUMP_ANIM_DURATION;
    if (state.animation.progress >= 1) {
      state.animation.progress = 1;

      // Finalize board state (restore the real positions after visual animation)
      if (state.animation.finalize) {
        state.animation.finalize();
      }

      // Start remove animation for the jumped-over peg
      state.removeAnimation = {
        r: state.animation.overR,
        c: state.animation.overC,
        progress: 0,
      };
      state.animation = null;
      playSound('remove');
    }
    return;
  }

  // Handle remove animation
  if (state.removeAnimation) {
    state.removeAnimation.progress += dt / REMOVE_ANIM_DURATION;
    if (state.removeAnimation.progress >= 1) {
      state.removeAnimation = null;

      // Check for game over after animations complete
      if (checkGameOver(state.board)) {
        state.gameOver = true;
        if (isPerfect(state)) {
          playSound('perfect');
        } else {
          playSound('noMoves');
        }
      }
    }
    return;
  }

  // Game over delay before showing overlay
  if (state.gameOver && !gameOverTriggered) {
    gameOverTimer += dt;
    if (gameOverTimer >= GAME_OVER_DELAY) {
      gameOverTriggered = true;
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state, elapsed);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const score = getScore(state);
  const perfect = isPerfect(state);
  let message = '';

  if (perfect) {
    message = 'absolute galaxy brain, perfect clear';
  } else if (score >= 28) {
    message = 'so close, almost had it fr';
  } else if (score >= 24) {
    message = 'solid run, keep cooking';
  } else if (score >= 18) {
    message = 'mid performance ngl';
  } else {
    message = 'skill issue detected';
  }

  return {
    score,
    message,
    scoreLabel: 'pegs removed',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) {
    render(ctx, state, elapsed);
  }
};

// -- Input Handling --

/**
 * Handle a tap/click at logical canvas coordinates.
 *
 * @param {{ x: number, y: number }} pos
 */
function handleTap(pos) {
  if (!state || state.gameOver) return;
  if (state.animation || state.removeAnimation) return;

  initAudio();

  // Check undo button
  if (isUndoHit(pos.x, pos.y)) {
    if (undoMove(state)) {
      playSound('undo');
    }
    return;
  }

  const cell = pixelToGrid(pos.x, pos.y);
  if (!cell) return;

  const { r, c } = cell;
  const { board, selectedPeg, validMoves } = state;

  // If a peg is selected, check if tapping a valid destination
  if (selectedPeg) {
    const move = validMoves.find((m) => m.toR === r && m.toC === c);
    if (move) {
      startJumpAnimation(move);
      return;
    }
  }

  // If tapping a peg, select it (or deselect if same peg)
  if (board[r] && board[r][c] === 1) {
    const moves = getMovesForPeg(board, r, c);
    if (moves.length > 0) {
      if (selectedPeg && selectedPeg.r === r && selectedPeg.c === c) {
        state.selectedPeg = null;
        state.validMoves = [];
      } else {
        state.selectedPeg = { r, c };
        state.validMoves = moves;
        playSound('select');
      }
    } else {
      state.selectedPeg = null;
      state.validMoves = [];
    }
    return;
  }

  // Tapping empty hole or off-board -- deselect
  state.selectedPeg = null;
  state.validMoves = [];
}

/**
 * Start the jump animation for a move.
 *
 * @param {Object} move
 */
function startJumpAnimation(move) {
  const { fromR, fromC, overR, overC, toR, toC } = move;

  // Execute the logical move immediately (updates board, history, pegsRemaining)
  executeMove(state, move);

  // Temporarily revert the visual board state so animation looks correct:
  // - Hide the peg at destination (it will be drawn by the animation)
  // - Show the jumped-over peg (it will be removed by the remove animation)
  state.board[toR][toC] = 0;
  state.board[overR][overC] = 1;

  state.animation = {
    fromR, fromC,
    toR, toC,
    overR, overC,
    progress: 0,
    finalize() {
      // Restore the real board state after animation completes
      state.board[toR][toC] = 1;
      state.board[overR][overC] = 0;
    },
  };

  playSound('jump');
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  /**
   * Convert a client event to logical canvas coordinates.
   *
   * @param {number} clientX
   * @param {number} clientY
   * @returns {{ x: number, y: number }}
   */
  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (shell.state === 'playing') {
      handleTap(toLogical(e.clientX, e.clientY));
    }
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (shell.state === 'playing') {
      const touch = e.changedTouches[0];
      handleTap(toLogical(touch.clientX, touch.clientY));
    }
  }, { passive: false });
});
