/**
 * MEME SOKOBAN -- Renderer
 * Canvas rendering for the Sokoban grid, player, crates, targets, walls.
 */

import { TILE, ENTITY } from './sokoban.js';
import { lerp } from '../../shared/utils.js';

/** Color palette */
const COLORS = {
  bg: '#1a1a2e',
  floor: '#2a2a3e',
  wall: '#4a4a5e',
  wallTop: '#5a5a6e',
  wallDark: '#3a3a4e',
  target: '#ff6b6b',
  targetGlow: 'rgba(255, 107, 107, 0.25)',
  crate: '#c8a45c',
  crateLight: '#dab96e',
  crateDark: '#a8843c',
  crateOnTarget: '#6bcf6b',
  crateOnTargetLight: '#8bef8b',
  crateOnTargetDark: '#4baf4b',
  player: '#4ecdc4',
  playerDark: '#2eada4',
  playerEye: '#fff',
  playerPupil: '#1a1a2e',
  hudBg: 'rgba(0, 0, 0, 0.7)',
  hudText: '#fff',
  solvedFlash: 'rgba(255, 255, 255, 0.3)',
};

/**
 * Calculate rendering metrics for the grid within the canvas.
 *
 * @param {number} gridWidth - Number of columns
 * @param {number} gridHeight - Number of rows
 * @param {number} canvasWidth - Canvas logical width
 * @param {number} canvasHeight - Canvas logical height
 * @returns {{ cellSize: number, offsetX: number, offsetY: number }}
 */
export function calcMetrics(gridWidth, gridHeight, canvasWidth, canvasHeight) {
  // Reserve some vertical space for HUD (top) and controls (bottom)
  const hudHeight = 32;
  const controlsHeight = 48;
  const availableWidth = canvasWidth - 16;
  const availableHeight = canvasHeight - hudHeight - controlsHeight - 16;

  const cellW = Math.floor(availableWidth / gridWidth);
  const cellH = Math.floor(availableHeight / gridHeight);
  const cellSize = Math.min(cellW, cellH, 40);

  const gridPixelW = gridWidth * cellSize;
  const gridPixelH = gridHeight * cellSize;
  const offsetX = Math.floor((canvasWidth - gridPixelW) / 2);
  const offsetY = hudHeight + Math.floor((availableHeight - gridPixelH) / 2) + 8;

  return { cellSize, offsetX, offsetY };
}

/**
 * Render the full game state to the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./sokoban.js').SokobanGame} game
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} solvedFlash - Flash intensity 0-1 for level complete effect
 */
