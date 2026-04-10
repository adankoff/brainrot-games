/**
 * MEME CHECKERS -- Core Game Logic
 * Board representation, move generation, validation, AI.
 */

// ---- Constants ----

export const EMPTY = 0;
export const RED = 1;        // Player
export const BLACK = 2;      // AI
export const RED_KING = 3;
export const BLACK_KING = 4;

export const BOARD_SIZE = 8;

// ---- Board Setup ----

/**
 * Create a fresh 8x8 board with pieces in starting positions.
 * board[row][col] -- row 0 = top (AI side), row 7 = bottom (player side).
 *
 * @returns {number[][]}
 */
export function createBoard() {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = BLACK;
        } else if (r > 4) {
          board[r][c] = RED;
        } else {
          board[r][c] = EMPTY;
        }
      } else {
        board[r][c] = EMPTY;
      }
    }
  }
  return board;
}

/**
 * Create a new game state object.
 *
 * @returns {Object}
 */
export function createGame() {
  return {
    board: createBoard(),
    turn: RED,               // RED always goes first
    selectedPiece: null,     // { row, col }
    validMoves: [],          // [{ row, col, jumps: [{row, col}] }]
    score: 0,
    redCaptured: 0,          // black pieces captured by red
    blackCaptured: 0,        // red pieces captured by black
    redKings: 0,
    blackKings: 0,
    gameOver: false,
    winner: null,
    mustJumpFrom: null,      // { row, col } -- for multi-jump continuation
    message: '',
  };
}

// ---- Piece Helpers ----

/**
 * @param {number} piece
 * @returns {boolean}
 */
export function isRed(piece) {
  return piece === RED || piece === RED_KING;
}

/**
 * @param {number} piece
 * @returns {boolean}
 */
export function isBlack(piece) {
  return piece === BLACK || piece === BLACK_KING;
}

/**
 * @param {number} piece
 * @returns {boolean}
 */
export function isKing(piece) {
  return piece === RED_KING || piece === BLACK_KING;
}

/**
 * @param {number} piece
 * @returns {number} RED or BLACK
 */
export function pieceColor(piece) {
  if (isRed(piece)) return RED;
  if (isBlack(piece)) return BLACK;
  return EMPTY;
}

/**
 * Check if a piece belongs to the given side.
 *
 * @param {number} piece
 * @param {number} side - RED or BLACK
 * @returns {boolean}
 */
export function belongsTo(piece, side) {
  if (side === RED) return isRed(piece);
  if (side === BLACK) return isBlack(piece);
  return false;
}

/**
 * Check if position is within board bounds.
 */
function inBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// ---- Move Generation ----

/**
 * Get forward directions for a piece based on its color and king status.
 *
 * @param {number} piece
 * @returns {number[][]} Array of [dr, dc] pairs
 */
function getDirections(piece) {
  const dirs = [];
  // Red moves up (decreasing row), Black moves down (increasing row)
  if (piece === RED || piece === RED_KING || piece === BLACK_KING) {
    dirs.push([-1, -1], [-1, 1]);
  }
  if (piece === BLACK || piece === BLACK_KING || piece === RED_KING) {
    dirs.push([1, -1], [1, 1]);
  }
  return dirs;
}

/**
 * Find all simple (non-jump) moves for a piece at (r, c).
 *
 * @param {number[][]} board
 * @param {number} r
 * @param {number} c
 * @returns {{ row: number, col: number, jumps: Array }[]}
 */
function getSimpleMoves(board, r, c) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];

  const moves = [];
  const dirs = getDirections(piece);

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === EMPTY) {
      moves.push({ row: nr, col: nc, jumps: [] });
    }
  }
  return moves;
}

/**
 * Find all jump sequences for a piece at (r, c).
 * Supports multi-jumps recursively.
 *
 * @param {number[][]} board
 * @param {number} r
 * @param {number} c
 * @param {number} piece - The piece type (may differ from board if mid-jump)
 * @param {Set<string>} [visited] - Already-jumped positions (prevent re-jumping same piece)
 * @returns {{ row: number, col: number, jumps: { row: number, col: number }[] }[]}
 */
