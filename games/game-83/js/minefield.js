/**
 * MEME SWEEPER -- Minefield Logic
 * Procedural minesweeper grid generation and game rules.
 */

/**
 * Create a blank minefield grid. Mines are placed on first click.
 *
 * @param {number} rows
 * @param {number} cols
 * @param {number} mineCount
 * @returns {object} Minefield state
 */
export function createMinefield(rows, cols, mineCount) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      });
    }
    cells.push(row);
  }
  return {
    rows,
    cols,
    mineCount,
    cells,
    minesPlaced: false,
    gameOver: false,
    won: false,
    revealedCount: 0,
    flagCount: 0,
  };
}

/**
 * Get all valid neighbor coordinates for a cell.
 *
 * @param {number} r
 * @param {number} c
 * @param {number} rows
 * @param {number} cols
 * @returns {Array<[number, number]>}
 */
function getNeighbors(r, c, rows, cols) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

/**
 * Place mines on the grid, excluding the safe zone around the first click.
 *
 * @param {object} field - Minefield state
 * @param {number} safeR - Row of first click
 * @param {number} safeC - Col of first click
 */
function placeMines(field, safeR, safeC) {
  const { rows, cols, mineCount, cells } = field;

  // Build safe zone: clicked cell + neighbors
  const safeSet = new Set();
  safeSet.add(`${safeR},${safeC}`);
  for (const [nr, nc] of getNeighbors(safeR, safeC, rows, cols)) {
    safeSet.add(`${nr},${nc}`);
  }

  // Collect all candidate positions
  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeSet.has(`${r},${c}`)) {
        candidates.push([r, c]);
      }
    }
  }

  // Shuffle and pick
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const placeable = Math.min(mineCount, candidates.length);
  for (let i = 0; i < placeable; i++) {
    const [r, c] = candidates[i];
    cells[r][c].mine = true;
  }

  // Compute adjacency counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
        if (cells[nr][nc].mine) count++;
      }
      cells[r][c].adjacent = count;
    }
  }

  field.minesPlaced = true;
}

/**
 * Reveal a cell. On first click, places mines. Flood-fills empty cells.
 * Returns true if a mine was hit.
 *
 * @param {object} field - Minefield state
 * @param {number} r
 * @param {number} c
 * @returns {boolean} true if mine was hit (game over)
 */
export function reveal(field, r, c) {
  const { rows, cols, cells } = field;

  if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
  if (field.gameOver) return false;

  const cell = cells[r][c];
  if (cell.revealed || cell.flagged) return false;

  // Place mines on first click
  if (!field.minesPlaced) {
    placeMines(field, r, c);
  }

  // Hit a mine
  if (cell.mine) {
    cell.revealed = true;
    field.gameOver = true;
    field.won = false;
    // Reveal all mines
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        if (cells[rr][cc].mine) {
          cells[rr][cc].revealed = true;
        }
      }
    }
    return true;
  }

  // Flood-fill reveal
  const stack = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop();
    const current = cells[cr][cc];
    if (current.revealed || current.flagged || current.mine) continue;

    current.revealed = true;
    field.revealedCount++;

    // If empty (0 adjacent), reveal neighbors
    if (current.adjacent === 0) {
      for (const [nr, nc] of getNeighbors(cr, cc, rows, cols)) {
        if (!cells[nr][nc].revealed && !cells[nr][nc].flagged) {
          stack.push([nr, nc]);
        }
      }
    }
  }

  return false;
}

/**
 * Toggle flag on an unrevealed cell.
 *
 * @param {object} field - Minefield state
 * @param {number} r
 * @param {number} c
 * @returns {boolean} New flagged state of the cell
 */
export function toggleFlag(field, r, c) {
  const { rows, cols, cells } = field;
  if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
  if (field.gameOver) return false;

  const cell = cells[r][c];
  if (cell.revealed) return false;

  cell.flagged = !cell.flagged;
  field.flagCount += cell.flagged ? 1 : -1;
  return cell.flagged;
}

/**
 * Check if the player has won (all non-mine cells revealed).
 *
 * @param {object} field - Minefield state
 * @returns {boolean}
 */
export function checkWin(field) {
  const totalSafe = field.rows * field.cols - field.mineCount;
  if (field.revealedCount >= totalSafe) {
    field.gameOver = true;
    field.won = true;
    return true;
  }
  return false;
}
