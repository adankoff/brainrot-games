/**
 * MEME INVADERS -- Main Entry
 * Space Invaders clone with meme aliens. Infinite procedural waves.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createGameState, update, getEntities, W, H } from './invaders.js';
import { render } from './renderer.js';

// -- Game State --
let state = null;
let gameOverDelayTimer = 0;
const GAME_OVER_DELAY = 60; // ~1 second before overlay

// -- Input Tracking --
const keysDown = new Set();
let touchX = null;   // current touch X in logical coords (null = no touch)
let touchActive = false;
let tapToShoot = false;

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME INVADERS',
  gameId: 'meme-invaders',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'defend earth from the meme horde',
  accentColor: '#00ff41',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('shoot', {
    notes: [
      { type: 'square', frequency: 600, endFrequency: 900, duration: 0.08, gain: 0.1 },
    ],
  });

  registerSound('explode', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.15, gain: 0.15 },
      { type: 'sine', frequency: 80, duration: 0.1, gain: 0.1, noise: true },
    ],
  });

  registerSound('playerHit', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.3, gain: 0.25 },
      { type: 'square', frequency: 150, endFrequency: 40, duration: 0.2, delay: 0.15, gain: 0.15 },
    ],
  });

  registerSound('ufo', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 880, duration: 0.2, gain: 0.08 },
      { type: 'sine', frequency: 880, endFrequency: 440, duration: 0.2, delay: 0.2, gain: 0.08 },
    ],
  });

  registerSound('wave', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 554, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 880, duration: 0.15, delay: 0.3, gain: 0.25 },
    ],
  });
}

// -- Input Helpers --

function clientToLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

/**
 * Build the input object consumed by the engine update.
 */
function buildInput() {
  let left = keysDown.has('ArrowLeft') || keysDown.has('KeyA');
  let right = keysDown.has('ArrowRight') || keysDown.has('KeyD');
  let shoot = keysDown.has('Space') || tapToShoot;

  // Touch: drag left/right relative to player, auto-fire while touching
  if (touchActive && touchX !== null && state) {
    const px = state.player.x;
    const deadzone = 8;
    if (touchX < px - deadzone) left = true;
    if (touchX > px + deadzone) right = true;
    shoot = true; // auto-fire while touch is active
  }

  // Reset tap-to-shoot (consumed once per click/tap)
  tapToShoot = false;

  return { left, right, shoot };
}

// -- Shell Callbacks --

shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createGameState();
  gameOverDelayTimer = 0;
  touchX = null;
  touchActive = false;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Game over delay
  if (state.gameOver) {
    gameOverDelayTimer += dt;
    if (gameOverDelayTimer >= GAME_OVER_DELAY) {
      shell.setState('game-over');
    }
    return;
  }

  const input = buildInput();
  const events = update(state, input, dt);

  for (const evt of events) {
    playSound(evt);
  }

  // Play UFO sound periodically while UFO is alive
  if (state.ufo && Math.floor(state.ufoTimer) % 60 < 2) {
    // The ufo sound is handled by the event system when it spawns
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, getEntities(state));
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const wave = state.wave;
  const message = wave > 1
    ? `survived ${wave - 1} wave${wave > 2 ? 's' : ''} of meme aliens`
    : 'the memes got you on wave 1 fr';

  return {
    score: state.score,
    message,
    scoreLabel: 'score',
  };
};

// -- Mouse Input --

function handleMouseDown(e) {
  initAudio();
  tapToShoot = true;
}

// -- Touch Input --

function handleTouchStart(e) {
  e.preventDefault();
  initAudio();
  const touch = e.changedTouches[0];
  const pos = clientToLogical(touch.clientX, touch.clientY);
  touchX = pos.x;
  touchActive = true;
  tapToShoot = true;
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchActive) return;
  const touch = e.changedTouches[0];
  const pos = clientToLogical(touch.clientX, touch.clientY);
  touchX = pos.x;
}

function handleTouchEnd(e) {
  e.preventDefault();
  touchActive = false;
  touchX = null;
}

// -- Keyboard Input --

function handleKeyDown(e) {
  if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
    e.preventDefault();
    initAudio();
    keysDown.add(e.code);
  }
}

function handleKeyUp(e) {
  keysDown.delete(e.code);
}

// -- Init --

document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();

  // Mouse
  canvas.addEventListener('mousedown', handleMouseDown);

  // Touch
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});
