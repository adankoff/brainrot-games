/**
 * MEME BEE -- Renderer
 * All canvas drawing: honeycomb, current word, found words, rank bar, buttons.
 */

// Polyfill roundRect for older browsers
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 0);
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.arcTo(x + w, y, x + w, y + radius, radius);
    this.lineTo(x + w, y + h - radius);
    this.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    this.lineTo(x + radius, y + h);
    this.arcTo(x, y + h, x, y + h - radius, radius);
    this.lineTo(x, y + radius);
    this.arcTo(x, y, x + radius, y, radius);
    this.closePath();
    return this;
  };
}

const W = 400;
const H = 700;

// Colors
const BG_COLOR = '#1a1a2e';
const HEX_CENTER_COLOR = '#f5c518';
const HEX_CENTER_TEXT = '#1a1a2e';
const HEX_OUTER_COLOR = '#2d2d4a';
const HEX_OUTER_HOVER = '#3a3a5e';
const HEX_TEXT_COLOR = '#f0f0f0';
const ACCENT = '#f5c518';
const DIM_TEXT = '#888';
const FOUND_BG = '#242442';
const BTN_COLOR = '#2d2d4a';
const BTN_TEXT = '#f0f0f0';
const ERROR_COLOR = '#ff4444';
const PANGRAM_COLOR = '#f5c518';
const SUCCESS_COLOR = '#44ff88';

// Layout
const HEX_RADIUS = 38;
const HEX_CENTER_X = W / 2;
const HEX_CENTER_Y = 330;
const HEX_SPACING = HEX_RADIUS * 1.85;

// Hex positions: center + 6 surrounding (starting top, going clockwise)
function getHexPositions() {
  const positions = [{ x: HEX_CENTER_X, y: HEX_CENTER_Y }]; // center
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 6) + (i * Math.PI / 3); // 30 deg offset so top hex is above
    positions.push({
      x: HEX_CENTER_X + Math.cos(angle) * HEX_SPACING,
      y: HEX_CENTER_Y - Math.sin(angle) * HEX_SPACING,
    });
  }
  return positions;
}

const HEX_POSITIONS = getHexPositions();

/**
 * Draw a hexagon at (cx, cy) with given radius.
 */
function drawHexagon(ctx, cx, cy, radius, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/**
 * Check if point (px, py) is inside hexagon at (cx, cy) with given radius.
 */
export function pointInHex(px, py, cx, cy, radius) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  // Quick rectangular check
  if (dx > radius || dy > radius) return false;
  // Hexagonal check (flat-top)
  return (radius * radius * 3 / 4) >= (dx * dx + dy * dy - dx * dy);
}

/**
 * Get hit info for a tap at (x, y).
 * Returns { type: 'letter', index } or { type: 'enter'|'delete'|'shuffle'|'done' } or null.
 */
export function getHitTarget(x, y, bee) {
  // Check hex letters
  const letters = [bee.center, ...bee.outer];
  for (let i = 0; i < HEX_POSITIONS.length && i < letters.length; i++) {
    const pos = HEX_POSITIONS[i];
    if (pointInHex(x, y, pos.x, pos.y, HEX_RADIUS + 4)) {
      return { type: 'letter', letter: letters[i], index: i };
    }
  }

  // Check buttons
  const buttons = getButtonRects();
  for (const btn of buttons) {
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      return { type: btn.id };
    }
  }

  return null;
}

function getButtonRects() {
  const btnY = 430;
  const btnH = 36;
  const btnW = 80;
  const gap = 12;
  const totalW = btnW * 4 + gap * 3;
  const startX = (W - totalW) / 2;

  return [
    { id: 'delete', x: startX, y: btnY, w: btnW, h: btnH },
    { id: 'shuffle', x: startX + btnW + gap, y: btnY, w: btnW, h: btnH },
    { id: 'enter', x: startX + (btnW + gap) * 2, y: btnY, w: btnW, h: btnH },
    { id: 'done', x: startX + (btnW + gap) * 3, y: btnY, w: btnW, h: btnH },
  ];
}

/**
 * Main render function.
 */
export function render(ctx, bee) {
  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  drawRankBar(ctx, bee);
  drawCurrentWord(ctx, bee);
  drawMessage(ctx, bee);
  drawHoneycomb(ctx, bee);
  drawButtons(ctx);
  drawFoundWords(ctx, bee);
  drawStats(ctx, bee);
}

function drawRankBar(ctx, bee) {
  const barX = 30;
  const barY = 22;
  const barW = W - 60;
  const barH = 8;
  const progress = bee.getProgress();
  const rank = bee.getRank();

  // Background bar
  ctx.fillStyle = '#2d2d4a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  // Fill bar
  if (progress > 0) {
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(8, barW * Math.min(progress, 1)), barH, 4);
    ctx.fill();
  }

  // Rank text
  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = ACCENT;
  ctx.fillText(rank, barX, barY + 26);

  // Score text
  ctx.textAlign = 'right';
  ctx.fillStyle = HEX_TEXT_COLOR;
  ctx.fillText(`${bee.score} / ${bee.maxScore}`, barX + barW, barY + 26);
}

