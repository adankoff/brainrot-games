/**
 * ANIME CLICKER -- Renderer
 * All canvas drawing: background, tap target, upgrades, currency, prestige, floating text.
 * Cloned structure from game-03, with anime-themed tap target drawings.
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

// ---- Module State ----

/** Total taps tracked for JoJo pose changes */
let totalTaps = 0;

/** Milestone flash state for Dragon Ball */
let milestoneFlashAlpha = 0;
let milestoneFlashText = '';

// ---- Floating Background Symbols ----

/** @type {Array<{ x: number, y: number, speed: number, alpha: number, symbol: string, size: number }>} */
let bgSymbols = [];

/**
 * Initialize floating background symbols for a theme.
 *
 * @param {string[]} symbols - Array of symbol characters
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

  // Milestone flash fade
  if (milestoneFlashAlpha > 0) {
    milestoneFlashAlpha -= 0.008 * dt;
    if (milestoneFlashAlpha < 0) milestoneFlashAlpha = 0;
  }
}

/**
 * Increment the tap counter (used by JoJo pose cycling).
 */
export function registerTap() {
  totalTaps++;
}

/**
 * Trigger a Dragon Ball milestone flash.
 *
 * @param {string} text - Milestone text to show
 */
export function triggerMilestoneFlash(text) {
  milestoneFlashText = text;
  milestoneFlashAlpha = 1;
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
 * @param {number} totalEarned - Total earned (for aura tier in Dragon Ball)
 */
export function drawTapTarget(ctx, theme, bounceScale, tapTime, totalEarned) {
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

  if (theme.id === 'dragonball') {
    drawDragonBallTarget(ctx, colors, tapTime, bounceScale, totalEarned || 0, theme);
  } else if (theme.id === 'jojo') {
    drawJoJoTarget(ctx, colors, tapTime, bounceScale);
  } else if (theme.id === 'naruto') {
    drawNarutoTarget(ctx, colors, tapTime, bounceScale);
  }

  ctx.restore();
}

// ---- Dragon Ball Tap Target ----

/**
 * Draw Dragon Ball theme: stick figure silhouette with ki aura.
 * Aura color changes with power level tiers.
 */
function drawDragonBallTarget(ctx, colors, tapTime, bounceScale, totalEarned, theme) {
  // Determine aura color from tiers
  let auraColor = '#ffffff';
  const tiers = theme.auraTiers;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalEarned >= tiers[i].threshold) {
      auraColor = tiers[i].color;
      break;
    }
  }

  // Aura glow (outer)
  const auraSize = TAP_TARGET_RADIUS + 4 + Math.sin(tapTime * 0.004) * 6;
  const auraFlash = bounceScale > 1.01 ? 1.3 : 1;
  ctx.save();
  ctx.globalAlpha = 0.12 * auraFlash;
  ctx.beginPath();
  ctx.ellipse(0, 0, auraSize * auraFlash, (auraSize + 10) * auraFlash, 0, 0, Math.PI * 2);
  ctx.fillStyle = auraColor;
  ctx.fill();
  ctx.restore();

  // Aura glow (inner)
  ctx.save();
  ctx.globalAlpha = 0.2 * auraFlash;
  ctx.beginPath();
  ctx.ellipse(0, 0, auraSize * 0.65 * auraFlash, (auraSize * 0.65 + 6) * auraFlash, 0, 0, Math.PI * 2);
  ctx.fillStyle = auraColor;
  ctx.fill();
  ctx.restore();

  // Aura flicker lines
  ctx.save();
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.25 + Math.sin(tapTime * 0.006) * 0.15;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i + tapTime * 0.001;
    const innerR = 30 + Math.sin(tapTime * 0.005 + i) * 5;
    const outerR = 50 + Math.sin(tapTime * 0.003 + i * 2) * 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
    ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
    ctx.stroke();
  }
  ctx.restore();

  // Stick figure silhouette -- ki charging pose (arms at sides, legs apart)
  ctx.fillStyle = '#1a1a1a';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(0, -28, 10, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // Arms at sides, slightly out (charging pose)
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-18, 5);
  ctx.lineTo(-22, 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(18, 5);
  ctx.lineTo(22, 15);
  ctx.stroke();

  // Legs apart
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-14, 35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(14, 35);
  ctx.stroke();

  // "TAP TO POWER UP" text
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.accent;
  ctx.fillText('TAP TO POWER UP', 0, 52);
}

