/**
 * MEME HANGMAN -- Main
 * GameShell integration, input handling, and core game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getRandomWord } from './words.js';
import { renderFrame, computeKeyboardLayout } from './renderer.js';

// ---- Constants ----

const LOGICAL_W = 400;
const LOGICAL_H = 700;
const MAX_WRONG = 6;

const WIN_MESSAGES = [
  'big brain moment',
  'galaxy brain fr',
  'actually not brainrotted',
  'you ate that up',
  'no cap you cooked',
  'W rizz on that word',
];

const LOSE_MESSAGES = [
  'rip bozo',
  'down astronomical',
  'the brainrot won',
  'skill issue detected',
  'L + ratio + hanged',
  'not very sigma of you',
];

// ---- Game State ----

const state = {
  currentWord: '',
  category: '',
  hint: '',
  guessedLetters: new Set(),
  wrongCount: 0,
  won: false,
  lost: false,
  gameEnded: false,
  score: 0,
  totalScore: 0,
  roundsPlayed: 0,
  roundsWon: 0,
  usedWordIndices: new Set(),
  revealFlash: 0,
  endDelay: 0,
  endMessage: '',
};

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME HANGMAN',
  gameId: 'meme-hangman',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'meme-hangman',
  subtitle: 'guess the brainrot word or get hanged fr',
  accentColor: '#c8ff00',
  shareUrl: '',
});

let input = null;
let keyLayout = [];
let keydownHandler = null;

// ---- Sound Registration ----

function registerSounds() {
  registerSound('correct', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.06, gain: 0.12 },
    ],
  });

  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.2, gain: 0.2 },
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
      { type: 'square', frequency: 440, duration: 0.2, gain: 0.2 },
      { type: 'square', frequency: 370, duration: 0.2, delay: 0.2, gain: 0.2 },
      { type: 'square', frequency: 311, duration: 0.2, delay: 0.4, gain: 0.2 },
      { type: 'square', frequency: 261, duration: 0.3, delay: 0.6, gain: 0.25 },
    ],
  });
}

// ---- Game Logic ----

function startNewRound() {
  const entry = getRandomWord(state.usedWordIndices);
  state.usedWordIndices.add(entry.index);

  state.currentWord = entry.word;
  state.category = entry.category;
  state.hint = entry.hint;
  state.guessedLetters = new Set();
  state.wrongCount = 0;
  state.won = false;
  state.lost = false;
  state.gameEnded = false;
  state.revealFlash = 0;
  state.endDelay = 0;
}

function guessLetter(letter) {
  if (state.gameEnded) return;
  if (state.guessedLetters.has(letter)) return;

  state.guessedLetters.add(letter);

  const wordLetters = state.currentWord.replace(/ /g, '');

  if (state.currentWord.includes(letter)) {
    // Correct guess
    playSound('correct');
    state.revealFlash = 1;
    state.won = true; // assume won, check below

    // Check if all letters are guessed
    const uniqueLetters = new Set(wordLetters.split(''));
    for (const ch of uniqueLetters) {
      if (!state.guessedLetters.has(ch)) {
        state.won = false;
        break;
      }
    }

    if (state.won) {
      state.gameEnded = true;
      state.roundsWon++;
      const wordLen = wordLetters.length;
      const livesLeft = MAX_WRONG - state.wrongCount;
      state.score = livesLeft * 10 + wordLen * 5;
      state.totalScore += state.score;
      state.endMessage = WIN_MESSAGES[state.roundsWon % WIN_MESSAGES.length];
      playSound('win');
    }
  } else {
    // Wrong guess
    state.wrongCount++;
    playSound('wrong');
    state.revealFlash = 1;
    state.won = false;

    if (state.wrongCount >= MAX_WRONG) {
      state.lost = true;
      state.gameEnded = true;
      state.score = 0;
      state.endMessage = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
      playSound('lose');
    }
  }
}

/**
 * Find which keyboard key was tapped based on logical coordinates.
 *
 * @param {{ x: number, y: number }} pos
 * @returns {string|null} The letter tapped, or null
 */
