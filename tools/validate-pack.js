#!/usr/bin/env node
/**
 * validate-pack.js — Content Pack Validator
 *
 * Usage: node tools/validate-pack.js tools/content-packs/skibidi.json
 *
 * Checks that a content pack has all required fields and minimum content
 * to generate all 17 game mechanics.
 */

import { readFileSync } from 'fs';

const REQUIRED_FIELDS = {
  // Identity
  'id':        { type: 'string', minLength: 1 },
  'name':      { type: 'string', minLength: 1 },
  'tagline':   { type: 'string', minLength: 1 },
  'bodyTheme': { type: 'string', minLength: 1 },

  // Characters
  'characters.protagonist.name':      { type: 'string' },
  'characters.protagonist.shortName': { type: 'string' },
  'characters.protagonist.emoji':     { type: 'string' },
  'characters.antagonist.name':       { type: 'string' },
  'characters.antagonist.shortName':  { type: 'string' },
  'characters.antagonist.emoji':      { type: 'string' },
  'characters.supporting':            { type: 'array', minLength: 10 },

  // Items
  'items.collectible.name':   { type: 'string' },
  'items.collectible.emoji':  { type: 'string' },
  'items.collectibles':       { type: 'array', minLength: 5 },
  'items.obstacles':          { type: 'array', minLength: 3 },
  'items.projectile.name':    { type: 'string' },
  'items.target.name':        { type: 'string' },

  // Palette
  'palette.primary':              { type: 'string' },
  'palette.secondary':            { type: 'string' },
  'palette.bgTop':                { type: 'string' },
  'palette.bgBottom':             { type: 'string' },
  'palette.text':                 { type: 'string' },
  'palette.textSecondary':        { type: 'string' },
  'palette.glow':                 { type: 'string' },
  'palette.colorSwitchSegments':  { type: 'array', minLength: 4 },
  'palette.blockColors':          { type: 'array', minLength: 5 },
  'palette.tileColors':           { type: 'array', minLength: 11 },

  // Copy
  'copy.scoreLabel':       { type: 'string' },
  'copy.currencyName':     { type: 'string' },
  'copy.currencyShort':    { type: 'string' },
  'copy.prestigeName':     { type: 'string' },
  'copy.prestigeAction':   { type: 'string' },
  'copy.deathMessages':    { type: 'array', minLength: 8 },
  'copy.winMessages':      { type: 'array', minLength: 4 },
  'copy.comboMessages':    { type: 'array', minLength: 5 },
  'copy.catchphrases':     { type: 'array', minLength: 5 },
  'copy.floatingSymbols':  { type: 'array', minLength: 5 },

  // Mechanic overrides
  'mechanics.clicker.upgrades':            { type: 'array', minLength: 5 },
  'mechanics.tiles2048.tiers':             { type: 'object', minKeys: 11 },
  'mechanics.memoryMatch.pairs':           { type: 'array', minLength: 8 },
  'mechanics.whack.roster':                { type: 'array', minLength: 5 },
  'mechanics.wordle.answerWords':          { type: 'array', minLength: 50 },
  'mechanics.hangman.words':               { type: 'array', minLength: 20 },
  'mechanics.trivia.questions':            { type: 'array', minLength: 6 },
};

// Minimum counts for production-ready packs (warnings, not errors)
const RECOMMENDED = {
  'mechanics.hangman.words':    80,
  'mechanics.trivia.questions': 60,
  'mechanics.wordle.answerWords': 50,
  'characters.supporting':      10,
};

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

