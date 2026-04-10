/**
 * MEME CUT -- Core Game Logic
 * Physics simulation for ropes (pendulums), candy, stars, and target.
 */

import { readThemeColor } from '../../shared/theme-utils.js';

const W = 400;
const H = 700;
const GRAVITY = 0.4;
const DAMPING = 0.998;
const STAR_RADIUS = 18;
const CANDY_RADIUS = 18;
const TARGET_RADIUS = 28;
const ROPE_SEGMENTS = 1; // single segment per rope for pendulum
const CANDY_BOUNCE = 0.3;

/**
 * Level data: each level defines anchor points for ropes, target position, star positions.
 * Anchors: {x, y} -- where the rope attaches
 * candyStart: {x, y} -- initial candy position (ropes extend from anchors to here)
 * target: {x, y} -- the green character position
 * stars: [{x, y}, ...] -- bonus star positions (0-3)
 */
export const LEVELS = [
  // Level 1: Simple single rope, candy directly above target
  {
    anchors: [{ x: 200, y: 40 }],
    candyStart: { x: 200, y: 220 },
    target: { x: 200, y: 580 },
    stars: [{ x: 200, y: 400 }],
  },
  // Level 2: Single rope offset, need to swing
  {
    anchors: [{ x: 300, y: 40 }],
    candyStart: { x: 300, y: 200 },
    target: { x: 120, y: 580 },
    stars: [{ x: 210, y: 380 }],
  },
  // Level 3: Two ropes, cut one to swing to target
  {
    anchors: [{ x: 120, y: 40 }, { x: 280, y: 40 }],
    candyStart: { x: 200, y: 240 },
    target: { x: 320, y: 560 },
    stars: [{ x: 280, y: 400 }, { x: 320, y: 480 }],
  },
  // Level 4: Two ropes, target on left
  {
    anchors: [{ x: 100, y: 60 }, { x: 300, y: 60 }],
    candyStart: { x: 200, y: 260 },
    target: { x: 80, y: 580 },
    stars: [{ x: 140, y: 400 }, { x: 100, y: 500 }],
  },
  // Level 5: Three ropes, centered target below
  {
    anchors: [{ x: 80, y: 30 }, { x: 200, y: 30 }, { x: 320, y: 30 }],
    candyStart: { x: 200, y: 220 },
    target: { x: 200, y: 600 },
    stars: [{ x: 120, y: 380 }, { x: 280, y: 380 }, { x: 200, y: 480 }],
  },
  // Level 6: Side anchor rope
  {
    anchors: [{ x: 380, y: 200 }],
    candyStart: { x: 280, y: 200 },
    target: { x: 100, y: 560 },
    stars: [{ x: 200, y: 350 }, { x: 140, y: 460 }],
  },
  // Level 7: Two ropes from sides
  {
    anchors: [{ x: 20, y: 150 }, { x: 380, y: 150 }],
    candyStart: { x: 200, y: 250 },
    target: { x: 200, y: 620 },
    stars: [{ x: 120, y: 400 }, { x: 280, y: 400 }, { x: 200, y: 520 }],
  },
  // Level 8: Staggered anchors
  {
    anchors: [{ x: 100, y: 40 }, { x: 330, y: 140 }],
    candyStart: { x: 200, y: 280 },
    target: { x: 60, y: 600 },
    stars: [{ x: 160, y: 420 }, { x: 100, y: 520 }],
  },
  // Level 9: High side anchor + low target
  {
    anchors: [{ x: 40, y: 80 }, { x: 360, y: 80 }],
    candyStart: { x: 200, y: 180 },
    target: { x: 340, y: 620 },
    stars: [{ x: 260, y: 340 }, { x: 310, y: 460 }, { x: 340, y: 550 }],
  },
  // Level 10: Three ropes, off-center target
  {
    anchors: [{ x: 60, y: 50 }, { x: 200, y: 30 }, { x: 340, y: 50 }],
    candyStart: { x: 200, y: 200 },
    target: { x: 80, y: 600 },
    stars: [{ x: 140, y: 350 }, { x: 100, y: 460 }, { x: 80, y: 540 }],
  },
  // Level 11: Two ropes, one high one low
  {
    anchors: [{ x: 150, y: 30 }, { x: 350, y: 250 }],
    candyStart: { x: 240, y: 250 },
    target: { x: 100, y: 580 },
    stars: [{ x: 180, y: 380 }, { x: 130, y: 490 }],
  },
  // Level 12: Side anchors, center target far down
  {
    anchors: [{ x: 20, y: 100 }, { x: 380, y: 100 }, { x: 200, y: 30 }],
    candyStart: { x: 200, y: 180 },
    target: { x: 300, y: 640 },
    stars: [{ x: 240, y: 360 }, { x: 280, y: 480 }, { x: 300, y: 570 }],
  },
  // Level 13: Single long rope, distant target
  {
    anchors: [{ x: 60, y: 30 }],
    candyStart: { x: 60, y: 180 },
    target: { x: 340, y: 580 },
    stars: [{ x: 160, y: 300 }, { x: 260, y: 420 }, { x: 320, y: 510 }],
  },
  // Level 14: Three ropes, tight star pattern
  {
    anchors: [{ x: 100, y: 20 }, { x: 250, y: 20 }, { x: 380, y: 120 }],
    candyStart: { x: 230, y: 200 },
    target: { x: 60, y: 620 },
    stars: [{ x: 170, y: 340 }, { x: 110, y: 460 }, { x: 70, y: 550 }],
  },
  // Level 15: Grand finale -- three ropes, stars spread, tricky target
  {
    anchors: [{ x: 40, y: 60 }, { x: 200, y: 20 }, { x: 360, y: 60 }],
    candyStart: { x: 200, y: 180 },
    target: { x: 340, y: 650 },
    stars: [{ x: 100, y: 320 }, { x: 260, y: 420 }, { x: 340, y: 550 }],
  },
  // Level 16: Pendulum swing required
  {
    anchors: [{ x: 200, y: 20 }],
    candyStart: { x: 100, y: 180 },
    target: { x: 320, y: 560 },
    stars: [{ x: 200, y: 340 }, { x: 280, y: 460 }],
  },
  // Level 17: Two high anchors, low side target
  {
    anchors: [{ x: 80, y: 20 }, { x: 320, y: 20 }],
    candyStart: { x: 200, y: 200 },
    target: { x: 350, y: 640 },
    stars: [{ x: 260, y: 350 }, { x: 310, y: 470 }, { x: 340, y: 570 }],
  },
  // Level 18: Side + top anchor combo
  {
    anchors: [{ x: 380, y: 180 }, { x: 180, y: 20 }],
    candyStart: { x: 260, y: 200 },
    target: { x: 60, y: 600 },
    stars: [{ x: 180, y: 360 }, { x: 110, y: 490 }],
  },
  // Level 19: Three anchors, narrow corridor of stars
  {
    anchors: [{ x: 60, y: 40 }, { x: 200, y: 40 }, { x: 340, y: 40 }],
    candyStart: { x: 200, y: 200 },
    target: { x: 200, y: 650 },
    stars: [{ x: 200, y: 350 }, { x: 200, y: 460 }, { x: 200, y: 560 }],
  },
  // Level 20: Expert -- two side ropes, distant target
  {
    anchors: [{ x: 20, y: 200 }, { x: 380, y: 200 }],
    candyStart: { x: 200, y: 300 },
    target: { x: 60, y: 640 },
    stars: [{ x: 140, y: 420 }, { x: 90, y: 530 }, { x: 60, y: 590 }],
  },
];

