/**
 * MEME CUT -- Renderer
 * All canvas drawing logic: ropes, candy, target, stars, HUD, particles.
 */

import { loadThemeColors } from '../../shared/theme-utils.js';

const W = 400;
const H = 700;

/** Color palette -- grayscale defaults, themed via CSS custom properties */
const COLORS = loadThemeColors({
  bg:             { css: '--game-bg',              fallback: '#1a1a1a' },
  gridLine:       { css: '--game-grid-line',       fallback: 'rgba(255, 255, 255, 0.03)' },
  target:         { css: '--game-target',          fallback: '#aaaaaa' },
  targetOutline:  { css: '--game-target-outline',  fallback: '#888888' },
  targetMouth:    { css: '--game-target-mouth',    fallback: '#666666' },
  targetTongue:   { css: '--game-target-tongue',   fallback: '#888888' },
  star:           { css: '--game-star',            fallback: '#cccccc' },
  starOutline:    { css: '--game-star-outline',    fallback: '#999999' },
  rope:           { css: '--game-rope',            fallback: '#999999' },
  ropeTexture:    { css: '--game-rope-texture',    fallback: 'rgba(80, 80, 80, 0.3)' },
  anchor:         { css: '--game-anchor',          fallback: '#888888' },
  anchorInner:    { css: '--game-anchor-inner',    fallback: '#666666' },
  candyLight:     { css: '--game-candy-light',     fallback: '#aaaaaa' },
  candy:          { css: '--game-candy',           fallback: '#888888' },
  candyDark:      { css: '--game-candy-dark',      fallback: '#666666' },
  candyWrapper:   { css: '--game-candy-wrapper',   fallback: '#888888' },
  lossText:       { css: '--game-loss-text',       fallback: '#888888' },
  hudText:        { css: '--game-hud-text',        fallback: '#ffffff' },
  bannerSub:      { css: '--game-banner-sub',      fallback: '#aaaaaa' },
});

/**
 * Draw a 5-pointed star shape at (cx, cy) with given radius.
 */
