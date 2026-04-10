/**
 * MEME LAUNCH -- Launcher (Slingshot) Module
 * Handles slingshot rendering, drag aiming, trajectory preview, and projectile launching.
 */

const W = 400;
const H = 700;

// Slingshot position
const SLING_X = 80;
const SLING_Y = 520;
const SLING_FORK_W = 28;
const SLING_FORK_H = 60;
const SLING_POST_W = 12;
const SLING_POST_H = 80;

// Drag constraints
const MAX_PULL = 120;
const MIN_PULL = 20;
const LAUNCH_POWER = 0.14;

// Projectile
const PROJ_RADIUS = 14;

// Gravity
const GRAVITY = 0.35;

/**
 * Create a launcher instance.
 *
 * @returns {Object} Launcher API
 */
export function createLauncher() {
  let dragging = false;
  let dragX = SLING_X;
  let dragY = SLING_Y;
  let loaded = true; // whether a projectile is in the slingshot

  // Active projectile in flight
  let projectile = null;

  // Particles for visual effects
  let particles = [];

  /**
   * Get the slingshot anchor point.
   */
  function getAnchor() {
    return { x: SLING_X, y: SLING_Y - SLING_FORK_H + 10 };
  }

  /**
   * Start dragging from a point near the slingshot.
   */
  function startDrag(x, y) {
    if (!loaded || projectile) return false;
    const anchor = getAnchor();
    const dx = x - anchor.x;
    const dy = y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 80) return false;
    dragging = true;
    dragX = x;
    dragY = y;
    return true;
  }

  /**
   * Update drag position.
   */
  function moveDrag(x, y) {
    if (!dragging) return;
    const anchor = getAnchor();
    const dx = x - anchor.x;
    const dy = y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_PULL) {
      const angle = Math.atan2(dy, dx);
      dragX = anchor.x + Math.cos(angle) * MAX_PULL;
      dragY = anchor.y + Math.sin(angle) * MAX_PULL;
    } else {
      dragX = x;
      dragY = y;
    }
  }

  /**
   * Release the slingshot -- launch projectile.
   *
   * @returns {boolean} Whether a projectile was launched
   */
  function releaseDrag() {
    if (!dragging) return false;
    dragging = false;

    const anchor = getAnchor();
    const dx = anchor.x - dragX;
    const dy = anchor.y - dragY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MIN_PULL) {
      // Not enough pull -- snap back
      dragX = anchor.x;
      dragY = anchor.y;
      return false;
    }

    // Launch projectile
    const power = dist * LAUNCH_POWER;
    const angle = Math.atan2(dy, dx);
    projectile = {
      x: anchor.x,
      y: anchor.y,
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power,
      radius: PROJ_RADIUS,
      active: true,
      trail: [],
    };

    loaded = false;
    dragX = anchor.x;
    dragY = anchor.y;
    return true;
  }

  /**
   * Get the current pull distance for sound feedback.
   */
  function getPullDistance() {
    if (!dragging) return 0;
    const anchor = getAnchor();
    const dx = dragX - anchor.x;
    const dy = dragY - anchor.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Update projectile physics.
   *
   * @param {number} dt - Delta time normalized to 60fps
   * @returns {Object|null} Current projectile state or null
   */
  function update(dt) {
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 0.03;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    if (!projectile || !projectile.active) return projectile;

    projectile.vx *= 1; // no drag
    projectile.vy += GRAVITY * dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    // Store trail
    projectile.trail.push({ x: projectile.x, y: projectile.y });
    if (projectile.trail.length > 20) {
      projectile.trail.shift();
    }

    // Out of bounds check
    if (projectile.x > W + 50 || projectile.y > H + 50 || projectile.x < -50) {
      projectile.active = false;
    }

    return projectile;
  }

  /**
   * Get trajectory preview points while aiming.
   *
   * @returns {Array<{x: number, y: number}>}
   */
  function getTrajectoryPreview() {
    if (!dragging) return [];

    const anchor = getAnchor();
    const dx = anchor.x - dragX;
    const dy = anchor.y - dragY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MIN_PULL) return [];

    const power = dist * LAUNCH_POWER;
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * power;
    const vy = Math.sin(angle) * power;

    const points = [];
    let px = anchor.x;
    let py = anchor.y;
    let pvx = vx;
    let pvy = vy;

    for (let i = 0; i < 40; i++) {
      pvy += GRAVITY;
      px += pvx;
      py += pvy;
      if (px > W + 20 || py > H + 20 || px < -20) break;
      if (i % 2 === 0) {
        points.push({ x: px, y: py });
      }
    }

    return points;
  }

  /**
   * Reload the slingshot with a new projectile.
   */
  function reload() {
    projectile = null;
    loaded = true;
    const anchor = getAnchor();
    dragX = anchor.x;
    dragY = anchor.y;
  }

  /**
   * Spawn impact particles at a position.
   */
  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0.5 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  /**
   * Render the slingshot, projectile, and effects.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} projectilesLeft - Number of projectiles remaining
   */
  function render(ctx, projectilesLeft) {
    const anchor = getAnchor();

    // Draw slingshot post
    ctx.fillStyle = '#5c3a1e';
    // Left fork
    ctx.fillRect(SLING_X - SLING_FORK_W / 2 - 8, SLING_Y - SLING_FORK_H - SLING_POST_H / 2, SLING_POST_W, SLING_FORK_H + 10);
    // Right fork
    ctx.fillRect(SLING_X + SLING_FORK_W / 2 - 4, SLING_Y - SLING_FORK_H - SLING_POST_H / 2, SLING_POST_W, SLING_FORK_H + 10);
    // Base post
    ctx.fillStyle = '#4a2e14';
    ctx.fillRect(SLING_X - SLING_POST_W / 2, SLING_Y - SLING_POST_H / 2, SLING_POST_W, SLING_POST_H);

    // Fork tips
    const leftForkX = SLING_X - SLING_FORK_W / 2 - 2;
    const rightForkX = SLING_X + SLING_FORK_W / 2 + 2;
    const forkTopY = SLING_Y - SLING_FORK_H - SLING_POST_H / 2;

    // Elastic band (back)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rightForkX, forkTopY);
    if (dragging && loaded) {
      ctx.lineTo(dragX, dragY);
    } else {
      ctx.lineTo(anchor.x, anchor.y);
    }
    ctx.stroke();

    // Projectile in slingshot or being aimed
    if (loaded && !projectile) {
      const projX = dragging ? dragX : anchor.x;
      const projY = dragging ? dragY : anchor.y;
      drawProjectile(ctx, projX, projY, PROJ_RADIUS);
    }

    // Elastic band (front)
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftForkX, forkTopY);
    if (dragging && loaded) {
      ctx.lineTo(dragX, dragY);
    } else {
      ctx.lineTo(anchor.x, anchor.y);
    }
    ctx.stroke();

    // Trajectory preview
    if (dragging) {
      const points = getTrajectoryPreview();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < points.length; i++) {
        const size = Math.max(1, 3 - i * 0.1);
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Active projectile in flight
    if (projectile && projectile.active) {
      // Trail
      ctx.strokeStyle = 'rgba(255, 100, 50, 0.3)';
      ctx.lineWidth = 3;
      if (projectile.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
        for (let i = 1; i < projectile.trail.length; i++) {
          ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
        }
        ctx.stroke();
      }

      drawProjectile(ctx, projectile.x, projectile.y, projectile.radius);
    }

    // Particles
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Projectile count indicator
    renderProjectileCount(ctx, projectilesLeft);
  }

  /**
   * Draw the angry meme projectile.
   */
  function drawProjectile(ctx, x, y, r) {
    // Red circle body
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Darker outline
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Angry eyebrows
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    // Left eyebrow (angled down-inward)
    ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y - r * 0.15);
    ctx.lineTo(x - r * 0.15, y - r * 0.4);
    ctx.stroke();
    // Right eyebrow (angled down-inward)
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6, y - r * 0.15);
    ctx.lineTo(x + r * 0.15, y - r * 0.4);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.05, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.05, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.05, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.25, y - r * 0.05, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Angry mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.35, y + r * 0.35);
    ctx.quadraticCurveTo(x, y + r * 0.15, x + r * 0.35, y + r * 0.35);
    ctx.stroke();
  }

  /**
   * Render projectile count at top-left.
   */
  function renderProjectileCount(ctx, count) {
    const startX = 15;
    const startY = 25;
    for (let i = 0; i < count; i++) {
      drawProjectile(ctx, startX + i * 28, startY, 10);
    }
  }

  return {
    startDrag,
    moveDrag,
    releaseDrag,
    getPullDistance,
    update,
    render,
    reload,
    spawnParticles,
    getProjectile: () => projectile,
    isLoaded: () => loaded,
    isDragging: () => dragging,
    getAnchor,
    PROJ_RADIUS,
    GRAVITY,
  };
}
