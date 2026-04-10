/**
 * ANIME DASH -- Theme Definitions
 * Three anime themes: Dragon Ball, JoJo Menacing, Naruto Run.
 * Each theme provides colors, draw functions, and death messages.
 */

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

/**
 * Linearly interpolate between two RGBA colors.
 *
 * @param {number[]} c1 - [r, g, b, a] 0-255/0-1
 * @param {number[]} c2 - [r, g, b, a] 0-255/0-1
 * @param {number} t - 0-1
 * @returns {string} CSS rgba string
 */
function lerpRgba(c1, c2, t) {
  t = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  const a = c1[3] + (c2[3] - c1[3]) * t;
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

// ---- Theme: DRAGON BALL ----

const dragonBallTheme = {
  id: 'dragonball',
  name: 'DRAGON BALL',
  scoreLabel: 'POWER LEVEL',
  accentColor: '#ffd700',
  groundColor: '#5c3a1e',
  obstacleColor: '#ff6600',

  deathMessages: [
    'power level: insufficient (N%)',
    "it's NOT over 9000 (N%)",
    "senzu bean couldn't save you (N%)",
    'kamehame-ha? more like kamehame-nah (N%)',
    'even krillin lasted longer (N%)',
  ],

  /**
   * Get player color based on progress (transformation tiers).
   * 0-30%: white (base), 30-60%: gold (SSJ), 60-90%: cyan (SSJ Blue), 90%+: silver (UI)
   */
  getPlayerColor(pct) {
    if (pct < 30) return lerpColor('#ffffff', '#ffffff', 0);
    if (pct < 60) return lerpColor('#ffd700', '#ffaa00', (pct - 30) / 30);
    if (pct < 90) return lerpColor('#00e5ff', '#0088ff', (pct - 60) / 30);
    return lerpColor('#c0c0c0', '#f0f0ff', (pct - 90) / 10);
  },

  /**
   * Get aura color for current transformation.
   */
  _getAuraColor(pct) {
    if (pct < 30) return 'rgba(255,255,255,0.3)';
    if (pct < 60) return 'rgba(255,215,0,0.5)';
    if (pct < 90) return 'rgba(0,229,255,0.5)';
    return 'rgba(192,192,192,0.7)';
  },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    ctx.save();

    // Aura glow (pulsing outer ring)
    const auraColor = this._getAuraColor(pct);
    const auraRadius = r + 6 + Math.sin(Date.now() * 0.008) * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fillStyle = auraColor;
    ctx.fill();

    // Secondary aura ring
    if (pct >= 30) {
      const innerAura = r + 3;
      ctx.beginPath();
      ctx.arc(cx, cy, innerAura, 0, Math.PI * 2);
      ctx.fillStyle = auraColor;
      ctx.fill();
    }

    // Main body (circle)
    const bodyColor = this.getPlayerColor(pct);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // SSJ hair spikes (30-60%)
    if (pct >= 30 && pct < 60) {
      ctx.fillStyle = '#ffd700';
      // Draw 3 spike triangles on top
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 5 - 3, cy - r + 2);
        ctx.lineTo(cx + i * 5, cy - r - 10);
        ctx.lineTo(cx + i * 5 + 3, cy - r + 2);
        ctx.closePath();
        ctx.fill();
      }
      // Side spikes
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - 2);
      ctx.lineTo(cx - r - 6, cy - 8);
      ctx.lineTo(cx - r + 2, cy - 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + r, cy - 2);
      ctx.lineTo(cx + r + 6, cy - 8);
      ctx.lineTo(cx + r - 2, cy - 6);
      ctx.closePath();
      ctx.fill();
    }

    // SSJ Blue spikes (60-90%)
    if (pct >= 60 && pct < 90) {
      ctx.fillStyle = '#00e5ff';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 5 - 3, cy - r + 2);
        ctx.lineTo(cx + i * 5, cy - r - 12);
        ctx.lineTo(cx + i * 5 + 3, cy - r + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - 2);
      ctx.lineTo(cx - r - 7, cy - 10);
      ctx.lineTo(cx - r + 2, cy - 7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + r, cy - 2);
      ctx.lineTo(cx + r + 7, cy - 10);
      ctx.lineTo(cx + r - 2, cy - 7);
      ctx.closePath();
      ctx.fill();
    }

    // Ultra Instinct blazing aura (90%+)
    if (pct >= 90) {
      ctx.fillStyle = '#e0e0e0';
      // Taller, sharper spikes
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 4 - 2, cy - r + 2);
        ctx.lineTo(cx + i * 4, cy - r - 14);
        ctx.lineTo(cx + i * 4 + 2, cy - r + 2);
        ctx.closePath();
        ctx.fill();
      }
      // Blazing particles around player
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      for (let i = 0; i < 6; i++) {
        const angle = (Date.now() * 0.003 + i * Math.PI / 3) % (Math.PI * 2);
        const dist = auraRadius + 2;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0f0ff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Eyes (simple dots)
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 3, cy - 1, 2, 2);
    ctx.fillRect(cx + 1, cy - 1, 2, 2);

    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    // Sky transitions: blue -> orange -> purple -> cosmic with progress
    const t = pct / 100;
    let topColor, botColor;
    if (t < 0.33) {
      topColor = lerpColor('#4488cc', '#ff8800', t / 0.33);
      botColor = lerpColor('#88bbee', '#ffcc66', t / 0.33);
    } else if (t < 0.66) {
      const t2 = (t - 0.33) / 0.33;
      topColor = lerpColor('#ff8800', '#6600aa', t2);
      botColor = lerpColor('#ffcc66', '#330066', t2);
    } else {
      const t3 = (t - 0.66) / 0.34;
      topColor = lerpColor('#6600aa', '#0a0020', t3);
      botColor = lerpColor('#330066', '#000010', t3);
    }

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, botColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars appear in cosmic phase (66%+)
    if (pct > 66) {
      const starAlpha = (pct - 66) / 34;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137.5 + 50) - scrollX * 0.03 * ((i % 3) + 1)) % W;
        const sy = (i * 97.3 + 20) % (H - 200);
        ctx.globalAlpha = starAlpha * (0.3 + (i % 5) * 0.15);
        ctx.fillRect(((sx % W) + W) % W, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }

    // Clouds (parallax)
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 5; i++) {
      const cloudX = ((i * 120 + 30) - scrollX * 0.02 * (1 + i * 0.3)) % (W + 80) - 40;
      const cloudY = 60 + i * 50;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 15, cloudY - 5, 15, 0, Math.PI * 2);
      ctx.arc(cloudX + 30, cloudY, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Rocky arena floor
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Ground line
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Crack lines in the arena floor
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    const crackSpacing = 50;
    const offset = scrollX % crackSpacing;
    for (let cx = -offset; cx < W; cx += crackSpacing) {
      ctx.beginPath();
      ctx.moveTo(cx + 10, groundY + 4);
      ctx.lineTo(cx + 25, groundY + 18);
      ctx.lineTo(cx + 15, groundY + 30);
      ctx.lineTo(cx + 30, groundY + 45);
      ctx.stroke();
      // Branching crack
      ctx.beginPath();
      ctx.moveTo(cx + 25, groundY + 18);
      ctx.lineTo(cx + 40, groundY + 22);
      ctx.stroke();
    }

    // Subtle rock texture dots
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    const dotSpacing = 30;
    const dotOff = scrollX % dotSpacing;
    for (let dx = -dotOff; dx < W; dx += dotSpacing) {
      ctx.fillRect(dx + 5, groundY + 10, 3, 2);
      ctx.fillRect(dx + 18, groundY + 25, 2, 3);
    }
  },

  drawSpike(ctx, x, y, w, h) {
    // Energy blast circle (orange)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,140,0,0.3)';
    ctx.fill();

    // Main blast
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8c00';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  drawBlock(ctx, x, y, w, h) {
    // Ki barrier wall (yellow vertical rect)
    ctx.fillStyle = '#ffd700';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Energy crackling lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + h * 0.2);
    ctx.lineTo(x + w / 2, y + h * 0.4);
    ctx.lineTo(x + 3, y + h * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 3, y + h * 0.3);
    ctx.lineTo(x + w / 2, y + h * 0.5);
    ctx.lineTo(x + w - 3, y + h * 0.8);
    ctx.stroke();
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    // Spirit bomb (large circle from above)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.max(w, h) / 2;

    // Outer energy
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100,180,255,0.3)';
    ctx.fill();

    // Main sphere
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const spiritGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    spiritGrad.addColorStop(0, '#ffffff');
    spiritGrad.addColorStop(0.5, '#88ccff');
    spiritGrad.addColorStop(1, '#4488ff');
    ctx.fillStyle = spiritGrad;
    ctx.fill();
  },
};

