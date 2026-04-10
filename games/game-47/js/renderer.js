/**
 * MEME IQ TEST -- Renderer
 * All canvas drawing: top bar, timer, question, answer buttons, feedback overlays.
 */

const W = 400;
const H = 700;

// Layout constants
const TOP_BAR_H = 50;
const TIMER_Y = 75;
const TIMER_RADIUS = 22;
const QUESTION_Y = 120;
const QUESTION_MAX_W = 360;
const ANSWER_START_Y = 340;
const ANSWER_H = 60;
const ANSWER_GAP = 12;
const ANSWER_W = 360;
const ANSWER_X = (W - ANSWER_W) / 2;
const ANSWER_RADIUS = 12;

// Colors
const COL_BG = '#0a0a1a';
const COL_SURFACE = '#1a1a3a';
const COL_ACCENT = '#ff6b9d';
const COL_ACCENT_ALT = '#c084fc';
const COL_TEXT = '#ffffff';
const COL_TEXT_DIM = '#8080a0';
const COL_CORRECT = '#4ade80';
const COL_WRONG = '#f87171';
const COL_TIMER_BG = '#2a2a4a';
const COL_TIMER_FILL = '#facc15';
const COL_TIMER_DANGER = '#ef4444';
const COL_HEART = '#ef4444';
const COL_HEART_EMPTY = '#3a3a5a';
const COL_ANSWER_BG = '#1e1e40';
const COL_ANSWER_HOVER = '#2a2a50';
const COL_ANSWER_BORDER = '#3a3a6a';
const COL_CATEGORY_COLORS = {
  history: '#60a5fa',
  brainrot: '#f472b6',
  internet: '#a78bfa',
  gaming: '#34d399',
  anime: '#fb923c',
};

/**
 * Get the bounding rectangles for the 4 answer buttons.
 * Used for hit-testing in main.js.
 *
 * @returns {Array<{x: number, y: number, w: number, h: number}>}
 */
export function getAnswerRects() {
  const rects = [];
  for (let i = 0; i < 4; i++) {
    rects.push({
      x: ANSWER_X,
      y: ANSWER_START_Y + i * (ANSWER_H + ANSWER_GAP),
      w: ANSWER_W,
      h: ANSWER_H,
    });
  }
  return rects;
}

/**
 * Draw a rounded rectangle path.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
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
 * Word-wrap text and draw centered.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} cx - Center X
 * @param {number} startY - Top Y position
 * @param {number} maxWidth
 * @param {number} lineHeight
 * @returns {number} Total height used
 */
function drawWrappedText(ctx, text, cx, startY, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const totalH = lines.length * lineHeight;
  let y = startY;

  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }

  return totalH;
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state from main.js
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = COL_BG;
  ctx.fillRect(0, 0, W, H);

  if (!state.currentQuestion) return;

  drawTopBar(ctx, state);
  drawTimer(ctx, state);
  drawCategory(ctx, state);
  drawQuestion(ctx, state);
  drawAnswers(ctx, state);
  drawFeedback(ctx, state);
}

/**
 * Draw top bar: score, question number, lives.
 */
function drawTopBar(ctx, state) {
  // Background
  ctx.fillStyle = COL_SURFACE;
  ctx.fillRect(0, 0, W, TOP_BAR_H);

  // Score (left)
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COL_ACCENT;
  ctx.fillText(String(state.score), 16, TOP_BAR_H / 2);

  // Question number (center)
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COL_TEXT_DIM;
  ctx.fillText(`Q${state.questionIndex + 1}`, W / 2, TOP_BAR_H / 2);

  // Lives (right) -- draw hearts
  const heartSize = 18;
  const heartGap = 6;
  const totalHeartsW = 3 * heartSize + 2 * heartGap;
  const heartsStartX = W - 16 - totalHeartsW;

  for (let i = 0; i < 3; i++) {
    const hx = heartsStartX + i * (heartSize + heartGap) + heartSize / 2;
    const hy = TOP_BAR_H / 2;
    drawHeart(ctx, hx, hy, heartSize * 0.5, i < state.lives ? COL_HEART : COL_HEART_EMPTY);
  }
}

/**
 * Draw a simple heart shape.
 */
function drawHeart(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  const topY = cy - size * 0.4;
  ctx.moveTo(cx, cy + size * 0.6);
  ctx.bezierCurveTo(cx - size * 1.2, cy - size * 0.2, cx - size * 0.6, topY - size * 0.5, cx, topY + size * 0.2);
  ctx.bezierCurveTo(cx + size * 0.6, topY - size * 0.5, cx + size * 1.2, cy - size * 0.2, cx, cy + size * 0.6);
  ctx.fill();
}

