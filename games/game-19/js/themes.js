/**
 * BACKROOMS ESCAPE -- Theme Definitions
 * 3 horror-themed visual themes: backrooms, fnaf, creepypasta.
 * Each theme provides draw functions for all game elements.
 */

// ---- BACKROOMS ----

const backrooms = {
  id: 'backrooms',
  name: 'BACKROOMS',
  dataTheme: 'backrooms',
  accentColor: '#c4b078',

  deathMessages: [
    'you noclipped into the wrong room',
    'the backrooms go on forever',
    'the humming stopped. that\'s worse.',
    'no one heard you',
    'you became part of the wallpaper',
    'level {score} -- no exit found',
  ],

  colors: {
    sky: '#a09060',
    skyGradient: '#807040',
    ground: '#c4b078',
    groundAccent: '#b0a068',
    groundLine: '#8a7848',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Flashlight cone ahead of player
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffaa';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 8);
    ctx.lineTo(cx + 60, cy - 30);
    ctx.lineTo(cx + 60, cy + 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Brighter inner cone
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffdd';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 6);
    ctx.lineTo(cx + 45, cy - 18);
    ctx.lineTo(cx + 45, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Body (rectangle torso)
    ctx.fillStyle = '#555555';
    ctx.fillRect(cx - 6, cy - 2, 12, 14);

    // Legs (running animation)
    const legPhase = Math.sin(frame * 0.3) * 5;
    ctx.fillStyle = '#444444';
    ctx.fillRect(cx - 5 + legPhase, cy + 12, 4, 8);
    ctx.fillRect(cx + 1 - legPhase, cy + 12, 4, 8);

    // Arms
    const armPhase = Math.cos(frame * 0.25) * 3;
    ctx.fillStyle = '#555555';
    ctx.fillRect(cx - 10, cy - 1 + armPhase, 4, 8);
    // Right arm holding flashlight forward
    ctx.fillRect(cx + 6, cy - 3, 6, 4);

    // Flashlight (small yellow rect)
    ctx.fillStyle = '#cccc44';
    ctx.fillRect(cx + 11, cy - 4, 5, 5);

    // Head (circle)
    ctx.fillStyle = '#d0c0a0';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (scared, wide)
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 9, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 9, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (small worried line)
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 4);
    ctx.lineTo(cx + 2, cy - 4);
    ctx.stroke();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Puddle on the ground (dark brown)
    ctx.fillStyle = '#5a4020';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 4, w / 2, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker inner puddle
    ctx.fillStyle = '#3a2810';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 4, w * 0.35, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slight reflection
    ctx.fillStyle = 'rgba(200, 180, 120, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.4, y + h - 8, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Wall appearing suddenly (beige rectangle)
    ctx.fillStyle = '#b0a068';
    ctx.fillRect(x, y, w, h);

    // Wall texture lines
    ctx.strokeStyle = '#8a7848';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.3);
    ctx.lineTo(x + w, y + h * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.6);
    ctx.lineTo(x + w, y + h * 0.6);
    ctx.stroke();

    // Slight dark edge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x, y, 2, h);
    ctx.fillRect(x + w - 2, y, 2, h);
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Entity: barely visible dark shadow (tall thin rect)
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.random() * 0.1;
    ctx.fillStyle = '#1a1510';
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);

    // Slightly wider at shoulders
    ctx.fillRect(x + w * 0.2, y + h * 0.05, w * 0.6, h * 0.08);

    // Head (small dark circle at top)
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 5, 6, 0, Math.PI * 2);
    ctx.fill();

    // Faint white eyes
    ctx.globalAlpha = 0.2 + Math.random() * 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 3, y + 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w / 2 + 3, y + 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawCoin(ctx, x, y, r, frame) {
    // Exit sign (small green rectangle with EXIT hint)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Green background
    ctx.fillStyle = '#22aa22';
    ctx.fillRect(x - r - 2, cy - r + 1, r * 2 + 4, r * 2 - 2);

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - r - 2, cy - r + 1, r * 2 + 4, r * 2 - 2);

    // EXIT text
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', x, cy + 2);
    ctx.textAlign = 'left';

    // Glow effect
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(frame * 0.1) * 0.08;
    ctx.fillStyle = '#44ff44';
    ctx.beginPath();
    ctx.arc(x, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Fluorescent ceiling with beige walls
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#a09060');
    grad.addColorStop(0.3, '#b0a070');
    grad.addColorStop(1, '#c4b078');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fluorescent light panels on ceiling (yellow-white rects)
    ctx.fillStyle = 'rgba(255, 255, 220, 0.25)';
    for (let i = 0; i < 5; i++) {
      const lx = ((i * 100 + offset * 0.04) % (w + 120)) - 60;
      ctx.fillRect(lx, 10, 60, 12);
    }

    // Light panel glow
    ctx.fillStyle = 'rgba(255, 255, 200, 0.08)';
    for (let i = 0; i < 5; i++) {
      const lx = ((i * 100 + offset * 0.04) % (w + 120)) - 60;
      ctx.fillRect(lx - 5, 5, 70, 22);
    }

    // Occasional flickering panel
    if (Math.random() < 0.03) {
      ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
      const fi = Math.floor(Math.random() * 5);
      const flx = ((fi * 100 + offset * 0.04) % (w + 120)) - 60;
      ctx.fillRect(flx, 10, 60, 12);
    }

    // Wall stains
    ctx.fillStyle = 'rgba(80, 60, 30, 0.08)';
    for (let i = 0; i < 6; i++) {
      const sx = ((i * 80 + offset * 0.02) % (w + 60)) - 30;
      const sy = 60 + (i * 47) % 200;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 10 + i * 3, 8 + i * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Repeating doorways / corridor openings
    ctx.fillStyle = '#8a7848';
    const baseY = h * 0.35;

    for (let i = 0; i < 6; i++) {
      const dx = ((i * 90 - offset * 0.2) % (w + 120)) - 60;
      // Door frame
      ctx.fillStyle = '#7a6838';
      ctx.fillRect(dx, baseY, 35, h * 0.4);
      // Dark interior
      ctx.fillStyle = '#3a3020';
      ctx.fillRect(dx + 3, baseY + 3, 29, h * 0.4 - 3);
    }

    // Baseboard along wall
    ctx.fillStyle = '#6a5828';
    ctx.fillRect(0, h * 0.73, w, 6);
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Yellow-beige carpet with grid lines
    ctx.fillStyle = '#c4b078';
    ctx.fillRect(0, groundY, w, groundH);

    // Grid lines (carpet pattern)
    ctx.strokeStyle = '#b0a068';
    ctx.lineWidth = 1;
    // Vertical lines
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 40 - offset) % (w + 40)) - 20;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx, groundY + groundH);
      ctx.stroke();
    }
    // Horizontal lines
    for (let i = 0; i < 5; i++) {
      const gy = groundY + i * 25;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Top edge (darker line)
    ctx.fillStyle = '#8a7848';
    ctx.fillRect(0, groundY, w, 3);

    // Carpet stains
    ctx.fillStyle = 'rgba(80, 60, 30, 0.12)';
    for (let i = 0; i < 5; i++) {
      const sx = ((i * 95 - offset * 0.8) % (w + 50)) - 25;
      const sy = groundY + 10 + (i * 19) % (groundH - 20);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

// ---- FNAF NIGHT SHIFT ----

const fnaf = {
  id: 'fnaf',
  name: 'FNAF NIGHT SHIFT',
  dataTheme: 'fnaf',
  accentColor: '#8b0000',

  deathMessages: [
    'the animatronics got you',
    'shift terminated at {score}m',
    'freddy says goodnight',
    'you didn\'t make it to 6AM',
    'it\'s me.',
    'the music box stopped playing',
  ],

  colors: {
    sky: '#0a0508',
    skyGradient: '#050305',
    ground: '#1a1a1a',
    groundAccent: '#2a2a2a',
    groundLine: '#0a0a0a',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Flashlight cone
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffcc';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 6);
    ctx.lineTo(cx + 55, cy - 28);
    ctx.lineTo(cx + 55, cy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Security guard body (blue uniform)
    ctx.fillStyle = '#1a2a5a';
    ctx.fillRect(cx - 7, cy - 2, 14, 14);

    // Badge
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.arc(cx - 2, cy + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legPhase = Math.sin(frame * 0.3) * 5;
    ctx.fillStyle = '#151540';
    ctx.fillRect(cx - 5 + legPhase, cy + 12, 4, 8);
    ctx.fillRect(cx + 1 - legPhase, cy + 12, 4, 8);

    // Arms
    ctx.fillStyle = '#1a2a5a';
    const armPhase = Math.cos(frame * 0.25) * 3;
    ctx.fillRect(cx - 11, cy - 1 + armPhase, 4, 8);
    // Flashlight arm
    ctx.fillRect(cx + 7, cy - 3, 5, 4);

    // Flashlight
    ctx.fillStyle = '#888888';
    ctx.fillRect(cx + 11, cy - 4, 5, 5);
    // Flashlight light tip
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(cx + 16, cy - 3, 2, 3);

    // Head (circle)
    ctx.fillStyle = '#d0c0a0';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // Security cap
    ctx.fillStyle = '#1a2a5a';
    ctx.fillRect(cx - 7, cy - 15, 14, 5);
    ctx.fillRect(cx - 9, cy - 11, 18, 3);

    // Eyes (nervous)
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sweat drop
    if (frame % 80 < 40) {
      ctx.fillStyle = '#aaccff';
      ctx.beginPath();
      ctx.arc(cx + 7, cy - 6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Dark zone (very dark patch on ground)
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#050505';
    ctx.fillRect(x, y, w, h);

    // Vent hatch lines
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ly = y + h * 0.2 + i * (h * 0.2);
      ctx.beginPath();
      ctx.moveTo(x + 3, ly);
      ctx.lineTo(x + w - 3, ly);
      ctx.stroke();
    }

    // Vent screws
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(x + 4, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w - 4, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Falling ceiling tile
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.fillStyle = '#888880';
    ctx.fillRect(x, y, w, h);

    // Tile cracks
    ctx.strokeStyle = '#666660';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 3);
    ctx.lineTo(x + w * 0.6, y + h * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 5, y + 5);
    ctx.lineTo(x + w * 0.3, y + h - 3);
    ctx.stroke();

    // Falling dust particles
    ctx.fillStyle = 'rgba(150, 140, 120, 0.4)';
    for (let i = 0; i < 3; i++) {
      const px = x + Math.random() * w;
      const py = y + h + i * 4;
      ctx.fillRect(px, py, 2, 2);
    }
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Animatronic shape (large scary rectangle with red eyes)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x + 4, y, w - 8, h);

    // Wider body
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x, y + h * 0.15, w, h * 0.5);

    // Head area
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 14, 12, 0, Math.PI * 2);
    ctx.fill();

    // Red eyes (glowing)
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x + w / 2 - 5, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w / 2 + 5, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Teeth (grinning mouth)
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + w / 2 - 7, y + 20, 14, 6);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + w / 2 - 6 + i * 3, y + 20, 2, 3);
    }

    // Endoskeleton lines on body
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 30);
    ctx.lineTo(x + w / 2, y + h * 0.6);
    ctx.stroke();
  },

  drawCoin(ctx, x, y, r, frame) {
    // Battery pickup (small yellow rect with + symbol)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Battery body
    ctx.fillStyle = '#44aa44';
    ctx.fillRect(x - r, cy - r + 1, r * 2, r * 2 - 2);

    // Battery top nub
    ctx.fillStyle = '#55bb55';
    ctx.fillRect(x - 2, cy - r - 1, 4, 3);

    // + symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, cy - 3, 2, 6);
    ctx.fillRect(x - 3, cy - 1, 6, 2);

    // Charge glow
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(frame * 0.12) * 0.1;
    ctx.fillStyle = '#44ff44';
    ctx.beginPath();
    ctx.arc(x, cy, r + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Very dark pizzeria corridor
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050305');
    grad.addColorStop(1, '#0a0508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Occasional camera flash
    if (Math.random() < 0.01) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, w, h);
    }

    // Poster frames on wall
    ctx.fillStyle = 'rgba(60, 40, 30, 0.15)';
    for (let i = 0; i < 3; i++) {
      const px = ((i * 160 + offset * 0.03) % (w + 200)) - 100;
      ctx.fillRect(px, 80, 40, 50);
      ctx.strokeStyle = 'rgba(100, 70, 40, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, 80, 40, 50);
    }

    // Stars of Freddy eyes in darkness
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    for (let i = 0; i < 2; i++) {
      const ex = ((i * 200 + offset * 0.015) % (w + 100)) - 50;
      const ey = 100 + i * 80;
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 8, ey, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Dark corridor with doors
    ctx.fillStyle = '#0c0808';
    const baseY = h * 0.4;

    for (let i = 0; i < 5; i++) {
      const dx = ((i * 100 - offset * 0.25) % (w + 120)) - 60;
      // Door frame
      ctx.fillStyle = '#1a1210';
      ctx.fillRect(dx, baseY, 40, h * 0.35);
      // Door
      ctx.fillStyle = '#0a0808';
      ctx.fillRect(dx + 3, baseY + 3, 34, h * 0.35 - 3);
      // Door window (small)
      ctx.fillStyle = '#151010';
      ctx.fillRect(dx + 10, baseY + 8, 20, 15);
    }

    // Wires hanging from ceiling
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const wx = ((i * 110 - offset * 0.15) % (w + 80)) - 40;
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.quadraticCurveTo(wx + 10, 40, wx - 5, 60);
      ctx.stroke();
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Black and white checkered tiles
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, groundY, w, groundH);

    const tileSize = 25;
    for (let row = 0; row < Math.ceil(groundH / tileSize); row++) {
      for (let col = 0; col < Math.ceil(w / tileSize) + 2; col++) {
        const tx = ((col * tileSize - offset) % (w + tileSize * 2)) - tileSize;
        const ty = groundY + row * tileSize;
        if ((col + row) % 2 === 0) {
          ctx.fillStyle = '#2a2a2a';
        } else {
          ctx.fillStyle = '#111111';
        }
        ctx.fillRect(tx, ty, tileSize, tileSize);
      }
    }

    // Top edge
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, groundY, w, 2);
  },
};

