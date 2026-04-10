/**
 * MEME CROSSWORD -- Renderer
 * Draws the crossword grid, clues, keyboard, and HUD onto the canvas.
 */

const COLORS = {
  bg: '#1a1a2e',
  surface: '#16213e',
  cell: '#ffffff',
  cellBlack: '#1a1a2e',
  cellSelected: '#e94560',
  cellWordHighlight: '#ffd6de',
  cellCorrect: '#c8ffc8',
  border: '#333355',
  text: '#111111',
  textLight: '#ffffff',
  textMuted: '#aaaacc',
  clueText: '#ffffff',
  accent: '#e94560',
  accentAlt: '#0f3460',
  keyBg: '#2a2a4e',
  keyText: '#ffffff',
  keyPressed: '#e94560',
  cursor: '#e94560',
  timerBg: '#0f3460',
  correctFlash: '#4ade80',
  errorFlash: '#ef4444',
};

const GRID_SIZE = 5;

/**
 * Render the full game state onto the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - The full game state from main.js
 */
export function render(ctx, state) {
  const W = 400;
  const H = 700;

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw HUD (timer + errors)
  drawHUD(ctx, state, W);

  // Draw current clue
  drawCurrentClue(ctx, state, W);

  // Draw grid
  drawGrid(ctx, state, W);

  // Draw clue list
  drawClueList(ctx, state, W);

  // Draw on-screen keyboard
  drawKeyboard(ctx, state, W, H);
}

/**
 * Draw timer and error count at top.
 */
function drawHUD(ctx, state, W) {
  const y = 8;

  // Timer
  ctx.fillStyle = COLORS.timerBg;
  ctx.beginPath();
  roundRect(ctx, 10, y, 80, 28, 6);
  ctx.fill();

  const minutes = Math.floor(state.elapsedSeconds / 60);
  const seconds = Math.floor(state.elapsedSeconds % 60);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  ctx.fillStyle = COLORS.textLight;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, 50, y + 14);

  // Errors
  ctx.fillStyle = COLORS.timerBg;
  ctx.beginPath();
  roundRect(ctx, W - 100, y, 90, 28, 6);
  ctx.fill();

  ctx.fillStyle = state.errors > 0 ? COLORS.errorFlash : COLORS.textMuted;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`errors: ${state.errors}`, W - 55, y + 14);
}

/**
 * Draw the current selected clue prominently.
 */
function drawCurrentClue(ctx, state, W) {
  const y = 44;
  const padX = 12;

  ctx.fillStyle = COLORS.surface;
  ctx.beginPath();
  roundRect(ctx, padX, y, W - padX * 2, 36, 6);
  ctx.fill();

  if (state.currentClue) {
    const dirLabel = state.currentClue.direction === 'across' ? 'A' : 'D';
    const clueStr = `${state.currentClue.num}${dirLabel}: ${state.currentClue.text}`;

    ctx.fillStyle = COLORS.clueText;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Truncate if too long
    const maxW = W - padX * 2 - 16;
    let display = clueStr;
    while (ctx.measureText(display).width > maxW && display.length > 3) {
      display = display.slice(0, -4) + '...';
    }
    ctx.fillText(display, W / 2, y + 18);
  } else {
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap a cell to start', W / 2, y + 18);
  }
}

/**
 * Draw the 5x5 crossword grid.
 */
function drawGrid(ctx, state, W) {
  const gridTop = 88;
  const cellSize = 56;
  const gridW = GRID_SIZE * cellSize;
  const gridLeft = (W - gridW) / 2;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = gridLeft + c * cellSize;
      const y = gridTop + r * cellSize;
      const cellVal = state.puzzle.grid[r][c];

      if (cellVal === null) {
        // Black cell
        ctx.fillStyle = COLORS.cellBlack;
        ctx.fillRect(x, y, cellSize, cellSize);
        continue;
      }

      // Determine cell state
      const isSelected = state.selectedRow === r && state.selectedCol === c;
      const isInWord = state.highlightedCells.some(([hr, hc]) => hr === r && hc === c);
      const cellFlash = state.cellFlashes[`${r},${c}`];

      // Cell background
      if (cellFlash && cellFlash.type === 'correct') {
        ctx.fillStyle = COLORS.correctFlash;
      } else if (cellFlash && cellFlash.type === 'error') {
        ctx.fillStyle = COLORS.errorFlash;
      } else if (isSelected) {
        ctx.fillStyle = COLORS.cellSelected;
      } else if (isInWord) {
        ctx.fillStyle = COLORS.cellWordHighlight;
      } else {
        ctx.fillStyle = COLORS.cell;
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      // Cell border
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellSize, cellSize);

      // Cell number (top-left)
      const cellNum = state.cellNumbers[r][c];
      if (cellNum > 0) {
        ctx.fillStyle = isSelected ? '#ffffff' : '#555577';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(String(cellNum), x + 3, y + 2);
      }

      // Letter
      const letter = state.userGrid[r][c];
      if (letter) {
        ctx.fillStyle = isSelected ? '#ffffff' : COLORS.text;
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2 + 2);
      }

      // Cursor blink indicator on selected cell
      if (isSelected && !letter && state.cursorVisible) {
        ctx.fillStyle = COLORS.cursor;
        ctx.fillRect(x + cellSize / 2 - 8, y + cellSize - 8, 16, 3);
      }
    }
  }
}

