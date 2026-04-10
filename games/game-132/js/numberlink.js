/**
 * MEME LINKS -- NumberLink Puzzle Generator & Logic
 * Generates solvable NumberLink puzzles by building solved paths first,
 * then extracting endpoints as the puzzle.
 */

/**
 * @typedef {Object} Puzzle
 * @property {number} cols
 * @property {number} rows
 * @property {number} numPairs
 * @property {number[][]} solution   - 2D grid: cell value = pair ID (1-based), 0 = empty
 * @property {number[][]} endpoints  - 2D grid: cell value = pair ID if endpoint, else 0
 * @property {Array<{r1:number,c1:number,r2:number,c2:number}>} pairs - Pair endpoint coords
 */

const DIRS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

/**
 * Generate a NumberLink puzzle.
 *
 * Strategy: Use a random walk approach to fill the grid with non-overlapping paths.
 * Each path connects two endpoints. We iteratively place paths until the grid is full.
 *
 * @param {number} cols
 * @param {number} rows
 * @param {number} numPairs
 * @returns {Puzzle}
 */
export function generatePuzzle(cols, rows, numPairs) {
  // We may need multiple attempts since random generation can get stuck
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = tryGenerate(cols, rows, numPairs);
    if (result) return result;
  }
  // Fallback: return a simpler puzzle if generation keeps failing
  return generateFallback(cols, rows, numPairs);
}

/**
 * Single attempt at generating a puzzle.
 *
 * @param {number} cols
 * @param {number} rows
 * @param {number} numPairs
 * @returns {Puzzle|null}
 */
function tryGenerate(cols, rows, numPairs) {
  const totalCells = cols * rows;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const paths = []; // array of arrays of [r, c]
  let filled = 0;

  for (let pairId = 1; pairId <= numPairs; pairId++) {
    // Determine target path length for this pair
    const remaining = totalCells - filled;
    const pairsLeft = numPairs - pairId + 1;

    // Each pair needs at least 2 cells; distribute remaining cells
    const minLen = 2;
    const maxLen = remaining - (pairsLeft - 1) * minLen;

    if (maxLen < minLen) return null;

    // Target a reasonable length for variety
    const avgLen = Math.floor(remaining / pairsLeft);
    const targetLen = Math.max(minLen, avgLen + Math.floor(Math.random() * 3) - 1);
    const cappedTarget = Math.min(targetLen, maxLen);

    // Find a starting cell that is empty and adjacent to an existing path or any empty cell
    const path = buildPath(grid, cols, rows, pairId, cappedTarget);

    if (!path || path.length < minLen) return null;

    paths.push(path);
    filled += path.length;
  }

  // Check if entire grid is filled
  if (filled !== totalCells) return null;

  // Build endpoints grid
  const endpoints = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const pairs = [];

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    const start = p[0];
    const end = p[p.length - 1];
    endpoints[start[0]][start[1]] = i + 1;
    endpoints[end[0]][end[1]] = i + 1;
    pairs.push({
      r1: start[0], c1: start[1],
      r2: end[0], c2: end[1],
    });
  }

  return {
    cols,
    rows,
    numPairs,
    solution: grid,
    endpoints,
    pairs,
  };
}

/**
 * Build a single path on the grid using random walk.
 *
 * @param {number[][]} grid
 * @param {number} cols
 * @param {number} rows
 * @param {number} pairId
 * @param {number} targetLen
 * @returns {number[][]|null} Array of [r, c] or null if failed
 */
