/**
 * MEME TOWER -- Tower State Manager
 * Manages the stack of blocks, physics, imbalance tracking, and camera.
 */

/** @typedef {{ x: number, y: number, width: number, height: number, color: string, perfect: boolean }} Block */

const BLOCK_HEIGHT = 28;
const INITIAL_BLOCK_WIDTH = 120;
const BASE_Y = 650;          // bottom of the tower area (logical coords)
const IMBALANCE_THRESHOLD = 55; // cumulative offset before topple
const MIN_BLOCK_WIDTH = 15;

// Rainbow color cycle
const COLORS = [
  '#ff6b6b', '#ffa06b', '#ffd93d', '#6bff6b',
  '#6bd5ff', '#9b6bff', '#ff6bda', '#ff8c42',
  '#42f5e0', '#f542cb', '#42adf5', '#f5e642',
];

export class Tower {
  constructor() {
    /** @type {Block[]} */
    this.blocks = [];

    /** @type {number} cumulative imbalance (signed offset sum) */
    this.imbalance = 0;

    /** @type {number} visual wobble angle in radians */
    this.wobbleAngle = 0;

    /** @type {number} wobble angular velocity */
    this.wobbleVel = 0;

    /** @type {number} camera Y offset (scrolls up as tower grows) */
    this.cameraY = 0;

    /** @type {number} target camera Y for smooth scrolling */
    this.targetCameraY = 0;

    /** @type {number} */
    this.score = 0;

    /** @type {number} */
    this.perfectCount = 0;

    /** @type {number} */
    this.blockCount = 0;

    /** @type {boolean} */
    this.toppled = false;

    /** @type {number} topple animation progress 0-1 */
    this.toppleProgress = 0;

    /** @type {Block|null} last trimmed piece for visual feedback */
    this.trimmedPiece = null;

    /** @type {number} */
    this.trimmedPieceTimer = 0;
  }

  reset() {
    this.blocks = [];
    this.imbalance = 0;
    this.wobbleAngle = 0;
    this.wobbleVel = 0;
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.score = 0;
    this.perfectCount = 0;
    this.blockCount = 0;
    this.toppled = false;
    this.toppleProgress = 0;
    this.trimmedPiece = null;
    this.trimmedPieceTimer = 0;

    // Place the foundation block
    this.blocks.push({
      x: 200 - INITIAL_BLOCK_WIDTH / 2,
      y: BASE_Y - BLOCK_HEIGHT,
      width: INITIAL_BLOCK_WIDTH,
      height: BLOCK_HEIGHT,
      color: '#666',
      perfect: false,
    });
  }

  /** Get the topmost block */
  getTopBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  /** Get the width the next swinging block should be */
  getNextBlockWidth() {
    const top = this.getTopBlock();
    return top ? top.width : INITIAL_BLOCK_WIDTH;
  }

  /** Get the Y position where the next block should land */
  getNextLandingY() {
    return BASE_Y - (this.blocks.length) * BLOCK_HEIGHT;
  }

  /** Get the color for the next block */
  getNextColor() {
    return COLORS[this.blockCount % COLORS.length];
  }

  /**
   * Attempt to place a block at the given X center position.
   * Returns: 'perfect' | 'stacked' | 'trimmed' | 'missed' | 'toppled'
   *
   * @param {number} dropX - center X of the dropping block
   * @param {number} blockWidth - width of the dropping block
   * @returns {string}
   */
  placeBlock(dropX, blockWidth) {
    const top = this.getTopBlock();
    const topLeft = top.x;
    const topRight = top.x + top.width;

    const blockLeft = dropX - blockWidth / 2;
    const blockRight = dropX + blockWidth / 2;

    // Check for complete miss
    if (blockRight <= topLeft || blockLeft >= topRight) {
      return 'missed';
    }

    // Calculate overlap
    const overlapLeft = Math.max(blockLeft, topLeft);
    const overlapRight = Math.min(blockRight, topRight);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth < MIN_BLOCK_WIDTH) {
      return 'missed';
    }

    // Check if it's a perfect placement (within 5px tolerance)
    const blockCenter = dropX;
    const topCenter = top.x + top.width / 2;
    const offset = blockCenter - topCenter;
    const isPerfect = Math.abs(offset) < 5;

    let finalX, finalWidth;

    if (isPerfect) {
      // Perfect: keep same width and position as block below
      finalX = top.x;
      finalWidth = top.width;
      this.perfectCount++;
    } else {
      // Trim the overhang
      finalX = overlapLeft;
      finalWidth = overlapWidth;

      // Create trimmed piece visual
      if (blockLeft < topLeft) {
        // Overhang on the left
        this.trimmedPiece = {
          x: blockLeft,
          y: this.getNextLandingY(),
          width: topLeft - blockLeft,
          height: BLOCK_HEIGHT,
          color: this.getNextColor(),
          perfect: false,
        };
      } else {
        // Overhang on the right
        this.trimmedPiece = {
          x: topRight,
          y: this.getNextLandingY(),
          width: blockRight - topRight,
          height: BLOCK_HEIGHT,
          color: this.getNextColor(),
          perfect: false,
        };
      }
      this.trimmedPieceTimer = 1.0;
    }

    const landingY = this.getNextLandingY();

    this.blocks.push({
      x: finalX,
      y: landingY,
      width: finalWidth,
      height: BLOCK_HEIGHT,
      color: this.getNextColor(),
      perfect: isPerfect,
    });

    this.blockCount++;

    // Update imbalance
    const newCenter = finalX + finalWidth / 2;
    const centerOffset = newCenter - 200; // 200 = canvas center
    this.imbalance += centerOffset * 0.3;

    // Score
    this.score += 10;
    if (isPerfect) {
      this.score += 50;
    }

    // Update camera
    if (landingY < 350) {
      this.targetCameraY = 350 - landingY;
    }

    // Check topple
    if (Math.abs(this.imbalance) > IMBALANCE_THRESHOLD) {
      this.toppled = true;
      return 'toppled';
    }

    if (isPerfect) return 'perfect';
    if (finalWidth < blockWidth - 1) return 'trimmed';
    return 'stacked';
  }

  /**
   * Update tower physics (wobble, camera scroll, trimmed piece fade).
   * @param {number} dt - normalized delta time
   */
  update(dt) {
    // Wobble physics: spring system driven by imbalance
    const targetAngle = this.imbalance * 0.001;
    const springForce = (targetAngle - this.wobbleAngle) * 0.08;
    const damping = -this.wobbleVel * 0.15;
    this.wobbleVel += (springForce + damping) * dt;
    this.wobbleAngle += this.wobbleVel * dt;

    // Smooth camera scroll
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.06 * dt;

    // Trimmed piece animation
    if (this.trimmedPiece && this.trimmedPieceTimer > 0) {
      this.trimmedPieceTimer -= 0.03 * dt;
      if (this.trimmedPieceTimer <= 0) {
        this.trimmedPiece = null;
        this.trimmedPieceTimer = 0;
      }
    }

    // Topple animation
    if (this.toppled) {
      this.toppleProgress = Math.min(1, this.toppleProgress + 0.015 * dt);
    }
  }

  /** @returns {{ blockHeight: number, initialBlockWidth: number }} */
  static get constants() {
    return {
      blockHeight: BLOCK_HEIGHT,
      initialBlockWidth: INITIAL_BLOCK_WIDTH,
    };
  }
}
