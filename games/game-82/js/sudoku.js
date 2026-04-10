/**
 * MEME SUDOKU -- Procedural Sudoku Generator & Solver
 * Generates valid 9x9 puzzles with unique solutions using backtracking.
 */

/**
 * Create a blank 9x9 grid filled with zeros.
 * @returns {number[][]}
 */
function createEmptyGrid() {
  return Array.from({ length: 9 }, () => new Array(9).fill(0));
}

/**
 * Deep-clone a 9x9 grid.
 * @param {number[][]} grid
 * @returns {number[][]}
 */
function cloneGrid(grid) {
  return grid.map(row => row.slice());
}

/**
 * Check if placing `num` at (row, col) is valid in the grid.
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {number} num
 * @returns {boolean}
 */
function isValid(grid, row, col, num) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

/**
 * Shuffle an array in place (Fisher-Yates).
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fill a grid completely using randomized backtracking.
 * @param {number[][]} grid
 * @returns {boolean}
 */
function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Count solutions for a grid (stops at 2 to check uniqueness).
 * @param {number[][]} grid
 * @param {object} counter
 * @returns {void}
 */
function countSolutions(grid, counter) {
  if (counter.count >= 2) return;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            countSolutions(grid, counter);
            if (counter.count >= 2) {
              grid[row][col] = 0;
              return;
            }
            grid[row][col] = 0;
          }
        }
        return; // no valid number found, backtrack
      }
    }
  }
  // All cells filled -- found a solution
  counter.count++;
}

/**
 * Check if a puzzle grid has exactly one solution.
 * @param {number[][]} grid
 * @returns {boolean}
 */
function hasUniqueSolution(grid) {
  const counter = { count: 0 };
  countSolutions(cloneGrid(grid), counter);
  return counter.count === 1;
}

/**
 * Generate a Sudoku puzzle.
 *
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ grid: number[][], solution: number[][], given: boolean[][] }}
 */
export function generatePuzzle(difficulty = 'medium') {
  const clueCount = difficulty === 'easy' ? 35 : difficulty === 'medium' ? 28 : 22;

  // Step 1: Generate a complete valid grid
  const solution = createEmptyGrid();
  fillGrid(solution);

  // Step 2: Remove cells to create the puzzle
  const grid = cloneGrid(solution);

  // Build a list of all cell positions and shuffle
  const positions = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  shuffle(positions);

  let remaining = 81;
  const target = clueCount;

  for (const [r, c] of positions) {
    if (remaining <= target) break;

    const backup = grid[r][c];
    grid[r][c] = 0;

    if (hasUniqueSolution(grid)) {
      remaining--;
    } else {
      // Restore -- removing this cell creates ambiguity
      grid[r][c] = backup;
    }
  }

  // Build the given mask
  const given = Array.from({ length: 9 }, () => new Array(9).fill(false));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      given[r][c] = grid[r][c] !== 0;
    }
  }

  return { grid, solution, given };
}

/**
 * Check if the entire grid is correctly filled.
 * @param {number[][]} grid
 * @param {number[][]} solution
 * @returns {boolean}
 */
export function isComplete(grid, solution) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

/**
 * Get a hint: find a random empty/wrong cell and return its correct value.
 * @param {number[][]} grid
 * @param {number[][]} solution
 * @param {boolean[][]} given
 * @returns {{ row: number, col: number, value: number } | null}
 */
export function getHint(grid, solution, given) {
  const candidates = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!given[r][c] && grid[r][c] !== solution[r][c]) {
        candidates.push({ row: r, col: c, value: solution[r][c] });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
