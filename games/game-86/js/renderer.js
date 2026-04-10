/**
 * MEME MAZE -- Renderer
 * All canvas drawing: maze walls, player, exit, stars, fog, minimap, HUD.
 */

const COLORS = {
  bg: '#0a0a1a',
  wall: '#00ff88',
  player: '#ff3366',
  playerGlow: 'rgba(255, 51, 102, 0.4)',
  exit: '#00ff88',
  exitGlow: 'rgba(0, 255, 136, 0.3)',
  star: '#ffd700',
  starGlow: 'rgba(255, 215, 0, 0.3)',
  fog: '#0a0a1a',
  miniMapBg: 'rgba(0, 0, 0, 0.7)',
  miniMapWall: 'rgba(0, 255, 136, 0.5)',
  miniMapPlayer: '#ff3366',
  hudText: '#ffffff',
  hudAccent: '#00ff88',
};

/**
 * @typedef {Object} RenderState
 * @property {import('./maze.js').Maze} maze
 * @property {number} playerRow
 * @property {number} playerCol
 * @property {number} playerAnimX  - Animated pixel X of player
 * @property {number} playerAnimY  - Animated pixel Y of player
 * @property {number} elapsedTime  - Seconds since start
 * @property {number} starsCollected
 * @property {number} totalStars
 * @property {number} level
 * @property {number} fogRadius
 * @property {number} frameTime    - Total elapsed time for animations
 */

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - Logical width
 * @param {number} H - Logical height
 * @param {RenderState} state
 */
export function renderGame(ctx, W, H, state) {
  const { maze, fogRadius, frameTime } = state;

  // Layout constants
  const hudHeight = 50;
  const padding = 10;
  const miniMapSize = 60;
  const mazeAreaW = W - padding * 2;
  const mazeAreaH = H - hudHeight - padding * 2 - miniMapSize - 10;

  const cellW = mazeAreaW / maze.cols;
  const cellH = mazeAreaH / maze.rows;
  const cellSize = Math.min(cellW, cellH);

  const mazeW = cellSize * maze.cols;
  const mazeH = cellSize * maze.rows;
  const offsetX = (W - mazeW) / 2;
  const offsetY = hudHeight + (mazeAreaH - mazeH) / 2 + padding;

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw maze
  drawMaze(ctx, maze, cellSize, offsetX, offsetY, state, frameTime);

  // Draw fog of war
  if (fogRadius < 50) {
    drawFog(ctx, W, H, state, cellSize, offsetX, offsetY, fogRadius);
  }

  // Draw HUD
  drawHUD(ctx, W, state);

  // Draw minimap
  drawMiniMap(ctx, W, H, maze, state, miniMapSize);
}

/**
 * Draw the maze grid, exit, stars, and player.
 */
function drawMaze(ctx, maze, cellSize, ox, oy, state, time) {
  const { cells, rows, cols } = maze;
  const wallThickness = Math.max(1.5, cellSize * 0.08);

  // Draw cell backgrounds for visited feeling
  ctx.strokeStyle = COLORS.wall;
  ctx.lineWidth = wallThickness;
  ctx.lineCap = 'round';

  // Draw exit (pulsing green)
  const exitX = ox + maze.endCol * cellSize;
  const exitY = oy + maze.endRow * cellSize;
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);
  const exitPad = cellSize * 0.15;

  ctx.fillStyle = COLORS.exitGlow;
  ctx.globalAlpha = 0.3 + pulse * 0.3;
  ctx.fillRect(exitX + exitPad, exitY + exitPad, cellSize - exitPad * 2, cellSize - exitPad * 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = COLORS.exit;
  ctx.globalAlpha = 0.6 + pulse * 0.4;
  ctx.fillRect(exitX + exitPad * 1.5, exitY + exitPad * 1.5,
    cellSize - exitPad * 3, cellSize - exitPad * 3);
  ctx.globalAlpha = 1;

  // Draw stars
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].hasStar) {
        drawStar(ctx, ox + c * cellSize + cellSize / 2,
          oy + r * cellSize + cellSize / 2, cellSize * 0.25, time);
      }
    }
  }

  // Draw walls
  ctx.strokeStyle = COLORS.wall;
  ctx.lineWidth = wallThickness;
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cellSize;
      const y = oy + r * cellSize;
      const cell = cells[r][c];

      if (cell.top) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
      }
      if (cell.right) {
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
      }
      if (cell.bottom) {
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
      }
      if (cell.left) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
      }
    }
  }
  ctx.stroke();

  // Draw player
  const px = state.playerAnimX * cellSize + ox + cellSize / 2;
  const py = state.playerAnimY * cellSize + oy + cellSize / 2;
  const playerRadius = cellSize * 0.3;

  // Glow
  ctx.beginPath();
  ctx.arc(px, py, playerRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.playerGlow;
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.arc(px, py, playerRadius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.player;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(px - playerRadius * 0.25, py - playerRadius * 0.25,
    playerRadius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
}

/**
 * Draw a rotating star.
 */
function drawStar(ctx, cx, cy, radius, time) {
  const spikes = 5;
  const outerR = radius;
  const innerR = radius * 0.45;
  const rotation = time * 2;

  // Glow
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.starGlow;
  ctx.fill();

  // Star shape
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = rotation + (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = COLORS.star;
  ctx.fill();
}

/**
 * Draw fog of war -- obscure cells far from the player.
 */
function drawFog(ctx, W, H, state, cellSize, ox, oy, fogRadius) {
  const { maze, playerRow, playerCol } = state;
  const { rows, cols } = maze;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dist = Math.abs(r - playerRow) + Math.abs(c - playerCol);
      if (dist > fogRadius) {
        ctx.fillStyle = COLORS.fog;
        ctx.fillRect(ox + c * cellSize - 1, oy + r * cellSize - 1,
          cellSize + 2, cellSize + 2);
      } else if (dist > fogRadius - 1) {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.6)';
        ctx.fillRect(ox + c * cellSize - 1, oy + r * cellSize - 1,
          cellSize + 2, cellSize + 2);
      }
    }
  }
}