function drawCurrentWord(ctx, bee) {
  const y = 80;
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';

  if (bee.currentWord.length > 0) {
    // Measure each letter individually for coloring
    const word = bee.currentWord.toUpperCase();
    const letters = word.split('');
    const widths = letters.map(ch => ctx.measureText(ch).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    let x = W / 2 - totalWidth / 2;

    ctx.textAlign = 'left';
    for (let i = 0; i < letters.length; i++) {
      ctx.fillStyle = letters[i].toLowerCase() === bee.center ? ACCENT : HEX_TEXT_COLOR;
      ctx.fillText(letters[i], x, y);
      x += widths[i];
    }
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('Type or tap letters', W / 2, y);
  }

  // Underline
  const wordLen = Math.max(bee.currentWord.length, 1);
  const underW = Math.min(wordLen * 22, W - 80);
  ctx.strokeStyle = bee.currentWord.length > 0 ? ACCENT : '#444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - underW / 2, y + 8);
  ctx.lineTo(W / 2 + underW / 2, y + 8);
  ctx.stroke();
}

function drawMessage(ctx, bee) {
  if (!bee.message || bee.messageTimer <= 0) return;

  const alpha = Math.min(1, bee.messageTimer / 30);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';

  if (bee.messageType === 'error') {
    ctx.fillStyle = ERROR_COLOR;
  } else if (bee.messageType === 'pangram') {
    ctx.fillStyle = PANGRAM_COLOR;
  } else {
    ctx.fillStyle = SUCCESS_COLOR;
  }

  ctx.fillText(bee.message, W / 2, 110);
  ctx.restore();
}

function drawHoneycomb(ctx, bee) {
  const letters = [bee.center, ...bee.outer];

  for (let i = 0; i < HEX_POSITIONS.length && i < letters.length; i++) {
    const pos = HEX_POSITIONS[i];
    const isCenter = i === 0;

    // Draw hex
    drawHexagon(
      ctx,
      pos.x,
      pos.y,
      HEX_RADIUS,
      isCenter ? HEX_CENTER_COLOR : HEX_OUTER_COLOR,
      null
    );

    // Draw letter
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isCenter ? HEX_CENTER_TEXT : HEX_TEXT_COLOR;
    ctx.fillText(letters[i].toUpperCase(), pos.x, pos.y + 1);
  }

  ctx.textBaseline = 'alphabetic';
}

function drawButtons(ctx) {
  const buttons = getButtonRects();
  const labels = ['Delete', 'Shuffle', 'Enter', 'Done'];
  const colors = [BTN_COLOR, BTN_COLOR, ACCENT, '#553333'];
  const textColors = [BTN_TEXT, BTN_TEXT, '#1a1a2e', '#ff8888'];

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 8);
    ctx.fill();

    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = textColors[i];
    ctx.fillText(labels[i], btn.x + btn.w / 2, btn.y + btn.h / 2 + 5);
  }
}

function drawFoundWords(ctx, bee) {
  const listY = 485;
  const listH = H - listY - 10;
  const listX = 20;
  const listW = W - 40;

  // Header
  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = DIM_TEXT;
  ctx.fillText(
    `Found ${bee.foundWords.length} / ${bee.getTotalWordCount()} words`,
    listX,
    listY
  );

  // Word list background
  const wordsY = listY + 12;
  const wordsH = listH - 16;
  ctx.fillStyle = FOUND_BG;
  ctx.beginPath();
  ctx.roundRect(listX, wordsY, listW, wordsH, 8);
  ctx.fill();

  // Draw found words in columns
  if (bee.foundWords.length === 0) {
    ctx.font = '13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('No words found yet', W / 2, wordsY + wordsH / 2 + 4);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(listX, wordsY, listW, wordsH);
  ctx.clip();

  const colWidth = 110;
  const cols = Math.floor(listW / colWidth);
  const rowHeight = 20;
  const padX = 12;
  const padY = 16;

  // Sort found words alphabetically
  const sorted = [...bee.foundWords].sort();

  // Scroll offset: show newest words (scroll to bottom)
  const totalRows = Math.ceil(sorted.length / cols);
  const visibleRows = Math.floor(wordsH / rowHeight);
  const scrollOffset = Math.max(0, totalRows - visibleRows);

  for (let i = 0; i < sorted.length; i++) {
    const word = sorted[i];
    const row = Math.floor(i / cols) - scrollOffset;
    const col = i % cols;

    if (row < 0) continue;
    const wy = wordsY + padY + row * rowHeight;
    if (wy > wordsY + wordsH - 5) break;

    const isPangram = _isPangramCheck(word, [bee.center, ...bee.outer]);

    ctx.font = isPangram
      ? 'bold 13px "Space Grotesk", sans-serif'
      : '13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = isPangram ? PANGRAM_COLOR : HEX_TEXT_COLOR;
    ctx.fillText(word.toUpperCase(), listX + padX + col * colWidth, wy);
  }

  ctx.restore();
}

function _isPangramCheck(word, allLetters) {
  const used = new Set(word);
  for (const l of allLetters) {
    if (!used.has(l)) return false;
  }
  return true;
}

function drawStats(ctx, bee) {
  // Small stats at very bottom are covered by the found words list
  // Stats are shown in rank bar instead
}
