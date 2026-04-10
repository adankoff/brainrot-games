/**
 * MEME REACT -- Main Entry
 * Test your reflexes. How fast can you react?
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createReactionState, updateReaction, handleTap,
  getAverageTime, calculateScore, getRating,
} from './reaction.js';
import { render, W, H } from './renderer.js';

// -- Game State --

/** @type {import('./reaction.js').ReactionState|null} */
let state = null;

/** @type {boolean} Whether game-over has been triggered for current game */
let gameOverTriggered = false;

/** @type {number} Timer for showing finished screen before game-over */
let finishedTimer = 0;

// -- Shell Setup --

const shell = new GameShell({
  title: 'MEME REACT',
  gameId: 'meme-react',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'test your reflexes. how fast can you react?',
  accentColor: '#00ff88',
});

// -- Sound Registration --

function registerSounds() {
  // Sharp beep when screen turns green
  registerSound('go', {
    notes: [
      { type: 'square', frequency: 880, endFrequency: 1100, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 1320, duration: 0.06, delay: 0.06, gain: 0.12 },
    ],
  });

  // Click sound on valid tap
  registerSound('tap', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 800, duration: 0.05, gain: 0.15 },
    ],
  });

  // Buzz sound for too-early tap
  registerSound('tooEarly', {
    notes: [
      { type: 'sawtooth', frequency: 120, endFrequency: 80, duration: 0.25, gain: 0.3 },
      { type: 'square', frequency: 90, duration: 0.1, delay: 0.05, gain: 0.15 },
    ],
  });

  // Fanfare on completion
  registerSound('complete', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.25, delay: 0.3, gain: 0.25 },
    ],
  });
}

// -- Tracking for "go" sound --

/** @type {boolean} Whether the go sound has been played for the current ready phase */
let goSoundPlayed = false;

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createReactionState();
  gameOverTriggered = false;
  finishedTimer = 0;
  goSoundPlayed = false;
};

shell.onUpdate = (_dt) => {
  if (!state) return;

  const now = performance.now();
  const prevPhase = state.phase;

  updateReaction(state, now);

  // Play "go" sound when transitioning to ready phase
  if (state.phase === 'ready' && prevPhase !== 'ready' && !goSoundPlayed) {
    playSound('go');
    goSoundPlayed = true;
  }

  // Reset goSoundPlayed when leaving ready phase
  if (state.phase !== 'ready') {
    goSoundPlayed = false;
  }

  // Handle finished state -- show for 1.5s then trigger game-over
  if (state.phase === 'finished' && !gameOverTriggered) {
    if (finishedTimer === 0) {
      finishedTimer = now;
      playSound('complete');
    }
    if (now - finishedTimer > 1500) {
      gameOverTriggered = true;
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

  const avg = getAverageTime(state);
  const score = calculateScore(state);
  const rating = getRating(avg);

  let message = rating;
  if (state.times.length === 0) {
    message = 'you tapped too early every time lmao';
  }

  return {
    score,
    message,
    scoreLabel: state.times.length > 0 ? `avg: ${avg}ms` : 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) {
    render(ctx, state);
  }
};

// -- Input Handling --

/**
 * Handle tap/click/key input during gameplay.
 */
function handleInput() {
  if (shell.state !== 'playing' || !state) return;
  if (state.phase === 'finished' || state.phase === 'between-rounds' || state.phase === 'too-early') return;

  initAudio();

  const now = performance.now();
  const result = handleTap(state, now);

  if (result === 'recorded') {
    playSound('tap');
  } else if (result === 'too-early') {
    playSound('tooEarly');
  }
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleInput();
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
  }, { passive: false });

  // Keyboard (Space or Enter)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleInput();
    }
  });
});
