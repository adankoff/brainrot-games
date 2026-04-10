/**
 * MEME CLICKER -- Renderer
 * All canvas drawing: background, tap target, upgrades, currency, prestige, floating text.
 * Theme-specific tap targets: Popcat, Doge, Chill Guy.
 */

import { getUpgradeCost, getPrestigeMultiplier } from './upgrades.js';

// ---- Constants ----

const W = 400;
const H = 700;

const TAP_TARGET_Y = 170;
const TAP_TARGET_RADIUS = 65;
const CURRENCY_Y = 30;
const CURRENCY_NAME_Y = 68;
const PRODUCTION_Y = 88;
const UPGRADE_START_Y = 320;
const UPGRADE_ROW_HEIGHT = 60;
const UPGRADE_PADDING_X = 16;
const PRESTIGE_BTN_Y = 640;
const PRESTIGE_BTN_W = 260;
const PRESTIGE_BTN_H = 44;

// ---- Floating Background Symbols ----

/** @type {Array<{ x: number, y: number, speed: number, alpha: number, symbol: string, size: number }>} */
let bgSymbols = [];

/**
 * Initialize floating background symbols for a theme.
 *
 * @param {string[]} symbols - Array of symbol characters/emojis
 */
export function initBgSymbols(symbols) {
  bgSymbols = [];
  for (let i = 0; i < 18; i++) {
    bgSymbols.push({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.2 + Math.random() * 0.4,
      alpha: 0.06 + Math.random() * 0.1,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: 16 + Math.random() * 20,
    });
  }
}

/**
 * Update floating background symbol positions.
 *
 * @param {number} dt - Delta time (1.0 = one frame at 60fps)
 */
export function updateBgSymbols(dt) {
  for (const s of bgSymbols) {
    s.y -= s.speed * dt;
    if (s.y < -30) {
      s.y = H + 30;
      s.x = Math.random() * W;
    }
  }
}

// ---- Floating Text Effects ----

/** @type {Array<{ x: number, y: number, text: string, alpha: number, vy: number, life: number, color: string }>} */
let floatingTexts = [];

/**
 * Spawn a floating "+N" text effect.
 *
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} text - Text to display
 * @param {string} color - Fill color
 */
export function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({
    x: x + (Math.random() - 0.5) * 40,
    y,
    text,
    alpha: 1,
    vy: -1.5,
    life: 60,
    color,
  });
}

/**
 * Update all floating text effects.
 *
 * @param {number} dt
 */
export function updateFloatingTexts(dt) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    ft.alpha = Math.max(0, ft.life / 60);
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

// ---- Doge "wow" floating text effect ----

/** @type {Array<{ x: number, y: number, text: string, alpha: number, life: number, size: number, color: string }>} */
let dogeWords = [];

/**
 * Spawn a floating Doge meme word near the tap target.
 */
export function spawnDogeWord() {
  const words = ['wow', 'such click', 'very coin', 'much mine', 'amaze', 'so crypto'];
  const colors = ['#ff6600', '#ff0066', '#0066ff', '#00cc44', '#cc00ff', '#ffd700'];
  dogeWords.push({
    x: W / 2 + (Math.random() - 0.5) * 160,
    y: TAP_TARGET_Y - 30 + (Math.random() - 0.5) * 80,
    text: words[Math.floor(Math.random() * words.length)],
    alpha: 1,
    life: 50,
    size: 12 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
  });
}

/**
 * Update Doge floating words.
 *
 * @param {number} dt
 */
export function updateDogeWords(dt) {
  for (let i = dogeWords.length - 1; i >= 0; i--) {
    const dw = dogeWords[i];
    dw.life -= dt;
    dw.alpha = Math.max(0, dw.life / 50);
    dw.y -= 0.3 * dt;
    if (dw.life <= 0) {
      dogeWords.splice(i, 1);
    }
  }
}

// ---- Number Formatting ----

/**
 * Format a number with abbreviations for large values.
 *
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (abs >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString('en-US');
}

// ---- Drawing Functions ----

/**
 * Draw the themed gradient background with floating symbols.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} colors - Theme color set
 * @param {string} themeId - Current theme ID for special rendering
 */
