/**
 * BRAINROT 2048 -- Theme Definitions
 * Three swappable meme themes: Italian Brainrot, Among Us, Aura.
 * Each theme provides tile names, colors, character draw functions, and death messages.
 */

// ---- Tile tier definitions per theme ----

const ITALIAN_TIERS = {
  2:    { name: 'Tung Tung',           color: '#4a3728' },
  4:    { name: 'Lirili',              color: '#5a4030' },
  8:    { name: 'Spongebobini',        color: '#6b4f2a' },
  16:   { name: 'Bombombini',          color: '#8b6914' },
  32:   { name: 'Cappuccino',          color: '#a67c00' },
  64:   { name: 'La Vaca',             color: '#c89b3c' },
  128:  { name: 'Glorbo',              color: '#e6b800' },
  256:  { name: 'Chimpanzini',         color: '#ffd700' },
  512:  { name: 'Bombardiro',          color: '#ff9800' },
  1024: { name: 'Brr Brr Patapim',    color: '#ff5722' },
  2048: { name: 'Tralalero Tralala',   color: '#c8ff00' },
};

const AMONGUS_TIERS = {
  2:    { name: 'Innocent',            color: '#e0e0e0' },
  4:    { name: 'Nervous',             color: '#c8e6c9' },
  8:    { name: 'Side-Eye',            color: '#fff9c4' },
  16:   { name: 'Hiding',              color: '#ffe082' },
  32:   { name: 'Sweating',            color: '#ffcc02' },
  64:   { name: 'Fake Tasking',        color: '#ffab40' },
  128:  { name: 'Caught Venting',      color: '#ff7043' },
  256:  { name: 'Self-Report',         color: '#ef5350' },
  512:  { name: 'Double Kill',         color: '#e53935' },
  1024: { name: 'Mega Sus',            color: '#c62828' },
  2048: { name: 'THE IMPOSTOR',        color: '#b71c1c' },
};

const AURA_TIERS = {
  2:    { name: 'NPC',                 color: '#666666' },
  4:    { name: 'Background',          color: '#888888' },
  8:    { name: 'Side Character',      color: '#64b5f6' },
  16:   { name: 'Recurring',           color: '#66bb6a' },
  32:   { name: 'Fan Favorite',        color: '#fdd835' },
  64:   { name: 'Protagonist',         color: '#ff9800' },
  128:  { name: 'Main Character',      color: '#ffc107' },
  256:  { name: 'Anime Protag',        color: '#ffd700' },
  512:  { name: 'Chosen One',          color: '#ffffcc' },
  1024: { name: 'Ascended',            color: '#ff69b4' },
  2048: { name: 'GOD-TIER AURA',       color: '#ffffff' },
};

// ---- Character Drawing Functions ----

/**
 * Draw Italian Brainrot character face on a tile.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - Center x of tile
 * @param {number} cy - Center y of tile
 * @param {number} size - Available draw area size
 * @param {number} value - Tile value
 */
