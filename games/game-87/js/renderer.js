/**
 * MEME WORD SEARCH -- Canvas Renderer
 * Draws the grid, selection highlights, word list, and HUD.
 */

/** Color palette for found words (cycles through) */
const FOUND_COLORS = [
  'rgba(0, 229, 255, 0.30)',   // cyan
  'rgba(255, 64, 129, 0.30)',  // pink
  'rgba(118, 255, 3, 0.30)',   // green
  'rgba(255, 215, 0, 0.30)',   // gold
  'rgba(156, 39, 176, 0.30)',  // purple
  'rgba(255, 152, 0, 0.30)',   // orange
  'rgba(0, 176, 255, 0.30)',   // blue
  'rgba(244, 67, 54, 0.30)',   // red
  'rgba(0, 230, 118, 0.30)',   // teal
  'rgba(255, 109, 0, 0.30)',   // deep orange
];

const FOUND_LINE_COLORS = [
  'rgba(0, 229, 255, 0.70)',
  'rgba(255, 64, 129, 0.70)',
  'rgba(118, 255, 3, 0.70)',
  'rgba(255, 215, 0, 0.70)',
  'rgba(156, 39, 176, 0.70)',
  'rgba(255, 152, 0, 0.70)',
  'rgba(0, 176, 255, 0.70)',
  'rgba(244, 67, 54, 0.70)',
  'rgba(0, 230, 118, 0.70)',
  'rgba(255, 109, 0, 0.70)',
];

/**
 * @typedef {Object} RenderState
 * @property {string[][]} grid
 * @property {string[]} words
 * @property {Set<string>} foundWords
 * @property {Object[]} placements
 * @property {{ row: number, col: number }|null} selStart
 * @property {{ row: number, col: number }|null} selEnd
 * @property {number} elapsed - seconds
 * @property {number} gridSize
 * @property {number} cellSize
 * @property {number} gridOffsetX
 * @property {number} gridOffsetY
 * @property {number} foundColorIndex
 * @property {Map<string, number>} wordColorMap
 */

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {RenderState} state
 * @param {number} W - logical width
 * @param {number} H - logical height
 */
export function render(ctx, state, W, H) {
  // Clear
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  drawHUD(ctx, state, W);
  drawGrid(ctx, state);
  drawFoundHighlights(ctx, state);
  drawSelection(ctx, state);
  drawLetters(ctx, state);
  drawWordList(ctx, state, W, H);
}

/**
 * Draw HUD (timer + progress).
 */
function drawHUD(ctx, state, W) {
  const { elapsed, foundWords, words } = state;

  // Timer
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  ctx.fillStyle = '#e0e0ff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(timeStr, 12, 10);

  // Progress
  const progressStr = `${foundWords.size}/${words.length}`;
  ctx.textAlign = 'right';
  ctx.fillText(progressStr, W - 12, 10);

  // Label
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#666688';
  ctx.fillText('MEME WORD SEARCH', W / 2, 12);
}

/**
 * Draw the grid background and cell borders.
 */
function drawGrid(ctx, state) {
  const { gridSize, cellSize, gridOffsetX, gridOffsetY } = state;

  ctx.strokeStyle = '#1a1a3a';
  ctx.lineWidth = 1;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = gridOffsetX + c * cellSize;
      const y = gridOffsetY + r * cellSize;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }
}

/**
 * Draw highlights for found words.
 */
function drawFoundHighlights(ctx, state) {
  const { placements, foundWords, cellSize, gridOffsetX, gridOffsetY, wordColorMap } = state;

  for (const p of placements) {
    if (!foundWords.has(p.word)) continue;

    const colorIdx = wordColorMap.get(p.word) || 0;
    const fillColor = FOUND_COLORS[colorIdx % FOUND_COLORS.length];
    const lineColor = FOUND_LINE_COLORS[colorIdx % FOUND_LINE_COLORS.length];

    // Highlight cells
    ctx.fillStyle = fillColor;
    for (let i = 0; i < p.word.length; i++) {
      const r = p.startRow + p.dirRow * i;
      const c = p.startCol + p.dirCol * i;
      const x = gridOffsetX + c * cellSize;
      const y = gridOffsetY + r * cellSize;
      ctx.fillRect(x, y, cellSize, cellSize);
    }

    // Draw line through centers
    const startX = gridOffsetX + (p.startCol + 0.5) * cellSize;
    const startY = gridOffsetY + (p.startRow + 0.5) * cellSize;
    const endX = gridOffsetX + (p.startCol + p.dirCol * (p.word.length - 1) + 0.5) * cellSize;
    const endY = gridOffsetY + (p.startRow + p.dirRow * (p.word.length - 1) + 0.5) * cellSize;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = cellSize * 0.6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

/**
 * Draw the current selection highlight.
 */
function drawSelection(ctx, state) {
  const { selStart, selEnd, cellSize, gridOffsetX, gridOffsetY } = state;
  if (!selStart || !selEnd) return;

  const startX = gridOffsetX + (selStart.col + 0.5) * cellSize;
  const startY = gridOffsetY + (selStart.row + 0.5) * cellSize;
  const endX = gridOffsetX + (selEnd.col + 0.5) * cellSize;
  const endY = gridOffsetY + (selEnd.row + 0.5) * cellSize;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = cellSize * 0.65;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/**
 * Draw grid letters.
 */
function drawLetters(ctx, state) {
  const { grid, gridSize, cellSize, gridOffsetX, gridOffsetY, foundWords, placements } = state;

  // Build a set of cells belonging to found words for coloring
  const foundCells = new Set();
  for (const p of placements) {
    if (!foundWords.has(p.word)) continue;
    for (let i = 0; i < p.word.length; i++) {
      const r = p.startRow + p.dirRow * i;
      const c = p.startCol + p.dirCol * i;
      foundCells.add(`${r},${c}`);
    }
  }

  const fontSize = Math.floor(cellSize * 0.55);
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = gridOffsetX + c * cellSize + cellSize / 2;
      const y = gridOffsetY + r * cellSize + cellSize / 2;
      const isFound = foundCells.has(`${r},${c}`);

      ctx.fillStyle = isFound ? '#ffffff' : '#b0b0d0';
      ctx.fillText(grid[r][c], x, y);
    }
  }
}

/**
 * Draw the word list below the grid.
 */
function drawWordList(ctx, state, W, H) {
  const { words, foundWords, gridOffsetY, gridSize, cellSize } = state;

  const listTop = gridOffsetY + gridSize * cellSize + 14;
  const colWidth = W / 2;
  const lineHeight = 20;
  const fontSize = 13;

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < words.length; i++) {
    const col = i < Math.ceil(words.length / 2) ? 0 : 1;
    const row = col === 0 ? i : i - Math.ceil(words.length / 2);
    const x = col * colWidth + 20;
    const y = listTop + row * lineHeight;

    if (y > H - 10) continue;

    const word = words[i];
    const isFound = foundWords.has(word);

    ctx.textAlign = 'left';

    if (isFound) {
      const colorIdx = state.wordColorMap.get(word) || 0;
      ctx.fillStyle = FOUND_LINE_COLORS[colorIdx % FOUND_LINE_COLORS.length];
      ctx.fillText(word, x, y);

      // Strikethrough
      const textW = ctx.measureText(word).width;
      ctx.beginPath();
      ctx.moveTo(x, y + fontSize / 2);
      ctx.lineTo(x + textW, y + fontSize / 2);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#666688';
      ctx.fillText(word, x, y);
    }
  }
}
