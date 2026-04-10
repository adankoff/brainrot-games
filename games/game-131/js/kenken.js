/**
 * MEME KENKEN -- Puzzle Generator
 * Generates valid KenKen puzzles: Latin square + cage partitioning + operations.
 */

/**
 * Shuffle array in place (Fisher-Yates).
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a valid Latin square of size N using backtracking.
 * @param {number} n
 * @returns {number[][]} NxN grid where grid[row][col] = 1..N
 */
export function generateLatinSquare(n) {
  const grid = Array.from({ length: n }, () => new Array(n).fill(0));

  function isValid(row, col, num) {
    for (let c = 0; c < col; c++) {
      if (grid[row][c] === num) return false;
    }
    for (let r = 0; r < row; r++) {
      if (grid[r][col] === num) return false;
    }
    return true;
  }

  function solve(pos) {
    if (pos === n * n) return true;
    const row = Math.floor(pos / n);
    const col = pos % n;

    const nums = shuffle(Array.from({ length: n }, (_, i) => i + 1));
    for (const num of nums) {
      if (isValid(row, col, num)) {
        grid[row][col] = num;
        if (solve(pos + 1)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  solve(0);
  return grid;
}

/**
 * Get orthogonal neighbors of a cell.
 * @param {number} row
 * @param {number} col
 * @param {number} n
 * @returns {Array<[number, number]>}
 */
function getNeighbors(row, col, n) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      result.push([nr, nc]);
    }
  }
  return result;
}

/**
 * Partition grid into connected cages of 1-4 cells using random flood fill.
 * @param {number} n
 * @returns {number[][]} cageMap where cageMap[row][col] = cage index
 */
export function partitionIntoCages(n) {
  const cageMap = Array.from({ length: n }, () => new Array(n).fill(-1));
  let cageId = 0;
  const cageCells = []; // cageCells[id] = [[r,c], ...]

  // Process cells in random order
  const allCells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      allCells.push([r, c]);
    }
  }
  shuffle(allCells);

  for (const [r, c] of allCells) {
    if (cageMap[r][c] !== -1) continue;

    // Start a new cage
    const cage = [[r, c]];
    cageMap[r][c] = cageId;

    // Grow cage to random size 1-4 (prefer 2-3)
    const maxSize = Math.random() < 0.15 ? 1 : (Math.random() < 0.3 ? 4 : (Math.random() < 0.5 ? 3 : 2));

    let frontier = getNeighbors(r, c, n).filter(([nr, nc]) => cageMap[nr][nc] === -1);
    shuffle(frontier);

    while (cage.length < maxSize && frontier.length > 0) {
      const [nr, nc] = frontier.shift();
      if (cageMap[nr][nc] !== -1) continue;

      cageMap[nr][nc] = cageId;
      cage.push([nr, nc]);

      // Add new neighbors to frontier
      const newNeighbors = getNeighbors(nr, nc, n).filter(([nnr, nnc]) => cageMap[nnr][nnc] === -1);
      frontier = shuffle([...frontier, ...newNeighbors]);
    }

    cageCells.push(cage);
    cageId++;
  }

  return { cageMap, cageCells };
}

/**
 * Compute the operation and target for a cage given its cell values.
 * @param {number[]} values - The solution values in the cage cells
 * @returns {{ target: number, op: string }}
 */
export function assignOperation(values) {
  if (values.length === 1) {
    return { target: values[0], op: '' };
  }

  const ops = [];

  // Addition always works
  ops.push({ target: values.reduce((a, b) => a + b, 0), op: '+' });

  // Multiplication always works
  ops.push({ target: values.reduce((a, b) => a * b, 1), op: '\u00d7' });

  if (values.length === 2) {
    const sorted = [...values].sort((a, b) => b - a);
    // Subtraction: larger - smaller
    ops.push({ target: sorted[0] - sorted[1], op: '-' });

    // Division: if evenly divisible
    if (sorted[0] % sorted[1] === 0) {
      ops.push({ target: sorted[0] / sorted[1], op: '\u00f7' });
    }
  }

  // Pick a random valid operation
  return ops[Math.floor(Math.random() * ops.length)];
}

/**
 * @typedef {Object} Cage
 * @property {number} id
 * @property {Array<[number, number]>} cells - [[row, col], ...]
 * @property {number} target
 * @property {string} op - '+', '-', 'x', '/' or '' for singles
 */

/**
 * @typedef {Object} KenKenPuzzle
 * @property {number} size
 * @property {number[][]} solution - NxN grid of 1..N
 * @property {Cage[]} cages
 * @property {number[][]} cageMap - cageMap[r][c] = cage index
 */

/**
 * Generate a complete KenKen puzzle.
 * @param {number} n - Grid size (4, 5, or 6)
 * @returns {KenKenPuzzle}
 */
export function generatePuzzle(n) {
  const solution = generateLatinSquare(n);
  const { cageMap, cageCells } = partitionIntoCages(n);

  const cages = cageCells.map((cells, id) => {
    const values = cells.map(([r, c]) => solution[r][c]);
    const { target, op } = assignOperation(values);
    return { id, cells, target, op };
  });

  return { size: n, solution, cages, cageMap };
}

/**
 * Verify that placing `num` at (row, col) doesn't create a duplicate in that row or column.
 * @param {number[][]} playerGrid - Current player grid (0 = empty)
 * @param {number} row
 * @param {number} col
 * @param {number} num
 * @param {number} n
 * @returns {boolean} true if valid (no duplicate)
 */
export function isPlacementValid(playerGrid, row, col, num, n) {
  for (let c = 0; c < n; c++) {
    if (c !== col && playerGrid[row][c] === num) return false;
  }
  for (let r = 0; r < n; r++) {
    if (r !== row && playerGrid[r][col] === num) return false;
  }
  return true;
}

/**
 * Find all cells that are duplicates in their row or column.
 * @param {number[][]} playerGrid
 * @param {number} n
 * @returns {Set<string>} Set of "row,col" keys for error cells
 */
export function findErrors(playerGrid, n) {
  const errors = new Set();

  // Check rows
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (playerGrid[r][c] === 0) continue;
      for (let c2 = c + 1; c2 < n; c2++) {
        if (playerGrid[r][c2] === playerGrid[r][c]) {
          errors.add(`${r},${c}`);
          errors.add(`${r},${c2}`);
        }
      }
    }
  }

  // Check columns
  for (let c = 0; c < n; c++) {
    for (let r = 0; r < n; r++) {
      if (playerGrid[r][c] === 0) continue;
      for (let r2 = r + 1; r2 < n; r2++) {
        if (playerGrid[r2][c] === playerGrid[r][c]) {
          errors.add(`${r},${c}`);
          errors.add(`${r2},${c}`);
        }
      }
    }
  }

  return errors;
}

/**
 * Check if the puzzle is completely and correctly solved.
 * @param {number[][]} playerGrid
 * @param {number[][]} solution
 * @param {number} n
 * @returns {boolean}
 */
export function isSolved(playerGrid, solution, n) {
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (playerGrid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
