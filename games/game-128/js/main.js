/**
 * MEME TOWER -- Main Entry Point
 * Balance Tower game: swing a pendulum block and tap to drop.
 * Stack blocks, keep the tower balanced, score points.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { Tower } from './tower.js';
import { Renderer } from './renderer.js';

const W = 400;
const H = 700;

// ---- Game State ----

const tower = new Tower();
let input = null;
let unsubTap = null;

// Pendulum state
let pendulumAngle = 0;        // current swing angle in radians
let pendulumSpeed = 0.03;     // angular velocity per frame
let pendulumDirection = 1;     // 1 or -1
const ANCHOR_Y = 30;          // y of the pendulum anchor point
const ROPE_LENGTH = 60;       // visual rope length
const SWING_AMPLITUDE = 160;  // max horizontal swing from center

// Block currently swinging
let swingingWidth = 0;
let swingingColor = '';

// Dropping state
let dropping = false;
let dropX = 0;
let dropY = 0;
let dropSpeed = 0;
let dropTargetY = 0;

// Feedback
let feedbackType = '';
let feedbackAlpha = 0;
let feedbackY = 0;

// Instruction pulse
let instructionTime = 0;
let showInstruction = true;

// Game over delay
let gameOverTimer = 0;
let gameOverPending = false;

// ---- Sound Registration ----

function registerSounds() {
  registerSound('drop', {
    notes: [
      { type: 'sine', frequency: 220, endFrequency: 160, duration: 0.1, gain: 0.2 },
    ],
  });

  registerSound('perfect', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.3 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.08, gain: 0.3 },
      { type: 'triangle', frequency: 1047, duration: 0.12, delay: 0.16, gain: 0.25 },
    ],
  });

  registerSound('trim', {
    notes: [
      { type: 'sawtooth', frequency: 800, endFrequency: 200, duration: 0.08, gain: 0.15 },
      { type: 'square', frequency: 300, duration: 0.04, delay: 0.06, gain: 0.1 },
    ],
  });

  registerSound('topple', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 60, duration: 0.5, gain: 0.3 },
      { type: 'square', frequency: 80, duration: 0.3, delay: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 60, duration: 0.2, gain: 0.15, noise: true },
    ],
  });

  registerSound('stack', {
    notes: [
      { type: 'square', frequency: 350, duration: 0.06, gain: 0.2 },
      { type: 'sine', frequency: 280, duration: 0.04, delay: 0.04, gain: 0.15 },
    ],
  });
}

// ---- Pendulum Helpers ----

/** Get the current X center of the swinging block */
function getPendulumX() {
  return W / 2 + Math.sin(pendulumAngle) * SWING_AMPLITUDE;
}

/** Get the block Y position on the pendulum */
function getPendulumBlockY() {
  return ANCHOR_Y + ROPE_LENGTH;
}

/** Prepare the next swinging block */
function prepareNextBlock() {
  swingingWidth = tower.getNextBlockWidth();
  swingingColor = tower.getNextColor();
  pendulumAngle = 0;
  pendulumDirection = (Math.random() > 0.5) ? 1 : -1;
  dropping = false;

  // Speed increases with block count
  pendulumSpeed = 0.03 + tower.blockCount * 0.0015;
  pendulumSpeed = Math.min(pendulumSpeed, 0.09); // cap speed
}

// ---- Game Shell Setup ----

const shell = new GameShell({
  title: 'MEME TOWER',
  gameId: 'meme-tower',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'memetower',
  subtitle: 'stack it or lose it',
  accentColor: '#ff6b35',
  shareUrl: '',
});

// ---- Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  tower.reset();
  prepareNextBlock();

  feedbackType = '';
  feedbackAlpha = 0;
  instructionTime = 0;
  showInstruction = true;
  gameOverTimer = 0;
  gameOverPending = false;

  // Set up input
  const canvas = shell.getCanvas();
  if (input) input.destroy();
  input = createInputManager(canvas, W, H);

  if (unsubTap) unsubTap();
  unsubTap = input.onTap(handleTap);
};

