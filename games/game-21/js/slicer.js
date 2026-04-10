/**
 * MEME NINJA -- Slicer
 * Touch/mouse drag tracking, trail rendering, and line-circle intersection
 * for slice detection.
 */

/**
 * Line-circle intersection test.
 * Tests whether a line segment from p1 to p2 intersects a circle.
 *
 * @param {{ x: number, y: number }} p1 - Segment start
 * @param {{ x: number, y: number }} p2 - Segment end
 * @param {{ x: number, y: number, radius: number }} circle - Circle center and radius
 * @returns {boolean}
 */
export function lineIntersectsCircle(p1, p2, circle) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - circle.x;
  const fy = p1.y - circle.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - circle.radius * circle.radius;

  // If segment length is zero, check point-in-circle
  if (a < 0.0001) {
    return c <= 0;
  }

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  // Check if either intersection point lies within [0,1] range of the segment
  if (t1 >= 0 && t1 <= 1) return true;
  if (t2 >= 0 && t2 <= 1) return true;

  // Check if the segment is entirely inside the circle
  if (t1 < 0 && t2 > 1) return true;

  return false;
}

/**
 * Trail point for the visual swipe trail.
 */
class TrailPoint {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 1.0;
  }
}

const TRAIL_DECAY = 0.06;
const MAX_TRAIL_POINTS = 30;

/**
 * Create a SliceTracker that manages drag state and trail rendering.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} logicalWidth
 * @param {number} logicalHeight
 * @returns {Object} SliceTracker instance
 */
export function createSliceTracker(canvas, logicalWidth, logicalHeight) {
  let isDragging = false;
  /** @type {{ x: number, y: number }|null} */
  let lastPos = null;
  /** @type {{ x: number, y: number }|null} */
  let currentPos = null;
  /** @type {TrailPoint[]} */
  let trail = [];
  /** @type {{ from: { x: number, y: number }, to: { x: number, y: number } }[]} */
  let pendingSegments = [];

  /**
   * Convert client coordinates to logical canvas space.
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

  // ---- Mouse Events ----

  function onMouseDown(e) {
    isDragging = true;
    const pos = toLogical(e.clientX, e.clientY);
    lastPos = pos;
    currentPos = pos;
    trail.push(new TrailPoint(pos.x, pos.y));
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const pos = toLogical(e.clientX, e.clientY);
    if (currentPos) {
      pendingSegments.push({ from: { ...currentPos }, to: { ...pos } });
    }
    lastPos = currentPos;
    currentPos = pos;
    trail.push(new TrailPoint(pos.x, pos.y));
    if (trail.length > MAX_TRAIL_POINTS) {
      trail.shift();
    }
  }

  function onMouseUp() {
    isDragging = false;
    lastPos = null;
    currentPos = null;
  }

  // ---- Touch Events ----

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    isDragging = true;
    const pos = toLogical(touch.clientX, touch.clientY);
    lastPos = pos;
    currentPos = pos;
    trail.push(new TrailPoint(pos.x, pos.y));
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.changedTouches[0];
    const pos = toLogical(touch.clientX, touch.clientY);
    if (currentPos) {
      pendingSegments.push({ from: { ...currentPos }, to: { ...pos } });
    }
    lastPos = currentPos;
    currentPos = pos;
    trail.push(new TrailPoint(pos.x, pos.y));
    if (trail.length > MAX_TRAIL_POINTS) {
      trail.shift();
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    isDragging = false;
    lastPos = null;
    currentPos = null;
  }

  // Bind events
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });

  return {
    /**
     * Get all pending line segments since last drain and clear them.
     * @returns {{ from: { x: number, y: number }, to: { x: number, y: number } }[]}
     */
    drainSegments() {
      const segs = pendingSegments;
      pendingSegments = [];
      return segs;
    },

    /**
     * Update trail decay.
     * @param {number} dt
     */
    updateTrail(dt) {
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= TRAIL_DECAY * dt;
        if (trail[i].life <= 0) {
          trail.splice(i, 1);
        }
      }
    },

    /**
     * Render the swipe trail.
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} color - Trail color from theme
     */
    renderTrail(ctx, color) {
      if (trail.length < 2) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];
        const alpha = curr.life * 0.8;
        if (alpha <= 0) continue;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 + curr.life * 4;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }

      // Bright core for the newest points
      if (isDragging && trail.length >= 2) {
        const last = trail[trail.length - 1];
        const prev = trail[trail.length - 2];
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }

      ctx.restore();
    },

    /** @returns {boolean} */
    getIsDragging() {
      return isDragging;
    },

    /**
     * Reset trail and drag state.
     */
    reset() {
      isDragging = false;
      lastPos = null;
      currentPos = null;
      trail = [];
      pendingSegments = [];
    },

    /**
     * Remove all event listeners.
     */
    destroy() {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
  };
}
