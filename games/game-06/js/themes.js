/**
 * FANUM SNAKE -- Theme Definitions
 * Three swappable meme themes: Fanum Tax, Grimace Snake, Ohio Snake.
 * Each theme provides colors, draw functions, and death messages.
 */

// ---- Shared helpers ----

/**
 * Draw a pulsing glow circle behind a food item.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - Center x
 * @param {number} cy - Center y
 * @param {number} radius - Glow radius
 * @param {string} color - Glow color
 * @param {number} frame - Animation frame counter
 */
function drawGlow(ctx, cx, cy, radius, color, frame) {
  const pulse = 0.4 + Math.sin(frame * 0.08) * 0.2;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ---- Theme: FANUM TAX ----

const fanumTheme = {
  id: 'fanum',
  name: 'FANUM TAX',
  scoreLabel: 'STOLEN BITES',
  accentColor: '#ff6b2b',
  bgColor: '#1a1a2e',
  gridColor: '#2a2a3e',
  scoreColor: '#ff9800',
  hudColor: '#ff9800',

  deathMessages: [
    'you got caught stealing food. fanum tax denied.',
    'tripped over your own stolen pizza. embarrassing.',
    'the food trail was too long. greed is your downfall.',
    'someone noticed their burger was missing.',
    'fanum tax audit complete. you failed.',
  ],

  /**
   * Draw the snake head as an orange circle with grinning mouth and backwards cap.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Grid pixel x
   * @param {number} y - Grid pixel y
   * @param {number} s - Cell size
   * @param {string} dir - 'up'|'down'|'left'|'right'
   */
  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.42;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotate based on direction
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    // Head circle
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Backwards cap (brim faces left since we rotate)
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-r * 0.3, -r * 1.05, r * 1.1, r * 0.35);
    // Cap brim (backwards = left side)
    ctx.fillRect(-r * 0.8, -r * 0.75, r * 0.55, r * 0.2);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.2, r * 0.25, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.28, -r * 0.18, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.28, r * 0.27, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Grinning mouth
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r * 0.15, r * 0.05, r * 0.35, -0.4, 0.4);
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Draw a body segment as a food item. Cycles through 5 food types.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Grid pixel x
   * @param {number} y - Grid pixel y
   * @param {number} s - Cell size
   * @param {number} index - Segment index (0 = closest to head)
   */
  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.35;
    const type = index % 5;

    ctx.save();
    switch (type) {
      case 0: // Pizza slice (triangle)
        ctx.fillStyle = '#ff5252';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx - r, cy + r * 0.8);
        ctx.lineTo(cx + r, cy + r * 0.8);
        ctx.closePath();
        ctx.fill();
        // Cheese dots
        ctx.fillStyle = '#fff176';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1: // Burger (stacked rects)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(cx - r, cy - r * 0.6, r * 2, r * 0.4);
        ctx.fillStyle = '#ffb74d';
        ctx.fillRect(cx - r * 0.9, cy - r * 0.2, r * 1.8, r * 0.35);
        ctx.fillStyle = '#43a047';
        ctx.fillRect(cx - r * 0.95, cy + r * 0.15, r * 1.9, r * 0.2);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(cx - r, cy + r * 0.35, r * 2, r * 0.4);
        break;

      case 2: // Fries (yellow rectangles)
        ctx.fillStyle = '#fff176';
        for (let i = -2; i <= 2; i++) {
          ctx.fillRect(cx + i * r * 0.35 - r * 0.1, cy - r * 0.8, r * 0.2, r * 1.2);
        }
        // Container
        ctx.fillStyle = '#f44336';
        ctx.fillRect(cx - r * 0.6, cy + r * 0.2, r * 1.2, r * 0.5);
        break;

      case 3: // Drink cup (trapezoid)
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.5, cy - r * 0.7);
        ctx.lineTo(cx + r * 0.5, cy - r * 0.7);
        ctx.lineTo(cx + r * 0.4, cy + r * 0.7);
        ctx.lineTo(cx - r * 0.4, cy + r * 0.7);
        ctx.closePath();
        ctx.fill();
        // Straw
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.1, cy - r * 0.7);
        ctx.lineTo(cx + r * 0.2, cy - r * 1.0);
        ctx.stroke();
        break;

      case 4: // Donut (torus)
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Sprinkles
        ctx.fillStyle = '#fff176';
        ctx.fillRect(cx - r * 0.4, cy - r * 0.15, r * 0.15, r * 0.08);
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(cx + r * 0.2, cy - r * 0.35, r * 0.08, r * 0.15);
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(cx + r * 0.1, cy + r * 0.25, r * 0.15, r * 0.08);
        break;
    }
    ctx.restore();
  },

  /**
   * Draw a food pickup: glowing food on a plate.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Grid pixel x
   * @param {number} y - Grid pixel y
   * @param {number} s - Cell size
   * @param {number} frame - Animation frame counter
   */
  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;

    // Glow
    drawGlow(ctx, cx, cy, s * 0.5, '#ff980066', frame);

    // Plate
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.05, s * 0.38, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Food on plate (pizza slice)
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.2);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.15);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff176';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * Draw the background: dark kitchen with subtle grid.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} gridX - Grid area x offset
   * @param {number} gridY - Grid area y offset
   * @param {number} gridW - Grid area width
   * @param {number} gridH - Grid area height
   * @param {number} cellSize - Cell size in px
   * @param {number} cols - Number of columns
   * @param {number} rows - Number of rows
   */
  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    // Full canvas background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 360, 640);

    // Grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) {
      const lx = gridX + c * cellSize;
      ctx.beginPath();
      ctx.moveTo(lx, gridY);
      ctx.lineTo(lx, gridY + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const ly = gridY + r * cellSize;
      ctx.beginPath();
      ctx.moveTo(gridX, ly);
      ctx.lineTo(gridX + gridW, ly);
      ctx.stroke();
    }
  },
};

