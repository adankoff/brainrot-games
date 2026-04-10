/**
 * FLAPPY TRALALERO -- Character Definitions
 * Each character: draw(ctx, animFrame, isFlapping), flapSound, deathSound, unlockCondition.
 * All draw functions render at origin (0,0). Caller handles translate/rotate.
 */

// ---- Leg position helper for Tralalero ----

function getLegPositions(animFrame, isFlapping) {
  if (!isFlapping || animFrame === 0) {
    return [
      { startX: -8, startY: 12, endX: -12, endY: 28 },
      { startX: 0,  startY: 14, endX: 0,   endY: 30 },
      { startX: 8,  startY: 12, endX: 12,  endY: 28 },
    ];
  } else if (animFrame === 1) {
    return [
      { startX: -8, startY: 12, endX: -18, endY: 24 },
      { startX: 0,  startY: 14, endX: 0,   endY: 30 },
      { startX: 8,  startY: 12, endX: 18,  endY: 24 },
    ];
  } else {
    return [
      { startX: -8, startY: 12, endX: -4,  endY: 26 },
      { startX: 0,  startY: 14, endX: 0,   endY: 28 },
      { startX: 8,  startY: 12, endX: 4,   endY: 26 },
    ];
  }
}

/**
 * Draw Tralalero Tralala -- the three-legged shark with Nike shoes.
 */
