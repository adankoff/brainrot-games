/**
 * SLICE THE BRAINROT -- Slicer Module
 * Drag tracking, trail rendering, and line-circle intersection for slice detection.
 */

import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from './physics.js';

// ---- Trail Point ----

/**
 * @typedef {Object} TrailPoint
 * @property {number} x
 * @property {number} y
 * @property {number} age - frames since creation
 */

// ---- Slicer State ----

/**
 * Create a slicer instance that tracks drag input and renders the trail.
 * @param {HTMLCanvasElement} canvas
 * @returns {Object}
 */
export function createSlicer(canvas) {
  /** @type {boolean} */
  let dragging = false;

  /** @type {TrailPoint[]} */
  let trail = [];

  /** @type {{ x: number, y: number }|null} */
  let prevPoint = null;

  /** @type {Array<{ x: number, y: number }>} */
  let swipeSegments = [];

  /** Max trail length in points */
  const MAX_TRAIL = 30;

  /** Trail fade time in frames */
  const TRAIL_FADE = 10;

  // ---- Coordinate conversion ----

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (LOGICAL_WIDTH / rect.width),
      y: (clientY - rect.top) * (LOGICAL_HEIGHT / rect.height),
    };
  }

  // ---- Event Handlers ----

  function onPointerDown(clientX, clientY) {
    dragging = true;
    const pos = toLogical(clientX, clientY);
    prevPoint = pos;
    trail = [{ x: pos.x, y: pos.y, age: 0 }];
    swipeSegments = [];
  }

  function onPointerMove(clientX, clientY) {
    if (!dragging) return;
    const pos = toLogical(clientX, clientY);

    if (prevPoint) {
      swipeSegments.push({ x: prevPoint.x, y: prevPoint.y, x2: pos.x, y2: pos.y });
    }

    trail.push({ x: pos.x, y: pos.y, age: 0 });
    if (trail.length > MAX_TRAIL) {
      trail.shift();
    }
    prevPoint = pos;
  }

  function onPointerUp() {
    dragging = false;
    prevPoint = null;
  }

  // Mouse events
  function handleMouseDown(e) {
    onPointerDown(e.clientX, e.clientY);
  }
  function handleMouseMove(e) {
    onPointerMove(e.clientX, e.clientY);
  }
  function handleMouseUp() {
    onPointerUp();
  }

  // Touch events
  function handleTouchStart(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    onPointerDown(t.clientX, t.clientY);
  }
  function handleTouchMove(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    onPointerMove(t.clientX, t.clientY);
  }
  function handleTouchEnd(e) {
    e.preventDefault();
    onPointerUp();
  }

  canvas.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  // ---- Public API ----

  /**
   * Update trail ages. Call once per frame.
   * @param {number} dt
   */
  function update(dt) {
    for (const pt of trail) {
      pt.age += dt;
    }
    // Remove fully faded points
    trail = trail.filter((pt) => pt.age < TRAIL_FADE);
  }

  /**
   * Consume and return new swipe segments since last call.
   * @returns {Array<{ x: number, y: number, x2: number, y2: number }>}
   */
  function consumeSegments() {
    const segs = swipeSegments;
    swipeSegments = [];
    return segs;
  }

  /**
   * Render the trail.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color
   */
  function renderTrail(ctx, color) {
    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const alpha = Math.max(0, 1 - p1.age / TRAIL_FADE);
      if (alpha <= 0) continue;

      const width = 2 + alpha * 4;

      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 6 * alpha;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Check if the slicer is currently dragging.
   * @returns {boolean}
   */
  function isDragging() {
    return dragging;
  }

  /**
   * Destroy event listeners.
   */
  function destroy() {
    canvas.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
  }

  return {
    update,
    consumeSegments,
    renderTrail,
    isDragging,
    destroy,
  };
}

// ---- Geometry: Line-Circle Intersection ----

/**
 * Test if a line segment intersects a circle.
 * Uses closest-point-on-segment approach.
 *
 * @param {number} x1 - Segment start x
 * @param {number} y1 - Segment start y
 * @param {number} x2 - Segment end x
 * @param {number} y2 - Segment end y
 * @param {number} cx - Circle center x
 * @param {number} cy - Circle center y
 * @param {number} r - Circle radius
 * @returns {boolean}
 */
export function lineCircleIntersect(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;

  const a = dx * dx + dy * dy;
  if (a === 0) {
    // Zero-length segment: point-in-circle check
    return fx * fx + fy * fy <= r * r;
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  discriminant = Math.sqrt(discriminant);

  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  // Check if either intersection point is on the segment [0, 1]
  if (t1 >= 0 && t1 <= 1) return true;
  if (t2 >= 0 && t2 <= 1) return true;

  // Check if segment is entirely inside circle
  if (t1 < 0 && t2 > 1) return true;

  return false;
}

/**
 * Get the angle of a line segment.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number} Angle in radians
 */
export function segmentAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}
