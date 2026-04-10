/**
 * MEME MAZE -- Maze Generator
 * Recursive backtracker algorithm for perfect maze generation.
 */

/**
 * @typedef {Object} Cell
 * @property {boolean} top    - Has a wall on top
 * @property {boolean} right  - Has a wall on right
 * @property {boolean} bottom - Has a wall on bottom
 * @property {boolean} left   - Has a wall on left
 * @property {boolean} visited - Used during generation
 * @property {boolean} hasStar - Whether this cell contains a collectible star
 */

/**
 * @typedef {Object} Maze
 * @property {Cell[][]} cells     - 2D grid of cells [row][col]
 * @property {number}   rows      - Number of rows
 * @property {number}   cols      - Number of columns
 * @property {number}   startRow  - Starting row
 * @property {number}   startCol  - Starting column
 * @property {number}   endRow    - Exit row
 * @property {number}   endCol    - Exit column
 */

const DIRECTIONS = [
  { dr: -1, dc: 0, wall: 'top',    opposite: 'bottom' },
  { dr: 0,  dc: 1, wall: 'right',  opposite: 'left'   },
  { dr: 1,  dc: 0, wall: 'bottom', opposite: 'top'    },
  { dr: 0,  dc: -1, wall: 'left',  opposite: 'right'  },
];

/**
 * Shuffle an array in-place using Fisher-Yates.
 *
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
 * Generate a perfect maze using recursive backtracker (iterative stack version).
 *
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Maze}
 */
export function generateMaze(rows, cols) {
  // Initialize grid
  const cells = [];
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      cells[r][c] = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false,
        hasStar: false,
      };
    }
  }

  // Recursive backtracker using explicit stack
  const stack = [];
  const startRow = 0;
  const startCol = 0;

  cells[startRow][startCol].visited = true;
  stack.push({ r: startRow, c: startCol });

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { r, c } = current;

    // Find unvisited neighbors
    const neighbors = [];
    for (const dir of DIRECTIONS) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !cells[nr][nc].visited) {
        neighbors.push({ nr, nc, dir });
      }
    }

    if (neighbors.length === 0) {
      // Backtrack
      stack.pop();
    } else {
      // Choose a random neighbor
      const { nr, nc, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Remove walls between current and chosen
      cells[r][c][dir.wall] = false;
      cells[nr][nc][dir.opposite] = false;

      cells[nr][nc].visited = true;
      stack.push({ r: nr, c: nc });
    }
  }

  const endRow = rows - 1;
  const endCol = cols - 1;

  // Place stars in dead-ends (cells with 3 walls intact)
  placeStars(cells, rows, cols, startRow, startCol, endRow, endCol);

  return {
    cells,
    rows,
    cols,
    startRow,
    startCol,
    endRow,
    endCol,
  };
}

/**
 * Find dead-end cells (cells with exactly 3 walls) and place stars in some of them.
 *
 * @param {Cell[][]} cells
 * @param {number} rows
 * @param {number} cols
 * @param {number} startRow
 * @param {number} startCol
 * @param {number} endRow
 * @param {number} endCol
 */
function placeStars(cells, rows, cols, startRow, startCol, endRow, endCol) {
  const deadEnds = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Skip start and end
      if (r === startRow && c === startCol) continue;
      if (r === endRow && c === endCol) continue;

      const cell = cells[r][c];
      const wallCount = (cell.top ? 1 : 0) + (cell.right ? 1 : 0) +
                        (cell.bottom ? 1 : 0) + (cell.left ? 1 : 0);

      if (wallCount === 3) {
        deadEnds.push({ r, c });
      }
    }
  }

  // Shuffle and pick 3-5 dead ends for stars
  shuffle(deadEnds);
  const starCount = Math.min(deadEnds.length, Math.floor(Math.random() * 3) + 3);

  for (let i = 0; i < starCount; i++) {
    cells[deadEnds[i].r][deadEnds[i].c].hasStar = true;
  }
}

/**
 * Check if movement from (r,c) in the given direction is blocked by a wall.
 *
 * @param {Maze} maze
 * @param {number} r - Current row
 * @param {number} c - Current column
 * @param {'up'|'down'|'left'|'right'} direction
 * @returns {boolean} true if movement is allowed
 */
export function canMove(maze, r, c, direction) {
  const cell = maze.cells[r][c];
  switch (direction) {
    case 'up':    return !cell.top && r > 0;
    case 'down':  return !cell.bottom && r < maze.rows - 1;
    case 'left':  return !cell.left && c > 0;
    case 'right': return !cell.right && c < maze.cols - 1;
    default:      return false;
  }
}

/**
 * Get the difficulty config for a given difficulty name.
 *
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ rows: number, cols: number, fogRadius: number }}
 */
export function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case 'easy':   return { rows: 8,  cols: 8,  fogRadius: 99 };
    case 'medium': return { rows: 12, cols: 12, fogRadius: 3 };
    case 'hard':   return { rows: 18, cols: 18, fogRadius: 2 };
    default:       return { rows: 8,  cols: 8,  fogRadius: 99 };
  }
}
