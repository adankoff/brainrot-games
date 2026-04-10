/**
 * MEME MEMORY -- Theme Definitions
 * Three swappable themes with emoji sets, color palettes, and card back designs.
 */

// ---- Theme: BRAINROT CLASSICS ----

const brainrotClassics = {
  id: 'brainrot-classics',
  name: 'BRAINROT CLASSICS',
  accentColor: '#b347ff',
  bgColor: '#0d0018',
  bgGradientTop: '#0d0018',
  bgGradientBottom: '#1a0033',
  cardFaceColor: '#1e0040',
  cardBorderColor: '#8a2be2',
  cardBackColor: '#2a0050',
  cardBackBorderColor: '#6a1faa',
  cardBackSymbol: '?',
  cardBackSymbolColor: '#b347ff',
  matchGlowColor: '#00ff66',
  mismatchFlashColor: '#ff3344',
  hudColor: '#e0c0ff',
  timerColor: '#b347ff',
  movesColor: '#66ff99',
  pairs: [
    { emoji: '\uD83D\uDEBD', label: 'Skibidi' },
    { emoji: '\u03A3',       label: 'Sigma' },
    { emoji: '\uD83C\uDF3D', label: 'Ohio' },
    { emoji: '\uD83C\uDF51', label: 'Gyatt' },
    { emoji: '\u2728',       label: 'Rizz' },
    { emoji: '\uD83E\uDDD1', label: 'NPC' },
    { emoji: '\uD83D\uDC40', label: 'Sussy' },
    { emoji: '\u2696\uFE0F', label: 'Ratio' },
  ],
  winMessages: [
    'memory goated fr fr',
    'brain actually works',
    'no cap photographic memory',
    'sigma memory unlocked',
    'ohio-level recall',
  ],
};

// ---- Theme: ANIME ICONS ----

const animeIcons = {
  id: 'anime-icons',
  name: 'ANIME ICONS',
  accentColor: '#ff8800',
  bgColor: '#001020',
  bgGradientTop: '#001020',
  bgGradientBottom: '#002040',
  cardFaceColor: '#0a1e3a',
  cardBorderColor: '#3388cc',
  cardBackColor: '#0d2850',
  cardBackBorderColor: '#2266aa',
  cardBackSymbol: '\u2605',
  cardBackSymbolColor: '#ff8800',
  matchGlowColor: '#00ccff',
  mismatchFlashColor: '#ff4444',
  hudColor: '#ffe0b0',
  timerColor: '#ff8800',
  movesColor: '#44aaff',
  pairs: [
    { emoji: '\uD83D\uDC32', label: 'Dragon Ball' },
    { emoji: '\uD83D\uDCAA', label: 'JoJo' },
    { emoji: '\uD83C\uDF00', label: 'Naruto' },
    { emoji: '\u2693',       label: 'One Piece' },
    { emoji: '\u2694\uFE0F', label: 'AOT' },
    { emoji: '\uD83D\uDD25', label: 'Demon Slayer' },
    { emoji: '\u26A1',       label: 'MHA' },
    { emoji: '\uD83D\uDC41\uFE0F', label: 'Gojo' },
  ],
  winMessages: [
    'main character energy',
    'brain no jutsu worked',
    'plus ultra memory',
    'you unlocked bankai',
    'this is your domain expansion',
  ],
};

// ---- Theme: CAT MEMES ----

const catMemes = {
  id: 'cat-memes',
  name: 'CAT MEMES',
  accentColor: '#ff66aa',
  bgColor: '#1a0015',
  bgGradientTop: '#1a0015',
  bgGradientBottom: '#0a1a1a',
  cardFaceColor: '#2a0028',
  cardBorderColor: '#cc4488',
  cardBackColor: '#1a2a2a',
  cardBackBorderColor: '#22888a',
  cardBackSymbol: '\uD83D\uDC3E',
  cardBackSymbolColor: '#ff66aa',
  matchGlowColor: '#00ffcc',
  mismatchFlashColor: '#ff2244',
  hudColor: '#ffd0e8',
  timerColor: '#ff66aa',
  movesColor: '#44ffcc',
  pairs: [
    { emoji: '\uD83C\uDF08', label: 'Nyan Cat' },
    { emoji: '\uD83D\uDE20', label: 'Smudge' },
    { emoji: '\uD83C\uDFB9', label: 'Keyboard Cat' },
    { emoji: '\uD83D\uDE3E', label: 'Grumpy Cat' },
    { emoji: '\uD83D\uDCAB', label: 'Maxwell' },
    { emoji: '\uD83D\uDE3A', label: 'Polite Cat' },
    { emoji: '\uD83D\uDC7D', label: 'Bingus' },
    { emoji: '\uD83D\uDE3C', label: 'Hecker' },
  ],
  winMessages: [
    'purrfect memory',
    'brain goes meow',
    'cat-astrophic recall',
    'no cap certified cat person',
    'you matched all the cats fr',
  ],
};

// ---- Exports ----

export const THEMES = [brainrotClassics, animeIcons, catMemes];

/**
 * Get a theme by ID, or the first theme if not found.
 *
 * @param {string} id - Theme identifier
 * @returns {Object} Theme definition object
 */
export function getThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}
