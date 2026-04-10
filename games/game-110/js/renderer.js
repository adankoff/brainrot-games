/**
 * MEME REACT -- Renderer
 * Draws the reaction test UI on the canvas.
 */

import { TOTAL_ROUNDS, RESULT_DISPLAY_MS } from './reaction.js';

/** Logical canvas dimensions */
export const W = 400;
export const H = 700;

/** Color palette */
const COLORS = {
  red: '#cc2222',
  redDark: '#991111',
  green: '#00cc44',
  greenBright: '#00ff55',
  orange: '#ff8800',
  orangeDark: '#cc6600',
  white: '#ffffff',
  black: '#0a0a0a',
  gray: '#888888',
  grayDark: '#444444',
  grayDarker: '#222222',
  yellow: '#ffee00',
};

/**
 * Main render function. Draws the appropriate screen based on game phase.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
export function render(ctx, state) {
  ctx.save();

  switch (state.phase) {
    case 'waiting':
      drawWaitingScreen(ctx, state);
      break;
    case 'ready':
      drawReadyScreen(ctx, state);
      break;
    case 'tapped':
    case 'between-rounds':
      drawResultScreen(ctx, state);
      break;
    case 'too-early':
      drawTooEarlyScreen(ctx, state);
      break;
    case 'finished':
      drawFinishedScreen(ctx, state);
      break;
    default:
      drawWaitingScreen(ctx, state);
  }

  ctx.restore();
}

/**
 * Draw the red "WAIT..." screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawWaitingScreen(ctx, state) {
  // Red background
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(0, 0, W, H);

  // Subtle darker border/vignette stripe
  ctx.fillStyle = COLORS.redDark;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);

  // Round indicator
  drawRoundIndicator(ctx, state.currentRound);

  // "WAIT..." text
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WAIT...', W / 2, H / 2 - 20);

  // Subtitle
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('don\'t tap yet', W / 2, H / 2 + 40);

  // Pulsing dot to show it's alive
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
  ctx.globalAlpha = 0.3 + 0.4 * pulse;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 + 100, 8, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.white;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Draw the green "TAP NOW!" screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawReadyScreen(ctx, state) {
  // Green background
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, 0, W, H);

  // Brighter accents
  ctx.fillStyle = COLORS.greenBright;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);

  // Round indicator
  drawRoundIndicator(ctx, state.currentRound);

  // "TAP NOW!" text
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAP NOW!', W / 2, H / 2 - 20);

  // Subtitle
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('GO GO GO', W / 2, H / 2 + 40);

  // Elapsed timer since green appeared
  const elapsed = performance.now() - state.greenAt;
  ctx.font = '18px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`${Math.floor(elapsed)}ms`, W / 2, H / 2 + 100);
}

/**
 * Draw the result screen after a successful tap.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawResultScreen(ctx, state) {
  // Dark background
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(0, 0, W, H);

  // Round indicator
  drawRoundIndicator(ctx, state.currentRound);

  // Reaction time in huge font
  ctx.fillStyle = COLORS.greenBright;
  ctx.font = 'bold 96px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${state.lastReaction}`, W / 2, H / 2 - 50);

  // "ms" label
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = COLORS.gray;
  ctx.fillText('ms', W / 2, H / 2 + 10);

  // Quick rating for this single time
  const rating = getSingleRating(state.lastReaction);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = COLORS.yellow;
  ctx.fillText(rating, W / 2, H / 2 + 60);

  // Previous times list
  drawTimesList(ctx, state);

  // Progress bar for between-rounds timer
  if (state.phase === 'between-rounds') {
    const elapsed = performance.now() - state.betweenTimer;
    const progress = Math.min(elapsed / RESULT_DISPLAY_MS, 1);
    ctx.fillStyle = COLORS.grayDark;
    ctx.fillRect(40, H - 50, W - 80, 6);
    ctx.fillStyle = COLORS.greenBright;
    ctx.fillRect(40, H - 50, (W - 80) * progress, 6);
  }
}

/**
 * Draw the "TOO EARLY!" screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawTooEarlyScreen(ctx, state) {
  // Orange background
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COLORS.orangeDark;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);

  // Round indicator
  drawRoundIndicator(ctx, state.currentRound);

  // "TOO EARLY!" text
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TOO EARLY!', W / 2, H / 2 - 30);

  // Subtitle
  ctx.font = '22px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('chill... wait for green', W / 2, H / 2 + 20);

  // Penalty note
  ctx.font = '18px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('round doesn\'t count', W / 2, H / 2 + 60);

  // Progress bar
  const elapsed = performance.now() - state.betweenTimer;
  const progress = Math.min(elapsed / RESULT_DISPLAY_MS, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(40, H - 50, W - 80, 6);
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(40, H - 50, (W - 80) * progress, 6);
}

/**
 * Draw the final finished screen (shown briefly before game-over overlay).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawFinishedScreen(ctx, state) {
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(0, 0, W, H);

  // Show all round times
  drawTimesList(ctx, state);

  // Average
  if (state.times.length > 0) {
    const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length);

    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AVERAGE', W / 2, H / 2 - 80);

    ctx.fillStyle = COLORS.greenBright;
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(`${avg}`, W / 2, H / 2 - 20);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = COLORS.gray;
    ctx.fillText('ms', W / 2, H / 2 + 30);
  }
}

/**
 * Draw the round indicator (dots) at the top.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} currentRound - 0-indexed current round
 */
