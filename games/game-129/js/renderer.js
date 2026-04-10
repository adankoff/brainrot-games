/**
 * MEME RHYTHM -- Renderer
 * Draws the rhythm game: lanes, notes, hit zone, HUD, feedback popups.
 */

import {
  NUM_LANES, LANE_COLORS, HIT_ZONE_Y, TRAVEL_TIME_MS,
  GRADE_POINTS, SONG_DURATION_MS,
} from './rhythm.js';

const W = 400;
const H = 700;
const LANE_WIDTH = W / NUM_LANES;
const NOTE_RADIUS = 22;
const HIT_ZONE_THICKNESS = 4;

// Lane x centers
const LANE_X = [80, 200, 320];

// Tap zone circles at bottom
const TAP_ZONE_Y = HIT_ZONE_Y;
const TAP_ZONE_RADIUS = 30;

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./rhythm.js').RhythmState} state
 * @param {number[]} laneTapTimers - Per-lane flash timers (ms remaining)
 */
export function renderGame(ctx, state, laneTapTimers) {
  // Background
  drawBackground(ctx, state.elapsed);

  // Lane dividers
  drawLanes(ctx);

  // Hit zone glow
  drawHitZone(ctx, state.elapsed);

  // Notes
  drawNotes(ctx, state);

  // Tap zones
  drawTapZones(ctx, laneTapTimers);

  // Feedback popups
  drawFeedbacks(ctx, state);

  // HUD
  drawHUD(ctx, state);
}

/**
 * Draw background with subtle scrolling pattern.
 */
