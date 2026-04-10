/**
 * MEME PONG -- Main Entry
 * Classic Pong vs AI. First to 7 wins.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createPongState, serveBall, updatePong, W, H } from './pong.js';
import { render } from './renderer.js';

// -- Game State --
let state = null;
let playerTargetX = W / 2;
let difficulty = 'medium';
let gameOverDelayTimer = 0;
const GAME_OVER_DELAY = 90; // frames (~1.5s) to show banner before overlay

// -- Input Tracking --
let pointerDown = false;

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME PONG',
  gameId: 'meme-pong',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'you vs the machine',
  accentColor: '#00ff88',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('hit', {
    notes: [
      { type: 'square', frequency: 440, endFrequency: 480, duration: 0.06, gain: 0.15 },
    ],
  });

  registerSound('wall', {
    notes: [
      { type: 'sine', frequency: 300, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('score', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.25, delay: 0.3, gain: 0.3 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 150, duration: 0.4, gain: 0.2 },
      { type: 'square', frequency: 200, endFrequency: 80, duration: 0.3, delay: 0.3, gain: 0.15 },
    ],
  });
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  state = createPongState(difficulty);
  playerTargetX = W / 2;
  gameOverDelayTimer = 0;
};

shell.onUpdate = (dt) => {
  if (!state) return;

  // Game over delay: show banner on canvas before transitioning to overlay
  if (state.gameOver) {
    gameOverDelayTimer += dt;
    if (gameOverDelayTimer >= GAME_OVER_DELAY) {
      shell.setState('game-over');
    }
    return;
  }

  const result = updatePong(state, playerTargetX, dt);

  if (result.event) {
    switch (result.event) {
      case 'hit':
        playSound('hit');
        break;
      case 'wall':
        playSound('wall');
        break;
      case 'playerScore':
        playSound('score');
        break;
      case 'aiScore':
        playSound('score');
        break;
      case 'win':
        playSound('win');
        gameOverDelayTimer = 0;
        break;
      case 'lose':
        playSound('lose');
        gameOverDelayTimer = 0;
        break;
    }
  }
};

shell.onRender = (ctx) => {
  if (!state) return;
  render(ctx, state);
};

shell.onGameOver = () => {
  if (!state) return { score: 0 };

  const won = state.winner === 'player';
  const baseScore = state.playerScore * 100;
  const rallyBonus = state.longestRally * 10;
  const score = baseScore + rallyBonus;

  const message = won
    ? `you bodied the AI ${state.playerScore}-${state.aiScore}`
    : `AI cooked you ${state.aiScore}-${state.playerScore}`;

  return {
    score,
    message,
    scoreLabel: 'score',
  };
};

// -- Input Handling --

/**
 * Convert a client coordinate to logical canvas X.
 */
function clientToLogicalX(clientX) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return (clientX - rect.left) * (W / rect.width);
}

function clientToLogicalY(clientY) {
  const canvas = shell.getCanvas();
  const rect = canvas.getBoundingClientRect();
  return (clientY - rect.top) * (H / rect.height);
}

function handlePointerStart(clientX, clientY) {
  initAudio();
  pointerDown = true;

  const lx = clientToLogicalX(clientX);
  const ly = clientToLogicalY(clientY);

  // Quit button hit test
  if (lx >= W - 60 && ly <= 38 && state && !state.gameOver) {
    shell.setState('game-over');
    return;
  }

  // Serve on tap
  if (state && state.serving && !state.gameOver) {
    serveBall(state);
  }

  playerTargetX = lx;
}

function handlePointerMove(clientX) {
  if (!pointerDown) return;
  playerTargetX = clientToLogicalX(clientX);
}

function handlePointerEnd() {
  pointerDown = false;
}

// -- Keyboard Input --
const keysDown = new Set();

function handleKeyDown(e) {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault();
    keysDown.add(e.code);
  }
  if (e.code === 'Space') {
    e.preventDefault();
    initAudio();
    if (state && state.serving && !state.gameOver) {
      serveBall(state);
    }
  }
}

function handleKeyUp(e) {
  keysDown.delete(e.code);
}

// Keyboard movement: update playerTargetX each frame based on held keys
function updateKeyboardInput(dt) {
  const speed = 8 * dt;
  if (keysDown.has('ArrowLeft')) {
    playerTargetX -= speed;
  }
  if (keysDown.has('ArrowRight')) {
    playerTargetX += speed;
  }
  // Clamp
  playerTargetX = Math.max(0, Math.min(W, playerTargetX));
}

// Patch onUpdate to include keyboard input
const originalOnUpdate = shell.onUpdate;
shell.onUpdate = (dt) => {
  updateKeyboardInput(dt);
  originalOnUpdate(dt);
};

// -- Difficulty Selector --
function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const label = document.createElement('p');
  label.className = 'text-secondary text-sm';
  label.textContent = 'difficulty';
  label.style.marginBottom = '4px';
  secondary.appendChild(label);

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const levels = ['easy', 'medium', 'hard'];
  const buttons = [];

  levels.forEach((level) => {
    const btn = document.createElement('button');
    btn.className = 'difficulty-btn' + (level === difficulty ? ' active' : '');
    btn.textContent = level;
    btn.addEventListener('click', () => {
      difficulty = level;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
    buttons.push(btn);
  });

  secondary.appendChild(container);
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();
  buildDifficultySelector();

  const canvas = shell.getCanvas();

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    handlePointerStart(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX);
  });
  window.addEventListener('mouseup', () => {
    handlePointerEnd();
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handlePointerStart(touch.clientX, touch.clientY);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handlePointerMove(touch.clientX);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePointerEnd();
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});
