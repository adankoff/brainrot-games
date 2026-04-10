/**
 * MEME PIPES -- Canvas Renderer
 * Draws the pipe grid, HUD, and animations.
 */

const COLOR_BG = '#0a0e17';
const COLOR_GRID_BG = '#141b2a';
const COLOR_CELL_BG = '#1a2235';
const COLOR_CELL_BORDER = '#243045';
const COLOR_PIPE_DIM = '#3a4560';
const COLOR_PIPE_CONNECTED = '#00e5ff';
const COLOR_PIPE_GLOW = 'rgba(0, 229, 255, 0.35)';
const COLOR_SOURCE = '#00ff88';
const COLOR_SINK = '#ff4466';
const COLOR_TEXT = '#e0e8f0';
const COLOR_TEXT_DIM = '#6b7a8d';
const COLOR_WIN_OVERLAY = 'rgba(0, 229, 255, 0.08)';

// Base openings for each pipe type at rotation=0
const BASE_OPENINGS = {
  end:      [true, false, false, false],       // top only
  straight: [true, false, true, false],         // top + bottom
  elbow:    [true, true, false, false],         // top + right
  tee:      [true, true, true, false],          // top + right + bottom (no left)
  cross:    [true, true, true, true],           // all four
};

/**
 * @typedef {Object} RenderState
 * @property {Object[][]} grid
 * @property {{row:number,col:number}} source
 * @property {{row:number,col:number}} sink
 * @property {Set<string>} connectedSet
 * @property {number} level
 * @property {number} moves
 * @property {number} elapsed - seconds
 * @property {boolean} won
 * @property {number} time - total elapsed ms for animations
 * @property {Object|null} rotatingCell - {row, col, startRotation, progress}
 */

/**
 * Compute grid layout dimensions.
 */
function computeLayout(rows, cols, canvasW, canvasH) {
  const hudHeight = 60;
  const padding = 16;
  const availW = canvasW - padding * 2;
  const availH = canvasH - hudHeight - padding * 2;
  const cellSize = Math.floor(Math.min(availW / cols, availH / rows));
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const gridX = Math.floor((canvasW - gridW) / 2);
  const gridY = hudHeight + Math.floor((canvasH - hudHeight - gridH) / 2);
  return { cellSize, gridX, gridY, gridW, gridH };
}

/**
 * Render the full game frame.
 */
export function render(ctx, canvasW, canvasH, state) {
  const { grid, source, sink, connectedSet, level, moves, elapsed, won, time, rotatingCell } = state;
  const rows = grid.length;
  const cols = grid[0].length;
  const layout = computeLayout(rows, cols, canvasW, canvasH);
  const { cellSize, gridX, gridY } = layout;

  // Clear
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // HUD
  drawHUD(ctx, canvasW, level, moves, elapsed, state.totalScore || 0);

  // Grid background
  ctx.fillStyle = COLOR_GRID_BG;
  ctx.fillRect(gridX - 2, gridY - 2, cellSize * cols + 4, cellSize * rows + 4);

  // Draw cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const cx = gridX + c * cellSize;
      const cy = gridY + r * cellSize;
      const isConnected = connectedSet.has(`${r},${c}`);
      const isSource = r === source.row && c === source.col;
      const isSink = r === sink.row && c === sink.col;
      const isRotating = rotatingCell && rotatingCell.row === r && rotatingCell.col === c;

      // Cell background
      ctx.fillStyle = COLOR_CELL_BG;
      ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

      // Cell border
      ctx.strokeStyle = COLOR_CELL_BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1);

      // Calculate visual rotation angle
      let visualRotation = cell.rotation;
      if (isRotating) {
        // Animate from (rotation - 1) to rotation
        const from = rotatingCell.startRotation;
        const to = from + 1;
        const t = easeOutCubic(rotatingCell.progress);
        visualRotation = from + t * (to - from);
      }

      // Draw pipe: use base openings + canvas rotation
      ctx.save();
      ctx.translate(cx + cellSize / 2, cy + cellSize / 2);
      ctx.rotate(visualRotation * Math.PI / 2);

      drawPipeBase(ctx, cell.type, cellSize, isConnected, time);
      ctx.restore();

      // Source / sink indicators
      if (isSource) {
        drawEndpoint(ctx, cx, cy, cellSize, COLOR_SOURCE, time, 'S');
      }
      if (isSink) {
        drawEndpoint(ctx, cx, cy, cellSize, COLOR_SINK, time, 'E');
      }
    }
  }

  // Win overlay
  if (won) {
    drawWinOverlay(ctx, canvasW, canvasH, time);
  }
}

/**
 * Draw the HUD bar.
 */
