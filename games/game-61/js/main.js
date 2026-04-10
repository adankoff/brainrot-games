/**
 * MEME MEMORY -- Main Entry Point
 * Creates GameShell, wires callbacks, manages card grid, flip logic,
 * match detection, scoring, timer, theme switching.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import {
  getGridLayout,
  getCardRect,
  drawBackground,
  drawCard,
  drawHUD,
  drawMismatchFlash,
} from './renderer.js';
import { THEMES, getThemeById } from './themes.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const GRID_COLS = 4;
const GRID_ROWS = 4;
const TOTAL_PAIRS = 8;
const FLIP_SPEED = 0.08;       // flipProgress change per normalized frame
const FLIP_BACK_DELAY = 48;    // frames (~800ms) before non-matching cards flip back
const GLOW_DURATION = 1.0;     // seconds for match glow
const GLOW_DECAY = 0.025;      // glow decay per frame
const MISMATCH_DECAY = 0.04;   // mismatch flash decay per frame

// ---- Game State ----

const GAME_ID = 'meme-memory';
let audioInitialized = false;
let lastWinMessage = '';

/** @type {Array<Object>} */
let cards = [];
let moves = 0;
let pairsLeft = 0;
let timerStarted = false;
let elapsedFrames = 0;
let gameWon = false;

// Flip state
/** @type {number|null} */
let firstFlippedIdx = null;
/** @type {number|null} */
let secondFlippedIdx = null;
let flipBackTimer = 0;
let lockInput = false;
let screenFlashTimer = 0;

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'brainrot-classics';
}

function saveTheme(id) {
  setData(GAME_ID, 'theme', id);
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: currentTheme.name,
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-memory',
  subtitle: 'flip cards. match memes. prove your brain works.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-27/',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('flip', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 700, duration: 0.05, gain: 0.12 },
    ],
  });

  registerSound('match', {
    notes: [
      { type: 'triangle', frequency: 660, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 880, duration: 0.1, delay: 0.08, gain: 0.2 },
    ],
  });

  registerSound('mismatch', {
    notes: [
      { type: 'sawtooth', frequency: 180, endFrequency: 120, duration: 0.15, gain: 0.15 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.15, delay: 0.3, gain: 0.25 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.4, gain: 0.15 },
    ],
  });
}

// ---- Card Creation ----

/**
 * Create a shuffled 4x4 grid of card objects.
 */
function createCards() {
  const pairs = currentTheme.pairs.slice(0, TOTAL_PAIRS);
  const deck = [];

  for (let i = 0; i < pairs.length; i++) {
    // Two cards per pair
    deck.push({
      pairId: i,
      emoji: pairs[i].emoji,
      label: pairs[i].label,
      faceUp: false,
      matched: false,
      flipProgress: 0,    // 0 = face down, 1 = face up
      flipTarget: 0,      // where flipProgress is animating toward
      glowTimer: 0,       // match glow countdown
      mismatchTimer: 0,   // mismatch flash countdown
    });
    deck.push({
      pairId: i,
      emoji: pairs[i].emoji,
      label: pairs[i].label,
      faceUp: false,
      matched: false,
      flipProgress: 0,
      flipTarget: 0,
      glowTimer: 0,
      mismatchTimer: 0,
    });
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Convert a flat card index to grid col/row.
 */
function indexToColRow(idx) {
  return {
    col: idx % GRID_COLS,
    row: Math.floor(idx / GRID_COLS),
  };
}

// ---- Reset ----

function resetGame() {
  cards = createCards();
  moves = 0;
  pairsLeft = TOTAL_PAIRS;
  timerStarted = false;
  elapsedFrames = 0;
  gameWon = false;
  firstFlippedIdx = null;
  secondFlippedIdx = null;
  flipBackTimer = 0;
  lockInput = false;
  screenFlashTimer = 0;
}

// ---- Input Handling ----

function ensureAudio() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio init failed
    }
  }
}

function handleTap(pos) {
  ensureAudio();

  if (lockInput || gameWon) return;
  if (shell.state !== 'playing') return;

  const layout = getGridLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Find which card was tapped
  for (let i = 0; i < cards.length; i++) {
    const { col, row } = indexToColRow(i);
    const rect = getCardRect(col, row, layout);

    if (
      pos.x >= rect.x && pos.x <= rect.x + rect.w &&
      pos.y >= rect.y && pos.y <= rect.y + rect.h
    ) {
      onCardTapped(i);
      return;
    }
  }
}

