/**
 * MEME PAC -- Renderer
 * Draws the maze, pac-man, ghosts, HUD, etc.
 */

import { COLS, ROWS, CELL, MAZE_X, MAZE_Y, DIR } from './pacman.js';

const W = 400;
const H = 700;

const WALL_COLOR = '#2121de';
const DOT_COLOR = '#ffb8ae';
const PELLET_COLOR = '#ffb8ae';
const BG_COLOR = '#000000';
const VULNERABLE_COLOR = '#2121de';
const VULNERABLE_FLASH_COLOR = '#ffffff';
const EATEN_COLOR = '#aaaaaa';

/**
 * Draw the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
export function render(ctx, state) {
  const { maze, pac, ghosts, score, lives, level, powerTimer, ghostCombo, deathTimer, readyTimer, floatingTexts } = state;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  drawMaze(ctx, maze, powerTimer);
  drawDots(ctx, maze, powerTimer);

  if (pac.alive || deathTimer > 0) {
    drawPacMan(ctx, pac, deathTimer);
  }

  for (const ghost of ghosts) {
    drawGhost(ctx, ghost, powerTimer);
  }

  drawFloatingTexts(ctx, floatingTexts);
  drawHUD(ctx, score, lives, level);

  if (readyTimer > 0) {
    drawReady(ctx);
  }
}

/**
 * Draw the maze walls.
 */
function drawMaze(ctx, maze, powerTimer) {
  ctx.fillStyle = WALL_COLOR;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (maze[r][c] === 0) {
        const x = MAZE_X + c * CELL;
        const y = MAZE_Y + r * CELL;

        // Draw wall blocks with slight inset for visual distinction
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

        // Draw wall borders for maze-like appearance
        ctx.strokeStyle = '#4444ff';
        ctx.lineWidth = 1;

        // Only draw borders adjacent to walkable cells
        if (r > 0 && maze[r-1][c] !== 0) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); ctx.stroke();
        }
        if (r < ROWS-1 && maze[r+1][c] !== 0) {
          ctx.beginPath(); ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); ctx.stroke();
        }
        if (c > 0 && maze[r][c-1] !== 0) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); ctx.stroke();
        }
        if (c < COLS-1 && maze[r][c+1] !== 0) {
          ctx.beginPath(); ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); ctx.stroke();
        }
      }
    }
  }
}

/**
 * Draw dots and power pellets.
 */
