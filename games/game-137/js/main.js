/**
 * MEME TANGRAM -- Main Entry Point
 * Wires up the GameShell, input handling, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { render } from './renderer.js';
import {
  GRID, BOARD_Y, BOARD_COLS, BOARD_ROWS,
  createPieces, snapToGrid, pointInPiece, getPieceBounds,
  calculateCoverage, checkWin, PUZZLES, getPieceWorldVerts,
} from './tangram.js';

const W = 400;
const H = 700;

// ---- Sound Registration ----
function registerSounds() {
  registerSound('pickup', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 520, duration: 0.06, gain: 0.12 },
    ],
  });
  registerSound('place', {
    notes: [
      { type: 'sine', frequency: 330, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 440, duration: 0.06, delay: 0.05, gain: 0.1 },
    ],
  });
  registerSound('rotate', {
    notes: [
      { type: 'triangle', frequency: 600, endFrequency: 800, duration: 0.07, gain: 0.1 },
    ],
  });
  registerSound('snap', {
    notes: [
      { type: 'square', frequency: 880, duration: 0.03, gain: 0.08 },
    ],
  });
  registerSound('complete', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Game State ----
const state = {
  pieces: [],
  targetVerts: [],
  puzzleName: '',
  puzzleIndex: 0,
  totalPuzzles: PUZZLES.length,
  elapsedSeconds: 0,
  totalScore: 0,
  dragPieceId: -1,
  dragOffsetX: 0,
  dragOffsetY: 0,
  lastTapTime: 0,
  lastTapPieceId: -1,
  highlightWin: false,
  winTimer: 0,
  winReady: false,
  coveragePercent: 0,
  showHint: true,
  selectedPieceId: -1,
  coverageCheckTimer: 0,
};

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME TANGRAM',
  gameId: 'meme-tangram',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'tangram',
  subtitle: 'fill the shape. no cap.',
  accentColor: '#ff6b35',
});

shell.onStart = () => {
  initAudio();
  registerSounds();
  state.puzzleIndex = 0;
  state.totalScore = 0;
  loadPuzzle(state.puzzleIndex);
};

shell.onUpdate = (dt) => {
  if (state.highlightWin) {
    state.winTimer += dt;
    if (state.winTimer > 40) {
      state.winReady = true;
    }
    return;
  }

  state.elapsedSeconds += dt / 60;

  // Periodically check coverage for the display (not every frame for perf)
  state.coverageCheckTimer += dt;
  if (state.coverageCheckTimer > 15 && state.dragPieceId === -1) {
    state.coverageCheckTimer = 0;
    const { coverageRatio } = calculateCoverage(state.pieces, state.targetVerts);
    state.coveragePercent = coverageRatio;
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  return {
    score: state.totalScore,
    message: `completed ${state.puzzleIndex} puzzles`,
    scoreLabel: 'total score',
  };
};

// ---- Puzzle Management ----
function loadPuzzle(index) {
  if (index >= PUZZLES.length) {
    // All puzzles completed - game over
    shell.setState('game-over');
    return;
  }

  const puzzle = PUZZLES[index];
  state.targetVerts = puzzle.target;
  state.puzzleName = puzzle.name;
  state.puzzleIndex = index;
  state.pieces = createPieces();
  state.elapsedSeconds = 0;
  state.dragPieceId = -1;
  state.highlightWin = false;
  state.winTimer = 0;
  state.winReady = false;
  state.coveragePercent = 0;
  state.showHint = true;
  state.selectedPieceId = -1;
  state.coverageCheckTimer = 0;
}

function puzzleSolved() {
  const seconds = state.elapsedSeconds;
  const score = Math.max(3000 - Math.floor(seconds) * 5, 100);
  state.totalScore += score;
  state.highlightWin = true;
  state.winTimer = 0;
  state.winReady = false;
  playSound('complete');
}

function advancePuzzle() {
  loadPuzzle(state.puzzleIndex + 1);
}

// ---- Input Handling ----
// We need custom pointer handling for drag, not just tap.
function setupInput() {
  const canvas = shell.getCanvas();

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }

  function handlePointerDown(px, py) {
    initAudio();

    // If we're in win state and ready, advance
    if (state.highlightWin && state.winReady) {
      advancePuzzle();
      return;
    }
    if (state.highlightWin) return;

    // Check rotate button hit
    const btnY = BOARD_Y + BOARD_ROWS * GRID + 30;
    const btnH = 36;
    const btnW = 120;
    const btnX = W / 2 - btnW / 2;
    if (px >= btnX && px <= btnX + btnW && py >= btnY && py <= btnY + btnH) {
      rotateSelectedPiece();
      return;
    }

    // Check skip button
    const skipX = W - 80;
    if (px >= skipX && px <= skipX + 60 && py >= btnY && py <= btnY + btnH) {
      advancePuzzle();
      return;
    }

    // Check reset button
    const resetX = 20;
    if (px >= resetX && px <= resetX + 60 && py >= btnY && py <= btnY + btnH) {
      loadPuzzle(state.puzzleIndex);
      return;
    }

    // Check double-tap for rotation
    const now = Date.now();

    // Find piece under pointer (reverse order = top first)
    let hitPiece = null;
    for (let i = state.pieces.length - 1; i >= 0; i--) {
      if (pointInPiece(state.pieces[i], px, py)) {
        hitPiece = state.pieces[i];
        break;
      }
    }

    if (hitPiece) {
      state.showHint = false;

      // Double-tap detection
      if (now - state.lastTapTime < 350 && state.lastTapPieceId === hitPiece.id) {
        // Double tap = rotate
        hitPiece.rotation = (hitPiece.rotation + 1) % 8;
        playSound('rotate');
        state.lastTapTime = 0;
        state.lastTapPieceId = -1;
        state.selectedPieceId = hitPiece.id;
        return;
      }

      state.lastTapTime = now;
      state.lastTapPieceId = hitPiece.id;

      // Start drag
      const bounds = getPieceBounds(hitPiece);
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;
      state.dragPieceId = hitPiece.id;
      state.dragOffsetX = cx - px;
      state.dragOffsetY = cy - py;
      state.selectedPieceId = hitPiece.id;
      playSound('pickup');
    } else {
      state.selectedPieceId = -1;
    }
  }

  function handlePointerMove(px, py) {
    if (state.dragPieceId < 0) return;

    const piece = state.pieces.find(p => p.id === state.dragPieceId);
    if (!piece) return;

    // Compute new center position in world coords, then convert to grid
    const newCx = px + state.dragOffsetX;
    const newCy = py + state.dragOffsetY;

    // Calculate current bounding box center to find delta
    const wv = getPieceWorldVerts(piece);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of wv) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const currentCx = (minX + maxX) / 2;
    const currentCy = (minY + maxY) / 2;

    const dx = (newCx - currentCx) / GRID;
    const dy = (newCy - currentCy) / GRID;

    piece.gx += dx;
    piece.gy += dy;
  }

  function handlePointerUp() {
    if (state.dragPieceId < 0) return;

    const piece = state.pieces.find(p => p.id === state.dragPieceId);
    if (piece) {
      // Snap to grid
      piece.gx = snapToGrid(piece.gx);
      piece.gy = snapToGrid(piece.gy);

      // Clamp to board area
      piece.gx = Math.max(-2, Math.min(BOARD_COLS, piece.gx));
      piece.gy = Math.max(-2, Math.min(BOARD_ROWS, piece.gy));

      playSound('snap');

      // Check win after placing
      setTimeout(() => {
        if (checkWin(state.pieces, state.targetVerts)) {
          puzzleSolved();
        } else {
          const { coverageRatio } = calculateCoverage(state.pieces, state.targetVerts);
          state.coveragePercent = coverageRatio;
        }
      }, 50);
    }

    state.dragPieceId = -1;
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    const pos = toLogical(e.clientX, e.clientY);
    handlePointerDown(pos.x, pos.y);
  });
  canvas.addEventListener('mousemove', (e) => {
    const pos = toLogical(e.clientX, e.clientY);
    handlePointerMove(pos.x, pos.y);
  });
  canvas.addEventListener('mouseup', () => handlePointerUp());
  canvas.addEventListener('mouseleave', () => handlePointerUp());

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    handlePointerDown(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    handlePointerMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePointerUp();
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => handlePointerUp());
}

function rotateSelectedPiece() {
  if (state.selectedPieceId < 0) {
    // Rotate the last placed/moved piece, or first piece
    if (state.pieces.length > 0) {
      state.selectedPieceId = state.pieces[0].id;
    }
  }

  const piece = state.pieces.find(p => p.id === state.selectedPieceId);
  if (piece) {
    piece.rotation = (piece.rotation + 1) % 8;
    playSound('rotate');

    // Check win after rotating
    setTimeout(() => {
      if (checkWin(state.pieces, state.targetVerts)) {
        puzzleSolved();
      }
    }, 50);
  }
}

// ---- Boot ----
shell.init();
setupInput();
