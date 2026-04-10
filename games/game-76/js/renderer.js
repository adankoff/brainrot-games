/**
 * BRAINROT COLOR SWITCH -- Renderer
 * All canvas drawing: background, barriers, ball, color switchers, HUD, effects.
 */

/**
 * Draw the dark background with subtle gradient.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas logical width
 * @param {number} h - Canvas logical height
 * @param {Object} theme - Current theme object
 */
export function drawBackground(ctx, w, h, theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.bgColor);
  grad.addColorStop(1, theme.bgColorAlt);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw ambient background particles.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles - Array of { x, y, size, alpha, speed }
 * @param {Object} theme - Current theme
 * @param {number} cameraY - Camera offset
 */
export function drawParticles(ctx, particles, theme, cameraY) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = theme.particleColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y - (cameraY * p.speed * 0.1) % 800 + 400, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Draw a rotating circular barrier with 4 color segments.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} barrier - { x, y, radius, rotation, thickness }
 * @param {Array<string>} colors - 4 color strings
 * @param {number} cameraY - Camera y offset
 */
export function drawCircleBarrier(ctx, barrier, colors, cameraY) {
  const screenY = barrier.y - cameraY;
  const segmentAngle = Math.PI / 2;

  ctx.save();
  ctx.translate(barrier.x, screenY);
  ctx.rotate(barrier.rotation);

  ctx.lineWidth = barrier.thickness;
  ctx.lineCap = 'butt';

  for (let i = 0; i < 4; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    ctx.beginPath();
    ctx.arc(0, 0, barrier.radius, startAngle, endAngle);
    ctx.strokeStyle = colors[i];
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a rotating horizontal bar barrier with 4 color segments.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} barrier - { x, y, width, rotation, thickness }
 * @param {Array<string>} colors - 4 color strings
 * @param {number} cameraY - Camera y offset
 */
export function drawBarBarrier(ctx, barrier, colors, cameraY) {
  const screenY = barrier.y - cameraY;
  const segW = barrier.width / 4;

  ctx.save();
  ctx.translate(barrier.x, screenY);
  ctx.rotate(barrier.rotation);

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    const sx = -barrier.width / 2 + i * segW;
    ctx.fillRect(sx, -barrier.thickness / 2, segW, barrier.thickness);
  }

  ctx.restore();
}

/**
 * Draw the player ball with theme-specific shape and glow.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} ball - { x, y, radius, colorIndex }
 * @param {string} color - The ball's current color string
 * @param {Object} theme - Current theme
 * @param {number} cameraY - Camera y offset
 * @param {number} time - Game time for animations
 */
export function drawBall(ctx, ball, color, theme, cameraY, time) {
  const screenY = ball.y - cameraY;

  ctx.save();

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  if (theme.ballShape === 'toilet') {
    drawToiletBall(ctx, ball.x, screenY, ball.radius, color, time);
  } else if (theme.ballShape === 'corn') {
    drawCornBall(ctx, ball.x, screenY, ball.radius, color, time);
  } else {
    drawOrbBall(ctx, ball.x, screenY, ball.radius, color, time);
  }

  ctx.restore();
}

/**
 * Toilet-shaped ball (Skibidi theme).
 */
function drawToiletBall(ctx, x, y, radius, color, time) {
  // Base circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Toilet bowl top (oval)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 0.15, radius * 0.55, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lid line
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 0.3, radius * 0.5, radius * 0.15, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/**
 * Corn-shaped ball (Ohio theme).
 */
function drawCornBall(ctx, x, y, radius, color, time) {
  // Base oval corn shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.8, radius, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corn kernel dots
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  const rows = 3;
  const cols = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kx = x + (c - 0.5) * radius * 0.45;
      const ky = y + (r - 1) * radius * 0.45;
      ctx.beginPath();
      ctx.arc(kx, ky, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Husk leaves at top
  ctx.strokeStyle = '#44cc44';
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.3, y - radius);
  ctx.quadraticCurveTo(x - radius * 0.5, y - radius * 1.4, x - radius * 0.1, y - radius * 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + radius * 0.3, y - radius);
  ctx.quadraticCurveTo(x + radius * 0.5, y - radius * 1.4, x + radius * 0.1, y - radius * 1.2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Glowing orb ball (Aura theme).
 */
function drawOrbBall(ctx, x, y, radius, color, time) {
  // Outer glow ring
  const pulse = 1 + Math.sin(time * 0.005) * 0.1;
  const outerRadius = radius * 1.3 * pulse;

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  ctx.globalAlpha = 1;
  const grad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, radius * 0.1, x, y, radius);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, color);
  grad.addColorStop(1, color + '88');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner sparkle
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.5 + Math.sin(time * 0.01) * 0.3;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Draw a color switcher pickup (rotating diamond with 4 color quadrants).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} switcher - { x, y, size, rotation }
 * @param {Array<string>} colors - 4 color strings
 * @param {number} cameraY - Camera y offset
 */
export function drawColorSwitcher(ctx, switcher, colors, cameraY) {
  const screenY = switcher.y - cameraY;
  const s = switcher.size;

  ctx.save();
  ctx.translate(switcher.x, screenY);
  ctx.rotate(switcher.rotation);

  // Glow
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;

  // Draw 4 triangular quadrants forming a diamond
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const angle1 = (i * Math.PI) / 2;
    const angle2 = ((i + 1) * Math.PI) / 2;
    ctx.lineTo(Math.cos(angle1) * s, Math.sin(angle1) * s);
    ctx.lineTo(Math.cos(angle2) * s, Math.sin(angle2) * s);
    ctx.closePath();
    ctx.fill();
  }

  // White center dot
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a star collectible.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} star - { x, y, size, rotation }
 * @param {number} cameraY - Camera y offset
 * @param {string} accentColor - Theme accent color
 */
export function drawStar(ctx, star, cameraY, accentColor) {
  const screenY = star.y - cameraY;
  const s = star.size;

  ctx.save();
  ctx.translate(star.x, screenY);
  ctx.rotate(star.rotation);

  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? s : s * 0.45;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draw the score HUD.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} score - Current score
 * @param {string} color - Score text color
 */
export function drawScore(ctx, w, score, color) {
  ctx.save();
  ctx.font = 'bold 48px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Shadow
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 0.4;
  ctx.fillText(String(score), w / 2 + 2, 42);

  // Score text
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillText(String(score), w / 2, 40);
  ctx.restore();
}

/**
 * Draw the ball's current color indicator at the top.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {string} color - Current ball color
 */
export function drawColorIndicator(ctx, w, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(w / 2, 22, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a death flash overlay.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} flashAge - Age of flash (0-1, 0 = just happened)
 */
export function drawDeathFlash(ctx, w, h, flashAge) {
  if (flashAge >= 1) return;
  const alpha = 0.5 * (1 - flashAge);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
