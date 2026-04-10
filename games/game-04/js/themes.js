/**
 * OHIO SURVIVAL RUN -- Theme Definitions
 * 3 complete visual themes: ohio, skibidi, sigma.
 * Each theme provides draw functions for all game elements.
 */

// ---- OHIO SURVIVAL ----

const ohio = {
  id: 'ohio',
  name: 'OHIO SURVIVAL',
  dataTheme: 'ohio',
  accentColor: '#ff6b2b',

  deathMessages: [
    'ohio claimed another one',
    'you didn\'t survive ohio',
    'average ohio monday',
    'only in ohio fr',
    'ohio is undefeated',
    'the ohio curse got you',
  ],

  colors: {
    sky: '#2a1a3a',
    skyGradient: '#1a0a2a',
    ground: '#3d2b1a',
    groundAccent: '#5a4020',
    groundLine: '#2a1a0a',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    // Stick figure, scared expression
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Body (stick)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Torso
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // Legs (running animation)
    const legPhase = Math.sin(frame * 0.3) * 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 8);
    ctx.lineTo(cx - 4 + legPhase, cy + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 8);
    ctx.lineTo(cx + 4 - legPhase, cy + 18);
    ctx.stroke();

    // Arms (flailing)
    const armPhase = Math.cos(frame * 0.25) * 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 2);
    ctx.lineTo(cx - 8, cy - 6 + armPhase);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 2);
    ctx.lineTo(cx + 8, cy - 6 - armPhase);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(cx, cy - 12, 7, 0, Math.PI * 2);
    ctx.fill();

    // Scared eyes (wide open)
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 13, 2, 0, Math.PI * 2);
    ctx.fill();

    // Scared mouth (O shape)
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 2, 0, Math.PI * 2);
    ctx.stroke();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Cursed corn stalk
    ctx.fillStyle = '#4a6b20';
    ctx.fillRect(x + w / 2 - 3, y, 6, h);

    // Corn leaves
    ctx.fillStyle = '#5a8030';
    for (let i = 0; i < 3; i++) {
      const ly = y + h * 0.2 + i * (h * 0.25);
      const dir = i % 2 === 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, ly);
      ctx.quadraticCurveTo(x + w / 2 + dir * 15, ly - 5, x + w / 2 + dir * 20, ly + 5);
      ctx.quadraticCurveTo(x + w / 2 + dir * 10, ly + 3, x + w / 2, ly);
      ctx.fill();
    }

    // Glowing eyes on corn
    ctx.fillStyle = '#ff2020';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 3, y + 8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w / 2 + 3, y + 8, 2, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Ohio portal (purple swirl)
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.05);

    // Outer glow
    ctx.fillStyle = 'rgba(128, 0, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fill();

    // Portal body
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gradient.addColorStop(0, '#200040');
    gradient.addColorStop(0.5, '#6020a0');
    gradient.addColorStop(1, '#a040ff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Swirl lines
    ctx.strokeStyle = '#c080ff';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, angle, angle + Math.PI * 0.8);
      ctx.stroke();
    }

    ctx.restore();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // "Welcome to Ohio" sign
    // Post
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + w / 2 - 3, y, 6, h);

    // Sign board
    const signH = Math.min(40, h * 0.4);
    ctx.fillStyle = '#2a5a00';
    ctx.fillRect(x, y, w, signH);
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, signH);

    // Text
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '7px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WELCOME', x + w / 2, y + signH * 0.4);
    ctx.fillText('TO OHIO', x + w / 2, y + signH * 0.7);
    ctx.textAlign = 'left';
  },

  drawCoin(ctx, x, y, r, frame) {
    // Buckeye (brown circle)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Outer shell
    ctx.fillStyle = '#6b3a1a';
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Light patch
    ctx.fillStyle = '#8b5a2a';
    ctx.beginPath();
    ctx.arc(x, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Purple sky with floating text
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0a2a');
    grad.addColorStop(1, '#2a1a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = 'rgba(200, 180, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 73 + offset * 0.02) % (w + 20)) - 10;
      const sy = (i * 37) % (h * 0.4);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Floating "Only in Ohio" text in clouds
    ctx.save();
    ctx.font = '10px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(160, 120, 200, 0.15)';
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const tx = ((i * 180 + offset * 0.05) % (w + 200)) - 100;
      const ty = 40 + i * 60;
      ctx.fillText('ONLY IN OHIO', tx, ty);
    }
    ctx.restore();
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Cornfield silhouette
    ctx.fillStyle = '#1a1020';
    const baseY = h * 0.6;
    for (let i = 0; i < 30; i++) {
      const cx = ((i * 40 - offset * 0.3) % (w + 80)) - 40;
      const stalkH = 30 + (i * 7) % 40;
      ctx.fillRect(cx, baseY - stalkH, 4, stalkH);
      // Leaf
      ctx.beginPath();
      ctx.moveTo(cx + 2, baseY - stalkH + 10);
      ctx.lineTo(cx + 12, baseY - stalkH + 5);
      ctx.lineTo(cx + 2, baseY - stalkH + 15);
      ctx.fill();
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Cracked brown earth
    ctx.fillStyle = '#3d2b1a';
    ctx.fillRect(0, groundY, w, groundH);

    // Top edge line
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(0, groundY, w, 3);

    // Dead grass tufts
    ctx.strokeStyle = '#5a4020';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 45 - offset) % (w + 40)) - 20;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 3, groundY - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx + 2, groundY);
      ctx.lineTo(gx + 5, groundY - 5);
      ctx.stroke();
    }

    // Cracks
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const cx = ((i * 90 - offset * 0.8) % (w + 60)) - 30;
      const cy = groundY + 15 + (i * 13) % (groundH - 20);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 15, cy + 3);
      ctx.lineTo(cx + 25, cy - 2);
      ctx.stroke();
    }
  },
};

