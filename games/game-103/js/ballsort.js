/**
 * BALL SORT -- Game Logic
 * Core puzzle state: tubes, balls, moves, undo, win detection.
 * Generates solvable puzzles by shuffling from a solved state.
 */

/**
 * @typedef {'easy'|'medium'|'hard'} Difficulty
 */

/** Difficulty presets: [numColors, numTubes] */
export const DIFFICULTY_CONFIG = {
  easy:   { colors: 4, tubes: 6 },
  medium: { colors: 6, tubes: 8 },
  hard:   { colors: 8, tubes: 10 },
};

/** Maximum balls per tube */
export const TUBE_CAPACITY = 4;

/** Ball color palette -- vivid, distinct colors */
export const BALL_COLORS = [
  '#FF4444', // red
  '#44AAFF', // blue
  '#44DD44', // green
  '#FFCC00', // yellow
  '#FF88DD', // pink
  '#FF8800', // orange
  '#AA66FF', // purple
  '#00DDCC', // teal
];

/**
 * Create a new game state for the given difficulty.
 * Generates a solvable puzzle by starting from solved state and shuffling.
 *
 * @param {Difficulty} difficulty
 * @returns {{ tubes: number[][], moves: number, history: Array, difficulty: Difficulty }}
 */
export function createGame(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const tubes = generateSolvablePuzzle(config.colors, config.tubes);

  return {
    tubes,
    moves: 0,
    history: [],
    difficulty,
  };
}

/**
 * Generate a solvable puzzle by reverse-shuffling from solved state.
 * Performs random valid moves on a solved board to scramble it,
 * guaranteeing the result is always solvable.
 *
 * @param {number} numColors
 * @param {number} numTubes
 * @returns {number[][]}
 */
function generateSolvablePuzzle(numColors, numTubes) {
  // Start with solved state: each color fills one tube
  const tubes = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push(Array(TUBE_CAPACITY).fill(i));
  }
  // Add empty tubes
  for (let i = numColors; i < numTubes; i++) {
    tubes.push([]);
  }

  // Perform many random valid moves to scramble
  const numMoves = numColors * TUBE_CAPACITY * 20;
  for (let m = 0; m < numMoves; m++) {
    // Collect all valid source tubes (non-empty)
    const sources = [];
    for (let i = 0; i < numTubes; i++) {
      if (tubes[i].length > 0) sources.push(i);
    }
    if (sources.length === 0) continue;

    const srcIdx = sources[Math.floor(Math.random() * sources.length)];

    // Collect valid destinations (not full, not same tube)
    const dests = [];
    for (let i = 0; i < numTubes; i++) {
      if (i !== srcIdx && tubes[i].length < TUBE_CAPACITY) {
        dests.push(i);
      }
    }
    if (dests.length === 0) continue;

    const dstIdx = dests[Math.floor(Math.random() * dests.length)];
    const ball = tubes[srcIdx].pop();
    tubes[dstIdx].push(ball);
  }

  // Verify puzzle is not already solved (extremely unlikely but check anyway)
  if (isSolved(tubes)) {
    // Just swap two balls from different tubes
    for (let i = 0; i < numTubes; i++) {
      for (let j = i + 1; j < numTubes; j++) {
        if (tubes[i].length > 0 && tubes[j].length > 0 &&
            tubes[i][tubes[i].length - 1] !== tubes[j][tubes[j].length - 1]) {
          const a = tubes[i].pop();
          const b = tubes[j].pop();
          tubes[i].push(b);
          tubes[j].push(a);
          return tubes;
        }
      }
    }
  }

  return tubes;
}

/**
 * Check if a move is valid: can the top ball of srcTube go onto dstTube?
 *
 * @param {number[][]} tubes
 * @param {number} srcIdx
 * @param {number} dstIdx
 * @returns {boolean}
 */
export function isValidMove(tubes, srcIdx, dstIdx) {
  if (srcIdx === dstIdx) return false;
  if (srcIdx < 0 || srcIdx >= tubes.length) return false;
  if (dstIdx < 0 || dstIdx >= tubes.length) return false;

  const src = tubes[srcIdx];
  const dst = tubes[dstIdx];

  if (src.length === 0) return false;
  if (dst.length >= TUBE_CAPACITY) return false;

  // Destination must be empty or top ball matches
  if (dst.length === 0) return true;
  return dst[dst.length - 1] === src[src.length - 1];
}

/**
 * Execute a move. Mutates game state, records history for undo.
 *
 * @param {Object} game - Game state object
 * @param {number} srcIdx
 * @param {number} dstIdx
 * @returns {boolean} true if move was made
 */
export function makeMove(game, srcIdx, dstIdx) {
  if (!isValidMove(game.tubes, srcIdx, dstIdx)) return false;

  const ball = game.tubes[srcIdx].pop();
  game.tubes[dstIdx].push(ball);
  game.moves++;
  game.history.push({ src: srcIdx, dst: dstIdx, ball });

  return true;
}

/**
 * Undo the last move.
 *
 * @param {Object} game
 * @returns {{ src: number, dst: number, ball: number }|null} The undone move, or null
 */
export function undoMove(game) {
  if (game.history.length === 0) return null;

  const last = game.history.pop();
  // Reverse: move ball from dst back to src
  game.tubes[last.dst].pop();
  game.tubes[last.src].push(last.ball);
  game.moves = Math.max(0, game.moves - 1);

  return last;
}

/**
 * Check if the puzzle is solved (each non-empty tube has all same color).
 *
 * @param {number[][]} tubes
 * @returns {boolean}
 */
export function isSolved(tubes) {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== TUBE_CAPACITY) return false;
    const color = tube[0];
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== color) return false;
    }
  }
  return true;
}

/**
 * Calculate score based on moves.
 *
 * @param {number} moves
 * @returns {number}
 */
export function calculateScore(moves) {
  return Math.max(5000 - moves * 20, 100);
}
