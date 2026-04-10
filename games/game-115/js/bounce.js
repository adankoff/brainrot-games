/**
 * MEME BOUNCE -- Core Game Logic
 * Ball physics, platform management, hazard spawning, scoring.
 */

const W = 400;
const H = 700;
const BALL_RADIUS = 15;
const GRAVITY = 0.12;
const BOUNCE_VEL = -6;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 10;
const PLATFORM_LIFETIME = 180; // frames (~3 seconds at 60fps)
const MAX_PLATFORMS = 3;
const SPIKE_WIDTH = 30;
const SPIKE_HEIGHT = 20;
const SPIKE_SPEED = 1.2;
const HAZARD_SCORE_THRESHOLD = 500;

/**
 * @typedef {Object} Platform
 * @property {number} x      - Left edge x
 * @property {number} y      - Top edge y (in world coords)
 * @property {number} w      - Width
 * @property {number} h      - Height
 * @property {number} life   - Remaining life in frames
 * @property {number} maxLife - Original lifetime
 * @property {boolean} used  - Whether the ball has bounced on it
 */

/**
 * @typedef {Object} Spike
 * @property {number} x      - Center x
 * @property {number} y      - Tip y (in world coords, descending)
 * @property {number} startY - World y where it spawned
 * @property {number} maxDrop - How far it drops before disappearing
 * @property {boolean} active
 */

/**
 * @typedef {Object} TrailPoint
 * @property {number} x
 * @property {number} y  - World y
 * @property {number} age
 */

export class BounceGame {
  constructor() {
    this.reset();
  }

