/**
 * CONNECT FOUR -- Game Engine
 * Pure game logic: board management, win detection, AI opponents.
 */

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;  // Yellow
const AI = 2;      // Red

/**
 * Create an empty board (6 rows x 7 cols, row 0 = top).
 * @returns {number[][]}
 */
export function createBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(EMPTY));
  }
  return board;
}

/**
 * Get list of columns that are not full.
 * @param {number[][]} board
 * @returns {number[]}
 */
export function getValidColumns(board) {
  const valid = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) {
      valid.push(c);
    }
  }
  return valid;
}

/**
 * Drop a disc into the given column. Returns the row it landed in, or -1 if column is full.
 * Mutates the board in place.
 * @param {number[][]} board
 * @param {number} col
 * @param {number} player - PLAYER (1) or AI (2)
 * @returns {number} Row index where disc landed, or -1
 */
export function dropDisc(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = player;
      return r;
    }
  }
  return -1;
}

/**
 * Undo a disc drop (for minimax).
 * @param {number[][]} board
 * @param {number} col
 */
function undoDrop(board, col) {
  for (let r = 0; r < ROWS; r++) {
    if (board[r][col] !== EMPTY) {
      board[r][col] = EMPTY;
      return;
    }
  }
}

/**
 * Check for a winner. Returns { winner, cells } or null.
 * winner: PLAYER (1) or AI (2)
 * cells: array of [row, col] for the winning 4
 * @param {number[][]} board
 * @returns {{ winner: number, cells: number[][] } | null}
 */
export function checkWin(board) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell === EMPTY) continue;

      for (const [dr, dc] of directions) {
        const cells = [[r, c]];
        let valid = true;

        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== cell) {
            valid = false;
            break;
          }
          cells.push([nr, nc]);
        }

        if (valid) {
          return { winner: cell, cells };
        }
      }
    }
  }

  return null;
}

/**
 * Check if the board is full (draw).
 * @param {number[][]} board
 * @returns {boolean}
 */
export function isBoardFull(board) {
  return getValidColumns(board).length === 0;
}

// -- AI Logic --

/**
 * Easy AI: pick a random valid column.
 * @param {number[][]} board
 * @returns {number}
 */
function aiEasy(board) {
  const valid = getValidColumns(board);
  return valid[Math.floor(Math.random() * valid.length)];
}

/**
 * Medium AI: block player's three-in-a-row or win if possible, otherwise random.
 * @param {number[][]} board
 * @returns {number}
 */
function aiMedium(board) {
  const valid = getValidColumns(board);

  // Check if AI can win immediately
  for (const col of valid) {
    dropDisc(board, col, AI);
    if (checkWin(board)) {
      undoDrop(board, col);
      return col;
    }
    undoDrop(board, col);
  }

  // Check if player can win next move and block
  for (const col of valid) {
    dropDisc(board, col, PLAYER);
    if (checkWin(board)) {
      undoDrop(board, col);
      return col;
    }
    undoDrop(board, col);
  }

  // Prefer center column
  if (valid.includes(3)) {
    return 3;
  }

  return valid[Math.floor(Math.random() * valid.length)];
}

/**
 * Score a board position for minimax heuristic.
 * @param {number[][]} board
 * @param {number} player
 * @returns {number}
 */
function scorePosition(board, player) {
  const opp = player === AI ? PLAYER : AI;
  let score = 0;

  // Center column preference
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === player) score += 3;
  }

  // Evaluate all windows of 4
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of directions) {
        const window = [];
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          window.push(board[nr][nc]);
        }
        if (window.length < 4) continue;

        const playerCount = window.filter(v => v === player).length;
        const emptyCount = window.filter(v => v === EMPTY).length;
        const oppCount = window.filter(v => v === opp).length;

        if (playerCount === 4) score += 100;
        else if (playerCount === 3 && emptyCount === 1) score += 5;
        else if (playerCount === 2 && emptyCount === 2) score += 2;

        if (oppCount === 3 && emptyCount === 1) score -= 4;
      }
    }
  }

  return score;
}

/**
 * Minimax with alpha-beta pruning.
 * @param {number[][]} board
 * @param {number} depth
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} isMaximizing
 * @returns {{ score: number, col: number }}
 */
function minimax(board, depth, alpha, beta, isMaximizing) {
  const valid = getValidColumns(board);
  const win = checkWin(board);

  if (win) {
    if (win.winner === AI) return { score: 100000 + depth, col: -1 };
    return { score: -100000 - depth, col: -1 };
  }
  if (valid.length === 0) return { score: 0, col: -1 };
  if (depth === 0) return { score: scorePosition(board, AI), col: -1 };

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestCol = valid[Math.floor(Math.random() * valid.length)];

    for (const col of valid) {
      dropDisc(board, col, AI);
      const result = minimax(board, depth - 1, alpha, beta, false);
      undoDrop(board, col);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }
    return { score: bestScore, col: bestCol };
  } else {
    let bestScore = Infinity;
    let bestCol = valid[Math.floor(Math.random() * valid.length)];

    for (const col of valid) {
      dropDisc(board, col, PLAYER);
      const result = minimax(board, depth - 1, alpha, beta, true);
      undoDrop(board, col);

      if (result.score < bestScore) {
        bestScore = result.score;
        bestCol = col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return { score: bestScore, col: bestCol };
  }
}

/**
 * Hard AI: minimax with alpha-beta pruning, depth 5.
 * @param {number[][]} board
 * @returns {number}
 */
function aiHard(board) {
  const result = minimax(board, 5, -Infinity, Infinity, true);
  return result.col;
}

/**
 * Get the AI's chosen column based on difficulty.
 * @param {number[][]} board
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {number}
 */
export function aiMove(board, difficulty) {
  switch (difficulty) {
    case 'easy': return aiEasy(board);
    case 'medium': return aiMedium(board);
    case 'hard': return aiHard(board);
    default: return aiMedium(board);
  }
}

export { ROWS, COLS, EMPTY, PLAYER, AI };
