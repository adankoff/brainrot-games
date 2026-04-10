/**
 * MEME 2048 -- Theme Definitions
 * Three swappable meme themes: Classic Memes, Cat Memes, Gaming Memes.
 * Each theme provides tile names, colors, character draw functions, and death messages.
 */

// ---- Tile tier definitions per theme ----

const CLASSIC_TIERS = {
  2:    { name: 'Trollface',          color: '#b0b0b0' },
  4:    { name: 'Forever Alone',      color: '#c8c8c8' },
  8:    { name: 'Me Gusta',           color: '#d4c890' },
  16:   { name: 'Rage Guy',           color: '#e8c060' },
  32:   { name: 'Doge',               color: '#e8d44d' },
  64:   { name: 'Nyan Cat',           color: '#d4a830' },
  128:  { name: 'Harambe',            color: '#90c870' },
  256:  { name: 'Big Chungus',        color: '#70b850' },
  512:  { name: 'Ugandan Knuckles',   color: '#e05040' },
  1024: { name: 'Pepe',               color: '#50a850' },
  2048: { name: 'Rickroll',           color: '#ff6030' },
};

const CAT_TIERS = {
  2:    { name: 'Ceiling Cat',        color: '#ffe0e0' },
  4:    { name: 'Keyboard Cat',       color: '#ffd0b0' },
  8:    { name: 'Grumpy Cat',         color: '#e0c0d0' },
  16:   { name: 'Nyan Cat',           color: '#ffc0e0' },
  32:   { name: 'Pusheen',            color: '#d0b8e0' },
  64:   { name: 'Bongo Cat',          color: '#c0e0f0' },
  128:  { name: 'Smudge',             color: '#b0e0c0' },
  256:  { name: 'Maxwell Cat',        color: '#e0d080' },
  512:  { name: 'Popcat',             color: '#f0b0b0' },
  1024: { name: 'Longcat',            color: '#e0a0f0' },
  2048: { name: 'Hacker Cat',         color: '#a0f0a0' },
};

const GAMING_TIERS = {
  2:    { name: 'Creeper',            color: '#2a6e2a' },
  4:    { name: 'Press F',            color: '#3a3a4a' },
  8:    { name: 'Pac-Man',            color: '#c8c820' },
  16:   { name: 'You Died',           color: '#8a1010' },
  32:   { name: 'Surprised Pikachu',  color: '#c8a820' },
  64:   { name: 'Loss',               color: '#2a3a5a' },
  128:  { name: 'Steve',              color: '#6a5030' },
  256:  { name: 'Master Chief',       color: '#3a7a3a' },
  512:  { name: 'Sans',               color: '#2a2a5a' },
  1024: { name: 'GTA Wasted',         color: '#5a2a6a' },
  2048: { name: 'Elden Ring Crown',   color: '#b8a020' },
};

// ---- Character Drawing Functions ----

/**
 * Draw Classic Meme character on a tile.
 */
