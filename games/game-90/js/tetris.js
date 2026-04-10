/**
 * MEME TETRIS -- Core Tetris Engine
 * Pure game logic with no rendering or DOM dependencies.
 */

import { readThemeColor } from '../../shared/theme-utils.js';

// ---- Tetromino Definitions ----

const COLS = 10;
const ROWS = 20;

// Each piece: array of rotation states, each state is array of [row, col] offsets
const PIECES = {
  I: {
    color: readThemeColor('--game-piece-i', '#cccccc'),
    states: [
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
    ],
  },
  O: {
    color: readThemeColor('--game-piece-o', '#aaaaaa'),
    states: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
    ],
  },
  T: {
    color: readThemeColor('--game-piece-t', '#888888'),
    states: [
      [[0,0],[0,1],[0,2],[1,1]],
      [[0,0],[1,0],[2,0],[1,1]],
      [[1,0],[1,1],[1,2],[0,1]],
      [[0,0],[1,0],[2,0],[1,-1]],
    ],
  },
  S: {
    color: readThemeColor('--game-piece-s', '#999999'),
    states: [
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
    ],
  },
  Z: {
    color: readThemeColor('--game-piece-z', '#777777'),
    states: [
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
    ],
  },
  J: {
    color: readThemeColor('--game-piece-j', '#666666'),
    states: [
      [[0,0],[1,0],[1,1],[1,2]],
      [[0,0],[0,1],[1,0],[2,0]],
      [[0,0],[0,1],[0,2],[1,2]],
      [[0,0],[1,0],[2,0],[2,-1]],
    ],
  },
  L: {
    color: readThemeColor('--game-piece-l', '#bbbbbb'),
    states: [
      [[0,2],[1,0],[1,1],[1,2]],
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]],
    ],
  },
};

const PIECE_NAMES = ['I','O','T','S','Z','J','L'];

// SRS wall kick data: offsets to try for each rotation transition
// Format: [col_offset, row_offset]
const WALL_KICKS = {
  normal: [
    // 0->R
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    // R->2
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    // 2->L
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    // L->0
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  ],
  I: [
    // 0->R
    [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
    // R->2
    [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
    // 2->L
    [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
    // L->0
    [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  ],
};

// ---- Bag Randomizer ----

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createBag() {
  return shuffleArray([...PIECE_NAMES]);
}

function nextFromBag(game) {
  if (game.bag.length === 0) {
    game.bag = createBag();
  }
  return game.bag.pop();
}

// ---- Grid Helpers ----

function createGrid() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid.push(new Array(COLS).fill(null));
  }
  return grid;
}

function getPieceCells(type, rotation, row, col) {
  const offsets = PIECES[type].states[rotation];
  return offsets.map(([dr, dc]) => [row + dr, col + dc]);
}

function isValidPosition(grid, type, rotation, row, col) {
  const cells = getPieceCells(type, rotation, row, col);
  for (const [r, c] of cells) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

function getGhostRow(grid, type, rotation, row, col) {
  let ghostRow = row;
  while (isValidPosition(grid, type, rotation, ghostRow + 1, col)) {
    ghostRow++;
  }
  return ghostRow;
}

// ---- Line Clearing ----

function findFullLines(grid) {
  const lines = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every(cell => cell !== null)) {
      lines.push(r);
    }
  }
  return lines;
}

function clearLines(grid, lines) {
  // Remove full lines from bottom to top to keep indices valid
  const sorted = [...lines].sort((a, b) => b - a);
  for (const lineIdx of sorted) {
    grid.splice(lineIdx, 1);
  }
  // Add empty lines at top
  while (grid.length < ROWS) {
    grid.unshift(new Array(COLS).fill(null));
  }
}

// ---- Scoring ----

const LINE_SCORES = [0, 100, 300, 500, 800];

function getDropInterval(level) {
  return Math.max(1, 48 - level * 4);
}

// ---- Piece Spawning ----

function spawnPiece(game) {
  const type = game.nextPiece;
  game.nextPiece = nextFromBag(game);

  const rotation = 0;
  const col = Math.floor((COLS - getWidth(type, rotation)) / 2);
  const row = 0;

  if (!isValidPosition(game.grid, type, rotation, row, col)) {
    // Game over
    game.gameOver = true;
    return;
  }

  game.currentPiece = type;
  game.currentRotation = rotation;
  game.currentRow = row;
  game.currentCol = col;
  game.lockTimer = 0;
  game.landed = false;
  game.holdUsed = false;
}

function getWidth(type, rotation) {
  const cells = PIECES[type].states[rotation];
  const cols = cells.map(([, c]) => c);
  return Math.max(...cols) - Math.min(...cols) + 1;
}

// ---- Public API ----

export function createGame() {
  const bag = createBag();
  const game = {
    grid: createGrid(),
    bag,
    currentPiece: null,
    currentRotation: 0,
    currentRow: 0,
    currentCol: 0,
    nextPiece: null,
    holdPiece: null,
    holdUsed: false,
    score: 0,
    level: 0,
    lines: 0,
    dropTimer: 0,
    lockTimer: 0,
    landed: false,
    gameOver: false,
    clearingLines: null,   // array of line indices being cleared, or null
    clearTimer: 0,
    LOCK_DELAY: 30,        // frames
    CLEAR_ANIM_FRAMES: 15, // frames for line clear animation
  };

  game.nextPiece = nextFromBag(game);
  spawnPiece(game);

  return game;
}

export function tick(game) {
  if (game.gameOver) return { event: 'none' };

  // Handle line clear animation
  if (game.clearingLines !== null) {
    game.clearTimer++;
    if (game.clearTimer >= game.CLEAR_ANIM_FRAMES) {
      const count = game.clearingLines.length;
      clearLines(game.grid, game.clearingLines);
      game.clearingLines = null;
      game.clearTimer = 0;

      // Update score
      game.score += LINE_SCORES[count] * (game.level + 1);
      game.lines += count;
      game.level = Math.floor(game.lines / 10);

      // Spawn next piece
      spawnPiece(game);
      if (game.gameOver) return { event: 'gameover' };

      return { event: count === 4 ? 'tetris' : 'clear', count };
    }
    return { event: 'none' };
  }

  // Gravity
  const dropInterval = getDropInterval(game.level);
  game.dropTimer++;

  if (game.dropTimer >= dropInterval) {
    game.dropTimer = 0;
    if (isValidPosition(game.grid, game.currentPiece, game.currentRotation, game.currentRow + 1, game.currentCol)) {
      game.currentRow++;
      game.landed = false;
      game.lockTimer = 0;
    } else {
      game.landed = true;
    }
  }

  // Lock delay
  if (game.landed) {
    // Check if piece is still on ground
    if (isValidPosition(game.grid, game.currentPiece, game.currentRotation, game.currentRow + 1, game.currentCol)) {
      game.landed = false;
      game.lockTimer = 0;
    } else {
      game.lockTimer++;
      if (game.lockTimer >= game.LOCK_DELAY) {
        return lockPiece(game);
      }
    }
  }

  return { event: 'none' };
}

function lockPiece(game) {
  // Place piece on grid
  const cells = getPieceCells(game.currentPiece, game.currentRotation, game.currentRow, game.currentCol);
  const color = PIECES[game.currentPiece].color;
  for (const [r, c] of cells) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      game.grid[r][c] = color;
    }
  }

  // Check for line clears
  const fullLines = findFullLines(game.grid);
  if (fullLines.length > 0) {
    game.clearingLines = fullLines;
    game.clearTimer = 0;
    return { event: 'lock_clearing' };
  }

  // Spawn next piece
  spawnPiece(game);
  if (game.gameOver) return { event: 'gameover' };

  return { event: 'lock' };
}