/**
 * Draw the HUD bar at the top.
 */
function drawHUD(ctx, W, state) {
  const { elapsedTime, starsCollected, totalStars, level } = state;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, 44);

  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = 'middle';

  // Level
  ctx.fillStyle = COLORS.hudAccent;
  ctx.textAlign = 'left';
  ctx.fillText(`LVL ${level}`, 10, 22);

  // Timer
  const minutes = Math.floor(state.elapsedTime / 60);
  const seconds = Math.floor(state.elapsedTime % 60);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  ctx.fillStyle = COLORS.hudText;
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, W / 2, 22);

  // Stars
  ctx.fillStyle = COLORS.star;
  ctx.textAlign = 'right';
  ctx.fillText(`★ ${starsCollected}/${totalStars}`, W - 10, 22);
}

/**
 * Draw a mini-map in the bottom-right corner.
 */
function drawMiniMap(ctx, W, H, maze, state, size) {
  const mapX = W - size - 8;
  const mapY = H - size - 8;

  // Background
  ctx.fillStyle = COLORS.miniMapBg;
  ctx.strokeStyle = COLORS.wall;
  ctx.lineWidth = 1;
  const rx = mapX - 4;
  const ry = mapY - 4;
  const rw = size + 8;
  const rh = size + 8;
  const rr = 4;
  ctx.beginPath();
  ctx.moveTo(rx + rr, ry);
  ctx.lineTo(rx + rw - rr, ry);
  ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr);
  ctx.lineTo(rx + rw, ry + rh - rr);
  ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr);
  ctx.lineTo(rx + rr, ry + rh);
  ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr);
  ctx.lineTo(rx, ry + rr);
  ctx.arcTo(rx, ry, rx + rr, ry, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const cellW = size / maze.cols;
  const cellH = size / maze.rows;

  // Walls
  ctx.strokeStyle = COLORS.miniMapWall;
  ctx.lineWidth = 0.5;

  ctx.beginPath();
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const x = mapX + c * cellW;
      const y = mapY + r * cellH;
      const cell = maze.cells[r][c];

      if (cell.top) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellW, y);
      }
      if (cell.right) {
        ctx.moveTo(x + cellW, y);
        ctx.lineTo(x + cellW, y + cellH);
      }
    }
  }
  // Outer border
  ctx.moveTo(mapX, mapY);
  ctx.lineTo(mapX + size, mapY);
  ctx.lineTo(mapX + size, mapY + size);
  ctx.lineTo(mapX, mapY + size);
  ctx.lineTo(mapX, mapY);
  ctx.stroke();

  // Exit indicator
  ctx.fillStyle = COLORS.exit;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(mapX + maze.endCol * cellW, mapY + maze.endRow * cellH, cellW, cellH);
  ctx.globalAlpha = 1;

  // Player dot
  const pdotX = mapX + state.playerAnimX * cellW + cellW / 2;
  const pdotY = mapY + state.playerAnimY * cellH + cellH / 2;
  const dotR = Math.max(1.5, cellW * 0.4);

  ctx.beginPath();
  ctx.arc(pdotX, pdotY, dotR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.miniMapPlayer;
  ctx.fill();
}

