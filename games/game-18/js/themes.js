/**
 * ANIME CLICKER -- Theme Definitions
 * Three anime themes: Dragon Ball, JoJo Stands, Naruto Jutsu.
 */

export const THEMES = {
  dragonball: {
    id: 'dragonball',
    name: 'DRAGON BALL',
    bodyTheme: 'anime-clicker',
    currencyName: 'POWER LEVEL',
    currencyShort: 'PL',
    prestigeName: 'SENZU BEANS',
    prestigeAction: 'Wish on Dragon Balls',
    upgrades: [
      { name: 'Push-ups', baseCost: 10, baseProduction: 1 },
      { name: 'Gravity Training', baseCost: 100, baseProduction: 5 },
      { name: 'Hyperbolic Chamber', baseCost: 1000, baseProduction: 25 },
      { name: 'Spirit Bomb', baseCost: 10000, baseProduction: 100 },
      { name: 'Ultra Instinct', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#3a1c00',
      bgBottom: '#1a0a00',
      accent: '#ffd700',
      accentGlow: 'rgba(255, 215, 0, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#c09050',
      currencyColor: '#ffd700',
      prestigeColor: '#4fc3f7',
      upgradeRowBg: 'rgba(255, 215, 0, 0.08)',
      upgradeRowBorder: 'rgba(255, 215, 0, 0.2)',
      tapTargetPrimary: '#ffd700',
      tapTargetSecondary: '#ff8c00',
      tapTargetHighlight: '#ffffff',
      kiBlue: '#4fc3f7',
    },
    floatingSymbols: ['\u2605', '\u2726', '\u2731', '\u2600', '\u2727'],
    /** Power level milestones that trigger "IT'S OVER 9000!" text */
    milestones: [9000, 90000, 900000, 9000000],
    /** Aura color tiers based on total earned */
    auraTiers: [
      { threshold: 0, color: '#ffffff' },
      { threshold: 1000, color: '#ffd700' },
      { threshold: 100000, color: '#4fc3f7' },
      { threshold: 10000000, color: '#c0c0c0' },
    ],
  },

  jojo: {
    id: 'jojo',
    name: 'JOJO STANDS',
    bodyTheme: 'anime-clicker',
    currencyName: 'STAND POWER',
    currencyShort: 'SP',
    prestigeName: 'REQUIEM ARROWS',
    prestigeAction: 'Requiem Evolution',
    upgrades: [
      { name: 'Star Platinum', baseCost: 10, baseProduction: 1 },
      { name: 'The World', baseCost: 100, baseProduction: 5 },
      { name: 'Gold Experience', baseCost: 1000, baseProduction: 25 },
      { name: 'King Crimson', baseCost: 10000, baseProduction: 100 },
      { name: 'Made in Heaven', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#3a3000',
      bgBottom: '#1a1500',
      accent: '#7b2ff7',
      accentGlow: 'rgba(123, 47, 247, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#b0a060',
      currencyColor: '#ffd700',
      prestigeColor: '#7b2ff7',
      upgradeRowBg: 'rgba(123, 47, 247, 0.08)',
      upgradeRowBorder: 'rgba(123, 47, 247, 0.2)',
      tapTargetPrimary: '#7b2ff7',
      tapTargetSecondary: '#5a1fb8',
      tapTargetHighlight: '#ffd700',
      menacingGold: '#ffd700',
    },
    floatingSymbols: ['\u30B4', '\u2605', '\u2726', '\u2736', '\u2737'],
    /** Poses cycle every 50 taps */
    poseInterval: 50,
  },

  naruto: {
    id: 'naruto',
    name: 'NARUTO JUTSU',
    bodyTheme: 'anime-clicker',
    currencyName: 'CHAKRA',
    currencyShort: 'CK',
    prestigeName: 'SAGE SCROLLS',
    prestigeAction: 'Become Hokage',
    upgrades: [
      { name: 'Shadow Clone', baseCost: 10, baseProduction: 1 },
      { name: 'Rasengan', baseCost: 100, baseProduction: 5 },
      { name: 'Sage Mode', baseCost: 1000, baseProduction: 25 },
      { name: 'Kurama Cloak', baseCost: 10000, baseProduction: 100 },
      { name: 'Baryon Mode', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#000a2e',
      bgBottom: '#000515',
      accent: '#ff6600',
      accentGlow: 'rgba(255, 102, 0, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#6080b0',
      currencyColor: '#0066ff',
      prestigeColor: '#ff6600',
      upgradeRowBg: 'rgba(0, 102, 255, 0.08)',
      upgradeRowBorder: 'rgba(0, 102, 255, 0.2)',
      tapTargetPrimary: '#0066ff',
      tapTargetSecondary: '#003399',
      tapTargetHighlight: '#ff6600',
      chakraBlue: '#0066ff',
    },
    floatingSymbols: ['\u5FCD', '\u706B', '\u98A8', '\u6C34', '\u96F7'],
  },
};

/** Ordered list of theme IDs for iteration. */
export const THEME_IDS = ['dragonball', 'jojo', 'naruto'];

/** Default theme if none is selected. */
export const DEFAULT_THEME = 'dragonball';