export function renderGame(ctx, game, canvasWidth, canvasHeight, solvedFlash) {
  const { cellSize, offsetX, offsetY } = calcMetrics(
    game.width,
    game.height,
    canvasWidth,
    canvasHeight
  );

  // Clear background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw grid
  for (let r = 0; r < game.height; r++) {
    for (let c = 0; c < game.width; c++) {
      const x = offsetX + c * cellSize;
      const y = offsetY + r * cellSize;
      const tile = game.grid[r][c];
      const entity = game.entities[r][c];

      // Skip empty space outside the puzzle
      if (tile === TILE.FLOOR && entity === ENTITY.NONE && _isOutside(game, r, c)) {
        continue;
      }

      // Draw floor
      if (tile !== TILE.WALL) {
        ctx.fillStyle = COLORS.floor;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Subtle grid line
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }

      // Draw target marker
      if (tile === TILE.TARGET) {
        _drawTarget(ctx, x, y, cellSize);
      }

      // Draw wall
      if (tile === TILE.WALL) {
        _drawWall(ctx, x, y, cellSize);
      }
    }
  }

  // Draw crates (separate pass so animations overlay correctly)
  for (let r = 0; r < game.height; r++) {
    for (let c = 0; c < game.width; c++) {
      if (game.entities[r][c] === ENTITY.CRATE) {
        // Skip the crate being animated (we draw it separately)
        if (
          game.animation &&
          game.animation.hasCrate &&
          r === game.animation.crateToRow &&
          c === game.animation.crateToCol &&
          game.animation.progress < 1
        ) {
          continue;
        }

        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;
        const onTarget = game.grid[r][c] === TILE.TARGET;
        _drawCrate(ctx, x, y, cellSize, onTarget);
      }
    }
  }

  // Draw animated crate
  if (game.animation && game.animation.hasCrate && game.animation.progress < 1) {
    const anim = game.animation;
    const ax = offsetX + lerp(anim.crateFromCol, anim.crateToCol, anim.progress) * cellSize;
    const ay = offsetY + lerp(anim.crateFromRow, anim.crateToRow, anim.progress) * cellSize;
    const onTarget = game.grid[anim.crateToRow][anim.crateToCol] === TILE.TARGET;
    _drawCrate(ctx, ax, ay, cellSize, onTarget);
  }

  // Draw player
  _drawPlayer(ctx, game, offsetX, offsetY, cellSize);

  // Draw HUD
  _drawHUD(ctx, game, canvasWidth);

  // Level solved flash
  if (solvedFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${solvedFlash * 0.3})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

/**
 * Render the menu background.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} time - Animation time in seconds
 */
export function renderMenuBg(ctx, w, h, time) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  // Draw some decorative crates and walls
  const cs = 30;
  const pattern = [
    { r: 3, c: 2, type: 'wall' },
    { r: 3, c: 3, type: 'wall' },
    { r: 3, c: 4, type: 'wall' },
    { r: 4, c: 2, type: 'wall' },
    { r: 4, c: 4, type: 'wall' },
    { r: 5, c: 4, type: 'wall' },
    { r: 4, c: 3, type: 'target' },
    { r: 5, c: 3, type: 'crate' },
  ];

  const baseX = Math.floor((w - 7 * cs) / 2);
  const baseY = Math.floor(h * 0.55);

  for (const p of pattern) {
    const x = baseX + p.c * cs;
    const y = baseY + p.r * cs;
    if (p.type === 'wall') {
      _drawWall(ctx, x, y, cs);
    } else if (p.type === 'target') {
      ctx.fillStyle = COLORS.floor;
      ctx.fillRect(x, y, cs, cs);
      _drawTarget(ctx, x, y, cs);
    } else if (p.type === 'crate') {
      ctx.fillStyle = COLORS.floor;
      ctx.fillRect(x, y, cs, cs);
      _drawCrate(ctx, x, y, cs, false);
    }
  }

  // Animated player
  const playerX = baseX + 5 * cs;
  const playerY = baseY + 5 * cs;
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(playerX, playerY, cs, cs);

  const cx = playerX + cs / 2;
  const cy = playerY + cs / 2;
  const radius = cs * 0.35;

  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Bobbing eyes
  const eyeOff = radius * 0.3;
  const bobX = Math.sin(time * 2) * 1.5;
  const eyeR = radius * 0.18;

  ctx.fillStyle = COLORS.playerEye;
  ctx.beginPath();
  ctx.arc(cx - eyeOff + bobX, cy - eyeOff * 0.5, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeOff + bobX, cy - eyeOff * 0.5, eyeR, 0, Math.PI * 2);
  ctx.fill();

  const pupilR = eyeR * 0.55;
  ctx.fillStyle = COLORS.playerPupil;
  ctx.beginPath();
  ctx.arc(cx - eyeOff + bobX * 1.3, cy - eyeOff * 0.5, pupilR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeOff + bobX * 1.3, cy - eyeOff * 0.5, pupilR, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Private Drawing Helpers ----

/**
 * Check if a floor tile is "outside" the puzzle (not reachable).
 * Simple heuristic: if surrounded by non-walls and no adjacent wall, it's outside.
 */
function _isOutside(game, r, c) {
  // If it's next to a wall, it's inside
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < game.height && nc >= 0 && nc < game.width) {
      if (game.grid[nr][nc] === TILE.WALL) return false;
    }
  }
  // Check diagonals too
  const diags = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diags) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < game.height && nc >= 0 && nc < game.width) {
      if (game.grid[nr][nc] === TILE.WALL) return false;
    }
  }
  return true;
}

/**
 * Draw a wall block with 3D-ish effect.
 */
function _drawWall(ctx, x, y, size) {
  const inset = 1;

  // Main wall face
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);

  // Top edge highlight
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(x + inset, y + inset, size - inset * 2, size * 0.2);

  // Bottom edge shadow
  ctx.fillStyle = COLORS.wallDark;
  ctx.fillRect(x + inset, y + size * 0.8, size - inset * 2, size * 0.2 - inset);

  // Cross pattern
  ctx.strokeStyle = COLORS.wallDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + inset);
  ctx.lineTo(x + size * 0.5, y + size - inset);
  ctx.moveTo(x + inset, y + size * 0.5);
  ctx.lineTo(x + size - inset, y + size * 0.5);
  ctx.stroke();
}

/**
 * Draw a target diamond marker.
 */
