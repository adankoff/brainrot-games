/**
 * Brainrot Games -- Score Manager
 * Thin localStorage wrapper with graceful fallback.
 * All keys are namespaced by gameId.
 */

/**
 * Get the all-time high score for a game.
 *
 * @param {string} gameId - Game identifier (e.g., "flappy-tralalero", "whack-a-rot")
 * @returns {number} The stored high score, or 0 if none exists or localStorage is unavailable.
 */
export function getHighScore(gameId) {
  try {
    const val = localStorage.getItem(`${gameId}-highscore`);
    if (val === null) return 0;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

/**
 * Save a high score for a game. Only writes if the new score is strictly greater
 * than the currently stored high score.
 *
 * @param {string} gameId - Game identifier
 * @param {number} score - The score to save
 * @returns {boolean} true if a new high score was saved, false otherwise.
 */
export function setHighScore(gameId, score) {
  try {
    const current = getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(`${gameId}-highscore`, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the last played score for a game (not necessarily the high score).
 *
 * @param {string} gameId - Game identifier
 * @returns {number} The last played score, or 0 if none exists.
 */
export function getLastScore(gameId) {
  try {
    const val = localStorage.getItem(`${gameId}-lastscore`);
    if (val === null) return 0;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

/**
 * Save the last played score for a game. Always overwrites.
 *
 * @param {string} gameId - Game identifier
 * @param {number} score - The score to save
 * @returns {void}
 */
export function setLastScore(gameId, score) {
  try {
    localStorage.setItem(`${gameId}-lastscore`, String(score));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Generic get for game-specific data (unlocks, settings, etc.).
 *
 * @param {string} gameId - Game identifier
 * @param {string} key - Data key (e.g., "unlocks", "selected-character", "muted")
 * @returns {string|null} Raw string value from localStorage, or null if not found.
 */
export function getData(gameId, key) {
  try {
    return localStorage.getItem(`${gameId}-${key}`);
  } catch {
    return null;
  }
}

/**
 * Generic set for game-specific data.
 *
 * @param {string} gameId - Game identifier
 * @param {string} key - Data key
 * @param {string} value - Value to store (must be a string; caller serializes)
 * @returns {void}
 */
export function setData(gameId, key, value) {
  try {
    localStorage.setItem(`${gameId}-${key}`, value);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