function drawItalianChar(ctx, cx, cy, size, value) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy + 2);

  switch (value) {
    case 2: // Tung Tung - drum shape
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(-s * 0.5, -s * 0.3, s, s * 0.7);
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(-s * 0.55, -s * 0.35, s * 1.1, s * 0.12);
      ctx.fillRect(-s * 0.55, s * 0.25, s * 1.1, s * 0.12);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.15, -s * 0.05, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.15, -s * 0.05, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 4: // Lirili - butterfly wings, round head
      ctx.fillStyle = '#e1bee7';
      // Left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.6, -s * 0.4);
      ctx.lineTo(-s * 0.5, s * 0.2);
      ctx.closePath();
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.6, -s * 0.4);
      ctx.lineTo(s * 0.5, s * 0.2);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.fillStyle = '#f8bbd0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.03, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.07, -s * 0.03, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 8: // Spongebobini - yellow square, big eyes, mustache
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7);
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.1, s * 0.1, 0, Math.PI * 2);
      ctx.arc(s * 0.12, -s * 0.1, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.1, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.12, -s * 0.1, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Mustache
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, s * 0.1);
      ctx.quadraticCurveTo(0, s * 0.2, s * 0.2, s * 0.1);
      ctx.stroke();
      break;

    case 16: // Bombombini - goose shape, bomb fuse
      ctx.fillStyle = '#e0e0e0';
      // Body oval
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Neck
      ctx.fillRect(-s * 0.05, -s * 0.3, s * 0.1, s * 0.3);
      // Head
      ctx.beginPath();
      ctx.arc(0, -s * 0.35, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.37);
      ctx.lineTo(s * 0.25, -s * 0.33);
      ctx.lineTo(s * 0.1, -s * 0.3);
      ctx.fill();
      // Fuse on head
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.47);
      ctx.lineTo(s * 0.08, -s * 0.55);
      ctx.stroke();
      // Spark
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.arc(s * 0.08, -s * 0.57, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 32: // Cappuccino Assassino - coffee cup, angry eyes, knife
      ctx.fillStyle = '#8d6e63';
      // Cup body (trapezoid approximation)
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.2);
      ctx.lineTo(-s * 0.2, s * 0.3);
      ctx.lineTo(s * 0.2, s * 0.3);
      ctx.lineTo(s * 0.25, -s * 0.2);
      ctx.closePath();
      ctx.fill();
      // Foam top
      ctx.fillStyle = '#d7ccc8';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.2, s * 0.26, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      // Angry eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(-s * 0.1, 0, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.1, 0, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Knife
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(s * 0.3, s * 0.05);
      ctx.lineTo(s * 0.5, -s * 0.1);
      ctx.stroke();
      break;

    case 64: // La Vaca - cow with Saturn ring
      ctx.fillStyle = '#fff';
      // Body
      ctx.beginPath();
      ctx.ellipse(0, s * 0.05, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Spots
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.12, s * 0.08, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, -s * 0.18);
      ctx.lineTo(-s * 0.18, -s * 0.32);
      ctx.moveTo(s * 0.12, -s * 0.18);
      ctx.lineTo(s * 0.18, -s * 0.32);
      ctx.stroke();
      // Saturn ring
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.05, s * 0.45, s * 0.08, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 128: // Glorbo Fruttodrago - dragon head
      ctx.fillStyle = '#4caf50';
      // Head
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, -s * 0.2);
      ctx.lineTo(-s * 0.1, -s * 0.42);
      ctx.lineTo(-s * 0.05, -s * 0.2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.05, -s * 0.2);
      ctx.lineTo(s * 0.1, -s * 0.42);
      ctx.lineTo(s * 0.15, -s * 0.2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.03, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.03, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.03, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.03, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Flame
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, s * 0.22);
      ctx.quadraticCurveTo(0, s * 0.45, s * 0.05, s * 0.22);
      ctx.fill();
      break;

    case 256: // Chimpanzini - monkey face, banana on head
      ctx.fillStyle = '#8d6e63';
      // Face
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Lighter face area
      ctx.fillStyle = '#d7ccc8';
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.arc(-s * 0.28, 0, s * 0.08, 0, Math.PI * 2);
      ctx.arc(s * 0.28, 0, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Banana on head
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.28);
      ctx.quadraticCurveTo(0, -s * 0.5, s * 0.15, -s * 0.32);
      ctx.quadraticCurveTo(0, -s * 0.4, -s * 0.1, -s * 0.28);
      ctx.fill();
      break;

    case 512: // Bombardiro Crocodilo - croc snout, airplane wings
      ctx.fillStyle = '#4caf50';
      // Snout (long rect)
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.35, s * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      // Darker jaw line
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(-s * 0.33, s * 0.02);
      ctx.lineTo(s * 0.33, s * 0.02);
      ctx.stroke();
      // Eyes on top
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.12, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.12, -s * 0.12, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.12, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.12, -s * 0.12, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, -s * 0.05);
      ctx.lineTo(-s * 0.5, -s * 0.25);
      ctx.lineTo(-s * 0.1, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.05);
      ctx.lineTo(s * 0.5, -s * 0.25);
      ctx.lineTo(s * 0.1, s * 0.02);
      ctx.fill();
      break;

    case 1024: // Brr Brr Patapim - refrigerator with legs and face
      ctx.fillStyle = '#b0bec5';
      // Fridge body
      ctx.fillRect(-s * 0.2, -s * 0.35, s * 0.4, s * 0.55);
      // Door line
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.05);
      ctx.lineTo(s * 0.18, -s * 0.05);
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(s * 0.12, -s * 0.25, s * 0.03, s * 0.12);
      // Face
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.2, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.07, -s * 0.2, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Mouth
      ctx.beginPath();
      ctx.arc(0, -s * 0.12, s * 0.05, 0, Math.PI);
      ctx.stroke();
      // Legs
      ctx.fillStyle = '#795548';
      ctx.fillRect(-s * 0.15, s * 0.2, s * 0.08, s * 0.15);
      ctx.fillRect(s * 0.07, s * 0.2, s * 0.08, s * 0.15);
      break;

    case 2048: // Tralalero Tralala - shark fin, muscular arms, sneakers
      ctx.fillStyle = '#607d8b';
      // Body
      ctx.beginPath();
      ctx.ellipse(0, s * 0.05, s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fin
      ctx.fillStyle = '#455a64';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.15);
      ctx.lineTo(-s * 0.06, -s * 0.4);
      ctx.lineTo(s * 0.06, -s * 0.15);
      ctx.fill();
      // Arms (muscular rectangles)
      ctx.fillStyle = '#ffcc80';
      ctx.fillRect(-s * 0.45, -s * 0.05, s * 0.2, s * 0.1);
      ctx.fillRect(s * 0.25, -s * 0.05, s * 0.2, s * 0.1);
      // Sneakers
      ctx.fillStyle = '#f44336';
      ctx.fillRect(-s * 0.18, s * 0.22, s * 0.14, s * 0.08);
      ctx.fillRect(s * 0.05, s * 0.22, s * 0.14, s * 0.08);
      // White stripe on sneakers
      ctx.fillStyle = '#fff';
      ctx.fillRect(-s * 0.16, s * 0.25, s * 0.1, s * 0.02);
      ctx.fillRect(s * 0.07, s * 0.25, s * 0.1, s * 0.02);
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.08, 0, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.08, 0, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, 0, s * 0.025, 0, Math.PI * 2);
      ctx.arc(s * 0.08, 0, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      // Tiles > 2048: show a star
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${s * 0.5}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('*', 0, 0);
      break;
  }

  ctx.restore();
}

