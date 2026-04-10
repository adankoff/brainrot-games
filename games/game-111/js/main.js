/**
 * KNIFE HIT -- Main Entry
 * Stick the blade, don't hit a knife.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createGameState, startNewLevel, throwKnife, updateState, calculateScore,
} from './knifehit.js';
import { render, W, H } from './renderer.js';

// -- Game State --

/** @type {Object|null} */
let state = null;

/** @type {number} Delay timer for game-over transition */
let gameOverTimer = 0;

// -- Shell Setup --

const shell = new GameShell({
  title: 'KNIFE HIT',
  gameId: 'knife-hit',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'stick the blade, don\'t hit a knife',
  accentColor: '#ff6b35',
});

// -- Sound Registration --

function registerSounds() {
  // Throw whoosh
  registerSound('throw', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 600, duration: 0.08, gain: 0.1 },
      { type: 'sine', frequency: 200, endFrequency: 400, duration: 0.06, delay: 0.02, gain: 0.06 },
    ],
  });

  // Stick thunk
  registerSound('stick', {
    notes: [
      { type: 'sine', frequency: 120, endFrequency: 60, duration: 0.1, gain: 0.25 },
      { type: 'square', frequency: 80, duration: 0.04, gain: 0.08, noise: true },
    ],
  });

  // Hit clash (knife-on-knife)
  registerSound('clash', {
    notes: [
      { type: 'sawtooth', frequency: 800, endFrequency: 200, duration: 0.15, gain: 0.3 },
      { type: 'square', frequency: 600, endFrequency: 100, duration: 0.2, delay: 0.05, gain: 0.2 },
      { type: 'sine', frequency: 150, duration: 0.1, delay: 0.1, gain: 0.15, noise: true },
    ],
  });

  // Level up
  registerSound('levelUp', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState();
  startNewLevel(state);
  gameOverTimer = 0;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  const result = updateState(state, dt);

  // Handle events
  if (result.event === 'stick') {
    playSound('stick');
    // Check if level is clearing (all knives placed)
    if (state.levelClearing) {
      // Level clear sound plays after a brief delay
      setTimeout(() => playSound('levelUp'), 300);
    }
  } else if (result.event === 'hit') {
    playSound('clash');
    gameOverTimer = 0;
  } else if (result.event === 'levelUp') {
    // New level has started
  }

  // Handle game-over delay
  if (state.ended) {
    gameOverTimer += dt;
    if (gameOverTimer > 90) { // ~1.5 seconds
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

  const score = calculateScore(state);
  let message = '';

  if (state.level >= 10) {
    message = 'knife master no cap';
  } else if (state.level >= 5) {
    message = 'you cooked with those blades fr';
  } else if (state.totalKnivesStuck >= 10) {
    message = 'decent aim ngl';
  } else {
    message = 'blade game needs work ong';
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
 * Handle a tap/click -- throw a knife.
 */
function handleTap() {
  if (shell.state !== 'playing' || !state || state.ended) return;

  initAudio();

  if (throwKnife(state)) {
    playSound('throw');
  }
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    handleTap();
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleTap();
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleTap();
    }
  });
});
