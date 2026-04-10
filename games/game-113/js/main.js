/**
 * AIM TRAINER -- Main entry point
 * Wires GameShell, InputManager, SoundManager, and game logic together.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { AimGame } from './aim.js';
import { render, renderGameOver } from './renderer.js';

const W = 400;
const H = 700;

// -- Shell setup --
const shell = new GameShell({
  title: 'AIM TRAINER',
  gameId: 'aim-trainer',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'aimtrainer',
  subtitle: 'click fast. aim true.',
  accentColor: '#ff3355',
  shareUrl: '',
});

/** @type {AimGame|null} */
let game = null;

/** @type {ReturnType<typeof createInputManager>|null} */
let input = null;

// -- Register custom sounds --
function setupSounds() {
  initAudio();

  // hit: satisfying pop
  registerSound('aim-hit', {
    notes: [
      { type: 'sine', frequency: 880, endFrequency: 1200, duration: 0.06, gain: 0.25 },
      { type: 'square', frequency: 1400, duration: 0.03, delay: 0.02, gain: 0.1 },
    ],
  });

  // miss: soft thud
  registerSound('aim-miss', {
    notes: [
      { type: 'sine', frequency: 120, endFrequency: 60, duration: 0.12, gain: 0.15 },
    ],
  });

  // spawn: soft blip
  registerSound('aim-spawn', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.04, gain: 0.06 },
    ],
  });

  // finish: descending tone
  registerSound('aim-finish', {
    notes: [
      { type: 'square', frequency: 523, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 392, duration: 0.15, delay: 0.15, gain: 0.2 },
      { type: 'square', frequency: 330, duration: 0.25, delay: 0.3, gain: 0.2 },
    ],
  });
}

// -- Track mouse/touch position for crosshair --
function setupCursorTracking(canvas) {
  const toLogical = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  };

  canvas.addEventListener('mousemove', (e) => {
    if (game) {
      const pos = toLogical(e.clientX, e.clientY);
      game.setCursor(pos.x, pos.y);
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (game && e.touches.length > 0) {
      const touch = e.touches[0];
      const pos = toLogical(touch.clientX, touch.clientY);
      game.setCursor(pos.x, pos.y);
    }
  }, { passive: false });

  // Also track touch start for initial position
  canvas.addEventListener('touchstart', (e) => {
    if (game && e.touches.length > 0) {
      const touch = e.touches[0];
      const pos = toLogical(touch.clientX, touch.clientY);
      game.setCursor(pos.x, pos.y);
    }
  }, { passive: true });
}

// -- Shell callbacks --

shell.onStart = () => {
  setupSounds();
  game = new AimGame(W, H);
  playSound('aim-spawn');

  // Set up input
  if (input) input.destroy();
  input = createInputManager(shell.getCanvas(), W, H);

  input.onTapAt((pos) => {
    if (!game || game.gameOver) return;
    const result = game.handleTap(pos);
    if (result === 'hit') {
      playSound('aim-hit');
    } else {
      playSound('aim-miss');
    }
  });
};

shell.onUpdate = (dt) => {
  if (!game) return;
  const events = game.update(dt);
  if (events.expired) {
    playSound('aim-spawn');
  }
  if (events.finished) {
    playSound('aim-finish');
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!game) return;
  render(ctx, game, W, H);
};

shell.onGameOver = () => {
  if (input) {
    input.destroy();
    input = null;
  }

  const accuracy = game ? game.getAccuracy() : 0;
  const avgReact = game ? game.getAvgReactionTime() : 0;
  let message = '';
  if (accuracy >= 90) message = 'AIMBOT DETECTED';
  else if (accuracy >= 70) message = 'clean shots fr';
  else if (accuracy >= 50) message = 'mid aim ngl';
  else message = 'bro is cooked';

  return {
    score: game ? game.score : 0,
    message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!game) return;
  renderGameOver(ctx, game, W, H);
};

// -- Initialize --
shell.init();
setupCursorTracking(shell.getCanvas());
