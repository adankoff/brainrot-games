/**
 * BALL SORT -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game + animation state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import {
  createGame, undoMove, isSolved,
  isValidMove, calculateScore, DIFFICULTY_CONFIG,
} from './ballsort.js';
import { render, computeLayout } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const LIFT_DURATION = 150;   // ms for ball lift animation
const DROP_DURATION = 200;   // ms for ball drop animation
const WIN_DELAY = 1800;      // ms to show win overlay before game-over screen

// ---- Module State ----

/** @type {Object|null} */
let game = null;

/** @type {string} */
let difficulty = 'easy';

/** @type {boolean} */
let audioInitialized = false;

/** @type {Object|null} */
let layout = null;

/** Animation state */
const anim = {
  selectedTube: null,
  liftedBall: null,
  liftProgress: 0,
  liftTimer: 0,
  validTargets: [],

  dropping: false,
  dropProgress: 0,
  dropTimer: 0,
  dropFromX: 0,
  dropFromY: 0,
  dropToX: 0,
  dropToY: 0,
  dropColor: 0,
  dropSrc: -1,
  dropDst: -1,

  won: false,
  winTimer: 0,

  showHint: true,
  hintTimer: 0,
};

/** @type {HTMLButtonElement|null} */
let undoBtn = null;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'BALL SORT',
  gameId: 'ball-sort',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'ball-sort',
  subtitle: 'sort the balls. sounds easy. it\'s not.',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-103/',
});

// ---- Sound Registration ----

function ensureAudio() {
  if (audioInitialized) return;
  try {
    initAudio();

    registerSound('pickup', {
      notes: [
        { type: 'sine', frequency: 600, endFrequency: 800, duration: 0.08, gain: 0.15 },
      ],
    });

    registerSound('drop', {
      notes: [
        { type: 'sine', frequency: 500, endFrequency: 300, duration: 0.1, gain: 0.15 },
      ],
    });

    registerSound('invalid', {
      notes: [
        { type: 'square', frequency: 150, duration: 0.1, gain: 0.12 },
        { type: 'square', frequency: 120, duration: 0.1, delay: 0.1, gain: 0.12 },
      ],
    });

    registerSound('win', {
      notes: [
        { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
        { type: 'sine', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.2 },
        { type: 'sine', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.2 },
        { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.36, gain: 0.25 },
      ],
    });

    audioInitialized = true;
  } catch {
    // Audio failed -- game still works
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  game = createGame(difficulty);
  layout = computeLayout(
    DIFFICULTY_CONFIG[difficulty].tubes,
    LOGICAL_WIDTH,
    LOGICAL_HEIGHT
  );

  // Reset animation state
  anim.selectedTube = null;
  anim.liftedBall = null;
  anim.liftProgress = 0;
  anim.liftTimer = 0;
  anim.validTargets = [];
  anim.dropping = false;
  anim.dropProgress = 0;
  anim.won = false;
  anim.winTimer = 0;
  anim.showHint = true;
  anim.hintTimer = 0;

  // Create undo button
  createUndoButton();
};

shell.onUpdate = (dt) => {
  if (!game) return;

  const dtMs = dt * 16.67;

  // Hint timer
  anim.hintTimer += dtMs;

  // Lift animation
  if (anim.selectedTube !== null && anim.liftProgress < 1) {
    anim.liftTimer += dtMs;
    anim.liftProgress = Math.min(anim.liftTimer / LIFT_DURATION, 1);
  }

  // Drop animation
  if (anim.dropping) {
    anim.dropTimer += dtMs;
    anim.dropProgress = Math.min(anim.dropTimer / DROP_DURATION, 1);

    if (anim.dropProgress >= 1) {
      // Finish the move -- ball was already popped from source in startDropAnimation
      anim.dropping = false;
      game.tubes[anim.dropDst].push(anim.dropColor);
      game.moves++;
      game.history.push({ src: anim.dropSrc, dst: anim.dropDst, ball: anim.dropColor });
      playSound('drop');

      // Check win
      if (isSolved(game.tubes)) {
        anim.won = true;
        anim.winTimer = 0;
        playSound('win');
      }
    }
  }

  // Win overlay timer
  if (anim.won) {
    anim.winTimer += dtMs;
    if (anim.winTimer >= WIN_DELAY) {
      removeUndoButton();
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!game || !layout) return;
  render(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, game, anim, layout);
};

shell.onGameOver = () => {
  const score = game ? calculateScore(game.moves) : 0;
  const moves = game ? game.moves : 0;

  return {
    score,
    message: `sorted in ${moves} moves`,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!game || !layout) return;
  // Draw final board state behind overlay
  render(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, game, { ...anim, won: false, showHint: false }, layout);
};

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();

  if (shell.state !== 'playing') return;
  if (!game || !layout) return;
  if (anim.dropping || anim.won) return;

  // Determine which tube was tapped
  const tappedTube = getTappedTube(pos);
  if (tappedTube === -1) {
    // Tapped empty space: deselect
    if (anim.selectedTube !== null) {
      deselectTube();
    }
    return;
  }

  // No tube currently selected -- select this one
  if (anim.selectedTube === null) {
    if (game.tubes[tappedTube].length === 0) {
      playSound('invalid');
      return;
    }
    selectTube(tappedTube);
    return;
  }

  // Same tube tapped -- deselect
  if (tappedTube === anim.selectedTube) {
    deselectTube();
    return;
  }

  // Different tube tapped -- attempt move
  if (isValidMove(game.tubes, anim.selectedTube, tappedTube)) {
    startDropAnimation(anim.selectedTube, tappedTube);
  } else {
    // Invalid move -- if tapped tube has balls, select it instead
    playSound('invalid');
    if (game.tubes[tappedTube].length > 0) {
      selectTube(tappedTube);
    } else {
      deselectTube();
    }
  }
});

// ---- Difficulty Selector ----

loadDifficulty();
setupDifficultySelector();

// ---- Helper Functions ----

/**
 * Determine which tube index was tapped, or -1 if none.
 */
function getTappedTube(pos) {
  if (!layout) return -1;

  const { tubeWidth, tubeHeight, positions } = layout;
  const hitPadding = 8;

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const left = p.x - tubeWidth / 2 - hitPadding;
    const right = p.x + tubeWidth / 2 + hitPadding;
    const top = p.y - 30; // Extra space above for lifted ball
    const bottom = p.y + tubeHeight + hitPadding;

    if (pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom) {
      return i;
    }
  }
  return -1;
}

