/**
 * MEME ASTEROIDS -- Main Entry Point
 * Wires up GameShell, input, sound, and game engine.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createAsteroidsState, update, getEntities } from './asteroids.js';
import { render } from './renderer.js';

const W = 400;
const H = 700;

// ---- Sound Registration ----

function registerSounds() {
  registerSound('shoot', {
    notes: [
      { type: 'square', frequency: 800, endFrequency: 400, duration: 0.08, gain: 0.12 },
    ],
  });

  registerSound('thrust', {
    notes: [
      { type: 'sawtooth', frequency: 60, endFrequency: 80, duration: 0.05, gain: 0.06 },
    ],
  });

  registerSound('explodeBig', {
    notes: [
      { type: 'sawtooth', frequency: 120, endFrequency: 40, duration: 0.25, gain: 0.2 },
      { type: 'sine', frequency: 80, duration: 0.2, gain: 0.15, noise: true },
    ],
  });

  registerSound('explodeSmall', {
    notes: [
      { type: 'square', frequency: 300, endFrequency: 100, duration: 0.12, gain: 0.15 },
    ],
  });

  registerSound('death', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 30, duration: 0.4, gain: 0.25 },
      { type: 'sine', frequency: 100, duration: 0.3, delay: 0.1, gain: 0.15, noise: true },
    ],
  });

  registerSound('wave', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 660, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 880, duration: 0.15, delay: 0.2, gain: 0.15 },
    ],
  });
}

// ---- Input State ----

const keys = {
  left: false,
  right: false,
  thrust: false,
  shoot: false,
};

let shootPressed = false; // edge-detect for shoot

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        keys.right = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        keys.thrust = true;
        break;
      case 'Space':
        e.preventDefault();
        if (!shootPressed) {
          keys.shoot = true;
          shootPressed = true;
        }
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keys.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        keys.thrust = false;
        break;
      case 'Space':
        keys.shoot = false;
        shootPressed = false;
        break;
    }
  });
}

// ---- Touch Input ----

/** @type {Map<number, {x: number, y: number}>} */
const activeTouches = new Map();

function setupTouch(canvas) {
  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }

  function updateTouchInput() {
    keys.left = false;
    keys.right = false;
    keys.thrust = false;
    keys.shoot = false;

    for (const [, pos] of activeTouches) {
      const thirdW = W / 3;
      if (pos.x < thirdW) {
        keys.left = true;
      } else if (pos.x > thirdW * 2) {
        keys.right = true;
      } else {
        // Center zone = thrust + shoot
        keys.thrust = true;
        keys.shoot = true;
      }
    }
  }

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.set(touch.identifier, toLogical(touch.clientX, touch.clientY));
    }
    updateTouchInput();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.set(touch.identifier, toLogical(touch.clientX, touch.clientY));
    }
    updateTouchInput();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    updateTouchInput();
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    updateTouchInput();
  }, { passive: false });
}

// ---- Game Shell Integration ----

/** @type {Object|null} */
let gameState = null;

/** Throttle thrust sound to avoid spamming */
let thrustSoundCooldown = 0;

const shell = new GameShell({
  title: 'MEME ASTEROIDS',
  gameId: 'meme-asteroids',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'asteroids',
  subtitle: 'blast the space rocks fr fr',
  accentColor: '#00ff88',
  shareUrl: '',
});

shell.onStart = () => {
  initAudio();
  registerSounds();
  gameState = createAsteroidsState();
  thrustSoundCooldown = 0;
  // Reset input
  keys.left = false;
  keys.right = false;
  keys.thrust = false;
  keys.shoot = false;
  shootPressed = false;
  activeTouches.clear();
};

shell.onUpdate = (dt) => {
  if (!gameState) return;

  // Build input snapshot, edge-detect shoot
  const input = {
    left: keys.left,
    right: keys.right,
    thrust: keys.thrust,
    shoot: keys.shoot,
  };

  // After reading shoot for this frame, clear it so it's edge-triggered
  // (for keyboard; touch continuously sets it)
  if (shootPressed && !isTouchActive()) {
    // Keep shoot true only for 1 frame on keyboard press
    // The cooldown in the engine handles repeat rate
  }

  update(gameState, input, dt);

  // Play sounds for events
  const entities = getEntities(gameState);
  for (const event of entities.events) {
    if (event === 'thrust') {
      thrustSoundCooldown -= dt;
      if (thrustSoundCooldown <= 0) {
        playSound('thrust');
        thrustSoundCooldown = 6; // every ~6 frames
      }
    } else {
      playSound(event);
    }
  }

  // Check game over
  if (entities.gameOver) {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!gameState) return;
  const entities = getEntities(gameState);
  render(ctx, entities);
};

shell.onGameOver = () => {
  const entities = gameState ? getEntities(gameState) : { score: 0, wave: 1 };
  return {
    score: entities.score,
    message: `reached wave ${entities.wave}`,
    scoreLabel: 'score',
  };
};

function isTouchActive() {
  return activeTouches.size > 0;
}

// ---- Boot ----

setupKeyboard();

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    setupTouch(canvas);
  }
  shell.init();
});
