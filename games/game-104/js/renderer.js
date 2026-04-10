/**
 * FLOOD FILL -- Renderer
 * Canvas drawing: grid, HUD, color buttons, animations.
 */

import { NUM_COLORS, getCurrentColor, getMovesRemaining } from './flood.js';

// 6 distinct, vibrant colors
const COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f1c40f', // yellow
  '#9b59b6', // purple
  '#e67e22', // orange
];

const COLORS_DARK = [
  '#c0392b',
  '#2980b9',
  '#27ae60',
  '#d4ac0d',
  '#8e44ad',
  '#d35400',
];

const COLORS_LIGHT = [
  '#f1948a',
  '#85c1e9',
  '#82e0aa',
  '#f9e79f',
  '#c39bd3',
  '#f0b27a',
];

const W = 400;
const H = 700;

// Layout constants
const HUD_HEIGHT = 60;
const GRID_PADDING = 16;
const BUTTON_AREA_HEIGHT = 90;
const GRID_TOP = HUD_HEIGHT + 8;
const GRID_BOTTOM = H - BUTTON_AREA_HEIGHT - 8;
const GRID_AVAILABLE_H = GRID_BOTTOM - GRID_TOP;
const GRID_AVAILABLE_W = W - GRID_PADDING * 2;

/**
 * Compute cell size and grid offset for current grid dimensions.
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {{ cellSize: number, gridX: number, gridY: number, gridW: number, gridH: number }}
 */
export function getGridLayout(rows, cols) {
  const cellSize = Math.floor(Math.min(GRID_AVAILABLE_W / cols, GRID_AVAILABLE_H / rows));
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const gridX = Math.floor((W - gridW) / 2);
  const gridY = Math.floor(GRID_TOP + (GRID_AVAILABLE_H - gridH) / 2);
  return { cellSize, gridX, gridY, gridW, gridH };
}

/**
 * Get the layout rectangles for the 6 color buttons.
 *
 * @returns {Array<{x: number, y: number, w: number, h: number, color: number}>}
 */
export function getButtonLayout() {
  const btnW = 50;
  const btnH = 50;
  const gap = 8;
  const totalW = NUM_COLORS * btnW + (NUM_COLORS - 1) * gap;
  const startX = Math.floor((W - totalW) / 2);
  const btnY = H - BUTTON_AREA_HEIGHT + 12;

  const buttons = [];
  for (let i = 0; i < NUM_COLORS; i++) {
    buttons.push({
      x: startX + i * (btnW + gap),
      y: btnY,
      w: btnW,
      h: btnH,
      color: i,
    });
  }
  return buttons;
}

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./flood.js').FloodState} state
 * @param {Object} anim - Animation state
 * @param {Map<string, number>} anim.rippleCells - Map of "r,c" -> wave index for active ripple
 * @param {number} anim.rippleProgress - 0..1 overall animation progress
 * @param {number} anim.rippleMaxWave - total number of waves
 * @param {number} anim.rippleNewColor - the new color being filled
 */
export function render(ctx, state, anim) {
  // Background
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  renderHUD(ctx, state);
  renderGrid(ctx, state, anim);
  renderButtons(ctx, state, anim);
}

/**
 * Render the HUD: moves counter and moves remaining.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./flood.js').FloodState} state
 */
function renderHUD(ctx, state) {
  const remaining = getMovesRemaining(state);

  // Background bar
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, W, HUD_HEIGHT);

  // Move count (left)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Move ${state.moves}/${state.maxMoves}`, 16, HUD_HEIGHT / 2);

  // Remaining (right) -- color changes when low
  const urgency = remaining <= 3;
  ctx.fillStyle = urgency ? '#e74c3c' : '#00e5ff';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${remaining} left`, W - 16, HUD_HEIGHT / 2);
}

/**
 * Render the grid with optional ripple animation.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./flood.js').FloodState} state
 * @param {Object} anim
 */
function renderGrid(ctx, state, anim) {
  const { rows, cols, grid } = state;
  const { cellSize, gridX, gridY } = getGridLayout(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gridX + c * cellSize;
      const y = gridY + r * cellSize;
      let colorIndex = grid[r][c];
      let scale = 1;

      // Ripple animation
      if (anim.rippleCells && anim.rippleCells.size > 0) {
        const key = `${r},${c}`;
        const waveIndex = anim.rippleCells.get(key);
        if (waveIndex !== undefined) {
          // Calculate per-cell progress based on wave index
          const waveDelay = waveIndex / (anim.rippleMaxWave + 1);
          const waveDuration = 1 / (anim.rippleMaxWave + 1);
          const cellProgress = Math.max(0, Math.min(1,
            (anim.rippleProgress - waveDelay) / Math.max(waveDuration, 0.15)
          ));

          if (cellProgress > 0) {
            colorIndex = anim.rippleNewColor;
            // Pop scale effect: scale up then back to 1
            const popPhase = cellProgress < 0.5
              ? cellProgress * 2
              : 2 - cellProgress * 2;
            scale = 1 + popPhase * 0.15;
          }
        }
      }

      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      const size = (cellSize - 2) * scale;

      // Cell body
      ctx.fillStyle = COLORS[colorIndex];
      ctx.fillRect(cx - size / 2, cy - size / 2, size, size);

      // Highlight (top-left)
      if (size > 8) {
        ctx.fillStyle = COLORS_LIGHT[colorIndex];
        ctx.globalAlpha = 0.3;
        ctx.fillRect(cx - size / 2, cy - size / 2, size, 2);
        ctx.fillRect(cx - size / 2, cy - size / 2, 2, size);
        ctx.globalAlpha = 1;
      }
    }
  }

  // Grid border
  const { gridW, gridH } = getGridLayout(rows, cols);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(gridX - 1, gridY - 1, gridW + 2, gridH + 2);
}

/**
 * Render the 6 color selection buttons.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./flood.js').FloodState} state
 * @param {Object} anim
 */
function renderButtons(ctx, state, anim) {
  const buttons = getButtonLayout();
  const currentColor = getCurrentColor(state);

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('PICK A COLOR', W / 2, H - BUTTON_AREA_HEIGHT - 2);

  for (const btn of buttons) {
    const isActive = btn.color === currentColor;
    const radius = 8;

    // Draw rounded rect button
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, radius);

    if (isActive) {
      // Active: dimmed with border
      ctx.fillStyle = COLORS_DARK[btn.color];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // X mark to indicate current color
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      const cx = btn.x + btn.w / 2;
      const cy = btn.y + btn.h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.moveTo(cx + 8, cy - 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.stroke();
    } else {
      ctx.fillStyle = COLORS[btn.color];
      ctx.fill();

      // Subtle highlight
      ctx.fillStyle = COLORS_LIGHT[btn.color];
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h / 2, [radius, radius, 0, 0]);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * Render a game-over state overlay on the canvas (dimmed board).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./flood.js').FloodState} state
 */
export function renderGameOver(ctx, state) {
  render(ctx, state, { rippleCells: null, rippleProgress: 0, rippleMaxWave: 0, rippleNewColor: 0 });

  // Dim overlay
  ctx.fillStyle = 'rgba(10, 14, 23, 0.6)';
  ctx.fillRect(0, 0, W, H);
}

export { COLORS, W, H };