export function drawBackground(ctx, colors, themeId) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colors.bgTop);
  grad.addColorStop(1, colors.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Floating symbols
  for (const s of bgSymbols) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    if (themeId === 'doge') {
      // Doge uses Comic Sans for the floating meme words
      ctx.font = `italic bold ${s.size}px "Comic Sans MS", "Comic Sans", cursive`;
    } else {
      ctx.font = `${s.size}px "Space Grotesk", sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.accent;
    ctx.fillText(s.symbol, s.x, s.y);
    ctx.restore();
  }
}

/**
 * Draw the currency display at the top of the screen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} theme - Current theme
 * @param {number} currency - Current currency amount
 * @param {number} productionPerSec - Production per second
 * @param {number} prestigeTokens - Current prestige token count
 */
export function drawCurrencyDisplay(ctx, theme, currency, productionPerSec, prestigeTokens) {
  const colors = theme.colors;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Main currency
  ctx.font = 'bold 36px "Bungee", sans-serif';
  ctx.fillStyle = colors.currencyColor;
  ctx.shadowColor = colors.accentGlow;
  ctx.shadowBlur = 20;
  ctx.fillText(formatNumber(currency), W / 2, CURRENCY_Y);
  ctx.shadowBlur = 0;

  // Currency name
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.fillStyle = colors.textSecondary;
  ctx.fillText(theme.currencyName, W / 2, CURRENCY_NAME_Y);

  // Production rate
  if (productionPerSec > 0) {
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(formatNumber(productionPerSec) + '/sec', W / 2, PRODUCTION_Y);
  }

  // Prestige tokens (top-right)
  if (prestigeTokens > 0) {
    ctx.textAlign = 'right';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = colors.prestigeColor;
    ctx.fillText(
      prestigeTokens + ' ' + theme.prestigeName + ' (x' + getPrestigeMultiplier(prestigeTokens).toFixed(1) + ')',
      W - 12,
      12
    );
  }

  ctx.restore();
}

/**
 * Draw the tap target with bounce animation.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} theme - Current theme
 * @param {number} bounceScale - 1.0 = normal, > 1.0 = bouncing
 * @param {number} tapTime - Elapsed time for idle animation (ms)
 * @param {number} mouthOpen - 0.0 = closed, 1.0 = fully open (Popcat)
 */
export function drawTapTarget(ctx, theme, bounceScale, tapTime, mouthOpen) {
  const cx = W / 2;
  const cy = TAP_TARGET_Y;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(bounceScale, bounceScale);

  // Idle breathing
  const breathe = 1 + Math.sin(tapTime * 0.002) * 0.02;
  ctx.scale(breathe, breathe);

  // Glow ring
  const colors = theme.colors;
  ctx.beginPath();
  ctx.arc(0, 0, TAP_TARGET_RADIUS + 8, 0, Math.PI * 2);
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.15 + Math.sin(tapTime * 0.003) * 0.1;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (theme.id === 'popcat') {
    drawPopcatTapTarget(ctx, colors, mouthOpen);
  } else if (theme.id === 'doge') {
    drawDogeTapTarget(ctx, colors, tapTime);
  } else if (theme.id === 'chillguy') {
    drawChillGuyTapTarget(ctx, colors, tapTime);
  }

  ctx.restore();

  // Draw Doge floating words on top (outside transform)
  if (theme.id === 'doge') {
    drawDogeWords(ctx);
  }
}

/**
 * Draw Popcat tap target: white cat face with opening mouth.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} colors
 * @param {number} mouthOpen - 0.0 to 1.0
 */
function drawPopcatTapTarget(ctx, colors, mouthOpen) {
  const mouthAmount = mouthOpen;

  // Head - white circle, shifts up when mouth opens
  const headShift = -mouthAmount * 8;

  // Ears
  ctx.fillStyle = '#ffffff';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(-32, -30 + headShift);
  ctx.lineTo(-42, -58 + headShift);
  ctx.lineTo(-12, -38 + headShift);
  ctx.closePath();
  ctx.fill();
  // Left ear inner
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.moveTo(-30, -32 + headShift);
  ctx.lineTo(-38, -52 + headShift);
  ctx.lineTo(-16, -38 + headShift);
  ctx.closePath();
  ctx.fill();

  // Right ear
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(32, -30 + headShift);
  ctx.lineTo(42, -58 + headShift);
  ctx.lineTo(12, -38 + headShift);
  ctx.closePath();
  ctx.fill();
  // Right ear inner
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.moveTo(30, -32 + headShift);
  ctx.lineTo(38, -52 + headShift);
  ctx.lineTo(16, -38 + headShift);
  ctx.closePath();
  ctx.fill();

  // Upper head (white circle, top half)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -5 + headShift, 40, Math.PI, 0);
  ctx.lineTo(40, 0 + headShift);
  ctx.lineTo(-40, 0 + headShift);
  ctx.closePath();
  ctx.fill();

  // Mouth interior (pink/red opening)
  if (mouthAmount > 0.05) {
    const mouthH = mouthAmount * 30;
    ctx.fillStyle = '#cc2244';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tongue
    if (mouthAmount > 0.3) {
      ctx.fillStyle = '#ff6688';
      ctx.beginPath();
      ctx.ellipse(0, mouthH * 0.4, 16, mouthH * 0.5, 0, 0, Math.PI);
      ctx.fill();
    }
  }

  // Lower jaw (white, below mouth)
  const jawShift = mouthAmount * 8;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 5 + jawShift, 38, 0, Math.PI);
  ctx.lineTo(-38, 0 + jawShift);
  ctx.lineTo(38, 0 + jawShift);
  ctx.closePath();
  ctx.fill();

  // Eyes - big, round, GREEN per spec
  const eyeY = -18 + headShift;
  // Left eye (green)
  ctx.fillStyle = '#66ff66';
  ctx.beginPath();
  ctx.ellipse(-16, eyeY, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#228b22';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Left pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(-16, eyeY, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Left eye highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-13, eyeY - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye (green)
  ctx.fillStyle = '#66ff66';
  ctx.beginPath();
  ctx.ellipse(16, eyeY, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#228b22';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Right pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(16, eyeY, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right eye highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(19, eyeY - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose (tiny pink triangle)
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.moveTo(-3, -5 + headShift);
  ctx.lineTo(3, -5 + headShift);
  ctx.lineTo(0, -2 + headShift);
  ctx.closePath();
  ctx.fill();

  // "POP!" text below
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.accent;
  ctx.fillText('TAP TO POP', 0, 52);
}

/**
 * Draw Doge (Shiba Inu) tap target.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} colors
 * @param {number} tapTime
 */
function drawDogeTapTarget(ctx, colors, tapTime) {
  // Outer face (tan circle)
  ctx.fillStyle = '#c4a265';
  ctx.beginPath();
  ctx.arc(0, -2, 45, 0, Math.PI * 2);
  ctx.fill();

  // Inner face (lighter tan)
  ctx.fillStyle = '#e8d4a0';
  ctx.beginPath();
  ctx.ellipse(0, 8, 32, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears (triangular, darker tan)
  ctx.fillStyle = '#a08040';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(-28, -30);
  ctx.lineTo(-42, -55);
  ctx.lineTo(-14, -38);
  ctx.closePath();
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(28, -30);
  ctx.lineTo(42, -55);
  ctx.lineTo(14, -38);
  ctx.closePath();
  ctx.fill();

  // Eyes (small, round, knowing doge stare)
  ctx.fillStyle = '#2a1a0a';
  ctx.beginPath();
  ctx.arc(-14, -8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, -8, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-12, -10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, -10, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (slightly raised, such concern)
  ctx.strokeStyle = '#8a6020';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -17);
  ctx.quadraticCurveTo(-14, -22, -6, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(22, -17);
  ctx.quadraticCurveTo(14, -22, 6, -18);
  ctx.stroke();

  // Nose (black dot)
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath();
  ctx.ellipse(0, 8, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (slight smile)
  ctx.strokeStyle = '#3a2a10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 13);
  ctx.lineTo(-8, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 13);
  ctx.lineTo(8, 18);
  ctx.stroke();

  // "much click" text below
  ctx.font = 'italic bold 11px "Comic Sans MS", "Comic Sans", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fillText('much click. very coin.', 0, 52);
}

/**
 * Draw Chill Guy (laid-back dog) tap target.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} colors
 * @param {number} tapTime
 */
function drawChillGuyTapTarget(ctx, colors, tapTime) {
  // Body / sweater (blue rectangle area, rounded)
  ctx.fillStyle = '#4a90d9';
  roundRect(ctx, -28, 8, 56, 40, 8);
  ctx.fill();

  // Sweater neckline
  ctx.fillStyle = '#3a78b8';
  ctx.beginPath();
  ctx.arc(0, 10, 12, 0, Math.PI);
  ctx.fill();

  // Head (brown circle)
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(0, -10, 35, 0, Math.PI * 2);
  ctx.fill();

  // Lighter face area (snout region)
  ctx.fillStyle = '#a0623a';
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floppy ears
  ctx.fillStyle = '#6a3410';
  // Left floppy ear
  ctx.beginPath();
  ctx.ellipse(-30, -8, 12, 22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Right floppy ear
  ctx.beginPath();
  ctx.ellipse(30, -8, 12, 22, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (half-closed, relaxed)
  ctx.fillStyle = '#ffffff';
  // Left eye
  ctx.beginPath();
  ctx.ellipse(-12, -14, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.ellipse(12, -14, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyelids (half-closed for chill look)
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-21, -20, 18, 5);
  ctx.fillRect(3, -20, 18, 5);

  // Pupils (looking slightly down -- relaxed)
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath();
  ctx.arc(-12, -12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#2a1000';
  ctx.beginPath();
  ctx.ellipse(0, 2, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Slight smile (chill)
  ctx.strokeStyle = '#3a1a00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 6, 10, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Arms resting casually on sides
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-28, 20);
  ctx.lineTo(-36, 40);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(28, 20);
  ctx.lineTo(36, 40);
  ctx.stroke();

  // Hands (paws)
  ctx.fillStyle = '#a0623a';
  ctx.beginPath();
  ctx.arc(-36, 42, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36, 42, 5, 0, Math.PI * 2);
  ctx.fill();

  // "chill" text below
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fillText('TAP TO CHILL', 0, 56);
}

/**
 * Draw Doge floating meme words.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawDogeWords(ctx) {
  ctx.save();
  for (const dw of dogeWords) {
    ctx.globalAlpha = dw.alpha;
    ctx.font = `italic bold ${dw.size}px "Comic Sans MS", "Comic Sans", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = dw.color;
    ctx.fillText(dw.text, dw.x, dw.y);
  }
  ctx.restore();
}

