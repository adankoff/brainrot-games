/**
 * MEME STACK -- Stack Management
 * Placed blocks, moving block state, drop/slice logic,
 * perfect detection, combo tracking, camera offset.
 */

import { clamp } from '../../shared/utils.js';

// ---- Constants ----

export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 700;
export const BLOCK_START_WIDTH = 200;
export const BLOCK_HEIGHT = 40;
export const BASE_SPEED = 3.0;
export const MAX_SPEED = 7.0;
export const SPEED_INCREMENT = 0.05;
export const PERFECT_THRESHOLD = 5;
export const COMBO_GROW = 5;
export const COMBO_GROW_MIN_COMBO = 3;

// ---- Placed Block ----

/**
 * @typedef {Object} PlacedBlock
 * @property {number} x - Left edge x
 * @property {number} y - Top edge y (in world space)
 * @property {number} width
 * @property {number} height
 * @property {number} colorIndex - Index into theme colors
 */

// ---- Slice Piece (falling overhang) ----

/**
 * @typedef {Object} SlicePiece
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} colorIndex
 * @property {number} vx - Horizontal velocity
 * @property {number} vy - Vertical velocity
 * @property {number} rotation
 * @property {number} rotationSpeed
 * @property {number} alpha
 */

// ---- Combo Text Effect ----

/**
 * @typedef {Object} ComboTextEffect
 * @property {string} text
 * @property {number} x
 * @property {number} y - World space y
 * @property {number} timer - Frames remaining
 * @property {number} maxTimer
 * @property {number} comboCount
 */

// ---- Flash Effect ----

/**
 * @typedef {Object} FlashEffect
 * @property {number} timer
 * @property {number} maxTimer
 */

// ---- Stack State ----

export class StackState {
  constructor() {
    this.reset();
  }

  reset() {
    /** @type {PlacedBlock[]} */
    this.blocks = [];

    /** @type {SlicePiece[]} */
    this.slicePieces = [];

    /** @type {ComboTextEffect[]} */
    this.comboTexts = [];

    /** @type {FlashEffect|null} */
    this.flash = null;

    // Moving block
    this.movingX = 0;
    this.movingWidth = BLOCK_START_WIDTH;
    this.movingDirection = 1; // 1 = right, -1 = left
    this.movingActive = false;

    // Game state
    this.score = 0;
    this.combo = 0;
    this.gameOver = false;

    // Camera
    this.cameraY = 0;
    this.targetCameraY = 0;

    // Place the foundation block
    const foundationX = (LOGICAL_WIDTH - BLOCK_START_WIDTH) / 2;
    const foundationY = LOGICAL_HEIGHT - BLOCK_HEIGHT - 60; // 60px from bottom
    this.blocks.push({
      x: foundationX,
      y: foundationY,
      width: BLOCK_START_WIDTH,
      height: BLOCK_HEIGHT,
      colorIndex: 0,
    });

    // Set up first moving block
    this._spawnMovingBlock();
  }

  /**
   * Get the top placed block.
   *
   * @returns {PlacedBlock}
   */
  getTopBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Get the y position where the next block will land.
   *
   * @returns {number}
   */
  getNextBlockY() {
    return this.getTopBlock().y - BLOCK_HEIGHT;
  }

  /**
   * Get the current block speed based on score.
   *
   * @returns {number}
   */
  getSpeed() {
    return clamp(BASE_SPEED + this.score * SPEED_INCREMENT, BASE_SPEED, MAX_SPEED);
  }

  /**
   * Spawn a new moving block at the top.
   */
  _spawnMovingBlock() {
    this.movingWidth = this.getTopBlock().width;
    this.movingDirection = (this.blocks.length % 2 === 0) ? 1 : -1;
    this.movingX = this.movingDirection === 1 ? -this.movingWidth : LOGICAL_WIDTH;
    this.movingActive = true;
  }

  /**
   * Update the moving block position.
   *
   * @param {number} dt - Normalized delta time (1.0 = one frame at 60fps)
   */
  updateMovingBlock(dt) {
    if (!this.movingActive || this.gameOver) return;

    const speed = this.getSpeed();
    this.movingX += speed * this.movingDirection * dt;

    // Bounce off edges
    if (this.movingDirection === 1 && this.movingX + this.movingWidth > LOGICAL_WIDTH) {
      this.movingX = LOGICAL_WIDTH - this.movingWidth;
      this.movingDirection = -1;
    } else if (this.movingDirection === -1 && this.movingX < 0) {
      this.movingX = 0;
      this.movingDirection = 1;
    }
  }

