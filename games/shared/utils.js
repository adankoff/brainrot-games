/**
 * Brainrot Games -- Shared Utilities
 * Pure utility functions with no side effects and no state.
 */

/**
 * Axis-Aligned Bounding Box collision test.
 *
 * @param {{ x: number, y: number, width: number, height: number }} a - First rectangle
 * @param {{ x: number, y: number, width: number, height: number }} b - Second rectangle
 * @returns {boolean} true if the rectangles overlap (edges touching counts as collision)
 */
export function checkCollisionAABB(a, b) {
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) return false;
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
  );
}

/**
 * Circle-to-circle collision test.
 * Uses squared-distance comparison (no Math.sqrt) for performance.
 *
 * @param {{ x: number, y: number, radius: number }} a - First circle (x,y = center)
 * @param {{ x: number, y: number, radius: number }} b - Second circle (x,y = center)
 * @returns {boolean} true if the circles overlap (edges touching counts as collision)
 */
export function checkCollisionCircle(a, b) {
  if (a.radius <= 0 || b.radius <= 0) return false;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const radSum = a.radius + b.radius;
  return distSq <= radSum * radSum;
}

/**
 * Circle-to-point collision test. Useful for tap hit detection.
 *
 * @param {{ x: number, y: number, radius: number }} circle - Circle (x,y = center)
 * @param {{ x: number, y: number }} point - Point to test
 * @returns {boolean} true if the point is inside or on the edge of the circle
 */
export function checkCollisionCirclePoint(circle, point) {
  const dx = circle.x - point.x;
  const dy = circle.y - point.y;
  const distSq = dx * dx + dy * dy;
  return distSq <= circle.radius * circle.radius;
}

/**
 * Linear interpolation between two values.
 *
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0 = a, 1 = b). NOT clamped.
 * @returns {number} Interpolated value: a + (b - a) * t
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp a value between a minimum and maximum (inclusive).
 *
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Random floating-point number between min (inclusive) and max (exclusive).
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random float in [min, max)
 */
export function randomBetween(min, max) {
  if (min >= max) return min;
  return min + Math.random() * (max - min);
}

/**
 * Random integer between min and max (both inclusive).
 *
 * @param {number} min - Minimum value (inclusive). Floored if not integer.
 * @param {number} max - Maximum value (inclusive). Floored if not integer.
 * @returns {number} Random integer in [min, max]
 */
export function randomInt(min, max) {
  min = Math.floor(min);
  max = Math.floor(max);
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format a number with commas as thousands separators.
 *
 * @param {number} n - The number to format. Truncated to integer.
 * @returns {string} Comma-formatted string (e.g., 1234567 -> "1,234,567")
 */
export function formatScore(n) {
  if (!Number.isFinite(n)) return '0';
  const int = Math.trunc(n);
  return int.toLocaleString('en-US');
}

/**
 * Ease-out quadratic. Useful for animations.
 *
 * @param {number} t - Progress from 0 to 1
 * @returns {number} Eased value (starts fast, decelerates)
 */
export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Ease-out cubic. Stronger deceleration than quadratic.
 *
 * @param {number} t - Progress from 0 to 1
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
