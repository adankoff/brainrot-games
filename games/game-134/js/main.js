/**
 * HEX MATCH -- Main Entry Point
 * Hexagonal tile matching puzzle. Rotate hexes until all adjacent edges match.
 * Fewer moves = higher score. Progressive levels increase difficulty.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import {
  createBoard, layoutTiles, rotateTileEdges, findTileAt,
  countMatches, isSolved, DIFFICULTIES, DEG60,
} from './hexmatch.js';
import {
  drawBackground, drawHexTile, drawHUD, drawWinEffect, drawFlash,
} from './renderer.js';

// ---- Constants ----

const W = 400;
const H = 700;
const GAME_ID = 'hexmatch';
const ROTATION_DURATION = 150; // ms for rotation animation

// ---- Game State ----

let tiles = [];
let startDifficulty = 'easy';  // Selected in menu
let activeDifficulty = 'easy'; // May escalate during gameplay
let diffConfig = DIFFICULTIES[startDifficulty];
let hexSize = 40;
let moves = 0;
let totalScore = 0;
let level = 1;
let matched = 0;
let totalEdges = 0;
let boardSolved = false;

// Animation state
let animatingTile = null;
let animStartTime = 0;
let animStartRotation = 0;

// Win state
let winAlpha = 0;
let winTimer = 0;
const WIN_DELAY_MS = 1500;

// Flash
let flashColor = '';
let flashAlpha = 0;

// Pulse phase for solved animation
let pulsePhase = 0;

// Audio
let audioReady = false;

// ---- Hex size calculation ----

function calcHexSize(cols, rows) {
  // Pointy-top hex: width = sqrt(3)*size, height = 2*size
  // Grid width ~ sqrt(3)*size * cols + sqrt(3)/2*size * (rows-1) padding from axial offset
  // Grid height ~ 1.5*size * (rows-1) + 2*size
  const maxW = W - 60;
  const maxH = H - 140;
  const sqrt3 = Math.sqrt(3);

  // Estimate size from width: total width ~ sqrt3 * size * (cols + rows*0.5)
  const sizeFromW = maxW / (sqrt3 * (cols + (rows - 1) * 0.5));
  // Estimate size from height: total height ~ 1.5 * size * (rows - 1) + 2 * size
  const sizeFromH = maxH / (1.5 * (rows - 1) + 2);

  return Math.min(sizeFromW, sizeFromH, 50);
}

// ---- Score calculation ----

function calcScore(movesUsed, totalPairs, lvl) {
  const base = Math.max(5000 - movesUsed * 20, 100);
  const levelBonus = (lvl - 1) * 500;
  const diffMult = activeDifficulty === 'hard' ? 2.0 : activeDifficulty === 'medium' ? 1.5 : 1.0;
  return Math.round((base + levelBonus) * diffMult);
}

// ---- Board setup ----

function setupBoard() {
  diffConfig = DIFFICULTIES[activeDifficulty];
  hexSize = calcHexSize(diffConfig.cols, diffConfig.rows);
  tiles = createBoard(diffConfig);
  layoutTiles(tiles, W, H, hexSize, diffConfig.cols, diffConfig.rows);

  const counts = countMatches(tiles);
  matched = counts.matched;
  totalEdges = counts.total;
  boardSolved = false;
  winAlpha = 0;
  winTimer = 0;
  animatingTile = null;
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'HEX MATCH',
  gameId: GAME_ID,
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'hexmatch',
  subtitle: 'rotate hexes until every edge matches. fewer moves = bigger brain.',
  accentColor: '#00e5ff',
  shareUrl: '',
});

// ---- Custom Sounds ----

function registerGameSounds() {
  registerSound('rotate', {
    notes: [
      { type: 'sine', frequency: 440, endFrequency: 520, duration: 0.08, gain: 0.1 },
      { type: 'triangle', frequency: 660, duration: 0.04, delay: 0.04, gain: 0.06 },
    ],
  });

  registerSound('match', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.1, gain: 0.12 },
      { type: 'sine', frequency: 880, duration: 0.1, delay: 0.08, gain: 0.12 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.12, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.12, delay: 0.2, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.25 },
    ],
  });
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  moves = 0;
  totalScore = 0;
  level = 1;
  flashAlpha = 0;
  pulsePhase = 0;
  activeDifficulty = startDifficulty;
  setupBoard();
};

shell.onUpdate = (dt) => {
  pulsePhase += 0.05 * dt;

  // Decay flash
  if (flashAlpha > 0) {
    flashAlpha -= 0.04 * dt;
    if (flashAlpha < 0) flashAlpha = 0;
  }

  // Handle rotation animation
  if (animatingTile) {
    const now = performance.now();
    const elapsed = now - animStartTime;
    const progress = Math.min(elapsed / ROTATION_DURATION, 1);

    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    animatingTile.rotation = animStartRotation + DEG60 * eased;

    if (progress >= 1) {
      // Apply logical edge rotation and reset visual rotation to 0.
      // The visual rotation of DEG60 is equivalent to shifting edge indices by 1,
      // so resetting rotation after shifting edges produces no visible jump.
      rotateTileEdges(animatingTile);
      animatingTile.rotation = 0;
      animatingTile = null;

      // Check matches after rotation completes
      const counts = countMatches(tiles);
      const newMatched = counts.matched;

      // Play match sound if we gained matches
      if (newMatched > matched && audioReady) {
        playSound('match');
        flashColor = '#00e5ff';
        flashAlpha = 0.1;
      }

      matched = newMatched;
      totalEdges = counts.total;

      // Check win
      if (matched === totalEdges && !boardSolved) {
        boardSolved = true;
        winTimer = 0;
        if (audioReady) playSound('win');
      }
    }
  }

  // Handle win state
  if (boardSolved) {
    winAlpha = Math.min(winAlpha + 0.02 * dt, 0.4);
    winTimer += dt * 16.67;

    if (winTimer >= WIN_DELAY_MS) {
      // Level up or end game
      const levelScore = calcScore(moves, totalEdges, level);
      totalScore += levelScore;
      level++;

      // Progress difficulty automatically
      if (level <= 3) {
        // Keep starting difficulty
      } else if (level <= 6 && activeDifficulty === 'easy') {
        activeDifficulty = 'medium';
      } else if (level > 6 && activeDifficulty === 'medium') {
        activeDifficulty = 'hard';
      }

      // After level 10, game over
      if (level > 10) {
        shell.setState('game-over');
        return;
      }

      moves = 0;
      setupBoard();
    }
  }
};

shell.onRender = (ctx) => {
  drawBackground(ctx, W, H);

  // Draw all tiles
  for (const tile of tiles) {
    drawHexTile(ctx, tile, hexSize, tiles, boardSolved, pulsePhase);
  }

  // HUD
  drawHUD(ctx, W, moves, matched, totalEdges, level);

  // Score display
  if (totalScore > 0) {
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`SCORE: ${totalScore}`, W / 2, H - 20);
  }

  // Difficulty label
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText(diffConfig.label.toUpperCase(), W / 2, H - 6);

  // Win effect
  drawWinEffect(ctx, W, H, winAlpha);

  // Flash
  drawFlash(ctx, W, H, flashColor, flashAlpha);

  // Win text
  if (boardSolved) {
    ctx.save();
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(0, 229, 255, ${Math.min(winAlpha * 2.5, 1)})`;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 20;
    ctx.fillText('SOLVED!', W / 2, H / 2 + (H * 0.35));
    ctx.shadowBlur = 0;
    ctx.restore();
  }
};

shell.onGameOver = () => {
  return {
    score: totalScore,
    message: level > 10 ? 'you cleared all 10 levels. absolute unit.' : 'gg',
    scoreLabel: 'total score',
  };
};

shell.onGameOverRender = (ctx) => {
  drawBackground(ctx, W, H);
  for (const tile of tiles) {
    drawHexTile(ctx, tile, hexSize, tiles, true, pulsePhase);
  }
};

// ---- Input Handling ----

function handleTap(pos) {
  if (shell.state !== 'playing') return;
  if (boardSolved) return;
  if (animatingTile) return; // Wait for current animation

  const tile = findTileAt(tiles, pos.x, pos.y, hexSize);
  if (!tile) return;

  // Start rotation animation (logical edge rotation deferred until animation completes)
  animatingTile = tile;
  animStartTime = performance.now();
  animStartRotation = 0; // Always starts from 0 since we reset after each rotation
  moves++;

  if (audioReady) playSound('rotate');
}

// ---- Initialize ----

shell.init();

const canvas = shell.getCanvas();
const input = createInputManager(canvas, W, H);

// Audio init on first interaction
input.onTap(() => {
  if (!audioReady) {
    try {
      initAudio();
      registerGameSounds();
      audioReady = true;
    } catch {
      // Audio failed -- game still plays fine
    }
  }
});

// Tap to rotate hex
input.onTapAt(handleTap);

// ---- Difficulty Selector in Menu ----

setupDifficultySelector();

function setupDifficultySelector() {
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    for (const [key, config] of Object.entries(DIFFICULTIES)) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (key === startDifficulty) {
        btn.classList.add('difficulty-select__btn--active');
      }
      btn.textContent = config.label;

      btn.addEventListener('click', () => {
        startDifficulty = key;
        diffConfig = DIFFICULTIES[key];
        setData(GAME_ID, 'difficulty', key);
        setupDifficultySelector();
        if (audioReady) playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}

// Load saved difficulty
const savedDiff = getData(GAME_ID, 'difficulty');
if (savedDiff && DIFFICULTIES[savedDiff]) {
  startDifficulty = savedDiff;
  diffConfig = DIFFICULTIES[savedDiff];
  setupDifficultySelector();
}
