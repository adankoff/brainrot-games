/**
 * STROOP TAP -- Main entry point
 * Wires game shell, input, sound, and game logic together.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createState, generateChallenge, processTap, updateTimer, shouldPlayTick } from './stroop.js';
import { render, renderMenuBg, getButtonRects } from './renderer.js';

const W = 400;
const H = 700;

// ---- Register game-specific sounds ----

function registerGameSounds() {
  registerSound('correct', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.06, gain: 0.15 },
    ],
  });

  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 120, duration: 0.2, gain: 0.25 },
    ],
  });

  registerSound('tick', {
    notes: [
      { type: 'square', frequency: 1000, duration: 0.04, gain: 0.15 },
    ],
  });

  registerSound('finish', {
    notes: [
      { type: 'square', frequency: 523, duration: 0.15, gain: 0.25 },
      { type: 'square', frequency: 440, duration: 0.15, delay: 0.15, gain: 0.25 },
      { type: 'square', frequency: 349, duration: 0.3, delay: 0.3, gain: 0.2 },
    ],
  });

  registerSound('streak', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.05, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.05, delay: 0.05, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.1, gain: 0.25 },
    ],
  });
}

// ---- Game Shell Setup ----

const shell = new GameShell({
  title: 'STROOP TAP',
  gameId: 'stroop-tap',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'strooptap',
  subtitle: 'tap the ink color, not the word',
  accentColor: '#e94560',
});

let state = createState();
let input = null;
let menuTime = 0;
let soundsRegistered = false;

// ---- Callbacks ----

shell.onStart = () => {
  // Init audio on user gesture
  initAudio();
  if (!soundsRegistered) {
    registerGameSounds();
    soundsRegistered = true;
  }

  state = createState();
  generateChallenge(state);

  // Set up input
  if (input) input.destroy();
  input = createInputManager(shell.getCanvas(), W, H);

  input.onTapAt((pos) => {
    if (state.isOver) return;

    const buttons = getButtonRects();
    for (const btn of buttons) {
      if (
        pos.x >= btn.x && pos.x <= btn.x + btn.w &&
        pos.y >= btn.y && pos.y <= btn.y + btn.h
      ) {
        const prevStreak = state.streak;
        const result = processTap(state, btn.colorIndex);

        if (result === 'correct') {
          playSound('correct');
          // Play streak sound on multiplier threshold
          if (
            (state.streak === 5 && prevStreak < 5) ||
            (state.streak === 10 && prevStreak < 10)
          ) {
            playSound('streak');
          }
        } else {
          playSound('wrong');
        }
        break;
      }
    }
  });
};

shell.onUpdate = (dt) => {
  // dt is normalized to 60fps frames. Convert to seconds.
  const dtSec = dt * (1 / 60);

  const justEnded = updateTimer(state, dtSec);

  if (shouldPlayTick(state)) {
    playSound('tick');
  }

  if (justEnded) {
    playSound('finish');
    if (input) {
      input.destroy();
      input = null;
    }
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  let message = '';
  if (state.score >= 50) {
    message = 'absolutely goated';
  } else if (state.score >= 30) {
    message = 'big brain energy';
  } else if (state.score >= 15) {
    message = 'not bad fr';
  } else {
    message = 'brain fully rotted';
  }

  return {
    score: state.score,
    message,
    scoreLabel: 'correct taps',
  };
};

// ---- Menu background rendering ----

shell._config.onMenuRender = (ctx) => {
  renderMenuBg(ctx, menuTime);
};

shell._config.onMenuUpdate = (dt) => {
  menuTime += dt * (1 / 60);
};

// Override the menu enter to start menu animation loop
const origEnterMenu = shell._enterMenu.bind(shell);
shell._enterMenu = () => {
  origEnterMenu();
  menuTime = 0;
  startMenuLoop();
};

let menuRafId = 0;
function startMenuLoop() {
  stopMenuLoop();
  let lastTime = performance.now();
  const loop = (now) => {
    if (shell.state !== 'menu') return;
    const rawDt = now - lastTime;
    lastTime = now;
    const dt = Math.min(rawDt, 50) / 16.67;
    menuTime += dt * (1 / 60);
    const ctx = shell.getContext();
    renderMenuBg(ctx, menuTime);
    menuRafId = requestAnimationFrame(loop);
  };
  menuRafId = requestAnimationFrame(loop);
}

function stopMenuLoop() {
  if (menuRafId) {
    cancelAnimationFrame(menuRafId);
    menuRafId = 0;
  }
}

// ---- Init ----

shell.init();
