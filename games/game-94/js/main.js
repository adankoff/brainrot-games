/**
 * MEME JUMP -- Main Entry
 * Doodle Jump clone. Bounce to the top, avoid falling off.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createJumpState, update, getEntities, W, H } from './jump.js';
import { render } from './renderer.js';

// -- Game State --
let state = null;

/** @type {number} Horizontal input: -1 left, 0 none, +1 right */
let inputX = 0;

/** @type {Set<string>} Currently held keys */
const keysDown = new Set();

/** @type {number|null} Active touch identifier for movement */
let activeTouchId = null;

/** @type {number} Touch x position for movement */
let touchX = 0;

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME JUMP',
  gameId: 'meme-jump',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'jump higher than your attention span',
  accentColor: '#44ff44',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('bounce', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 520, duration: 0.08, gain: 0.15 },
    ],
  });

  registerSound('spring', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 900, duration: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 800, endFrequency: 1200, duration: 0.08, delay: 0.05, gain: 0.15 },
    ],
  });

  registerSound('break', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 80, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.08, delay: 0.05, gain: 0.1, noise: true },
    ],
  });

  // gameover is already a built-in preset in sound-manager
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createJumpState();
  inputX = 0;
  keysDown.clear();
  activeTouchId = null;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Compute inputX from held keys
  computeInputFromKeys();

  const result = update(state, inputX, dt);

  for (const snd of result.sounds) {
    playSound(snd);
  }

  if (state.gameOver) {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  const entities = getEntities(state);
  render(ctx, entities);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const score = state.score;
  let message;

  if (score < 50) {
    message = 'bro fell off instantly';
  } else if (score < 200) {
    message = 'skill issue detected';
  } else if (score < 500) {
    message = 'not bad, keep bouncing';
  } else if (score < 1000) {
    message = 'jumping goat fr fr';
  } else if (score < 2000) {
    message = 'absolutely cracked';
  } else {
    message = 'touch grass? nah touch sky';
  }

  return {
    score,
    message,
    scoreLabel: 'height',
  };
};

// -- Input Handling --

/**
 * Compute inputX from currently held keyboard keys.
 */
function computeInputFromKeys() {
  // Keyboard takes priority if keys are held
  const left = keysDown.has('ArrowLeft') || keysDown.has('KeyA');
  const right = keysDown.has('ArrowRight') || keysDown.has('KeyD');

  if (left && !right) {
    inputX = -1;
  } else if (right && !left) {
    inputX = 1;
  } else if (!left && !right && activeTouchId === null) {
    inputX = 0;
  }
  // If touch is active, inputX is set by touch handlers
}

function handleKeyDown(e) {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
      e.code === 'KeyA' || e.code === 'KeyD') {
    e.preventDefault();
    keysDown.add(e.code);
  }
}

function handleKeyUp(e) {
  keysDown.delete(e.code);
}

/**
 * Convert client coordinates to logical canvas space.
 */
function clientToLogical(clientX) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return (clientX - rect.left) * (W / rect.width);
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Mouse (for desktop testing -- hold and drag)
  let mouseDown = false;

  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    mouseDown = true;
    const lx = clientToLogical(e.clientX);
    inputX = lx < W / 2 ? -1 : 1;
  });

  document.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const lx = clientToLogical(e.clientX);
    inputX = lx < W / 2 ? -1 : 1;
  });

  document.addEventListener('mouseup', () => {
    mouseDown = false;
    if (activeTouchId === null) {
      inputX = 0;
    }
  });

  // Touch (tap left/right halves, or drag)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    touchX = clientToLogical(touch.clientX);
    inputX = touchX < W / 2 ? -1 : 1;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        touchX = clientToLogical(touch.clientX);
        inputX = touchX < W / 2 ? -1 : 1;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        activeTouchId = null;
        if (!keysDown.has('ArrowLeft') && !keysDown.has('ArrowRight') &&
            !keysDown.has('KeyA') && !keysDown.has('KeyD')) {
          inputX = 0;
        }
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => {
    activeTouchId = null;
    inputX = 0;
  });
});
