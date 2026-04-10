/**
 * MEME PAC -- Maze, Pac-Man, and Ghost logic
 */

// Direction vectors: 0=right, 1=down, 2=left, 3=up
export const DIR = {
  RIGHT: 0,
  DOWN: 1,
  LEFT: 2,
  UP: 3,
};

export const DX = [1, 0, -1, 0];
export const DY = [0, 1, 0, -1];

/**
 * 15x15 maze layout
 * 0 = wall, 1 = dot, 2 = empty (no dot), 3 = power pellet, 4 = ghost house
 */
export const MAZE_TEMPLATE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
  [0,3,0,0,1,0,1,1,1,0,1,0,0,3,0],
  [0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,0,2,2,2,0,1,1,1,1,0],
  [0,0,0,0,1,0,4,4,4,0,1,0,0,0,0],
  [0,1,1,1,1,0,4,4,4,0,1,1,1,1,0],
  [0,1,0,0,1,0,2,2,2,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
  [0,1,0,0,1,0,1,1,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

export const COLS = 15;
export const ROWS = 15;
export const CELL = 26;

// Maze offset to center within 400px canvas
export const MAZE_X = (400 - COLS * CELL) / 2; // 5px
export const MAZE_Y = 60; // top area for score/lives HUD

/**
 * Create a fresh maze state (deep copy of template).
 * @returns {number[][]}
 */
export function createMaze() {
  return MAZE_TEMPLATE.map(row => [...row]);
}

/**
 * Count remaining dots + power pellets in maze.
 * @param {number[][]} maze
 * @returns {number}
 */
export function countDots(maze) {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (maze[r][c] === 1 || maze[r][c] === 3) count++;
    }
  }
  return count;
}

/**
 * Check if a grid cell is walkable.
 * @param {number[][]} maze
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function isWalkable(maze, col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  const cell = maze[row][col];
  return cell !== 0 && cell !== 4; // pac-man cannot enter ghost house
}

/**
 * Check if a grid cell is walkable for ghosts (includes ghost house).
 * @param {number[][]} maze
 * @param {number} col
 * @param {number} row
 * @param {boolean} canEnterHouse
 * @returns {boolean}
 */
export function isGhostWalkable(maze, col, row, canEnterHouse = false) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  const cell = maze[row][col];
  if (cell === 0) return false;
  if (cell === 4 && !canEnterHouse) return false; // ghosts outside house cannot re-enter
  return true;
}

/**
 * Get the opposite direction.
 * @param {number} dir
 * @returns {number}
 */
export function oppositeDir(dir) {
  return (dir + 2) % 4;
}

/**
 * Create a Pac-Man entity.
 * @returns {Object}
 */
export function createPacMan() {
  return {
    col: 7,
    row: 10,
    x: 7, // fractional grid position for smooth movement
    y: 10,
    dir: DIR.LEFT,
    nextDir: DIR.LEFT,
    speed: 0.08, // cells per frame-unit
    mouthAngle: 0,
    mouthDir: 1, // 1 = opening, -1 = closing
    alive: true,
  };
}

/**
 * Create ghost entities.
 * @returns {Object[]}
 */
export function createGhosts() {
  return [
    { id: 0, color: '#ff0000', col: 6, row: 7, x: 6, y: 7, dir: DIR.UP, speed: 0.06, type: 'chase',   vulnerable: false, eaten: false, inHouse: true, houseTimer: 0   },
    { id: 1, color: '#ffb8ff', col: 7, row: 7, x: 7, y: 7, dir: DIR.UP, speed: 0.06, type: 'ambush',  vulnerable: false, eaten: false, inHouse: true, houseTimer: 60  },
    { id: 2, color: '#00ffff', col: 8, row: 7, x: 8, y: 7, dir: DIR.UP, speed: 0.06, type: 'random',  vulnerable: false, eaten: false, inHouse: true, houseTimer: 120 },
    { id: 3, color: '#ffb852', col: 7, row: 8, x: 7, y: 8, dir: DIR.UP, speed: 0.06, type: 'fickle',  vulnerable: false, eaten: false, inHouse: true, houseTimer: 180 },
  ];
}

/**
 * Update Pac-Man position with smooth grid-based movement.
 * @param {Object} pac
 * @param {number[][]} maze
 * @param {number} dt
 */
