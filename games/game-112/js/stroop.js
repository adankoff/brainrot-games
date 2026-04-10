/**
 * STROOP TAP -- Stroop logic module
 * Manages color/word generation, scoring, and difficulty progression.
 */

/** Color definitions: name, hex for rendering, and button display */
export const COLORS = [
  { name: 'RED',    hex: '#ff3b3b' },
  { name: 'BLUE',   hex: '#4dabf7' },
  { name: 'GREEN',  hex: '#51cf66' },
  { name: 'YELLOW', hex: '#ffd43b' },
];

const GAME_DURATION = 30;        // seconds
const WRONG_TIME_PENALTY = 1;    // seconds lost on wrong tap
const STREAK_X2 = 5;             // consecutive correct for x2
const STREAK_X3 = 10;            // consecutive correct for x3
const HARD_MODE_THRESHOLD = 10;  // total correct before distractor effects

/**
 * Create a new Stroop game state object.
 *
 * @returns {Object} Fresh game state
 */
export function createState() {
  return {
    score: 0,
    streak: 0,
    totalCorrect: 0,
    timeRemaining: GAME_DURATION,
    isOver: false,

    // Current challenge
    wordIndex: -1,     // index into COLORS for the displayed word text
    inkIndex: -1,      // index into COLORS for the ink color (correct answer)

    // Visual distractor state
    wordScale: 1.0,
    wordRotation: 0,

    // Feedback flash
    flashColor: null,      // hex color string or null
    flashTimer: 0,         // seconds remaining for flash

    // Multiplier display
    multiplier: 1,

    // Tick sound tracking
    lastTickSecond: GAME_DURATION,
  };
}

/**
 * Generate a new word/ink combination, ensuring they differ.
 *
 * @param {Object} state - Game state (mutated in place)
 */
export function generateChallenge(state) {
  const wordIndex = Math.floor(Math.random() * COLORS.length);
  let inkIndex = Math.floor(Math.random() * COLORS.length);

  // Ensure ink color differs from word
  while (inkIndex === wordIndex) {
    inkIndex = Math.floor(Math.random() * COLORS.length);
  }

  state.wordIndex = wordIndex;
  state.inkIndex = inkIndex;

  // Apply distractor effects if in hard mode
  if (state.totalCorrect >= HARD_MODE_THRESHOLD) {
    const intensity = Math.min((state.totalCorrect - HARD_MODE_THRESHOLD) / 20, 1);
    state.wordScale = 0.7 + Math.random() * 0.8 * (1 + intensity * 0.5);
    state.wordRotation = (Math.random() - 0.5) * 30 * intensity; // degrees
  } else {
    state.wordScale = 1.0;
    state.wordRotation = 0;
  }
}

/**
 * Get the current multiplier based on streak.
 *
 * @param {number} streak
 * @returns {number} 1, 2, or 3
 */
export function getMultiplier(streak) {
  if (streak >= STREAK_X3) return 3;
  if (streak >= STREAK_X2) return 2;
  return 1;
}

/**
 * Process a player's color choice.
 *
 * @param {Object} state - Game state (mutated)
 * @param {number} chosenIndex - Index into COLORS that player tapped
 * @returns {'correct'|'wrong'} Result of the tap
 */
export function processTap(state, chosenIndex) {
  if (state.isOver) return 'wrong';

  if (chosenIndex === state.inkIndex) {
    // Correct
    state.streak++;
    state.totalCorrect++;
    state.multiplier = getMultiplier(state.streak);
    state.score += state.multiplier;
    state.flashColor = '#51cf66';
    state.flashTimer = 0.15;
    generateChallenge(state);
    return 'correct';
  } else {
    // Wrong
    state.streak = 0;
    state.multiplier = 1;
    state.score = Math.max(0, state.score - 1);
    state.timeRemaining = Math.max(0, state.timeRemaining - WRONG_TIME_PENALTY);
    state.flashColor = '#ff3b3b';
    state.flashTimer = 0.2;
    return 'wrong';
  }
}

/**
 * Update the timer and check for game over.
 *
 * @param {Object} state - Game state (mutated)
 * @param {number} dtSeconds - Elapsed real seconds
 * @returns {boolean} true if game just ended this frame
 */
export function updateTimer(state, dtSeconds) {
  if (state.isOver) return false;

  state.timeRemaining -= dtSeconds;

  // Update flash timer
  if (state.flashTimer > 0) {
    state.flashTimer -= dtSeconds;
    if (state.flashTimer <= 0) {
      state.flashTimer = 0;
      state.flashColor = null;
    }
  }

  if (state.timeRemaining <= 0) {
    state.timeRemaining = 0;
    state.isOver = true;
    return true;
  }

  return false;
}

/**
 * Check if a tick sound should play (last 5 seconds).
 *
 * @param {Object} state
 * @returns {boolean}
 */
export function shouldPlayTick(state) {
  const currentSecond = Math.ceil(state.timeRemaining);
  if (currentSecond <= 5 && currentSecond > 0 && currentSecond < state.lastTickSecond) {
    state.lastTickSecond = currentSecond;
    return true;
  }
  return false;
}
