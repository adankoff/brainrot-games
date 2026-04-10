/**
 * POPCAT CLICKER -- Theme Definitions
 * Each theme reskins: currency names, upgrade names, colors, tap target, background.
 * 3 mainstream viral meme themes: Popcat, Doge Miner, Chill Guy.
 */

export const THEMES = {
  popcat: {
    id: 'popcat',
    name: 'POPCAT',
    bodyTheme: 'popcat',
    currencyName: 'POPS',
    currencyShort: 'POPS',
    prestigeName: 'VIRAL TOKENS',
    prestigeAction: 'Go Viral',
    upgrades: [
      { name: 'Auto Pop', baseCost: 10, baseProduction: 1 },
      { name: 'Laser Pointer', baseCost: 100, baseProduction: 5 },
      { name: 'Catnip Boost', baseCost: 1000, baseProduction: 25 },
      { name: 'Cat Army', baseCost: 10000, baseProduction: 100 },
      { name: 'Internet Cat God', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#ffe0f0',
      bgBottom: '#ffb6c1',
      accent: '#ff69b4',
      accentGlow: 'rgba(255, 105, 180, 0.3)',
      text: '#2a1520',
      textSecondary: '#a0607a',
      currencyColor: '#ff69b4',
      prestigeColor: '#ff1493',
      upgradeRowBg: 'rgba(255, 105, 180, 0.1)',
      upgradeRowBorder: 'rgba(255, 105, 180, 0.25)',
      tapTargetPrimary: '#ffffff',
      tapTargetSecondary: '#f0f0f0',
      tapTargetHighlight: '#66ff66',
    },
    floatingSymbols: ['\uD83D\uDC31', '\uD83D\uDC3E', '\uD83D\uDC08', '\uD83D\uDC31', '\uD83D\uDC3E'],
    deathMessages: [
      'the internet ran out of pops',
      'popcat has been satisfied',
      'the cat has spoken... silence',
      'pop overflow error',
      'too many pops, not enough cat',
    ],
  },

  doge: {
    id: 'doge',
    name: 'DOGE MINER',
    bodyTheme: 'doge',
    currencyName: 'DOGECOINS',
    currencyShort: 'DOGE',
    prestigeName: 'MOON TOKENS',
    prestigeAction: 'Moon Landing',
    upgrades: [
      { name: 'Such Mine', baseCost: 10, baseProduction: 1 },
      { name: 'Very Dig', baseCost: 100, baseProduction: 5 },
      { name: 'Much Drill', baseCost: 1000, baseProduction: 25 },
      { name: 'Wow Factory', baseCost: 10000, baseProduction: 100 },
      { name: 'To The Moon', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#fff8dc',
      bgBottom: '#ffd700',
      accent: '#ffd700',
      accentGlow: 'rgba(255, 215, 0, 0.3)',
      text: '#4a3800',
      textSecondary: '#8b7a40',
      currencyColor: '#daa520',
      prestigeColor: '#ff8c00',
      upgradeRowBg: 'rgba(255, 215, 0, 0.12)',
      upgradeRowBorder: 'rgba(255, 215, 0, 0.3)',
      tapTargetPrimary: '#c4a265',
      tapTargetSecondary: '#a08040',
      tapTargetHighlight: '#ffe8b0',
    },
    floatingSymbols: ['wow', 'such', 'very', 'much'],
    deathMessages: [
      'such bankruptcy',
      'very crash. much sad.',
      'doge has left the mine',
      'wow. nothing left.',
      'to the moon... and back',
    ],
  },

  chillguy: {
    id: 'chillguy',
    name: 'CHILL GUY',
    bodyTheme: 'chillguy',
    currencyName: 'CHILL POINTS',
    currencyShort: 'CHILL',
    prestigeName: 'ZEN TOKENS',
    prestigeAction: 'Ascend to Zen',
    upgrades: [
      { name: 'Slight Nod', baseCost: 10, baseProduction: 1 },
      { name: 'Vibing', baseCost: 100, baseProduction: 5 },
      { name: 'Zero Stress', baseCost: 1000, baseProduction: 25 },
      { name: 'Unbothered King', baseCost: 10000, baseProduction: 100 },
      { name: 'Transcendent Chill', baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: '#e0f0ff',
      bgBottom: '#87ceeb',
      accent: '#4a90d9',
      accentGlow: 'rgba(74, 144, 217, 0.3)',
      text: '#1a3050',
      textSecondary: '#5a7a9a',
      currencyColor: '#4a90d9',
      prestigeColor: '#2e6eb5',
      upgradeRowBg: 'rgba(74, 144, 217, 0.1)',
      upgradeRowBorder: 'rgba(74, 144, 217, 0.25)',
      tapTargetPrimary: '#8b4513',
      tapTargetSecondary: '#6b3410',
      tapTargetHighlight: '#4a90d9',
    },
    floatingSymbols: ['\u2601', '\u2728', '\u262F', '\uD83C\uDF3F', '\uD83D\uDE0C'],
    deathMessages: [
      'too chill to continue',
      'vibes have been exhausted',
      'the chill guy has ascended',
      'unbothered. unmoved. offline.',
      'zen overload',
    ],
  },
};

/** Ordered list of theme IDs for iteration. */
export const THEME_IDS = ['popcat', 'doge', 'chillguy'];

/** Default theme if none is selected. */
export const DEFAULT_THEME = 'popcat';
