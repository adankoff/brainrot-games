#!/usr/bin/env node
/**
 * generate-from-pack.js — Content Pack → Game Theme Generator
 *
 * Takes a content pack JSON and generates themes.js / words.js / questions.js
 * files for all 17 game mechanics, matching each game's exact import API.
 *
 * Usage:
 *   node tools/generate-from-pack.js tools/content-packs/skibidi.json
 *   node tools/generate-from-pack.js tools/content-packs/skibidi.json --dry-run
 *   node tools/generate-from-pack.js tools/content-packs/skibidi.json --out-dir output/
 *
 * Output structure (per pack):
 *   {outDir}/{packId}/
 *     game-clicker/themes.js
 *     game-runner/themes.js
 *     game-stack/themes.js
 *     game-snake/themes.js
 *     game-2048/themes.js
 *     game-ninja/themes.js
 *     game-breakout/themes.js
 *     game-dash/themes.js
 *     game-flappy/themes.js
 *     game-whack/themes.js
 *     game-piano/themes.js
 *     game-colorswitch/themes.js
 *     game-wordle/words.js
 *     game-memory/themes.js
 *     game-hangman/words.js
 *     game-papertoss/themes.js
 *     game-trivia/questions.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// =====================================================================
// CLI
// =====================================================================

const args = process.argv.slice(2);
const packPath = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const outDirArg = args.find(a => a.startsWith('--out-dir='));
const baseOutDir = outDirArg ? outDirArg.split('=')[1] : 'tools/generated-themes';

if (!packPath) {
  console.error('Usage: node tools/generate-from-pack.js <pack.json> [--dry-run] [--out-dir=path]');
  process.exit(1);
}

let pack;
try {
  pack = JSON.parse(readFileSync(packPath, 'utf-8'));
} catch (e) {
  console.error(`Failed to read pack: ${e.message}`);
  process.exit(1);
}

const P = pack;  // shorthand
const outDir = join(baseOutDir, P.id);

console.log(`\n  Generating themes for: ${P.name} (${P.id})`);
console.log(`  Output: ${outDir}/`);
if (dryRun) console.log('  (dry run — no files written)\n');
else console.log();

// =====================================================================
// HELPERS
// =====================================================================

function emit(subdir, filename, content) {
  const dir = join(outDir, subdir);
  const path = join(dir, filename);
  if (dryRun) {
    const lines = content.split('\n').length;
    console.log(`  [dry] ${subdir}/${filename} (${lines} lines)`);
    return;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, 'utf-8');
  console.log(`  ✓ ${subdir}/${filename}`);
}

function q(s) { return JSON.stringify(s); }
function qs(arr) { return arr.map(q).join(', '); }

// Darken/lighten a hex color
function adjustColor(hex, amount) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  let b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Get sorted supporting chars by tier
function supportingByTier() {
  return [...P.characters.supporting].sort((a, b) => (a.tier || 1) - (b.tier || 1));
}

// Full character roster: protagonist + antagonist + supporting
function fullRoster() {
  return [P.characters.protagonist, P.characters.antagonist, ...P.characters.supporting];
}

// =====================================================================
// GENERATOR: Clicker (games 03, 12, 18)
// Pattern A: export const THEMES = { id: {...} }, THEME_IDS, DEFAULT_THEME
// =====================================================================

function genClicker() {
  const pal = P.palette;
  const copy = P.copy;
  const ups = P.mechanics.clicker.upgrades;

  const code = `/**
 * ${P.name} CLICKER -- Theme Definition (auto-generated from content pack "${P.id}")
 */

export const THEMES = {
  ${q(P.id)}: {
    id: ${q(P.id)},
    name: ${q(P.name + ' CLICKER')},
    bodyTheme: ${q(P.bodyTheme)},
    currencyName: ${q(copy.currencyName)},
    currencyShort: ${q(copy.currencyShort)},
    prestigeName: ${q(copy.prestigeName)},
    prestigeAction: ${q(copy.prestigeAction)},
    upgrades: [
${ups.map(u => `      { name: ${q(u.name)}, baseCost: ${u.baseCost}, baseProduction: ${u.baseProduction} },`).join('\n')}
    ],
    colors: {
      bgTop: ${q(pal.bgTop)},
      bgBottom: ${q(pal.bgBottom)},
      accent: ${q(pal.primary)},
      accentGlow: ${q(hexToRgba(pal.primary, 0.3))},
      text: ${q(pal.text)},
      textSecondary: ${q(pal.textSecondary)},
      currencyColor: ${q(pal.primary)},
      prestigeColor: ${q(pal.secondary)},
      upgradeRowBg: ${q(hexToRgba(pal.primary, 0.08))},
      upgradeRowBorder: ${q(hexToRgba(pal.primary, 0.2))},
      tapTargetPrimary: ${q(adjustColor(pal.primary, 40))},
      tapTargetSecondary: ${q(adjustColor(pal.primary, -40))},
      tapTargetHighlight: ${q(adjustColor(pal.primary, 80))},
    },
    floatingSymbols: [${qs(copy.floatingSymbols)}],
  },
};

