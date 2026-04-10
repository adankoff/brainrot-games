/**
 * MEME HANGMAN -- Renderer
 * All canvas drawing: background, gallows, hangman figure, word blanks,
 * category/hint, on-screen keyboard, and game state indicators.
 */

const FONT = '"Space Grotesk", sans-serif';

// Keyboard layout (3 rows)
const KB_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split(''),
];

// Gallows geometry (relative to gallows area)
const GALLOWS = {
  baseY: 200,
  baseX: 80,
  topY: 40,
  beamEndX: 220,
  ropeEndY: 70,
};

// Colors
const COL_BG_TOP = '#0a0a1a';
const COL_BG_BOT = '#121228';
const COL_GALLOWS = '#444466';
const COL_FIGURE = '#e0e0f0';
const COL_CORRECT = '#00e676';
const COL_WRONG = '#ff1744';
const COL_USED = '#333350';
const COL_KEY_BG = '#1a1a3a';
const COL_KEY_TEXT = '#ccccee';
const COL_KEY_BORDER = '#2a2a5a';
const COL_BLANK = '#c8ff00';
const COL_HINT = '#888899';
const COL_CATEGORY = '#c8ff00';

/**
 * Compute the bounding boxes for each keyboard key.
 * Call once when dimensions are known, cache the result.
 *
 * @param {number} w - Logical canvas width
 * @param {number} h - Logical canvas height
 * @returns {Array<{ letter: string, x: number, y: number, w: number, h: number }>}
 */
export function computeKeyboardLayout(w, h) {
  const keys = [];
  const kbTop = h - 190;
  const rowHeight = 52;
  const gap = 4;
  const maxKeysInRow = 10; // first row has 10
  const keyW = (w - gap * (maxKeysInRow + 1)) / maxKeysInRow;
  const keyH = rowHeight - gap;

  for (let r = 0; r < KB_ROWS.length; r++) {
    const row = KB_ROWS[r];
    const totalRowW = row.length * (keyW + gap) - gap;
    const offsetX = (w - totalRowW) / 2;
    const y = kbTop + r * rowHeight;

    for (let c = 0; c < row.length; c++) {
      keys.push({
        letter: row[c],
        x: offsetX + c * (keyW + gap),
        y,
        w: keyW,
        h: keyH,
      });
    }
  }

  return keys;
}

/**
 * Draw the full game scene.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state object
 * @param {number} w - Logical width
 * @param {number} h - Logical height
 * @param {Array} keyLayout - Pre-computed keyboard layout
 */
export function renderFrame(ctx, state, w, h, keyLayout) {
  drawBackground(ctx, w, h);
  drawGallows(ctx, w);
  drawHangmanFigure(ctx, w, state.wrongCount);
  drawWordBlanks(ctx, state, w);
  drawCategoryAndHint(ctx, state, w);
  drawKeyboard(ctx, state, keyLayout);

  if (state.revealFlash > 0) {
    drawRevealFlash(ctx, w, h, state.revealFlash, state.won);
  }
}

/**
 * Draw the dark gradient background.
 */
function drawBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COL_BG_TOP);
  grad.addColorStop(1, COL_BG_BOT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw the gallows structure.
 */
function drawGallows(ctx, w) {
  const cx = w / 2;
  const ox = cx - 70; // offset center for gallows

  ctx.strokeStyle = COL_GALLOWS;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Base
  ctx.beginPath();
  ctx.moveTo(ox - 40, GALLOWS.baseY);
  ctx.lineTo(ox + 80, GALLOWS.baseY);
  ctx.stroke();

  // Vertical pole
  ctx.beginPath();
  ctx.moveTo(ox, GALLOWS.baseY);
  ctx.lineTo(ox, GALLOWS.topY);
  ctx.stroke();

  // Top beam
  ctx.beginPath();
  ctx.moveTo(ox, GALLOWS.topY);
  ctx.lineTo(cx + 20, GALLOWS.topY);
  ctx.stroke();

  // Rope
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 20, GALLOWS.topY);
  ctx.lineTo(cx + 20, GALLOWS.ropeEndY);
  ctx.stroke();

  // Diagonal brace
  ctx.lineWidth = 2;
  ctx.strokeStyle = COL_GALLOWS + '88';
  ctx.beginPath();
  ctx.moveTo(ox, GALLOWS.topY + 30);
  ctx.lineTo(ox + 30, GALLOWS.topY);
  ctx.stroke();
}