/**
 * Select a tube: lift the top ball.
 */
function selectTube(idx) {
  anim.selectedTube = idx;
  const tube = game.tubes[idx];
  anim.liftedBall = tube[tube.length - 1];
  anim.liftProgress = 0;
  anim.liftTimer = 0;
  anim.showHint = false;

  // Compute valid targets
  anim.validTargets = [];
  for (let i = 0; i < game.tubes.length; i++) {
    if (isValidMove(game.tubes, idx, i)) {
      anim.validTargets.push(i);
    }
  }

  playSound('pickup');
}

/**
 * Deselect the currently selected tube.
 */
function deselectTube() {
  anim.selectedTube = null;
  anim.liftedBall = null;
  anim.liftProgress = 0;
  anim.validTargets = [];
}

/**
 * Start the drop animation from selected tube to destination tube.
 */
function startDropAnimation(srcIdx, dstIdx) {
  const srcPos = layout.positions[srcIdx];
  const dstPos = layout.positions[dstIdx];
  const dstTube = game.tubes[dstIdx];

  // From: lifted position above source tube
  anim.dropFromX = srcPos.x;
  anim.dropFromY = srcPos.y - 20;

  // To: ball slot in destination tube
  anim.dropToX = dstPos.x;
  anim.dropToY = dstPos.y + layout.tubeHeight - 12 - dstTube.length * layout.ballSpacing;

  anim.dropColor = anim.liftedBall;
  anim.dropSrc = srcIdx;
  anim.dropDst = dstIdx;
  anim.dropping = true;
  anim.dropProgress = 0;
  anim.dropTimer = 0;

  // Remove ball from source visually (it's now the animated drop ball)
  // The actual game state update happens when animation completes
  game.tubes[srcIdx].pop();

  // Deselect
  anim.selectedTube = null;
  anim.liftedBall = null;
  anim.validTargets = [];
}

/**
 * Create undo button overlay.
 */
function createUndoButton() {
  removeUndoButton();

  undoBtn = document.createElement('button');
  undoBtn.className = 'hud-btn';
  undoBtn.textContent = 'undo';
  undoBtn.style.bottom = '12px';
  undoBtn.style.left = '50%';
  undoBtn.style.transform = 'translateX(-50%)';

  undoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!game || anim.dropping || anim.won) return;

    // Deselect first
    deselectTube();

    const undone = undoMove(game);
    if (undone) {
      playSound('pickup');
    } else {
      playSound('invalid');
    }
  });

  const container = document.querySelector('.game-container');
  if (container) container.appendChild(undoBtn);
}

/**
 * Remove undo button from DOM.
 */
function removeUndoButton() {
  if (undoBtn) {
    undoBtn.remove();
    undoBtn = null;
  }
}

/**
 * Load saved difficulty preference.
 */
function loadDifficulty() {
  const saved = getData('ball-sort', 'difficulty');
  if (saved && DIFFICULTY_CONFIG[saved]) {
    difficulty = saved;
  }
}

/**
 * Set up difficulty selector in the menu.
 */
function setupDifficultySelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    const levels = ['easy', 'medium', 'hard'];
    for (const level of levels) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (level === difficulty) btn.classList.add('difficulty-select__btn--active');
      btn.textContent = level;

      btn.addEventListener('click', () => {
        difficulty = level;
        setData('ball-sort', 'difficulty', level);

        // Update active state
        container.querySelectorAll('.difficulty-select__btn').forEach((b) => {
          b.classList.remove('difficulty-select__btn--active');
        });
        btn.classList.add('difficulty-select__btn--active');

        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
