/**
 * MEME CROSS -- Game Engine
 * Crossy Road clone with procedural lane generation.
 * Pure state + logic, no rendering.
 */

export const W = 400;
export const H = 700;

/** Grid cell size */
export const CELL = 35;

/** Number of columns in the grid */
export const COLS = Math.floor(W / CELL);  // 11

/** Visible lanes on screen */
const VISIBLE_LANES = Math.ceil(H / CELL) + 4;

/** How long the player can idle before camera pushes them */
const IDLE_TIMEOUT_FRAMES = 360; // ~6 seconds at 60fps

/** Lane types */
const LANE_GRASS = 'grass';
const LANE_ROAD = 'road';
const LANE_RIVER = 'river';
const LANE_RAILROAD = 'railroad';

/**
 * Create a new game state.
 *
 * @returns {Object} Game state
 */
export function createCrossyState() {
  const state = {
    // Player grid position (col, row)
    playerCol: Math.floor(COLS / 2),
    playerRow: 0,

    // Smooth animation offset for hop
    hopAnim: { active: false, fromX: 0, fromY: 0, toX: 0, toY: 0, t: 0 },

    // Camera offset (in pixels, scrolls up as player advances)
    cameraY: 0,
    targetCameraY: 0,

    // Score = max row reached
    score: 0,
    maxRow: 0,

    // Lanes map: row index -> lane data
    lanes: new Map(),

    // Lowest generated row
    generatedUpTo: 0,

    // Idle timer
    idleTimer: 0,

    // Game state
    alive: true,
    deathType: null, // 'car', 'water', 'train', 'crushed'
    deathTimer: 0,

    // Coin positions: row -> col (sparse)
    coins: new Map(),
    coinsCollected: 0,

    // Train warning
    trainWarning: null, // { row, timer }

    // Frame counter
    frame: 0,
  };

  // Generate initial lanes
  generateLanes(state, -5, VISIBLE_LANES + 5);

  return state;
}

/**
 * Generate lane data for rows in range [fromRow, toRow).
 */
function generateLanes(state, fromRow, toRow) {
  for (let row = fromRow; row < toRow; row++) {
    if (state.lanes.has(row)) continue;

    let type;
    if (row <= 0) {
      // Starting area is always grass
      type = LANE_GRASS;
    } else {
      type = pickLaneType(state, row);
    }

    const lane = createLane(type, row);
    state.lanes.set(row, lane);

    // Occasionally place a coin on grass lanes
    if (type === LANE_GRASS && row > 0 && Math.random() < 0.15) {
      state.coins.set(row, Math.floor(Math.random() * COLS));
    }
  }
}

/**
 * Pick a lane type with some rules to avoid bad sequences.
 */
