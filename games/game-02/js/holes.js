/**
 * WHACK-A-ROT -- Hole
 * 3x3 grid of holes. Each hole is a state machine managing character lifecycle.
 */

import {
  HOLE_POSITIONS, HOLE_RADIUS_X, HOLE_RADIUS_Y,
  RISE_DURATION, SINK_DURATION, HIT_ANIM_DURATION,
} from './constants.js';
import { lerp } from '../../shared/utils.js';
import { getCurrentSkin } from '../../shared/skin-switcher.js';

export class Hole {
  /**
   * @param {number} id - Index 0-8
   */
  constructor(id) {
    this.id = id;
    this.x = HOLE_POSITIONS[id].x;
    this.y = HOLE_POSITIONS[id].y;
    this.state = 'empty';
    this.stateTimer = 0;
    this.character = null;
    this.displayTime = 0;
    this.hitScale = 1.0;
    this.hitFlashAlpha = 0;
  }

  /**
   * Spawn a character in this hole.
   * @param {Object} characterType
   * @param {number} displayTime - ms this character stays visible
   */
  spawn(characterType, displayTime) {
    if (this.state !== 'empty') return;
    this.character = characterType;
    this.displayTime = displayTime;
    this.state = 'rising';
    this.stateTimer = 0;
    this.hitScale = 1.0;
    this.hitFlashAlpha = 0;
  }

  /**
   * Per-frame update.
   * @param {number} dt - Normalized delta time (1.0 = 16.67ms)
   * @returns {{ event: string, characterType: Object }|null}
   */
  update(dt) {
    const ms = dt * 16.67;

    switch (this.state) {
      case 'rising':
        this.stateTimer += ms;
        if (this.stateTimer >= RISE_DURATION) {
          this.state = 'visible';
          this.stateTimer = 0;
        }
        return null;

      case 'visible':
        this.stateTimer += ms;
        if (this.stateTimer >= this.displayTime) {
          // Character was missed
          this.state = 'sinking';
          const char = this.character;
          this.stateTimer = 0;
          return { event: 'miss', characterType: char };
        }
        return null;

      case 'sinking':
        this.stateTimer += ms;
        if (this.stateTimer >= SINK_DURATION) {
          this.state = 'empty';
          this.character = null;
          this.stateTimer = 0;
        }
        return null;

      case 'hit':
        this.stateTimer += ms;
        const t = Math.min(this.stateTimer / HIT_ANIM_DURATION, 1.0);
        this.hitScale = lerp(1.3, 1.0, t);
        this.hitFlashAlpha = lerp(0.6, 0, t);
        if (this.stateTimer >= HIT_ANIM_DURATION) {
          this.state = 'sinking';
          this.stateTimer = 0;
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Register a hit on this hole.
   * @returns {{ characterType: Object, points: number }|null}
   */
  hit() {
    if (this.state !== 'rising' && this.state !== 'visible') return null;
    const result = { characterType: this.character, points: this.character.basePoints };
    this.state = 'hit';
    this.stateTimer = 0;
    this.hitScale = 1.3;
    this.hitFlashAlpha = 0.6;
    return result;
  }

  /**
   * Test if tap hits this hole's character.
   * @param {number} tapX
   * @param {number} tapY
   * @param {number} time - Game time in ms (for sway)
   * @returns {boolean}
   */
  isHit(tapX, tapY, time) {
    if (this.state !== 'rising' && this.state !== 'visible') return false;
    if (!this.character) return false;

    const center = this.character.getHitboxCenter(this.x, this.y, time);
    const r = this.character.hitboxRadius;
    const dx = tapX - center.x;
    const dy = tapY - center.y;
    return (dx * dx + dy * dy) <= (r * r);
  }

  /**
   * Draw the hole and any character in it.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time - Game time in ms
   */
  draw(ctx, time) {
    const { x, y } = this;

    // 1. Shadow/depth
    ctx.beginPath();
    ctx.ellipse(x, y + 4, HOLE_RADIUS_X + 2, HOLE_RADIUS_Y + 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // 2. Character (clipped) if present
    if (this.state !== 'empty' && this.character) {
      let clipHeight;
      switch (this.state) {
        case 'rising':
          clipHeight = (this.stateTimer / RISE_DURATION) * 80;
          break;
        case 'visible':
          clipHeight = 80;
          break;
        case 'hit':
          clipHeight = 80;
          break;
        case 'sinking':
          clipHeight = (1 - this.stateTimer / SINK_DURATION) * 80;
          break;
        default:
          clipHeight = 0;
      }

      ctx.save();
      // Clip region: rectangle above hole
      ctx.beginPath();
      ctx.rect(x - 45, y - clipHeight, 90, clipHeight + HOLE_RADIUS_Y);
      ctx.clip();

      // Hit animation scale
      if (this.state === 'hit') {
        ctx.translate(x, y - 40);
        ctx.scale(this.hitScale, this.hitScale);
        ctx.translate(-x, -(y - 40));
      }

      // Draw character centered at (x, y - 40)
      const skin = getCurrentSkin();
      const charY = y - 40;
      if (skin) {
        // Map character types to skin roles
        const charId = this.character.id;
        const roleMap = { tralalero: 'protagonist', bombardiro: 'antagonist' };
        const role = roleMap[charId] || `supporting-${String(Object.keys(roleMap).length + 1).padStart(2, '0')}`;
        if (!skin.drawCentered(ctx, role, x, charY, 70, 70)) {
          this.character.draw(ctx, x, charY, time);
        }
      } else {
        this.character.draw(ctx, x, charY, time);
      }

      // Hit flash overlay
      if (this.hitFlashAlpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this.hitFlashAlpha})`;
        ctx.fillRect(x - 45, y - 80, 90, 100);
      }

      ctx.restore();
    }

    // 3. Hole opening (covers character lower body)
    ctx.beginPath();
    ctx.ellipse(x, y, HOLE_RADIUS_X, HOLE_RADIUS_Y, 0, 0, Math.PI * 2);
    const holeGrad = ctx.createRadialGradient(x, y, 0, x, y, HOLE_RADIUS_X);
    holeGrad.addColorStop(0, '#0a0a0f');
    holeGrad.addColorStop(1, '#16161f');
    ctx.fillStyle = holeGrad;
    ctx.fill();

    // 4. Rim highlight
    ctx.beginPath();
    ctx.ellipse(x, y, HOLE_RADIUS_X, HOLE_RADIUS_Y, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#2a2a3f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Swirl detail arcs (subtle, animated)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#1a1a2f';
    ctx.lineWidth = 1;
    const swirlAngle = time * 0.0005;
    ctx.beginPath();
    ctx.arc(x, y, HOLE_RADIUS_X * 0.6, swirlAngle, swirlAngle + 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, HOLE_RADIUS_X * 0.4, swirlAngle + Math.PI, swirlAngle + Math.PI + 1.2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Reset hole to empty.
   */
  reset() {
    this.state = 'empty';
    this.stateTimer = 0;
    this.character = null;
    this.displayTime = 0;
    this.hitScale = 1.0;
    this.hitFlashAlpha = 0;
  }

  /**
   * Check if hole is available for spawning.
   * @returns {boolean}
   */
  isAvailable() {
    return this.state === 'empty';
  }
}
