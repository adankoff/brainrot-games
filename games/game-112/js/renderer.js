/**
 * STROOP TAP -- Renderer
 * All canvas drawing for the game.
 */

import { COLORS } from './stroop.js';

const W = 400;
const H = 700;

// Button layout
const BTN_SIZE = 72;
const BTN_GAP = 16;
const BTN_ROW_Y = H - 100;
const BTN_TOTAL_W = COLORS.length * BTN_SIZE + (COLORS.length - 1) * BTN_GAP;
const BTN_START_X = (W - BTN_TOTAL_W) / 2;

/**
 * Get the bounding rectangles for the 4 color buttons.
 *
 * @returns {Array<{x: number, y: number, w: number, h: number, colorIndex: number}>}
 */
export function getButtonRects() {
  return COLORS.map((_, i) => ({
    x: BTN_START_X + i * (BTN_SIZE + BTN_GAP),
    y: BTN_ROW_Y,
    w: BTN_SIZE,
    h: BTN_SIZE,
    colorIndex: i,
  }));
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from stroop.js
 */
export function render(ctx, state) {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Flash overlay
  if (state.flashColor && state.flashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = state.flashTimer * 3;
    ctx.fillStyle = state.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // HUD: timer bar
  drawTimerBar(ctx, state);

  // HUD: score and multiplier
  drawHUD(ctx, state);

  // Main word
  drawWord(ctx, state);

  // Color buttons
  drawButtons(ctx, state);
}

/**
 * Draw the timer bar at the top.
 */
function drawTimerBar(ctx, state) {
  const barY = 12;
  const barH = 8;
  const barX = 20;
  const barW = W - 40;
  const pct = Math.max(0, state.timeRemaining / 30);

  // Background track
  ctx.fillStyle = '#2a2a4a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  // Filled portion
  const isUrgent = state.timeRemaining <= 5;
  ctx.fillStyle = isUrgent ? '#ff3b3b' : '#e94560';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * pct, barH, 4);
  ctx.fill();

  // Timer text
  ctx.fillStyle = isUrgent ? '#ff3b3b' : '#aaa';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(Math.ceil(state.timeRemaining) + 's', W / 2, barY + barH + 6);
}

/**
 * Draw score and multiplier.
 */
function drawHUD(ctx, state) {
  // Score
  ctx.fillStyle = '#eee';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(String(state.score), W / 2, 50);

  // Multiplier badge
  if (state.multiplier > 1) {
    const mText = 'x' + state.multiplier;
    ctx.font = 'bold 20px monospace';
    const mWidth = ctx.measureText(mText).width;
    const mx = W / 2 + 40;
    const my = 54;

    ctx.fillStyle = state.multiplier === 3 ? '#ffd43b' : '#4dabf7';
    ctx.beginPath();
    ctx.roundRect(mx - 4, my - 2, mWidth + 8, 24, 6);
    ctx.fill();

    ctx.fillStyle = '#1a1a2e';
    ctx.fillText(mText, mx + mWidth / 2, my);
    ctx.textAlign = 'center';
  }

  // Streak counter
  if (state.streak > 0) {
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('streak: ' + state.streak, W / 2, 90);
  }
}

/**
 * Draw the main Stroop word in the center.
 */
function drawWord(ctx, state) {
  if (state.wordIndex < 0 || state.inkIndex < 0) return;

  const word = COLORS[state.wordIndex].name;
  const inkColor = COLORS[state.inkIndex].hex;

  ctx.save();
  ctx.translate(W / 2, H / 2 - 60);

  // Apply distractor effects
  if (state.wordRotation !== 0) {
    ctx.rotate(state.wordRotation * Math.PI / 180);
  }

  const fontSize = Math.round(72 * state.wordScale);
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = inkColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow for readability
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(word, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.restore();

  // Instruction hint (fades after first few correct)
  if (state.totalCorrect < 3) {
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('tap the INK color', W / 2, H / 2 + 10);
  }
}

/**
 * Draw the 4 color choice buttons.
 */
function drawButtons(ctx, state) {
  const buttons = getButtonRects();

  for (const btn of buttons) {
    const color = COLORS[btn.colorIndex];

    // Button background
    ctx.fillStyle = color.hex;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 12);
    ctx.fill();

    // Button border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 12);
    ctx.stroke();

    // Button label
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.name, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
}

/**
 * Render the menu background (idle animation).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} t - Time in seconds for animation
 */
export function renderMenuBg(ctx, t) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Animated Stroop demo words
  const demoWords = [
    { word: 'RED',    ink: '#4dabf7', x: 120, y: 280 },
    { word: 'BLUE',   ink: '#51cf66', x: 280, y: 350 },
    { word: 'GREEN',  ink: '#ffd43b', x: 150, y: 420 },
    { word: 'YELLOW', ink: '#ff3b3b', x: 260, y: 490 },
  ];

  for (let i = 0; i < demoWords.length; i++) {
    const d = demoWords[i];
    const bobY = Math.sin(t * 1.5 + i * 1.2) * 8;
    const alpha = 0.3 + Math.sin(t * 0.8 + i * 0.9) * 0.15;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = d.ink;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.word, d.x, d.y + bobY);
    ctx.restore();
  }
}
