/**
 * MEME 2048 -- Board Logic
 * 4x4 grid state, slide/merge algorithm, tile spawning, game-over detection.
 * (Identical logic to game-07)
 */

// ---- Constants ----

export const GRID_SIZE = 4;

// ---- Tile ----

/**
 * @typedef {Object} Tile
 * @property {number} value - Power of 2 (2, 4, 8, ..., 2048)
 * @property {number} id - Unique ID for animation tracking
 */

let nextTileId = 1;

/**
 * Create a new tile.
 *
 * @param {number} value
 * @returns {Tile}
 */
function createTile(value) {
  return { value, id: nextTileId++ };
}

// ---- Animation Info ----

/**
 * @typedef {Object} MoveAnim
 * @property {number} id - Tile ID
 * @property {number} fromRow
 * @property {number} fromCol
 * @property {number} toRow
 * @property {number} toCol
 * @property {number} value - Final value of the tile at destination
 * @property {boolean} merged - Whether this tile was the result of a merge
 */

/**
 * @typedef {Object} SpawnAnim
 * @property {number} id - Tile ID
 * @property {number} row
 * @property {number} col
 * @property {number} value
 */

// ---- Board State ----

export class BoardState {
  constructor() {
    this.reset();
  }

  reset() {
    /** @type {(Tile|null)[][]} 4x4 grid, row-major */
    this.grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      this.grid.push(new Array(GRID_SIZE).fill(null));
    }

    /** @type {number} */
    this.score = 0;

    /** @type {boolean} */
    this.gameOver = false;

    /** @type {boolean} */
    this.won = false;

    /** @type {MoveAnim[]} */
    this.lastMoves = [];

    /** @type {SpawnAnim[]} */
    this.lastSpawns = [];

    /** @type {number[]} merged tile IDs from last move (for pulse animation) */
    this.lastMergedIds = [];

    /** @type {number} score added by last move */
    this.lastMoveScore = 0;

    nextTileId = 1;

    // Spawn two initial tiles
    this.spawnTile();
    this.spawnTile();
  }

  /**
   * Spawn a new tile in a random empty cell.
   * 90% chance of value 2, 10% chance of value 4.
   *
   * @returns {boolean} true if a tile was spawned
   */
  spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === null) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return false;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const tile = createTile(value);
    this.grid[cell.r][cell.c] = tile;

    this.lastSpawns = [{ id: tile.id, row: cell.r, col: cell.c, value }];
    return true;
  }

  /**
   * Slide all tiles in the given direction.
   * Returns true if the board changed (a valid move).
   *
   * @param {'left'|'right'|'up'|'down'} direction
   * @returns {boolean}
   */
  move(direction) {
    if (this.gameOver) return false;

    this.lastMoves = [];
    this.lastMergedIds = [];
    this.lastMoveScore = 0;
    this.lastSpawns = [];

    let moved = false;

    // Process each line (row for left/right, column for up/down)
    if (direction === 'left' || direction === 'right') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const line = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          line.push({ tile: this.grid[r][c], row: r, col: c });
        }
        if (direction === 'right') line.reverse();
        if (this._processLine(line, direction)) moved = true;
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        const line = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          line.push({ tile: this.grid[r][c], row: r, col: c });
        }
        if (direction === 'down') line.reverse();
        if (this._processLine(line, direction)) moved = true;
      }
    }

    if (moved) {
      this.spawnTile();
      if (!this._hasValidMoves()) {
        this.gameOver = true;
      }
    }

    return moved;
  }

  /**
   * Process a single line (row or column) for slide and merge.
   * Line is ordered from the leading edge (where tiles slide toward).
   *
   * The algorithm:
   * 1. Extract non-null tiles in order
   * 2. Merge adjacent pairs (left to right in extracted order)
   * 3. Place merged result back into line positions
   *
   * @param {Array<{tile: Tile|null, row: number, col: number}>} line
   * @param {'left'|'right'|'up'|'down'} direction
   * @returns {boolean} true if any tile moved or merged
   */
  _processLine(line, direction) {
    // Extract non-null tiles in order (from leading edge)
    const tiles = [];
    const origins = [];
    for (const cell of line) {
      if (cell.tile !== null) {
        tiles.push(cell.tile);
        origins.push({ row: cell.row, col: cell.col });
      }
    }

    if (tiles.length === 0) return false;

    // Merge pass: walk through tiles, merge first matching adjacent pair
    // A tile can only be merged once per move (no double-merge)
    const merged = new Array(tiles.length).fill(false);
    const result = [];
    const resultOrigins = []; // track which original tiles ended up where

    let i = 0;
    while (i < tiles.length) {
      if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value && !merged[i]) {
        // Merge tiles[i] and tiles[i+1]
        const newValue = tiles[i].value * 2;
        const newTile = createTile(newValue);
        result.push(newTile);
        resultOrigins.push({ from: [i, i + 1], merged: true });
        this.lastMoveScore += newValue;
        this.score += newValue;
        this.lastMergedIds.push(newTile.id);

        if (newValue === 2048) {
          this.won = true;
        }

        i += 2; // skip both merged tiles
      } else {
        result.push(tiles[i]);
        resultOrigins.push({ from: [i], merged: false });
        i++;
      }
    }

    // Place result back into line positions
    let changed = false;

    // Clear all positions in this line
    for (const cell of line) {
      this.grid[cell.row][cell.col] = null;
    }

    // Place result tiles at leading-edge positions
    for (let j = 0; j < result.length; j++) {
      const destCell = line[j];
      this.grid[destCell.row][destCell.col] = result[j];

      const info = resultOrigins[j];

      if (info.merged) {
        // Two source tiles both animate to the destination
        const srcA = origins[info.from[0]];
        const srcB = origins[info.from[1]];

        this.lastMoves.push({
          id: result[j].id,
          fromRow: srcA.row,
          fromCol: srcA.col,
          toRow: destCell.row,
          toCol: destCell.col,
          value: result[j].value,
          merged: true,
        });
        this.lastMoves.push({
          id: result[j].id + 0.5, // half-id for the second source
          fromRow: srcB.row,
          fromCol: srcB.col,
          toRow: destCell.row,
          toCol: destCell.col,
          value: result[j].value,
          merged: true,
        });

        if (srcA.row !== destCell.row || srcA.col !== destCell.col ||
            srcB.row !== destCell.row || srcB.col !== destCell.col) {
          changed = true;
        }
        // Merge always counts as a change
        changed = true;
      } else {
        const src = origins[info.from[0]];
        this.lastMoves.push({
          id: result[j].id,
          fromRow: src.row,
          fromCol: src.col,
          toRow: destCell.row,
          toCol: destCell.col,
          value: result[j].value,
          merged: false,
        });
        if (src.row !== destCell.row || src.col !== destCell.col) {
          changed = true;
        }
      }
    }

    return changed;
  }

  /**
   * Check if any valid moves remain on the board.
   *
   * @returns {boolean}
   */
  _hasValidMoves() {
    // Any empty cell means moves are available
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === null) return true;
      }
    }

    // Check for adjacent pairs that can merge
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = this.grid[r][c].value;
        // Check right neighbor
        if (c + 1 < GRID_SIZE && this.grid[r][c + 1].value === val) return true;
        // Check bottom neighbor
        if (r + 1 < GRID_SIZE && this.grid[r + 1][c].value === val) return true;
      }
    }

    return false;
  }

  /**
   * Get the highest tile value on the board.
   *
   * @returns {number}
   */
  getHighestTile() {
    let max = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] && this.grid[r][c].value > max) {
          max = this.grid[r][c].value;
        }
      }
    }
    return max;
  }
}
