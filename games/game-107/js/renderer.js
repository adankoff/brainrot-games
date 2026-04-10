/**
 * MEME DEFENSE -- Renderer
 * All canvas drawing logic for the game.
 */

const W = 400;
const H = 700;

/**
 * Draw the full game frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./defense.js').DefenseGame} game
 */
export function renderGame(ctx, game) {
  // Clear
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Stars background
  drawStars(ctx);

  // Ground
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, H - 60, W, 60);
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(0, H - 60, W, 2);

  // Cities
  drawCities(ctx, game);

  // Battery
  drawBattery(ctx, game);

  // Enemy missiles
  drawEnemyMissiles(ctx, game);

  // Counter-missiles
  drawCounterMissiles(ctx, game);

  // Explosions
  drawExplosions(ctx, game);

  // Particles
  drawParticles(ctx, game);

  // HUD
  drawHUD(ctx, game);

  // Wave banner
  if (game.waveBannerTimer > 0) {
    drawWaveBanner(ctx, game);
  }

  // Game over overlay on canvas
  if (game.gameOver) {
    drawGameOverOverlay(ctx);
  }
}

// Pre-generate star positions
const stars = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * (H - 80),
    size: Math.random() * 1.5 + 0.5,
    brightness: Math.random() * 0.5 + 0.3,
  });
}

// Pre-generate window patterns for each city (so they don't flicker)
const CITY_WINDOWS = [];
for (let c = 0; c < 4; c++) {
  const windows = [];
  for (let bx = 5; bx < 36; bx += 6) {
    for (let by = 3; by < 20; by += 5) {
      if (Math.random() > 0.3) {
        windows.push({ ox: bx, oy: by });
      }
    }
  }
  CITY_WINDOWS.push(windows);
}

