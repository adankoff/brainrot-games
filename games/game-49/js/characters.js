/**
 * WHACK-A-ROT -- Character Type Definitions
 * 6 characters, each drawn with Canvas 2D primitives.
 * Each: draw(ctx, cx, cy, time), getHitboxCenter(cx, cy, time),
 *       basePoints, displayTimeMultiplier, hitboxRadius, spawn weights.
 */

export const CHARACTER_TYPES = {

  // ---- 1. Tralalero Tralala (100pts, standard) ----
  tralalero: {
    id: 'tralalero',
    name: 'Tralalero Tralala',
    basePoints: 100,
    displayTimeMultiplier: 1.0,
    hitboxRadius: 40,
    spawnWeights: { early: 0.35, mid: 0.30, late: 0.25 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Idle bob
      const bob = 3 * Math.sin(time * 0.004);
      const by = cy + bob;

      // Legs (3 legs)
      const legXs = [cx - 15, cx, cx + 15];
      for (const legX of legXs) {
        // Leg
        ctx.fillStyle = '#4488dd';
        ctx.fillRect(legX - 3, by + 12, 6, 20);
        // Shoe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(legX - 5, by + 30, 10, 6);
        // Nike swoosh
        ctx.beginPath();
        ctx.moveTo(legX - 4, by + 33);
        ctx.quadraticCurveTo(legX, by + 30, legX + 5, by + 33);
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Body (shark torso)
      ctx.beginPath();
      ctx.ellipse(cx, by - 5, 28, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4488dd';
      ctx.fill();
      ctx.strokeStyle = '#335599';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(cx + 10, by - 20);
      ctx.lineTo(cx + 20, by - 35);
      ctx.lineTo(cx + 18, by - 15);
      ctx.closePath();
      ctx.fillStyle = '#3377cc';
      ctx.fill();

      // Head (shark head, pointed)
      ctx.beginPath();
      ctx.moveTo(cx, by - 42);
      ctx.quadraticCurveTo(cx + 22, by - 30, cx + 20, by - 18);
      ctx.lineTo(cx - 20, by - 18);
      ctx.quadraticCurveTo(cx - 22, by - 30, cx, by - 42);
      ctx.closePath();
      ctx.fillStyle = '#4488dd';
      ctx.fill();
      ctx.strokeStyle = '#335599';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 10, by - 28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, by - 28, 6, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 10, by - 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, by - 28, 3, 0, Math.PI * 2);
      ctx.fill();

      // Mouth (wide grin)
      ctx.beginPath();
      ctx.arc(cx, by - 16, 15, 0, Math.PI);
      ctx.fillStyle = '#cc2222';
      ctx.fill();
      // Teeth
      ctx.fillStyle = '#ffffff';
      const teethXs = [cx - 12, cx - 6, cx, cx + 6, cx + 12];
      for (const tx of teethXs) {
        ctx.beginPath();
        ctx.moveTo(tx - 2, by - 16);
        ctx.lineTo(tx, by - 11);
        ctx.lineTo(tx + 2, by - 16);
        ctx.closePath();
        ctx.fill();
      }
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 2. Bombardiro Crocodilo (200pts, fast) ----
  bombardiro: {
    id: 'bombardiro',
    name: 'Bombardiro Crocodilo',
    basePoints: 200,
    displayTimeMultiplier: 0.6,
    hitboxRadius: 40,
    spawnWeights: { early: 0.20, mid: 0.20, late: 0.20 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Idle rock
      const rock = 2 * Math.sin(time * 0.003 * Math.PI);
      const bx = cx + rock;

      // Body (bomber fuselage)
      ctx.beginPath();
      ctx.roundRect(bx - 25, cy + 5 - 12, 50, 24, 10);
      ctx.fillStyle = '#556b55';
      ctx.fill();
      ctx.strokeStyle = '#3d4d3d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wings
      ctx.fillStyle = '#556b55';
      ctx.fillRect(bx - 35, cy + 2, 16, 8);
      ctx.fillRect(bx + 19, cy + 2, 16, 8);
      // Wing tips
      ctx.beginPath();
      ctx.moveTo(bx - 35, cy + 2);
      ctx.lineTo(bx - 40, cy + 6);
      ctx.lineTo(bx - 35, cy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx + 35, cy + 2);
      ctx.lineTo(bx + 40, cy + 6);
      ctx.lineTo(bx + 35, cy + 10);
      ctx.closePath();
      ctx.fill();

      // Crocodile head
      ctx.beginPath();
      ctx.ellipse(bx, cy - 18, 18, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#44aa44';
      ctx.fill();
      ctx.strokeStyle = '#338833';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Snout
      ctx.beginPath();
      ctx.roundRect(bx - 12, cy - 14, 24, 10, 4);
      ctx.fillStyle = '#44aa44';
      ctx.fill();
      // Nostrils
      ctx.fillStyle = '#226622';
      ctx.beginPath();
      ctx.arc(bx - 5, cy - 10, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx + 5, cy - 10, 2, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (yellow with slit pupils)
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(bx - 8, cy - 24, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx + 8, cy - 24, 5, 0, Math.PI * 2);
      ctx.fill();
      // Slit pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(bx - 8, cy - 24, 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(bx + 8, cy - 24, 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth (zigzag)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const tx = bx - 10 + i * 4;
        ctx.beginPath();
        ctx.moveTo(tx, cy - 8);
        ctx.lineTo(tx + 2, cy - 5);
        ctx.lineTo(tx + 4, cy - 8);
        ctx.closePath();
        ctx.fill();
      }

      // Propeller hub
      const propAngle = time * 0.01;
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(bx, cy - 32, 3, 0, Math.PI * 2);
      ctx.fill();
      // Propeller blades
      ctx.save();
      ctx.translate(bx, cy - 32);
      ctx.rotate(propAngle);
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.roundRect(-18, -3, 36, 6, 3);
      ctx.fill();
      ctx.restore();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 3. Tung Tung Tung Sahur (150pts, slow, smaller hitbox) ----
  tungtung: {
    id: 'tungtung',
    name: 'Tung Tung Tung Sahur',
    basePoints: 150,
    displayTimeMultiplier: 1.3,
    hitboxRadius: 30,
    spawnWeights: { early: 0.20, mid: 0.18, late: 0.15 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Bat swing animation
      const batAngle = 15 * Math.sin(time * 0.025) * (Math.PI / 180);

      // Body (wooden plank)
      ctx.fillStyle = '#b5813a';
      ctx.strokeStyle = '#8b6324';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 12, cy - 27, 24, 55);
      ctx.strokeRect(cx - 12, cy - 27, 24, 55);

      // Wood grain lines
      ctx.strokeStyle = '#9a7030';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 15);
      ctx.lineTo(cx + 10, cy - 15);
      ctx.moveTo(cx - 10, cy - 2);
      ctx.lineTo(cx + 10, cy - 2);
      ctx.moveTo(cx - 10, cy + 12);
      ctx.lineTo(cx + 10, cy + 12);
      ctx.stroke();

      // Headband
      ctx.fillStyle = '#dd2222';
      ctx.fillRect(cx - 14, cy - 28, 28, 6);
      // Headband tail
      ctx.strokeStyle = '#dd2222';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy - 28);
      ctx.quadraticCurveTo(cx + 22, cy - 24, cx + 20, cy - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy - 26);
      ctx.quadraticCurveTo(cx + 24, cy - 22, cx + 22, cy - 16);
      ctx.stroke();

      // Face - Eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 18, 3, 0, Math.PI * 2);
      ctx.fill();

      // Angry eyebrows
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 24);
      ctx.lineTo(cx - 2, cy - 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 9, cy - 24);
      ctx.lineTo(cx + 2, cy - 22);
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 12);
      ctx.lineTo(cx + 4, cy - 12);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Baseball bat (swinging)
      ctx.save();
      ctx.translate(cx + 14, cy + 15);
      ctx.rotate(batAngle);
      // Handle
      ctx.fillStyle = '#8b6324';
      ctx.fillRect(0, -25, 5, 25);
      // Barrel
      ctx.beginPath();
      ctx.roundRect(-2, -43, 12, 18, 4);
      ctx.fillStyle = '#c4a265';
      ctx.fill();
      ctx.strokeStyle = '#8b6324';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 4. Ballerina Cappuccina (150pts, sways) ----
  ballerina: {
    id: 'ballerina',
    name: 'Ballerina Cappuccina',
    basePoints: 150,
    displayTimeMultiplier: 1.0,
    hitboxRadius: 40,
    spawnWeights: { early: 0.15, mid: 0.15, late: 0.15 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Sway
      const sway = 15 * Math.sin(time * 0.003);
      const sx = cx + sway;

      // Tutu (skirt) - fan of triangles
      const tutuY = cy + 16;
      // Underlayer
      ctx.fillStyle = '#ee77aa';
      for (let i = 0; i < 7; i++) {
        const angle = (-80 + i * (160 / 6)) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(sx, tutuY + 2);
        ctx.lineTo(sx + Math.cos(angle) * 16, tutuY + 2 + Math.sin(angle) * 14);
        ctx.lineTo(sx + Math.cos(angle + 0.2) * 16, tutuY + 2 + Math.sin(angle + 0.2) * 14);
        ctx.closePath();
        ctx.fill();
      }
      // Top layer
      ctx.fillStyle = '#ff88bb';
      ctx.strokeStyle = '#dd6699';
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const angle = (-80 + i * (160 / 6)) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(sx, tutuY);
        ctx.lineTo(sx + Math.cos(angle) * 14, tutuY + Math.sin(angle) * 12);
        ctx.lineTo(sx + Math.cos(angle + 0.2) * 14, tutuY + Math.sin(angle + 0.2) * 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Body (torso)
      ctx.beginPath();
      ctx.moveTo(sx - 8, cy - 2);
      ctx.lineTo(sx + 8, cy - 2);
      ctx.lineTo(sx + 6, cy + 16);
      ctx.lineTo(sx - 6, cy + 16);
      ctx.closePath();
      ctx.fillStyle = '#ffccdd';
      ctx.fill();
      ctx.strokeStyle = '#dd88aa';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Arms (ballet pose)
      ctx.strokeStyle = '#ffccdd';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      // Left arm
      ctx.beginPath();
      ctx.moveTo(sx - 8, cy);
      ctx.quadraticCurveTo(sx - 18, cy - 10, sx - 20, cy - 25);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(sx + 8, cy);
      ctx.quadraticCurveTo(sx + 18, cy - 10, sx + 20, cy - 25);
      ctx.stroke();
      ctx.lineCap = 'butt';
      // Hands
      ctx.fillStyle = '#ffccdd';
      ctx.beginPath();
      ctx.arc(sx - 20, cy - 25, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 20, cy - 25, 3, 0, Math.PI * 2);
      ctx.fill();

      // Head (coffee cup)
      // Cup body
      ctx.beginPath();
      ctx.moveTo(sx - 10, cy - 14);
      ctx.lineTo(sx + 10, cy - 14);
      ctx.lineTo(sx + 8, cy - 32);
      ctx.lineTo(sx - 8, cy - 32);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cup rim
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(sx - 11, cy - 34, 22, 3);

      // Handle
      ctx.beginPath();
      ctx.arc(sx + 12, cy - 24, 5, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Coffee inside
      ctx.beginPath();
      ctx.ellipse(sx, cy - 32, 7, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4a2c0a';
      ctx.fill();

      // Steam (animated)
      ctx.strokeStyle = 'rgba(200,200,200,0.5)';
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        const steamX = sx + i * 3;
        const phase = time * 0.003 + i;
        for (let j = 0; j < 10; j++) {
          const yOff = cy - 35 - j;
          const xOff = steamX + 2 * Math.sin(phase + j * 0.5);
          if (j === 0) ctx.moveTo(xOff, yOff);
          else ctx.lineTo(xOff, yOff);
        }
        ctx.stroke();
      }

      // Face on the cup (happy closed eyes)
      ctx.strokeStyle = '#4a2c0a';
      ctx.lineWidth = 1.5;
      // Left eye ^
      ctx.beginPath();
      ctx.arc(sx - 4, cy - 24, 3, Math.PI + 0.3, -0.3);
      ctx.stroke();
      // Right eye ^
      ctx.beginPath();
      ctx.arc(sx + 4, cy - 24, 3, Math.PI + 0.3, -0.3);
      ctx.stroke();

      // Blush
      ctx.fillStyle = 'rgba(255,170,204,0.6)';
      ctx.beginPath();
      ctx.arc(sx - 7, cy - 21, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 7, cy - 21, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth (small "o")
      ctx.beginPath();
      ctx.arc(sx, cy - 20, 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#4a2c0a';
      ctx.lineWidth = 1;
      ctx.stroke();
    },

    getHitboxCenter(cx, cy, time) {
      return { x: cx + 15 * Math.sin(time * 0.003), y: cy - 40 };
    },
  },

  // ---- 5. Brr Brr Patapim (PENALTY, -200pts) ----
  brrbrr: {
    id: 'brrbrr',
    name: 'Brr Brr Patapim',
    basePoints: -200,
    displayTimeMultiplier: 1.2,
    hitboxRadius: 40,
    spawnWeights: { early: 0.10, mid: 0.15, late: 0.20 },
    appearsFromWave: 1,
    isPenalty: true,

    draw(ctx, cx, cy, time) {
      // Jitter/shiver
      const jx = cx + (Math.random() - 0.5) * 2;
      const jy = cy + (Math.random() - 0.5) * 2;

      // Pulsing glow
      const glowSize = 8 + 4 * Math.sin(time * 0.006);
      ctx.save();
      ctx.shadowColor = '#ff3838';
      ctx.shadowBlur = glowSize;

      // Spikes (8 radiating from body)
      const spikeRadius = 33 + 2 * Math.sin(time * 0.008);
      ctx.fillStyle = '#ff5555';
      ctx.strokeStyle = '#cc2020';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const bx1 = jx + 22 * Math.cos(a - 0.15);
        const by1 = jy + 22 * Math.sin(a - 0.15);
        const bx2 = jx + 22 * Math.cos(a + 0.15);
        const by2 = jy + 22 * Math.sin(a + 0.15);
        const tipX = jx + spikeRadius * Math.cos(a);
        const tipY = jy + spikeRadius * Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(bx2, by2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Main body circle
      ctx.beginPath();
      ctx.arc(jx, jy, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3838';
      ctx.fill();
      ctx.strokeStyle = '#cc2020';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore(); // remove shadow

      // Eyes (cute puppy eyes -- the bait)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(jx - 8, jy - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(jx + 8, jy - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // Blink every 2 seconds
      const blinkCycle = time % 2000;
      if (blinkCycle > 1900) {
        // Eyes closed
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(jx - 12, jy - 6);
        ctx.lineTo(jx - 4, jy - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(jx + 4, jy - 6);
        ctx.lineTo(jx + 12, jy - 6);
        ctx.stroke();
      } else {
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(jx - 8, jy - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(jx + 8, jy - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        // Kawaii highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(jx - 6.5, jy - 7.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(jx + 9.5, jy - 7.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth (quivering frown)
      const lipQuiver = Math.sin(time * 0.019) * 1;
      ctx.beginPath();
      ctx.arc(jx, jy + 6 + lipQuiver, 6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = '#880000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning triangle above head
      ctx.fillStyle = '#ffd000';
      ctx.beginPath();
      ctx.moveTo(jx, jy - 44);
      ctx.lineTo(jx - 7, jy - 34);
      ctx.lineTo(jx + 7, jy - 34);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Exclamation mark
      ctx.fillStyle = '#000000';
      ctx.font = '8px Bungee, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', jx, jy - 38);
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 6. Lirili Larila (500pts, RARE BONUS) ----
  lirili: {
    id: 'lirili',
    name: 'Lirili Larila',
    basePoints: 500,
    displayTimeMultiplier: 0.4,
    hitboxRadius: 40,
    spawnWeights: { early: 0, mid: 0.02, late: 0.05 },
    appearsFromWave: 3,
    isBonus: true,

    draw(ctx, cx, cy, time) {
      // Float upward slowly (managed externally via floatOffset if desired, but we
      // keep a subtle visual float here)
      const floatY = cy - 3 * Math.sin(time * 0.004);

      // Pulsing glow behind character
      const glowAlpha = 0.15 + 0.2 * Math.sin(time * 0.019);
      const grad = ctx.createRadialGradient(cx, floatY, 0, cx, floatY, 50);
      grad.addColorStop(0, `rgba(255,215,0,${glowAlpha})`);
      grad.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, floatY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Wings (butterfly, 4 wings)
      const wingFlap = 10 * Math.sin(time * 0.038) * (Math.PI / 180);
      ctx.save();
      ctx.translate(cx, floatY);

      // Upper-left wing
      ctx.save();
      ctx.rotate(-0.35 + wingFlap);
      ctx.beginPath();
      ctx.ellipse(-18, -8, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,0.7)';
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Sparkles on wing
      if (Math.sin(time * 0.01 + 1) > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-20, -10, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (Math.sin(time * 0.013 + 2) > 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-14, -5, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Upper-right wing
      ctx.save();
      ctx.rotate(0.35 - wingFlap);
      ctx.beginPath();
      ctx.ellipse(18, -8, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,0.7)';
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (Math.sin(time * 0.011 + 3) > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(20, -10, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Lower-left wing
      ctx.save();
      ctx.rotate(-0.52 + wingFlap * 0.8);
      ctx.beginPath();
      ctx.ellipse(-14, 6, 10, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,0.6)';
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Lower-right wing
      ctx.save();
      ctx.rotate(0.52 - wingFlap * 0.8);
      ctx.beginPath();
      ctx.ellipse(14, 6, 10, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,0.6)';
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // undo translate

      // Body (small gold oval)
      ctx.beginPath();
      ctx.ellipse(cx, floatY + 2, 10, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Face
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 4, floatY - 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 4, floatY - 4, 2, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(cx, floatY + 1, 3, 0, Math.PI);
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Antennae
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 3, floatY - 12);
      ctx.quadraticCurveTo(cx - 10, floatY - 25, cx - 6, floatY - 28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, floatY - 12);
      ctx.quadraticCurveTo(cx + 10, floatY - 25, cx + 6, floatY - 28);
      ctx.stroke();
      // Antenna tips
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx - 6, floatY - 28, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, floatY - 28, 2, 0, Math.PI * 2);
      ctx.fill();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },
};

/**
 * All character type IDs in array form.
 */
export const CHARACTER_IDS = Object.keys(CHARACTER_TYPES);
