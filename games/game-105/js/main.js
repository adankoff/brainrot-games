/**
 * MEME TYPE -- Main Entry Point
 * Wires up GameShell, typing engine, renderer, sounds, and keyboard input.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { createTypingEngine } from './typing.js';
import { renderGame, renderGameOver, renderMenuBackground } from './renderer.js';

// ---- Constants ----
const LOGICAL_W = 400;
const LOGICAL_H = 700;
const GAME_ID = 'meme-type';

// ---- Game State ----
let duration = 60;          // Selected duration in seconds
let timeRemaining = 60;     // Countdown
let elapsedTime = 0;        // Time elapsed since start
let gameActive = false;
let menuAnimTime = 0;

// ---- Modules ----
const typing = createTypingEngine();

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME TYPE',
  gameId: GAME_ID,
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'memetype',
  subtitle: 'how fast can you type?',
  accentColor: '#00ff88',
  shareUrl: '',
});

// ---- Register Sounds ----
function setupSounds() {
  initAudio();

  registerSound('keystroke', {
    notes: [
      { type: 'square', frequency: 800, endFrequency: 600, duration: 0.03, gain: 0.06 },
    ],
  });

  registerSound('wordComplete', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.06, gain: 0.12 },
    ],
  });

  registerSound('error', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 120, duration: 0.08, gain: 0.1 },
    ],
  });

  registerSound('finish', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.36, gain: 0.2 },
    ],
  });

  registerSound('countdown', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.08, gain: 0.1 },
    ],
  });
}

// ---- Keyboard Handler ----
let keyHandler = null;

function attachKeyboard() {
  if (keyHandler) return;

  keyHandler = (e) => {
    // Only process during gameplay
    if (shell.state !== 'playing' || !gameActive) return;

    // Ignore modifier keys, function keys, etc.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;

    // Prevent default to stop browser shortcuts
    e.preventDefault();

    // Init audio on first keypress
    initAudio();

    const result = typing.processKey(e.key);

    switch (result) {
      case 'correct':
        playSound('keystroke');
        break;
      case 'wordComplete':
        playSound('wordComplete');
        break;
      case 'error':
        playSound('error');
        break;
    }
  };

  document.addEventListener('keydown', keyHandler);
}

function detachKeyboard() {
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  setupSounds();
  typing.reset();

  timeRemaining = duration;
  elapsedTime = 0;
  gameActive = true;

  attachKeyboard();
};

shell.onUpdate = (dt) => {
  if (!gameActive) return;

  // Update timer (dt is normalized to 60fps, so 1.0 = ~16.67ms)
  const deltaSeconds = dt * (1 / 60);
  elapsedTime += deltaSeconds;
  timeRemaining -= deltaSeconds;

  // Countdown beeps at 5, 4, 3, 2, 1
  const prevSec = Math.ceil(timeRemaining + deltaSeconds);
  const currSec = Math.ceil(timeRemaining);
  if (currSec !== prevSec && currSec >= 1 && currSec <= 5) {
    playSound('countdown');
  }

  // Check if time is up
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    gameActive = false;
    playSound('finish');
    detachKeyboard();

    // Small delay before showing game over
    setTimeout(() => {
      shell.setState('game-over');
    }, 600);
    return;
  }

  // Update typing engine (error flash timers, etc.)
  typing.update(dt);
};

shell.onRender = (ctx) => {
  if (shell.state === 'menu') {
    menuAnimTime += 16.67;
    renderMenuBackground(ctx, menuAnimTime);
    return;
  }

  const typingState = typing.getState();
  const currentWord = typing.getCurrentWord();
  const previewWords = typing.getPreviewWords(3);
  const wpm = typing.calculateWPM(elapsedTime);
  const accuracy = typing.calculateAccuracy();

  const gameState = {
    timeRemaining,
    duration,
  };

  renderGame(ctx, gameState, typingState, currentWord, previewWords, wpm, accuracy);
};

shell.onGameOver = () => {
  detachKeyboard();

  const typingState = typing.getState();
  const wpm = typing.calculateWPM(duration);
  const accuracy = typing.calculateAccuracy();
  const score = Math.round(wpm * (accuracy / 100));

  // Store stats for game-over render
  lastGameStats = {
    wpm,
    accuracy,
    wordsCompleted: typingState.wordsCompleted,
    charsTyped: typingState.charsTyped,
    errors: typingState.errors,
    maxStreak: typingState.maxStreak,
    score,
  };

  // Build message based on WPM
  let message = '';
  if (wpm >= 100) message = 'absolute demon typist';
  else if (wpm >= 80) message = 'goated keyboard warrior';
  else if (wpm >= 60) message = 'certified fast fingers';
  else if (wpm >= 40) message = 'decent typing game';
  else if (wpm >= 20) message = 'you can do better fr';
  else message = 'bro is using one finger';

  return {
    score,
    message,
    scoreLabel: `${wpm} WPM x ${accuracy}% ACC`,
  };
};

let lastGameStats = null;

shell.onGameOverRender = (ctx) => {
  if (lastGameStats) {
    renderGameOver(ctx, lastGameStats);
  }
};

// ---- Menu Customization: Duration Selector ----

function buildDurationSelector() {
  const menuVisual = document.getElementById('menu-visual');
  if (!menuVisual) return;

  // Avoid duplicates
  if (menuVisual.querySelector('.duration-selector')) return;

  // Duration buttons
  const selectorDiv = document.createElement('div');
  selectorDiv.className = 'duration-selector';

  [30, 60, 90].forEach((sec) => {
    const btn = document.createElement('button');
    btn.className = 'duration-btn' + (sec === duration ? ' active' : '');
    btn.textContent = `${sec}s`;
    btn.addEventListener('click', () => {
      initAudio();
      playSound('uiclick');
      duration = sec;
      timeRemaining = sec;
      // Update active class
      selectorDiv.querySelectorAll('.duration-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    selectorDiv.appendChild(btn);
  });

  menuVisual.appendChild(selectorDiv);

  // Mobile notice
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    const notice = document.createElement('p');
    notice.className = 'mobile-notice';
    notice.textContent = 'keyboard required for this game';
    menuVisual.appendChild(notice);
  }
}

// ---- Menu Render Loop ----
// The shell renders menu via onRender when state is 'menu'.
// We hook the shell's _enterMenu to also rebuild our custom DOM each time.

const originalEnterMenu = shell._enterMenu.bind(shell);
shell._enterMenu = function () {
  originalEnterMenu();
  // Rebuild duration selector (DOM gets recreated by shell)
  setTimeout(buildDurationSelector, 0);
};

// ---- Boot ----
shell.init();

// Start a render loop for the menu background animation
function menuRenderLoop() {
  if (shell.state === 'menu') {
    shell.onRender(shell.getContext());
  }
  requestAnimationFrame(menuRenderLoop);
}
menuRenderLoop();
