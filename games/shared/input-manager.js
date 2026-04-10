/**
 * Brainrot Games -- Input Manager
 * Unified input handling. Normalizes touch, mouse, and keyboard
 * into a simple callback API with coordinate conversion.
 */

/**
 * Create an InputManager bound to a canvas element.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas
 * @param {number} logicalWidth - Logical canvas width (e.g., 360)
 * @param {number} logicalHeight - Logical canvas height (e.g., 640)
 * @returns {{ onTap: Function, onTapAt: Function, destroy: Function }} InputManager instance
 */
export function createInputManager(canvas, logicalWidth, logicalHeight) {
  /** @type {Set<Function>} */
  const tapCallbacks = new Set();

  /** @type {Set<Function>} */
  const tapAtCallbacks = new Set();

  /**
   * Convert a client-space coordinate to logical canvas space.
   *
   * @param {number} clientX
   * @param {number} clientY
   * @returns {{ x: number, y: number }}
   */
  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (logicalWidth / rect.width),
      y: (clientY - rect.top) * (logicalHeight / rect.height),
    };
  }

  /**
   * Fire all tap and tapAt callbacks for a pointer event.
   *
   * @param {number} clientX
   * @param {number} clientY
   */
  function fireTap(clientX, clientY) {
    for (const cb of tapCallbacks) {
      cb();
    }
    const pos = toLogical(clientX, clientY);
    for (const cb of tapAtCallbacks) {
      cb(pos);
    }
  }

  /**
   * @param {MouseEvent} e
   */
  function handleMouseDown(e) {
    fireTap(e.clientX, e.clientY);
  }

  /**
   * @param {TouchEvent} e
   */
  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    fireTap(touch.clientX, touch.clientY);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      for (const cb of tapCallbacks) {
        cb();
      }
    }
  }

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('keydown', handleKeyDown);

  /**
   * Register a callback for simple tap events (no position needed).
   * Fires on: mousedown, touchstart, keydown (Space or Enter).
   *
   * @param {Function} callback - Called with no arguments on each tap.
   * @returns {Function} Unsubscribe function.
   */
  function onTap(callback) {
    tapCallbacks.add(callback);
    return () => tapCallbacks.delete(callback);
  }

  /**
   * Register a callback for positioned tap events.
   * Fires on: mousedown, touchstart (NOT keyboard).
   * Coordinates are in logical canvas space.
   *
   * @param {Function} callback - Called with { x: number, y: number } in logical coordinates.
   * @returns {Function} Unsubscribe function.
   */
  function onTapAt(callback) {
    tapAtCallbacks.add(callback);
    return () => tapAtCallbacks.delete(callback);
  }

  /**
   * Remove all event listeners and clear all callbacks.
   *
   * @returns {void}
   */
  function destroy() {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('keydown', handleKeyDown);
    tapCallbacks.clear();
    tapAtCallbacks.clear();
  }

  return { onTap, onTapAt, destroy };
}