/**
 * Draw the upgrade list.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} theme - Current theme
 * @param {number[]} ownedCounts
 * @param {number} currency - Current currency amount
 */
export function drawUpgradeList(ctx, theme, ownedCounts, currency) {
  const colors = theme.colors;
  const upgrades = theme.upgrades;

  ctx.save();

  // Section header
  ctx.font = 'bold 13px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.textSecondary;
  ctx.fillText('UPGRADES', W / 2, UPGRADE_START_Y - 16);

  for (let i = 0; i < upgrades.length; i++) {
    const u = upgrades[i];
    const owned = ownedCounts[i] || 0;
    const cost = getUpgradeCost(u.baseCost, owned);
    const canAfford = currency >= cost;
    const rowY = UPGRADE_START_Y + i * UPGRADE_ROW_HEIGHT;

    // Row background
    ctx.fillStyle = canAfford ? colors.upgradeRowBg : 'rgba(40, 40, 60, 0.15)';
    ctx.strokeStyle = canAfford ? colors.upgradeRowBorder : 'rgba(60, 60, 80, 0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, UPGRADE_PADDING_X, rowY, W - UPGRADE_PADDING_X * 2, UPGRADE_ROW_HEIGHT - 6, 8);
    ctx.fill();
    ctx.stroke();

    // Upgrade name
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.text : 'rgba(80, 80, 100, 0.5)';
    ctx.fillText(u.name, UPGRADE_PADDING_X + 10, rowY + 18);

    // Production info
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.textSecondary : 'rgba(80, 80, 100, 0.4)';
    ctx.fillText('+' + u.baseProduction + '/sec each', UPGRADE_PADDING_X + 10, rowY + 36);

    // Cost
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.currencyColor : 'rgba(80, 80, 100, 0.4)';
    ctx.fillText(formatNumber(cost), W - UPGRADE_PADDING_X - 10, rowY + 18);

    // Owned count
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.textSecondary : 'rgba(80, 80, 100, 0.4)';
    ctx.fillText('owned: ' + owned, W - UPGRADE_PADDING_X - 10, rowY + 36);
  }

  ctx.restore();
}