/**
 * Draw Among Us crewmate on a tile.
 */
function drawAmongUsChar(ctx, cx, cy, size, value) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy + 2);

  const tier = AMONGUS_TIERS[value] || AMONGUS_TIERS[2];
  const bodyColor = tier.color;

  // Bean body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.22, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Backpack bump
  ctx.beginPath();
  ctx.ellipse(-s * 0.24, s * 0.08, s * 0.07, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = '#82b1ff';
  ctx.beginPath();
  ctx.ellipse(s * 0.06, -s * 0.08, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Visor shine
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(s * 0.1, -s * 0.12, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(-s * 0.08, s * 0.35, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 0.08, s * 0.35, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Per-tier details
  if (value >= 4 && value <= 8) {
    // Sweat drop
    ctx.fillStyle = '#64b5f6';
    ctx.beginPath();
    ctx.arc(s * 0.22, -s * 0.15, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  if (value === 8) {
    // Side-eye: shift visor highlight
    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.arc(s * 0.12, -s * 0.08, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  if (value === 16) {
    // Vent rectangle below
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-s * 0.3, s * 0.18, s * 0.15, s * 0.1);
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = s * 0.02;
    ctx.strokeRect(-s * 0.3, s * 0.18, s * 0.15, s * 0.1);
  }
  if (value >= 32 && value < 128) {
    // Multiple sweat drops
    ctx.fillStyle = '#64b5f6';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(s * (0.2 + i * 0.06), -s * (0.18 - i * 0.06), s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (value === 128) {
    // Exclamation mark
    ctx.fillStyle = '#ff1744';
    ctx.font = `bold ${s * 0.35}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', s * 0.3, -s * 0.25);
  }
  if (value === 256) {
    // Dead bean next to it (X eyes)
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.ellipse(s * 0.35, s * 0.15, s * 0.08, s * 0.1, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.moveTo(s * 0.32, s * 0.1);
    ctx.lineTo(s * 0.38, s * 0.16);
    ctx.moveTo(s * 0.38, s * 0.1);
    ctx.lineTo(s * 0.32, s * 0.16);
    ctx.stroke();
  }
  if (value >= 512) {
    // Knife shape
    ctx.fillStyle = '#bdbdbd';
    ctx.beginPath();
    ctx.moveTo(s * 0.25, -s * 0.15);
    ctx.lineTo(s * 0.45, -s * 0.25);
    ctx.lineTo(s * 0.42, -s * 0.12);
    ctx.closePath();
    ctx.fill();
    // Handle
    ctx.fillStyle = '#795548';
    ctx.fillRect(s * 0.2, -s * 0.17, s * 0.08, s * 0.06);
  }
  if (value >= 1024) {
    // Glowing red eyes
    ctx.fillStyle = '#ff1744';
    ctx.shadowColor = '#ff1744';
    ctx.shadowBlur = s * 0.15;
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.1, s * 0.035, 0, Math.PI * 2);
    ctx.arc(s * 0.12, -s * 0.1, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  if (value === 2048) {
    // SUS text floating
    ctx.fillStyle = '#ff1744';
    ctx.font = `bold ${s * 0.2}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SUS', 0, -s * 0.4);
  }

  ctx.restore();
}

/**
 * Draw Aura circle/glow on a tile.
 */
function drawAuraChar(ctx, cx, cy, size, value, animFrame) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy);

  const tier = AURA_TIERS[value] || AURA_TIERS[2];
  const tierColor = tier.color;
  const tierIndex = Math.log2(value) - 1; // 1 for 2, 2 for 4, ... 11 for 2048
  const numRings = Math.min(Math.floor(tierIndex / 2), 5);

  // Outer glow for higher tiers
  if (tierIndex >= 4) {
    const glowRadius = s * (0.3 + tierIndex * 0.02);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, tierColor);
    glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.2 + tierIndex * 0.03;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Rings
  for (let i = 0; i < numRings; i++) {
    const ringRadius = s * (0.25 + i * 0.08);
    ctx.strokeStyle = tierColor;
    ctx.globalAlpha = 0.3 - i * 0.04;
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Rainbow cycling for 1024+
  if (value >= 1024) {
    const t = (animFrame || 0) * 0.02;
    const hue = (t * 60) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Core circle
  ctx.fillStyle = tierColor;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(-s * 0.05, -s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Radial lines for high tiers (128+)
  if (tierIndex >= 7) {
    const lineCount = Math.min(tierIndex - 4, 12);
    ctx.strokeStyle = tierColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = s * 0.02;
    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 / lineCount) * i + (animFrame || 0) * 0.005;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * s * 0.22, Math.sin(angle) * s * 0.22);
      ctx.lineTo(Math.cos(angle) * s * 0.38, Math.sin(angle) * s * 0.38);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Sparkles for Fan Favorite (32+)
  if (tierIndex >= 5 && tierIndex < 7) {
    ctx.fillStyle = '#fff';
    const sparkCount = 4;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 / sparkCount) * i + (animFrame || 0) * 0.01;
      const dist = s * 0.32;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(sx, sy, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2048: rainbow burst particle ring
  if (value === 2048) {
    const burstCount = 16;
    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 / burstCount) * i + (animFrame || 0) * 0.008;
      const dist = s * 0.4 + Math.sin((animFrame || 0) * 0.03 + i) * s * 0.05;
      const hue = (i * (360 / burstCount) + (animFrame || 0) * 0.5) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ---- Theme Definitions ----

const italianTheme = {
  id: 'italian',
  name: 'ITALIAN BRAINROT 2048',
  scoreLabel: 'BRAINROT LEVEL',
  tiers: ITALIAN_TIERS,
  bgColor: '#0d1117',
  boardBgColor: '#1a1a2e',
  cellEmptyColor: '#2a2a3e',
  textColor: '#f0f0f0',
  accentColor: '#c8ff00',
  deathMessages: [
    'the brainrot consumed all available brain cells.',
    'no more room for characters. the lore is complete.',
    'your brainrot universe collapsed under its own weight.',
    'even tralalero couldn\'t save this board.',
    'game over. touch grass. (you won\'t.)',
  ],
  drawChar: drawItalianChar,
};

const amongUsTheme = {
  id: 'amongus',
  name: 'AMONG US 2048',
  scoreLabel: 'SUS LEVEL',
  tiers: AMONGUS_TIERS,
  bgColor: '#0a0a1a',
  boardBgColor: '#1a1a2a',
  cellEmptyColor: '#252535',
  textColor: '#f0f0f0',
  accentColor: '#ef5350',
  deathMessages: [
    'emergency meeting! your board is dead.',
    'you were the impostor of puzzle games.',
    'ejected. no more moves remaining.',
    'the crewmates voted you out. 0 moves left.',
    'sus level maxed. brain capacity zero.',
  ],
  drawChar: drawAmongUsChar,
};

const auraTheme = {
  id: 'aura',
  name: 'AURA 2048',
  scoreLabel: 'AURA',
  tiers: AURA_TIERS,
  bgColor: '#0a0a0a',
  boardBgColor: '#111111',
  cellEmptyColor: '#1a1a1a',
  textColor: '#f0f0f0',
  accentColor: '#ffd700',
  deathMessages: [
    'aura depleted. you are now an npc.',
    'negative aura detected. seek grass immediately.',
    'the aura grid collapsed. main character arc over.',
    'your rizz could not save your spatial reasoning.',
    'aura check failed. back to background character.',
  ],
  drawChar: drawAuraChar,
};

// ---- Exports ----

export const THEMES = [italianTheme, amongUsTheme, auraTheme];

/**
 * Get a theme by id.
 *
 * @param {string} id
 * @returns {Object} theme definition
 */
export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/**
 * Get the tile color for a given value in a theme.
 *
 * @param {Object} theme
 * @param {number} value
 * @returns {string} hex color
 */
export function getTileColor(theme, value) {
  const tier = theme.tiers[value];
  if (tier) return tier.color;
  // For values > 2048, use the 2048 color
  return theme.tiers[2048]?.color || theme.accentColor;
}

/**
 * Get the tile name for a given value in a theme.
 *
 * @param {Object} theme
 * @param {number} value
 * @returns {string}
 */
export function getTileName(theme, value) {
  const tier = theme.tiers[value];
  if (tier) return tier.name;
  return String(value);
}
