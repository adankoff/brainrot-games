/**
 * MEME LAUNCH -- Main Game Module
 * Angry Birds style slingshot launcher with block destruction.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { randomInt, randomBetween } from '../../shared/utils.js';
import { createLauncher } from './launcher.js';
import {
  drawBackground,
  drawBlock,
  drawTarget,
  drawHUD,
  drawLevelText,
  drawScorePopups,
  GROUND_Y_EXPORT,
} from './renderer.js';

const W = 400;
const H = 700;
const GROUND_Y = GROUND_Y_EXPORT;
const TARGET_RADIUS = 18;
const SPLASH_RADIUS = 60;
const SPLASH_DAMAGE = 1;
const PROJECTILES_PER_LEVEL = 3;

// Game state
let launcher = null;
let blocks = [];
let target = null;
let score = 0;
let level = 0;
let projectilesLeft = 0;
let gamePhase = 'aiming'; // 'aiming', 'flying', 'settling', 'levelTransition', 'win', 'lose'
let settleTimer = 0;
let levelTextTimer = 0;
let levelTextAlpha = 0;
let levelText = '';
let scorePopups = [];
let totalScore = 0;
let waitForReload = 0;
let audioInited = false;
let lastPullDist = 0;
let stretchCooldown = 0;

// Input tracking for drag
let pointerDown = false;
let pointerX = 0;
let pointerY = 0;

const shell = new GameShell({
  title: 'MEME LAUNCH',
  gameId: 'meme-launch',
  logicalWidth: W,
  logicalHeight: H,
  subtitle: 'pull back. aim. yeet.',
  accentColor: '#ff6b35',
  theme: 'meme-launch',
});

// ---- Sound Registration ----
function registerSounds() {
  registerSound('stretch', {
    notes: [
      { type: 'sine', frequency: 120, endFrequency: 180, duration: 0.08, gain: 0.06 },
    ],
  });

  registerSound('launch', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 500, duration: 0.15, gain: 0.15 },
      { type: 'sine', frequency: 300, endFrequency: 600, duration: 0.1, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('hit', {
    notes: [
      { type: 'square', frequency: 220, endFrequency: 120, duration: 0.1, gain: 0.2 },
      { type: 'sine', frequency: 150, duration: 0.05, gain: 0.15, noise: true },
    ],
  });

  registerSound('destroy', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 80, duration: 0.2, gain: 0.2 },
      { type: 'sine', frequency: 200, duration: 0.1, delay: 0.05, gain: 0.15, noise: true },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.36, gain: 0.25 },
    ],
  });

  registerSound('miss', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 80, duration: 0.3, gain: 0.12 },
    ],
  });
}

// ---- Level Generation ----
function generateLevel(lvl) {
  blocks = [];
  const blockCount = Math.min(3 + lvl, 12);

  // Block placement area: right side of screen
  const areaLeft = 220;
  const areaRight = 370;
  const blockW = 35;
  const blockH = 25;

  // Build columns of blocks
  const numColumns = Math.min(Math.ceil(blockCount / 3), 4);
  const colSpacing = (areaRight - areaLeft) / (numColumns + 1);

  let placed = 0;
  for (let col = 0; col < numColumns && placed < blockCount; col++) {
    const colX = areaLeft + colSpacing * (col + 1) - blockW / 2;
    const stackHeight = randomInt(1, Math.min(4, blockCount - placed));

    for (let row = 0; row < stackHeight && placed < blockCount; row++) {
      const bx = colX + randomBetween(-5, 5);
      const by = GROUND_Y - blockH * (row + 1);
      const type = lvl > 3 && Math.random() < 0.3 ? 'stone' : 'wood';
      const maxHp = type === 'stone' ? 3 : 2;

      blocks.push({
        x: bx,
        y: by,
        w: blockW,
        h: blockH,
        hp: maxHp,
        maxHp,
        type,
        destroyed: false,
        shakeTimer: 0,
        fallVy: 0,
        falling: false,
      });
      placed++;
    }
  }

  // Some horizontal platform blocks on top of stacks
  if (lvl >= 2 && blocks.length >= 4) {
    const topBlocks = blocks.filter(b => {
      const above = blocks.some(
        other => other !== b && !other.destroyed &&
        Math.abs(other.x - b.x) < blockW &&
        other.y < b.y && other.y > b.y - blockH * 2
      );
      return !above;
    });

    if (topBlocks.length >= 2) {
      const platformCount = Math.min(Math.floor(topBlocks.length / 2), 2);
      for (let i = 0; i < platformCount; i++) {
        const base = topBlocks[i * 2];
        if (base) {
          blocks.push({
            x: base.x - 10,
            y: base.y - blockH,
            w: blockW + 20,
            h: blockH * 0.6,
            hp: 1,
            maxHp: 1,
            type: 'wood',
            destroyed: false,
            shakeTimer: 0,
            fallVy: 0,
            falling: false,
          });
        }
      }
    }
  }

  // Place target behind the blocks (rightmost)
  const rightmostBlock = blocks.reduce((best, b) => b.x + b.w > (best ? best.x + best.w : 0) ? b : best, null);
  const targetX = rightmostBlock
    ? Math.min(rightmostBlock.x + rightmostBlock.w + TARGET_RADIUS + 5, W - TARGET_RADIUS - 5)
    : areaRight;
  const targetY = GROUND_Y - TARGET_RADIUS;

  target = {
    x: targetX,
    y: targetY,
    radius: TARGET_RADIUS,
    destroyed: false,
    shakeTimer: 0,
    hp: 2 + Math.floor(lvl / 3),
    maxHp: 2 + Math.floor(lvl / 3),
  };
}

// ---- Collision Detection ----
function checkProjectileBlockCollision(proj, block) {
  if (block.destroyed) return false;
  // Circle vs AABB
  const closestX = Math.max(block.x, Math.min(proj.x, block.x + block.w));
  const closestY = Math.max(block.y, Math.min(proj.y, block.y + block.h));
  const dx = proj.x - closestX;
  const dy = proj.y - closestY;
  return (dx * dx + dy * dy) <= (proj.radius * proj.radius);
}

function checkProjectileTargetCollision(proj, tgt) {
  if (tgt.destroyed) return false;
  const dx = proj.x - tgt.x;
  const dy = proj.y - tgt.y;
  const dist = dx * dx + dy * dy;
  return dist <= (proj.radius + tgt.radius) * (proj.radius + tgt.radius);
}

// ---- Damage & Effects ----
function damageBlock(block, dmg) {
  if (block.destroyed) return false;
  block.hp -= dmg;
  block.shakeTimer = 10;
  if (block.hp <= 0) {
    block.destroyed = true;
    score += 10;
    totalScore += 10;
    launcher.spawnParticles(
      block.x + block.w / 2,
      block.y + block.h / 2,
      block.type === 'stone' ? '#90A4AE' : '#8D6E63',
      8
    );
    scorePopups.push({
      x: block.x + block.w / 2,
      y: block.y,
      value: 10,
      life: 1,
      color: '#FFD700',
    });
    playSound('destroy');
    return true;
  }
  playSound('hit');
  return false;
}

function damageTarget(tgt, dmg) {
  if (tgt.destroyed) return false;
  tgt.hp -= dmg;
  tgt.shakeTimer = 10;
  if (tgt.hp <= 0) {
    tgt.destroyed = true;
    score += 200;
    totalScore += 200;
    launcher.spawnParticles(tgt.x, tgt.y, '#4CAF50', 15);
    scorePopups.push({
      x: tgt.x,
      y: tgt.y - 20,
      value: 200,
      life: 1.5,
      color: '#FF5722',
    });
    playSound('win');
    return true;
  }
  playSound('hit');
  return false;
}

function applySplashDamage(px, py) {
  for (const block of blocks) {
    if (block.destroyed) continue;
    const cx = block.x + block.w / 2;
    const cy = block.y + block.h / 2;
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < SPLASH_RADIUS) {
      damageBlock(block, SPLASH_DAMAGE);
    }
  }
  // Also splash the target
  if (!target.destroyed) {
    const dx = px - target.x;
    const dy = py - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < SPLASH_RADIUS) {
      damageTarget(target, SPLASH_DAMAGE);
    }
  }
}

// ---- Block Physics (falling unsupported blocks) ----
function updateBlockPhysics(dt) {
  for (const block of blocks) {
    if (block.destroyed) continue;

    block.shakeTimer = Math.max(0, block.shakeTimer - dt);

    // Check if block is supported
    const onGround = block.y + block.h >= GROUND_Y - 1;
    if (onGround) {
      block.falling = false;
      block.fallVy = 0;
      if (block.y + block.h > GROUND_Y) {
        block.y = GROUND_Y - block.h;
      }
      continue;
    }

    // Check if any block below supports this one
    const supported = blocks.some(other => {
      if (other === block || other.destroyed) return false;
      const overlapX = block.x + block.w > other.x + 2 && block.x < other.x + other.w - 2;
      const touching = Math.abs((block.y + block.h) - other.y) < 3;
      return overlapX && touching;
    });

    if (!supported) {
      block.falling = true;
      block.fallVy += 0.3 * dt;
      block.y += block.fallVy * dt;

      // Land on ground
      if (block.y + block.h >= GROUND_Y) {
        block.y = GROUND_Y - block.h;
        block.falling = false;
        block.fallVy = 0;
      }

      // Land on another block
      for (const other of blocks) {
        if (other === block || other.destroyed) continue;
        const overlapX = block.x + block.w > other.x + 2 && block.x < other.x + other.w - 2;
        if (overlapX && block.y + block.h >= other.y && block.y + block.h < other.y + other.h / 2) {
          block.y = other.y - block.h;
          block.falling = false;
          block.fallVy = 0;
          break;
        }
      }
    }
  }

  // Target shake
  if (target && !target.destroyed) {
    target.shakeTimer = Math.max(0, target.shakeTimer - dt);
  }
}

// ---- Input Handling ----
function setupInput(canvas) {
  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  }

  function handleDown(cx, cy) {
    if (!audioInited) {
      initAudio();
      registerSounds();
      audioInited = true;
    }

    const pos = toLogical(cx, cy);
    if (gamePhase === 'aiming' && launcher.isLoaded()) {
      if (launcher.startDrag(pos.x, pos.y)) {
        pointerDown = true;
        pointerX = pos.x;
        pointerY = pos.y;
      }
    }
  }

  function handleMove(cx, cy) {
    if (!pointerDown) return;
    const pos = toLogical(cx, cy);
    pointerX = pos.x;
    pointerY = pos.y;
    launcher.moveDrag(pos.x, pos.y);

    // Stretch sound feedback
    const pull = launcher.getPullDistance();
    if (pull > 20 && stretchCooldown <= 0 && Math.abs(pull - lastPullDist) > 8) {
      playSound('stretch');
      lastPullDist = pull;
      stretchCooldown = 5;
    }
  }

  function handleUp() {
    if (!pointerDown) return;
    pointerDown = false;
    if (gamePhase === 'aiming') {
      const launched = launcher.releaseDrag();
      if (launched) {
        playSound('launch');
        projectilesLeft--;
        gamePhase = 'flying';
      }
    }
  }

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleDown(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', () => {
    handleUp();
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleDown(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleMove(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleUp();
  }, { passive: false });
}

// ---- Start Level ----
function startLevel(lvl) {
  level = lvl;
  score = 0;
  projectilesLeft = PROJECTILES_PER_LEVEL;
  launcher = createLauncher();
  generateLevel(lvl);
  gamePhase = 'levelTransition';
  levelText = `LEVEL ${lvl}`;
  levelTextTimer = 90; // frames
  levelTextAlpha = 1;
}

// ---- Shell Callbacks ----
let inputSetup = false;

shell.onStart = () => {
  totalScore = 0;
  level = 0;

  if (!inputSetup) {
    setupInput(shell.getCanvas());
    inputSetup = true;
  }

  if (!audioInited) {
    initAudio();
    registerSounds();
    audioInited = true;
  }

  startLevel(1);
};

shell.onUpdate = (dt) => {
  stretchCooldown = Math.max(0, stretchCooldown - dt);

  // Update score popups
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const p = scorePopups[i];
    p.life -= dt * 0.02;
    p.y -= dt * 0.8;
    if (p.life <= 0) {
      scorePopups.splice(i, 1);
    }
  }

  // Level transition
  if (gamePhase === 'levelTransition') {
    levelTextTimer -= dt;
    levelTextAlpha = Math.min(1, levelTextTimer / 30);
    if (levelTextTimer <= 0) {
      gamePhase = 'aiming';
    }
    launcher.update(dt);
    updateBlockPhysics(dt);
    return;
  }

  // Flying projectile
  if (gamePhase === 'flying') {
    const proj = launcher.update(dt);

    if (proj && proj.active) {
      // Check collisions with blocks
      let hitSomething = false;
      for (const block of blocks) {
        if (checkProjectileBlockCollision(proj, block)) {
          damageBlock(block, 2);
          applySplashDamage(proj.x, proj.y);
          launcher.spawnParticles(proj.x, proj.y, '#FF9800', 10);
          proj.active = false;
          hitSomething = true;
          break;
        }
      }

      // Check collision with target
      if (!hitSomething && checkProjectileTargetCollision(proj, target)) {
        damageTarget(target, 2);
        applySplashDamage(proj.x, proj.y);
        launcher.spawnParticles(proj.x, proj.y, '#FF5722', 12);
        proj.active = false;
        hitSomething = true;
      }

      // Check ground collision
      if (!hitSomething && proj.y + proj.radius >= GROUND_Y) {
        proj.active = false;
        applySplashDamage(proj.x, GROUND_Y);
        launcher.spawnParticles(proj.x, GROUND_Y, '#795548', 6);
        playSound('miss');
      }
    }

    // Projectile finished
    if (proj && !proj.active) {
      gamePhase = 'settling';
      settleTimer = 40;
    }

    updateBlockPhysics(dt);
    return;
  }

  // Settling after impact
  if (gamePhase === 'settling') {
    launcher.update(dt);
    updateBlockPhysics(dt);
    settleTimer -= dt;

    if (settleTimer <= 0) {
      // Check win condition
      if (target.destroyed) {
        // Award bonus for remaining projectiles
        const bonus = projectilesLeft * 50;
        totalScore += bonus;
        score += bonus;
        if (bonus > 0) {
          scorePopups.push({
            x: W / 2,
            y: H / 2,
            value: bonus,
            life: 1.5,
            color: '#00E676',
          });
        }

        // Next level
        waitForReload = 60;
        gamePhase = 'win';
        return;
      }

      // No projectiles left
      if (projectilesLeft <= 0) {
        gamePhase = 'lose';
        waitForReload = 60;
        playSound('miss');
        return;
      }

      // Reload
      launcher.reload();
      gamePhase = 'aiming';
    }
    return;
  }

  // Win -- advance to next level
  if (gamePhase === 'win') {
    launcher.update(dt);
    updateBlockPhysics(dt);
    waitForReload -= dt;
    if (waitForReload <= 0) {
      startLevel(level + 1);
    }
    return;
  }

  // Lose -- game over
  if (gamePhase === 'lose') {
    launcher.update(dt);
    updateBlockPhysics(dt);
    waitForReload -= dt;
    if (waitForReload <= 0) {
      shell.setState('game-over');
    }
    return;
  }

  // Aiming phase
  launcher.update(dt);
  updateBlockPhysics(dt);
};

shell.onRender = (ctx) => {
  ctx.clearRect(0, 0, W, H);

  // Background
  drawBackground(ctx);

  // Blocks
  for (const block of blocks) {
    drawBlock(ctx, block);
  }

  // Target
  if (target) {
    drawTarget(ctx, target);
  }

  // Launcher (slingshot + projectile)
  if (launcher) {
    launcher.render(ctx, projectilesLeft);
  }

  // HUD
  drawHUD(ctx, totalScore, level);

  // Score popups
  drawScorePopups(ctx, scorePopups);

  // Level transition text
  if (gamePhase === 'levelTransition' && levelTextAlpha > 0) {
    drawLevelText(ctx, levelText, levelTextAlpha);
  }

  // Win text
  if (gamePhase === 'win') {
    drawLevelText(ctx, 'TARGET DOWN!', Math.min(1, waitForReload / 20));
  }

  // Lose text
  if (gamePhase === 'lose') {
    drawLevelText(ctx, 'NO AMMO LEFT', Math.min(1, waitForReload / 20));
  }
};

shell.onGameOver = () => {
  const finalScore = totalScore;
  const levelsCleared = level - 1;
  return {
    score: finalScore,
    message: `reached level ${level} | ${levelsCleared} cleared`,
    scoreLabel: 'total score',
  };
};

shell.onGameOverRender = (ctx) => {
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx);

  // Draw remaining blocks and target in frozen state
  for (const block of blocks) {
    drawBlock(ctx, block);
  }
  if (target) {
    drawTarget(ctx, target);
  }

  // Dim overlay
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, W, H);
};

// ---- Boot ----
shell.init();
