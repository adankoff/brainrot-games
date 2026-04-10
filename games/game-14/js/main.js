/**
 * YOU DIED -- Main Entry Point
 * GameShell integration, auto-scroll, progress tracking, death/restart, theme switching.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { clamp } from '../../shared/utils.js';
import { getCurrentSkin } from '../../shared/skin-switcher.js';
import { THEMES, getThemeById } from './themes.js';
import {
  generateLevel,
  GROUND_Y,
  OBS_SPIKE,
  OBS_BLOCK,
  OBS_FLYING_SPIKE,
  OBS_GAP,
} from './level.js';
import {
  createPlayer,
  playerJump,
  updatePlayer,
  getPlayerWorldPos,
} from './player.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 600;
const GAME_ID = 'you-died';
const LEVEL_SEED = 42;

// Death screen timing
const DEATH_FLASH_FRAMES = 8;
const DEATH_FREEZE_FRAMES = 18;

// ---- Game State ----

let player = createPlayer();
let obstacles = generateLevel(LEVEL_SEED);
let progress = 0;
let tapFlag = false;
let audioInitialized = false;
let lastDeathMessage = '';

// Death animation state
let deathFlashTimer = 0;
let deathFreezeTimer = 0;
let deathTriggered = false;

// Particles for death effect
let deathParticles = [];

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'darksouls';
}

function saveTheme(id) {
  setData(GAME_ID, 'theme', id);
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: currentTheme.name,
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'you-died',
  subtitle: 'tap to jump. don\'t die.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-14/',
});

// ---- Sounds ----

function registerGameSounds() {
  registerSound('dash-jump', {
    notes: [
      { type: 'square', frequency: 300, endFrequency: 400, duration: 0.08, gain: 0.15 },
    ],
  });

  registerSound('dash-death', {
    notes: [
      { type: 'sawtooth', frequency: 250, endFrequency: 60, duration: 0.35, gain: 0.2 },
      { type: 'square', frequency: 80, duration: 0.2, delay: 0.1, gain: 0.15 },
    ],
  });
}

// ---- Callbacks ----

shell.onStart = () => {
  player = createPlayer();
  obstacles = generateLevel(LEVEL_SEED);
  progress = 0;
  tapFlag = false;
  deathFlashTimer = 0;
  deathFreezeTimer = 0;
  deathTriggered = false;
  deathParticles = [];
};

shell.onUpdate = (dt) => {
  const tapped = tapFlag;
  tapFlag = false;

  // Death freeze phase
  if (deathTriggered) {
    deathFreezeTimer -= dt;
    deathFlashTimer -= dt;

    // Update death particles
    for (const p of deathParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.3 * dt;
      p.alpha -= 0.02 * dt;
      if (p.alpha < 0) p.alpha = 0;
    }

    if (deathFreezeTimer <= 0) {
      // Transition to game-over screen
      shell.setState('game-over');
    }
    return;
  }

  // Handle jump input
  if (tapped) {
    playerJump(player);
    playSound('dash-jump');
  }

  // Update player physics and collision
  const result = updatePlayer(player, obstacles, dt);
  progress = result.progress;

  // Check for death
  if (result.dead && !deathTriggered) {
    deathTriggered = true;
    deathFlashTimer = DEATH_FLASH_FRAMES;
    deathFreezeTimer = DEATH_FREEZE_FRAMES;
    spawnDeathParticles();
    playSound('dash-death');
    return;
  }

  // Level complete
  if (progress >= 100 && !deathTriggered) {
    deathTriggered = true;
    deathFreezeTimer = DEATH_FREEZE_FRAMES;
    deathFlashTimer = 0;
  }
};

shell.onRender = (ctx) => {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  ctx.save();

  // ---- Background ----
  currentTheme.drawBackground(ctx, W, H, player.scrollX, progress);

  // ---- Ground with gaps ----
  drawGroundWithGaps(ctx, W, H);

  // ---- Obstacles ----
  drawObstacles(ctx);

  // ---- Player ----
  if (!deathTriggered || deathFreezeTimer > DEATH_FREEZE_FRAMES - 3) {
    const pos = getPlayerWorldPos(player);
    const skin = getCurrentSkin();
    if (skin) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(pos.rotation);
      if (!skin.drawAtOrigin(ctx, 'protagonist', pos.size, pos.size)) {
        ctx.restore();
        currentTheme.drawPlayer(ctx, pos.x, pos.y, pos.size, pos.rotation, progress);
      } else {
        ctx.restore();
      }
    } else {
      currentTheme.drawPlayer(ctx, pos.x, pos.y, pos.size, pos.rotation, progress);
    }
  }

  // ---- Death particles ----
  if (deathTriggered) {
    for (const p of deathParticles) {
      if (p.alpha <= 0) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ---- Death flash ----
  if (deathFlashTimer > 0) {
    const flashAlpha = clamp(deathFlashTimer / DEATH_FLASH_FRAMES, 0, 1) * 0.4;
    ctx.fillStyle = currentTheme.accentColor;
    ctx.globalAlpha = flashAlpha;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // ---- HUD ----
  drawHUD(ctx, W);

  ctx.restore();
};

shell.onGameOver = () => {
  const message = getDeathMessage(progress);
  return {
    score: progress,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

// ---- Drawing Functions ----

/**
 * Draw the ground, leaving gaps where OBS_GAP obstacles are.
 */
