/**
 * MEME THREES -- Main Entry Point
 * Wires up GameShell, input handling, game logic, and rendering.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { render } from './renderer.js';
import {
  initBoard, slideGrid, spawnTile, hasValidMoves,
  calculateScore, nextPreviewValue, ROWS, COLS,
} from './threes.js';

// ---- Sound Registration ----

function registerSounds() {
  registerSound('slide', {
    notes: [
      { type: 'sine', frequency: 220, endFrequency: 280, duration: 0.08, gain: 0.1 },
    ],
  });
  registerSound('merge', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 660, duration: 0.1, delay: 0.05, gain: 0.15 },
    ],
  });
  registerSound('spawn', {
    notes: [
      { type: 'sine', frequency: 330, duration: 0.06, gain: 0.08 },
    ],
  });
  registerSound('gameover', {
    notes: [
      { type: 'square', frequency: 300, duration: 0.2, gain: 0.25 },
      { type: 'square', frequency: 250, duration: 0.2, delay: 0.2, gain: 0.25 },
      { type: 'square', frequency: 200, duration: 0.3, delay: 0.4, gain: 0.25 },
    ],
  });
}

// ---- Game State ----

const ANIM_DURATION_MS = 100;   // Slide animation
const MERGE_POP_MS = 150;       // Merge pop effect
const SPAWN_ANIM_MS = 120;      // Spawn scale-in

let grid = [];
let score = 0;
let moveCount = 0;
let gameOver = false;
let highestTile = 0;
let nextTileValue = 1;

// Animation state
let animatingTiles = null;      // Array of move results during animation
let animProgress = 1;           // 0..1 slide progress
let animElapsed = 0;

let mergedPositions = null;     // Set of "r,c" keys that just merged
let mergePopProgress = 1;
let mergePopElapsed = 0;

let spawnInfo = null;           // { row, col }
let spawnProgress = 1;
let spawnElapsed = 0;

let inputLocked = false;        // Block input during animations
let pendingDirection = null;    // Queued move during animation

// ---- Swipe Detection ----

let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;
const SWIPE_THRESHOLD = 30;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME THREES',
  gameId: 'meme-threes',
  logicalWidth: 400,
  logicalHeight: 700,
  maxDisplayWidth: 480,
  theme: 'memethrees',
  subtitle: '1 + 2 = 3. slide to merge. no cap.',
  accentColor: '#e94560',
});

shell.onStart = () => {
  initAudio();
  registerSounds();

  grid = initBoard();
  score = calculateScore(grid);
  moveCount = 0;
  gameOver = false;
  highestTile = getHighestTile(grid);
  nextTileValue = nextPreviewValue(score);

  animatingTiles = null;
  animProgress = 1;
  mergedPositions = null;
  mergePopProgress = 1;
  spawnInfo = null;
  spawnProgress = 1;
  inputLocked = false;
  pendingDirection = null;
};

shell.onUpdate = (dt) => {
  const dtMs = dt * (1000 / 60);

  // Slide animation
  if (animProgress < 1) {
    animElapsed += dtMs;
    animProgress = Math.min(animElapsed / ANIM_DURATION_MS, 1);

    if (animProgress >= 1) {
      // Animation done -- finalize the grid state
      finalizeMoveAnimation();
    }
    return;
  }

  // Merge pop animation
  if (mergePopProgress < 1) {
    mergePopElapsed += dtMs;
    mergePopProgress = Math.min(mergePopElapsed / MERGE_POP_MS, 1);
    if (mergePopProgress >= 1) {
      mergedPositions = null;
    }
  }

  // Spawn animation
  if (spawnProgress < 1) {
    spawnElapsed += dtMs;
    spawnProgress = Math.min(spawnElapsed / SPAWN_ANIM_MS, 1);
    if (spawnProgress >= 1) {
      spawnInfo = null;
      inputLocked = false;

      // Process queued move
      if (pendingDirection) {
        const dir = pendingDirection;
        pendingDirection = null;
        doMove(dir);
      }
    }
    return;
  }
};

shell.onRender = (ctx) => {
  render(ctx, {
    grid,
    score,
    moveCount,
    gameOver,
    highestTile,
    nextTileValue,
    highScore: shell.getHighScore(),
    dimensions: { W: 400, H: 700 },
    animatingTiles,
    animProgress,
    mergedPositions,
    mergePopProgress,
    spawnTile: spawnInfo,
    spawnProgress,
  });
};

shell.onGameOver = () => {
  return {
    score,
    message: `highest tile: ${highestTile}`,
    scoreLabel: 'score',
  };
};

// ---- Game Logic ----

function doMove(direction) {
  if (gameOver) return;
  if (inputLocked) {
    pendingDirection = direction;
    return;
  }

  const result = slideGrid(grid, direction);
  if (!result.moved) return;

  inputLocked = true;
  moveCount++;

  // Start slide animation
  animatingTiles = result.moves;
  animProgress = 0;
  animElapsed = 0;

  // Store the result grid for after animation
  pendingGrid = result.grid;
  pendingMoves = result.moves;
  pendingMoveDirection = direction;

  playSound('slide');
}

let pendingGrid = null;
let pendingMoves = null;
let pendingMoveDirection = null;

function finalizeMoveAnimation() {
  grid = pendingGrid;

  // Check for merges
  const hasMerges = pendingMoves.some(m => m.merged);
  if (hasMerges) {
    playSound('merge');
    mergedPositions = new Set();
    for (const m of pendingMoves) {
      if (m.merged) {
        mergedPositions.add(`${m.toRow},${m.toCol}`);
      }
    }
    mergePopProgress = 0;
    mergePopElapsed = 0;
  }

  // Spawn new tile
  const spawn = spawnTile(grid, pendingMoveDirection, score);
  if (spawn) {
    grid = spawn.grid;
    spawnInfo = { row: spawn.spawnRow, col: spawn.spawnCol };
    spawnProgress = 0;
    spawnElapsed = 0;
    playSound('spawn');
  } else {
    inputLocked = false;
  }

  // Recalculate state
  score = calculateScore(grid);
  highestTile = getHighestTile(grid);
  nextTileValue = nextPreviewValue(score);

  animatingTiles = null;
  pendingGrid = null;
  pendingMoves = null;
  pendingMoveDirection = null;

  // Check game over
  if (!hasValidMoves(grid)) {
    gameOver = true;
    inputLocked = true;
    playSound('gameover');
    setTimeout(() => {
      shell.setState('game-over');
    }, 600);
  }
}

function getHighestTile(g) {
  let max = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (g[r][c] && g[r][c].value > max) max = g[r][c].value;
    }
  }
  return max;
}

// ---- Input Handling ----

function handleKeyDown(e) {
  if (shell.state !== 'playing') return;

  let dir = null;
  switch (e.key) {
    case 'ArrowUp':    dir = 'up'; break;
    case 'ArrowDown':  dir = 'down'; break;
    case 'ArrowLeft':  dir = 'left'; break;
    case 'ArrowRight': dir = 'right'; break;
    case 'w': dir = 'up'; break;
    case 's': dir = 'down'; break;
    case 'a': dir = 'left'; break;
    case 'd': dir = 'right'; break;
  }
  if (dir) {
    e.preventDefault();
    doMove(dir);
  }
}

function handleTouchStart(e) {
  if (shell.state !== 'playing') return;
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
}

function handleTouchEnd(e) {
  if (!touchActive || shell.state !== 'playing') return;
  touchActive = false;

  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  let dir;
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx > 0 ? 'right' : 'left';
  } else {
    dir = dy > 0 ? 'down' : 'up';
  }
  doMove(dir);
}

function handleTouchMove(e) {
  // Prevent scroll while playing
  if (shell.state === 'playing') {
    e.preventDefault();
  }
}

// ---- Init ----

document.addEventListener('keydown', handleKeyDown);

const canvas = document.getElementById('game-canvas');
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

// Mouse drag support for desktop
let mouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

canvas.addEventListener('mousedown', (e) => {
  if (shell.state !== 'playing') return;
  mouseDown = true;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
  if (!mouseDown || shell.state !== 'playing') return;
  mouseDown = false;

  const dx = e.clientX - mouseStartX;
  const dy = e.clientY - mouseStartY;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  let dir;
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx > 0 ? 'right' : 'left';
  } else {
    dir = dy > 0 ? 'down' : 'up';
  }
  doMove(dir);
});

canvas.addEventListener('mouseleave', () => { mouseDown = false; });

shell.init();