function onCardTapped(idx) {
  const card = cards[idx];

  // Can't tap already face-up or matched cards
  if (card.faceUp || card.matched) return;
  // Can't tap the same card that's already selected as first
  if (idx === firstFlippedIdx) return;

  // Start timer on first ever tap
  if (!timerStarted) {
    timerStarted = true;
  }

  // Flip the card face-up
  card.faceUp = true;
  card.flipTarget = 1;
  playSound('flip');

  if (firstFlippedIdx === null) {
    // First card of the pair
    firstFlippedIdx = idx;
  } else {
    // Second card of the pair
    secondFlippedIdx = idx;
    moves++;
    lockInput = true;

    const first = cards[firstFlippedIdx];
    const second = cards[secondFlippedIdx];

    if (first.pairId === second.pairId) {
      // Match found
      first.matched = true;
      second.matched = true;
      first.glowTimer = GLOW_DURATION;
      second.glowTimer = GLOW_DURATION;
      pairsLeft--;

      playSound('match');

      // Allow immediate next move
      firstFlippedIdx = null;
      secondFlippedIdx = null;
      lockInput = false;

      // Check win
      if (pairsLeft <= 0) {
        gameWon = true;
        playSound('win');
        // Short delay before game over screen
        setTimeout(() => {
          if (shell.state === 'playing') {
            shell.setState('game-over');
          }
        }, 800);
      }
    } else {
      // Mismatch: start timer to flip back
      flipBackTimer = FLIP_BACK_DELAY;
      first.mismatchTimer = 1;
      second.mismatchTimer = 1;
      screenFlashTimer = 1;
      playSound('mismatch');
    }
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  resetGame();
};

shell.onUpdate = (dt) => {
  // Timer
  if (timerStarted && !gameWon) {
    elapsedFrames += dt;
  }

  // Animate card flips
  for (const card of cards) {
    if (card.flipProgress < card.flipTarget) {
      card.flipProgress = Math.min(card.flipTarget, card.flipProgress + FLIP_SPEED * dt);
    } else if (card.flipProgress > card.flipTarget) {
      card.flipProgress = Math.max(card.flipTarget, card.flipProgress - FLIP_SPEED * dt);
    }

    // Decay glow
    if (card.glowTimer > 0) {
      card.glowTimer = Math.max(0, card.glowTimer - GLOW_DECAY * dt);
    }

    // Decay mismatch flash
    if (card.mismatchTimer > 0) {
      card.mismatchTimer = Math.max(0, card.mismatchTimer - MISMATCH_DECAY * dt);
    }
  }

  // Flip-back timer for mismatched pair
  if (flipBackTimer > 0) {
    flipBackTimer -= dt;
    if (flipBackTimer <= 0) {
      flipBackTimer = 0;

      // Flip both cards back
      if (firstFlippedIdx !== null) {
        cards[firstFlippedIdx].faceUp = false;
        cards[firstFlippedIdx].flipTarget = 0;
      }
      if (secondFlippedIdx !== null) {
        cards[secondFlippedIdx].faceUp = false;
        cards[secondFlippedIdx].flipTarget = 0;
      }

      firstFlippedIdx = null;
      secondFlippedIdx = null;
      lockInput = false;
    }
  }

  // Screen flash decay
  if (screenFlashTimer > 0) {
    screenFlashTimer = Math.max(0, screenFlashTimer - 0.04 * dt);
  }
};

shell.onRender = (ctx) => {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  // Background
  drawBackground(ctx, W, H, currentTheme);

  // Grid layout
  const layout = getGridLayout(W, H);

  // Draw cards
  for (let i = 0; i < cards.length; i++) {
    const { col, row } = indexToColRow(i);
    drawCard(ctx, cards[i], col, row, layout, currentTheme);
  }

  // Mismatch flash overlay
  drawMismatchFlash(ctx, W, H, screenFlashTimer);

  // HUD
  const elapsedSeconds = elapsedFrames / 60;
  drawHUD(ctx, W, moves, elapsedSeconds, pairsLeft, TOTAL_PAIRS, currentTheme);
};

shell.onGameOver = () => {
  const elapsedSeconds = elapsedFrames / 60;
  const score = Math.max(100, Math.round(1000 - (moves * 20) - (elapsedSeconds * 5)));
  const message = getWinMessage();
  return {
    score,
    message,
    scoreLabel: 'score',
  };
};

// ---- Win Messages ----

function getWinMessage() {
  const pool = currentTheme.winMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastWinMessage && pool.length > 1);
  lastWinMessage = msg;
  return msg;
}

// ---- Initialize ----

shell.init();

// Input manager
const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTapAt(handleTap);

// Init audio on first pointer interaction
shell.getCanvas().addEventListener('pointerdown', function initOnce() {
  ensureAudio();
  shell.getCanvas().removeEventListener('pointerdown', initOnce);
}, { once: true });

// ---- Theme Selector in Menu ----

setupThemeSelector();

function setupThemeSelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'theme-select';

    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.className = 'theme-select__btn';
      if (theme.id === currentTheme.id) {
        btn.classList.add('theme-select__btn--active');
      }
      btn.textContent = theme.name;
      btn.style.borderColor = theme.accentColor;

      btn.addEventListener('click', () => {
        currentTheme = theme;
        saveTheme(theme.id);

        // Update shell title
        const titleEl = document.querySelector('.menu-screen__title');
        if (titleEl) titleEl.textContent = theme.name;

        setupThemeSelector();
        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
