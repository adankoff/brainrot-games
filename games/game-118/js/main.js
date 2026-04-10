/**
 * MEME GALAGA -- Main Entry
 * Blast aliens, dodge dives, stack points no cap.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createGameState, update,
  consumeDestroyedAliens, consumePlayerHit, consumeDiveEvent,
  W, H,
} from './galaga.js';
import { render } from './renderer.js';

// -- Game State --

/** @type {Object|null} */
let state = null;

/** @type {boolean} Track if fire sound needs to play */
let lastBulletCount = 0;

/** @type {number} Previous wave for wave sound */
let lastWave = 0;

// -- Shell Setup --

const shell = new GameShell({
  title: 'MEME GALAGA',
  gameId: 'meme-galaga',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'blast aliens, dodge dives, stack points no cap',
  accentColor: '#00ffcc',
});

// -- Sound Registration --

function registerSounds() {
  registerSound('shoot', {
    notes: [
      { type: 'square', frequency: 800, endFrequency: 600, duration: 0.06, gain: 0.1 },
    ],
  });

  registerSound('alienExplode', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 50, duration: 0.15, gain: 0.15 },
      { type: 'sine', frequency: 100, duration: 0.08, delay: 0.02, gain: 0.1, noise: true },
    ],
  });

  registerSound('playerHit', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 40, duration: 0.35, gain: 0.25 },
      { type: 'sine', frequency: 80, duration: 0.15, delay: 0.1, gain: 0.15, noise: true },
    ],
  });

  registerSound('dive', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 600, duration: 0.12, gain: 0.08 },
      { type: 'sine', frequency: 600, endFrequency: 400, duration: 0.12, delay: 0.1, gain: 0.08 },
    ],
  });

  registerSound('wave', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.15, gain: 0.2 },
      { type: 'triangle', frequency: 550, duration: 0.15, delay: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 660, duration: 0.15, delay: 0.24, gain: 0.2 },
      { type: 'triangle', frequency: 880, duration: 0.25, delay: 0.36, gain: 0.25 },
    ],
  });
}

// -- Input Tracking --

const keys = {};

function setupInput() {
  document.addEventListener('keydown', (e) => {
    if (shell.state !== 'playing') return;
    initAudio();

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      keys.left = true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      keys.right = true;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      keys.fire = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      keys.left = false;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      keys.right = false;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      keys.fire = false;
    }
  });

  // Touch controls
  const canvas = shell.getCanvas();
  let touchId = null;
  let touchStartX = 0;
  let touchPlayerStartX = 0;
  let touchFiring = false;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (shell.state !== 'playing' || !state) return;
    initAudio();

    const touch = e.changedTouches[0];
    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchPlayerStartX = state.player.x;
    touchFiring = true;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!state || touchId === null) return;

    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        const rect = canvas.getBoundingClientRect();
        const scale = W / rect.width;
        const dx = (touch.clientX - touchStartX) * scale;
        state.player.x = Math.max(12, Math.min(W - 12, touchPlayerStartX + dx));
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        touchId = null;
        touchFiring = false;
      }
    }
  }, { passive: false });

  // Store touch firing getter
  return {
    getInput() {
      return {
        left: keys.left || false,
        right: keys.right || false,
        fire: (keys.fire || false) || touchFiring,
      };
    },
  };
}

// -- Shell Callbacks --

let inputHandler = null;

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState();
  lastBulletCount = 0;
  lastWave = 1;

  // Clear held keys
  keys.left = false;
  keys.right = false;
  keys.fire = false;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Sync input
  if (inputHandler) {
    state.input = inputHandler.getInput();
  }

  const prevBulletCount = state.playerBullets.length;
  const prevWave = state.wave;

  // Update game logic
  update(state, dt);

  // Sound: shoot
  if (state.playerBullets.length > prevBulletCount) {
    playSound('shoot');
  }

  // Sound: alien exploded
  const destroyed = consumeDestroyedAliens(state);
  if (destroyed.length > 0) {
    playSound('alienExplode');
  }

  // Sound: player hit
  if (consumePlayerHit(state)) {
    playSound('playerHit');
  }

  // Sound: dive started
  if (consumeDiveEvent(state)) {
    playSound('dive');
  }

  // Sound: new wave
  if (state.wave > prevWave) {
    playSound('wave');
  }

  // Game over
  if (state.ended && state.gameOverTimer > 90) {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const wave = state.wave;
  let message = '';

  if (wave <= 1) {
    message = 'skill issue fr fr';
  } else if (wave <= 3) {
    message = 'you tried ngl';
  } else if (wave <= 6) {
    message = 'lowkey decent run';
  } else if (wave <= 10) {
    message = 'actual galactic defender';
  } else {
    message = 'goated alien slayer no cap';
  }

  return {
    score: state.score,
    message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) {
    render(ctx, state);
  }
};

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();
  inputHandler = setupInput();
});
