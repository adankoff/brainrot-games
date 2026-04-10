/**
 * CLASSIC MEME WHACK -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 * Single theme: Classic Memes (no theme selector).
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
let hitStats = { trollface: 0, doge: 0, nyancat: 0, pepe: 0, rickroll: 0, harambe: 0 };
let pendingTaps = [];
let bgOffset = 0; // For drifting background

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'CLASSIC MEME WHACK',
  gameId: 'classic-meme-whack',
  logicalWidth: CANVAS_W,
  logicalHeight: CANVAS_H,
  maxDisplayWidth: 500,
  theme: 'classic-memes',
  subtitle: 'whack trollface. bonk doge. dodge the rickroll.',
  accentColor: '#ff6600',
  shareUrl: 'https://brainrotgames.com/games/game-23/',
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

  hitStats = { trollface: 0, doge: 0, nyancat: 0, pepe: 0, rickroll: 0, harambe: 0 };
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
      // Any miss resets combo
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
              // Penalty hit -- rickrolled!
              score = Math.max(0, score + result.characterType.basePoints);
              combo.resetCombo();
              effects.startScreenShake(4, 300);
              effects.spawnFloatingText(
                String(result.characterType.basePoints),
                hole.x, hole.y - 60, '#ff3838', 600, 22
              );
              // "Never gonna give you up!" text
              effects.spawnFloatingText(
                'RICKROLLED!',
                hole.x, hole.y - 90, '#ff6600', 800, 16
              );
              playSound('penalty');
              hitStats.rickroll++;
            } else {
              // Good hit
              const milestoneResult = combo.increment();
              const points = combo.calculateScore(result.characterType.basePoints);
              score += points;
              effects.spawnFloatingText(
                '+' + points, hole.x, hole.y - 60, COLOR_PRIMARY, 500, 20
              );

              // Special text for Harambe
              if (result.characterType.id === 'harambe') {
                effects.spawnFloatingText(
                  'RIP', hole.x, hole.y - 90, '#ffd700', 800, 18
                );
              }

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
    scoreLabel: 'meme points',
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
  // Base fill: white grid paper
  ctx.fillStyle = COLOR_VOID;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid lines (graph paper effect)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#aaaacc';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < CANVAS_W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.restore();

  // Subtle meme watermark text drifting
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.font = '16px Bungee, sans-serif';
  ctx.fillStyle = '#666688';
  ctx.textAlign = 'center';
  const watermarks = ['LOL', 'ROFL', 'XD', 'DANK', 'KEK', 'RIP', 'F', 'GG', 'EPIC'];
  for (let i = 0; i < watermarks.length; i++) {
    const wx = ((i * 67 + bgOffset * 0.5) % (CANVAS_W + 60)) - 30;
    const wy = 80 + (i * 73) % (CANVAS_H - 100);
    ctx.fillText(watermarks[i], wx, wy);
  }
  ctx.restore();

  // Faint grid lines connecting holes
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#8888aa';
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
