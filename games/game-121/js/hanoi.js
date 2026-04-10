/**
 * TOWER OF HANOI -- Game Logic
 * Pure game state: pegs, discs, move validation, win detection.
 */

/**
 * @typedef {Object} HanoiState
 * @property {number[][]} pegs - Array of 3 pegs, each containing disc sizes (bottom to top)
 * @property {number} numDiscs - Total number of discs
 * @property {number} moves - Number of moves made
 * @property {number} optimalMoves - Minimum moves for this puzzle (2^n - 1)
 * @property {number|null} selectedPeg - Index of peg with lifted disc, or null
 * @property {boolean} won - Whether puzzle is solved
 */

/**
 * Create a fresh Hanoi game state.
 *
 * @param {number} numDiscs - Number of discs (3, 5, or 7)
 * @returns {HanoiState}
 */
export function createGame(numDiscs) {
  // Peg 0 gets all discs, largest (numDiscs) at bottom, smallest (1) at top
  const peg0 = [];
  for (let i = numDiscs; i >= 1; i--) {
    peg0.push(i);
  }

  return {
    pegs: [peg0, [], []],
    numDiscs,
    moves: 0,
    optimalMoves: Math.pow(2, numDiscs) - 1,
    selectedPeg: null,
    won: false,
  };
}

/**
 * Get the top disc on a peg without removing it.
 *
 * @param {HanoiState} state
 * @param {number} pegIndex
 * @returns {number|null} Disc size, or null if peg is empty
 */
export function peekDisc(state, pegIndex) {
  const peg = state.pegs[pegIndex];
  if (peg.length === 0) return null;
  return peg[peg.length - 1];
}

/**
 * Select a peg to pick up the top disc. Returns true if a disc was picked up.
 *
 * @param {HanoiState} state
 * @param {number} pegIndex
 * @returns {boolean}
 */
export function selectPeg(state, pegIndex) {
  if (state.won) return false;
  if (state.pegs[pegIndex].length === 0) return false;

  state.selectedPeg = pegIndex;
  return true;
}

/**
 * Attempt to place the selected disc on a target peg.
 * Returns 'placed', 'invalid', or 'cancelled'.
 *
 * @param {HanoiState} state
 * @param {number} targetPeg
 * @returns {'placed'|'invalid'|'cancelled'}
 */
export function placeToPeg(state, targetPeg) {
  if (state.selectedPeg === null) return 'cancelled';
  if (state.won) return 'cancelled';

  const sourcePeg = state.selectedPeg;

  // Tapping the same peg cancels the selection
  if (targetPeg === sourcePeg) {
    state.selectedPeg = null;
    return 'cancelled';
  }

  const disc = peekDisc(state, sourcePeg);
  const topDisc = peekDisc(state, targetPeg);

  // Valid move: target is empty or top disc is larger
  if (topDisc === null || disc < topDisc) {
    state.pegs[sourcePeg].pop();
    state.pegs[targetPeg].push(disc);
    state.selectedPeg = null;
    state.moves++;

    // Check win: all discs on peg 2 (rightmost)
    if (state.pegs[2].length === state.numDiscs) {
      state.won = true;
    }

    return 'placed';
  }

  // Invalid move: disc is larger than target's top disc
  state.selectedPeg = null;
  return 'invalid';
}

/**
 * Calculate score based on moves vs optimal.
 *
 * @param {HanoiState} state
 * @returns {number}
 */
export function calculateScore(state) {
  const penalty = (state.moves - state.optimalMoves) * 50;
  return Math.max(1000 - penalty, 100);
}