// ---- JoJo Tap Target ----

/** JoJo pose definitions -- angular dramatic poses */
const JOJO_POSES = [
  // Pose 0: Classic point forward
  function (ctx) {
    // Head
    ctx.beginPath();
    ctx.arc(0, -30, 10, 0, Math.PI * 2);
    ctx.fill();
    // Torso (slight lean)
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-4, 10);
    ctx.stroke();
    // Left arm pointing dramatically forward
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(-28, -15);
    ctx.lineTo(-38, -20);
    ctx.stroke();
    // Right arm on hip
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.lineTo(16, 0);
    ctx.lineTo(12, 10);
    ctx.stroke();
    // Left leg forward
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(-16, 35);
    ctx.stroke();
    // Right leg back
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(12, 35);
    ctx.stroke();
  },
  // Pose 1: Arms crossed, wide stance
  function (ctx) {
    // Head
    ctx.beginPath();
    ctx.arc(0, -30, 10, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 10);
    ctx.stroke();
    // Arms crossed over chest
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-20, -5);
    ctx.lineTo(10, -14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(20, -5);
    ctx.lineTo(-10, -14);
    ctx.stroke();
    // Wide stance legs
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-22, 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(22, 35);
    ctx.stroke();
  },
  // Pose 2: Dramatic lean back, hand out
  function (ctx) {
    // Head (tilted)
    ctx.beginPath();
    ctx.arc(5, -28, 10, 0, Math.PI * 2);
    ctx.fill();
    // Torso leaning back
    ctx.beginPath();
    ctx.moveTo(5, -18);
    ctx.lineTo(-5, 12);
    ctx.stroke();
    // Left arm reaching up
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(-25, -30);
    ctx.lineTo(-30, -40);
    ctx.stroke();
    // Right arm out to side
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(28, 0);
    ctx.lineTo(35, -5);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(-18, 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(8, 35);
    ctx.stroke();
  },
  // Pose 3: Power stance, fists clenched at sides
  function (ctx) {
    // Head
    ctx.beginPath();
    ctx.arc(0, -30, 10, 0, Math.PI * 2);
    ctx.fill();
    // Torso (broad)
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 10);
    ctx.stroke();
    // Shoulder width
    ctx.beginPath();
    ctx.moveTo(-16, -14);
    ctx.lineTo(16, -14);
    ctx.stroke();
    // Arms down, fists clenched (small circles)
    ctx.beginPath();
    ctx.moveTo(-16, -14);
    ctx.lineTo(-22, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-22, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -14);
    ctx.lineTo(22, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-14, 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(14, 35);
    ctx.stroke();
  },
];

/**
 * Draw JoJo theme: dramatic pose silhouette with menacing symbols.
 */
function drawJoJoTarget(ctx, colors, tapTime, bounceScale) {
  // Pose selection based on tap count
  const poseIndex = Math.floor(totalTaps / 50) % JOJO_POSES.length;

  // Menacing symbols around the figure
  ctx.save();
  ctx.font = 'bold 22px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.menacingGold || colors.tapTargetHighlight;

  const menacingCount = bounceScale > 1.01 ? 6 : 3;
  for (let i = 0; i < menacingCount; i++) {
    const angle = (Math.PI * 2 / menacingCount) * i + tapTime * 0.0008;
    const dist = 50 + Math.sin(tapTime * 0.003 + i * 1.5) * 8;
    const mx = Math.cos(angle) * dist;
    const my = Math.sin(angle) * dist;
    ctx.globalAlpha = 0.4 + Math.sin(tapTime * 0.004 + i) * 0.2;
    ctx.fillText('\u30B4', mx, my);
  }
  ctx.restore();

  // Draw the silhouette figure
  ctx.fillStyle = colors.tapTargetPrimary;
  ctx.strokeStyle = colors.tapTargetPrimary;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  JOJO_POSES[poseIndex](ctx);

  // "TAP TO POSE" text
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fillText('TAP TO POSE', 0, 52);
}