export function moveLeft(game) {
  if (game.gameOver || game.clearingLines !== null) return false;
  if (isValidPosition(game.grid, game.currentPiece, game.currentRotation, game.currentRow, game.currentCol - 1)) {
    game.currentCol--;
    if (game.landed) game.lockTimer = 0;
    return true;
  }
  return false;
}

export function moveRight(game) {
  if (game.gameOver || game.clearingLines !== null) return false;
  if (isValidPosition(game.grid, game.currentPiece, game.currentRotation, game.currentRow, game.currentCol + 1)) {
    game.currentCol++;
    if (game.landed) game.lockTimer = 0;
    return true;
  }
  return false;
}

export function moveDown(game) {
  if (game.gameOver || game.clearingLines !== null) return false;
  if (isValidPosition(game.grid, game.currentPiece, game.currentRotation, game.currentRow + 1, game.currentCol)) {
    game.currentRow++;
    game.dropTimer = 0;
    game.score += 1; // soft drop bonus
    return true;
  }
  return false;
}

export function rotate(game) {
  if (game.gameOver || game.clearingLines !== null) return false;
  if (game.currentPiece === 'O') return false; // O doesn't rotate

  const newRotation = (game.currentRotation + 1) % 4;
  const kickTable = game.currentPiece === 'I' ? WALL_KICKS.I : WALL_KICKS.normal;
  const kicks = kickTable[game.currentRotation];

  for (const [dc, dr] of kicks) {
    const newCol = game.currentCol + dc;
    const newRow = game.currentRow - dr; // SRS: positive dr = up
    if (isValidPosition(game.grid, game.currentPiece, newRotation, newRow, newCol)) {
      game.currentRotation = newRotation;
      game.currentCol = newCol;
      game.currentRow = newRow;
      if (game.landed) game.lockTimer = 0;
      return true;
    }
  }
  return false;
}

export function hardDrop(game) {
  if (game.gameOver || game.clearingLines !== null) return null;

  const ghostRow = getGhostRow(game.grid, game.currentPiece, game.currentRotation, game.currentRow, game.currentCol);
  const distance = ghostRow - game.currentRow;
  game.score += distance * 2; // hard drop bonus
  game.currentRow = ghostRow;

  return lockPiece(game);
}

export function hold(game) {
  if (game.gameOver || game.holdUsed || game.clearingLines !== null) return false;

  const current = game.currentPiece;
  if (game.holdPiece === null) {
    game.holdPiece = current;
    spawnPiece(game);
  } else {
    const held = game.holdPiece;
    game.holdPiece = current;
    // Place held piece
    const rotation = 0;
    const col = Math.floor((COLS - getWidth(held, rotation)) / 2);
    const row = 0;
    if (!isValidPosition(game.grid, held, rotation, row, col)) {
      game.gameOver = true;
      return false;
    }
    game.currentPiece = held;
    game.currentRotation = rotation;
    game.currentRow = row;
    game.currentCol = col;
    game.lockTimer = 0;
    game.landed = false;
  }

  game.holdUsed = true;
  return true;
}

// Expose constants and helpers for renderer
export { COLS, ROWS, PIECES, getPieceCells, getGhostRow };
