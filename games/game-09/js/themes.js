/**
 * SLICE THE BRAINROT -- Theme Definitions
 * Three swappable meme themes: Grimace Shake, Looksmaxxing, Sus.
 * Each theme provides colors, draw functions, death messages, and scoring labels.
 */

// ==========================================================================
// Theme 1: GRIMACE SHAKE SLICE
// ==========================================================================

const grimaceTheme = {
  id: 'grimace',
  name: 'GRIMACE SHAKE SLICE',
  accentColor: '#9B30FF',
  scoreLabel: 'SHAKE POINTS',
  trailColor: '#9B30FF',
  bgColor: '#1A0A1F',
  splatterColor: '#9B30FF',

  deathMessages: [
    'grimace saw what you did. he\'s not happy.',
    'the shake was never just a shake.',
    'ronald is watching. he always was.',
    'the purple stains don\'t wash out. check your hands.',
  ],

  /**
   * Draw a Grimace Shake cup.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - center x
   * @param {number} y - center y
   * @param {number} r - radius
   * @param {number} seed - deterministic variation
   */
  drawObject(ctx, x, y, r, seed) {
    ctx.save();
    ctx.translate(x, y);

    const scale = r / 25;
    ctx.scale(scale, scale);

    // Cup body (trapezoid)
    ctx.fillStyle = '#7B2D8E';
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(-15, 18);
    ctx.lineTo(15, 18);
    ctx.lineTo(12, -18);
    ctx.closePath();
    ctx.fill();

    // Cup lid (dome)
    ctx.fillStyle = '#9B30FF';
    ctx.beginPath();
    ctx.ellipse(0, -18, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Straw
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(3, -24);
    ctx.lineTo(2, -18);
    ctx.stroke();

    // Grimace face
    ctx.fillStyle = '#4B1560';
    // Eyes
    ctx.beginPath();
    ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(0, 4, 5, 0, Math.PI);
    ctx.stroke();

    // Shake drip
    if (seed % 3 === 0) {
      ctx.fillStyle = '#9B30FF';
      ctx.beginPath();
      ctx.ellipse(-8, 20, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Draw the bomb object (Golden Arches).
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    const scale = r / 25;
    ctx.scale(scale, scale);

    // Golden M
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, 16);
    ctx.lineTo(-10, -14);
    ctx.lineTo(0, 4);
    ctx.lineTo(10, -14);
    ctx.lineTo(14, 16);
    ctx.stroke();

    // Glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FFD70088';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, 16);
    ctx.lineTo(-10, -14);
    ctx.lineTo(0, 4);
    ctx.lineTo(10, -14);
    ctx.lineTo(14, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  /**
   * Draw splatter particles (purple stain).
   */
  getSplatterColor() {
    return '#9B30FF';
  },

  /**
   * Draw the background.
   */
  drawBackground(ctx, W, H, timeLeft, totalTime, score) {
    // Gradient: dim McDonald's interior
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1A0A1F');
    grad.addColorStop(0.5, '#2A1530');
    grad.addColorStop(1, '#0F0612');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Glitch effect scales with score
    const glitchLevel = Math.min(score / 80, 1);
    if (glitchLevel > 0.2) {
      ctx.globalAlpha = glitchLevel * 0.06;
      const numLines = Math.floor(glitchLevel * 8);
      for (let i = 0; i < numLines; i++) {
        const ly = ((i * 137 + Date.now() * 0.01) % H);
        ctx.fillStyle = i % 2 === 0 ? '#9B30FF' : '#FF1744';
        ctx.fillRect(0, ly, W, 2);
      }
      ctx.globalAlpha = 1;
    }

    // Dim booth outlines
    ctx.strokeStyle = '#2A1530';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const bx = 40 + i * 140;
      ctx.strokeRect(bx, H - 200, 80, 120);
      ctx.strokeRect(bx + 10, H - 220, 60, 20);
    }

    // Floor
    ctx.fillStyle = '#120810';
    ctx.fillRect(0, H - 60, W, 60);
    ctx.fillStyle = '#1A0E15';
    for (let tx = 0; tx < W; tx += 40) {
      ctx.fillRect(tx, H - 60, 38, 2);
    }
  },

  /** Bomb penalty text */
  bombFlash: "CEASE & DESIST",
};

// ==========================================================================
// Theme 2: LOOKSMAXXING SLASH
// ==========================================================================

const looksmaxxingTheme = {
  id: 'looksmaxxing',
  name: 'LOOKSMAXXING SLASH',
  accentColor: '#C4A265',
  scoreLabel: 'GLOW POINTS',
  trailColor: '#C4A265',
  bgColor: '#0D0D0D',
  splatterColor: '#FFE066',

  deathMessages: [
    'jawline status: could be worse. is worse.',
    'mewing alone can\'t fix this. you need the blade.',
    'glow-up progress: 12%. see you tomorrow.',
    'the mirror called. it wants an apology.',
  ],

  drawObject(ctx, x, y, r, seed) {
    ctx.save();
    ctx.translate(x, y);
    const scale = r / 25;
    ctx.scale(scale, scale);

    const type = seed % 5;

    switch (type) {
      case 0:
        // Crooked jawline (wobbly rectangle)
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.lineTo(-10, -14);
        ctx.lineTo(12, -12);
        ctx.lineTo(16, -6);
        ctx.lineTo(14, 12);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FF6B9D88';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Cross mark
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(6, 6);
        ctx.moveTo(6, -6);
        ctx.lineTo(-6, 6);
        ctx.stroke();
        break;

      case 1:
        // Weak chin (small triangle)
        ctx.fillStyle = '#DDA0A0';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(-12, 10);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0D0D0D';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WEAK', 0, 6);
        break;

      case 2:
        // Unibrow (thick arc)
        ctx.strokeStyle = '#3D2B1F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 4, 16, Math.PI + 0.3, -0.3);
        ctx.stroke();
        // Bushy fill
        ctx.strokeStyle = '#5C3D2E';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 2, 14, Math.PI + 0.4, -0.4);
        ctx.stroke();
        break;

      case 3:
        // Acne (red dots cluster)
        ctx.fillStyle = '#FF3333';
        for (let i = 0; i < 7; i++) {
          const ax = ((i * 7 + seed) % 20) - 10;
          const ay = ((i * 11 + seed) % 20) - 10;
          const ar = 2 + (i % 3);
          ctx.beginPath();
          ctx.arc(ax, ay, ar, 0, Math.PI * 2);
          ctx.fill();
        }
        // White heads
        ctx.fillStyle = '#FFCCCC';
        ctx.beginPath();
        ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(5, 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 4:
        // Bad haircut (messy lines)
        ctx.strokeStyle = '#4A3728';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
          const sx = -12 + i * 3.5;
          const angle = (seed * 0.1 + i * 0.4);
          ctx.beginPath();
          ctx.moveTo(sx, -14);
          ctx.quadraticCurveTo(sx + Math.sin(angle) * 6, 0, sx + Math.cos(angle) * 4, 14);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  },

  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    const scale = r / 25;
    ctx.scale(scale, scale);

    // Perfect jawline (gold outline)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-8, 10);
    ctx.lineTo(0, 14);
    ctx.lineTo(8, 10);
    ctx.lineTo(14, 0);
    ctx.lineTo(12, -14);
    ctx.closePath();
    ctx.stroke();

    // Inner fill
    ctx.fillStyle = '#FFD70033';
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAXED', 0, 2);

    // Glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#FFD70066';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  getSplatterColor() {
    return '#FFE066';
  },

  drawBackground(ctx, W, H, timeLeft, totalTime, score) {
    // Black surgical theater
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, W, H);

    // Surgical light from top
    const lightGrad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 300);
    lightGrad.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
    lightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, W, H);

    // Silhouette face that improves with score
    const progress = Math.min(score / 60, 1);
    ctx.save();
    ctx.translate(W / 2, H / 2 + 50);
    ctx.globalAlpha = 0.08 + progress * 0.04;

    // Head
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(0, -40, 50, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jawline sharpens with progress
    const jawWidth = 50 - progress * 12;
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-jawWidth, -10);
    ctx.lineTo(-jawWidth + 10, 40 + progress * 10);
    ctx.lineTo(0, 50 + progress * 15);
    ctx.lineTo(jawWidth - 10, 40 + progress * 10);
    ctx.lineTo(jawWidth, -10);
    ctx.closePath();
    ctx.fill();

    // Cheekbones appear with progress
    if (progress > 0.3) {
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath();
      ctx.ellipse(-30, -25, 8 * progress, 4, -0.3, 0, Math.PI * 2);
      ctx.ellipse(30, -25, 8 * progress, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Grid lines for clinical feel
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }
  },

  bombFlash: "DON'T SLICE PERFECTION",
};

