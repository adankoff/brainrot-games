/**
 * BRAINROT BREAKER -- Theme Definitions
 * Three swappable meme themes: NPC Streaming, Ohio, Skibidi.
 * Each theme provides colors, draw callbacks, labels, and death messages.
 */

// ---- Theme: NPC STREAMING BREAKER ----

const npcTheme = {
  id: 'npc',
  name: 'NPC STREAMING BREAKER',
  scoreLabel: 'GIFTS',
  accentColor: '#FF0050',
  bgColor: '#000000',
  brickColors: ['#FF0050', '#00F2EA', '#FFD700', '#FF6B9D', '#FF3D00'],
  paddleColor: '#FF0050',
  ballColor: '#FF6B9D',

  /** NPC catchphrases shown as floating text when bricks break */
  catchphrases: [
    'ice cream so good!',
    'yes yes yes!',
    'gang gang!',
    'slay queen!',
    'you are my bestie!',
    'sending love!',
    'NPC mode activated!',
    'thank you for the gift!',
  ],

  deathMessages: [
    'stream ended. N gifts sent.',
    'the NPCs have been freed.',
    'the NPCs won. you are now one of them.',
    'chat is typing... \'L\'. just \'L\'.',
    'your gifting privileges have been revoked.',
  ],

  /**
   * Draw TikTok Live background.
   */
  drawBackground(ctx, W, H) {
    // Dark bg
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Pink/cyan accent lines on sides
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#FF0050';
    ctx.fillRect(0, 0, 4, H);
    ctx.fillStyle = '#00F2EA';
    ctx.fillRect(W - 4, 0, 4, H);
    ctx.globalAlpha = 1;

    // Fake chat area hints on left side
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    const chatLines = [
      'user_8847: omg',
      'ohio_boy: NPC MODE',
      'xX_fan: sending roses',
      'gamergirl: gang gang',
      'viewer_12: ice cream!',
    ];
    for (let i = 0; i < chatLines.length; i++) {
      ctx.fillText(chatLines[i], 8, H - 100 + i * 14);
    }
    ctx.globalAlpha = 1;

    // Top bar glow
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, 'rgba(255,0,80,0.1)');
    topGrad.addColorStop(0.5, 'rgba(0,242,234,0.05)');
    topGrad.addColorStop(1, 'rgba(255,0,80,0.1)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 3);
  },

  /**
   * Draw NPC face brick.
   */
  drawBrick(ctx, x, y, w, h, color, hp) {
    // Brick body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    // Face circle
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) * 0.32;
    ctx.fillStyle = '#FFD5B8';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.15, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth - open 'o' for NPC expression
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.35, r * 0.2, 0, Math.PI * 2);
    ctx.stroke();

    // 2-hit brick indicator
    if (hp === 2) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.lineWidth = 1;
    }
  },

  /**
   * Draw gift bar paddle.
   */
  drawPaddle(ctx, x, y, w, h) {
    // Gradient bar
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#FF0050');
    grad.addColorStop(0.5, '#FF3D7F');
    grad.addColorStop(1, '#FF0050');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Gift icon hints
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.6;
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2764', x + w / 2, y + h - 2);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  },

  /**
   * Draw rose/gift ball.
   */
  drawBall(ctx, x, y, r) {
    // Pink circle with petals
    ctx.fillStyle = '#FF6B9D';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Petal accents
    ctx.fillStyle = '#FF0050';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = x + Math.cos(angle) * r * 0.5;
      const py = y + Math.sin(angle) * r * 0.5;
      ctx.beginPath();
      ctx.arc(px, py, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  },
};

// ---- Theme: OHIO BREAKER ----

const ohioTheme = {
  id: 'ohio',
  name: 'OHIO BREAKER',
  scoreLabel: 'OHIO DAMAGE',
  accentColor: '#00FF88',
  bgColor: '#1A1A2E',
  brickColors: ['#4A7C2E', '#8B4513', '#FF4500', '#6B3FA0', '#2E4A1A'],
  paddleColor: '#888888',
  ballColor: '#00FF88',

  catchphrases: [
    'only in ohio...',
    'the corn watches',
    'ohio claims another',
    'ohio intensifies',
    'can\'t escape ohio',
    'ohio moment',
  ],

  deathMessages: [
    'ohio remains unbroken.',
    'you broke N blocks but ohio broke you.',
    'you could not escape ohio. nobody escapes ohio.',
    'the corn remembers your name now.',
    'only in ohio would you lose at brick breaker.',
  ],

  /**
   * Draw Ohio cursed landscape background. Gradually revealed as bricks break.
   */
  drawBackground(ctx, W, H, bricksCleared, totalBricks) {
    // Dark sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1A1A2E');
    grad.addColorStop(0.4, '#2D1B4E');
    grad.addColorStop(1, '#0D0D1A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const revealPct = totalBricks > 0 ? bricksCleared / totalBricks : 0;

    // Stars appear as bricks clear
    if (revealPct > 0.1) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.min(revealPct, 0.5);
      for (let i = 0; i < 20; i++) {
        const sx = (i * 97 + 30) % W;
        const sy = (i * 53 + 10) % (H * 0.3);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }

    // Purple sky glow as more bricks cleared
    if (revealPct > 0.3) {
      ctx.globalAlpha = (revealPct - 0.3) * 0.4;
      const skyGrad = ctx.createRadialGradient(W / 2, H * 0.15, 10, W / 2, H * 0.15, 200);
      skyGrad.addColorStop(0, '#6B3FA0');
      skyGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.4);
      ctx.globalAlpha = 1;
    }

    // Corn field silhouette at bottom
    ctx.fillStyle = '#1A2E0D';
    for (let i = 0; i < 30; i++) {
      const cx = i * 14;
      const ch = 20 + (i * 7) % 30;
      ctx.fillRect(cx, H - ch, 3, ch);
      // Leaf
      ctx.beginPath();
      ctx.moveTo(cx + 1.5, H - ch + 5);
      ctx.lineTo(cx + 8, H - ch + 10);
      ctx.lineTo(cx + 1.5, H - ch + 12);
      ctx.fill();
    }

    // Weird portal if many bricks cleared
    if (revealPct > 0.6) {
      ctx.globalAlpha = (revealPct - 0.6) * 0.5;
      const portalGrad = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, 40);
      portalGrad.addColorStop(0, '#FF4500');
      portalGrad.addColorStop(0.5, '#6B3FA0');
      portalGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = portalGrad;
      ctx.beginPath();
      ctx.arc(W * 0.7, H * 0.2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  /**
   * Draw Ohio themed brick.
   */
  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    // Inner detail - mini icon
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = ['O', 'H', 'I', 'O', '!'];
    const idx = Math.floor((x + y) / 20) % icons.length;
    ctx.fillText(icons[idx], cx, cy);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Brick border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(x, y, w, h);

    // 2-hit indicator
    if (hp === 2) {
      ctx.strokeStyle = '#00FF88';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.lineWidth = 1;
    }
  },

  /**
   * Draw highway guardrail paddle.
   */
  drawPaddle(ctx, x, y, w, h) {
    // Metal guardrail
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#FFD700';
    const stripeW = 6;
    for (let sx = x + 4; sx < x + w - 4; sx += stripeW * 2) {
      ctx.fillRect(sx, y + 2, stripeW, h - 4);
    }

    // "OHIO" text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OHIO', x + w / 2, y + h - 2);
    ctx.textAlign = 'left';
  },

  /**
   * Draw corn kernel ball.
   */
  drawBall(ctx, x, y, r) {
    // Yellow corn kernel
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kernel highlight
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.2, y - r * 0.3, r * 0.3, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow trail
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#00FF88';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: SKIBIDI BREAKER ----

const skibidiTheme = {
  id: 'skibidi',
  name: 'SKIBIDI BREAKER',
  scoreLabel: 'TOILETS DESTROYED',
  accentColor: '#00e5ff',
  bgColor: '#0a0a1a',
  brickColors: ['#00e5ff', '#ff1744', '#ffea00', '#00e676', '#e040fb'],
  paddleColor: '#555555',
  ballColor: '#2196F3',

  catchphrases: [
    'skibidi dop dop!',
    'toilet down!',
    'cameraman wins!',
    'flush!',
    'skibidi eliminated!',
    'brainrot activated!',
  ],

  deathMessages: [
    'N toilets flushed.',
    'the cameramen prevail.',
    'the toilets prevailed. you are flushed.',
    'skibidi breaker: broken.',
    'the skibidi invasion continues.',
  ],

  /**
   * Draw city skyline battlefield background.
   */
  drawBackground(ctx, W, H) {
    // Dark sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1a1a3a');
    grad.addColorStop(1, '#0d0d2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Skyline buildings - far
    ctx.fillStyle = '#111128';
    for (let i = 0; i < 14; i++) {
      const bx = i * 32 - 10;
      const bh = 60 + (i * 37) % 100;
      ctx.fillRect(bx, H - bh, 24, bh);
    }

    // Skyline buildings - near
    ctx.fillStyle = '#1a1a40';
    for (let i = 0; i < 10; i++) {
      const bx = i * 45 - 5;
      const bh = 40 + (i * 53) % 80;
      ctx.fillRect(bx, H - bh, 34, bh);
      // Windows
      ctx.fillStyle = '#ffea0015';
      for (let wy = H - bh + 6; wy < H - 4; wy += 12) {
        for (let wx = bx + 4; wx < bx + 30; wx += 8) {
          ctx.fillRect(wx, wy, 3, 5);
        }
      }
      ctx.fillStyle = '#1a1a40';
    }
  },

  /**
   * Draw skibidi toilet brick.
   */
  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    // Toilet shape
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    // Bowl
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, w * 0.2, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tank
    ctx.fillRect(cx - w * 0.12, cy - h * 0.35, w * 0.24, h * 0.35);

    // 2-hit indicator
    if (hp === 2) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.lineWidth = 1;
    }
  },

  /**
   * Draw cameraman TV head paddle.
   */
  drawPaddle(ctx, x, y, w, h) {
    // TV head body
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();

    // Screen
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(x + 3, y + 2, w - 6, h - 4);

    // Screen glow
    ctx.fillStyle = '#00e5ff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + 3, y + 2, w - 6, h - 4);
    ctx.globalAlpha = 1;

    // Antenna
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2 - 6, y - 5);
    ctx.stroke();
    ctx.lineWidth = 1;
  },

  /**
   * Draw camera lens ball.
   */
  drawBall(ctx, x, y, r) {
    // Blue lens body
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Lens ring
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;

    // White reflection dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  },
};

// ---- Exported theme list ----

export const THEMES = [npcTheme, ohioTheme, skibidiTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
