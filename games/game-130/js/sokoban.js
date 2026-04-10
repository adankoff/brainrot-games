/**
 * MEME SOKOBAN -- Sokoban Engine
 * Grid logic, level data, move validation, undo stack.
 *
 * Symbols:
 *   # = wall
 *   . = target
 *   @ = player
 *   $ = crate
 *   * = crate on target
 *   + = player on target
 *   (space) = floor
 */

// ---- 20+ Classic Sokoban Levels ----

const LEVELS = [
  // Level 1 - Trivial intro (1 crate)
  [
    '####',
    '# .#',
    '#  ###',
    '#@$  #',
    '#  ###',
    '####',
  ],
  // Level 2 - Simple push (1 crate)
  [
    '######',
    '#    #',
    '# @$ #',
    '# .  #',
    '#    #',
    '######',
  ],
  // Level 3 - Two crates intro
  [
    '#####',
    '#   #',
    '#@$.#',
    '# $.#',
    '#   #',
    '#####',
  ],
  // Level 4 - L-shape push
  [
    '######',
    '#    #',
    '# $@.#',
    '#  ###',
    '# $. #',
    '#    #',
    '######',
  ],
  // Level 5 - Corners
  [
    '######',
    '# .  #',
    '#  $ #',
    '# $@.#',
    '#    #',
    '######',
  ],
  // Level 6 - Corridor
  [
    '  ####',
    '###  #',
    '#    #',
    '# @$.#',
    '##$ .#',
    ' #   #',
    ' #####',
  ],
  // Level 7 - Three crates
  [
    '  ####',
    '###  ##',
    '#  $  #',
    '# .#. #',
    '# $$@.#',
    '##  ###',
    ' ####',
  ],
  // Level 8 - Wide room
  [
    '#######',
    '#  @  #',
    '# $$$ #',
    '## # ##',
    ' #   #',
    ' #...#',
    ' #####',
  ],
  // Level 9 - Think ahead
  [
    '######',
    '#    #',
    '# ##.#',
    '# $ .#',
    '#  $@#',
    '######',
  ],
  // Level 10 - Zigzag
  [
    '########',
    '#  ... #',
    '# #$$$ #',
    '#      #',
    '## ### #',
    ' # @   #',
    ' #######',
  ],
  // Level 11 - Wrap around
  [
    ' #####',
    '##   #',
    '#  $ ##',
    '# .#  #',
    '# .@$ #',
    '###   #',
    '  #####',
  ],
  // Level 12 - Narrow corridors
  [
    '#####',
    '#.  ##',
    '#  $ #',
    '## $ #',
    ' #.@ #',
    ' #####',
  ],
  // Level 13 - Three in a row
  [
    ' ######',
    ' # .  #',
    '## $# #',
    '# .$  #',
    '# .$ ##',
    '# @###',
    '#####',
  ],
  // Level 14 - Tight quarters
  [
    '  ####',
    '###  ###',
    '#   $  #',
    '# .$.  #',
    '## @ ###',
    ' # $ #',
    ' #.  #',
    ' #####',
  ],
  // Level 15 - Cross pattern
  [
    '  #####',
    '###   #',
    '# $ # ##',
    '# #.   #',
    '# $.# @#',
    '# .$ ###',
    '###  #',
    '  ####',
  ],
  // Level 16 - Four crates
  [
    ' ####',
    ' #  ###',
    '##  $ #',
    '# .#$ #',
    '# . @##',
    '# .#$ #',
    '##    #',
    ' ######',
  ],
  // Level 17 - Open field
  [
    '########',
    '#      #',
    '# $##$ #',
    '# .  . #',
    '##$..$##',
    ' #    #',
    ' # @  #',
    ' ######',
  ],
  // Level 18 - Diamond
  [
    '  ####',
    '###  ###',
    '# $  $ #',
    '# .##. #',
    '# .##. #',
    '# $  $@#',
    '###  ###',
    '  ####',
  ],
  // Level 19 - Staircase
  [
    '  #####',
    '###   #',
    '# $   #',
    '# .#$@#',
    '# .  ##',
    '# .$ #',
    '##   #',
    ' #####',
  ],
  // Level 20 - Five crates
  [
    '#########',
    '#   #   #',
    '# $   $ #',
    '## .#. ##',
    ' # $@$ #',
    '##  .  ##',
    '#     . #',
    '#   #   #',
    '#########',
  ],
  // Level 21 - Complex corridors
  [
    ' ########',
    ' #      #',
    '## #### #',
    '#  $  $ #',
    '# ..@.. #',
    '##$ $ ###',
    ' #    #',
    ' ######',
  ],
  // Level 22 - Spiral
  [
    '#######',
    '#     #',
    '# .#. #',
    '#  $  #',
    '##$@$##',
    ' # . #',
    ' #####',
  ],
  // Level 23 - Warehouse
  [
    '  ####',
    '###  ####',
    '#   $.  #',
    '# # $.# #',
    '#   .@$ #',
    '####  ###',
    '   ####',
  ],
  // Level 24 - The gauntlet
  [
    ' ######',
    '##    ##',
    '#  ##  #',
    '# #..  #',
    '#  $$#@#',
    '##     #',
    ' # $$ ##',
    ' # .. #',
    ' ######',
  ],
  // Level 25 - Grand finale
  [
    '  ########',
    '###  #   #',
    '#  $   $ #',
    '# .$.#.  #',
    '##  @  ###',
    ' #$$.#.#',
    ' #      #',
    ' #  #   #',
    ' ########',
  ],
];

