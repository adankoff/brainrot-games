/**
 * MEME THREES -- Core Game Logic
 * 4x4 Threes puzzle: 1+2=3, then equal values merge (3+3=6, 6+6=12, ...).
 */

const ROWS = 4;
const COLS = 4;

/**
 * @typedef {{ value: number, id: number }} Tile
 * @typedef {{ fromRow: number, fromCol: number, toRow: number, toCol: number, tile: Tile, merged: boolean, mergedWith: Tile|null }} MoveResult
 */

let nextTileId = 0;

/**
 * Create a fresh tile with a unique ID.
 */
export function createTile(value) {
  return { value, id: nextTileId++ };
}

/**
 * Create a blank 4x4 grid (null = empty cell).
 */
export function createGrid() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid.push(new Array(COLS).fill(null));
  }
  return grid;
}

/**
 * Initialize a new game board with 9 random tiles.
 */
export function initBoard() {
  const grid = createGrid();
  const positions = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      positions.push([r, c]);
    }
  }
  // Shuffle and pick 9
  shuffle(positions);
  for (let i = 0; i < 9; i++) {
    const [r, c] = positions[i];
    grid[r][c] = createTile(randomNewTileValue(0));
  }
  return grid;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Can two tiles merge?
 * 1+2=3, and equal values >= 3 merge.
 */
export function canMerge(a, b) {
  if (!a || !b) return false;
  if (a.value === 1 && b.value === 2) return true;
  if (a.value === 2 && b.value === 1) return true;
  if (a.value >= 3 && a.value === b.value) return true;
  return false;
}

/**
 * Get merged value.
 */
export function mergedValue(a, b) {
  if (a.value === 1 && b.value === 2) return 3;
  if (a.value === 2 && b.value === 1) return 3;
  return a.value + b.value;
}

/**
 * Attempt to slide the grid in a direction.
 * Returns { grid, moves, moved } where moves is an array of MoveResult.
 * Direction: 'up', 'down', 'left', 'right'
 */
export function slideGrid(grid, direction) {
  // Threes slide: each tile moves at most one cell toward the swipe direction.
  // Process sequentially from the leading edge so tiles cascade into gaps.
  // Each tile can only merge once per turn (no double-merges).
  const newGrid = grid.map(row => [...row]);
  const moves = [];
  let moved = false;

  const lines = getLines(direction);

  for (const line of lines) {
    // line[0] = leading edge (wall side). Process i=1..3 toward the wall.
    // Track which cells were the result of a merge to prevent double-merging.
    const justMerged = new Set();

    for (let i = 1; i < line.length; i++) {
      const { r: sr, c: sc } = line[i];
      const tile = newGrid[sr][sc];
      if (!tile) continue;

      const { r: dr, c: dc } = line[i - 1];
      const target = newGrid[dr][dc];

      if (target === null) {
        // Slide into empty cell
        newGrid[dr][dc] = tile;
        newGrid[sr][sc] = null;
        moves.push({
          fromRow: sr, fromCol: sc,
          toRow: dr, toCol: dc,
          tile, merged: false, mergedWith: null
        });
        moved = true;
      } else if (canMerge(tile, target) && !justMerged.has(i - 1)) {
        // Merge (target cell hasn't already been created by a merge this turn)
        const mVal = mergedValue(tile, target);
        const mergedTile = createTile(mVal);
        newGrid[dr][dc] = mergedTile;
        newGrid[sr][sc] = null;
        justMerged.add(i - 1);
        moves.push({
          fromRow: sr, fromCol: sc,
          toRow: dr, toCol: dc,
          tile, merged: true, mergedWith: target,
          newTile: mergedTile
        });
        moved = true;
      }
      // else: blocked by non-mergeable tile, stays put
    }
  }

  return { grid: newGrid, moves, moved };
}

/**
 * Get traversal lines for a direction.
 * Each line is processed independently: cells slide toward index 0.
 */
