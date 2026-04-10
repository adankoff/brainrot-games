/**
 * ANIME SNAKE -- Snake Class
 * Grid-based snake state: position array, direction, movement, collision.
 */

/** @typedef {'up'|'down'|'left'|'right'} Direction */

/** Opposite directions -- used to prevent 180-degree reversals. */
const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/** Direction vectors for grid movement. */
const DIR_VECTORS = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

export class Snake {
  /**
   * @param {number} cols - Grid columns
   * @param {number} rows - Grid rows
   */
  constructor(cols, rows) {
    /** @type {number} */
    this.cols = cols;

    /** @type {number} */
    this.rows = rows;

    /** @type {Array<{x: number, y: number}>} Snake segments, head is index 0 */
    this.segments = [];

    /** @type {Direction} Current direction */
    this.direction = 'right';

    /** @type {Direction} Queued direction (applied on next move) */
    this.nextDirection = 'right';

    /** @type {{x: number, y: number}} Food position */
    this.food = { x: 0, y: 0 };

    /** @type {number} Current score */
    this.score = 0;

    /** @type {boolean} Whether the snake is alive */
    this.alive = true;

    /** @type {boolean} Whether the snake should grow on next move */
    this._growFlag = false;

    /** @type {number} Current tick interval in ms */
    this.tickInterval = 150;

    this.reset();
  }

  /**
   * Reset the snake to initial state in the center of the grid.
   */
  reset() {
    this.segments = [];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.alive = true;
    this._growFlag = false;
    this.tickInterval = 150;

    // Start snake in center, 3 segments long
    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    for (let i = 0; i < 3; i++) {
      this.segments.push({ x: startX - i, y: startY });
    }

    this.spawnFood();
  }

  /**
   * Queue a direction change. Ignored if it would reverse the current
   * OR already-queued direction (prevents fast-tap 180-degree reversals).
   *
   * @param {Direction} dir - Desired direction
   */
  setDirection(dir) {
    if (!DIR_VECTORS[dir]) return;

    // Can't reverse into the direction the snake is currently moving
    if (OPPOSITE[dir] === this.direction) return;

    // Also prevent reversing an already-queued direction
    // (handles rapid input between ticks: e.g. moving right, queue up, then queue down)
    if (OPPOSITE[dir] === this.nextDirection) return;

    this.nextDirection = dir;
  }

  /**
   * Advance the snake by one grid cell. Returns true if snake is still alive.
   *
   * @returns {boolean} alive after move
   */
  move() {
    if (!this.alive) return false;

    // Apply queued direction
    this.direction = this.nextDirection;

    const head = this.segments[0];
    const vec = DIR_VECTORS[this.direction];
    const newHead = {
      x: head.x + vec.dx,
      y: head.y + vec.dy,
    };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
      this.alive = false;
      return false;
    }

    // Self collision (check before adding new head).
    // The tail segment will be removed after this check (snake isn't growing yet),
    // so exclude it -- moving into the tail's current cell is valid.
    const lastIdx = this.segments.length - 1;
    for (let i = 0; i < this.segments.length; i++) {
      // Skip tail if it will be popped this tick
      if (i === lastIdx && !this._growFlag) continue;
      if (this.segments[i].x === newHead.x && this.segments[i].y === newHead.y) {
        this.alive = false;
        return false;
      }
    }

    // Add new head
    this.segments.unshift(newHead);

    // Check food
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 1;
      this._growFlag = true;
      this.spawnFood();
      this._updateSpeed();
    }

    // Remove tail (unless growing)
    if (this._growFlag) {
      this._growFlag = false;
    } else {
      this.segments.pop();
    }

    return true;
  }

  /**
   * Spawn food on a random empty cell.
   */
  spawnFood() {
    // Build set of occupied cells
    const occupied = new Set();
    for (const seg of this.segments) {
      occupied.add(`${seg.x},${seg.y}`);
    }

    // Collect empty cells
    const empty = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (!occupied.has(`${x},${y}`)) {
          empty.push({ x, y });
        }
      }
    }

    if (empty.length === 0) {
      // Snake fills entire grid -- player wins
      this.food = { x: -1, y: -1 };
      return;
    }

    const idx = Math.floor(Math.random() * empty.length);
    this.food = empty[idx];
  }

  /**
   * Update tick interval based on score.
   * Every 10 food eaten, decrease by 15ms. Floor at 80ms.
   */
  _updateSpeed() {
    const tier = Math.floor(this.score / 10);
    this.tickInterval = Math.max(80, 150 - tier * 15);
  }

  /**
   * Get the head position.
   *
   * @returns {{x: number, y: number}}
   */
  getHead() {
    return this.segments[0];
  }

}
