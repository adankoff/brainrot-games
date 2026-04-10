/**
 * MEME ASTEROIDS -- Renderer
 * Draws all game entities onto the canvas.
 */

import { loadThemeColors } from '../../shared/theme-utils.js';

const W = 400;
const H = 700;

const SHIP_RADIUS = 12;

const COLORS = loadThemeColors({
  bg:           { css: '--game-bg',            fallback: '#0a0a0a' },
  ship:         { css: '--game-ship',          fallback: '#cccccc' },
  thrust:       { css: '--game-thrust',        fallback: '#999999' },
  asteroidLg:   { css: '--game-asteroid-lg',   fallback: '#aaaaaa' },
  asteroidMd:   { css: '--game-asteroid-md',   fallback: '#cccccc' },
  asteroidSm:   { css: '--game-asteroid-sm',   fallback: '#eeeeee' },
  bullet:       { css: '--game-bullet',        fallback: '#ffffff' },
  particle:     { css: '--game-particle',      fallback: '200, 200, 200' },
  hudText:      { css: '--game-hud-text',      fallback: '#ffffff' },
  hudSecondary: { css: '--game-hud-secondary', fallback: '#888888' },
  accent:       { css: '--game-accent',        fallback: '#cccccc' },
});

/** @type {number} */
let frameCount = 0;

/**
 * Draw the entire game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} entities - From getEntities()
 */
export function render(ctx, entities) {
  frameCount++;

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Stars background (static seed based on position)
  drawStars(ctx);

  // Particles
  drawParticles(ctx, entities.particles);

  // Asteroids
  for (const a of entities.asteroids) {
    drawAsteroid(ctx, a);
  }

  // Bullets
  for (const b of entities.bullets) {
    drawBullet(ctx, b);
  }

  // Ship
  if (entities.ship.alive) {
    drawShip(ctx, entities.ship);
  }

  // HUD
  drawHUD(ctx, entities.score, entities.lives, entities.wave);
}

/** Cached star positions */
let stars = null;

function drawStars(ctx) {
  if (!stars) {
    stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        brightness: 0.3 + Math.random() * 0.7,
        size: 0.5 + Math.random() * 1.5,
      });
    }
  }

  for (const s of stars) {
    const flicker = s.brightness * (0.8 + Math.sin(frameCount * 0.02 + s.x) * 0.2);
    ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
}

function drawShip(ctx, ship) {
  // Invulnerability blink
  if (ship.invulnTimer > 0 && Math.floor(frameCount / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  // Ship body (triangle)
  ctx.beginPath();
  ctx.moveTo(SHIP_RADIUS, 0);
  ctx.lineTo(-SHIP_RADIUS * 0.7, -SHIP_RADIUS * 0.6);
  ctx.lineTo(-SHIP_RADIUS * 0.4, 0);
  ctx.lineTo(-SHIP_RADIUS * 0.7, SHIP_RADIUS * 0.6);
  ctx.closePath();
  ctx.strokeStyle = COLORS.ship;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Thrust flame
  if (ship.thrusting) {
    const flameLen = 6 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(-SHIP_RADIUS * 0.4, -SHIP_RADIUS * 0.3);
    ctx.lineTo(-SHIP_RADIUS * 0.4 - flameLen, 0);
    ctx.lineTo(-SHIP_RADIUS * 0.4, SHIP_RADIUS * 0.3);
    ctx.strokeStyle = COLORS.thrust;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawAsteroid(ctx, asteroid) {
  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotation);

  const verts = asteroid.shape;
  const r = asteroid.radius;

  ctx.beginPath();
  for (let i = 0; i < verts.length; i++) {
    const angle = (i / verts.length) * Math.PI * 2;
    const dist = r * verts[i];
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();

  // Color by size
  let color;
  switch (asteroid.size) {
    case 'large':  color = COLORS.asteroidLg; break;
    case 'medium': color = COLORS.asteroidMd; break;
    case 'small':  color = COLORS.asteroidSm; break;
    default:       color = COLORS.bullet;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawBullet(ctx, bullet) {
  ctx.fillStyle = COLORS.bullet;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles(ctx, particles) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = `rgba(${COLORS.particle}, ${alpha})`;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
}

function drawHUD(ctx, score, lives, wave) {
  // Score
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(score.toLocaleString(), 12, 30);

  // Wave
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.hudSecondary;
  ctx.fillText(`WAVE ${wave}`, W / 2, 24);

  // Lives (draw small ship icons)
  for (let i = 0; i < lives; i++) {
    const lx = W - 20 - i * 22;
    const ly = 22;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(-Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.strokeStyle = COLORS.ship;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}
