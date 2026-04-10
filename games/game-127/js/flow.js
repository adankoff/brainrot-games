/**
 * MEME FLOW -- Flow puzzle logic
 * Handles grid state, path drawing, puzzle generation, and win detection.
 */

/**
 * @typedef {Object} FlowPuzzle
 * @property {number} gridSize - Width/height of the grid
 * @property {number} numColors - Number of color pairs
 * @property {Array<{color: number, r: number, c: number}>} endpoints - The dot endpoints
 * @property {number[][]} solution - Solution grid (color index per cell, 0 = empty)
 */

/**
 * @typedef {Object} FlowState
 * @property {number} gridSize
 * @property {number} numColors
 * @property {number[][]} grid - Current grid state (color per cell, 0 = empty)
 * @property {Array<{color: number, r: number, c: number}>} endpoints
 * @property {Map<number, Array<{r: number, c: number}>>} paths - Drawn paths per color
 * @property {number|null} activeColor - Currently drawing color
 * @property {boolean} solved
 */

const DIFFICULTY = {
  easy:   { gridSize: 5, minColors: 4, maxColors: 5 },
  medium: { gridSize: 6, minColors: 5, maxColors: 7 },
  hard:   { gridSize: 7, minColors: 6, maxColors: 8 },
};

/**
 * Create a new flow state from a puzzle.
 *
 * @param {FlowPuzzle} puzzle
 * @returns {FlowState}
 */
export function createFlowState(puzzle) {
  const { gridSize, numColors, endpoints } = puzzle;
  const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));

  // Place endpoints on grid
  for (const ep of endpoints) {
    grid[ep.r][ep.c] = ep.color;
  }

  const paths = new Map();
  for (let c = 1; c <= numColors; c++) {
    paths.set(c, []);
  }

  return {
    gridSize,
    numColors,
    grid,
    endpoints,
    paths,
    activeColor: null,
    solved: false,
  };
}

/**
 * Check if a cell is an endpoint for a given color.
 */
export function isEndpoint(state, r, c, color) {
  return state.endpoints.some(ep => ep.r === r && ep.c === c && ep.color === color);
}

/**
 * Check if a cell is any endpoint.
 */
export function isAnyEndpoint(state, r, c) {
  return state.endpoints.some(ep => ep.r === r && ep.c === c);
}

/**
 * Get the color of an endpoint at (r, c), or 0 if none.
 */
export function getEndpointColor(state, r, c) {
  const ep = state.endpoints.find(ep => ep.r === r && ep.c === c);
  return ep ? ep.color : 0;
}

/**
 * Start drawing a path from a cell. If it's an endpoint, begin a new path.
 * If it's on an existing path, truncate to that point and continue.
 *
 * @returns {{ started: boolean, erasedColor: number|null }}
 */
export function startPath(state, r, c) {
  const cellColor = state.grid[r][c];

  // Clicking on an endpoint starts a new path for that color
  if (isAnyEndpoint(state, r, c)) {
    const epColor = getEndpointColor(state, r, c);
    // Clear existing path for this color
    clearPathForColor(state, epColor);
    state.activeColor = epColor;
    state.paths.set(epColor, [{ r, c }]);
    state.grid[r][c] = epColor;
    return { started: true, erasedColor: null };
  }

  // Clicking on an existing path cell: truncate path and start extending from there
  if (cellColor > 0) {
    const path = state.paths.get(cellColor);
    if (path && path.length > 0) {
      const idx = path.findIndex(p => p.r === r && p.c === c);
      if (idx >= 0) {
        // Remove cells after this point from grid
        for (let i = idx + 1; i < path.length; i++) {
          const cell = path[i];
          if (!isAnyEndpoint(state, cell.r, cell.c)) {
            state.grid[cell.r][cell.c] = 0;
          } else {
            // Keep endpoint color but it's disconnected
            state.grid[cell.r][cell.c] = getEndpointColor(state, cell.r, cell.c);
          }
        }
        state.paths.set(cellColor, path.slice(0, idx + 1));
        state.activeColor = cellColor;
        return { started: true, erasedColor: null };
      }
    }
  }

  return { started: false, erasedColor: null };
}

/**
 * Continue drawing a path to an adjacent cell.
 *
 * @returns {{ added: boolean, connected: boolean, erased: boolean, erasedColor: number|null }}
 */
