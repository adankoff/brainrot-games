/**
 * TOWER OF HANOI -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import {
  createGame,
  selectPeg,
  placeToPeg,
  peekDisc,
  calculateScore,
} from './hanoi.js';
import {
  render,
  getPegAtPosition,
  flashInvalid,
  startLiftAnim,
  startDropAnim,
  startWinAnim,
  cancelLift,
  resetAnimations,
  updateAnimations,
  isDropAnimating,
} from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

const DIFFICULTIES = {
  easy:   { discs: 3, label: 'easy (3)' },
  medium: { discs: 5, label: 'medium (5)' },
  hard:   { discs: 7, label: 'hard (7)' },
};

// ---- Module State ----

let gameState = null;
let difficulty = 'easy';
let audioInitialized = false;
let pendingWin = false;
let winDelay = 0;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'TOWER OF HANOI',
  gameId: 'tower-of-hanoi',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'puzzle',
  subtitle: 'move all discs to the right peg.',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-121/',
});

// ---- Callbacks ----

shell.onStart = () => {
  const numDiscs = DIFFICULTIES[difficulty].discs;
  gameState = createGame(numDiscs);
  resetAnimations();
  pendingWin = false;
  winDelay = 0;
};

shell.onUpdate = (dt) => {
  if (!gameState) return;

  const dropFinished = updateAnimations(dt);

  // After drop animation finishes, check for win
  if (dropFinished && gameState.won && !pendingWin) {
    pendingWin = true;
    winDelay = 1200; // ms before showing game over
    startWinAnim();
    playSound('win');
  }

  // Win delay countdown
  if (pendingWin) {
    winDelay -= dt * 16.67;
    if (winDelay <= 0) {
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  if (!gameState) return;
  render(ctx, gameState);
};

shell.onGameOver = () => {
  if (!gameState) return { score: 0 };

  const score = calculateScore(gameState);
  const wasOptimal = gameState.moves === gameState.optimalMoves;

  let message = '';
  if (wasOptimal) {
    message = 'PERFECT! optimal solution!';
  } else if (gameState.moves <= gameState.optimalMoves * 1.5) {
    message = 'nice. pretty efficient.';
  } else if (gameState.moves <= gameState.optimalMoves * 3) {
    message = 'solved it, but not the sharpest.';
  } else {
    message = 'you got there... eventually.';
  }

  return {
    score,
    message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (gameState) {
    render(ctx, gameState);
  }
};

// ---- Initialize ----

shell.init();

// ---- Input ----

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();

  if (shell.state !== 'playing') return;
  if (!gameState || gameState.won) return;
  if (isDropAnimating()) return; // Don't accept input during drop animation

  const pegIdx = getPegAtPosition(pos.x, pos.y);
  if (pegIdx === -1) return;

  if (gameState.selectedPeg === null) {
    // No disc selected -- try to pick one up
    const picked = selectPeg(gameState, pegIdx);
    if (picked) {
      startLiftAnim(pegIdx);
      playSound('pickup');
    }
  } else {
    // Capture source info before the move modifies state
    const sourcePeg = gameState.selectedPeg;
    const disc = peekDisc(gameState, sourcePeg);

    const result = placeToPeg(gameState, pegIdx);

    if (result === 'placed') {
      cancelLift();
      startDropAnim(sourcePeg, pegIdx, disc);
      playSound('place');
    } else if (result === 'invalid') {
      cancelLift();
      flashInvalid(pegIdx);
      playSound('invalid');
    } else {
      // Cancelled (tapped same peg)
      cancelLift();
      playSound('pickup');
    }
  }
});

// Also handle keyboard for peg selection (1, 2, 3 keys)
document.addEventListener('keydown', (e) => {
  if (shell.state !== 'playing') return;
  if (!gameState || gameState.won) return;
  if (isDropAnimating()) return;

  let pegIdx = -1;
  if (e.key === '1' || e.key === 'a') pegIdx = 0;
  else if (e.key === '2' || e.key === 'b') pegIdx = 1;
  else if (e.key === '3' || e.key === 'c') pegIdx = 2;

  if (pegIdx === -1) return;
  ensureAudio();

  if (gameState.selectedPeg === null) {
    const picked = selectPeg(gameState, pegIdx);
    if (picked) {
      startLiftAnim(pegIdx);
      playSound('pickup');
    }
  } else {
    const sourcePeg = gameState.selectedPeg;
    const disc = peekDisc(gameState, sourcePeg);
    const result = placeToPeg(gameState, pegIdx);

    if (result === 'placed') {
      cancelLift();
      startDropAnim(sourcePeg, pegIdx, disc);
      playSound('place');
    } else if (result === 'invalid') {
      cancelLift();
      flashInvalid(pegIdx);
      playSound('invalid');
    } else {
      cancelLift();
      playSound('pickup');
    }
  }
});

// ---- Difficulty Select in Menu ----

setupDifficultySelect();

// ---- Audio Setup ----

function ensureAudio() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game works without sound
    }
  }
}

function registerGameSounds() {
  registerSound('pickup', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 660, duration: 0.08, gain: 0.15 },
    ],
  });

  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 660, endFrequency: 440, duration: 0.1, gain: 0.15 },
      { type: 'triangle', frequency: 880, duration: 0.05, delay: 0.05, gain: 0.08 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 120, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 150, duration: 0.08, delay: 0.1, gain: 0.1 },
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
}

// ---- Difficulty Select UI ----

function setupDifficultySelect() {
  // Load saved difficulty
  const saved = getData('tower-of-hanoi', 'difficulty');
  if (saved && DIFFICULTIES[saved]) {
    difficulty = saved;
  }

  requestAnimationFrame(() => {
    const visual = document.getElementById('menu-visual');
    if (!visual) return;

    visual.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    for (const [key, config] of Object.entries(DIFFICULTIES)) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (key === difficulty) {
        btn.classList.add('difficulty-select__btn--selected');
      }
      btn.textContent = config.label;
      btn.addEventListener('click', () => {
        difficulty = key;
        setData('tower-of-hanoi', 'difficulty', key);
        setupDifficultySelect();
        ensureAudio();
        playSound('uiclick');
      });
      container.appendChild(btn);
    }

    visual.appendChild(container);
  });
}
