/**
 * MEME SCRAMBLE -- Renderer
 * All canvas drawing logic. Pure rendering, no state mutation.
 */

const W = 400;
const H = 700;

const TILE_SIZE = 50;
const TILE_GAP = 6;
const TILE_RADIUS = 8;

const COLORS = {
  bg: '#0a0a1a',
  tileBg: '#1a1a3a',
  tileBorder: '#00e5ff',
  tileText: '#ffffff',
  answerBg: '#12122a',
  answerBorder: '#00e5ff44',
  answerFilledBg: '#1a2a3a',
  timerBg: '#1a1a2a',
  timerFill: '#00e5ff',
  timerLow: '#ff4444',
  scoreText: '#00e5ff',
  labelText: '#8888aa',
  correctFlash: '#00ff88',
  hintHighlight: '#ffd700',
  skipBtn: '#ff6644',
  hintBtn: '#ffd700',
  wordsSolved: '#00ff88',
  comboText: '#ffd700',
};

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state object
 */
export function render(ctx, state) {
  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  drawTimer(ctx, state);
  drawScoreBar(ctx, state);
  drawWordLabel(ctx, state);
  drawAnswerSlots(ctx, state);
  drawScrambledTiles(ctx, state);
  drawButtons(ctx, state);
  drawFeedback(ctx, state);
}

/**
 * Draw the countdown timer bar.
 */
function drawTimer(ctx, state) {
  const barX = 20;
  const barY = 20;
  const barW = W - 40;
  const barH = 12;
  const pct = Math.max(0, state.timeLeft / state.totalTime);
  const isLow = state.timeLeft <= 10;

  // Background
  ctx.fillStyle = COLORS.timerBg;
  roundRect(ctx, barX, barY, barW, barH, 6);
  ctx.fill();

  // Fill
  if (pct > 0) {
    ctx.fillStyle = isLow ? COLORS.timerLow : COLORS.timerFill;
    roundRect(ctx, barX, barY, barW * pct, barH, 6);
    ctx.fill();
  }

  // Time text
  ctx.fillStyle = isLow ? COLORS.timerLow : COLORS.labelText;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(Math.ceil(state.timeLeft) + 's', W - 20, 36);
}

/**
 * Draw score and words-solved counter.
 */
function drawScoreBar(ctx, state) {
  const y = 55;

  // Score
  ctx.fillStyle = COLORS.scoreText;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(state.score.toLocaleString(), 20, y);

  // Words solved
  ctx.fillStyle = COLORS.wordsSolved;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(state.wordsSolved + ' words', W - 20, y + 4);

  // Hints remaining
  ctx.fillStyle = COLORS.hintHighlight;
  ctx.font = '12px monospace';
  ctx.fillText(state.hintsLeft + ' hints', W - 20, y + 22);
}

/**
 * Draw the "unscramble this:" label and word length indicator.
 */
function drawWordLabel(ctx, state) {
  const y = 120;
  ctx.fillStyle = COLORS.labelText;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(state.currentWord.length + ' letters  |  ' + getWordScore(state.currentWord.length) + ' pts', W / 2, y);
}

function getWordScore(len) {
  switch (len) {
    case 4: return 100;
    case 5: return 200;
    case 6: return 400;
    case 7: return 800;
    default: return 100;
  }
}

/**
 * Draw the answer slots (top row where letters go).
 */
function drawAnswerSlots(ctx, state) {
  const word = state.currentWord;
  const count = word.length;
  const totalW = count * TILE_SIZE + (count - 1) * TILE_GAP;
  const startX = (W - totalW) / 2;
  const y = 155;

  for (let i = 0; i < count; i++) {
    const x = startX + i * (TILE_SIZE + TILE_GAP);
    const letter = state.answerLetters[i] || null;
    const isHinted = state.hintedPositions.has(i);
    const animTile = findAnimatingTile(state, 'answer', i);

    if (animTile) {
      // Draw empty slot, the animating tile draws itself
      drawEmptySlot(ctx, x, y);
    } else if (letter) {
      drawFilledSlot(ctx, x, y, letter, isHinted);
    } else {
      drawEmptySlot(ctx, x, y);
    }
  }

  // Store layout for hit detection
  state._answerLayout = { startX, y, count };
}

/**
 * Draw the scrambled letter tiles (bottom row).
 */
