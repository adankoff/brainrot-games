/**
 * FLAPPY DOGE -- Character Definitions
 * One character per theme. draw(ctx, animFrame, isFlapping) renders at origin.
 */

// ---- DOGE: Shiba Inu face ----

function drawDoge(ctx, animFrame, isFlapping) {
  const isFalling = !isFlapping;

  // Ear wiggle during flap
  const earWiggle = isFlapping ? Math.sin(animFrame * Math.PI) * 0.25 : 0;

  // Head (tan circle)
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#c4a265';
  ctx.fill();
  ctx.strokeStyle = '#a88844';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Face oval (darker tan)
  ctx.beginPath();
  ctx.ellipse(2, 2, 10, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d4b87a';
  ctx.fill();

  // Left ear (triangle)
  ctx.save();
  ctx.translate(-10, -12);
  ctx.rotate(-0.3 + earWiggle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-5, -12);
  ctx.lineTo(5, -2);
  ctx.closePath();
  ctx.fillStyle = '#c4a265';
  ctx.fill();
  ctx.strokeStyle = '#a88844';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Inner ear
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(-3, -8);
  ctx.lineTo(3, -2);
  ctx.closePath();
  ctx.fillStyle = '#e8c99a';
  ctx.fill();
  ctx.restore();

  // Right ear (triangle)
  ctx.save();
  ctx.translate(10, -12);
  ctx.rotate(0.3 - earWiggle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(5, -12);
  ctx.lineTo(-5, -2);
  ctx.closePath();
  ctx.fillStyle = '#c4a265';
  ctx.fill();
  ctx.strokeStyle = '#a88844';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Inner ear
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(3, -8);
  ctx.lineTo(-3, -2);
  ctx.closePath();
  ctx.fillStyle = '#e8c99a';
  ctx.fill();
  ctx.restore();

  // Eyes (small black dots)
  ctx.beginPath();
  ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Eye highlights
  ctx.beginPath();
  ctx.arc(-4, -4, 1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -4, 1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Nose (small dark triangle/oval)
  ctx.beginPath();
  ctx.ellipse(1, 3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(1, 5);
  ctx.lineTo(-2, 8);
  ctx.strokeStyle = '#5a4020';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1, 5);
  ctx.lineTo(4, 8);
  ctx.stroke();

  // Tongue out when falling
  if (isFalling) {
    ctx.beginPath();
    ctx.ellipse(3, 10, 3, 5, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6688';
    ctx.fill();
    ctx.strokeStyle = '#dd4466';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

// ---- NYAN CAT: Cat on Pop-Tart with rainbow trail ----

function drawNyanCat(ctx, animFrame, isFlapping) {
  const bounce = isFlapping ? Math.sin(animFrame * Math.PI) * 3 : 0;

  // Rainbow trail (6 colored lines behind)
  const rainbowColors = ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff'];
  const trailLength = 30;
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = rainbowColors[i];
    ctx.lineWidth = 3;
    ctx.beginPath();
    const yOff = -7.5 + i * 3;
    ctx.moveTo(-14, yOff + bounce * 0.3);
    ctx.lineTo(-14 - trailLength, yOff);
    ctx.stroke();
  }

  // Pop-Tart body (pink rectangle with rounded corners)
  ctx.save();
  ctx.translate(0, bounce);
  ctx.beginPath();
  ctx.roundRect(-12, -10, 24, 20, 3);
  ctx.fillStyle = '#ffaa88';
  ctx.fill();
  ctx.strokeStyle = '#cc8866';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Frosting (pink inner rect)
  ctx.beginPath();
  ctx.roundRect(-9, -7, 18, 14, 2);
  ctx.fillStyle = '#ff88aa';
  ctx.fill();

  // Sprinkles
  ctx.fillStyle = '#ff4488';
  ctx.fillRect(-6, -4, 2, 2);
  ctx.fillRect(1, -2, 2, 2);
  ctx.fillRect(-3, 2, 2, 2);
  ctx.fillRect(4, 0, 2, 2);
  ctx.fillStyle = '#ffff44';
  ctx.fillRect(-1, -5, 2, 2);
  ctx.fillRect(3, 3, 2, 2);

  // Cat face (gray, peeking from right side)
  ctx.beginPath();
  ctx.arc(10, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#888888';
  ctx.fill();
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cat ears
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(4, -14);
  ctx.lineTo(9, -8);
  ctx.closePath();
  ctx.fillStyle = '#888888';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -6);
  ctx.lineTo(14, -14);
  ctx.lineTo(17, -7);
  ctx.closePath();
  ctx.fillStyle = '#888888';
  ctx.fill();

  // Inner ears
  ctx.beginPath();
  ctx.moveTo(6, -7);
  ctx.lineTo(5, -12);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fillStyle = '#ffaaaa';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -7);
  ctx.lineTo(14, -12);
  ctx.lineTo(16, -8);
  ctx.closePath();
  ctx.fillStyle = '#ffaaaa';
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(7, -1, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(13, -1, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Cheeks
  ctx.beginPath();
  ctx.arc(5, 2, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 100, 150, 0.4)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15, 2, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 100, 150, 0.4)';
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(9, 3);
  ctx.lineTo(8, 5);
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11, 3);
  ctx.lineTo(12, 5);
  ctx.stroke();

  // Cat feet (bottom, small stubs)
  ctx.fillStyle = '#777777';
  ctx.fillRect(-8, 10, 4, 4);
  ctx.fillRect(0, 10, 4, 4);
  ctx.fillRect(8, 10, 4, 4);

  // Cat tail (left side)
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.quadraticCurveTo(-18, -8, -16, -14);
  ctx.stroke();

  ctx.restore();
}

// ---- TROLLFACE: White circle with iconic grin ----

function drawTrollface(ctx, animFrame, isFlapping) {
  // Face stretch on flap
  const stretch = isFlapping ? 1.0 + Math.sin(animFrame * Math.PI) * 0.15 : 1.0;
  const squash = isFlapping ? 1.0 - Math.sin(animFrame * Math.PI) * 0.1 : 1.0;

  ctx.save();
  ctx.scale(squash, stretch);

  // Head (white circle)
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Mischievous eyebrows (raised, angled)
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -9);
  ctx.lineTo(-3, -11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, -11);
  ctx.lineTo(9, -9);
  ctx.stroke();

  // Eyes (dots with mischievous look)
  ctx.beginPath();
  ctx.arc(-6, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill();

  // Wide U-shaped troll grin
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.quadraticCurveTo(-8, 12, 0, 12);
  ctx.quadraticCurveTo(8, 12, 10, 2);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Teeth in grin
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-8, 3);
  ctx.quadraticCurveTo(-6, 10, 0, 10);
  ctx.quadraticCurveTo(6, 10, 8, 3);
  ctx.lineTo(-8, 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tooth dividers
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 0.5;
  for (let i = -6; i <= 6; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 3);
    ctx.lineTo(i, 9);
    ctx.stroke();
  }

  // Nose (small bump)
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI);
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ---- Exported character registry (one per theme) ----

export const CHARACTERS = {
  doge: {
    name: 'Doge',
    theme: 'doge',
    draw: drawDoge,
    flapSound: {
      notes: [{ type: 'triangle', frequency: 440, endFrequency: 520, duration: 0.06, gain: 0.12 }],
    },
    deathSound: {
      notes: [{ type: 'square', frequency: 300, endFrequency: 80, duration: 0.5, gain: 0.2 }],
    },
  },
  nyan: {
    name: 'Nyan Cat',
    theme: 'nyan',
    draw: drawNyanCat,
    flapSound: {
      notes: [{ type: 'square', frequency: 600, endFrequency: 700, duration: 0.05, gain: 0.1 }],
    },
    deathSound: {
      notes: [{ type: 'sine', frequency: 500, endFrequency: 100, duration: 0.4, gain: 0.15 }],
    },
  },
  troll: {
    name: 'Trollface',
    theme: 'troll',
    draw: drawTrollface,
    flapSound: {
      notes: [{ type: 'sawtooth', frequency: 300, endFrequency: 380, duration: 0.06, gain: 0.1 }],
    },
    deathSound: {
      notes: [{ type: 'sawtooth', frequency: 200, endFrequency: 60, duration: 0.5, gain: 0.18 }],
    },
  },
};