export function updatePacMan(pac, maze, dt) {
  if (!pac.alive) return;

  // Animate mouth
  pac.mouthAngle += 0.15 * dt * pac.mouthDir;
  if (pac.mouthAngle > 0.35) { pac.mouthAngle = 0.35; pac.mouthDir = -1; }
  if (pac.mouthAngle < 0.02) { pac.mouthAngle = 0.02; pac.mouthDir = 1; }

  const speed = pac.speed * dt;

  // Check if close to center of current cell -- can change direction
  const cx = Math.round(pac.x);
  const cy = Math.round(pac.y);
  const distToCenter = Math.abs(pac.x - cx) + Math.abs(pac.y - cy);

  if (distToCenter < 0.15) {
    // Try to turn to nextDir
    const nx = cx + DX[pac.nextDir];
    const ny = cy + DY[pac.nextDir];
    if (isWalkable(maze, nx, ny)) {
      pac.dir = pac.nextDir;
      pac.x = cx;
      pac.y = cy;
    }
  }

  // Move in current direction
  const newX = pac.x + DX[pac.dir] * speed;
  const newY = pac.y + DY[pac.dir] * speed;

  // Check if next cell in movement direction is walkable
  const targetCol = Math.round(pac.x) + DX[pac.dir];
  const targetRow = Math.round(pac.y) + DY[pac.dir];
  const currentCol = Math.round(pac.x);
  const currentRow = Math.round(pac.y);

  if (!isWalkable(maze, targetCol, targetRow)) {
    // Stop at cell center if we'd overshoot into a wall
    const distPast = pac.dir === DIR.RIGHT ? newX - currentCol :
                     pac.dir === DIR.LEFT  ? currentCol - newX :
                     pac.dir === DIR.DOWN  ? newY - currentRow :
                     currentRow - newY;
    if (distPast > 0) {
      pac.x = currentCol;
      pac.y = currentRow;
      return;
    }
  }

  pac.x = newX;
  pac.y = newY;
  pac.col = Math.round(pac.x);
  pac.row = Math.round(pac.y);
}

/**
 * Get available directions a ghost can move to (no walls, no reversing).
 * @param {number[][]} maze
 * @param {number} col
 * @param {number} row
 * @param {number} currentDir
 * @param {boolean} canEnterHouse
 * @returns {number[]}
 */
function getGhostOptions(maze, col, row, currentDir, canEnterHouse) {
  const reverse = oppositeDir(currentDir);
  const options = [];
  for (let d = 0; d < 4; d++) {
    if (d === reverse) continue;
    const nc = col + DX[d];
    const nr = row + DY[d];
    if (isGhostWalkable(maze, nc, nr, canEnterHouse)) {
      options.push(d);
    }
  }
  // If no options (dead end), allow reverse
  if (options.length === 0) {
    const nc = col + DX[reverse];
    const nr = row + DY[reverse];
    if (isGhostWalkable(maze, nc, nr, canEnterHouse)) {
      options.push(reverse);
    }
  }
  return options;
}

/**
 * Choose direction toward a target tile.
 * @param {number[][]} maze
 * @param {number} col
 * @param {number} row
 * @param {number} targetCol
 * @param {number} targetRow
 * @param {number} currentDir
 * @param {boolean} canEnterHouse
 * @returns {number}
 */
function chooseDirectionToward(maze, col, row, targetCol, targetRow, currentDir, canEnterHouse = false) {
  const options = getGhostOptions(maze, col, row, currentDir, canEnterHouse);
  if (options.length === 0) return currentDir;

  let bestDir = options[0];
  let bestDist = Infinity;
  for (const d of options) {
    const nc = col + DX[d];
    const nr = row + DY[d];
    const dist = (nc - targetCol) ** 2 + (nr - targetRow) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestDir = d;
    }
  }
  return bestDir;
}

/**
 * Choose direction away from a target tile.
 */
function chooseDirectionAway(maze, col, row, targetCol, targetRow, currentDir, canEnterHouse = false) {
  const options = getGhostOptions(maze, col, row, currentDir, canEnterHouse);
  if (options.length === 0) return currentDir;

  let bestDir = options[0];
  let bestDist = -1;
  for (const d of options) {
    const nc = col + DX[d];
    const nr = row + DY[d];
    const dist = (nc - targetCol) ** 2 + (nr - targetRow) ** 2;
    if (dist > bestDist) {
      bestDist = dist;
      bestDir = d;
    }
  }
  return bestDir;
}

/**
 * Update a single ghost.
 * @param {Object} ghost
 * @param {number[][]} maze
 * @param {Object} pac
 * @param {number} dt
 */
