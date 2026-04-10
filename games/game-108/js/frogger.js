/**
 * MEME FROGGER -- Core Game Logic
 * Manages frog, lanes, collisions, scoring, lives, and level progression.
 */

import { clamp, randomBetween, randomInt } from '../../shared/utils.js';

// Grid constants
export const COLS = 11;
export const ROWS = 13;
export const CELL = 35;
export const W = 400;
export const H = ROWS * CELL + CELL; // 13*35 + 35 = 490, but we use 700 canvas
// We'll position the grid vertically centered in 700px canvas
export const GRID_OFFSET_Y = Math.floor((700 - ROWS * CELL) / 2);
export const GRID_OFFSET_X = Math.floor((W - COLS * CELL) / 2);

// Home slot width and positions
export const HOME_SLOT_COUNT = 5;
export const HOME_SLOT_WIDTH = CELL * 1.5;

// Row indices (0 = top row with homes, 12 = bottom safe row)
export const ROW_HOME = 0;
export const ROW_RIVER_START = 1;  // rows 1-5 are river
export const ROW_RIVER_END = 5;
export const ROW_SAFE_MIDDLE = 6;
export const ROW_ROAD_START = 7;   // rows 7-11 are road
export const ROW_ROAD_END = 11;
export const ROW_START = 12;       // bottom safe zone

const TIMER_MAX = 30; // seconds per attempt

/**
 * Car colors for visual variety.
 */