function getLines(direction) {
  const lines = [];
  switch (direction) {
    case 'up':
      for (let c = 0; c < COLS; c++) {
        const line = [];
        for (let r = 0; r < ROWS; r++) line.push({ r, c });
        lines.push(line);
      }
      break;
    case 'down':
      for (let c = 0; c < COLS; c++) {
        const line = [];
        for (let r = ROWS - 1; r >= 0; r--) line.push({ r, c });
        lines.push(line);
      }
      break;
    case 'left':
      for (let r = 0; r < ROWS; r++) {
        const line = [];
        for (let c = 0; c < COLS; c++) line.push({ r, c });
        lines.push(line);
      }
      break;
    case 'right':
      for (let r = 0; r < ROWS; r++) {
        const line = [];
        for (let c = COLS - 1; c >= 0; c--) line.push({ r, c });
        lines.push(line);
      }
      break;
  }
  return lines;
}

/**
 * Get empty cells on the edge where new tile spawns (opposite of swipe direction).
 * Swipe right -> new tile spawns on left column, etc.
 */
export function getSpawnPositions(grid, direction) {
  const positions = [];
  switch (direction) {
    case 'up':    // swiped up -> spawn on bottom row
      for (let c = 0; c < COLS; c++) {
        if (!grid[ROWS - 1][c]) positions.push([ROWS - 1, c]);
      }
      break;
    case 'down':  // swiped down -> spawn on top row
      for (let c = 0; c < COLS; c++) {
        if (!grid[0][c]) positions.push([0, c]);
      }
      break;
    case 'left':  // swiped left -> spawn on right column
      for (let r = 0; r < ROWS; r++) {
        if (!grid[r][COLS - 1]) positions.push([r, COLS - 1]);
      }
      break;
    case 'right': // swiped right -> spawn on left column
      for (let r = 0; r < ROWS; r++) {
        if (!grid[r][0]) positions.push([r, 0]);
      }
      break;
  }
  return positions;
}

/**
 * Spawn a new tile on the edge opposite to the swipe direction.
 * Returns { grid, spawnRow, spawnCol, tile } or null if no room.
 */
export function spawnTile(grid, direction, score) {
  const positions = getSpawnPositions(grid, direction);
  if (positions.length === 0) return null;

  const [r, c] = positions[Math.floor(Math.random() * positions.length)];
  const tile = createTile(randomNewTileValue(score));
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = tile;

  return { grid: newGrid, spawnRow: r, spawnCol: c, tile };
}

/**
 * Generate a random new tile value. Weighted: mostly 1, 2, 3.
 * After score milestones, small chance of higher tiles.
 */
export function randomNewTileValue(score) {
  const rand = Math.random();

  // Rare bonus tile after score milestones
  if (score >= 5000 && rand < 0.02) return 48;
  if (score >= 2000 && rand < 0.04) return 24;
  if (score >= 1000 && rand < 0.06) return 12;
  if (score >= 400 && rand < 0.08) return 6;

  // Standard distribution: ~40% 1, ~40% 2, ~20% 3
  const r = Math.random();
  if (r < 0.4) return 1;
  if (r < 0.8) return 2;
  return 3;
}

/**
 * Decide what the next preview tile will be (value only).
 */
export function nextPreviewValue(score) {
  return randomNewTileValue(score);
}

/**
 * Check if any valid moves remain.
 */
export function hasValidMoves(grid) {
  // Check for empty cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) return true;
    }
  }
  // Check for adjacent merges
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = grid[r][c];
      if (r > 0 && canMerge(tile, grid[r - 1][c])) return true;
      if (r < ROWS - 1 && canMerge(tile, grid[r + 1][c])) return true;
      if (c > 0 && canMerge(tile, grid[r][c - 1])) return true;
      if (c < COLS - 1 && canMerge(tile, grid[r][c + 1])) return true;
    }
  }
  return false;
}

/**
 * Calculate score: sum of tile scores where each tile's score = 3^(log3(value/3)+1) for value >= 3.
 * Tiles with value 1 or 2 are worth 0.
 */
export function calculateScore(grid) {
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = grid[r][c];
      if (tile) {
        total += tileScore(tile.value);
      }
    }
  }
  return total;
}

/**
 * Score for a single tile value.
 */
export function tileScore(value) {
  if (value < 3) return 0;
  // 3^(log3(value/3) + 1)
  const power = Math.round(Math.log(value / 3) / Math.log(2)) + 1;
  return Math.pow(3, power);
}

export { ROWS, COLS };