/**
 * Draw the clue list below the grid.
 */
function drawClueList(ctx, state, W) {
  const gridTop = 88;
  const cellSize = 56;
  const listTop = gridTop + GRID_SIZE * cellSize + 8;
  const lineH = 14;
  const padX = 14;

  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const acrossClues = state.puzzle.clues.filter(c => c.direction === 'across');
  const downClues = state.puzzle.clues.filter(c => c.direction === 'down');

  let y = listTop;

  // Across header
  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('ACROSS', padX, y);
  y += lineH;

  ctx.font = '10px sans-serif';
  for (const clue of acrossClues) {
    const isActive = state.currentClue &&
      state.currentClue.num === clue.num &&
      state.currentClue.direction === clue.direction;
    ctx.fillStyle = isActive ? COLORS.accent : COLORS.textMuted;

    const wordComplete = isWordComplete(state, clue);
    const prefix = wordComplete ? '\u2713 ' : '';

    const text = `${prefix}${clue.num}. ${clue.text}`;
    const maxW = (W / 2) - padX - 4;
    let display = text;
    while (ctx.measureText(display).width > maxW && display.length > 3) {
      display = display.slice(0, -4) + '...';
    }
    ctx.fillText(display, padX, y);
    y += lineH;
  }

  // Down header
  let y2 = listTop;
  const col2X = W / 2 + 4;
  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('DOWN', col2X, y2);
  y2 += lineH;

  ctx.font = '10px sans-serif';
  for (const clue of downClues) {
    const isActive = state.currentClue &&
      state.currentClue.num === clue.num &&
      state.currentClue.direction === clue.direction;
    ctx.fillStyle = isActive ? COLORS.accent : COLORS.textMuted;

    const wordComplete = isWordComplete(state, clue);
    const prefix = wordComplete ? '\u2713 ' : '';

    const text = `${prefix}${clue.num}. ${clue.text}`;
    const maxW = (W / 2) - padX - 4;
    let display = text;
    while (ctx.measureText(display).width > maxW && display.length > 3) {
      display = display.slice(0, -4) + '...';
    }
    ctx.fillText(display, col2X, y2);
    y2 += lineH;
  }
}

/**
 * Check if a word is complete and correct.
 */
function isWordComplete(state, clue) {
  const cells = getWordCells(clue);
  for (const [r, c] of cells) {
    if (state.userGrid[r][c] !== state.puzzle.grid[r][c]) return false;
  }
  return true;
}

/**
 * Get all cells for a given clue.
 */
function getWordCells(clue) {
  const cells = [];
  let r = clue.row;
  let c = clue.col;
  for (let i = 0; i < clue.answer.length; i++) {
    cells.push([r, c]);
    if (clue.direction === 'across') c++;
    else r++;
  }
  return cells;
}

/**
 * Draw the on-screen letter keyboard.
 */
function drawKeyboard(ctx, state, W, H) {
  const rows = state.keyboardRows;
  const keyH = 36;
  const gap = 4;
  const kbTop = H - (rows.length * (keyH + gap)) - 6;

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const totalW = row.reduce((sum, k) => sum + k.w + gap, -gap);
    let x = (W - totalW) / 2;
    const y = kbTop + ri * (keyH + gap);

    for (const key of row) {
      const isPressed = state.pressedKey === key.label;

      ctx.fillStyle = isPressed ? COLORS.keyPressed : COLORS.keyBg;
      ctx.beginPath();
      roundRect(ctx, x, y, key.w, keyH, 5);
      ctx.fill();

      ctx.fillStyle = COLORS.keyText;
      ctx.font = key.label.length > 1 ? 'bold 12px sans-serif' : 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key.label, x + key.w / 2, y + keyH / 2);

      // Store hit area
      key.x = x;
      key.y = y;
      key.h = keyH;

      x += key.w + gap;
    }
  }
}

/**
 * Rounded rectangle helper.
 */
function roundRect(ctx, x, y, w, h, r) {
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
