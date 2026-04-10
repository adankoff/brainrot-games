/**
 * FLAPPY DOGE -- Player Entity
 * Gravity, velocity, position, rotation, flap animation, hitbox, draw delegation.
 */

import { CHARACTERS } from './characters.js';
import {
  GRAVITY, TAP_IMPULSE, TERMINAL_VELOCITY,
  PLAYER_X, PLAYER_HITBOX_WIDTH, PLAYER_HITBOX_HEIGHT,
  FLAP_DURATION, FLAP_FRAME_INTERVAL, DEATH_SPIN_VELOCITY,
} from './constants.js';

export class Player {
  constructor() {
    this.x = PLAYER_X;
    this.y = 320;
    this.width = PLAYER_HITBOX_WIDTH;
    this.height = PLAYER_HITBOX_HEIGHT;
    this.velocity = 0;
    this.rotation = 0;
    this.characterId = 'doge';
    this.animFrame = 0;
    this.animTimer = 0;
    this.flapTimer = 0;
    this.alive = true;
    this.deathVelocity = 0;
    // Floating "wow" particles on score
    this.wowParticles = [];
  }

  /**
   * Apply upward impulse. No-op if dead.
   */
  flap() {
    if (!this.alive) return;
    this.velocity = TAP_IMPULSE;
    this.flapTimer = FLAP_DURATION;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  /**
   * Spawn a floating "wow" text particle near the player.
   */
  spawnWow() {
    this.wowParticles.push({
      x: this.x + 20 + Math.random() * 10,
      y: this.y - 10 - Math.random() * 10,
      life: 800,
      maxLife: 800,
      vx: 0.5 + Math.random() * 0.5,
      vy: -0.5 - Math.random() * 0.3,
    });
  }

  /**
   * Per-frame physics and animation update.
   * @param {number} dt - Normalized delta time (1.0 = one frame at 60fps)
   */
  update(dt) {
    if (this.alive) {
      // Gravity
      this.velocity += GRAVITY * dt;
      this.velocity = Math.min(this.velocity, TERMINAL_VELOCITY);
      this.y += this.velocity * dt;

      // Rotation from velocity
      const deg = this.velocity * 3;
      const rad = deg * (Math.PI / 180);
      this.rotation = Math.max(-30 * Math.PI / 180, Math.min(90 * Math.PI / 180, rad));

      // Flap animation
      if (this.flapTimer > 0) {
        this.flapTimer -= dt * 16.67;
        this.animTimer += dt * 16.67;
        if (this.animTimer >= FLAP_FRAME_INTERVAL) {
          this.animFrame = (this.animFrame + 1) % 3;
          this.animTimer = 0;
        }
      } else {
        this.animFrame = 0;
      }
    } else {
      // Death ragdoll
      this.velocity += GRAVITY * dt;
      this.y += this.velocity * dt;
      this.rotation += this.deathVelocity * dt;
      this.rotation = Math.min(this.rotation, 90 * Math.PI / 180);
    }

    // Update wow particles
    for (const p of this.wowParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 16.67;
    }
    this.wowParticles = this.wowParticles.filter(p => p.life > 0);
  }

  /**
   * Draw the player character on canvas.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const charDef = CHARACTERS[this.characterId];
    if (!charDef) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    charDef.draw(ctx, this.animFrame, this.flapTimer > 0);
    ctx.restore();

    // Draw wow particles
    for (const p of this.wowParticles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 12px "Comic Sans MS", "Bungee", sans-serif';
      ctx.fillStyle = '#c4a265';
      ctx.textAlign = 'center';
      ctx.fillText('wow', p.x, p.y);
      ctx.restore();
    }
  }

  /**
   * Reset all state for a new run.
   * @param {number} logicalHeight
   */
  reset(logicalHeight) {
    this.x = PLAYER_X;
    this.y = logicalHeight / 2;
    this.velocity = 0;
    this.rotation = 0;
    this.alive = true;
    this.flapTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.deathVelocity = 0;
    this.wowParticles = [];
  }

  /**
   * Returns the AABB hitbox for collision detection.
   * Centered on player position.
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Trigger death state.
   */
  die() {
    this.alive = false;
    this.deathVelocity = DEATH_SPIN_VELOCITY;
  }
}
