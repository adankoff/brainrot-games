/**
 * MEME TYPE -- Renderer
 * All canvas drawing logic: timer, current word, preview, stats HUD.
 */

const W = 400;
const H = 700;

const COLORS = {
  bg: '#0a0a0f',
  bgGradientTop: '#0f0f18',
  bgGradientBottom: '#0a0a0f',
  accent: '#00ff88',
  accentDim: '#00cc66',
  white: '#ffffff',
  grey: '#888899',
  greyDim: '#555566',
  red: '#ff4466',
  redFlash: '#ff2244',
  darkPanel: 'rgba(255,255,255,0.04)',
  timerBg: 'rgba(0,255,136,0.08)',
  streakGold: '#ffd700',
};

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} gameState
 * @param {Object} typingState - From typing engine getState()
 * @param {string} currentWord
 * @param {string[]} previewWords
 * @param {number} wpm
 * @param {number} accuracy
 */
export function renderGame(ctx, gameState, typingState, currentWord, previewWords, wpm, accuracy) {
  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLORS.bgGradientTop);
  grad.addColorStop(1, COLORS.bgGradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Draw subtle grid pattern
  drawGridPattern(ctx);

  // Timer bar at top
  drawTimerBar(ctx, gameState);

  // Stats HUD
  drawStatsHUD(ctx, wpm, accuracy, typingState.wordsCompleted, typingState.streak);

  // Preview words
  drawPreviewWords(ctx, previewWords);

  // Current word (main focus)
  drawCurrentWord(ctx, currentWord, typingState.charIndex, typingState.errorFlash);

  // Streak indicator
  if (typingState.streak >= 3) {
    drawStreakIndicator(ctx, typingState.streak);
  }

  // Instructions footer
  drawFooter(ctx, gameState);
}

/**
 * Draw subtle grid pattern background.
 */
function drawGridPattern(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.015)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw the timer bar at the top.
 */
