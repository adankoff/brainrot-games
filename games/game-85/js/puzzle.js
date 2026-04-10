/**
 * MEME SLIDE -- Puzzle Logic
 * Generates, shuffles, and validates sliding tile puzzles.
 */

const SHUFFLE_COUNTS = { 3: 50, 4: 200, 5: 500 };

/**
 * Generate a new shuffled puzzle of the given size.
 *
 * @param {number} size - Grid dimension (3, 4, or 5)
 * @returns {{ grid: number[][], emptyRow: number, emptyCol: number, size: number }}
 */
export function generatePuzzle(size) {
  // Build solved grid: 1..N*N-1 then 0 for empty
  const grid = [];
  let num = 1;
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      if (r === size - 1 && c === size - 1) {
        row.push(0);
      } else {
        row.push(num++);
      }
    }
    grid.push(row);
  }

  let emptyRow = size - 1;
  let emptyCol = size - 1;

  // Shuffle by making random valid moves from solved state
  const shuffleCount = SHUFFLE_COUNTS[size] || 200;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let lastDir = -1; // avoid immediately reversing

  for (let i = 0; i < shuffleCount; i++) {
    // Collect valid neighbor positions
    const valid = [];
    for (let d = 0; d < 4; d++) {
      const nr = emptyRow + dirs[d][0];
      const nc = emptyCol + dirs[d][1];
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        // Don't immediately reverse the last move
        if (lastDir !== -1 && d === (lastDir ^ 1)) continue;
        valid.push(d);
      }
    }

    const chosen = valid[Math.floor(Math.random() * valid.length)];
    const nr = emptyRow + dirs[chosen][0];
    const nc = emptyCol + dirs[chosen][1];

    // Swap
    grid[emptyRow][emptyCol] = grid[nr][nc];
    grid[nr][nc] = 0;
    emptyRow = nr;
    emptyCol = nc;
    lastDir = chosen;
  }

  return { grid, emptyRow, emptyCol, size };
}

/**
 * Try to move the tile at (row, col) into the empty space.
 * Returns true if the move was valid and executed.
 *
 * @param {Object} puzzle - Puzzle state object
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function tryMove(puzzle, row, col) {
  const { grid, emptyRow, emptyCol, size } = puzzle;

  // Check bounds
  if (row < 0 || row >= size || col < 0 || col >= size) return false;

  // Check adjacency (Manhattan distance must be 1)
  const dr = Math.abs(row - emptyRow);
  const dc = Math.abs(col - emptyCol);
  if (dr + dc !== 1) return false;

  // Swap
  grid[emptyRow][emptyCol] = grid[row][col];
  grid[row][col] = 0;
  puzzle.emptyRow = row;
  puzzle.emptyCol = col;

  return true;
}

/**
 * Check if the puzzle is in the solved state.
 *
 * @param {Object} puzzle - Puzzle state object
 * @returns {boolean}
 */
export function isSolved(puzzle) {
  const { grid, size } = puzzle;
  let expected = 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r === size - 1 && c === size - 1) {
        if (grid[r][c] !== 0) return false;
      } else {
        if (grid[r][c] !== expected) return false;
        expected++;
      }
    }
  }
  return true;
}

/**
 * Given an arrow key direction, return which tile would slide.
 * Arrow keys move the tile FROM that direction INTO the empty space.
 * e.g., ArrowUp means the tile below the empty space slides up.
 *
 * @param {Object} puzzle
 * @param {string} direction - 'up' | 'down' | 'left' | 'right'
 * @returns {{ row: number, col: number } | null}
 */
export function getTileMoveForDirection(puzzle, direction) {
  const { emptyRow, emptyCol, size } = puzzle;
  let tileRow = emptyRow;
  let tileCol = emptyCol;

  switch (direction) {
    case 'up':    tileRow = emptyRow + 1; break; // tile below slides up
    case 'down':  tileRow = emptyRow - 1; break; // tile above slides down
    case 'left':  tileCol = emptyCol + 1; break; // tile to right slides left
    case 'right': tileCol = emptyCol - 1; break; // tile to left slides right
    default: return null;
  }

  if (tileRow < 0 || tileRow >= size || tileCol < 0 || tileCol >= size) {
    return null;
  }

  return { row: tileRow, col: tileCol };
}