function buildPath(grid, cols, rows, pairId, targetLen) {
  // Find all empty cells
  const emptyCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) emptyCells.push([r, c]);
    }
  }

  if (emptyCells.length === 0) return null;

  // Shuffle and try different starting positions
  shuffle(emptyCells);

  for (let si = 0; si < Math.min(emptyCells.length, 30); si++) {
    const start = emptyCells[si];
    const path = [start];
    const visited = new Set();
    visited.add(key(start[0], start[1], cols));
    grid[start[0]][start[1]] = pairId;

    let success = true;
    let current = start;

    for (let step = 1; step < targetLen; step++) {
      const neighbors = getEmptyNeighbors(grid, cols, rows, current[0], current[1]);

      // Filter neighbors: extending to this cell must not create an isolated region
      // of empty cells that's too small for remaining pairs
      const validNeighbors = neighbors.filter(([nr, nc]) => {
        // Temporarily mark this cell
        grid[nr][nc] = pairId;
        const ok = !createsIsolation(grid, cols, rows);
        grid[nr][nc] = 0;
        return ok;
      });

      if (validNeighbors.length === 0) {
        success = false;
        break;
      }

      // Prefer cells with fewer empty neighbors (hug walls) for more interesting paths
      validNeighbors.sort((a, b) => {
        const aN = getEmptyNeighbors(grid, cols, rows, a[0], a[1]).length;
        const bN = getEmptyNeighbors(grid, cols, rows, b[0], b[1]).length;
        return aN - bN;
      });

      // Pick with some randomness but bias toward fewer-neighbor cells
      let pick;
      if (Math.random() < 0.6 && validNeighbors.length > 0) {
        pick = validNeighbors[0];
      } else {
        pick = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      }

      path.push(pick);
      visited.add(key(pick[0], pick[1], cols));
      grid[pick[0]][pick[1]] = pairId;
      current = pick;
    }

    if (success && path.length >= 2) {
      return path;
    }

    // Undo this path
    for (const [r, c] of path) {
      grid[r][c] = 0;
    }
  }

  return null;
}

/**
 * Check if the grid has isolated empty regions that are too small (single cells).
 *
 * @param {number[][]} grid
 * @param {number} cols
 * @param {number} rows
 * @returns {boolean} True if there's a problematic isolated region
 */
function createsIsolation(grid, cols, rows) {
  // Find all empty cells and check connectivity via flood fill
  const visited = new Set();
  let firstEmpty = null;
  let emptyCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        emptyCount++;
        if (!firstEmpty) firstEmpty = [r, c];
      }
    }
  }

  if (emptyCount === 0) return false;
  if (emptyCount === 1) return true; // Single isolated cell can't form a valid path of len >= 2

  // Flood fill from the first empty cell
  const stack = [firstEmpty];
  visited.add(key(firstEmpty[0], firstEmpty[1], cols));
  let reached = 0;

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    reached++;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0) {
        const k = key(nr, nc, cols);
        if (!visited.has(k)) {
          visited.add(k);
          stack.push([nr, nc]);
        }
      }
    }
  }

  // If not all empty cells are connected, we have isolation
  return reached !== emptyCount;
}

/**
 * Get empty neighbor cells.
 */
function getEmptyNeighbors(grid, cols, rows, r, c) {
  const result = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0) {
      result.push([nr, nc]);
    }
  }
  return result;
}

function key(r, c, cols) {
  return r * cols + c;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Fallback puzzle generator: creates a simpler but guaranteed valid puzzle
 * using a snake pattern.
 */
function generateFallback(cols, rows, numPairs) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const endpoints = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const pairs = [];

  // Create a Hamiltonian path (snake) through the grid
  const snakePath = [];
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < cols; c++) snakePath.push([r, c]);
    } else {
      for (let c = cols - 1; c >= 0; c--) snakePath.push([r, c]);
    }
  }

  // Split snake into numPairs segments
  const totalCells = cols * rows;
  const segLen = Math.floor(totalCells / numPairs);
  let idx = 0;

  for (let pairId = 1; pairId <= numPairs; pairId++) {
    const isLast = pairId === numPairs;
    const endIdx = isLast ? totalCells : idx + segLen;

    for (let i = idx; i < endIdx; i++) {
      const [r, c] = snakePath[i];
      grid[r][c] = pairId;
    }

    const start = snakePath[idx];
    const end = snakePath[endIdx - 1];
    endpoints[start[0]][start[1]] = pairId;
    endpoints[end[0]][end[1]] = pairId;
    pairs.push({
      r1: start[0], c1: start[1],
      r2: end[0], c2: end[1],
    });

    idx = endIdx;
  }

  return { cols, rows, numPairs, solution: grid, endpoints, pairs };
}

// ---- Game state logic ----

/**
 * Create a fresh game state from a puzzle.
 *
 * @param {Puzzle} puzzle
 * @returns {Object} Game state
 */
