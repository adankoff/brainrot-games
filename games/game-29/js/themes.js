/**
 * YEET -- Theme Definitions
 * Three swappable themes with distinct visuals, objects, and flavor text.
 */

// ---- Theme: SKIBIDI YEET ----

const skibidiYeet = {
  id: 'skibidi-yeet',
  name: 'SKIBIDI YEET',
  accentColor: '#b347ff',
  bgGradientTop: '#0d0018',
  bgGradientBottom: '#1a0033',
  floorColor: '#2a0050',
  floorHighlight: '#3d0070',
  wallColor: '#1a002e',
  wallAccent: '#b347ff22',
  scoreColor: '#b347ff',
  streakColor: '#e066ff',

  // Objects
  projectileName: 'toilet paper',
  projectileColor: '#e8e0d8',
  projectileAccent: '#c4b8aa',
  projectileDetailColor: '#d0c4b6',

  binName: 'toilet',
  binColor: '#e8e8f0',
  binAccent: '#c0c0d0',
  binRimColor: '#f0f0ff',
  binInnerColor: '#3344aa',
  binBaseColor: '#d0d0e0',

  windArrowColor: '#b347ff',
  trailColor: 'rgba(179, 71, 255, 0.3)',

  deathMessages: [
    "couldn't yeet your way out of a paper bag",
    'L throw tbh',
    'skill issue fr fr',
    'not even close bestie',
    'bruh momentum = zero',
    'toilet paper wasted smh',
  ],
  winMessages: [
    'yeeted into the stratosphere',
    'kobe from downtown',
    'skibidi sniper activated',
    'toilet paper goat',
    'yeet god tier unlocked',
    'absolute unit of a throw',
  ],
  scoreLabel: 'yeets',
};

// ---- Theme: SIGMA TOSS ----

const sigmaToss = {
  id: 'sigma-toss',
  name: 'SIGMA TOSS',
  accentColor: '#ffd700',
  bgGradientTop: '#0a0a0a',
  bgGradientBottom: '#1a1400',
  floorColor: '#1a1a00',
  floorHighlight: '#2a2600',
  wallColor: '#0f0f00',
  wallAccent: '#ffd70022',
  scoreColor: '#ffd700',
  streakColor: '#ffee66',

  // Objects
  projectileName: 'money bag',
  projectileColor: '#2d8a2d',
  projectileAccent: '#1d6a1d',
  projectileDetailColor: '#ffd700',

  binName: 'briefcase',
  binColor: '#3a2510',
  binAccent: '#5a3a18',
  binRimColor: '#ffd700',
  binInnerColor: '#1a1008',
  binBaseColor: '#2a1a08',

  windArrowColor: '#ffd700',
  trailColor: 'rgba(255, 215, 0, 0.3)',

  deathMessages: [
    'not sigma enough to yeet',
    'L throw, back to the 9-5',
    'beta toss detected',
    'your portfolio just crashed',
    'no grindset in that arm',
    'the bag fumbled you',
  ],
  winMessages: [
    'sigma grindset throw',
    'kobe from downtown',
    'money moves only',
    'briefcase secured, king',
    'passive income activated',
    'the bag stays secured',
  ],
  scoreLabel: 'bags',
};

// ---- Theme: TOUCH GRASS ----

const touchGrass = {
  id: 'touch-grass',
  name: 'TOUCH GRASS',
  accentColor: '#44bb44',
  bgGradientTop: '#87ceeb',
  bgGradientBottom: '#5a9e5a',
  floorColor: '#3a8a3a',
  floorHighlight: '#4a9a4a',
  wallColor: '#2a6a2a',
  wallAccent: '#44bb4422',
  scoreColor: '#2d6a2d',
  streakColor: '#88dd44',

  // Objects
  projectileName: 'phone',
  projectileColor: '#222233',
  projectileAccent: '#333344',
  projectileDetailColor: '#4488ff',

  binName: 'grass bin',
  binColor: '#6b4423',
  binAccent: '#8b5a2b',
  binRimColor: '#7a5430',
  binInnerColor: '#3a8a3a',
  binBaseColor: '#5a3a18',

  windArrowColor: '#2d6a2d',
  trailColor: 'rgba(68, 187, 68, 0.3)',

  deathMessages: [
    'you need to touch more grass',
    'L throw, go outside',
    'too much screen time detected',
    'nature rejected your offering',
    'chronically online aim',
    'grass: 1, you: 0',
  ],
  winMessages: [
    'phone successfully yeeted',
    'kobe from downtown',
    'touched grass achievement unlocked',
    'nature appreciates your sacrifice',
    'digital detox champion',
    'grass level: maximum',
  ],
  scoreLabel: 'touches',
};

// ---- Exports ----

export const THEMES = [skibidiYeet, sigmaToss, touchGrass];

/**
 * Get a theme by ID, or the first theme if not found.
 *
 * @param {string} id - Theme identifier
 * @returns {Object} Theme definition object
 */
export function getThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}