function drawHUD(ctx, canvasW, level, moves, elapsed, totalScore) {
  const y = 10;

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`LVL ${level}`, 14, y);

  ctx.textAlign = 'center';
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  ctx.fillText(timeStr, canvasW / 2, y);

  if (totalScore > 0) {
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.font = '11px monospace';
    ctx.fillText(`score: ${totalScore}`, canvasW / 2, y + 18);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.font = '12px monospace';
  ctx.fillText(`moves: ${moves}`, canvasW - 14, y + 1);

  // Quit button
  ctx.fillStyle = COLOR_TEXT_DIM;
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('quit', canvasW - 14, y + 18);

  // Separator line
  ctx.strokeStyle = COLOR_CELL_BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 38);
  ctx.lineTo(canvasW - 10, 38);
  ctx.stroke();
}

/**
 * Draw a pipe in its BASE orientation (rotation=0).
 * The canvas transform handles the actual rotation.
 */
function drawPipeBase(ctx, type, cellSize, isConnected, time) {
  const half = cellSize / 2;
  const pipeWidth = Math.max(6, cellSize * 0.22);
  const pipeColor = isConnected ? COLOR_PIPE_CONNECTED : COLOR_PIPE_DIM;

  // Glow for connected pipes
  if (isConnected) {
    ctx.shadowColor = COLOR_PIPE_GLOW;
    ctx.shadowBlur = 8 + Math.sin(time * 0.003) * 3;
  }

  ctx.strokeStyle = pipeColor;
  ctx.lineWidth = pipeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const openings = BASE_OPENINGS[type];
  // Direction endpoints: 0=top, 1=right, 2=bottom, 3=left
  const endPoints = [
    [0, -half + 1],   // top
    [half - 1, 0],    // right
    [0, half - 1],    // bottom
    [-half + 1, 0],   // left
  ];

  ctx.beginPath();
  const openDirs = [];
  for (let d = 0; d < 4; d++) {
    if (openings[d]) openDirs.push(d);
  }

  if (openDirs.length === 1) {
    // End cap
    const d = openDirs[0];
    ctx.moveTo(0, 0);
    ctx.lineTo(endPoints[d][0], endPoints[d][1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, pipeWidth * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = pipeColor;
    ctx.fill();
  } else if (openDirs.length === 2) {
    const [a, b] = openDirs;
    if (Math.abs(a - b) === 2) {
      // Straight
      ctx.moveTo(endPoints[a][0], endPoints[a][1]);
      ctx.lineTo(endPoints[b][0], endPoints[b][1]);
      ctx.stroke();
    } else {
      // Elbow
      ctx.moveTo(endPoints[a][0], endPoints[a][1]);
      ctx.lineTo(0, 0);
      ctx.lineTo(endPoints[b][0], endPoints[b][1]);
      ctx.stroke();
    }
  } else if (openDirs.length === 3 || openDirs.length === 4) {
    // T-junction or Cross
    for (const d of openDirs) {
      ctx.moveTo(0, 0);
      ctx.lineTo(endPoints[d][0], endPoints[d][1]);
    }
    ctx.stroke();
  }

  // Center dot for connected pipes
  if (isConnected) {
    ctx.beginPath();
    ctx.arc(0, 0, pipeWidth * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_PIPE_CONNECTED;
    ctx.fill();
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw a source/sink endpoint indicator.
 */
function drawEndpoint(ctx, cx, cy, cellSize, color, time, label) {
  const pulse = 0.7 + 0.3 * Math.sin(time * 0.004);
  const radius = cellSize * 0.12;

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx + cellSize / 2, cy + cellSize / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Label
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(9, cellSize * 0.18)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, cx + cellSize / 2, cy + 12);
}

/**
 * Draw win celebration overlay.
 */
function drawWinOverlay(ctx, canvasW, canvasH, time) {
  ctx.fillStyle = COLOR_WIN_OVERLAY;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const pulse = 0.8 + 0.2 * Math.sin(time * 0.005);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLOR_PIPE_CONNECTED;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = COLOR_PIPE_GLOW;
  ctx.shadowBlur = 20;
  ctx.fillText('FLOW CONNECTED!', canvasW / 2, canvasH / 2);
  ctx.restore();
}

/**
 * Hit test: given a tap position, return the grid cell {row, col} or null.
 */
export function hitTestCell(x, y, rows, cols, canvasW, canvasH) {
  const layout = computeLayout(rows, cols, canvasW, canvasH);
  const { cellSize, gridX, gridY } = layout;

  const col = Math.floor((x - gridX) / cellSize);
  const row = Math.floor((y - gridY) / cellSize);

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    return { row, col };
  }
  return null;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
