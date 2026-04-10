/**
 * CLASSIC MEME WHACK -- Character Type Definitions
 * 6 classic meme characters, each drawn with Canvas 2D primitives.
 * Each: draw(ctx, cx, cy, time), getHitboxCenter(cx, cy, time),
 *       basePoints, displayTimeMultiplier, hitboxRadius, spawn weights.
 */

export const CHARACTER_TYPES = {

  // ---- 1. Trollface (100pts, standard) ----
  trollface: {
    id: 'trollface',
    name: 'Trollface',
    basePoints: 100,
    displayTimeMultiplier: 1.0,
    hitboxRadius: 40,
    spawnWeights: { early: 0.35, mid: 0.30, late: 0.25 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Idle bob
      const bob = 3 * Math.sin(time * 0.004);
      const by = cy + bob;

      // Head (white circle)
      ctx.beginPath();
      ctx.arc(cx, by, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Beady eyes (left higher, right lower for the classic look)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 8, by - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, by - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Wide U-shaped grin
      ctx.beginPath();
      ctx.arc(cx + 2, by + 2, 18, 0.1, Math.PI - 0.1);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Grin fill (white teeth showing)
      ctx.beginPath();
      ctx.arc(cx + 2, by + 2, 17, 0.15, Math.PI - 0.15);
      ctx.lineTo(cx - 15, by + 2);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Raised eyebrow (left)
      ctx.beginPath();
      ctx.moveTo(cx - 14, by - 14);
      ctx.quadraticCurveTo(cx - 8, by - 20, cx - 2, by - 13);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 2. Doge (200pts, fast) ----
  doge: {
    id: 'doge',
    name: 'Doge',
    basePoints: 200,
    displayTimeMultiplier: 0.6,
    hitboxRadius: 40,
    spawnWeights: { early: 0.20, mid: 0.20, late: 0.20 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Quick head tilt
      const tilt = 2 * Math.sin(time * 0.005);
      const by = cy + tilt;

      // Face (tan circle)
      ctx.beginPath();
      ctx.arc(cx, by, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#e8c872';
      ctx.fill();
      ctx.strokeStyle = '#c4a44e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Triangle ears
      ctx.fillStyle = '#d4a84a';
      // Left ear
      ctx.beginPath();
      ctx.moveTo(cx - 18, by - 16);
      ctx.lineTo(cx - 12, by - 32);
      ctx.lineTo(cx - 6, by - 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c4a44e';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(cx + 6, by - 16);
      ctx.lineTo(cx + 12, by - 32);
      ctx.lineTo(cx + 18, by - 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner ears
      ctx.fillStyle = '#f0d0a0';
      ctx.beginPath();
      ctx.moveTo(cx - 16, by - 18);
      ctx.lineTo(cx - 12, by - 28);
      ctx.lineTo(cx - 8, by - 18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 8, by - 18);
      ctx.lineTo(cx + 12, by - 28);
      ctx.lineTo(cx + 16, by - 18);
      ctx.closePath();
      ctx.fill();

      // Dot eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 8, by - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 8, by - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(cx, by + 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Tongue sticking out
      ctx.fillStyle = '#ff7799';
      ctx.beginPath();
      ctx.ellipse(cx + 2, by + 14, 5, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dd5577';
      ctx.lineWidth = 1;
      ctx.stroke();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 3. Nyan Cat (150pts, slow 1.3x) ----
  nyancat: {
    id: 'nyancat',
    name: 'Nyan Cat',
    basePoints: 150,
    displayTimeMultiplier: 1.3,
    hitboxRadius: 40,
    spawnWeights: { early: 0.20, mid: 0.18, late: 0.15 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Bob animation
      const bob = 2 * Math.sin(time * 0.006);
      const by = cy + bob;

      // Rainbow trail (behind, to the left)
      const rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
      const trailX = cx - 30;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = rainbowColors[i];
        const yOff = by - 9 + i * 3;
        const waveOff = 2 * Math.sin(time * 0.008 + i * 0.5);
        ctx.fillRect(trailX + waveOff - 14, yOff, 16, 3);
      }

      // Pop-Tart body (pink rectangle with rounded corners)
      ctx.beginPath();
      ctx.roundRect(cx - 16, by - 12, 32, 24, 4);
      ctx.fillStyle = '#ff99aa';
      ctx.fill();
      ctx.strokeStyle = '#cc6677';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sprinkles on the Pop-Tart
      const sprinkleColors = ['#ff3355', '#ffee33', '#33ddff', '#66ff66'];
      const sprinkles = [
        { x: -8, y: -6 }, { x: 2, y: -4 }, { x: 10, y: -7 },
        { x: -5, y: 3 }, { x: 6, y: 5 }, { x: -10, y: 6 },
      ];
      for (let i = 0; i < sprinkles.length; i++) {
        ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
        ctx.fillRect(cx + sprinkles[i].x, by + sprinkles[i].y, 2, 2);
      }

      // Cat face (gray, overlapping front of Pop-Tart)
      ctx.beginPath();
      ctx.arc(cx + 12, by, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#999999';
      ctx.fill();

      // Cat ears
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.moveTo(cx + 5, by - 6);
      ctx.lineTo(cx + 8, by - 16);
      ctx.lineTo(cx + 12, by - 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 12, by - 6);
      ctx.lineTo(cx + 16, by - 16);
      ctx.lineTo(cx + 19, by - 6);
      ctx.closePath();
      ctx.fill();

      // Cat eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx + 9, by - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 15, by - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Cat mouth (tiny :3)
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + 11, by + 4, 2, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 14, by + 4, 2, 0, Math.PI);
      ctx.stroke();
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 4. Pepe (150pts, sways) ----
  pepe: {
    id: 'pepe',
    name: 'Pepe',
    basePoints: 150,
    displayTimeMultiplier: 1.0,
    hitboxRadius: 40,
    spawnWeights: { early: 0.15, mid: 0.15, late: 0.15 },
    appearsFromWave: 1,

    draw(ctx, cx, cy, time) {
      // Sway left-right
      const sway = 15 * Math.sin(time * 0.003);
      const sx = cx + sway;

      // Head (green circle)
      ctx.beginPath();
      ctx.arc(sx, cy, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#6b8e23';
      ctx.fill();
      ctx.strokeStyle = '#4a6a10';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Large sad eyes (white, with droopy lids)
      // Left eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(sx - 10, cy - 6, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a6a10';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Right eye
      ctx.beginPath();
      ctx.ellipse(sx + 10, cy - 6, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils (looking down sadly)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sx - 10, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 10, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Droopy eyelids
      ctx.fillStyle = '#6b8e23';
      ctx.beginPath();
      ctx.ellipse(sx - 10, cy - 10, 10, 5, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + 10, cy - 10, 10, 5, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Downturned frown mouth
      ctx.beginPath();
      ctx.arc(sx, cy + 14, 10, Math.PI + 0.3, -0.3);
      ctx.strokeStyle = '#3a5a00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Single tear (left eye, animated drip)
      const tearY = cy + 2 + (time * 0.02 % 12);
      const tearAlpha = 1 - (time * 0.02 % 12) / 12;
      ctx.fillStyle = `rgba(100,180,255,${tearAlpha})`;
      ctx.beginPath();
      ctx.arc(sx - 16, tearY, 2, 0, Math.PI * 2);
      ctx.fill();
    },

    getHitboxCenter(cx, cy, time) {
      return { x: cx + 15 * Math.sin(time * 0.003), y: cy - 40 };
    },
  },

  // ---- 5. Rickroll (PENALTY, -200pts, lingering 1.2x) ----
  rickroll: {
    id: 'rickroll',
    name: 'Rickroll',
    basePoints: -200,
    displayTimeMultiplier: 1.2,
    hitboxRadius: 40,
    spawnWeights: { early: 0.10, mid: 0.15, late: 0.20 },
    appearsFromWave: 1,
    isPenalty: true,

    draw(ctx, cx, cy, time) {
      // Jitter/dance
      const jx = cx + (Math.random() - 0.5) * 2;
      const jy = cy + (Math.random() - 0.5) * 2;

      // Pulsing warning glow
      const glowSize = 8 + 4 * Math.sin(time * 0.006);
      ctx.save();
      ctx.shadowColor = '#ff3838';
      ctx.shadowBlur = glowSize;

      // Body (suit)
      ctx.fillStyle = '#333333';
      ctx.fillRect(jx - 14, jy + 4, 28, 22);

      // Head (circle)
      ctx.beginPath();
      ctx.arc(jx, jy - 6, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#ffccaa';
      ctx.fill();
      ctx.strokeStyle = '#ddaa88';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore(); // remove shadow

      // Orange hair swoosh
      ctx.fillStyle = '#dd6622';
      ctx.beginPath();
      ctx.moveTo(jx - 16, jy - 12);
      ctx.quadraticCurveTo(jx - 8, jy - 30, jx + 2, jy - 22);
      ctx.quadraticCurveTo(jx + 12, jy - 28, jx + 16, jy - 14);
      ctx.quadraticCurveTo(jx + 18, jy - 8, jx + 14, jy - 6);
      ctx.lineTo(jx - 14, jy - 6);
      ctx.quadraticCurveTo(jx - 18, jy - 8, jx - 16, jy - 12);
      ctx.closePath();
      ctx.fill();

      // Eyes (small, friendly looking -- the bait)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(jx - 6, jy - 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(jx + 6, jy - 4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Grin
      ctx.beginPath();
      ctx.arc(jx, jy + 4, 8, 0.1, Math.PI - 0.1);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Microphone (held up to the right)
      ctx.fillStyle = '#444444';
      ctx.fillRect(jx + 18, jy - 2, 4, 18);
      // Mic head
      ctx.beginPath();
      ctx.arc(jx + 20, jy - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#666666';
      ctx.fill();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Mic grid dots
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(jx + 19, jy - 5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(jx + 21, jy - 3, 1, 0, Math.PI * 2);
      ctx.fill();

      // Warning triangle above head
      ctx.fillStyle = '#ffd000';
      ctx.beginPath();
      ctx.moveTo(jx, jy - 38);
      ctx.lineTo(jx - 7, jy - 28);
      ctx.lineTo(jx + 7, jy - 28);
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
      ctx.fillText('!', jx, jy - 32);
    },

    getHitboxCenter(cx, cy) {
      return { x: cx, y: cy - 40 };
    },
  },

  // ---- 6. Harambe (500pts, RARE BONUS, fast 0.4x, wave 3+) ----
  harambe: {
    id: 'harambe',
    name: 'Harambe',
    basePoints: 500,
    displayTimeMultiplier: 0.4,
    hitboxRadius: 40,
    spawnWeights: { early: 0, mid: 0.02, late: 0.05 },
    appearsFromWave: 3,
    isBonus: true,

    draw(ctx, cx, cy, time) {
      // Subtle float
      const floatY = cy - 3 * Math.sin(time * 0.004);

      // Golden halo glow behind
      const glowAlpha = 0.15 + 0.2 * Math.sin(time * 0.019);
      const grad = ctx.createRadialGradient(cx, floatY, 0, cx, floatY, 50);
      grad.addColorStop(0, `rgba(255,215,0,${glowAlpha})`);
      grad.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, floatY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Head (dark brown circle, gorilla)
      ctx.beginPath();
      ctx.arc(cx, floatY, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#3d2b1f';
      ctx.fill();
      ctx.strokeStyle = '#2a1a10';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Muzzle (lighter brown, wide)
      ctx.beginPath();
      ctx.ellipse(cx, floatY + 6, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5a4030';
      ctx.fill();

      // Nostrils
      ctx.fillStyle = '#2a1a10';
      ctx.beginPath();
      ctx.ellipse(cx - 5, floatY + 6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 5, floatY + 6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (deep-set, wise)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 9, floatY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 9, floatY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 8, floatY - 7, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, floatY - 7, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Brow ridge
      ctx.strokeStyle = '#2a1a10';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 16, floatY - 10);
      ctx.quadraticCurveTo(cx, floatY - 16, cx + 16, floatY - 10);
      ctx.stroke();

      // Mouth (subtle)
      ctx.beginPath();
      ctx.arc(cx, floatY + 12, 5, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = '#2a1a10';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Golden halo (ring above head)
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(cx, floatY - 30, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Sparkles around halo
      const sparkleAngle = time * 0.003;
      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 4; i++) {
        const a = sparkleAngle + i * Math.PI / 2;
        const sx = cx + Math.cos(a) * 22;
        const sy = floatY - 30 + Math.sin(a) * 8;
        const size = 1.5 + Math.sin(time * 0.01 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
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
