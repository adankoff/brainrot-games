/**
 * MEME PAC -- Main game entry point
 * Pac-Man clone with 15x15 maze, 4 ghosts, power pellets.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { render } from './renderer.js';
import {
  createMaze, countDots, createPacMan, createGhosts,
  updatePacMan, updateGhost, DIR, DX, DY, CELL, MAZE_X, MAZE_Y,
  COLS, ROWS,
} from './pacman.js';

const W = 400;
const H = 700;

// ---- Sound Registration ----

function registerGameSounds() {
  registerSound('chomp', {
    notes: [
      { type: 'sine', frequency: 200, endFrequency: 300, duration: 0.05, gain: 0.15 },
    ],
  });

  registerSound('powerUp', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 800, duration: 0.15, gain: 0.2 },
      { type: 'triangle', frequency: 600, endFrequency: 1200, duration: 0.15, delay: 0.1, gain: 0.15 },
    ],
  });

  registerSound('eatGhost', {
    notes: [
      { type: 'square', frequency: 300, endFrequency: 900, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 600, endFrequency: 1200, duration: 0.1, delay: 0.1, gain: 0.15 },
    ],
  });

  registerSound('death', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 80, duration: 0.5, gain: 0.2 },
      { type: 'sine', frequency: 200, endFrequency: 40, duration: 0.3, delay: 0.2, gain: 0.15 },
    ],
  });

  registerSound('levelUp', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.08, delay: 0.16, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.15, delay: 0.24, gain: 0.25 },
    ],
  });
}

// ---- Game State ----

let state = {};

function resetState(level = 1) {
  const maze = createMaze();
  state = {
    maze,
    pac: createPacMan(),
    ghosts: createGhosts(),
    score: state.score || 0,
    lives: state.lives !== undefined ? state.lives : 3,
    level,
    dotsRemaining: countDots(maze),
    powerTimer: 0,
    ghostCombo: 0,
    deathTimer: 0,
    readyTimer: 90, // ~1.5 seconds
    chompCooldown: 0,
    floatingTexts: [],
    frozen: false,
    freezeTimer: 0,
  };

  // Scale ghost speed by level
  const speedBoost = 1 + (level - 1) * 0.08;
  for (const ghost of state.ghosts) {
    ghost.speed = 0.06 * Math.min(speedBoost, 1.8);
  }
}

function newGame() {
  state.score = 0;
  state.lives = 3;
  resetState(1);
}

// ---- Input ----

const keys = {};

function setupInput() {
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Also initialize audio on first input
    initAudio();

    switch (e.code) {
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        if (state.pac) state.pac.nextDir = DIR.RIGHT;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        if (state.pac) state.pac.nextDir = DIR.LEFT;
        break;
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        if (state.pac) state.pac.nextDir = DIR.UP;
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        if (state.pac) state.pac.nextDir = DIR.DOWN;
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Touch/swipe controls
  let touchStartX = 0;
  let touchStartY = 0;

  const canvas = document.getElementById('game-canvas');

  canvas.addEventListener('touchstart', (e) => {
    initAudio();
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 10) return; // tap, not swipe

    if (absDx > absDy) {
      state.pac.nextDir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
    } else {
      state.pac.nextDir = dy > 0 ? DIR.DOWN : DIR.UP;
    }
    e.preventDefault();
  }, { passive: false });
}

// ---- Floating Text ----

function addFloatingText(text, col, row) {
  state.floatingTexts.push({
    text,
    x: MAZE_X + col * CELL + CELL / 2,
    y: MAZE_Y + row * CELL + CELL / 2,
    life: 45,
  });
}

// ---- Game Logic ----

function update(dt) {
  // Ready countdown
  if (state.readyTimer > 0) {
    state.readyTimer -= dt;
    return;
  }

  // Death animation
  if (state.deathTimer > 0) {
    state.deathTimer -= dt;
    if (state.deathTimer <= 0) {
      state.lives--;
      if (state.lives <= 0) {
        shell.setState('game-over');
        return;
      }
      // Reset positions
      state.pac = createPacMan();
      state.ghosts = createGhosts();
      state.readyTimer = 90;
      state.powerTimer = 0;
      state.ghostCombo = 0;
    }
    return;
  }

  // Freeze timer (after eating ghost)
  if (state.freezeTimer > 0) {
    state.freezeTimer -= dt;
    return;
  }

  // Update pac-man
  updatePacMan(state.pac, state.maze, dt);

  // Check dot consumption
  const pcol = state.pac.col;
  const prow = state.pac.row;

  if (pcol >= 0 && pcol < COLS && prow >= 0 && prow < ROWS) {
    const cell = state.maze[prow][pcol];

    if (cell === 1) {
      // Eat dot
      state.maze[prow][pcol] = 2;
      state.score += 10;
      state.dotsRemaining--;

      if (state.chompCooldown <= 0) {
        playSound('chomp');
        state.chompCooldown = 8;
      }
    } else if (cell === 3) {
      // Eat power pellet
      state.maze[prow][pcol] = 2;
      state.score += 50;
      state.dotsRemaining--;
      state.powerTimer = 480; // 8 seconds at 60fps
      state.ghostCombo = 0;

      playSound('powerUp');

      // Make all ghosts vulnerable
      for (const ghost of state.ghosts) {
        if (!ghost.eaten && !ghost.inHouse) {
          ghost.vulnerable = true;
        }
      }
    }
  }

  // Chomp cooldown
  if (state.chompCooldown > 0) state.chompCooldown -= dt;

  // Power timer
  if (state.powerTimer > 0) {
    state.powerTimer -= dt;
    if (state.powerTimer <= 0) {
      state.powerTimer = 0;
      for (const ghost of state.ghosts) {
        ghost.vulnerable = false;
      }
      state.ghostCombo = 0;
    }
  }

  // Update ghosts
  for (const ghost of state.ghosts) {
    updateGhost(ghost, state.maze, state.pac, dt);
  }

  // Ghost collision
  for (const ghost of state.ghosts) {
    if (ghost.inHouse || ghost.eaten) continue;

    const dist = Math.abs(state.pac.x - ghost.x) + Math.abs(state.pac.y - ghost.y);
    if (dist < 0.8) {
      if (ghost.vulnerable) {
        // Eat ghost
        ghost.eaten = true;
        ghost.vulnerable = false;
        state.ghostCombo++;
        const points = 200 * Math.pow(2, state.ghostCombo - 1);
        state.score += points;
        state.freezeTimer = 20;

        addFloatingText(String(points), ghost.col, ghost.row);
        playSound('eatGhost');
      } else {
        // Pac-Man dies
        state.pac.alive = false;
        state.deathTimer = 60;
        playSound('death');
      }
    }
  }

  // Level clear check
  if (state.dotsRemaining <= 0) {
    playSound('levelUp');
    const nextLevel = state.level + 1;
    const savedScore = state.score;
    const savedLives = state.lives;
    resetState(nextLevel);
    state.score = savedScore;
    state.lives = savedLives;
  }

  // Update floating texts
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    state.floatingTexts[i].life -= dt;
    state.floatingTexts[i].y -= 0.5 * dt;
    if (state.floatingTexts[i].life <= 0) {
      state.floatingTexts.splice(i, 1);
    }
  }
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME PAC',
  gameId: 'meme-pac',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'meme-pac',
  subtitle: 'chomp dots. dodge ghosts. flex score.',
  accentColor: '#ffff00',
  shareUrl: 'https://brainrotgames.com/games/game-119/',
});

shell.onStart = () => {
  initAudio();
  registerGameSounds();
  newGame();
};

shell.onUpdate = (dt) => {
  update(dt);
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  return {
    score: state.score,
    message: `Level ${state.level} reached`,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  render(ctx, state);
};

// ---- Boot ----

setupInput();
shell.init();
