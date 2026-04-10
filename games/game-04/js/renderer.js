/**
 * OHIO SURVIVAL RUN -- Renderer
 * Background parallax rendering, ground, and particle effects.
 */

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 600;
const GROUND_Y = 480;
const GROUND_H = 120;

// ---- Parallax Background ----

export class BackgroundRenderer {
  constructor() {
    this.offset = 0;
  }

  reset() {
    this.offset = 0;
  }

  update(dt, speed) {
    this.offset += speed * dt;
  }

  draw(ctx, theme) {
    // Layer 1: Far sky (0.1x scroll)
    theme.drawBackgroundFar(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, this.offset * 0.1);

    // Layer 2: Mid buildings/scenery (0.3x scroll)
    theme.drawBackgroundMid(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, this.offset * 0.3);
  }

  drawGround(ctx, theme) {
    // Layer 3: Near ground (1.0x scroll)
    theme.drawGround(ctx, LOGICAL_WIDTH, GROUND_Y, GROUND_H, this.offset);
  }
}

// ---- Particle System ----

/**
 * @typedef {Object} Particle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life - Remaining lifetime (0-1)
 * @property {number} maxLife
 * @property {string} color
 * @property {number} size
 * @property {'dust'|'sparkle'} type
 */

export class ParticleSystem {
  constructor() {
    /** @type {Particle[]} */
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  /**
   * Emit dust particles (on landing).
   * @param {number} x
   * @param {number} y
   */
  emitDust(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2 + 0.5),
        life: 1,
        maxLife: 1,
        color: 'rgba(150, 130, 100, ',
        size: 2 + Math.random() * 2,
        type: 'dust',
      });
    }
  }

  /**
   * Emit sparkle particles (on coin collect).
   * @param {number} x
   * @param {number} y
   * @param {string} color - Base color for sparkles
   */
  emitSparkle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 2,
        type: 'sparkle',
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= 0.03 * dt;

      if (p.type === 'dust') {
        p.vy -= 0.05 * dt; // Float upward
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        // Star shape
        ctx.beginPath();
        const s = p.size * p.life;
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust - uses rgba color pattern
        ctx.fillStyle = p.color + (p.life * 0.7).toFixed(2) + ')';
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }
}
