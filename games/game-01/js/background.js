/**
 * FLAPPY TRALALERO -- Background Renderer
 * 3-layer parallax background with biome tinting.
 */

import {
  BIOMES, COLOR_SKY, COLOR_FLOOR, COLOR_FLOOR_LINE, COLOR_FLOOR_EDGE,
  COLOR_WINDOW_DOTS, COLOR_FAR_FALLBACK, COLOR_MID_FALLBACK, FLOOR_HEIGHT,
} from './constants.js';
import { lerp } from '../../shared/utils.js';

const FAR_SPEED_RATIO = 0.15;
const MID_SPEED_RATIO = 0.4;
const NEAR_SPEED_RATIO = 1.0;
const BIOME_TRANSITION_MS = 2000;

export class Background {
  constructor() {
    this.farOffset = 0;
    this.midOffset = 0;
    this.floorOffset = 0;
    this.currentBiome = 0;
    this.biomeTransitionTimer = 0;
    this.previousFar = BIOMES[0].far;
    this.previousMid = BIOMES[0].mid;
    this.currentFar = BIOMES[0].far;
    this.currentMid = BIOMES[0].mid;

    // Pre-generate skyline heights (deterministic)
    this._farBuildings = [];
    this._midHills = [];
    this._generateSkyline();
  }

  _generateSkyline() {
    // Far layer: city skyline rectangles
    const tileW = 720; // double canvas width for seamless wrap
    for (let x = 0; x < tileW; x += 20 + Math.random() * 20) {
      const w = 12 + Math.random() * 20;
      const h = 40 + Math.random() * 120;
      const hasDome = Math.random() > 0.7;
      this._farBuildings.push({ x, w, h, hasDome });
    }

    // Mid layer: hills as points for wavy line
    for (let x = 0; x < tileW; x += 30) {
      const h = 30 + Math.random() * 50;
      this._midHills.push({ x, h });
    }
  }

  /**
   * Scroll all layers and handle biome transitions.
   * @param {number} dt    - Normalized delta time
   * @param {number} speed - Current obstacle scroll speed
   * @param {number} score - Current score
   */
  update(dt, speed, score) {
    const tileW = 720;

    this.farOffset -= speed * FAR_SPEED_RATIO * dt;
    if (this.farOffset <= -tileW) this.farOffset += tileW;

    this.midOffset -= speed * MID_SPEED_RATIO * dt;
    if (this.midOffset <= -tileW) this.midOffset += tileW;

    this.floorOffset -= speed * NEAR_SPEED_RATIO * dt;
    if (this.floorOffset <= -tileW) this.floorOffset += tileW;

    // Biome selection
    let targetBiome;
    if (score < 25) targetBiome = 0;
    else if (score < 50) targetBiome = 1;
    else if (score < 75) targetBiome = 2;
    else if (score < 100) targetBiome = 3;
    else targetBiome = 4;

    if (targetBiome !== this.currentBiome) {
      this.previousFar = this.currentFar;
      this.previousMid = this.currentMid;
      this.currentBiome = targetBiome;
      this.biomeTransitionTimer = BIOME_TRANSITION_MS;

      if (BIOMES[targetBiome].far !== null) {
        this.currentFar = BIOMES[targetBiome].far;
        this.currentMid = BIOMES[targetBiome].mid;
      }
    }

    // Meme Void cycling
    if (this.currentBiome === 4) {
      const cycleIndex = Math.floor(performance.now() / 167) % 4;
      this.currentFar = BIOMES[cycleIndex].far;
      this.currentMid = BIOMES[cycleIndex].mid;
    }

    // Transition
    if (this.biomeTransitionTimer > 0) {
      this.biomeTransitionTimer -= dt * 16.67;
      if (this.biomeTransitionTimer < 0) this.biomeTransitionTimer = 0;
    }
  }

