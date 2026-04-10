/**
 * MEME CLICKER -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Idle clicker with 3 mainstream viral meme themes: Popcat, Doge Miner, Chill Guy.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { THEMES, THEME_IDS, DEFAULT_THEME } from './themes.js';
import {
  getTotalProduction,
  getPrestigeMultiplier,
  calcPrestigeTokens,
  tryBuyUpgrade,
} from './upgrades.js';
import {
  initBgSymbols,
  updateBgSymbols,
  updateFloatingTexts,
  updateDogeWords,
  spawnFloatingText,
  spawnDogeWord,
  drawBackground,
  drawCurrencyDisplay,
  drawTapTarget,
  drawUpgradeList,
  drawPrestigeButton,
  drawFloatingTexts,
  drawTapHint,
  drawOfflineNotification,
  getTapTargetBounds,
  getUpgradeRowBounds,
  getPrestigeButtonBounds,
  formatNumber,
} from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const GAME_ID = 'popcat-clicker';
const SAVE_INTERVAL_MS = 30000;
const PRESTIGE_THRESHOLD = 1000000;
const OFFLINE_MAX_SECONDS = 3600;
const OFFLINE_EFFICIENCY = 0.5;
const TAP_BASE_VALUE = 1;
const BOUNCE_DURATION = 8; // frames at 60fps
const TAP_TARGET_Y = 170; // Must match renderer.js TAP_TARGET_Y
const MOUTH_OPEN_DURATION = 8; // frames for Popcat mouth to stay open
const MOUTH_CLOSE_SPEED = 0.12; // how fast mouth closes per frame

// ---- Module-scoped game state ----

let currentThemeId = DEFAULT_THEME;
let currentTheme = THEMES[currentThemeId];

let currency = 0;
let totalEarned = 0;
let ownedCounts = [0, 0, 0, 0, 0];
let prestigeTokens = 0;
let prestigeCount = 0;
let tapValue = TAP_BASE_VALUE;
let elapsedTime = 0;

// Animation state
let bounceTimer = 0;
let bounceScale = 1;
let audioInitialized = false;
let saveTimer = 0;

// Popcat mouth animation
let mouthOpen = 0; // 0.0 = closed, 1.0 = fully open
let mouthHoldTimer = 0; // how many frames to hold mouth open

// Offline notification
let offlineNotifText = '';
let offlineNotifAlpha = 0;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME CLICKER',
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'popcat',
  subtitle: 'tap. earn. go viral.',
  accentColor: '#ff69b4',
  shareUrl: 'https://brainrotgames.com/games/game-12/',
});

// ---- Callbacks ----

shell.onStart = () => {
  loadGameState();
  initBgSymbols(currentTheme.floatingSymbols);
  saveTimer = 0;
  elapsedTime = 0;
  mouthOpen = 0;
  mouthHoldTimer = 0;
};

shell.onUpdate = (dt) => {
  elapsedTime += dt * 16.67;

  // Passive income
  const production = getTotalProduction(currentTheme.upgrades, ownedCounts, prestigeTokens);
  if (production > 0) {
    const earned = production * dt * (16.67 / 1000);
    currency += earned;
    totalEarned += earned;
  }

  // Tap value scales with prestige
  tapValue = TAP_BASE_VALUE * getPrestigeMultiplier(prestigeTokens);

  // Bounce animation
  if (bounceTimer > 0) {
    bounceTimer -= dt;
    const t = bounceTimer / BOUNCE_DURATION;
    bounceScale = 1 + Math.sin(t * Math.PI) * 0.15;
  } else {
    bounceScale = 1;
  }

  // Popcat mouth animation
  if (mouthHoldTimer > 0) {
    mouthHoldTimer -= dt;
    // Snap mouth open
    mouthOpen = Math.min(1, mouthOpen + 0.3 * dt);
  } else {
    // Close mouth gradually
    if (mouthOpen > 0) {
      mouthOpen = Math.max(0, mouthOpen - MOUTH_CLOSE_SPEED * dt);
    }
  }

  // Background symbols
  updateBgSymbols(dt);

  // Floating texts
  updateFloatingTexts(dt);

  // Doge floating words
  if (currentThemeId === 'doge') {
    updateDogeWords(dt);
  }

  // Offline notification fade
  if (offlineNotifAlpha > 0) {
    offlineNotifAlpha -= dt * 0.005;
    if (offlineNotifAlpha < 0) offlineNotifAlpha = 0;
  }

  // Auto-save timer
  saveTimer += dt * 16.67;
  if (saveTimer >= SAVE_INTERVAL_MS) {
    saveTimer = 0;
    saveGameState();
  }
};

shell.onRender = (ctx) => {
  // Background
  drawBackground(ctx, currentTheme.colors, currentThemeId);

  // Currency display
  const production = getTotalProduction(currentTheme.upgrades, ownedCounts, prestigeTokens);
  drawCurrencyDisplay(ctx, currentTheme, currency, production, prestigeTokens);

  // Tap target
  drawTapTarget(ctx, currentTheme, bounceScale, elapsedTime, mouthOpen);

  // Tap hint if no upgrades owned yet and low currency
  if (totalEarned < 5) {
    drawTapHint(ctx, elapsedTime, currentTheme.colors);
  }

  // Upgrade list
  drawUpgradeList(ctx, currentTheme, ownedCounts, currency);

  // Prestige button
  const potentialTokens = calcPrestigeTokens(totalEarned);
  drawPrestigeButton(ctx, currentTheme, currency, totalEarned, potentialTokens);

  // Floating texts
  drawFloatingTexts(ctx);

  // Offline notification
  drawOfflineNotification(ctx, offlineNotifText, offlineNotifAlpha, currentTheme.colors);
};

shell.onGameOver = () => {
  // Game-over is used for prestige screen
  const tokensGained = calcPrestigeTokens(totalEarned);

  return {
    score: Math.floor(totalEarned),
    message: 'You went viral with ' + tokensGained + ' ' + currentTheme.prestigeName + '!',
    scoreLabel: currentTheme.currencyName.toLowerCase() + ' earned',
  };
};

// ---- Initialize ----

shell.init();

// Register game-specific sounds
registerGameSounds();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game still works
    }
  }

  if (shell.state !== 'playing') return;

  // Check prestige button first
  if (currency >= PRESTIGE_THRESHOLD) {
    const pBounds = getPrestigeButtonBounds();
    if (hitTest(pos, pBounds)) {
      doPrestige();
      return;
    }
  }

  // Check upgrade rows
  for (let i = 0; i < currentTheme.upgrades.length; i++) {
    const rowBounds = getUpgradeRowBounds(i);
    if (hitTest(pos, rowBounds)) {
      const result = tryBuyUpgrade(i, currentTheme.upgrades[i], ownedCounts, currency);
      if (result.success) {
        currency = result.newCurrency;
        playSound('buy');
        spawnFloatingText(
          rowBounds.x + rowBounds.width / 2,
          rowBounds.y,
          '-' + formatNumber(result.cost),
          currentTheme.colors.textSecondary
        );
      } else {
        playSound('cantbuy');
      }
      return;
    }
  }

  // Check tap target
  const tapBounds = getTapTargetBounds();
  if (hitTest(pos, tapBounds)) {
    doTap(pos);
    return;
  }

  // Tap anywhere above upgrades = tap the target (generous hit zone)
  if (pos.y < 300) {
    doTap(pos);
  }
});

// Keyboard handler for Space/Enter taps (onTapAt only fires for mouse/touch).
input.onTap(() => {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed
    }
  }
});

// Keyboard game input: Space/Enter triggers the tap target.
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (shell.state === 'playing') {
      doTap({ x: LOGICAL_WIDTH / 2, y: TAP_TARGET_Y });
    }
  }
});

// ---- Theme Selector in Menu ----

setupThemeSelect();

// ---- Helper Functions ----

/**
 * Handle a tap on the main target.
 *
 * @param {{ x: number, y: number }} pos
 */