function _drawTarget(ctx, x, y, size) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.25;

  // Glow
  ctx.fillStyle = COLORS.targetGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Diamond
  ctx.fillStyle = COLORS.target;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  const ir = r * 0.4;
  ctx.moveTo(cx, cy - ir);
  ctx.lineTo(cx + ir, cy);
  ctx.lineTo(cx, cy + ir);
  ctx.lineTo(cx - ir, cy);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a crate.
 */
function _drawCrate(ctx, x, y, size, onTarget) {
  const pad = size * 0.08;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const cx = x + pad;
  const cy = y + pad;
  const radius = size * 0.08;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  _roundRect(ctx, cx + 2, cy + 2, w, h, radius);
  ctx.fill();

  // Main body
  ctx.fillStyle = onTarget ? COLORS.crateOnTarget : COLORS.crate;
  _roundRect(ctx, cx, cy, w, h, radius);
  ctx.fill();

  // Top highlight
  ctx.fillStyle = onTarget ? COLORS.crateOnTargetLight : COLORS.crateLight;
  _roundRect(ctx, cx, cy, w, h * 0.35, radius);
  ctx.fill();

  // Cross detail
  ctx.strokeStyle = onTarget ? COLORS.crateOnTargetDark : COLORS.crateDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.3, cy + h * 0.3);
  ctx.lineTo(cx + w * 0.7, cy + h * 0.7);
  ctx.moveTo(cx + w * 0.7, cy + h * 0.3);
  ctx.lineTo(cx + w * 0.3, cy + h * 0.7);
  ctx.stroke();

  // Border
  ctx.strokeStyle = onTarget ? COLORS.crateOnTargetDark : COLORS.crateDark;
  ctx.lineWidth = 1.5;
  _roundRect(ctx, cx, cy, w, h, radius);
  ctx.stroke();
}

/**
 * Draw the player (colored circle with eyes).
 */
function _drawPlayer(ctx, game, offsetX, offsetY, cellSize) {
  let px, py;

  if (game.animation && game.animation.progress < 1) {
    const anim = game.animation;
    px = offsetX + lerp(anim.fromCol, anim.toCol, anim.progress) * cellSize;
    py = offsetY + lerp(anim.fromRow, anim.toRow, anim.progress) * cellSize;
  } else {
    px = offsetX + game.playerCol * cellSize;
    py = offsetY + game.playerRow * cellSize;
  }

  const cx = px + cellSize / 2;
  const cy = py + cellSize / 2;
  const radius = cellSize * 0.38;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(cx + 1.5, cy + 1.5, radius, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Darker lower half for 3D feel
  ctx.fillStyle = COLORS.playerDark;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI);
  ctx.fill();

  // Eyes - determine facing direction from last move
  let eyeDirX = 0;
  let eyeDirY = 0;
  if (game.animation) {
    eyeDirX = game.animation.toCol - game.animation.fromCol;
    eyeDirY = game.animation.toRow - game.animation.fromRow;
  }

  const eyeOff = radius * 0.32;
  const eyeR = radius * 0.2;
  const pupilShift = eyeR * 0.3;

  // Left eye
  const lex = cx - eyeOff;
  const ley = cy - eyeOff * 0.3;
  ctx.fillStyle = COLORS.playerEye;
  ctx.beginPath();
  ctx.arc(lex, ley, eyeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.playerPupil;
  ctx.beginPath();
  ctx.arc(lex + eyeDirX * pupilShift, ley + eyeDirY * pupilShift, eyeR * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  const rex = cx + eyeOff;
  const rey = cy - eyeOff * 0.3;
  ctx.fillStyle = COLORS.playerEye;
  ctx.beginPath();
  ctx.arc(rex, rey, eyeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.playerPupil;
  ctx.beginPath();
  ctx.arc(rex + eyeDirX * pupilShift, rey + eyeDirY * pupilShift, eyeR * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw the in-game HUD bar.
 */
function _drawHUD(ctx, game, canvasWidth) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, canvasWidth, 28);

  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.textBaseline = 'middle';

  // Level
  ctx.textAlign = 'left';
  ctx.fillText(`LV ${game.levelIndex + 1}/${game.getLevelCount()}`, 8, 14);

  // Moves
  ctx.textAlign = 'center';
  ctx.fillText(`MOVES: ${game.levelMoves}`, canvasWidth / 2, 14);

  // Score
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE: ${game.getScore()}`, canvasWidth - 8, 14);
}

/**
 * Draw a rounded rectangle path.
 */
function _roundRect(ctx, x, y, w, h, r) {
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