// ---- CREEPYPASTA RUN ----

const creepypasta = {
  id: 'creepypasta',
  name: 'CREEPYPASTA RUN',
  dataTheme: 'creepypasta',
  accentColor: '#228b22',

  deathMessages: [
    'you shouldn\'t have done that',
    '8 pages. you found {score}.',
    'the forest always wins',
    'don\'t look behind you (you did)',
    'always watching, no eyes',
    'can you see it?',
  ],

  colors: {
    sky: '#0a1a0a',
    skyGradient: '#050f05',
    ground: '#1a2a10',
    groundAccent: '#2a3a1a',
    groundLine: '#0a1508',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Flashlight cone ahead
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffffaa';
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 6);
    ctx.lineTo(cx + 50, cy - 25);
    ctx.lineTo(cx + 50, cy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Kid body (small figure)
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(cx - 5, cy - 1, 10, 12);

    // Legs
    const legPhase = Math.sin(frame * 0.3) * 5;
    ctx.fillStyle = '#3344aa';
    ctx.fillRect(cx - 4 + legPhase, cy + 11, 4, 8);
    ctx.fillRect(cx + 0 - legPhase, cy + 11, 4, 8);

    // Shoes
    ctx.fillStyle = '#444444';
    ctx.fillRect(cx - 5 + legPhase, cy + 18, 5, 3);
    ctx.fillRect(cx - 1 - legPhase, cy + 18, 5, 3);

    // Arms
    ctx.fillStyle = '#cc4444';
    const armPhase = Math.cos(frame * 0.25) * 3;
    ctx.fillRect(cx - 9, cy + armPhase, 4, 7);
    // Flashlight arm
    ctx.fillRect(cx + 5, cy - 2, 5, 4);

    // Flashlight
    ctx.fillStyle = '#888888';
    ctx.fillRect(cx + 9, cy - 3, 4, 4);
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(cx + 13, cy - 2, 2, 2);

    // Head (circle, smaller = kid)
    ctx.fillStyle = '#d0c0a0';
    ctx.beginPath();
    ctx.arc(cx, cy - 7, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.arc(cx, cy - 9, 6, Math.PI, 0);
    ctx.fill();

    // Eyes (wide scared)
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 2, cy - 7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // White reflections in eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 2.5, cy - 7.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 1.5, cy - 7.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // BEN drowned water puddle
    ctx.fillStyle = '#1a3a4a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 3, w / 2, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ripple
    ctx.strokeStyle = '#2a5a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 3, w * 0.3, h * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Hand reaching out of water
    ctx.fillStyle = '#99bbaa';
    ctx.fillRect(x + w / 2 - 2, y + h * 0.2, 4, h * 0.4);
    // Fingers
    ctx.fillRect(x + w / 2 - 5, y + h * 0.15, 3, 6);
    ctx.fillRect(x + w / 2 - 1, y + h * 0.12, 3, 6);
    ctx.fillRect(x + w / 2 + 3, y + h * 0.15, 3, 6);
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Static patch (TV static rectangle)
    ctx.save();
    // Static noise
    for (let py = 0; py < h; py += 2) {
      for (let px = 0; px < w; px += 2) {
        const v = Math.random() * 255;
        ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
        ctx.fillRect(x + px, y + py, 2, 2);
      }
    }

    // Glitch lines
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x, y + Math.random() * h, w, 1);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x, y + Math.random() * h, w, 1);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(x, y + Math.random() * h, w, 1);
    ctx.restore();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Slenderman (tall thin black rect, white circle face)
    ctx.fillStyle = '#0a0a0a';

    // Thin body
    ctx.fillRect(x + w * 0.35, y + 20, w * 0.3, h - 20);

    // Long arms (tentacle-like, reaching out)
    ctx.fillRect(x, y + 25, w, 4);
    // Arm droop
    ctx.fillRect(x, y + 25, 4, 20);
    ctx.fillRect(x + w - 4, y + 25, 4, 20);

    // Suit (slightly lighter)
    ctx.fillStyle = '#111111';
    ctx.fillRect(x + w * 0.3, y + 20, w * 0.4, h * 0.4);

    // Tie
    ctx.fillStyle = '#220000';
    ctx.fillRect(x + w / 2 - 2, y + 22, 4, 25);

    // Head (white blank face)
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 10, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // No features -- just blank white face
    // Slight shadow for unease
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 12, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawCoin(ctx, x, y, r, frame) {
    // Page (white rectangle -- collecting Slenderman's pages)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;
    const flutter = Math.sin(frame * 0.15) * 2;

    // Paper shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x - r + 2, cy - r + 3, r * 2, r * 2);

    // White page
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x - r + flutter, cy - r, r * 2, r * 2);

    // Text lines on page
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - r + 3 + flutter, cy - r + 3, r * 1.2, 1);
    ctx.fillRect(x - r + 3 + flutter, cy - r + 6, r * 1.4, 1);
    ctx.fillRect(x - r + 3 + flutter, cy - r + 9, r * 1.0, 1);

    // Scrawled symbol
    ctx.strokeStyle = '#330000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + flutter, cy + 2, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + flutter, cy - 1);
    ctx.lineTo(x + flutter, cy + 5);
    ctx.stroke();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Dense dark forest, fog overlay
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050f05');
    grad.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fog overlay
    ctx.fillStyle = 'rgba(100, 120, 100, 0.04)';
    for (let i = 0; i < 4; i++) {
      const fx = ((i * 130 + offset * 0.02) % (w + 200)) - 100;
      const fy = 80 + i * 60;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Occasional eyes in background (pairs of small dots)
    ctx.fillStyle = 'rgba(255, 255, 200, 0.12)';
    for (let i = 0; i < 3; i++) {
      const ex = ((i * 170 + offset * 0.01) % (w + 100)) - 50;
      const ey = 50 + i * 70;
      // Blink randomly
      if ((Math.floor(offset * 0.01) + i) % 7 !== 0) {
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + 6, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Dense tree trunks
    ctx.fillStyle = '#0a120a';
    const baseY = h * 0.3;

    for (let i = 0; i < 12; i++) {
      const tx = ((i * 50 - offset * 0.25) % (w + 80)) - 40;
      const trunkH = 100 + (i * 17) % 80;
      // Trunk
      ctx.fillStyle = '#0a120a';
      ctx.fillRect(tx, baseY, 8, trunkH);

      // Branches
      ctx.fillRect(tx - 10, baseY + 20 + (i * 13) % 30, 28, 3);
      ctx.fillRect(tx - 6, baseY + 50 + (i * 11) % 20, 20, 3);
    }

    // Canopy darkness at top
    ctx.fillStyle = 'rgba(5, 10, 5, 0.5)';
    ctx.fillRect(0, 0, w, baseY + 20);
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Dark forest path (very dark green/black)
    ctx.fillStyle = '#1a2a10';
    ctx.fillRect(0, groundY, w, groundH);

    // Path texture (roots, dirt)
    ctx.strokeStyle = '#0a1508';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const rx = ((i * 60 - offset) % (w + 60)) - 30;
      const ry = groundY + 8 + (i * 11) % (groundH - 15);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(rx + 15, ry - 3, rx + 30, ry + 2);
      ctx.stroke();
    }

    // Fallen leaves
    ctx.fillStyle = '#2a3a1a';
    for (let i = 0; i < 12; i++) {
      const lx = ((i * 45 - offset * 0.9) % (w + 40)) - 20;
      const ly = groundY + 5 + (i * 13) % (groundH - 10);
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4, 2, (i * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Top edge
    ctx.fillStyle = '#0a1508';
    ctx.fillRect(0, groundY, w, 3);

    // Mushrooms
    ctx.fillStyle = '#553322';
    for (let i = 0; i < 4; i++) {
      const mx = ((i * 120 - offset * 0.8) % (w + 50)) - 25;
      // Stem
      ctx.fillRect(mx, groundY - 4, 3, 6);
      // Cap
      ctx.fillStyle = '#884422';
      ctx.beginPath();
      ctx.arc(mx + 1.5, groundY - 5, 4, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#553322';
    }
  },
};

// ---- Internal Utility ----

/**
 * Draw a rounded rectangle path (compatible fallback for ctx.roundRect).
 */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ---- Export ----

export const THEMES = {
  backrooms,
  fnaf,
  creepypasta,
};

export const THEME_ORDER = ['backrooms', 'fnaf', 'creepypasta'];