function drawGroundWithGaps(ctx, W, H) {
  // Collect gap positions in screen space
  const gaps = [];
  for (const obs of obstacles) {
    if (obs.type !== OBS_GAP) continue;
    const screenX = obs.x - player.scrollX;
    if (screenX + obs.w < 0 || screenX > W) continue;
    gaps.push({ x: screenX, w: obs.w });
  }

  // Draw ground segments around gaps
  if (gaps.length === 0) {
    currentTheme.drawGround(ctx, W, GROUND_Y, H, player.scrollX, progress);
  } else {
    // Sort gaps by x
    gaps.sort((a, b) => a.x - b.x);

    // Draw ground in segments, skipping gap areas
    ctx.save();
    ctx.beginPath();

    let lastX = 0;
    for (const gap of gaps) {
      const gapLeft = Math.max(0, gap.x);
      const gapRight = Math.min(W, gap.x + gap.w);
      if (gapLeft > lastX) {
        ctx.rect(lastX, GROUND_Y, gapLeft - lastX, H - GROUND_Y);
      }
      lastX = gapRight;
    }
    if (lastX < W) {
      ctx.rect(lastX, GROUND_Y, W - lastX, H - GROUND_Y);
    }

    ctx.clip();
    currentTheme.drawGround(ctx, W, GROUND_Y, H, player.scrollX, progress);
    ctx.restore();

    // Draw gap edges (danger borders)
    ctx.strokeStyle = currentTheme.accentColor;
    ctx.lineWidth = 2;
    for (const gap of gaps) {
      ctx.beginPath();
      ctx.moveTo(gap.x, GROUND_Y);
      ctx.lineTo(gap.x, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gap.x + gap.w, GROUND_Y);
      ctx.lineTo(gap.x + gap.w, H);
      ctx.stroke();
    }
  }
}

/**
 * Draw all visible obstacles.
 */
function drawObstacles(ctx) {
  const viewLeft = player.scrollX - 40;
  const viewRight = player.scrollX + LOGICAL_WIDTH + 40;

  for (const obs of obstacles) {
    if (obs.x + obs.w < viewLeft) continue;
    if (obs.x > viewRight) break;

    const screenX = obs.x - player.scrollX;

    switch (obs.type) {
      case OBS_SPIKE:
        currentTheme.drawSpike(ctx, screenX, obs.y, obs.w, obs.h);
        break;
      case OBS_BLOCK:
        currentTheme.drawBlock(ctx, screenX, obs.y, obs.w, obs.h);
        break;
      case OBS_FLYING_SPIKE:
        currentTheme.drawFlyingSpike(ctx, screenX, obs.y, obs.w, obs.h);
        break;
      // Gaps are handled in drawGroundWithGaps
    }
  }
}

/**
 * Draw the HUD: progress bar and percentage.
 */
function drawHUD(ctx, W) {
  const barY = 16;
  const barH = 8;
  const barMargin = 20;
  const barW = W - barMargin * 2;

  // Bar background
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(barMargin, barY, barW, barH);

  // Bar fill
  const fillW = (progress / 100) * barW;
  const barGrad = ctx.createLinearGradient(barMargin, 0, barMargin + barW, 0);
  barGrad.addColorStop(0, currentTheme.accentColor);
  barGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = barGrad;
  ctx.fillRect(barMargin, barY, fillW, barH);

  // Bar border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barMargin, barY, barW, barH);

  // Percentage text
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(`${progress}%`, W / 2 + 1, barY + barH + 6 + 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${progress}%`, W / 2, barY + barH + 6);
}

// ---- Death Particles ----

/**
 * Spawn particle effects at the player's death position.
 */
function spawnDeathParticles() {
  const pos = getPlayerWorldPos(player);
  const cx = pos.x + pos.size / 2;
  const cy = pos.y + pos.size / 2;
  const color = currentTheme.getPlayerColor(progress);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 2 + Math.random() * 4;
    deathParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 3 + Math.random() * 4,
      alpha: 1,
      color,
    });
  }
}

// ---- Death Messages ----

/**
 * Get a themed death message with percentage inserted.
 *
 * @param {number} pct - Death percentage
 * @returns {string}
 */
function getDeathMessage(pct) {
  if (pct >= 100) return 'level complete. you actually survived.';

  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;
  return msg.replace(/N%/g, `${pct}%`);
}

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTap(() => {
  tapFlag = true;
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game plays fine without sound
    }
  }
});

// ---- Theme Selector in Menu ----

setupThemeSelector();

function setupThemeSelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'theme-select';

    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.className = 'theme-select__btn';
      if (theme.id === currentTheme.id) {
        btn.classList.add('theme-select__btn--active');
      }
      btn.textContent = theme.name;
      btn.style.borderColor = theme.accentColor;

      btn.addEventListener('click', () => {
        currentTheme = theme;
        saveTheme(theme.id);

        // Update shell title
        const titleEl = document.querySelector('.menu-screen__title');
        if (titleEl) titleEl.textContent = theme.name;

        setupThemeSelector();
        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
