/**
 * MEME BUBBLES -- Bubble Grid & Logic
 * Hex grid management, collision, matching, and physics.
 */

/** Bubble radius in logical pixels */
export const BUBBLE_RADIUS = 18;

/** Bubble diameter */
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;

/** Horizontal spacing between bubble centers */
export const COL_SPACING = BUBBLE_DIAMETER;

/** Vertical spacing between row centers in hex grid */
export const ROW_SPACING = BUBBLE_RADIUS * Math.sqrt(3);

/** The 6 bubble colors */
export const COLORS = [
  '#ff4757', // red
  '#2ed573', // green
  '#1e90ff', // blue
  '#ffa502', // orange
  '#a855f7', // purple
  '#00d2d3', // cyan
];

/**
 * @typedef {Object} Bubble
 * @property {number} row
 * @property {number} col
 * @property {number} colorIndex
 * @property {number} x - Center x in canvas coords
 * @property {number} y - Center y in canvas coords
 */

/**
 * @typedef {Object} FlyingBubble
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} colorIndex
 */

/**
 * @typedef {Object} FallingBubble
 * @property {number} x
 * @property {number} y
 * @property {number} vy
 * @property {number} colorIndex
 * @property {number} alpha
 */

/**
 * @typedef {Object} PopEffect
 * @property {number} x
 * @property {number} y
 * @property {number} colorIndex
 * @property {number} timer
 * @property {number} maxTimer
 */

export class BubbleGrid {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    /** @type {Map<string, Bubble>} key = "row,col" */
    this.grid = new Map();

    /** Number of columns that fit in the grid */
    this.maxCols = Math.floor(canvasWidth / COL_SPACING);

    /** Y offset from top (allows pushing rows down) */
    this.topOffset = BUBBLE_RADIUS + 10;

    /** @type {FallingBubble[]} */
    this.fallingBubbles = [];

