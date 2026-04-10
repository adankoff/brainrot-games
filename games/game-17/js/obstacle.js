/**
 * FLAPPY DOGE -- Obstacle Entity
 * Each instance is one obstacle pair (top + bottom) with a gap.
 * Visual types: 'bone' (doge), 'spacerock' (nyan), 'rageface' (troll).
 */

import { OBSTACLE_WIDTH, PASS_EFFECT_DURATIONS } from './constants.js';

export class Obstacle {
  /**
   * @param {number} x       - Initial x position (center of obstacle)
   * @param {number} gapY    - Center Y of the gap
   * @param {number} gapSize - Height of the gap in px
   * @param {string} type    - Visual type: 'bone'|'spacerock'|'rageface'
   */
  constructor(x, gapY, gapSize, type) {
    this.x = x;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.width = OBSTACLE_WIDTH;
    this.type = type;
    this.scored = false;
    this.passEffectTimer = 0;
  }

  /**
   * Move obstacle to the left.
   * @param {number} dt    - Normalized delta time
   * @param {number} speed - Current scroll speed (px/frame at 60fps)
   */
  update(dt, speed) {
    this.x -= speed * dt;
    if (this.passEffectTimer > 0) {
      this.passEffectTimer -= dt * 16.67;
    }
  }

  /**
   * Draw the obstacle pair on canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasHeight - Usable height (logical height minus floor, or full height)
   */
  draw(ctx, canvasHeight) {
    const left = this.x - this.width / 2;
    const topHeight = this.gapY - this.gapSize / 2;
    const bottomY = this.gapY + this.gapSize / 2;
    const bottomHeight = canvasHeight - bottomY;

    switch (this.type) {
      case 'bone':
        this._drawBone(ctx, left, topHeight, bottomY, bottomHeight);
        break;
      case 'spacerock':
        this._drawSpacerock(ctx, left, topHeight, bottomY, bottomHeight);
        break;
      case 'rageface':
        this._drawRageface(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
        break;
      default:
        this._drawDefault(ctx, left, topHeight, bottomY, bottomHeight);
        break;
    }

    // Pass effect
    if (this.passEffectTimer > 0) {
      this._drawPassEffect(ctx, canvasHeight);
    }
  }

  // ---- BONE (Doge theme): vertical bone shape ----

  _drawBone(ctx, left, topHeight, bottomY, bottomHeight) {
    const cx = left + this.width / 2;
    const boneW = this.width * 0.35;
    const knobR = this.width * 0.22;

    // --- TOP BONE (hanging from ceiling) ---
    // Shaft
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(cx - boneW / 2, 0, boneW, topHeight);

    // Shaft shading
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(cx - boneW / 2, 0, boneW * 0.3, topHeight);

    // Bottom knobs (near gap)
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, topHeight, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, topHeight, knobR, 0, Math.PI * 2);
    ctx.fill();

    // Top knobs (at ceiling)
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, 0, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, 0, knobR, 0, Math.PI * 2);
    ctx.fill();