function drawStar(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Draw the full game frame.
 */
export function render(ctx, game, frameCount) {
  const info = game.getInfo();

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  // Background grid pattern
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Draw target (green character with mouth)
  _drawTarget(ctx, game.target, frameCount);

  // Draw stars
  for (const star of game.stars) {
    if (star.collected) {
      if (star.animTimer > 0) {
        const scale = 1 + (20 - star.animTimer) * 0.1;
        const alpha = star.animTimer / 20;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(star.x, star.y);
        ctx.scale(scale, scale);
        ctx.fillStyle = COLORS.star;
        drawStar(ctx, 0, 0, 18, 8);
        ctx.fill();
        ctx.restore();
      }
      continue;
    }
    _drawStarItem(ctx, star, frameCount);
  }

  // Draw ropes
  for (const rope of game.ropes) {
    if (rope.cut) {
      // Draw dangling rope from anchor (short stub)
      _drawCutRope(ctx, rope, frameCount);
      continue;
    }
    _drawRope(ctx, rope, game.candy);
  }

  // Draw candy
  if (game.state === 'playing' || game.state === 'lost') {
    _drawCandy(ctx, game.candy, frameCount);
  }

  // Draw particles
  for (const p of game.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw swipe trail
  if (game.swipeTrail.length > 1) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const trail = game.swipeTrail;
    // Only draw last 10 points for a short trail
    const start = Math.max(0, trail.length - 10);
    ctx.moveTo(trail[start].x, trail[start].y);
    for (let i = start + 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  }

  // HUD
  _drawHUD(ctx, info);

  // Level banner
  if (game.showLevelBanner) {
    _drawLevelBanner(ctx, info.level, info.totalLevels, game.bannerTimer);
  }

  // Transition overlay (level complete)
  if (game.state === 'transition') {
    _drawTransition(ctx, info, game.transitionTimer);
  }

  // Loss overlay
  if (game.state === 'lost') {
    _drawLossOverlay(ctx);
  }
}

function _drawTarget(ctx, target, frameCount) {
  const { x, y } = target;

  // Body
  ctx.fillStyle = COLORS.target;
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.fill();

  // Outline
  ctx.strokeStyle = COLORS.targetOutline;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 9, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 9, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(x - 8, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 10, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (open, animated)
  const mouthOpen = 4 + Math.sin(frameCount * 0.08) * 2;
  ctx.fillStyle = COLORS.targetMouth;
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 10, mouthOpen + 4, 0, 0, Math.PI);
  ctx.fill();

  // Tongue
  ctx.fillStyle = COLORS.targetTongue;
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 12 + mouthOpen * 0.3, 5, 3, 0, 0, Math.PI);
  ctx.fill();
}

function _drawStarItem(ctx, star, frameCount) {
  const bob = Math.sin(frameCount * 0.06 + star.x * 0.1) * 3;
  const glow = 0.3 + Math.sin(frameCount * 0.1) * 0.15;

  // Glow
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = COLORS.star;
  ctx.beginPath();
  ctx.arc(star.x, star.y + bob, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Star shape
  ctx.fillStyle = COLORS.star;
  drawStar(ctx, star.x, star.y + bob, 18, 8);
  ctx.fill();

  // Star outline
  ctx.strokeStyle = COLORS.starOutline;
  ctx.lineWidth = 2;
  drawStar(ctx, star.x, star.y + bob, 18, 8);
  ctx.stroke();

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(star.x - 4, star.y + bob - 5, 4, 0, Math.PI * 2);
  ctx.fill();
}

function _drawRope(ctx, rope, candy) {
  // Draw rope as a segmented line with slight curve
  const ax = rope.anchorX;
  const ay = rope.anchorY;
  const cx = candy.x;
  const cy = candy.y;

  // Anchor pin
  ctx.fillStyle = COLORS.anchor;
  ctx.beginPath();
  ctx.arc(ax, ay, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.anchorInner;
  ctx.beginPath();
  ctx.arc(ax, ay, 3, 0, Math.PI * 2);
  ctx.fill();

  // Rope line (slight sag via quadratic bezier)
  const midX = (ax + cx) / 2;
  const midY = (ay + cy) / 2 + 8; // slight sag
  ctx.strokeStyle = COLORS.rope;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.quadraticCurveTo(midX, midY, cx, cy);
  ctx.stroke();

  // Rope texture (darker stripes)
  ctx.strokeStyle = COLORS.ropeTexture;
  ctx.lineWidth = 1;
  const segments = 8;
  for (let i = 1; i < segments; i += 2) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    // Points along quadratic bezier
    const p1x = (1 - t1) * (1 - t1) * ax + 2 * (1 - t1) * t1 * midX + t1 * t1 * cx;
    const p1y = (1 - t1) * (1 - t1) * ay + 2 * (1 - t1) * t1 * midY + t1 * t1 * cy;
    const p2x = (1 - t2) * (1 - t2) * ax + 2 * (1 - t2) * t2 * midX + t2 * t2 * cx;
    const p2y = (1 - t2) * (1 - t2) * ay + 2 * (1 - t2) * t2 * midY + t2 * t2 * cy;
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
  }
}

function _drawCutRope(ctx, rope, frameCount) {
  // Draw a short dangling stub from the anchor
  const stubLen = 20;
  const ax = rope.anchorX;
  const ay = rope.anchorY;

  ctx.fillStyle = COLORS.anchor;
  ctx.beginPath();
  ctx.arc(ax, ay, 6, 0, Math.PI * 2);
  ctx.fill();

  // Gentle sway using sin for deterministic motion
  const sway = Math.sin(frameCount * 0.05 + rope.anchorX) * 4;
  ctx.strokeStyle = COLORS.rope;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + sway, ay + stubLen);
  ctx.stroke();
}

function _drawCandy(ctx, candy, frameCount) {
  const { x, y } = candy;
  const wobble = Math.sin(frameCount * 0.15) * 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 2, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Candy body (wrapped candy shape)
  // Main circle
  const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, 18);
  grad.addColorStop(0, COLORS.candyLight);
  grad.addColorStop(0.6, COLORS.candy);
  grad.addColorStop(1, COLORS.candyDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  // Candy wrapper ends (left)
  ctx.fillStyle = COLORS.candyWrapper;
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 4);
  ctx.lineTo(x - 28 + wobble, y - 10);
  ctx.lineTo(x - 26 + wobble, y - 2);
  ctx.lineTo(x - 28 + wobble, y + 6);
  ctx.lineTo(x - 16, y + 4);
  ctx.closePath();
  ctx.fill();

  // Wrapper end (right)
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 4);
  ctx.lineTo(x + 28 - wobble, y - 10);
  ctx.lineTo(x + 26 - wobble, y - 2);
  ctx.lineTo(x + 28 - wobble, y + 6);
  ctx.lineTo(x + 16, y + 4);
  ctx.closePath();
  ctx.fill();

  // Candy stripes
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12, -0.5, 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 12, 2.1, 3.1);
  ctx.stroke();

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(x - 5, y - 7, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function _drawHUD(ctx, info) {
  // Level indicator
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 36);

  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`LVL ${info.level}/${info.totalLevels}`, 10, 24);

  // Score
  ctx.textAlign = 'right';
  ctx.fillText(`${info.score}`, W - 10, 24);

  // Stars for current level
  ctx.textAlign = 'center';
  const starStr = [];
  for (let i = 0; i < info.starsTotal; i++) {
    starStr.push(i < info.starsCollected ? '\u2605' : '\u2606');
  }
  ctx.fillStyle = COLORS.star;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(starStr.join(' '), W / 2, 26);
}

function _drawLevelBanner(ctx, level, total, timer) {
  const alpha = Math.min(1, timer / 30);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Backdrop
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);

  // Banner
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level}`, W / 2, H / 2 - 20);

  ctx.font = '18px monospace';
  ctx.fillStyle = COLORS.bannerSub;
  ctx.fillText('swipe to cut the ropes!', W / 2, H / 2 + 20);

  ctx.restore();
}

function _drawTransition(ctx, info, timer) {
  const alpha = Math.min(1, (60 - timer) / 30);

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COLORS.target;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NOM NOM!', W / 2, H / 2 - 30);

  ctx.fillStyle = COLORS.star;
  ctx.font = 'bold 20px monospace';
  const starDisplay = [];
  for (let i = 0; i < info.starsTotal; i++) {
    starDisplay.push(i < info.starsCollected ? '\u2605' : '\u2606');
  }
  ctx.fillText(starDisplay.join(' '), W / 2, H / 2 + 10);

  ctx.fillStyle = COLORS.hudText;
  ctx.font = '16px monospace';
  ctx.fillText(`+${100 + info.starsCollected * 50}`, W / 2, H / 2 + 40);

  ctx.restore();
}

function _drawLossOverlay(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.fillStyle = COLORS.lossText;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MISSED!', W / 2, H / 2 - 10);

  ctx.fillStyle = COLORS.bannerSub;
  ctx.font = '16px monospace';
  ctx.fillText('the candy fell...', W / 2, H / 2 + 20);
}
