/**
 * MEME SIMON -- Game Engine
 * Pure game state and logic. No rendering, no sound, no DOM.
 */

export const W = 400;
export const H = 700;

/** Color indices: 0=red(TL), 1=blue(TR), 2=green(BL), 3=yellow(BR) */
export const COLORS = [
  { name: 'red',    base: '#cc3333', lit: '#ff4444', dark: '#991a1a' },
  { name: 'blue',   base: '#3366cc', lit: '#4488ff', dark: '#1a3d8f' },
  { name: 'green',  base: '#33aa33', lit: '#44dd44', dark: '#1a7a1a' },
  { name: 'yellow', base: '#ccaa33', lit: '#ffdd44', dark: '#8f7a1a' },
];

/**
 * @typedef {'idle'|'playback'|'input'|'success'|'fail'} Phase
 */

/**
 * @typedef {Object} SimonState
 * @property {number[]} sequence - Array of color indices (0-3)
 * @property {number} round - Current round number (1-based)
 * @property {number} inputIndex - Player's current position in the sequence
 * @property {Phase} phase - Current game phase
 * @property {number} playbackIndex - Current playback position
 * @property {number} playbackTimer - Timer for playback pacing
 * @property {number} flashDuration - Duration of each flash in frames
 * @property {number} gapDuration - Gap between flashes in frames
 * @property {number} litButton - Currently lit button index (-1 = none)
 * @property {number} litTimer - Timer for how long a button stays lit
 * @property {boolean} gameOver - Whether game has ended
 * @property {number} score - Rounds completed
 * @property {number} successTimer - Timer for round-success feedback
 * @property {number} failTimer - Timer for fail feedback
 * @property {number} prePlaybackDelay - Delay before playback starts
 */

/**
 * Create a fresh Simon game state.
 *
 * @returns {SimonState}
 */
export function createSimonState() {
  return {
    sequence: [],
    round: 0,
    inputIndex: 0,
    phase: 'idle',
    playbackIndex: 0,
    playbackTimer: 0,
    flashDuration: 20,   // frames a button stays lit during playback
    gapDuration: 8,      // frames of darkness between flashes
    litButton: -1,
    litTimer: 0,
    gameOver: false,
    score: 0,
    successTimer: 0,
    failTimer: 0,
    prePlaybackDelay: 0,
  };
}

/**
 * Get the playback speed (flash duration in frames) for a given round.
 * Starts at 36 frames (~600ms), decreases by ~1.2 frames per round, min 12 (~200ms).
 *
 * @param {number} round
 * @returns {number}
 */
function getFlashDuration(round) {
  return Math.max(12, Math.round(36 - (round - 1) * 1.2));
}

/**
 * Add a random color to the sequence and start playback for the new round.
 *
 * @param {SimonState} state
 * @returns {void}
 */
export function addToSequence(state) {
  const color = Math.floor(Math.random() * 4);
  state.sequence.push(color);
  state.round = state.sequence.length;
  state.inputIndex = 0;
  state.playbackIndex = 0;
  state.playbackTimer = 0;
  state.flashDuration = getFlashDuration(state.round);
  state.gapDuration = Math.max(4, Math.round(8 - (state.round - 1) * 0.3));
  state.litButton = -1;
  state.litTimer = 0;
  state.phase = 'playback';
  state.prePlaybackDelay = 30; // half-second pause before playback
}

/**
 * Check player input against the sequence.
 *
 * @param {SimonState} state
 * @param {number} colorIndex - The color the player pressed (0-3)
 * @returns {'correct'|'round-complete'|'wrong'}
 */
export function checkInput(state, colorIndex) {
  if (state.phase !== 'input' || state.gameOver) return 'wrong';

  const expected = state.sequence[state.inputIndex];

  if (colorIndex !== expected) {
    state.phase = 'fail';
    state.gameOver = true;
    state.score = state.round - 1;
    state.failTimer = 60;
    state.litButton = colorIndex;
    state.litTimer = 15;
    return 'wrong';
  }

  // Correct input
  state.litButton = colorIndex;
  state.litTimer = 10;
  state.inputIndex++;

  if (state.inputIndex >= state.sequence.length) {
    // Round complete
    state.score = state.round;
    state.phase = 'success';
    state.successTimer = 45; // brief celebration before next round
    return 'round-complete';
  }

  return 'correct';
}

/**
 * Get the current sequence (read-only copy).
 *
 * @param {SimonState} state
 * @returns {number[]}
 */
export function getSequence(state) {
  return [...state.sequence];
}

/**
 * Update the Simon game state by one frame tick.
 *
 * @param {SimonState} state
 * @param {number} dt - Delta time (1.0 = one frame at 60fps)
 * @returns {{ event: string|null, eventData: number }} Events for sound/fx
 */
export function updateSimon(state, dt) {
  let event = null;
  let eventData = -1;

  // Tick lit timer
  if (state.litTimer > 0) {
    state.litTimer -= dt;
    if (state.litTimer <= 0) {
      state.litButton = -1;
      state.litTimer = 0;
    }
  }

  // Phase: playback
  if (state.phase === 'playback') {
    // Pre-playback delay
    if (state.prePlaybackDelay > 0) {
      state.prePlaybackDelay -= dt;
      return { event: null, eventData: -1 };
    }

    state.playbackTimer += dt;

    const cycleDuration = state.flashDuration + state.gapDuration;
    const currentCycleTime = state.playbackTimer % cycleDuration;

    // Determine which note in the sequence we're on
    const noteIndex = Math.floor(state.playbackTimer / cycleDuration);

    if (noteIndex >= state.sequence.length) {
      // Playback complete, switch to input phase
      state.phase = 'input';
      state.inputIndex = 0;
      state.litButton = -1;
      state.litTimer = 0;
      return { event: 'input-start', eventData: -1 };
    }

    // Update playback index for rendering
    if (noteIndex !== state.playbackIndex) {
      state.playbackIndex = noteIndex;
    }

    // Light up button during flash portion of cycle
    if (currentCycleTime < state.flashDuration) {
      const btnIndex = state.sequence[noteIndex];
      if (state.litButton !== btnIndex) {
        state.litButton = btnIndex;
        event = 'playback-note';
        eventData = btnIndex;
      }
    } else {
      // Gap
      if (state.litButton !== -1) {
        state.litButton = -1;
      }
    }
  }

  // Phase: success (brief pause after completing a round)
  if (state.phase === 'success') {
    state.successTimer -= dt;
    if (state.successTimer <= 0) {
      addToSequence(state);
      event = 'next-round';
    }
  }

  // Phase: fail (brief pause showing error)
  if (state.phase === 'fail') {
    state.failTimer -= dt;
    if (state.failTimer <= 0) {
      event = 'game-over-ready';
    }
  }

  return { event, eventData };
}