  reset() {
    // Ball state
    this.ballX = W / 2;
    this.ballY = H - 100;  // world y
    this.ballVy = BOUNCE_VEL;
    this.ballVx = 0;

    // Camera / scrolling
    this.cameraY = 0;       // world y of top of screen
    this.maxHeight = 0;     // highest world y reached (lower = higher)

    // Score
    this.score = 0;

    // Platforms (player-created)
    /** @type {Platform[]} */
    this.platforms = [];

    // Starting platform so the player doesn't die immediately
    this.platforms.push(this._makePlatform(W / 2, this.ballY + 50, 600));

    // Hazards
    /** @type {Spike[]} */
    this.spikes = [];
    this.spikeTimer = 0;

    // Trail
    /** @type {TrailPoint[]} */
    this.trail = [];

    // State
    this.alive = true;
    this.gameOverReason = '';

    // Pending sound events for the frame
    /** @type {string[]} */
    this.pendingSounds = [];

    // Particles for visual feedback
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,color:string}>} */
    this.particles = [];
  }

  /**
   * Create a platform object.
   *
   * @param {number} cx - Center x
   * @param {number} wy - World y
   * @param {number} [life] - Override lifetime
   * @returns {Platform}
   */
  _makePlatform(cx, wy, life) {
    const pw = PLATFORM_WIDTH;
    return {
      x: Math.max(0, Math.min(W - pw, cx - pw / 2)),
      y: wy,
      w: pw,
      h: PLATFORM_HEIGHT,
      life: life || PLATFORM_LIFETIME,
      maxLife: life || PLATFORM_LIFETIME,
      used: false,
    };
  }

  /**
   * Player taps at a position (in screen coords).
   * Spawns a platform at that location.
   *
   * @param {number} sx - Screen x
   * @param {number} sy - Screen y
   */
  spawnPlatform(sx, sy) {
    if (!this.alive) return;

    const worldY = sy + this.cameraY;

    // Remove oldest if at max
    if (this.platforms.length >= MAX_PLATFORMS) {
      const removed = this.platforms.shift();
      if (removed) {
        this.pendingSounds.push('expire');
      }
    }

    this.platforms.push(this._makePlatform(sx, worldY));
    this.pendingSounds.push('spawn');

    // Spawn particles at platform location
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: sx,
        y: worldY,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2,
        life: 20 + Math.random() * 15,
        color: `hsl(${160 + Math.random() * 40}, 100%, 70%)`,
      });
    }
  }

  /**
   * Advance one game frame.
   *
   * @param {number} dt - Delta time normalized (1.0 = one 60fps frame)
   */
  update(dt) {
    if (!this.alive) return;

    this.pendingSounds = [];

    // --- Ball physics ---
    this.ballVy += GRAVITY * dt;
    this.ballY += this.ballVy * dt;
    this.ballX += this.ballVx * dt;

    // Horizontal wall bounce
    if (this.ballX - BALL_RADIUS < 0) {
      this.ballX = BALL_RADIUS;
      this.ballVx = Math.abs(this.ballVx) * 0.8;
    } else if (this.ballX + BALL_RADIUS > W) {
      this.ballX = W - BALL_RADIUS;
      this.ballVx = -Math.abs(this.ballVx) * 0.8;
    }

    // Dampen horizontal velocity
    this.ballVx *= 0.99;

    // --- Trail ---
    this.trail.push({ x: this.ballX, y: this.ballY, age: 0 });
    if (this.trail.length > 15) this.trail.shift();
    for (const t of this.trail) t.age += dt;

    // --- Platform collision (only when falling) ---
    if (this.ballVy > 0) {
      for (let i = this.platforms.length - 1; i >= 0; i--) {
        const p = this.platforms[i];
        const ballBottom = this.ballY + BALL_RADIUS;
        const prevBottom = ballBottom - this.ballVy * dt;

        // Check if ball bottom crosses platform top this frame
        if (
          this.ballX + BALL_RADIUS > p.x &&
          this.ballX - BALL_RADIUS < p.x + p.w &&
          prevBottom <= p.y &&
          ballBottom >= p.y
        ) {
          // Bounce
          this.ballY = p.y - BALL_RADIUS;
          this.ballVy = BOUNCE_VEL;

          // Slight horizontal nudge from offset
          const offset = (this.ballX - (p.x + p.w / 2)) / (p.w / 2);
          this.ballVx += offset * 1.5;

          this.pendingSounds.push('bounce');

          // If platform was player-created (not the starter), mark used and remove
          if (!p.used) {
            p.used = true;
            // Remove used platforms immediately
            this.platforms.splice(i, 1);

            // Bounce particles
            for (let j = 0; j < 8; j++) {
              this.particles.push({
                x: this.ballX,
                y: p.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                life: 15 + Math.random() * 10,
                color: '#00ffb4',
              });
            }
          }
          break;
        }
      }
    }

    // --- Camera follow (scroll upward) ---
    const targetCameraY = this.ballY - H * 0.4;
    if (targetCameraY < this.cameraY) {
      this.cameraY += (targetCameraY - this.cameraY) * 0.1 * dt;
    }

    // --- Score based on height ---
    const height = -(this.ballY - (H - 100));
    if (height > this.maxHeight) {
      this.maxHeight = height;
      this.score = Math.floor(this.maxHeight);
    }

    // --- Platform lifetime decay ---
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      this.platforms[i].life -= dt;
      if (this.platforms[i].life <= 0) {
        this.platforms.splice(i, 1);
        this.pendingSounds.push('expire');
      }
    }

    // --- Hazards (spikes from ceiling after score threshold) ---
    if (this.score > HAZARD_SCORE_THRESHOLD) {
      this.spikeTimer += dt;
      // Spawn spike every ~3 seconds, more frequent at higher scores
      const spawnInterval = Math.max(60, 180 - (this.score - HAZARD_SCORE_THRESHOLD) * 0.1);
      if (this.spikeTimer >= spawnInterval) {
        this.spikeTimer = 0;
        this.spikes.push({
          x: Math.random() * (W - SPIKE_WIDTH * 2) + SPIKE_WIDTH,
          y: this.cameraY,
          startY: this.cameraY,
          maxDrop: 120 + Math.random() * 80,
          active: true,
        });
      }
    }

    // Update spikes
    for (let i = this.spikes.length - 1; i >= 0; i--) {
      const s = this.spikes[i];
      s.y += SPIKE_SPEED * dt;

      // Remove if dropped past its range
      if (s.y - s.startY > s.maxDrop) {
        this.spikes.splice(i, 1);
        continue;
      }

      // Collision with ball
      if (s.active) {
        const dx = this.ballX - s.x;
        const dy = this.ballY - (s.y + SPIKE_HEIGHT);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_RADIUS + 8) {
          this.alive = false;
          this.gameOverReason = 'spiked';
          this.pendingSounds.push('gameover');
          return;
        }
      }
    }

    // Remove off-screen spikes (way below camera)
    this.spikes = this.spikes.filter(s => s.y < this.cameraY + H + 100);

    // --- Particles ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // --- Fall death ---
    if (this.ballY > this.cameraY + H + BALL_RADIUS * 2) {
      this.alive = false;
      this.gameOverReason = 'fell';
      this.pendingSounds.push('gameover');
    }
  }

  /**
   * Get current screen-space coordinates for rendering.
   *
   * @returns {Object} Render data
   */
  getRenderData() {
    return {
      ballX: this.ballX,
      ballY: this.ballY - this.cameraY,
      ballRadius: BALL_RADIUS,
      platforms: this.platforms.map(p => ({
        x: p.x,
        y: p.y - this.cameraY,
        w: p.w,
        h: p.h,
        lifeRatio: p.life / p.maxLife,
        used: p.used,
      })),
      spikes: this.spikes.map(s => ({
        x: s.x,
        y: s.y - this.cameraY,
        active: s.active,
      })),
      trail: this.trail.map(t => ({
        x: t.x,
        y: t.y - this.cameraY,
        age: t.age,
      })),
      particles: this.particles.map(p => ({
        x: p.x,
        y: p.y - this.cameraY,
        life: p.life,
        color: p.color,
      })),
      score: this.score,
      alive: this.alive,
      cameraY: this.cameraY,
      platformCount: this.platforms.length,
      maxPlatforms: MAX_PLATFORMS,
      spikeWidth: SPIKE_WIDTH,
      spikeHeight: SPIKE_HEIGHT,
    };
  }
}
