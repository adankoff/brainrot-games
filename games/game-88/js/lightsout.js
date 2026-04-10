/**
 * Lights Out -- Puzzle Generator & Logic
 * Generates solvable puzzles by starting from a solved state
 * and applying random toggles.
 */

/**
 * Create a blank grid (all lights off).
 *
 * @param {number} size - Grid dimension (e.g., 3 for 3x3)
 * @returns {boolean[][]} 2D array of false values
 */
export function createGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

/**
 * Toggle a cell and its orthogonal neighbors.
 * Mutates the grid in place and returns it.
 *
 * @param {boolean[][]} grid - The puzzle grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean[][]} The same grid reference (mutated)
 */
export function toggle(grid, row, col) {
  const size = grid.length;
  const targets = [
    [row, col],
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  for (const [r, c] of targets) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = !grid[r][c];
    }
  }
  return grid;
}

/**
 * Check if the puzzle is solved (all lights off).
 *
 * @param {boolean[][]} grid - The puzzle grid
 * @returns {boolean} true if every cell is false
 */
export function isSolved(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) return false;
    }
  }
  return true;
}

/**
 * Count the number of lit cells.
 *
 * @param {boolean[][]} grid
 * @returns {number}
 */
export function countLit(grid) {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) count++;
    }
  }
  return count;
}

/**
 * Generate a solvable Lights Out puzzle.
 * Starts from solved state and applies random toggles.
 *
 * @param {number} size - Grid dimension (3, 4, or 5)
 * @param {number} moves - Number of random toggles to apply
 * @returns {{ grid: boolean[][], size: number, minMoves: number }}
 */
export function generatePuzzle(size, moves) {
  const grid = createGrid(size);

  // Track which cells were toggled (using XOR counting -- odd = toggled)
  const toggleCount = createGrid(size);

  let appliedMoves = 0;
  let attempts = 0;
  const maxAttempts = moves * 10;

  while (appliedMoves < moves && attempts < maxAttempts) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    attempts++;

    // Toggle on the grid
    toggle(grid, r, c);

    // Track toggle parity
    toggleCount[r][c] = !toggleCount[r][c];

    appliedMoves++;
  }

  // If we ended up with a solved grid (all off), redo
  if (isSolved(grid)) {
    return generatePuzzle(size, moves);
  }

  // Count minimum moves: number of distinct cells toggled an odd number of times
  let minMoves = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (toggleCount[r][c]) minMoves++;
    }
  }

  return { grid, size, minMoves };
}

/**
 * Deep-clone a grid.
 *
 * @param {boolean[][]} grid
 * @returns {boolean[][]}
 */
export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * Get the scramble move count range for a given grid size.
 *
 * @param {number} size - Grid dimension
 * @returns {{ min: number, max: number }}
 */
export function getMovesRange(size) {
  switch (size) {
    case 3: return { min: 5, max: 8 };
    case 4: return { min: 10, max: 15 };
    case 5: return { min: 15, max: 25 };
    default: return { min: 10, max: 15 };
  }
}