// ---- Naruto Tap Target ----

/**
 * Draw Naruto theme: hands forming jutsu seal with chakra swirl.
 */
function drawNarutoTarget(ctx, colors, tapTime, bounceScale) {
  // Chakra aura swirl (grows with bounce)
  const swirlScale = bounceScale > 1.01 ? 1.4 : 1;
  ctx.save();
  ctx.strokeStyle = colors.chakraBlue || colors.tapTargetPrimary;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.3;
  const spirals = 3;
  for (let s = 0; s < spirals; s++) {
    ctx.beginPath();
    const offset = (Math.PI * 2 / spirals) * s + tapTime * 0.002;
    for (let t = 0; t < 40; t++) {
      const angle = offset + t * 0.25;
      const r = (3 + t * 1.2) * swirlScale;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Chakra glow burst on tap
  if (bounceScale > 1.01) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, 45 * bounceScale, 0, Math.PI * 2);
    ctx.fillStyle = colors.chakraBlue || colors.tapTargetPrimary;
    ctx.fill();
    ctx.restore();
  }

  // Draw hands forming seal
  const handColor = '#c8a882';
  const outlineColor = '#8a6e50';

  // Left hand (mirrored)
  ctx.save();
  ctx.translate(-6, 0);
  drawHandSeal(ctx, handColor, outlineColor, true);
  ctx.restore();

  // Right hand
  ctx.save();
  ctx.translate(6, 0);
  drawHandSeal(ctx, handColor, outlineColor, false);
  ctx.restore();

  // Finger tips touching (center connection lines)
  ctx.strokeStyle = handColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2, -20);
  ctx.lineTo(2, -20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, -10);
  ctx.lineTo(2, -10);
  ctx.stroke();

  // "TAP TO CAST JUTSU" text
  ctx.font = 'bold 11px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.tapTargetHighlight;
  ctx.fillText('TAP TO CAST JUTSU', 0, 52);
}

/**
 * Draw one hand of a jutsu seal (simplified side view).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} fill - Hand skin color
 * @param {string} outline - Outline color
 * @param {boolean} isLeft - Mirror for left hand
 */
function drawHandSeal(ctx, fill, outline, isLeft) {
  const dir = isLeft ? -1 : 1;

  ctx.fillStyle = fill;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.5;

  // Palm
  ctx.beginPath();
  ctx.ellipse(dir * 10, 8, 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fingers (4 fingers pointing up, pressed together)
  for (let i = 0; i < 4; i++) {
    const fx = dir * (4 + i * 4.5);
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(fx - 2.5, -24 + i * 1.5, 5, 22 - i * 1.5, 2)
      : (() => {
          ctx.rect(fx - 2.5, -24 + i * 1.5, 5, 22 - i * 1.5);
        })();
    ctx.fill();
    ctx.stroke();
  }

  // Thumb (angled outward)
  ctx.beginPath();
  ctx.ellipse(dir * 24, 2, 4, 9, dir * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
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
 * Draw the Dragon Ball milestone flash ("IT'S OVER 9000!" etc.).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} colors - Theme colors
 */
export function drawMilestoneFlash(ctx, colors) {
  if (milestoneFlashAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = milestoneFlashAlpha;
  ctx.font = 'bold 26px "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.accent || '#ffd700';
  ctx.shadowColor = colors.accentGlow || 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText(milestoneFlashText, W / 2, 140);
  ctx.shadowBlur = 0;
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
