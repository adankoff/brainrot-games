/**
 * MEME MAZE -- Main Entry Point
 * Procedurally generated maze runner with swipe/keyboard controls.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { generateMaze, canMove, getDifficultyConfig } from './maze.js';
import { renderGame } from './renderer.js';

// ---- Constants ----

const LOGICAL_W = 400;
const LOGICAL_H = 700;
const MOVE_SPEED = 12; // cells per second for animation
const SWIPE_THRESHOLD = 20; // minimum px for swipe detection

// ---- Game State ----

let maze = null;
let playerRow = 0;
let playerCol = 0;
let playerAnimX = 0; // smoothed position for rendering
let playerAnimY = 0;
let elapsedTime = 0;
let starsCollected = 0;
let totalStars = 0;
let level = 1;
let difficulty = 'easy';
let fogRadius = 99;
let frameTime = 0;
let gameWon = false;
let moveQueue = []; // queued movement directions
let isMoving = false;
let moveTargetRow = 0;
let moveTargetCol = 0;
let totalScore = 0;
let levelStartTime = 0;

// Swipe tracking
let swipeStartX = 0;
let swipeStartY = 0;
let isSwiping = false;
let soundsRegistered = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME MAZE',
  gameId: 'meme-maze',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  subtitle: 'escape the maze. collect the stars.',
  accentColor: '#00ff88',
  theme: 'maze',
});

// ---- Sound Registration ----

function registerSounds() {
  registerSound('move', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 320, duration: 0.05, gain: 0.08 },
    ],
  });

  registerSound('star', {
    notes: [
      { type: 'triangle', frequency: 880, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 1320, duration: 0.1, delay: 0.16, gain: 0.2 },
    ],
  });

  registerSound('exit', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });

  registerSound('wall', {
    notes: [
      { type: 'square', frequency: 80, endFrequency: 60, duration: 0.06, gain: 0.1 },
    ],
  });
}

// ---- Difficulty Selector ----

function buildDifficultySelector() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'difficulty-selector';

  ['easy', 'medium', 'hard'].forEach((d) => {
    const btn = document.createElement('button');
    btn.textContent = d;
    btn.className = d === difficulty ? 'active' : '';
    btn.addEventListener('click', () => {
      difficulty = d;
      container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.appendChild(btn);
  });

  secondary.appendChild(container);
}

// ---- Game Logic ----

function startLevel() {
  const config = getDifficultyConfig(difficulty);
  fogRadius = config.fogRadius;

  maze = generateMaze(config.rows, config.cols);
  playerRow = maze.startRow;
  playerCol = maze.startCol;
  playerAnimX = playerCol;
  playerAnimY = playerRow;
  moveQueue = [];
  isMoving = false;
  gameWon = false;
  levelStartTime = elapsedTime;

  // Count stars
  totalStars = 0;
  starsCollected = 0;
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      if (maze.cells[r][c].hasStar) totalStars++;
    }
  }
}

function tryMove(direction) {
  if (gameWon || isMoving) {
    if (isMoving) moveQueue.push(direction);
    return;
  }

  if (canMove(maze, playerRow, playerCol, direction)) {
    isMoving = true;
    playSound('move');

    switch (direction) {
      case 'up':    moveTargetRow = playerRow - 1; moveTargetCol = playerCol; break;
      case 'down':  moveTargetRow = playerRow + 1; moveTargetCol = playerCol; break;
      case 'left':  moveTargetRow = playerRow; moveTargetCol = playerCol - 1; break;
      case 'right': moveTargetRow = playerRow; moveTargetCol = playerCol + 1; break;
    }
  } else {
    playSound('wall');
  }
}

function processArrival() {
  playerRow = moveTargetRow;
  playerCol = moveTargetCol;
  playerAnimX = playerCol;
  playerAnimY = playerRow;
  isMoving = false;

  // Check star collection
  if (maze.cells[playerRow][playerCol].hasStar) {
    maze.cells[playerRow][playerCol].hasStar = false;
    starsCollected++;
    playSound('star');
  }

  // Check exit
  if (playerRow === maze.endRow && playerCol === maze.endCol) {
    gameWon = true;
    playSound('exit');

    // Calculate level score
    const levelTime = elapsedTime - levelStartTime;
    const timeScore = Math.max(0, 5000 - Math.floor(levelTime) * 10);
    const starScore = starsCollected * 500;
    totalScore += Math.max(100, timeScore + starScore);

    // Progress to next level after a brief pause
    setTimeout(() => {
      if (shell.state !== 'playing') return;
      level++;
      startLevel();
    }, 800);
    return;
  }

  // Process queued moves
  if (moveQueue.length > 0) {
    const nextDir = moveQueue.shift();
    tryMove(nextDir);
  }
}

// ---- Input Handling ----

function setupKeyboardInput() {
  document.addEventListener('keydown', (e) => {
    if (shell.state !== 'playing') return;

    initAudio();

    let dir = null;
    switch (e.code) {
      case 'ArrowUp':    case 'KeyW': dir = 'up';    break;
      case 'ArrowDown':  case 'KeyS': dir = 'down';  break;
      case 'ArrowLeft':  case 'KeyA': dir = 'left';  break;
      case 'ArrowRight': case 'KeyD': dir = 'right'; break;
    }

    if (dir) {
      e.preventDefault();
      tryMove(dir);
    }
  });
}

function setupSwipeInput(canvas) {
  canvas.addEventListener('touchstart', (e) => {
    if (shell.state !== 'playing') return;
    initAudio();
    const touch = e.changedTouches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    isSwiping = true;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (!isSwiping || shell.state !== 'playing') return;
    isSwiping = false;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - swipeStartX;
    const dy = touch.clientY - swipeStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) {
      // Tap -- try to interpret as adjacent cell tap
      handleTapMove(touch.clientX, touch.clientY, canvas);
      return;
    }

    let dir = null;
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }

    if (dir) tryMove(dir);
  }, { passive: true });

  // Mouse swipe for desktop
  canvas.addEventListener('mousedown', (e) => {
    if (shell.state !== 'playing') return;
    initAudio();
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
    isSwiping = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    if (!isSwiping || shell.state !== 'playing') return;
    isSwiping = false;

    const dx = e.clientX - swipeStartX;
    const dy = e.clientY - swipeStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) {
      handleTapMove(e.clientX, e.clientY, canvas);
      return;
    }

    let dir = null;
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }

    if (dir) tryMove(dir);
  });
}

function handleTapMove(clientX, clientY, canvas) {
  if (!maze) return;

  const rect = canvas.getBoundingClientRect();
  const lx = (clientX - rect.left) * (LOGICAL_W / rect.width);
  const ly = (clientY - rect.top) * (LOGICAL_H / rect.height);

  // Calculate maze layout (same as renderer)
  const hudHeight = 50;
  const padding = 10;
  const miniMapSize = 60;
  const mazeAreaW = LOGICAL_W - padding * 2;
  const mazeAreaH = LOGICAL_H - hudHeight - padding * 2 - miniMapSize - 10;
  const cellW = mazeAreaW / maze.cols;
  const cellH = mazeAreaH / maze.rows;
  const cellSize = Math.min(cellW, cellH);
  const mazeW = cellSize * maze.cols;
  const mazeH = cellSize * maze.rows;
  const offsetX = (LOGICAL_W - mazeW) / 2;
  const offsetY = hudHeight + (mazeAreaH - mazeH) / 2 + padding;

  // Convert tap to cell coordinates
  const tapCol = Math.floor((lx - offsetX) / cellSize);
  const tapRow = Math.floor((ly - offsetY) / cellSize);

  // Check if tap is on an adjacent cell
  const dr = tapRow - playerRow;
  const dc = tapCol - playerCol;

  if (Math.abs(dr) + Math.abs(dc) === 1) {
    let dir = null;
    if (dr === -1) dir = 'up';
    else if (dr === 1) dir = 'down';
    else if (dc === -1) dir = 'left';
    else if (dc === 1) dir = 'right';

    if (dir) tryMove(dir);
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  if (!soundsRegistered) {
    registerSounds();
    soundsRegistered = true;
  }
  elapsedTime = 0;
  totalScore = 0;
  level = 1;
  starsCollected = 0;
  startLevel();
};

shell.onUpdate = (dt) => {
  if (gameWon) {
    frameTime += dt / 60;
    return;
  }

  const dtSec = dt / 60;
  elapsedTime += dtSec;
  frameTime += dtSec;

  // Animate player movement
  if (isMoving) {
    const speed = MOVE_SPEED * dtSec;
    const targetX = moveTargetCol;
    const targetY = moveTargetRow;

    const dx = targetX - playerAnimX;
    const dy = targetY - playerAnimY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed || dist < 0.01) {
      processArrival();
    } else {
      playerAnimX += (dx / dist) * speed;
      playerAnimY += (dy / dist) * speed;
    }
  }
};

shell.onRender = (ctx) => {
  renderGame(ctx, LOGICAL_W, LOGICAL_H, {
    maze,
    playerRow,
    playerCol,
    playerAnimX,
    playerAnimY,
    elapsedTime,
    starsCollected,
    totalStars,
    level,
    fogRadius,
    frameTime,
  });
};

shell.onGameOver = () => {
  const finalScore = totalScore;
  return {
    score: finalScore,
    message: `level ${level} reached`,
    scoreLabel: 'total score',
  };
};

// ---- Init ----

shell.init();

const canvas = shell.getCanvas();
setupKeyboardInput();
setupSwipeInput(canvas);
buildDifficultySelector();

// Add quit button during gameplay (ESC key)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && shell.state === 'playing') {
    shell.setState('game-over');
  }
});
