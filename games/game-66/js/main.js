/**
 * WHACK-A-ROT -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound, toggleMute, isMuted } from '../../shared/sound-manager.js';
import { Hole } from './holes.js';
import { SpawnScheduler, GameTimer } from './game.js';
import { ComboCounter, ScoreDisplay, drawWaveProgress, drawMuteIcon } from './ui.js';
import { EffectsManager } from './effects.js';
import {
  CANVAS_W, CANVAS_H, WAVE_DURATION,
  getGameOverMessage, COLOR_VOID, COLOR_PRIMARY,
} from './constants.js';

// ---- Game State (module-scoped) ----
let holes = [];
let spawnScheduler = null;
let timer = null;
let combo = null;
let scoreDisplay = null;
let effects = null;
let score = 0;
let wave = 1;
let round = 0;
let effectiveWave = 1;
let gameTime = 0;
let hitStats = { tralalero: 0, bombardiro: 0, tungtung: 0, ballerina: 0, brrbrr: 0, lirili: 0 };
let pendingTaps = [];
let bgOffset = 0; // For drifting background

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'WHACK-A-ROT',
  gameId: 'whack-a-rot',
  logicalWidth: CANVAS_W,
  logicalHeight: CANVAS_H,
  maxDisplayWidth: 500,
  theme: 'italian-brainrot',
  subtitle: 'whack brainrot. earn aura. flex.',
  accentColor: '#ff3838',
  shareUrl: 'https://brainrotgames.com/games/game-02/',
});

// ---- Visibility change handler ----
function onVisibilityChange() {
  if (timer) {
    timer.setPaused(document.hidden);
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  round++;
  score = 0;
  wave = 1;
  effectiveWave = wave + (round - 1) * 2;
  gameTime = 0;

  holes = Array.from({ length: 9 }, (_, i) => new Hole(i));
  spawnScheduler = new SpawnScheduler();
  timer = new GameTimer();
  combo = new ComboCounter();
  scoreDisplay = new ScoreDisplay();
  effects = new EffectsManager();
  effects.initParticles(CANVAS_W, CANVAS_H);

  hitStats = { tralalero: 0, bombardiro: 0, tungtung: 0, ballerina: 0, brrbrr: 0, lirili: 0 };
  pendingTaps = [];

  document.addEventListener('visibilitychange', onVisibilityChange);
};

shell.onUpdate = (dt) => {
  const ms = dt * 16.67;
  gameTime += ms;

  // 1. Timer
  const gameOver = timer.update(dt);
  if (gameOver) {
    playSound('gameover');
    shell.setState('game-over');
    return;
  }

  // 2. Wave calculation
  const elapsedSeconds = 60 - timer.remaining;
  wave = Math.min(4, 1 + Math.floor(elapsedSeconds / WAVE_DURATION));
  effectiveWave = wave + (round - 1) * 2;

  // 3. Spawn scheduler
  spawnScheduler.update(dt, holes, effectiveWave);

  // 4. Hole updates
  for (const hole of holes) {
    const result = hole.update(dt);
    if (result && result.event === 'miss') {
      // Any miss resets combo (per GDD)
      combo.resetCombo();
      playSound('miss');
    }
  }

  // 5. Input processing
  for (const tap of pendingTaps) {
    let hitFound = false;

    // Process bottom row first for z-order (index 6,7,8 then 3,4,5 then 0,1,2)
    for (let row = 2; row >= 0; row--) {
      for (let col = 0; col < 3; col++) {
        const hole = holes[row * 3 + col];
        if (hole.isHit(tap.x, tap.y, gameTime)) {
          const result = hole.hit();
          if (result) {
            hitFound = true;

            if (result.characterType.isPenalty) {
              // Penalty hit
              score = Math.max(0, score + result.characterType.basePoints);
              combo.resetCombo();
              effects.startScreenShake(4, 300);
              effects.spawnFloatingText(
                String(result.characterType.basePoints),
                hole.x, hole.y - 60, '#ff3838', 600, 22
              );
              playSound('penalty');
              hitStats.brrbrr++;
            } else {
              // Good hit
              const milestoneResult = combo.increment();
              const points = combo.calculateScore(result.characterType.basePoints);
              score += points;
              effects.spawnFloatingText(
                '+' + points, hole.x, hole.y - 60, COLOR_PRIMARY, 500, 20
              );
              playSound(result.characterType.isBonus ? 'bonus' : 'hit');
              hitStats[result.characterType.id]++;

              if (milestoneResult.milestone) {
                effects.spawnFloatingText(
                  milestoneResult.milestone.text,
                  CANVAS_W / 2, 140,
                  milestoneResult.milestone.color, 800, 28
                );
                playSound('combo');
              }
            }
          }
          break;
        }
      }
      if (hitFound) break;
    }
  }
  pendingTaps = [];

  // 6. Score display update
  scoreDisplay.update(dt, score);

  // 7. Effects update
  effects.update(dt);

  // Background drift
  bgOffset += 0.2 * dt;
  if (bgOffset > 400) bgOffset -= 400;
};

shell.onRender = (ctx) => {
  // 1. Apply screen shake
  const shakeOffset = effects.getShakeOffset();
  ctx.save();
  ctx.translate(shakeOffset.x, shakeOffset.y);

  // 2. Background
  drawBackground(ctx, gameTime);

  // 3. Ambient particles
  effects.drawParticles(ctx);

  // 4. Holes and characters (top row first, bottom row last for overlap)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      holes[row * 3 + col].draw(ctx, gameTime);
    }
  }

  // 5. Restore screen shake
  ctx.restore();

  // 6. HUD (NOT affected by screen shake)
  scoreDisplay.draw(ctx, CANVAS_W, combo && combo.count >= 20);
  if (combo) combo.draw(ctx, CANVAS_W);
  if (timer) timer.draw(ctx, gameTime);
  drawMuteIcon(ctx, isMuted());

  // Wave progress
  const elapsedSeconds = 60 - timer.remaining;
  const currentWaveElapsed = elapsedSeconds - (wave - 1) * WAVE_DURATION;
  const waveProgress = Math.min(1, currentWaveElapsed / WAVE_DURATION);
  drawWaveProgress(ctx, wave, waveProgress, CANVAS_W);

  // 7. Floating text effects (above everything)
  effects.drawFloatingTexts(ctx);
};

shell.onGameOver = () => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  const message = getGameOverMessage(score);
  return {
    score,
    message,
    scoreLabel: 'aura points',
    extra: { hitStats, maxCombo: combo ? combo.maxCombo : 0 },
  };
};

// ---- Game-Over Canvas Rendering (hit stats behind overlay) ----
shell.onGameOverRender = (ctx) => {
  drawBackground(ctx, gameTime);

  // Draw holes in their final state
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      holes[row * 3 + col].draw(ctx, gameTime);
    }
  }
};

// ---- Background Drawing ----
function drawBackground(ctx, time) {
  // Base fill
  ctx.fillStyle = COLOR_VOID;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Mid background: radial gradient spotlight
  const spotGrad = ctx.createRadialGradient(CANVAS_W / 2, 340, 0, CANVAS_W / 2, 340, 300);
  spotGrad.addColorStop(0, '#0f0f18');
  spotGrad.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Far background: Italian cityscape silhouette (drifting)
  ctx.fillStyle = '#12121a';
  drawCityscapeSilhouette(ctx, bgOffset);

  // Ground plane strip
  ctx.fillStyle = '#13131d';
  ctx.fillRect(0, 490, CANVAS_W, 50);

  // Faint grid lines connecting holes
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#555570';
  ctx.lineWidth = 1;
  // Horizontal connections
  for (let row = 0; row < 3; row++) {
    const y = [227, 340, 453][row];
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(320, y);
    ctx.stroke();
  }
  // Vertical connections
  for (let col = 0; col < 3; col++) {
    const x = [80, 200, 320][col];
    ctx.beginPath();
    ctx.moveTo(x, 227);
    ctx.lineTo(x, 453);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCityscapeSilhouette(ctx, offset) {
  // Simple buildings drifting slowly left
  const buildings = [
    { x: 0, w: 30, h: 60 },
    { x: 40, w: 25, h: 80 },
    { x: 75, w: 20, h: 45 },
    { x: 105, w: 35, h: 70 },
    { x: 150, w: 15, h: 100 }, // Leaning tower reference
    { x: 175, w: 30, h: 55 },
    { x: 215, w: 25, h: 75 },
    { x: 250, w: 35, h: 50 },
    { x: 295, w: 20, h: 65 },
    { x: 325, w: 30, h: 85 },
    { x: 365, w: 25, h: 40 },
  ];

  const baseY = 540;
  for (const b of buildings) {
    let bx = ((b.x - offset) % 400);
    if (bx < -40) bx += 400;
    ctx.fillRect(bx, baseY - b.h, b.w, b.h);
  }

  // Leaning tower shape
  let towerX = ((155 - offset) % 400);
  if (towerX < -20) towerX += 400;
  ctx.beginPath();
  ctx.moveTo(towerX, baseY - 100);
  ctx.lineTo(towerX + 5, baseY - 120);
  ctx.lineTo(towerX + 15, baseY - 118);
  ctx.lineTo(towerX + 12, baseY - 100);
  ctx.closePath();
  ctx.fill();
}

// ---- Input Setup ----
shell.init();

const input = createInputManager(shell.getCanvas(), CANVAS_W, CANVAS_H);

let audioReady = false;
input.onTap(() => {
  initAudio();
  if (!audioReady) {
    audioReady = true;
    // Register game-specific sounds (miss sound not in shared presets)
    registerSound('miss', {
      notes: [
        { type: 'sine', frequency: 300, endFrequency: 200, duration: 0.15, gain: 0.15 },
      ],
    });
  }
});

input.onTapAt(({ x, y }) => {
  if (shell.state !== 'playing') return;

  // Mute icon tap area: top-left (4,4) to (44,44)
  if (x >= 4 && x <= 44 && y >= 4 && y <= 44) {
    initAudio();
    toggleMute();
    return; // Don't register as game tap
  }

  pendingTaps.push({ x, y });
});
