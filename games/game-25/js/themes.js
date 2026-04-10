/**
 * BRAINROT COLOR SWITCH -- Theme Definitions
 * Three swappable meme themes with distinct visuals and flavor text.
 */

// ---- Theme: SKIBIDI SPECTRUM ----

const skibidiSpectrum = {
  id: 'skibidi-spectrum',
  name: 'SKIBIDI SPECTRUM',
  accentColor: '#b347ff',
  bgColor: '#0d0018',
  bgColorAlt: '#1a0033',
  particleColor: 'rgba(179, 71, 255, 0.3)',
  colors: ['#ff3366', '#ffcc00', '#33ff66', '#3366ff'],
  colorNames: ['red', 'yellow', 'green', 'blue'],
  ballEmoji: null,
  ballShape: 'toilet',
  glowColor: '#b347ff',
  scoreColor: '#ffffff',
  deathMessages: [
    'skibidi skill issue fr fr',
    'toilet flushed you',
    'wrong color, no rizz',
    'skill diff detected',
    'you got skibidi\'d',
    'L + ratio + wrong segment',
  ],
};

// ---- Theme: OHIO RAINBOW ----

const ohioRainbow = {
  id: 'ohio-rainbow',
  name: 'OHIO RAINBOW',
  accentColor: '#ffd700',
  bgColor: '#0a0a00',
  bgColorAlt: '#1a1400',
  particleColor: 'rgba(255, 215, 0, 0.25)',
  colors: ['#ff4444', '#ffdd00', '#44ff44', '#4488ff'],
  colorNames: ['red', 'yellow', 'green', 'blue'],
  ballEmoji: null,
  ballShape: 'corn',
  glowColor: '#ffd700',
  scoreColor: '#ffffff',
  deathMessages: [
    'only in ohio fr',
    'ohio claimed another one',
    'average ohio skill level',
    'this would only happen in ohio',
    'ohio final boss: colors',
    'ohio ain\'t real and neither is your score',
  ],
};

// ---- Theme: AURA SHIFT ----

const auraShift = {
  id: 'aura-shift',
  name: 'AURA SHIFT',
  accentColor: '#aa66ff',
  bgColor: '#080014',
  bgColorAlt: '#0f002a',
  particleColor: 'rgba(170, 102, 255, 0.2)',
  colors: ['#ff4477', '#ffaa33', '#44ffaa', '#7744ff'],
  colorNames: ['rose', 'amber', 'jade', 'violet'],
  ballEmoji: null,
  ballShape: 'orb',
  glowColor: '#aa66ff',
  scoreColor: '#ffffff',
  deathMessages: [
    '+0 aura',
    'aura completely depleted',
    'negative aura detected',
    'your aura was mid',
    'aura check failed',
    '-1000 aura for that one',
  ],
};

// ---- Exports ----

export const THEMES = [skibidiSpectrum, ohioRainbow, auraShift];

/**
 * Get a theme by ID, or the first theme if not found.
 *
 * @param {string} id - Theme identifier
 * @returns {Object} Theme definition object
 */
export function getThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}
