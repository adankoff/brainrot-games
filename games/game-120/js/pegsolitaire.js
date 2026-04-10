/**
 * PEG SOLITAIRE -- Game Logic
 * English board: cross-shaped 7x7 grid with 33 valid positions.
 * Center starts empty, 32 pegs. Jump over adjacent peg into empty hole.
 */

export const W = 400;
export const H = 700;

/** Board size */
export const GRID_SIZE = 7;

/**
 * The English cross board mask.
 * 1 = valid position, 0 = not part of the board.
 */
const BOARD_MASK = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
];

/** Direction vectors for jumps: [dr, dc] */
const DIRECTIONS = [
  [-2, 0], // up
  [2, 0],  // down
  [0, -2], // left
  [0, 2],  // right
];

/**
 * Check if a position is on the board.
 *
 * @param {number} r - Row
 * @param {number} c - Column
 * @returns {boolean}
 */
function isValid(r, c) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && BOARD_MASK[r][c] === 1;
}

/**
 * Create a fresh game state.
 *
 * @returns {Object} Game state
 */
export function createGameState() {
  // Build the board: 1 = peg, 0 = empty hole, -1 = not on board
  const board = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      if (BOARD_MASK[r][c] === 1) {
        board[r][c] = 1; // peg
      } else {
        board[r][c] = -1; // not on board
      }
    }
  }
  // Center starts empty
  board[3][3] = 0;

  return {
    board,
    selectedPeg: null,       // { r, c } or null
    validMoves: [],          // [{ fromR, fromC, overR, overC, toR, toC }]
    pegsRemaining: 32,
    moveHistory: [],         // [{ fromR, fromC, overR, overC, toR, toC }]
    gameOver: false,
    animation: null,         // { fromR, fromC, toR, toC, overR, overC, progress }
    removeAnimation: null,   // { r, c, progress }
  };
}

/**
 * Get all valid jumps for a specific peg.
 *
 * @param {number[][]} board
 * @param {number} r
 * @param {number} c
 * @returns {Array<{fromR:number, fromC:number, overR:number, overC:number, toR:number, toC:number}>}
 */
export function getMovesForPeg(board, r, c) {
  const moves = [];
  if (board[r][c] !== 1) return moves;

  for (const [dr, dc] of DIRECTIONS) {
    const overR = r + dr / 2;
    const overC = c + dc / 2;
    const toR = r + dr;
    const toC = c + dc;

    if (isValid(toR, toC) && board[overR][overC] === 1 && board[toR][toC] === 0) {
      moves.push({ fromR: r, fromC: c, overR, overC, toR, toC });
    }
  }

  return moves;
}

/**
 * Get all valid moves on the board.
 *
 * @param {number[][]} board
 * @returns {Array}
 */
export function getAllMoves(board) {
  const moves = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 1) {
        moves.push(...getMovesForPeg(board, r, c));
      }
    }
  }
  return moves;
}

/**
 * Execute a jump move on the board.
 *
 * @param {Object} state - Game state
 * @param {Object} move - { fromR, fromC, overR, overC, toR, toC }
 */
export function executeMove(state, move) {
  const { board } = state;
  const { fromR, fromC, overR, overC, toR, toC } = move;

  // Save to history for undo
  state.moveHistory.push({ fromR, fromC, overR, overC, toR, toC });

  board[fromR][fromC] = 0;
  board[overR][overC] = 0;
  board[toR][toC] = 1;
  state.pegsRemaining--;
  state.selectedPeg = null;
  state.validMoves = [];
}

/**
 * Undo the last move.
 *
 * @param {Object} state - Game state
 * @returns {boolean} true if undo was performed
 */
export function undoMove(state) {
  if (state.moveHistory.length === 0) return false;

  const { fromR, fromC, overR, overC, toR, toC } = state.moveHistory.pop();
  const { board } = state;

  board[toR][toC] = 0;
  board[overR][overC] = 1;
  board[fromR][fromC] = 1;
  state.pegsRemaining++;
  state.selectedPeg = null;
  state.validMoves = [];
  state.gameOver = false;

  return true;
}

/**
 * Check if the game is over (no valid moves remaining).
 *
 * @param {number[][]} board
 * @returns {boolean}
 */
export function checkGameOver(board) {
  return getAllMoves(board).length === 0;
}

/**
 * Check if the result is a perfect game (1 peg in center).
 *
 * @param {Object} state
 * @returns {boolean}
 */
export function isPerfect(state) {
  return state.pegsRemaining === 1 && state.board[3][3] === 1;
}

/**
 * Calculate the score: 32 - remaining pegs.
 *
 * @param {Object} state
 * @returns {number}
 */
export function getScore(state) {
  return 32 - state.pegsRemaining;
}
