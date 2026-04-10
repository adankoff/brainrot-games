/**
 * MEME CHECKERS -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game + animation state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import {
  createGame, getAllMoves, getMovesForPiece, executeMove,
  checkWinner, getAIMove, hasJumpsAvailable,
  RED, BLACK, RED_KING, BLACK_KING, BOARD_SIZE,
  isRed, isBlack, belongsTo,
} from './checkers.js';
import { render, computeLayout, pixelToBoard, boardToPixel } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const MOVE_ANIM_DURATION = 200;   // ms per hop in animation
const AI_THINK_DELAY = 400;       // ms before AI makes a move
const GAME_OVER_DELAY = 1200;     // ms to show result before game-over screen

// ---- Module State ----

/** @type {Object|null} */
let game = null;

/** @type {string} */
let difficulty = 'medium';

/** @type {boolean} */
let audioInitialized = false;

/** @type {Object|null} */
let layout = null;

/** @type {number|null} */
let aiTimeout = null;

/** @type {number|null} */
let gameOverTimeout = null;

/** Animation state */
const anim = {
  animating: false,
  fromRow: 0,
  fromCol: 0,
  toRow: 0,
  toCol: 0,
  piece: 0,
  progress: 0,
  timer: 0,
  // Queue for multi-step animations (multi-jump shown as sequence of hops)
  queue: [],       // Array of { fromRow, fromCol, toRow, toCol, piece, jumpedRow?, jumpedCol? }
  onComplete: null,
};

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME CHECKERS',
  gameId: 'meme-checkers',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'checkers',
  subtitle: 'king me or get rekt.',
  accentColor: '#c8ff00',
  shareUrl: '',
});

// ---- Sound Registration ----

