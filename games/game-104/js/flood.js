/**
 * FLOOD FILL -- Flood Fill Logic
 * Core game state: grid, flood-fill algorithm, move tracking.
 */

/** @typedef {{ grid: number[][], rows: number, cols: number, moves: number, maxMoves: number, won: boolean, lost: boolean }} FloodState */

const DIFFICULTY = {
  easy:   { cols: 10, rows: 10, maxMoves: 20 },
  medium: { cols: 12, rows: 12, maxMoves: 22 },
  hard:   { cols: 14, rows: 14, maxMoves: 25 },
};

const NUM_COLORS = 6;

/**
 * Create a new flood fill game state.
 *
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {FloodState}
 */
export function createFloodState(difficulty) {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  const { rows, cols, maxMoves } = config;

  // Generate random grid
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.floor(Math.random() * NUM_COLORS));
    }
    grid.push(row);
  }

  return {
    grid,
    rows,
    cols,
    moves: 0,
    maxMoves,
    won: false,
    lost: false,
  };
}

/**
 * Get the current color of the top-left flood region.
 *
 * @param {FloodState} state
 * @returns {number}
 */
export function getCurrentColor(state) {
  return state.grid[0][0];
}

/**
 * Find all cells connected to the top-left that share the same color.
 * Returns a Set of "row,col" strings.
 *
 * @param {FloodState} state
 * @returns {Set<string>}
 */
export function getFloodRegion(state) {
  const { grid, rows, cols } = state;
  const color = grid[0][0];
  const visited = new Set();
  const stack = [[0, 0]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (grid[r][c] !== color) continue;

    visited.add(key);
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }

  return visited;
}

/**
 * Find cells that border the current flood region (for ripple animation).
 * Returns cells grouped by their BFS distance from the flood region edge.
 *
 * @param {FloodState} state
 * @param {number} newColor - The color being filled to
 * @returns {Array<Array<{r: number, c: number}>>} Wavefronts: index 0 = existing region, 1+ = new cells by distance
 */
export function getFloodWaves(state, newColor) {
  const { grid, rows, cols } = state;
  const currentColor = grid[0][0];

  if (newColor === currentColor) return [];

  // First find the current flood region
  const region = getFloodRegion(state);

  // BFS outward from region, only following cells of newColor
  const visited = new Set(region);
  const waves = [];

  // Wave 0: cells in the region (they change instantly)
  const wave0 = [];
  for (const key of region) {
    const [r, c] = key.split(',').map(Number);
    wave0.push({ r, c });
  }
  waves.push(wave0);

  // Find cells adjacent to region that match newColor
  let frontier = [];
  for (const key of region) {
    const [r, c] = key.split(',').map(Number);
    const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
    for (const [nr, nc] of neighbors) {
      const nkey = `${nr},${nc}`;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited.has(nkey)) continue;
      if (grid[nr][nc] === newColor) {
        visited.add(nkey);
        frontier.push({ r: nr, c: nc });
      }
    }
  }

  // BFS outward through newColor cells
  while (frontier.length > 0) {
    waves.push(frontier);
    const nextFrontier = [];
    for (const { r, c } of frontier) {
      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of neighbors) {
        const nkey = `${nr},${nc}`;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited.has(nkey)) continue;
        if (grid[nr][nc] === newColor) {
          visited.add(nkey);
          nextFrontier.push({ r: nr, c: nc });
        }
      }
    }
    frontier = nextFrontier;
  }

  return waves;
}

/**
 * Apply a flood fill move. Changes the top-left region to the new color.
 * Returns true if the move was valid (color was different from current).
 *
 * @param {FloodState} state
 * @param {number} newColor
 * @returns {boolean}
 */
export function applyMove(state, newColor) {
  const currentColor = state.grid[0][0];
  if (newColor === currentColor) return false;
  if (state.won || state.lost) return false;

  const region = getFloodRegion(state);

  // Change all region cells to new color
  for (const key of region) {
    const [r, c] = key.split(',').map(Number);
    state.grid[r][c] = newColor;
  }

  state.moves++;

  // Check win: all cells same color
  if (isBoardSolved(state)) {
    state.won = true;
  } else if (state.moves >= state.maxMoves) {
    state.lost = true;
  }

  return true;
}

/**
 * Check if the entire board is one color.
 *
 * @param {FloodState} state
 * @returns {boolean}
 */
export function isBoardSolved(state) {
  const color = state.grid[0][0];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.grid[r][c] !== color) return false;
    }
  }
  return true;
}

/**
 * Get the number of moves remaining.
 *
 * @param {FloodState} state
 * @returns {number}
 */
export function getMovesRemaining(state) {
  return state.maxMoves - state.moves;
}

/**
 * Calculate score based on remaining moves.
 *
 * @param {FloodState} state
 * @returns {number}
 */
export function calculateScore(state) {
  if (!state.won) return 0;
  const remaining = getMovesRemaining(state);
  return Math.max(remaining * 200, 100);
}

export { DIFFICULTY, NUM_COLORS };