// ---- Theme: GRIMACE SNAKE ----

const grimaceTheme = {
  id: 'grimace',
  name: 'GRIMACE SNAKE',
  scoreLabel: 'SHAKES CONSUMED',
  accentColor: '#7b1fa2',
  bgColor: '#1a0a1e',
  gridColor: '#2a1a2e',
  scoreColor: '#ce93d8',
  hudColor: '#ce93d8',

  deathMessages: [
    'the grimace shake got you in the end.',
    'you choked on your own cursed trail.',
    'the shake was not worth it. it never was.',
    'grimace consumed himself. poetic.',
    'another one lost to the purple curse.',
  ],

  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.44;

    ctx.save();
    ctx.translate(cx, cy);
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    // Big purple head
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Big white eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.25, r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Tiny pupils (unsettling)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.32, -r * 0.28, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.32, r * 0.32, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Unsettling wide smile
    ctx.strokeStyle = '#e1bee7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r * 0.1, 0, r * 0.4, -0.6, 0.6);
    ctx.stroke();

    ctx.restore();
  },

  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.35;

    // Progressively darker purple
    const darkness = Math.min(index * 8, 80);
    const red = Math.max(123 - darkness, 40);
    const green = Math.max(31 - Math.floor(darkness * 0.4), 0);
    const blue = Math.max(162 - darkness, 60);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

    // Cup body (trapezoid)
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.4, cy + r * 0.7);
    ctx.lineTo(cx - r * 0.4, cy + r * 0.7);
    ctx.closePath();
    ctx.fill();

    // Dome top
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.7, r * 0.5, r * 0.25, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Straw
    ctx.strokeStyle = '#e1bee7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.1, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.25, cy - r * 1.1);
    ctx.stroke();
  },

  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;

    // Purple pulsing glow
    drawGlow(ctx, cx, cy, s * 0.5, '#ce93d866', frame);

    // Milkshake cup
    ctx.fillStyle = '#ce93d8';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, cy - s * 0.25);
    ctx.lineTo(cx + s * 0.2, cy - s * 0.25);
    ctx.lineTo(cx + s * 0.15, cy + s * 0.25);
    ctx.lineTo(cx - s * 0.15, cy + s * 0.25);
    ctx.closePath();
    ctx.fill();

    // Swirl (concentric arcs)
    ctx.strokeStyle = '#f3e5f5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.05, s * 0.05, 0, Math.PI);
    ctx.stroke();

    // Dome
    ctx.fillStyle = '#e1bee7';
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.25, s * 0.2, s * 0.1, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  },

  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    ctx.fillStyle = '#1a0a1e';
    ctx.fillRect(0, 0, 360, 640);

    // Faint golden arches in background
    ctx.strokeStyle = '#3a2a0e';
    ctx.lineWidth = 3;
    // Left arch
    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.quadraticCurveTo(120, 300, 140, 500);
    ctx.stroke();
    // Right arch
    ctx.beginPath();
    ctx.moveTo(220, 500);
    ctx.quadraticCurveTo(240, 300, 260, 500);
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = '#2a1a2e';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) {
      const lx = gridX + c * cellSize;
      ctx.beginPath();
      ctx.moveTo(lx, gridY);
      ctx.lineTo(lx, gridY + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const ly = gridY + r * cellSize;
      ctx.beginPath();
      ctx.moveTo(gridX, ly);
      ctx.lineTo(gridX + gridW, ly);
      ctx.stroke();
    }
  },
};