// ---- Theme: JOJO MENACING ----

const jojoTheme = {
  id: 'jojo',
  name: 'JOJO MENACING',
  scoreLabel: 'MENACING PROGRESS',
  accentColor: '#ffd700',
  groundColor: '#2a2a00',
  obstacleColor: '#ffd700',

  deathMessages: [
    'to be continued... at N%',
    'yare yare daze (N%)',
    'ROAD ROLLER DA! (N%)',
    'kono dio da! ...died at N%',
    'your stand was too weak (N%)',
  ],

  getPlayerColor(pct) {
    return '#1a0033';
  },

  _poseIndex: 0,

  drawPlayer(ctx, x, y, size, rotation, pct) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const s = size;

    ctx.save();

    // Dramatic angular silhouette -- JoJo pose
    // Use rotation to pick pose variation
    const poseId = Math.floor(Math.abs(rotation) / (Math.PI / 2)) % 3;

    ctx.fillStyle = '#1a0033';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;

    // Body base (angular rectangle)
    ctx.save();
    ctx.translate(cx, cy);

    if (poseId === 0) {
      // Pose 1: Standing broad, arm out
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.5);
      ctx.lineTo(s * 0.3, -s * 0.5);
      ctx.lineTo(s * 0.5, -s * 0.1);
      ctx.lineTo(s * 0.4, s * 0.5);
      ctx.lineTo(-s * 0.3, s * 0.5);
      ctx.lineTo(-s * 0.5, s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (poseId === 1) {
      // Pose 2: Leaning back, dramatic
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.55);
      ctx.lineTo(s * 0.4, -s * 0.4);
      ctx.lineTo(s * 0.5, s * 0.2);
      ctx.lineTo(s * 0.2, s * 0.5);
      ctx.lineTo(-s * 0.4, s * 0.5);
      ctx.lineTo(-s * 0.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Pose 3: Power stance
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.55);
      ctx.lineTo(s * 0.2, -s * 0.55);
      ctx.lineTo(s * 0.5, -s * 0.2);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.lineTo(s * 0.1, s * 0.5);
      ctx.lineTo(-s * 0.1, s * 0.5);
      ctx.lineTo(-s * 0.5, s * 0.3);
      ctx.lineTo(-s * 0.5, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // Floating menacing symbols around player
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const time = Date.now() * 0.002;
    for (let i = 0; i < 3; i++) {
      const angle = time + i * (Math.PI * 2 / 3);
      const dist = s * 0.9 + Math.sin(time * 2 + i) * 3;
      const gx = cx + Math.cos(angle) * dist;
      const gy = cy + Math.sin(angle) * dist - 4;
      ctx.globalAlpha = 0.6 + Math.sin(time * 3 + i) * 0.3;
      ctx.fillText('\u30B4', gx, gy);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    // Yellow/gold gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#ffd700');
    grad.addColorStop(0.4, '#cc9900');
    grad.addColorStop(1, '#332200');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Dramatic speed lines radiating from center
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    const centerX = W / 2;
    const centerY = H * 0.4;
    const lineCount = 24;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + scrollX * 0.001;
      const innerR = 40;
      const outerR = Math.max(W, H);
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
      ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
      ctx.stroke();
    }

    // Floating menacing text in background
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    const goSpacing = 200;
    const goOffset = scrollX % goSpacing;
    for (let gx = -goOffset; gx < W + goSpacing; gx += goSpacing) {
      for (let gy = 80; gy < H - 120; gy += 120) {
        ctx.fillText('\u30B4\u30B4\u30B4', gx, gy);
      }
    }
    ctx.globalAlpha = 1;
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Manga floor with speed lines
    ctx.fillStyle = '#2a2a00';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Top border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Speed lines on ground (horizontal, converging toward center)
    ctx.strokeStyle = 'rgba(255,215,0,0.15)';
    ctx.lineWidth = 1;
    const lineSpacing = 8;
    for (let ly = groundY + 4; ly < H; ly += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(W, ly);
      ctx.stroke();
    }

    // Vertical hatching
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    const hatchSpacing = 15;
    const offset = scrollX % hatchSpacing;
    for (let hx = -offset; hx < W; hx += hatchSpacing) {
      ctx.beginPath();
      ctx.moveTo(hx, groundY);
      ctx.lineTo(hx + 5, H);
      ctx.stroke();
    }
  },

  drawSpike(ctx, x, y, w, h) {
    // Walls of menacing text
    ctx.fillStyle = '#1a0033';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;

    // Block base
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Menacing text on spike
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u30B4', x + w / 2, y + h / 2);
  },

  drawBlock(ctx, x, y, w, h) {
    // Arrow projectile (triangle shape embedded in block)
    ctx.fillStyle = '#1a0033';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Arrow detail inside
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(x + 3, y + h / 2);
    ctx.lineTo(x + w - 3, y + h * 0.3);
    ctx.lineTo(x + w - 3, y + h * 0.7);
    ctx.closePath();
    ctx.fill();
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    // Road Roller (large rect falling from above)
    const rw = w + 6;
    const rh = h + 4;
    const rx = x - 3;
    const ry = y - 2;

    ctx.fillStyle = '#555500';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, rw, rh);

    // Roller cylinder detail
    ctx.fillStyle = '#888800';
    ctx.fillRect(rx + 2, ry + 2, rw - 4, 3);
    ctx.fillRect(rx + 2, ry + rh - 5, rw - 4, 3);

    // "ROAD ROLLER" text (tiny)
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RR', rx + rw / 2, ry + rh / 2);
  },
};