export function continuePath(state, r, c) {
  if (state.activeColor === null) return { added: false, connected: false, erased: false, erasedColor: null };
  if (r < 0 || r >= state.gridSize || c < 0 || c >= state.gridSize) {
    return { added: false, connected: false, erased: false, erasedColor: null };
  }

  const color = state.activeColor;
  const path = state.paths.get(color);
  if (!path || path.length === 0) return { added: false, connected: false, erased: false, erasedColor: null };

  const last = path[path.length - 1];

  // Must be adjacent (not diagonal)
  const dr = Math.abs(r - last.r);
  const dc = Math.abs(c - last.c);
  if (dr + dc !== 1) return { added: false, connected: false, erased: false, erasedColor: null };

  // Check if backtracking on own path (undo last segment)
  if (path.length >= 2) {
    const prev = path[path.length - 2];
    if (prev.r === r && prev.c === c) {
      // Undo: remove last cell
      const removed = path.pop();
      if (!isAnyEndpoint(state, removed.r, removed.c)) {
        state.grid[removed.r][removed.c] = 0;
      }
      return { added: false, connected: false, erased: true, erasedColor: null };
    }
  }

  // Check if cell is already on our own path (prevent loops)
  if (path.some(p => p.r === r && p.c === c)) {
    return { added: false, connected: false, erased: false, erasedColor: null };
  }

  // Check if this cell is the other endpoint for our color => connect!
  if (isEndpoint(state, r, c, color)) {
    // Make sure it's not the starting endpoint
    const startCell = path[0];
    if (startCell.r === r && startCell.c === c) {
      return { added: false, connected: false, erased: false, erasedColor: null };
    }
    path.push({ r, c });
    state.grid[r][c] = color;
    state.activeColor = null;
    return { added: true, connected: true, erased: false, erasedColor: null };
  }

  // Check if cell has another color's path (erase it)
  let erasedColor = null;
  const existingColor = state.grid[r][c];
  if (existingColor > 0 && existingColor !== color) {
    // Don't allow drawing over another color's endpoint
    if (isAnyEndpoint(state, r, c)) {
      return { added: false, connected: false, erased: false, erasedColor: null };
    }
    erasedColor = existingColor;
    clearPathForColor(state, existingColor);
  }

  // Place cell
  path.push({ r, c });
  state.grid[r][c] = color;

  return { added: true, connected: false, erased: false, erasedColor };
}

/**
 * End the current path drawing.
 */
export function endPath(state) {
  state.activeColor = null;
}

/**
 * Clear path for a color, restoring endpoints.
 */
function clearPathForColor(state, color) {
  const path = state.paths.get(color);
  if (!path) return;

  for (const cell of path) {
    if (isAnyEndpoint(state, cell.r, cell.c)) {
      state.grid[cell.r][cell.c] = getEndpointColor(state, cell.r, cell.c);
    } else {
      state.grid[cell.r][cell.c] = 0;
    }
  }
  state.paths.set(color, []);
}

/**
 * Check if a color's path is complete (connects both endpoints).
 */
export function isColorConnected(state, color) {
  const path = state.paths.get(color);
  if (!path || path.length < 2) return false;

  const first = path[0];
  const last = path[path.length - 1];

  const eps = state.endpoints.filter(ep => ep.color === color);
  if (eps.length !== 2) return false;

  const firstIsEp = eps.some(ep => ep.r === first.r && ep.c === first.c);
  const lastIsEp = eps.some(ep => ep.r === last.r && ep.c === last.c);

  return firstIsEp && lastIsEp;
}

/**
 * Check win condition: all colors connected AND all cells filled.
 */
export function checkWin(state) {
  // All colors must be connected
  for (let c = 1; c <= state.numColors; c++) {
    if (!isColorConnected(state, c)) return false;
  }

  // All cells must be filled
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      if (state.grid[r][c] === 0) return false;
    }
  }

  return true;
}

/**
 * Count filled cells.
 */
export function countFilledCells(state) {
  let count = 0;
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      if (state.grid[r][c] > 0) count++;
    }
  }
  return count;
}

/**
 * Get difficulty config.
 */
export function getDifficultyConfig(difficulty) {
  return DIFFICULTY[difficulty] || DIFFICULTY.easy;
}

// ==================== PUZZLE GENERATION ====================

/**
 * Generate a puzzle by building a solved board first, then extracting endpoints.
 * Strategy: fill the grid with random non-crossing paths using a greedy random walk.
 *
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {FlowPuzzle}
 */
export function generatePuzzle(difficulty) {
  const config = getDifficultyConfig(difficulty);
  const { gridSize, minColors, maxColors } = config;
  const numColors = minColors + Math.floor(Math.random() * (maxColors - minColors + 1));

  // Try multiple times to generate a valid puzzle
  for (let attempt = 0; attempt < 50; attempt++) {
    const result = tryGeneratePuzzle(gridSize, numColors);
    if (result) return result;
  }

  // Fallback: simpler generation
  return generateSimplePuzzle(gridSize, numColors);
}

/**
 * Try to generate a puzzle using random walk filling.
 * Creates paths that fill the entire grid, then extracts endpoints.
 */