/**
 * Draw the prestige button if eligible.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} theme - Current theme
 * @param {number} currency - Current currency
 * @param {number} totalEarned - Total earned this cycle
 * @param {number} potentialTokens - Tokens to be gained
 */
export function drawPrestigeButton(ctx, theme, currency, totalEarned, potentialTokens) {
  if (currency < 1000000) return;

  const colors = theme.colors;
  const btnX = (W - PRESTIGE_BTN_W) / 2;

  ctx.save();

  // Glowing background
  ctx.fillStyle = colors.prestigeColor;
  ctx.globalAlpha = 0.15;
  roundRect(ctx, btnX - 4, PRESTIGE_BTN_Y - 4, PRESTIGE_BTN_W + 8, PRESTIGE_BTN_H + 8, 14);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Button
  ctx.fillStyle = colors.prestigeColor;
  roundRect(ctx, btnX, PRESTIGE_BTN_Y, PRESTIGE_BTN_W, PRESTIGE_BTN_H, 10);
  ctx.fill();

  // Text
  ctx.font = 'bold 14px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    theme.prestigeAction.toUpperCase() + ' (+' + potentialTokens + ')',
    W / 2,
    PRESTIGE_BTN_Y + PRESTIGE_BTN_H / 2
  );

  ctx.restore();
}