    /** @type {PopEffect[]} */
    this.popEffects = [];
  }

  /** Reset grid to empty */
  clear() {
    this.grid.clear();
    this.fallingBubbles = [];
    this.popEffects = [];
  }

  /**
   * Get bubble center X for a given row and column.
   * Odd rows are offset by half a bubble diameter.
   * @param {number} row
   * @param {number} col
   * @returns {number}
   */
  getBubbleX(row, col) {
    const offset = (row % 2 === 1) ? BUBBLE_RADIUS : 0;
    return BUBBLE_RADIUS + col * COL_SPACING + offset;
  }

  /**
   * Get bubble center Y for a given row.
   * @param {number} row
   * @returns {number}
   */
  getBubbleY(row) {
    return this.topOffset + row * ROW_SPACING;
  }

  /**
   * Get number of columns for a given row (odd rows have one fewer).
   * @param {number} row
   * @returns {number}
   */
  getColCount(row) {
    return (row % 2 === 1) ? this.maxCols - 1 : this.maxCols;
  }

  /**
   * Generate initial rows of bubbles.
   * @param {number} numRows
   */
  generateRows(numRows) {
    for (let row = 0; row < numRows; row++) {
      this.addRow(row);
    }
  }

  /**
   * Add a single row of random bubbles at the given row index.
   * @param {number} row
   */
  addRow(row) {
    const cols = this.getColCount(row);
    for (let col = 0; col < cols; col++) {
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      this.setBubble(row, col, colorIndex);
    }
  }

  /**
   * Push all existing bubbles down by one row and add a new row at top.
   */
  pushDown() {
    const newGrid = new Map();
    for (const [, bubble] of this.grid) {
      const newRow = bubble.row + 1;
      const newCol = bubble.col;
      // When shifting, the column layout changes because odd/even flips.
      // We need to re-validate columns.
      const maxColsForNewRow = this.getColCount(newRow);
      if (newCol < maxColsForNewRow) {
        const key = `${newRow},${newCol}`;
        newGrid.set(key, {
          row: newRow,
          col: newCol,
          colorIndex: bubble.colorIndex,
          x: this.getBubbleX(newRow, newCol),
          y: this.getBubbleY(newRow),
        });
      }
    }
    this.grid = newGrid;
    // Add new row at top (row 0)
    this.addRow(0);
  }

  /**
   * Place a bubble into the grid.
   * @param {number} row
   * @param {number} col
   * @param {number} colorIndex
   */
  setBubble(row, col, colorIndex) {
    const key = `${row},${col}`;
    this.grid.set(key, {
      row,
      col,
      colorIndex,
      x: this.getBubbleX(row, col),
      y: this.getBubbleY(row),
    });
  }

  /**
   * Get a bubble at the given grid position.
   * @param {number} row
   * @param {number} col
   * @returns {Bubble|undefined}
   */
  getBubble(row, col) {
    return this.grid.get(`${row},${col}`);
  }

  /**
   * Remove a bubble from the grid.
   * @param {number} row
   * @param {number} col
   */
  removeBubble(row, col) {
    this.grid.delete(`${row},${col}`);
  }

  /**
   * Get hex-grid neighbors of a cell.
   * @param {number} row
   * @param {number} col
   * @returns {Array<{row: number, col: number}>}
   */
  getNeighbors(row, col) {
    const neighbors = [];
    const isOddRow = row % 2 === 1;

    // Same row: left and right
    neighbors.push({ row, col: col - 1 });
    neighbors.push({ row, col: col + 1 });

    // Row above
    neighbors.push({ row: row - 1, col });
    neighbors.push({ row: row - 1, col: isOddRow ? col + 1 : col - 1 });

    // Row below
    neighbors.push({ row: row + 1, col });
    neighbors.push({ row: row + 1, col: isOddRow ? col + 1 : col - 1 });

    return neighbors;
  }

  /**
   * Find all connected bubbles of the same color using BFS.
   * @param {number} row
   * @param {number} col
   * @returns {Array<{row: number, col: number}>}
   */
  findConnected(row, col) {
    const bubble = this.getBubble(row, col);
    if (!bubble) return [];

    const visited = new Set();
    const queue = [{ row, col }];
    const connected = [];
    const targetColor = bubble.colorIndex;

    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.row},${current.col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const b = this.getBubble(current.row, current.col);
      if (!b || b.colorIndex !== targetColor) continue;

      connected.push({ row: current.row, col: current.col });

      const neighbors = this.getNeighbors(current.row, current.col);
      for (const n of neighbors) {
        const nKey = `${n.row},${n.col}`;
        if (!visited.has(nKey)) {
          queue.push(n);
        }
      }
    }

    return connected;
  }

  /**
   * Find all bubbles that are NOT connected to row 0 (floating bubbles).
   * @returns {Array<{row: number, col: number}>}
   */
  findFloating() {
    const visited = new Set();
    const queue = [];

    // Start BFS from all bubbles in row 0
    for (const [key, bubble] of this.grid) {
      if (bubble.row === 0) {
        queue.push({ row: bubble.row, col: bubble.col });
        visited.add(key);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.getNeighbors(current.row, current.col);

      for (const n of neighbors) {
        const nKey = `${n.row},${n.col}`;
        if (!visited.has(nKey) && this.grid.has(nKey)) {
          visited.add(nKey);
          queue.push(n);
        }
      }
    }

    // Any bubble not visited is floating
    const floating = [];
    for (const [key, bubble] of this.grid) {
      if (!visited.has(key)) {
        floating.push({ row: bubble.row, col: bubble.col });
      }
    }

    return floating;
  }

  /**
   * Find the nearest empty grid cell to snapping a flying bubble at (x, y).
   * @param {number} x
   * @param {number} y
   * @returns {{row: number, col: number}|null}
   */
  findSnapPosition(x, y) {
    let bestRow = 0;
    let bestCol = 0;
    let bestDist = Infinity;

    // Check all possible positions near the target
    const approxRow = Math.round((y - this.topOffset) / ROW_SPACING);
    const minRow = Math.max(0, approxRow - 2);
    const maxRow = approxRow + 2;

    for (let row = minRow; row <= maxRow; row++) {
      const cols = this.getColCount(row);
      for (let col = 0; col < cols; col++) {
        // Skip occupied cells
        if (this.grid.has(`${row},${col}`)) continue;

        const cx = this.getBubbleX(row, col);
        const cy = this.getBubbleY(row);
        const dx = x - cx;
        const dy = y - cy;
        const dist = dx * dx + dy * dy;

        if (dist < bestDist) {
          bestDist = dist;
          bestRow = row;
          bestCol = col;
        }
      }
    }

    // Only snap if reasonably close
    if (bestDist < (BUBBLE_DIAMETER * BUBBLE_DIAMETER)) {
      return { row: bestRow, col: bestCol };
    }

    return null;
  }

  /**
   * Check if flying bubble collides with any grid bubble.
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  checkCollision(x, y) {
    const collisionDist = BUBBLE_DIAMETER * 0.9;
    const collisionDistSq = collisionDist * collisionDist;

    for (const [, bubble] of this.grid) {
      const dx = x - bubble.x;
      const dy = y - bubble.y;
      if (dx * dx + dy * dy < collisionDistSq) {
        return true;
      }
    }
    return false;
  }

  /**
   * Process popping matched bubbles and detaching floaters.
   * @param {number} row - Row where bubble was placed
   * @param {number} col - Col where bubble was placed
   * @returns {{popped: number, fallen: number}}
   */
  processMatches(row, col) {
    const connected = this.findConnected(row, col);
    let popped = 0;
    let fallen = 0;

    if (connected.length >= 3) {
      // Remove matched bubbles
      for (const pos of connected) {
        const bubble = this.getBubble(pos.row, pos.col);
        if (bubble) {
          this.popEffects.push({
            x: bubble.x,
            y: bubble.y,
            colorIndex: bubble.colorIndex,
            timer: 0,
            maxTimer: 20,
          });
        }
        this.removeBubble(pos.row, pos.col);
        popped++;
      }

      // Find and remove floating bubbles
      const floating = this.findFloating();
      for (const pos of floating) {
        const bubble = this.getBubble(pos.row, pos.col);
        if (bubble) {
          this.fallingBubbles.push({
            x: bubble.x,
            y: bubble.y,
            vy: 0,
            colorIndex: bubble.colorIndex,
            alpha: 1.0,
          });
        }
        this.removeBubble(pos.row, pos.col);
        fallen++;
      }
    }

    return { popped, fallen };
  }

  /**
   * Update falling bubbles and pop effects.
   * @param {number} dt
   */
  updateEffects(dt) {
    // Update falling bubbles
    for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
      const fb = this.fallingBubbles[i];
      fb.vy += 0.5 * dt;
      fb.y += fb.vy * dt;
      fb.alpha -= 0.02 * dt;
      if (fb.y > this.canvasHeight + 50 || fb.alpha <= 0) {
        this.fallingBubbles.splice(i, 1);
      }
    }

    // Update pop effects
    for (let i = this.popEffects.length - 1; i >= 0; i--) {
      const pe = this.popEffects[i];
      pe.timer += dt;
      if (pe.timer >= pe.maxTimer) {
        this.popEffects.splice(i, 1);
      }
    }
  }

  /**
   * Get the maximum row index that has a bubble.
   * @returns {number}
   */
  getMaxRow() {
    let maxRow = 0;
    for (const [, bubble] of this.grid) {
      if (bubble.row > maxRow) maxRow = bubble.row;
    }
    return maxRow;
  }

  /**
   * Check if any bubble has its center past the death line Y.
   * @param {number} deathLineY
   * @returns {boolean}
   */
  isGameOver(deathLineY) {
    for (const [, bubble] of this.grid) {
      if (bubble.y + BUBBLE_RADIUS >= deathLineY) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get a random color index from the colors currently in the grid.
   * Falls back to any random color if grid is empty.
   * @returns {number}
   */
  getRandomGridColor() {
    const colorsInGrid = new Set();
    for (const [, bubble] of this.grid) {
      colorsInGrid.add(bubble.colorIndex);
    }
    if (colorsInGrid.size === 0) {
      return Math.floor(Math.random() * COLORS.length);
    }
    const arr = Array.from(colorsInGrid);
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
