/**
 * YEET -- Renderer
 * All canvas drawing: background, bin, paper ball, wind indicator, HUD, trail, effects.
 */

/**
 * Draw the room background with gradient and subtle details.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Logical canvas width
 * @param {number} h - Logical canvas height
 * @param {Object} theme - Current theme
 */
export function drawBackground(ctx, w, h, theme) {
  // Sky / wall gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.bgGradientTop);
  grad.addColorStop(0.65, theme.bgGradientBottom);
  grad.addColorStop(1, theme.floorColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Floor line
  const floorY = h * 0.82;
  ctx.fillStyle = theme.floorColor;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Floor highlight strip
  ctx.fillStyle = theme.floorHighlight;
  ctx.fillRect(0, floorY, w, 3);

  // Subtle wall lines
  ctx.strokeStyle = theme.wallAccent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;
  for (let i = 1; i < 6; i++) {
    const lineY = floorY * (i / 6);
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w, lineY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the bin / target container.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Bin center x
 * @param {number} y - Bin top y
 * @param {number} binWidth - Width at the top opening
 * @param {number} binHeight - Total bin height
 * @param {Object} theme - Current theme
 */
export function drawBin(ctx, x, y, binWidth, binHeight, theme) {
  const halfW = binWidth / 2;
  const baseHalfW = halfW * 0.7; // Narrower at bottom (trapezoid)

  ctx.save();

  // Shadow under bin
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + binHeight + 4, halfW * 1.1, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bin body (trapezoid)
  ctx.beginPath();
  ctx.moveTo(x - halfW, y);
  ctx.lineTo(x + halfW, y);
  ctx.lineTo(x + baseHalfW, y + binHeight);
  ctx.lineTo(x - baseHalfW, y + binHeight);
  ctx.closePath();
  ctx.fillStyle = theme.binColor;
  ctx.fill();
  ctx.strokeStyle = theme.binAccent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner darkness (opening)
  const innerDepth = binHeight * 0.35;
  ctx.beginPath();
  ctx.moveTo(x - halfW + 4, y + 2);
  ctx.lineTo(x + halfW - 4, y + 2);
  ctx.lineTo(x + halfW * 0.85 - 4, y + innerDepth);
  ctx.lineTo(x - halfW * 0.85 + 4, y + innerDepth);
  ctx.closePath();
  ctx.fillStyle = theme.binInnerColor;
  ctx.fill();

  // Rim highlight
  ctx.strokeStyle = theme.binRimColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - halfW - 2, y);
  ctx.lineTo(x + halfW + 2, y);
  ctx.stroke();

  // Rim end caps
  ctx.fillStyle = theme.binRimColor;
  ctx.beginPath();
  ctx.arc(x - halfW - 2, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + halfW + 2, y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw the paper ball / projectile.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} radius - Ball radius
 * @param {number} rotation - Rotation angle in radians
 * @param {Object} theme - Current theme
 * @param {boolean} [isGhost=false] - Draw as semi-transparent guide
 */
export function drawProjectile(ctx, x, y, radius, rotation, theme, isGhost) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (isGhost) {
    ctx.globalAlpha = 0.3;
  }

  // Main circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.projectileColor;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = theme.projectileDetailColor;
  ctx.globalAlpha = isGhost ? 0.15 : 0.3;
  ctx.fill();
  ctx.globalAlpha = isGhost ? 0.3 : 1;

  // Wrinkle lines (crumpled effect)
  ctx.strokeStyle = theme.projectileAccent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = isGhost ? 0.2 : 0.5;

  // Line 1
  ctx.beginPath();
  ctx.moveTo(-radius * 0.4, -radius * 0.2);
  ctx.lineTo(radius * 0.1, radius * 0.3);
  ctx.stroke();

  // Line 2
  ctx.beginPath();
  ctx.moveTo(radius * 0.2, -radius * 0.5);
  ctx.lineTo(radius * 0.4, radius * 0.1);
  ctx.stroke();

  // Line 3
  ctx.beginPath();
  ctx.moveTo(-radius * 0.3, radius * 0.2);
  ctx.lineTo(radius * 0.2, radius * 0.5);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a money bag projectile for sigma theme.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} radius - Ball radius
 * @param {number} rotation - Rotation in radians
 * @param {Object} theme - Current theme
 * @param {boolean} [isGhost=false]
 */
export function drawMoneyBag(ctx, x, y, radius, rotation, theme, isGhost) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (isGhost) ctx.globalAlpha = 0.3;

  // Bag body
  ctx.beginPath();
  ctx.arc(0, radius * 0.1, radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.projectileColor;
  ctx.fill();

  // Bag tie (top)
  ctx.beginPath();
  ctx.moveTo(-radius * 0.3, -radius * 0.7);
  ctx.lineTo(0, -radius * 1.0);
  ctx.lineTo(radius * 0.3, -radius * 0.7);
  ctx.fillStyle = theme.projectileAccent;
  ctx.fill();

  // Dollar sign
  ctx.font = `bold ${radius * 1.0}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.projectileDetailColor;
  ctx.globalAlpha = isGhost ? 0.2 : 0.8;
  ctx.fillText('$', 0, radius * 0.15);

  ctx.restore();
}

/**
 * Draw a phone projectile for touch grass theme.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} radius - Approximate radius
 * @param {number} rotation - Rotation in radians
 * @param {Object} theme - Current theme
 * @param {boolean} [isGhost=false]
 */
export function drawPhone(ctx, x, y, radius, rotation, theme, isGhost) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (isGhost) ctx.globalAlpha = 0.3;

  const pw = radius * 1.2;
  const ph = radius * 1.8;

  // Phone body
  roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 4);
  ctx.fillStyle = theme.projectileColor;
  ctx.fill();

  // Screen
  const screenPad = 3;
  roundRect(ctx, -pw / 2 + screenPad, -ph / 2 + screenPad + 2, pw - screenPad * 2, ph - screenPad * 2 - 4, 2);
  ctx.fillStyle = theme.projectileDetailColor;
  ctx.globalAlpha = isGhost ? 0.15 : 0.6;
  ctx.fill();

  // Screen reflection
  ctx.globalAlpha = isGhost ? 0.05 : 0.15;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-pw / 2 + screenPad + 2, -ph / 2 + screenPad + 4, pw * 0.3, ph * 0.5);

  ctx.restore();
}

/**
 * Draw the themed projectile based on current theme id.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} rotation
 * @param {Object} theme
 * @param {boolean} [isGhost=false]
 */
export function drawThemedProjectile(ctx, x, y, radius, rotation, theme, isGhost) {
  if (theme.id === 'sigma-toss') {
    drawMoneyBag(ctx, x, y, radius, rotation, theme, isGhost);
  } else if (theme.id === 'touch-grass') {
    drawPhone(ctx, x, y, radius, rotation, theme, isGhost);
  } else {
    drawProjectile(ctx, x, y, radius, rotation, theme, isGhost);
  }
}

/**
 * Draw the wind indicator arrow at the top of the screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} wind - Wind force value (-0.15 to 0.15)
 * @param {Object} theme - Current theme
 */
export function drawWindIndicator(ctx, w, wind, theme) {
  const centerX = w / 2;
  const y = 52;

  // Label
  ctx.font = 'bold 10px "Space Grotesk", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.windArrowColor;
  ctx.globalAlpha = 0.6;
  ctx.fillText('WIND', centerX, y - 12);
  ctx.globalAlpha = 1;

  if (Math.abs(wind) < 0.005) {
    // No wind -- show calm indicator
    ctx.font = '9px monospace';
    ctx.globalAlpha = 0.4;
    ctx.fillText('calm', centerX, y + 2);
    ctx.globalAlpha = 1;
    return;
  }

  // Arrow
  const maxLen = 60;
  const arrowLen = (Math.abs(wind) / 0.15) * maxLen;
  const dir = wind > 0 ? 1 : -1;
  const startX = centerX;
  const endX = centerX + arrowLen * dir;

  // Arrow shaft
  ctx.strokeStyle = theme.windArrowColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX, y);
  ctx.stroke();

  // Arrow head
  const headSize = 6;
  ctx.fillStyle = theme.windArrowColor;
  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(endX - headSize * dir, y - headSize);
  ctx.lineTo(endX - headSize * dir, y + headSize);
  ctx.closePath();
  ctx.fill();

  // Wind strength text
  const strength = Math.abs(wind) > 0.1 ? 'strong' : Math.abs(wind) > 0.05 ? 'med' : 'light';
  ctx.font = '9px monospace';
  ctx.globalAlpha = 0.4;
  ctx.fillText(strength, centerX, y + 14);
  ctx.globalAlpha = 1;
}

/**
 * Draw the score display (top-left).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score - Current score
 * @param {Object} theme - Current theme
 */
export function drawScore(ctx, score, theme) {
  ctx.save();
  ctx.font = 'bold 28px "Space Grotesk", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Shadow
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;
  ctx.fillText(String(score), 13, 13);

  // Score
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.scoreColor;
  ctx.fillText(String(score), 12, 12);
  ctx.restore();
}

/**
 * Draw the miss indicators (top-right, X marks).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} misses - Number of misses (0-3)
 * @param {number} maxMisses - Maximum misses allowed
 */
export function drawMisses(ctx, w, misses, maxMisses) {
  ctx.save();
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  for (let i = 0; i < maxMisses; i++) {
    const xPos = w - 14 - (maxMisses - 1 - i) * 24;
    if (i < misses) {
      ctx.fillStyle = '#ff3838';
      ctx.fillText('X', xPos, 12);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillText('O', xPos, 12);
    }
  }

  ctx.restore();
}

/**
 * Draw the streak indicator.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas width
 * @param {number} streak - Current streak count
 * @param {Object} theme - Current theme
 */
export function drawStreak(ctx, w, streak, theme) {
  if (streak < 2) return;

  ctx.save();
  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.04;
  ctx.font = `bold ${14 * pulse}px "Space Grotesk", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.streakColor;
  ctx.fillText(`${streak}x streak`, 12, 42);
  ctx.restore();
}

/**
 * Draw the faint trail behind the paper in flight.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} trail - Array of {x, y} positions
 * @param {Object} theme - Current theme
 */
export function drawTrail(ctx, trail, theme) {
  if (trail.length < 2) return;

  ctx.save();
  for (let i = 0; i < trail.length - 1; i++) {
    const alpha = (i / trail.length) * 0.5;
    const radius = 2 + (i / trail.length) * 2;
    ctx.fillStyle = theme.trailColor;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw floating text effects (score popups, streak bonuses).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} floats - Array of {text, x, y, color, alpha, vy}
 */
export function drawFloatingTexts(ctx, floats) {
  ctx.save();
  for (const ft of floats) {
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = `bold ${ft.size || 18}px "Space Grotesk", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = '#000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.restore();
}

/**
 * Draw a swipe guide arrow when the player is dragging.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX - Start x of swipe
 * @param {number} startY - Start y of swipe
 * @param {number} currentX - Current x of drag
 * @param {number} currentY - Current y of drag
 * @param {Object} theme - Current theme
 */
export function drawSwipeGuide(ctx, startX, startY, currentX, currentY, theme) {
  const dx = currentX - startX;
  const dy = currentY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 10) return;

  ctx.save();

  // Draw the projection line (inverted direction -- shows where ball will go)
  const projDx = -dx;
  const projDy = -dy;
  const projLen = Math.min(dist * 1.5, 150);
  const normLen = Math.sqrt(projDx * projDx + projDy * projDy);
  const endX = startX + (projDx / normLen) * projLen;
  const endY = startY + (projDy / normLen) * projLen;

  // Dashed line
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrow head at the end
  const angle = Math.atan2(projDy, projDx);
  const headSize = 8;
  ctx.setLineDash([]);
  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - headSize * Math.cos(angle - 0.4), endY - headSize * Math.sin(angle - 0.4));
  ctx.lineTo(endX - headSize * Math.cos(angle + 0.4), endY - headSize * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a screen flash effect (on miss or score).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @param {number} alpha
 */
export function drawFlash(ctx, w, h, color, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---- Helper: Rounded Rectangle Path ----

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
