/**
 * MEME CROSS -- Renderer
 * Canvas rendering for the crossy road game.
 */

import { W, H, CELL, COLS, getLanes } from './crossy.js';
import { lerp } from '../../shared/utils.js';

// Color palettes for lane types
const GRASS_COLORS = ['#4a8c2a', '#3d7a22'];
const ROAD_COLORS = ['#555555', '#4a4a4a'];
const RIVER_COLORS = ['#2266aa', '#1d5c99'];
const RAILROAD_COLOR = '#6b5b3a';
const RAIL_STRIPE = '#888888';

// Car colors
const CAR_COLORS = ['#e63946', '#457b9d', '#f4a261', '#9b5de5'];

// Tree colors
const TREE_TRUNK = '#5c3a1e';
const TREE_GREENS = ['#2d6a2d', '#3a8a3a', '#1f5c1f'];

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from crossy.js
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = '#2266aa'; // River blue as default bg
  ctx.fillRect(0, 0, W, H);

  ctx.save();

  // Camera transform: translate so that cameraY is at the bottom of the screen
  // Row 0 is at the bottom, higher rows go up
  // Screen Y = H - (worldY - cameraY)
  const lanes = getLanes(state);

  // Draw lanes back to front (lowest row first since it's at the bottom)
  lanes.sort((a, b) => a.row - b.row);

  for (const lane of lanes) {
    drawLane(ctx, lane, state);
  }

  // Draw coins
  for (const [row, col] of state.coins) {
    const sx = col * CELL;
    const sy = worldToScreen(row, state);
    if (sy > -CELL && sy < H + CELL) {
      drawCoin(ctx, sx + CELL / 2, sy + CELL / 2, state.frame);
    }
  }

  // Draw player
  drawPlayer(ctx, state);

  // Draw train warnings
  for (const lane of lanes) {
    if (lane.type === 'railroad' && lane.warningTimer > 0 && !lane.trainPassed) {
      drawTrainWarning(ctx, lane, state);
    }
  }

  ctx.restore();

  // HUD
  drawHUD(ctx, state);
}

/**
 * Convert a world row to screen Y.
 */
function worldToScreen(row, state) {
  return H - ((row + 1) * CELL - state.cameraY);
}

/**
 * Draw a single lane.
 */
function drawLane(ctx, lane, state) {
  const sy = worldToScreen(lane.row, state);

  // Skip if off screen
  if (sy > H + CELL || sy < -CELL * 2) return;

  switch (lane.type) {
    case 'grass':
      drawGrassLane(ctx, lane, sy);
      break;
    case 'road':
      drawRoadLane(ctx, lane, sy);
      break;
    case 'river':
      drawRiverLane(ctx, lane, sy);
      break;
    case 'railroad':
      drawRailroadLane(ctx, lane, sy, state);
      break;
  }
}

/**
 * Draw grass lane with trees.
 */
function drawGrassLane(ctx, lane, sy) {
  const colorIdx = Math.abs(lane.row) % 2;
  ctx.fillStyle = GRASS_COLORS[colorIdx];
  ctx.fillRect(0, sy, W, CELL);

  // Draw grass tufts
  ctx.fillStyle = '#5ca832';
  for (let i = 0; i < COLS; i++) {
    if ((i + lane.row) % 3 === 0) {
      const tx = i * CELL + CELL / 2;
      ctx.fillRect(tx - 1, sy + CELL - 8, 2, 5);
      ctx.fillRect(tx + 4, sy + CELL - 6, 2, 4);
    }
  }

  // Draw trees
  for (const entity of lane.entities) {
    if (entity.type === 'tree') {
      drawTree(ctx, entity.col * CELL + CELL / 2, sy, entity.variant);
    }
  }
}

/**
 * Draw a tree.
 */
