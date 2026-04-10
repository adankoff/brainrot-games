/**
 * FLAPPY TRALALERO -- Constants
 * All tuning values, colors, text content.
 */

import { readThemeColor } from '../../shared/theme-utils.js';

// ---- Dimensions ----
export const LOGICAL_WIDTH = 360;
export const LOGICAL_HEIGHT = 640;
export const FLOOR_HEIGHT = 60;

// ---- Physics ----
export const GRAVITY = 0.4;
export const TAP_IMPULSE = -7.0;
export const TERMINAL_VELOCITY = 10.0;

// ---- Player ----
export const PLAYER_X = 80;
export const PLAYER_VISUAL_SIZE = 40;
export const PLAYER_HITBOX_WIDTH = 30;
export const PLAYER_HITBOX_HEIGHT = 30;
export const FLAP_DURATION = 300;
export const FLAP_FRAME_INTERVAL = 100;
export const DEATH_SPIN_VELOCITY = 0.15;

// ---- Difficulty ----
export const BASE_SCROLL_SPEED = 2.5;
export const MAX_SCROLL_SPEED = 4.0;
export const SPEED_PER_SCORE = 0.03;

export const BASE_GAP_SIZE = 200;
export const MIN_GAP_SIZE = 130;
export const GAP_SHRINK_PER_SCORE = 1.4;

export const BASE_SPACING = 250;
export const MIN_SPACING = 180;
export const SPACING_SHRINK_PER_SCORE = 1.5;

// ---- Obstacles ----
export const OBSTACLE_WIDTH = 60;
export const GAP_BUFFER = 60; // min distance from ceiling/floor to gap center edge
export const OBSTACLE_TYPES = ['bombardiro', 'mewing', 'skibidi', 'ohio', 'fanum'];

// ---- Scoring ----
export const SCORE_POP_DURATION = 150;
export const SCORE_FLASH_DURATION = 200;

// ---- Screen shake ----
export const SHAKE_MAGNITUDE = 4;
export const SHAKE_DURATION = 200;

// ---- Death delay before game-over ----
export const DEATH_DELAY = 600;

// ---- Colors (read from CSS custom properties, grayscale fallbacks) ----
export const COLOR_SKY         = readThemeColor('--game-sky',        '#0a0a0a');
export const COLOR_FLOOR       = readThemeColor('--game-floor',      '#1a1a1a');
export const COLOR_FLOOR_LINE  = readThemeColor('--game-floor-line', '#2a2a2a');
export const COLOR_FLOOR_EDGE  = readThemeColor('--game-floor-edge', '#2e2e2e');
export const COLOR_SCORE       = readThemeColor('--game-score',      '#f0f0f0');
export const COLOR_SCORE_FLASH = readThemeColor('--game-score-flash','#cccccc');
export const COLOR_SCORE_69    = readThemeColor('--game-score-69',   '#aaaaaa');
export const COLOR_HUD_HINT    = readThemeColor('--game-hud-hint',   '#f0f0f0');
export const COLOR_WINDOW_DOTS = readThemeColor('--game-window-dots','rgba(200, 200, 200, 0.1)');
export const COLOR_FAR_FALLBACK = readThemeColor('--game-far-fallback','#111111');
export const COLOR_MID_FALLBACK = readThemeColor('--game-mid-fallback','#1a1a1a');

// ---- Biomes (themed via CSS) ----
export const BIOMES = [
  { name: 'Italian Piazza',      far: readThemeColor('--game-biome0-far', '#111111'), mid: readThemeColor('--game-biome0-mid', '#1a1a1a') },
  { name: 'Ohio Wasteland',      far: readThemeColor('--game-biome1-far', '#131313'), mid: readThemeColor('--game-biome1-mid', '#1c1c1c') },
  { name: 'Sigma Gym',           far: readThemeColor('--game-biome2-far', '#151515'), mid: readThemeColor('--game-biome2-mid', '#1e1e1e') },
  { name: 'Skibidi Battlefield', far: readThemeColor('--game-biome3-far', '#121212'), mid: readThemeColor('--game-biome3-mid', '#1b1b1b') },
  { name: 'Meme Void',           far: null,      mid: null      },
];

// ---- Death Messages ----
export const DEATH_MESSAGES = {
  0: [
    'certified NPC moment',
    'skill issue detected',
    'you literally didn\'t even try',
    '0 aura. absolute 0 aura.',
  ],
  1: [
    'you tried. that\'s... something',
    'participation trophy incoming',
    'the mewing wasn\'t strong enough',
    'even Tralalero is embarrassed',
  ],
  6: [
    'not terrible. not great. mid.',
    'your aura is... detectable',
    'a humble beginning to a mediocre career',
    'the skibidi toilet claims another victim',
  ],
  15: [
    'okay that was lowkey decent',
    'slight aura detected',
    'Bombardiro would be mildly impressed',
    'you\'re starting to lock in',
  ],
  25: [
    'actual rizz detected',
    'the sigma grindset is working',
    'Tralalero salutes you from beyond',
    'that was genuinely not terrible',
  ],
  50: [
    'the aura is immeasurable',
    'okay you\'re actually goated',
    'Cappuccino Assassino tips his cup to you',
    'certified sigma. the grind is real.',
  ],
  100: [
    'you need to go outside',
    'this is no longer a game. this is a lifestyle.',
    'what Tralalero Tralala would\'ve wanted',
    'bro thinks he\'s a professional flappy player',
    'touch grass immediately',
  ],
};

// ---- Character Unlocks ----
export const CHARACTER_UNLOCKS = {
  tralalero:  { type: null, value: 0 },
  bombardiro: { type: 'score', value: 10 },
  lirili:     { type: 'score', value: 25 },
  tungtung:   { type: 'score', value: 50 },
  cappuccino: { type: 'score', value: 100 },
  brrbrr:     { type: 'ads', value: 5 },
  lavaca:     { type: 'titletaps', value: 10 },
};

// ---- Pass Effect Durations (ms) ----
export const PASS_EFFECT_DURATIONS = {
  bombardiro: 300,
  mewing: 200,
  skibidi: 250,
  ohio: 150,
  fanum: 500,
};
