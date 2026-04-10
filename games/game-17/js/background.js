/**
 * FLAPPY DOGE -- Background Renderer
 * Theme-specific backgrounds: doge sky, nyan space, troll grid paper.
 */

import { THEMES, FLOOR_HEIGHT } from './constants.js';

const FAR_SPEED_RATIO = 0.15;
const MID_SPEED_RATIO = 0.4;
const NEAR_SPEED_RATIO = 1.0;

export class Background {
  constructor() {
    this.farOffset = 0;
    this.midOffset = 0;
    this.floorOffset = 0;
    this.currentTheme = 'doge';

    // Pre-generate elements
    this._clouds = [];
    this._dogeTexts = [];
    this._stars = [];
    this._gridLines = [];
    this._panelBorders = [];
    this._generateElements();
  }

  _generateElements() {
    const tileW = 720;

    // Doge theme: clouds and floating text
    for (let i = 0; i < 8; i++) {
      this._clouds.push({
        x: Math.random() * tileW,
        y: 40 + Math.random() * 200,
        w: 40 + Math.random() * 60,
        h: 20 + Math.random() * 20,
      });
    }

    const dogeWords = ['wow', 'such fly', 'very flap', 'much air', 'so high', 'amaze'];
    for (let i = 0; i < 10; i++) {
      this._dogeTexts.push({
        x: Math.random() * tileW,
        y: 60 + Math.random() * 350,
        text: dogeWords[Math.floor(Math.random() * dogeWords.length)],
        size: 10 + Math.random() * 8,
        color: ['#c4a265', '#e8b84b', '#a08040', '#d4a060'][Math.floor(Math.random() * 4)],
      });
    }

    // Nyan theme: stars
    for (let i = 0; i < 80; i++) {
      this._stars.push({
        x: Math.random() * tileW,
        y: Math.random() * 640,
        size: 1 + Math.random() * 2,
        twinkleSpeed: 0.002 + Math.random() * 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // Troll theme: grid paper lines
    for (let x = 0; x < tileW; x += 30) {
      this._gridLines.push({ x, vertical: true });
    }

    // Panel borders (horizontal dividers like rage comic panels)
    for (let i = 0; i < 4; i++) {
      this._panelBorders.push({
        x: 60 + Math.random() * (tileW - 120),
        y: 100 + i * 140,
        w: 80 + Math.random() * 100,
      });
    }
  }

  /**
   * Set the active theme.
   * @param {string} themeId
   */
  setTheme(themeId) {
    this.currentTheme = themeId;
  }

  /**
   * Scroll all layers.
   * @param {number} dt    - Normalized delta time
   * @param {number} speed - Current obstacle scroll speed
   * @param {number} score - Current score (unused here, kept for API parity)
   */
  update(dt, speed, score) {
    const tileW = 720;

    this.farOffset -= speed * FAR_SPEED_RATIO * dt;
    if (this.farOffset <= -tileW) this.farOffset += tileW;

    this.midOffset -= speed * MID_SPEED_RATIO * dt;
    if (this.midOffset <= -tileW) this.midOffset += tileW;

    this.floorOffset -= speed * NEAR_SPEED_RATIO * dt;
    if (this.floorOffset <= -tileW) this.floorOffset += tileW;
  }

  /**
   * Draw background for current theme.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} logicalWidth
   * @param {number} logicalHeight
   */
  draw(ctx, logicalWidth, logicalHeight) {
    const theme = THEMES[this.currentTheme];
    if (!theme) return;

    switch (this.currentTheme) {
      case 'doge':
        this._drawDogeBackground(ctx, logicalWidth, logicalHeight, theme);
        break;
      case 'nyan':
        this._drawNyanBackground(ctx, logicalWidth, logicalHeight, theme);
        break;
      case 'troll':
        this._drawTrollBackground(ctx, logicalWidth, logicalHeight, theme);
        break;
    }
  }

  // ---- DOGE: Blue sky, clouds, floating doge text, green grass ----

  _drawDogeBackground(ctx, logicalWidth, logicalHeight, theme) {
    const floorY = logicalHeight - FLOOR_HEIGHT;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, floorY);
    grad.addColorStop(0, '#5eadd6');
    grad.addColorStop(1, '#87CEEB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, floorY);

    // Far layer: clouds
    ctx.save();
    ctx.translate(this.farOffset, 0);
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const cloud of this._clouds) {
        this._drawCloud(ctx, cloud.x + offsetX, cloud.y, cloud.w, cloud.h);
      }
    }
    ctx.restore();

    // Mid layer: floating doge text
    ctx.save();
    ctx.translate(this.midOffset, 0);
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const dt of this._dogeTexts) {
        ctx.font = `bold ${dt.size}px "Comic Sans MS", "Bungee", sans-serif`;
        ctx.fillStyle = dt.color;
        ctx.globalAlpha = 0.35;
        ctx.textAlign = 'center';
        ctx.fillText(dt.text, dt.x + offsetX, dt.y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Floor: green grass
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(0, floorY, logicalWidth, FLOOR_HEIGHT);

    // Grass texture lines
    ctx.save();
    ctx.strokeStyle = '#3a7c2f';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(this.floorOffset % 20 - 20, floorY + 4);
    ctx.lineTo(logicalWidth + 20, floorY + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Grass blade details at floor edge
    ctx.fillStyle = '#5aac4f';
    for (let x = 0; x < logicalWidth; x += 8) {
      const h = 4 + Math.sin(x * 0.3 + this.floorOffset * 0.1) * 3;
      ctx.fillRect(x, floorY - h, 3, h);
    }

    // Floor top edge
    ctx.strokeStyle = '#2a6c20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(logicalWidth, floorY);
    ctx.stroke();
  }

  _drawCloud(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    // Main body
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left puff
    ctx.beginPath();
    ctx.ellipse(x - w * 0.3, y + h * 0.1, w * 0.25, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right puff
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.1, w * 0.25, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Top puff
    ctx.beginPath();
    ctx.ellipse(x + w * 0.1, y - h * 0.25, w * 0.2, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- NYAN: Dark blue space with star dots, no ground ----

  _drawNyanBackground(ctx, logicalWidth, logicalHeight) {
    // Space background
    const grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#050520');
    grad.addColorStop(0.5, '#0a0a2e');
    grad.addColorStop(1, '#0f0f3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // Stars (scrolling slowly)
    ctx.save();
    ctx.translate(this.farOffset * 0.5, 0);
    const now = performance.now();
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const star of this._stars) {
        const twinkle = 0.4 + Math.sin(now * star.twinkleSpeed + star.twinkleOffset) * 0.6;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // No floor for nyan theme -- open space
  }

  // ---- TROLL: White grid paper, rage comic panel borders ----

  _drawTrollBackground(ctx, logicalWidth, logicalHeight) {
    const floorY = logicalHeight - FLOOR_HEIGHT;

    // White paper background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, logicalWidth, floorY);

    // Grid lines (light blue, like notebook paper)
    ctx.save();
    ctx.translate(this.farOffset * 0.3, 0);
    ctx.strokeStyle = 'rgba(180, 210, 240, 0.4)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let y = 0; y < floorY; y += 30) {
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.lineTo(logicalWidth + 40, y);
      ctx.stroke();
    }

    // Vertical lines (scrolling)
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const line of this._gridLines) {
        ctx.beginPath();
        ctx.moveTo(line.x + offsetX, 0);
        ctx.lineTo(line.x + offsetX, floorY);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Rage comic panel borders (thick black lines)
    ctx.save();
    ctx.translate(this.midOffset * 0.5, 0);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 3;
    for (let pass = 0; pass < 2; pass++) {
      const offsetX = pass * 720;
      for (const panel of this._panelBorders) {
        ctx.strokeRect(panel.x + offsetX - panel.w / 2, panel.y - 50, panel.w, 100);
      }
    }
    ctx.restore();

    // Floor: rage comic panel border (thick black bar)
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, floorY, logicalWidth, FLOOR_HEIGHT);

    // Panel border pattern on floor
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(this.floorOffset % 25 - 25, floorY + 4);
    ctx.lineTo(logicalWidth + 25, floorY + 4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Floor top edge
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(logicalWidth, floorY);
    ctx.stroke();
  }

  /**
   * Reset scroll offsets for a new run.
   */
  reset() {
    this.farOffset = 0;
    this.midOffset = 0;
    this.floorOffset = 0;
  }
}