function drawTimerBar(ctx, gameState) {
  const { timeRemaining, duration } = gameState;
  const progress = Math.max(0, timeRemaining / duration);

  // Bar background
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, W, 6);

  // Bar fill
  let barColor = COLORS.accent;
  if (progress < 0.2) {
    barColor = COLORS.red;
  } else if (progress < 0.4) {
    barColor = '#ffaa00';
  }
  ctx.fillStyle = barColor;
  ctx.fillRect(0, 0, W * progress, 6);

  // Time text
  const seconds = Math.ceil(timeRemaining);
  ctx.fillStyle = progress < 0.2 ? COLORS.red : COLORS.white;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${seconds}s`, W / 2, 36);
}

/**
 * Draw the WPM / accuracy / words HUD.
 */
function drawStatsHUD(ctx, wpm, accuracy, wordsCompleted, streak) {
  const hudY = 72;

  // Panel background
  ctx.fillStyle = COLORS.darkPanel;
  roundRect(ctx, 20, hudY - 16, W - 40, 48, 8);
  ctx.fill();

  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = 'middle';

  // WPM
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText(`${wpm}`, 40, hudY);
  ctx.fillStyle = COLORS.grey;
  ctx.font = '11px monospace';
  ctx.fillText('WPM', 40, hudY + 16);

  // Accuracy
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = accuracy >= 90 ? COLORS.accent : accuracy >= 70 ? '#ffaa00' : COLORS.red;
  ctx.fillText(`${accuracy}%`, W / 2, hudY);
  ctx.fillStyle = COLORS.grey;
  ctx.font = '11px monospace';
  ctx.fillText('ACC', W / 2, hudY + 16);

  // Words
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.white;
  ctx.fillText(`${wordsCompleted}`, W - 40, hudY);
  ctx.fillStyle = COLORS.grey;
  ctx.font = '11px monospace';
  ctx.fillText('WORDS', W - 40, hudY + 16);
}

/**
 * Draw upcoming preview words.
 */
function drawPreviewWords(ctx, previewWords) {
  const startY = 180;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = previewWords.length - 1; i >= 0; i--) {
    const word = previewWords[i];
    const distFromCurrent = i + 1;
    const alpha = Math.max(0.15, 0.5 - distFromCurrent * 0.12);
    const size = Math.max(16, 22 - distFromCurrent * 2);
    const y = startY + i * 40;

    ctx.fillStyle = `rgba(136,136,153,${alpha})`;
    ctx.font = `${size}px monospace`;
    ctx.fillText(word, W / 2, y);
  }
}

/**
 * Draw the current word with typed/remaining coloring.
 */
function drawCurrentWord(ctx, word, charIndex, errorFlash) {
  if (!word) return;

  const centerY = 340;
  const fontSize = Math.min(42, Math.max(28, 400 / (word.length + 2)));

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'middle';

  // Measure total width for centering
  const totalWidth = ctx.measureText(word).width;
  let x = (W - totalWidth) / 2;

  // Draw glow behind current word area
  if (!errorFlash) {
    ctx.shadowColor = COLORS.accent;
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(0,255,136,0.03)';
    roundRect(ctx, x - 20, centerY - fontSize / 2 - 12, totalWidth + 40, fontSize + 24, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Underline / focus box
  ctx.strokeStyle = errorFlash ? COLORS.redFlash : 'rgba(0,255,136,0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 16, centerY - fontSize / 2 - 8, totalWidth + 32, fontSize + 16, 10);
  ctx.stroke();

  // Draw each character
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const charWidth = ctx.measureText(char).width;

    if (i < charIndex) {
      // Typed correctly
      ctx.fillStyle = COLORS.accent;
    } else if (i === charIndex && errorFlash) {
      // Current char during error
      ctx.fillStyle = COLORS.redFlash;
    } else if (i === charIndex) {
      // Current char (cursor position)
      ctx.fillStyle = COLORS.white;
      // Draw cursor underline
      ctx.save();
      ctx.fillStyle = COLORS.accent;
      const cursorBlink = Math.sin(Date.now() * 0.008) > 0;
      if (cursorBlink) {
        ctx.fillRect(x, centerY + fontSize / 2 + 2, charWidth, 3);
      }
      ctx.restore();
      ctx.fillStyle = COLORS.white;
    } else {
      // Upcoming characters
      ctx.fillStyle = COLORS.greyDim;
    }

    ctx.fillText(char, x, centerY);
    x += charWidth;
  }
}

/**
 * Draw streak indicator.
 */
function drawStreakIndicator(ctx, streak) {
  const y = 420;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const alpha = Math.min(1, 0.5 + streak * 0.05);
  ctx.fillStyle = streak >= 10 ? COLORS.streakGold : `rgba(0,255,136,${alpha})`;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`${streak} streak`, W / 2, y);

  if (streak >= 10) {
    ctx.font = '12px monospace';
    ctx.fillStyle = `rgba(255,215,0,0.6)`;
    ctx.fillText('on fire', W / 2, y + 20);
  }
}

/**
 * Draw footer instruction text.
 */
function drawFooter(ctx, gameState) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.greyDim;
  ctx.font = '12px monospace';
  ctx.fillText('type the words as fast as you can', W / 2, H - 30);
}

/**
 * Draw the game-over stats screen on canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} stats
 */
export function renderGameOver(ctx, stats) {
  // Dark background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLORS.bgGradientTop);
  grad.addColorStop(1, COLORS.bgGradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  drawGridPattern(ctx);

  // Stats panel
  const panelX = 30;
  const panelY = 320;
  const panelW = W - 60;

  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  roundRect(ctx, panelX, panelY, panelW, 200, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, 200, 12);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Stat rows
  const rows = [
    { label: 'WPM', value: `${stats.wpm}`, color: COLORS.accent },
    { label: 'ACCURACY', value: `${stats.accuracy}%`, color: stats.accuracy >= 90 ? COLORS.accent : '#ffaa00' },
    { label: 'WORDS', value: `${stats.wordsCompleted}`, color: COLORS.white },
    { label: 'BEST STREAK', value: `${stats.maxStreak}`, color: COLORS.streakGold },
  ];

  rows.forEach((row, i) => {
    const y = panelY + 30 + i * 44;

    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.grey;
    ctx.font = '12px monospace';
    ctx.fillText(row.label, panelX + 20, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = row.color;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(row.value, panelX + panelW - 20, y);
  });
}

/**
 * Draw the menu idle animation.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time - Elapsed time for animation
 */
export function renderMenuBackground(ctx, time) {
  // Dark background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLORS.bgGradientTop);
  grad.addColorStop(1, COLORS.bgGradientBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  drawGridPattern(ctx);

  // Floating word fragments
  const words = ['sigma', 'rizz', 'type', 'fast', 'goated', 'wpm', 'meme', 'aura'];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  words.forEach((word, i) => {
    const phase = time * 0.0005 + i * 0.8;
    const x = W / 2 + Math.sin(phase * 1.3) * 120;
    const y = 100 + (i * 75 + time * 0.02) % (H - 100);
    const alpha = 0.06 + Math.sin(phase) * 0.03;

    ctx.fillStyle = `rgba(0,255,136,${alpha})`;
    ctx.font = `${14 + i % 3 * 4}px monospace`;
    ctx.fillText(word, x, y);
  });
}

/**
 * Helper: draw a rounded rectangle path.
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
