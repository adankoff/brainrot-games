/**
 * YOU DIED -- Theme Definitions
 * Three horror/meme themes: Dark Souls, Backrooms, FNAF.
 * Each theme provides colors, draw functions, and death messages.
 */

// ---- Theme: DARK SOULS ----

const darkSoulsTheme = {
  id: 'darksouls',
  name: 'DARK SOULS',
  scoreLabel: 'SOULS PROGRESS',
  accentColor: '#ff0000',
  groundColor: '#2a2a2a',
  obstacleColor: '#1a1a1a',

  deathMessages: [
    'YOU DIED (N%)',
    'git gud (N%)',
    'try finger but hole (N%)',
    'you lack the required vigor (N%)',
    'bonfire ahead... just kidding (N%)',
  ],

  /**
   * Get player color based on progress percentage.
   *
   * @param {number} pct - Progress 0-100
   * @returns {string} CSS color
   */
  getPlayerColor(pct) {
    return '#555555';
  },

  /**
   * Get player glow color and intensity.
   *
   * @param {number} pct
   * @returns {{ color: string, radius: number }}
   */
  getPlayerGlow(pct) {
    return { color: '#ff440044', radius: 6 };
  },

  /**
   * Draw the player — knight silhouette.
   * Square body with pointed helmet triangle on top, small shield rect on side.
   * Full 360-degree roll on jump.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {number} rotation - Radians
   * @param {number} pct - Progress percentage
   */
  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Body — dark armor square
    ctx.fillStyle = '#444444';
    ctx.fillRect(-size / 2, -size / 4, size, size * 0.75);

    // Helmet — pointed triangle on top
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(-size / 3, -size / 4);
    ctx.lineTo(0, -size / 2 - 4);
    ctx.lineTo(size / 3, -size / 4);
    ctx.closePath();
    ctx.fill();

    // Helmet visor slit
    ctx.fillStyle = '#220000';
    ctx.fillRect(-size / 6, -size / 4 + 2, size / 3, 2);

    // Shield — small rect on left side
    ctx.fillStyle = '#666666';
    ctx.fillRect(-size / 2 - 3, -size / 8, 5, size / 3);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-size / 2 - 3, -size / 8, 5, size / 3);

    // Armor highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-size / 2, -size / 4, size, size / 4);

    ctx.restore();
  },

  /**
   * Draw background — dark castle interior with flickering torchlight and fog.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} H
   * @param {number} scrollX
   * @param {number} pct
   */
  drawBackground(ctx, W, H, scrollX, pct) {
    // Dark castle gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#111111');
    grad.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stone wall texture — vertical lines (pillars)
    ctx.fillStyle = '#161616';
    const pillarSpacing = 100;
    const pillarOffset = (scrollX * 0.03) % pillarSpacing;
    for (let px = -pillarOffset; px < W + pillarSpacing; px += pillarSpacing) {
      ctx.fillRect(px, 0, 12, H - 120);
    }

    // Arched windows (dark castle vibe)
    ctx.fillStyle = '#0c0c18';
    const archSpacing = 200;
    const archOffset = (scrollX * 0.05) % archSpacing;
    for (let ax = -archOffset; ax < W + archSpacing; ax += archSpacing) {
      ctx.beginPath();
      ctx.arc(ax + 25, 120, 20, Math.PI, 0);
      ctx.lineTo(ax + 45, 200);
      ctx.lineTo(ax + 5, 200);
      ctx.closePath();
      ctx.fill();
    }

    // Flickering torch light — subtle orange alpha pulse
    const flicker = 0.03 + Math.sin(scrollX * 0.2) * 0.015 + Math.sin(scrollX * 0.37) * 0.01;
    const torchSpacing = 150;
    const torchOffset = (scrollX * 0.05) % torchSpacing;
    for (let tx = -torchOffset; tx < W + torchSpacing; tx += torchSpacing) {
      const torchGrad = ctx.createRadialGradient(tx, 300, 0, tx, 300, 120);
      torchGrad.addColorStop(0, `rgba(255, 120, 20, ${flicker + 0.04})`);
      torchGrad.addColorStop(1, 'rgba(255, 120, 20, 0)');
      ctx.fillStyle = torchGrad;
      ctx.fillRect(tx - 120, 180, 240, 240);

      // Torch bracket
      ctx.fillStyle = '#333333';
      ctx.fillRect(tx - 2, 270, 4, 20);
      // Flame
      ctx.fillStyle = '#ff6600';
      ctx.globalAlpha = 0.6 + Math.sin(scrollX * 0.3 + tx) * 0.3;
      ctx.beginPath();
      ctx.moveTo(tx - 4, 270);
      ctx.lineTo(tx, 258);
      ctx.lineTo(tx + 4, 270);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Ground-level fog
    ctx.globalAlpha = 0.08 + Math.sin(scrollX * 0.05) * 0.03;
    const fogGrad = ctx.createLinearGradient(0, H - 160, 0, H - 80);
    fogGrad.addColorStop(0, 'rgba(180,180,200,0)');
    fogGrad.addColorStop(0.5, 'rgba(180,180,200,1)');
    fogGrad.addColorStop(1, 'rgba(180,180,200,0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, H - 160, W, 80);
    ctx.globalAlpha = 1;
  },

  /**
   * Draw ground — dark stone castle floor with brick lines.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} groundY
   * @param {number} H
   * @param {number} scrollX
   * @param {number} pct
   */
  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Stone floor
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Ground edge line
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Brick / stone block pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    const brickW = 40;
    const brickH = 15;
    const offset = scrollX % brickW;
    for (let row = 0; row < 8; row++) {
      const rowY = groundY + row * brickH;
      const rowOffset = (row % 2 === 0) ? 0 : brickW / 2;
      for (let bx = -offset - rowOffset; bx < W + brickW; bx += brickW) {
        ctx.strokeRect(bx, rowY, brickW, brickH);
      }
    }
  },

  /**
   * Draw spike — sword spikes (long thin triangles).
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawSpike(ctx, x, y, w, h) {
    // Sword blade — long thin triangle
    ctx.fillStyle = '#888888';
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h);
    ctx.lineTo(x + w / 2, y - 4);
    ctx.lineTo(x + w * 0.7, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crossguard
    ctx.fillStyle = '#555555';
    ctx.fillRect(x, y + h - 4, w, 3);

    // Grip
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x + w / 2 - 2, y + h - 1, 4, 5);
  },

  /**
   * Draw block — boss hand (large rectangle swiping from above).
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawBlock(ctx, x, y, w, h) {
    // Boss hand / gauntlet
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Knuckle lines
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    const segH = h / 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 2, y + segH * i);
      ctx.lineTo(x + w - 2, y + segH * i);
      ctx.stroke();
    }

    // Red glow from within
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  },

  /**
   * Draw flying spike — fire patches (orange wavy shapes).
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawFlyingSpike(ctx, x, y, w, h) {
    // Fire patch — wavy orange shape
    ctx.fillStyle = '#cc4400';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.15, y + h * 0.3);
    ctx.lineTo(x + w * 0.35, y + h * 0.6);
    ctx.lineTo(x + w * 0.5, y);
    ctx.lineTo(x + w * 0.65, y + h * 0.5);
    ctx.lineTo(x + w * 0.85, y + h * 0.2);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // Inner flame
    ctx.fillStyle = '#ff8800';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h);
    ctx.lineTo(x + w * 0.35, y + h * 0.5);
    ctx.lineTo(x + w * 0.5, y + h * 0.3);
    ctx.lineTo(x + w * 0.65, y + h * 0.6);
    ctx.lineTo(x + w * 0.8, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: BACKROOMS ----

const backroomsTheme = {
  id: 'backrooms',
  name: 'BACKROOMS',
  scoreLabel: 'LEVEL PROGRESS',
  accentColor: '#c4b078',
  groundColor: '#8a7a50',
  obstacleColor: '#a09060',

  deathMessages: [
    'you noclipped to the wrong level (N%)',
    'the backrooms consumed you (N%)',
    'level N% — no exit found',
    'the hum got louder at N%',
  ],

  getPlayerColor(pct) {
    return '#dddddd';
  },

  getPlayerGlow(pct) {
    return { color: '#ffff9944', radius: 8 };
  },

  /**
   * Draw player — stick figure with flashlight beam (cone of lighter color ahead).
   */
  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Flashlight beam (cone ahead of player, in unrotated space we draw rightward)
    ctx.save();
    ctx.rotate(-rotation); // undo body rotation so beam always points right
    ctx.translate(-size / 2, -size / 2); // back to top-left origin
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffcc';
    ctx.beginPath();
    ctx.moveTo(size, size * 0.3);
    ctx.lineTo(size + 60, -10);
    ctx.lineTo(size + 60, size + 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffcc';
    ctx.beginPath();
    ctx.moveTo(size, size * 0.35);
    ctx.lineTo(size + 30, size * 0.1);
    ctx.lineTo(size + 30, size * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Stick figure — head
    ctx.fillStyle = '#dddddd';
    ctx.beginPath();
    ctx.arc(0, -size / 4, size / 5, 0, Math.PI * 2);
    ctx.fill();

    // Body line
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size / 4 + size / 5);
    ctx.lineTo(0, size / 4);
    ctx.stroke();

    // Arms (one holding flashlight)
    ctx.beginPath();
    ctx.moveTo(-size / 3, 0);
    ctx.lineTo(size / 3, -size / 8);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, size / 4);
    ctx.lineTo(-size / 4, size / 2);
    ctx.moveTo(0, size / 4);
    ctx.lineTo(size / 4, size / 2);
    ctx.stroke();

    // Flashlight
    ctx.fillStyle = '#888888';
    ctx.fillRect(size / 4, -size / 8 - 2, 5, 4);

    ctx.restore();
  },

  /**
   * Draw background — fluorescent ceiling lights, beige walls, liminal space.
   */
  drawBackground(ctx, W, H, scrollX, pct) {
    // Monotone yellow-beige fill
    ctx.fillStyle = '#b0a060';
    ctx.fillRect(0, 0, W, H);

    // Wall — beige with slight variation
    const wallGrad = ctx.createLinearGradient(0, 0, 0, H);
    wallGrad.addColorStop(0, '#a09050');
    wallGrad.addColorStop(0.3, '#b5a468');
    wallGrad.addColorStop(0.7, '#a89858');
    wallGrad.addColorStop(1, '#8a7a48');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, H);

    // Wallpaper seam lines (subtle vertical lines)
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    const seamSpacing = 60;
    const seamOffset = (scrollX * 0.04) % seamSpacing;
    for (let sx = -seamOffset; sx < W + seamSpacing; sx += seamSpacing) {
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H - 120);
      ctx.stroke();
    }

    // Fluorescent ceiling panels
    const panelSpacing = 80;
    const panelOffset = (scrollX * 0.06) % panelSpacing;
    for (let px = -panelOffset; px < W + panelSpacing; px += panelSpacing) {
      // Panel body
      ctx.fillStyle = '#d4c890';
      ctx.fillRect(px, 8, 50, 14);

      // Light glow
      const flickerAlpha = 0.12 + Math.sin(scrollX * 0.1 + px * 0.3) * 0.04;
      ctx.fillStyle = `rgba(255, 255, 200, ${flickerAlpha})`;
      ctx.fillRect(px + 2, 10, 46, 10);

      // Glow halo below panel
      const haloGrad = ctx.createRadialGradient(px + 25, 15, 0, px + 25, 15, 60);
      haloGrad.addColorStop(0, `rgba(255, 255, 180, ${flickerAlpha * 0.5})`);
      haloGrad.addColorStop(1, 'rgba(255, 255, 180, 0)');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(px - 35, 0, 120, 80);

      // Panel frame
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, 8, 50, 14);
    }

    // Baseboard line near ground
    ctx.fillStyle = '#7a6a40';
    ctx.fillRect(0, H - 130, W, 10);
  },

  /**
   * Draw ground — yellowish carpet with darker grid pattern.
   */
  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Carpet base
    ctx.fillStyle = '#c4b078';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Carpet grid pattern
    ctx.strokeStyle = 'rgba(100, 80, 40, 0.25)';
    ctx.lineWidth = 1;
    const gridSize = 20;
    const offset = scrollX % gridSize;
    for (let gx = -offset; gx < W + gridSize; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = groundY; gy < H; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Ground edge
    ctx.strokeStyle = '#8a7a50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
  },

  /**
   * Draw spike — walls appearing from nowhere (beige rectangles).
   */
  drawSpike(ctx, x, y, w, h) {
    // Beige wall segment
    ctx.fillStyle = '#b5a468';
    ctx.strokeStyle = '#8a7a50';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Wall texture line
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
  },

  /**
   * Draw block — puddles (dark brown rect on ground) or dark entity shapes.
   */
  drawBlock(ctx, x, y, w, h) {
    // Entity / shadow shape — dark, barely visible
    ctx.fillStyle = 'rgba(30, 25, 15, 0.7)';
    ctx.fillRect(x, y, w, h);

    // Faint outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // "Eyes" — two tiny dots
    ctx.fillStyle = 'rgba(200, 200, 150, 0.4)';
    ctx.fillRect(x + w * 0.3, y + h * 0.25, 2, 2);
    ctx.fillRect(x + w * 0.6, y + h * 0.25, 2, 2);
  },

  /**
   * Draw flying spike — entities (dark shadow shapes, barely visible).
   */
  drawFlyingSpike(ctx, x, y, w, h) {
    // Dark shadow entity
    ctx.fillStyle = 'rgba(20, 18, 10, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.3, y);
    ctx.lineTo(x + w * 0.7, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // Faint glowing eyes
    ctx.fillStyle = 'rgba(220, 200, 100, 0.35)';
    ctx.fillRect(x + w * 0.3, y + h * 0.3, 2, 2);
    ctx.fillRect(x + w * 0.6, y + h * 0.3, 2, 2);
  },
};