function drawClassicChar(ctx, cx, cy, size, value) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy + 2);

  switch (value) {
    case 2: // Trollface - circle with wide grin
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.06, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.06, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Wide grin
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(0, s * 0.02, s * 0.16, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;

    case 4: // Forever Alone - circle with frown and tear
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Sad eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Frown
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(0, s * 0.18, s * 0.1, Math.PI + 0.3, -0.3);
      ctx.stroke();
      // Tear
      ctx.fillStyle = '#64b5f6';
      ctx.beginPath();
      ctx.arc(s * 0.16, s * 0.02, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 8: // Me Gusta - squiggly face
      ctx.fillStyle = '#f0e0d0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Squinty eyes
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.06);
      ctx.lineTo(-s * 0.04, -s * 0.04);
      ctx.moveTo(s * 0.04, -s * 0.04);
      ctx.lineTo(s * 0.16, -s * 0.06);
      ctx.stroke();
      // Wavy mouth
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, s * 0.1);
      ctx.quadraticCurveTo(-s * 0.06, s * 0.16, 0, s * 0.1);
      ctx.quadraticCurveTo(s * 0.06, s * 0.04, s * 0.12, s * 0.1);
      ctx.stroke();
      break;

    case 16: // Rage Guy - red face, wide open mouth
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Angry eyes (V-shaped brows)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.12);
      ctx.lineTo(-s * 0.06, -s * 0.04);
      ctx.moveTo(s * 0.06, -s * 0.04);
      ctx.lineTo(s * 0.18, -s * 0.12);
      ctx.stroke();
      // Wide open mouth
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 32: // Doge - tan circle with ears
      ctx.fillStyle = '#d4a060';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#c08840';
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.18);
      ctx.lineTo(-s * 0.3, -s * 0.4);
      ctx.lineTo(-s * 0.08, -s * 0.2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.18);
      ctx.lineTo(s * 0.3, -s * 0.4);
      ctx.lineTo(s * 0.08, -s * 0.2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.02, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.02, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Mouth
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.09);
      ctx.lineTo(-s * 0.06, s * 0.14);
      ctx.moveTo(0, s * 0.09);
      ctx.lineTo(s * 0.06, s * 0.14);
      ctx.stroke();
      break;

    case 64: // Nyan Cat - pink rectangle body, cat face
      ctx.fillStyle = '#ff90b0';
      ctx.fillRect(-s * 0.25, -s * 0.15, s * 0.5, s * 0.3);
      // Cat face
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.arc(s * 0.2, 0, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Cat ears
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.08);
      ctx.lineTo(s * 0.12, -s * 0.2);
      ctx.lineTo(s * 0.2, -s * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.24, -s * 0.1);
      ctx.lineTo(s * 0.28, -s * 0.2);
      ctx.lineTo(s * 0.3, -s * 0.08);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(s * 0.17, -s * 0.02, s * 0.02, 0, Math.PI * 2);
      ctx.arc(s * 0.25, -s * 0.02, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // Rainbow trail
      const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(-s * 0.45, -s * 0.15 + i * s * 0.05, s * 0.2, s * 0.05);
      }
      break;

    case 128: // Harambe - dark circle, gorilla face
      ctx.fillStyle = '#4a3520';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Lighter face area
      ctx.fillStyle = '#6a5540';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.05, s * 0.16, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Nostrils
      ctx.beginPath();
      ctx.arc(-s * 0.04, s * 0.06, s * 0.025, 0, Math.PI * 2);
      ctx.arc(s * 0.04, s * 0.06, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Halo
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.32, s * 0.18, s * 0.06, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 256: // Big Chungus - large fat circle
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.02, s * 0.32, s * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      // Belly
      ctx.fillStyle = '#d0d0d0';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.2, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.ellipse(-s * 0.14, -s * 0.34, s * 0.06, s * 0.14, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.14, -s * 0.34, s * 0.06, s * 0.14, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#ff8080';
      ctx.beginPath();
      ctx.arc(0, s * 0.0, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 512: // Ugandan Knuckles - red circle with snout
      ctx.fillStyle = '#cc2200';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Snout
      ctx.fillStyle = '#e06040';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.06, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes (white with black pupils)
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.06, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.06, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Nostrils
      ctx.beginPath();
      ctx.arc(-s * 0.04, s * 0.06, s * 0.02, 0, Math.PI * 2);
      ctx.arc(s * 0.04, s * 0.06, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 1024: // Pepe - green circle with frown
      ctx.fillStyle = '#4a8a3a';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Big white eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, -s * 0.06, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
      ctx.ellipse(s * 0.1, -s * 0.06, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.05, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.05, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Frown
      ctx.strokeStyle = '#2a5a1a';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.arc(0, s * 0.2, s * 0.12, Math.PI + 0.4, -0.4);
      ctx.stroke();
      break;

    case 2048: // Rickroll - orange hair, microphone
      ctx.fillStyle = '#f0c8a0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Orange hair
      ctx.fillStyle = '#e06020';
      ctx.beginPath();
      ctx.arc(0, -s * 0.08, s * 0.26, Math.PI + 0.3, -0.3);
      ctx.fill();
      // Hair poof on top
      ctx.beginPath();
      ctx.arc(0, -s * 0.28, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.arc(0, s * 0.04, s * 0.08, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // Microphone
      ctx.fillStyle = '#333';
      ctx.fillRect(s * 0.28, -s * 0.1, s * 0.04, s * 0.25);
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(s * 0.3, -s * 0.12, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
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
 * Draw Cat Meme character on a tile.
 */
function drawCatChar(ctx, cx, cy, size, value) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy + 2);

  switch (value) {
    case 2: // Ceiling Cat - white circle, peeking from top edge
      ctx.fillStyle = '#f0e8d8';
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#e0d0b0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.12);
      ctx.lineTo(-s * 0.22, -s * 0.32);
      ctx.lineTo(-s * 0.06, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.16, -s * 0.12);
      ctx.lineTo(s * 0.22, -s * 0.32);
      ctx.lineTo(s * 0.06, -s * 0.16);
      ctx.fill();
      // Eyes (peeking down)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, 0, s * 0.04, 0, Math.PI * 2);
      ctx.arc(s * 0.08, 0, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Ceiling line above
      ctx.strokeStyle = '#8a7a60';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.38);
      ctx.lineTo(s * 0.4, -s * 0.38);
      ctx.stroke();
      break;

    case 4: // Keyboard Cat - orange cat with keyboard
      ctx.fillStyle = '#e8a040';
      ctx.beginPath();
      ctx.arc(0, -s * 0.05, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#d08020';
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.12);
      ctx.lineTo(-s * 0.18, -s * 0.28);
      ctx.lineTo(-s * 0.04, -s * 0.14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.12);
      ctx.lineTo(s * 0.18, -s * 0.28);
      ctx.lineTo(s * 0.04, -s * 0.14);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.07, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Keyboard
      ctx.fillStyle = '#444';
      ctx.fillRect(-s * 0.25, s * 0.12, s * 0.5, s * 0.12);
      // Keys
      ctx.fillStyle = '#aaa';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-s * 0.22 + i * s * 0.1, s * 0.14, s * 0.06, s * 0.06);
      }
      break;

    case 8: // Grumpy Cat - gray circle with frown
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Darker markings
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.arc(0, -s * 0.08, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.14);
      ctx.lineTo(-s * 0.2, -s * 0.32);
      ctx.lineTo(-s * 0.06, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.16, -s * 0.14);
      ctx.lineTo(s * 0.2, -s * 0.32);
      ctx.lineTo(s * 0.06, -s * 0.16);
      ctx.fill();
      // Angry eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a90c8';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.04, s * 0.025, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.04, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Frown
      ctx.strokeStyle = '#555';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(0, s * 0.18, s * 0.08, Math.PI + 0.3, -0.3);
      ctx.stroke();
      break;

    case 16: // Nyan Cat - pink rect + rainbow
      ctx.fillStyle = '#ff90b0';
      ctx.fillRect(-s * 0.2, -s * 0.12, s * 0.4, s * 0.24);
      // Cat head
      ctx.fillStyle = '#b0b0b0';
      ctx.beginPath();
      ctx.arc(s * 0.16, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.06);
      ctx.lineTo(s * 0.1, -s * 0.16);
      ctx.lineTo(s * 0.16, -s * 0.08);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.08);
      ctx.lineTo(s * 0.22, -s * 0.16);
      ctx.lineTo(s * 0.26, -s * 0.06);
      ctx.fill();
      // Cat eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(s * 0.13, -s * 0.02, s * 0.015, 0, Math.PI * 2);
      ctx.arc(s * 0.2, -s * 0.02, s * 0.015, 0, Math.PI * 2);
      ctx.fill();
      // Rainbow
      const rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = rainbowColors[i];
        ctx.fillRect(-s * 0.4, -s * 0.12 + i * s * 0.04, s * 0.2, s * 0.04);
      }
      break;

    case 32: // Pusheen - gray round chonk
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.02, s * 0.28, s * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.14);
      ctx.lineTo(-s * 0.22, -s * 0.3);
      ctx.lineTo(-s * 0.1, -s * 0.18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.18, -s * 0.14);
      ctx.lineTo(s * 0.22, -s * 0.3);
      ctx.lineTo(s * 0.1, -s * 0.18);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Whiskers
      ctx.strokeStyle = '#555';
      ctx.lineWidth = s * 0.015;
      ctx.beginPath();
      ctx.moveTo(-s * 0.28, s * 0.02);
      ctx.lineTo(-s * 0.12, s * 0.04);
      ctx.moveTo(-s * 0.26, s * 0.08);
      ctx.lineTo(-s * 0.12, s * 0.06);
      ctx.moveTo(s * 0.12, s * 0.04);
      ctx.lineTo(s * 0.28, s * 0.02);
      ctx.moveTo(s * 0.12, s * 0.06);
      ctx.lineTo(s * 0.26, s * 0.08);
      ctx.stroke();
      // Stripes on back
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = s * 0.03;
      for (let i = 0; i < 3; i++) {
        const xOff = -s * 0.06 + i * s * 0.08;
        ctx.beginPath();
        ctx.moveTo(xOff, -s * 0.16);
        ctx.lineTo(xOff, -s * 0.08);
        ctx.stroke();
      }
      break;

    case 64: // Bongo Cat - white circle + paws hitting
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, -s * 0.05, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.14);
      ctx.lineTo(-s * 0.18, -s * 0.28);
      ctx.lineTo(-s * 0.06, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.14);
      ctx.lineTo(s * 0.18, -s * 0.28);
      ctx.lineTo(s * 0.06, -s * 0.16);
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#ffb0b0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, -s * 0.14);
      ctx.lineTo(-s * 0.16, -s * 0.24);
      ctx.lineTo(-s * 0.08, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.12, -s * 0.14);
      ctx.lineTo(s * 0.16, -s * 0.24);
      ctx.lineTo(s * 0.08, -s * 0.16);
      ctx.fill();
      // Eyes (closed/happy)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.04, s * 0.03, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.07, -s * 0.04, s * 0.03, 0, Math.PI);
      ctx.stroke();
      // Paws (circles below)
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(-s * 0.14, s * 0.16, s * 0.08, 0, Math.PI * 2);
      ctx.arc(s * 0.14, s * 0.16, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 128: // Smudge - white cat at table
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, -s * 0.06, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#e0d0c0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.14);
      ctx.lineTo(-s * 0.18, -s * 0.28);
      ctx.lineTo(-s * 0.06, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.14);
      ctx.lineTo(s * 0.18, -s * 0.28);
      ctx.lineTo(s * 0.06, -s * 0.16);
      ctx.fill();
      // Confused eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.07, -s * 0.06, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Table
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(-s * 0.35, s * 0.1, s * 0.7, s * 0.06);
      // Plate
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(-s * 0.15, s * 0.08, s * 0.1, s * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 256: // Maxwell Cat - spinning (motion lines)
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#c0c0c0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.12);
      ctx.lineTo(-s * 0.18, -s * 0.28);
      ctx.lineTo(-s * 0.06, -s * 0.14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.12);
      ctx.lineTo(s * 0.18, -s * 0.28);
      ctx.lineTo(s * 0.06, -s * 0.14);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.07, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.arc(s * 0.07, -s * 0.04, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Spin lines around
      ctx.strokeStyle = '#888';
      ctx.lineWidth = s * 0.02;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * s * 0.28, Math.sin(angle) * s * 0.28);
        ctx.lineTo(Math.cos(angle) * s * 0.36, Math.sin(angle) * s * 0.36);
        ctx.stroke();
      }
      break;

    case 512: // Popcat - white cat, open mouth
      ctx.fillStyle = '#f0e8d8';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#e0d0b8';
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.14);
      ctx.lineTo(-s * 0.2, -s * 0.3);
      ctx.lineTo(-s * 0.06, -s * 0.16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.16, -s * 0.14);
      ctx.lineTo(s * 0.2, -s * 0.3);
      ctx.lineTo(s * 0.06, -s * 0.16);
      ctx.fill();
      // Eyes (wide open)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.06, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.06, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.06, -s * 0.08, s * 0.02, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.08, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // WIDE open mouth (big O)
      ctx.fillStyle = '#cc3333';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#880000';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.12, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 1024: // Longcat - very tall oval
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.14, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#e0d0c0';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.32);
      ctx.lineTo(-s * 0.14, -s * 0.44);
      ctx.lineTo(-s * 0.04, -s * 0.34);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.32);
      ctx.lineTo(s * 0.14, -s * 0.44);
      ctx.lineTo(s * 0.04, -s * 0.34);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.05, -s * 0.28, s * 0.025, 0, Math.PI * 2);
      ctx.arc(s * 0.05, -s * 0.28, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Paws at bottom
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(-s * 0.08, s * 0.38, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.08, s * 0.38, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 2048: // Hacker Cat - cat with laptop + sunglasses
      ctx.fillStyle = '#505050';
      ctx.beginPath();
      ctx.arc(0, -s * 0.06, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.16);
      ctx.lineTo(-s * 0.2, -s * 0.32);
      ctx.lineTo(-s * 0.06, -s * 0.18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.14, -s * 0.16);
      ctx.lineTo(s * 0.2, -s * 0.32);
      ctx.lineTo(s * 0.06, -s * 0.18);
      ctx.fill();
      // Sunglasses
      ctx.fillStyle = '#111';
      ctx.fillRect(-s * 0.18, -s * 0.12, s * 0.14, s * 0.08);
      ctx.fillRect(s * 0.04, -s * 0.12, s * 0.14, s * 0.08);
      ctx.fillRect(-s * 0.04, -s * 0.1, s * 0.08, s * 0.03);
      // Sunglasses glint
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(-s * 0.14, -s * 0.11, s * 0.04, s * 0.02);
      ctx.fillRect(s * 0.08, -s * 0.11, s * 0.04, s * 0.02);
      // Laptop
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(-s * 0.22, s * 0.1, s * 0.44, s * 0.06);
      // Screen
      ctx.fillStyle = '#40ff40';
      ctx.fillRect(-s * 0.18, s * 0.02, s * 0.36, s * 0.08);
      // Code lines on screen
      ctx.fillStyle = '#208020';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(-s * 0.14, s * 0.035 + i * s * 0.02, s * (0.12 + i * 0.05), s * 0.01);
      }
      break;

    default:
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
 * Draw Gaming Meme character on a tile.
 */
function drawGamingChar(ctx, cx, cy, size, value) {
  const s = size * 0.35;
  ctx.save();
  ctx.translate(cx, cy + 2);

  switch (value) {
    case 2: // Creeper face - green square + pixel face
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56);
      // Pixel eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(-s * 0.2, -s * 0.16, s * 0.12, s * 0.12);
      ctx.fillRect(s * 0.08, -s * 0.16, s * 0.12, s * 0.12);
      // Pixel mouth
      ctx.fillRect(-s * 0.08, -s * 0.02, s * 0.16, s * 0.06);
      ctx.fillRect(-s * 0.14, s * 0.04, s * 0.08, s * 0.1);
      ctx.fillRect(s * 0.06, s * 0.04, s * 0.08, s * 0.1);
      break;

    case 4: // Press F - gray key cap
      ctx.fillStyle = '#555';
      roundRectHelper(ctx, -s * 0.24, -s * 0.24, s * 0.48, s * 0.48, s * 0.06);
      ctx.fill();
      // Key top face
      ctx.fillStyle = '#777';
      roundRectHelper(ctx, -s * 0.2, -s * 0.22, s * 0.4, s * 0.38, s * 0.04);
      ctx.fill();
      // F letter
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${s * 0.4}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', 0, -s * 0.02);
      break;

    case 8: // Pac-Man - yellow circle with mouth
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0.3, Math.PI * 2 - 0.3);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(s * 0.04, -s * 0.12, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Dots in front
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s * 0.35, 0, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.44, 0, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 16: // You Died - red text on black bg
      ctx.fillStyle = '#1a0000';
      ctx.fillRect(-s * 0.3, -s * 0.2, s * 0.6, s * 0.4);
      // YOU DIED text
      ctx.fillStyle = '#cc0000';
      ctx.font = `bold ${s * 0.14}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU', 0, -s * 0.06);
      ctx.fillText('DIED', 0, s * 0.08);
      break;

    case 32: // Surprised Pikachu - yellow circle, open mouth
      ctx.fillStyle = '#ffd830';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Ears (pointed)
      ctx.fillStyle = '#ffd830';
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.14);
      ctx.lineTo(-s * 0.26, -s * 0.38);
      ctx.lineTo(-s * 0.06, -s * 0.18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.16, -s * 0.14);
      ctx.lineTo(s * 0.26, -s * 0.38);
      ctx.lineTo(s * 0.06, -s * 0.18);
      ctx.fill();
      // Ear tips black
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-s * 0.22, -s * 0.32);
      ctx.lineTo(-s * 0.26, -s * 0.38);
      ctx.lineTo(-s * 0.18, -s * 0.3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.22, -s * 0.32);
      ctx.lineTo(s * 0.26, -s * 0.38);
      ctx.lineTo(s * 0.18, -s * 0.3);
      ctx.fill();
      // Eyes (wide circles)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-s * 0.08, -s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.06, -s * 0.06, s * 0.02, 0, Math.PI * 2);
      ctx.arc(s * 0.1, -s * 0.06, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      // Red cheeks
      ctx.fillStyle = '#ff4444';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(-s * 0.16, s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.arc(s * 0.16, s * 0.04, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Open mouth (O shape)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.1, s * 0.06, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 64: // Loss - 4 panels with stick figures
      ctx.strokeStyle = '#888';
      ctx.lineWidth = s * 0.02;
      // 4 panel border
      ctx.strokeRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.28);
      ctx.lineTo(0, s * 0.28);
      ctx.moveTo(-s * 0.28, 0);
      ctx.lineTo(s * 0.28, 0);
      ctx.stroke();
      // Panel 1: | (standing)
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.22);
      ctx.lineTo(-s * 0.14, -s * 0.04);
      ctx.stroke();
      // Panel 2: | | (two standing)
      ctx.beginPath();
      ctx.moveTo(s * 0.08, -s * 0.22);
      ctx.lineTo(s * 0.08, -s * 0.04);
      ctx.moveTo(s * 0.18, -s * 0.22);
      ctx.lineTo(s * 0.18, -s * 0.04);
      ctx.stroke();
      // Panel 3: || (two standing close)
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, s * 0.04);
      ctx.lineTo(-s * 0.16, s * 0.22);
      ctx.moveTo(-s * 0.1, s * 0.04);
      ctx.lineTo(-s * 0.1, s * 0.22);
      ctx.stroke();
      // Panel 4: |_ (one standing, one lying)
      ctx.beginPath();
      ctx.moveTo(s * 0.08, s * 0.04);
      ctx.lineTo(s * 0.08, s * 0.22);
      ctx.moveTo(s * 0.12, s * 0.18);
      ctx.lineTo(s * 0.24, s * 0.18);
      ctx.stroke();
      break;

    case 128: // Steve (Minecraft) - brown square + pixel face
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(-s * 0.24, -s * 0.28, s * 0.48, s * 0.56);
      // Hair
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(-s * 0.24, -s * 0.28, s * 0.48, s * 0.16);
      // Skin
      ctx.fillStyle = '#c69c6d';
      ctx.fillRect(-s * 0.2, -s * 0.12, s * 0.4, s * 0.28);
      // Eyes (pixel)
      ctx.fillStyle = '#fff';
      ctx.fillRect(-s * 0.16, -s * 0.08, s * 0.1, s * 0.06);
      ctx.fillRect(s * 0.06, -s * 0.08, s * 0.1, s * 0.06);
      ctx.fillStyle = '#3a2a6a';
      ctx.fillRect(-s * 0.12, -s * 0.08, s * 0.06, s * 0.06);
      ctx.fillRect(s * 0.06, -s * 0.08, s * 0.06, s * 0.06);
      // Nose
      ctx.fillStyle = '#a07848';
      ctx.fillRect(-s * 0.04, s * 0.0, s * 0.08, s * 0.06);
      // Mouth
      ctx.fillStyle = '#6a4a30';
      ctx.fillRect(-s * 0.08, s * 0.08, s * 0.16, s * 0.04);
      break;

    case 256: // Master Chief - green helmet visor
      ctx.fillStyle = '#4a7a3a';
      // Helmet shape
      roundRectHelper(ctx, -s * 0.24, -s * 0.3, s * 0.48, s * 0.54, s * 0.1);
      ctx.fill();
      // Visor (golden)
      ctx.fillStyle = '#d4a020';
      roundRectHelper(ctx, -s * 0.18, -s * 0.1, s * 0.36, s * 0.14, s * 0.04);
      ctx.fill();
      // Visor shine
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(-s * 0.14, -s * 0.08, s * 0.1, s * 0.04);
      // Chin guard
      ctx.fillStyle = '#3a6a2a';
      ctx.fillRect(-s * 0.14, s * 0.08, s * 0.28, s * 0.08);
      // Center ridge
      ctx.strokeStyle = '#5a8a4a';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(0, -s * 0.12);
      ctx.stroke();
      break;

    case 512: // Sans - white circle, blue glowing eye
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.26, 0, Math.PI * 2);
      ctx.fill();
      // Dark eye sockets
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, -s * 0.04, s * 0.06, s * 0.07, 0, 0, Math.PI * 2);
      ctx.ellipse(s * 0.1, -s * 0.04, s * 0.06, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Left eye: blue glow
      ctx.fillStyle = '#44bbff';
      ctx.shadowColor = '#44bbff';
      ctx.shadowBlur = s * 0.12;
      ctx.beginPath();
      ctx.arc(-s * 0.1, -s * 0.04, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Right eye: white dot
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s * 0.1, -s * 0.04, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Grin
      ctx.strokeStyle = '#222';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(0, s * 0.08, s * 0.14, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;

    case 1024: // GTA Wasted - purple tint, WASTED text
      ctx.fillStyle = '#2a1030';
      ctx.fillRect(-s * 0.3, -s * 0.22, s * 0.6, s * 0.44);
      // Horizontal line through
      ctx.strokeStyle = '#aa2020';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(s * 0.3, 0);
      ctx.stroke();
      // WASTED text
      ctx.fillStyle = '#cc3030';
      ctx.font = `bold ${s * 0.16}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WASTED', 0, 0);
      break;

    case 2048: // Elden Ring Crown - golden circlet with points
      // Crown ring
      ctx.strokeStyle = '#d4a020';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.06, s * 0.28, s * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Crown points
      ctx.fillStyle = '#d4a020';
      const points = 7;
      for (let i = 0; i < points; i++) {
        const angle = Math.PI + (Math.PI / (points - 1)) * i;
        const bx = Math.cos(angle) * s * 0.28;
        const by = s * 0.06 + Math.sin(angle) * s * 0.1;
        ctx.beginPath();
        ctx.moveTo(bx - s * 0.03, by);
        ctx.lineTo(bx, by - s * 0.14);
        ctx.lineTo(bx + s * 0.03, by);
        ctx.fill();
      }
      // Gems on points
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(0, -s * 0.08, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4488ff';
      ctx.beginPath();
      ctx.arc(-s * 0.18, -s * 0.02, s * 0.025, 0, Math.PI * 2);
      ctx.arc(s * 0.18, -s * 0.02, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
      // Inner glow
      ctx.fillStyle = 'rgba(212,160,32,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.02, s * 0.2, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
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
 * Helper for rounded rectangles used in gaming theme.
 */
function roundRectHelper(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ---- Theme Definitions ----

const classicTheme = {
  id: 'classic',
  name: 'CLASSIC MEMES 2048',
  scoreLabel: 'MEME LEVEL',
  tiers: CLASSIC_TIERS,
  bgColor: '#f5f5f5',
  boardBgColor: '#d0ccc0',
  cellEmptyColor: '#c0b8a8',
  textColor: '#333333',
  accentColor: '#333333',
  deathMessages: [
    'the meme died. just like harambe.',
    'no more memes to merge.',
    'press F to pay respects.',
  ],
  drawChar: drawClassicChar,
};

const catTheme = {
  id: 'cats',
  name: 'CAT MEMES 2048',
  scoreLabel: 'CAT POWER',
  tiers: CAT_TIERS,
  bgColor: '#fff0f4',
  boardBgColor: '#f0d8e0',
  cellEmptyColor: '#e8c8d4',
  textColor: '#4a2030',
  accentColor: '#ff69b4',
  deathMessages: [
    'the cats have left the internet.',
    'not enough cat memes.',
    'the cat cafe is closed.',
  ],
  drawChar: drawCatChar,
};

const gamingTheme = {
  id: 'gaming',
  name: 'GAMING MEMES 2048',
  scoreLabel: 'GAMER LEVEL',
  tiers: GAMING_TIERS,
  bgColor: '#0a0a14',
  boardBgColor: '#141428',
  cellEmptyColor: '#1e1e36',
  textColor: '#e0e0e0',
  accentColor: '#00ff00',
  deathMessages: [
    'GAME OVER. insert coin.',
    'git gud at merging.',
    'skill issue detected.',
  ],
  drawChar: drawGamingChar,
};

// ---- Exports ----

export const THEMES = [classicTheme, catTheme, gamingTheme];

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