/** Tile type constants */
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  TARGET: 2,
};

/** Entity type constants */
export const ENTITY = {
  NONE: 0,
  PLAYER: 1,
  CRATE: 2,
};

/**
 * Parse a level string array into grid + entity positions.
 *
 * @param {string[]} lines
 * @returns {{ grid: number[][], entities: number[][], playerRow: number, playerCol: number, width: number, height: number }}
 */
function parseLevel(lines) {
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));

  const grid = [];
  const entities = [];
  let playerRow = 0;
  let playerCol = 0;

  for (let r = 0; r < height; r++) {
    const gridRow = [];
    const entRow = [];
    const line = lines[r];

    for (let c = 0; c < width; c++) {
      const ch = c < line.length ? line[c] : ' ';

      let tile = TILE.FLOOR;
      let ent = ENTITY.NONE;

      switch (ch) {
        case '#':
          tile = TILE.WALL;
          break;
        case '.':
          tile = TILE.TARGET;
          break;
        case '@':
          tile = TILE.FLOOR;
          ent = ENTITY.PLAYER;
          playerRow = r;
          playerCol = c;
          break;
        case '$':
          tile = TILE.FLOOR;
          ent = ENTITY.CRATE;
          break;
        case '*':
          tile = TILE.TARGET;
          ent = ENTITY.CRATE;
          break;
        case '+':
          tile = TILE.TARGET;
          ent = ENTITY.PLAYER;
          playerRow = r;
          playerCol = c;
          break;
        default:
          tile = TILE.FLOOR;
          break;
      }

      gridRow.push(tile);
      entRow.push(ent);
    }

    grid.push(gridRow);
    entities.push(entRow);
  }

  return { grid, entities, playerRow, playerCol, width, height };
}

/**
 * Deep-clone a 2D array.
 *
 * @param {number[][]} arr
 * @returns {number[][]}
 */
function clone2D(arr) {
  return arr.map((row) => row.slice());
}

/**
 * The Sokoban game state manager.
 */
export class SokobanGame {
  constructor() {
    /** @type {number} Current level index */
    this.levelIndex = 0;

    /** @type {number[][]} Static tile grid (FLOOR / WALL / TARGET) */
    this.grid = [];

    /** @type {number[][]} Entity layer (NONE / PLAYER / CRATE) */
    this.entities = [];

    /** @type {number} Grid width */
    this.width = 0;

    /** @type {number} Grid height */
    this.height = 0;

    /** @type {number} Player row */
    this.playerRow = 0;

    /** @type {number} Player col */
    this.playerCol = 0;

    /** @type {number} Total moves across all levels */
    this.totalMoves = 0;

    /** @type {number} Moves on current level */
    this.levelMoves = 0;

    /** @type {number} Levels completed */
    this.levelsCompleted = 0;

    /** @type {Array<{ entities: number[][], playerRow: number, playerCol: number, levelMoves: number }>} */
    this.undoStack = [];

    /** @type {{ fromRow: number, fromCol: number, toRow: number, toCol: number, progress: number, crateFromRow?: number, crateFromCol?: number, crateToRow?: number, crateToCol?: number, hasCrate: boolean } | null} */
    this.animation = null;

    /** @type {boolean} */
    this.allLevelsComplete = false;
  }

  /**
   * Get the total number of available levels.
   *
   * @returns {number}
   */
  getLevelCount() {
    return LEVELS.length;
  }

  /**
   * Load a level by index.
   *
   * @param {number} index
   */
  loadLevel(index) {
    if (index >= LEVELS.length) {
      this.allLevelsComplete = true;
      return;
    }

    this.levelIndex = index;
    const parsed = parseLevel(LEVELS[index]);
    this.grid = parsed.grid;
    this.entities = parsed.entities;
    this.width = parsed.width;
    this.height = parsed.height;
    this.playerRow = parsed.playerRow;
    this.playerCol = parsed.playerCol;
    this.levelMoves = 0;
    this.undoStack = [];
    this.animation = null;
    this.allLevelsComplete = false;
  }