function getJumpMoves(board, r, c, piece, visited = new Set()) {
  const dirs = getDirections(piece);
  const side = pieceColor(piece);
  const results = [];

  for (const [dr, dc] of dirs) {
    const midR = r + dr;
    const midC = c + dc;
    const landR = r + dr * 2;
    const landC = c + dc * 2;

    if (!inBounds(landR, landC)) continue;
    if (board[midR][midC] === EMPTY) continue;
    if (belongsTo(board[midR][midC], side)) continue;
    if (board[landR][landC] !== EMPTY) continue;

    const midKey = `${midR},${midC}`;
    if (visited.has(midKey)) continue;

    // Valid jump found
    const newVisited = new Set(visited);
    newVisited.add(midKey);

    // Check if piece would be kinged at landing
    let landPiece = piece;
    if (piece === RED && landR === 0) landPiece = RED_KING;
    if (piece === BLACK && landR === BOARD_SIZE - 1) landPiece = BLACK_KING;

    // Temporarily modify board for recursive search
    const origMid = board[midR][midC];
    const origLand = board[landR][landC];
    const origStart = board[r][c];

    board[midR][midC] = EMPTY;
    board[landR][landC] = landPiece;
    board[r][c] = EMPTY;

    // Look for further jumps from the landing position
    const furtherJumps = getJumpMoves(board, landR, landC, landPiece, newVisited);

    // Restore board
    board[r][c] = origStart;
    board[midR][midC] = origMid;
    board[landR][landC] = origLand;

    if (furtherJumps.length > 0) {
      // Extend each further jump path with this jump prepended
      for (const fj of furtherJumps) {
        results.push({
          row: fj.row,
          col: fj.col,
          jumps: [{ row: midR, col: midC }, ...fj.jumps],
        });
      }
    } else {
      // Terminal jump
      results.push({
        row: landR,
        col: landC,
        jumps: [{ row: midR, col: midC }],
      });
    }
  }

  return results;
}

/**
 * Get all valid moves for a specific piece.
 * If jumps are available, only jumps are returned (mandatory capture).
 *
 * @param {number[][]} board
 * @param {number} r
 * @param {number} c
 * @param {boolean} [jumpsOnly=false] - Only return jump moves
 * @returns {{ row: number, col: number, jumps: Array }[]}
 */
export function getMovesForPiece(board, r, c, jumpsOnly = false) {
  const piece = board[r][c];
  if (piece === EMPTY) return [];

  const jumps = getJumpMoves(board, r, c, piece);
  if (jumps.length > 0) return jumps;
  if (jumpsOnly) return [];

  return getSimpleMoves(board, r, c);
}

/**
 * Get all valid moves for a side.
 * If any piece can jump, ALL moves must be jumps (mandatory capture rule).
 *
 * @param {number[][]} board
 * @param {number} side - RED or BLACK
 * @returns {{ fromRow: number, fromCol: number, row: number, col: number, jumps: Array }[]}
 */
export function getAllMoves(board, side) {
  let allJumps = [];
  let allSimple = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!belongsTo(board[r][c], side)) continue;

      const jumps = getJumpMoves(board, r, c, board[r][c]);
      for (const m of jumps) {
        allJumps.push({ fromRow: r, fromCol: c, ...m });
      }

      const simple = getSimpleMoves(board, r, c);
      for (const m of simple) {
        allSimple.push({ fromRow: r, fromCol: c, ...m });
      }
    }
  }

  // Mandatory capture: if jumps exist, only jumps are allowed
  return allJumps.length > 0 ? allJumps : allSimple;
}

/**
 * Check if a side has any jumps available.
 *
 * @param {number[][]} board
 * @param {number} side
 * @returns {boolean}
 */
export function hasJumpsAvailable(board, side) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!belongsTo(board[r][c], side)) continue;
      if (getJumpMoves(board, r, c, board[r][c]).length > 0) return true;
    }
  }
  return false;
}

// ---- Move Execution ----

/**
 * Execute a move on the board. Returns captured positions.
 *
 * @param {number[][]} board
 * @param {number} fromR
 * @param {number} fromC
 * @param {number} toR
 * @param {number} toC
 * @param {{ row: number, col: number }[]} jumps - Captured piece positions
 * @returns {{ captured: number, kinged: boolean }}
 */
export function executeMove(board, fromR, fromC, toR, toC, jumps) {
  const piece = board[fromR][fromC];
  board[fromR][fromC] = EMPTY;

  let captured = 0;
  for (const j of jumps) {
    if (board[j.row][j.col] !== EMPTY) {
      board[j.row][j.col] = EMPTY;
      captured++;
    }
  }

  // Check for king promotion
  let kinged = false;
  let finalPiece = piece;
  if (piece === RED && toR === 0) {
    finalPiece = RED_KING;
    kinged = true;
  } else if (piece === BLACK && toR === BOARD_SIZE - 1) {
    finalPiece = BLACK_KING;
    kinged = true;
  }

  board[toR][toC] = finalPiece;
  return { captured, kinged };
}

// ---- Win Detection ----

/**
 * Check if the game is over. Returns the winner or null.
 *
 * @param {number[][]} board
 * @param {number} currentTurn - Whose turn it is NEXT
 * @returns {number|null} RED, BLACK, or null if game continues
 */
export function checkWinner(board, currentTurn) {
  let redCount = 0;
  let blackCount = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isRed(board[r][c])) redCount++;
      if (isBlack(board[r][c])) blackCount++;
    }
  }

  if (redCount === 0) return BLACK;
  if (blackCount === 0) return RED;

  // Check if current player has any moves
  const moves = getAllMoves(board, currentTurn);
  if (moves.length === 0) {
    // Current player can't move -- opponent wins
    return currentTurn === RED ? BLACK : RED;
  }

  return null;
}