function pickLaneType(state, row) {
  const prev = state.lanes.get(row - 1);
  const prev2 = state.lanes.get(row - 2);

  // Count consecutive same types
  let consecutiveRiver = 0;
  let consecutiveRoad = 0;
  for (let r = row - 1; r >= row - 5; r--) {
    const l = state.lanes.get(r);
    if (!l) break;
    if (l.type === LANE_RIVER) consecutiveRiver++;
    else break;
  }
  for (let r = row - 1; r >= row - 5; r--) {
    const l = state.lanes.get(r);
    if (!l) break;
    if (l.type === LANE_ROAD) consecutiveRoad++;
    else break;
  }

  // Weighted random selection
  const weights = {
    [LANE_GRASS]: 25,
    [LANE_ROAD]: 35,
    [LANE_RIVER]: 25,
    [LANE_RAILROAD]: 8,
  };

  // Limit consecutive types
  if (consecutiveRiver >= 3) weights[LANE_RIVER] = 0;
  if (consecutiveRoad >= 4) weights[LANE_ROAD] = 0;

  // Don't place railroad after railroad
  if (prev && prev.type === LANE_RAILROAD) weights[LANE_RAILROAD] = 0;

  // Ensure at least one safe lane every few rows
  if (prev && prev.type !== LANE_GRASS && prev2 && prev2.type !== LANE_GRASS) {
    weights[LANE_GRASS] += 30;
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const [type, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return type;
  }

  return LANE_GRASS;
}

/**
 * Create lane data for a given type and row.
 */
function createLane(type, row) {
  const lane = {
    type,
    row,
    // Obstacles/platforms array
    entities: [],
    // Direction: 1 = right, -1 = left
    direction: Math.random() < 0.5 ? 1 : -1,
    speed: 0,
  };

  switch (type) {
    case LANE_GRASS: {
      // Place some trees/bushes as obstacles
      const numTrees = Math.floor(Math.random() * 3);
      const usedCols = new Set();
      for (let i = 0; i < numTrees; i++) {
        let col;
        let attempts = 0;
        do {
          col = Math.floor(Math.random() * COLS);
          attempts++;
        } while (usedCols.has(col) && attempts < 20);
        // Don't block the middle start column on row 0
        if (row === 0 && col === Math.floor(COLS / 2)) continue;
        usedCols.add(col);
        lane.entities.push({ type: 'tree', col, variant: Math.floor(Math.random() * 3) });
      }
      break;
    }

    case LANE_ROAD: {
      // Speed increases with distance
      const baseSpeed = 0.5 + Math.min(row * 0.008, 1.5);
      lane.speed = baseSpeed * (0.8 + Math.random() * 0.4);

      // Cars with gaps
      const numCars = 2 + Math.floor(Math.random() * 2);
      const spacing = COLS / numCars;
      for (let i = 0; i < numCars; i++) {
        const x = (i * spacing + Math.random() * (spacing * 0.4)) * CELL;
        const carWidth = CELL * (1.2 + Math.random() * 0.8); // 1.2 to 2 cells wide
        lane.entities.push({
          type: 'car',
          x,
          width: carWidth,
          variant: Math.floor(Math.random() * 4),
        });
      }
      break;
    }

    case LANE_RIVER: {
      const baseSpeed = 0.4 + Math.min(row * 0.005, 1.0);
      lane.speed = baseSpeed * (0.7 + Math.random() * 0.5);

      // Logs/lily pads
      const numLogs = 2 + Math.floor(Math.random() * 2);
      const spacing = (COLS * CELL) / numLogs;
      for (let i = 0; i < numLogs; i++) {
        const x = i * spacing + Math.random() * (spacing * 0.3);
        const logWidth = CELL * (1.8 + Math.random() * 1.5); // 1.8 to 3.3 cells
        const isLily = Math.random() < 0.2;
        lane.entities.push({
          type: isLily ? 'lily' : 'log',
          x,
          width: isLily ? CELL * 0.9 : logWidth,
        });
      }
      break;
    }

    case LANE_RAILROAD: {
      lane.speed = 4 + Math.random() * 2; // Very fast
      lane.trainTimer = 180 + Math.floor(Math.random() * 240); // Frames until train
      lane.trainActive = false;
      lane.trainX = 0;
      lane.warningTimer = 0;
      lane.trainPassed = false;
      break;
    }
  }

  return lane;
}

/**
 * Process a hop in the given direction.
 *
 * @param {Object} state
 * @param {'forward'|'backward'|'left'|'right'} direction
 */
export function hop(state, direction) {
  if (!state.alive) return;
  if (state.hopAnim.active) return;

  let newCol = state.playerCol;
  let newRow = state.playerRow;

  switch (direction) {
    case 'forward':  newRow += 1; break;
    case 'backward': newRow -= 1; break;
    case 'left':     newCol -= 1; break;
    case 'right':    newCol += 1; break;
  }

  // Bounds check
  if (newCol < 0 || newCol >= COLS) return;

  // Can't go below camera
  const cameraRow = Math.floor(state.cameraY / CELL) - 2;
  if (newRow < cameraRow) return;

  // Check if destination has a tree
  const destLane = state.lanes.get(newRow);
  if (destLane && destLane.type === LANE_GRASS) {
    for (const entity of destLane.entities) {
      if (entity.type === 'tree' && entity.col === newCol) {
        return; // Blocked by tree
      }
    }
  }

  // Start hop animation
  state.hopAnim = {
    active: true,
    fromX: state.playerCol * CELL + CELL / 2,
    fromY: state.playerRow * CELL,
    toX: newCol * CELL + CELL / 2,
    toY: newRow * CELL,
    t: 0,
  };

  state.playerCol = newCol;
  state.playerRow = newRow;
  state.idleTimer = 0;

  // Update score
  if (newRow > state.maxRow) {
    state.score += (newRow - state.maxRow);
    state.maxRow = newRow;
  }

  // Check for coin
  if (state.coins.has(newRow) && state.coins.get(newRow) === newCol) {
    state.coins.delete(newRow);
    state.coinsCollected++;
    state.score += 5;
  }

  return true; // hop succeeded
}

/**
 * Update game state.
 *
 * @param {Object} state
 * @param {number} dt - Delta time normalized (1.0 = one frame at 60fps)
 * @returns {{ event: string|null, eventData: any }}
 */
export function update(state, dt) {
  let event = null;
  let eventData = null;

  state.frame += dt;

  if (!state.alive) {
    state.deathTimer += dt;
    if (state.deathTimer > 60) { // ~1 second
      return { event: 'game-over-ready', eventData: null };
    }
    return { event: null, eventData: null };
  }

  // Update hop animation
  if (state.hopAnim.active) {
    state.hopAnim.t += dt * 0.15;
    if (state.hopAnim.t >= 1) {
      state.hopAnim.active = false;
      state.hopAnim.t = 1;
    }
  }

  // Update camera to follow player
  state.targetCameraY = (state.playerRow - 10) * CELL;
  if (state.targetCameraY < 0) state.targetCameraY = 0;
  state.cameraY += (state.targetCameraY - state.cameraY) * 0.08 * dt;

  // Generate lanes ahead
  const topRow = Math.floor(state.cameraY / CELL) + VISIBLE_LANES + 5;
  if (topRow > state.generatedUpTo) {
    generateLanes(state, state.generatedUpTo, topRow);
    state.generatedUpTo = topRow;
  }

  // Clean up old lanes far behind camera
  const bottomRow = Math.floor(state.cameraY / CELL) - 10;
  for (const [row] of state.lanes) {
    if (row < bottomRow) {
      state.lanes.delete(row);
      state.coins.delete(row);
    }
  }

  // Update lane entities
  for (const [, lane] of state.lanes) {
    updateLane(lane, dt, state);
  }

  // Idle timer
  state.idleTimer += dt;
  if (state.idleTimer > IDLE_TIMEOUT_FRAMES) {
    // Push camera forward
    state.targetCameraY += dt * 0.5;
    // Check if player is behind camera
    const playerScreenY = state.playerRow * CELL - state.cameraY;
    if (playerScreenY < -CELL) {
      die(state, 'crushed');
      event = 'death';
      eventData = 'crushed';
    }
  }

  // Collision detection
  if (state.alive && !state.hopAnim.active) {
    const result = checkCollisions(state);
    if (result) {
      die(state, result);
      event = 'death';
      eventData = result;
    }
  }

  return { event, eventData };
}

/**
 * Update a single lane's entities.
 */
function updateLane(lane, dt, state) {
  if (lane.type === LANE_ROAD) {
    for (const entity of lane.entities) {
      entity.x += lane.speed * lane.direction * dt;

      // Wrap around
      const totalWidth = COLS * CELL;
      if (lane.direction > 0 && entity.x > totalWidth) {
        entity.x -= totalWidth + entity.width;
      } else if (lane.direction < 0 && entity.x + entity.width < 0) {
        entity.x += totalWidth + entity.width;
      }
    }
  }

  if (lane.type === LANE_RIVER) {
    for (const entity of lane.entities) {
      entity.x += lane.speed * lane.direction * dt;

      const totalWidth = COLS * CELL;
      if (lane.direction > 0 && entity.x > totalWidth) {
        entity.x -= totalWidth + entity.width;
      } else if (lane.direction < 0 && entity.x + entity.width < 0) {
        entity.x += totalWidth + entity.width;
      }
    }

    // If player is on this river lane, carry them
    if (state.playerRow === lane.row && state.alive && !state.hopAnim.active) {
      const onPlatform = getPlayerPlatform(state, lane);
      if (onPlatform) {
        // Carry player with platform
        const pixelMove = lane.speed * lane.direction * dt;
        const colMove = pixelMove / CELL;
        // We track sub-cell position via a drift accumulator
        if (!state.riverDrift) state.riverDrift = 0;
        state.riverDrift += colMove;

        if (Math.abs(state.riverDrift) >= 1) {
          const steps = Math.trunc(state.riverDrift);
          state.playerCol += steps;
          state.riverDrift -= steps;

          // Fall off edges
          if (state.playerCol < 0 || state.playerCol >= COLS) {
            die(state, 'water');
          }
        }
      }
    }
  }

  if (lane.type === LANE_RAILROAD) {
    if (!lane.trainPassed) {
      lane.trainTimer -= dt;

      if (lane.trainTimer <= 90 && lane.trainTimer > 0) {
        // Warning phase
        lane.warningTimer += dt;
      }

      if (lane.trainTimer <= 0 && !lane.trainActive) {
        lane.trainActive = true;
        lane.trainX = lane.direction > 0 ? -COLS * CELL : COLS * CELL * 2;
      }

      if (lane.trainActive) {
        lane.trainX += lane.speed * lane.direction * dt;

        const totalWidth = COLS * CELL;
        if (lane.direction > 0 && lane.trainX > totalWidth * 2) {
          lane.trainPassed = true;
          lane.trainActive = false;
        } else if (lane.direction < 0 && lane.trainX < -totalWidth) {
          lane.trainPassed = true;
          lane.trainActive = false;
        }
      }
    }
  }
}

/**
 * Check if the player is standing on a log/lily pad.
 */
function getPlayerPlatform(state, lane) {
  const px = state.playerCol * CELL;
  const pw = CELL;

  for (const entity of lane.entities) {
    const ex = entity.x;
    const ew = entity.width;

    // Check overlap
    if (px + pw > ex + 4 && px < ex + ew - 4) {
      return entity;
    }
  }

  return null;
}

/**
 * Check all collisions for the player.
 */
function checkCollisions(state) {
  const lane = state.lanes.get(state.playerRow);
  if (!lane) return null;

  const px = state.playerCol * CELL;
  const pw = CELL * 0.6;
  const pOffset = CELL * 0.2; // Center the hitbox

  if (lane.type === LANE_ROAD) {
    for (const entity of lane.entities) {
      if (entity.type === 'car') {
        // AABB collision
        if (px + pOffset + pw > entity.x && px + pOffset < entity.x + entity.width) {
          return 'car';
        }
      }
    }
  }

  if (lane.type === LANE_RIVER) {
    const platform = getPlayerPlatform(state, lane);
    if (!platform) {
      return 'water';
    }
  }

  if (lane.type === LANE_RAILROAD) {
    if (lane.trainActive) {
      const trainWidth = COLS * CELL * 1.5;
      const trainLeft = lane.direction > 0 ? lane.trainX : lane.trainX - trainWidth;
      const trainRight = trainLeft + trainWidth;

      if (px + pOffset + pw > trainLeft && px + pOffset < trainRight) {
        return 'train';
      }
    }
  }

  return null;
}

/**
 * Kill the player.
 */
function die(state, type) {
  state.alive = false;
  state.deathType = type;
  state.deathTimer = 0;
}

/**
 * Get all lanes visible on screen.
 *
 * @param {Object} state
 * @returns {Array} Array of lane objects with row info
 */
export function getLanes(state) {
  const bottomRow = Math.floor(state.cameraY / CELL) - 2;
  const topRow = bottomRow + VISIBLE_LANES + 4;
  const result = [];

  for (let row = bottomRow; row <= topRow; row++) {
    const lane = state.lanes.get(row);
    if (lane) result.push(lane);
  }

  return result;
}
