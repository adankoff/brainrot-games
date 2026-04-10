/**
 * Brainrotle -- Main Game Logic
 * Wordle clone with brainrot/meme vocabulary.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { render, hitTestKeyboard, TileState } from './renderer.js';
import { getDailyWord, isValidGuess } from './words.js';

// ---- Constants ----

const LOGICAL_W = 400;
const LOGICAL_H = 700;
const COLS = 5;
const ROWS = 6;

const WIN_MESSAGES = [
  'no cap you\'re goated',
  'absolute sigma move',
  'brain so big rn',
  'built different fr',
  'main character energy',
  'W + valid + goated',
];

const LOSE_MESSAGES = [
  'skill issue fr fr',
  'down bad',
  'L + ratio + brainrotted',
  'not very sigma of you',
  'caught in 4k lacking',
  'oof no rizz detected',
];

const TOAST_NOT_ENOUGH = 'not enough letters';
const TOAST_NOT_VALID = 'not in word list bruh';
const TOAST_DURATION = 1.5;

// ---- Game State ----

let grid = [];
let gridStates = [];
let currentRow = 0;
let currentCol = 0;
let keyboardStates = {};
let targetWord = '';
let dayIndex = 0;
let gameWon = false;
let gameLost = false;
let gameActive = false;
let animations = {};
let message = '';
let messageTimer = 0;
let revealingRow = false; // true while flip animation is running

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'BRAINROTLE',
  gameId: 'brainrotle',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 440,
  theme: 'brainrotle',
  subtitle: 'wordle but brainrot',
  accentColor: '#538d4e',
  shareUrl: '',
});

// ---- Input ----

let inputManager = null;

// ---- Sound Registration ----

function registerSounds() {
  registerSound('type', {
    notes: [
      { type: 'square', frequency: 800, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('delete', {
    notes: [
      { type: 'square', frequency: 400, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('flip', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 800, duration: 0.12, gain: 0.06 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.15, delay: 0.3, gain: 0.2 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 200, duration: 0.3, gain: 0.15 },
      { type: 'sawtooth', frequency: 200, endFrequency: 100, duration: 0.3, delay: 0.3, gain: 0.12 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'square', frequency: 150, duration: 0.08, gain: 0.15 },
      { type: 'square', frequency: 120, duration: 0.08, delay: 0.08, gain: 0.12 },
    ],
  });
}

// ---- Game Logic ----

/**
 * Reset game state for a new round.
 */
function resetGame() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  gridStates = Array.from({ length: ROWS }, () => Array(COLS).fill(TileState.EMPTY));
  currentRow = 0;
  currentCol = 0;
  keyboardStates = {};
  gameWon = false;
  gameLost = false;
  gameActive = true;
  animations = {};
  message = '';
  messageTimer = 0;
  revealingRow = false;

  // Get daily word
  const daily = getDailyWord();
  targetWord = daily.word;
  dayIndex = daily.dayIndex;

  // Check if already played today
  const savedDay = getData('brainrotle', 'lastDay');
  const savedState = getData('brainrotle', 'boardState');

  if (savedDay === String(dayIndex) && savedState) {
    try {
      const parsed = JSON.parse(savedState);
      restoreState(parsed);
    } catch {
      // Corrupted save, start fresh
    }
  }
}

/**
 * Restore a saved game state.
 *
 * @param {Object} saved
 */
function restoreState(saved) {
  if (!saved.guesses || !Array.isArray(saved.guesses)) return;

  for (let i = 0; i < saved.guesses.length && i < ROWS; i++) {
    const guess = saved.guesses[i];
    if (guess.length !== COLS) continue;

    for (let c = 0; c < COLS; c++) {
      grid[i][c] = guess[c];
    }
    // Evaluate the guess
    const result = evaluateGuess(guess);
    for (let c = 0; c < COLS; c++) {
      gridStates[i][c] = result[c];
      updateKeyboardState(guess[c], result[c]);
    }
    currentRow = i + 1;
    currentCol = 0;

    if (guess === targetWord) {
      gameWon = true;
      gameActive = false;
    }
  }

  if (currentRow >= ROWS && !gameWon) {
    gameLost = true;
    gameActive = false;
  }
}

/**
 * Evaluate a guess against the target word.
 * Returns array of TileState values.
 *
 * @param {string} guess - 5-letter uppercase guess
 * @returns {string[]}
 */