function doTap(pos) {
  const earned = tapValue;
  currency += earned;
  totalEarned += earned;
  bounceTimer = BOUNCE_DURATION;

  // Theme-specific tap effects
  if (currentThemeId === 'popcat') {
    // Open the cat's mouth
    mouthOpen = 0.8;
    mouthHoldTimer = MOUTH_OPEN_DURATION;
    playSound('pop');
  } else if (currentThemeId === 'doge') {
    // Spawn floating "wow" text
    spawnDogeWord();
    playSound('tap');
  } else {
    playSound('tap');
  }

  spawnFloatingText(
    pos.x,
    pos.y - 20,
    '+' + formatNumber(earned),
    currentTheme.colors.currencyColor
  );
}

/**
 * Perform a prestige reset.
 */
function doPrestige() {
  const tokensGained = calcPrestigeTokens(totalEarned);
  if (tokensGained <= 0) return;

  prestigeTokens += tokensGained;
  prestigeCount++;

  // Save prestige data before transitioning
  saveGameState();

  // Transition to game-over to show prestige stats
  shell.setState('game-over');

  // After game-over, reset the cycle
  currency = 0;
  totalEarned = 0;
  ownedCounts = [0, 0, 0, 0, 0];

  // Save the reset state
  saveGameState();

  playSound('prestige');
}

/**
 * Check if a point is inside a bounding box.
 *
 * @param {{ x: number, y: number }} point
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 * @returns {boolean}
 */
function hitTest(point, bounds) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

// ---- Save / Load ----

/**
 * Build the localStorage key for the current theme.
 *
 * @param {string} key
 * @returns {string}
 */
function saveKey(key) {
  return currentThemeId + '-' + key;
}

/**
 * Save the current game state to localStorage.
 */
function saveGameState() {
  const state = {
    currency,
    totalEarned,
    ownedCounts,
    prestigeTokens,
    prestigeCount,
    lastSave: Date.now(),
  };
  setData(GAME_ID, saveKey('state'), JSON.stringify(state));
}

