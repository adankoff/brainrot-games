/**
 * FLAPPY TRALALERO -- Obstacle Entity
 * Each instance is one obstacle pair (top + bottom) with a gap.
 */

import { OBSTACLE_WIDTH, PASS_EFFECT_DURATIONS } from './constants.js';
import { readThemeColor } from '../../shared/theme-utils.js';

// ---- Obstacle color palettes (CSS-themed, grayscale fallbacks) ----

const OBS_BOMB = {
  fill:   readThemeColor('--game-obs-bomb-fill',   '#555555'),
  stroke: readThemeColor('--game-obs-bomb-stroke',  '#404040'),
  teeth:  readThemeColor('--game-obs-bomb-teeth',   '#ffffff'),
};

const OBS_MEW = {
  fill:    readThemeColor('--game-obs-mew-fill',    '#888888'),
  stroke:  readThemeColor('--game-obs-mew-stroke',  '#6e6e6e'),
  contour: readThemeColor('--game-obs-mew-contour', '#555555'),
  shadow:  readThemeColor('--game-obs-mew-shadow',  'rgba(100, 100, 100, 0.4)'),
};

const OBS_SKIB = {
  fill:   readThemeColor('--game-obs-skib-fill',   '#d0d0d0'),
  stroke: readThemeColor('--game-obs-skib-stroke', '#b0b0b0'),
  tank:   readThemeColor('--game-obs-skib-tank',   '#999999'),
  bowl:   readThemeColor('--game-obs-skib-bowl',   '#c0c0c0'),
  lid:    readThemeColor('--game-obs-skib-lid',    '#888888'),
};

const OBS_OHIO = {
  fill:   readThemeColor('--game-obs-ohio-fill',   '#1a1a1a'),
  stroke: readThemeColor('--game-obs-ohio-stroke', '#2a2a2a'),
  ring:   readThemeColor('--game-obs-ohio-ring',   '180, 180, 180'),
};

const OBS_FAN = {
  fill:   readThemeColor('--game-obs-fan-fill',   '#888888'),
  stroke: readThemeColor('--game-obs-fan-stroke', '#707070'),
  finger: readThemeColor('--game-obs-fan-finger', '#777777'),
  nail:   readThemeColor('--game-obs-fan-nail',   '#aaaaaa'),
};

const OBS_DEFAULT = readThemeColor('--game-obs-default', '#444444');

// ---- Pass effect RGB triplets ----

const FX_BOMB  = readThemeColor('--game-fx-bomb',  '255, 200, 180');
const FX_MEW   = readThemeColor('--game-fx-mew',   '180, 180, 180');
const FX_SKIB  = readThemeColor('--game-fx-skib',  '255, 255, 255');
const FX_OHIO  = readThemeColor('--game-fx-ohio',  '180, 180, 180');
const FX_FANUM = readThemeColor('--game-fx-fanum', '220, 220, 220');

