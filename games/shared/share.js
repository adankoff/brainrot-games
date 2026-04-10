/**
 * Brainrot Games -- Share Module
 * Score sharing via Web Share API with clipboard fallback.
 */

import { formatScore } from './utils.js';

/**
 * Generate the share text string.
 *
 * @param {string} gameTitle - Game name (e.g., "FLAPPY TRALALERO")
 * @param {number} score - Player's score
 * @param {string} [shareUrl=''] - URL to include in share text
 * @returns {string} Formatted share text
 */
export function generateShareText(gameTitle, score, shareUrl = '') {
  const formattedScore = formatScore(score);
  let text = `i got ${formattedScore} in ${gameTitle}`;
  if (shareUrl) {
    text += `\n${shareUrl}`;
  }
  return text;
}

/**
 * Share a score. Tries Web Share API first (mobile), falls back to clipboard copy.
 *
 * @param {string} gameTitle - Game name for share text
 * @param {number} score - Player's score
 * @param {string} [shareUrl=''] - URL included in share text
 * @returns {Promise<'shared'|'copied'|'failed'>}
 */
export async function shareScore(gameTitle, score, shareUrl = '') {
  const text = generateShareText(gameTitle, score, shareUrl);

  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      // User cancelled or share failed -- fall through to clipboard
    }
  }

  // Clipboard fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
