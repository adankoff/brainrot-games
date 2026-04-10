/**
 * HEX MATCH -- Renderer
 * All canvas drawing functions for the hex matching puzzle.
 */

import { NUM_EDGES, getEdgeColor, getEdgeMatchStates, getHexVertices } from './hexmatch.js';
import { loadThemeColors } from '../../shared/theme-utils.js';

/** Color palette — grayscale defaults, themed via CSS custom properties */
const COLORS = loadThemeColors({
  bgTop:     { css: '--game-bg-top',     fallback: '#0a0a0a' },
  bgMid:     { css: '--game-bg-mid',     fallback: '#0f0f0f' },
  bgBottom:  { css: '--game-bg-bottom',  fallback: '#0a0a0a' },
  progressA: { css: '--game-progress-a', fallback: '#aaaaaa' },
  progressB: { css: '--game-progress-b', fallback: '#888888' },
  winEffect: { css: '--game-win-effect', fallback: '#aaaaaa' },
  hudText:   { css: '--game-hud-text',   fallback: 'rgba(255, 255, 255, 0.5)' },
});

// ---- Background ----

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
export function drawBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COLORS.bgTop);
  grad.addColorStop(0.5, COLORS.bgMid);
  grad.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let x = 20; x < w; x += 40) {
    for (let y = 20; y < h; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---- Hex Tile ----

/**
 * Draw a single hex tile with colored edge segments.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./hexmatch.js').HexTile} tile
 * @param {number} hexSize
 * @param {import('./hexmatch.js').HexTile[]} allTiles
 * @param {boolean} solved
 * @param {number} pulsePhase
 */
export function drawHexTile(ctx, tile, hexSize, allTiles, solved, pulsePhase) {
  const { cx, cy, rotation } = tile;
  const matchStates = getEdgeMatchStates(tile, allTiles);
  const vertices = getHexVertices(cx, cy, hexSize, rotation);

  // Hex body fill
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(15, 22, 40, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw each edge as a triangular wedge from the edge to the center
  const innerScale = 0.3;

  for (let e = 0; e < NUM_EDGES; e++) {
    const v1 = vertices[e];
    const v2 = vertices[(e + 1) % 6];
    const color = getEdgeColor(tile.edges[e]);
    const isMatched = matchStates[e];

    // Midpoint of the edge
    const midX = (v1.x + v2.x) / 2;
    const midY = (v1.y + v2.y) / 2;

    // Inner point toward center
    const innerX = cx + (midX - cx) * innerScale;
    const innerY = cy + (midY - cy) * innerScale;

    // Draw triangular segment
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineTo(innerX, innerY);
    ctx.closePath();

    if (solved) {
      const pulse = 0.7 + 0.3 * Math.sin(pulsePhase + e * 0.5);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (isMatched) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Edge outline
    ctx.strokeStyle = isMatched && !solved
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = isMatched && !solved ? 1.5 : 0.5;
    ctx.stroke();
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
}

// ---- HUD ----

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} moves
 * @param {number} matched
 * @param {number} total
 * @param {number} level
 */
export function drawHUD(ctx, w, moves, matched, total, level) {
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.hudText;
  ctx.fillText(`LVL ${level}`, 15, 25);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudText;
  ctx.fillText(`MOVES: ${moves}`, w - 15, 25);

  // Progress bar
  const barW = w - 30;
  const barH = 4;
  const barX = 15;
  const barY = 38;
  const progress = total > 0 ? matched / total : 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(barX, barY, barW, barH);

  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
  barGrad.addColorStop(0, COLORS.progressA);
  barGrad.addColorStop(1, COLORS.progressB);
  ctx.fillStyle = barGrad;
  ctx.fillRect(barX, barY, barW * progress, barH);

  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(`${matched}/${total} edges matched`, w / 2, barY + 18);
}

// ---- Effects ----

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} alpha
 */
export function drawWinEffect(ctx, w, h, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha * 0.3;
  ctx.fillStyle = COLORS.winEffect;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @param {number} alpha
 */
export function drawFlash(ctx, w, h, color, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}
