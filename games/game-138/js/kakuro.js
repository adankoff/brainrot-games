/**
 * MEME KAKURO -- Puzzle Data & Logic
 * Contains pre-built puzzles with verified unique solutions,
 * and all puzzle validation/checking logic.
 *
 * Cell types:
 *   'B' = black (empty, no clue)
 *   { across: N, down: N } = clue cell (diagonal split)
 *   0 = white fill cell (player fills 1-9)
 *
 * Solution grids store the correct digit for each white cell position.
 */

/** @type {Array<Object>} */
export const PUZZLES = [
  {
    name: 'ez clap',
    rows: 6, cols: 6,
    grid: [
      ['B',{down:15},{down:8},'B','B','B'],
      [{across:11},0,0,{down:18},'B','B'],
      [{across:14},0,0,0,0,'B'],
      ['B',{across:12},0,0,'B','B'],
      ['B','B',{across:7},0,'B','B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,7,4,0,0,0],
      [0,8,1,2,3,0],
      [0,0,3,9,0,0],
      [0,0,0,7,0,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'no cap',
    rows: 6, cols: 6,
    grid: [
      ['B','B',{down:6},{down:21},'B','B'],
      ['B',{across:8,down:1},0,0,{down:3},'B'],
      [{across:12},0,0,0,0,'B'],
      ['B',{across:11},0,0,'B','B'],
      ['B','B','B','B','B','B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,0,1,7,0,0],
      [0,1,2,6,3,0],
      [0,0,3,8,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'slay',
    rows: 6, cols: 6,
    grid: [
      ['B','B',{down:20},{down:24},'B','B'],
      ['B',{across:11,down:11},0,0,{down:9},'B'],
      [{across:17},0,0,0,0,'B'],
      [{across:21},0,0,0,0,'B'],
      ['B',{across:15},0,0,'B','B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,0,6,5,0,0],
      [0,4,1,9,3,0],
      [0,7,5,3,6,0],
      [0,0,8,7,0,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'bussin',
    rows: 6, cols: 6,
    grid: [
      ['B',{down:9},{down:6},'B','B','B'],
      [{across:5},0,0,{down:13},'B','B'],
      [{across:11},0,0,0,'B','B'],
      ['B','B',{across:3},0,{down:4},'B'],
      ['B','B',{across:13},0,0,'B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,3,2,0,0,0],
      [0,6,4,1,0,0],
      [0,0,0,3,0,0],
      [0,0,0,9,4,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'sigma',
    rows: 7, cols: 7,
    grid: [
      ['B','B',{down:26},{down:17},'B','B','B'],
      ['B',{across:15,down:12},0,0,'B','B','B'],
      [{across:16},0,0,0,{down:14},'B','B'],
      [{across:15},0,0,0,0,'B','B'],
      ['B',{across:12},0,0,0,'B','B'],
      ['B','B',{across:11},0,0,'B','B'],
      ['B','B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0,0],
      [0,0,8,7,0,0,0],
      [0,9,4,3,0,0,0],
      [0,3,9,1,2,0,0],
      [0,0,5,4,3,0,0],
      [0,0,0,2,9,0,0],
      [0,0,0,0,0,0,0],
    ],
  },
  {
    name: 'vibe check',
    rows: 7, cols: 7,
    grid: [
      ['B',{down:6},{down:15},'B',{down:13},{down:3},'B'],
      [{across:13},0,0,{across:9,down:10},0,0,'B'],
      [{across:15},0,0,0,0,'B','B'],
      ['B',{across:8},0,0,'B','B','B'],
      ['B','B',{across:2},0,'B','B','B'],
      ['B','B','B','B','B','B','B'],
      ['B','B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0,0],
      [0,4,9,0,6,3,0],
      [0,2,1,5,7,0,0],
      [0,0,5,3,0,0,0],
      [0,0,0,2,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
    ],
  },
  {
    name: 'rent free',
    rows: 7, cols: 7,
    grid: [
      ['B','B',{down:17},{down:10},'B','B','B'],
      ['B',{across:11,down:12},0,0,{down:3},'B','B'],
      [{across:19},0,0,0,0,'B','B'],
      [{across:11},0,0,'B','B','B','B'],
      ['B',{across:1},0,{down:3},{down:9},'B','B'],
      ['B','B',{across:12},0,0,'B','B'],
      ['B','B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0,0],
      [0,0,3,8,0,0,0],
      [0,5,9,2,3,0,0],
      [0,7,4,0,0,0,0],
      [0,0,1,0,0,0,0],
      [0,0,0,3,9,0,0],
      [0,0,0,0,0,0,0],
    ],
  },
  {
    name: 'W puzzle',
    rows: 6, cols: 6,
    grid: [
      ['B',{down:13},{down:16},'B','B','B'],
      [{across:14},0,0,{down:14},'B','B'],
      [{across:18},0,0,0,'B','B'],
      ['B',{across:11},0,0,'B','B'],
      ['B','B','B','B','B','B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,5,9,0,0,0],
      [0,8,1,9,0,0],
      [0,0,6,5,0,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'absolute unit',
    rows: 8, cols: 8,
    grid: [
      ['B','B',{down:21},{down:12},'B','B','B','B'],
      ['B',{across:12,down:17},0,0,{down:6},'B','B','B'],
      [{across:26},0,0,0,0,{down:10},'B','B'],
      [{across:12},0,0,'B',{across:1,down:6},0,'B','B'],
      ['B',{across:6},0,{across:13,down:6},0,0,'B','B'],
      ['B','B',{across:8},0,0,'B','B','B'],
      ['B','B','B','B','B','B','B','B'],
      ['B','B','B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0,0,0],
      [0,0,3,9,0,0,0,0],
      [0,9,8,3,6,0,0,0],
      [0,8,4,0,0,1,0,0],
      [0,0,6,0,4,9,0,0],
      [0,0,0,6,2,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
  },
  {
    name: 'its giving',
    rows: 6, cols: 6,
    grid: [
      ['B',{down:7},{down:24},'B','B','B'],
      [{across:12},0,0,'B','B','B'],
      [{across:12},0,0,{down:9},{down:4},'B'],
      ['B',{across:20},0,0,0,'B'],
      ['B','B','B','B','B','B'],
      ['B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0],
      [0,3,9,0,0,0],
      [0,4,8,0,0,0],
      [0,0,7,9,4,0],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
    ],
  },
  {
    name: 'based',
    rows: 7, cols: 7,
    grid: [
      ['B',{down:9},{down:8},'B','B','B','B'],
      [{across:7},0,0,{down:16},{down:4},'B','B'],
      [{across:15},0,0,0,0,'B','B'],
      ['B',{across:11},0,0,'B','B','B'],
      ['B','B',{across:4},0,'B','B','B'],
      ['B','B','B','B','B','B','B'],
      ['B','B','B','B','B','B','B'],
    ],
    solution: [
      [0,0,0,0,0,0,0],
      [0,2,5,0,0,0,0],
      [0,7,1,3,4,0,0],
      [0,0,2,9,0,0,0],
      [0,0,0,4,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
    ],
  },
];

/**
 * Get a random puzzle, optionally excluding an index.
 * @param {number} [excludeIndex=-1]
 * @returns {{ puzzle: Object, index: number }}
 */
export function getRandomPuzzle(excludeIndex = -1) {
  let idx;
  do {
    idx = Math.floor(Math.random() * PUZZLES.length);
  } while (idx === excludeIndex && PUZZLES.length > 1);
  return { puzzle: PUZZLES[idx], index: idx };
}

/**
 * Check if a cell is a fill cell (white, player-fillable).
 * @param {*} cell
 * @returns {boolean}
 */
export function isFillCell(cell) {
  return cell === 0;
}

/**
 * Check if a cell is a clue cell.
 * @param {*} cell
 * @returns {boolean}
 */
export function isClueCell(cell) {
  return cell !== null && typeof cell === 'object' && cell !== 'B';
}

/**
 * Check if a cell is a black/empty cell.
 * @param {*} cell
 * @returns {boolean}
 */
export function isBlackCell(cell) {
  return cell === 'B';
}

/**
 * Find all runs (horizontal and vertical) for a puzzle.
 * Each run: { clueRow, clueCol, direction, cells: [{row,col},...], targetSum }
 * @param {Object} puzzle
 * @returns {Array<Object>}
 */
export function findRuns(puzzle) {
  const runs = [];
  const { rows, cols, grid } = puzzle;

  // Horizontal runs (across)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (isClueCell(cell) && cell.across !== undefined) {
        const cells = [];
        let cc = c + 1;
        while (cc < cols && isFillCell(grid[r][cc])) {
          cells.push({ row: r, col: cc });
          cc++;
        }
        if (cells.length > 0) {
          runs.push({
            clueRow: r, clueCol: c,
            direction: 'across',
            cells,
            targetSum: cell.across,
          });
        }
      }
    }
  }

  // Vertical runs (down)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (isClueCell(cell) && cell.down !== undefined) {
        const cells = [];
        let rr = r + 1;
        while (rr < rows && isFillCell(grid[rr][c])) {
          cells.push({ row: rr, col: c });
          rr++;
        }
        if (cells.length > 0) {
          runs.push({
            clueRow: r, clueCol: c,
            direction: 'down',
            cells,
            targetSum: cell.down,
          });
        }
      }
    }
  }

  return runs;
}

/**
 * Find conflicts in the player's current grid values.
 * Returns a Set of "row,col" strings that have conflicts.
 * @param {Array<Object>} runs
 * @param {Array<Array<number>>} playerGrid - Current player values (0 = empty)
 * @returns {Set<string>}
 */
export function findConflicts(runs, playerGrid) {
  const conflicts = new Set();

  for (const run of runs) {
    const positions = [];

    for (const { row, col } of run.cells) {
      const val = playerGrid[row][col];
      if (val > 0) {
        positions.push({ row, col, val });
      }
    }

    // Check for duplicates within this run
    const seen = new Map();
    for (const pos of positions) {
      if (seen.has(pos.val)) {
        conflicts.add(`${pos.row},${pos.col}`);
        const prev = seen.get(pos.val);
        conflicts.add(`${prev.row},${prev.col}`);
      } else {
        seen.set(pos.val, pos);
      }
    }

    // If run is fully filled, check sum
    const allFilled = run.cells.every(({ row, col }) => playerGrid[row][col] > 0);
    if (allFilled) {
      const sum = run.cells.reduce((s, { row, col }) => s + playerGrid[row][col], 0);
      if (sum !== run.targetSum) {
        for (const { row, col } of run.cells) {
          conflicts.add(`${row},${col}`);
        }
      }
    }
  }

  return conflicts;
}

/**
 * Check if the puzzle is completely and correctly solved.
 * @param {Object} puzzle
 * @param {Array<Array<number>>} playerGrid
 * @param {Array<Object>} runs
 * @returns {boolean}
 */
export function isSolved(puzzle, playerGrid, runs) {
  const { rows, cols, grid } = puzzle;

  // All fill cells must be filled
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isFillCell(grid[r][c]) && playerGrid[r][c] === 0) {
        return false;
      }
    }
  }

  // No conflicts
  const conflicts = findConflicts(runs, playerGrid);
  return conflicts.size === 0;
}
