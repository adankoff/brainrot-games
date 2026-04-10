/**
 * MEME TETRIS -- Main Entry Point
 * Wires up GameShell, input, sound, and the Tetris engine.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createGame, tick, moveLeft, moveRight, moveDown, rotate, hardDrop, hold } from './tetris.js';
import { render } from './renderer.js';

// ---- Constants ----
const W = 400;
const H = 700;

const DAS_DELAY = 10;  // frames before auto-repeat starts
const DAS_RATE = 3;    // frames between auto-repeat moves
const SOFT_DROP_RATE = 2; // frames between soft drop moves

// ---- State ----
let game = null;

// Key state tracking
const keys = {};
let dasTimer = 0;
let dasDirection = 0; // -1 left, 1 right, 0 none
let dasActive = false;
let softDropTimer = 0;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME TETRIS',
  gameId: 'meme-tetris',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'tetris',
  subtitle: 'stack blocks. clear lines. embrace the brainrot.',
  accentColor: '#00f0f0',
  shareUrl: '',
});

// ---- Register Sounds ----
function setupSounds() {
  registerSound('move', {
    notes: [
      { type: 'square', frequency: 300, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('rotate', {
    notes: [
      { type: 'sine', frequency: 500, endFrequency: 600, duration: 0.06, gain: 0.1 },
    ],
  });

  registerSound('drop', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 60, duration: 0.12, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.08, delay: 0.02, gain: 0.15 },
    ],
  });

  registerSound('clear', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.1, delay: 0.16, gain: 0.12 },
    ],
  });

  registerSound('tetris', {
    notes: [
      { type: 'square', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'square', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'square', frequency: 784, duration: 0.08, delay: 0.16, gain: 0.2 },
      { type: 'square', frequency: 1047, duration: 0.15, delay: 0.24, gain: 0.25 },
    ],
  });

  registerSound('lock', {
    notes: [
      { type: 'triangle', frequency: 200, duration: 0.06, gain: 0.1 },
    ],
  });

  registerSound('hold', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 500, duration: 0.08, gain: 0.08 },
    ],
  });

  registerSound('gameover', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.2, gain: 0.25 },
      { type: 'square', frequency: 370, duration: 0.2, delay: 0.2, gain: 0.25 },
      { type: 'square', frequency: 311, duration: 0.2, delay: 0.4, gain: 0.25 },
      { type: 'square', frequency: 261, duration: 0.4, delay: 0.6, gain: 0.25 },
    ],
  });
}

// ---- Keyboard Input ----
function handleKeyDown(e) {
  if (shell.state !== 'playing') return;

  // Prevent scrolling
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault();
  }

  if (keys[e.code]) return; // already held
  keys[e.code] = true;

  initAudio();

  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      if (moveLeft(game)) playSound('move');
      dasDirection = -1;
      dasTimer = 0;
      dasActive = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      if (moveRight(game)) playSound('move');
      dasDirection = 1;
      dasTimer = 0;
      dasActive = false;
      break;
    case 'ArrowUp':
    case 'KeyW':
      if (rotate(game)) playSound('rotate');
      break;
    case 'ArrowDown':
    case 'KeyS':
      softDropTimer = 0;
      if (moveDown(game)) playSound('move');
      break;
    case 'Space':
      {
        const result = hardDrop(game);
        if (result) {
          playSound('drop');
          handleTickResult(result);
        }
      }
      break;
    case 'KeyC':
    case 'ShiftLeft':
    case 'ShiftRight':
      if (hold(game)) playSound('hold');
      break;
  }
}

function handleKeyUp(e) {
  keys[e.code] = false;

  // Reset DAS if releasing the direction
  if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && dasDirection === -1) {
    dasDirection = 0;
    dasActive = false;
  }
  if ((e.code === 'ArrowRight' || e.code === 'KeyD') && dasDirection === 1) {
    dasDirection = 0;
    dasActive = false;
  }
}

function processHeldKeys(dt) {
  // DAS (Delayed Auto Shift)
  if (dasDirection !== 0) {
    dasTimer += dt;
    if (!dasActive) {
      if (dasTimer >= DAS_DELAY) {
        dasActive = true;
        dasTimer = 0;
      }
    } else {
      if (dasTimer >= DAS_RATE) {
        dasTimer -= DAS_RATE;
        if (dasDirection === -1) {
          if (moveLeft(game)) playSound('move');
        } else {
          if (moveRight(game)) playSound('move');
        }
      }
    }
  }

  // Soft drop
  if (keys['ArrowDown'] || keys['KeyS']) {
    softDropTimer += dt;
    if (softDropTimer >= SOFT_DROP_RATE) {
      softDropTimer -= SOFT_DROP_RATE;
      moveDown(game);
    }
  }
}

// ---- Touch Input ----
let touchControls = null;

function setupTouchControls() {
  // Only show on touch devices
  if (!('ontouchstart' in window)) return;

  const container = document.querySelector('.game-container');
  const div = document.createElement('div');
  div.className = 'touch-controls';
  div.innerHTML = `
    <div class="touch-group">
      <button class="touch-btn" data-action="left">&larr;</button>
      <button class="touch-btn" data-action="down">&darr;</button>
      <button class="touch-btn" data-action="right">&rarr;</button>
    </div>
    <div class="touch-group">
      <button class="touch-btn" data-action="hold">H</button>
      <button class="touch-btn" data-action="rotate">&circlearrowright;</button>
      <button class="touch-btn" data-action="drop">&dArr;</button>
    </div>
  `;
  container.appendChild(div);
  touchControls = div;

  // Touch repeat state
  let touchRepeatId = null;

  function doAction(action) {
    if (shell.state !== 'playing' || !game) return;
    initAudio();
    switch (action) {
      case 'left':
        if (moveLeft(game)) playSound('move');
        break;
      case 'right':
        if (moveRight(game)) playSound('move');
        break;
      case 'down':
        moveDown(game);
        break;
      case 'rotate':
        if (rotate(game)) playSound('rotate');
        break;
      case 'drop':
        {
          const result = hardDrop(game);
          if (result) {
            playSound('drop');
            handleTickResult(result);
          }
        }
        break;
      case 'hold':
        if (hold(game)) playSound('hold');
        break;
    }
  }

  function startRepeat(action) {
    stopRepeat();
    if (action === 'left' || action === 'right' || action === 'down') {
      touchRepeatId = setInterval(() => doAction(action), 80);
    }
  }

  function stopRepeat() {
    if (touchRepeatId !== null) {
      clearInterval(touchRepeatId);
      touchRepeatId = null;
    }
  }

  div.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    doAction(action);
    startRepeat(action);
  }, { passive: false });

  div.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRepeat();
  }, { passive: false });

  div.addEventListener('touchcancel', () => {
    stopRepeat();
  });
}

// ---- Tick Result Handling ----
function handleTickResult(result) {
  if (!result) return;
  switch (result.event) {
    case 'lock':
      playSound('lock');
      break;
    case 'lock_clearing':
      // Sound will play when clear completes
      break;
    case 'clear':
      playSound('clear');
      break;
    case 'tetris':
      playSound('tetris');
      break;
    case 'gameover':
      playSound('gameover');
      shell.setState('game-over');
      break;
  }
}

// ---- Shell Callbacks ----
shell.onStart = () => {
  game = createGame();
  // Reset key state
  for (const key in keys) keys[key] = false;
  dasDirection = 0;
  dasActive = false;
  dasTimer = 0;
  softDropTimer = 0;
  initAudio();
};

shell.onUpdate = (dt) => {
  if (!game || game.gameOver) return;

  processHeldKeys(dt);

  const result = tick(game);
  handleTickResult(result);

  if (game.gameOver) {
    playSound('gameover');
    shell.setState('game-over');
  }
};

shell.onRender = (ctx) => {
  if (!game) return;
  render(ctx, game, W, H);
};

shell.onGameOver = () => {
  return {
    score: game ? game.score : 0,
    message: game ? `level ${game.level} - ${game.lines} lines` : '',
    scoreLabel: 'score',
  };
};

// ---- Init ----
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

setupSounds();
setupTouchControls();
shell.init();
