/**
 * BRAINROT DASH -- Theme Definitions
 * Three swappable meme themes: Aura Dash, Ohio Gauntlet, Sigma Run.
 * Each theme provides colors, draw functions, and death messages.
 */

// ---- Theme: AURA DASH ----

const auraTheme = {
  id: 'aura',
  name: 'AURA DASH',
  scoreLabel: 'AURA PROGRESS',
  accentColor: '#7C3AED',
  groundColor: '#1A1A2E',
  obstacleColor: '#0A0A0A',

  deathMessages: [
    'your aura died at N%',
    'N% aura achieved. 100% is a myth',
    'the void won at N%',
    'aura check failed at N%. the void noticed',
    'you peaked at N%. that\'s your ceiling',
  ],

  /**
   * Get player color based on progress percentage.
   *
   * @param {number} pct - Progress 0-100
   * @returns {string} CSS color
   */
  getPlayerColor(pct) {
    if (pct < 25) return '#666666';
    if (pct < 50) return '#4488ff';
    if (pct < 75) return '#44dd66';
    if (pct < 90) return '#ffcc00';
    return '#ffffff';
  },

  /**
   * Get player glow color and intensity based on progress.
   *
   * @param {number} pct
   * @returns {{ color: string, radius: number }}
   */
  getPlayerGlow(pct) {
    if (pct < 25) return { color: '#66666644', radius: 4 };
    if (pct < 50) return { color: '#4488ff66', radius: 8 };
    if (pct < 75) return { color: '#44dd6688', radius: 12 };
    if (pct < 90) return { color: '#ffcc00aa', radius: 18 };
    return { color: '#ffffffcc', radius: 24 };
  },

  /**
   * Draw the player cube.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {number} rotation - Radians
   * @param {number} pct - Progress percentage
   */
  drawPlayer(ctx, x, y, size, rotation, pct) {
    const color = this.getPlayerColor(pct);
    const glow = this.getPlayerGlow(pct);

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Glow
    ctx.shadowColor = glow.color;
    ctx.shadowBlur = glow.radius;
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-size / 2, -size / 2, size, size / 3);

    ctx.restore();
  },

  /**
   * Draw background.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W - Canvas width
   * @param {number} H - Canvas height
   * @param {number} scrollX - Current scroll offset
   * @param {number} pct - Progress percentage
   */
  drawBackground(ctx, W, H, scrollX, pct) {
    // Sky gradient that brightens with progress
    const startColor = lerpColor('#1A1A2E', '#4A00E0', pct / 100);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, startColor);
    grad.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars that brighten with progress
    const starAlpha = 0.2 + (pct / 100) * 0.6;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5 + 50) - scrollX * 0.05 * ((i % 3) + 1)) % W;
      const sy = (i * 97.3 + 20) % (H - 120);
      const size = (i % 4 === 0) ? 2 : 1;
      ctx.globalAlpha = starAlpha * (0.3 + (i % 5) * 0.15);
      ctx.fillRect(((sx % W) + W) % W, sy, size, size);
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw the ground.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} groundY
   * @param {number} H
   * @param {number} scrollX
   * @param {number} pct
   */
  drawGround(ctx, W, groundY, H, scrollX, pct) {
    const groundColor = lerpColor('#1A1A2E', '#FFD700', pct / 100 * 0.4);
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Ground line
    ctx.strokeStyle = lerpColor('#333355', '#FFD700', pct / 100 * 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Grid lines on ground
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    const offset = scrollX % gridSpacing;
    for (let gx = -offset; gx < W; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
  },

  /**
   * Draw a spike obstacle.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  /**
   * Draw a block obstacle.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Inner detail
    ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  },

  /**
   * Draw a flying spike obstacle.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.strokeStyle = '#9B30FF';
    ctx.lineWidth = 1.5;
    // Upside-down triangle (hanging from air)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },
};

// ---- Theme: OHIO GAUNTLET ----

const ohioTheme = {
  id: 'ohio',
  name: 'OHIO GAUNTLET',
  scoreLabel: 'OHIO PROGRESS',
  accentColor: '#FF4500',
  groundColor: '#3d2b1f',
  obstacleColor: '#654321',

  deathMessages: [
    'ohio defeated you at N%',
    'N% through ohio. nobody makes it',
    'the corn got you at N%',
    'only in ohio would you die at N%',
    'ohio is not a place. it\'s a state of suffering. N%',
  ],

  getPlayerColor(pct) { return '#FFD700'; },

  getPlayerGlow(pct) { return { color: '#FFD70066', radius: 6 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Corn kernel cube - yellow square
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Corn texture lines
    ctx.strokeStyle = '#CC9900';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size / 4, -size / 2);
    ctx.lineTo(-size / 4, size / 2);
    ctx.moveTo(size / 4, -size / 2);
    ctx.lineTo(size / 4, size / 2);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-size / 2, -size / 2, size, size / 3);

    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    // Ohio purple sky
    const skyTop = lerpColor('#4B0082', '#8B0000', pct / 100);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(0.6, '#2d1b4e');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Corn silhouettes in background
    ctx.fillStyle = '#1a0a2e';
    ctx.globalAlpha = 0.4;
    const cornSpacing = 30;
    const cornOffset = (scrollX * 0.1) % cornSpacing;
    for (let cx = -cornOffset; cx < W + cornSpacing; cx += cornSpacing) {
      const cornH = 60 + Math.sin(cx * 0.1) * 20;
      // Stalk
      ctx.fillRect(cx, H - 120 - cornH, 3, cornH);
      // Leaves
      ctx.beginPath();
      ctx.moveTo(cx + 1, H - 120 - cornH + 10);
      ctx.lineTo(cx + 12, H - 120 - cornH + 20);
      ctx.lineTo(cx + 1, H - 120 - cornH + 25);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  drawGround(ctx, W, groundY, H, scrollX) {
    // Cracked Ohio earth
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, groundY, W, H - groundY);

    ctx.strokeStyle = '#2a1a0f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Cracks
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    const crackSpacing = 60;
    const offset = scrollX % crackSpacing;
    for (let cx = -offset; cx < W; cx += crackSpacing) {
      ctx.beginPath();
      ctx.moveTo(cx, groundY + 5);
      ctx.lineTo(cx + 15, groundY + 25);
      ctx.lineTo(cx + 5, groundY + 40);
      ctx.stroke();
    }
  },

  drawSpike(ctx, x, y, w, h) {
    // Corn spike - green/yellow triangle
    ctx.fillStyle = '#2D5016';
    ctx.strokeStyle = '#4A7C2E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Corn detail
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.6, w / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  drawBlock(ctx, x, y, w, h) {
    // "Welcome to Ohio" sign wall
    ctx.fillStyle = '#654321';
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Sign text
    ctx.fillStyle = '#FF4500';
    ctx.font = 'bold 8px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OHIO', x + w / 2, y + h / 2);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    // Flying deer
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 1;

    // Deer body (rough silhouette)
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antlers
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.7, y + h * 0.3);
    ctx.lineTo(x + w * 0.85, y);
    ctx.moveTo(x + w * 0.75, y + h * 0.15);
    ctx.lineTo(x + w, y + h * 0.1);
    ctx.stroke();
  },
};

// ---- Theme: SIGMA RUN ----

const sigmaTheme = {
  id: 'sigma',
  name: 'SIGMA RUN',
  scoreLabel: 'SIGMA PROGRESS',
  accentColor: '#FF0000',
  groundColor: '#1a1a1a',
  obstacleColor: '#333333',

  deathMessages: [
    'lost focus at N%',
    'the grindset failed at N%',
    'N% sigma. not enough',
    'distracted at N%. back to the grind',
    'the gym closes at N%. you didn\'t make it',
  ],

  getPlayerColor(pct) { return '#1a1a2e'; },

  getPlayerGlow(pct) { return { color: '#FF000044', radius: 6 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Dark hoodie cube
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Hoodie border
    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Glowing red eyes
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 4;
    ctx.fillRect(-size / 4 - 1, -size / 6, 3, 2);
    ctx.fillRect(size / 4 - 2, -size / 6, 3, 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    // Dark gym
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    // Subtle gym wall panels
    ctx.fillStyle = '#141414';
    const panelW = 80;
    const offset = (scrollX * 0.05) % panelW;
    for (let px = -offset; px < W; px += panelW) {
      ctx.fillRect(px, 0, panelW - 2, H - 120);
    }

    // Motivational text in background
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    const phrases = ['GRIND', 'NO DAYS OFF', 'FOCUS', 'SIGMA', 'RISE'];
    const textSpacing = 300;
    const textOffset = scrollX % (textSpacing * phrases.length);
    for (let i = 0; i < phrases.length; i++) {
      const tx = ((i * textSpacing - textOffset) % (textSpacing * phrases.length) + W + textSpacing) % (W + textSpacing * 2) - textSpacing;
      ctx.fillText(phrases[i], tx, H / 2 - 60);
    }
    ctx.globalAlpha = 1;
  },

  drawGround(ctx, W, groundY, H, scrollX) {
    // Treadmill / gym floor
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Treadmill belt lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Belt pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    const beltSpacing = 20;
    const offset = scrollX % beltSpacing;
    for (let bx = -offset; bx < W; bx += beltSpacing) {
      ctx.beginPath();
      ctx.moveTo(bx, groundY + 2);
      ctx.lineTo(bx, H);
      ctx.stroke();
    }
  },

  drawSpike(ctx, x, y, w, h) {
    // Phone spike (distraction)
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Phone screen glow
    ctx.fillStyle = '#4488ff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + w / 2 - 3, y + h * 0.4, 6, 8);
    ctx.globalAlpha = 1;
  },

  drawBlock(ctx, x, y, w, h) {
    // "Touch grass" sign block
    ctx.fillStyle = '#2a2a2a';
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#44dd66';
    ctx.font = 'bold 7px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRASS', x + w / 2, y + h / 2);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    // Party invitation
    ctx.fillStyle = '#ff69b4';
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    // Envelope shape
    ctx.fillRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w / 2, y + h * 0.5);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
};

// ---- Color interpolation helper ----

/**
 * Linearly interpolate between two hex colors.
 *
 * @param {string} c1 - Start hex color
 * @param {string} c2 - End hex color
 * @param {number} t - Interpolation factor 0-1
 * @returns {string} Interpolated hex color
 */
function lerpColor(c1, c2, t) {
  t = Math.max(0, Math.min(1, t));
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ---- Exported theme list ----

export const THEMES = [auraTheme, ohioTheme, sigmaTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