export function createGameState(puzzle) {
  const { cols, rows, numPairs, endpoints, pairs } = puzzle;

  // Player grid: 0 = empty, pairId = filled by that pair's path
  const playerGrid = Array.from({ length: rows }, () => new Array(cols).fill(0));

  // Pre-fill endpoint cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (endpoints[r][c] !== 0) {
        playerGrid[r][c] = endpoints[r][c];
      }
    }
  }

  // Player paths: pairId -> array of [r, c] forming the path (including endpoints)
  const playerPaths = {};
  for (let i = 0; i < numPairs; i++) {
    playerPaths[i + 1] = [];
  }

  return {
    cols,
    rows,
    numPairs,
    endpoints,
    pairs,
    playerGrid,
    playerPaths,
    activePair: 0,       // Currently drawing pair (0 = none)
    completed: new Set(), // Set of completed pair IDs
    solved: false,
  };
}

/**
 * Start drawing from a cell. Returns the pair ID if it's an endpoint.
 *
 * @param {Object} state
 * @param {number} r
 * @param {number} c
 * @returns {number} Pair ID or 0
 */
export function startDraw(state, r, c) {
  const pairId = state.endpoints[r][c];
  if (pairId === 0) return 0;

  // Clear existing path for this pair
  clearPath(state, pairId);

  // Start fresh path from this endpoint
  state.activePair = pairId;
  state.playerPaths[pairId] = [[r, c]];
  state.playerGrid[r][c] = pairId;
  state.completed.delete(pairId);

  return pairId;
}

/**
 * Extend the current path to an adjacent cell.
 *
 * @param {Object} state
 * @param {number} r
 * @param {number} c
 * @returns {'extended'|'connected'|'backtrack'|'blocked'|'none'}
 */
export function extendPath(state, r, c) {
  if (state.activePair === 0) return 'none';

  const pairId = state.activePair;
  const path = state.playerPaths[pairId];
  if (path.length === 0) return 'none';

  const [lastR, lastC] = path[path.length - 1];

  // Must be adjacent (non-diagonal)
  const dr = Math.abs(r - lastR);
  const dc = Math.abs(c - lastC);
  if (dr + dc !== 1) return 'blocked';

  // Check for backtracking: if this cell is already in our path (not the very last one)
  const existingIdx = path.findIndex(([pr, pc]) => pr === r && pc === c);
  if (existingIdx >= 0 && existingIdx < path.length - 1) {
    // Backtrack: remove everything after this point
    const removed = path.splice(existingIdx + 1);
    for (const [rr, rc] of removed) {
      // Only clear if it's not an endpoint
      if (state.endpoints[rr][rc] === 0) {
        state.playerGrid[rr][rc] = 0;
      }
    }
    state.completed.delete(pairId);
    return 'backtrack';
  }

  // Check if this is the other endpoint of our pair
  if (state.endpoints[r][c] === pairId && path.length > 1) {
    path.push([r, c]);
    state.playerGrid[r][c] = pairId;
    state.completed.add(pairId);
    state.activePair = 0;

    // Check if puzzle is solved
    checkSolved(state);

    return 'connected';
  }

  // Check if the cell is occupied by another pair's path
  if (state.playerGrid[r][c] !== 0 && state.playerGrid[r][c] !== pairId) {
    // Erase that pair's path
    const otherPair = state.playerGrid[r][c];
    // Only erase if it's not an endpoint
    if (state.endpoints[r][c] === 0) {
      clearPath(state, otherPair);
    } else {
      return 'blocked';
    }
  }

  // Check if the cell is an endpoint of a DIFFERENT pair
  if (state.endpoints[r][c] !== 0 && state.endpoints[r][c] !== pairId) {
    return 'blocked';
  }

  // Extend path
  path.push([r, c]);
  state.playerGrid[r][c] = pairId;

  return 'extended';
}

/**
 * Finish drawing (release pointer).
 *
 * @param {Object} state
 */
export function endDraw(state) {
  state.activePair = 0;
}

/**
 * Clear a pair's path from the grid.
 *
 * @param {Object} state
 * @param {number} pairId
 */
export function clearPath(state, pairId) {
  const path = state.playerPaths[pairId];
  if (!path) return;

  for (const [r, c] of path) {
    if (state.endpoints[r][c] === 0) {
      state.playerGrid[r][c] = 0;
    }
  }

  // Reset path to empty
  state.playerPaths[pairId] = [];
  state.completed.delete(pairId);
}

/**
 * Check if the puzzle is fully solved.
 *
 * @param {Object} state
 */
function checkSolved(state) {
  // All pairs must be connected
  if (state.completed.size !== state.numPairs) {
    state.solved = false;
    return;
  }

  // All cells must be filled
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.playerGrid[r][c] === 0) {
        state.solved = false;
        return;
      }
    }
  }

  state.solved = true;
}
