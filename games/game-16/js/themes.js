/**
 * MEME STACK -- Theme Definitions
 * Three classic meme themes: Trollface, Doge, Chill Guy.
 * Each theme provides colors, combo texts, death messages, and draw callbacks.
 */

// ---- Theme: TROLLFACE ----

const trollfaceTheme = {
  id: 'trollface',
  name: 'TROLLFACE STACK',
  colors: ['#ffffff', '#d0d0d0', '#a0a0a0', '#e8e8e8', '#c0c0c0'],
  comboTexts: ['PROBLEM?', 'U MAD?', 'TROLLED!', 'EPIC WIN!', 'LIKE A BOSS!'],
  deathMessages: [
    'u mad bro?',
    'trollface has fallen',
    'the tower was all a troll',
    'problem: tower collapsed',
  ],
  accentColor: '#333333',

  /**
   * Draw Trollface decoration on a placed block.
   * Alternates between trollface and "problem?" text.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.8;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.4;

    if (index % 2 === 0) {
      // Trollface: circle face, wide U-grin, simple eyes
      ctx.strokeStyle = '#333';
      ctx.fillStyle = '#333';
      ctx.lineWidth = 2;

      // Face circle
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Left eye
      ctx.beginPath();
      ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Wide U-grin
      ctx.beginPath();
      ctx.arc(0, 1, 9, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Eyebrows (raised smugly)
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-3, -10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(3, -10);
      ctx.stroke();
    } else {
      // "problem?" text
      ctx.fillStyle = '#333';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('problem?', 0, 0);
    }
    ctx.restore();
  },

  /**
   * Draw white-to-light-gray gradient with rage comic panel lines.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // White to light gray gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#f0f0f0');
    grad.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Rage comic panel lines (horizontal)
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    const panelOffsetH = (cameraY * 0.03) % 140;
    for (let py = -140 + panelOffsetH; py < H; py += 140) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }

    // Rage comic panel lines (vertical)
    const panelOffsetV = (cameraY * 0.02) % 200;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();

    // Diagonal panel divider for variety
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 1.5;
    const diagOffset = (cameraY * 0.04) % 280;
    for (let dy = -280 + diagOffset; dy < H + 280; dy += 280) {
      ctx.beginPath();
      ctx.moveTo(0, dy);
      ctx.lineTo(W, dy + 140);
      ctx.stroke();
    }

    // Subtle grid texture overlay
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000000';
    for (let gx = 0; gx < W; gx += 20) {
      for (let gy = 0; gy < H; gy += 20) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: DOGE ----

const dogeTheme = {
  id: 'doge',
  name: 'DOGE STACK',
  colors: ['#d4a76a', '#daa520', '#f5deb3', '#d2691e', '#deb887'],
  comboTexts: ['WOW!', 'SUCH PERFECT!', 'VERY STACK!', 'MUCH COMBO!', 'SO TOWER!'],
  deathMessages: [
    'such fall. very collapse. wow.',
    'the doge tower crumbled',
    'much sadness',
  ],
  accentColor: '#c4a265',

  /**
   * Draw Doge face silhouette on blocks.
   * Tan circle, triangle ears.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.8;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35;

    // Doge face silhouette
    ctx.fillStyle = '#8B6914';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;

    // Face circle
    ctx.beginPath();
    ctx.arc(0, 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Left ear (triangle)
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-7, -16);
    ctx.lineTo(-2, -6);
    ctx.closePath();
    ctx.fill();

    // Right ear (triangle)
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.lineTo(7, -16);
    ctx.lineTo(2, -6);
    ctx.closePath();
    ctx.fill();

    // Inner face (lighter)
    ctx.fillStyle = '#c4a265';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(0, 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (small dots)
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(-4, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(0, 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Doge word on block
    const words = ['wow', 'such stack', 'very tower', 'much block', 'so high'];
    ctx.fillStyle = '#8B6914';
    ctx.globalAlpha = 0.2;
    ctx.font = 'italic 9px "Comic Sans MS", "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const word = words[index % words.length];
    ctx.fillText(word, width * 0.3 * (index % 2 === 0 ? -1 : 1), 0);

    ctx.restore();
  },

  /**
   * Draw light tan gradient with floating doge text.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // Light tan gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#fdf5e6');
    grad.addColorStop(0.5, '#f5e6c8');
    grad.addColorStop(1, '#faebd7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Floating doge text in Comic Sans style
    const dogeWords = ['wow', 'such', 'very', 'much', 'so', 'amaze'];
    const dogeColors = ['#c4a265', '#d4a76a', '#b8860b', '#daa520', '#cd853f', '#a0522d'];
    ctx.font = 'italic 14px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
      const wx = (i * 97.3 + 30) % W;
      const wy = ((i * 131.7 + cameraY * 0.03 * ((i % 3) + 1)) % H + H) % H;
      ctx.globalAlpha = 0.12 + (i % 4) * 0.03;
      ctx.fillStyle = dogeColors[i % dogeColors.length];
      const fontSize = 12 + (i % 4) * 3;
      ctx.font = `italic ${fontSize}px "Comic Sans MS", cursive, sans-serif`;
      ctx.fillText(dogeWords[i % dogeWords.length], wx, wy);
    }
    ctx.globalAlpha = 1;

    // Subtle paw prints scattered
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#8B6914';
    for (let i = 0; i < 8; i++) {
      const px = (i * 73 + 15) % W;
      const py = ((i * 109 + cameraY * 0.02) % H + H) % H;
      // Main pad
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      // Toe pads
      for (let t = 0; t < 4; t++) {
        const angle = -0.8 + t * 0.5;
        ctx.beginPath();
        ctx.arc(px + Math.cos(angle) * 8, py + Math.sin(angle) * 8 - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },
};

// ---- Theme: CHILL GUY ----

const chillGuyTheme = {
  id: 'chillguy',
  name: 'CHILL GUY STACK',
  colors: ['#87CEEB', '#9DC183', '#B8A9C9', '#FFDAB9', '#98D8C8'],
  comboTexts: ['CHILL.', 'UNBOTHERED.', 'VIBING.', 'ZEN.', 'TRANSCENDENT.'],
  deathMessages: [
    'the chill is over',
    'even chill guy couldn\'t save this tower',
    'unbothered by gravity... until now',
  ],
  accentColor: '#4a90d9',

  /**
   * Draw Chill Guy dog silhouette on blocks.
   * Brown circle, floppy ears, half-closed eyes.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.8;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35;

    // Chill Guy dog silhouette
    ctx.fillStyle = '#6B4226';
    ctx.strokeStyle = '#6B4226';
    ctx.lineWidth = 2;

    // Head circle (brown)
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Left floppy ear
    ctx.beginPath();
    ctx.ellipse(-11, 4, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right floppy ear
    ctx.beginPath();
    ctx.ellipse(11, 4, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Lighter snout area
    ctx.fillStyle = '#c4a265';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Half-closed eyes (lazy/chill look)
    ctx.fillStyle = '#222';
    ctx.globalAlpha = 0.4;
    // Left eye - half-closed line
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(-2, -2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#222';
    ctx.stroke();
    // Right eye - half-closed line
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(6, -2);
    ctx.stroke();

    // Small smile
    ctx.beginPath();
    ctx.arc(0, 4, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nose dot
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(0, 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw calm gradient background with floating cloud shapes.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // Calm sky blue to soft green gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(0.4, '#a8d8ea');
    grad.addColorStop(0.7, '#c8e6c9');
    grad.addColorStop(1, '#a8d8a8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Floating cloud shapes
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const cloudX = (i * 113 + cameraY * 0.02 * ((i % 2) + 1)) % (W + 100) - 50;
      const cloudY = ((i * 157 + cameraY * 0.015) % H + H) % H;
      ctx.globalAlpha = 0.2 + (i % 3) * 0.05;
      const cloudScale = 0.7 + (i % 3) * 0.3;

      ctx.save();
      ctx.translate(cloudX, cloudY);
      ctx.scale(cloudScale, cloudScale);

      // Cloud shape: overlapping circles
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-14, 4, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(14, 4, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-8, -8, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8, -8, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // Subtle sun glow in top right
    ctx.globalAlpha = 0.1;
    const sunGrad = ctx.createRadialGradient(W - 60, 60, 0, W - 60, 60, 100);
    sunGrad.addColorStop(0, '#fff8dc');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(W - 60, 60, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
};

// ---- Exported theme list ----

export const THEMES = [trollfaceTheme, dogeTheme, chillGuyTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