function hitTestKeyboard(pos) {
  for (const key of keyLayout) {
    if (
      pos.x >= key.x &&
      pos.x <= key.x + key.w &&
      pos.y >= key.y &&
      pos.y <= key.y + key.h
    ) {
      return key.letter;
    }
  }
  return null;
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  // Reset cumulative state
  state.totalScore = 0;
  state.roundsPlayed = 0;
  state.roundsWon = 0;
  state.usedWordIndices = new Set();

  startNewRound();

  // Compute keyboard layout once
  keyLayout = computeKeyboardLayout(LOGICAL_W, LOGICAL_H);

  // Input: on-screen keyboard via tap position
  const canvas = shell.getCanvas();
  if (input) input.destroy();
  input = createInputManager(canvas, LOGICAL_W, LOGICAL_H);

  input.onTapAt((pos) => {
    initAudio();
    if (state.gameEnded) {
      // After game end, tap advances to next round or game over
      if (state.endDelay > 1) {
        advanceAfterRound();
      }
      return;
    }

    const letter = hitTestKeyboard(pos);
    if (letter) {
      guessLetter(letter);
    }
  });

  // Physical keyboard
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
  }
  keydownHandler = (e) => {
    // Prevent default space/enter in input manager from interfering
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      e.preventDefault();
      initAudio();
      if (state.gameEnded) {
        if (state.endDelay > 1) {
          advanceAfterRound();
        }
        return;
      }
      guessLetter(key);
    }
    // Enter/Space to advance after round
    if ((e.code === 'Enter' || e.code === 'Space') && state.gameEnded && state.endDelay > 1) {
      e.preventDefault();
      advanceAfterRound();
    }
  };
  document.addEventListener('keydown', keydownHandler);
};

function advanceAfterRound() {
  if (state.won) {
    // Continue to next word
    state.roundsPlayed++;
    startNewRound();
  } else {
    // Lost - go to game over
    state.roundsPlayed++;
    shell.setState('game-over');
  }
}

shell.onUpdate = (dt) => {
  // Fade reveal flash
  if (state.revealFlash > 0) {
    state.revealFlash = Math.max(0, state.revealFlash - dt * 0.08);
  }

  // Delay before allowing advance after round end
  if (state.gameEnded && state.endDelay < 2) {
    state.endDelay += dt * 0.03;
  }
};

shell.onRender = (ctx) => {
  renderFrame(ctx, state, LOGICAL_W, LOGICAL_H, keyLayout);

  // Draw prompt after round ends
  if (state.gameEnded && state.endDelay > 1) {
    ctx.save();
    ctx.font = `bold 14px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const alpha = Math.min(1, (state.endDelay - 1) * 2);
    ctx.globalAlpha = alpha;

    if (state.won) {
      ctx.fillStyle = '#00e676';
      ctx.font = `bold 18px "Space Grotesk", sans-serif`;
      ctx.fillText(state.endMessage, LOGICAL_W / 2, 230);
      ctx.font = `14px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#aaaacc';
      ctx.fillText(`+${state.score} pts  |  tap for next word`, LOGICAL_W / 2, 255);
    } else {
      ctx.fillStyle = '#ff1744';
      ctx.font = `bold 18px "Space Grotesk", sans-serif`;
      ctx.fillText(state.endMessage, LOGICAL_W / 2, 230);
      ctx.font = `14px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#aaaacc';
      ctx.fillText('tap to continue', LOGICAL_W / 2, 255);
    }

    ctx.restore();
  }

  // Draw running score in top left
  if (state.totalScore > 0 || state.roundsPlayed > 0) {
    ctx.save();
    ctx.font = `bold 14px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#c8ff00';
    ctx.fillText(`${state.totalScore} pts`, 10, 10);
    ctx.font = `12px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#888899';
    ctx.fillText(`round ${state.roundsPlayed + 1}`, 10, 28);
    ctx.restore();
  }
};

shell.onGameOver = () => {
  // Clean up physical keyboard listener
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }
  if (input) {
    input.destroy();
    input = null;
  }

  const msg = state.roundsWon > 0
    ? `${state.roundsWon} word${state.roundsWon !== 1 ? 's' : ''} guessed`
    : state.endMessage;

  return {
    score: state.totalScore,
    message: msg,
    scoreLabel: 'total score',
  };
};

// Render the final game state behind game-over overlay
shell.onGameOverRender = (ctx) => {
  renderFrame(ctx, state, LOGICAL_W, LOGICAL_H, keyLayout);
};

// ---- Boot ----

shell.init();
