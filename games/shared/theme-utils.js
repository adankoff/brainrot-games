/**
 * Brainrot Games -- Theme Utilities
 * Reads CSS custom properties from the DOM and builds a colors object
 * for canvas rendering. Grayscale defaults ensure white-label readiness;
 * themed values are set via [data-theme] CSS selectors.
 *
 * Usage in a game renderer:
 *
 *   import { loadThemeColors } from '../../shared/theme-utils.js';
 *
 *   const COLORS = loadThemeColors({
 *     bg:      { css: '--game-bg',      fallback: '#1a1a1a' },
 *     player:  { css: '--game-player',  fallback: '#cccccc' },
 *   });
 *
 *   // COLORS.bg  => themed value from CSS, or '#1a1a1a' if unset
 */

/**
 * Read CSS custom properties from the computed style of document.documentElement
 * and return a flat { key: resolvedColor } object.
 *
 * @param {Record<string, { css: string, fallback: string }>} schema
 *   Each key maps to a CSS variable name and a grayscale fallback.
 * @returns {Record<string, string>}
 */
export function loadThemeColors(schema) {
  const style = getComputedStyle(document.documentElement);
  const colors = {};

  for (const [key, { css, fallback }] of Object.entries(schema)) {
    const value = style.getPropertyValue(css).trim();
    colors[key] = value || fallback;
  }

  return colors;
}

/**
 * Re-read a single CSS variable. Useful when the theme changes at runtime
 * (e.g. a theme-switcher menu).
 *
 * @param {string} cssVar - CSS variable name (e.g. '--game-bg')
 * @param {string} fallback - Grayscale fallback value
 * @returns {string}
 */
export function readThemeColor(cssVar, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}
