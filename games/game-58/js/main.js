/**
 * MEME PIANO -- Main Entry Point
 * Piano Tiles clone with 3 meme theme variants.
 * 4-column grid, tiles scroll down, tap to score, miss = game over.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { clamp, randomInt } from '../../shared/utils.js';
import { THEMES, getThemeById } from './themes.js';
import {
  drawBackground,
  drawTile,
  drawScore,
  drawCombo,
  drawSpeedBar,
  drawFloatingTexts,
  drawTapFlashes,
  drawMissFlash,
} from './renderer.js';

// ---- Constants ----

const CANVAS_W = 400;
const CANVAS_H = 700;
const NUM_COLS = 4;
const COL_W = CANVAS_W / NUM_COLS;
const TILE_HEIGHT = 120;
const BASE_SPEED = 3.0;       // px per frame at start
const SPEED_INCREMENT = 0.004; // speed increase per tile tapped
const MAX_SPEED = 12;          // cap for display bar
const SPAWN_GAP = TILE_HEIGHT + 8; // min gap between tile bottoms when spawning
const GAME_ID = 'meme-piano';

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'skibidi-beat';
}

function saveTheme(id) {
  setData(GAME_ID, 'theme', id);
}

// ---- Game State ----

/** @type {Array<{lane: number, y: number, height: number, tapped: boolean, tapAge: number, variant: number}>} */
let tiles = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let speed = BASE_SPEED;
let gameOver = false;
let tileIdCounter = 0;
let missFlashAge = 1;
let pendingTaps = [];

/** @type {Array<{text: string, x: number, y: number, color: string, age: number, maxAge: number, size: number}>} */
let floatingTexts = [];

/** @type {Array<{lane: number, age: number}>} */
let tapFlashes = [];

// Track which lane the next tile should NOT be in (avoid repeats)
let lastLane = -1;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME PIANO',
  gameId: GAME_ID,
  logicalWidth: CANVAS_W,
  logicalHeight: CANVAS_H,
  maxDisplayWidth: 480,
  theme: 'meme-piano',
  subtitle: 'tap the tiles. don\'t miss.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-24/',
});

// ---- Tile Spawning ----

/**
 * Spawn a new tile at the top. Ensures the lane differs from the previous tile.
 */
function spawnTile() {
  let lane;
  do {
    lane = randomInt(0, NUM_COLS - 1);
  } while (lane === lastLane);
  lastLane = lane;

  tiles.push({
    lane,
    y: -TILE_HEIGHT,
    height: TILE_HEIGHT,
    tapped: false,
    tapAge: 0,
    variant: tileIdCounter++,
  });
}

/**
 * Check if we need to spawn a new tile. We keep a buffer of tiles above the screen
 * so the player always sees incoming tiles.
 */
function maybeSpawnTiles() {
  // Find the topmost untapped tile
  let topY = 0;
  for (const tile of tiles) {
    if (!tile.tapped && tile.y < topY) {
      topY = tile.y;
    }
  }

  // Spawn tiles to fill above screen
  while (topY > -CANVAS_H * 0.5) {
    topY -= SPAWN_GAP;
    let lane;
    do {
      lane = randomInt(0, NUM_COLS - 1);
    } while (lane === lastLane);
    lastLane = lane;

    tiles.push({
      lane,
      y: topY,
      height: TILE_HEIGHT,
      tapped: false,
      tapAge: 0,
      variant: tileIdCounter++,
    });
  }
}

// ---- Input Processing ----

/**
 * Process a tap at a given position. Find the lowest untapped tile in the tapped lane.
 *
 * @param {number} x - Logical x coordinate
 * @param {number} y - Logical y coordinate
 */
