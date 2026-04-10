/**
 * MEME COPTER -- Renderer
 * Canvas drawing: cave walls, copter, trail, obstacles, HUD.
 */

import { W, H, getCopterConstants, getCaveSegmentWidth } from './copter.js';

const { size: COPTER_SIZE, x: COPTER_X } = getCopterConstants();
const SEG_W = getCaveSegmentWidth();

/** Colors */
const BG_COLOR = '#0a0a1a';
const CAVE_WALL_COLOR = '#1a3a2a';
const CAVE_EDGE_COLOR = '#00ff88';
const OBSTACLE_COLOR = '#ff4444';
const OBSTACLE_EDGE_COLOR = '#ff8866';
const COPTER_COLOR = '#00ff88';
const COPTER_THRUST_COLOR = '#ffee44';
const TRAIL_COLOR = '#00ff88';
const HUD_COLOR = '#ffffff';
const HUD_SHADOW = '#000000';

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from copter.js
 */
export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  drawCave(ctx, state);
  drawObstacles(ctx, state);
  drawTrail(ctx, state);
  drawCopter(ctx, state);
  drawHUD(ctx, state);
}

/**
 * Draw the cave ceiling and floor.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawCave(ctx, state) {
  const cameraX = state.distance;
  const startSeg = Math.floor(cameraX / SEG_W);
  const offsetInSeg = cameraX % SEG_W;
  const caveBaseIndex = Math.floor(state.caveOffset / SEG_W);

  // Draw ceiling fill
  ctx.fillStyle = CAVE_WALL_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i <= Math.ceil(W / SEG_W) + 2; i++) {
    const segIdx = startSeg + i - caveBaseIndex;
    if (segIdx < 0 || segIdx >= state.cave.length) continue;
    const seg = state.cave[segIdx];
    const screenX = i * SEG_W - offsetInSeg;
    ctx.lineTo(screenX, seg.ceiling);
  }
  ctx.lineTo(W + SEG_W, 0);
  ctx.closePath();
  ctx.fill();

  // Draw floor fill
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let i = 0; i <= Math.ceil(W / SEG_W) + 2; i++) {
    const segIdx = startSeg + i - caveBaseIndex;
    if (segIdx < 0 || segIdx >= state.cave.length) continue;
    const seg = state.cave[segIdx];
    const screenX = i * SEG_W - offsetInSeg;
    ctx.lineTo(screenX, seg.floor);
  }
  ctx.lineTo(W + SEG_W, H);
  ctx.closePath();
  ctx.fill();

  // Draw ceiling edge line
  ctx.strokeStyle = CAVE_EDGE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= Math.ceil(W / SEG_W) + 2; i++) {
    const segIdx = startSeg + i - caveBaseIndex;
    if (segIdx < 0 || segIdx >= state.cave.length) continue;
    const seg = state.cave[segIdx];
    const screenX = i * SEG_W - offsetInSeg;
    if (!started) {
      ctx.moveTo(screenX, seg.ceiling);
      started = true;
    } else {
      ctx.lineTo(screenX, seg.ceiling);
    }
  }
  ctx.stroke();

  // Draw floor edge line
  ctx.beginPath();
  started = false;
  for (let i = 0; i <= Math.ceil(W / SEG_W) + 2; i++) {
    const segIdx = startSeg + i - caveBaseIndex;
    if (segIdx < 0 || segIdx >= state.cave.length) continue;
    const seg = state.cave[segIdx];
    const screenX = i * SEG_W - offsetInSeg;
    if (!started) {
      ctx.moveTo(screenX, seg.floor);
      started = true;
    } else {
      ctx.lineTo(screenX, seg.floor);
    }
  }
  ctx.stroke();
}

/**
 * Draw obstacles.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawObstacles(ctx, state) {
  const cameraX = state.distance;

  for (const obs of state.obstacles) {
    const screenX = obs.x - cameraX;
    if (screenX + obs.width < -10 || screenX > W + 10) continue;

    ctx.fillStyle = OBSTACLE_COLOR;
    ctx.fillRect(screenX, obs.y, obs.width, obs.height);

    ctx.strokeStyle = OBSTACLE_EDGE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenX, obs.y, obs.width, obs.height);
  }
}

/**
 * Draw the copter trail.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawTrail(ctx, state) {
  if (state.trail.length < 2) return;

  const len = state.trail.length;
  for (let i = 1; i < len; i++) {
    const alpha = (i / len) * 0.5;
    const thickness = (i / len) * 3;
    ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
    ctx.lineWidth = thickness;

    // Trail positions are at COPTER_X but spread behind it
    const spreadX = COPTER_X - (len - i) * 3;
    const prevSpreadX = COPTER_X - (len - i + 1) * 3;

    ctx.beginPath();
    ctx.moveTo(prevSpreadX, state.trail[i - 1].y);
    ctx.lineTo(spreadX, state.trail[i].y);
    ctx.stroke();
  }
}

/**
 * Draw the helicopter.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawCopter(ctx, state) {
  const cx = COPTER_X;
  const cy = state.copterY;
  const half = COPTER_SIZE / 2;

  // Thrust glow
  if (state.thrusting && state.alive) {
    ctx.shadowColor = COPTER_THRUST_COLOR;
    ctx.shadowBlur = 12;

    // Exhaust particles below
    const exLen = 4 + Math.random() * 8;
    ctx.fillStyle = COPTER_THRUST_COLOR;
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.fillRect(cx - 3, cy + half, 6, exLen);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Copter body
  ctx.fillStyle = state.alive ? COPTER_COLOR : '#666666';
  ctx.shadowColor = state.alive ? COPTER_COLOR : '#333333';
  ctx.shadowBlur = state.alive ? 6 : 0;
  ctx.fillRect(cx - half, cy - half, COPTER_SIZE, COPTER_SIZE);
  ctx.shadowBlur = 0;

  // Rotor line on top
  const rotorPhase = (Date.now() % 200) / 200;
  const rotorWidth = half + 4 + Math.sin(rotorPhase * Math.PI * 2) * 3;
  ctx.strokeStyle = state.alive ? COPTER_COLOR : '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - rotorWidth, cy - half - 3);
  ctx.lineTo(cx + rotorWidth, cy - half - 3);
  ctx.stroke();

  // Small rotor mast
  ctx.beginPath();
  ctx.moveTo(cx, cy - half);
  ctx.lineTo(cx, cy - half - 3);
  ctx.stroke();
}

/**
 * Draw the HUD (score, distance).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
function drawHUD(ctx, state) {
  // Score
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = HUD_SHADOW;
  ctx.fillText(String(state.score), W - 14, 34);
  ctx.fillStyle = HUD_COLOR;
  ctx.fillText(String(state.score), W - 15, 33);

  // "DISTANCE" label
  ctx.font = '10px monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('DISTANCE', W - 15, 48);
}