/**
 * Rope class: models a pendulum constraint between an anchor and the candy.
 */
class Rope {
  constructor(anchorX, anchorY, candyX, candyY) {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.length = Math.sqrt((candyX - anchorX) ** 2 + (candyY - anchorY) ** 2);
    this.cut = false;
  }
}

/**
 * Star collectible.
 */
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.collected = false;
    this.animTimer = 0;
  }
}

/**
 * Particle effect for visual feedback.
 */
class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }
}

/**
 * Core game state manager.
 */
export class CutGame {
  constructor() {
    this.currentLevel = 0;
    this.score = 0;
    this.totalStars = 0;
    this.reset();
  }

  reset() {
    this.candy = { x: 0, y: 0, vx: 0, vy: 0 };
    this.ropes = [];
    this.stars = [];
    this.target = { x: 0, y: 0 };
    this.particles = [];
    this.state = 'playing'; // 'playing', 'won', 'lost', 'transition'
    this.transitionTimer = 0;
    this.levelComplete = false;
    this.levelStars = 0;
    this.candyFreeFall = false;
    this.swipeStart = null;
    this.swipeTrail = [];
    this.showLevelBanner = true;
    this.bannerTimer = 0;
  }

  startGame() {
    this.currentLevel = 0;
    this.score = 0;
    this.totalStars = 0;
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.reset();
    this.currentLevel = index;
    const level = LEVELS[index % LEVELS.length];

    this.candy.x = level.candyStart.x;
    this.candy.y = level.candyStart.y;
    this.candy.vx = 0;
    this.candy.vy = 0;
    this.candyFreeFall = false;

    this.target.x = level.target.x;
    this.target.y = level.target.y;

    this.ropes = level.anchors.map(
      (a) => new Rope(a.x, a.y, level.candyStart.x, level.candyStart.y)
    );

    this.stars = level.stars.map((s) => new Star(s.x, s.y));
    this.levelStars = 0;
    this.showLevelBanner = true;
    this.bannerTimer = 90; // ~1.5 seconds at 60fps
  }