/**
 * Draw the hangman figure based on wrong guess count (0-6).
 */
function drawHangmanFigure(ctx, w, wrongCount) {
  if (wrongCount === 0) return;

  const cx = w / 2 + 20; // head center x (aligned with rope)
  const headY = GALLOWS.ropeEndY + 20; // head center y
  const headR = 20;

  ctx.strokeStyle = COL_FIGURE;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // 1. Head
  if (wrongCount >= 1) {
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.stroke();

    // Face (expression changes with wrong count)
    drawFace(ctx, cx, headY, headR, wrongCount);
  }

  // 2. Body
  if (wrongCount >= 2) {
    ctx.beginPath();
    ctx.moveTo(cx, headY + headR);
    ctx.lineTo(cx, headY + headR + 55);
    ctx.stroke();
  }

  // 3. Left arm
  if (wrongCount >= 3) {
    ctx.beginPath();
    ctx.moveTo(cx, headY + headR + 15);
    ctx.lineTo(cx - 30, headY + headR + 40);
    ctx.stroke();
  }

  // 4. Right arm
  if (wrongCount >= 4) {
    ctx.beginPath();
    ctx.moveTo(cx, headY + headR + 15);
    ctx.lineTo(cx + 30, headY + headR + 40);
    ctx.stroke();
  }

  // 5. Left leg
  if (wrongCount >= 5) {
    ctx.beginPath();
    ctx.moveTo(cx, headY + headR + 55);
    ctx.lineTo(cx - 25, headY + headR + 85);
    ctx.stroke();
  }

  // 6. Right leg
  if (wrongCount >= 6) {
    ctx.beginPath();
    ctx.moveTo(cx, headY + headR + 55);
    ctx.lineTo(cx + 25, headY + headR + 85);
    ctx.stroke();
  }
}

/**
 * Draw the face on the hangman head. Expression worsens with wrong guesses.
 */
function drawFace(ctx, cx, cy, r, wrongCount) {
  const eyeY = cy - 4;
  const eyeSpacing = 7;

  ctx.fillStyle = COL_FIGURE;

  if (wrongCount <= 2) {
    // Neutral face: dot eyes, flat mouth
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Flat mouth
    ctx.strokeStyle = COL_FIGURE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 7);
    ctx.lineTo(cx + 6, cy + 7);
    ctx.stroke();
  } else if (wrongCount <= 4) {
    // Worried face: open eyes, wavy mouth
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dark pupils
    ctx.fillStyle = COL_BG_TOP;
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Frown
    ctx.strokeStyle = COL_FIGURE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 12, 6, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  } else {
    // Dead face: X eyes, tongue out
    ctx.strokeStyle = COL_WRONG;
    ctx.lineWidth = 2;

    // X left eye
    ctx.beginPath();
    ctx.moveTo(cx - eyeSpacing - 3, eyeY - 3);
    ctx.lineTo(cx - eyeSpacing + 3, eyeY + 3);
    ctx.moveTo(cx - eyeSpacing + 3, eyeY - 3);
    ctx.lineTo(cx - eyeSpacing - 3, eyeY + 3);
    ctx.stroke();

    // X right eye
    ctx.beginPath();
    ctx.moveTo(cx + eyeSpacing - 3, eyeY - 3);
    ctx.lineTo(cx + eyeSpacing + 3, eyeY + 3);
    ctx.moveTo(cx + eyeSpacing + 3, eyeY - 3);
    ctx.lineTo(cx + eyeSpacing - 3, eyeY + 3);
    ctx.stroke();

    // Tongue
    ctx.strokeStyle = COL_WRONG;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 6);
    ctx.lineTo(cx, cy + 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 13, 3, 0, Math.PI);
    ctx.stroke();
  }
}

/**
 * Draw the word blanks (underscores for unguessed letters, revealed letters).
 */
