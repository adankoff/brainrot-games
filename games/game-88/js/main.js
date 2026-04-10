/**
 * Lights Out -- Main Entry Point
 * Wires up GameShell, input, sound, and puzzle logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { randomInt } from '../../shared/utils.js';
import { generatePuzzle, toggle, isSolved, getMovesRange, cloneGrid } from './lightsout.js';
import { render, hitTestGrid, renderGameOver, renderMenuPreview } from './renderer.js';

// ---- Constants ----

const LOGICAL_W = 400;
const LOGICAL_H = 700;

const DIFFICULTY_SIZES = [3, 4, 5];
const DIFFICULTY_LABELS = ['easy', 'medium', 'hard'];
const FLASH_DURATION = 0.25; // seconds worth of frames at 60fps
const WIN_DISPLAY_TIME = 1.5; // seconds worth of frames

// ---- Game State ----

let grid = [];
let gridSize = 4;
let difficulty = 1; // 0=easy, 1=medium, 2=hard
let moves = 0;
let level = 1;
let totalScore = 0;
let minMoves = 0;
let flashes = [];
let winTimer = 0;
let winTriggered = false;
let gameActive = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'LIGHTS OUT',
  gameId: 'lights-out',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'lightsout',
  subtitle: 'tap to toggle. turn all lights off.',
  accentColor: '#00e5ff',
  shareUrl: '',
  onMenuRender: (ctx) => {
    renderMenuPreview(ctx, difficulty);
  },
});

// ---- Sound Registration ----

function registerSounds() {
  registerSound('toggle', {
    notes: [
      { type: 'square', frequency: 800, endFrequency: 600, duration: 0.05, gain: 0.1 },
      { type: 'sine', frequency: 400, duration: 0.03, delay: 0.02, gain: 0.06 },
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

  registerSound('perfect', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.16, gain: 0.25 },
      { type: 'triangle', frequency: 1047, duration: 0.08, delay: 0.24, gain: 0.3 },
      { type: 'sine', frequency: 1319, duration: 0.15, delay: 0.32, gain: 0.2 },
      { type: 'sine', frequency: 1568, duration: 0.2, delay: 0.4, gain: 0.15 },
    ],
  });
}

// ---- Puzzle Management ----

function startNewPuzzle() {
  gridSize = DIFFICULTY_SIZES[difficulty];
  const range = getMovesRange(gridSize);
  const scrambleMoves = randomInt(range.min, range.max);
  const puzzle = generatePuzzle(gridSize, scrambleMoves);

  grid = puzzle.grid;
  minMoves = puzzle.minMoves;
  moves = 0;
  flashes = [];
  winTimer = 0;
  winTriggered = false;
}

function advanceLevel() {
  level++;

  // Every 3 levels, bump difficulty if not already at max
  if (level % 3 === 1 && difficulty < 2) {
    difficulty++;
  }

  startNewPuzzle();
}

function calculateLevelScore() {
  return Math.max(1000 - moves * 50, 100);
}

// ---- Input Handling ----

function handleTap(pos) {
  if (!gameActive || winTimer > 0) return;

  initAudio();

  const hit = hitTestGrid(pos.x, pos.y, gridSize);
  if (!hit) return;

  const { row, col } = hit;

  // Toggle and track affected cells for flash animation
  toggle(grid, row, col);
  moves++;

  // Create flash effects for toggled cells
  const size = grid.length;
  const affected = [
    [row, col],
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  for (const [r, c] of affected) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      flashes.push({ row: r, col: c, timer: 1.0 });
    }
  }

  playSound('toggle');

  // Check win
  if (isSolved(grid)) {
    winTriggered = true;
    winTimer = 1.0;

    const levelScore = calculateLevelScore();
    totalScore += levelScore;

    if (moves <= minMoves) {
      playSound('perfect');
    } else {
      playSound('win');
    }
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  // Reset for a new game session
  level = 1;
  totalScore = 0;
  difficulty = selectedDifficulty;
  gameActive = true;

  startNewPuzzle();
};

shell.onUpdate = (dt) => {
  if (!gameActive) return;

  // Decay flash animations
  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].timer -= dt * (1 / (FLASH_DURATION * 60));
    if (flashes[i].timer <= 0) {
      flashes.splice(i, 1);
    }
  }

  // Win timer countdown
  if (winTimer > 0) {
    winTimer -= dt * (1 / (WIN_DISPLAY_TIME * 60));
    if (winTimer <= 0) {
      winTimer = 0;
      advanceLevel();
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, {
    grid,
    size: gridSize,
    moves,
    level,
    totalScore,
    difficulty,
    flashes,
    winTimer,
    difficultyLabel: DIFFICULTY_LABELS[difficulty],
  });
};

shell.onGameOver = () => {
  gameActive = false;
  return {
    score: totalScore,
    message: `completed ${level - 1} puzzle${level - 1 !== 1 ? 's' : ''}`,
    scoreLabel: 'total score',
  };
};

shell.onGameOverRender = (ctx) => {
  renderGameOver(ctx);
};

// ---- Difficulty Selector ----

let selectedDifficulty = 1;

function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  const container = document.createElement('div');
  container.style.cssText = 'display:flex; gap:8px; justify-content:center; margin-top:8px;';

  const buttons = DIFFICULTY_LABELS.map((label, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost';
    btn.textContent = label;
    btn.style.cssText = 'font-size:13px; padding:6px 14px; text-transform:uppercase; letter-spacing:1px; border-radius:6px;';

    btn.addEventListener('click', () => {
      initAudio();
      selectedDifficulty = idx;
      updateDifficultyButtons();
      // Re-render menu preview
      const ctx = shell.getContext();
      if (ctx && shell.state === 'menu') {
        renderMenuPreview(ctx, selectedDifficulty);
      }
    });

    container.appendChild(btn);
    return btn;
  });

  function updateDifficultyButtons() {
    buttons.forEach((btn, idx) => {
      if (idx === selectedDifficulty) {
        btn.style.background = '#00e5ff';
        btn.style.color = '#0a0a12';
        btn.style.fontWeight = '700';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#888';
        btn.style.fontWeight = '500';
      }
    });
  }

  updateDifficultyButtons();
  secondary.appendChild(container);
}

// ---- Quit Button (during gameplay) ----

function setupQuitDetection() {
  // Double-tap top-left corner to quit to game over
  let lastCornerTap = 0;

  const canvas = shell.getCanvas();
  canvas.addEventListener('mousedown', (e) => {
    if (shell.state !== 'playing' || !gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (LOGICAL_W / rect.width);
    const y = (e.clientY - rect.top) * (LOGICAL_H / rect.height);

    // Check if tap is in the level label area (top-left)
    if (x < 100 && y < 25) {
      const now = Date.now();
      if (now - lastCornerTap < 400) {
        // Double-tap on level label = quit
        shell.setState('game-over');
      }
      lastCornerTap = now;
    }
  });
}

// ---- Init ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_W, LOGICAL_H);
input.onTapAt(handleTap);

buildDifficultySelector();
setupQuitDetection();

// Render initial menu preview
const ctx = shell.getContext();
if (ctx) {
  renderMenuPreview(ctx, selectedDifficulty);
}
