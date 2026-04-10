/**
 * TOWER OF HANOI -- Renderer
 * All canvas drawing: pegs, discs, HUD, animations.
 */

import { peekDisc } from './hanoi.js';

// ---- Layout Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

const BASE_Y = 520;          // Y position of the base platform
const BASE_HEIGHT = 16;       // Height of the base platform
const PEG_WIDTH = 8;          // Width of each peg pole
const PEG_HEIGHT = 220;       // Height of each peg pole
const PEG_SPACING = 120;      // Horizontal distance between peg centers
const PEG_START_X = 80;       // X center of the leftmost peg

const DISC_HEIGHT = 28;       // Height of each disc
const DISC_GAP = 2;           // Vertical gap between stacked discs
const MIN_DISC_WIDTH = 30;    // Width of the smallest disc
const MAX_DISC_WIDTH = 110;   // Width of the largest disc
const DISC_RADIUS = 8;        // Border radius of discs

const LIFT_Y = BASE_Y - PEG_HEIGHT - 50; // Y position when a disc is lifted

// ---- Rainbow Colors ----

const DISC_COLORS = [
  '#FF6B6B',  // red
  '#FF9F43',  // orange
  '#FECA57',  // yellow
  '#48DBFB',  // cyan
  '#0ABDE3',  // blue
  '#5F27CD',  // purple
  '#FF6B9D',  // pink
];

// ---- Animation State ----

let invalidFlashTimer = 0;
let invalidFlashPeg = -1;
let liftAnim = { active: false, pegIndex: -1, progress: 0 };
let dropAnim = { active: false, fromPeg: -1, toPeg: -1, disc: 0, progress: 0 };
let winAnim = { active: false, timer: 0 };

/**
 * Get the X center of a peg by index.
 *
 * @param {number} pegIndex - 0, 1, or 2
 * @returns {number}
 */
export function getPegCenterX(pegIndex) {
  return PEG_START_X + pegIndex * PEG_SPACING;
}

/**
 * Determine which peg was tapped based on X coordinate.
 *
 * @param {number} x - Logical X coordinate
 * @param {number} y - Logical Y coordinate
 * @returns {number} Peg index (0, 1, 2) or -1 if no peg was tapped
 */
export function getPegAtPosition(x, y) {
  // Allow tapping anywhere in the upper game area
  if (y < 40 || y > BASE_Y + BASE_HEIGHT + 20) return -1;

  for (let i = 0; i < 3; i++) {
    const cx = getPegCenterX(i);
    // Generous hit zone around each peg
    if (Math.abs(x - cx) < PEG_SPACING / 2 - 5) {
      return i;
    }
  }
  return -1;
}

/**
 * Start the invalid move flash effect.
 *
 * @param {number} pegIndex
 */
export function flashInvalid(pegIndex) {
  invalidFlashTimer = 400; // ms
  invalidFlashPeg = pegIndex;
}

/**
 * Start the lift animation for a disc.
 *
 * @param {number} pegIndex
 */
export function startLiftAnim(pegIndex) {
  liftAnim = { active: true, pegIndex, progress: 0 };
}

/**
 * Start the drop animation for a disc moving between pegs.
 *
 * @param {number} fromPeg
 * @param {number} toPeg
 * @param {number} disc - Disc size
 */
export function startDropAnim(fromPeg, toPeg, disc) {
  dropAnim = { active: true, fromPeg, toPeg, disc, progress: 0 };
}

/**
 * Start the win animation.
 */
export function startWinAnim() {
  winAnim = { active: true, timer: 0 };
}

/**
 * Reset all animation state.
 */
export function resetAnimations() {
  invalidFlashTimer = 0;
  invalidFlashPeg = -1;
  liftAnim = { active: false, pegIndex: -1, progress: 0 };
  dropAnim = { active: false, fromPeg: -1, toPeg: -1, disc: 0, progress: 0 };
  winAnim = { active: false, timer: 0 };
}

/**
 * Check if drop animation is currently playing.
 *
 * @returns {boolean}
 */
export function isDropAnimating() {
  return dropAnim.active;
}

/**
 * Update animations.
 *
 * @param {number} dt - Delta time normalized to 60fps
 * @returns {boolean} True if drop animation just finished
 */
export function updateAnimations(dt) {
  const ms = dt * 16.67;
  let dropFinished = false;

  // Invalid flash
  if (invalidFlashTimer > 0) {
    invalidFlashTimer -= ms;
    if (invalidFlashTimer <= 0) {
      invalidFlashTimer = 0;
      invalidFlashPeg = -1;
    }
  }

  // Lift animation
  if (liftAnim.active) {
    liftAnim.progress = Math.min(liftAnim.progress + ms / 150, 1);
    if (liftAnim.progress >= 1) {
      // Lift stays active until disc is placed or cancelled
    }
  }

  // Drop animation
  if (dropAnim.active) {
    dropAnim.progress = Math.min(dropAnim.progress + ms / 200, 1);
    if (dropAnim.progress >= 1) {
      dropAnim.active = false;
      dropFinished = true;
    }
  }

  // Win animation
  if (winAnim.active) {
    winAnim.timer += ms;
  }

  return dropFinished;
}

