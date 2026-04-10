/**
 * MEME REVERSI -- Game Engine
 * Pure game logic: board management, move validation, disc flipping, AI opponents.
 */

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;  // Player
const WHITE = 2;  // AI

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

/**
 * Positional weight table for minimax evaluation.
 * Corners are most valuable, edges are good, adjacent-to-corner spots are dangerous.
 */
const POSITION_WEIGHTS = [
  [ 120, -20,  20,   5,   5,  20, -20, 120],
  [ -20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [  20,  -5,  15,   3,   3,  15,  -5,  20],
  [   5,  -5,   3,   3,   3,   3,  -5,   5],
  [   5,  -5,   3,   3,   3,   3,  -5,   5],
  [  20,  -5,  15,   3,   3,  15,  -5,  20],
  [ -20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 120, -20,  20,   5,   5,  20, -20, 120],
];

/**
 * Create a fresh 8x8 board with the standard starting position.
 * @returns {number[][]}
 */
export function createBoard() {
  const board = [];
  for (let r = 0; r < SIZE; r++) {
    board.push(new Array(SIZE).fill(EMPTY));
  }
  // Standard Othello starting position
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

/**
 * Clone a board (deep copy).
 * @param {number[][]} board
 * @returns {number[][]}
 */
function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * Get discs that would be flipped if player places at (row, col).
 * Returns an array of [row, col] pairs, or empty array if move is invalid.
 * @param {number[][]} board
 * @param {number} row
 * @param {number} col
 * @param {number} player
 * @returns {number[][]}
 */
export function getFlips(board, row, col, player) {
  if (board[row][col] !== EMPTY) return [];

  const opponent = player === BLACK ? WHITE : BLACK;
  const allFlips = [];

  for (const [dr, dc] of DIRECTIONS) {
    const flips = [];
    let r = row + dr;
    let c = col + dc;

    // Walk in direction, collecting opponent discs
    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === opponent) {
      flips.push([r, c]);
      r += dr;
      c += dc;
    }

    // Valid only if we ended on our own disc (and flipped at least one)
    if (flips.length > 0 && r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === player) {
      allFlips.push(...flips);
    }
  }

  return allFlips;
}

/**
 * Get all valid moves for a player.
 * @param {number[][]} board
 * @param {number} player
 * @returns {{ row: number, col: number, flips: number[][] }[]}
 */
export function getValidMoves(board, player) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const flips = getFlips(board, r, c, player);
      if (flips.length > 0) {
        moves.push({ row: r, col: c, flips });
      }
    }
  }
  return moves;
}

/**
 * Place a disc and flip captured discs. Mutates the board.
 * @param {number[][]} board
 * @param {number} row
 * @param {number} col
 * @param {number} player
 * @param {number[][]} flips
 */
export function placeDisc(board, row, col, player, flips) {
  board[row][col] = player;
  for (const [fr, fc] of flips) {
    board[fr][fc] = player;
  }
}

/**
 * Count discs for each player.
 * @param {number[][]} board
 * @returns {{ black: number, white: number, empty: number }}
 */
export function countDiscs(board) {
  let black = 0, white = 0, empty = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) black++;
      else if (board[r][c] === WHITE) white++;
      else empty++;
    }
  }
  return { black, white, empty };
}

/**
 * Check if the game is over (neither player can move).
 * @param {number[][]} board
 * @returns {boolean}
 */
export function isGameOver(board) {
  return getValidMoves(board, BLACK).length === 0 && getValidMoves(board, WHITE).length === 0;
}

// -- AI Logic --

/**
 * Easy AI: pick a random valid move.
 * @param {number[][]} board
 * @returns {{ row: number, col: number }}
 */
function aiEasy(board) {
  const moves = getValidMoves(board, WHITE);
  const pick = moves[Math.floor(Math.random() * moves.length)];
  return { row: pick.row, col: pick.col };
}

/**
 * Medium AI: greedy -- pick the move that flips the most discs.
 * @param {number[][]} board
 * @returns {{ row: number, col: number }}
 */
function aiMedium(board) {
  const moves = getValidMoves(board, WHITE);
  let best = moves[0];
  for (const move of moves) {
    if (move.flips.length > best.flips.length) {
      best = move;
    }
  }
  return { row: best.row, col: best.col };
}

/**
 * Evaluate a board position for minimax using positional weights.
 * @param {number[][]} board
 * @returns {number} Positive = good for WHITE (AI)
 */
function evaluate(board) {
  let score = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === WHITE) {
        score += POSITION_WEIGHTS[r][c];
      } else if (board[r][c] === BLACK) {
        score -= POSITION_WEIGHTS[r][c];
      }
    }
  }

  // Mobility bonus: having more moves is advantageous
  const whiteMoves = getValidMoves(board, WHITE).length;
  const blackMoves = getValidMoves(board, BLACK).length;
  score += (whiteMoves - blackMoves) * 5;

  return score;
}

/**
 * Minimax with alpha-beta pruning for Reversi.
 * @param {number[][]} board
 * @param {number} depth
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} isMaximizing - true = AI (WHITE) turn
 * @returns {{ score: number, row: number, col: number }}
 */
function minimax(board, depth, alpha, beta, isMaximizing) {
  const player = isMaximizing ? WHITE : BLACK;
  const moves = getValidMoves(board, player);

  // Terminal conditions
  if (depth === 0 || isGameOver(board)) {
    return { score: evaluate(board), row: -1, col: -1 };
  }

  // If no valid moves, pass turn
  if (moves.length === 0) {
    const result = minimax(board, depth - 1, alpha, beta, !isMaximizing);
    return { score: result.score, row: -1, col: -1 };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestRow = moves[0].row;
    let bestCol = moves[0].col;

    for (const move of moves) {
      const newBoard = cloneBoard(board);
      placeDisc(newBoard, move.row, move.col, WHITE, move.flips);
      const result = minimax(newBoard, depth - 1, alpha, beta, false);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestRow = move.row;
        bestCol = move.col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }
    return { score: bestScore, row: bestRow, col: bestCol };
  } else {
    let bestScore = Infinity;
    let bestRow = moves[0].row;
    let bestCol = moves[0].col;

    for (const move of moves) {
      const newBoard = cloneBoard(board);
      placeDisc(newBoard, move.row, move.col, BLACK, move.flips);
      const result = minimax(newBoard, depth - 1, alpha, beta, true);

      if (result.score < bestScore) {
        bestScore = result.score;
        bestRow = move.row;
        bestCol = move.col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return { score: bestScore, row: bestRow, col: bestCol };
  }
}

/**
 * Hard AI: minimax depth 4 with positional weights.
 * @param {number[][]} board
 * @returns {{ row: number, col: number }}
 */
function aiHard(board) {
  const result = minimax(board, 4, -Infinity, Infinity, true);
  return { row: result.row, col: result.col };
}

/**
 * Get the AI's chosen move based on difficulty.
 * @param {number[][]} board
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ row: number, col: number }}
 */
export function aiMove(board, difficulty) {
  switch (difficulty) {
    case 'easy': return aiEasy(board);
    case 'medium': return aiMedium(board);
    case 'hard': return aiHard(board);
    default: return aiMedium(board);
  }
}

export { SIZE, EMPTY, BLACK, WHITE };
