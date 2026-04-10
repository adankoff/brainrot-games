#!/usr/bin/env node
/**
 * deploy-pack.js — Deploy generated theme files into playable game folders
 *
 * Takes a pack ID (must already be generated via generate-from-pack.js)
 * and creates game-XX folders by copying the reference game for each mechanic
 * and swapping in the generated theme/content file.
 *
 * Usage:
 *   node tools/deploy-pack.js brainrot --start 31
 *   node tools/deploy-pack.js anime --start 48
 *   node tools/deploy-pack.js splatoon --start 65
 *   node tools/deploy-pack.js brainrot --start 31 --dry-run
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// =====================================================================
// CONFIG: Mechanic → reference game folder + generated subfolder + swap file
// =====================================================================

const MECHANIC_MAP = [
  { mechanic: 'flappy',      ref: 'game-01', genDir: 'game-flappy',      swapFile: 'js/themes.js',    label: 'Flappy Bird' },
  { mechanic: 'whack',       ref: 'game-02', genDir: 'game-whack',       swapFile: 'js/themes.js',    label: 'Whack-a-Mole' },
  { mechanic: 'clicker',     ref: 'game-03', genDir: 'game-clicker',     swapFile: 'js/themes.js',    label: 'Idle Clicker' },
  { mechanic: 'runner',      ref: 'game-04', genDir: 'game-runner',      swapFile: 'js/themes.js',    label: 'Endless Runner' },
  { mechanic: 'stack',       ref: 'game-05', genDir: 'game-stack',       swapFile: 'js/themes.js',    label: 'Stack' },
  { mechanic: 'snake',       ref: 'game-06', genDir: 'game-snake',       swapFile: 'js/themes.js',    label: 'Snake' },
  { mechanic: '2048',        ref: 'game-07', genDir: 'game-2048',        swapFile: 'js/themes.js',    label: '2048' },
  { mechanic: 'ninja',       ref: 'game-08', genDir: 'game-ninja',       swapFile: 'js/themes.js',    label: 'Fruit Ninja' },
  { mechanic: 'breakout',    ref: 'game-10', genDir: 'game-breakout',    swapFile: 'js/themes.js',    label: 'Breakout' },
  { mechanic: 'dash',        ref: 'game-11', genDir: 'game-dash',        swapFile: 'js/themes.js',    label: 'Geometry Dash' },
  { mechanic: 'piano',       ref: 'game-24', genDir: 'game-piano',       swapFile: 'js/themes.js',    label: 'Piano Tiles' },
  { mechanic: 'colorswitch', ref: 'game-25', genDir: 'game-colorswitch', swapFile: 'js/themes.js',    label: 'Color Switch' },
  { mechanic: 'wordle',      ref: 'game-26', genDir: 'game-wordle',      swapFile: 'js/words.js',     label: 'Wordle' },
  { mechanic: 'memory',      ref: 'game-27', genDir: 'game-memory',      swapFile: 'js/themes.js',    label: 'Memory Match' },
  { mechanic: 'hangman',     ref: 'game-28', genDir: 'game-hangman',     swapFile: 'js/words.js',     label: 'Hangman' },
  { mechanic: 'papertoss',   ref: 'game-29', genDir: 'game-papertoss',   swapFile: 'js/themes.js',    label: 'Paper Toss' },
  { mechanic: 'trivia',      ref: 'game-30', genDir: 'game-trivia',      swapFile: 'js/questions.js', label: 'Trivia Quiz' },
];

// =====================================================================
// CLI
// =====================================================================

const args = process.argv.slice(2);
const packId = args.find(a => !a.startsWith('--'));
const startArg = args.find(a => a.startsWith('--start='));
const startNum = startArg ? parseInt(startArg.split('=')[1], 10) : null;
const dryRun = args.includes('--dry-run');

if (!packId || !startNum) {
  console.error('Usage: node tools/deploy-pack.js <pack-id> --start=<game-number> [--dry-run]');
  console.error('Example: node tools/deploy-pack.js brainrot --start=31');
  process.exit(1);
}

const gamesDir = 'games';
const genDir = join('tools/generated-themes', packId);

// Verify generated themes exist
if (!existsSync(genDir)) {
  console.error(`Generated themes not found at ${genDir}. Run generate-from-pack.js first.`);
  process.exit(1);
}

// Load the pack for metadata
const packPath = join('tools/content-packs', packId + '.json');
let pack;
try {
  pack = JSON.parse(readFileSync(packPath, 'utf-8'));
} catch (e) {
  console.error(`Failed to read pack: ${e.message}`);
  process.exit(1);
}

console.log(`\n  Deploying: ${pack.name} (${packId})`);
console.log(`  Games: game-${String(startNum).padStart(2, '0')} through game-${String(startNum + 16).padStart(2, '0')}`);
if (dryRun) console.log('  (dry run)\n');
else console.log();

// =====================================================================
// DEPLOY
// =====================================================================

const deployed = [];
let gameNum = startNum;

for (const entry of MECHANIC_MAP) {
  const refPath = join(gamesDir, entry.ref);
  const gameId = `game-${String(gameNum).padStart(2, '0')}`;
  const destPath = join(gamesDir, gameId);
  const genThemePath = join(genDir, entry.genDir);
  const gameName = `${pack.name} ${entry.label.toUpperCase()}`;

  if (!existsSync(refPath)) {
    console.error(`  ✗ ${gameId} — reference ${entry.ref} not found, skipping`);
    gameNum++;
    continue;
  }

  if (!existsSync(genThemePath)) {
    console.error(`  ✗ ${gameId} — generated theme ${entry.genDir} not found, skipping`);
    gameNum++;
    continue;
  }

  if (dryRun) {
    console.log(`  [dry] ${gameId} ← ${entry.ref} + ${entry.genDir} (${gameName})`);
    deployed.push({ gameId, gameName, mechanic: entry.label });
    gameNum++;
    continue;
  }

  // 1. Copy reference game folder
  if (existsSync(destPath)) {
    // Remove existing to avoid stale files
    cpSync(refPath, destPath, { recursive: true, force: true });
  } else {
    cpSync(refPath, destPath, { recursive: true });
  }

  // 2. Swap in generated theme/content file
  const swapSrc = join(genThemePath, entry.swapFile.split('/').pop());
  const swapDest = join(destPath, entry.swapFile);
  if (existsSync(swapSrc)) {
    writeFileSync(swapDest, readFileSync(swapSrc, 'utf-8'));
  }

  // 3. Update index.html title and meta tags
  const htmlPath = join(destPath, 'index.html');
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, 'utf-8');
    // Replace <title>
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${gameName} | Brainrot Games</title>`);
    // Replace og:title
    html = html.replace(/og:title"\s+content="[^"]*"/, `og:title" content="${gameName} | Brainrot Games"`);
    // Replace twitter:title
    html = html.replace(/twitter:title"\s+content="[^"]*"/, `twitter:title" content="${gameName} | Brainrot Games"`);
    // Update data-theme on body
    html = html.replace(/data-theme="[^"]*"/, `data-theme="${packId}"`);
    writeFileSync(htmlPath, html);
  }

  console.log(`  ✓ ${gameId} — ${gameName} (${entry.label})`);
  deployed.push({ gameId, gameName, mechanic: entry.label });
  gameNum++;
}

console.log(`\n  Done: ${deployed.length} games deployed\n`);

// Output a summary JSON for landing page integration
const summaryPath = join('tools/generated-themes', packId, 'deploy-manifest.json');
const manifest = {
  packId: pack.id,
  packName: pack.name,
  startGame: startNum,
  games: deployed.map((d, i) => ({
    number: startNum + i,
    folder: d.gameId,
    name: d.gameName,
    mechanic: d.mechanic,
  })),
};

if (!dryRun) {
  writeFileSync(summaryPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest: ${summaryPath}\n`);
}
