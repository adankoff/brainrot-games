/**
 * MEME TAC TOE -- Renderer
 * All canvas drawing: grid, X/O marks, win line, HUD, animations.
 */

import { lerp, easeOutCubic } from '../../shared/utils.js';

// ---- Layout Constants ----

const GRID_SIZE = 280;
const CELL_SIZE = GRID_SIZE / 3;
const LINE_WIDTH = 6;
const MARK_LINE_WIDTH = 8;
const MARK_PADDING = 18;
const WIN_LINE_WIDTH = 10;

// ---- Colors ----

const COLOR_BG = '#0a0a0f';
const COLOR_GRID = '#2a2a3a';
const COLOR_X = '#ff4444';
const COLOR_O = '#44bbff';
const COLOR_WIN_LINE = '#c8ff00';
const COLOR_TEXT = '#f0f0f0';
const COLOR_TEXT_DIM = '#888899';
const COLOR_HUD_BG = 'rgba(20, 20, 30, 0.85)';

/**
 * @typedef {Object} MarkAnimation
 * @property {number} cellIndex
 * @property {'X'|'O'} mark
 * @property {number} progress - 0 to 1
 * @property {number} startTime
 */

export class Renderer {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  constructor(canvasWidth, canvasHeight) {
    this.W = canvasWidth;
    this.H = canvasHeight;

    // Grid origin (top-left of grid)
    this.gridX = (this.W - GRID_SIZE) / 2;
    this.gridY = 180;

    /** @type {Map<number, MarkAnimation>} */
    this.markAnims = new Map();

    /** @type {number} Win line animation progress 0-1 */
    this.winLineProgress = 0;

    /** @type {number} Time accumulator for pulsing effects */
    this.time = 0;
  }

  /**
   * Reset all animation state for a new round.
   */
  resetAnimations() {
    this.markAnims.clear();
    this.winLineProgress = 0;
    this.time = 0;
  }

  /**
   * Start an animation for a newly placed mark.
   *
   * @param {number} cellIndex
   * @param {'X'|'O'} mark
   */
  animateMark(cellIndex, mark) {
    this.markAnims.set(cellIndex, {
      cellIndex,
      mark,
      progress: 0,
      startTime: this.time,
    });
  }

  /**
   * Update animations.
   *
   * @param {number} dt - Normalized delta (1.0 = one frame at 60fps)
   * @param {boolean} hasWin - Whether there is a winning line to animate
   */
  update(dt, hasWin) {
    this.time += dt * 16.67;

    // Update mark animations
    for (const [key, anim] of this.markAnims) {
      if (anim.progress < 1) {
        anim.progress = Math.min(1, anim.progress + dt * 0.08);
      }
    }

    // Update win line animation
    if (hasWin && this.winLineProgress < 1) {
      this.winLineProgress = Math.min(1, this.winLineProgress + dt * 0.04);
    }
  }

  /**
   * Draw the entire game state.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./tictactoe.js').TicTacToe} game
   * @param {Object} seriesState
   * @param {number} seriesState.round
   * @param {number} seriesState.maxRounds
   * @param {number} seriesState.playerWins
   * @param {number} seriesState.aiWins
   * @param {number} seriesState.draws
   * @param {string} seriesState.difficulty
   * @param {string} statusText
   */
  draw(ctx, game, seriesState, statusText) {
    // Background
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Draw HUD
    this._drawHUD(ctx, seriesState);

    // Draw status text
    this._drawStatus(ctx, statusText);

    // Draw grid
    this._drawGrid(ctx);

    // Draw marks
    this._drawMarks(ctx, game);

    // Draw win line
    if (game.winLine) {
      this._drawWinLine(ctx, game.winLine);
    }

    // Draw round indicator dots
    this._drawRoundDots(ctx, seriesState);
  }