  /**
   * Reset the current level to its initial state.
   */
  resetLevel() {
    this.loadLevel(this.levelIndex);
  }

  /**
   * Start a fresh game from level 0.
   */
  startGame() {
    this.totalMoves = 0;
    this.levelsCompleted = 0;
    this.allLevelsComplete = false;
    this.loadLevel(0);
  }

  /**
   * Attempt to move the player in a direction.
   *
   * @param {number} dr - Row delta (-1, 0, 1)
   * @param {number} dc - Col delta (-1, 0, 1)
   * @returns {'move'|'push'|'invalid'|'solve'|'animating'}
   */
  tryMove(dr, dc) {
    // Block input during animation
    if (this.animation) return 'animating';

    const nr = this.playerRow + dr;
    const nc = this.playerCol + dc;

    // Out of bounds or wall
    if (!this._inBounds(nr, nc) || this.grid[nr][nc] === TILE.WALL) {
      return 'invalid';
    }

    // Target cell has a crate
    if (this.entities[nr][nc] === ENTITY.CRATE) {
      const behindR = nr + dr;
      const behindC = nc + dc;

      // Can't push into wall, out of bounds, or another crate
      if (
        !this._inBounds(behindR, behindC) ||
        this.grid[behindR][behindC] === TILE.WALL ||
        this.entities[behindR][behindC] === ENTITY.CRATE
      ) {
        return 'invalid';
      }

      // Save undo state
      this._pushUndo();

      // Move the crate
      this.entities[nr][nc] = ENTITY.NONE;
      this.entities[behindR][behindC] = ENTITY.CRATE;

      // Move the player
      this.entities[this.playerRow][this.playerCol] = ENTITY.NONE;
      this.entities[nr][nc] = ENTITY.PLAYER;

      // Start push animation
      this.animation = {
        fromRow: this.playerRow,
        fromCol: this.playerCol,
        toRow: nr,
        toCol: nc,
        crateFromRow: nr,
        crateFromCol: nc,
        crateToRow: behindR,
        crateToCol: behindC,
        hasCrate: true,
        progress: 0,
      };

      this.playerRow = nr;
      this.playerCol = nc;
      this.totalMoves++;
      this.levelMoves++;

      // Check if level is solved
      if (this._isSolved()) {
        return 'solve';
      }
      return 'push';
    }

    // Empty floor or target -- just move
    this._pushUndo();

    this.entities[this.playerRow][this.playerCol] = ENTITY.NONE;
    this.entities[nr][nc] = ENTITY.PLAYER;

    // Start move animation
    this.animation = {
      fromRow: this.playerRow,
      fromCol: this.playerCol,
      toRow: nr,
      toCol: nc,
      hasCrate: false,
      progress: 0,
    };

    this.playerRow = nr;
    this.playerCol = nc;
    this.totalMoves++;
    this.levelMoves++;

    return 'move';
  }

  /**
   * Undo the last move.
   *
   * @returns {boolean} true if undo was performed
   */
  undo() {
    if (this.animation) return false;
    if (this.undoStack.length === 0) return false;

    const state = this.undoStack.pop();
    this.entities = state.entities;
    this.playerRow = state.playerRow;
    this.playerCol = state.playerCol;
    this.levelMoves = state.levelMoves;
    this.totalMoves--;

    return true;
  }

  /**
   * Advance to the next level.
   */
  nextLevel() {
    this.levelsCompleted++;
    this.loadLevel(this.levelIndex + 1);
  }

  /**
   * Calculate the current score.
   *
   * @returns {number}
   */
  getScore() {
    return Math.max(0, this.levelsCompleted * 100 - this.totalMoves);
  }

  /**
   * Count how many targets still need crates.
   *
   * @returns {number}
   */
  getRemainingTargets() {
    let count = 0;
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.grid[r][c] === TILE.TARGET && this.entities[r][c] !== ENTITY.CRATE) {
          count++;
        }
      }
    }
    return count;
  }

  // ---- Private Methods ----

  /**
   * Check if row/col is within grid bounds.
   *
   * @param {number} r
   * @param {number} c
   * @returns {boolean}
   */
  _inBounds(r, c) {
    return r >= 0 && r < this.height && c >= 0 && c < this.width;
  }

  /**
   * Check if all targets have crates on them.
   *
   * @returns {boolean}
   */
  _isSolved() {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.grid[r][c] === TILE.TARGET && this.entities[r][c] !== ENTITY.CRATE) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Push current state onto the undo stack.
   */
  _pushUndo() {
    this.undoStack.push({
      entities: clone2D(this.entities),
      playerRow: this.playerRow,
      playerCol: this.playerCol,
      levelMoves: this.levelMoves,
    });
  }
}