// ---- AI ----

/**
 * Deep clone a board.
 *
 * @param {number[][]} board
 * @returns {number[][]}
 */
function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * Count pieces for evaluation.
 *
 * @param {number[][]} board
 * @returns {{ red: number, black: number, redKings: number, blackKings: number }}
 */
function countPieces(board) {
  let red = 0, black = 0, redKings = 0, blackKings = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p === RED) red++;
      else if (p === RED_KING) redKings++;
      else if (p === BLACK) black++;
      else if (p === BLACK_KING) blackKings++;
    }
  }
  return { red, black, redKings, blackKings };
}

/**
 * Evaluate board from BLACK's perspective (AI).
 * Positive = good for AI, negative = good for player.
 *
 * @param {number[][]} board
 * @returns {number}
 */
function evaluateBoard(board) {
  const counts = countPieces(board);
  let score = 0;

  // Material
  score += (counts.black - counts.red) * 100;
  score += (counts.blackKings - counts.redKings) * 150;

  // Positional bonuses
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p === EMPTY) continue;

      if (p === BLACK) {
        // Advance bonus -- further down is better
        score += r * 5;
        // Center control
        if (c >= 2 && c <= 5) score += 3;
      } else if (p === BLACK_KING) {
        // Center control for kings
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score += 8;
      } else if (p === RED) {
        // Advance bonus for red (moves up)
        score -= (BOARD_SIZE - 1 - r) * 5;
        if (c >= 2 && c <= 5) score -= 3;
      } else if (p === RED_KING) {
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score -= 8;
      }
    }
  }

  // Back row defense
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (isBlack(board[0][c])) score += 5;
    if (isRed(board[BOARD_SIZE - 1][c])) score -= 5;
  }

  return score;
}

/**
 * Minimax with alpha-beta pruning.
 *
 * @param {number[][]} board
 * @param {number} depth
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} isMaximizing - true = AI (BLACK) turn
 * @returns {number}
 */
function minimax(board, depth, alpha, beta, isMaximizing) {
  const side = isMaximizing ? BLACK : RED;
  const winner = checkWinner(board, side);

  if (winner === BLACK) return 10000 + depth;
  if (winner === RED) return -10000 - depth;
  if (depth === 0) return evaluateBoard(board);

  const moves = getAllMoves(board, side);
  if (moves.length === 0) {
    return isMaximizing ? -10000 : 10000;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const boardCopy = cloneBoard(board);
      executeMove(boardCopy, move.fromRow, move.fromCol, move.row, move.col, move.jumps);
      const eval_ = minimax(boardCopy, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const boardCopy = cloneBoard(board);
      executeMove(boardCopy, move.fromRow, move.fromCol, move.row, move.col, move.jumps);
      const eval_ = minimax(boardCopy, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * AI move selection based on difficulty.
 *
 * @param {number[][]} board
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {{ fromRow: number, fromCol: number, row: number, col: number, jumps: Array }|null}
 */
export function getAIMove(board, difficulty) {
  const moves = getAllMoves(board, BLACK);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    // Random valid move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    // Prioritize: multi-jumps > single jumps > king-making moves > random
    const jumpMoves = moves.filter(m => m.jumps.length > 0);
    if (jumpMoves.length > 0) {
      // Pick the jump that captures the most pieces
      jumpMoves.sort((a, b) => b.jumps.length - a.jumps.length);
      // Among best jumps, pick randomly for variety
      const bestCount = jumpMoves[0].jumps.length;
      const bestJumps = jumpMoves.filter(m => m.jumps.length === bestCount);
      return bestJumps[Math.floor(Math.random() * bestJumps.length)];
    }

    // Prefer moves that make kings
    const kingMoves = moves.filter(m => {
      const piece = board[m.fromRow][m.fromCol];
      return piece === BLACK && m.row === BOARD_SIZE - 1;
    });
    if (kingMoves.length > 0) {
      return kingMoves[Math.floor(Math.random() * kingMoves.length)];
    }

    // Prefer advancing pieces
    moves.sort((a, b) => b.row - a.row);
    // Some randomness: pick from top 3
    const top = moves.slice(0, Math.min(3, moves.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  if (difficulty === 'hard') {
    // Minimax depth 4
    let bestMove = moves[0];
    let bestEval = -Infinity;

    for (const move of moves) {
      const boardCopy = cloneBoard(board);
      executeMove(boardCopy, move.fromRow, move.fromCol, move.row, move.col, move.jumps);
      const eval_ = minimax(boardCopy, 3, -Infinity, Infinity, false);
      if (eval_ > bestEval) {
        bestEval = eval_;
        bestMove = move;
      }
    }
    return bestMove;
  }

  return moves[0];
}
