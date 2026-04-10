/**
 * CLASSIC MEME WHACK -- Constants
 * All tuning values: grid, timing, scoring, combo, colors, messages.
 */

// ---- Canvas ----
export const CANVAS_W = 400;
export const CANVAS_H = 600;

// ---- Hole Grid (3x3) ----
export const HOLE_POSITIONS = [
  { x: 80,  y: 227 },   // [0,0] top-left
  { x: 200, y: 227 },   // [1,0] top-center
  { x: 320, y: 227 },   // [2,0] top-right
  { x: 80,  y: 340 },   // [0,1] mid-left
  { x: 200, y: 340 },   // [1,1] mid-center
  { x: 320, y: 340 },   // [2,1] mid-right
  { x: 80,  y: 453 },   // [0,2] bot-left
  { x: 200, y: 453 },   // [1,2] bot-center
  { x: 320, y: 453 },   // [2,2] bot-right
];

export const HOLE_RADIUS_X = 50;
export const HOLE_RADIUS_Y = 20;

// ---- Timing ----
export const RISE_DURATION = 200;      // ms for character to fully emerge
export const SINK_DURATION = 150;      // ms for character to descend
export const HIT_ANIM_DURATION = 200;  // ms for hit impact animation
export const ROUND_DURATION = 60.0;    // seconds per round
export const WAVE_DURATION = 15;       // seconds per wave

// ---- Difficulty Formulas (use effectiveWave) ----
export function getDisplayTime(effectiveWave) {
  return Math.max(400, 1200 - effectiveWave * 80);
}

export function getSpawnInterval(effectiveWave) {
  return Math.max(300, 900 - effectiveWave * 60);
}

export function getMaxActive(effectiveWave) {
  return Math.min(5, 1 + Math.floor(effectiveWave / 2));
}

export function getPenaltyWeight(effectiveWave) {
  return Math.min(0.25, 0.10 + effectiveWave * 0.02);
}

// ---- Scoring ----
export const COMBO_MULTIPLIER_CAP = 4.0;
export const COMBO_INCREMENT = 0.25;
export const PENALTY_POINTS = -200;

// ---- Combo Milestones ----
export const COMBO_MILESTONES = [
  { threshold: 5,  text: 'NICE',           color: '#00e5ff' },
  { threshold: 10, text: 'DANK STREAK',    color: '#c8ff00' },
  { threshold: 15, text: 'MAXIMUM MEME',   color: '#ffd000' },
  { threshold: 20, text: 'TRANSCENDENT',   color: '#c8ff00' },
];

// ---- Colors ----
export const COLOR_VOID = '#f5f5f0';
export const COLOR_SURFACE = '#e8e8e0';
export const COLOR_SURFACE_ELEVATED = '#ddddd5';
export const COLOR_TEXT = '#222222';
export const COLOR_TEXT_SECONDARY = '#666666';
export const COLOR_TEXT_TERTIARY = '#999999';
export const COLOR_PRIMARY = '#ff6600';
export const COLOR_HOT_MAGENTA = '#ff2d78';
export const COLOR_MINT_AURA = '#00ffaa';
export const COLOR_PENALTY_RED = '#ff3838';
export const COLOR_MEME_GOLD = '#ffd000';

// ---- Game-Over Messages ----
const MESSAGES_LOW = [
  'the memes have won',
  'you were too slow for the internet',
  'press F for your score',
  'the trollface trolled you',
  'meme review: 1/10',
];

const MESSAGES_MID = [
  'not bad. the internet acknowledges you.',
  'meme review: 5/10',
  'trollface is mildly impressed',
  'such okay. much average. wow.',
  'you survived the rickroll... barely',
];

const MESSAGES_HIGH = [
  'meme review: 8/10',
  'doge approves. much skill. very whack.',
  'the meme council grants you passage',
  'harambe smiles upon you from above',
  'your meme reflexes are legendary',
];

const MESSAGES_ELITE = [
  'meme review: 11/10',
  'you have ascended to meme godhood',
  'touch grass immediately (after sharing this)',
  'nyan cat plays a song in your honor',
  'this score is a violation of internet law',
];

export function getGameOverMessage(score) {
  let pool;
  if (score <= 500) pool = MESSAGES_LOW;
  else if (score <= 2000) pool = MESSAGES_MID;
  else if (score <= 5000) pool = MESSAGES_HIGH;
  else pool = MESSAGES_ELITE;
  return pool[Math.floor(Math.random() * pool.length)];
}