// ---- Theme: FNAF ----

const fnafTheme = {
  id: 'fnaf',
  name: 'FNAF',
  scoreLabel: 'NIGHT PROGRESS',
  accentColor: '#8b0000',
  groundColor: '#1a1a1a',
  obstacleColor: '#222222',

  deathMessages: [
    'game over. it\'s only N% to 6AM',
    'freddy got you at N%',
    'you didn\'t survive the night (N%)',
    'the animatronics win at N%',
  ],

  getPlayerColor(pct) {
    return '#3344aa';
  },

  getPlayerGlow(pct) {
    return { color: '#ffffff22', radius: 5 };
  },

  /**
   * Draw player — security guard silhouette (circle head, rectangle body, flashlight).
   */
  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Flashlight beam (always forward)
    ctx.save();
    ctx.rotate(-rotation);
    ctx.translate(-size / 2, -size / 2);
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(size, size * 0.3);
    ctx.lineTo(size + 50, -8);
    ctx.lineTo(size + 50, size + 8);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(size, size * 0.35);
    ctx.lineTo(size + 25, size * 0.1);
    ctx.lineTo(size + 25, size * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Guard body — rectangle
    ctx.fillStyle = '#3344aa';
    ctx.fillRect(-size / 3, -size / 6, size * 0.66, size * 0.6);

    // Head — circle
    ctx.fillStyle = '#ddccaa';
    ctx.beginPath();
    ctx.arc(0, -size / 4, size / 5, 0, Math.PI * 2);
    ctx.fill();

    // Security cap
    ctx.fillStyle = '#222266';
    ctx.fillRect(-size / 5, -size / 4 - size / 5, size * 0.4, size / 6);

    // Flashlight in hand
    ctx.fillStyle = '#888888';
    ctx.fillRect(size / 4, 0, 6, 3);
    ctx.fillStyle = '#ffff88';
    ctx.fillRect(size / 4 + 5, 0, 2, 3);

    // Badge
    ctx.fillStyle = '#ccaa00';
    ctx.fillRect(-size / 8, -size / 8, 4, 4);

    ctx.restore();
  },

  /**
   * Draw background — dark pizzeria corridor, time display shifts with progress.
   */
  drawBackground(ctx, W, H, scrollX, pct) {
    // Very dark base
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    // Slight purple-black ambient
    const ambientGrad = ctx.createLinearGradient(0, 0, 0, H);
    ambientGrad.addColorStop(0, '#0a0612');
    ambientGrad.addColorStop(0.5, '#060410');
    ambientGrad.addColorStop(1, '#040308');
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, W, H);

    // Corridor wall panels
    ctx.fillStyle = '#0c0a14';
    const panelW = 70;
    const panelOffset = (scrollX * 0.04) % panelW;
    for (let px = -panelOffset; px < W + panelW; px += panelW) {
      ctx.fillRect(px, 20, panelW - 3, H - 140);
    }

    // Children's drawings on walls (faint)
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#ff4444';
    const drawingSpacing = 180;
    const drawingOffset = (scrollX * 0.06) % drawingSpacing;
    for (let dx = -drawingOffset; dx < W + drawingSpacing; dx += drawingSpacing) {
      // Star shape (child's drawing)
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const outerX = dx + Math.cos(angle) * 15;
        const outerY = 200 + Math.sin(angle) * 15;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        const innerAngle = angle + Math.PI / 5;
        ctx.lineTo(dx + Math.cos(innerAngle) * 7, 200 + Math.sin(innerAngle) * 7);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Time display — 12AM -> 6AM based on progress
    const hour = Math.floor((pct / 100) * 6);
    const timeStr = hour === 0 ? '12 AM' : `${hour} AM`;
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(140, 0, 0, 0.6)';
    ctx.fillText(timeStr, W - 20, 40);

    // Occasional red pinpoint "eyes" in background darkness
    ctx.fillStyle = '#ff0000';
    const eyeSpacing = 250;
    const eyeOffset = (scrollX * 0.08) % eyeSpacing;
    for (let ex = -eyeOffset; ex < W + eyeSpacing; ex += eyeSpacing) {
      const eyeAlpha = 0.15 + Math.sin(scrollX * 0.05 + ex) * 0.1;
      ctx.globalAlpha = Math.max(0, eyeAlpha);
      ctx.fillRect(ex, 280, 3, 2);
      ctx.fillRect(ex + 10, 280, 3, 2);
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw ground — black and white checkered floor (classic FNAF floor).
   */
  drawGround(ctx, W, groundY, H, scrollX, pct) {
    // Checkered pattern
    const tileSize = 20;
    const offset = Math.floor(scrollX / tileSize);
    const subOffset = scrollX % tileSize;

    for (let row = 0; row * tileSize + groundY < H; row++) {
      for (let col = -1; col * tileSize - subOffset < W + tileSize; col++) {
        const worldCol = col + offset;
        const isBlack = (worldCol + row) % 2 === 0;
        ctx.fillStyle = isBlack ? '#1a1a1a' : '#2a2a2a';
        ctx.fillRect(
          col * tileSize - subOffset,
          groundY + row * tileSize,
          tileSize,
          tileSize
        );
      }
    }

    // Ground edge
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
  },

  /**
   * Draw spike — animatronic jumpscare shapes (scary faces appearing suddenly).
   */
  drawSpike(ctx, x, y, w, h) {
    // Animatronic head base
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.2, y);
    ctx.lineTo(x + w * 0.8, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // Eyes — glowing red
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 3;
    ctx.fillRect(x + w * 0.25, y + h * 0.25, 3, 3);
    ctx.fillRect(x + w * 0.6, y + h * 0.25, 3, 3);
    ctx.shadowBlur = 0;

    // Jagged teeth at bottom
    ctx.fillStyle = '#dddddd';
    const teethCount = 3;
    const teethW = w / (teethCount * 2);
    for (let i = 0; i < teethCount; i++) {
      const tx = x + w * 0.2 + i * teethW * 2;
      ctx.beginPath();
      ctx.moveTo(tx, y + h * 0.7);
      ctx.lineTo(tx + teethW / 2, y + h);
      ctx.lineTo(tx + teethW, y + h * 0.7);
      ctx.closePath();
      ctx.fill();
    }
  },

  /**
   * Draw block — falling ceiling tiles / dark zones.
   */
  drawBlock(ctx, x, y, w, h) {
    // Ceiling tile / dark zone
    ctx.fillStyle = '#111111';
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Crack lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 3);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x + w - 3, y + h - 3);
    ctx.stroke();

    // Vent opening appearance
    ctx.fillStyle = '#080808';
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    // Vent slats
    ctx.strokeStyle = '#222222';
    const slatCount = 3;
    for (let i = 1; i <= slatCount; i++) {
      const sy = y + 3 + ((h - 6) / (slatCount + 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x + 5, sy);
      ctx.lineTo(x + w - 5, sy);
      ctx.stroke();
    }
  },

  /**
   * Draw flying spike — animatronic/vent hazard in the air.
   */
  drawFlyingSpike(ctx, x, y, w, h) {
    // Animatronic arm / endoskeleton piece
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 1;

    // Metallic arm shape
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * 0.7, y + h);
    ctx.lineTo(x + w * 0.3, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Joint circle
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Red indicator light
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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

export const THEMES = [darkSoulsTheme, backroomsTheme, fnafTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
