/**
 * MEME PIPES -- Pipe Grid Generator & Logic
 * Procedurally generates solvable pipe puzzles by building a spanning tree,
 * then scrambling rotations.
 */

// Direction indices: 0=top, 1=right, 2=bottom, 3=left
const DIR_TOP = 0;
const DIR_RIGHT = 1;
const DIR_BOTTOM = 2;
const DIR_LEFT = 3;

const OPPOSITE = [2, 3, 0, 1]; // top<->bottom, right<->left

const DR = [-1, 0, 1, 0]; // row deltas for top, right, bottom, left
const DC = [0, 1, 0, -1]; // col deltas

/**
 * Determine pipe type from its openings array.
 * @param {boolean[]} openings - [top, right, bottom, left]
 * @returns {string} Pipe type name
 */
function classifyPipe(openings) {
  const count = openings.filter(Boolean).length;
  if (count === 1) return 'end';
  if (count === 4) return 'cross';
  if (count === 3) return 'tee';
  // count === 2
  const indices = [];
  for (let i = 0; i < 4; i++) {
    if (openings[i]) indices.push(i);
  }
  // Straight: opposite sides (diff of 2)
  if (Math.abs(indices[0] - indices[1]) === 2) return 'straight';
  return 'elbow';
}

/**
 * Get the canonical rotation for a pipe type with given openings.
 * Rotation 0 = the "base" orientation for each type:
 *   end: opening at top (0)
 *   straight: openings top+bottom (0,2)
 *   elbow: openings top+right (0,1)
 *   tee: openings top+right+bottom (0,1,2) -- missing left
 *   cross: all four (rotation doesn't matter)
 *
 * Returns how many 90-degree clockwise rotations from base produce the given openings.
 * @param {string} type
 * @param {boolean[]} openings
 * @returns {number} 0-3
 */
function getRotationForOpenings(type, openings) {
  // Find which rotation of the base pattern matches
  const bases = {
    end:      [true, false, false, false],
    straight: [true, false, true, false],
    elbow:    [true, true, false, false],
    tee:      [true, true, true, false],
    cross:    [true, true, true, true],
  };

  const base = bases[type];
  for (let r = 0; r < 4; r++) {
    let match = true;
    for (let d = 0; d < 4; d++) {
      // After rotating base r times clockwise, opening at direction d
      // came from direction (d - r + 4) % 4 in the base
      if (base[(d - r + 4) % 4] !== openings[d]) {
        match = false;
        break;
      }
    }
    if (match) return r;
  }
  return 0;
}

/**
 * Rotate an openings array clockwise by `times` steps.
 * @param {boolean[]} openings
 * @param {number} times
 * @returns {boolean[]}
 */
function rotateOpenings(openings, times) {
  const result = [...openings];
  for (let t = 0; t < times; t++) {
    const last = result[3];
    for (let i = 3; i > 0; i--) {
      result[i] = result[i - 1];
    }
    result[0] = last;
  }
  return result;
}

/**
 * Generate a solvable pipe puzzle.
 * @param {number} rows
 * @param {number} cols
 * @returns {{ grid: Object[][], source: {row:number,col:number}, sink: {row:number,col:number} }}
 */
export function generatePuzzle(rows, cols) {
  // Source on left column, sink on right column
  const source = { row: Math.floor(Math.random() * rows), col: 0 };
  const sink = { row: Math.floor(Math.random() * rows), col: cols - 1 };

  // Build a spanning tree using randomized DFS from source
  // This ensures every cell is reachable
  const connections = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [false, false, false, false])
  );
  const visited = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  // Randomized DFS to build spanning tree
  const stack = [source];
  visited[source.row][source.col] = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { row, col } = current;

    // Get unvisited neighbors in random order
    const dirs = [0, 1, 2, 3];
    shuffleArray(dirs);

    let found = false;
    for (const dir of dirs) {
      const nr = row + DR[dir];
      const nc = col + DC[dir];
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        // Connect current to neighbor
        connections[row][col][dir] = true;
        connections[nr][nc][OPPOSITE[dir]] = true;
        visited[nr][nc] = true;
        stack.push({ row: nr, col: nc });
        found = true;
        break;
      }
    }

    if (!found) {
      stack.pop();
    }
  }

  // Build grid cells from connections
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const openings = [...connections[r][c]];
      const type = classifyPipe(openings);
      const solutionRotation = getRotationForOpenings(type, openings);

      // Scramble: apply a random rotation (1-3 steps so it's not already solved)
      const scramble = 1 + Math.floor(Math.random() * 3);
      const scrambledOpenings = rotateOpenings(openings, scramble);
      const rotation = (solutionRotation + scramble) % 4;

      return {
        type,
        rotation,
        solutionRotation,
        openings: scrambledOpenings,
      };
    })
  );

  return { grid, source, sink };
}

/**
 * Rotate a pipe cell 90 degrees clockwise in-place.
 * @param {Object} cell
 */
export function rotatePipe(cell) {
  cell.rotation = (cell.rotation + 1) % 4;
  // Rotate openings: last becomes first
  const last = cell.openings[3];
  for (let i = 3; i > 0; i--) {
    cell.openings[i] = cell.openings[i - 1];
  }
  cell.openings[0] = last;
}

/**
 * Flood-fill from source through connected openings.
 * Returns set of "row,col" strings that are connected to source.
 * @param {Object[][]} grid
 * @param {{ row: number, col: number }} source
 * @returns {Set<string>}
 */
export function getConnectedSet(grid, source) {
  const rows = grid.length;
  const cols = grid[0].length;
  const connected = new Set();
  const queue = [source];
  const key = (r, c) => `${r},${c}`;
  connected.add(key(source.row, source.col));

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    const cell = grid[row][col];

    for (let dir = 0; dir < 4; dir++) {
      if (!cell.openings[dir]) continue;

      const nr = row + DR[dir];
      const nc = col + DC[dir];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const neighbor = grid[nr][nc];
      // Neighbor must have an opening facing back toward us
      if (!neighbor.openings[OPPOSITE[dir]]) continue;

      const nk = key(nr, nc);
      if (connected.has(nk)) continue;

      connected.add(nk);
      queue.push({ row: nr, col: nc });
    }
  }

  return connected;
}

/**
 * Check if source connects to sink through the pipe grid.
 * @param {Object[][]} grid
 * @param {{ row: number, col: number }} source
 * @param {{ row: number, col: number }} sink
 * @returns {boolean}
 */
export function checkConnected(grid, source, sink) {
  const connected = getConnectedSet(grid, source);
  return connected.has(`${sink.row},${sink.col}`);
}

/**
 * Fisher-Yates shuffle in place.
 * @param {any[]} arr
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
