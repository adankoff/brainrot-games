/**
 * FLOOD FILL -- Main Entry Point
 * Wires up GameShell, input, sound, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import {
  createFloodState,
  applyMove,
  getCurrentColor,
  getFloodWaves,
  getMovesRemaining,
  calculateScore,
  NUM_COLORS,
} from './flood.js';
import {
  render,
  renderGameOver,
  getGridLayout,
  getButtonLayout,
  W,
  H,
} from './renderer.js';

// ---- Game State ----

/** @type {import('./flood.js').FloodState|null} */
let state = null;

/** @type {'easy'|'medium'|'hard'} */
let difficulty = 'easy';

/** @type {ReturnType<typeof createInputManager>|null} */
let input = null;

// ---- Animation State ----

const anim = {
  /** @type {Map<string, number>|null} */
  rippleCells: null,
  rippleProgress: 0,
  rippleMaxWave: 0,
  rippleNewColor: 0,
  rippleDuration: 0,
  rippleTimer: 0,
  animating: false,
};

/** @type {number} */
let endDelay = 0;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'FLOOD FILL',
  gameId: 'flood-fill',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'flood-fill',
  subtitle: 'flood the board. one color.',
  accentColor: '#00e5ff',
  shareUrl: 'https://brainrotgames.com/games/game-104/',
});

// ---- Sound Registration ----

function registerSounds() {
  registerSound('fill', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 600, duration: 0.15, gain: 0.12 },
      { type: 'triangle', frequency: 500, endFrequency: 700, duration: 0.12, delay: 0.05, gain: 0.08 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 100, duration: 0.4, gain: 0.15 },
      { type: 'square', frequency: 200, endFrequency: 80, duration: 0.3, delay: 0.15, gain: 0.1 },
    ],
  });
}

// ---- Input Handling ----

function handleTap(pos) {
  if (!state || state.won || state.lost || anim.animating) return;

  initAudio();

  // Check if a color button was tapped
  const buttons = getButtonLayout();
  for (const btn of buttons) {
    if (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
        pos.y >= btn.y && pos.y <= btn.y + btn.h) {
      attemptMove(btn.color);
      return;
    }
  }
}

/**
 * Attempt a flood fill move with the given color.
 *
 * @param {number} colorIndex
 */
function attemptMove(colorIndex) {
  if (!state) return;
  const currentColor = getCurrentColor(state);
  if (colorIndex === currentColor) return;

  // Compute wave fronts before applying the move
  const waves = getFloodWaves(state, colorIndex);

  // Apply the move to the grid
  const valid = applyMove(state, colorIndex);
  if (!valid) return;

  playSound('fill');

  // Start ripple animation
  if (waves.length > 1) {
    anim.rippleCells = new Map();
    for (let w = 0; w < waves.length; w++) {
      for (const cell of waves[w]) {
        anim.rippleCells.set(`${cell.r},${cell.c}`, w);
      }
    }
    anim.rippleMaxWave = waves.length - 1;
    anim.rippleNewColor = colorIndex;
    anim.rippleProgress = 0;
    anim.rippleDuration = Math.min(0.4 + waves.length * 0.05, 0.8);
    anim.rippleTimer = 0;
    anim.animating = true;
  }

  // Check end conditions (after animation)
  if (state.won || state.lost) {
    endDelay = anim.animating ? anim.rippleDuration + 0.3 : 0.5;
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  state = createFloodState(difficulty);
  resetAnim();
  endDelay = 0;

  // Set up input
  if (input) input.destroy();
  input = createInputManager(shell.getCanvas(), W, H);
  input.onTapAt(handleTap);
};

shell.onUpdate = (dt) => {
  if (!state) return;

  const dtSec = dt / 60;

  // Update ripple animation
  if (anim.animating) {
    anim.rippleTimer += dtSec;
    anim.rippleProgress = Math.min(anim.rippleTimer / anim.rippleDuration, 1);
    if (anim.rippleProgress >= 1) {
      anim.animating = false;
      anim.rippleCells = null;
    }
  }

  // End delay (let animation finish before showing game-over)
  if ((state.won || state.lost) && !anim.animating) {
    endDelay -= dtSec;
    if (endDelay <= 0) {
      if (state.won) {
        playSound('win');
      } else {
        playSound('lose');
      }
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state, anim);
};

shell.onGameOver = () => {
  if (!state) return { score: 0, message: 'no game' };

  const score = calculateScore(state);
  const remaining = getMovesRemaining(state);

  if (state.won) {
    return {
      score,
      message: remaining >= 5 ? 'flooded it with ease' : remaining >= 2 ? 'clean flood' : 'just barely',
      scoreLabel: 'score',
    };
  }

  return {
    score: 0,
    message: 'board not flooded',
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (state) renderGameOver(ctx, state);
};

// ---- Helpers ----

function resetAnim() {
  anim.rippleCells = null;
  anim.rippleProgress = 0;
  anim.rippleMaxWave = 0;
  anim.rippleNewColor = 0;
  anim.rippleDuration = 0;
  anim.rippleTimer = 0;
  anim.animating = false;
}

// ---- Menu Difficulty Selector ----

function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const levels = ['easy', 'medium', 'hard'];
  for (const level of levels) {
    const btn = document.createElement('button');
    btn.className = 'difficulty-btn' + (level === difficulty ? ' active' : '');
    btn.textContent = level;
    btn.dataset.level = level;
    btn.addEventListener('click', () => {
      initAudio();
      difficulty = level;
      // Update active state
      container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  }

  secondary.appendChild(container);
}

// ---- Init ----

shell.init();
buildDifficultySelector();