  /**
   * Handle pointer/touch down -- start of a swipe.
   */
  onPointerDown(x, y) {
    if (this.state !== 'playing') return;
    if (this.showLevelBanner) {
      this.showLevelBanner = false;
      this.bannerTimer = 0;
    }
    this.swipeStart = { x, y };
    this.swipeTrail = [{ x, y }];
  }

  /**
   * Handle pointer/touch move -- continue swipe, check intersections.
   */
  onPointerMove(x, y) {
    if (this.state !== 'playing' || !this.swipeStart) return;

    const prev = this.swipeTrail[this.swipeTrail.length - 1];
    this.swipeTrail.push({ x, y });

    // Check if swipe line segment intersects any rope
    for (const rope of this.ropes) {
      if (rope.cut) continue;
      if (this._lineIntersectsRope(prev.x, prev.y, x, y, rope)) {
        rope.cut = true;
        this._onRopeCut(rope);
      }
    }
  }

  /**
   * Handle pointer/touch up -- end swipe.
   */
  onPointerUp() {
    this.swipeStart = null;
    this.swipeTrail = [];
  }

  /**
   * Called when a rope is cut.
   */
  _onRopeCut(rope) {
    // Spawn particles at the cut point (midpoint of rope for simplicity)
    const mx = (rope.anchorX + this.candy.x) / 2;
    const my = (rope.anchorY + this.candy.y) / 2;
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push(
        new Particle(mx, my, Math.cos(angle) * speed, Math.sin(angle) * speed, readThemeColor('--game-rope', '#999999'), 30)
      );
    }

    // Check if all ropes are cut
    const allCut = this.ropes.every((r) => r.cut);
    if (allCut) {
      this.candyFreeFall = true;
    }