function drawBackground(ctx, elapsed) {
  // Dark gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#060616');
  grad.addColorStop(1, '#0a0a2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines scrolling down
  ctx.strokeStyle = 'rgba(255, 0, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSpacing = 40;
  const offset = (elapsed * 0.03) % gridSpacing;
  for (let y = -gridSpacing + offset; y < H; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw lane separator lines.
 */
function drawLanes(ctx) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i < NUM_LANES; i++) {
    const x = i * LANE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
}

/**
 * Draw the hit zone line with a pulsing glow.
 */
function drawHitZone(ctx, elapsed) {
  const pulse = 0.5 + Math.sin(elapsed * 0.004) * 0.3;

  // Glow
  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 15 + pulse * 10;
  ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 + pulse * 0.3})`;
  ctx.lineWidth = HIT_ZONE_THICKNESS;
  ctx.beginPath();
  ctx.moveTo(20, HIT_ZONE_Y);
  ctx.lineTo(W - 20, HIT_ZONE_Y);
  ctx.stroke();
  ctx.restore();

  // Solid line on top
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, HIT_ZONE_Y);
  ctx.lineTo(W - 20, HIT_ZONE_Y);
  ctx.stroke();
}

/**
 * Draw all active notes.
 */
function drawNotes(ctx, state) {
  for (const note of state.notes) {
    if (!note.active) continue;
    if (note.y < -NOTE_RADIUS || note.y > H + NOTE_RADIUS) continue;

    const x = LANE_X[note.lane];
    const y = note.y;
    const color = LANE_COLORS[note.lane];

    // Scale: notes start small and grow as they approach the hit zone
    const distFromHitZone = Math.abs(HIT_ZONE_Y - y);
    const maxDist = HIT_ZONE_Y;
    const scale = 0.5 + 0.5 * (1 - Math.min(distFromHitZone / maxDist, 1));
    const r = NOTE_RADIUS * scale;

    // Glow when close to hit zone
    const proximity = 1 - Math.min(distFromHitZone / 150, 1);
    if (proximity > 0) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 + proximity * 15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Draw tap zone indicators at the hit zone.
 */
function drawTapZones(ctx, laneTapTimers) {
  for (let i = 0; i < NUM_LANES; i++) {
    const x = LANE_X[i];
    const flashAmount = Math.min(laneTapTimers[i] / 150, 1);

    // Outer ring
    ctx.beginPath();
    ctx.arc(x, TAP_ZONE_Y, TAP_ZONE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = flashAmount > 0
      ? LANE_COLORS[i]
      : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2 + flashAmount * 2;
    ctx.stroke();

    // Flash fill on tap
    if (flashAmount > 0) {
      ctx.beginPath();
      ctx.arc(x, TAP_ZONE_Y, TAP_ZONE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = LANE_COLORS[i].replace(')', `, ${flashAmount * 0.3})`).replace('rgb', 'rgba');
      // Simpler approach: just use alpha
      ctx.globalAlpha = flashAmount * 0.3;
      ctx.fillStyle = LANE_COLORS[i];
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Lane label
    ctx.font = '12px "Space Grotesk", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = flashAmount > 0
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(255, 255, 255, 0.25)';
    const labels = ['A', 'S', 'D'];
    ctx.fillText(labels[i], x, TAP_ZONE_Y);
  }
}

/**
 * Draw feedback popups (PERFECT!, GREAT!, etc.).
 */
function drawFeedbacks(ctx, state) {
  for (const fb of state.feedbacks) {
    const alpha = Math.min(fb.timer / 200, 1);
    const scale = fb.timer < 200 ? fb.timer / 200 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${14 + scale * 4}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow for readability
    ctx.shadowColor = fb.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = fb.color;
    ctx.fillText(fb.text, fb.x, fb.y);
    ctx.restore();
  }
}

/**
 * Draw the HUD: score, combo, health, progress.
 */
function drawHUD(ctx, state) {
  ctx.save();

  // Score - top center
  ctx.font = 'bold 28px "Space Grotesk", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.fillText(state.score.toLocaleString(), W / 2, 15);

  // Combo - below score
  if (state.combo > 1) {
    const multiplier = state.getMultiplier();
    const comboColor = multiplier >= 4 ? '#ff00ff' : multiplier >= 3 ? '#ffaa00' : multiplier >= 2 ? '#00ffaa' : '#fff';

    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = comboColor;
    ctx.fillText(`${state.combo} COMBO  x${multiplier}`, W / 2, 48);
  }

  // Health bar - top left
  const hbX = 15;
  const hbY = 12;
  const hbW = 80;
  const hbH = 8;
  const healthPct = state.health / 100;

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, hbX, hbY, hbW, hbH, 4);
  ctx.fill();

  // Fill
  const healthColor = healthPct > 0.5 ? '#33ff66' : healthPct > 0.25 ? '#ffaa00' : '#ff3333';
  ctx.fillStyle = healthColor;
  roundRect(ctx, hbX, hbY, hbW * healthPct, hbH, 4);
  ctx.fill();

  // Progress bar - top right
  const pbX = W - 95;
  const pbY = 12;
  const pbW = 80;
  const pbH = 8;
  const progressPct = Math.min(state.elapsed / SONG_DURATION_MS, 1);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, pbX, pbY, pbW, pbH, 4);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 0, 255, 0.6)';
  roundRect(ctx, pbX, pbY, pbW * progressPct, pbH, 4);
  ctx.fill();

  // Labels
  ctx.font = '9px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('HP', hbX, hbY + hbH + 8);

  ctx.textAlign = 'right';
  ctx.fillText('SONG', W - 15, pbY + pbH + 8);

  ctx.restore();
}

/**
 * Draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
  if (w < 0) w = 0;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Draw the "tap to start" prompt on the ready screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} elapsed - Time in ms for animation
 */
export function renderReadyScreen(ctx, elapsed) {
  // Dark background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#060616');
  grad.addColorStop(1, '#0a0a2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative lane lines
  drawLanes(ctx);
  drawHitZone(ctx, elapsed);
  drawTapZones(ctx, [0, 0, 0]);

  // Instruction
  const pulse = 0.5 + Math.sin(elapsed * 0.004) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.5;
  ctx.font = '18px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('tap to start', W / 2, H / 2 - 20);

  ctx.font = '12px "Space Grotesk", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.globalAlpha = 0.6;
  ctx.fillText('keys: A / S / D  or  J / K / L', W / 2, H / 2 + 10);
  ctx.fillText('touch: tap left / center / right', W / 2, H / 2 + 30);
  ctx.restore();
}
