/**
 * MEME FROGGER -- Renderer
 * Draws the game state onto the canvas.
 */

import {
  COLS, ROWS, CELL, W,
  GRID_OFFSET_X, GRID_OFFSET_Y,
  ROW_HOME, ROW_RIVER_START, ROW_RIVER_END,
  ROW_SAFE_MIDDLE, ROW_ROAD_START, ROW_ROAD_END, ROW_START,
  HOME_SLOT_COUNT,
} from './frogger.js';

const CANVAS_H = 700;

// Colors
const COLOR_GRASS = '#2d5a1e';
const COLOR_GRASS_LIGHT = '#3a6e28';
const COLOR_ROAD = '#333340';
const COLOR_ROAD_LINE = '#555566';
const COLOR_WATER = '#1a4a7a';
const COLOR_WATER_DARK = '#123960';
const COLOR_LOG = '#8B5E34';
const COLOR_LOG_DARK = '#6B4423';
const COLOR_TURTLE_SHELL = '#2d6b3e';
const COLOR_TURTLE_DARK = '#1a4a2a';
const COLOR_HOME_BG = '#0d3320';
const COLOR_HOME_SLOT = '#1a5a3a';
const COLOR_HOME_FILLED = '#4ecca3';
const COLOR_FROG = '#4ecca3';
const COLOR_FROG_DARK = '#39a67d';
const COLOR_FROG_EYE = '#ffffff';
const COLOR_FROG_PUPIL = '#111111';
const COLOR_SIDEBAR = '#111122';
const COLOR_HUD_TEXT = '#e8e8e8';
const COLOR_HUD_DIM = '#8a8a9a';
const COLOR_TIMER_WARN = '#e74c3c';
const COLOR_TIMER_OK = '#4ecca3';
const COLOR_DEATH_SPLASH = '#4a9eff';
const COLOR_DEATH_SQUISH = '#e74c3c';

/**
 * Draw the complete game frame.
 */
export function render(ctx, game) {
  // Clear
  ctx.fillStyle = COLOR_SIDEBAR;
  ctx.fillRect(0, 0, W, CANVAS_H);

  // Draw rows from top to bottom
  for (let row = 0; row < ROWS; row++) {
    const y = GRID_OFFSET_Y + row * CELL;

    if (row === ROW_HOME) {
      // Home row
      drawHomeRow(ctx, y, game.homeSlots);
    } else if (row >= ROW_RIVER_START && row <= ROW_RIVER_END) {
      // Water background
      const shade = row % 2 === 0 ? COLOR_WATER : COLOR_WATER_DARK;
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, W, CELL);
      // Draw river objects
      drawRiverLane(ctx, game.lanes[row], y);
    } else if (row === ROW_SAFE_MIDDLE || row === ROW_START) {
      // Safe zones (grass)
      const shade = row === ROW_SAFE_MIDDLE ? COLOR_GRASS : COLOR_GRASS_LIGHT;
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, W, CELL);
      // Grass tufts
      drawGrassTufts(ctx, y);
    } else if (row >= ROW_ROAD_START && row <= ROW_ROAD_END) {
      // Road
      ctx.fillStyle = COLOR_ROAD;
      ctx.fillRect(0, y, W, CELL);
      // Lane markings
      if (row < ROW_ROAD_END) {
        drawRoadMarkings(ctx, y + CELL);
      }
      // Draw cars
      drawRoadLane(ctx, game.lanes[row], y);
    }
  }

  // Draw frog
  if (game.state === 'alive' || game.state === 'won') {
    drawFrog(ctx, game.frogX, game.frogY);
  } else if (game.state === 'dying') {
    drawDeathAnimation(ctx, game.frogX, game.frogY, game.deathType, game.deathTimer);
  }

  // HUD
  drawHUD(ctx, game);
}

function drawHomeRow(ctx, y, homeSlots) {
  // Dark green background
  ctx.fillStyle = COLOR_HOME_BG;
  ctx.fillRect(0, y, W, CELL);

  // Draw slots
  for (const slot of homeSlots) {
    const slotW = CELL * 1.2;
    const slotH = CELL * 0.8;
    const sx = slot.x - slotW / 2;
    const sy = y + (CELL - slotH) / 2;

    if (slot.filled) {
      ctx.fillStyle = COLOR_HOME_FILLED;
      ctx.fillRect(sx, sy, slotW, slotH);
      // Draw small frog icon
      drawFrog(ctx, slot.x, y + CELL / 2, 0.5);
    } else {
      ctx.fillStyle = COLOR_HOME_SLOT;
      ctx.fillRect(sx, sy, slotW, slotH);
      // Inner darker area
      ctx.fillStyle = COLOR_HOME_BG;
      ctx.fillRect(sx + 3, sy + 3, slotW - 6, slotH - 6);
    }
  }

  // Hedges between slots
  ctx.fillStyle = COLOR_HOME_BG;
  // Top and bottom borders
  ctx.fillRect(0, y, W, 2);
  ctx.fillRect(0, y + CELL - 2, W, 2);
}

