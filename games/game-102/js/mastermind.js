/**
 * MEME MIND -- Mastermind Game Logic
 * Pure game logic: code generation, guess evaluation, scoring.
 */

/** Color definitions for normal mode (6 colors) */
export const COLORS_NORMAL = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

/** Color definitions for hard mode (8 colors) */
export const COLORS_HARD = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

/** Maximum guesses allowed */
export const MAX_GUESSES = 10;

/** Difficulty configurations */
export const DIFFICULTY = {
  normal: { pegs: 4, colors: COLORS_NORMAL },
  hard: { pegs: 5, colors: COLORS_HARD },
};

/**
 * Generate a random secret code.
 *
 * @param {string} difficulty - 'normal' or 'hard'
 * @returns {string[]} Array of color strings
 */
export function generateCode(difficulty = 'normal') {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  const code = [];
  for (let i = 0; i < config.pegs; i++) {
    const idx = Math.floor(Math.random() * config.colors.length);
    code.push(config.colors[idx]);
  }
  return code;
}

/**
 * Evaluate a guess against the secret code.
 * Returns the number of black pegs (right color, right position)
 * and white pegs (right color, wrong position).
 *
 * @param {string[]} guess - The player's guess
 * @param {string[]} secret - The secret code
 * @returns {{ black: number, white: number }}
 */
export function evaluateGuess(guess, secret) {
  const len = secret.length;
  let black = 0;
  let white = 0;

  // Track which positions are already matched
  const secretUsed = new Array(len).fill(false);
  const guessUsed = new Array(len).fill(false);

  // First pass: find exact matches (black pegs)
  for (let i = 0; i < len; i++) {
    if (guess[i] === secret[i]) {
      black++;
      secretUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: find color matches in wrong positions (white pegs)
  for (let i = 0; i < len; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < len; j++) {
      if (secretUsed[j]) continue;
      if (guess[i] === secret[j]) {
        white++;
        secretUsed[j] = true;
        break;
      }
    }
  }

  return { black, white };
}

/**
 * Calculate the score for a win.
 *
 * @param {number} guessesUsed - Number of guesses taken (1-10)
 * @returns {number} Score value
 */
export function calculateScore(guessesUsed) {
  return (11 - guessesUsed) * 100;
}

/**
 * Create a fresh game state.
 *
 * @param {string} difficulty - 'normal' or 'hard'
 * @returns {Object} Game state object
 */
export function createGameState(difficulty = 'normal') {
  const config = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  const secret = generateCode(difficulty);

  return {
    secret,
    difficulty,
    pegs: config.pegs,
    colors: config.colors,
    maxGuesses: MAX_GUESSES,
    guesses: [],        // Array of { guess: string[], feedback: { black, white } }
    currentGuess: [],    // Array of color strings being built (length 0..pegs)
    selectedColor: null, // Currently selected color from palette
    won: false,
    lost: false,
    ended: false,
    guessCount: 0,
  };
}

/**
 * Place a color in the next empty slot of the current guess.
 *
 * @param {Object} state - Game state
 * @param {string} color - Color to place
 * @returns {boolean} true if placed successfully
 */
export function placeColor(state, color) {
  if (state.ended) return false;
  if (state.currentGuess.length >= state.pegs) return false;

  state.currentGuess.push(color);
  return true;
}

/**
 * Place a color in a specific slot of the current guess.
 *
 * @param {Object} state - Game state
 * @param {number} slotIndex - Slot index (0-based)
 * @param {string} color - Color to place
 * @returns {boolean} true if placed successfully
 */
export function placeColorAt(state, slotIndex, color) {
  if (state.ended) return false;
  if (slotIndex < 0 || slotIndex >= state.pegs) return false;

  // Extend array if needed
  while (state.currentGuess.length <= slotIndex) {
    state.currentGuess.push(null);
  }
  state.currentGuess[slotIndex] = color;
  return true;
}

/**
 * Remove the last placed color from the current guess.
 *
 * @param {Object} state - Game state
 * @returns {boolean} true if removed successfully
 */
export function removeLastColor(state) {
  if (state.ended) return false;
  if (state.currentGuess.length === 0) return false;

  state.currentGuess.pop();
  return true;
}

/**
 * Check if the current guess is complete (all slots filled).
 *
 * @param {Object} state - Game state
 * @returns {boolean}
 */
export function isGuessComplete(state) {
  if (state.currentGuess.length !== state.pegs) return false;
  return state.currentGuess.every(c => c !== null);
}

/**
 * Submit the current guess. Evaluates it and updates state.
 *
 * @param {Object} state - Game state
 * @returns {{ black: number, white: number }|null} Feedback, or null if guess invalid
 */
export function submitGuess(state) {
  if (!isGuessComplete(state)) return null;
  if (state.ended) return null;

  const feedback = evaluateGuess(state.currentGuess, state.secret);
  state.guesses.push({
    guess: [...state.currentGuess],
    feedback,
  });
  state.guessCount++;
  state.currentGuess = [];

  // Check win
  if (feedback.black === state.pegs) {
    state.won = true;
    state.ended = true;
  }
  // Check loss
  else if (state.guessCount >= state.maxGuesses) {
    state.lost = true;
    state.ended = true;
  }

  return feedback;
}
