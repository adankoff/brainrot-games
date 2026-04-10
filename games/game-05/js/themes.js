/**
 * SKIBIDI STACK -- Theme Definitions
 * Three swappable meme themes: Skibidi, Italian Brainrot, Among Us.
 * Each theme provides colors, combo texts, death messages, and draw callbacks.
 */

// ---- Theme: SKIBIDI STACK ----

const skibidiTheme = {
  id: 'skibidi',
  name: 'SKIBIDI STACK',
  colors: ['#00e5ff', '#ff1744', '#ffea00', '#00e676', '#e040fb'],
  comboTexts: ['SKIBIDI!', 'CAMERA!', 'EPIC!', 'TOILET POWER!'],
  deathMessages: [
    'the tower of toilets has fallen',
    'skibidi stack collapsed',
  ],
  accentColor: '#00e5ff',

  /**
   * Draw a character decoration on a placed block.
   * Alternates between toilet and cameraman silhouettes.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.8;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    if (index % 2 === 0) {
      // Toilet silhouette
      // Bowl
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tank
      ctx.fillRect(-8, -14, 16, 14);
      // Lid
      ctx.beginPath();
      ctx.ellipse(0, -14, 10, 4, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    } else {
      // Cameraman silhouette
      // Body
      ctx.fillRect(-6, -2, 12, 16);
      // Head (camera)
      ctx.fillRect(-10, -14, 20, 12);
      // Lens
      ctx.beginPath();
      ctx.arc(0, -8, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  /**
   * Draw dark city skyline background.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1a1a3a');
    grad.addColorStop(1, '#0d0d2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;

    // Skyline buildings - far layer
    ctx.fillStyle = '#111128';
    const offsetFar = (cameraY * 0.03) % 60;
    for (let i = 0; i < 12; i++) {
      const bx = i * 40 - 20;
      const bh = 80 + (i * 31) % 120;
      ctx.fillRect(bx, H - bh + offsetFar, 30, bh);
    }

    // Skyline buildings - near layer
    ctx.fillStyle = '#1a1a40';
    const offsetNear = (cameraY * 0.06) % 40;
    for (let i = 0; i < 10; i++) {
      const bx = i * 50 - 10;
      const bh = 60 + (i * 47) % 100;
      ctx.fillRect(bx, H - bh + offsetNear, 38, bh);
      // Windows
      ctx.fillStyle = '#ffea0022';
      for (let wy = H - bh + offsetNear + 8; wy < H; wy += 14) {
        for (let wx = bx + 5; wx < bx + 33; wx += 10) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
      ctx.fillStyle = '#1a1a40';
    }
  },
};

// ---- Theme: ITALIAN BRAINROT TOWER ----

const italianTheme = {
  id: 'italian',
  name: 'ITALIAN BRAINROT TOWER',
  colors: ['#76ff03', '#ff4081', '#00e5ff', '#ffd740', '#b388ff'],
  comboTexts: ['TRALALERO!', 'BOMBARDIRO!', 'MAGNIFICO!', 'BRAINROT!'],
  deathMessages: [
    'the brainrot collapsed',
    'tower of rot: destroyed',
    'even bombardiro couldn\'t save it',
  ],
  accentColor: '#76ff03',

  /**
   * Draw brainrot character silhouettes cycling through characters.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.8;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;

    const charType = index % 5;
    switch (charType) {
      case 0:
        // Tralalero Tralala - shark with legs
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fin
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-5, -18);
        ctx.lineTo(5, -10);
        ctx.fill();
        // Legs
        ctx.fillRect(-10, 8, 3, 8);
        ctx.fillRect(-2, 8, 3, 8);
        ctx.fillRect(7, 8, 3, 8);
        break;
      case 1:
        // Bombardiro Crocodilo - plane/croc
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.fillRect(-6, -4, 12, 2);
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-16, -10);
        ctx.lineTo(-2, -4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6, -4);
        ctx.lineTo(16, -10);
        ctx.lineTo(2, -4);
        ctx.fill();
        break;
      case 2:
        // Tung Tung Tung Sahur - drum-like
        ctx.fillRect(-8, -6, 16, 18);
        // Drumsticks
        ctx.fillRect(-14, -4, 6, 3);
        ctx.fillRect(8, -4, 6, 3);
        // Head
        ctx.beginPath();
        ctx.arc(0, -10, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 3:
        // Ballerina Cappuccina
        ctx.beginPath();
        ctx.arc(0, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Tutu body
        ctx.beginPath();
        ctx.moveTo(-12, 4);
        ctx.lineTo(12, 4);
        ctx.lineTo(4, -2);
        ctx.lineTo(-4, -2);
        ctx.closePath();
        ctx.fill();
        // Legs
        ctx.fillRect(-4, 4, 2, 10);
        ctx.fillRect(2, 4, 2, 10);
        break;
      case 4:
        // Lirili Larila - bird creature
        ctx.beginPath();
        ctx.ellipse(0, 2, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.lineTo(18, 0);
        ctx.lineTo(10, 2);
        ctx.fill();
        // Wings
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-2, -2);
        ctx.fill();
        break;
    }
    ctx.restore();
  },

  /**
   * Draw surreal Italian landscape background.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // Gradient sky - surreal sunset
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0a2e');
    grad.addColorStop(0.3, '#2d1b4e');
    grad.addColorStop(0.6, '#4a1942');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Floating orbs
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 8; i++) {
      const ox = (i * 67 + cameraY * 0.01 * (i % 3 + 1)) % W;
      const oy = ((i * 113 + cameraY * 0.02) % H + H) % H;
      const radius = 15 + (i * 11) % 25;
      const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      orbGrad.addColorStop(0, i % 2 === 0 ? '#ff4081' : '#76ff03');
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Silhouette hills
    ctx.fillStyle = '#12082080';
    ctx.beginPath();
    ctx.moveTo(0, H);
    const hillOffset = (cameraY * 0.04) % 30;
    for (let hx = 0; hx <= W; hx += 20) {
      const hy = H - 60 + Math.sin(hx * 0.02 + hillOffset * 0.01) * 30;
      ctx.lineTo(hx, hy);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  },
};

// ---- Theme: AMONG US STACK ----

const amongUsTheme = {
  id: 'amongus',
  name: 'AMONG US STACK',
  colors: ['#ff1744', '#2979ff', '#00e676', '#ffea00', '#b388ff', '#00e5ff', '#ffffff', '#ff9100'],
  comboTexts: ['NOT SUS!', 'CLEAN!', 'CREWMATE!', 'EMERGENCY!'],
  deathMessages: [
    'sus tower collapse',
    'you were the impostor of stacking',
    'ejected from the tower',
  ],
  accentColor: '#ff1744',

  /**
   * Draw Among Us crewmate bean shape on blocks.
   */
  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const scale = Math.min(width / 200, 1) * 0.7;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';

    // Bean body
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#82b1ff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(5, -4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backpack
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(-11, 4, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-4, 16, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, 16, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw spaceship interior / space background.
   */
  drawBackground(ctx, W, H, cameraY, score) {
    // Deep space gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#000011');
    grad.addColorStop(0.5, '#0a0a2a');
    grad.addColorStop(1, '#000011');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars - more of them, different sizes
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 83.7 + 20) % W;
      const sy = ((i * 59.3 + cameraY * 0.015) % H + H) % H;
      const size = i % 5 === 0 ? 2.5 : (i % 3 === 0 ? 1.5 : 1);
      ctx.globalAlpha = 0.3 + (i % 4) * 0.15;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Space station walls - left
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, 15, H);
    ctx.fillStyle = '#252550';
    ctx.fillRect(15, 0, 3, H);

    // Space station walls - right
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(W - 15, 0, 15, H);
    ctx.fillStyle = '#252550';
    ctx.fillRect(W - 18, 0, 3, H);

    // Wall panel details
    ctx.fillStyle = '#2a2a5a';
    const panelOffset = (cameraY * 0.05) % 80;
    for (let py = -80 + panelOffset; py < H; py += 80) {
      ctx.fillRect(2, py, 10, 2);
      ctx.fillRect(W - 12, py, 10, 2);
    }

    // Red emergency lights
    ctx.globalAlpha = 0.15 + Math.sin(cameraY * 0.01) * 0.1;
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(8, H * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 8, H * 0.7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
};

// ---- Exported theme list ----

export const THEMES = [skibidiTheme, italianTheme, amongUsTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