function drawScrambledTiles(ctx, state) {
  const tiles = state.scrambledLetters;
  const count = tiles.length;
  const totalW = count * TILE_SIZE + (count - 1) * TILE_GAP;
  const startX = (W - totalW) / 2;
  const y = 300;

  for (let i = 0; i < count; i++) {
    const tile = tiles[i];
    if (tile.used) {
      // Draw faded placeholder
      const x = startX + i * (TILE_SIZE + TILE_GAP);
      drawUsedSlot(ctx, x, y);
    } else {
      const animTile = findAnimatingTile(state, 'scramble', i);
      if (!animTile) {
        const x = startX + i * (TILE_SIZE + TILE_GAP);
        drawTile(ctx, x, y, tile.letter);
      }
    }
  }

  // Store layout for hit detection
  state._scrambleLayout = { startX, y, count };

  // Draw animating tiles on top
  drawAnimatingTiles(ctx, state);
}

/**
 * Draw animating tiles that are in flight between rows.
 */
function drawAnimatingTiles(ctx, state) {
  for (const anim of state.animations) {
    drawTile(ctx, anim.currentX, anim.currentY, anim.letter, anim.glow);
  }
}

function findAnimatingTile(state, target, index) {
  return state.animations.find(a => a.target === target && a.targetIndex === index);
}

/**
 * Draw a letter tile.
 */
function drawTile(ctx, x, y, letter, glow = false) {
  // Shadow
  ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
  roundRect(ctx, x + 2, y + 2, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.fill();

  // Tile body
  ctx.fillStyle = COLORS.tileBg;
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.fill();

  // Border
  ctx.strokeStyle = glow ? COLORS.correctFlash : COLORS.tileBorder;
  ctx.lineWidth = glow ? 3 : 2;
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.stroke();

  // Letter
  ctx.fillStyle = COLORS.tileText;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 1);
}

/**
 * Draw an empty answer slot.
 */
function drawEmptySlot(ctx, x, y) {
  ctx.fillStyle = COLORS.answerBg;
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.fill();

  ctx.strokeStyle = COLORS.answerBorder;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw a filled answer slot.
 */
function drawFilledSlot(ctx, x, y, letter, isHinted) {
  ctx.fillStyle = isHinted ? '#2a2a10' : COLORS.answerFilledBg;
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.fill();

  ctx.strokeStyle = isHinted ? COLORS.hintHighlight : COLORS.tileBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.stroke();

  ctx.fillStyle = isHinted ? COLORS.hintHighlight : COLORS.tileText;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 1);
}

/**
 * Draw a used (empty) scramble slot.
 */
function drawUsedSlot(ctx, x, y) {
  ctx.fillStyle = 'rgba(26, 26, 58, 0.3)';
  roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
  ctx.fill();
}

/**
 * Draw hint and skip buttons.
 */
function drawButtons(ctx, state) {
  const btnW = 120;
  const btnH = 44;
  const btnY = 420;
  const gap = 20;

  // Hint button (left)
  const hintX = W / 2 - btnW - gap / 2;
  const hintEnabled = state.hintsLeft > 0 && state.score >= 50;
  ctx.fillStyle = hintEnabled ? COLORS.hintBtn : '#444433';
  roundRect(ctx, hintX, btnY, btnW, btnH, 8);
  ctx.fill();

  ctx.fillStyle = hintEnabled ? '#000' : '#666';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HINT (-50)', hintX + btnW / 2, btnY + btnH / 2);

  // Skip button (right)
  const skipX = W / 2 + gap / 2;
  ctx.fillStyle = COLORS.skipBtn;
  roundRect(ctx, skipX, btnY, btnW, btnH, 8);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SKIP', skipX + btnW / 2, btnY + btnH / 2);

  // Store button layout for hit detection
  state._hintBtn = { x: hintX, y: btnY, w: btnW, h: btnH };
  state._skipBtn = { x: skipX, y: btnY, w: btnW, h: btnH };
}

/**
 * Draw feedback text (correct!, skip, combo, etc.)
 */
function drawFeedback(ctx, state) {
  if (!state.feedback) return;

  const fb = state.feedback;
  const alpha = Math.max(0, 1 - fb.age / fb.duration);
  const yOff = fb.age * 30; // float upward

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fb.color || COLORS.correctFlash;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fb.text, W / 2, 530 - yOff);

  if (fb.subtext) {
    ctx.font = '18px monospace';
    ctx.fillText(fb.subtext, W / 2, 560 - yOff);
  }
  ctx.restore();
}

/**
 * Get the tile layout info for hit testing.
 */
export function getTileSize() {
  return TILE_SIZE;
}

export function getTileGap() {
  return TILE_GAP;
}

export function getCanvasSize() {
  return { w: W, h: H };
}

/**
 * Rounded rectangle path helper.
 */
function roundRect(ctx, x, y, w, h, r) {
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
