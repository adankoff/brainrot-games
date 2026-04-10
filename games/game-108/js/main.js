/**
 * MEME FROGGER -- Main Entry Point
 * Wires up GameShell, input, sound, and the frogger game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { FroggerGame } from './frogger.js';
import { render } from './renderer.js';

// ---- Sound Definitions ----

function registerGameSounds() {
  registerSound('hop', {
    notes: [
      { type: 'square', frequency: 400, endFrequency: 550, duration: 0.05, gain: 0.1 },
    ],
  });

  registerSound('splash', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.25, gain: 0.15 },
      { type: 'sine', frequency: 150, duration: 0.15, gain: 0.1, noise: true },
    ],
  });

  registerSound('squish', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.08, delay: 0.05, gain: 0.15 },
    ],
  });

  registerSound('home', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 880, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 1100, duration: 0.15, delay: 0.2, gain: 0.2 },
    ],
  });

  registerSound('levelUp', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Game Setup ----

const shell = new GameShell({
  title: 'MEME FROGGER',
  gameId: 'meme-frogger',
  logicalWidth: 400,
  logicalHeight: 700,
  maxDisplayWidth: 480,
  theme: 'memefrogger',
  subtitle: 'hop across traffic & rivers. don\'t get rekt.',
  accentColor: '#4ecca3',
});

let game = null;

/** @type {Set<string>} */
const keysDown = new Set();

// ---- Directional Input ----

function handleKeyDown(e) {
  if (shell.state !== 'playing' || !game) return;

  // Prevent repeated moves from held keys
  if (keysDown.has(e.code)) return;
  keysDown.add(e.code);

  let sound = null;
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      e.preventDefault();
      sound = game.move(0, -1);
      break;
    case 'ArrowDown':
    case 'KeyS':
      e.preventDefault();
      sound = game.move(0, 1);
      break;
    case 'ArrowLeft':
    case 'KeyA':
      e.preventDefault();
      sound = game.move(-1, 0);
      break;
    case 'ArrowRight':
    case 'KeyD':
      e.preventDefault();
      sound = game.move(1, 0);
      break;
  }

  if (sound) playSound(sound);
}

function handleKeyUp(e) {
  keysDown.delete(e.code);
}

// ---- Swipe Detection for Mobile ----

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

function handleTouchStart(e) {
  if (shell.state !== 'playing') return;
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = Date.now();
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (shell.state !== 'playing' || !game) return;

  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const elapsed = Date.now() - touchStartTime;

  // Require minimum swipe distance, or treat as tap (move up)
  const minDist = 20;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let sound = null;

  if (dist < minDist && elapsed < 300) {
    // Tap = move up
    sound = game.move(0, -1);
  } else if (dist >= minDist) {
    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      sound = game.move(dx > 0 ? 1 : -1, 0);
    } else {
      sound = game.move(0, dy > 0 ? 1 : -1);
    }
  }

  if (sound) playSound(sound);
  e.preventDefault();
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerGameSounds();

  game = new FroggerGame();
  keysDown.clear();

  // Bind input
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  const canvas = shell.getCanvas();
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
};

shell.onUpdate = (dt) => {
  if (!game || game.gameOver) return;

  const sound = game.update(dt);
  if (sound) playSound(sound);

  // Check level completion
  game.checkLevelComplete(dt);

  // Check game over
  if (game.gameOver) {
    // Small delay before showing game over screen
    setTimeout(() => {
      playSound('gameover');
      shell.setState('game-over');
    }, 500);
  }
};

shell.onRender = (ctx) => {
  if (!game) return;
  render(ctx, game);
};

shell.onGameOver = () => {
  // Cleanup input
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);

  const canvas = shell.getCanvas();
  canvas.removeEventListener('touchstart', handleTouchStart);
  canvas.removeEventListener('touchend', handleTouchEnd);

  const score = game ? game.score : 0;
  const level = game ? game.level : 1;

  return {
    score,
    message: `reached level ${level}`,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (game) render(ctx, game);
};

// ---- Initialize ----

shell.init();