function drawRiverLane(ctx, lane, y) {
  if (!lane || !lane.objects) return;

  for (const obj of lane.objects) {
    const ox = obj.x;
    const ow = obj.width;
    const oh = CELL - 4;
    const oy = y + 2;

    if (ox + ow < -10 || ox > W + 10) continue; // offscreen

    if (obj.type === 'log') {
      // Main log body
      ctx.fillStyle = COLOR_LOG;
      ctx.beginPath();
      ctx.roundRect(ox, oy, ow, oh, 6);
      ctx.fill();

      // Wood grain lines
      ctx.strokeStyle = COLOR_LOG_DARK;
      ctx.lineWidth = 1.5;
      const grainCount = Math.floor(ow / 15);
      for (let i = 1; i <= grainCount; i++) {
        const gx = ox + (ow / (grainCount + 1)) * i;
        ctx.beginPath();
        ctx.moveTo(gx, oy + 4);
        ctx.lineTo(gx, oy + oh - 4);
        ctx.stroke();
      }

      // Log ends (darker circles)
      ctx.fillStyle = COLOR_LOG_DARK;
      ctx.beginPath();
      ctx.arc(ox + 8, oy + oh / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox + ow - 8, oy + oh / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Turtle
      const turtleCount = Math.floor(ow / CELL);
      for (let t = 0; t < turtleCount; t++) {
        const tx = ox + t * CELL + CELL / 2;
        const ty = y + CELL / 2;

        // Shell
        ctx.fillStyle = COLOR_TURTLE_SHELL;
        ctx.beginPath();
        ctx.ellipse(tx, ty, CELL * 0.38, CELL * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell pattern
        ctx.strokeStyle = COLOR_TURTLE_DARK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(tx, ty, CELL * 0.22, CELL * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#3a8a50';
        const headDir = lane.dir > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(tx + headDir * CELL * 0.35, ty, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawRoadLane(ctx, lane, y) {
  if (!lane || !lane.objects) return;

  for (const obj of lane.objects) {
    const ox = obj.x;
    const ow = obj.width;

    if (ox + ow < -10 || ox > W + 10) continue; // offscreen

    const oh = CELL - 8;
    const oy = y + 4;

    // Car body
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.roundRect(ox, oy, ow, oh, 4);
    ctx.fill();

    // Car roof (darker)
    const roofInset = ow * 0.2;
    ctx.fillStyle = darkenColor(obj.color, 0.3);
    ctx.fillRect(ox + roofInset, oy + 3, ow - roofInset * 2, oh - 6);

    // Headlights / taillights
    const lightY = oy + oh / 2;
    if (lane.dir > 0) {
      // Headlights on right
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(ox + ow - 5, oy + 3, 4, 4);
      ctx.fillRect(ox + ow - 5, oy + oh - 7, 4, 4);
      // Taillights on left
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(ox + 1, oy + 3, 4, 4);
      ctx.fillRect(ox + 1, oy + oh - 7, 4, 4);
    } else {
      // Headlights on left
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(ox + 1, oy + 3, 4, 4);
      ctx.fillRect(ox + 1, oy + oh - 7, 4, 4);
      // Taillights on right
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(ox + ow - 5, oy + 3, 4, 4);
      ctx.fillRect(ox + ow - 5, oy + oh - 7, 4, 4);
    }

    // Wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(ox + 4, oy - 1, 8, 3);
    ctx.fillRect(ox + ow - 12, oy - 1, 8, 3);
    ctx.fillRect(ox + 4, oy + oh - 2, 8, 3);
    ctx.fillRect(ox + ow - 12, oy + oh - 2, 8, 3);
  }
}

function drawRoadMarkings(ctx, y) {
  ctx.strokeStyle = COLOR_ROAD_LINE;
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawGrassTufts(ctx, y) {
  ctx.fillStyle = '#4a8a3a';
  for (let i = 0; i < 8; i++) {
    const tx = (i * 53 + 15) % W;
    const ty = y + CELL / 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty + 4);
    ctx.lineTo(tx - 3, ty - 5);
    ctx.lineTo(tx, ty - 2);
    ctx.lineTo(tx + 3, ty - 5);
    ctx.lineTo(tx, ty + 4);
    ctx.fill();
  }
}

function drawFrog(ctx, x, y, scale = 1.0) {
  const r = CELL * 0.38 * scale;

  // Body
  ctx.fillStyle = COLOR_FROG;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Darker belly outline
  ctx.strokeStyle = COLOR_FROG_DARK;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes
  const eyeOffset = r * 0.55;
  const eyeR = r * 0.35;
  const pupilR = r * 0.18;

  // Left eye
  ctx.fillStyle = COLOR_FROG_EYE;
  ctx.beginPath();
  ctx.arc(x - eyeOffset, y - eyeOffset * 0.5, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOR_FROG_PUPIL;
  ctx.beginPath();
  ctx.arc(x - eyeOffset, y - eyeOffset * 0.5, pupilR, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = COLOR_FROG_EYE;
  ctx.beginPath();
  ctx.arc(x + eyeOffset, y - eyeOffset * 0.5, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOR_FROG_PUPIL;
  ctx.beginPath();
  ctx.arc(x + eyeOffset, y - eyeOffset * 0.5, pupilR, 0, Math.PI * 2);
  ctx.fill();

  // Legs (small arcs at sides)
  if (scale >= 0.8) {
    ctx.fillStyle = COLOR_FROG_DARK;
    // Back legs
    ctx.beginPath();
    ctx.ellipse(x - r * 0.9, y + r * 0.6, r * 0.3, r * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r * 0.9, y + r * 0.6, r * 0.3, r * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDeathAnimation(ctx, x, y, type, timer) {
  const progress = 1 - timer; // 0 to 1

  if (type === 'splash') {
    // Water ripples expanding
    const maxR = CELL * 1.5;
    for (let i = 0; i < 3; i++) {
      const t = Math.max(0, progress - i * 0.15);
      const r = t * maxR;
      const alpha = Math.max(0, 1 - t * 1.5);
      ctx.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Squish - frog flattens
    const squish = 1 + progress * 2;
    const height = 1 - progress * 0.8;
    ctx.fillStyle = COLOR_DEATH_SQUISH;
    ctx.beginPath();
    ctx.ellipse(x, y, CELL * 0.4 * squish, CELL * 0.4 * height, 0, 0, Math.PI * 2);
    ctx.fill();

    // X eyes
    if (progress > 0.3) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      const ex = CELL * 0.15;
      // Left X
      ctx.beginPath();
      ctx.moveTo(x - ex - 3, y - 5 - 3);
      ctx.lineTo(x - ex + 3, y - 5 + 3);
      ctx.moveTo(x - ex + 3, y - 5 - 3);
      ctx.lineTo(x - ex - 3, y - 5 + 3);
      ctx.stroke();
      // Right X
      ctx.beginPath();
      ctx.moveTo(x + ex - 3, y - 5 - 3);
      ctx.lineTo(x + ex + 3, y - 5 + 3);
      ctx.moveTo(x + ex + 3, y - 5 - 3);
      ctx.lineTo(x + ex - 3, y - 5 + 3);
      ctx.stroke();
    }
  }
}

function drawHUD(ctx, game) {
  const hudY = GRID_OFFSET_Y - 8;
  const bottomY = GRID_OFFSET_Y + ROWS * CELL + 5;

  // Score (top left)
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`SCORE: ${game.score}`, 8, hudY);

  // Level (top center)
  ctx.textAlign = 'center';
  ctx.fillText(`LVL ${game.level}`, W / 2, hudY);

  // Lives (top right)
  ctx.textAlign = 'right';
  let livesStr = '';
  for (let i = 0; i < game.lives; i++) livesStr += '\u2764 '; // heart
  ctx.fillStyle = '#e74c3c';
  ctx.fillText(livesStr.trim(), W - 8, hudY);

  // Timer bar (bottom)
  const barW = W - 20;
  const barH = 8;
  const barX = 10;
  const barY = bottomY + 8;

  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(barX, barY, barW, barH);

  // Fill
  const timerPct = Math.max(0, game.timer / 30);
  ctx.fillStyle = timerPct < 0.3 ? COLOR_TIMER_WARN : COLOR_TIMER_OK;
  ctx.fillRect(barX, barY, barW * timerPct, barH);

  // Timer text
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`TIME: ${Math.ceil(game.timer)}s`, W / 2, barY + barH + 14);

  // Home slots filled indicator
  const filled = game.homeSlots.filter(s => s.filled).length;
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.textAlign = 'right';
  ctx.fillText(`HOMES: ${filled}/5`, W - 8, barY + barH + 14);
}

/**
 * Darken a hex color by a factor (0-1).
 */
function darkenColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.floor(r * (1 - factor));
  const dg = Math.floor(g * (1 - factor));
  const db = Math.floor(b * (1 - factor));
  return `rgb(${dr},${dg},${db})`;
}