function tryGeneratePuzzle(gridSize, numColors) {
  const totalCells = gridSize * gridSize;
  const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));
  const paths = [];

  // We need numColors paths that together fill all cells
  // Strategy: grow paths from random starting positions

  // Shuffle all cells
  const allCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      allCells.push({ r, c });
    }
  }
  shuffleArray(allCells);

  let colorIdx = 0;

  for (const startCell of allCells) {
    if (grid[startCell.r][startCell.c] !== 0) continue;
    if (colorIdx >= numColors) break;

    colorIdx++;
    const path = [{ r: startCell.r, c: startCell.c }];
    grid[startCell.r][startCell.c] = colorIdx;

    // Random walk to extend path
    let stuck = false;
    while (!stuck) {
      const last = path[path.length - 1];
      const neighbors = getEmptyNeighbors(grid, last.r, last.c, gridSize);

      if (neighbors.length === 0) {
        stuck = true;
        break;
      }

      // Prefer neighbors that don't create isolated empty cells
      const scored = neighbors.map(n => {
        const emptyCount = getEmptyNeighbors(grid, n.r, n.c, gridSize).length;
        return { ...n, score: emptyCount };
      });

      // Sometimes stop early to allow other paths to use the space
      // More aggressive stopping for first paths
      const minPathLen = 2; // Must have at least 2 cells for a path
      if (path.length >= minPathLen && Math.random() < 0.15) {
        break;
      }

      // Pick a random neighbor, biased toward cells with more open neighbors
      shuffleArray(scored);
      scored.sort((a, b) => {
        // Slight bias toward cells that keep connectivity
        if (a.score === 0 && b.score > 0) return 1;
        if (b.score === 0 && a.score > 0) return -1;
        return 0;
      });

      const chosen = scored[0];
      path.push({ r: chosen.r, c: chosen.c });
      grid[chosen.r][chosen.c] = colorIdx;
    }

    if (path.length >= 2) {
      paths.push(path);
    } else {
      // Single cell path is useless, undo
      grid[startCell.r][startCell.c] = 0;
      colorIdx--;
    }
  }

  // Fill remaining empty cells by extending existing paths
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== 0) continue;

        // Find an adjacent path we can extend to include this cell
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        shuffleArray(dirs);

        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;
          const neighborColor = grid[nr][nc];
          if (neighborColor === 0) continue;

          // Check if this neighbor is an endpoint of its path
          const pathIdx = neighborColor - 1;
          if (pathIdx < 0 || pathIdx >= paths.length) continue;
          const path = paths[pathIdx];
          const first = path[0];
          const last = path[path.length - 1];

          if (first.r === nr && first.c === nc) {
            // Prepend to path
            path.unshift({ r, c });
            grid[r][c] = neighborColor;
            changed = true;
            break;
          } else if (last.r === nr && last.c === nc) {
            // Append to path
            path.push({ r, c });
            grid[r][c] = neighborColor;
            changed = true;
            break;
          }
        }
      }
    }
  }

  // Check if all cells are filled
  let emptyCells = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) emptyCells++;
    }
  }

  if (emptyCells > 0) return null;
  if (paths.length !== numColors) return null;

  // Extract endpoints
  const endpoints = [];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const color = i + 1;
    endpoints.push({ color, r: path[0].r, c: path[0].c });
    endpoints.push({ color, r: path[path.length - 1].r, c: path[path.length - 1].c });
  }

  return {
    gridSize,
    numColors,
    endpoints,
    solution: grid,
  };
}

/**
 * Simple fallback puzzle generation using Hamiltonian-style partitioning.
 */
function generateSimplePuzzle(gridSize, numColors) {
  // Fill grid in a snake pattern, then partition into paths
  const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));
  const order = [];

  for (let r = 0; r < gridSize; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < gridSize; c++) order.push({ r, c });
    } else {
      for (let c = gridSize - 1; c >= 0; c--) order.push({ r, c });
    }
  }

  const totalCells = gridSize * gridSize;
  const pathLengths = distributeEvenly(totalCells, numColors);

  const paths = [];
  let idx = 0;
  for (let i = 0; i < numColors; i++) {
    const path = [];
    for (let j = 0; j < pathLengths[i]; j++) {
      const cell = order[idx++];
      path.push(cell);
      grid[cell.r][cell.c] = i + 1;
    }
    paths.push(path);
  }

  const endpoints = [];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const color = i + 1;
    endpoints.push({ color, r: path[0].r, c: path[0].c });
    endpoints.push({ color, r: path[path.length - 1].r, c: path[path.length - 1].c });
  }

  return { gridSize, numColors, endpoints, solution: grid };
}

/**
 * Distribute n items into k groups as evenly as possible, each at least 2.
 */
function distributeEvenly(n, k) {
  const base = Math.floor(n / k);
  const remainder = n % k;
  const result = [];
  for (let i = 0; i < k; i++) {
    result.push(base + (i < remainder ? 1 : 0));
  }
  // Ensure minimum of 2 per path
  // Steal from longest if needed
  for (let i = 0; i < k; i++) {
    while (result[i] < 2) {
      // Find longest and take from it
      let maxIdx = 0;
      for (let j = 1; j < k; j++) {
        if (result[j] > result[maxIdx]) maxIdx = j;
      }
      if (result[maxIdx] <= 2) break; // Can't steal more
      result[maxIdx]--;
      result[i]++;
    }
  }
  return result;
}

function getEmptyNeighbors(grid, r, c, gridSize) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && grid[nr][nc] === 0) {
      result.push({ r: nr, c: nc });
    }
  }
  return result;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