function ensureAudio() {
  if (audioInitialized) return;
  try {
    initAudio();

    registerSound('move', {
      notes: [
        { type: 'sine', frequency: 350, endFrequency: 400, duration: 0.08, gain: 0.12 },
      ],
    });

    registerSound('jump', {
      notes: [
        { type: 'square', frequency: 300, endFrequency: 500, duration: 0.1, gain: 0.15 },
        { type: 'sine', frequency: 600, duration: 0.05, delay: 0.1, gain: 0.1 },
      ],
    });

    registerSound('king', {
      notes: [
        { type: 'sine', frequency: 523, duration: 0.1, gain: 0.2 },
        { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.2 },
        { type: 'sine', frequency: 784, duration: 0.15, delay: 0.2, gain: 0.25 },
      ],
    });

    registerSound('win', {
      notes: [
        { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
        { type: 'sine', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.2 },
        { type: 'sine', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.2 },
        { type: 'sine', frequency: 1047, duration: 0.25, delay: 0.36, gain: 0.3 },
      ],
    });

    registerSound('lose', {
      notes: [
        { type: 'square', frequency: 400, duration: 0.15, gain: 0.2 },
        { type: 'square', frequency: 300, duration: 0.15, delay: 0.15, gain: 0.2 },
        { type: 'square', frequency: 200, duration: 0.2, delay: 0.3, gain: 0.25 },
        { type: 'sawtooth', frequency: 150, endFrequency: 80, duration: 0.3, delay: 0.5, gain: 0.2 },
      ],
    });

    registerSound('select', {
      notes: [
        { type: 'sine', frequency: 500, duration: 0.04, gain: 0.1 },
      ],
    });

    registerSound('invalid', {
      notes: [
        { type: 'square', frequency: 150, duration: 0.08, gain: 0.1 },
        { type: 'square', frequency: 120, duration: 0.08, delay: 0.08, gain: 0.1 },
      ],
    });

    audioInitialized = true;
  } catch {
    // Audio failed -- game still works
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  game = createGame();
  layout = computeLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Reset animation state
  anim.animating = false;
  anim.queue = [];
  anim.onComplete = null;

  // Clear any pending timeouts
  if (aiTimeout) { clearTimeout(aiTimeout); aiTimeout = null; }
  if (gameOverTimeout) { clearTimeout(gameOverTimeout); gameOverTimeout = null; }
};

shell.onUpdate = (dt) => {
  if (!game || !layout) return;

  const dtMs = dt * 16.67;

  // Update move animation
  if (anim.animating) {
    anim.timer += dtMs;
    anim.progress = Math.min(anim.timer / MOVE_ANIM_DURATION, 1);

    if (anim.progress >= 1) {
      finishCurrentAnimation();
    }
  }
};

shell.onRender = (ctx) => {
  if (!game || !layout) return;
  render(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, game, anim, layout);
};

shell.onGameOver = () => {
  const score = game ? game.score : 0;
  const isWin = game && game.winner === RED;
  const message = isWin ? 'you cooked them fr' : 'you got cooked ngl';

  return {
    score,
    message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  if (!game || !layout) return;
  const frozenAnim = { ...anim, animating: false };
  render(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, game, frozenAnim, layout);
};

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();

  if (shell.state !== 'playing') return;
  if (!game || !layout) return;
  if (anim.animating) return;
  if (game.gameOver) return;
  if (game.turn !== RED) return; // Not player's turn

  const cell = pixelToBoard(pos.x, pos.y, layout);
  if (!cell) {
    // Tapped outside board -- deselect
    deselectPiece();
    return;
  }

  const { row, col } = cell;
  const piece = game.board[row][col];

  // Check if tapped on a valid move destination
  if (game.selectedPiece && game.validMoves.length > 0) {
    const targetMove = game.validMoves.find(m => m.row === row && m.col === col);
    if (targetMove) {
      executePlayerMove(game.selectedPiece.row, game.selectedPiece.col, targetMove);
      return;
    }
  }

  // Check if tapped on own piece
  if (belongsTo(piece, RED)) {
    selectPiece(row, col);
    return;
  }

  // Tapped on enemy piece or empty square -- deselect
  deselectPiece();
});

// ---- Difficulty Selector ----

loadDifficulty();
setupDifficultySelector();

// ---- Helper Functions ----

/**
 * Select a player piece and compute valid moves.
 */
function selectPiece(row, col) {
  if (!game) return;

  // Check if mandatory jumps constrain which pieces can be selected
  const allMoves = getAllMoves(game.board, RED);
  const hasJumps = allMoves.some(m => m.jumps.length > 0);

  // Get moves for this specific piece
  let moves = getMovesForPiece(game.board, row, col, hasJumps);

  // If there are mandatory jumps and this piece has none, can't select it
  if (hasJumps && moves.length === 0) {
    playSound('invalid');
    game.message = 'must jump!';
    // Auto-clear message
    setTimeout(() => { if (game) game.message = ''; }, 1500);
    return;
  }

  if (moves.length === 0) {
    playSound('invalid');
    return;
  }

  game.selectedPiece = { row, col };
  game.validMoves = moves;
  playSound('select');
}

/**
 * Deselect the current piece.
 */
function deselectPiece() {
  if (!game) return;
  game.selectedPiece = null;
  game.validMoves = [];
}

/**
 * Execute a player move with animation.
 */
function executePlayerMove(fromRow, fromCol, move) {
  if (!game) return;

  const piece = game.board[fromRow][fromCol];
  deselectPiece();

  // Build animation queue for the move
  if (move.jumps.length > 0) {
    // Jump move -- animate hop by hop
    buildJumpAnimationQueue(fromRow, fromCol, move, piece);
  } else {
    // Simple move
    startAnimation(fromRow, fromCol, move.row, move.col, piece, () => {
      const result = executeMove(game.board, fromRow, fromCol, move.row, move.col, []);
      playSound('move');

      if (result.kinged) {
        game.redKings++;
        game.score += 100;
        playSound('king');
      }

      endPlayerTurn();
    });
  }
}

/**
 * Build an animation queue for a multi-hop jump.
 */
function buildJumpAnimationQueue(fromRow, fromCol, move, piece) {
  // For a multi-jump, we need to compute the intermediate landing squares.
  // The jumps array contains the jumped-over pieces.
  // We reconstruct the path: from each jumped piece, the landing is 2 squares beyond.

  const steps = [];
  let curR = fromRow;
  let curC = fromCol;
  let curPiece = piece;

  for (let i = 0; i < move.jumps.length; i++) {
    const jumped = move.jumps[i];
    // Landing is on the opposite side of the jumped piece from current position
    const landR = jumped.row + (jumped.row - curR);
    const landC = jumped.col + (jumped.col - curC);

    // Check if this hop causes a king promotion
    let nextPiece = curPiece;
    if (curPiece === RED && landR === 0) nextPiece = RED_KING;
    if (curPiece === BLACK && landR === BOARD_SIZE - 1) nextPiece = BLACK_KING;

    steps.push({
      fromRow: curR,
      fromCol: curC,
      toRow: landR,
      toCol: landC,
      piece: curPiece,
      jumpedRow: jumped.row,
      jumpedCol: jumped.col,
    });

    curR = landR;
    curC = landC;
    curPiece = nextPiece;
  }

  // Execute first step, queue the rest
  const firstStep = steps.shift();
  anim.queue = steps;

  // Remove the piece from the source temporarily
  const origPiece = game.board[firstStep.fromRow][firstStep.fromCol];
  game.board[firstStep.fromRow][firstStep.fromCol] = 0; // EMPTY

  startAnimation(firstStep.fromRow, firstStep.fromCol, firstStep.toRow, firstStep.toCol, firstStep.piece, () => {
    // Remove jumped piece
    game.board[firstStep.jumpedRow][firstStep.jumpedCol] = 0;
    game.redCaptured++;
    game.score += 50;
    playSound('jump');

    // Check for king promotion at this step
    let landedPiece = firstStep.piece;
    if (firstStep.piece === RED && firstStep.toRow === 0) {
      landedPiece = RED_KING;
      game.redKings++;
      game.score += 100;
      playSound('king');
    }

    if (anim.queue.length > 0) {
      // Continue with next hop
      processNextJumpInQueue(landedPiece);
    } else {
      // Place the piece at final position
      game.board[firstStep.toRow][firstStep.toCol] = landedPiece;
      endPlayerTurn();
    }
  });
}

/**
 * Process the next jump hop in the animation queue.
 */
function processNextJumpInQueue(currentPiece) {
  const step = anim.queue.shift();
  step.piece = currentPiece;

  startAnimation(step.fromRow, step.fromCol, step.toRow, step.toCol, step.piece, () => {
    // Remove jumped piece
    game.board[step.jumpedRow][step.jumpedCol] = 0;
    game.redCaptured++;
    game.score += 50;
    playSound('jump');

    // Check for king promotion
    let landedPiece = step.piece;
    if (step.piece === RED && step.toRow === 0) {
      landedPiece = RED_KING;
      game.redKings++;
      game.score += 100;
      playSound('king');
    }

    if (anim.queue.length > 0) {
      processNextJumpInQueue(landedPiece);
    } else {
      // Place the piece at final position
      game.board[step.toRow][step.toCol] = landedPiece;
      endPlayerTurn();
    }
  });
}

/**
 * End the player's turn and check for win/switch to AI.
 */
function endPlayerTurn() {
  if (!game) return;
  game.message = '';

  const winner = checkWinner(game.board, BLACK);
  if (winner !== null) {
    handleGameEnd(winner);
    return;
  }

  // Switch to AI turn
  game.turn = BLACK;
  scheduleAIMove();
}

/**
 * Schedule an AI move after a short delay.
 */
function scheduleAIMove() {
  if (aiTimeout) clearTimeout(aiTimeout);

  aiTimeout = setTimeout(() => {
    aiTimeout = null;
    performAIMove();
  }, AI_THINK_DELAY);
}

/**
 * Perform the AI's move.
 */
function performAIMove() {
  if (!game || game.gameOver || game.turn !== BLACK) return;

  const move = getAIMove(game.board, difficulty);
  if (!move) {
    handleGameEnd(RED);
    return;
  }

  const piece = game.board[move.fromRow][move.fromCol];

  if (move.jumps.length > 0) {
    // Jump move -- animate hop by hop
    buildAIJumpAnimation(move.fromRow, move.fromCol, move, piece);
  } else {
    // Simple move
    game.board[move.fromRow][move.fromCol] = 0;

    startAnimation(move.fromRow, move.fromCol, move.row, move.col, piece, () => {
      let finalPiece = piece;
      if (piece === BLACK && move.row === BOARD_SIZE - 1) {
        finalPiece = BLACK_KING;
        game.blackKings++;
      }
      game.board[move.row][move.col] = finalPiece;
      playSound('move');

      if (finalPiece !== piece) {
        playSound('king');
      }

      endAITurn();
    });
  }
}

/**
 * Build AI jump animation, similar to player but for AI pieces.
 */
function buildAIJumpAnimation(fromRow, fromCol, move, piece) {
  const steps = [];
  let curR = fromRow;
  let curC = fromCol;
  let curPiece = piece;

  for (let i = 0; i < move.jumps.length; i++) {
    const jumped = move.jumps[i];
    const landR = jumped.row + (jumped.row - curR);
    const landC = jumped.col + (jumped.col - curC);

    let nextPiece = curPiece;
    if (curPiece === BLACK && landR === BOARD_SIZE - 1) nextPiece = BLACK_KING;

    steps.push({
      fromRow: curR,
      fromCol: curC,
      toRow: landR,
      toCol: landC,
      piece: curPiece,
      jumpedRow: jumped.row,
      jumpedCol: jumped.col,
    });

    curR = landR;
    curC = landC;
    curPiece = nextPiece;
  }

  const firstStep = steps.shift();
  anim.queue = steps;

  // Remove piece from source
  game.board[firstStep.fromRow][firstStep.fromCol] = 0;

  startAnimation(firstStep.fromRow, firstStep.fromCol, firstStep.toRow, firstStep.toCol, firstStep.piece, () => {
    game.board[firstStep.jumpedRow][firstStep.jumpedCol] = 0;
    game.blackCaptured++;
    // Deduct from player's score for lost pieces
    playSound('jump');

    let landedPiece = firstStep.piece;
    if (firstStep.piece === BLACK && firstStep.toRow === BOARD_SIZE - 1) {
      landedPiece = BLACK_KING;
      game.blackKings++;
      playSound('king');
    }

    if (anim.queue.length > 0) {
      processNextAIJumpInQueue(landedPiece);
    } else {
      game.board[firstStep.toRow][firstStep.toCol] = landedPiece;
      endAITurn();
    }
  });
}

/**
 * Process next AI jump in queue.
 */
function processNextAIJumpInQueue(currentPiece) {
  const step = anim.queue.shift();
  step.piece = currentPiece;

  startAnimation(step.fromRow, step.fromCol, step.toRow, step.toCol, step.piece, () => {
    game.board[step.jumpedRow][step.jumpedCol] = 0;
    game.blackCaptured++;
    playSound('jump');

    let landedPiece = step.piece;
    if (step.piece === BLACK && step.toRow === BOARD_SIZE - 1) {
      landedPiece = BLACK_KING;
      game.blackKings++;
      playSound('king');
    }

    if (anim.queue.length > 0) {
      processNextAIJumpInQueue(landedPiece);
    } else {
      game.board[step.toRow][step.toCol] = landedPiece;
      endAITurn();
    }
  });
}

/**
 * End the AI's turn and check for win/switch to player.
 */
function endAITurn() {
  if (!game) return;

  const winner = checkWinner(game.board, RED);
  if (winner !== null) {
    handleGameEnd(winner);
    return;
  }

  game.turn = RED;
}

/**
 * Handle game end.
 */
function handleGameEnd(winner) {
  if (!game) return;

  game.gameOver = true;
  game.winner = winner;

  if (winner === RED) {
    game.score += 500; // Win bonus
    playSound('win');
  } else {
    playSound('lose');
  }

  // Delay before showing game-over overlay
  if (gameOverTimeout) clearTimeout(gameOverTimeout);
  gameOverTimeout = setTimeout(() => {
    gameOverTimeout = null;
    shell.setState('game-over');
  }, GAME_OVER_DELAY);
}

// ---- Animation Helpers ----

/**
 * Start a single move animation.
 */
function startAnimation(fromRow, fromCol, toRow, toCol, piece, onComplete) {
  anim.animating = true;
  anim.fromRow = fromRow;
  anim.fromCol = fromCol;
  anim.toRow = toRow;
  anim.toCol = toCol;
  anim.piece = piece;
  anim.progress = 0;
  anim.timer = 0;
  anim.onComplete = onComplete;
}

/**
 * Called when the current animation step finishes.
 */
function finishCurrentAnimation() {
  anim.animating = false;
  if (anim.onComplete) {
    const cb = anim.onComplete;
    anim.onComplete = null;
    cb();
  }
}

// ---- Difficulty ----

/**
 * Load saved difficulty preference.
 */
function loadDifficulty() {
  const saved = getData('meme-checkers', 'difficulty');
  if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
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
        setData('meme-checkers', 'difficulty', level);

        container.querySelectorAll('.difficulty-select__btn').forEach((b) => {
          b.classList.remove('difficulty-select__btn--active');
        });
        btn.classList.add('difficulty-select__btn--active');

        ensureAudio();
        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
