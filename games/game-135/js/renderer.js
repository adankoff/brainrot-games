/**
 * MEME BOGGLE -- Renderer
 * Draws the Boggle grid, selection path, timer, score, and found words on canvas.
 */

const W = 400;
const H = 700;

// Grid layout
const GRID_SIZE = 4;
const TILE_SIZE = 70;
const TILE_GAP = 8;
const GRID_TOTAL = GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * TILE_GAP;
const GRID_X = (W - GRID_TOTAL) / 2;
const GRID_Y = 90;

// Colors
const COL_BG = '#0a0a0f';
const COL_TILE = '#1a1a2e';
const COL_TILE_BORDER = '#2a2a4e';
const COL_TILE_SELECTED = '#3a1a6e';
const COL_TILE_SELECTED_BORDER = '#c8ff00';
const COL_LETTER = '#ffffff';
const COL_LETTER_SELECTED = '#c8ff00';
const COL_PATH_LINE = '#c8ff0088';
const COL_TIMER_BG = '#1a1a2e';
const COL_TIMER_FILL = '#c8ff00';
const COL_TIMER_LOW = '#ff3838';
const COL_SCORE = '#c8ff00';
const COL_WORD_VALID = '#4ade80';
const COL_WORD_INVALID = '#ff3838';
const COL_WORD_TEXT = '#aaaacc';
const COL_CURRENT_WORD = '#c8ff00';
const COL_FOUND_HEADER = '#666688';

/**
 * Get the center position of a tile.
 * @param {number} row
 * @param {number} col
 * @returns {{x: number, y: number}}
 */
export function getTileCenter(row, col) {
  return {
    x: GRID_X + col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
    y: GRID_Y + row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
  };
}

/**
 * Get the tile at a logical coordinate, or null.
 * @param {number} x
 * @param {number} y
 * @returns {{row: number, col: number}|null}
 */
export function getTileAt(x, y) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tx = GRID_X + c * (TILE_SIZE + TILE_GAP);
      const ty = GRID_Y + r * (TILE_SIZE + TILE_GAP);
      if (x >= tx && x <= tx + TILE_SIZE && y >= ty && y <= ty + TILE_SIZE) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Render the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
export function render(ctx, state) {
  const {
    grid, path, foundWords, score, timeLeft, totalTime,
    flashType, flashTimer, currentWord,
  } = state;

  // Background
  ctx.fillStyle = COL_BG;
  ctx.fillRect(0, 0, W, H);

  // Draw timer bar
  drawTimer(ctx, timeLeft, totalTime);

  // Draw score
  drawScore(ctx, score);

  // Draw current word being traced
  drawCurrentWord(ctx, currentWord);

  // Draw grid
  drawGrid(ctx, grid, path, flashType, flashTimer);

  // Draw path lines
  drawPathLines(ctx, path);

  // Draw found words list
  drawFoundWords(ctx, foundWords);
}

/**
 * Draw the timer bar.
 */
function drawTimer(ctx, timeLeft, totalTime) {
  const barX = 20;
  const barY = 18;
  const barW = W - 40;
  const barH = 8;
  const ratio = Math.max(0, timeLeft / totalTime);
  const isLow = timeLeft <= 30;

  // Background
  ctx.fillStyle = COL_TIMER_BG;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  // Fill
  if (ratio > 0) {
    ctx.fillStyle = isLow ? COL_TIMER_LOW : COL_TIMER_FILL;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * ratio, barH, 4);
    ctx.fill();
  }

  // Time text
  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  ctx.fillStyle = isLow ? COL_TIMER_LOW : '#888899';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(timeStr, W - 20, 30);
}

/**
 * Draw the score display.
 */
function drawScore(ctx, score) {
  ctx.fillStyle = COL_SCORE;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(score.toString(), 20, 38);

  ctx.fillStyle = '#666688';
  ctx.font = '12px monospace';
  ctx.fillText('PTS', 20 + ctx.measureText(score.toString()).width + 6, 46);
}

/**
 * Draw the current word being traced.
 */
function drawCurrentWord(ctx, word) {
  if (!word) return;
  ctx.fillStyle = COL_CURRENT_WORD;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(word, W / 2, GRID_Y - 8);
}

/**
 * Draw the 4x4 grid of letter tiles.
 */
function drawGrid(ctx, grid, path, flashType, flashTimer) {
  const selectedSet = new Set(path.map(p => `${p.row},${p.col}`));
  const flashAlpha = flashTimer > 0 ? flashTimer : 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = GRID_X + c * (TILE_SIZE + TILE_GAP);
      const y = GRID_Y + r * (TILE_SIZE + TILE_GAP);
      const key = `${r},${c}`;
      const isSelected = selectedSet.has(key);

      // Flash overlay
      let tileBg = isSelected ? COL_TILE_SELECTED : COL_TILE;
      let tileBorder = isSelected ? COL_TILE_SELECTED_BORDER : COL_TILE_BORDER;
      let letterColor = isSelected ? COL_LETTER_SELECTED : COL_LETTER;

      if (flashAlpha > 0 && flashType === 'valid') {
        tileBg = lerpColor(tileBg, '#1a4e1a', flashAlpha);
        tileBorder = lerpColor(tileBorder, '#4ade80', flashAlpha);
      } else if (flashAlpha > 0 && flashType === 'invalid') {
        tileBg = lerpColor(tileBg, '#4e1a1a', flashAlpha);
        tileBorder = lerpColor(tileBorder, '#ff3838', flashAlpha);
      }

      // Tile background
      ctx.fillStyle = tileBg;
      ctx.beginPath();
      ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 10);
      ctx.fill();

      // Tile border
      ctx.strokeStyle = tileBorder;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 10);
      ctx.stroke();

      // Letter
      ctx.fillStyle = letterColor;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(grid[r][c], x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 2);
    }
  }
}

/**
 * Draw lines connecting selected path tiles.
 */
function drawPathLines(ctx, path) {
  if (path.length < 2) return;

  ctx.strokeStyle = COL_PATH_LINE;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  const first = getTileCenter(path[0].row, path[0].col);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < path.length; i++) {
    const p = getTileCenter(path[i].row, path[i].col);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

/**
 * Draw the found words list.
 */
function drawFoundWords(ctx, foundWords) {
  const listY = GRID_Y + GRID_TOTAL + 24;
  const listX = 20;
  const maxH = H - listY - 10;

  // Header
  ctx.fillStyle = COL_FOUND_HEADER;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`FOUND (${foundWords.length})`, listX, listY);

  // Words in columns
  const wordY = listY + 20;
  const colWidth = 90;
  const lineHeight = 20;
  const maxCols = Math.floor((W - 40) / colWidth);
  const maxRows = Math.floor((maxH - 30) / lineHeight);

  ctx.font = '14px monospace';

  // Show words newest first (reversed)
  const words = [...foundWords].reverse();

  for (let i = 0; i < words.length && i < maxCols * maxRows; i++) {
    const col = Math.floor(i / maxRows);
    const row = i % maxRows;
    const x = listX + col * colWidth;
    const y = wordY + row * lineHeight;

    if (y + lineHeight > H) break;

    const { word, points } = words[i];
    ctx.fillStyle = COL_WORD_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText(word, x, y);

    ctx.fillStyle = COL_SCORE;
    ctx.font = '11px monospace';
    ctx.fillText(`+${points}`, x + ctx.measureText(word).width + 4, y + 2);
    ctx.font = '14px monospace';
  }
}

/**
 * Simple color interpolation for flash effects.
 */
function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