/**
 * Cancel the lift animation (disc goes back to its peg).
 */
export function cancelLift() {
  liftAnim.active = false;
}

/**
 * Get disc width based on its size and total disc count.
 *
 * @param {number} discSize - 1 (smallest) to numDiscs (largest)
 * @param {number} numDiscs
 * @returns {number}
 */
function getDiscWidth(discSize, numDiscs) {
  if (numDiscs <= 1) return MAX_DISC_WIDTH;
  const t = (discSize - 1) / (numDiscs - 1);
  return MIN_DISC_WIDTH + t * (MAX_DISC_WIDTH - MIN_DISC_WIDTH);
}

/**
 * Get disc color based on its size.
 *
 * @param {number} discSize - 1-based disc size
 * @param {number} numDiscs
 * @returns {string}
 */
function getDiscColor(discSize, numDiscs) {
  const idx = Math.round(((discSize - 1) / Math.max(numDiscs - 1, 1)) * (DISC_COLORS.length - 1));
  return DISC_COLORS[idx];
}

/**
 * Draw a single disc.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} discSize
 * @param {number} numDiscs
 * @param {number} [alpha=1]
 */
function drawDisc(ctx, cx, cy, discSize, numDiscs, alpha = 1) {
  const w = getDiscWidth(discSize, numDiscs);
  const h = DISC_HEIGHT;
  const color = getDiscColor(discSize, numDiscs);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  roundRect(ctx, cx - w / 2 + 2, cy - h / 2 + 2, w, h, DISC_RADIUS);
  ctx.fill();

  // Main body
  ctx.fillStyle = color;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, DISC_RADIUS);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h / 2 - 2, DISC_RADIUS - 1);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a rounded rectangle path.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
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
 * Ease-out cubic for smooth animations.
 *
 * @param {number} t
 * @returns {number}
 */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Render the complete game scene.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./hanoi.js').HanoiState} state
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Draw background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
  grad.addColorStop(0, '#16213e');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Win shimmer effect
  if (winAnim.active) {
    drawWinEffect(ctx);
  }

  // Base platform
  drawBase(ctx);

  // Pegs
  for (let i = 0; i < 3; i++) {
    drawPeg(ctx, i);
  }

  // Discs on pegs
  for (let pegIdx = 0; pegIdx < 3; pegIdx++) {
    const peg = state.pegs[pegIdx];
    const cx = getPegCenterX(pegIdx);

    for (let discIdx = 0; discIdx < peg.length; discIdx++) {
      const discSize = peg[discIdx];

      // Skip the top disc if it's being lifted from this peg
      const isLiftedDisc = liftAnim.active &&
        liftAnim.pegIndex === pegIdx &&
        discIdx === peg.length - 1 &&
        state.selectedPeg === pegIdx;

      // Skip the top disc on the target peg if it's being animated via drop
      const isDropDisc = dropAnim.active &&
        dropAnim.toPeg === pegIdx &&
        discIdx === peg.length - 1;

      if (isLiftedDisc || isDropDisc) continue;

      const cy = BASE_Y - (discIdx * (DISC_HEIGHT + DISC_GAP)) - DISC_HEIGHT / 2;
      drawDisc(ctx, cx, cy, discSize, state.numDiscs);
    }
  }

  // Draw lifted disc
  if (liftAnim.active && state.selectedPeg !== null) {
    const pegIdx = state.selectedPeg;
    const peg = state.pegs[pegIdx];
    const discSize = peg[peg.length - 1];
    const cx = getPegCenterX(pegIdx);

    const restY = BASE_Y - ((peg.length - 1) * (DISC_HEIGHT + DISC_GAP)) - DISC_HEIGHT / 2;
    const targetY = LIFT_Y;
    const progress = easeOut(liftAnim.progress);
    const cy = restY + (targetY - restY) * progress;

    drawDisc(ctx, cx, cy, discSize, state.numDiscs);

    // Pulsing glow under lifted disc
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
    const w = getDiscWidth(discSize, state.numDiscs);
    ctx.shadowColor = getDiscColor(discSize, state.numDiscs);
    ctx.shadowBlur = 15;
    ctx.fillStyle = getDiscColor(discSize, state.numDiscs);
    roundRect(ctx, cx - w / 2, cy - DISC_HEIGHT / 2, w, DISC_HEIGHT, DISC_RADIUS);
    ctx.fill();
    ctx.restore();
  }

  // Draw drop animation disc
  if (dropAnim.active) {
    const { fromPeg, toPeg, disc, progress } = dropAnim;
    const easedProgress = easeOut(progress);

    const fromX = getPegCenterX(fromPeg);
    const toX = getPegCenterX(toPeg);
    // The disc is already on the target peg in state; its final resting position
    const targetCount = state.pegs[toPeg].length;
    const toY = BASE_Y - ((targetCount - 1) * (DISC_HEIGHT + DISC_GAP)) - DISC_HEIGHT / 2;

    // Three-phase arc: lift up, move across, drop down
    const topY = LIFT_Y - 20;
    let cx, cy;

    if (easedProgress < 0.3) {
      // Phase 1: lift from source peg to top
      const p = easedProgress / 0.3;
      cx = fromX;
      cy = LIFT_Y + (topY - LIFT_Y) * p;
    } else if (easedProgress < 0.7) {
      // Phase 2: move across at the top
      const p = (easedProgress - 0.3) / 0.4;
      cx = fromX + (toX - fromX) * p;
      cy = topY;
    } else {
      // Phase 3: drop down to target
      const p = (easedProgress - 0.7) / 0.3;
      cx = toX;
      cy = topY + (toY - topY) * p;
    }

    drawDisc(ctx, cx, cy, disc, state.numDiscs);
  }

  // Invalid flash effect
  if (invalidFlashTimer > 0) {
    drawInvalidFlash(ctx);
  }

  // HUD
  drawHUD(ctx, state);

  // Peg labels
  drawPegLabels(ctx);
}