function drawWordBlanks(ctx, state, w) {
  const word = state.currentWord;
  const guessed = state.guessedLetters;
  const isOver = state.gameEnded;
  const y = 260;

  // Split into "visual units" - handle multi-word
  const chars = word.split('');

  // Compute sizing
  const maxCharW = 28;
  const gap = 4;
  const spaceGap = 16;

  // Calculate total width
  let totalW = 0;
  for (const ch of chars) {
    totalW += ch === ' ' ? spaceGap : maxCharW + gap;
  }
  totalW -= gap; // remove trailing gap

  // Scale down if too wide
  const availW = w - 30;
  const scale = totalW > availW ? availW / totalW : 1;
  const charW = maxCharW * scale;
  const charGap = gap * scale;
  const sGap = spaceGap * scale;

  // Recalc total with scale
  let totalScaledW = 0;
  for (const ch of chars) {
    totalScaledW += ch === ' ' ? sGap : charW + charGap;
  }
  totalScaledW -= charGap;

  let x = (w - totalScaledW) / 2;

  ctx.font = `bold ${Math.round(22 * scale)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const ch of chars) {
    if (ch === ' ') {
      x += sGap;
      continue;
    }

    const letterX = x + charW / 2;
    const isGuessed = guessed.has(ch);
    const showLetter = isGuessed || isOver;

    if (showLetter) {
      // Show the letter
      if (isOver && !isGuessed) {
        // Reveal unguessed letters in red on game over
        ctx.fillStyle = COL_WRONG;
      } else {
        ctx.fillStyle = COL_BLANK;
      }
      ctx.fillText(ch, letterX, y);
    }

    // Draw underscore
    ctx.strokeStyle = isGuessed ? COL_CORRECT + '66' : '#555577';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 16 * scale);
    ctx.lineTo(x + charW - 2, y + 16 * scale);
    ctx.stroke();

    x += charW + charGap;
  }
}

/**
 * Draw the category tag and hint text.
 */
function drawCategoryAndHint(ctx, state, w) {
  const y = 310;

  // Category badge
  ctx.font = `bold 12px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const catText = state.category.toUpperCase();
  const catMetrics = ctx.measureText(catText);
  const catW = catMetrics.width + 16;
  const catH = 22;
  const catX = w / 2 - catW / 2;

  // Badge background
  ctx.fillStyle = COL_CATEGORY + '22';
  ctx.strokeStyle = COL_CATEGORY + '66';
  ctx.lineWidth = 1;
  roundRect(ctx, catX, y - catH / 2, catW, catH, 4);
  ctx.fill();
  roundRect(ctx, catX, y - catH / 2, catW, catH, 4);
  ctx.stroke();

  ctx.fillStyle = COL_CATEGORY;
  ctx.fillText(catText, w / 2, y);

  // Hint text
  ctx.font = `14px ${FONT}`;
  ctx.fillStyle = COL_HINT;
  ctx.fillText(`"${state.hint}"`, w / 2, y + 28);

  // Lives remaining indicator
  const livesY = y + 56;
  ctx.font = `bold 13px ${FONT}`;
  const livesLeft = 6 - state.wrongCount;
  ctx.fillStyle = livesLeft <= 2 ? COL_WRONG : COL_FIGURE + '88';
  ctx.fillText(`${livesLeft} ${livesLeft === 1 ? 'life' : 'lives'} remaining`, w / 2, livesY);
}

/**
 * Draw the on-screen keyboard.
 */
function drawKeyboard(ctx, state, keyLayout) {
  const guessed = state.guessedLetters;
  const correctLetters = new Set(state.currentWord.replace(/ /g, '').split(''));

  for (const key of keyLayout) {
    const isGuessed = guessed.has(key.letter);
    const isCorrect = correctLetters.has(key.letter);

    // Key background
    if (isGuessed && isCorrect) {
      ctx.fillStyle = COL_CORRECT + '33';
      ctx.strokeStyle = COL_CORRECT;
    } else if (isGuessed) {
      ctx.fillStyle = COL_USED;
      ctx.strokeStyle = COL_USED;
    } else {
      ctx.fillStyle = COL_KEY_BG;
      ctx.strokeStyle = COL_KEY_BORDER;
    }

    ctx.lineWidth = 1.5;
    roundRect(ctx, key.x, key.y, key.w, key.h, 6);
    ctx.fill();
    roundRect(ctx, key.x, key.y, key.w, key.h, 6);
    ctx.stroke();

    // Key letter
    ctx.font = `bold 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isGuessed && isCorrect) {
      ctx.fillStyle = COL_CORRECT;
    } else if (isGuessed) {
      ctx.fillStyle = '#555566';
    } else {
      ctx.fillStyle = COL_KEY_TEXT;
    }

    ctx.fillText(key.letter, key.x + key.w / 2, key.y + key.h / 2);
  }
}

/**
 * Draw a screen flash on correct/wrong reveal.
 */
function drawRevealFlash(ctx, w, h, alpha, isWin) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = isWin ? COL_CORRECT : COL_WRONG;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Helper: draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