    // Return 'cut' for sound trigger
    return 'cut';
  }

  /**
   * Check if a line segment (swipe) intersects a rope line segment.
   */
  _lineIntersectsRope(sx1, sy1, sx2, sy2, rope) {
    // Rope goes from anchor to candy
    const rx1 = rope.anchorX;
    const ry1 = rope.anchorY;
    const rx2 = this.candy.x;
    const ry2 = this.candy.y;
    return this._segmentsIntersect(sx1, sy1, sx2, sy2, rx1, ry1, rx2, ry2);
  }

  /**
   * Test if two line segments intersect.
   */
  _segmentsIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    const d1 = this._cross(bx1, by1, bx2, by2, ax1, ay1);
    const d2 = this._cross(bx1, by1, bx2, by2, ax2, ay2);
    const d3 = this._cross(ax1, ay1, ax2, ay2, bx1, by1);
    const d4 = this._cross(ax1, ay1, ax2, ay2, bx2, by2);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    // Check collinear cases with small threshold
    if (Math.abs(d1) < 0.01 && this._onSegment(bx1, by1, bx2, by2, ax1, ay1)) return true;
    if (Math.abs(d2) < 0.01 && this._onSegment(bx1, by1, bx2, by2, ax2, ay2)) return true;
    if (Math.abs(d3) < 0.01 && this._onSegment(ax1, ay1, ax2, ay2, bx1, by1)) return true;
    if (Math.abs(d4) < 0.01 && this._onSegment(ax1, ay1, ax2, ay2, bx2, by2)) return true;

    return false;
  }

  _cross(ax, ay, bx, by, cx, cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  }

  _onSegment(ax, ay, bx, by, px, py) {
    return (
      Math.min(ax, bx) <= px + 1 && px - 1 <= Math.max(ax, bx) &&
      Math.min(ay, by) <= py + 1 && py - 1 <= Math.max(ay, by)
    );
  }

  /**
   * Main physics update. dt is normalized to 60fps (1.0 = one frame).
   * Returns an array of sound events to play.
   */
  update(dt) {
    const sounds = [];

    // Banner countdown
    if (this.showLevelBanner) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.showLevelBanner = false;
      }
      return sounds;
    }

    // Transition between levels
    if (this.state === 'transition') {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        if (this.currentLevel + 1 >= LEVELS.length) {
          this.state = 'gameover';
          return sounds;
        }
        this.loadLevel(this.currentLevel + 1);
      }
      return sounds;
    }

    if (this.state !== 'playing') return sounds;

    // Physics step (possibly subdivide for stability)
    const steps = Math.ceil(dt);
    const subDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      this._physicsStep(subDt);
    }

    // Check star collection
    for (const star of this.stars) {
      if (star.collected) continue;
      const dx = this.candy.x - star.x;
      const dy = this.candy.y - star.y;
      if (dx * dx + dy * dy < (CANDY_RADIUS + STAR_RADIUS) ** 2) {
        star.collected = true;
        star.animTimer = 20;
        this.levelStars++;
        this.totalStars++;
        this.score += 50;
        sounds.push('star');

        // Star collect particles
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          this.particles.push(
            new Particle(star.x, star.y, Math.cos(angle) * speed, Math.sin(angle) * speed, readThemeColor('--game-star', '#cccccc'), 25)
          );
        }
      }
    }

    // Check target collision (candy reaches the mouth)
    {
      const dx = this.candy.x - this.target.x;
      const dy = this.candy.y - this.target.y;
      if (dx * dx + dy * dy < (CANDY_RADIUS + TARGET_RADIUS) ** 2) {
        this.state = 'transition';
        this.transitionTimer = 60;
        this.score += 100;
        sounds.push('nom');

        // Nom particles
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          this.particles.push(
            new Particle(this.target.x, this.target.y, Math.cos(angle) * speed, Math.sin(angle) * speed, readThemeColor('--game-target', '#aaaaaa'), 30)
          );
        }
      }
    }

    // Check if candy fell off screen
    if (this.candy.y > H + 60 || this.candy.x < -60 || this.candy.x > W + 60) {
      this.state = 'lost';
      sounds.push('miss');
    }

    // Update star anim timers
    for (const star of this.stars) {
      if (star.collected && star.animTimer > 0) {
        star.animTimer -= dt;
      }
    }

    // Update particles
    this._updateParticles(dt);

    return sounds;
  }

  /**
   * Single physics sub-step.
   */
  _physicsStep(dt) {
    // Apply gravity
    this.candy.vy += GRAVITY * dt;

    // Apply rope constraints (pendulum physics)
    const activeRopes = this.ropes.filter((r) => !r.cut);

    if (activeRopes.length > 0) {
      // For each active rope, apply constraint
      for (const rope of activeRopes) {
        const dx = this.candy.x - rope.anchorX;
        const dy = this.candy.y - rope.anchorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > rope.length) {
          // Candy is beyond rope length -- constrain it
          const nx = dx / dist;
          const ny = dy / dist;

          // Move candy back to rope length
          this.candy.x = rope.anchorX + nx * rope.length;
          this.candy.y = rope.anchorY + ny * rope.length;

          // Remove velocity component along the rope (radial)
          const radialVel = this.candy.vx * nx + this.candy.vy * ny;
          if (radialVel > 0) {
            this.candy.vx -= radialVel * nx;
            this.candy.vy -= radialVel * ny;
          }
        }
      }

      // Damping while on rope
      this.candy.vx *= DAMPING;
      this.candy.vy *= DAMPING;
    }

    // Update position
    this.candy.x += this.candy.vx * dt;
    this.candy.y += this.candy.vy * dt;

    // Wall bounces (left/right only, to allow falling off bottom)
    if (this.candy.x < CANDY_RADIUS) {
      this.candy.x = CANDY_RADIUS;
      this.candy.vx = Math.abs(this.candy.vx) * CANDY_BOUNCE;
    } else if (this.candy.x > W - CANDY_RADIUS) {
      this.candy.x = W - CANDY_RADIUS;
      this.candy.vx = -Math.abs(this.candy.vx) * CANDY_BOUNCE;
    }
  }

  /**
   * Update particles (decay, move).
   */
  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Get current game info for HUD.
   */
  getInfo() {
    return {
      level: this.currentLevel + 1,
      totalLevels: LEVELS.length,
      score: this.score,
      starsCollected: this.levelStars,
      starsTotal: this.stars.length,
      state: this.state,
    };
  }
}
