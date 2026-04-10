/**
 * OHIO SURVIVAL RUN -- Game Entities
 * Player, Obstacle, and Coin classes.
 */

import { getCurrentSkin } from '../../shared/skin-switcher.js';

// ---- Constants ----

const GRAVITY = 0.6;
const JUMP_IMPULSE = -12;
const DOUBLE_JUMP_IMPULSE = -10;
const MAX_JUMPS = 2;
const GROUND_Y = 480;
const PLAYER_X = 80;
const PLAYER_W = 30;
const PLAYER_H = 40;

// ---- Player ----

export class Player {
  constructor() {
    this.x = PLAYER_X;
    this.y = GROUND_Y - PLAYER_H;
    this.w = PLAYER_W;
    this.h = PLAYER_H;
    this.vy = 0;
    this.jumpsLeft = MAX_JUMPS;
    this.onGround = true;
    this.alive = true;
    this.frame = 0;
  }

  reset() {
    this.x = PLAYER_X;
    this.y = GROUND_Y - PLAYER_H;
    this.vy = 0;
    this.jumpsLeft = MAX_JUMPS;
    this.onGround = true;
    this.alive = true;
    this.frame = 0;
  }

  jump() {
    if (!this.alive) return false;

    if (this.jumpsLeft > 0) {
      const impulse = this.onGround ? JUMP_IMPULSE : DOUBLE_JUMP_IMPULSE;
      this.vy = impulse;
      this.jumpsLeft--;
      this.onGround = false;
      return true;
    }
    return false;
  }

  update(dt) {
    if (!this.alive) return;

    this.frame += dt;

    // Gravity
    this.vy += GRAVITY * dt;

    // Apply velocity
    this.y += this.vy * dt;

    // Ground collision
    if (this.y + this.h >= GROUND_Y) {
      this.y = GROUND_Y - this.h;
      this.vy = 0;
      this.jumpsLeft = MAX_JUMPS;
      this.onGround = true;
    }

    // Ceiling clamp
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
    }
  }

  getHitbox() {
    // Slightly smaller than visual for fairness
    return {
      x: this.x + 3,
      y: this.y + 3,
      width: this.w - 6,
      height: this.h - 6,
    };
  }

  getCenterX() {
    return this.x + this.w / 2;
  }

  getCenterY() {
    return this.y + this.h / 2;
  }

  draw(ctx, theme) {
    const skin = getCurrentSkin();
    if (skin && skin.drawAt(ctx, 'protagonist', this.x, this.y, this.w, this.h)) {
      return;
    }
    theme.drawPlayer(ctx, this.x, this.y, this.w, this.h, this.frame);
  }
}

// ---- Obstacle ----

/**
 * @typedef {'ground'|'flying'|'tall'} ObstacleType
 */

const OBSTACLE_DEFS = {
  ground: { minW: 30, maxW: 45, minH: 30, maxH: 60 },
  flying: { w: 30, h: 30 },
  tall:   { minW: 35, maxW: 50, minH: 80, maxH: 130 },
};

export class Obstacle {
  /**
   * @param {number} x - Initial X position (right edge of screen)
   * @param {ObstacleType} type
   */
  constructor(x, type) {
    this.type = type;
    this.x = x;
    this.frame = 0;

    if (type === 'ground') {
      this.w = OBSTACLE_DEFS.ground.minW + Math.random() * (OBSTACLE_DEFS.ground.maxW - OBSTACLE_DEFS.ground.minW);
      this.h = OBSTACLE_DEFS.ground.minH + Math.random() * (OBSTACLE_DEFS.ground.maxH - OBSTACLE_DEFS.ground.minH);
      this.y = GROUND_Y - this.h;
    } else if (type === 'flying') {
      this.w = OBSTACLE_DEFS.flying.w;
      this.h = OBSTACLE_DEFS.flying.h;
      // Flying obstacles at jump height range
      this.y = 200 + Math.random() * 120;
    } else if (type === 'tall') {
      this.w = OBSTACLE_DEFS.tall.minW + Math.random() * (OBSTACLE_DEFS.tall.maxW - OBSTACLE_DEFS.tall.minW);
      this.h = OBSTACLE_DEFS.tall.minH + Math.random() * (OBSTACLE_DEFS.tall.maxH - OBSTACLE_DEFS.tall.minH);
      this.y = GROUND_Y - this.h;
    }
  }

  update(dt, speed) {
    this.x -= speed * dt;
    this.frame += dt;
  }

  isOffScreen() {
    return this.x + this.w < -10;
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.w,
      height: this.h,
    };
  }

  draw(ctx, theme) {
    const skin = getCurrentSkin();
    if (skin) {
      // Map obstacle types to skin roles
      const roleMap = { ground: 'obstacle-01', flying: 'obstacle-02', tall: 'obstacle-03' };
      const role = roleMap[this.type] || 'antagonist';
      if (skin.drawAt(ctx, role, this.x, this.y, this.w, this.h)) return;
      // Fall back to antagonist image if specific obstacle not available
      if (skin.drawAt(ctx, 'antagonist', this.x, this.y, this.w, this.h)) return;
    }
    switch (this.type) {
      case 'ground':
        theme.drawObstacleGround(ctx, this.x, this.y, this.w, this.h);
        break;
      case 'flying':
        theme.drawObstacleFlying(ctx, this.x, this.y, this.w, this.h, this.frame);
        break;
      case 'tall':
        theme.drawObstacleTall(ctx, this.x, this.y, this.w, this.h);
        break;
    }
  }
}

// ---- Coin ----

const COIN_RADIUS = 8;

export class Coin {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = COIN_RADIUS;
    this.collected = false;
    this.frame = 0;
  }

  update(dt, speed) {
    this.x -= speed * dt;
    this.frame += dt;
  }

  isOffScreen() {
    return this.x + this.r < -10;
  }

  /**
   * Check if this coin collides with a point (player center).
   * @param {number} px - Player center X
   * @param {number} py - Player center Y
   * @returns {boolean}
   */
  collidesWith(px, py) {
    if (this.collected) return false;
    const dx = this.x - px;
    const dy = this.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Generous collection radius
    return dist < this.r + 18;
  }

  draw(ctx, theme) {
    if (this.collected) return;
    const skin = getCurrentSkin();
    if (skin && skin.drawCentered(ctx, 'collectible', this.x, this.y, this.r * 2.5, this.r * 2.5)) {
      return;
    }
    theme.drawCoin(ctx, this.x, this.y, this.r, this.frame);
  }
}

// ---- Exports ----

export const GROUND_Y_CONST = GROUND_Y;
export const PLAYER_X_CONST = PLAYER_X;
