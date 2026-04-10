/**
 * SIGMA GRINDSET SIMULATOR -- Theme Definitions
 * Each theme reskins: currency names, upgrade names, colors, tap target, background.
 */

export const THEMES = {
  sigma: {
    id: 'sigma',
    name: 'SIGMA GRINDSET',
    bodyTheme: 'sigma',
    currencyName: 'AURA POINTS',
    currencyShort: 'AURA',
    prestigeName: 'RIZZ TOKENS',
    prestigeAction: 'Ascend to Sigma',
    upgrades: [
      { name: 'Mewing Technique', baseCost: 10, baseProduction: 1 },
      { name: 'Rizz Coach', baseCost: 100, baseProduction: 5 },
      { name: 'Sigma Mindset', baseCost: 1000, baseProduction: 25 },
      { name: 'Gym Membership', baseCost: 10000, baseProduction: 100 },
      { name: 'Looksmaxxing Surgery', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#1a0a2e',
      bgBottom: '#0d0015',
      accent: '#b44dff',
      accentGlow: 'rgba(180, 77, 255, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#9070b0',
      currencyColor: '#b44dff',
      prestigeColor: '#ff6bcb',
      upgradeRowBg: 'rgba(180, 77, 255, 0.08)',
      upgradeRowBorder: 'rgba(180, 77, 255, 0.2)',
      tapTargetPrimary: '#d4a0ff',
      tapTargetSecondary: '#9040d0',
      tapTargetHighlight: '#f0d0ff',
    },
    floatingSymbols: ['\u03A3', '\u03B1', '\u03C3', '\u221E', '\u2605'],
  },

  fanum: {
    id: 'fanum',
    name: 'FANUM TAX',
    bodyTheme: 'ohio',
    currencyName: 'STOLEN FOOD',
    currencyShort: 'FOOD',
    prestigeName: 'CLOUT',
    prestigeAction: 'Go Viral',
    upgrades: [
      { name: 'Sneaky Fingers', baseCost: 10, baseProduction: 1 },
      { name: 'Speed Grab', baseCost: 100, baseProduction: 5 },
      { name: 'Fanum Technique', baseCost: 1000, baseProduction: 25 },
      { name: "Kai's Fridge", baseCost: 10000, baseProduction: 100 },
      { name: 'AMP House Kitchen', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#2e1a0a',
      bgBottom: '#150800',
      accent: '#ff6b2b',
      accentGlow: 'rgba(255, 107, 43, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#b08060',
      currencyColor: '#ff6b2b',
      prestigeColor: '#ffd000',
      upgradeRowBg: 'rgba(255, 107, 43, 0.08)',
      upgradeRowBorder: 'rgba(255, 107, 43, 0.2)',
      tapTargetPrimary: '#ffaa70',
      tapTargetSecondary: '#cc5520',
      tapTargetHighlight: '#ffe0c0',
    },
    floatingSymbols: ['\uD83C\uDF54', '\uD83C\uDF55', '\uD83C\uDF5F', '\uD83C\uDF2D', '\uD83C\uDF69'],
  },

  brainrot: {
    id: 'brainrot',
    name: 'ITALIAN BRAINROT',
    bodyTheme: 'italian-brainrot',
    currencyName: 'BRAINROT',
    currencyShort: 'ROT',
    prestigeName: 'CHAOS ENERGY',
    prestigeAction: 'Transcend Reality',
    upgrades: [
      { name: 'Bombardiro Crocodilo', baseCost: 10, baseProduction: 1 },
      { name: 'Tung Tung Tung Sahur', baseCost: 100, baseProduction: 5 },
      { name: 'Ballerina Cappuccina', baseCost: 1000, baseProduction: 25 },
      { name: 'Brr Brr Patapim', baseCost: 10000, baseProduction: 100 },
      { name: 'Lirili Larila', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#0a2e10',
      bgBottom: '#001508',
      accent: '#00ff66',
      accentGlow: 'rgba(0, 255, 102, 0.3)',
      text: '#f0f0f0',
      textSecondary: '#70b080',
      currencyColor: '#00ff66',
      prestigeColor: '#00e5ff',
      upgradeRowBg: 'rgba(0, 255, 102, 0.08)',
      upgradeRowBorder: 'rgba(0, 255, 102, 0.2)',
      tapTargetPrimary: '#60d0ff',
      tapTargetSecondary: '#2080c0',
      tapTargetHighlight: '#a0e8ff',
    },
    floatingSymbols: ['\uD83E\uDD88', '\uD83D\uDC0A', '\uD83C\uDFB6', '\uD83C\uDF00', '\uD83E\uDDE0'],
  },
};

/** Ordered list of theme IDs for iteration. */
export const THEME_IDS = ['sigma', 'fanum', 'brainrot'];

/** Default theme if none is selected. */
export const DEFAULT_THEME = 'sigma';
