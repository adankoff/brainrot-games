/**
 * MEME MATCH -- Match-3 Board Logic
 * Pure game-state: grid, matching, gravity, spawning, validation.
 */

const COLS = 8;
const ROWS = 8;
const NUM_TYPES = 6;

/**
 * Create a fresh board with no initial matches.
 * @returns {number[][]} 2D array [row][col] of gem types (0..NUM_TYPES-1)
 */
export function createBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = randomGemExcluding(board, r, c);
    }
  }
  return board;
}

/**
 * Pick a random gem type that won't form an immediate 3-match.
 */
function randomGemExcluding(board, r, c) {
  const forbidden = new Set();

  // Check horizontal: if two to the left are the same
  if (c >= 2 && board[r][c - 1] === board[r][c - 2]) {
    forbidden.add(board[r][c - 1]);
  }
  // Check vertical: if two above are the same
  if (r >= 2 && board[r - 1][c] === board[r - 2][c]) {
    forbidden.add(board[r - 1][c]);
  }

  let gem;
  do {
    gem = Math.floor(Math.random() * NUM_TYPES);
  } while (forbidden.has(gem));
  return gem;
}

/**
 * Swap two positions on the board (mutates board).
 * @param {number[][]} board
 * @param {number} r1
 * @param {number} c1
 * @param {number} r2
 * @param {number} c2
 */
export function swapGems(board, r1, c1, r2, c2) {
  const tmp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = tmp;
}

/**
 * Check if two cells are adjacent (horizontal or vertical, distance 1).
 */
export function areAdjacent(r1, c1, r2, c2) {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr + dc) === 1;
}

/**
 * Find all matches on the board.
 * Returns an array of match groups, each group is an array of {r, c}.
 * A match is 3+ consecutive same-type gems in a row or column.
 * @param {number[][]} board
 * @returns {Array<Array<{r:number, c:number}>>}
 */
export function findMatches(board) {
  const matched = new Set();
  const groups = [];

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let runStart = 0;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && board[r][c] === board[r][runStart] && board[r][c] !== -1) {
        continue;
      }
      const len = c - runStart;
      if (len >= 3) {
        const group = [];
        for (let k = runStart; k < c; k++) {
          const key = r * COLS + k;
          matched.add(key);
          group.push({ r, c: k });
        }
        groups.push(group);
      }
      runStart = c;
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    let runStart = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && board[r][c] === board[runStart][c] && board[r][c] !== -1) {
        continue;
      }
      const len = r - runStart;
      if (len >= 3) {
        const group = [];
        for (let k = runStart; k < r; k++) {
          const key = k * COLS + c;
          matched.add(key);
          group.push({ r: k, c });
        }
        groups.push(group);
      }
      runStart = r;
    }
  }

  return groups;
}

/**
 * Remove matched cells (set to -1). Returns the set of cleared positions.
 * @param {number[][]} board
 * @param {Array<Array<{r:number, c:number}>>} matchGroups
 * @returns {Array<{r:number, c:number, type:number}>}
 */
export function clearMatches(board, matchGroups) {
  const cleared = [];
  const seen = new Set();
  for (const group of matchGroups) {
    for (const { r, c } of group) {
      const key = r * COLS + c;
      if (!seen.has(key)) {
        seen.add(key);
        cleared.push({ r, c, type: board[r][c] });
        board[r][c] = -1;
      }
    }
  }
  return cleared;
}

/**
 * Apply gravity: gems fall down to fill empty (-1) cells.
 * Returns array of moves: { fromR, fromC, toR, toC }.
 * @param {number[][]} board
 * @returns {Array<{fromR:number, fromC:number, toR:number, toC:number}>}
 */
export function applyGravity(board) {
  const moves = [];
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== -1) {
        if (r !== writeRow) {
          board[writeRow][c] = board[r][c];
          board[r][c] = -1;
          moves.push({ fromR: r, fromC: c, toR: writeRow, toC: c });
        }
        writeRow--;
      }
    }
  }
  return moves;
}

/**
 * Fill empty (-1) cells at top with new random gems.
 * Returns array of spawns: { r, c, type, fallDistance }.
 * @param {number[][]} board
 * @returns {Array<{r:number, c:number, type:number, fallDistance:number}>}
 */
export function fillEmpty(board) {
  const spawns = [];
  for (let c = 0; c < COLS; c++) {
    let emptyCount = 0;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === -1) {
        emptyCount++;
      }
    }
    // Fill from top
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === -1) {
        board[r][c] = Math.floor(Math.random() * NUM_TYPES);
        spawns.push({ r, c, type: board[r][c], fallDistance: emptyCount });
      }
    }
  }
  return spawns;
}

/**
 * Check if any valid move exists on the board.
 * A valid move is a swap of two adjacent gems that produces a match.
 * @param {number[][]} board
 * @returns {boolean}
 */
export function hasValidMoves(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Try swap right
      if (c < COLS - 1) {
        swapGems(board, r, c, r, c + 1);
        const matches = findMatches(board);
        swapGems(board, r, c, r, c + 1); // swap back
        if (matches.length > 0) return true;
      }
      // Try swap down
      if (r < ROWS - 1) {
        swapGems(board, r, c, r + 1, c);
        const matches = findMatches(board);
        swapGems(board, r, c, r + 1, c); // swap back
        if (matches.length > 0) return true;
      }
    }
  }
  return false;
}

/**
 * Shuffle the board until no matches exist and valid moves are possible.
 * @param {number[][]} board
 */
export function shuffleBoard(board) {
  // Fisher-Yates shuffle of all cells
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push(board[r][c]);
    }
  }

  let attempts = 0;
  do {
    // Shuffle
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    // Place back
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        board[r][c] = cells[idx++];
      }
    }
    attempts++;
    // Clear any immediate matches
    let matches = findMatches(board);
    while (matches.length > 0) {
      clearMatches(board, matches);
      fillEmpty(board);
      matches = findMatches(board);
    }
  } while (!hasValidMoves(board) && attempts < 100);
}

/**
 * Calculate score for a match group.
 * @param {number} matchLen - Length of the match (3, 4, 5+)
 * @param {number} cascadeLevel - 0 = first match, 1 = first cascade, etc.
 * @returns {number}
 */
export function scoreForMatch(matchLen, cascadeLevel) {
  let base;
  if (matchLen >= 5) base = 200;
  else if (matchLen === 4) base = 100;
  else base = 50;

  const multiplier = cascadeLevel + 1;
  return base * multiplier;
}

export { COLS, ROWS, NUM_TYPES };