/**
 * Draw the base platform.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawBase(ctx) {
  ctx.fillStyle = '#3d3d5c';
  roundRect(ctx, 20, BASE_Y, LOGICAL_WIDTH - 40, BASE_HEIGHT, 4);
  ctx.fill();

  // Highlight on top
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(22, BASE_Y, LOGICAL_WIDTH - 44, 3);
}

/**
 * Draw a peg pole.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pegIndex
 */
function drawPeg(ctx, pegIndex) {
  const cx = getPegCenterX(pegIndex);
  const x = cx - PEG_WIDTH / 2;
  const y = BASE_Y - PEG_HEIGHT;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(ctx, x + 2, y + 2, PEG_WIDTH, PEG_HEIGHT, 3);
  ctx.fill();

  // Peg body
  const grad = ctx.createLinearGradient(x, y, x + PEG_WIDTH, y);
  grad.addColorStop(0, '#5a5a7a');
  grad.addColorStop(0.5, '#7a7a9a');
  grad.addColorStop(1, '#5a5a7a');
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, PEG_WIDTH, PEG_HEIGHT, 3);
  ctx.fill();
}

/**
 * Draw peg labels (A, B, C) beneath the base.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawPegLabels(ctx) {
  ctx.save();
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';

  const labels = ['A', 'B', 'C'];
  for (let i = 0; i < 3; i++) {
    ctx.fillText(labels[i], getPegCenterX(i), BASE_Y + BASE_HEIGHT + 24);
  }
  ctx.restore();
}

/**
 * Draw the invalid move flash effect.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawInvalidFlash(ctx) {
  const alpha = (invalidFlashTimer / 400) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FF4444';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.restore();
}

/**
 * Draw the win celebration effect.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawWinEffect(ctx) {
  const t = winAnim.timer;

  // Particle burst from right peg
  ctx.save();
  const cx = getPegCenterX(2);
  const cy = BASE_Y - PEG_HEIGHT / 2;

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + t * 0.002;
    const dist = 30 + Math.sin(t * 0.003 + i) * 20 + (t * 0.05);
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    const size = 3 + Math.sin(t * 0.005 + i * 0.5) * 2;
    const alpha = Math.max(0, 1 - dist / 200);

    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = DISC_COLORS[i % DISC_COLORS.length];
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw the HUD (move counter, optimal moves).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./hanoi.js').HanoiState} state
 */
function drawHUD(ctx, state) {
  ctx.save();

  // Background bar for HUD
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, 20, 580, LOGICAL_WIDTH - 40, 50, 8);
  ctx.fill();

  // Moves counter
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText(`moves: ${state.moves}`, 40, 612);

  // Optimal moves
  ctx.font = '16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`optimal: ${state.optimalMoves}`, LOGICAL_WIDTH - 40, 612);

  ctx.restore();

  // Instruction hint when no disc is selected
  if (!state.won && state.selectedPeg === null && state.moves === 0) {
    ctx.save();
    const pulse = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
    ctx.globalAlpha = 0.3 + pulse * 0.4;
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('tap a peg to pick up a disc', LOGICAL_WIDTH / 2, 660);
    ctx.restore();
  } else if (!state.won && state.selectedPeg !== null) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8ff00';
    ctx.fillText('tap a peg to place the disc', LOGICAL_WIDTH / 2, 660);
    ctx.restore();
  }
}