function validate(pack) {
  const errors = [];
  const warnings = [];

  for (const [path, rule] of Object.entries(REQUIRED_FIELDS)) {
    const val = getPath(pack, path);

    if (val === undefined || val === null) {
      errors.push(`MISSING: ${path}`);
      continue;
    }

    if (rule.type === 'string' && typeof val !== 'string') {
      errors.push(`TYPE: ${path} should be string, got ${typeof val}`);
    }

    if (rule.type === 'string' && rule.minLength && val.length < rule.minLength) {
      errors.push(`EMPTY: ${path} is empty`);
    }

    if (rule.type === 'array') {
      if (!Array.isArray(val)) {
        errors.push(`TYPE: ${path} should be array, got ${typeof val}`);
      } else if (rule.minLength && val.length < rule.minLength) {
        errors.push(`SHORT: ${path} has ${val.length} items, need at least ${rule.minLength}`);
      }
    }

    if (rule.type === 'object' && rule.minKeys) {
      if (typeof val !== 'object' || val === null) {
        errors.push(`TYPE: ${path} should be object`);
      } else if (Object.keys(val).length < rule.minKeys) {
        errors.push(`SHORT: ${path} has ${Object.keys(val).length} keys, need at least ${rule.minKeys}`);
      }
    }
  }

  // Recommended counts
  for (const [path, min] of Object.entries(RECOMMENDED)) {
    const val = getPath(pack, path);
    if (Array.isArray(val) && val.length < min) {
      warnings.push(`LOW: ${path} has ${val.length} items, recommend at least ${min} for production`);
    }
  }

  // Structural checks
  const supporting = getPath(pack, 'characters.supporting');
  if (Array.isArray(supporting)) {
    for (let i = 0; i < supporting.length; i++) {
      if (!supporting[i].name) errors.push(`MISSING: characters.supporting[${i}].name`);
      if (!supporting[i].emoji) errors.push(`MISSING: characters.supporting[${i}].emoji`);
      if (supporting[i].tier === undefined) warnings.push(`MISSING: characters.supporting[${i}].tier (defaults to 1)`);
    }
  }

  const upgrades = getPath(pack, 'mechanics.clicker.upgrades');
  if (Array.isArray(upgrades)) {
    for (let i = 0; i < upgrades.length; i++) {
      if (!upgrades[i].name) errors.push(`MISSING: mechanics.clicker.upgrades[${i}].name`);
      if (upgrades[i].baseCost === undefined) errors.push(`MISSING: mechanics.clicker.upgrades[${i}].baseCost`);
      if (upgrades[i].baseProduction === undefined) errors.push(`MISSING: mechanics.clicker.upgrades[${i}].baseProduction`);
    }
  }

  const roster = getPath(pack, 'mechanics.whack.roster');
  if (Array.isArray(roster)) {
    const hasPenalty = roster.some(r => r.isPenalty);
    const hasBonus = roster.some(r => r.isBonus);
    if (!hasPenalty) warnings.push('GAMEPLAY: whack roster has no penalty character');
    if (!hasBonus) warnings.push('GAMEPLAY: whack roster has no bonus character');
  }

  const pairs = getPath(pack, 'mechanics.memoryMatch.pairs');
  if (Array.isArray(pairs)) {
    const emojis = pairs.map(p => p.emoji);
    const dupes = emojis.filter((e, i) => emojis.indexOf(e) !== i);
    if (dupes.length > 0) errors.push(`DUPE: memoryMatch.pairs has duplicate emoji: ${dupes.join(', ')}`);
  }

  const tiers = getPath(pack, 'mechanics.tiles2048.tiers');
  if (typeof tiers === 'object' && tiers !== null) {
    const expected = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    for (const v of expected) {
      if (!tiers[v]) errors.push(`MISSING: mechanics.tiles2048.tiers.${v}`);
    }
  }

  return { errors, warnings };
}

// --- CLI ---
const file = process.argv[2];
if (!file) {
  console.error('Usage: node tools/validate-pack.js <path-to-pack.json>');
  process.exit(1);
}

let pack;
try {
  pack = JSON.parse(readFileSync(file, 'utf-8'));
} catch (e) {
  console.error(`Failed to read/parse ${file}: ${e.message}`);
  process.exit(1);
}

const { errors, warnings } = validate(pack);

console.log(`\n  Content Pack: ${pack.name || '(unnamed)'}`);
console.log(`  ID: ${pack.id || '(none)'}`);
console.log(`  ─────────────────────────────────────\n`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('  ✓ All checks passed. Pack is ready for generation.\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`  ERRORS (${errors.length}):\n`);
  for (const e of errors) {
    console.log(`    ✗ ${e}`);
  }
  console.log();
}

if (warnings.length > 0) {
  console.log(`  WARNINGS (${warnings.length}):\n`);
  for (const w of warnings) {
    console.log(`    ⚠ ${w}`);
  }
  console.log();
}

const mechanicCount = errors.length === 0 ? 17 : '?';
console.log(`  Result: ${errors.length} errors, ${warnings.length} warnings`);
console.log(`  Mechanics coverable: ${mechanicCount}/17\n`);

process.exit(errors.length > 0 ? 1 : 0);
