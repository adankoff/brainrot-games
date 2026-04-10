/**
 * MEME BOUNCE -- Main Entry Point
 * Wires the GameShell, InputManager, SoundManager, and game logic together.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { BounceGame } from './bounce.js';
import { renderGame, renderMenuBg } from './renderer.js';

const W = 400;
const H = 700;

// ---- Sound Registration ----

function registerGameSounds() {
  registerSound('bounce', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 660, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 880, duration: 0.04, delay: 0.02, gain: 0.1 },
    ],
  });

  registerSound('spawn', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 800, duration: 0.06, gain: 0.12 },
      { type: 'square', frequency: 1200, duration: 0.03, delay: 0.03, gain: 0.06 },
    ],
  });

  registerSound('expire', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 150, duration: 0.15, gain: 0.1 },
    ],
  });

  registerSound('gameover', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 200, endFrequency: 50, duration: 0.3, delay: 0.15, gain: 0.15 },
    ],
  });
}

// ---- Game Setup ----

const shell = new GameShell({
  title: 'MEME BOUNCE',
  gameId: 'meme-bounce-115',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'meme-bounce',
  subtitle: 'tap to create platforms. bounce or die.',
  accentColor: '#00ffb4',
  shareUrl: 'https://brainrotgames.com/games/game-115/',
});

/** @type {BounceGame|null} */
let game = null;

/** @type {ReturnType<typeof createInputManager>|null} */
let input = null;

/** @type {number} */
let menuTime = 0;

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerGameSounds();

  game = new BounceGame();

  // Set up input
  if (input) input.destroy();
  const canvas = shell.getCanvas();
  input = createInputManager(canvas, W, H);

  input.onTapAt((pos) => {
    if (shell.state !== 'playing') return;
    initAudio(); // Ensure audio context on first tap
    game.spawnPlatform(pos.x, pos.y);
  });
};

shell.onUpdate = (dt) => {
  if (!game) return;

  game.update(dt);

  // Play pending sounds
  for (const snd of game.pendingSounds) {
    playSound(snd);
  }

  // Check game over
  if (!game.alive) {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!game) return;
  const data = game.getRenderData();
  renderGame(ctx, data);
};

shell.onGameOver = () => {
  const score = game ? game.score : 0;
  const reason = game ? game.gameOverReason : '';
  const message = reason === 'spiked' ? 'got spiked lmao' : 'you fell off fr';

  return {
    score,
    message,
    scoreLabel: 'height',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!game) return;
  // Render the final game state dimmed behind the overlay
  const data = game.getRenderData();
  renderGame(ctx, data);

  // Dim overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, H);
};

// ---- Menu Animation ----

const origMenuRender = shell._config.onMenuRender;
shell._config.onMenuRender = (ctx) => {
  renderMenuBg(ctx, menuTime);
  if (origMenuRender) origMenuRender(ctx);
};

// Run menu animation loop
function menuLoop() {
  if (shell.state === 'menu') {
    menuTime = performance.now();
    const ctx = shell.getContext();
    if (ctx) {
      renderMenuBg(ctx, menuTime);
    }
  }
  requestAnimationFrame(menuLoop);
}

// ---- Initialize ----

shell.init();
menuLoop();
