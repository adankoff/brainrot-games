/**
 * MEME CUT -- Main Entry Point
 * Wires up GameShell, InputManager, SoundManager, and the CutGame engine.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { readThemeColor } from '../../shared/theme-utils.js';
import { CutGame } from './cutgame.js';
import { render } from './renderer.js';

const W = 400;
const H = 700;

// ---- Sound Registration ----
function registerGameSounds() {
  registerSound('cut', {
    notes: [
      { type: 'sawtooth', frequency: 800, endFrequency: 200, duration: 0.08, gain: 0.25 },
      { type: 'square', frequency: 400, endFrequency: 100, duration: 0.06, delay: 0.02, gain: 0.15 },
    ],
  });

  registerSound('swing', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 500, duration: 0.12, gain: 0.08 },
    ],
  });

  registerSound('star', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 1100, duration: 0.06, delay: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 1320, duration: 0.1, delay: 0.12, gain: 0.15 },
    ],
  });

  registerSound('nom', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.08, delay: 0.16, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.15, delay: 0.24, gain: 0.25 },
    ],
  });

  registerSound('miss', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 150, endFrequency: 40, duration: 0.3, delay: 0.1, gain: 0.1 },
    ],
  });

  registerSound('levelup', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.15, delay: 0.2, gain: 0.25 },
    ],
  });
}

// ---- Game Instance ----
const game = new CutGame();
let frameCount = 0;
let lossTimer = 0;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME CUT',
  gameId: 'meme-cut',
  logicalWidth: W,
  logicalHeight: H,
  theme: 'meme-cut',
  subtitle: 'cut the ropes. feed the meme.',
  accentColor: readThemeColor('--game-target', '#aaaaaa'),
});

// ---- Swipe input handling (custom, beyond basic input-manager) ----
let isPointerDown = false;

function toLogical(clientX, clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

function setupSwipeInput() {
  const canvas = shell.getCanvas();

  function handleDown(cx, cy) {
    initAudio();
    if (shell.state !== 'playing') return;
    isPointerDown = true;
    const pos = toLogical(cx, cy);
    game.onPointerDown(pos.x, pos.y);
  }

  function handleMove(cx, cy) {
    if (!isPointerDown || shell.state !== 'playing') return;
    const pos = toLogical(cx, cy);
    game.onPointerMove(pos.x, pos.y);

    // Check if any rope was just cut (check for cut events)
    // The cut detection happens inside onPointerMove, sound is triggered in update
  }

  function handleUp() {
    isPointerDown = false;
    game.onPointerUp();
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    handleDown(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mouseleave', handleUp);

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleDown(t.clientX, t.clientY);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleMove(t.clientX, t.clientY);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleUp();
  }, { passive: false });

  canvas.addEventListener('touchcancel', handleUp);
}

// Track previously cut ropes to detect new cuts
let prevCutState = [];

shell.onStart = () => {
  initAudio();
  registerGameSounds();
  game.startGame();
  frameCount = 0;
  lossTimer = 0;
  prevCutState = game.ropes.map((r) => r.cut);
};

shell.onUpdate = (dt) => {
  // Detect rope cuts for sound (compare before/after)
  const beforeCuts = game.ropes.map((r) => r.cut);

  const sounds = game.update(dt);
  frameCount += dt;

  // Check for new rope cuts (guard length in case level changed mid-update)
  for (let i = 0; i < Math.min(beforeCuts.length, game.ropes.length); i++) {
    if (!beforeCuts[i] && game.ropes[i].cut) {
      playSound('cut');
    }
  }

  // Play sounds from game logic
  for (const s of sounds) {
    playSound(s);
  }

  // Handle loss state with delay before game over
  if (game.state === 'lost') {
    lossTimer += dt;
    if (lossTimer > 90) { // ~1.5s delay
      shell.setState('game-over');
    }
  }

  // Handle game complete
  if (game.state === 'gameover') {
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  render(ctx, game, frameCount);
};

shell.onGameOver = () => {
  const info = game.getInfo();
  return {
    score: game.score,
    message: game.state === 'gameover'
      ? `all ${info.totalLevels} levels complete!`
      : `reached level ${info.level}`,
    scoreLabel: 'score',
  };
};

// ---- Initialize ----
shell.init();
setupSwipeInput();
