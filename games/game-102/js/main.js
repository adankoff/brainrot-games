/**
 * MEME MIND -- Main Entry
 * Crack the code, prove your brain ain't rotted.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createGameState, placeColorAt, removeLastColor,
  isGuessComplete, submitGuess, calculateScore,
} from './mastermind.js';
import {
  render, W, H,
  getPegSlotPos, getPalettePos, getSubmitBounds, getUndoBounds,
} from './renderer.js';

// -- Game State --

/** @type {Object|null} */
let state = null;

/** @type {string} Selected difficulty */
let difficulty = 'normal';

/** @type {number} Delay timer for game-over transition */
let gameOverTimer = 0;

// -- Shell Setup --

const shell = new GameShell({
  title: 'MEME MIND',
  gameId: 'meme-mind',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'crack the code, prove your brain ain\'t rotted',
  accentColor: '#c8ff00',
});

// -- Sound Registration --

function registerSounds() {
  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 520, endFrequency: 580, duration: 0.06, gain: 0.12 },
    ],
  });

  registerSound('submit', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.08, gain: 0.15 },
      { type: 'triangle', frequency: 550, duration: 0.08, delay: 0.06, gain: 0.15 },
    ],
  });

  registerSound('blackPeg', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.1, gain: 0.18 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.12 },
    ],
  });

  registerSound('whitePeg', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.12 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.3, delay: 0.3, gain: 0.3 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 100, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.15, delay: 0.2, gain: 0.1, noise: true },
    ],
  });
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState(difficulty);
  gameOverTimer = 0;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Handle game-over delay
  if (state.ended && !state._gameOverTriggered) {
    gameOverTimer += dt;
    if (gameOverTimer > 120) { // ~2 seconds
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

  if (state.won) {
    score = calculateScore(state.guessCount);
    if (state.guessCount === 1) {
      message = 'first try?? actual goat';
    } else if (state.guessCount <= 3) {
      message = 'galaxy brain energy fr fr';
    } else if (state.guessCount <= 6) {
      message = 'you cooked that no cap';
    } else {
      message = 'just barely made it ngl';
    }
  } else {
    score = 0;
    message = 'your brain is fully rotted';
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

// -- Input Handling --

/**
 * Convert client coordinates to logical canvas coordinates.
 *
 * @param {number} clientX
 * @param {number} clientY
 * @returns {{ x: number, y: number }}
 */
function clientToLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

/**
 * Check if a point is within a circle.
 *
 * @param {{ x: number, y: number }} point
 * @param {{ x: number, y: number, radius: number }} circle
 * @returns {boolean}
 */
function hitCircle(point, circle) {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Check if a point is within a rectangle.
 *
 * @param {{ x: number, y: number }} point
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @returns {boolean}
 */
function hitRect(point, rect) {
  return (
    point.x >= rect.x && point.x <= rect.x + rect.width &&
    point.y >= rect.y && point.y <= rect.y + rect.height
  );
}

/**
 * Handle a tap at logical coordinates.
 *
 * @param {{ x: number, y: number }} pos
 */
function handleTapAt(pos) {
  if (shell.state !== 'playing' || !state || state.ended) return;

  initAudio();

  // Check palette taps
  for (let i = 0; i < state.colors.length; i++) {
    const pp = getPalettePos(i, state.colors.length);
    if (hitCircle(pos, { x: pp.x, y: pp.y, radius: pp.radius + 4 })) {
      state.selectedColor = state.colors[i];
      playSound('place');
      return;
    }
  }

  // Check current guess slot taps (place selected color)
  if (state.selectedColor) {
    const currentRow = state.guesses.length;
    for (let j = 0; j < state.pegs; j++) {
      const sp = getPegSlotPos(currentRow, j, state.pegs);
      if (hitCircle(pos, { x: sp.x, y: sp.y, radius: sp.radius + 4 })) {
        placeColorAt(state, j, state.selectedColor);
        playSound('place');
        return;
      }
    }
  }

  // Check submit button
  if (hitRect(pos, getSubmitBounds()) && isGuessComplete(state)) {
    doSubmit();
    return;
  }

  // Check undo button
  if (hitRect(pos, getUndoBounds()) && state.currentGuess.length > 0) {
    removeLastColor(state);
    playSound('place');
    return;
  }
}

/**
 * Submit the current guess and play feedback sounds.
 */
function doSubmit() {
  if (!state || !isGuessComplete(state)) return;

  const feedback = submitGuess(state);
  if (!feedback) return;

  playSound('submit');

  // Play feedback peg sounds with delays
  let delay = 200;
  for (let i = 0; i < feedback.black; i++) {
    setTimeout(() => playSound('blackPeg'), delay);
    delay += 150;
  }
  for (let i = 0; i < feedback.white; i++) {
    setTimeout(() => playSound('whitePeg'), delay);
    delay += 150;
  }

  // Play win/lose sounds
  if (state.won) {
    setTimeout(() => playSound('win'), delay + 200);
    gameOverTimer = 0;
  } else if (state.lost) {
    setTimeout(() => playSound('lose'), delay + 200);
    gameOverTimer = 0;
  }
}

// -- Difficulty Selector --

function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const levels = ['normal', 'hard'];
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

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (shell.state !== 'playing' || !state || state.ended) return;

    initAudio();

    // Number keys to select colors (1-based)
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= state.colors.length) {
      e.preventDefault();
      state.selectedColor = state.colors[num - 1];
      playSound('place');
      return;
    }

    // Enter to submit
    if (e.code === 'Enter' && isGuessComplete(state)) {
      e.preventDefault();
      doSubmit();
      return;
    }

    // Backspace to undo
    if (e.code === 'Backspace') {
      e.preventDefault();
      removeLastColor(state);
      return;
    }
  });
});