function drawTralalero(ctx, animFrame, isFlapping) {
  // Tail fin
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(-26, -8);
  ctx.lineTo(-24, 0);
  ctx.lineTo(-26, 8);
  ctx.lineTo(-18, 2);
  ctx.closePath();
  ctx.fillStyle = '#5A6A7D';
  ctx.fill();

  // Body (blue-gray shark ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#6B7B8D';
  ctx.fill();
  ctx.strokeStyle = '#4A5568';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.lineTo(-4, -22);
  ctx.lineTo(0, -14);
  ctx.closePath();
  ctx.fillStyle = '#5A6A7D';
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(10, -4, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -4, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Mouth (menacing grin)
  ctx.beginPath();
  ctx.arc(12, 4, 4, 0, Math.PI);
  ctx.strokeStyle = '#0a0a0f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Legs with Nike shoes
  const legPositions = getLegPositions(animFrame, isFlapping);
  ctx.lineCap = 'round';

  for (const leg of legPositions) {
    ctx.strokeStyle = '#6B7B8D';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leg.startX, leg.startY);
    ctx.lineTo(leg.endX, leg.endY);
    ctx.stroke();

    // Nike shoe
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(leg.endX - 4, leg.endY - 2, 8, 4);

    // Nike swoosh
    ctx.beginPath();
    ctx.arc(leg.endX, leg.endY - 1, 3, 0.3, Math.PI - 0.3);
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw Bombardiro Crocodilo -- green crocodile with airplane wings.
 */
function drawBombardiro(ctx, animFrame, isFlapping) {
  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3d8b37';
  ctx.fill();
  ctx.strokeStyle = '#2d6b27';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Snout
  ctx.beginPath();
  ctx.ellipse(14, 2, 8, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3d8b37';
  ctx.fill();
  ctx.strokeStyle = '#2d6b27';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Teeth
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(10 + i * 3, 5, 2, 3);
  }

  // Eye
  ctx.beginPath();
  ctx.arc(8, -4, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9, -4, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff0000';
  ctx.fill();

  // Wings
  const wingFlap = isFlapping ? Math.sin(animFrame * Math.PI / 1.5) * 0.3 : 0;
  ctx.save();
  ctx.rotate(wingFlap);
  ctx.beginPath();
  ctx.moveTo(-4, -10);
  ctx.lineTo(-20, -18);
  ctx.lineTo(-14, -8);
  ctx.closePath();
  ctx.fillStyle = '#888888';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(-wingFlap);
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(-20, 18);
  ctx.lineTo(-14, 8);
  ctx.closePath();
  ctx.fillStyle = '#888888';
  ctx.fill();
  ctx.restore();

  // Propeller
  const propAngle = (performance.now() / 50) % (Math.PI * 2);
  ctx.save();
  ctx.translate(20, 0);
  ctx.rotate(propAngle);
  ctx.fillStyle = '#555555';
  ctx.fillRect(-2, -10, 4, 20);
  ctx.fillRect(-10, -2, 20, 4);
  ctx.restore();
}

/**
 * Draw Lirili Larila -- pink/purple butterfly.
 */
function drawLirili(ctx, animFrame, isFlapping) {
  const wingSpread = isFlapping ? Math.cos(animFrame * Math.PI / 1.5) * 0.4 + 0.6 : 1.0;

  // Left wings
  ctx.save();
  ctx.scale(1, wingSpread);
  ctx.beginPath();
  ctx.ellipse(-8, -6, 12, 10, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#cc44cc';
  ctx.fill();
  ctx.strokeStyle = '#ff88ff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-6, 6, 8, 7, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#bb33bb';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right wings
  ctx.save();
  ctx.scale(1, wingSpread);
  ctx.beginPath();
  ctx.ellipse(8, -6, 12, 10, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#cc44cc';
  ctx.fill();
  ctx.strokeStyle = '#ff88ff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(6, 6, 8, 7, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#bb33bb';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Wing spots
  ctx.beginPath();
  ctx.arc(-8, -6, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ff66ff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -6, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ff66ff';
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4a2050';
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(-2, -6, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2, -6, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-1.5, -6, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5, -6, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#4a2050';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-2, -10);
  ctx.quadraticCurveTo(-6, -18, -4, -20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -10);
  ctx.quadraticCurveTo(6, -18, 4, -20);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-4, -20, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff88ff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -20, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff88ff';
  ctx.fill();
}

/**
 * Draw Tung Tung Tung Sahur -- black cylinder with drumstick arms.
 */
function drawTungtung(ctx, animFrame, isFlapping) {
  // Body
  ctx.beginPath();
  ctx.roundRect(-10, -16, 20, 32, 8);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  ctx.beginPath();
  ctx.arc(-4, -6, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -6, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-3, -6, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -6, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.arc(0, 4, 3, 0, Math.PI);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Drumstick arms
  const armSwing1 = isFlapping ? Math.sin(animFrame * Math.PI) * 0.6 : 0.2;
  const armSwing2 = isFlapping ? -Math.sin(animFrame * Math.PI) * 0.6 : -0.2;

  ctx.save();
  ctx.translate(-10, -2);
  ctx.rotate(armSwing1 - 0.3);
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(-18, -2, 18, 4);
  ctx.beginPath();
  ctx.arc(-18, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#C4A032';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(10, -2);
  ctx.rotate(armSwing2 + 0.3);
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(0, -2, 18, 4);
  ctx.beginPath();
  ctx.arc(18, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#C4A032';
  ctx.fill();
  ctx.restore();
}

/**
 * Draw Cappuccino Assassino -- coffee cup with assassin mask.
 */
function drawCappuccino(ctx, animFrame, isFlapping) {
  // Cup body
  ctx.beginPath();
  ctx.moveTo(-12, -10);
  ctx.lineTo(-10, 14);
  ctx.lineTo(10, 14);
  ctx.lineTo(12, -10);
  ctx.closePath();
  ctx.fillStyle = '#8B5A2B';
  ctx.fill();
  ctx.strokeStyle = '#5C3A1A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cup rim
  ctx.fillStyle = '#A0784C';
  ctx.fillRect(-13, -12, 26, 4);

  // Steam
  const steamWave = Math.sin(performance.now() / 200);
  ctx.strokeStyle = 'rgba(200,200,200,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4, -14);
  ctx.quadraticCurveTo(-4 + steamWave * 3, -20, -2, -24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -14);
  ctx.quadraticCurveTo(4 - steamWave * 3, -22, 6, -26);
  ctx.stroke();

  // Assassin mask
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(-12, -6, 24, 8);

  // Glowing eyes
  ctx.beginPath();
  ctx.arc(-5, -2, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ff3838';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -2, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ff3838';
  ctx.fill();

  // Espresso squirt on flap
  if (isFlapping) {
    ctx.fillStyle = '#5C3A1A';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-3 + i * 3, 16 + animFrame * 4 + i * 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw Brr Brr Patapim -- blue shivering blob.
 */
function drawBrrbrr(ctx, animFrame, isFlapping) {
  const wobble = isFlapping ? Math.sin(performance.now() / 30) * 2 : 0;
  const bodyWobble = Math.sin(performance.now() / 80);

  // Body
  ctx.beginPath();
  ctx.ellipse(wobble, 0, 16 + bodyWobble, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4488cc';
  ctx.fill();
  ctx.strokeStyle = '#3366aa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Icicles
  ctx.fillStyle = '#88ccff';
  ctx.beginPath();
  ctx.moveTo(-8 + wobble, -12);
  ctx.lineTo(-6 + wobble, -18);
  ctx.lineTo(-4 + wobble, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4 + wobble, -13);
  ctx.lineTo(6 + wobble, -20);
  ctx.lineTo(8 + wobble, -13);
  ctx.closePath();
  ctx.fill();

  // Eyes
  const eyeShake = isFlapping ? Math.sin(performance.now() / 20) : 0;
  ctx.beginPath();
  ctx.arc(-5 + wobble + eyeShake, -3, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 + wobble + eyeShake, -3, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4.5 + wobble + eyeShake, -3, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5.5 + wobble + eyeShake, -3, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Chattering teeth
  const teethGap = Math.abs(Math.sin(performance.now() / 40)) * 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-4 + wobble, 5, 8, 3);
  ctx.fillRect(-3 + wobble, 5 + 3 + teethGap, 6, 3);
}

/**
 * Draw La Vaca Saturno Saturnita -- cow with Saturn ring.
 */
function drawLavaca(ctx, animFrame, isFlapping) {
  // Saturn ring (back half)
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 6, 0.2, Math.PI, Math.PI * 2);
  ctx.strokeStyle = '#cc9944';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#EEEEEE';
  ctx.fill();
  ctx.strokeStyle = '#BBBBBB';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Purple spots
  ctx.fillStyle = '#9944cc';
  ctx.beginPath();
  ctx.arc(-6, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-3, 7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(12, -4, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#EEEEEE';
  ctx.fill();
  ctx.strokeStyle = '#BBBBBB';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.ellipse(8, -10, 3, 5, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ddaadd';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, -10, 3, 5, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ddaadd';
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#ddaaaa';
  ctx.beginPath();
  ctx.arc(11, -1, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, -1, 1, 0, Math.PI * 2);
  ctx.fill();

  // Saturn ring (front half)
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 6, 0.2, 0, Math.PI);
  ctx.strokeStyle = '#cc9944';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// ---- Exported character registry ----

export const CHARACTERS = {
  tralalero: {
    name: 'Tralalero Tralala',
    draw: drawTralalero,
    flapSound: {
      notes: [{ type: 'square', frequency: 580, endFrequency: 620, duration: 0.06, gain: 0.12 }],
    },
    deathSound: {
      notes: [{ type: 'square', frequency: 400, endFrequency: 100, duration: 0.5, gain: 0.2 }],
    },
    unlockCondition: null,
  },
  bombardiro: {
    name: 'Bombardiro Crocodilo',
    draw: drawBombardiro,
    flapSound: {
      notes: [{ type: 'square', frequency: 520, endFrequency: 580, duration: 0.06, gain: 0.12 }],
    },
    deathSound: {
      notes: [
        { type: 'sine', frequency: 100, duration: 0.1, gain: 0.15, noise: true },
        { type: 'sine', frequency: 200, endFrequency: 600, duration: 0.3, delay: 0.1, gain: 0.2 },
      ],
    },
    unlockCondition: { type: 'score', value: 10 },
  },
  lirili: {
    name: 'Lirili Larila',
    draw: drawLirili,
    flapSound: {
      notes: [{ type: 'sine', frequency: 800, endFrequency: 900, duration: 0.05, gain: 0.1 }],
    },
    deathSound: {
      notes: [{ type: 'sine', frequency: 800, endFrequency: 400, duration: 0.3, gain: 0.12 }],
    },
    unlockCondition: { type: 'score', value: 25 },
  },
  tungtung: {
    name: 'Tung Tung Tung Sahur',
    draw: drawTungtung,
    flapSound: {
      notes: [{ type: 'triangle', frequency: 300, endFrequency: 350, duration: 0.06, gain: 0.14 }],
    },
    deathSound: {
      notes: [
        { type: 'square', frequency: 200, duration: 0.4, gain: 0.15 },
        { type: 'sine', frequency: 100, duration: 0.15, delay: 0.4, gain: 0.15, noise: true },
      ],
    },
    unlockCondition: { type: 'score', value: 50 },
  },
  cappuccino: {
    name: 'Cappuccino Assassino',
    draw: drawCappuccino,
    flapSound: {
      notes: [{ type: 'sawtooth', frequency: 200, endFrequency: 260, duration: 0.06, gain: 0.1 }],
    },
    deathSound: {
      notes: [{ type: 'sawtooth', frequency: 150, endFrequency: 180, duration: 0.4, gain: 0.18 }],
    },
    unlockCondition: { type: 'score', value: 100 },
  },
  brrbrr: {
    name: 'Brr Brr Patapim',
    draw: drawBrrbrr,
    flapSound: {
      notes: [{ type: 'triangle', frequency: 440, endFrequency: 480, duration: 0.06, gain: 0.12 }],
    },
    deathSound: {
      notes: [{ type: 'triangle', frequency: 300, endFrequency: 80, duration: 0.6, gain: 0.15 }],
    },
    unlockCondition: { type: 'ads', value: 5 },
  },
  lavaca: {
    name: 'La Vaca Saturno Saturnita',
    draw: drawLavaca,
    flapSound: {
      notes: [{ type: 'sine', frequency: 220, endFrequency: 260, duration: 0.08, gain: 0.12 }],
    },
    deathSound: {
      notes: [{ type: 'square', frequency: 80, duration: 0.8, gain: 0.15 }],
    },
    unlockCondition: { type: 'titletaps', value: 10 },
  },
};
