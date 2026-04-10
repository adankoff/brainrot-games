/**
 * MEME CROSS -- Main Entry
 * Crossy Road clone. Hop across roads, rivers, and railroads.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createCrossyState, update, hop, W, H } from './crossy.js';
import { render } from './renderer.js';

// -- Game State --
let state = null;

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME CROSS',
  gameId: 'meme-cross',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'why did the meme cross the road?',
  accentColor: '#5dde3b',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('hop', {
    notes: [
      { type: 'square', frequency: 500, endFrequency: 600, duration: 0.06, gain: 0.12 },
    ],
  });

  registerSound('splash', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 100, duration: 0.3, gain: 0.2 },
      { type: 'sine', frequency: 200, duration: 0.15, gain: 0.15, noise: true },
    ],
  });

  registerSound('honk', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.25, gain: 0.25 },
      { type: 'square', frequency: 140, duration: 0.15, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('train', {
    notes: [
      { type: 'sawtooth', frequency: 100, endFrequency: 60, duration: 0.4, gain: 0.3 },
      { type: 'square', frequency: 80, duration: 0.3, delay: 0.1, gain: 0.15 },
    ],
  });

  registerSound('coin', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('train-warning', {
    notes: [
      { type: 'square', frequency: 800, duration: 0.1, gain: 0.15 },
      { type: 'square', frequency: 600, duration: 0.1, delay: 0.15, gain: 0.15 },
    ],
  });
}

// -- Input State --
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 20;

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createCrossyState();
};

shell.onUpdate = (dt) => {
  if (!state) return;

  const prevScore = state.score;
  const { event, eventData } = update(state, dt);

  // Play coin sound on score increase from coins
  if (state.score > prevScore && state.coinsCollected > 0) {
    // Check if it was a coin (score jumped by 5+)
  }

  if (event === 'death') {
    switch (eventData) {
      case 'water':
        playSound('splash');
        break;
      case 'car':
        playSound('honk');
        break;
      case 'train':
        playSound('train');
        break;
      default:
        playSound('honk');
    }
  }

  if (event === 'game-over-ready') {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const score = state.score;
  let message;

  if (score === 0) {
    message = 'skill issue fr fr';
  } else if (score < 10) {
    message = 'bro didnt even try';
  } else if (score < 25) {
    message = 'not bad for a noob';
  } else if (score < 50) {
    message = 'lowkey kinda cooking';
  } else if (score < 100) {
    message = 'crossing god energy';
  } else {
    message = 'actual road warrior';
  }

  return {
    score,
    message,
    scoreLabel: 'lanes crossed',
  };
};

// -- Input Handling --

/**
 * Convert client coordinates to logical canvas coordinates.
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
 * Process a directional input.
 */
function doHop(direction) {
  if (!state || !state.alive) return;
  initAudio();

  const success = hop(state, direction);
  if (success) {
    playSound('hop');

    // Check if we collected a coin (score jumped by 5+)
    // The hop function handles coin collection internally
  }
}

/**
 * Handle a tap at a logical position (for tap-based directional input).
 */
function handleTapDirection(lx, ly) {
  // Divide screen into zones:
  // Top 40% = forward
  // Bottom 20% = backward
  // Left/Right sides (middle 40% of height) = left/right
  const yRatio = ly / H;

  if (yRatio < 0.4) {
    doHop('forward');
  } else if (yRatio > 0.8) {
    doHop('backward');
  } else {
    // Middle zone: left or right based on X
    if (lx < W / 2) {
      doHop('left');
    } else {
      doHop('right');
    }
  }
}

/**
 * Handle swipe gesture.
 */
function handleSwipe(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    doHop(dx > 0 ? 'right' : 'left');
  } else {
    // Vertical swipe (screen Y is inverted: negative dy = swipe up = forward)
    doHop(dy < 0 ? 'forward' : 'backward');
  }
}

// -- Keyboard Input --
const KEY_MAP = {
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'forward',
};

function handleKeyDown(e) {
  if (shell.state !== 'playing') return;

  const direction = KEY_MAP[e.code];
  if (direction) {
    e.preventDefault();
    doHop(direction);
  }
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse click
  canvas.addEventListener('mousedown', (e) => {
    if (shell.state !== 'playing') return;
    const pos = clientToLogical(e.clientX, e.clientY);
    handleTapDirection(pos.x, pos.y);
  });

  // Touch: detect swipe vs tap
  canvas.addEventListener('touchstart', (e) => {
    if (shell.state !== 'playing') return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (shell.state !== 'playing') return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - touchStartTime;

    if (dist > SWIPE_THRESHOLD && elapsed < 500) {
      handleSwipe(dx, dy);
    } else {
      // Treat as tap
      const pos = clientToLogical(touch.clientX, touch.clientY);
      handleTapDirection(pos.x, pos.y);
    }
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
});