export const THEME_IDS = [${q(P.id)}];
export const DEFAULT_THEME = ${q(P.id)};
`;
  emit('game-clicker', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Runner (games 04, 13, 15, 19)
// Pattern B: export const THEMES = { id: {...} }, THEME_ORDER
// =====================================================================

function genRunner() {
  const pal = P.palette;
  const copy = P.copy;
  const prot = P.characters.protagonist;
  const ant = P.characters.antagonist;
  const collectible = P.items.collectible;
  const obs = P.items.obstacles;

  const code = `/**
 * ${P.name} RUN -- Theme Definition (auto-generated from content pack "${P.id}")
 */

export const THEMES = {
  ${q(P.id)}: {
    id: ${q(P.id)},
    name: ${q(P.name + ' RUN')},
    dataTheme: ${q(P.bodyTheme)},
    accentColor: ${q(pal.primary)},
    deathMessages: [${qs(P.copy.deathMessages)}],
    colors: {
      sky: ${q(pal.sky || pal.bgTop)},
      skyGradient: ${q(pal.skyGradient || pal.bgBottom)},
      ground: ${q(pal.ground || adjustColor(pal.primary, -80))},
      groundAccent: ${q(pal.groundAccent || pal.primary)},
      groundLine: ${q(pal.groundLine || adjustColor(pal.primary, -40))},
    },

    drawPlayer(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = \`\${Math.min(w, h) * 0.8}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(prot.emoji)}, x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleGround(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = \`\${Math.min(w, h) * 0.7}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(obs[0]?.emoji || ant.emoji)}, x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleFlying(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = \`\${Math.min(w, h) * 0.7}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(obs[1]?.emoji || ant.emoji)}, x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleTall(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = \`\${Math.min(w, h) * 0.5}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(obs[2]?.emoji || ant.emoji)}, x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawCoin(ctx, x, y, r, frame) {
      ctx.save();
      ctx.font = \`\${r * 1.4}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(collectible.emoji)}, x, y);
      ctx.restore();
    },

    drawBackgroundFar(ctx, W, H, offset) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, ${q(pal.sky || pal.bgTop)});
      grad.addColorStop(1, ${q(pal.skyGradient || pal.bgBottom)});
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    },

    drawBackgroundMid(ctx, W, H, offset) {
      // Subtle floating symbols in parallax
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.font = '24px serif';
      ctx.fillStyle = ${q(pal.text)};
      for (let i = 0; i < 6; i++) {
        const sx = ((i * 173 + offset * 0.1) % (W + 100)) - 50;
        const sy = 60 + (i * 67) % (H * 0.5);
        ctx.fillText(${q(copy.floatingSymbols[0] || prot.emoji)}, sx, sy);
      }
      ctx.restore();
    },

    drawGround(ctx, W, groundY, groundH, offset) {
      ctx.fillStyle = ${q(pal.ground || adjustColor(pal.primary, -80))};
      ctx.fillRect(0, groundY, W, groundH);
      ctx.fillStyle = ${q(pal.groundAccent || pal.primary)};
      ctx.fillRect(0, groundY, W, 2);
    },
  },
};

export const THEME_ORDER = [${q(P.id)}];
`;
  emit('game-runner', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Stack (game 05, 16)
// Pattern C: export const THEMES = [...], getThemeById
// =====================================================================

function genStack() {
  const pal = P.palette;
  const prot = P.characters.protagonist;
  const supporting = supportingByTier();
  const comboTexts = P.copy.comboMessages.map(m => m.text);

  const code = `/**
 * ${P.name} STACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' STACK')},
  colors: [${qs(pal.blockColors)}],
  comboTexts: [${qs(comboTexts)}],
  deathMessages: [${qs(P.copy.deathMessages)}],
  accentColor: ${q(pal.primary)},

  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = [${qs(supporting.slice(0, 5).map(c => c.emoji))}];
    ctx.fillText(chars[index % chars.length], cx, cy);
    ctx.restore();
  },

  drawBackground(ctx, W, H, cameraY, score) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ${q(pal.bgTop)});
    grad.addColorStop(0.5, ${q(adjustColor(pal.bgTop, 15))});
    grad.addColorStop(1, ${q(pal.bgBottom)});
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = ${q(pal.text)};
    ctx.globalAlpha = 0.04;
    ctx.font = '20px serif';
    for (let i = 0; i < 15; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      ctx.fillText(${q(prot.emoji)}, sx, sy);
    }
    ctx.globalAlpha = 1;
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-stack', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Snake (games 06, 22)
// =====================================================================

function genSnake() {
  const pal = P.palette;
  const prot = P.characters.protagonist;
  const food = P.items.collectible;
  const foods = P.items.collectibles;

  const code = `/**
 * ${P.name} SNAKE -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' SNAKE')},
  scoreLabel: ${q(P.copy.scoreLabel)},
  accentColor: ${q(pal.primary)},
  bgColor: ${q(pal.bgBottom)},
  gridColor: ${q(pal.gridColor || hexToRgba(pal.primary, 0.06))},
  scoreColor: ${q(pal.primary)},
  hudColor: ${q(pal.textSecondary)},
  deathMessages: [${qs(P.copy.deathMessages)}],

  drawHead(ctx, x, y, s, dir) {
    ctx.save();
    ctx.font = (s * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(${q(prot.emoji)}, x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawSegment(ctx, x, y, s, index) {
    ctx.save();
    const items = [${qs(foods.slice(0, 5).map(f => f.emoji))}];
    ctx.font = (s * 0.6) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(items[index % items.length], x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawFood(ctx, x, y, s, frame) {
    ctx.save();
    const scale = 1 + Math.sin(frame * 0.1) * 0.1;
    ctx.font = (s * 0.7 * scale) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(${q(food.emoji)}, x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    ctx.fillStyle = ${q(pal.bgBottom)};
    ctx.fillRect(gridX, gridY, gridW, gridH);
    ctx.strokeStyle = ${q(pal.gridColor || hexToRgba(pal.primary, 0.06))};
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(gridX, gridY + r * cellSize);
      ctx.lineTo(gridX + gridW, gridY + r * cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(gridX + c * cellSize, gridY);
      ctx.lineTo(gridX + c * cellSize, gridY + gridH);
      ctx.stroke();
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-snake', 'themes.js', code);
}

// =====================================================================
// GENERATOR: 2048 (games 07, 20)
// =====================================================================

function genTiles2048() {
  const pal = P.palette;
  const tiers = P.mechanics.tiles2048.tiers;
  const tierValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

  const tierEntries = tierValues.map((v, i) => {
    const name = tiers[v]?.name || `Tier ${v}`;
    const color = pal.tileColors[i] || adjustColor(pal.primary, -80 + i * 15);
    return `  ${v}: { name: ${q(name)}, color: ${q(color)} },`;
  }).join('\n');

  // Map each tier to an emoji from the roster
  const roster = fullRoster();
  const emojiMap = tierValues.map((v, i) => {
    const char = roster[i % roster.length];
    return `      case ${v}: emoji = ${q(char?.emoji || '?')}; break;`;
  }).join('\n');

  const code = `/**
 * ${P.name} 2048 -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' 2048')},
  scoreLabel: ${q(P.copy.scoreLabel)},
  accentColor: ${q(pal.primary)},
  bgColor: ${q(pal.bgBottom)},
  boardBgColor: ${q(adjustColor(pal.bgBottom, 10))},
  cellEmptyColor: ${q(adjustColor(pal.bgBottom, 20))},
  textColor: ${q(pal.text)},
  tiers: {
${tierEntries}
  },
  deathMessages: [${qs(P.copy.deathMessages)}],

  drawTileChar(ctx, cx, cy, size, value) {
    let emoji;
    switch (value) {
${emojiMap}
      default: emoji = ${q(P.characters.protagonist.emoji)}; break;
    }
    ctx.save();
    ctx.font = (size * 0.35) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, cx, cy + 2);
    ctx.restore();
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-2048', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Ninja / Fruit Ninja (games 08, 09, 21)
// =====================================================================

function genNinja() {
  const pal = P.palette;
  const ant = P.characters.antagonist;
  const collectibles = P.items.collectibles;

  const code = `/**
 * ${P.name} NINJA -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' NINJA')},
  accentColor: ${q(pal.primary)},
  trailColor: ${q(hexToRgba(pal.primary, 0.5))},
  scoreLabel: ${q(P.copy.scoreLabel)},
  bombLabel: ${q('avoid: ' + ant.shortName)},
  deathMessages: [${qs(P.copy.deathMessages)}],

  drawObject(ctx, x, y, r, variant) {
    const items = [${qs(collectibles.map(c => c.emoji))}];
    ctx.save();
    ctx.font = (r * 1.4) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(items[variant % items.length], x, y);
    ctx.restore();
  },

  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.font = (r * 1.4) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(${q(ant.emoji)}, x, y);
    ctx.restore();
  },

  drawSliceEffect(ctx, x, y, particles) {
    ctx.save();
    ctx.fillStyle = ${q(pal.primary)};
    for (const p of particles) {
      ctx.globalAlpha = p.alpha || 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r || 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawBackground(ctx, W, H, time) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ${q(pal.bgTop)});
    grad.addColorStop(1, ${q(pal.bgBottom)});
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-ninja', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Breakout (game 10)
// =====================================================================

function genBreakout() {
  const pal = P.palette;
  const ant = P.characters.antagonist;
  const prot = P.characters.protagonist;

  const code = `/**
 * ${P.name} BREAKER -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' BREAKER')},
  scoreLabel: ${q(P.copy.scoreLabel)},
  accentColor: ${q(pal.primary)},
  bgColor: ${q(pal.bgBottom)},
  brickColors: [${qs(pal.blockColors)}],
  paddleColor: ${q(pal.primary)},
  ballColor: ${q(pal.secondary)},
  catchphrases: [${qs(P.copy.catchphrases)}],
  deathMessages: [${qs(P.copy.deathMessages)}],

  drawBackground(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ${q(pal.bgTop)});
    grad.addColorStop(1, ${q(pal.bgBottom)});
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = ${q(adjustColor(pal.primary, 40))};
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (hp > 1) {
      ctx.fillStyle = ${q(pal.text)};
      ctx.font = (h * 0.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(${q(ant.emoji)}, x + w / 2, y + h / 2);
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-breakout', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Geometry Dash (games 11, 14)
// =====================================================================

function genDash() {
  const pal = P.palette;
  const prot = P.characters.protagonist;

  const code = `/**
 * ${P.name} DASH -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' DASH')},
  scoreLabel: ${q(P.copy.scoreLabel)},
  accentColor: ${q(pal.primary)},
  groundColor: ${q(pal.ground || adjustColor(pal.primary, -80))},
  obstacleColor: ${q(pal.secondary)},
  deathMessages: [${qs(P.copy.deathMessages)}],

  getPlayerColor(pct) { return ${q(pal.primary)}; },
  getPlayerGlow(pct) { return { color: ${q(hexToRgba(pal.primary, 0.4))}, radius: 8 + pct * 12 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.font = (size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(${q(prot.emoji)}, 0, 0);
    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ${q(pal.sky || pal.bgTop)});
    grad.addColorStop(1, ${q(pal.skyGradient || pal.bgBottom)});
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    ctx.fillStyle = ${q(pal.ground || adjustColor(pal.primary, -80))};
    ctx.fillRect(0, groundY, W, H);
    ctx.fillStyle = ${q(pal.groundAccent || pal.primary)};
    ctx.fillRect(0, groundY, W, 2);
  },

  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = ${q(pal.secondary)};
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  },

  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = ${q(adjustColor(pal.secondary, -30))};
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = ${q(pal.secondary)};
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = ${q(pal.secondary)};
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-dash', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Flappy (games 01, 17)
// =====================================================================

function genFlappy() {
  const pal = P.palette;
  const prot = P.characters.protagonist;

  // Flappy games use a characters.js pattern, not themes.js — but we generate a themes.js
  // that the game can consume if refactored to the standard pattern
  const code = `/**
 * ${P.name} FLAPPY -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q('FLAPPY ' + P.characters.protagonist.shortName.toUpperCase())},
  accentColor: ${q(pal.primary)},
  pipeColor: ${q(pal.secondary)},
  bgColor: ${q(pal.bgTop)},
  groundColor: ${q(pal.ground || adjustColor(pal.primary, -80))},
  deathMessages: [${qs(P.copy.deathMessages)}],

  drawPlayer(ctx, x, y, w, h, frame) {
    ctx.save();
    ctx.font = (Math.min(w, h) * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(${q(prot.emoji)}, x + w / 2, y + h / 2);
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    ctx.fillStyle = ${q(pal.secondary)};
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ${q(adjustColor(pal.secondary, 20))};
    ctx.fillRect(x - 3, y + (h > 0 ? 0 : h), w + 6, 20);
  },

  drawBackground(ctx, W, H, scrollX) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ${q(pal.sky || pal.bgTop)});
    grad.addColorStop(1, ${q(pal.skyGradient || pal.bgBottom)});
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-flappy', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Whack-a-Mole (games 02, 23)
// =====================================================================

function genWhack() {
  const roster = P.mechanics.whack.roster;

  const code = `/**
 * ${P.name} WHACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' WHACK')},
  accentColor: ${q(P.palette.primary)},
  deathMessages: [${qs(P.copy.deathMessages)}],
  roster: [
${roster.map(r => `    { id: ${q(r.id)}, name: ${q(r.name)}, emoji: ${q(r.emoji)}, basePoints: ${r.basePoints}, isBonus: ${!!r.isBonus}, isPenalty: ${!!r.isPenalty} },`).join('\n')}
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-whack', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Piano Tiles (game 24)
// =====================================================================

function genPiano() {
  const pal = P.palette;
  const combo = P.copy.comboMessages;

  const code = `/**
 * ${P.name} PIANO -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' PIANO')},
  accentColor: ${q(pal.primary)},
  bgGradientTop: ${q(pal.bgTop)},
  bgGradientBottom: ${q(pal.bgBottom)},
  laneLineColor: ${q(hexToRgba(pal.primary, 0.25))},
  tileColor: ${q(adjustColor(pal.bgBottom, 10))},
  tileActiveColor: ${q(pal.primary)},
  tileBorderColor: ${q(adjustColor(pal.primary, -30))},
  tileEmoji: ${q(P.mechanics.pianoTiles?.tileEmoji || P.characters.protagonist.emoji)},
  tileEmojiAlt: ${q(P.characters.antagonist.emoji)},
  scoreColor: ${q(pal.primary)},
  comboColor: ${q(adjustColor(pal.primary, 40))},
  deathMessages: [${qs(P.copy.deathMessages)}],
  comboMessages: [
${combo.map(m => `    { threshold: ${m.threshold}, text: ${q(m.text)}, color: ${q(m.color || pal.primary)} },`).join('\n')}
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-piano', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Color Switch (game 25)
// =====================================================================

function genColorSwitch() {
  const pal = P.palette;
  const prot = P.characters.protagonist;

  const code = `/**
 * ${P.name} COLOR SWITCH -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' COLOR SWITCH')},
  accentColor: ${q(pal.primary)},
  bgColor: ${q(pal.bgBottom)},
  bgColorAlt: ${q(pal.bgTop)},
  particleColor: ${q(hexToRgba(pal.primary, 0.15))},
  colors: [${qs(pal.colorSwitchSegments)}],
  colorNames: [${qs(pal.colorSwitchNames)}],
  ballShape: ${q(P.mechanics.colorSwitch?.ballShape || 'circle')},
  glowColor: ${q(pal.primary)},
  scoreColor: ${q(pal.primary)},
  deathMessages: [${qs(P.copy.deathMessages)}],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-colorswitch', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Memory Match (game 27)
// =====================================================================

function genMemory() {
  const pal = P.palette;
  const pairs = P.mechanics.memoryMatch.pairs;
  const backSymbol = P.mechanics.memoryMatch.cardBackSymbol || '?';

  const code = `/**
 * ${P.name} MEMORY -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' MEMORY')},
  accentColor: ${q(pal.primary)},
  bgGradientTop: ${q(pal.bgTop)},
  bgGradientBottom: ${q(pal.bgBottom)},
  cardFaceColor: ${q(adjustColor(pal.bgBottom, 20))},
  cardBorderColor: ${q(hexToRgba(pal.primary, 0.3))},
  cardBackColor: ${q(adjustColor(pal.bgBottom, 10))},
  cardBackBorderColor: ${q(hexToRgba(pal.primary, 0.15))},
  cardBackSymbol: ${q(backSymbol)},
  cardBackSymbolColor: ${q(pal.textTertiary || pal.textSecondary)},
  matchGlowColor: '#4ade80',
  mismatchFlashColor: '#f87171',
  hudColor: ${q(pal.textSecondary)},
  timerColor: ${q(pal.primary)},
  movesColor: ${q(pal.textSecondary)},
  pairs: [
${pairs.map(p => `    { emoji: ${q(p.emoji)}, label: ${q(p.label)} },`).join('\n')}
  ],
  winMessages: [${qs(P.copy.winMessages)}],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-memory', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Paper Toss (game 29)
// =====================================================================

function genPaperToss() {
  const pal = P.palette;
  const proj = P.items.projectile;
  const tgt = P.items.target;

  const code = `/**
 * ${P.name} YEET -- Theme Definition (auto-generated)
 */

const theme = {
  id: ${q(P.id)},
  name: ${q(P.name + ' YEET')},
  accentColor: ${q(pal.primary)},
  bgGradientTop: ${q(pal.bgTop)},
  bgGradientBottom: ${q(pal.bgBottom)},
  floorColor: ${q(pal.floorColor || adjustColor(pal.bgBottom, 15))},
  floorHighlight: ${q(adjustColor(pal.floorColor || pal.bgBottom, 25))},
  wallColor: ${q(pal.wallColor || adjustColor(pal.bgBottom, 5))},
  wallAccent: ${q(hexToRgba(pal.primary, 0.13))},
  scoreColor: ${q(pal.primary)},
  streakColor: ${q(adjustColor(pal.primary, 40))},

  projectileName: ${q(proj.name)},
  projectileColor: ${q(adjustColor(pal.primary, 60))},
  projectileAccent: ${q(adjustColor(pal.primary, 30))},
  projectileDetailColor: ${q(pal.primary)},

  binName: ${q(tgt.name)},
  binColor: ${q(adjustColor(pal.secondary, -20))},
  binAccent: ${q(pal.secondary)},
  binRimColor: ${q(adjustColor(pal.secondary, 30))},
  binInnerColor: ${q(adjustColor(pal.bgBottom, -20))},
  binBaseColor: ${q(adjustColor(pal.secondary, -40))},

  windArrowColor: ${q(pal.primary)},
  trailColor: ${q(hexToRgba(pal.primary, 0.3))},

  deathMessages: [${qs(P.copy.deathMessages)}],
  winMessages: [${qs(P.copy.winMessages)}],
  scoreLabel: ${q(P.copy.scoreLabel)},
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
`;
  emit('game-papertoss', 'themes.js', code);
}

// =====================================================================
// GENERATOR: Wordle (game 26)
// =====================================================================

function genWordle() {
  const answers = P.mechanics.wordle.answerWords;
  const extra = P.mechanics.wordle.extraValidGuesses || [];

  // Standard 5-letter English words for valid guesses
  const commonWords = [
    'ABOUT','ABOVE','ABUSE','ACTOR','ACUTE','ADMIT','ADOPT','ADULT','AFTER','AGAIN',
    'AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT','ALIEN','ALIGN','ALIVE','ALLOW',
    'ALONE','ALTER','AMONG','ANGEL','ANGER','ANGLE','ANGRY','APART','APPLE','APPLY',
    'ARENA','ARGUE','ARISE','ASIDE','ASSET','AVOID','AWARD','AWARE','BADLY','BAKER',
    'BASES','BASIC','BASIS','BEACH','BEGAN','BEGIN','BEING','BELOW','BENCH','BILLY',
    'BIRTH','BLACK','BLADE','BLAME','BLANK','BLAST','BLAZE','BLEED','BLEND','BLIND',
    'BLOCK','BLOOD','BLOWN','BOARD','BOOST','BOUND','BRAIN','BRAND','BRAVE','BREAD',
    'BREAK','BREED','BRIEF','BRING','BROAD','BROKE','BROWN','BUILD','BUILT','BUNCH',
    'BURST','BUYER','CABIN','CANDY','CARRY','CATCH','CAUSE','CHAIN','CHAIR','CHEAP',
    'CHECK','CHEST','CHIEF','CHILD','CHINA','CHOSE','CIVIL','CLAIM','CLASS','CLEAN',
    'CLEAR','CLIMB','CLOCK','CLOSE','CLOUD','COACH','COAST','COULD','COUNT','COURT',
    'COVER','CRACK','CRAFT','CRASH','CRAZY','CREAM','CRIME','CROSS','CROWD','CROWN',
    'CURVE','CYCLE','DAILY','DANCE','DEATH','DEBUT','DELAY','DEPTH','DIRTY','DOUBT',
    'DOZEN','DRAFT','DRAIN','DRAMA','DRANK','DRAWN','DREAM','DRESS','DRINK','DRIVE',
    'DROVE','DYING','EAGER','EARLY','EARTH','EIGHT','ELECT','ELITE','EMPTY','ENEMY',
    'ENJOY','ENTER','ENTRY','EQUAL','ERROR','EVENT','EVERY','EXACT','EXIST','EXTRA',
    'FAITH','FALSE','FAULT','FEAST','FIELD','FIFTH','FIFTY','FIGHT','FINAL','FIRST',
    'FIXED','FLAME','FLASH','FLEET','FLESH','FLOAT','FLOOD','FLOOR','FLUID','FLUSH',
    'FOCUS','FORCE','FORTH','FOUND','FRAME','FRANK','FRAUD','FRESH','FRONT','FRUIT',
    'FULLY','GIANT','GIVEN','GLASS','GLOBE','GOING','GRACE','GRADE','GRAIN','GRAND',
    'GRANT','GRASS','GRAVE','GREAT','GREEN','GROSS','GROUP','GROWN','GUARD','GUESS',
    'GUIDE','HAPPY','HARSH','HEART','HEAVY','HENCE','HORSE','HOTEL','HOUSE','HUMAN',
    'HUMOR','IDEAL','IMAGE','IMPLY','INDEX','INNER','INPUT','ISSUE','IVORY','JOINT',
    'JUDGE','JUICE','KNOWN','LABEL','LARGE','LASER','LATER','LAUGH','LAYER','LEARN',
    'LEASE','LEAVE','LEGAL','LEVEL','LIGHT','LIMIT','LIVER','LOOSE','LOVER','LOWER',
    'LUCKY','LUNCH','MAGIC','MAJOR','MAKER','MARCH','MATCH','MAYBE','MAYOR','MEANT',
    'MEDIA','MERCY','METAL','MIGHT','MINOR','MINUS','MODEL','MONEY','MONTH','MORAL',
    'MOTOR','MOUNT','MOUSE','MOUTH','MOVIE','MUSIC','NERVE','NEVER','NEWLY','NIGHT',
    'NOBLE','NOISE','NORTH','NOTED','NOVEL','NURSE','OCCUR','OCEAN','OFFER','OFTEN',
    'ORDER','OTHER','OUGHT','OUTER','OWNER','PAINT','PANEL','PANIC','PAPER','PARTY',
    'PATCH','PAUSE','PEACE','PENNY','PHASE','PHONE','PHOTO','PIANO','PIECE','PILOT',
    'PITCH','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA','PLEAD','POINT','POUND',
    'POWER','PRESS','PRICE','PRIDE','PRIME','PRINCE','PRINT','PRIOR','PRIZE','PROOF',
    'PROUD','PROVE','PSALM','QUEEN','QUICK','QUIET','QUITE','QUOTA','QUOTE','RADAR',
    'RADIO','RAISE','RANGE','RAPID','RATIO','REACH','READY','REALM','REBEL','REFER',
    'REIGN','RELAX','RIDER','RIFLE','RIGHT','RISKY','RIVAL','RIVER','ROBOT','ROMAN',
    'ROUGE','ROUGH','ROUND','ROUTE','ROYAL','RURAL','SADLY','SAINT','SALAD','SCALE',
    'SCENE','SCOPE','SCORE','SENSE','SERVE','SEVEN','SHALL','SHAPE','SHARE','SHARP',
    'SHEET','SHELF','SHELL','SHIFT','SHIRT','SHOCK','SHOOT','SHORT','SHOUT','SIGHT',
    'SINCE','SIXTH','SIXTY','SIZED','SKILL','SLASH','SLATE','SLEEP','SLIDE','SLOPE',
    'SMALL','SMART','SMELL','SMILE','SMITH','SMOKE','SNAKE','SOLAR','SOLID','SOLVE',
    'SORRY','SOUND','SOUTH','SPACE','SPARE','SPEAK','SPEED','SPEND','SPENT','SPLIT',
    'SPOKE','SPORT','SPRAY','SQUAD','STACK','STAFF','STAGE','STAKE','STAND','START',
    'STATE','STEAL','STEAM','STEEL','STEEP','STEER','STICK','STILL','STOCK','STONE',
    'STOOD','STORE','STORM','STORY','STRIP','STUCK','STUDY','STUFF','STYLE','SUGAR',
    'SUITE','SUPER','SURGE','SWEAR','SWEEP','SWEET','SWIFT','SWING','SWIPE','SWORD',
    'TASTE','TEACH','TEETH','THEIR','THEME','THERE','THICK','THING','THINK','THIRD',
    'THOSE','THREE','THREW','THROW','THUMB','TIGHT','TIRED','TITLE','TODAY','TOKEN',
    'TOTAL','TOUCH','TOUGH','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL','TRAIN',
    'TRAIT','TRASH','TREAT','TREND','TRIAL','TRIBE','TRICK','TRIED','TRUCK','TRULY',
    'TRUST','TRUTH','TUMOR','TWICE','TWIST','ULTRA','UNDER','UNION','UNITY','UNTIL',
    'UPPER','UPSET','URBAN','USAGE','USUAL','UTTER','VALID','VALUE','VIDEO','VIGOR',
    'VIRAL','VISIT','VITAL','VIVID','VOCAL','VOICE','VOTER','WASTE','WATCH','WATER',
    'WEIGH','WEIRD','WHEEL','WHERE','WHICH','WHILE','WHITE','WHOLE','WHOSE','WOMAN',
    'WORLD','WORRY','WORSE','WORST','WORTH','WOULD','WOUND','WRITE','WRONG','WROTE',
    'YIELD','YOUNG','YOUTH',
  ];

  const allValid = [...new Set([...answers, ...extra, ...commonWords])];

  const code = `/**
 * ${P.name} WORDLE -- Word List (auto-generated)
 */

export const ANSWER_WORDS = [
  ${answers.map(q).join(',\n  ')},
];

const COMMON_VALID = [
  ${allValid.map(q).join(',\n  ')},
];

export const VALID_GUESSES = new Set([...ANSWER_WORDS, ...COMMON_VALID]);

/**
 * Get today's word using a date-based seed.
 */
export function getDailyWord() {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % ANSWER_WORDS.length;
  return ANSWER_WORDS[index];
}

/**
 * Check if a word is a valid guess.
 */
export function isValidGuess(word) {
  return VALID_GUESSES.has(word.toUpperCase());
}
`;
  emit('game-wordle', 'words.js', code);
}

// =====================================================================
// GENERATOR: Hangman (game 28)
// =====================================================================

function genHangman() {
  const words = P.mechanics.hangman.words;

  const code = `/**
 * ${P.name} HANGMAN -- Word List (auto-generated)
 */

export const WORDS = [
${words.map(w => `  { word: ${q(w.word)}, category: ${q(w.category)}, hint: ${q(w.hint)} },`).join('\n')}
];

/**
 * Get a random word, avoiding recently used indices.
 * @param {Set<number>} usedIndices
 * @returns {{ word: string, category: string, hint: string }}
 */
export function getRandomWord(usedIndices = new Set()) {
  const available = WORDS.map((w, i) => i).filter(i => !usedIndices.has(i));
  if (available.length === 0) {
    usedIndices.clear();
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  usedIndices.add(idx);
  return WORDS[idx];
}
`;
  emit('game-hangman', 'words.js', code);
}

// =====================================================================
// GENERATOR: Trivia (game 30)
// =====================================================================

function genTrivia() {
  const questions = P.mechanics.trivia.questions;

  const code = `/**
 * ${P.name} TRIVIA -- Question Bank (auto-generated)
 */

export const questions = [
${questions.map(q => `  {
    question: ${JSON.stringify(q.question)},
    answers: [${q.answers.map(a => JSON.stringify(a)).join(', ')}],
    correct: ${q.correct},
    difficulty: ${q.difficulty},
    category: ${JSON.stringify(q.category)},
  },`).join('\n')}
];

/**
 * Fisher-Yates shuffle.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a question queue ordered by difficulty (easy first).
 */
export function buildQuestionQueue() {
  const easy = shuffle(questions.filter(q => q.difficulty === 1));
  const med = shuffle(questions.filter(q => q.difficulty === 2));
  const hard = shuffle(questions.filter(q => q.difficulty === 3));
  return [...easy, ...med, ...hard];
}
`;
  emit('game-trivia', 'questions.js', code);
}

// =====================================================================
// RUN ALL GENERATORS
// =====================================================================

const generators = [
  ['game-clicker',     genClicker],
  ['game-runner',      genRunner],
  ['game-stack',       genStack],
  ['game-snake',       genSnake],
  ['game-2048',        genTiles2048],
  ['game-ninja',       genNinja],
  ['game-breakout',    genBreakout],
  ['game-dash',        genDash],
  ['game-flappy',      genFlappy],
  ['game-whack',       genWhack],
  ['game-piano',       genPiano],
  ['game-colorswitch', genColorSwitch],
  ['game-wordle',      genWordle],
  ['game-memory',      genMemory],
  ['game-hangman',     genHangman],
  ['game-papertoss',   genPaperToss],
  ['game-trivia',      genTrivia],
];

let ok = 0;
let fail = 0;

for (const [name, fn] of generators) {
  try {
    fn();
    ok++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    fail++;
  }
}

console.log(`\n  Done: ${ok} generated, ${fail} failed (17 mechanics total)\n`);
process.exit(fail > 0 ? 1 : 0);
