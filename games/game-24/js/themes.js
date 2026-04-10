/**
 * MEME PIANO -- Theme Definitions
 * Three swappable themes with distinct visuals and flavor text.
 */

// ---- Theme: SKIBIDI BEAT ----

const skibidiBeat = {
  id: 'skibidi-beat',
  name: 'SKIBIDI BEAT',
  accentColor: '#b347ff',
  bgGradientTop: '#0d0018',
  bgGradientBottom: '#1a0033',
  laneLineColor: 'rgba(179, 71, 255, 0.25)',
  tileColor: '#2a0050',
  tileActiveColor: '#b347ff',
  tileBorderColor: '#8a2be2',
  tileEmoji: '\uD83D\uDEBD',
  tileEmojiAlt: '\uD83D\uDD7A',
  scoreColor: '#b347ff',
  comboColor: '#e066ff',
  deathMessages: [
    'skibidi skill issue fr fr',
    'toilet got you good',
    'no rizz on the piano',
    'skill diff detected',
    'skibidi'd yourself',
    'L + ratio + no tiles',
  ],
  comboMessages: [
    { threshold: 5, text: 'skibidi!', color: '#b347ff' },
    { threshold: 10, text: 'TOILET COMBO', color: '#e066ff' },
    { threshold: 20, text: 'SKIBIDI MASTER', color: '#ff66ff' },
    { threshold: 35, text: 'SIGMA SKIBIDI', color: '#ffaa00' },
    { threshold: 50, text: 'GYATT MODE', color: '#ff3366' },
  ],
};

// ---- Theme: SIGMA GRIND ----

const sigmaGrind = {
  id: 'sigma-grind',
  name: 'SIGMA GRIND',
  accentColor: '#ffd700',
  bgGradientTop: '#0a0a0a',
  bgGradientBottom: '#1a1400',
  laneLineColor: 'rgba(255, 215, 0, 0.2)',
  tileColor: '#1a1a00',
  tileActiveColor: '#ffd700',
  tileBorderColor: '#ccaa00',
  tileEmoji: '\u03A3',
  tileEmojiAlt: '\uD83D\uDCAA',
  scoreColor: '#ffd700',
  comboColor: '#ffee66',
  deathMessages: [
    'not sigma enough',
    'grindset interrupted',
    'beta fingers detected',
    'back to the 9-5',
    'andrew tate would cry',
    'the grind stops for no one (except you)',
  ],
  comboMessages: [
    { threshold: 5, text: 'GRIND!', color: '#ffd700' },
    { threshold: 10, text: 'SIGMA STREAK', color: '#ffee66' },
    { threshold: 20, text: 'HUSTLE MODE', color: '#ff8c00' },
    { threshold: 35, text: 'ALPHA GRIND', color: '#ff4400' },
    { threshold: 50, text: 'BILLIONAIRE MINDSET', color: '#ff0044' },
  ],
};

// ---- Theme: RIZZ RUSH ----

const rizzRush = {
  id: 'rizz-rush',
  name: 'RIZZ RUSH',
  accentColor: '#ff3388',
  bgGradientTop: '#1a000e',
  bgGradientBottom: '#33001a',
  laneLineColor: 'rgba(255, 51, 136, 0.25)',
  tileColor: '#330018',
  tileActiveColor: '#ff3388',
  tileBorderColor: '#cc2266',
  tileEmoji: '\u2764\uFE0F',
  tileEmojiAlt: '\uD83D\uDC8B',
  scoreColor: '#ff3388',
  comboColor: '#ff66aa',
  deathMessages: [
    'zero rizz detected',
    'she said no',
    'rizz.exe has crashed',
    'unspoken rizz? more like unplayed tiles',
    'L + no rizz + missed tile',
    'the talking stage is over',
  ],
  comboMessages: [
    { threshold: 5, text: 'RIZZY!', color: '#ff3388' },
    { threshold: 10, text: 'DOUBLE RIZZ', color: '#ff66aa' },
    { threshold: 20, text: 'MEGA RIZZ', color: '#ff99cc' },
    { threshold: 35, text: 'UNSPOKEN RIZZ', color: '#ffcc00' },
    { threshold: 50, text: 'W RIZZ GOD', color: '#ff0044' },
  ],
};

// ---- Exports ----

export const THEMES = [skibidiBeat, sigmaGrind, rizzRush];

/**
 * Get a theme by ID, or the first theme if not found.
 *
 * @param {string} id - Theme identifier
 * @returns {Object} Theme definition object
 */
export function getThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}