function evaluateGuess(guess) {
  const result = Array(COLS).fill(TileState.ABSENT);
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  const used = Array(COLS).fill(false);

  // First pass: correct positions (green)
  for (let i = 0; i < COLS; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = TileState.CORRECT;
      used[i] = true;
      guessLetters[i] = null; // Mark as handled
    }
  }

  // Second pass: wrong position (yellow)
  for (let i = 0; i < COLS; i++) {
    if (guessLetters[i] === null) continue; // Already correct
    for (let j = 0; j < COLS; j++) {
      if (!used[j] && guessLetters[i] === targetLetters[j]) {
        result[i] = TileState.PRESENT;
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Update keyboard state for a letter.
 * Priority: correct > present > absent.
 *
 * @param {string} letter
 * @param {string} state - TileState value
 */
function updateKeyboardState(letter, state) {
  const current = keyboardStates[letter];
  if (!current) {
    keyboardStates[letter] = state;
    return;
  }
  // Only upgrade: absent -> present -> correct
  const priority = { [TileState.ABSENT]: 0, [TileState.PRESENT]: 1, [TileState.CORRECT]: 2 };
  if ((priority[state] || 0) > (priority[current] || 0)) {
    keyboardStates[letter] = state;
  }
}

/**
 * Save current board state to localStorage.
 */
function saveState() {
  const guesses = [];
  for (let i = 0; i < currentRow; i++) {
    guesses.push(grid[i].join(''));
  }
  setData('brainrotle', 'lastDay', String(dayIndex));
  setData('brainrotle', 'boardState', JSON.stringify({ guesses }));
}

/**
 * Show a toast message.
 *
 * @param {string} text
 */
function showToast(text) {
  message = text;
  messageTimer = TOAST_DURATION;
}

/**
 * Handle a letter input.
 *
 * @param {string} letter - Single uppercase letter
 */
function inputLetter(letter) {
  if (!gameActive || revealingRow) return;
  if (currentCol >= COLS) return;

  grid[currentRow][currentCol] = letter;
  gridStates[currentRow][currentCol] = TileState.FILLED;
  currentCol++;
  playSound('type');
}

/**
 * Handle backspace/delete input.
 */
function inputDelete() {
  if (!gameActive || revealingRow) return;
  if (currentCol <= 0) return;

  currentCol--;
  grid[currentRow][currentCol] = '';
  gridStates[currentRow][currentCol] = TileState.EMPTY;
  playSound('delete');
}

/**
 * Handle enter/submit input.
 */
function inputEnter() {
  if (!gameActive || revealingRow) return;

  if (currentCol < COLS) {
    showToast(TOAST_NOT_ENOUGH);
    triggerShake();
    playSound('invalid');
    return;
  }

  const guess = grid[currentRow].join('');

  if (!isValidGuess(guess)) {
    showToast(TOAST_NOT_VALID);
    triggerShake();
    playSound('invalid');
    return;
  }

  // Evaluate guess
  const result = evaluateGuess(guess);

  // Start flip animation
  revealingRow = true;
  animations.flips = animations.flips || {};
  animations.flips[currentRow] = {};

  const flipDuration = 0.4; // seconds per tile
  const flipDelay = 0.15; // stagger between tiles

  for (let c = 0; c < COLS; c++) {
    animations.flips[currentRow][c] = {
      timer: flipDuration + c * flipDelay,
      duration: flipDuration,
      delay: c * flipDelay,
      targetState: result[c],
      soundPlayed: false,
    };
  }

  // The reveal will be completed in update() after all flips finish
  // Store pending result
  animations.pendingResult = {
    row: currentRow,
    guess,
    result,
  };
}

/**
 * Trigger shake animation on current row.
 */
function triggerShake() {
  animations.shake = {
    row: currentRow,
    timer: 0.5,
  };
}

/**
 * Trigger bounce animation (win celebration).
 *
 * @param {number} row
 */
function triggerBounce(row) {
  animations.bounce = {};
  for (let c = 0; c < COLS; c++) {
    animations.bounce[c] = {
      timer: 0.5 + c * 0.08,
      duration: 0.5,
    };
  }
}

/**
 * Complete a row reveal after flip animations finish.
 */
function completeReveal() {
  if (!animations.pendingResult) return;

  const { row, guess, result } = animations.pendingResult;
  animations.pendingResult = null;
  revealingRow = false;

  // Set final grid states
  for (let c = 0; c < COLS; c++) {
    gridStates[row][c] = result[c];
    updateKeyboardState(guess[c], result[c]);
  }

  currentRow++;
  currentCol = 0;

  // Save progress
  saveState();

  // Check win/loss
  if (guess === targetWord) {
    gameWon = true;
    gameActive = false;
    triggerBounce(row);
    playSound('win');

    // Delay game-over to let bounce animation play
    setTimeout(() => {
      shell.setState('game-over');
    }, 1500);
  } else if (currentRow >= ROWS) {
    gameLost = true;
    gameActive = false;
    showToast(targetWord);
    playSound('lose');

    setTimeout(() => {
      shell.setState('game-over');
    }, 2500);
  }
}

// ---- Keyboard Input ----

function handleKeyDown(e) {
  if (shell.state !== 'playing') return;

  // Initialize audio on first interaction
  initAudio();

  const key = e.key;

  if (key === 'Enter') {
    e.preventDefault();
    inputEnter();
  } else if (key === 'Backspace') {
    e.preventDefault();
    inputDelete();
  } else if (/^[a-zA-Z]$/.test(key)) {
    e.preventDefault();
    inputLetter(key.toUpperCase());
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();
  resetGame();

  // Set up input manager for on-screen keyboard taps
  const canvas = shell.getCanvas();
  if (inputManager) inputManager.destroy();
  inputManager = createInputManager(canvas, LOGICAL_W, LOGICAL_H);

  inputManager.onTapAt((pos) => {
    initAudio();
    const key = hitTestKeyboard(pos);
    if (!key) return;

    if (key === 'ENTER') {
      inputEnter();
    } else if (key === 'BACKSPACE') {
      inputDelete();
    } else {
      inputLetter(key);
    }
  });

  // Register physical keyboard handler
  document.addEventListener('keydown', handleKeyDown);

  // If game was already completed (restored from save), go to game-over
  if (gameWon || gameLost) {
    // Short delay so user sees the board first
    setTimeout(() => {
      shell.setState('game-over');
    }, 500);
  }
};

shell.onUpdate = (dt) => {
  const dtSec = dt / 60; // Convert normalized dt to approximate seconds

  // Update message timer
  if (messageTimer > 0) {
    messageTimer -= dtSec;
  }

  // Update shake animation
  if (animations.shake && animations.shake.timer > 0) {
    animations.shake.timer -= dtSec;
  }

  // Update bounce animations
  if (animations.bounce) {
    for (const col in animations.bounce) {
      if (animations.bounce[col].timer > 0) {
        animations.bounce[col].timer -= dtSec;
      }
    }
  }

  // Update flip animations
  let allFlipsDone = true;
  if (animations.flips) {
    for (const row in animations.flips) {
      for (const col in animations.flips[row]) {
        const flip = animations.flips[row][col];
        if (flip.timer > 0) {
          flip.timer -= dtSec;
          allFlipsDone = false;

          // Play flip sound at midpoint
          const progress = 1 - (flip.timer / (flip.duration + flip.delay));
          if (progress >= 0.4 && !flip.soundPlayed) {
            flip.soundPlayed = true;
            playSound('flip');
          }
        }
      }
    }
  }

  // Complete reveal when all flips are done
  if (revealingRow && allFlipsDone && animations.pendingResult) {
    completeReveal();
  }
};

shell.onRender = (ctx) => {
  render(ctx, {
    grid,
    gridStates,
    currentRow,
    currentCol,
    keyboardStates,
    animations,
    logicalWidth: LOGICAL_W,
    logicalHeight: LOGICAL_H,
    message,
    messageTimer,
  });
};

shell.onGameOver = () => {
  // Clean up keyboard listener
  document.removeEventListener('keydown', handleKeyDown);
  if (inputManager) {
    inputManager.destroy();
    inputManager = null;
  }

  const score = gameWon ? (7 - currentRow) * 10 : 0;
  const messages = gameWon ? WIN_MESSAGES : LOSE_MESSAGES;
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return {
    score,
    message: msg,
    scoreLabel: gameWon ? `guessed in ${currentRow}/6` : `the word was ${targetWord}`,
  };
};

// Render the final board state behind the game-over overlay
shell.onGameOverRender = (ctx) => {
  render(ctx, {
    grid,
    gridStates,
    currentRow,
    currentCol,
    keyboardStates,
    animations: {},
    logicalWidth: LOGICAL_W,
    logicalHeight: LOGICAL_H,
    message: '',
    messageTimer: 0,
  });
};

// ---- Init ----

shell.init();