  /**
   * Draw all three layers.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} logicalWidth
   * @param {number} logicalHeight
   */
  draw(ctx, logicalWidth, logicalHeight) {
    const floorY = logicalHeight - FLOOR_HEIGHT;

    // 1. Sky
    ctx.fillStyle = COLOR_SKY;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // Resolve biome colors (with transition lerp)
    let farColor = this.currentFar;
    let midColor = this.currentMid;

    if (this.biomeTransitionTimer > 0 && this.previousFar && this.currentFar) {
      const t = 1 - (this.biomeTransitionTimer / BIOME_TRANSITION_MS);
      farColor = lerpHexColor(this.previousFar, this.currentFar, t);
      midColor = lerpHexColor(this.previousMid, this.currentMid, t);
    }

    // 2. Far layer: city skyline
    ctx.save();
    ctx.translate(this.farOffset, 0);
    this._drawFarLayer(ctx, logicalWidth, floorY, farColor);
    ctx.restore();

    // 3. Mid layer: hills and silhouettes
    ctx.save();
    ctx.translate(this.midOffset, 0);
    this._drawMidLayer(ctx, logicalWidth, floorY, midColor);
    ctx.restore();

    // 4. Floor
    this._drawFloor(ctx, logicalWidth, logicalHeight, floorY);
  }

  _drawFarLayer(ctx, logicalWidth, floorY, color) {
    ctx.fillStyle = color || COLOR_FAR_FALLBACK;

    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const b of this._farBuildings) {
        const bx = b.x + offsetX;
        const by = floorY - b.h;
        ctx.fillRect(bx, by, b.w, b.h);

        if (b.hasDome) {
          ctx.beginPath();
          ctx.arc(bx + b.w / 2, by, b.w / 2, Math.PI, 0);
          ctx.fill();
        }

        // Occasional window dots
        ctx.fillStyle = COLOR_WINDOW_DOTS;
        for (let wy = by + 10; wy < floorY - 10; wy += 20) {
          for (let wx = bx + 4; wx < bx + b.w - 4; wx += 8) {
            ctx.fillRect(wx, wy, 3, 3);
          }
        }
        ctx.fillStyle = color || COLOR_FAR_FALLBACK;
      }
    }
  }

  _drawMidLayer(ctx, logicalWidth, floorY, color) {
    ctx.fillStyle = color || COLOR_MID_FALLBACK;

    // Wavy hills
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      ctx.beginPath();
      ctx.moveTo(offsetX, floorY);

      for (const hill of this._midHills) {
        ctx.lineTo(hill.x + offsetX, floorY - hill.h);
      }

      ctx.lineTo(720 + offsetX, floorY);
      ctx.closePath();
      ctx.fill();
    }

    // Occasional character silhouettes on mid layer
    ctx.fillStyle = this._darken(color || COLOR_MID_FALLBACK, 0.7);
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      // A few standing silhouettes
      for (let i = 0; i < 4; i++) {
        const sx = 80 + i * 180 + offsetX;
        const hillIdx = Math.min(this._midHills.length - 1, Math.floor(sx / 30));
        const hillH = this._midHills[hillIdx]?.h || 30;
        const sy = floorY - hillH;
        // Simple character silhouette (small rect + circle head)
        ctx.fillRect(sx - 3, sy - 12, 6, 12);
        ctx.beginPath();
        ctx.arc(sx, sy - 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _drawFloor(ctx, logicalWidth, logicalHeight, floorY) {
    // Floor fill
    ctx.fillStyle = COLOR_FLOOR;
    ctx.fillRect(0, floorY, logicalWidth, FLOOR_HEIGHT);

    // Dashed line pattern for motion illusion
    ctx.strokeStyle = COLOR_FLOOR_LINE;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);

    const dashY = floorY + 4;
    ctx.beginPath();
    ctx.moveTo(this.floorOffset % 20 - 20, dashY);
    ctx.lineTo(logicalWidth + 20, dashY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Floor top edge line
    ctx.strokeStyle = COLOR_FLOOR_EDGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(logicalWidth, floorY);
    ctx.stroke();
  }

  _darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const dr = Math.round(r * factor);
    const dg = Math.round(g * factor);
    const db = Math.round(b * factor);
    return `rgb(${dr},${dg},${db})`;
  }

  /**
   * Reset scroll offsets for a new run.
   */
  reset() {
    this.farOffset = 0;
    this.midOffset = 0;
    this.floorOffset = 0;
  }
}

// ---- Hex color lerp helper ----

function lerpHexColor(hex1, hex2, t) {
  if (!hex1 || !hex2) return hex1 || hex2 || COLOR_FAR_FALLBACK;
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
}
