/**
 * MEME BLACKJACK -- Main Entry
 * Blackjack card game. Hit 21, stack chips, don't go broke.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createBlackjackState, deal, hit, stand, doubleDown, nextHand } from './blackjack.js';
import { render, W, H } from './renderer.js';

// -- Game State --
let state = null;

/** @type {Object} Button bounds from last render */
let buttonBounds = {};

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME BLACKJACK',
  gameId: 'meme-blackjack',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'hit me with that 21 no cap',
  accentColor: '#00e676',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('deal', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 600, duration: 0.06, gain: 0.1 },
      { type: 'square', frequency: 200, duration: 0.03, delay: 0.02, gain: 0.05, noise: true },
    ],
  });

  registerSound('hit', {
    notes: [
      { type: 'sine', frequency: 700, endFrequency: 500, duration: 0.05, gain: 0.1 },
    ],
  });

  registerSound('bust', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.3, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.1, delay: 0.1, gain: 0.1, noise: true },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.15, delay: 0.2, gain: 0.2 },
    ],
  });

  registerSound('push', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.15, gain: 0.12 },
      { type: 'sine', frequency: 440, duration: 0.15, delay: 0.2, gain: 0.12 },
    ],
  });

  registerSound('blackjack', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.16, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.24, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.3, delay: 0.3, gain: 0.15 },
    ],
  });
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createBlackjackState();
  buttonBounds = {};
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Play any queued sounds
  if (state.sounds && state.sounds.length > 0) {
    for (const snd of state.sounds) {
      playSound(snd);
    }
    state.sounds = [];
  }

  // Check for game over transition
  if (state.gameOver && state.phase === 'result') {
    // Let the result screen show briefly, then trigger game over
    if (!state._gameOverDelay) {
      state._gameOverDelay = 0;
    }
    state._gameOverDelay += dt;
    if (state._gameOverDelay > 90) { // ~1.5 seconds at 60fps
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  buttonBounds = render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const score = state.peakChips;
  let message;

  if (score <= 1000) {
    message = 'the house always wins fr';
  } else if (score <= 1500) {
    message = 'had a lil run ngl';
  } else if (score <= 2500) {
    message = 'certified card shark';
  } else if (score <= 5000) {
    message = 'casino is sweating rn';
  } else {
    message = 'bro broke the bank no cap';
  }

  return {
    score,
    message,
    scoreLabel: 'peak chips',
  };
};

// -- Input Helpers --

/**
 * Check if a point is inside a button bounds rect.
 */
function pointInBounds(pos, bounds) {
  return (
    pos.x >= bounds.x &&
    pos.x <= bounds.x + bounds.width &&
    pos.y >= bounds.y &&
    pos.y <= bounds.y + bounds.height
  );
}

/**
 * Handle a tap/click at a logical canvas position.
 */
function handleTapAt(pos) {
  if (!state) return;

  initAudio();

  if (state.phase === 'betting') {
    for (const bet of state.betOptions) {
      const key = `bet_${bet}`;
      if (buttonBounds[key] && pointInBounds(pos, buttonBounds[key])) {
        if (bet <= state.chips) {
          deal(state, bet);
        }
        return;
      }
    }
  } else if (state.phase === 'playing') {
    if (buttonBounds.hit && pointInBounds(pos, buttonBounds.hit)) {
      hit(state);
      return;
    }
    if (buttonBounds.stand && pointInBounds(pos, buttonBounds.stand)) {
      stand(state);
      return;
    }
    if (buttonBounds.double && pointInBounds(pos, buttonBounds.double)) {
      if (state.canDoubleDown) {
        doubleDown(state);
      }
      return;
    }
  } else if (state.phase === 'result' && !state.gameOver) {
    if (buttonBounds.nextHand && pointInBounds(pos, buttonBounds.nextHand)) {
      nextHand(state);
      return;
    }
  }
}

/**
 * Handle keyboard input.
 */
function handleKeyDown(e) {
  if (!state || shell.state !== 'playing') return;

  initAudio();

  if (state.phase === 'betting') {
    const betMap = { 'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3 };
    if (betMap[e.code] !== undefined) {
      const idx = betMap[e.code];
      if (idx < state.betOptions.length) {
        const bet = state.betOptions[idx];
        if (bet <= state.chips) {
          e.preventDefault();
          deal(state, bet);
        }
      }
    }
  } else if (state.phase === 'playing') {
    if (e.code === 'KeyH') {
      e.preventDefault();
      hit(state);
    } else if (e.code === 'KeyS') {
      e.preventDefault();
      stand(state);
    } else if (e.code === 'KeyD') {
      e.preventDefault();
      if (state.canDoubleDown) {
        doubleDown(state);
      }
    }
  } else if (state.phase === 'result' && !state.gameOver) {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      nextHand(state);
    }
  }
}

// -- Convert client coords to logical canvas space --
function clientToLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);

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