function drawDots(ctx, maze, powerTimer) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = maze[r][c];
      const cx = MAZE_X + c * CELL + CELL / 2;
      const cy = MAZE_Y + r * CELL + CELL / 2;

      if (cell === 1) {
        // Small dot
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (cell === 3) {
        // Power pellet (pulsing)
        const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 200);
        ctx.fillStyle = PELLET_COLOR;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

/**
 * Draw Pac-Man.
 */
function drawPacMan(ctx, pac, deathTimer) {
  const px = MAZE_X + pac.x * CELL + CELL / 2;
  const py = MAZE_Y + pac.y * CELL + CELL / 2;
  const radius = CELL / 2 - 2;

  if (deathTimer > 0) {
    // Death animation: pac-man shrinks
    const progress = deathTimer / 60;
    const angle = Math.PI * 2 * (1 - progress);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, radius * progress, 0, angle);
    ctx.closePath();
    ctx.fill();
    return;
  }

  // Direction angle offset
  const dirAngle = pac.dir === DIR.RIGHT ? 0 :
                   pac.dir === DIR.DOWN  ? Math.PI / 2 :
                   pac.dir === DIR.LEFT  ? Math.PI :
                   -Math.PI / 2;

  const mouth = pac.mouthAngle * Math.PI;

  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, radius, dirAngle + mouth, dirAngle + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();

  // Eye
  const eyeDist = radius * 0.35;
  const eyeAngle = dirAngle - Math.PI / 4;
  const eyeX = px + Math.cos(eyeAngle) * eyeDist;
  const eyeY = py + Math.sin(eyeAngle) * eyeDist;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a ghost.
 */
function drawGhost(ctx, ghost, powerTimer) {
  if (ghost.inHouse && ghost.houseTimer > 0) {
    // Still waiting in house, draw faintly
    ctx.globalAlpha = 0.4;
  }

  const gx = MAZE_X + ghost.x * CELL + CELL / 2;
  const gy = MAZE_Y + ghost.y * CELL + CELL / 2;
  const size = CELL / 2 - 1;

  if (ghost.eaten) {
    // Just eyes returning to house
    drawGhostEyes(ctx, gx, gy, size, ghost.dir);
    ctx.globalAlpha = 1;
    return;
  }

  let color;
  if (ghost.vulnerable) {
    // Flash white when power is about to expire
    if (powerTimer < 120 && Math.floor(powerTimer / 10) % 2 === 0) {
      color = VULNERABLE_FLASH_COLOR;
    } else {
      color = VULNERABLE_COLOR;
    }
  } else {
    color = ghost.color;
  }

  // Ghost body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(gx, gy - 2, size, Math.PI, 0);
  ctx.lineTo(gx + size, gy + size - 2);

  // Wavy bottom
  const waveCount = 3;
  const waveWidth = (size * 2) / waveCount;
  for (let i = 0; i < waveCount; i++) {
    const x1 = gx + size - i * waveWidth;
    const x2 = x1 - waveWidth;
    const midX = (x1 + x2) / 2;
    ctx.quadraticCurveTo(midX, gy + size - 2 - 4, x2, gy + size - 2);
  }

  ctx.closePath();
  ctx.fill();

  // Eyes
  if (ghost.vulnerable) {
    // Scared face
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gx - 4, gy - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(gx + 4, gy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Wavy mouth
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx - 5, gy + 3);
    for (let i = 0; i < 4; i++) {
      const sx = gx - 5 + i * 3.3;
      ctx.lineTo(sx + 1.6, gy + (i % 2 === 0 ? 1 : 5));
    }
    ctx.stroke();
  } else {
    drawGhostEyes(ctx, gx, gy, size, ghost.dir);
  }

  ctx.globalAlpha = 1;
}

/**
 * Draw ghost eyes.
 */
function drawGhostEyes(ctx, gx, gy, size, dir) {
  const eyeOffsetX = dir === DIR.LEFT ? -2 : dir === DIR.RIGHT ? 2 : 0;
  const eyeOffsetY = dir === DIR.UP ? -2 : dir === DIR.DOWN ? 2 : 0;

  // White of eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(gx - 4, gy - 4, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(gx + 4, gy - 4, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#00f';
  ctx.beginPath();
  ctx.arc(gx - 4 + eyeOffsetX, gy - 4 + eyeOffsetY, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gx + 4 + eyeOffsetX, gy - 4 + eyeOffsetY, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw floating score texts.
 */
function drawFloatingTexts(ctx, texts) {
  for (const t of texts) {
    ctx.globalAlpha = Math.max(0, t.life / 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }
}

/**
 * Draw HUD (score, lives, level).
 */
function drawHUD(ctx, score, lives, level) {
  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, MAZE_X, 25);

  // Level
  ctx.textAlign = 'right';
  ctx.fillText(`LVL ${level}`, MAZE_X + COLS * CELL, 25);

  // Lives (drawn as small pac-men below maze)
  const livesY = MAZE_Y + ROWS * CELL + 25;
  ctx.fillStyle = '#ffff00';
  for (let i = 0; i < lives; i++) {
    const lx = MAZE_X + 15 + i * 28;
    ctx.beginPath();
    ctx.moveTo(lx, livesY);
    ctx.arc(lx, livesY, 9, 0.3, Math.PI * 2 - 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // "MEME PAC" branding
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('MEME PAC', MAZE_X + COLS * CELL, livesY + 5);
}

/**
 * Draw "READY!" text.
 */
function drawReady(ctx) {
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('READY!', W / 2, MAZE_Y + 7.5 * CELL + CELL / 2);
}
