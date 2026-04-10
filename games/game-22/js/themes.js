/**
 * ANIME SNAKE -- Theme Definitions
 * Three anime themes: Dragon Ball, JoJo, Naruto.
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

// ---- Theme: DRAGON BALL ----

const dragonballTheme = {
  id: 'dragonball',
  name: 'DRAGON BALL',
  scoreLabel: 'DRAGON BALLS',
  accentColor: '#ffd700',
  bgColor: '#0a2a0a',
  gridColor: '#1a3a1a',
  scoreColor: '#ffd700',
  hudColor: '#ffd700',

  deathMessages: [
    'your power level was too long.',
    'goku ran into himself.',
    'even senzu beans can\'t fix this.',
    'the snake way claimed another warrior.',
  ],

  /**
   * Draw Goku silhouette head: circle with spiky hair (5 triangles), determined dot eyes.
   */
  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.38;

    ctx.save();
    ctx.translate(cx, cy);
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    // Head circle (skin tone)
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Spiky hair -- 5 triangles on top of head (pointing away from face direction)
    ctx.fillStyle = '#1a1a1a';
    const spikeAngles = [-0.6, -0.3, 0, 0.3, 0.6];
    for (const sa of spikeAngles) {
      const baseAngle = Math.PI + sa; // behind the head
      const tipLen = r * 1.6;
      const baseOffset = r * 0.35;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(baseAngle - 0.2) * r * 0.85,
        Math.sin(baseAngle - 0.2) * r * 0.85
      );
      ctx.lineTo(
        Math.cos(baseAngle) * tipLen,
        Math.sin(baseAngle) * tipLen
      );
      ctx.lineTo(
        Math.cos(baseAngle + 0.2) * r * 0.85,
        Math.sin(baseAngle + 0.2) * r * 0.85
      );
      ctx.closePath();
      ctx.fill();
    }

    // Determined dot eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.3, r * 0.25, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Slight frown (determined expression)
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.08);
    ctx.lineTo(r * 0.45, r * 0.08);
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Ki energy orbs -- glowing circles that shift from white to gold as snake grows.
   */
  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.34;

    // Progressive color: white (#ffffff) -> gold (#ffd700)
    // Shift over ~20 segments
    const t = Math.min(index / 20, 1);
    const red = Math.round(255);
    const green = Math.round(255 - t * 40); // 255 -> 215
    const blue = Math.round(255 - t * 255); // 255 -> 0
    const color = `rgb(${red}, ${green}, ${blue})`;

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Core orb
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * Dragon Ball food: orange circle with red stars inside (1-7 cycling).
   */
  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.38;

    // Glow
    drawGlow(ctx, cx, cy, s * 0.55, '#ff980066', frame);

    // Orange sphere
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Highlight arc
    ctx.strokeStyle = '#ffcc80';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.6, -Math.PI * 0.8, -Math.PI * 0.3);
    ctx.stroke();

    // Stars (1-7 cycling based on frame)
    const starCount = (Math.floor(frame / 60) % 7) + 1;
    ctx.fillStyle = '#cc0000';
    const starR = r * 0.12;

    if (starCount === 1) {
      drawStar(ctx, cx, cy, starR);
    } else {
      // Arrange stars in a small circle pattern inside the ball
      const innerR = r * 0.45;
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 - Math.PI / 2;
        const sx = cx + Math.cos(angle) * innerR * (starCount > 3 ? 0.8 : 0.5);
        const sy = cy + Math.sin(angle) * innerR * (starCount > 3 ? 0.8 : 0.5);
        drawStar(ctx, sx, sy, starR);
      }
    }
  },

  /**
   * Planet Namek: green sky, dark green grid.
   */
  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    // Full canvas bg -- dark green
    ctx.fillStyle = '#0a2a0a';
    ctx.fillRect(0, 0, 360, 640);

    // Subtle green sky gradient over grid area
    const grad = ctx.createLinearGradient(0, gridY, 0, gridY + gridH);
    grad.addColorStop(0, 'rgba(0, 100, 0, 0.06)');
    grad.addColorStop(0.5, 'rgba(0, 60, 0, 0.02)');
    grad.addColorStop(1, 'rgba(0, 100, 0, 0.06)');
    ctx.fillStyle = grad;
    ctx.fillRect(gridX, gridY, gridW, gridH);

    // Grid lines
    ctx.strokeStyle = '#1a3a1a';
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