    // Bone outline
    ctx.strokeStyle = '#d4c9a8';
    ctx.lineWidth = 1.5;
    // Top knobs outline
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, 0, knobR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, 0, knobR, 0, Math.PI * 2);
    ctx.stroke();
    // Bottom knobs outline
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, topHeight, knobR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, topHeight, knobR, 0, Math.PI * 2);
    ctx.stroke();

    // --- BOTTOM BONE (rising from floor) ---
    // Shaft
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(cx - boneW / 2, bottomY, boneW, bottomHeight);

    // Shaft shading
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(cx - boneW / 2, bottomY, boneW * 0.3, bottomHeight);

    // Top knobs (near gap)
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, bottomY, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, bottomY, knobR, 0, Math.PI * 2);
    ctx.fill();

    // Bottom knobs (at floor)
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, bottomY + bottomHeight, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, bottomY + bottomHeight, knobR, 0, Math.PI * 2);
    ctx.fill();

    // Bottom bone outline
    ctx.strokeStyle = '#d4c9a8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, bottomY, knobR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, bottomY, knobR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - boneW / 2, bottomY + bottomHeight, knobR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + boneW / 2, bottomY + bottomHeight, knobR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ---- SPACEROCK (Nyan theme): gray rocky columns ----

  _drawSpacerock(ctx, left, topHeight, bottomY, bottomHeight) {
    const cx = left + this.width / 2;

    // Top column of rocks
    this._drawRockColumn(ctx, cx, 0, topHeight, false);

    // Bottom column of rocks
    this._drawRockColumn(ctx, cx, bottomY, bottomHeight, true);
  }

  _drawRockColumn(ctx, cx, startY, height, fromBottom) {
    if (height <= 0) return;

    // Base fill
    ctx.fillStyle = '#555566';
    ctx.fillRect(cx - this.width / 2 + 5, startY, this.width - 10, height);

    // Stack of rocks
    const rockSpacing = 24;
    const numRocks = Math.max(1, Math.ceil(height / rockSpacing));
    for (let i = 0; i < numRocks; i++) {
      const ry = fromBottom
        ? startY + i * rockSpacing
        : startY + height - (i + 1) * rockSpacing;
      if (ry < startY - 10 || ry > startY + height + 10) continue;

      const rw = 16 + (i % 3) * 6;
      const rh = 14 + (i % 2) * 4;
      const rx = cx - rw / 2 + ((i % 3) - 1) * 4;

      // Rock body (gray oval)
      ctx.beginPath();
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#777788' : '#666677';
      ctx.fill();
      ctx.strokeStyle = '#444455';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crater detail
      ctx.beginPath();
      ctx.arc(rx + rw / 2 - 3, ry + rh / 2 - 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fill();
    }

    // Edge rocks for width
    const endY = fromBottom ? startY : startY + height;
    ctx.beginPath();
    ctx.ellipse(cx - 10, endY, 14, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#666677';
    ctx.fill();
    ctx.strokeStyle = '#444455';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx + 10, endY, 14, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#777788';
    ctx.fill();
    ctx.strokeStyle = '#444455';
    ctx.stroke();
  }

  // ---- RAGEFACE (Troll theme): red angry rectangles with >:( face ----

  _drawRageface(ctx, left, topHeight, bottomY, bottomHeight) {
    // Top column
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.strokeStyle = '#aa1111';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);

    // Rage face at bottom of top column (near gap)
    if (topHeight > 30) {
      this._drawAngryFace(ctx, left + this.width / 2, topHeight - 18, false);
    }

    // Bottom column
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(left, bottomY, this.width, bottomHeight);
    ctx.strokeStyle = '#aa1111';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Rage face at top of bottom column (near gap)
    if (bottomHeight > 30) {
      this._drawAngryFace(ctx, left + this.width / 2, bottomY + 18, true);
    }

    // Rage lines near gap edges
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    // Top
    for (let i = 0; i < 3; i++) {
      const lx = left + 8 + i * 18;
      ctx.beginPath();
      ctx.moveTo(lx, topHeight - 2);
      ctx.lineTo(lx + 6, topHeight + 4);
      ctx.stroke();
    }
    // Bottom
    for (let i = 0; i < 3; i++) {
      const lx = left + 8 + i * 18;
      ctx.beginPath();
      ctx.moveTo(lx, bottomY + 2);
      ctx.lineTo(lx + 6, bottomY - 4);
      ctx.stroke();
    }
  }

  _drawAngryFace(ctx, cx, cy, flipped) {
    const dir = flipped ? -1 : 1;

    // Face background
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5555';
    ctx.fill();
    ctx.strokeStyle = '#aa1111';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Angry eyebrows: >:(
    ctx.strokeStyle = '#440000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 5 * dir);
    ctx.lineTo(cx - 3, cy - 2 * dir);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 5 * dir);
    ctx.lineTo(cx + 3, cy - 2 * dir);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#440000';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 1 * dir, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 1 * dir, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Angry frown
    ctx.beginPath();
    ctx.arc(cx, cy + 4 * dir, 5, flipped ? 0 : Math.PI, flipped ? Math.PI : 0);
    ctx.strokeStyle = '#440000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  _drawDefault(ctx, left, topHeight, bottomY, bottomHeight) {
    ctx.fillStyle = '#444466';
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);
  }

  // ---- Pass-through effect ----

  _drawPassEffect(ctx, canvasHeight) {
    const duration = PASS_EFFECT_DURATIONS[this.type] || 300;
    const progress = 1 - (this.passEffectTimer / duration);
    const alpha = 1 - progress;

    switch (this.type) {
      case 'bone': {
        // Floating bone particles
        ctx.fillStyle = `rgba(245, 240, 224, ${alpha})`;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + progress * 2;
          const dist = progress * 25;
          const px = this.x + Math.cos(angle) * dist;
          const py = this.gapY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 3 + progress * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'spacerock': {
        // Star sparkle
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + progress * 4;
          const dist = 10 + progress * 15;
          const px = this.x + Math.cos(angle) * dist;
          const py = this.gapY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'rageface': {
        // "u mad?" text floats up
        const textY = this.gapY - progress * 35;
        ctx.font = 'bold 14px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.fillText('u mad?', this.x, textY);
        break;
      }
    }
  }

  /**
   * Returns AABB hitbox for the TOP obstacle.
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getTopHitbox() {
    return {
      x: this.x - this.width / 2,
      y: 0,
      width: this.width,
      height: this.gapY - this.gapSize / 2,
    };
  }

  /**
   * Returns AABB hitbox for the BOTTOM obstacle.
   * @param {number} canvasHeight
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getBottomHitbox(canvasHeight) {
    const topOfBottom = this.gapY + this.gapSize / 2;
    return {
      x: this.x - this.width / 2,
      y: topOfBottom,
      width: this.width,
      height: canvasHeight - topOfBottom,
    };
  }

  /**
   * Check if obstacle is fully off-screen left.
   * @returns {boolean}
   */
  isOffScreen() {
    return this.x + this.width / 2 < 0;
  }

  /**
   * Trigger the pass-through visual effect.
   */
  triggerPassEffect() {
    this.passEffectTimer = PASS_EFFECT_DURATIONS[this.type] || 300;
  }
}
