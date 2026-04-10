/**
 * MEME PIPES -- Main Entry
 * Procedurally generated pipe connection puzzle.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generatePuzzle, rotatePipe, getConnectedSet, checkConnected } from './pipes.js';
import { render, hitTestCell } from './renderer.js';

// -- Constants --
const LOGICAL_W = 400;
const LOGICAL_H = 700;
const ROTATE_ANIM_MS = 150;
const WIN_DELAY_MS = 1200;

// Difficulty progression: [rows, cols]
const LEVELS = [
  [4, 4],   // 1
  [4, 5],   // 2
  [5, 5],   // 3
  [5, 6],   // 4
  [6, 6],   // 5
  [6, 7],   // 6
  [7, 7],   // 7
  [7, 8],   // 8
  [8, 8],   // 9+
];

// -- Game State --
let grid = [];
let source = { row: 0, col: 0 };
let sink = { row: 0, col: 0 };
let connectedSet = new Set();
let level = 1;
let moves = 0;
let elapsed = 0;
let won = false;
let winTime = 0;
let totalScore = 0;
let animTime = 0;

// Rotation animation
let rotatingCell = null; // { row, col, startRotation, progress }

// -- Shell Setup --
const shell = new GameShell({
  title: 'MEME PIPES',
  gameId: 'meme-pipes',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  subtitle: 'connect the flow',
  accentColor: '#00e5ff',
});

// -- Sound Registration --
function registerSounds() {
  registerSound('rotate', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 1000, duration: 0.06, gain: 0.12 },
    ],
  });

  registerSound('connect', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 880, duration: 0.08, delay: 0.06, gain: 0.15 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// -- Level Management --
function getLevelSize(lvl) {
  const idx = Math.min(lvl - 1, LEVELS.length - 1);
  return LEVELS[idx];
}

function startLevel() {
  const [rows, cols] = getLevelSize(level);
  const puzzle = generatePuzzle(rows, cols);
  grid = puzzle.grid;
  source = puzzle.source;
  sink = puzzle.sink;
  moves = 0;
  elapsed = 0;
  won = false;
  winTime = 0;
  rotatingCell = null;

  // Compute initial connected set
  connectedSet = getConnectedSet(grid, source);
}

// -- Shell Callbacks --
shell.onStart = () => {
  initAudio();
  registerSounds();
  level = 1;
  totalScore = 0;
  startLevel();
};

shell.onUpdate = (dt) => {
  const frameMs = dt * 16.67;
  animTime += frameMs;

  if (!won) {
    elapsed += frameMs / 1000;
  }

  // Update rotation animation
  if (rotatingCell) {
    rotatingCell.progress += frameMs / ROTATE_ANIM_MS;
    if (rotatingCell.progress >= 1) {
      rotatingCell = null;
    }
  }

  // Win delay -> game over
  if (won) {
    winTime += frameMs;
    if (winTime >= WIN_DELAY_MS) {
      // Calculate score for this level
      const levelScore = Math.max(100, Math.round(5000 - moves * 20 - elapsed * 5));
      totalScore += levelScore;

      // Progress to next level
      level++;
      startLevel();
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, LOGICAL_W, LOGICAL_H, {
    grid,
    source,
    sink,
    connectedSet,
    level,
    moves,
    elapsed,
    won,
    time: animTime,
    totalScore,
    rotatingCell,
  });
};

shell.onGameOver = () => {
  return {
    score: totalScore,
    message: `cleared ${level - 1} level${level - 1 !== 1 ? 's' : ''}`,
    scoreLabel: 'total score',
  };
};

// -- Input --
function handleTap(pos) {
  if (won) return;
  if (rotatingCell) return; // Wait for animation to finish

  // Quit button hit test (top-right corner)
  if (pos.x >= LOGICAL_W - 60 && pos.y <= 38) {
    shell.setState('game-over');
    return;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const hit = hitTestCell(pos.x, pos.y, rows, cols, LOGICAL_W, LOGICAL_H);
  if (!hit) return;

  const cell = grid[hit.row][hit.col];

  // Cross pipes don't need rotation
  if (cell.type === 'cross') return;

  // Track previous connected count for sound
  const prevConnectedCount = connectedSet.size;

  // Start rotation animation (startRotation = rotation BEFORE the rotate)
  const startRotation = cell.rotation;
  rotatingCell = {
    row: hit.row,
    col: hit.col,
    startRotation,
    progress: 0,
  };

  // Apply the rotation immediately to game state
  rotatePipe(cell);
  moves++;

  playSound('rotate');

  // Update connected set
  connectedSet = getConnectedSet(grid, source);

  // Check if new connections formed
  if (connectedSet.size > prevConnectedCount) {
    playSound('connect');
  }

  // Check win condition
  if (checkConnected(grid, source, sink)) {
    won = true;
    winTime = 0;
    playSound('win');
  }
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
  shell.init();

  const canvas = shell.getCanvas();
  const input = createInputManager(canvas, LOGICAL_W, LOGICAL_H);
  input.onTapAt(handleTap);
});