  /**
   * Drop the moving block. Returns result info.
   *
   * @param {string[]} comboTextPool - Array of combo text strings from theme
   * @returns {{ placed: boolean, perfect: boolean, gameOver: boolean }}
   */
  dropBlock(comboTextPool) {
    if (!this.movingActive || this.gameOver) {
      return { placed: false, perfect: false, gameOver: false };
    }

    this.movingActive = false;
    const top = this.getTopBlock();
    const nextY = this.getNextBlockY();

    // Calculate overlap
    const movingLeft = this.movingX;
    const movingRight = this.movingX + this.movingWidth;
    const topLeft = top.x;
    const topRight = top.x + top.width;

    const overlapLeft = Math.max(movingLeft, topLeft);
    const overlapRight = Math.min(movingRight, topRight);
    const overlapWidth = overlapRight - overlapLeft;

    // Game over: no overlap
    if (overlapWidth <= 0) {
      this.gameOver = true;

      // The entire block becomes a slice piece falling
      this.slicePieces.push({
        x: this.movingX,
        y: nextY,
        width: this.movingWidth,
        height: BLOCK_HEIGHT,
        colorIndex: (this.blocks.length) % 100,
        vx: this.movingDirection * 1.5,
        vy: 0,
        rotation: 0,
        rotationSpeed: this.movingDirection * 0.05,
        alpha: 1,
      });

      return { placed: false, perfect: false, gameOver: true };
    }

    // Check for perfect placement
    const offset = Math.abs((this.movingX + this.movingWidth / 2) - (top.x + top.width / 2));
    const isPerfect = offset <= PERFECT_THRESHOLD;

    let placedX;
    let placedWidth;

    if (isPerfect) {
      // Perfect: snap to same position and keep full width
      placedX = top.x;
      placedWidth = top.width;
      this.combo++;

      // Combo width recovery at 3+
      if (this.combo >= COMBO_GROW_MIN_COMBO) {
        placedWidth = Math.min(placedWidth + COMBO_GROW, BLOCK_START_WIDTH);
        // Center the grown block
        placedX = top.x + (top.width - placedWidth) / 2;
      }

      // Combo text effect
      const textIndex = Math.floor(Math.random() * comboTextPool.length);
      this.comboTexts.push({
        text: comboTextPool[textIndex],
        x: LOGICAL_WIDTH / 2,
        y: nextY,
        timer: 60,
        maxTimer: 60,
        comboCount: this.combo,
      });

      // Flash effect
      this.flash = { timer: 12, maxTimer: 12 };
    } else {
      // Not perfect: slice overhang
      placedX = overlapLeft;
      placedWidth = overlapWidth;
      this.combo = 0;

      // Create slice piece for the overhang
      if (movingLeft < topLeft) {
        // Overhang on left side
        this.slicePieces.push({
          x: movingLeft,
          y: nextY,
          width: topLeft - movingLeft,
          height: BLOCK_HEIGHT,
          colorIndex: (this.blocks.length) % 100,
          vx: -2,
          vy: 0,
          rotation: 0,
          rotationSpeed: -0.08,
          alpha: 1,
        });
      }
      if (movingRight > topRight) {
        // Overhang on right side
        this.slicePieces.push({
          x: topRight,
          y: nextY,
          width: movingRight - topRight,
          height: BLOCK_HEIGHT,
          colorIndex: (this.blocks.length) % 100,
          vx: 2,
          vy: 0,
          rotation: 0,
          rotationSpeed: 0.08,
          alpha: 1,
        });
      }
    }

    // Place the block
    this.blocks.push({
      x: placedX,
      y: nextY,
      width: placedWidth,
      height: BLOCK_HEIGHT,
      colorIndex: this.blocks.length % 100,
    });

    this.score++;

    // Spawn next moving block
    this._spawnMovingBlock();

    return { placed: true, perfect: isPerfect, gameOver: false };
  }

  /**
   * Update slice pieces (falling animation).
   *
   * @param {number} dt
   */
  updateSlicePieces(dt) {
    for (const sp of this.slicePieces) {
      sp.vy += 0.4 * dt; // gravity
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.rotation += sp.rotationSpeed * dt;
      sp.alpha -= 0.015 * dt;
      if (sp.alpha < 0) sp.alpha = 0;
    }
    // Remove dead pieces
    this.slicePieces = this.slicePieces.filter((sp) => sp.alpha > 0 && sp.y < this.cameraY + LOGICAL_HEIGHT + 200);
  }

  /**
   * Update combo text effects.
   *
   * @param {number} dt
   */
  updateComboTexts(dt) {
    for (const ct of this.comboTexts) {
      ct.timer -= dt;
      ct.y -= 0.5 * dt; // float upward
    }
    this.comboTexts = this.comboTexts.filter((ct) => ct.timer > 0);
  }

  /**
   * Update flash effect.
   *
   * @param {number} dt
   */
  updateFlash(dt) {
    if (this.flash) {
      this.flash.timer -= dt;
      if (this.flash.timer <= 0) {
        this.flash = null;
      }
    }
  }

  /**
   * Update camera to track the top of the stack.
   *
   * @param {number} dt
   */
  updateCamera(dt) {
    const topBlock = this.getTopBlock();
    // When the tower grows past the middle of the screen, camera follows
    const midScreen = LOGICAL_HEIGHT / 2;
    const targetY = Math.max(0, (LOGICAL_HEIGHT - BLOCK_HEIGHT - 60) - topBlock.y - midScreen + BLOCK_HEIGHT * 3);

    this.targetCameraY = targetY;
    // Smooth camera follow
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.1 * dt;
  }
}