/**
 * Draw a small 4-pointed star shape at the given position.
 */
function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const dist = i % 2 === 0 ? r : r * 0.4;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---- Theme: JOJO ----

const jojoTheme = {
  id: 'jojo',
  name: 'JOJO',
  scoreLabel: 'STAND POWER',
  accentColor: '#7b2ff7',
  bgColor: '#1a1a0a',
  gridColor: '#2a2a1a',
  scoreColor: '#e0b0ff',
  hudColor: '#e0b0ff',

  deathMessages: [
    'your stand turned against you.',
    '\u30B4\u30B4\u30B4... game over \u30B4\u30B4\u30B4',
    'dio would be disappointed.',
    'this is requiem... for your score.',
  ],

  /**
   * JoJo-style head: angular features, dramatic jawline rectangle, star hair decoration.
   */
  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.40;

    ctx.save();
    ctx.translate(cx, cy);
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    // Angular face shape (slightly squared circle)
    ctx.fillStyle = '#e0c8a0';
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.95);
    ctx.lineTo(r * 0.1, -r * 0.95);
    ctx.lineTo(r * 0.5, -r * 0.7);
    ctx.lineTo(r * 0.5, r * 0.7);
    ctx.lineTo(r * 0.1, r * 0.95);
    ctx.lineTo(-r * 0.1, r * 0.95);
    ctx.lineTo(-r * 0.5, r * 0.7);
    ctx.lineTo(-r * 0.5, -r * 0.7);
    ctx.closePath();
    ctx.fill();

    // Dramatic jawline rectangle (chin area, forward-facing)
    ctx.fillStyle = '#d4b896';
    ctx.fillRect(r * 0.3, -r * 0.3, r * 0.25, r * 0.6);

    // Hair (dark, swept back)
    ctx.fillStyle = '#2a1a4a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.95);
    ctx.lineTo(-r * 0.1, -r * 1.1);
    ctx.lineTo(r * 0.1, -r * 1.1);
    ctx.lineTo(-r * 0.5, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.95);
    ctx.lineTo(-r * 0.1, r * 1.1);
    ctx.lineTo(r * 0.1, r * 1.1);
    ctx.lineTo(-r * 0.5, r * 0.7);
    ctx.closePath();
    ctx.fill();

    // Star-shaped hair decoration (gold star on top)
    ctx.fillStyle = '#ffd700';
    const starCx = -r * 0.3;
    const starCy = -r * 0.85;
    const sr = r * 0.25;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const d = i % 2 === 0 ? sr : sr * 0.4;
      const px = starCx + Math.cos(a) * d;
      const py = starCy + Math.sin(a) * d;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Intense eyes (sharp, angular)
    ctx.fillStyle = '#7b2ff7';
    // Upper eye
    ctx.beginPath();
    ctx.moveTo(r * 0.15, -r * 0.4);
    ctx.lineTo(r * 0.45, -r * 0.35);
    ctx.lineTo(r * 0.15, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    // Lower eye
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.2);
    ctx.lineTo(r * 0.45, r * 0.35);
    ctx.lineTo(r * 0.15, r * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  /**
   * Stand energy segments: purple/gold with faint menacing text on longer snakes.
   */
  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.35;

    // Alternate purple and gold
    const isPurple = index % 2 === 0;
    const baseColor = isPurple ? '#7b2ff7' : '#ffd700';
    const fadeColor = isPurple ? '#5a1fc0' : '#ccaa00';

    // Segment body
    const t = Math.min(index / 25, 1);
    ctx.fillStyle = isPurple
      ? `rgb(${123 - Math.floor(t * 40)}, ${47 - Math.floor(t * 15)}, ${247 - Math.floor(t * 60)})`
      : `rgb(${255 - Math.floor(t * 50)}, ${215 - Math.floor(t * 40)}, ${0})`;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Menacing text floating near longer snakes (every 5th segment, starting at 8+)
    if (index >= 8 && index % 5 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${s * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u30B4\u30B4\u30B4', cx, cy);
      ctx.restore();
    }
  },

  /**
   * Stone Mask food: gray crescent shape with red gem dot.
   */
  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.38;

    // Purple glow
    drawGlow(ctx, cx, cy, s * 0.55, '#7b2ff766', frame);

    // Gray crescent mask shape
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Cut out inner circle to create crescent
    ctx.fillStyle = '#1a1a0a';
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Re-fill the main shape more like a mask
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(cx - r * 0.1, cy, r * 0.85, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.closePath();
    ctx.fill();

    // Red gem in center
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(cx - r * 0.1, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Gem highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * Golden/yellow dramatic grid background.
   */
  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    // Dark gold base
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(0, 0, 360, 640);

    // Dramatic diagonal lighting streaks
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffd700';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const offset = i * 80;
      ctx.moveTo(offset, gridY);
      ctx.lineTo(offset + 40, gridY);
      ctx.lineTo(offset + 40 + gridH * 0.3, gridY + gridH);
      ctx.lineTo(offset + gridH * 0.3, gridY + gridH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Grid lines
    ctx.strokeStyle = '#2a2a1a';
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

// ---- Theme: NARUTO ----

const narutoTheme = {
  id: 'naruto',
  name: 'NARUTO',
  scoreLabel: 'RAMEN BOWLS',
  accentColor: '#ff6600',
  bgColor: '#0a1a0a',
  gridColor: '#1a2a1a',
  scoreColor: '#ff6600',
  hudColor: '#ff6600',

  deathMessages: [
    'believe it... you ate yourself.',
    'the shadow clones collided.',
    'naruto run into a wall.',
    'ramen spilled everywhere.',
  ],

  /**
   * Naruto head: circle face, spiky yellow hair triangles, headband rectangle,
   * whisker marks (3 lines on each cheek).
   */
  drawHead(ctx, x, y, s, dir) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.38;

    ctx.save();
    ctx.translate(cx, cy);
    const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    ctx.rotate(angles[dir] || 0);

    // Spiky yellow hair triangles (behind head)
    ctx.fillStyle = '#ffcc00';
    const hairSpikes = [-0.7, -0.35, 0, 0.35, 0.7];
    for (const ha of hairSpikes) {
      const baseAngle = Math.PI + ha;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(baseAngle - 0.18) * r * 0.8,
        Math.sin(baseAngle - 0.18) * r * 0.8
      );
      ctx.lineTo(
        Math.cos(baseAngle) * r * 1.55,
        Math.sin(baseAngle) * r * 1.55
      );
      ctx.lineTo(
        Math.cos(baseAngle + 0.18) * r * 0.8,
        Math.sin(baseAngle + 0.18) * r * 0.8
      );
      ctx.closePath();
      ctx.fill();
    }

    // Face circle (skin tone)
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Headband rectangle (across top of face)
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(-r * 0.85, -r * 0.5, r * 0.5, r * 1.0);
    // Metal plate on headband
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(-r * 0.75, -r * 0.3, r * 0.3, r * 0.6);
    // Leaf symbol scratch (simple line)
    ctx.strokeStyle = '#455a64';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-r * 0.6, 0, r * 0.12, 0, Math.PI * 1.5);
    ctx.stroke();

    // Eyes (blue, determined)
    ctx.fillStyle = '#2196f3';
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.22, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.25, r * 0.22, r * 0.13, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.22, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.3, r * 0.22, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Whisker marks -- 3 lines on each cheek
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 0.8;
    // Top cheek whiskers
    for (let w = -1; w <= 1; w++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.2, -r * 0.55 + w * r * 0.12);
      ctx.lineTo(r * 0.55, -r * 0.55 + w * r * 0.15);
      ctx.stroke();
    }
    // Bottom cheek whiskers
    for (let w = -1; w <= 1; w++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.2, r * 0.55 + w * r * 0.12);
      ctx.lineTo(r * 0.55, r * 0.55 + w * r * 0.15);
      ctx.stroke();
    }

    ctx.restore();
  },

  /**
   * Shadow clone segments: each is a smaller clone that fades in opacity.
   */
  drawSegment(ctx, x, y, s, index) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.34;

    // Progressively fading opacity
    const alpha = Math.max(0.3, 1.0 - index * 0.04);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Small clone body (orange circle = jumpsuit)
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Face hint (skin colored inner circle)
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(cx + r * 0.15, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Tiny hair spikes (just 3 for segments)
    ctx.fillStyle = '#ffcc00';
    for (let i = -1; i <= 1; i++) {
      const angle = Math.PI + i * 0.4;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(angle - 0.15) * r * 0.75,
        cy + Math.sin(angle - 0.15) * r * 0.75
      );
      ctx.lineTo(
        cx + Math.cos(angle) * r * 1.2,
        cy + Math.sin(angle) * r * 1.2
      );
      ctx.lineTo(
        cx + Math.cos(angle + 0.15) * r * 0.75,
        cy + Math.sin(angle + 0.15) * r * 0.75
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Ramen bowl food: circle bowl with wavy noodle lines, chopsticks (two diagonal lines).
   */
  drawFood(ctx, x, y, s, frame) {
    const cx = x + s / 2;
    const cy = y + s / 2;
    const r = s * 0.38;

    // Orange glow
    drawGlow(ctx, cx, cy, s * 0.55, '#ff660066', frame);

    // Bowl (white/cream circle)
    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r, 0, Math.PI * 2);
    ctx.fill();

    // Bowl rim
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r, 0, Math.PI * 2);
    ctx.stroke();

    // Broth (inner yellow-orange circle)
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Wavy noodle lines
    ctx.strokeStyle = '#fff8dc';
    ctx.lineWidth = 1;
    const wave = Math.sin(frame * 0.06) * 1.5;
    for (let n = -1; n <= 1; n++) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + n * r * 0.25 + wave);
      ctx.quadraticCurveTo(cx, cy + n * r * 0.25 - wave, cx + r * 0.5, cy + n * r * 0.25 + wave);
      ctx.stroke();
    }

    // Chopsticks -- two diagonal lines
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1.5;
    // Left chopstick
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx - r * 0.4, cy + r * 0.5);
    ctx.stroke();
    // Right chopstick
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.3, cy - r * 0.8);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.5);
    ctx.stroke();
  },

  /**
   * Hidden Leaf Village: dark green forest grid with floating leaf symbols.
   */
  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    // Dark green forest base
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, 360, 640);

    // Subtle forest gradient
    const grad = ctx.createLinearGradient(0, gridY, 0, gridY + gridH);
    grad.addColorStop(0, 'rgba(0, 80, 0, 0.05)');
    grad.addColorStop(0.5, 'rgba(0, 40, 0, 0.02)');
    grad.addColorStop(1, 'rgba(0, 80, 0, 0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(gridX, gridY, gridW, gridH);

    // Floating leaf symbols (very faint, scattered)
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1;
    // Draw a few leaf spiral symbols scattered across the grid
    const leafPositions = [
      { lx: gridX + 50, ly: gridY + 60 },
      { lx: gridX + 200, ly: gridY + 150 },
      { lx: gridX + 120, ly: gridY + 280 },
      { lx: gridX + 280, ly: gridY + 80 },
      { lx: gridX + 60, ly: gridY + 200 },
    ];
    for (const lp of leafPositions) {
      // Simple leaf swirl (Konoha-inspired)
      ctx.beginPath();
      ctx.arc(lp.lx, lp.ly, 8, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lp.lx, lp.ly - 8);
      ctx.lineTo(lp.lx + 4, lp.ly - 14);
      ctx.stroke();
    }
    ctx.restore();

    // Grid lines
    ctx.strokeStyle = '#1a2a1a';
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

export const THEMES = [dragonballTheme, jojoTheme, narutoTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