export function updateGhost(ghost, maze, pac, dt) {
  // Handle ghost house exit
  if (ghost.inHouse) {
    ghost.houseTimer -= dt;
    if (ghost.houseTimer <= 0) {
      ghost.inHouse = false;
      // Move to exit position
      ghost.x = 7;
      ghost.y = 6;
      ghost.col = 7;
      ghost.row = 6;
      ghost.dir = DIR.UP;
    }
    return;
  }

  // If eaten, return to ghost house
  if (ghost.eaten) {
    const speed = ghost.speed * 2.5 * dt; // fast return
    const targetCol = 7;
    const targetRow = 7;

    // Check if at center of cell
    const cx = Math.round(ghost.x);
    const cy = Math.round(ghost.y);
    const distToCenter = Math.abs(ghost.x - cx) + Math.abs(ghost.y - cy);

    if (distToCenter < 0.15) {
      ghost.x = cx;
      ghost.y = cy;
      ghost.col = cx;
      ghost.row = cy;

      // Reached house?
      if (cx === targetCol && cy === targetRow) {
        ghost.eaten = false;
        ghost.vulnerable = false;
        ghost.inHouse = true;
        ghost.houseTimer = 30;
        return;
      }

      ghost.dir = chooseDirectionToward(maze, cx, cy, targetCol, targetRow, ghost.dir, true);
    }

    ghost.x += DX[ghost.dir] * speed;
    ghost.y += DY[ghost.dir] * speed;
    ghost.col = Math.round(ghost.x);
    ghost.row = Math.round(ghost.y);
    return;
  }

  const speed = (ghost.vulnerable ? ghost.speed * 0.5 : ghost.speed) * dt;

  // Check if at center of cell for direction decision
  const cx = Math.round(ghost.x);
  const cy = Math.round(ghost.y);
  const distToCenter = Math.abs(ghost.x - cx) + Math.abs(ghost.y - cy);

  if (distToCenter < 0.15) {
    ghost.x = cx;
    ghost.y = cy;
    ghost.col = cx;
    ghost.row = cy;

    if (ghost.vulnerable) {
      // Flee from pac-man
      ghost.dir = chooseDirectionAway(maze, cx, cy, pac.col, pac.row, ghost.dir);
    } else {
      switch (ghost.type) {
        case 'chase': // Red: direct chase
          ghost.dir = chooseDirectionToward(maze, cx, cy, pac.col, pac.row, ghost.dir);
          break;
        case 'ambush': { // Pink: target 4 ahead
          const targetCol = pac.col + DX[pac.dir] * 4;
          const targetRow = pac.row + DY[pac.dir] * 4;
          ghost.dir = chooseDirectionToward(maze, cx, cy, targetCol, targetRow, ghost.dir);
          break;
        }
        case 'random': { // Blue: random at intersections
          const options = getGhostOptions(maze, cx, cy, ghost.dir, false);
          if (options.length > 1) {
            ghost.dir = options[Math.floor(Math.random() * options.length)];
          } else if (options.length === 1) {
            ghost.dir = options[0];
          }
          break;
        }
        case 'fickle': { // Orange: chase when far, flee when close
          const dist = Math.abs(pac.col - cx) + Math.abs(pac.row - cy);
          if (dist > 6) {
            ghost.dir = chooseDirectionToward(maze, cx, cy, pac.col, pac.row, ghost.dir);
          } else {
            ghost.dir = chooseDirectionAway(maze, cx, cy, pac.col, pac.row, ghost.dir);
          }
          break;
        }
      }
    }
  }

  // Move
  const newX = ghost.x + DX[ghost.dir] * speed;
  const newY = ghost.y + DY[ghost.dir] * speed;

  // Wall check
  const targetCol = Math.round(ghost.x) + DX[ghost.dir];
  const targetRow = Math.round(ghost.y) + DY[ghost.dir];

  if (!isGhostWalkable(maze, targetCol, targetRow, false)) {
    const currentCol = Math.round(ghost.x);
    const currentRow = Math.round(ghost.y);
    const distPast = ghost.dir === DIR.RIGHT ? newX - currentCol :
                     ghost.dir === DIR.LEFT  ? currentCol - newX :
                     ghost.dir === DIR.DOWN  ? newY - currentRow :
                     currentRow - newY;
    if (distPast > 0) {
      ghost.x = currentCol;
      ghost.y = currentRow;
      ghost.col = currentCol;
      ghost.row = currentRow;
      return;
    }
  }

  ghost.x = newX;
  ghost.y = newY;
  ghost.col = Math.round(ghost.x);
  ghost.row = Math.round(ghost.y);
}