function handleTap(x, y) {
  if (gameOver) return;

  const tappedLane = clamp(Math.floor(x / COL_W), 0, NUM_COLS - 1);

  // Add tap flash
  tapFlashes.push({ lane: tappedLane, age: 0 });

  // Find the lowest (highest y) untapped tile in this lane that is visible
  let bestTile = null;
  let bestY = -Infinity;

  for (const tile of tiles) {
    if (tile.tapped) continue;
    if (tile.lane !== tappedLane) continue;
    // Tile must be at least partially on screen
    if (tile.y + tile.height < 0) continue;
    if (tile.y > CANVAS_H) continue;

    if (tile.y > bestY) {
      bestY = tile.y;
      bestTile = tile;
    }
  }

  if (bestTile) {
    // Successful tap
    bestTile.tapped = true;
    bestTile.tapAge = 0;
    score++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    // Increase speed
    speed = BASE_SPEED + SPEED_INCREMENT * score;

    // Play sound with pitch variation per lane
    const pitchNames = ['tap-0', 'tap-1', 'tap-2', 'tap-3'];
    playSound(pitchNames[tappedLane]);

    // Check combo milestones
    checkComboMilestone();
  } else {
    // Tapped empty lane -- game over
    triggerGameOver();
  }
}

/**
 * Check if the current combo has reached a milestone and show floating text.
 */
function checkComboMilestone() {
  const messages = currentTheme.comboMessages;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (combo === messages[i].threshold) {
      floatingTexts.push({
        text: messages[i].text,
        x: CANVAS_W / 2,
        y: CANVAS_H / 2 - 40,
        color: messages[i].color,
        age: 0,
        maxAge: 1.2,
        size: 32,
      });
      playSound('combo-hit');
      break;
    }
  }
}

/**
 * Trigger game over state.
 */
function triggerGameOver() {
  gameOver = true;
  missFlashAge = 0;
  playSound('miss');

  // Small delay so the red flash is visible
  setTimeout(() => {
    playSound('gameover');
    shell.setState('game-over');
  }, 300);
}

// ---- Callbacks ----

shell.onStart = () => {
  tiles = [];
  score = 0;
  combo = 0;
  maxCombo = 0;
  speed = BASE_SPEED;
  gameOver = false;
  tileIdCounter = 0;
  lastLane = -1;
  missFlashAge = 1;
  floatingTexts = [];
  tapFlashes = [];
  pendingTaps = [];

  // Seed initial tiles
  for (let i = 0; i < 6; i++) {
    spawnTile();
    // Space them out vertically
    const lastTile = tiles[tiles.length - 1];
    lastTile.y = CANVAS_H - TILE_HEIGHT - i * SPAWN_GAP;
  }

  // Reverse so the bottom tile is first in the array (for rendering order)
  tiles.reverse();
};

shell.onUpdate = (dt) => {
  if (gameOver) return;

  // 1. Process pending taps
  for (const tap of pendingTaps) {
    handleTap(tap.x, tap.y);
  }
  pendingTaps = [];

  if (gameOver) return;

  // 2. Move tiles down
  const movement = speed * dt;
  for (const tile of tiles) {
    tile.y += movement;

    // Update tap age for fading
    if (tile.tapped) {
      tile.tapAge += dt * 0.06;
    }
  }

  // 3. Check for missed tiles (bottom of untapped tile passes the screen bottom)
  for (const tile of tiles) {
    if (!tile.tapped && tile.y > CANVAS_H) {
      triggerGameOver();
      return;
    }
  }

  // 4. Remove tiles that are fully off screen and tapped
  tiles = tiles.filter(t => {
    if (t.tapped && t.y > CANVAS_H + 50) return false;
    return true;
  });

  // 5. Spawn new tiles
  maybeSpawnTiles();

  // 6. Update floating texts
  const dtSec = dt * (1 / 60);
  for (const ft of floatingTexts) {
    ft.age += dtSec;
  }
  floatingTexts = floatingTexts.filter(ft => ft.age < ft.maxAge);

  // 7. Update tap flashes
  for (const flash of tapFlashes) {
    flash.age += dtSec;
  }
  tapFlashes = tapFlashes.filter(f => f.age < 0.3);

  // 8. Update miss flash
  if (missFlashAge < 1) {
    missFlashAge += dtSec * 3;
  }
};

