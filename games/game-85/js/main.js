/**
 * MEME SLIDE -- Main
 * GameShell integration, input handling, slide animation, scoring.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generatePuzzle, tryMove, isSolved, getTileMoveForDirection } from './puzzle.js';
import { render, canvasToGrid } from './renderer.js';

// ---- Constants ----
const LOGICAL_W = 400;
const LOGICAL_H = 700;
const ANIM_DURATION = 0.1; // seconds for tile slide animation
const SOLVED_GLOW_DURATION = 1.5; // seconds to show glow after solving
const GAME_OVER_DELAY = 2.0; // seconds after solved before game-over screen

// ---- Game State ----
const state = {
  puzzle: null,
  moves: 0,
  elapsed: 0,
  solved: false,
  solvedGlow: 0,
  solvedTimer: 0,
  animatingTile: null,
  gameActive: false,
  difficulty: 4, // default 4x4
};

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME SLIDE',
  gameId: 'meme-slide',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'meme-slide',
  subtitle: 'slide tiles. restore order.',
  accentColor: '#00e5ff',
  shareUrl: '',
});

let input = null;
let unsubTapAt = null;
let keyHandler = null;

// ---- Sound Registration ----
function registerSounds() {
  registerSound('slide', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.05, gain: 0.12 },
      { type: 'sine', frequency: 880, duration: 0.03, delay: 0.02, gain: 0.08 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.3, delay: 0.35, gain: 0.15 },
    ],
  });
}

// ---- Score Calculation ----
function calculateScore(moves, seconds) {
  return Math.max(5000 - moves * 10 - Math.floor(seconds) * 5, 100);
}

function getScoreMessage(score) {
  if (score >= 4500) return 'galaxy brain slider';
  if (score >= 3500) return 'slide lord certified';
  if (score >= 2500) return 'no cap that was clean';
  if (score >= 1500) return 'decent but mid ngl';
  if (score >= 500) return 'you tried bestie';
  return 'the tiles won this round';
}

// ---- Attempt Move ----
function attemptMove(row, col) {
  if (!state.gameActive || state.solved || state.animatingTile) return;

  const { puzzle } = state;
  const prevEmptyRow = puzzle.emptyRow;
  const prevEmptyCol = puzzle.emptyCol;
  const tileValue = puzzle.grid[row][col];

  if (tileValue === 0) return; // tapped the empty space

  const moved = tryMove(puzzle, row, col);
  if (!moved) return;

  state.moves++;
  playSound('slide');

  // Start slide animation: tile moves from its old position to the empty position
  state.animatingTile = {
    value: tileValue,
    fromRow: row,
    fromCol: col,
    toRow: prevEmptyRow,
    toCol: prevEmptyCol,
    progress: 0,
    duration: ANIM_DURATION,
  };

  // Check solved
  if (isSolved(puzzle)) {
    state.solved = true;
    state.solvedGlow = 0;
    state.solvedTimer = 0;
    playSound('win');
  }
}

// ---- Tap Handler ----
function handleTapAt(pos) {
  if (!state.gameActive) return;
  initAudio();

  const result = canvasToGrid(pos.x, pos.y, state.puzzle.size);
  if (!result) return;

  attemptMove(result.row, result.col);
}

// ---- Keyboard Handler ----
function handleKeyDown(e) {
  if (!state.gameActive || state.solved || state.animatingTile) return;

  let direction = null;
  switch (e.code) {
    case 'ArrowUp':    direction = 'up';    break;
    case 'ArrowDown':  direction = 'down';  break;
    case 'ArrowLeft':  direction = 'left';  break;
    case 'ArrowRight': direction = 'right'; break;
    case 'KeyW':       direction = 'up';    break;
    case 'KeyS':       direction = 'down';  break;
    case 'KeyA':       direction = 'left';  break;
    case 'KeyD':       direction = 'right'; break;
    default: return;
  }

  e.preventDefault();
  initAudio();

  const tile = getTileMoveForDirection(state.puzzle, direction);
  if (tile) {
    attemptMove(tile.row, tile.col);
  }
}

// ---- Difficulty Menu ----
function buildDifficultySelector() {
  const menuVisual = document.getElementById('menu-visual');
  if (!menuVisual) return;

  // Clear any existing content
  menuVisual.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  const levels = [
    { size: 3, label: '3x3' },
    { size: 4, label: '4x4' },
    { size: 5, label: '5x5' },
  ];

  levels.forEach(({ size, label }) => {
    const btn = document.createElement('button');
    btn.className = 'difficulty-btn' + (size === state.difficulty ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      state.difficulty = size;
      container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  });

  menuVisual.appendChild(container);
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  // Generate puzzle
  state.puzzle = generatePuzzle(state.difficulty);
  state.moves = 0;
  state.elapsed = 0;
  state.solved = false;
  state.solvedGlow = 0;
  state.solvedTimer = 0;
  state.animatingTile = null;
  state.gameActive = true;

  // Set up input
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
  }
  input = createInputManager(shell.getCanvas(), LOGICAL_W, LOGICAL_H);
  unsubTapAt = input.onTapAt(handleTapAt);

  // Keyboard
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
  }
  keyHandler = handleKeyDown;
  document.addEventListener('keydown', keyHandler);
};

shell.onUpdate = (dt) => {
  if (!state.gameActive) return;

  const deltaSeconds = dt / 60;

  // Update animation
  if (state.animatingTile) {
    state.animatingTile.progress += deltaSeconds / state.animatingTile.duration;
    if (state.animatingTile.progress >= 1) {
      state.animatingTile = null;
    }
  }

  // Timer (only while not solved)
  if (!state.solved) {
    state.elapsed += deltaSeconds;
  }

  // Solved glow animation
  if (state.solved) {
    state.solvedTimer += deltaSeconds;
    // Glow ramps up then stays
    state.solvedGlow = Math.min(1, state.solvedTimer / 0.4);

    // After delay, trigger game over
    if (state.solvedTimer >= GAME_OVER_DELAY) {
      state.gameActive = false;
      shell.setState('game-over');
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  // Clean up input
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
    input = null;
    unsubTapAt = null;
  }
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }

  const score = calculateScore(state.moves, state.elapsed);

  return {
    score,
    message: getScoreMessage(score),
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  render(ctx, state);
};

// ---- Init ----
shell.init();

// Build difficulty selector after menu DOM is ready
buildDifficultySelector();