// ==========================================================================
// Theme 3: SUS SLICE
// ==========================================================================

const CREWMATE_COLORS = [
  '#C51111', '#132ED1', '#117F2D', '#ED54BA',
  '#EF7D0E', '#F5F557', '#3F474E', '#D6E0F0',
  '#6B2FBB', '#71491E',
];

const susTheme = {
  id: 'sus',
  name: 'SUS SLICE',
  accentColor: '#C51111',
  scoreLabel: 'TRUST POINTS',
  trailColor: '#C51111',
  bgColor: '#1B1B2F',
  splatterColor: '#C51111',

  deathMessages: [
    'you were not the imposter. you were the victim.',
    'emergency meeting called. the evidence is you.',
    'kinda sus that you enjoyed that.',
    'vented out of the game.',
  ],

  drawObject(ctx, x, y, r, seed) {
    const color = CREWMATE_COLORS[seed % CREWMATE_COLORS.length];
    ctx.save();
    ctx.translate(x, y);
    const scale = r / 25;
    ctx.scale(scale, scale);

    // Bean body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#82b1ff';
    ctx.beginPath();
    ctx.ellipse(6, -4, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor shine
    ctx.fillStyle = '#aacfff';
    ctx.beginPath();
    ctx.ellipse(8, -6, 3, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Backpack
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(-13, 4, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.beginPath();
    ctx.ellipse(-5, 18, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 18, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw an imposter with fang tell.
   */
  drawImposter(ctx, x, y, r, seed, showTell) {
    // Draw normal crewmate first
    susTheme.drawObject(ctx, x, y, r, seed);

    // Brief fang tell
    if (showTell) {
      ctx.save();
      ctx.translate(x, y);
      const scale = r / 25;
      ctx.scale(scale, scale);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(2, 8);
      ctx.lineTo(0, 14);
      ctx.lineTo(4, 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },

  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    const scale = r / 25;
    ctx.scale(scale, scale);

    // Emergency meeting button -- red circle with white exclamation
    ctx.fillStyle = '#C51111';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Border ring
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Exclamation mark
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5, -10, 5, 12);
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FFFF0044';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  getSplatterColor(seed) {
    return CREWMATE_COLORS[seed % CREWMATE_COLORS.length];
  },

  drawBackground(ctx, W, H, timeLeft, totalTime, score) {
    // Dark space-station interior
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1B1B2F');
    grad.addColorStop(0.5, '#15152A');
    grad.addColorStop(1, '#0E0E1F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Wall panels
    ctx.fillStyle = '#222240';
    ctx.fillRect(0, 0, 12, H);
    ctx.fillRect(W - 12, 0, 12, H);

    // Panel bolts
    ctx.fillStyle = '#333355';
    for (let py = 20; py < H; py += 60) {
      ctx.beginPath();
      ctx.arc(6, py, 2, 0, Math.PI * 2);
      ctx.arc(W - 6, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vent openings
    ctx.fillStyle = '#0A0A1A';
    ctx.strokeStyle = '#2A2A50';
    ctx.lineWidth = 2;
    // Left vent
    ctx.fillRect(0, H * 0.3 - 15, 20, 30);
    ctx.strokeRect(0, H * 0.3 - 15, 20, 30);
    // Right vent
    ctx.fillRect(W - 20, H * 0.7 - 15, 20, 30);
    ctx.strokeRect(W - 20, H * 0.7 - 15, 20, 30);

    // Vent slats
    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 1;
    for (let s = 0; s < 5; s++) {
      const sy = H * 0.3 - 12 + s * 7;
      ctx.beginPath();
      ctx.moveTo(2, sy);
      ctx.lineTo(18, sy);
      ctx.stroke();
      const sy2 = H * 0.7 - 12 + s * 7;
      ctx.beginPath();
      ctx.moveTo(W - 18, sy2);
      ctx.lineTo(W - 2, sy2);
      ctx.stroke();
    }

    // Floor
    ctx.fillStyle = '#181830';
    ctx.fillRect(0, H - 40, W, 40);
    // Floor tiles
    ctx.strokeStyle = '#222245';
    ctx.lineWidth = 1;
    for (let tx = 0; tx < W; tx += 50) {
      ctx.beginPath();
      ctx.moveTo(tx, H - 40);
      ctx.lineTo(tx, H);
      ctx.stroke();
    }

    // Stars visible through a window
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 15; i++) {
      const sx = 30 + (i * 67) % (W - 60);
      const sy = 20 + (i * 43) % 200;
      ctx.beginPath();
      ctx.arc(sx, sy, i % 3 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  bombFlash: "EMERGENCY MEETING!",
};

// ==========================================================================
// Exports
// ==========================================================================

export const THEMES = [grimaceTheme, looksmaxxingTheme, susTheme];

/**
 * Get a theme by id.
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export { CREWMATE_COLORS };
