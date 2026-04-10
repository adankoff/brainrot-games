/**
 * MEME SCRAMBLE -- Main Entry Point
 * Wires up GameShell, InputManager, SoundManager, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { lerp } from '../../shared/utils.js';
import { pickWord, scrambleWord, getWordScore, checkAnswer } from './anagram.js';
import { render, getTileSize, getTileGap } from './renderer.js';

// ---- Constants ----

const LOGICAL_W = 400;
const LOGICAL_H = 700;
const TOTAL_TIME = 60; // seconds
const MAX_HINTS = 3;
const HINT_COST = 50;
const TILE_SIZE = getTileSize();
const TILE_GAP = getTileGap();
const ANIM_SPEED = 0.12; // lerp factor per frame

// ---- Game State ----

let state = {};

function resetState() {
  state = {
    score: 0,
    timeLeft: TOTAL_TIME,
    totalTime: TOTAL_TIME,
    wordsSolved: 0,
    hintsLeft: MAX_HINTS,
    currentWord: '',
    scrambledLetters: [],   // { letter, used, originalIndex }
    answerLetters: [],      // array of letter strings (or null for empty slots)
    answerSources: [],      // index into scrambledLetters for each answer slot
    hintedPositions: new Set(),
    usedWords: new Set(),
    animations: [],
    feedback: null,
    streak: 0,
    // Layout info filled by renderer
    _answerLayout: null,
    _scrambleLayout: null,
    _hintBtn: null,
    _skipBtn: null,
  };
}

// ---- Word Setup ----

function loadNewWord() {
  const word = pickWord(state.usedWords);
  state.currentWord = word;
  state.hintedPositions = new Set();

  const scrambled = scrambleWord(word);
  state.scrambledLetters = scrambled.map((letter, i) => ({
    letter,
    used: false,
    originalIndex: i,
  }));

  state.answerLetters = new Array(word.length).fill(null);
  state.answerSources = new Array(word.length).fill(-1);
  state.animations = [];
}

// ---- Tile Interaction ----

function tapScrambleTile(index) {
  const tile = state.scrambledLetters[index];
  if (!tile || tile.used) return;

  // Find first empty answer slot
  const emptySlot = state.answerLetters.indexOf(null);
  if (emptySlot === -1) return;

  tile.used = true;
  state.answerLetters[emptySlot] = tile.letter;
  state.answerSources[emptySlot] = index;

  // Create animation
  const fromPos = getScramblePos(index);
  const toPos = getAnswerPos(emptySlot);
  state.animations.push({
    letter: tile.letter,
    fromX: fromPos.x, fromY: fromPos.y,
    toX: toPos.x, toY: toPos.y,
    currentX: fromPos.x, currentY: fromPos.y,
    progress: 0,
    target: 'answer',
    targetIndex: emptySlot,
    glow: false,
  });

  playSound('tap');

  // Check if answer is complete
  if (!state.answerLetters.includes(null)) {
    checkCompletion();
  }
}

function tapAnswerTile(index) {
  const letter = state.answerLetters[index];
  if (!letter) return;

  // Don't allow removing hinted letters
  if (state.hintedPositions.has(index)) return;

  const srcIndex = state.answerSources[index];
  state.answerLetters[index] = null;
  state.answerSources[index] = -1;

  if (srcIndex >= 0 && state.scrambledLetters[srcIndex]) {
    state.scrambledLetters[srcIndex].used = false;

    // Create return animation
    const fromPos = getAnswerPos(index);
    const toPos = getScramblePos(srcIndex);
    state.animations.push({
      letter,
      fromX: fromPos.x, fromY: fromPos.y,
      toX: toPos.x, toY: toPos.y,
      currentX: fromPos.x, currentY: fromPos.y,
      progress: 0,
      target: 'scramble',
      targetIndex: srcIndex,
      glow: false,
    });
  }

  playSound('tap');
}

function checkCompletion() {
  if (checkAnswer(state.answerLetters, state.currentWord)) {
    // Correct!
    const pts = getWordScore(state.currentWord);
    state.score += pts;
    state.wordsSolved++;
    state.streak++;

    const streakBonus = state.streak >= 3 ? ' STREAK x' + state.streak : '';
    state.feedback = {
      text: '+' + pts + streakBonus,
      subtext: state.currentWord,
      color: '#00ff88',
      age: 0,
      duration: 1.2,
    };

    playSound('correct');

    // Load next word after brief delay
    setTimeout(() => {
      loadNewWord();
    }, 400);
  }
}

// ---- Hint ----

function useHint() {
  if (state.hintsLeft <= 0 || state.score < HINT_COST) return;

  // Find a position that isn't already hinted and isn't correctly filled
  let targetPos = -1;
  for (let i = 0; i < state.currentWord.length; i++) {
    if (!state.hintedPositions.has(i)) {
      targetPos = i;
      break;
    }
  }
  if (targetPos === -1) return;

  state.hintsLeft--;
  state.score = Math.max(0, state.score - HINT_COST);

  // Clear answer slot if wrong letter is there
  if (state.answerLetters[targetPos] !== null) {
    const srcIdx = state.answerSources[targetPos];
    if (srcIdx >= 0) {
      state.scrambledLetters[srcIdx].used = false;
    }
    state.answerLetters[targetPos] = null;
    state.answerSources[targetPos] = -1;
  }

  // Find the correct letter in scrambled tiles
  const correctLetter = state.currentWord[targetPos];
  let srcTileIdx = -1;
  for (let i = 0; i < state.scrambledLetters.length; i++) {
    if (!state.scrambledLetters[i].used && state.scrambledLetters[i].letter === correctLetter) {
      srcTileIdx = i;
      break;
    }
  }

  if (srcTileIdx >= 0) {
    state.scrambledLetters[srcTileIdx].used = true;
    state.answerLetters[targetPos] = correctLetter;
    state.answerSources[targetPos] = srcTileIdx;
  } else {
    // Letter might be used elsewhere in answer -- swap it
    // Find answer slot that has this letter but isn't hinted
    for (let i = 0; i < state.answerLetters.length; i++) {
      if (i !== targetPos && state.answerLetters[i] === correctLetter && !state.hintedPositions.has(i)) {
        const si = state.answerSources[i];
        state.answerLetters[i] = null;
        state.answerSources[i] = -1;
        // Don't mark scramble as unused -- we're moving it to the hint slot
        state.answerLetters[targetPos] = correctLetter;
        state.answerSources[targetPos] = si;
        break;
      }
    }
  }

  state.hintedPositions.add(targetPos);
  playSound('hint');

  // Check if word is now complete
  if (!state.answerLetters.includes(null)) {
    checkCompletion();
  }
}

// ---- Skip ----

function skipWord() {
  state.streak = 0;
  state.feedback = {
    text: 'SKIPPED',
    subtext: state.currentWord,
    color: '#ff6644',
    age: 0,
    duration: 1.0,
  };
  playSound('skip');
  loadNewWord();
}

// ---- Position Helpers ----

function getScramblePos(index) {
  const layout = state._scrambleLayout;
  if (!layout) {
    const count = state.scrambledLetters.length;
    const totalW = count * TILE_SIZE + (count - 1) * TILE_GAP;
    return {
      x: (LOGICAL_W - totalW) / 2 + index * (TILE_SIZE + TILE_GAP),
      y: 300,
    };
  }
  return {
    x: layout.startX + index * (TILE_SIZE + TILE_GAP),
    y: layout.y,
  };
}

function getAnswerPos(index) {
  const layout = state._answerLayout;
  if (!layout) {
    const count = state.currentWord.length;
    const totalW = count * TILE_SIZE + (count - 1) * TILE_GAP;
    return {
      x: (LOGICAL_W - totalW) / 2 + index * (TILE_SIZE + TILE_GAP),
      y: 155,
    };
  }
  return {
    x: layout.startX + index * (TILE_SIZE + TILE_GAP),
    y: layout.y,
  };
}

// ---- Hit Detection ----

function handleTap(pos) {
  // Check scramble row
  const scrambleY = 300;
  const count = state.scrambledLetters.length;
  const totalW = count * TILE_SIZE + (count - 1) * TILE_GAP;
  const scrambleStartX = (LOGICAL_W - totalW) / 2;

  if (pos.y >= scrambleY && pos.y <= scrambleY + TILE_SIZE) {
    for (let i = 0; i < count; i++) {
      const tx = scrambleStartX + i * (TILE_SIZE + TILE_GAP);
      if (pos.x >= tx && pos.x <= tx + TILE_SIZE) {
        tapScrambleTile(i);
        return;
      }
    }
  }

  // Check answer row
  const answerY = 155;
  const aCount = state.currentWord.length;
  const aTotalW = aCount * TILE_SIZE + (aCount - 1) * TILE_GAP;
  const answerStartX = (LOGICAL_W - aTotalW) / 2;

  if (pos.y >= answerY && pos.y <= answerY + TILE_SIZE) {
    for (let i = 0; i < aCount; i++) {
      const tx = answerStartX + i * (TILE_SIZE + TILE_GAP);
      if (pos.x >= tx && pos.x <= tx + TILE_SIZE) {
        tapAnswerTile(i);
        return;
      }
    }
  }

  // Check hint button
  if (state._hintBtn) {
    const hb = state._hintBtn;
    if (pos.x >= hb.x && pos.x <= hb.x + hb.w && pos.y >= hb.y && pos.y <= hb.y + hb.h) {
      useHint();
      return;
    }
  }

  // Check skip button
  if (state._skipBtn) {
    const sb = state._skipBtn;
    if (pos.x >= sb.x && pos.x <= sb.x + sb.w && pos.y >= sb.y && pos.y <= sb.y + sb.h) {
      skipWord();
      return;
    }
  }
}

// ---- Register Sounds ----

function registerGameSounds() {
  registerSound('tap', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 900, duration: 0.05, gain: 0.12 },
    ],
  });

  registerSound('correct', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.16, gain: 0.25 },
    ],
  });

  registerSound('skip', {
    notes: [
      { type: 'sawtooth', frequency: 600, endFrequency: 200, duration: 0.15, gain: 0.1 },
    ],
  });

  registerSound('hint', {
    notes: [
      { type: 'triangle', frequency: 1200, duration: 0.06, gain: 0.15 },
      { type: 'triangle', frequency: 1400, duration: 0.06, delay: 0.06, gain: 0.15 },
    ],
  });

  registerSound('finish', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 349, duration: 0.15, delay: 0.15, gain: 0.2 },
      { type: 'square', frequency: 293, duration: 0.25, delay: 0.3, gain: 0.2 },
    ],
  });
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME SCRAMBLE',
  gameId: 'meme-scramble',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'memescramble',
  subtitle: 'unscramble words. beat the clock. no cap.',
  accentColor: '#00e5ff',
});

let input = null;

shell.onStart = () => {
  initAudio();
  registerGameSounds();

  resetState();
  loadNewWord();

  // Set up input
  if (input) input.destroy();
  input = createInputManager(shell.getCanvas(), LOGICAL_W, LOGICAL_H);
  input.onTapAt(handleTap);
};

shell.onUpdate = (dt) => {
  // Update timer
  state.timeLeft -= dt * (1 / 60); // dt is normalized to 60fps

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    playSound('finish');
    shell.setState('game-over');
    return;
  }

  // Update animations
  for (let i = state.animations.length - 1; i >= 0; i--) {
    const anim = state.animations[i];
    anim.progress += ANIM_SPEED * dt;
    if (anim.progress >= 1) {
      anim.progress = 1;
      state.animations.splice(i, 1);
    }
    anim.currentX = lerp(anim.fromX, anim.toX, easeOutCubic(anim.progress));
    anim.currentY = lerp(anim.fromY, anim.toY, easeOutCubic(anim.progress));
  }

  // Update feedback
  if (state.feedback) {
    state.feedback.age += dt * (1 / 60);
    if (state.feedback.age >= state.feedback.duration) {
      state.feedback = null;
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  if (input) {
    input.destroy();
    input = null;
  }

  return {
    score: state.score,
    message: state.wordsSolved + ' words unscrambled',
    scoreLabel: 'score',
  };
};

// ---- Ease-out cubic for smooth animations ----

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ---- Initialize ----

shell.init();
