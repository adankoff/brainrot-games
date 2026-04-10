/**
 * SIGMA GRINDSET SIMULATOR -- Renderer
 * All canvas drawing: background, tap target, upgrades, currency, prestige, floating text.
 */

import { getUpgradeCost, getTotalProduction, getPrestigeMultiplier } from './upgrades.js';

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
 */
export function drawBackground(ctx, colors) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colors.bgTop);
  grad.addColorStop(1, colors.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Floating symbols
  for (const s of bgSymbols) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.font = `${s.size}px "Space Grotesk", sans-serif`;
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

  // Main currency
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

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
 */
export function drawTapTarget(ctx, theme, bounceScale, tapTime) {
  const cx = W / 2;
  const cy = TAP_TARGET_Y;
  const colors = theme.colors;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(bounceScale, bounceScale);

  // Idle breathing
  const breathe = 1 + Math.sin(tapTime * 0.002) * 0.02;
  ctx.scale(breathe, breathe);

  // Glow ring
  ctx.beginPath();
  ctx.arc(0, 0, TAP_TARGET_RADIUS + 8, 0, Math.PI * 2);
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.15 + Math.sin(tapTime * 0.003) * 0.1;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (theme.id === 'sigma') {
    drawSigmaTapTarget(ctx, colors);
  } else if (theme.id === 'fanum') {
    drawFanumTapTarget(ctx, colors);
  } else if (theme.id === 'brainrot') {
    drawBrainrotTapTarget(ctx, colors);
  }

  ctx.restore();
}

/**
 * Draw sigma theme tap target: a stylized jawline / mewing face.
 */
function drawSigmaTapTarget(ctx, colors) {
  // Head circle
  ctx.beginPath();
  ctx.arc(0, -8, 40, 0, Math.PI * 2);
  ctx.fillStyle = colors.tapTargetSecondary;
  ctx.fill();

  // Jawline (strong angular jaw)
  ctx.beginPath();
  ctx.moveTo(-30, 8);
  ctx.lineTo(-35, -5);
  ctx.lineTo(-25, 22);
  ctx.lineTo(-10, 38);
  ctx.lineTo(0, 42);
  ctx.lineTo(10, 38);
  ctx.lineTo(25, 22);
  ctx.lineTo(35, -5);
  ctx.lineTo(30, 8);
  ctx.closePath();
  ctx.fillStyle = colors.tapTargetPrimary;
  ctx.fill();

  // Eyes (intense, squinted)
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fillRect(-18, -18, 12, 5);
  ctx.fillRect(6, -18, 12, 5);

  // Brow line (thick, sigma)
  ctx.strokeStyle = colors.tapTargetHighlight;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, -24);
  ctx.lineTo(-4, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -26);
  ctx.lineTo(22, -24);
  ctx.stroke();

  // "MEWING" text below
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.accent;
  ctx.fillText('TAP TO MEW', 0, 52);
}

/**
 * Draw fanum theme tap target: a plate of food.
 */
function drawFanumTapTarget(ctx, colors) {
  // Plate (ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 10, 55, 35, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e8e0d8';
  ctx.fill();
  ctx.strokeStyle = '#c8bfb4';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Plate inner ring
  ctx.beginPath();
  ctx.ellipse(0, 10, 42, 26, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#d8d0c8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Burger bun top
  ctx.beginPath();
  ctx.ellipse(0, -8, 28, 16, 0, Math.PI, 0);
  ctx.fillStyle = '#d4a050';
  ctx.fill();

  // Sesame seeds
  ctx.fillStyle = '#f0e0c0';
  ctx.fillRect(-10, -18, 4, 3);
  ctx.fillRect(3, -20, 4, 3);
  ctx.fillRect(-4, -22, 4, 3);

  // Lettuce
  ctx.fillStyle = '#60c040';
  ctx.fillRect(-25, -5, 50, 5);

  // Patty
  ctx.fillStyle = '#6b3020';
  ctx.fillRect(-24, 0, 48, 8);

  // Bun bottom
  ctx.fillStyle = '#d4a050';
  ctx.fillRect(-25, 8, 50, 8);

  // "STEAL" text
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.accent;
  ctx.fillText('TAP TO STEAL', 0, 52);
}

/**
 * Draw brainrot theme tap target: Tralalero Tralala (blue shark with legs).
 */
function drawBrainrotTapTarget(ctx, colors) {
  // Body (shark shape - oval)
  ctx.beginPath();
  ctx.ellipse(0, -5, 40, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.tapTargetPrimary;
  ctx.fill();

  // Belly
  ctx.beginPath();
  ctx.ellipse(0, 2, 30, 18, 0, 0, Math.PI);
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fill();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-5, -32);
  ctx.lineTo(0, -50);
  ctx.lineTo(12, -28);
  ctx.closePath();
  ctx.fillStyle = colors.tapTargetSecondary;
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-38, -10);
  ctx.lineTo(-55, -25);
  ctx.lineTo(-50, -5);
  ctx.lineTo(-55, 15);
  ctx.lineTo(-38, 5);
  ctx.closePath();
  ctx.fillStyle = colors.tapTargetSecondary;
  ctx.fill();

  // Eyes (big, cartoonish)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(14, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, -10, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(16, -13, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(32, -9, 4, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(22, 0, 14, 0.1, Math.PI - 0.1);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Legs (the signature)
  ctx.strokeStyle = colors.tapTargetPrimary;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  // Left leg
  ctx.beginPath();
  ctx.moveTo(-12, 20);
  ctx.lineTo(-16, 42);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(12, 20);
  ctx.lineTo(16, 42);
  ctx.stroke();

  // Shoes (sneakers)
  ctx.fillStyle = '#ff3838';
  ctx.fillRect(-24, 38, 16, 8);
  ctx.fillRect(8, 38, 16, 8);
  // Shoe soles
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-24, 44, 16, 3);
  ctx.fillRect(8, 44, 16, 3);

  // "TAP" text
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.accent;
  ctx.fillText('TAP TO BRAINROT', 0, 56);
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
    ctx.fillStyle = canAfford ? colors.upgradeRowBg : 'rgba(40, 40, 60, 0.3)';
    ctx.strokeStyle = canAfford ? colors.upgradeRowBorder : 'rgba(60, 60, 80, 0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, UPGRADE_PADDING_X, rowY, W - UPGRADE_PADDING_X * 2, UPGRADE_ROW_HEIGHT - 6, 8);
    ctx.fill();
    ctx.stroke();

    // Upgrade name
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.text : 'rgba(240, 240, 240, 0.4)';
    ctx.fillText(u.name, UPGRADE_PADDING_X + 10, rowY + 18);

    // Production info
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.textSecondary : 'rgba(136, 136, 160, 0.4)';
    ctx.fillText('+' + u.baseProduction + '/sec each', UPGRADE_PADDING_X + 10, rowY + 36);

    // Cost
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.currencyColor : 'rgba(136, 136, 160, 0.4)';
    ctx.fillText(formatNumber(cost), W - UPGRADE_PADDING_X - 10, rowY + 18);

    // Owned count
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillStyle = canAfford ? colors.textSecondary : 'rgba(136, 136, 160, 0.4)';
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
  ctx.fillStyle = '#000000';
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
