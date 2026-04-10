/**
 * MEME MANCALA -- Game Logic (Kalah Rules)
 *
 * Board layout (indices):
 *   [13] [12] [11] [10] [9]  [8]     <- AI pits (top row, displayed left-to-right)
 * [7]                           [0]   <- AI store (left) / Player store (right)
 *   [1]  [2]  [3]  [4]  [5]  [6]     <- Player pits (bottom row)
 *
 * Index 0  = Player store (right mancala)
 * Index 7  = AI store (left mancala)
 * Indices 1-6  = Player pits (bottom, left to right)
 * Indices 8-13 = AI pits (top, right to left as laid on board)
 */

/** Total pits + stores */
const BOARD_SIZE = 14;

/** Number of pits per side */
export const PITS_PER_SIDE = 6;

/** Starting stones per pit */
export const INITIAL_STONES = 4;

/** Index constants */
export const PLAYER_STORE = 0;
export const AI_STORE = 7;
export const PLAYER_PITS_START = 1;
export const PLAYER_PITS_END = 6;
export const AI_PITS_START = 8;
export const AI_PITS_END = 13;

/**
 * Stone colors -- randomly assigned at game start
 */
export const STONE_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
];

/**
 * @typedef {'player'|'ai'} Player
 *
 * @typedef {Object} SowStep
 * @property {number} pit - The pit index a stone was dropped into
 * @property {number} stoneColorIndex - Color index for this stone
 *
 * @typedef {Object} SowResult
 * @property {SowStep[]} steps - Each stone drop in sequence
 * @property {boolean} extraTurn - True if last stone landed in own store
 * @property {boolean} capture - True if a capture occurred
 * @property {number} capturedFrom - Opposite pit index if capture happened
 * @property {number} capturedCount - Number of stones captured from opposite pit
 * @property {number} lastPit - The pit the last stone landed in
 */

export class MancalaGame {
  constructor() {
    /** @type {number[]} Board array: stones in each pit/store */
    this.board = new Array(BOARD_SIZE).fill(0);

    /** @type {number[][]} Stone color indices per pit */
    this.stoneColors = Array.from({ length: BOARD_SIZE }, () => []);

    /** @type {Player} Whose turn it is */
    this.currentPlayer = 'player';

    /** @type {boolean} */
    this.gameOver = false;

    /** @type {string|null} 'player' | 'ai' | 'tie' */
    this.winner = null;

    this._init();
  }