function drawStars(ctx) {
  for (const s of stars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
}

function drawCities(ctx, game) {
  const cities = game.getCities();
  const positions = game.getCityPositions();
  const { width, height } = game.getCityDimensions();

  for (let i = 0; i < 4; i++) {
    const pos = positions[i];

    if (cities[i]) {
      // Alive city -- draw buildings
      ctx.fillStyle = '#4488ff';
      // Main building
      ctx.fillRect(pos.x - width / 2 + 4, pos.y - height, 8, height);
      // Taller building
      ctx.fillRect(pos.x - width / 2 + 14, pos.y - height - 6, 6, height + 6);
      // Wide building
      ctx.fillRect(pos.x - width / 2 + 22, pos.y - height + 4, 10, height - 4);
      // Small building
      ctx.fillRect(pos.x + width / 2 - 10, pos.y - height + 2, 8, height - 2);

      // Windows (small yellow dots, pre-generated pattern)
      ctx.fillStyle = '#ffee88';
      const windows = CITY_WINDOWS[i];
      for (const w of windows) {
        ctx.fillRect(pos.x - width / 2 + w.ox, pos.y - height + w.oy, 2, 2);
      }

      // City label
      ctx.fillStyle = '#6699cc';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(['NYC', 'LA', 'CHI', 'MIA'][i], pos.x, pos.y + 12);
    } else {
      // Destroyed city -- rubble
      ctx.fillStyle = '#443333';
      ctx.fillRect(pos.x - width / 2, pos.y - 4, width, 4);
      ctx.fillStyle = '#332222';
      ctx.fillRect(pos.x - 8, pos.y - 8, 6, 8);
      ctx.fillRect(pos.x + 4, pos.y - 6, 4, 6);

      // "RIP" label
      ctx.fillStyle = '#664444';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RIP', pos.x, pos.y + 12);
    }
  }
}

function drawBattery(ctx, game) {
  const bat = game.getBattery();

  // Battery base
  ctx.fillStyle = '#88aacc';
  ctx.fillRect(bat.x - 12, bat.y - 8, 24, 8);

  // Barrel
  ctx.fillStyle = '#aaccee';
  ctx.fillRect(bat.x - 3, bat.y - 16, 6, 10);

  // Ammo indicator dots
  ctx.fillStyle = '#44ff88';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${game.ammo}`, bat.x, bat.y + 14);
}

function drawEnemyMissiles(ctx, game) {
  for (const m of game.enemyMissiles) {
    // Trail line from start to current position
    ctx.beginPath();
    ctx.moveTo(m.startX, m.startY);
    ctx.lineTo(m.x, m.y);
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Warhead (glowing dot)
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();

    // Warhead glow
    ctx.beginPath();
    ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
    ctx.fill();
  }
}

function drawCounterMissiles(ctx, game) {
  for (const m of game.counterMissiles) {
    // Trail
    if (m.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(m.trail[0].x, m.trail[0].y);
      for (let i = 1; i < m.trail.length; i++) {
        ctx.lineTo(m.trail[i].x, m.trail[i].y);
      }
      ctx.lineTo(m.x, m.y);
      ctx.strokeStyle = 'rgba(68, 255, 136, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Missile head
    ctx.beginPath();
    ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#44ff88';
    ctx.fill();

    // Target crosshair (faint)
    ctx.strokeStyle = 'rgba(68, 255, 136, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.targetX - 6, m.targetY);
    ctx.lineTo(m.targetX + 6, m.targetY);
    ctx.moveTo(m.targetX, m.targetY - 6);
    ctx.lineTo(m.targetX, m.targetY + 6);
    ctx.stroke();
  }
}

function drawExplosions(ctx, game) {
  for (const e of game.explosions) {
    // Outer glow
    const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
    gradient.addColorStop(0, `rgba(255, 200, 50, ${e.alpha * 0.8})`);
    gradient.addColorStop(0.4, `rgba(255, 100, 30, ${e.alpha * 0.6})`);
    gradient.addColorStop(0.7, `rgba(255, 50, 20, ${e.alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(255, 30, 10, 0)`);

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 200, ${e.alpha * 0.9})`;
    ctx.fill();
  }
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawHUD(ctx, game) {
  // Score (top left)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${game.score}`, 10, 24);

  // Wave (top right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#88aacc';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`WAVE ${game.wave}`, W - 10, 24);

  // Ammo bar (top center)
  const barWidth = 120;
  const barHeight = 8;
  const barX = (W - barWidth) / 2;
  const barY = 14;

  ctx.fillStyle = '#222233';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  if (game.maxAmmo > 0) {
    const fill = (game.ammo / game.maxAmmo) * barWidth;
    const ammoColor = game.ammo <= 3 ? '#ff4444' : game.ammo <= game.maxAmmo * 0.3 ? '#ffaa00' : '#44ff88';
    ctx.fillStyle = ammoColor;
    ctx.fillRect(barX, barY, fill, barHeight);
  }

  ctx.fillStyle = '#aaaacc';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AMMO', W / 2, barY - 2);

  // Cities alive indicator
  const cities = game.getCities();
  const alive = cities.filter(c => c).length;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6699cc';
  ctx.font = '10px monospace';
  ctx.fillText(`CITIES: ${alive}/4`, 10, H - 4);
}

function drawWaveBanner(ctx, game) {
  const alpha = Math.min(1, game.waveBannerTimer / 30);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Semi-transparent backdrop
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, H / 2 - 40, W, 80);

  // Wave text
  ctx.fillStyle = '#44ff88';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${game.wave}`, W / 2, H / 2 + 2);

  // Subtitle
  ctx.fillStyle = '#88aacc';
  ctx.font = '12px monospace';
  ctx.fillText(`${game.wave * 3} incoming  |  ${game.maxAmmo} ammo`, W / 2, H / 2 + 24);

  ctx.restore();
}

function drawGameOverOverlay(ctx) {
  // Slight red tint
  ctx.fillStyle = 'rgba(80, 0, 0, 0.3)';
  ctx.fillRect(0, 0, W, H);
}

/**
 * Render the menu background.
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderMenuBackground(ctx) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx);

  // Ground
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, H - 60, W, 60);

  // Decorative cities
  const cityXs = [60, 150, 250, 340];
  for (const x of cityXs) {
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(x - 16, H - 84, 8, 24);
    ctx.fillRect(x - 6, H - 90, 6, 30);
    ctx.fillRect(x + 2, H - 80, 10, 20);
    ctx.fillRect(x + 14, H - 82, 8, 22);
  }

  // Decorative missile trails
  ctx.strokeStyle = 'rgba(255, 68, 68, 0.2)';
  ctx.lineWidth = 1;
  const time = Date.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const sx = 50 + i * 150;
    const progress = ((time * 0.3 + i * 0.33) % 1);
    const ey = -10 + progress * (H - 100);
    ctx.beginPath();
    ctx.moveTo(sx, -10);
    ctx.lineTo(sx + (i - 1) * 20, ey);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx + (i - 1) * 20, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.4)';
    ctx.fill();
  }
}
