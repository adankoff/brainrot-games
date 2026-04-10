/**
 * MEME NINJA -- Theme Definitions
 * Three swappable themes: Classic Meme Slice, Anime Slash, Cat Slice.
 * Each theme provides drawObject, drawBomb, drawSliceEffect, trailColor,
 * drawBackground, scoreLabel, and deathMessages.
 */

// ---- Theme: CLASSIC MEME SLICE ----

const classicMemeTheme = {
  id: 'classic-meme',
  name: 'CLASSIC MEME SLICE',
  accentColor: '#333333',
  trailColor: '#ffffff',
  scoreLabel: 'MEMES SLICED',
  bombLabel: 'RICKROLLED!',
  deathMessages: [
    'you sliced N memes. the internet thanks you.',
    'meme destruction complete',
    'N memes returned to the void',
    "time's up. the memes won this round",
  ],

  /**
   * Draw classic meme face objects.
   * 0=Trollface, 1=Doge, 2=Nyan Cat, 3=Rage Guy, 4=Forever Alone
   */
  drawObject(ctx, x, y, r, variant) {
    ctx.save();
    ctx.translate(x, y);
    const type = variant % 5;

    switch (type) {
      case 0: // Trollface -- white circle with wide grin
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.15, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.2, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Wide troll grin
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, r * 0.15);
        ctx.quadraticCurveTo(-r * 0.2, r * 0.55, 0, r * 0.35);
        ctx.quadraticCurveTo(r * 0.2, r * 0.15, r * 0.45, r * 0.25);
        ctx.stroke();
        // Raised eyebrow
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, -r * 0.35);
        ctx.quadraticCurveTo(-r * 0.25, -r * 0.5, -r * 0.1, -r * 0.3);
        ctx.stroke();
        break;

      case 1: // Doge -- tan circle with ear nubs, wow
        ctx.fillStyle = '#d4a843';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        // Ears (triangles on top)
        ctx.fillStyle = '#c49530';
        ctx.beginPath();
        ctx.moveTo(-r * 0.55, -r * 0.4);
        ctx.lineTo(-r * 0.35, -r * 0.85);
        ctx.lineTo(-r * 0.15, -r * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.15, -r * 0.45);
        ctx.lineTo(r * 0.35, -r * 0.85);
        ctx.lineTo(r * 0.55, -r * 0.4);
        ctx.closePath();
        ctx.fill();
        // Snout
        ctx.fillStyle = '#e8c876';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.15, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.05, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-r * 0.22, -r * 0.15, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.22, -r * 0.15, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // "wow" text
        ctx.fillStyle = '#ff0000';
        ctx.font = `bold ${r * 0.28}px Comic Sans MS, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('wow', 0, r * 1.1);
        break;

      case 2: // Nyan Cat -- pink rectangle body with rainbow hint
        // Pop-tart body (pink rectangle)
        ctx.fillStyle = '#ff99aa';
        ctx.fillRect(-r * 0.65, -r * 0.45, r * 1.3, r * 0.9);
        // Sprinkles
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.08, r * 0.08);
        ctx.fillRect(r * 0.1, r * 0.05, r * 0.08, r * 0.08);
        ctx.fillRect(-r * 0.1, -r * 0.3, r * 0.08, r * 0.08);
        ctx.fillRect(r * 0.3, -r * 0.15, r * 0.08, r * 0.08);
        // Cat face on body
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(r * 0.1, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Cat eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(r * 0.02, -r * 0.05, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.05, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
        // Cat mouth
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r * 0.06, r * 0.05);
        ctx.lineTo(r * 0.11, r * 0.1);
        ctx.lineTo(r * 0.16, r * 0.05);
        ctx.stroke();
        // Rainbow trail stub (left side)
        const rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = rainbowColors[i];
          ctx.fillRect(-r * 0.95, -r * 0.35 + i * r * 0.12, r * 0.3, r * 0.12);
        }
        break;

      case 3: // Rage Guy -- red-tinted face, FUUUU mouth
        ctx.fillStyle = '#f5d0a9';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        // Angry red tint overlay
        ctx.fillStyle = 'rgba(255, 50, 50, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        // Angry eyes (V-shaped brows)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, -r * 0.35);
        ctx.lineTo(-r * 0.15, -r * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.35, -r * 0.35);
        ctx.lineTo(r * 0.15, -r * 0.2);
        ctx.stroke();
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.1, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.1, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.2, -r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        // FUUUU open mouth
        ctx.fillStyle = '#880000';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#330000';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 4: // Forever Alone -- sad blue-tinted circle face
        ctx.fillStyle = '#d0d0e8';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Sad eyes (looking down)
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(-r * 0.22, -r * 0.1, r * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.22, -r * 0.1, r * 0.09, 0, Math.PI * 2);
        ctx.fill();
        // Tear drops
        ctx.fillStyle = '#5588cc';
        ctx.beginPath();
        ctx.moveTo(-r * 0.22, r * 0.0);
        ctx.lineTo(-r * 0.18, r * 0.2);
        ctx.lineTo(-r * 0.26, r * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.22, r * 0.0);
        ctx.lineTo(r * 0.26, r * 0.2);
        ctx.lineTo(r * 0.18, r * 0.2);
        ctx.closePath();
        ctx.fill();
        // Sad mouth (frown)
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, r * 0.45, r * 0.2, Math.PI + 0.3, -0.3);
        ctx.stroke();
        break;
    }
    ctx.restore();
  },

  /**
   * Draw Rickroll bomb -- orange hair, microphone, never gonna slice you up!
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Head
    ctx.fillStyle = '#f0d0a0';
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Orange hair (wild poof on top)
    ctx.fillStyle = '#e86420';
    ctx.beginPath();
    ctx.arc(0, -r * 0.4, r * 0.45, Math.PI, Math.PI * 2);
    ctx.fill();
    // Hair sides
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.2, r * 0.2, r * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.35, -r * 0.2, r * 0.2, r * 0.35, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.15, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.15, -r * 0.15, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, r * 0.0, r * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Microphone (stick + ball)
    ctx.fillStyle = '#444';
    ctx.fillRect(r * 0.05, r * 0.2, r * 0.08, r * 0.6);
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(r * 0.09, r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    // Mic grid lines
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.0, r * 0.15);
    ctx.lineTo(r * 0.18, r * 0.15);
    ctx.moveTo(r * 0.0, r * 0.22);
    ctx.lineTo(r * 0.18, r * 0.22);
    ctx.stroke();

    // Warning indicator
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${r * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, r * 1.15);

    ctx.restore();
  },

  /**
   * Draw "LOL" text particles bursting out on slice.
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      if (p.text) {
        ctx.fillStyle = '#333';
        ctx.font = `bold ${p.size * 3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      } else {
        ctx.fillStyle = p.color || '#333';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw white grid paper background (rage comic style) with meme debris.
   */
  drawBackground(ctx, W, H, time) {
    // White paper base
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, W, H);

    // Grid lines (blue, faint)
    ctx.strokeStyle = '#d0d8e8';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;
    const gridSize = 20;
    for (let gx = 0; gx <= W; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Red margin line
    ctx.strokeStyle = '#ffaaaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, H);
    ctx.stroke();

    // Meme debris (scribbles that accumulate with time)
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#333';
    const debrisCount = Math.min(Math.floor(time / 120), 20);
    for (let i = 0; i < debrisCount; i++) {
      const dx = (i * 173.7 + 60) % W;
      const dy = (i * 241.3 + 80) % H;
      ctx.fillRect(dx, dy, 12 + (i % 5) * 4, 8 + (i % 3) * 3);
    }
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: ANIME SLASH ----

const animeSlashTheme = {
  id: 'anime-slash',
  name: 'ANIME SLASH',
  accentColor: '#ff0000',
  trailColor: '#4488ff',
  scoreLabel: 'SLASH POWER',
  bombLabel: 'SENZU BEAN!',
  deathMessages: [
    'N items slashed. anime power: unlimited',
    'the blade rests',
    'N objects fell to your blade. respect.',
    'final slash count: N. you have earned honor',
  ],

  /**
   * Draw anime-themed objects.
   * 0=Dragon Ball, 1=Shuriken, 2=Ramen Bowl, 3=Pokeball, 4=Death Note
   */
  drawObject(ctx, x, y, r, variant) {
    ctx.save();
    ctx.translate(x, y);
    const type = variant % 5;

    switch (type) {
      case 0: // Dragon Ball -- orange circle with stars
        // Orange orb
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        // Glossy shine
        ctx.fillStyle = '#ffcc44';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Stars (red)
        ctx.fillStyle = '#cc0000';
        const starCount = (variant % 4) + 1;
        for (let s = 0; s < starCount; s++) {
          const sx = (s - (starCount - 1) / 2) * r * 0.25;
          const sy = r * 0.05;
          drawStar(ctx, sx, sy, r * 0.1, 4);
        }
        // Outline
        ctx.strokeStyle = '#cc6600';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 1: // Shuriken -- 4-pointed throwing star
        ctx.fillStyle = '#888';
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const points = 4;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2 - Math.PI / 4;
          const midAngle = ((i + 0.5) / points) * Math.PI * 2 - Math.PI / 4;
          const outerX = Math.cos(angle) * r * 0.85;
          const outerY = Math.sin(angle) * r * 0.85;
          const innerX = Math.cos(midAngle) * r * 0.25;
          const innerY = Math.sin(midAngle) * r * 0.25;
          if (i === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Center hole
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // Metal shine
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(-r * 0.1, -r * 0.1, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 2: // Ramen Bowl -- circle with noodle lines
        // Bowl
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath();
        ctx.arc(0, r * 0.1, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        // Broth
        ctx.fillStyle = '#e8b830';
        ctx.beginPath();
        ctx.arc(0, r * 0.05, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Bowl rim
        ctx.strokeStyle = '#cc8844';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.7, r * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.7, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        // Noodle swirls
        ctx.strokeStyle = '#f0d080';
        ctx.lineWidth = 1.5;
        for (let n = 0; n < 3; n++) {
          ctx.beginPath();
          const nx = -r * 0.3 + n * r * 0.25;
          ctx.moveTo(nx, -r * 0.1);
          ctx.quadraticCurveTo(nx + r * 0.15, r * 0.1, nx, r * 0.25);
          ctx.stroke();
        }
        // Egg (half circle)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r * 0.15, r * 0.0, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(r * 0.15, r * 0.0, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Chopsticks
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.6);
        ctx.lineTo(r * 0.3, r * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, -r * 0.65);
        ctx.lineTo(r * 0.45, r * 0.2);
        ctx.stroke();
        break;

      case 3: // Pokeball -- red/white circle with center band
        // Top half (red)
        ctx.fillStyle = '#ee1111';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Bottom half (white)
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        // Center band
        ctx.fillStyle = '#333';
        ctx.fillRect(-r * 0.8, -r * 0.06, r * 1.6, r * 0.12);
        // Center button
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 4: // Death Note -- black rectangle book
        // Book body
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-r * 0.55, -r * 0.7, r * 1.1, r * 1.4);
        // Spine
        ctx.fillStyle = '#333';
        ctx.fillRect(-r * 0.55, -r * 0.7, r * 0.1, r * 1.4);
        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${r * 0.2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DEATH', 0, -r * 0.2);
        ctx.fillText('NOTE', 0, r * 0.1);
        // Decorative lines
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, -r * 0.5);
        ctx.lineTo(r * 0.45, -r * 0.5);
        ctx.moveTo(-r * 0.35, r * 0.35);
        ctx.lineTo(r * 0.45, r * 0.35);
        ctx.stroke();
        break;
    }
    ctx.restore();
  },

  /**
   * Draw Senzu Bean bomb -- green bean shape, healing item.
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Green glow
    ctx.globalAlpha = 0.3;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
    glow.addColorStop(0, '#44ff44');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Bean shape (elongated oval)
    ctx.fillStyle = '#33aa33';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.35, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bean crease
    ctx.strokeStyle = '#228822';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.quadraticCurveTo(r * 0.15, 0, 0, r * 0.55);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = '#66dd66';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.2, r * 0.1, r * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle effect
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    drawStar(ctx, r * 0.4, -r * 0.4, r * 0.12, 4);
    drawStar(ctx, -r * 0.35, r * 0.3, r * 0.08, 4);
    ctx.globalAlpha = 1;

    // Warning
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${r * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, r * 1.15);

    ctx.restore();
  },

  /**
   * Draw dramatic slash lines and speed line bursts on slice.
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Speed line slash
      ctx.strokeStyle = p.color || '#ffffff';
      ctx.lineWidth = p.size * 0.8;
      ctx.beginPath();
      ctx.moveTo(-p.size * 3, 0);
      ctx.lineTo(p.size * 3, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw dramatic manga-style background with speed lines.
   */
  drawBackground(ctx, W, H, time) {
    // Dark dramatic gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#12122a');
    grad.addColorStop(1, '#080818');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Radial speed lines from center
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const cx = W / 2;
    const cy = H / 2;
    const lineCount = 36;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const innerR = 80 + Math.sin(i * 5 + time * 0.005) * 20;
      const outerR = Math.max(W, H);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();

    // Dramatic kanji-style decorative marks in corners
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#ff0000';
    ctx.font = `bold ${W * 0.25}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u65AC', W * 0.85, H * 0.12); // "slash" kanji
    ctx.globalAlpha = 1;

    // Bottom dramatic gradient strip
    ctx.fillStyle = 'rgba(255, 0, 0, 0.03)';
    ctx.fillRect(0, H * 0.9, W, H * 0.1);
  },
};

// ---- Theme: CAT SLICE ----

const catSliceTheme = {
  id: 'cat-slice',
  name: 'CAT SLICE',
  accentColor: '#ff69b4',
  trailColor: '#ff99cc',
  scoreLabel: 'CAT TOYS SLICED',
  bombLabel: 'WOKE THE CAT!',
  deathMessages: [
    'N cat toys destroyed. the cat is pleased.',
    'the cat got bored',
    'N toys sliced. purr-fect score.',
    "the cat demands more toys. you sliced N.",
  ],

  /**
   * Draw cat-themed objects.
   * 0=Yarn Ball, 1=Cat Toy (feather), 2=Fish, 3=Mouse, 4=Milk Carton
   */
  drawObject(ctx, x, y, r, variant) {
    ctx.save();
    ctx.translate(x, y);
    const type = variant % 5;

    switch (type) {
      case 0: // Yarn Ball -- colored circle with thread lines
        const yarnColors = ['#ff69b4', '#ff4444', '#4488ff', '#aa44ff', '#44cc44'];
        const yarnColor = yarnColors[Math.floor(Math.random() * 0.99 + variant) % yarnColors.length];
        ctx.fillStyle = yarnColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        // Thread wrap lines
        ctx.strokeStyle = '#ffffff44';
        ctx.lineWidth = 1;
        for (let t = 0; t < 5; t++) {
          const ta = t * 0.6;
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.65, r * 0.3, ta, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Loose thread end
        ctx.strokeStyle = yarnColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r * 0.5, r * 0.4);
        ctx.quadraticCurveTo(r * 0.8, r * 0.6, r * 0.7, r * 0.85);
        ctx.stroke();
        break;

      case 1: // Cat Toy -- feather on a stick
        // Stick
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, r * 0.8);
        ctx.lineTo(0, -r * 0.2);
        ctx.stroke();
        // String
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.2);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.4, r * 0.1, -r * 0.6);
        ctx.stroke();
        // Feather
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.ellipse(r * 0.1, -r * 0.7, r * 0.12, r * 0.35, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Second feather
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.ellipse(-r * 0.05, -r * 0.65, r * 0.1, r * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Third feather
        ctx.fillStyle = '#da70d6';
        ctx.beginPath();
        ctx.ellipse(r * 0.2, -r * 0.6, r * 0.08, r * 0.25, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Feather center lines
        ctx.strokeStyle = '#cc1177';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(r * 0.1, -r * 0.4);
        ctx.lineTo(r * 0.1, -r * 0.95);
        ctx.stroke();
        break;

      case 2: // Fish -- simple fish shape
        // Body
        ctx.fillStyle = '#6699cc';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.75, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(r * 0.6, 0);
        ctx.lineTo(r * 0.95, -r * 0.35);
        ctx.lineTo(r * 0.95, r * 0.35);
        ctx.closePath();
        ctx.fill();
        // Belly (lighter)
        ctx.fillStyle = '#88bbdd';
        ctx.beginPath();
        ctx.ellipse(-r * 0.05, r * 0.1, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.05, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.05, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        // Scales suggestion
        ctx.strokeStyle = '#5588aa';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.4;
        for (let sc = 0; sc < 3; sc++) {
          ctx.beginPath();
          ctx.arc(-r * 0.1 + sc * r * 0.2, 0, r * 0.15, 0.3, Math.PI - 0.3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Fin
        ctx.fillStyle = '#5588aa';
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, -r * 0.35);
        ctx.lineTo(r * 0.1, -r * 0.6);
        ctx.lineTo(r * 0.25, -r * 0.3);
        ctx.closePath();
        ctx.fill();
        break;

      case 3: // Mouse toy -- small gray oval with ears and tail
        // Body
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.55, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.3, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-r * 0.1, -r * 0.32, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Inner ears
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.3, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-r * 0.1, -r * 0.32, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.05, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = '#ff6699';
        ctx.beginPath();
        ctx.arc(-r * 0.48, r * 0.0, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, -r * 0.05);
        ctx.lineTo(-r * 0.75, -r * 0.15);
        ctx.moveTo(-r * 0.45, r * 0.0);
        ctx.lineTo(-r * 0.75, r * 0.05);
        ctx.moveTo(-r * 0.45, r * 0.05);
        ctx.lineTo(-r * 0.7, r * 0.18);
        ctx.stroke();
        // Tail
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r * 0.45, 0);
        ctx.quadraticCurveTo(r * 0.7, -r * 0.3, r * 0.85, -r * 0.1);
        ctx.stroke();
        break;

      case 4: // Milk Carton -- white rectangle
        // Carton body
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(-r * 0.45, -r * 0.6, r * 0.9, r * 1.2);
        // Top fold (triangle)
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, -r * 0.6);
        ctx.lineTo(0, -r * 0.85);
        ctx.lineTo(r * 0.45, -r * 0.6);
        ctx.closePath();
        ctx.fill();
        // Blue stripe
        ctx.fillStyle = '#4488cc';
        ctx.fillRect(-r * 0.45, -r * 0.1, r * 0.9, r * 0.3);
        // "MILK" text
        ctx.fillStyle = '#4488cc';
        ctx.font = `bold ${r * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('MILK', 0, -r * 0.3);
        // Cow spot decoration
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(-r * 0.15, r * 0.35, r * 0.1, r * 0.07, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.2, r * 0.4, r * 0.08, r * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  },

  /**
   * Draw sleeping cat bomb -- curled up cat with Z's, don't wake it!
   */
  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // Curled body (large circle)
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(0, r * 0.05, r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Fur texture suggestion
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let f = 0; f < 5; f++) {
      const fa = f * 1.2;
      ctx.beginPath();
      ctx.arc(Math.cos(fa) * r * 0.2, r * 0.05 + Math.sin(fa) * r * 0.15, r * 0.15, fa, fa + 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Tail wrapping around
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, r * 0.05, r * 0.5, 0.5, Math.PI * 1.2);
    ctx.stroke();
    // Tail tip (darker)
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, r * 0.05, r * 0.5, 0.5, 0.9);
    ctx.stroke();

    // Head (smaller circle on top)
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.35, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.45);
    ctx.lineTo(-r * 0.42, -r * 0.7);
    ctx.lineTo(-r * 0.3, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.5);
    ctx.lineTo(-r * 0.08, -r * 0.72);
    ctx.lineTo(0, -r * 0.48);
    ctx.closePath();
    ctx.fill();
    // Inner ears
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(-r * 0.46, -r * 0.48);
    ctx.lineTo(-r * 0.42, -r * 0.63);
    ctx.lineTo(-r * 0.34, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.52);
    ctx.lineTo(-r * 0.08, -r * 0.65);
    ctx.lineTo(-r * 0.02, -r * 0.5);
    ctx.closePath();
    ctx.fill();

    // Closed eyes (curved lines)
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.3, r * 0.07, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.3, r * 0.07, Math.PI, 0);
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#ff99aa';
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.22);
    ctx.lineTo(-r * 0.28, -r * 0.18);
    ctx.lineTo(-r * 0.22, -r * 0.18);
    ctx.closePath();
    ctx.fill();

    // Z's for sleeping
    ctx.fillStyle = '#aaccff';
    ctx.font = `bold ${r * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Z', r * 0.25, -r * 0.55);
    ctx.font = `bold ${r * 0.22}px sans-serif`;
    ctx.fillText('z', r * 0.45, -r * 0.75);
    ctx.font = `bold ${r * 0.16}px sans-serif`;
    ctx.fillText('z', r * 0.55, -r * 0.88);

    // Warning
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${r * 0.35}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, r * 1.15);

    ctx.restore();
  },

  /**
   * Draw feather/yarn scatter particles on slice.
   */
  drawSliceEffect(ctx, x, y, particles) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color || '#ff69b4';
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // Feather-like elongated shape
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  /**
   * Draw living room scene (couch silhouette, window, curtains).
   */
  drawBackground(ctx, W, H, time) {
    // Warm interior gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#2a1f1a');
    grad.addColorStop(0.5, '#3a2a20');
    grad.addColorStop(1, '#1a1410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Floor
    ctx.fillStyle = '#2a1a0f';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    // Floor boards
    ctx.strokeStyle = '#352015';
    ctx.lineWidth = 1;
    for (let fb = 0; fb < 5; fb++) {
      const fy = H * 0.82 + fb * H * 0.036;
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(W, fy);
      ctx.stroke();
    }

    // Window (center upper area)
    ctx.fillStyle = '#1a2244';
    ctx.fillRect(W * 0.25, H * 0.08, W * 0.5, H * 0.35);
    // Window panes
    ctx.strokeStyle = '#443322';
    ctx.lineWidth = 4;
    ctx.strokeRect(W * 0.25, H * 0.08, W * 0.5, H * 0.35);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.08);
    ctx.lineTo(W * 0.5, H * 0.43);
    ctx.moveTo(W * 0.25, H * 0.255);
    ctx.lineTo(W * 0.75, H * 0.255);
    ctx.stroke();
    // Moon through window
    ctx.fillStyle = '#ddeeff';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(W * 0.6, H * 0.18, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Curtains (left and right of window)
    ctx.fillStyle = '#553322';
    // Left curtain
    ctx.beginPath();
    ctx.moveTo(W * 0.18, H * 0.05);
    ctx.lineTo(W * 0.28, H * 0.05);
    ctx.lineTo(W * 0.26, H * 0.48);
    ctx.lineTo(W * 0.18, H * 0.48);
    ctx.closePath();
    ctx.fill();
    // Right curtain
    ctx.beginPath();
    ctx.moveTo(W * 0.72, H * 0.05);
    ctx.lineTo(W * 0.82, H * 0.05);
    ctx.lineTo(W * 0.82, H * 0.48);
    ctx.lineTo(W * 0.74, H * 0.48);
    ctx.closePath();
    ctx.fill();

    // Couch silhouette at bottom
    ctx.fillStyle = '#221510';
    // Couch seat
    ctx.fillRect(W * 0.05, H * 0.62, W * 0.9, H * 0.15);
    // Couch back
    ctx.fillRect(W * 0.05, H * 0.52, W * 0.9, H * 0.12);
    // Rounded top of couch back
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.52, W * 0.45, H * 0.04, 0, Math.PI, 0);
    ctx.fill();
    // Armrests
    ctx.fillRect(W * 0.02, H * 0.55, W * 0.08, H * 0.22);
    ctx.fillRect(W * 0.9, H * 0.55, W * 0.08, H * 0.22);
    // Cushion lines
    ctx.strokeStyle = '#1a0f0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.35, H * 0.62);
    ctx.lineTo(W * 0.35, H * 0.77);
    ctx.moveTo(W * 0.65, H * 0.62);
    ctx.lineTo(W * 0.65, H * 0.77);
    ctx.stroke();

    // Cat scratching post (right side)
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(W * 0.85, H * 0.45, W * 0.04, H * 0.37);
    ctx.fillStyle = '#7a5c12';
    ctx.fillRect(W * 0.82, H * 0.42, W * 0.1, H * 0.04);
  },
};

// ---- Helper: draw a simple 4-pointed star ----

function drawStar(ctx, cx, cy, size, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? size : size * 0.4;
    const sx = cx + Math.cos(angle) * radius;
    const sy = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
}

// ---- Exported theme list ----

export const THEMES = [classicMemeTheme, animeSlashTheme, catSliceTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
