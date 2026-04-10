/**
 * MEME REACT -- Reaction Test Logic
 * Manages round state, timing, and scoring for the reaction time test.
 */

/** Total number of rounds per game */
export const TOTAL_ROUNDS = 5;

/** Minimum random delay in ms before screen turns green */
const MIN_DELAY_MS = 2000;

/** Maximum random delay in ms before screen turns green */
const MAX_DELAY_MS = 5000;

/** Duration to show result between rounds in ms */
export const RESULT_DISPLAY_MS = 1500;

/**
 * @typedef {'waiting'|'ready'|'tapped'|'too-early'|'between-rounds'|'finished'} RoundPhase
 */

/**
 * @typedef {Object} ReactionState
 * @property {RoundPhase} phase - Current phase of the round
 * @property {number} currentRound - Current round (0-indexed)
 * @property {number[]} times - Recorded reaction times in ms
 * @property {number} greenAt - Timestamp when the screen turned green
 * @property {number} delayMs - Random delay for current round
 * @property {number} waitStartedAt - Timestamp when waiting phase began
 * @property {number} lastReaction - Last reaction time in ms (for display)
 * @property {number} betweenTimer - Timer for between-rounds display
 */

/**
 * Create a fresh reaction test state.
 *
 * @returns {ReactionState}
 */
export function createReactionState() {
  return {
    phase: 'waiting',
    currentRound: 0,
    times: [],
    greenAt: 0,
    delayMs: randomDelay(),
    waitStartedAt: performance.now(),
    lastReaction: 0,
    betweenTimer: 0,
  };
}

/**
 * Generate a random delay between MIN and MAX.
 *
 * @returns {number} Delay in milliseconds
 */
function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

/**
 * Update the reaction state each frame.
 * Handles phase transitions based on timing.
 *
 * @param {ReactionState} state
 * @param {number} now - Current timestamp from performance.now()
 */
export function updateReaction(state, now) {
  if (state.phase === 'waiting') {
    const elapsed = now - state.waitStartedAt;
    if (elapsed >= state.delayMs) {
      state.phase = 'ready';
      state.greenAt = now;
    }
  }

  if (state.phase === 'too-early') {
    const elapsed = now - state.betweenTimer;
    if (elapsed >= RESULT_DISPLAY_MS) {
      // Restart the same round (no increment -- penalty is just lost time)
      state.phase = 'waiting';
      state.delayMs = randomDelay();
      state.waitStartedAt = now;
    }
  }

  if (state.phase === 'between-rounds') {
    const elapsed = now - state.betweenTimer;
    if (elapsed >= RESULT_DISPLAY_MS) {
      // Move to next round
      state.currentRound++;
      if (state.currentRound >= TOTAL_ROUNDS) {
        state.phase = 'finished';
      } else {
        state.phase = 'waiting';
        state.delayMs = randomDelay();
        state.waitStartedAt = now;
      }
    }
  }
}

/**
 * Handle a tap input during the reaction test.
 *
 * @param {ReactionState} state
 * @param {number} now - Current timestamp from performance.now()
 * @returns {'recorded'|'too-early'|'ignored'} Result of the tap
 */
export function handleTap(state, now) {
  if (state.phase === 'waiting') {
    // Tapped too early -- penalty
    state.phase = 'too-early';
    state.lastReaction = -1;
    // Will transition to between-rounds after a brief display
    state.betweenTimer = now;
    return 'too-early';
  }

  if (state.phase === 'ready') {
    // Valid tap -- record reaction time
    const reactionMs = now - state.greenAt;
    state.lastReaction = Math.round(reactionMs);
    state.times.push(state.lastReaction);
    state.phase = 'between-rounds';
    state.betweenTimer = now;
    return 'recorded';
  }

  // Ignore taps during other phases
  return 'ignored';
}

/**
 * Calculate the average reaction time.
 *
 * @param {ReactionState} state
 * @returns {number} Average time in ms, or 0 if no valid times
 */
export function getAverageTime(state) {
  if (state.times.length === 0) return 0;
  const sum = state.times.reduce((a, b) => a + b, 0);
  return Math.round(sum / state.times.length);
}

/**
 * Calculate the final score from average reaction time.
 * Score = max(1000 - avgMs, 0)
 *
 * @param {ReactionState} state
 * @returns {number} Score between 0 and 1000
 */
export function calculateScore(state) {
  const avg = getAverageTime(state);
  if (avg <= 0) return 0;
  return Math.max(1000 - avg, 0);
}

/**
 * Get the rating message for a given average reaction time.
 *
 * @param {number} avgMs - Average reaction time in milliseconds
 * @returns {string} Rating message
 */
export function getRating(avgMs) {
  if (avgMs <= 0) return 'did you even try';
  if (avgMs < 200) return 'inhuman';
  if (avgMs < 300) return 'sigma reflexes';
  if (avgMs < 500) return 'decent';
  return 'npc reaction speed';
}
