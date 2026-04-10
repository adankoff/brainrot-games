/**
 * MEME TAC TOE -- Tic-Tac-Toe Engine
 * Pure game logic: board state, win/draw detection, AI strategies.
 */

/** @typedef {'X'|'O'|null} Cell */
/** @typedef {'easy'|'medium'|'hard'} Difficulty */

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export class TicTacToe {
  constructor() {
    /** @type {Cell[]} */
    this.board = new Array(9).fill(null);

    /** @type {'X'|'O'} */
    this.currentPlayer = 'X';

    /** @type {'playing'|'win-x'|'win-o'|'draw'} */
    this.status = 'playing';

    /** @type {number[]|null} Indices of the winning line */
    this.winLine = null;
  }

  /**
   * Reset the board for a new round.
   */
  reset() {
    this.board.fill(null);
    this.currentPlayer = 'X';
    this.status = 'playing';
    this.winLine = null;
  }

  /**
   * Place a mark at the given cell index.
   *
   * @param {number} index - Board cell 0-8
   * @returns {boolean} true if move was valid
   */
  makeMove(index) {
    if (this.status !== 'playing') return false;
    if (index < 0 || index > 8) return false;
    if (this.board[index] !== null) return false;

    this.board[index] = this.currentPlayer;
    this._checkEnd();

    if (this.status === 'playing') {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    return true;
  }

  /**
   * Check for win or draw after a move.
   */
  _checkEnd() {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (
        this.board[a] !== null &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.status = this.board[a] === 'X' ? 'win-x' : 'win-o';
        this.winLine = line;
        return;
      }
    }

    if (this.board.every((cell) => cell !== null)) {
      this.status = 'draw';
    }
  }

  /**
   * Get available cell indices.
   *
   * @returns {number[]}
   */
  getEmpty() {
    const empty = [];
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) empty.push(i);
    }
    return empty;
  }

  /**
   * AI: pick a move for the given difficulty.
   *
   * @param {Difficulty} difficulty
   * @returns {number} Cell index to play
   */
  getAIMove(difficulty) {
    switch (difficulty) {
      case 'easy':
        return this._aiEasy();
      case 'medium':
        return this._aiMedium();
      case 'hard':
        return this._aiHard();
      default:
        return this._aiEasy();
    }
  }

  /**
   * Easy AI: random empty cell.
   */
  _aiEasy() {
    const empty = this.getEmpty();
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /**
   * Medium AI: block player wins, then take wins, then random.
   */
  _aiMedium() {
    // Try to win
    const winMove = this._findWinningMove('O');
    if (winMove !== -1) return winMove;

    // Block player win
    const blockMove = this._findWinningMove('X');
    if (blockMove !== -1) return blockMove;

    // Take center if available
    if (this.board[4] === null) return 4;

    // Random
    return this._aiEasy();
  }

  /**
   * Hard AI: minimax (unbeatable).
   */
  _aiHard() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (const i of this.getEmpty()) {
      this.board[i] = 'O';
      const score = this._minimax(false, -Infinity, Infinity);
      this.board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    return bestMove;
  }

  /**
   * Minimax with alpha-beta pruning.
   *
   * @param {boolean} isMaximizing - true if O's turn (maximizing)
   * @param {number} alpha
   * @param {number} beta
   * @returns {number} Score: +10 O wins, -10 X wins, 0 draw
   */
  _minimax(isMaximizing, alpha, beta) {
    // Check terminal state
    const winner = this._checkWinner();
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (this.getEmpty().length === 0) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (const i of this.getEmpty()) {
        this.board[i] = 'O';
        best = Math.max(best, this._minimax(false, alpha, beta));
        this.board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const i of this.getEmpty()) {
        this.board[i] = 'X';
        best = Math.min(best, this._minimax(true, alpha, beta));
        this.board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  /**
   * Check if there is a winner on the current board (used by minimax).
   *
   * @returns {'X'|'O'|null}
   */
  _checkWinner() {
    for (const [a, b, c] of WIN_LINES) {
      if (
        this.board[a] !== null &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return this.board[a];
      }
    }
    return null;
  }

  /**
   * Find a move that would give `player` an immediate win.
   *
   * @param {'X'|'O'} player
   * @returns {number} Cell index, or -1 if none
   */
  _findWinningMove(player) {
    for (const i of this.getEmpty()) {
      this.board[i] = player;
      if (this._checkWinner() === player) {
        this.board[i] = null;
        return i;
      }
      this.board[i] = null;
    }
    return -1;
  }
}
