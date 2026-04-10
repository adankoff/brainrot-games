/**
 * MEME BOUNCE -- Renderer
 * All canvas drawing logic separated from game state.
 */

const W = 400;
const H = 700;

/**
 * Draw the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} data - Render data from BounceGame.getRenderData()
 */
export function renderGame(ctx, data) {
  // Background
  drawBackground(ctx, data.cameraY);

  // Grid lines for depth feel
  drawGrid(ctx, data.cameraY);

  // Particles (behind platforms)
  drawParticles(ctx, data.particles);

  // Platforms
  for (const p of data.platforms) {
    drawPlatform(ctx, p);
  }

  // Spikes
  for (const s of data.spikes) {
    drawSpike(ctx, s, data.spikeWidth, data.spikeHeight);
  }

  // Trail
  drawTrail(ctx, data.trail);

  // Ball
  drawBall(ctx, data.ballX, data.ballY, data.ballRadius);

  // HUD
  drawHUD(ctx, data.score, data.platformCount, data.maxPlatforms);
}

/**
 * Draw gradient background.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cameraY
 */
function drawBackground(ctx, cameraY) {
  // Shift hue slightly based on camera for visual progression
  const hueShift = Math.abs(cameraY) * 0.01;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, `hsl(${240 + hueShift % 40}, 30%, 8%)`);
  grad.addColorStop(1, `hsl(${220 + hueShift % 40}, 25%, 12%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Draw subtle grid lines for parallax depth.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cameraY
 */
function drawGrid(ctx, cameraY) {
  ctx.strokeStyle = 'rgba(0, 255, 180, 0.04)';
  ctx.lineWidth = 1;

  const spacing = 50;
  const offset = ((cameraY * 0.3) % spacing + spacing) % spacing;

  for (let y = -offset; y < H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const hOffset = ((cameraY * 0.1) % spacing + spacing) % spacing;
  for (let x = -hOffset; x < W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
}

/**
 * Draw a platform with glow and fade based on remaining life.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} p - Platform render data
 */
function drawPlatform(ctx, p) {
  const alpha = Math.min(1, p.lifeRatio * 2);
  const pulseAlpha = p.lifeRatio < 0.3 ? 0.3 + Math.sin(Date.now() * 0.02) * 0.2 : alpha;

  // Glow
  ctx.shadowColor = `rgba(0, 255, 180, ${pulseAlpha * 0.6})`;
  ctx.shadowBlur = 12;

  // Platform body
  ctx.fillStyle = `rgba(0, 255, 180, ${pulseAlpha * 0.8})`;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
  } else {
    ctx.rect(p.x, p.y, p.w, p.h);
  }
  ctx.fill();

  // Top highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.3})`;
  ctx.fillRect(p.x + 2, p.y, p.w - 4, 2);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw a descending spike hazard.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} s - Spike render data
 * @param {number} sw - Spike width
 * @param {number} sh - Spike height
 */
function drawSpike(ctx, s, sw, sh) {
  // Glow
  ctx.shadowColor = 'rgba(255, 50, 50, 0.5)';
  ctx.shadowBlur = 10;

  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.moveTo(s.x - sw / 2, s.y);
  ctx.lineTo(s.x, s.y + sh);
  ctx.lineTo(s.x + sw / 2, s.y);
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
  ctx.beginPath();
  ctx.moveTo(s.x - sw / 4, s.y + 2);
  ctx.lineTo(s.x, s.y + sh - 4);
  ctx.lineTo(s.x + sw / 4, s.y + 2);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw the ball trail.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} trail
 */
function drawTrail(ctx, trail) {
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    const ratio = i / trail.length;
    const alpha = ratio * 0.4;
    const radius = ratio * 10;

    ctx.beginPath();
    ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 180, ${alpha})`;
    ctx.fill();
  }
}

/**
 * Draw the bouncing ball with glow effect.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} r
 */
function drawBall(ctx, x, y, r) {
  // Outer glow
  ctx.shadowColor = 'rgba(0, 255, 220, 0.6)';
  ctx.shadowBlur = 20;

  // Ball body - gradient
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#00ffd0');
  grad.addColorStop(1, '#00aa80');

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Specular highlight
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw particles.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles
 */
function drawParticles(ctx, particles) {
  for (const p of particles) {
    const alpha = Math.min(1, p.life / 10);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + alpha * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the heads-up display.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} platformCount
 * @param {number} maxPlatforms
 */
function drawHUD(ctx, score, platformCount, maxPlatforms) {
  // Score
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;

  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(score.toLocaleString(), W / 2, 20);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Platform counter (bottom-right)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font = '14px monospace';

  const remaining = maxPlatforms - platformCount;
  const counterColor = remaining === 0 ? '#ff6666' : '#00ffb4';
  ctx.fillStyle = counterColor;
  ctx.fillText(`platforms: ${remaining}/${maxPlatforms}`, W - 12, H - 12);

  // Tap hint at bottom center (fades)
  ctx.textAlign = 'center';
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('tap to create platform', W / 2, H - 12);
}

/**
 * Render the menu background animation.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time - Elapsed time in ms
 */
export function renderMenuBg(ctx, time) {
  // Dark background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Animated grid
  ctx.strokeStyle = 'rgba(0, 255, 180, 0.06)';
  ctx.lineWidth = 1;
  const offset = (time * 0.02) % 50;
  for (let y = -offset; y < H; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Floating demo ball
  const bx = W / 2 + Math.sin(time * 0.002) * 60;
  const by = H * 0.4 + Math.sin(time * 0.003) * 40;

  ctx.shadowColor = 'rgba(0, 255, 220, 0.5)';
  ctx.shadowBlur = 20;

  const grad = ctx.createRadialGradient(bx - 4, by - 4, 2, bx, by, 15);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#00ffd0');
  grad.addColorStop(1, '#00aa80');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(bx, by, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
