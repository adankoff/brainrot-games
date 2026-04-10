/**
 * MEME SOKOBAN -- Main Entry Point
 * Wires up the GameShell, input handling, sounds, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { SokobanGame } from './sokoban.js';
import { renderGame, renderMenuBg } from './renderer.js';

// ---- Constants ----

const W = 400;
const H = 700;
const ANIM_SPEED = 10; // animation progress per normalized frame (~100ms at 60fps)

// ---- Game State ----

const game = new SokobanGame();
let solvedFlash = 0;
let solvedPending = false;
let solvedDelay = 0;
let menuTime = 0;

// ---- Sound Registration ----

function registerSounds() {
  registerSound('move', {
    notes: [
      { type: 'sine', frequency: 220, endFrequency: 260, duration: 0.06, gain: 0.08 },
    ],
  });

  registerSound('push', {
    notes: [
      { type: 'square', frequency: 150, endFrequency: 180, duration: 0.08, gain: 0.1 },
      { type: 'sine', frequency: 300, duration: 0.04, delay: 0.04, gain: 0.06 },
    ],
  });

  registerSound('solve', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.2 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'sawtooth', frequency: 100, duration: 0.08, gain: 0.08 },
    ],
  });

  registerSound('undo', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 300, duration: 0.08, gain: 0.08 },
    ],
  });
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME SOKOBAN',
  gameId: 'meme-sokoban',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'sokoban',
  subtitle: 'push crates. solve puzzles. lose braincells.',
  accentColor: '#4ecdc4',
  shareUrl: 'https://brainrotgames.com/games/game-130/',
  onMenuRender: (ctx) => {
    renderMenuBg(ctx, W, H, menuTime);
  },
  onMenuUpdate: (dt) => {
    menuTime += dt / 60;
  },
});

// ---- Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();
  game.startGame();
  solvedFlash = 0;
  solvedPending = false;
  solvedDelay = 0;
  setupInputListeners();
};

shell.onUpdate = (dt) => {
  // Advance animation
  if (game.animation) {
    game.animation.progress += ANIM_SPEED * (dt / 60);
    if (game.animation.progress >= 1) {
      game.animation.progress = 1;
      game.animation = null;
    }
  }

  // Solved flash decay
  if (solvedFlash > 0) {
    solvedFlash -= 0.03 * dt;
    if (solvedFlash < 0) solvedFlash = 0;
  }

  // Delay before next level or game over
  if (solvedPending) {
    solvedDelay -= dt / 60;
    if (solvedDelay <= 0) {
      solvedPending = false;
      game.nextLevel();
      if (game.allLevelsComplete) {
        shell.setState('game-over');
      }
    }
  }
};

shell.onRender = (ctx) => {
  renderGame(ctx, game, W, H, solvedFlash);

  // Draw control hints at bottom
  _drawControlBar(ctx);
};

shell.onGameOver = () => {
  const score = game.getScore();
  return {
    score,
    message: game.allLevelsComplete
      ? `all ${game.getLevelCount()} levels cleared! absolute unit.`
      : `cleared ${game.levelsCompleted} levels. not bad fr.`,
    scoreLabel: 'score',
  };
};

// ---- Control Bar ----

function _drawControlBar(ctx) {
  const barY = H - 44;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, barY, W, 44);

  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const btnW = 70;
  const btnH = 28;
  const btnY = barY + 8;
  const gap = 12;
  const totalW = btnW * 4 + gap * 3;
  const startX = (W - totalW) / 2;

  const buttons = ['UNDO', 'RESET', 'QUIT', 'WASD'];

  for (let i = 0; i < buttons.length; i++) {
    const bx = startX + i * (btnW + gap);
    const by = btnY;

    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    _roundRect(ctx, bx, by, btnW, btnH, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ccc';
    ctx.fillText(buttons[i], bx + btnW / 2, by + btnH / 2);
  }
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ---- Input ----

/** @type {(() => void)[]} Cleanup functions for input listeners */
let inputCleanup = [];

function setupInputListeners() {
  // Remove any previous listeners
  for (const fn of inputCleanup) fn();
  inputCleanup = [];

  // Keyboard
  const onKeyDown = (e) => {
    if (shell.state !== 'playing' || solvedPending) return;

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        handleMove(-1, 0);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        handleMove(1, 0);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        handleMove(0, -1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        handleMove(0, 1);
        break;
      case 'KeyZ':
        e.preventDefault();
        handleUndo();
        break;
      case 'KeyR':
        e.preventDefault();
        handleReset();
        break;
      case 'Escape':
        e.preventDefault();
        shell.setState('game-over');
        break;
    }
  };
  document.addEventListener('keydown', onKeyDown);
  inputCleanup.push(() => document.removeEventListener('keydown', onKeyDown));

  // Canvas tap (for button bar and swipe)
  const canvas = shell.getCanvas();
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  const onTouchStart = (e) => {
    if (shell.state !== 'playing') return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  };

  const onTouchEnd = (e) => {
    if (shell.state !== 'playing') return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if it's a tap on control buttons
    const rect = canvas.getBoundingClientRect();
    const logY = (touch.clientY - rect.top) * (H / rect.height);
    const logX = (touch.clientX - rect.left) * (W / rect.width);

    if (logY > H - 44) {
      // Tapped in control bar
      _handleControlBarTap(logX);
      return;
    }

    // Swipe detection
    if (dist > 20 && elapsed < 500 && !solvedPending) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(0, dx > 0 ? 1 : -1);
      } else {
        handleMove(dy > 0 ? 1 : -1, 0);
      }
    }
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  inputCleanup.push(() => {
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchend', onTouchEnd);
  });

  // Mouse click on control bar
  const onMouseDown = (e) => {
    if (shell.state !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const logY = (e.clientY - rect.top) * (H / rect.height);
    const logX = (e.clientX - rect.left) * (W / rect.width);

    if (logY > H - 44) {
      _handleControlBarTap(logX);
    }
  };
  canvas.addEventListener('mousedown', onMouseDown);
  inputCleanup.push(() => canvas.removeEventListener('mousedown', onMouseDown));
}

function _handleControlBarTap(logX) {
  const btnW = 70;
  const gap = 12;
  const totalW = btnW * 4 + gap * 3;
  const startX = (W - totalW) / 2;

  for (let i = 0; i < 4; i++) {
    const bx = startX + i * (btnW + gap);
    if (logX >= bx && logX <= bx + btnW) {
      switch (i) {
        case 0: handleUndo(); break;
        case 1: handleReset(); break;
        case 2: shell.setState('game-over'); break;
        // case 3: WASD label, no action
      }
      return;
    }
  }
}

// ---- Move Handling ----

function handleMove(dr, dc) {
  const result = game.tryMove(dr, dc);

  switch (result) {
    case 'move':
      playSound('move');
      break;
    case 'push':
      playSound('push');
      break;
    case 'solve':
      playSound('solve');
      solvedFlash = 1;
      solvedPending = true;
      solvedDelay = 1.0; // 1 second delay before next level
      break;
    case 'invalid':
      playSound('invalid');
      break;
  }
}

function handleUndo() {
  if (game.undo()) {
    playSound('undo');
  }
}

function handleReset() {
  game.resetLevel();
  playSound('undo');
}

// ---- Boot ----

shell.init();