/**
 * Draw circular countdown timer.
 */
function drawTimer(ctx, state) {
  const cx = W / 2;
  const cy = TIMER_Y;
  const fraction = Math.max(0, state.timeRemaining / state.timePerQuestion);
  const isDanger = state.timeRemaining <= 3;

  // Background ring
  ctx.beginPath();
  ctx.arc(cx, cy, TIMER_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = COL_TIMER_BG;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Progress ring
  if (fraction > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * fraction;
    ctx.beginPath();
    ctx.arc(cx, cy, TIMER_RADIUS, startAngle, endAngle);
    ctx.strokeStyle = isDanger ? COL_TIMER_DANGER : COL_TIMER_FILL;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  // Time number
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isDanger ? COL_TIMER_DANGER : COL_TEXT;
  ctx.fillText(Math.ceil(state.timeRemaining).toString(), cx, cy);
}

/**
 * Draw category badge.
 */
function drawCategory(ctx, state) {
  const cat = state.currentQuestion.category || 'misc';
  const label = cat.toUpperCase();
  const color = COL_CATEGORY_COLORS[cat] || COL_ACCENT_ALT;

  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textW = ctx.measureText(label).width;
  const badgeW = textW + 16;
  const badgeH = 20;
  const bx = W / 2 - badgeW / 2;
  const by = TIMER_Y + TIMER_RADIUS + 10;

  roundRect(ctx, bx, by, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = color + '30';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(label, W / 2, by + badgeH / 2);
}

/**
 * Draw the question text, word-wrapped and centered.
 */
function drawQuestion(ctx, state) {
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COL_TEXT;

  const questionY = TIMER_Y + TIMER_RADIUS + 40;
  drawWrappedText(ctx, state.currentQuestion.question, W / 2, questionY, QUESTION_MAX_W, 28);
}

/**
 * Draw the 4 answer buttons.
 */
function drawAnswers(ctx, state) {
  const rects = getAnswerRects();
  const answers = state.currentQuestion.answers;
  const labels = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < 4; i++) {
    const r = rects[i];
    let bgColor = COL_ANSWER_BG;
    let borderColor = COL_ANSWER_BORDER;
    let textColor = COL_TEXT;

    // Feedback coloring
    if (state.answered) {
      if (i === state.currentQuestion.correct) {
        bgColor = COL_CORRECT + '30';
        borderColor = COL_CORRECT;
        textColor = COL_CORRECT;
      } else if (i === state.selectedAnswer && state.selectedAnswer !== state.currentQuestion.correct) {
        bgColor = COL_WRONG + '30';
        borderColor = COL_WRONG;
        textColor = COL_WRONG;
      } else {
        bgColor = COL_ANSWER_BG;
        borderColor = COL_ANSWER_BORDER + '60';
        textColor = COL_TEXT_DIM;
      }
    }

    // Button background
    roundRect(ctx, r.x, r.y, r.w, r.h, ANSWER_RADIUS);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label circle
    const labelX = r.x + 28;
    const labelY = r.y + r.h / 2;
    ctx.beginPath();
    ctx.arc(labelX, labelY, 14, 0, Math.PI * 2);
    ctx.fillStyle = borderColor + '40';
    ctx.fill();

    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(labels[i], labelX, labelY);

    // Answer text
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;

    const answerText = answers[i];
    const maxTextW = r.w - 70;
    let displayText = answerText;
    if (ctx.measureText(displayText).width > maxTextW) {
      while (ctx.measureText(displayText + '...').width > maxTextW && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }
    ctx.fillText(displayText, r.x + 52, r.y + r.h / 2);
  }
}

/**
 * Draw feedback overlay ("CORRECT!" or "WRONG!" text).
 */
function drawFeedback(ctx, state) {
  if (!state.feedbackText) return;

  const alpha = Math.min(1, state.feedbackTimer * 3);

  ctx.save();
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = state.feedbackCorrect ? COL_CORRECT : COL_WRONG;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Text
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  ctx.fillStyle = '#000000';
  ctx.fillText(state.feedbackText, W / 2 + 2, H / 2 - 40 + 2);

  // Main text
  ctx.fillStyle = state.feedbackCorrect ? COL_CORRECT : COL_WRONG;
  ctx.fillText(state.feedbackText, W / 2, H / 2 - 40);

  // Bonus points
  if (state.feedbackCorrect && state.lastBonus > 0) {
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = COL_TIMER_FILL;
    ctx.fillText(`+${state.lastBonus} pts`, W / 2, H / 2);
  }

  ctx.restore();
}
