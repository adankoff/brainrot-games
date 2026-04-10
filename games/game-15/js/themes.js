/**
 * NYAN CAT RUN -- Theme Definitions
 * 3 complete visual themes: nyancat, maxwell, keyboard.
 * Each theme provides draw functions for all game elements.
 */

// ---- NYAN CAT ----

const nyancat = {
  id: 'nyancat',
  name: 'NYAN CAT',
  dataTheme: 'nyancat',
  accentColor: '#ff69b4',

  deathMessages: [
    'nyan nyan nyan... nyan. (dead)',
    'the rainbow ends here',
    'nyan cat has been silenced',
    'pop-tart crumbled',
    'lost in space forever',
    'the nyan fades to black',
  ],

  colors: {
    sky: '#0a0a2e',
    skyGradient: '#060620',
    ground: '#0a0a2e',
    groundAccent: '#0a0a2e',
    groundLine: '#0a0a2e',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Rainbow trail (6 colored horizontal lines trailing left)
    const rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#aa00ff'];
    const trailLen = 40;
    const lineH = 3;
    const trailStartX = x - 4;
    const trailTopY = cy - (rainbowColors.length * lineH) / 2;

    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.fillStyle = rainbowColors[i];
      // Slight wave per line
      const waveOffset = Math.sin(frame * 0.2 + i * 0.5) * 1.5;
      ctx.fillRect(
        trailStartX - trailLen,
        trailTopY + i * lineH + waveOffset,
        trailLen,
        lineH
      );
    }

    // Pop-Tart body (pink rectangle behind cat)
    const tartW = w + 4;
    const tartH = h - 6;
    const tartX = x - 2;
    const tartY = y + 3;

    // Tart crust (tan edge)
    ctx.fillStyle = '#cc9966';
    _roundRect2(ctx, tartX - 2, tartY - 2, tartW + 4, tartH + 4, 4);
    ctx.fill();

    // Tart frosting (pink)
    ctx.fillStyle = '#ff99cc';
    _roundRect2(ctx, tartX, tartY, tartW, tartH, 3);
    ctx.fill();

    // Sprinkles on tart
    const sprinkleColors = ['#ff0066', '#ff3399', '#ff6600', '#ffff00'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
      const sx = tartX + 4 + (i * 5) % (tartW - 6);
      const sy = tartY + 3 + (i * 7) % (tartH - 4);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Cat body (gray, small, centered on tart)
    const catW = 14;
    const catH = 10;
    const catX = cx - catW / 2;
    const catY = tartY - 2;

    // Cat head (gray circle)
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(cx + 6, catY + 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Cat ears (triangles)
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.moveTo(cx + 2, catY - 2);
    ctx.lineTo(cx + 4, catY - 7);
    ctx.lineTo(cx + 6, catY - 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 6, catY - 2);
    ctx.lineTo(cx + 8, catY - 7);
    ctx.lineTo(cx + 10, catY - 2);
    ctx.fill();

    // Inner ears (pink)
    ctx.fillStyle = '#ff99cc';
    ctx.beginPath();
    ctx.moveTo(cx + 3, catY - 2);
    ctx.lineTo(cx + 4, catY - 5);
    ctx.lineTo(cx + 5, catY - 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 7, catY - 2);
    ctx.lineTo(cx + 8, catY - 5);
    ctx.lineTo(cx + 9, catY - 2);
    ctx.fill();

    // Cat eyes
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(cx + 4, catY + 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 8, catY + 2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cat mouth (small :3 shape)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx + 5, catY + 4.5, 1.5, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 7, catY + 4.5, 1.5, 0, Math.PI);
    ctx.stroke();

    // Cheeks (pink blush)
    ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
    ctx.beginPath();
    ctx.arc(cx + 2, catY + 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 10, catY + 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cat legs (tiny, animated running under the tart)
    const legPhase = Math.sin(frame * 0.35) * 3;
    ctx.fillStyle = '#999999';
    // Front legs
    ctx.fillRect(cx - 4, tartY + tartH - 1, 3, 5 + legPhase);
    ctx.fillRect(cx + 1, tartY + tartH - 1, 3, 5 - legPhase);
    // Back legs
    ctx.fillRect(cx + catW - 6, tartY + tartH - 1, 3, 5 - legPhase);
    ctx.fillRect(cx + catW - 2, tartY + tartH - 1, 3, 5 + legPhase);

    // Cat tail (behind tart left side)
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailWave = Math.sin(frame * 0.15) * 4;
    ctx.moveTo(x - 2, cy - 2);
    ctx.quadraticCurveTo(x - 8, cy - 8 + tailWave, x - 6, cy - 14 + tailWave);
    ctx.stroke();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Space debris / asteroid (gray circle)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Asteroid body
    ctx.fillStyle = '#555566';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = '#444455';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.25, cy + r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.1, cy - r * 0.4, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(200, 200, 220, 0.15)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Dog face (enemy)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Head
    ctx.fillStyle = '#bb8844';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = '#996633';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.8, cy - r * 0.2, r * 0.35, r * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.8, cy - r * 0.2, r * 0.35, r * 0.6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (angry)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrows
    ctx.strokeStyle = '#553311';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.55, cy - r * 0.4);
    ctx.lineTo(cx - r * 0.1, cy - r * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.55, cy - r * 0.4);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.55);
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (barking)
    const mouthOpen = Math.abs(Math.sin(frame * 0.12)) * 3;
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.4, r * 0.3, mouthOpen + 1, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Black hole (dark circle with spiral)
    const cx = x + w / 2;
    const r = Math.min(w, h) / 2.5;
    const holeCy = y + r + 5;

    // Accretion disk glow
    ctx.fillStyle = 'rgba(100, 50, 180, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, holeCy, r * 2, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(140, 60, 220, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, holeCy, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black hole core
    const gradient = ctx.createRadialGradient(cx, holeCy, 0, cx, holeCy, r);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.7, '#0a0020');
    gradient.addColorStop(1, '#1a0040');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, holeCy, r, 0, Math.PI * 2);
    ctx.fill();

    // Spiral lines
    ctx.strokeStyle = 'rgba(160, 80, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.2) {
        const sr = r * 0.2 + (a / (Math.PI * 4)) * r * 0.7;
        const sx = cx + Math.cos(a + i * (Math.PI * 2 / 3)) * sr;
        const sy = holeCy + Math.sin(a + i * (Math.PI * 2 / 3)) * sr * 0.5;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Vertical dark column below
    ctx.fillStyle = 'rgba(10, 0, 30, 0.6)';
    ctx.fillRect(cx - w * 0.3, holeCy + r, w * 0.6, h - (holeCy - y) - r);
  },

  drawCoin(ctx, x, y, r, frame) {
    // Star (yellow 5-pointed)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;
    const pulse = 0.9 + Math.sin(frame * 0.1) * 0.1;
    const starR = r * pulse;

    // Outer glow
    ctx.fillStyle = 'rgba(255, 255, 100, 0.2)';
    ctx.beginPath();
    ctx.arc(x, cy, starR * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Star shape
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const outerX = x + Math.cos(angle) * starR;
      const outerY = cy + Math.sin(angle) * starR;
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);

      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * starR * 0.4;
      const innerY = cy + Math.sin(innerAngle) * starR * 0.4;
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    // Center shine
    ctx.fillStyle = 'rgba(255, 255, 220, 0.6)';
    ctx.beginPath();
    ctx.arc(x, cy, starR * 0.25, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Dark blue space with white star dots
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#060620');
    grad.addColorStop(0.5, '#0a0a2e');
    grad.addColorStop(1, '#0e0e36');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars (static twinkling)
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 61 + offset * 0.02) % (w + 20)) - 10;
      const sy = (i * 37 + i * i * 3) % h;
      const twinkle = 0.3 + Math.abs(Math.sin(offset * 0.002 + i * 1.7)) * 0.7;
      const size = (i % 3 === 0) ? 2 : 1;

      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle.toFixed(2)})`;
      ctx.fillRect(sx, sy, size, size);
    }

    // Occasional distant nebula wisps
    ctx.fillStyle = 'rgba(100, 50, 180, 0.04)';
    for (let i = 0; i < 3; i++) {
      const nx = ((i * 200 + offset * 0.015) % (w + 200)) - 100;
      const ny = 60 + i * 140;
      ctx.beginPath();
      ctx.ellipse(nx, ny, 80, 25, 0.3 * i, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Distant star clusters and space dust
    ctx.fillStyle = 'rgba(255, 200, 255, 0.03)';
    for (let i = 0; i < 15; i++) {
      const sx = ((i * 47 - offset * 0.08) % (w + 60)) - 30;
      const sy = (i * 53) % (h * 0.7) + 20;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Faint rainbow streak in distance
    const rainbowColors = [
      'rgba(255,0,0,0.02)', 'rgba(255,136,0,0.02)', 'rgba(255,255,0,0.02)',
      'rgba(0,255,0,0.02)', 'rgba(0,136,255,0.02)', 'rgba(170,0,255,0.02)',
    ];
    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.fillStyle = rainbowColors[i];
      const ry = h * 0.4 + i * 6;
      const rx = ((offset * 0.05) % (w + 300)) - 150;
      ctx.fillRect(rx, ry, w * 0.6, 4);
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Nyan cat flies in space -- no visible ground
    // Draw a subtle cosmic horizon line instead
    ctx.fillStyle = 'rgba(10, 10, 46, 0.95)';
    ctx.fillRect(0, groundY, w, groundH);

    // Faint energy line at the boundary
    ctx.fillStyle = 'rgba(100, 50, 180, 0.15)';
    ctx.fillRect(0, groundY, w, 1);

    // Tiny distant stars in "ground" area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
      const gx = ((i * 67 - offset * 0.5) % (w + 20)) - 10;
      const gy = groundY + 10 + (i * 23) % (groundH - 15);
      ctx.fillRect(gx, gy, 1, 1);
    }
  },
};

// ---- MAXWELL CAT ----

const maxwell = {
  id: 'maxwell',
  name: 'MAXWELL CAT',
  dataTheme: 'maxwell',
  accentColor: '#00ff88',

  deathMessages: [
    'the music stopped',
    'maxwell has been outspun',
    'the cat stopped spinning',
    'groove over',
    'bass dropped too hard',
    'the dancefloor wins',
  ],

  colors: {
    sky: '#0a0a15',
    skyGradient: '#050510',
    ground: '#1a1020',
    groundAccent: '#2a1a30',
    groundLine: '#0a0510',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    // Maxwell spinning cat -- white cat silhouette doing horizontal spin
    const cx = x + w / 2;
    const cy = y + h / 2;

    // 4 frames of spin animation
    const spinPhase = Math.floor(frame * 0.2) % 4;

    ctx.save();
    ctx.translate(cx, cy);

    // Body squash/stretch based on spin phase
    let scaleX = 1;
    let bodyColor = '#f0f0f0';

    switch (spinPhase) {
      case 0: // Facing player (wide)
        scaleX = 1;
        break;
      case 1: // Turning (narrow)
        scaleX = 0.3;
        break;
      case 2: // Facing away (wide)
        scaleX = 1;
        break;
      case 3: // Turning back (narrow)
        scaleX = 0.3;
        break;
    }

    ctx.scale(scaleX, 1);

    // Body (oval)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (circle)
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(0, -12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(-5, -16);
    ctx.lineTo(-3, -23);
    ctx.lineTo(0, -16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(3, -23);
    ctx.lineTo(5, -16);
    ctx.fill();

    // Inner ears (pink)
    ctx.fillStyle = '#ffaacc';
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.lineTo(-3, -21);
    ctx.lineTo(-1, -16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -16);
    ctx.lineTo(3, -21);
    ctx.lineTo(4, -16);
    ctx.fill();

    if (scaleX > 0.5) {
      // Face visible during front-facing frames
      // Eyes
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(-3, -12, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -12, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Happy mouth
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, -9, 2.5, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Legs (alternating positions for dance)
    const legFrame = Math.floor(frame * 0.15) % 4;
    ctx.fillStyle = '#e0e0e0';

    const legPositions = [
      [[-7, 12, 4, 8], [3, 12, 4, 8]],        // Standing
      [[-9, 10, 4, 10], [5, 14, 4, 6]],        // Left up
      [[-7, 12, 4, 8], [3, 12, 4, 8]],          // Standing
      [[-5, 14, 4, 6], [7, 10, 4, 10]],         // Right up
    ];

    const legs = legPositions[legFrame];
    ctx.fillRect(legs[0][0], legs[0][1], legs[0][2], legs[0][3]);
    ctx.fillRect(legs[1][0], legs[1][1], legs[1][2], legs[1][3]);

    // Tail (wavy behind)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const tailWave = Math.sin(frame * 0.2) * 5;
    ctx.beginPath();
    ctx.moveTo(8 / scaleX * 0.3, 0);
    ctx.quadraticCurveTo(14 / scaleX * 0.3, -5 + tailWave, 12 / scaleX * 0.3, -12 + tailWave);
    ctx.stroke();

    ctx.restore();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Speaker stack (rectangles)
    const speakerCount = Math.max(1, Math.floor(h / 20));
    const speakerH = h / speakerCount;

    for (let i = 0; i < speakerCount; i++) {
      const sy = y + i * speakerH;

      // Speaker box
      ctx.fillStyle = '#222222';
      ctx.fillRect(x + 1, sy + 1, w - 2, speakerH - 2);

      // Speaker border
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, sy + 1, w - 2, speakerH - 2);

      // Speaker cone (circle)
      const coneCx = x + w / 2;
      const coneCy = sy + speakerH / 2;
      const coneR = Math.min(w, speakerH) * 0.3;

      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(coneCx, coneCy, coneR, 0, Math.PI * 2);
      ctx.fill();

      // Inner cone
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(coneCx, coneCy, coneR * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.arc(coneCx, coneCy, coneR * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Bass drop (shockwave circle)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    const pulse = 0.8 + Math.sin(frame * 0.15) * 0.2;

    // Outer shockwave rings
    for (let i = 3; i >= 0; i--) {
      const ringR = r * (1 + i * 0.3) * pulse;
      ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 - i * 0.03})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Core
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.5, '#00aa55');
    gradient.addColorStop(1, '#004422');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // "BASS" text
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BASS', cx, cy + 2);
    ctx.textAlign = 'left';
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // DJ turntable (rectangle base with circle on top)
    const tableH = h * 0.35;
    const tableY = y + h - tableH;

    // Table/stand
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, tableY, w, tableH);

    // Stand legs
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 3, tableY + tableH * 0.6, 4, tableH * 0.4);
    ctx.fillRect(x + w - 7, tableY + tableH * 0.6, 4, tableH * 0.4);

    // Turntable surface
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 2, tableY, w + 4, 6);

    // Record (circle on top)
    const recordCx = x + w / 2;
    const recordCy = tableY - 2;
    const recordR = Math.min(w * 0.45, 18);

    // Record disc
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(recordCx, recordCy, recordR, 0, Math.PI * 2);
    ctx.fill();

    // Grooves
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(recordCx, recordCy, recordR * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(recordCx, recordCy, recordR * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tonearm
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w - 3, tableY - recordR - 5);
    ctx.lineTo(recordCx + recordR * 0.3, recordCy - recordR * 0.3);
    ctx.stroke();

    // Column from turntable going up
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + w / 2 - 4, y, 8, tableY - y);
  },

  drawCoin(ctx, x, y, r, frame) {
    // Music note (circle + line + flag)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Note head (filled circle)
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(x, cy + r * 0.3, r * 0.7, r * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stem (line going up)
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, cy + r * 0.1);
    ctx.lineTo(x + r * 0.55, cy - r * 1.2);
    ctx.stroke();

    // Flag
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, cy - r * 1.2);
    ctx.quadraticCurveTo(x + r * 1.3, cy - r * 0.8, x + r * 0.55, cy - r * 0.4);
    ctx.fill();

    // Glow
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.beginPath();
    ctx.arc(x, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Dark with colorful pulse waves
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(1, '#0a0a15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Pulse wave rings emanating from bottom center
    const waveCx = w / 2;
    const waveCy = h + 50;
    const waveColors = [
      'rgba(0, 255, 136, 0.03)',
      'rgba(255, 0, 200, 0.03)',
      'rgba(0, 136, 255, 0.03)',
      'rgba(255, 255, 0, 0.03)',
    ];

    for (let i = 0; i < 8; i++) {
      const waveR = 100 + i * 60 + (offset * 0.3) % 60;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(waveCx, waveCy, waveR, Math.PI + 0.3, -0.3);
      ctx.stroke();
    }

    // Floating music symbols (very faint)
    ctx.save();
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.textAlign = 'center';
    const symbols = ['~', '~', '~', '~'];
    for (let i = 0; i < symbols.length; i++) {
      const sx = ((i * 120 + offset * 0.04) % (w + 100)) - 50;
      const sy = 40 + i * 70;
      ctx.fillText(symbols[i], sx, sy);
    }
    ctx.restore();
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Equalizer bars silhouette in distance
    ctx.fillStyle = 'rgba(0, 255, 136, 0.04)';
    const baseY = h * 0.65;
    const barCount = 20;
    const barW = 8;
    const gap = (w + 40) / barCount;

    for (let i = 0; i < barCount; i++) {
      const bx = ((i * gap - offset * 0.15) % (w + 40)) - 20;
      const barH = 20 + Math.abs(Math.sin(offset * 0.01 + i * 0.8)) * 40;
      ctx.fillRect(bx, baseY - barH, barW, barH);
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Disco floor (alternating colored rectangles)
    const tileW = 30;
    const tileH = groundH / 3;
    const discoColors = [
      ['#ff00aa', '#0044ff', '#ffff00', '#00ff88'],
      ['#00ff88', '#ff00aa', '#0044ff', '#ffff00'],
      ['#ffff00', '#00ff88', '#ff00aa', '#0044ff'],
    ];

    for (let row = 0; row < 3; row++) {
      const rowColors = discoColors[row];
      const ty = groundY + row * tileH;
      const startX = -((offset * 1.0) % tileW);

      for (let col = 0; col < Math.ceil(w / tileW) + 2; col++) {
        const tx = startX + col * tileW;
        const colorIdx = (col + row) % rowColors.length;
        const alpha = 0.15 + Math.abs(Math.sin(offset * 0.005 + col * 0.7 + row)) * 0.15;
        ctx.fillStyle = rowColors[colorIdx];
        ctx.globalAlpha = alpha;
        ctx.fillRect(tx, ty, tileW - 1, tileH - 1);
      }
    }
    ctx.globalAlpha = 1;

    // Top edge glow
    ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.fillRect(0, groundY, w, 2);
  },
};

// ---- KEYBOARD CAT ----

const keyboard = {
  id: 'keyboard',
  name: 'KEYBOARD CAT',
  dataTheme: 'keyboard',
  accentColor: '#ff8c00',

  deathMessages: [
    'keyboard cat has left the stage',
    'wrong note at the worst time',
    'the concert is over',
    'played off the stage',
    'encore denied',
    'the audience has left',
  ],

  colors: {
    sky: '#1a0a0a',
    skyGradient: '#100505',
    ground: '#f0f0f0',
    groundAccent: '#222222',
    groundLine: '#cccccc',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    // Orange/tabby cat sitting at keyboard
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Keyboard (small rectangle under cat paws)
    const kbW = w + 2;
    const kbH = 7;
    const kbX = x - 1;
    const kbY = cy + 8;

    // Keyboard base
    ctx.fillStyle = '#333333';
    ctx.fillRect(kbX, kbY, kbW, kbH);

    // Keys (alternating white and dark)
    const keyW = 3;
    for (let i = 0; i < Math.floor(kbW / keyW); i++) {
      const kx = kbX + i * keyW;
      ctx.fillStyle = i % 2 === 0 ? '#f0f0f0' : '#666666';
      ctx.fillRect(kx + 0.5, kbY + 1, keyW - 1, kbH - 2);
    }

    // Playing animation: pressed key highlights
    const pressedKey = Math.floor(frame * 0.2) % Math.floor(kbW / keyW);
    const pressedX = kbX + pressedKey * keyW;
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(pressedX + 0.5, kbY + 1, keyW - 1, kbH - 2);

    // Cat body (orange oval)
    ctx.fillStyle = '#dd7700';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tabby stripes
    ctx.strokeStyle = '#aa5500';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const stripeY = cy - 8 + i * 5;
      ctx.beginPath();
      ctx.moveTo(cx - 6, stripeY);
      ctx.quadraticCurveTo(cx, stripeY - 2, cx + 6, stripeY);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = '#dd7700';
    ctx.beginPath();
    ctx.arc(cx, cy - 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#cc6600';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 18);
    ctx.lineTo(cx - 4, cy - 25);
    ctx.lineTo(cx - 1, cy - 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy - 18);
    ctx.lineTo(cx + 4, cy - 25);
    ctx.lineTo(cx + 6, cy - 18);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 18);
    ctx.lineTo(cx - 4, cy - 23);
    ctx.lineTo(cx - 2, cy - 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 18);
    ctx.lineTo(cx + 4, cy - 23);
    ctx.lineTo(cx + 5, cy - 18);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 15, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 15, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 2.5, cy - 15.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3.5, cy - 15.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Nose (small triangle)
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy - 11.5);
    ctx.lineTo(cx + 1, cy - 11.5);
    ctx.lineTo(cx, cy - 10);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#aa5500';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx - 2, cy - 8.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 2, cy - 8.5);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#aa5500';
    ctx.lineWidth = 0.5;
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 11);
    ctx.lineTo(cx - 14, cy - 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 10);
    ctx.lineTo(cx - 14, cy - 10);
    ctx.stroke();
    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 11);
    ctx.lineTo(cx + 14, cy - 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 10);
    ctx.lineTo(cx + 14, cy - 10);
    ctx.stroke();

    // Front paws on keyboard (animated bouncing)
    const pawBounce = Math.sin(frame * 0.2) * 2;
    ctx.fillStyle = '#dd7700';
    // Left paw
    ctx.beginPath();
    ctx.ellipse(cx - 6, kbY - 1 + pawBounce, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right paw
    ctx.beginPath();
    ctx.ellipse(cx + 6, kbY - 1 - pawBounce, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#dd7700';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const tailWave = Math.sin(frame * 0.12) * 5;
    ctx.beginPath();
    ctx.moveTo(cx + 9, cy + 2);
    ctx.quadraticCurveTo(cx + 18, cy - 5 + tailWave, cx + 15, cy - 15 + tailWave);
    ctx.stroke();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Wrong notes (red X circles)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Red circle
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Darker border
    ctx.strokeStyle = '#991111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // X mark
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const xSize = r * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - xSize, cy - xSize);
    ctx.lineTo(cx + xSize, cy + xSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + xSize, cy - xSize);
    ctx.lineTo(cx - xSize, cy + xSize);
    ctx.stroke();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Tangled cables (wavy lines)
    const cx = x + w / 2;
    const cy = y + h / 2;

    const cableColors = ['#222222', '#444444', '#333333'];
    for (let c = 0; c < cableColors.length; c++) {
      ctx.strokeStyle = cableColors[c];
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const startX = x;
      const startY = y + c * (h / 3);
      ctx.moveTo(startX, startY);

      for (let i = 1; i <= 4; i++) {
        const px = x + (w / 4) * i;
        const py = startY + Math.sin(frame * 0.08 + c * 2 + i) * 8;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Cable connector ends
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(x, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Broken keys (rectangles falling)
    const keyCount = Math.max(2, Math.floor(h / 25));

    for (let i = 0; i < keyCount; i++) {
      const ky = y + i * (h / keyCount);
      const keyH = (h / keyCount) - 3;
      const isBlack = i % 3 === 1;

      // Key body
      ctx.fillStyle = isBlack ? '#222222' : '#f0f0f0';
      ctx.fillRect(x + 2, ky, w - 4, keyH);

      // Key border
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, ky, w - 4, keyH);

      // Crack lines on broken keys
      ctx.strokeStyle = '#cc2222';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, ky + 2);
      ctx.lineTo(x + w * 0.6, ky + keyH - 2);
      ctx.stroke();
    }

    // "Broken" label
    ctx.fillStyle = '#cc2222';
    ctx.font = '6px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BROKEN', x + w / 2, y - 3);
    ctx.textAlign = 'left';
  },

  drawCoin(ctx, x, y, r, frame) {
    // Correct notes (green music notes)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Glow
    ctx.fillStyle = 'rgba(0, 200, 50, 0.15)';
    ctx.beginPath();
    ctx.arc(x, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Note head
    ctx.fillStyle = '#22cc44';
    ctx.beginPath();
    ctx.ellipse(x, cy + r * 0.3, r * 0.7, r * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#22cc44';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, cy + r * 0.1);
    ctx.lineTo(x + r * 0.55, cy - r * 1.2);
    ctx.stroke();

    // Flag
    ctx.fillStyle = '#22cc44';
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, cy - r * 1.2);
    ctx.quadraticCurveTo(x + r * 1.3, cy - r * 0.8, x + r * 0.55, cy - r * 0.4);
    ctx.fill();

    // Check mark inside glow
    ctx.strokeStyle = 'rgba(0, 200, 50, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, cy - r * 0.6);
    ctx.lineTo(x, cy - r * 0.3);
    ctx.lineTo(x + r * 0.5, cy - r * 0.9);
    ctx.stroke();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Stage with curtains - dark red sides, spotlight lighter center
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#100505');
    grad.addColorStop(0.3, '#1a0a0a');
    grad.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Spotlight cone from top center
    const spotGrad = ctx.createRadialGradient(w / 2, -20, 10, w / 2, h * 0.5, h * 0.7);
    spotGrad.addColorStop(0, 'rgba(255, 240, 200, 0.08)');
    spotGrad.addColorStop(0.5, 'rgba(255, 220, 150, 0.03)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, w, h);

    // Left curtain
    ctx.fillStyle = '#4a0a0a';
    for (let i = 0; i < 4; i++) {
      const curtainX = i * 8;
      const curtainW = 12 - i * 2;
      const waveX = Math.sin(offset * 0.001 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(curtainX + waveX, 0);
      ctx.quadraticCurveTo(curtainX + curtainW / 2 + waveX + 3, h * 0.3, curtainX + waveX, h * 0.8);
      ctx.lineTo(curtainX + curtainW + waveX, h * 0.8);
      ctx.quadraticCurveTo(curtainX + curtainW / 2 + waveX - 3, h * 0.25, curtainX + curtainW + waveX, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Right curtain
    for (let i = 0; i < 4; i++) {
      const curtainX = w - (i + 1) * 8;
      const curtainW = 12 - i * 2;
      const waveX = Math.sin(offset * 0.001 + i + 2) * 2;
      ctx.beginPath();
      ctx.moveTo(curtainX + waveX, 0);
      ctx.quadraticCurveTo(curtainX + curtainW / 2 + waveX + 3, h * 0.3, curtainX + waveX, h * 0.8);
      ctx.lineTo(curtainX + curtainW + waveX, h * 0.8);
      ctx.quadraticCurveTo(curtainX + curtainW / 2 + waveX - 3, h * 0.25, curtainX + curtainW + waveX, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Stage lights (small dots at top)
    const lightColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'];
    for (let i = 0; i < lightColors.length; i++) {
      const lx = 60 + i * ((w - 120) / (lightColors.length - 1));
      ctx.fillStyle = lightColors[i];
      ctx.globalAlpha = 0.3 + Math.sin(offset * 0.003 + i * 1.5) * 0.2;
      ctx.beginPath();
      ctx.arc(lx, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Music stands / audience silhouettes in distance
    ctx.fillStyle = '#120808';
    const baseY = h * 0.6;

    // Audience heads
    for (let i = 0; i < 15; i++) {
      const ax = ((i * 35 - offset * 0.1) % (w + 40)) - 20;
      const ay = baseY + (i % 3) * 8;
      const bounce = Math.sin(offset * 0.005 + i * 0.8) * 2;
      ctx.beginPath();
      ctx.arc(ax, ay + bounce, 6, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillRect(ax - 4, ay + 6 + bounce, 8, 10);
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Piano keys pattern (alternating black and white)
    const keyW = 18;
    const startX = -((offset * 1.0) % keyW);

    // White keys background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, groundY, w, groundH);

    // Individual white keys with borders
    for (let i = 0; i < Math.ceil(w / keyW) + 2; i++) {
      const kx = startX + i * keyW;
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(kx, groundY, keyW, groundH);
    }

    // Black keys (on top, shorter)
    const blackKeyH = groundH * 0.55;
    for (let i = 0; i < Math.ceil(w / keyW) + 2; i++) {
      // Skip positions where there's no black key (pattern: skip 3rd and 7th in octave)
      const keyInOctave = ((i % 7) + 7) % 7;
      if (keyInOctave === 2 || keyInOctave === 6) continue;

      const bkx = startX + i * keyW + keyW * 0.65;
      ctx.fillStyle = '#222222';
      ctx.fillRect(bkx, groundY, keyW * 0.7, blackKeyH);
    }

    // Top edge line
    ctx.fillStyle = '#999999';
    ctx.fillRect(0, groundY, w, 2);
  },
};

// ---- Internal Utility ----

/**
 * Draw a filled rounded rectangle.
 */
function _roundRect2(ctx, x, y, w, h, r) {
  ctx.beginPath();
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
  nyancat,
  maxwell,
  keyboard,
};

export const THEME_ORDER = ['nyancat', 'maxwell', 'keyboard'];
