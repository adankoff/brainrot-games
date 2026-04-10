/**
 * MEME SIMON -- Main Entry
 * Classic Simon Says memory game. Repeat the sequence or lose.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createSimonState,
  addToSequence,
  checkInput,
  updateSimon,
  W,
  H,
} from './simon.js';
import { render, hitTestQuadrant } from './renderer.js';

// -- Game State --
let state = null;

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME SIMON',
  gameId: 'meme-simon',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'how long can your brain hold on?',
  accentColor: '#44dd44',
});

// -- Sound Registration --
// Each quadrant gets a unique musical tone: C4, E4, G4, C5
const TONE_FREQUENCIES = [261.63, 329.63, 392.00, 523.25];

function registerSounds() {
  // Quadrant tones
  for (let i = 0; i < 4; i++) {
    registerSound(`tone-${i}`, {
      notes: [
        {
          type: 'sine',
          frequency: TONE_FREQUENCIES[i],
          duration: 0.35,
          gain: 0.25,
        },
      ],
    });
  }

  // Wrong answer buzz
  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 120, endFrequency: 80, duration: 0.4, gain: 0.3 },
      { type: 'square', frequency: 90, duration: 0.3, delay: 0.05, gain: 0.15 },
    ],
  });

  // Round complete
  registerSound('round-complete', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.16, gain: 0.2 },
    ],
  });
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createSimonState();
  // Start the first round
  addToSequence(state);
};

shell.onUpdate = (dt) => {
  if (!state) return;

  const { event, eventData } = updateSimon(state, dt);

  if (event === 'playback-note' && eventData >= 0) {
    playSound(`tone-${eventData}`);
  }

  if (event === 'next-round') {
    // Next round auto-started by addToSequence in updateSimon
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
    message = 'bruh. zero rounds.';
  } else if (score < 5) {
    message = 'goldfish memory fr';
  } else if (score < 10) {
    message = 'not bad, keep cooking';
  } else if (score < 15) {
    message = 'big brain energy';
  } else if (score < 20) {
    message = 'memory goat status';
  } else {
    message = 'actual savant detected';
  }

  return {
    score,
    message,
    scoreLabel: 'rounds',
  };
};

// -- Input Handling --

/**
 * Convert client coordinates to logical canvas space.
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
 * Handle a tap on a quadrant.
 */
function handleQuadrantTap(colorIndex) {
  if (!state || state.phase !== 'input') return;

  initAudio();

  const result = checkInput(state, colorIndex);

  if (result === 'correct') {
    playSound(`tone-${colorIndex}`);
  } else if (result === 'round-complete') {
    playSound('round-complete');
  } else if (result === 'wrong') {
    playSound('wrong');
  }
}

/**
 * Handle pointer/tap at a screen position.
 */
function handlePointerAt(clientX, clientY) {
  initAudio();
  const pos = clientToLogical(clientX, clientY);
  const quad = hitTestQuadrant(pos.x, pos.y);
  if (quad >= 0) {
    handleQuadrantTap(quad);
  }
}

// -- Keyboard Input --
// Keys 1-4 map directly; Arrow keys: Up=0(red), Right=1(blue), Down=2(green/BL), Left=3(yellow/BR)
// Alternative arrow mapping: Left=0(TL), Up=1(TR), Down=2(BL), Right=3(BR)
const KEY_MAP = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Numpad1: 0,
  Numpad2: 1,
  Numpad3: 2,
  Numpad4: 3,
  ArrowLeft: 0,   // Top-Left (red)
  ArrowUp: 1,     // Top-Right (blue)
  ArrowDown: 2,   // Bottom-Left (green)
  ArrowRight: 3,  // Bottom-Right (yellow)
};

function handleKeyDown(e) {
  const colorIndex = KEY_MAP[e.code];
  if (colorIndex !== undefined) {
    e.preventDefault();
    initAudio();
    handleQuadrantTap(colorIndex);
  }
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    handlePointerAt(e.clientX, e.clientY);
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handlePointerAt(touch.clientX, touch.clientY);
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
});