function drawTree(ctx, cx, sy, variant) {
  // Trunk
  ctx.fillStyle = TREE_TRUNK;
  ctx.fillRect(cx - 3, sy + 8, 6, CELL - 8);

  // Foliage (circle-ish)
  ctx.fillStyle = TREE_GREENS[variant % TREE_GREENS.length];
  ctx.beginPath();
  ctx.arc(cx, sy + 8, 12, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(cx - 3, sy + 5, 6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw road lane with cars.
 */
function drawRoadLane(ctx, lane, sy) {
  const colorIdx = Math.abs(lane.row) % 2;
  ctx.fillStyle = ROAD_COLORS[colorIdx];
  ctx.fillRect(0, sy, W, CELL);

  // Lane markings
  ctx.strokeStyle = '#ffffff33';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(0, sy + CELL / 2);
  ctx.lineTo(W, sy + CELL / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw cars
  for (const entity of lane.entities) {
    if (entity.type === 'car') {
      drawCar(ctx, entity, sy, lane.direction);
    }
  }
}

/**
 * Draw a car.
 */
function drawCar(ctx, car, sy, direction) {
  const color = CAR_COLORS[car.variant % CAR_COLORS.length];
  const x = car.x;
  const y = sy + 4;
  const h = CELL - 8;
  const w = car.width;

  // Body
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();

  // Roof (darker)
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + w * 0.25, y + 2, w * 0.5, h - 4);

  // Headlights/taillights
  const frontX = direction > 0 ? x + w - 4 : x + 1;
  ctx.fillStyle = direction > 0 ? '#ffee55' : '#ff4444';
  ctx.fillRect(frontX, y + 3, 3, 4);
  ctx.fillRect(frontX, y + h - 7, 3, 4);

  // Windshield
  ctx.fillStyle = '#aaddff55';
  const wsX = direction > 0 ? x + w * 0.6 : x + w * 0.15;
  ctx.fillRect(wsX, y + 3, w * 0.2, h - 6);
}

/**
 * Draw river lane with logs/lilies.
 */
function drawRiverLane(ctx, lane, sy) {
  const colorIdx = Math.abs(lane.row) % 2;
  ctx.fillStyle = RIVER_COLORS[colorIdx];
  ctx.fillRect(0, sy, W, CELL);

  // Water shimmer
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 5; i++) {
    const wx = ((i * 83 + lane.row * 37) % W);
    ctx.fillRect(wx, sy + 10 + (i % 3) * 8, 20, 2);
  }

  // Draw platforms
  for (const entity of lane.entities) {
    if (entity.type === 'log') {
      drawLog(ctx, entity, sy);
    } else if (entity.type === 'lily') {
      drawLily(ctx, entity, sy);
    }
  }
}

/**
 * Draw a log.
 */
function drawLog(ctx, log, sy) {
  const x = log.x;
  const y = sy + 5;
  const w = log.width;
  const h = CELL - 10;

  // Log body
  ctx.fillStyle = '#8B6914';
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();

  // Bark lines
  ctx.strokeStyle = '#6b4f10';
  ctx.lineWidth = 1;
  for (let i = 0; i < Math.floor(w / 15); i++) {
    const lx = x + 8 + i * 15;
    ctx.beginPath();
    ctx.moveTo(lx, y + 2);
    ctx.lineTo(lx, y + h - 2);
    ctx.stroke();
  }

  // End caps
  ctx.fillStyle = '#7a5c12';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + h / 2, 3, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w - 3, y + h / 2, 3, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a lily pad.
 */
function drawLily(ctx, lily, sy) {
  const cx = lily.x + lily.width / 2;
  const cy = sy + CELL / 2;
  const r = lily.width / 2 - 2;

  ctx.fillStyle = '#2d8a2d';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0.2, Math.PI * 2 - 0.2);
  ctx.lineTo(cx, cy);
  ctx.fill();

  // Lighter center
  ctx.fillStyle = '#3aa83a';
  ctx.beginPath();
  ctx.arc(cx - 1, cy - 1, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw railroad lane.
 */
function drawRailroadLane(ctx, lane, sy, state) {
  // Ground
  ctx.fillStyle = RAILROAD_COLOR;
  ctx.fillRect(0, sy, W, CELL);

  // Rails
  ctx.fillStyle = RAIL_STRIPE;
  ctx.fillRect(0, sy + 8, W, 3);
  ctx.fillRect(0, sy + CELL - 11, W, 3);

  // Sleepers
  ctx.fillStyle = '#4a3a22';
  for (let i = 0; i < COLS + 1; i++) {
    ctx.fillRect(i * CELL - 2, sy + 4, 4, CELL - 8);
  }

  // Train
  if (lane.trainActive) {
    drawTrain(ctx, lane, sy);
  }
}

/**
 * Draw a train.
 */
function drawTrain(ctx, lane, sy) {
  const trainWidth = COLS * CELL * 1.2;
  const x = lane.direction > 0 ? lane.trainX : lane.trainX - trainWidth;
  const y = sy + 1;
  const h = CELL - 2;

  // Train body
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(x, y, trainWidth, h);

  // Windows
  ctx.fillStyle = '#ffee88';
  const windowSpacing = 30;
  for (let wx = x + 15; wx < x + trainWidth - 15; wx += windowSpacing) {
    ctx.fillRect(wx, y + 5, 12, h - 10);
  }

  // Engine front
  const frontX = lane.direction > 0 ? x + trainWidth - 20 : x;
  ctx.fillStyle = '#aa1111';
  ctx.fillRect(frontX, y, 20, h);

  // Headlight
  ctx.fillStyle = '#ffff88';
  const lightX = lane.direction > 0 ? x + trainWidth - 5 : x + 2;
  ctx.fillRect(lightX, y + h / 2 - 3, 3, 6);
}

/**
 * Draw train warning flashes.
 */
function drawTrainWarning(ctx, lane, state) {
  const sy = worldToScreen(lane.row, state);
  const flash = Math.floor(lane.warningTimer * 0.2) % 2 === 0;

  if (flash) {
    ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
    ctx.fillRect(0, sy, W, CELL);
  }

  // Warning lights on sides
  const lightColor = flash ? '#ff0000' : '#660000';
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.arc(8, sy + CELL / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 8, sy + CELL / 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw the player character.
 */
function drawPlayer(ctx, state) {
  if (state.hopAnim.active) {
    const t = easeOutBack(state.hopAnim.t);
    const px = lerp(state.hopAnim.fromX, state.hopAnim.toX, t);
    const worldRow = lerp(state.hopAnim.fromY, state.hopAnim.toY, t);
    // Convert world row (in pixels) to screen Y
    const sy = H - (worldRow + CELL - state.cameraY);
    // Add a bounce arc
    const bounce = Math.sin(state.hopAnim.t * Math.PI) * 10;

    drawCharacter(ctx, px, sy - bounce, state);
    return;
  }

  const px = state.playerCol * CELL + CELL / 2;
  const sy = worldToScreen(state.playerRow, state);

  drawCharacter(ctx, px, sy, state);
}

/**
 * Draw the actual character sprite.
 */
function drawCharacter(ctx, cx, sy, state) {
  if (!state.alive) {
    // Death animation
    const deathProgress = Math.min(state.deathTimer / 30, 1);

    if (state.deathType === 'water') {
      // Sinking animation
      ctx.globalAlpha = 1 - deathProgress;
      ctx.save();
      ctx.translate(cx, sy + CELL / 2);
      ctx.scale(1 - deathProgress * 0.5, 1 + deathProgress * 0.5);
      drawCharacterBody(ctx, 0, -CELL / 2);
      ctx.restore();
      ctx.globalAlpha = 1;

      // Splash rings
      ctx.strokeStyle = `rgba(255,255,255,${0.5 - deathProgress * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, sy + CELL * 0.7, 10 + deathProgress * 15, 4 + deathProgress * 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    if (state.deathType === 'car' || state.deathType === 'train') {
      // Flatten animation
      ctx.save();
      ctx.translate(cx, sy + CELL);
      ctx.scale(1 + deathProgress, Math.max(0.1, 1 - deathProgress * 0.9));
      drawCharacterBody(ctx, 0, -CELL);
      ctx.restore();
      return;
    }

    drawCharacterBody(ctx, cx, sy);
    return;
  }

  drawCharacterBody(ctx, cx, sy);
}

/**
 * Draw the character body (a cute blocky chicken-like meme creature).
 */
function drawCharacterBody(ctx, cx, sy) {
  const size = CELL - 6;
  const x = cx - size / 2;
  const y = sy + 3;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, sy + CELL - 2, size / 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#ffdd44';
  roundRect(ctx, x, y, size, size, 4);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#ffee88';
  ctx.fillRect(x + 4, y + size * 0.5, size - 8, size * 0.35);

  // Eyes
  const eyeY = y + size * 0.3;
  const eyeSpacing = 5;

  // Eye whites
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - eyeSpacing - 5, eyeY - 3, 7, 7);
  ctx.fillRect(cx + eyeSpacing - 2, eyeY - 3, 7, 7);

  // Pupils
  ctx.fillStyle = '#111111';
  ctx.fillRect(cx - eyeSpacing - 3, eyeY - 1, 4, 4);
  ctx.fillRect(cx + eyeSpacing, eyeY - 1, 4, 4);

  // Beak
  ctx.fillStyle = '#ff8833';
  ctx.beginPath();
  ctx.moveTo(cx - 4, eyeY + 8);
  ctx.lineTo(cx + 4, eyeY + 8);
  ctx.lineTo(cx, eyeY + 13);
  ctx.closePath();
  ctx.fill();

  // Little feet
  ctx.fillStyle = '#ff8833';
  ctx.fillRect(cx - 7, sy + CELL - 5, 4, 5);
  ctx.fillRect(cx + 3, sy + CELL - 5, 4, 5);
}

/**
 * Draw a coin.
 */
function drawCoin(ctx, cx, cy, frame) {
  const bob = Math.sin(frame * 0.08) * 3;

  // Glow
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(cx, cy + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  // Coin body
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(cx, cy + bob, 7, 0, Math.PI * 2);
  ctx.fill();

  // Shine
  ctx.fillStyle = '#ffee88';
  ctx.beginPath();
  ctx.arc(cx - 2, cy + bob - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Dollar sign
  ctx.fillStyle = '#aa8800';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', cx, cy + bob + 1);
}

/**
 * Draw HUD (score, etc.).
 */
function drawHUD(ctx, state) {
  // Score background
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, W / 2 - 40, 8, 80, 32, 8);
  ctx.fill();

  // Score text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(state.score), W / 2, 24);

  // Coins collected
  if (state.coinsCollected > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, W / 2 - 30, 44, 60, 20, 6);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('$' + state.coinsCollected, W / 2, 54);
  }
}

/**
 * Rounded rectangle helper.
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Ease-out-back for bouncy hop feel.
 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
