/**
 * HIGHER LOWER -- Main Entry
 * Guess if the next card is higher or lower. Simple. Addictive.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createState, guess, getCurrentCard, advanceAfterReveal } from './highlow.js';
import { render, createAnimState, W, H } from './renderer.js';

// -- Game State --
let state = null;

/** @type {import('./renderer.js').AnimState} */
let anim = createAnimState();

/** @type {Object} Button bounds from last render */
let buttonBounds = {};

/** @type {boolean} Whether we're waiting for reveal anim to finish */
let revealLocked = false;

/** @type {number} Timer after reveal completes before advancing */
let postRevealTimer = 0;

const POST_REVEAL_CORRECT_DELAY = 40;  // ~0.67s at 60fps
const POST_REVEAL_WRONG_DELAY = 80;    // ~1.33s at 60fps
const FLIP_SPEED = 0.05;               // progress per frame at 60fps

// -- Shell Setup --
const shell = new GameShell({
  title: 'HIGHER LOWER',
  gameId: 'higher-lower',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'is the next card higher or lower?',
  accentColor: '#c8ff00',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('flip', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 600, duration: 0.06, gain: 0.1 },
      { type: 'square', frequency: 200, duration: 0.03, delay: 0.02, gain: 0.05, noise: true },
    ],
  });

  registerSound('correct', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.3, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.1, delay: 0.1, gain: 0.1, noise: true },
    ],
  });

  registerSound('streak', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.16, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.15, delay: 0.24, gain: 0.25 },
    ],
  });
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createState();
  anim = createAnimState();
  buttonBounds = {};
  revealLocked = false;
  postRevealTimer = 0;
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

  // Flip animation
  if (state.phase === 'revealing') {
    if (anim.flipProgress < 1) {
      anim.flipProgress = Math.min(anim.flipProgress + FLIP_SPEED * dt, 1);
    } else {
      // Flip done, count down post-reveal timer
      postRevealTimer += dt;
      const delay = state.lastResult === 'correct'
        ? POST_REVEAL_CORRECT_DELAY
        : POST_REVEAL_WRONG_DELAY;

      if (postRevealTimer >= delay) {
        advanceAfterReveal(state);
        postRevealTimer = 0;
        revealLocked = false;

        if (state.phase === 'gameover') {
          shell.setState('game-over');
        }
      }
    }
  }

  // Flash timer
  if (anim.flashTimer > 0) {
    anim.flashTimer -= dt;
    if (anim.flashTimer <= 0) {
      anim.flashTimer = 0;
      anim.flashColor = null;
    }
  }

  // Streak pop timer
  if (anim.streakPopTimer > 0) {
    anim.streakPopTimer -= dt;
    if (anim.streakPopTimer <= 0) {
      anim.streakPopTimer = 0;
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  buttonBounds = render(ctx, state, anim);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const score = state.score;
  const streak = state.streak;
  let message;

  if (streak <= 2) {
    message = 'skill issue fr';
  } else if (streak <= 5) {
    message = 'not bad ngl';
  } else if (streak <= 10) {
    message = 'kinda goated';
  } else if (streak <= 20) {
    message = 'certified psychic';
  } else {
    message = 'bro sees the future no cap';
  }

  return {
    score,
    message,
    scoreLabel: 'total points',
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
 * Process a guess input.
 */
function makeGuess(direction) {
  if (!state || state.phase !== 'guessing' || revealLocked) return;

  initAudio();
  revealLocked = true;

  const result = guess(state, direction);

  // Start flip animation
  anim.flipProgress = 0;
  postRevealTimer = 0;

  // Flash
  if (result.correct) {
    anim.flashColor = 'rgba(0, 200, 83, 0.3)';
    anim.flashTimer = 20;

    // Streak milestone pop
    if (result.streak > 0 && result.streak % 5 === 0) {
      anim.streakPopTimer = 40;
      anim.streakPopValue = result.streak;
    }
  } else {
    anim.flashColor = 'rgba(229, 57, 53, 0.3)';
    anim.flashTimer = 30;
  }
}

/**
 * Handle a tap/click at a logical canvas position.
 */
function handleTapAt(pos) {
  if (!state || shell.state !== 'playing') return;

  if (state.phase === 'guessing') {
    if (buttonBounds.higher && pointInBounds(pos, buttonBounds.higher)) {
      makeGuess('higher');
      return;
    }
    if (buttonBounds.lower && pointInBounds(pos, buttonBounds.lower)) {
      makeGuess('lower');
      return;
    }
  }
}

/**
 * Handle keyboard input.
 */
function handleKeyDown(e) {
  if (!state || shell.state !== 'playing') return;

  if (state.phase === 'guessing' && !revealLocked) {
    if (e.code === 'ArrowUp' || e.code === 'KeyH') {
      e.preventDefault();
      makeGuess('higher');
    } else if (e.code === 'ArrowDown' || e.code === 'KeyL') {
      e.preventDefault();
      makeGuess('lower');
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