/**
 * Load game state from localStorage. Applies offline progress.
 */
function loadGameState() {
  const raw = getData(GAME_ID, saveKey('state'));
  if (!raw) {
    // Fresh game
    currency = 0;
    totalEarned = 0;
    ownedCounts = [0, 0, 0, 0, 0];
    prestigeTokens = 0;
    prestigeCount = 0;
    offlineNotifAlpha = 0;
    return;
  }

  try {
    const state = JSON.parse(raw);
    currency = state.currency || 0;
    totalEarned = state.totalEarned || 0;
    ownedCounts = state.ownedCounts || [0, 0, 0, 0, 0];
    prestigeTokens = state.prestigeTokens || 0;
    prestigeCount = state.prestigeCount || 0;

    // Offline progress
    if (state.lastSave) {
      const secondsAway = (Date.now() - state.lastSave) / 1000;
      if (secondsAway > 5) {
        const production = getTotalProduction(currentTheme.upgrades, ownedCounts, prestigeTokens);
        if (production > 0) {
          const cappedSeconds = Math.min(secondsAway, OFFLINE_MAX_SECONDS);
          const offlineEarnings = production * cappedSeconds * OFFLINE_EFFICIENCY;
          currency += offlineEarnings;
          totalEarned += offlineEarnings;
          offlineNotifText = 'Offline: +' + formatNumber(offlineEarnings) + ' ' + currentTheme.currencyShort;
          offlineNotifAlpha = 1;
        }
      }
    }
  } catch {
    // Corrupted save -- start fresh
    currency = 0;
    totalEarned = 0;
    ownedCounts = [0, 0, 0, 0, 0];
    prestigeTokens = 0;
    prestigeCount = 0;
  }
}

// ---- Theme Selection ----

/**
 * Get the selected theme ID from localStorage.
 *
 * @returns {string}
 */
function getSelectedThemeId() {
  const saved = getData(GAME_ID, 'theme');
  if (saved && THEMES[saved]) return saved;
  return DEFAULT_THEME;
}

/**
 * Switch to a different theme. Saves current state first.
 *
 * @param {string} themeId
 */
function switchTheme(themeId) {
  if (!THEMES[themeId]) return;
  if (themeId === currentThemeId) return;

  // Save current theme's state if we're playing
  if (shell.state === 'playing') {
    saveGameState();
  }

  currentThemeId = themeId;
  currentTheme = THEMES[themeId];
  setData(GAME_ID, 'theme', themeId);

  // Update body theme for CSS variables
  document.body.setAttribute('data-theme', currentTheme.bodyTheme);

  // Update shell title display
  const titleEl = document.querySelector('.menu-screen__title');
  if (titleEl) titleEl.textContent = currentTheme.name;

  // Re-init background symbols
  initBgSymbols(currentTheme.floatingSymbols);

  // Reset mouth state
  mouthOpen = 0;
  mouthHoldTimer = 0;

  // Refresh theme select UI
  setupThemeSelect();
}

/**
 * Set up theme selector buttons in the menu.
 */
function setupThemeSelect() {
  const secondary = document.getElementById('menu-secondary');
  if (!secondary) return;

  secondary.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'theme-select';

  for (const id of THEME_IDS) {
    const theme = THEMES[id];
    const btn = document.createElement('button');
    btn.className = 'theme-select__btn';
    btn.textContent = theme.name;
    if (id === currentThemeId) {
      btn.classList.add('theme-select__btn--selected');
    }
    btn.addEventListener('click', () => {
      switchTheme(id);
      playSound('uiclick');
    });
    container.appendChild(btn);
  }

  secondary.appendChild(container);
}

// ---- Sound Registration ----

/**
 * Register procedural sounds for this game.
 */
function registerGameSounds() {
  registerSound('tap', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 800, duration: 0.05, gain: 0.12 },
    ],
  });

  // Popcat-specific pop sound -- satisfying, snappy
  registerSound('pop', {
    notes: [
      { type: 'sine', frequency: 800, endFrequency: 1200, duration: 0.04, gain: 0.2 },
      { type: 'square', frequency: 300, duration: 0.03, delay: 0.02, gain: 0.08 },
    ],
  });

  registerSound('buy', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.06, gain: 0.15 },
      { type: 'sine', frequency: 660, duration: 0.06, delay: 0.06, gain: 0.15 },
    ],
  });

  registerSound('cantbuy', {
    notes: [
      { type: 'square', frequency: 200, endFrequency: 150, duration: 0.12, gain: 0.08 },
    ],
  });

  registerSound('prestige', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Startup ----

// Load theme preference on startup
currentThemeId = getSelectedThemeId();
currentTheme = THEMES[currentThemeId];
document.body.setAttribute('data-theme', currentTheme.bodyTheme);

// Update menu title to match selected theme
requestAnimationFrame(() => {
  const titleEl = document.querySelector('.menu-screen__title');
  if (titleEl) titleEl.textContent = currentTheme.name;
  setupThemeSelect();
});
