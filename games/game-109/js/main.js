/**
 * MEME COPTER -- Main Entry
 * Hold to fly, don't hit the walls. Pure reflex, zero brain cells.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createGameState, update, W, H } from './copter.js';
import { render } from './renderer.js';

// -- Game State --

/** @type {Object|null} */
let state = null;

/** @type {number} Delay timer for game-over transition */
let gameOverTimer = 0;

/** @type {boolean} Whether thrust sound is playing (to avoid re-triggering) */
let thrustPlaying = false;

/** @type {OscillatorNode|null} Continuous thrust hum oscillator */
let thrustOsc = null;

/** @type {GainNode|null} Thrust gain node */
let thrustGain = null;

/** @type {AudioContext|null} Cached audio context ref */
let audioCtx = null;

// -- Shell Setup --

const shell = new GameShell({
  title: 'MEME COPTER',
  gameId: 'meme-copter',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'hold to fly, don\'t hit the walls',
  accentColor: '#00ff88',
});

// -- Sound Registration --

function registerSounds() {
  registerSound('crash', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 40, duration: 0.4, gain: 0.3 },
      { type: 'square', frequency: 80, duration: 0.2, delay: 0.05, gain: 0.15, noise: true },
    ],
  });

  registerSound('milestone', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1320, duration: 0.1, delay: 0.16, gain: 0.18 },
    ],
  });
}

/**
 * Start the continuous thrust hum using raw Web Audio.
 */
function startThrustSound() {
  if (thrustPlaying) return;
  thrustPlaying = true;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    thrustOsc = audioCtx.createOscillator();
    thrustOsc.type = 'triangle';
    thrustOsc.frequency.setValueAtTime(120, audioCtx.currentTime);

    thrustGain = audioCtx.createGain();
    thrustGain.gain.setValueAtTime(0, audioCtx.currentTime);
    thrustGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);

    thrustOsc.connect(thrustGain);
    thrustGain.connect(audioCtx.destination);
    thrustOsc.start();
  } catch {
    // Audio not available
  }
}

/**
 * Stop the continuous thrust hum.
 */
function stopThrustSound() {
  if (!thrustPlaying) return;
  thrustPlaying = false;

  try {
    if (thrustGain && audioCtx) {
      thrustGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
    }
    if (thrustOsc) {
      setTimeout(() => {
        try { thrustOsc.stop(); } catch { /* already stopped */ }
        thrustOsc = null;
        thrustGain = null;
      }, 80);
    }
  } catch {
    // Audio not available
  }
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState();
  gameOverTimer = 0;
  stopThrustSound();
};

shell.onUpdate = (dt) => {
  if (!state) return;

  if (!state.alive) {
    gameOverTimer += dt;
    if (gameOverTimer > 90) { // ~1.5 seconds
      shell.setState('game-over');
    }
    return;
  }

  const event = update(state, dt);

  if (event === 'crash') {
    stopThrustSound();
    playSound('crash');
    gameOverTimer = 0;
  } else if (event === 'milestone') {
    playSound('milestone');
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };
  stopThrustSound();

  const score = state.score;
  let message = '';

  if (score >= 500) {
    message = 'absolute sigma pilot no cap';
  } else if (score >= 300) {
    message = 'you cooked that fr fr';
  } else if (score >= 150) {
    message = 'not bad, keep grinding';
  } else if (score >= 50) {
    message = 'skill issue detected';
  } else {
    message = 'bro didn\'t even try';
  }

  return {
    score,
    message,
    scoreLabel: 'distance',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) {
    render(ctx, state);
  }
};

// -- Input Handling --

/**
 * Set thrust on/off.
 *
 * @param {boolean} active
 */
function setThrust(active) {
  if (!state || !state.alive) return;
  state.thrusting = active;
  if (active) {
    startThrustSound();
  } else {
    stopThrustSound();
  }
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (shell.state === 'playing') {
      initAudio();
      setThrust(true);
    }
  });

  document.addEventListener('mouseup', () => {
    if (shell.state === 'playing') {
      setThrust(false);
    }
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (shell.state === 'playing') {
      initAudio();
      setThrust(true);
    }
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (shell.state === 'playing') {
      setThrust(false);
    }
  });

  document.addEventListener('touchcancel', () => {
    if (shell.state === 'playing') {
      setThrust(false);
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (shell.state === 'playing') {
        initAudio();
        setThrust(true);
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (shell.state === 'playing') {
        setThrust(false);
      }
    }
  });
});