function drawRoundIndicator(ctx, currentRound) {
  const dotRadius = 8;
  const spacing = 32;
  const startX = W / 2 - (TOTAL_ROUNDS - 1) * spacing / 2;
  const y = 40;

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const x = startX + i * spacing;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

    if (i < currentRound) {
      // Completed round
      ctx.fillStyle = COLORS.greenBright;
    } else if (i === currentRound) {
      // Current round
      ctx.fillStyle = COLORS.white;
    } else {
      // Future round
      ctx.fillStyle = COLORS.grayDark;
    }
    ctx.fill();
  }

  // "Round X/5" text
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`round ${currentRound + 1} / ${TOTAL_ROUNDS}`, W / 2, y + 28);
}

/**
 * Draw the list of recorded times on the right side.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./reaction.js').ReactionState} state
 */
function drawTimesList(ctx, state) {
  if (state.times.length === 0) return;

  const startY = H - 160;
  const lineHeight = 28;

  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.grayDark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('results', W / 2, startY - 20);

  for (let i = 0; i < state.times.length; i++) {
    const y = startY + i * lineHeight;
    const t = state.times[i];

    // Round number
    ctx.font = '16px sans-serif';
    ctx.fillStyle = COLORS.gray;
    ctx.textAlign = 'right';
    ctx.fillText(`R${i + 1}`, W / 2 - 20, y);

    // Time
    ctx.textAlign = 'left';
    ctx.fillStyle = getTimeColor(t);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${t}ms`, W / 2 - 5, y);
  }
}

/**
 * Get a color for a given reaction time.
 *
 * @param {number} ms - Reaction time in milliseconds
 * @returns {string} CSS color
 */
function getTimeColor(ms) {
  if (ms < 200) return '#00ffff';
  if (ms < 300) return COLORS.greenBright;
  if (ms < 500) return COLORS.yellow;
  return COLORS.orange;
}

/**
 * Get a quick one-word rating for a single reaction time.
 *
 * @param {number} ms - Reaction time in milliseconds
 * @returns {string} Rating
 */
function getSingleRating(ms) {
  if (ms < 150) return 'SUS';
  if (ms < 200) return 'INSANE';
  if (ms < 250) return 'CRACKED';
  if (ms < 350) return 'NICE';
  if (ms < 500) return 'MID';
  return 'BRUH';
}