  _init() {
    this.board.fill(0);
    this.stoneColors = Array.from({ length: BOARD_SIZE }, () => []);

    // Fill player pits (1-6) and AI pits (8-13)
    for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
      this.board[i] = INITIAL_STONES;
      this._assignRandomColors(i, INITIAL_STONES);
    }
    for (let i = AI_PITS_START; i <= AI_PITS_END; i++) {
      this.board[i] = INITIAL_STONES;
      this._assignRandomColors(i, INITIAL_STONES);
    }
  }

  _assignRandomColors(pit, count) {
    this.stoneColors[pit] = [];
    for (let i = 0; i < count; i++) {
      this.stoneColors[pit].push(Math.floor(Math.random() * STONE_COLORS.length));
    }
  }

  /**
   * Reset the game to initial state.
   */
  reset() {
    this.currentPlayer = 'player';
    this.gameOver = false;
    this.winner = null;
    this._init();
  }

  /**
   * Check if a pit is a valid move for the given player.
   */
  isValidMove(pitIndex, player) {
    if (this.gameOver) return false;
    if (player === 'player') {
      return pitIndex >= PLAYER_PITS_START && pitIndex <= PLAYER_PITS_END && this.board[pitIndex] > 0;
    } else {
      return pitIndex >= AI_PITS_START && pitIndex <= AI_PITS_END && this.board[pitIndex] > 0;
    }
  }

  /**
   * Get all valid pit indices for a player.
   */
  getValidMoves(player) {
    const moves = [];
    const start = player === 'player' ? PLAYER_PITS_START : AI_PITS_START;
    const end = player === 'player' ? PLAYER_PITS_END : AI_PITS_END;
    for (let i = start; i <= end; i++) {
      if (this.board[i] > 0) moves.push(i);
    }
    return moves;
  }

  /**
   * Execute a sow move. Returns detailed step-by-step result.
   *
   * @param {number} pitIndex
   * @returns {SowResult}
   */
  sow(pitIndex) {
    const player = this.currentPlayer;
    if (!this.isValidMove(pitIndex, player)) {
      return null;
    }

    const skipStore = player === 'player' ? AI_STORE : PLAYER_STORE;
    let stones = this.board[pitIndex];
    const colors = [...this.stoneColors[pitIndex]];
    this.board[pitIndex] = 0;
    this.stoneColors[pitIndex] = [];

    const steps = [];
    let current = pitIndex;

    for (let i = 0; i < stones; i++) {
      current = (current + 1) % BOARD_SIZE;
      // Skip opponent's store
      if (current === skipStore) {
        current = (current + 1) % BOARD_SIZE;
      }
      this.board[current]++;
      const colorIdx = colors[i] !== undefined ? colors[i] : Math.floor(Math.random() * STONE_COLORS.length);
      this.stoneColors[current].push(colorIdx);
      steps.push({ pit: current, stoneColorIndex: colorIdx });
    }

    const lastPit = current;
    let extraTurn = false;
    let capture = false;
    let capturedFrom = -1;
    let capturedCount = 0;

    // Extra turn: last stone in own store
    const ownStore = player === 'player' ? PLAYER_STORE : AI_STORE;
    if (lastPit === ownStore) {
      extraTurn = true;
    }

    // Capture: last stone in empty pit on own side, opposite has stones
    if (!extraTurn && this.board[lastPit] === 1) {
      const isOwnSide = player === 'player'
        ? (lastPit >= PLAYER_PITS_START && lastPit <= PLAYER_PITS_END)
        : (lastPit >= AI_PITS_START && lastPit <= AI_PITS_END);

      if (isOwnSide) {
        const opposite = 14 - lastPit;
        if (this.board[opposite] > 0) {
          capture = true;
          capturedFrom = opposite;
          capturedCount = this.board[opposite];

          // Move captured stones + the landing stone to own store
          this.board[ownStore] += this.board[opposite] + 1;
          // Transfer colors
          this.stoneColors[ownStore].push(...this.stoneColors[opposite], ...this.stoneColors[lastPit]);
          this.board[opposite] = 0;
          this.stoneColors[opposite] = [];
          this.board[lastPit] = 0;
          this.stoneColors[lastPit] = [];
        }
      }
    }

    // Check game end
    this._checkGameEnd();

    // Switch turn if no extra turn and game not over
    if (!extraTurn && !this.gameOver) {
      this.currentPlayer = player === 'player' ? 'ai' : 'player';
    }

    return { steps, extraTurn, capture, capturedFrom, capturedCount, lastPit };
  }

  /**
   * Check if the game is over (one side empty).
   */
  _checkGameEnd() {
    let playerEmpty = true;
    let aiEmpty = true;

    for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
      if (this.board[i] > 0) { playerEmpty = false; break; }
    }
    for (let i = AI_PITS_START; i <= AI_PITS_END; i++) {
      if (this.board[i] > 0) { aiEmpty = false; break; }
    }

    if (playerEmpty || aiEmpty) {
      this.gameOver = true;

      // Sweep remaining stones to respective stores
      for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
        this.board[PLAYER_STORE] += this.board[i];
        this.stoneColors[PLAYER_STORE].push(...this.stoneColors[i]);
        this.board[i] = 0;
        this.stoneColors[i] = [];
      }
      for (let i = AI_PITS_START; i <= AI_PITS_END; i++) {
        this.board[AI_STORE] += this.board[i];
        this.stoneColors[AI_STORE].push(...this.stoneColors[i]);
        this.board[i] = 0;
        this.stoneColors[i] = [];
      }

      if (this.board[PLAYER_STORE] > this.board[AI_STORE]) {
        this.winner = 'player';
      } else if (this.board[AI_STORE] > this.board[PLAYER_STORE]) {
        this.winner = 'ai';
      } else {
        this.winner = 'tie';
      }
    }
  }

  /**
   * Clone the game state (for AI search).
   */
  clone() {
    const copy = new MancalaGame();
    copy.board = [...this.board];
    copy.stoneColors = this.stoneColors.map(arr => [...arr]);
    copy.currentPlayer = this.currentPlayer;
    copy.gameOver = this.gameOver;
    copy.winner = this.winner;
    return copy;
  }

  // ============================
  // AI
  // ============================

  /**
   * Get AI move based on difficulty.
   *
   * @param {'easy'|'medium'|'hard'} difficulty
   * @returns {number} Pit index to play
   */
  getAIMove(difficulty) {
    const moves = this.getValidMoves('ai');
    if (moves.length === 0) return -1;

    switch (difficulty) {
      case 'easy':
        return this._aiEasy(moves);
      case 'medium':
        return this._aiMedium(moves);
      case 'hard':
        return this._aiHard(moves);
      default:
        return this._aiEasy(moves);
    }
  }

  /** Easy: random valid move */
  _aiEasy(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /** Medium: maximize immediate store gain, prefer extra turns */
  _aiMedium(moves) {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const sim = this.clone();
      const result = sim.sow(move);
      if (!result) continue;

      let score = sim.board[AI_STORE] - this.board[AI_STORE];
      if (result.extraTurn) score += 4;
      if (result.capture) score += result.capturedCount;

      // Small random tiebreaker
      score += Math.random() * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  /** Hard: minimax with alpha-beta pruning, depth 6 */
  _aiHard(moves) {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const sim = this.clone();
      sim.sow(move);
      // If extra turn, AI plays again so maximize; otherwise opponent minimizes
      const isMaximizing = sim.currentPlayer === 'ai';
      const score = this._minimax(sim, 5, -Infinity, Infinity, isMaximizing);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  /**
   * Minimax with alpha-beta pruning.
   */
  _minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.gameOver) {
      return game.board[AI_STORE] - game.board[PLAYER_STORE];
    }

    const player = isMaximizing ? 'ai' : 'player';
    const moves = game.getValidMoves(player);

    if (moves.length === 0) {
      return game.board[AI_STORE] - game.board[PLAYER_STORE];
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const sim = game.clone();
        sim.sow(move);
        const nextMax = sim.currentPlayer === 'ai';
        const evalScore = this._minimax(sim, depth - 1, alpha, beta, nextMax);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const sim = game.clone();
        sim.sow(move);
        const nextMax = sim.currentPlayer === 'ai';
        const evalScore = this._minimax(sim, depth - 1, alpha, beta, nextMax);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}
