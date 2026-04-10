/**
 * BRAINROT NINJA -- Theme Definitions
 * Three swappable meme themes: Skibidi Slicer, Aura Slicer, Fanum Food Fight.
 * Each theme provides drawObject, drawBomb, drawSliceEffect, trailColor,
 * bgDraw, scoreLabel, and deathMessages.
 */

// ---- Theme: SKIBIDI SLICER ----

const skibidiTheme = {
  id: 'skibidi',
  name: 'SKIBIDI SLICER',
  accentColor: '#00e5ff',
  trailColor: '#00e5ff',
  scoreLabel: 'TOILETS SLICED',
  bombLabel: 'CAMERAMAN!',
  deathMessages: [
    "time's up. the toilets remain",
    'you sliced N toilets. the war continues',
  ],

  /**
   * Draw a Skibidi Toilet object (rectangle body + circle head).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - center x
   * @param {number} y - center y
   * @param {number} r - radius
   * @param {number} variant - color variant index
   */
  drawObject(ctx, x, y, r, variant) {
    const colors = ['#00e5ff', '#ff1744', '#ffea00', '#00e676', '#e040fb'];
    const color = colors[variant % colors.length];
    ctx.save();
    ctx.translate(x, y);

    // Toilet body (rectangle)
    ctx.fillStyle = color;
    ctx.fillRect(-r * 0.6, -r * 0.3, r * 1.2, r * 1.1);

    // Toilet rim (ellipse at top of body)
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.3, r * 0.65, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head poking out (circle on top)
    ctx.beginPath();
    ctx.arc(0, -r * 0.65, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#d4a574';
    ctx.fill();

    // Eyes on head
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-r * 0.12, -r * 0.7, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.12, -r * 0.7, r * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw a Cameraman (bomb). Don't slice the cameraman!
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Body
    ctx.fillStyle = '#333';
    ctx.fillRect(-r * 0.5, -r * 0.2, r * 1.0, r * 1.0);

    // Camera head (box)
    ctx.fillStyle = '#222';
    ctx.fillRect(-r * 0.55, -r * 0.75, r * 1.1, r * 0.6);

    // Lens
    ctx.beginPath();
    ctx.arc(0, -r * 0.45, r * 0.25, 0, Math.PI * 2);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fill();

    // Lens glint
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.52, r * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8';
    ctx.fill();

    // Warning indicator
    ctx.fillStyle = '#ff0';
    ctx.font = `bold ${r * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, r * 1.2);

    ctx.restore();
  },

  /**
   * Draw slice particles (blue water splash).
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw dark city ruins background.
   */
  drawBackground(ctx, W, H, time) {
    // Dark gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1a1a3a');
    grad.addColorStop(1, '#0d0d2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 25; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = (i * 97.3 + 30) % (H * 0.5);
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;

    // Ruined buildings silhouette
    ctx.fillStyle = '#111128';
    for (let i = 0; i < 12; i++) {
      const bx = i * 38 - 10;
      const bh = 60 + (i * 31) % 100;
      ctx.fillRect(bx, H - bh, 28, bh);
      // Jagged tops for ruins
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(bx, H - bh);
        ctx.lineTo(bx + 14, H - bh - 15);
        ctx.lineTo(bx + 28, H - bh);
        ctx.fill();
      }
    }

    // Near layer
    ctx.fillStyle = '#1a1a40';
    for (let i = 0; i < 8; i++) {
      const bx = i * 55 - 5;
      const bh = 40 + (i * 47) % 80;
      ctx.fillRect(bx, H - bh, 42, bh);
    }
  },
};

// ---- Theme: AURA SLICER ----

const auraTheme = {
  id: 'aura',
  name: 'AURA SLICER',
  accentColor: '#ffd700',
  trailColor: '#ffd700',
  scoreLabel: 'NEGATIVE AURA SLICED',
  bombLabel: 'POSITIVE AURA!',
  deathMessages: [
    'your aura cleansing is complete',
    'N negative vibes removed',
  ],

  /**
   * Draw a negative aura orb (dark purple/gray with jagged edges).
   */
  drawObject(ctx, x, y, r, variant) {
    const shades = ['#4a0e6b', '#2a1a3a', '#5c2d82', '#3b1a5a', '#6b3fa0'];
    const shade = shades[variant % shades.length];
    ctx.save();
    ctx.translate(x, y);

    // Jagged aura glow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = shade;
    ctx.beginPath();
    const spikes = 10;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const outerR = r * 1.3 + Math.sin(i * 3.7) * r * 0.2;
      const innerR = r * 0.85;
      const midAngle = ((i + 0.5) / spikes) * Math.PI * 2;
      if (i === 0) {
        ctx.moveTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      } else {
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      }
      ctx.lineTo(Math.cos(midAngle) * innerR, Math.sin(midAngle) * innerR);
    }
    ctx.closePath();
    ctx.fill();

    // Core orb
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = shade;
    ctx.fill();

    // Inner dark core
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();

    // Negative symbol
    ctx.strokeStyle = '#ff4444aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, 0);
    ctx.lineTo(r * 0.2, 0);
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Draw a golden positive aura orb (bomb - don't slice!).
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Golden glow
    ctx.globalAlpha = 0.5;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.4);
    glow.addColorStop(0, '#ffd700');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Golden orb
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    // Inner shine
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.15, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8';
    ctx.fill();

    // Plus symbol
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, 0);
    ctx.lineTo(r * 0.25, 0);
    ctx.moveTo(0, -r * 0.25);
    ctx.lineTo(0, r * 0.25);
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Draw purification sparkles.
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.golden ? '#ffd700' : '#ffffff';
      // Star sparkle shape
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle || 0);
      const s = p.size;
      ctx.fillRect(-s / 2, -s * 1.5, s, s * 3);
      ctx.fillRect(-s * 1.5, -s / 2, s * 3, s);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw pure black background with subtle energy waves.
   */
  drawBackground(ctx, W, H, time) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    // Subtle energy waves
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#6b3fa0';
    ctx.lineWidth = 1;
    for (let wave = 0; wave < 5; wave++) {
      ctx.beginPath();
      const baseY = H * 0.2 + wave * H * 0.15;
      for (let wx = 0; wx <= W; wx += 4) {
        const wy = baseY + Math.sin(wx * 0.02 + time * 0.001 + wave) * 20;
        if (wx === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: FANUM FOOD FIGHT ----

const fanumTheme = {
  id: 'fanum',
  name: 'FANUM FOOD FIGHT',
  accentColor: '#ff6600',
  trailColor: '#ff6600',
  scoreLabel: 'FOOD TAXED',
  bombLabel: 'EMPTY PLATE!',
  deathMessages: [
    'fanum tax collection complete',
    'you taxed N items off the table',
  ],

  /**
   * Draw food items (pizza, burger, fries, donut, taco).
   */
  drawObject(ctx, x, y, r, variant) {
    ctx.save();
    ctx.translate(x, y);
    const type = variant % 5;

    switch (type) {
      case 0: // Pizza slice
        ctx.fillStyle = '#e8a030';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.8);
        ctx.lineTo(-r * 0.7, r * 0.7);
        ctx.lineTo(r * 0.7, r * 0.7);
        ctx.closePath();
        ctx.fill();
        // Cheese
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.lineTo(-r * 0.5, r * 0.5);
        ctx.lineTo(r * 0.5, r * 0.5);
        ctx.closePath();
        ctx.fill();
        // Pepperoni
        ctx.fillStyle = '#cc3300';
        ctx.beginPath();
        ctx.arc(-r * 0.1, r * 0.1, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.15, r * 0.35, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1: // Burger
        // Bottom bun
        ctx.fillStyle = '#c8860a';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.7, r * 0.3, 0, 0, Math.PI);
        ctx.fill();
        // Patty
        ctx.fillStyle = '#6b3a1a';
        ctx.fillRect(-r * 0.65, -r * 0.05, r * 1.3, r * 0.25);
        // Lettuce
        ctx.fillStyle = '#55cc33';
        ctx.fillRect(-r * 0.7, -r * 0.15, r * 1.4, r * 0.12);
        // Top bun
        ctx.fillStyle = '#d4960f';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.2, r * 0.7, r * 0.4, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Sesame seeds
        ctx.fillStyle = '#fff8';
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, -r * 0.4, r * 0.06, r * 0.04, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.15, -r * 0.35, r * 0.06, r * 0.04, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 2: // Fries
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-r * 0.5, -r * 0.1, r * 1.0, r * 0.9);
        // Fries sticking out
        ctx.fillStyle = '#ffd740';
        for (let i = -3; i <= 3; i++) {
          const fx = i * r * 0.13;
          const fh = r * 0.4 + Math.abs(i) * r * 0.08;
          ctx.fillRect(fx - r * 0.04, -r * 0.1 - fh, r * 0.08, fh);
        }
        break;

      case 3: // Donut
        ctx.fillStyle = '#d4960f';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        // Icing
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
        ctx.fill();
        // Hole
        ctx.fillStyle = '#c8860a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Sprinkles
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(-r * 0.3, -r * 0.4, r * 0.08, r * 0.15);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(r * 0.2, -r * 0.1, r * 0.08, r * 0.15);
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(-r * 0.1, r * 0.3, r * 0.15, r * 0.06);
        break;

      case 4: // Taco
        // Shell
        ctx.fillStyle = '#e8a030';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.75, r * 0.6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.75, r * 0.2, 0, 0, Math.PI);
        ctx.fill();
        // Fillings
        ctx.fillStyle = '#55cc33';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.55, r * 0.2, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cc3300';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.25, r * 0.4, r * 0.12, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.32, r * 0.3, r * 0.1, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  },

  /**
   * Draw an empty plate (bomb - don't slice!).
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Plate outer
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Plate inner ring
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Plate center
    ctx.fillStyle = '#eee';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.2, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6';
    ctx.fill();

    // Warning text
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${r * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, r * 1.15);

    ctx.restore();
  },

  /**
   * Draw food crumb particles.
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color || '#e8a030';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw kitchen/party background.
   */
  drawBackground(ctx, W, H, time) {
    // Warm gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0f0a');
    grad.addColorStop(0.4, '#2a1a0f');
    grad.addColorStop(1, '#1a0f0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Kitchen tile wall (upper half)
    ctx.fillStyle = '#221810';
    for (let ty = 0; ty < H * 0.5; ty += 30) {
      for (let tx = (Math.floor(ty / 30) % 2) * 15; tx < W; tx += 30) {
        ctx.fillRect(tx + 1, ty + 1, 28, 28);
      }
    }

    // Counter surface
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, H * 0.85, W, H * 0.15);
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(0, H * 0.85, W, 3);
  },
};

// ---- Exported theme list ----

export const THEMES = [skibidiTheme, auraTheme, fanumTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