shell.onRender = (ctx) => {
  // 1. Background
  drawBackground(ctx, CANVAS_W, CANVAS_H, currentTheme);

  // 2. Tap flashes (behind tiles)
  drawTapFlashes(ctx, tapFlashes, COL_W, CANVAS_H, currentTheme);

  // 3. Tiles
  for (const tile of tiles) {
    // Only draw if at least partially visible
    if (tile.y + tile.height < -10 || tile.y > CANVAS_H + 10) continue;
    drawTile(ctx, tile, COL_W, currentTheme, 0);
  }

  // 4. Miss flash overlay
  drawMissFlash(ctx, CANVAS_W, CANVAS_H, missFlashAge);

  // 5. HUD
  drawScore(ctx, CANVAS_W, score, currentTheme);
  drawCombo(ctx, CANVAS_W, combo, currentTheme);
  drawSpeedBar(ctx, CANVAS_W, speed, BASE_SPEED, MAX_SPEED, currentTheme);

  // 6. Floating texts
  drawFloatingTexts(ctx, floatingTexts);
};

shell.onGameOver = () => {
  const messages = currentTheme.deathMessages;
  const message = messages[randomInt(0, messages.length - 1)];
  return {
    score,
    message,
    scoreLabel: 'tiles hit',
  };
};

shell.onGameOverRender = (ctx) => {
  drawBackground(ctx, CANVAS_W, CANVAS_H, currentTheme);

  // Draw remaining tiles frozen
  for (const tile of tiles) {
    if (tile.y + tile.height < -10 || tile.y > CANVAS_H + 10) continue;
    drawTile(ctx, tile, COL_W, currentTheme, 0);
  }
};

// ---- Init ----

shell.init();

const input = createInputManager(shell.getCanvas(), CANVAS_W, CANVAS_H);

// ---- Audio Setup ----

let audioReady = false;

function ensureAudio() {
  if (audioReady) return;
  initAudio();
  audioReady = true;

  // Register tile tap sounds -- different pitch per lane
  registerSound('tap-0', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.08, gain: 0.2 },
    ],
  });
  registerSound('tap-1', {
    notes: [
      { type: 'sine', frequency: 659, duration: 0.08, gain: 0.2 },
    ],
  });
  registerSound('tap-2', {
    notes: [
      { type: 'sine', frequency: 784, duration: 0.08, gain: 0.2 },
    ],
  });
  registerSound('tap-3', {
    notes: [
      { type: 'sine', frequency: 988, duration: 0.08, gain: 0.2 },
    ],
  });

  // Miss sound -- low buzz
  registerSound('miss', {
    notes: [
      { type: 'sawtooth', frequency: 120, endFrequency: 60, duration: 0.3, gain: 0.25 },
    ],
  });

  // Combo milestone sound -- ascending arpeggio
  registerSound('combo-hit', {
    notes: [
      { type: 'triangle', frequency: 660, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 880, duration: 0.08, delay: 0.06, gain: 0.2 },
      { type: 'triangle', frequency: 1100, duration: 0.1, delay: 0.12, gain: 0.25 },
    ],
  });
}

input.onTap(() => {
  ensureAudio();
});

input.onTapAt(({ x, y }) => {
  ensureAudio();

  if (shell.state !== 'playing') return;
  pendingTaps.push({ x, y });
});

// ---- Theme Selector in Menu ----

setupThemeSelector();

function setupThemeSelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'theme-select';

    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.className = 'theme-select__btn';
      if (theme.id === currentTheme.id) {
        btn.classList.add('theme-select__btn--active');
      }
      btn.textContent = theme.name;
      btn.style.borderColor = theme.accentColor;

      btn.addEventListener('click', () => {
        currentTheme = theme;
        saveTheme(theme.id);

        // Update shell subtitle color hint
        const titleEl = document.querySelector('.menu-screen__title');
        if (titleEl) titleEl.textContent = 'MEME PIANO';

        const subtitleEl = document.querySelector('.menu-screen__subtitle');
        if (subtitleEl) subtitleEl.textContent = theme.name.toLowerCase() + ' mode';

        setupThemeSelector();
        ensureAudio();
        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