export class Obstacle {
  /**
   * @param {number} x       - Initial x position (center of obstacle)
   * @param {number} gapY    - Center Y of the gap
   * @param {number} gapSize - Height of the gap in px
   * @param {string} type    - Visual type: 'bombardiro'|'mewing'|'skibidi'|'ohio'|'fanum'
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
   * @param {number} canvasHeight - Logical canvas height (640)
   */
  draw(ctx, canvasHeight) {
    const left = this.x - this.width / 2;
    const topHeight = this.gapY - this.gapSize / 2;
    const bottomY = this.gapY + this.gapSize / 2;
    const bottomHeight = canvasHeight - bottomY;

    switch (this.type) {
      case 'bombardiro':
        this._drawBombardiro(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
        break;
      case 'mewing':
        this._drawMewing(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
        break;
      case 'skibidi':
        this._drawSkibidi(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
        break;
      case 'ohio':
        this._drawOhio(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
        break;
      case 'fanum':
        this._drawFanum(ctx, left, topHeight, bottomY, bottomHeight, canvasHeight);
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

  // ---- Type-specific draw methods ----

  _drawBombardiro(ctx, left, topHeight, bottomY, bottomHeight) {
    // Green jaws
    ctx.fillStyle = OBS_BOMB.fill;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);

    // Darker border
    ctx.strokeStyle = OBS_BOMB.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Teeth on top (pointing down)
    ctx._teethCount = this._teethCount || 5;
    ctx.fillStyle = OBS_BOMB.teeth;
    const toothW = this.width / 5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(left + i * toothW, topHeight);
      ctx.lineTo(left + i * toothW + toothW / 2, topHeight + 10);
      ctx.lineTo(left + (i + 1) * toothW, topHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Teeth on bottom (pointing up)
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(left + i * toothW, bottomY);
      ctx.lineTo(left + i * toothW + toothW / 2, bottomY - 10);
      ctx.lineTo(left + (i + 1) * toothW, bottomY);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawMewing(ctx, left, topHeight, bottomY, bottomHeight) {
    // Flesh-colored jawlines
    ctx.fillStyle = OBS_MEW.fill;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);

    ctx.strokeStyle = OBS_MEW.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Angular jaw contour on top (pointing down)
    ctx.strokeStyle = OBS_MEW.contour;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left, topHeight - 4);
    ctx.lineTo(left + this.width * 0.3, topHeight);
    ctx.lineTo(left + this.width * 0.5, topHeight + 8);
    ctx.lineTo(left + this.width * 0.7, topHeight);
    ctx.lineTo(left + this.width, topHeight - 4);
    ctx.stroke();

    // Angular jaw contour on bottom (pointing up)
    ctx.beginPath();
    ctx.moveTo(left, bottomY + 4);
    ctx.lineTo(left + this.width * 0.3, bottomY);
    ctx.lineTo(left + this.width * 0.5, bottomY - 8);
    ctx.lineTo(left + this.width * 0.7, bottomY);
    ctx.lineTo(left + this.width, bottomY + 4);
    ctx.stroke();

    // Jawline shadow lines
    ctx.strokeStyle = OBS_MEW.shadow;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const offset = i * 6;
      ctx.beginPath();
      ctx.moveTo(left + 4, topHeight - offset);
      ctx.lineTo(left + this.width - 4, topHeight - offset);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left + 4, bottomY + offset);
      ctx.lineTo(left + this.width - 4, bottomY + offset);
      ctx.stroke();
    }
  }

  _drawSkibidi(ctx, left, topHeight, bottomY, bottomHeight) {
    // White rects
    ctx.fillStyle = OBS_SKIB.fill;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);

    ctx.strokeStyle = OBS_SKIB.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Toilet shapes on top (stacked, facing down)
    const toiletH = 30;
    const toiletsTop = Math.floor(topHeight / toiletH);
    for (let i = 0; i < toiletsTop; i++) {
      const ty = i * toiletH;
      // Tank
      ctx.fillStyle = OBS_SKIB.tank;
      ctx.fillRect(left + 10, ty, this.width - 20, 10);
      // Bowl
      ctx.fillStyle = OBS_SKIB.bowl;
      ctx.fillRect(left + 8, ty + 10, this.width - 16, 16);
      // Lid
      ctx.beginPath();
      ctx.arc(left + this.width / 2, ty + 26, 10, 0, Math.PI);
      ctx.fillStyle = OBS_SKIB.lid;
      ctx.fill();
    }

    // Toilet shapes on bottom (inverted, facing up)
    const toiletsBottom = Math.floor(bottomHeight / toiletH);
    for (let i = 0; i < toiletsBottom; i++) {
      const ty = bottomY + i * toiletH;
      // Lid (inverted, pointing up)
      ctx.beginPath();
      ctx.arc(left + this.width / 2, ty + 4, 10, Math.PI, Math.PI * 2);
      ctx.fillStyle = OBS_SKIB.lid;
      ctx.fill();
      // Bowl
      ctx.fillStyle = OBS_SKIB.bowl;
      ctx.fillRect(left + 8, ty + 4, this.width - 16, 16);
      // Tank
      ctx.fillStyle = OBS_SKIB.tank;
      ctx.fillRect(left + 10, ty + 20, this.width - 20, 10);
    }
  }

  _drawOhio(ctx, left, topHeight, bottomY, bottomHeight) {
    // Dark purple portal
    ctx.fillStyle = OBS_OHIO.fill;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);

    ctx.strokeStyle = OBS_OHIO.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Concentric ellipses (top)
    const cx = left + this.width / 2;
    const phase = performance.now() / 1000;
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.ellipse(cx, topHeight / 2, 12 + i * 4, 8 + i * 3, phase * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${OBS_OHIO.ring}, ${0.15 * i})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Concentric ellipses (bottom)
    const bottomCy = bottomY + bottomHeight / 2;
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.ellipse(cx, bottomCy, 12 + i * 4, 8 + i * 3, -phase * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${OBS_OHIO.ring}, ${0.15 * i})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  _drawFanum(ctx, left, topHeight, bottomY, bottomHeight) {
    // Flesh-colored hands
    ctx.fillStyle = OBS_FAN.fill;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);

    ctx.strokeStyle = OBS_FAN.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(left, 0, this.width, topHeight);
    ctx.strokeRect(left, bottomY, this.width, bottomHeight);

    // Fingers on top (pointing down)
    const fingerW = 8;
    const fingerH = 20;
    const startX = left + (this.width - fingerW * 5) / 2;
    ctx.fillStyle = OBS_FAN.finger;
    for (let i = 0; i < 5; i++) {
      const fx = startX + i * (fingerW + 2);
      const spread = (i - 2) * 2;
      ctx.beginPath();
      ctx.roundRect(fx + spread, topHeight - 2, fingerW, fingerH, 4);
      ctx.fill();
      // Fingernail
      ctx.fillStyle = OBS_FAN.nail;
      ctx.fillRect(fx + spread + 1, topHeight + fingerH - 6, fingerW - 2, 4);
      ctx.fillStyle = OBS_FAN.finger;
    }

    // Fingers on bottom (pointing up)
    for (let i = 0; i < 5; i++) {
      const fx = startX + i * (fingerW + 2);
      const spread = (i - 2) * 2;
      ctx.beginPath();
      ctx.roundRect(fx + spread, bottomY - fingerH + 2, fingerW, fingerH, 4);
      ctx.fill();
      ctx.fillStyle = OBS_FAN.nail;
      ctx.fillRect(fx + spread + 1, bottomY - fingerH + 2, fingerW - 2, 4);
      ctx.fillStyle = OBS_FAN.finger;
    }
  }

  _drawDefault(ctx, left, topHeight, bottomY, bottomHeight) {
    ctx.fillStyle = OBS_DEFAULT;
    ctx.fillRect(left, 0, this.width, topHeight);
    ctx.fillRect(left, bottomY, this.width, bottomHeight);
  }

  // ---- Pass-through effect ----

  _drawPassEffect(ctx, canvasHeight) {
    const progress = 1 - (this.passEffectTimer / (PASS_EFFECT_DURATIONS[this.type] || 300));
    const alpha = 1 - progress;

    switch (this.type) {
      case 'bombardiro': {
        // Orange explosion particles
        ctx.fillStyle = `rgba(${FX_BOMB}, ${alpha})`;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + progress * 2;
          const dist = progress * 30;
          const px = this.x + Math.cos(angle) * dist;
          const py = this.gapY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 4 + progress * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'mewing': {
        // Purple glow outline
        ctx.strokeStyle = `rgba(${FX_MEW}, ${alpha})`;
        ctx.lineWidth = 3;
        const left = this.x - this.width / 2;
        const topH = this.gapY - this.gapSize / 2;
        const bottomY = this.gapY + this.gapSize / 2;
        ctx.strokeRect(left - 2, topH - 2, this.width + 4, 4);
        ctx.strokeRect(left - 2, bottomY - 2, this.width + 4, 4);
        break;
      }
      case 'skibidi': {
        // Swirl particles
        ctx.fillStyle = `rgba(${FX_SKIB}, ${alpha})`;
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 + progress * 6;
          const dist = 15;
          const px = this.x + Math.cos(angle) * dist;
          const py = this.gapY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'ohio': {
        // Purple tint flash over entire screen
        ctx.fillStyle = `rgba(${FX_OHIO}, ${alpha * 0.15})`;
        ctx.fillRect(0, 0, 360, canvasHeight);
        break;
      }
      case 'fanum': {
        // "Taxed!" text floats up
        const textY = this.gapY - progress * 40;
        ctx.font = 'bold 16px "Bungee", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${FX_FANUM}, ${alpha})`;
        ctx.fillText('Taxed!', this.x, textY);
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