// ---- SKIBIDI ESCAPE ----

const skibidi = {
  id: 'skibidi',
  name: 'SKIBIDI ESCAPE',
  dataTheme: 'skibidi',
  accentColor: '#4d7dff',

  deathMessages: [
    'the toilets got you',
    'skibidi\'d',
    'cameraman down',
    'flushed away',
    'you got plunged',
    'toilet supremacy',
  ],

  colors: {
    sky: '#1a1a2a',
    skyGradient: '#0a0a1a',
    ground: '#2a2a30',
    groundAccent: '#3a3a42',
    groundLine: '#1a1a20',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    // Cameraman (rectangle body, circle camera head)
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Body (rectangle)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx - 8, cy - 4, 16, 18);

    // Belt
    ctx.fillStyle = '#444444';
    ctx.fillRect(cx - 8, cy + 6, 16, 3);

    // Legs (running)
    const legPhase = Math.sin(frame * 0.3) * 5;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx - 6 + legPhase, cy + 14, 5, 8);
    ctx.fillRect(cx + 1 - legPhase, cy + 14, 5, 8);

    // Arms
    ctx.fillStyle = '#2a2a2a';
    const armPhase = Math.cos(frame * 0.25) * 4;
    ctx.fillRect(cx - 13, cy - 2 + armPhase, 5, 10);
    ctx.fillRect(cx + 8, cy - 2 - armPhase, 5, 10);

    // Camera head
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Camera lens
    ctx.fillStyle = '#4d7dff';
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Lens shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 11, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Red recording light
    ctx.fillStyle = frame % 40 < 20 ? '#ff2020' : '#660000';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 14, 2, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Skibidi Toilet
    // Base
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(x + 2, y + h * 0.4, w - 4, h * 0.6);

    // Tank
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(x + 4, y, w - 8, h * 0.45);

    // Lid
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x, y + h * 0.35, w, 6);

    // Seat opening
    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.6, w * 0.3, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flush handle
    ctx.fillStyle = '#999999';
    ctx.fillRect(x + w - 6, y + h * 0.15, 8, 3);

    // Eyes peeking from lid
    ctx.fillStyle = '#ff2020';
    ctx.beginPath();
    ctx.arc(x + w * 0.35, y + h * 0.33, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 0.65, y + h * 0.33, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Flying toilet head
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Head
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ff2020';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (singing)
    const mouthOpen = Math.abs(Math.sin(frame * 0.1)) * 3;
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.4, r * 0.3, mouthOpen + 1, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // Giant plunger
    // Handle
    ctx.fillStyle = '#8b5a2a';
    ctx.fillRect(x + w / 2 - 3, y, 6, h * 0.7);

    // Cup
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.65);
    ctx.quadraticCurveTo(x + w / 2, y + h, x + w, y + h * 0.65);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Cup top
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.65, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawCoin(ctx, x, y, r, frame) {
    // Camera lens (blue circle)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;

    // Outer ring
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner lens
    ctx.fillStyle = '#4d7dff';
    ctx.beginPath();
    ctx.arc(x, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x - r * 0.2, cy - r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Grey sky with TV static patches
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // TV static patches
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 53 + offset * 0.01 + Math.random() * 2) % w);
      const sy = (i * 29) % (h * 0.5);
      ctx.fillRect(sx, sy, 3 + Math.random() * 4, 2);
    }
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // City ruins / broken buildings silhouette
    ctx.fillStyle = '#0f0f1a';
    const baseY = h * 0.55;

    const buildings = [
      { w: 40, h: 80 }, { w: 25, h: 50 }, { w: 50, h: 100 },
      { w: 30, h: 60 }, { w: 45, h: 90 }, { w: 20, h: 40 },
      { w: 35, h: 70 }, { w: 55, h: 110 }, { w: 28, h: 55 },
    ];

    let bx = -((offset * 0.3) % 400);
    for (const b of buildings) {
      // Jagged top for "broken" look
      ctx.beginPath();
      ctx.moveTo(bx, baseY);
      ctx.lineTo(bx, baseY - b.h);
      ctx.lineTo(bx + b.w * 0.3, baseY - b.h + 5);
      ctx.lineTo(bx + b.w * 0.5, baseY - b.h - 8);
      ctx.lineTo(bx + b.w * 0.7, baseY - b.h + 3);
      ctx.lineTo(bx + b.w, baseY - b.h + 10);
      ctx.lineTo(bx + b.w, baseY);
      ctx.fill();

      bx += b.w + 10;
      if (bx > w + 60) break;
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Cracked concrete with debris
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, groundY, w, groundH);

    // Top edge
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(0, groundY, w, 3);

    // Concrete lines
    ctx.strokeStyle = '#1a1a20';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const lx = ((i * 80 - offset) % (w + 40)) - 20;
      ctx.beginPath();
      ctx.moveTo(lx, groundY + 5);
      ctx.lineTo(lx, groundY + groundH);
      ctx.stroke();
    }

    // Debris dots
    ctx.fillStyle = '#444450';
    for (let i = 0; i < 15; i++) {
      const dx = ((i * 55 - offset * 0.9) % (w + 30)) - 15;
      const dy = groundY + 10 + (i * 17) % (groundH - 15);
      ctx.fillRect(dx, dy, 3, 2);
    }
  },
};