// ---- Theme: NARUTO RUN ----

const narutoTheme = {
  id: 'naruto',
  name: 'NARUTO RUN',
  scoreLabel: 'NINJA PROGRESS',
  accentColor: '#ff6600',
  groundColor: '#3d2b1f',
  obstacleColor: '#333333',

  deathMessages: [
    'believe it... died at N%',
    'shadow clone jutsu failed (N%)',
    'dattebayo! ...N%',
    'the talk no jutsu didn\'t work (N%)',
    'ran out of chakra at N%',
  ],

  getPlayerColor(pct) {
    if (pct < 60) return '#ff6600';
    return '#ff8800';
  },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const s = size;

    ctx.save();

    // Chakra cloak at 60%+
    if (pct >= 60) {
      const cloakAlpha = 0.3 + Math.sin(Date.now() * 0.006) * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,140,0,${cloakAlpha})`;
      ctx.fill();

      // Flame wisps
      for (let i = 0; i < 4; i++) {
        const angle = (Date.now() * 0.004 + i * Math.PI / 2) % (Math.PI * 2);
        const dist = s * 0.7;
        const fx = cx + Math.cos(angle) * dist;
        const fy = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,0,0.5)';
        ctx.fill();
      }
    }

    // Naruto run stick figure (body at ~45 degrees, arms behind)
    ctx.translate(cx, cy);

    // Body (tilted forward)
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ff6600';

    // Head (small circle)
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.2, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Headband rect on forehead
    ctx.fillStyle = '#3344aa';
    ctx.fillRect(s * 0.02, -s * 0.34, s * 0.26, s * 0.08);
    // Metal plate
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(s * 0.08, -s * 0.33, s * 0.14, s * 0.06);

    // Body (torso line, tilted forward at ~45 degrees)
    ctx.strokeStyle = pct >= 60 ? '#ff8800' : '#ff6600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.05);
    ctx.lineTo(-s * 0.1, s * 0.25);
    ctx.stroke();

    // Legs (running stride)
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.25);
    ctx.lineTo(s * 0.05, s * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.25);
    ctx.lineTo(-s * 0.25, s * 0.45);
    ctx.stroke();

    // Arms streaming behind (Naruto run signature)
    ctx.beginPath();
    ctx.moveTo(0, s * 0.0);
    ctx.lineTo(-s * 0.4, s * 0.05);
    ctx.lineTo(-s * 0.5, s * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, s * 0.05);
    ctx.lineTo(-s * 0.35, s * 0.15);
    ctx.lineTo(-s * 0.5, s * 0.25);
    ctx.stroke();

    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    // Dense forest background that gets darker with progress
    const t = pct / 100;
    const skyTop = lerpColor('#88bb44', '#223311', t);
    const skyBot = lerpColor('#446622', '#0a1105', t);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Tree silhouettes (parallax layers)
    // Far layer
    ctx.fillStyle = lerpColor('#335522', '#112208', t);
    const treeSpacing1 = 60;
    const treeOff1 = (scrollX * 0.03) % treeSpacing1;
    for (let tx = -treeOff1; tx < W + treeSpacing1; tx += treeSpacing1) {
      // Tree trunk
      ctx.fillRect(tx + 25, H - 250, 8, 130);
      // Canopy (triangle)
      ctx.beginPath();
      ctx.moveTo(tx, H - 200);
      ctx.lineTo(tx + 30, H - 310);
      ctx.lineTo(tx + 60, H - 200);
      ctx.closePath();
      ctx.fill();
    }

    // Near layer
    ctx.fillStyle = lerpColor('#224411', '#0a1105', t);
    const treeSpacing2 = 80;
    const treeOff2 = (scrollX * 0.06) % treeSpacing2;
    for (let tx = -treeOff2; tx < W + treeSpacing2; tx += treeSpacing2) {
      ctx.fillRect(tx + 30, H - 200, 10, 80);
      ctx.beginPath();
      ctx.moveTo(tx + 5, H - 160);
      ctx.lineTo(tx + 35, H - 260);
      ctx.lineTo(tx + 65, H - 160);
      ctx.closePath();
      ctx.fill();
    }

    // Falling leaves
    ctx.fillStyle = lerpColor('#88cc44', '#446622', t);
    const leafCount = 8;
    const time = Date.now() * 0.001;
    for (let i = 0; i < leafCount; i++) {
      const leafX = ((i * 61 + scrollX * 0.1) % W + W) % W;
      const leafY = ((time * 30 + i * 80) % (H - 120));
      const leafSize = 2 + (i % 3);
      ctx.globalAlpha = 0.4 + (i % 3) * 0.15;
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(time + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, leafSize, leafSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Dirt forest path
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Ground line
    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Grass tufts along the top
    ctx.strokeStyle = '#44aa22';
    ctx.lineWidth = 1.5;
    const grassSpacing = 20;
    const grassOff = scrollX % grassSpacing;
    for (let gx = -grassOff; gx < W; gx += grassSpacing) {
      // 3 blades per tuft
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 3, groundY - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx + 3, groundY);
      ctx.lineTo(gx + 3, groundY - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx + 6, groundY);
      ctx.lineTo(gx + 9, groundY - 5);
      ctx.stroke();
    }

    // Dirt texture
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    const dotSpacing = 25;
    const dotOff = scrollX % dotSpacing;
    for (let dx = -dotOff; dx < W; dx += dotSpacing) {
      ctx.fillRect(dx + 5, groundY + 8, 3, 2);
      ctx.fillRect(dx + 15, groundY + 20, 2, 2);
    }
  },

  drawSpike(ctx, x, y, w, h) {
    // Shuriken (spinning 4-pointed star)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    const time = Date.now() * 0.005;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time);

    ctx.fillStyle = '#555555';
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;

    // 4-pointed star
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const nextAngle = ((i + 0.5) / 4) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.lineTo(Math.cos(nextAngle) * r * 0.35, Math.sin(nextAngle) * r * 0.35);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center hole
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();

    ctx.restore();
  },

  drawBlock(ctx, x, y, w, h) {
    // Paper bomb (small rect with explosive tag)
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Kanji-like marking in center (simplified)
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h * 0.2);
    ctx.lineTo(x + w * 0.3, y + h * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h * 0.5);
    ctx.lineTo(x + w * 0.8, y + h * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.7, y + h * 0.2);
    ctx.lineTo(x + w * 0.7, y + h * 0.8);
    ctx.stroke();

    // Tag hanging off bottom
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(x + w / 2 - 3, y + h, 6, 6);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w / 2 - 3, y + h, 6, 6);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    // Rasengan (swirling blue circle)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.max(w, h) / 2;
    const time = Date.now() * 0.004;

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(50,150,255,0.3)';
    ctx.fill();

    // Main sphere
    const rasenGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rasenGrad.addColorStop(0, '#ffffff');
    rasenGrad.addColorStop(0.4, '#88ccff');
    rasenGrad.addColorStop(1, '#2266ff');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rasenGrad;
    ctx.fill();

    // Swirl lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const startAngle = time + (i * Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, startAngle, startAngle + Math.PI * 0.8);
      ctx.stroke();
    }
  },
};

// ---- Exported theme list ----

export const THEMES = [dragonBallTheme, jojoTheme, narutoTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