const CAR_COLORS = ['#e74c3c', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c', '#3498db', '#ff6b9d'];

/**
 * Generate lane configurations for a given level.
 */
function generateLanes(level) {
  const speedMult = 1 + (level - 1) * 0.15;
  const lanes = [];

  // Row 0: Home row (no moving objects)
  lanes.push({ type: 'home', row: 0, objects: [] });

  // Rows 1-5: River lanes (logs/turtles)
  for (let i = 0; i < 5; i++) {
    const row = 1 + i;
    const dir = (i % 2 === 0) ? 1 : -1;
    const baseSpeed = randomBetween(0.4, 0.9) * speedMult;
    const isLog = randomInt(0, 3) > 0; // 75% logs, 25% turtles
    const objWidth = isLog
      ? CELL * randomInt(2, 4)
      : CELL * randomInt(2, 3);
    const gap = randomBetween(CELL * 2, CELL * 4);
    const count = Math.ceil((W + gap * 2) / (objWidth + gap));

    const objects = [];
    const spacing = objWidth + gap;
    for (let j = 0; j < count + 1; j++) {
      const startX = dir > 0
        ? -objWidth + j * spacing
        : W - j * spacing;
      objects.push({
        x: startX,
        width: objWidth,
        type: isLog ? 'log' : 'turtle',
      });
    }

    lanes.push({
      type: 'river',
      row,
      dir,
      speed: baseSpeed,
      objects,
      objWidth,
      gap,
    });
  }

  // Row 6: Safe middle
  lanes.push({ type: 'safe', row: 6, objects: [] });

  // Rows 7-11: Road lanes (cars)
  for (let i = 0; i < 5; i++) {
    const row = 7 + i;
    const dir = (i % 2 === 0) ? 1 : -1;
    const baseSpeed = randomBetween(0.5, 1.2) * speedMult;
    const carWidth = CELL * randomBetween(1.2, 2.2);
    const gap = randomBetween(CELL * 2.5, CELL * 5);
    const count = Math.ceil((W + gap * 2) / (carWidth + gap));
    const color = CAR_COLORS[randomInt(0, CAR_COLORS.length - 1)];

    const objects = [];
    const spacing = carWidth + gap;
    for (let j = 0; j < count + 1; j++) {
      const startX = dir > 0
        ? -carWidth + j * spacing
        : W - j * spacing;
      objects.push({
        x: startX,
        width: carWidth,
        color,
      });
    }

    lanes.push({
      type: 'road',
      row,
      dir,
      speed: baseSpeed,
      objects,
      carWidth,
      gap,
      color,
    });
  }

  // Row 12: Start row
  lanes.push({ type: 'safe', row: 12, objects: [] });

  return lanes;
}

/**
 * Compute the pixel X positions of the 5 home slots.
 */
function getHomeSlotPositions() {
  const slots = [];
  const totalWidth = COLS * CELL;
  const slotSpacing = totalWidth / HOME_SLOT_COUNT;
  for (let i = 0; i < HOME_SLOT_COUNT; i++) {
    slots.push({
      x: GRID_OFFSET_X + slotSpacing * i + slotSpacing / 2,
      filled: false,
    });
  }
  return slots;
}

export class FroggerGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.lanes = generateLanes(this.level);
    this.homeSlots = getHomeSlotPositions();
    this.frogRow = ROW_START;
    this.frogCol = Math.floor(COLS / 2);
    this.frogX = this._colToX(this.frogCol);
    this.frogY = this._rowToY(this.frogRow);
    this.frogTargetX = this.frogX;
    this.frogTargetY = this.frogY;
    this.frogRiding = null; // reference to log/turtle being ridden
    this.highestRow = ROW_START;
    this.timer = TIMER_MAX;
    this.state = 'alive'; // 'alive' | 'dying' | 'dead' | 'won'
    this.deathTimer = 0;
    this.deathType = ''; // 'squish' | 'splash'
    this.levelCompleteTimer = 0;
    this.gameOver = false;
    this.pendingSound = null;
  }

  startNewLife() {
    this.frogRow = ROW_START;
    this.frogCol = Math.floor(COLS / 2);
    this.frogX = this._colToX(this.frogCol);
    this.frogY = this._rowToY(this.frogRow);
    this.frogTargetX = this.frogX;
    this.frogTargetY = this.frogY;
    this.frogRiding = null;
    this.highestRow = ROW_START;
    this.timer = TIMER_MAX;
    this.state = 'alive';
    this.deathTimer = 0;
  }

  nextLevel() {
    this.level++;
    this.lanes = generateLanes(this.level);
    this.homeSlots = getHomeSlotPositions();
    this.score += 500; // level bonus
    this.startNewLife();
    this.pendingSound = 'levelUp';
  }

  _colToX(col) {
    return GRID_OFFSET_X + col * CELL + CELL / 2;
  }

  _rowToY(row) {
    return GRID_OFFSET_Y + row * CELL + CELL / 2;
  }

  /**
   * Move the frog. Returns a sound name or null.
   */
  move(dx, dy) {
    if (this.state !== 'alive') return null;

    const newCol = clamp(this.frogCol + dx, 0, COLS - 1);
    const newRow = clamp(this.frogRow + dy, 0, ROWS - 1);

    if (newCol === this.frogCol && newRow === this.frogRow) return null;

    this.frogCol = newCol;
    this.frogRow = newRow;
    this.frogTargetX = this._colToX(this.frogCol);
    this.frogTargetY = this._rowToY(this.frogRow);
    this.frogRiding = null;

    // Score for moving forward (up = negative row)
    if (this.frogRow < this.highestRow) {
      this.score += 10 * (this.highestRow - this.frogRow);
      this.highestRow = this.frogRow;
    }

    return 'hop';
  }

  /**
   * Update game state. dt is normalized to 60fps (1.0 = one frame).
   * Returns sound events: 'hop', 'splash', 'squish', 'home', 'levelUp', or null.
   */
  update(dt) {
    if (this.gameOver) return null;

    // Check for pending sounds
    const pending = this.pendingSound;
    this.pendingSound = null;
    if (pending) return pending;

    // Death animation
    if (this.state === 'dying') {
      this.deathTimer -= dt / 60;
      if (this.deathTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = true;
          return null;
        }
        this.startNewLife();
      }
      return null;
    }

    if (this.state !== 'alive') return null;

    // Timer countdown
    this.timer -= dt / 60;
    if (this.timer <= 0) {
      this.timer = 0;
      return this._die('splash');
    }

    // Animate frog position
    const lerpSpeed = 0.3;
    this.frogX += (this.frogTargetX - this.frogX) * lerpSpeed;
    this.frogY += (this.frogTargetY - this.frogY) * lerpSpeed;

    // Snap when close
    if (Math.abs(this.frogX - this.frogTargetX) < 0.5) this.frogX = this.frogTargetX;
    if (Math.abs(this.frogY - this.frogTargetY) < 0.5) this.frogY = this.frogTargetY;

    // Update lane objects
    for (const lane of this.lanes) {
      if (lane.type === 'road' || lane.type === 'river') {
        for (const obj of lane.objects) {
          obj.x += lane.dir * lane.speed * dt;
        }
        // Wrap objects
        this._wrapLaneObjects(lane);
      }
    }

    // Check home row
    if (this.frogRow === ROW_HOME) {
      return this._checkHomeSlot();
    }

    // Check river collision (must be on a log/turtle)
    if (this.frogRow >= ROW_RIVER_START && this.frogRow <= ROW_RIVER_END) {
      return this._checkRiver();
    }

    // Check road collision
    if (this.frogRow >= ROW_ROAD_START && this.frogRow <= ROW_ROAD_END) {
      return this._checkRoad();
    }

    return null;
  }

  _wrapLaneObjects(lane) {
    const gap = lane.gap || CELL * 3;
    const totalSpan = lane.objects.length * (lane.objects[0].width + gap);
    for (const obj of lane.objects) {
      if (lane.dir > 0 && obj.x > W + 60) {
        obj.x -= totalSpan;
      } else if (lane.dir < 0 && obj.x + obj.width < -60) {
        obj.x += totalSpan;
      }
    }
  }

  _checkHomeSlot() {
    const frogX = this.frogX;
    let landed = false;

    for (const slot of this.homeSlots) {
      const dist = Math.abs(frogX - slot.x);
      if (dist < CELL * 0.8) {
        if (slot.filled) {
          // Already filled, die
          return this._die('splash');
        }
        slot.filled = true;
        this.score += 50;
        // Time bonus
        this.score += Math.floor(this.timer) * 2;
        landed = true;

        // Check if all slots filled
        if (this.homeSlots.every(s => s.filled)) {
          this.state = 'won';
          this.levelCompleteTimer = 2;
          // nextLevel will be called after timer
          return 'home';
        }

        // Reset frog for next attempt
        this.startNewLife();
        return 'home';
      }
    }

    // Missed a slot -- die
    if (!landed) {
      return this._die('splash');
    }
    return null;
  }

  _checkRiver() {
    const lane = this.lanes[this.frogRow];
    if (!lane || lane.type !== 'river') return this._die('splash');

    const frogLeft = this.frogX - CELL * 0.4;
    const frogRight = this.frogX + CELL * 0.4;
    let onPlatform = false;

    for (const obj of lane.objects) {
      const objLeft = obj.x;
      const objRight = obj.x + obj.width;
      // Check overlap
      if (frogRight > objLeft + 4 && frogLeft < objRight - 4) {
        onPlatform = true;
        // Ride the platform
        this.frogX += lane.dir * lane.speed;
        this.frogTargetX += lane.dir * lane.speed;
        break;
      }
    }

    if (!onPlatform) {
      return this._die('splash');
    }

    // Check if frog went off screen while riding
    if (this.frogX < GRID_OFFSET_X - CELL || this.frogX > GRID_OFFSET_X + COLS * CELL + CELL) {
      return this._die('splash');
    }

    return null;
  }

  _checkRoad() {
    const lane = this.lanes[this.frogRow];
    if (!lane || lane.type !== 'road') return null;

    const frogLeft = this.frogX - CELL * 0.35;
    const frogRight = this.frogX + CELL * 0.35;
    const frogTop = this.frogY - CELL * 0.35;
    const frogBottom = this.frogY + CELL * 0.35;

    const laneY = GRID_OFFSET_Y + lane.row * CELL;

    for (const obj of lane.objects) {
      const carLeft = obj.x;
      const carRight = obj.x + obj.width;
      const carTop = laneY + 4;
      const carBottom = laneY + CELL - 4;

      if (frogRight > carLeft && frogLeft < carRight &&
          frogBottom > carTop && frogTop < carBottom) {
        return this._die('squish');
      }
    }

    return null;
  }

  _die(type) {
    this.state = 'dying';
    this.deathTimer = 1.0; // seconds for death animation
    this.deathType = type;
    return type;
  }

  /**
   * Check if level complete timer has expired and advance level.
   */
  checkLevelComplete(dt) {
    if (this.state === 'won') {
      this.levelCompleteTimer -= dt / 60;
      if (this.levelCompleteTimer <= 0) {
        this.nextLevel();
        return true;
      }
    }
    return false;
  }
}