// ---- SIGMA SPRINT ----

const sigma = {
  id: 'sigma',
  name: 'SIGMA SPRINT',
  dataTheme: 'sigma',
  accentColor: '#b44dff',

  deathMessages: [
    'lost the grindset',
    'you got distracted',
    'not sigma behavior',
    'beta moment',
    'the grind stops for no one (except you)',
    'skill issue detected',
  ],

  colors: {
    sky: '#0a0a1a',
    skyGradient: '#050510',
    ground: '#1a1a25',
    groundAccent: '#2a2a35',
    groundLine: '#0a0a15',
  },

  drawPlayer(ctx, x, y, w, h, frame) {
    // Sigma silhouette (guy in hoodie)
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Hoodie body
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 4);
    ctx.lineTo(cx + 9, cy - 4);
    ctx.lineTo(cx + 10, cy + 12);
    ctx.lineTo(cx - 10, cy + 12);
    ctx.closePath();
    ctx.fill();

    // Legs
    const legPhase = Math.sin(frame * 0.3) * 5;
    ctx.fillStyle = '#111120';
    ctx.fillRect(cx - 6 + legPhase, cy + 12, 5, 9);
    ctx.fillRect(cx + 1 - legPhase, cy + 12, 5, 9);

    // Shoes
    ctx.fillStyle = '#b44dff';
    ctx.fillRect(cx - 7 + legPhase, cy + 20, 7, 3);
    ctx.fillRect(cx + 0 - legPhase, cy + 20, 7, 3);

    // Arms
    ctx.fillStyle = '#1a1a2a';
    const armPhase = Math.cos(frame * 0.25) * 3;
    ctx.fillRect(cx - 14, cy - 2 + armPhase, 5, 10);
    ctx.fillRect(cx + 9, cy - 2 - armPhase, 5, 10);

    // Hood
    ctx.fillStyle = '#151525';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 9, Math.PI, 0);
    ctx.lineTo(cx + 9, cy - 2);
    ctx.lineTo(cx - 9, cy - 2);
    ctx.closePath();
    ctx.fill();

    // Face (dark shadow, focused look)
    ctx.fillStyle = '#d0c0a0';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 6, 0, Math.PI * 2);
    ctx.fill();

    // Focused eyes (narrow)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(cx - 4, cy - 9, 3, 2);
    ctx.fillRect(cx + 1, cy - 9, 3, 2);

    // Determined mouth (straight line)
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 5);
    ctx.lineTo(cx + 2, cy - 5);
    ctx.stroke();
  },

  drawObstacleGround(ctx, x, y, w, h) {
    // Phone flying at you
    ctx.fillStyle = '#222230';
    const phoneW = Math.min(w, 20);
    const phoneH = Math.min(h, 35);
    const px = x + (w - phoneW) / 2;
    const py = y + (h - phoneH) / 2;

    // Phone body
    ctx.fillStyle = '#222230';
    ctx.beginPath();
    _roundRect(ctx, px, py, phoneW, phoneH, 3);
    ctx.fill();

    // Screen
    ctx.fillStyle = '#4040ff';
    ctx.fillRect(px + 2, py + 3, phoneW - 4, phoneH - 6);

    // Notification icon
    ctx.fillStyle = '#ff2020';
    ctx.beginPath();
    ctx.arc(px + phoneW - 3, py + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Screen text lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(px + 4, py + 8, phoneW - 8, 2);
    ctx.fillRect(px + 4, py + 13, phoneW - 10, 2);
  },

  drawObstacleFlying(ctx, x, y, w, h, frame) {
    // Party invitation / friend request
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) / 2;

    // Envelope shape
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Envelope flap (V shape)
    ctx.fillStyle = '#ffaa22';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(cx, cy);
    ctx.lineTo(x + w - 2, y + 2);
    ctx.closePath();
    ctx.fill();

    // Heart/notification on envelope
    ctx.fillStyle = '#ff4488';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  drawObstacleTall(ctx, x, y, w, h) {
    // "Touch grass" sign
    // Post
    ctx.fillStyle = '#555560';
    ctx.fillRect(x + w / 2 - 3, y + 30, 6, h - 30);

    // Sign
    const signH = 28;
    ctx.fillStyle = '#2a6a20';
    ctx.fillRect(x, y, w, signH);
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, signH);

    // Text
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '7px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOUCH', x + w / 2, y + 11);
    ctx.fillText('GRASS', x + w / 2, y + 22);
    ctx.textAlign = 'left';
  },

  drawCoin(ctx, x, y, r, frame) {
    // Aura orb (glowing circle)
    const bob = Math.sin(frame * 0.08) * 3;
    const cy = y + bob;
    const pulse = 0.8 + Math.sin(frame * 0.1) * 0.2;

    // Outer glow
    ctx.fillStyle = 'rgba(180, 77, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x, cy, r * 1.6 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = 'rgba(180, 77, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x, cy, r * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const gradient = ctx.createRadialGradient(x, cy, 0, x, cy, r);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, '#d080ff');
    gradient.addColorStop(1, '#b44dff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBackgroundFar(ctx, w, h, offset) {
    // Dark gym / city with neon
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Neon highlight streaks
    ctx.strokeStyle = 'rgba(180, 77, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const ly = 20 + i * 50;
      const lx = ((i * 120 + offset * 0.03) % (w + 200)) - 100;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 80, ly);
      ctx.stroke();
    }

    // Motivational text in background
    ctx.save();
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(180, 77, 255, 0.06)';
    ctx.textAlign = 'center';
    const texts = ['GRIND', 'FOCUS', 'SIGMA', 'NO DAYS OFF'];
    for (let i = 0; i < texts.length; i++) {
      const tx = ((i * 150 + offset * 0.04) % (w + 200)) - 100;
      const ty = 50 + i * 50;
      ctx.fillText(texts[i], tx, ty);
    }
    ctx.restore();
  },

  drawBackgroundMid(ctx, w, h, offset) {
    // Gym equipment / city buildings silhouette
    ctx.fillStyle = '#08081a';
    const baseY = h * 0.6;

    // Abstract gym shapes
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 70 - offset * 0.3) % (w + 100)) - 50;
      const bh = 40 + (i * 23) % 60;

      ctx.fillRect(bx, baseY - bh, 20, bh);

      // Neon accent line on top
      ctx.fillStyle = 'rgba(180, 77, 255, 0.15)';
      ctx.fillRect(bx, baseY - bh, 20, 2);
      ctx.fillStyle = '#08081a';
    }
  },

  drawGround(ctx, w, groundY, groundH, offset) {
    // Gym floor / treadmill pattern
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(0, groundY, w, groundH);

    // Top edge neon
    ctx.fillStyle = 'rgba(180, 77, 255, 0.3)';
    ctx.fillRect(0, groundY, w, 2);

    // Treadmill lines (moving)
    ctx.strokeStyle = '#2a2a35';
    ctx.lineWidth = 1;
    for (let i = 0; i < 25; i++) {
      const lx = ((i * 35 - offset) % (w + 40)) - 20;
      ctx.beginPath();
      ctx.moveTo(lx, groundY + 8);
      ctx.lineTo(lx + 20, groundY + 8);
      ctx.stroke();
    }

    // Subtle pattern
    ctx.fillStyle = '#222230';
    for (let i = 0; i < 12; i++) {
      const dx = ((i * 70 - offset * 0.7) % (w + 40)) - 20;
      ctx.fillRect(dx, groundY + 15, 30, 1);
    }
  },
};

// ---- Internal Utility ----

/**
 * Draw a rounded rectangle path (compatible fallback for ctx.roundRect).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
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
  ohio,
  skibidi,
  sigma,
};

export const THEME_ORDER = ['ohio', 'skibidi', 'sigma'];
