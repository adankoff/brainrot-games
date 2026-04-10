/**
 * MEME BEE -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { SpellingBee } from './spellingbee.js';
import { render, getHitTarget } from './renderer.js';

// ---- Constants ----
const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

// ---- Module state ----
let bee = new SpellingBee();
let audioInitialized = false;
let hexPressAnim = []; // { index, timer } for press feedback

// ---- Shell setup ----
const shell = new GameShell({
  title: 'MEME BEE',
  gameId: 'meme-bee',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-bee',
  subtitle: 'find words. flex brain.',
  accentColor: '#f5c518',
  shareUrl: 'https://brainrotgames.com/games/game-116/',
});

// ---- Register game-specific sounds ----
function ensureAudio() {
  if (audioInitialized) return;
  try {
    initAudio();

    registerSound('tap', {
      notes: [
        { type: 'sine', frequency: 660, duration: 0.04, gain: 0.1 },
      ],
    });

    registerSound('submit', {
      notes: [
        { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
        { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
      ],
    });

    registerSound('invalid', {
      notes: [
        { type: 'sawtooth', frequency: 200, endFrequency: 150, duration: 0.15, gain: 0.2 },
        { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.15, delay: 0.15, gain: 0.2 },
      ],
    });

    registerSound('pangram', {
      notes: [
        { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.25 },
        { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.08, gain: 0.25 },
        { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.16, gain: 0.25 },
        { type: 'triangle', frequency: 1047, duration: 0.15, delay: 0.24, gain: 0.3 },
      ],
    });

    audioInitialized = true;
  } catch {
    // Audio may not be available
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  bee = new SpellingBee();
  bee.startNewPuzzle();
  hexPressAnim = [];
};

shell.onUpdate = (dt) => {
  bee.update(dt);

  // Decay hex press animations
  for (let i = hexPressAnim.length - 1; i >= 0; i--) {
    hexPressAnim[i].timer -= dt;
    if (hexPressAnim[i].timer <= 0) {
      hexPressAnim.splice(i, 1);
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, bee);
};

shell.onGameOver = () => {
  const rank = bee.getRank();
  const wordsFound = bee.foundWords.length;
  const total = bee.getTotalWordCount();
  return {
    score: bee.score,
    message: `${rank} -- ${wordsFound}/${total} words`,
    scoreLabel: 'points',
  };
};

// ---- Handle tap on canvas ----

function handleTapAt(pos) {
  ensureAudio();

  if (shell.state !== 'playing') return;

  const hit = getHitTarget(pos.x, pos.y, bee);
  if (!hit) return;

  if (hit.type === 'letter') {
    bee.addLetter(hit.letter);
    playSound('tap');
    hexPressAnim.push({ index: hit.index, timer: 6 });
  } else if (hit.type === 'enter') {
    submitCurrentWord();
  } else if (hit.type === 'delete') {
    if (bee.deleteLetter()) {
      playSound('tap');
    }
  } else if (hit.type === 'shuffle') {
    bee.shuffle();
    playSound('tap');
  } else if (hit.type === 'done') {
    shell.setState('game-over');
  }
}

function submitCurrentWord() {
  if (bee.currentWord.length === 0) return;

  const result = bee.submitWord();
  if (result === 'valid') {
    playSound('submit');
  } else if (result === 'pangram') {
    playSound('pangram');
  } else {
    playSound('invalid');
  }
}

// ---- Keyboard support ----

function handleKeyDown(e) {
  if (shell.state !== 'playing') return;

  const key = e.key.toLowerCase();

  if (key === 'enter') {
    e.preventDefault();
    submitCurrentWord();
    return;
  }

  if (key === 'backspace' || key === 'delete') {
    e.preventDefault();
    ensureAudio();
    bee.deleteLetter();
    playSound('tap');
    return;
  }

  if (key === 'escape') {
    e.preventDefault();
    bee.clearWord();
    return;
  }

  // Space for shuffle
  if (key === ' ') {
    e.preventDefault();
    ensureAudio();
    bee.shuffle();
    playSound('tap');
    return;
  }

  // Letter keys
  if (/^[a-z]$/.test(key)) {
    ensureAudio();
    if (bee.allLetters.includes(key)) {
      bee.addLetter(key);
      playSound('tap');
    } else {
      playSound('invalid');
    }
  }
}

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTapAt(handleTapAt);

// Add keyboard listener (the input manager only handles space/enter as generic taps)
document.addEventListener('keydown', handleKeyDown);