// ---- Theme: OHIO SNAKE ----

const ohioTheme = {
  id: 'ohio',
  name: 'OHIO SNAKE',
  scoreLabel: 'CORN CONSUMED',
  accentColor: '#ff6b2b',
  bgColor: '#1a2a1a',
  gridColor: '#2a3a2a',
  scoreColor: '#fdd835',
  hudColor: '#fdd835',

  deathMessages: [
    'only in ohio do the cornstalks eat themselves.',
    'ohio is undefeated. even the corn loses.',
    'the ohio curse claimed another crop.',
    'you got lost in the ohio corn maze. forever.',
    'average tuesday in an ohio cornfield.',
  ],

  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;

    ctx.save();
    ctx.translate(cx, cy);
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    const rw = s * 0.3;
    const rh = s * 0.42;

    // Corn cob body (yellow oval)
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kernel bumps (two rows of small circles)
    ctx.fillStyle = '#f9a825';
    for (let row = -1; row <= 1; row += 2) {
      for (let col = -2; col <= 2; col++) {
        ctx.beginPath();
        ctx.arc(row * rw * 0.4, col * rh * 0.25, rw * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Angry eyebrows
    ctx.strokeStyle = '#2e1a00';
    ctx.lineWidth = 2;
    // Top brow
    ctx.beginPath();
    ctx.moveTo(rw * 0.1, -rh * 0.35);
    ctx.lineTo(rw * 0.6, -rh * 0.5);
    ctx.stroke();
    // Bottom brow
    ctx.beginPath();
    ctx.moveTo(rw * 0.1, rh * 0.2);
    ctx.lineTo(rw * 0.6, rh * 0.35);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#2e1a00';
    ctx.beginPath();
    ctx.arc(rw * 0.35, -rh * 0.2, rw * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rw * 0.35, rh * 0.15, rw * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.32;

    // Rounded yellow kernel
    ctx.fillStyle = '#f9a825';
    const rr = r * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx - r + rr, cy - r);
    ctx.arcTo(cx + r, cy - r, cx + r, cy + r, rr);
    ctx.arcTo(cx + r, cy + r, cx - r, cy + r, rr);
    ctx.arcTo(cx - r, cy + r, cx - r, cy - r, rr);
    ctx.arcTo(cx - r, cy - r, cx + r, cy - r, rr);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.2, r * 0.3, r * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;

    // Green radioactive glow
    drawGlow(ctx, cx, cy, s * 0.5, '#76ff0366', frame);

    // Mutant green kernel
    ctx.fillStyle = '#76ff03';
    const r = s * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Radiation lines
    ctx.strokeStyle = '#b2ff59';
    ctx.lineWidth = 1;
    const pulse = Math.sin(frame * 0.1) * 2;
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2;
      const inner = r + 2 + pulse;
      const outer = r + 5 + pulse;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.stroke();
    }
  },

  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, 360, 640);

    // Subtle fog overlay at edges
    const fogGrad = ctx.createLinearGradient(0, gridY, 0, gridY + gridH);
    fogGrad.addColorStop(0, 'rgba(200, 200, 200, 0.04)');
    fogGrad.addColorStop(0.3, 'rgba(200, 200, 200, 0)');
    fogGrad.addColorStop(0.7, 'rgba(200, 200, 200, 0)');
    fogGrad.addColorStop(1, 'rgba(200, 200, 200, 0.04)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(gridX, gridY, gridW, gridH);

    // Grid lines
    ctx.strokeStyle = '#2a3a2a';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) {
      const lx = gridX + c * cellSize;
      ctx.beginPath();
      ctx.moveTo(lx, gridY);
      ctx.lineTo(lx, gridY + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const ly = gridY + r * cellSize;
      ctx.beginPath();
      ctx.moveTo(gridX, ly);
      ctx.lineTo(gridX + gridW, ly);
      ctx.stroke();
    }
  },
};

// ---- Exported theme list ----

export const THEMES = [fanumTheme, grimaceTheme, ohioTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