/**
 * Draw all floating text effects.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawFloatingTexts(ctx) {
  ctx.save();
  ctx.font = 'bold 18px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const ft of floatingTexts) {
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }

  ctx.restore();
}

/**
 * Draw the "tap to start" hint on the playing screen before first tap.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time - Elapsed time for pulse animation
 * @param {Object} colors - Theme colors
 */
export function drawTapHint(ctx, time, colors) {
  const pulse = 0.5 + Math.sin(time * 0.005) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + pulse * 0.6;
  ctx.font = '16px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.text;
  ctx.fillText('tap the target to earn!', W / 2, 270);
  ctx.restore();
}

/**
 * Draw offline earnings notification.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - Message text
 * @param {number} alpha - Current alpha (fades out)
 * @param {Object} colors - Theme colors
 */
export function drawOfflineNotification(ctx, text, alpha, colors) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.accent;
  ctx.fillText(text, W / 2, 112);
  ctx.restore();
}

// ---- Geometry Helpers ----

/**
 * Get the bounding box for the tap target (for hit detection).
 *
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getTapTargetBounds() {
  return {
    x: W / 2 - TAP_TARGET_RADIUS,
    y: TAP_TARGET_Y - TAP_TARGET_RADIUS,
    width: TAP_TARGET_RADIUS * 2,
    height: TAP_TARGET_RADIUS * 2,
  };
}

/**
 * Get the bounding box for an upgrade row (for hit detection).
 *
 * @param {number} index - Upgrade tier index (0-4)
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getUpgradeRowBounds(index) {
  return {
    x: UPGRADE_PADDING_X,
    y: UPGRADE_START_Y + index * UPGRADE_ROW_HEIGHT,
    width: W - UPGRADE_PADDING_X * 2,
    height: UPGRADE_ROW_HEIGHT - 6,
  };
}

/**
 * Get the bounding box for the prestige button.
 *
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getPrestigeButtonBounds() {
  return {
    x: (W - PRESTIGE_BTN_W) / 2,
    y: PRESTIGE_BTN_Y,
    width: PRESTIGE_BTN_W,
    height: PRESTIGE_BTN_H,
  };
}

// ---- Internal Utility ----

/**
 * Draw a rounded rectangle path (does not fill or stroke).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Corner radius
 */
function roundRect(ctx, x, y, w, h, r) {
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