shell.onUpdate = (dt) => {
  // Game over delay
  if (gameOverPending) {
    gameOverTimer += dt;
    tower.update(dt);
    // Fade feedback
    if (feedbackAlpha > 0) feedbackAlpha -= 0.02 * dt;
    if (gameOverTimer > 90) { // ~1.5 seconds
      shell.setState('game-over');
    }
    return;
  }

  // Pendulum swing
  if (!dropping) {
    pendulumAngle += pendulumSpeed * pendulumDirection * dt;

    // Bounce at edges
    if (pendulumAngle > Math.PI / 2) {
      pendulumAngle = Math.PI / 2;
      pendulumDirection = -1;
    } else if (pendulumAngle < -Math.PI / 2) {
      pendulumAngle = -Math.PI / 2;
      pendulumDirection = 1;
    }
  }

  // Block dropping animation
  if (dropping) {
    dropSpeed += 0.6 * dt; // gravity
    dropY += dropSpeed * dt;

    if (dropY >= dropTargetY) {
      dropY = dropTargetY;
      dropping = false;

      // Place the block
      const result = tower.placeBlock(dropX, swingingWidth);

      switch (result) {
        case 'perfect':
          playSound('perfect');
          feedbackType = 'perfect';
          feedbackAlpha = 1;
          feedbackY = dropTargetY;
          break;
        case 'trimmed':
          playSound('trim');
          feedbackType = 'trimmed';
          feedbackAlpha = 1;
          feedbackY = dropTargetY;
          break;
        case 'stacked':
          playSound('stack');
          feedbackType = 'stacked';
          feedbackAlpha = 1;
          feedbackY = dropTargetY;
          break;
        case 'missed':
          playSound('topple');
          gameOverPending = true;
          gameOverTimer = 0;
          feedbackType = 'trimmed';
          feedbackAlpha = 1;
          feedbackY = dropTargetY;
          return;
        case 'toppled':
          playSound('topple');
          gameOverPending = true;
          gameOverTimer = 0;
          return;
      }

      // Prepare next block
      prepareNextBlock();
    }
  }

  // Update tower physics
  tower.update(dt);

  // Fade feedback text
  if (feedbackAlpha > 0) {
    feedbackAlpha -= 0.02 * dt;
  }

  // Instruction pulse
  instructionTime += 0.05 * dt;
  if (tower.blockCount > 2) {
    showInstruction = false;
  }
};

shell.onRender = (ctx) => {
  // Background
  Renderer.drawBackground(ctx);

  // Tower
  Renderer.drawTower(ctx, tower);

  // Swinging/dropping block
  if (!gameOverPending) {
    if (dropping) {
      // Draw the dropping block
      const blockLeft = dropX - swingingWidth / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(blockLeft + 3, dropY + tower.cameraY + 3, swingingWidth, 28);
      ctx.fillStyle = swingingColor;
      ctx.fillRect(blockLeft, dropY + tower.cameraY, swingingWidth, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(blockLeft, dropY + tower.cameraY, swingingWidth, 3);
    } else {
      // Draw the pendulum
      const px = getPendulumX();
      const py = getPendulumBlockY();
      Renderer.drawPendulum(ctx, px, swingingWidth, swingingColor, W / 2, ANCHOR_Y, py);
    }
  }

  // Feedback text
  if (feedbackAlpha > 0) {
    Renderer.drawFeedback(ctx, feedbackType, feedbackAlpha, feedbackY, tower.cameraY);
  }

  // HUD
  Renderer.drawHUD(ctx, tower.score, tower.blockCount, tower.imbalance);

  // Instruction
  if (showInstruction && !dropping) {
    const pulse = Math.sin(instructionTime) * 0.5 + 0.5;
    Renderer.drawInstruction(ctx, pulse);
  }
};

shell.onGameOver = () => {
  if (input) {
    input.destroy();
    input = null;
  }
  if (unsubTap) {
    unsubTap();
    unsubTap = null;
  }

  const message = tower.toppled ? 'tower toppled!' : 'block missed!';

  return {
    score: tower.score,
    message: message,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  Renderer.drawBackground(ctx);
  Renderer.drawTower(ctx, tower);
};

// ---- Input Handler ----

function handleTap() {
  if (dropping || gameOverPending) return;

  initAudio();
  playSound('drop');

  // Release the block
  dropX = getPendulumX();
  dropY = getPendulumBlockY();
  dropSpeed = 0;
  dropTargetY = tower.getNextLandingY();
  dropping = true;
  showInstruction = false;
}

// ---- Boot ----

shell.init();