  /**
   * Draw the 3x3 grid lines.
   */
  _drawGrid(ctx) {
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = this.gridX + i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(x, this.gridY);
      ctx.lineTo(x, this.gridY + GRID_SIZE);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      const y = this.gridY + i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(this.gridX, y);
      ctx.lineTo(this.gridX + GRID_SIZE, y);
      ctx.stroke();
    }
  }

  /**
   * Draw all placed marks with animations.
   */
  _drawMarks(ctx, game) {
    for (let i = 0; i < 9; i++) {
      const mark = game.board[i];
      if (mark === null) continue;

      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = this.gridX + col * CELL_SIZE + CELL_SIZE / 2;
      const cy = this.gridY + row * CELL_SIZE + CELL_SIZE / 2;
      const halfCell = CELL_SIZE / 2 - MARK_PADDING;

      const anim = this.markAnims.get(i);
      const progress = anim ? easeOutCubic(anim.progress) : 1;

      if (mark === 'X') {
        this._drawX(ctx, cx, cy, halfCell, progress);
      } else {
        this._drawO(ctx, cx, cy, halfCell, progress);
      }
    }
  }

  /**
   * Draw an animated X (two crossing strokes).
   */
  _drawX(ctx, cx, cy, half, progress) {
    ctx.strokeStyle = COLOR_X;
    ctx.lineWidth = MARK_LINE_WIDTH;
    ctx.lineCap = 'round';

    // First stroke: top-left to bottom-right (0-50% of progress)
    const p1 = Math.min(1, progress * 2);
    if (p1 > 0) {
      const x1 = cx - half;
      const y1 = cy - half;
      const x2 = lerp(x1, cx + half, p1);
      const y2 = lerp(y1, cy + half, p1);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Second stroke: top-right to bottom-left (50-100% of progress)
    const p2 = Math.max(0, Math.min(1, (progress - 0.5) * 2));
    if (p2 > 0) {
      const x1 = cx + half;
      const y1 = cy - half;
      const x2 = lerp(x1, cx - half, p2);
      const y2 = lerp(y1, cy + half, p2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /**
   * Draw an animated O (circle drawn progressively).
   */
  _drawO(ctx, cx, cy, half, progress) {
    ctx.strokeStyle = COLOR_O;
    ctx.lineWidth = MARK_LINE_WIDTH;
    ctx.lineCap = 'round';

    const radius = half * 0.85;
    const endAngle = -Math.PI / 2 + progress * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
    ctx.stroke();
  }

  /**
   * Draw the highlighted winning line.
   */
  _drawWinLine(ctx, winLine) {
    if (this.winLineProgress <= 0) return;

    const [a, , c] = winLine;
    const colA = a % 3;
    const rowA = Math.floor(a / 3);
    const colC = c % 3;
    const rowC = Math.floor(c / 3);

    const x1 = this.gridX + colA * CELL_SIZE + CELL_SIZE / 2;
    const y1 = this.gridY + rowA * CELL_SIZE + CELL_SIZE / 2;
    const x2 = this.gridX + colC * CELL_SIZE + CELL_SIZE / 2;
    const y2 = this.gridY + rowC * CELL_SIZE + CELL_SIZE / 2;

    const progress = easeOutCubic(this.winLineProgress);
    const ex = lerp(x1, x2, progress);
    const ey = lerp(y1, y2, progress);

    // Glow
    ctx.save();
    ctx.shadowColor = COLOR_WIN_LINE;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = COLOR_WIN_LINE;
    ctx.lineWidth = WIN_LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw the HUD: round number, score, difficulty.
   */
  _drawHUD(ctx, seriesState) {
    const { round, maxRounds, playerWins, aiWins, difficulty } = seriesState;

    // Top bar background
    ctx.fillStyle = COLOR_HUD_BG;
    ctx.fillRect(0, 0, this.W, 50);

    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.textBaseline = 'middle';

    // Left: difficulty
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.textAlign = 'left';
    ctx.fillText(difficulty.toUpperCase(), 16, 25);

    // Center: round
    ctx.fillStyle = COLOR_TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${round}/${maxRounds}`, this.W / 2, 25);

    // Right: score
    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR_X;
    ctx.fillText(`YOU ${playerWins}`, this.W - 60, 25);
    ctx.fillStyle = COLOR_TEXT_DIM;
    ctx.fillText('-', this.W - 50, 25);
    ctx.fillStyle = COLOR_O;
    ctx.textAlign = 'left';
    ctx.fillText(`${aiWins} AI`, this.W - 44, 25);
  }

  /**
   * Draw status text below the HUD (whose turn, result, etc.).
   */
  _drawStatus(ctx, text) {
    if (!text) return;

    ctx.font = '18px "Space Grotesk", sans-serif';
    ctx.fillStyle = COLOR_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.W / 2, 80);
  }

  /**
   * Draw round indicator dots at the bottom.
   */
  _drawRoundDots(ctx, seriesState) {
    const { round, maxRounds, results } = seriesState;
    const dotRadius = 6;
    const gap = 20;
    const totalWidth = (maxRounds - 1) * gap;
    const startX = (this.W - totalWidth) / 2;
    const y = this.gridY + GRID_SIZE + 40;

    for (let i = 0; i < maxRounds; i++) {
      const x = startX + i * gap;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

      if (i < results.length) {
        const result = results[i];
        if (result === 'win') {
          ctx.fillStyle = COLOR_WIN_LINE;
        } else if (result === 'loss') {
          ctx.fillStyle = COLOR_X;
        } else {
          ctx.fillStyle = COLOR_TEXT_DIM;
        }
        ctx.fill();
      } else if (i === round - 1) {
        // Current round - outlined
        ctx.strokeStyle = COLOR_TEXT;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#1a1a2a';
        ctx.fill();
        ctx.strokeStyle = COLOR_GRID;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  /**
   * Convert a tap position to a cell index, or -1 if outside the grid.
   *
   * @param {{ x: number, y: number }} pos - Logical canvas coordinates
   * @returns {number} Cell index 0-8, or -1
   */
  getCellFromPos(pos) {
    const relX = pos.x - this.gridX;
    const relY = pos.y - this.gridY;

    if (relX < 0 || relX >= GRID_SIZE || relY < 0 || relY >= GRID_SIZE) {
      return -1;
    }

    const col = Math.floor(relX / CELL_SIZE);
    const row = Math.floor(relY / CELL_SIZE);
    return row * 3 + col;
  }
}
