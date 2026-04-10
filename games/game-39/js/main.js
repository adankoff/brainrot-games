/**
 * BRAINROT BREAKER -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state, theme switching,
 * collision detection, level progression, and lives display.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { clamp, formatScore } from '../../shared/utils.js';
import { THEMES, getThemeById } from './themes.js';
import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  BALL_RADIUS,
  BALL_BASE_SPEED,
  BALL_SPEED_INCREMENT,
  PADDLE_HEIGHT,
  PADDLE_Y,
  Ball,
  Paddle,
} from './physics.js';
import {
  BRICK_POINTS,
  generateBricks,
  countAliveBricks,
  collideBallWithBricks,
  maybeSpawnPowerUp,
  updatePowerUps,
  catchPowerUp,
  drawPowerUp,
  POWERUP_WIDE,
  POWERUP_MULTI,
} from './bricks.js';

// ---- Constants ----

const GAME_ID = 'brainrot-breaker';
const MAX_LIVES = 3;
const MAX_LEVELS = 5;
const WIDE_PADDLE_DURATION = 600; // frames (~10 seconds at 60fps)

// ---- Game State ----

let paddle = new Paddle();
/** @type {Ball[]} */
let balls = [];
let bricks = [];
/** @type {import('./bricks.js').PowerUp[]} */
let powerUps = [];
/** @type {{ text: string, x: number, y: number, life: number }[]} */
let floatingTexts = [];
/** @type {{ x: number, y: number, vx: number, vy: number, life: number, color: string }[]} */
let particles = [];

let score = 0;
let lives = MAX_LIVES;
let level = 1;
let ballSpeed = BALL_BASE_SPEED;
let launched = false;
let gameActive = false;
let lastDeathMessage = '';
let widePaddleTimer = 0;
let totalBricksThisLevel = 0;
let bricksDestroyedTotal = 0;

// ---- Theme ----

let currentTheme = getThemeById(loadTheme());

function loadTheme() {
  return getData(GAME_ID, 'theme') || 'npc';
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
  theme: 'brainrot-breaker',
  subtitle: 'break the bricks. send the gifts.',
  accentColor: currentTheme.accentColor,
  shareUrl: 'https://brainrotgames.com/games/game-10/',
});

// ---- Helper: Reset for New Game ----

function resetGame() {
  score = 0;
  lives = MAX_LIVES;
  level = 1;
  ballSpeed = BALL_BASE_SPEED;
  bricksDestroyedTotal = 0;
  widePaddleTimer = 0;
  paddle.reset();
  setupLevel();
}

function setupLevel() {
  bricks = generateBricks(level);
  totalBricksThisLevel = bricks.length;
  powerUps = [];
  floatingTexts = [];
  particles = [];
  launched = false;
  widePaddleTimer = 0;
  paddle.setNormal();

  // Create ball sitting on paddle
  balls = [createBallOnPaddle()];
}

function createBallOnPaddle() {
  const bx = paddle.x + paddle.width / 2;
  const by = PADDLE_Y - BALL_RADIUS;
  return new Ball(bx, by, 0, 0);
}

function launchBall() {
  if (launched) return;
  launched = true;

  // Slight random angle so it doesn't go straight up every time
  const angle = (Math.random() - 0.5) * 0.6; // -0.3 to +0.3 radians
  balls[0].vx = ballSpeed * Math.sin(angle);
  balls[0].vy = -ballSpeed * Math.cos(angle);
}

// ---- Floating Text ----

function addFloatingText(text, x, y) {
  floatingTexts.push({ text, x, y, life: 60 });
}

// ---- Particles ----

function spawnBrickParticles(brick, color) {
  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 2;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      color,
    });
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  gameActive = true;
  resetGame();
};

shell.onUpdate = (dt) => {
  if (!gameActive) return;

  // Update paddle
  paddle.update(dt);

  // Wide paddle timer
  if (widePaddleTimer > 0) {
    widePaddleTimer -= dt;
    if (widePaddleTimer <= 0) {
      widePaddleTimer = 0;
      paddle.setNormal();
    }
  }

  // Ball sitting on paddle before launch
  if (!launched) {
    balls[0].x = paddle.x + paddle.width / 2;
    balls[0].y = PADDLE_Y - BALL_RADIUS;
    return;
  }

  // Update balls
  let activeBallCount = 0;
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    if (!ball.active) continue;

    const fell = ball.update(dt);
    if (fell) {
      ball.active = false;
      continue;
    }

    activeBallCount++;

    // Paddle collision
    ball.bounceOffPaddle(paddle, ballSpeed);

    // Brick collision
    const hitBrick = collideBallWithBricks(ball, bricks);
    if (hitBrick) {
      hitBrick.hp--;
      if (hitBrick.hp <= 0) {
        hitBrick.alive = false;
        score += BRICK_POINTS;
        bricksDestroyedTotal++;

        // Floating text - catchphrase
        const phrases = currentTheme.catchphrases;
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        addFloatingText(phrase, hitBrick.x + hitBrick.width / 2, hitBrick.y);

        // Particles
        const brickColor = currentTheme.brickColors[hitBrick.colorIndex];
        spawnBrickParticles(hitBrick, brickColor);

        // Power-up drop
        const pu = maybeSpawnPowerUp(hitBrick);
        if (pu) powerUps.push(pu);
      }
    }
  }

  // Check all balls lost
  if (activeBallCount === 0 && launched) {
    lives--;
    if (lives <= 0) {
      gameActive = false;
      setTimeout(() => {
        shell.setState('game-over');
      }, 400);
      return;
    }
    // Reset ball on paddle
    launched = false;
    widePaddleTimer = 0;
    paddle.setNormal();
    balls = [createBallOnPaddle()];
  }

  // Power-ups
  updatePowerUps(powerUps, dt);
  const caught = catchPowerUp(powerUps, paddle, PADDLE_Y, PADDLE_HEIGHT);
  if (caught) {
    if (caught.type === POWERUP_WIDE) {
      paddle.setWide();
      widePaddleTimer = WIDE_PADDLE_DURATION;
    } else if (caught.type === POWERUP_MULTI) {
      // Spawn 2 extra balls from the first active ball
      const activeBall = balls.find((b) => b.active);
      if (activeBall) {
        const spread = 0.5;
        const b1 = new Ball(activeBall.x, activeBall.y,
          activeBall.vx * Math.cos(spread) - activeBall.vy * Math.sin(spread),
          activeBall.vx * Math.sin(spread) + activeBall.vy * Math.cos(spread)
        );
        const b2 = new Ball(activeBall.x, activeBall.y,
          activeBall.vx * Math.cos(-spread) - activeBall.vy * Math.sin(-spread),
          activeBall.vx * Math.sin(-spread) + activeBall.vy * Math.cos(-spread)
        );
        balls.push(b1, b2);
      }
    }
  }

  // Floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].y -= 0.8 * dt;
    floatingTexts[i].life -= dt;
    if (floatingTexts[i].life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Check level clear
  if (countAliveBricks(bricks) === 0) {
    advanceLevel();
  }
};

function advanceLevel() {
  if (level < MAX_LEVELS) {
    level++;
  }
  // Ball gets faster each level
  ballSpeed += BALL_SPEED_INCREMENT;
  setupLevel();
}

// ---- Rendering ----

shell.onRender = (ctx) => {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  // Background
  if (currentTheme.id === 'ohio') {
    const cleared = totalBricksThisLevel - countAliveBricks(bricks);
    currentTheme.drawBackground(ctx, W, H, cleared, totalBricksThisLevel);
  } else {
    currentTheme.drawBackground(ctx, W, H);
  }

  // Bricks
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.alive) continue;
    const color = currentTheme.brickColors[b.colorIndex];
    currentTheme.drawBrick(ctx, b.x, b.y, b.width, b.height, color, b.hp);
  }

  // Power-ups
  for (let i = 0; i < powerUps.length; i++) {
    if (powerUps[i].active) {
      drawPowerUp(ctx, powerUps[i]);
    }
  }

  // Paddle
  currentTheme.drawPaddle(ctx, paddle.x, PADDLE_Y, paddle.width, PADDLE_HEIGHT);

  // Balls
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (!ball.active) continue;
    currentTheme.drawBall(ctx, ball.x, ball.y, ball.radius);
  }

  // Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.globalAlpha = clamp(p.life / 30, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating texts
  ctx.textAlign = 'center';
  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    ctx.globalAlpha = clamp(ft.life / 30, 0, 1);
    ctx.fillStyle = currentTheme.accentColor;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // HUD - Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${currentTheme.scoreLabel}: ${formatScore(score)}`, 10, 20);

  // HUD - Level
  ctx.textAlign = 'right';
  ctx.fillText(`LVL ${level}`, W - 10, 20);

  // HUD - Lives
  ctx.textAlign = 'center';
  drawLives(ctx, W / 2, 16, lives);

  ctx.textAlign = 'left';

  // Launch prompt
  if (!launched && gameActive) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('tap to launch', W / 2, PADDLE_Y - 30);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
};

/**
 * Draw life indicators.
 */
function drawLives(ctx, cx, cy, count) {
  const spacing = 18;
  const startX = cx - ((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    // Small heart / dot
    ctx.fillStyle = currentTheme.accentColor;
    ctx.beginPath();
    ctx.arc(x, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Game Over ----

shell.onGameOver = () => {
  gameActive = false;
  const message = getDeathMessage();
  return {
    score,
    message,
    scoreLabel: currentTheme.scoreLabel.toLowerCase(),
  };
};

function getDeathMessage() {
  const pool = currentTheme.deathMessages;
  let msg;
  do {
    msg = pool[Math.floor(Math.random() * pool.length)];
  } while (msg === lastDeathMessage && pool.length > 1);
  lastDeathMessage = msg;

  // Replace placeholders
  msg = msg.replace('[X]', String(score));
  msg = msg.replace('N', String(bricksDestroyedTotal));

  return msg;
}

// ---- Initialize ----

shell.init();

const canvas = shell.getCanvas();
const input = createInputManager(canvas, LOGICAL_WIDTH, LOGICAL_HEIGHT);

// Tap to launch ball
input.onTap(() => {
  if (shell.state === 'playing' && !launched) {
    launchBall();
  }
});

// ---- Continuous Pointer Tracking (mouse + touch) ----

/**
 * Convert clientX to logical canvas X.
 */
function clientToLogicalX(clientX) {
  const rect = canvas.getBoundingClientRect();
  return (clientX - rect.left) * (LOGICAL_WIDTH / rect.width);
}

canvas.addEventListener('mousemove', (e) => {
  if (shell.state === 'playing') {
    paddle.setPointerX(clientToLogicalX(e.clientX));
  }
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (shell.state === 'playing' && e.touches.length > 0) {
    paddle.setPointerX(clientToLogicalX(e.touches[0].clientX));
  }
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
  if (shell.state === 'playing') {
    paddle.setPointerX(clientToLogicalX(e.clientX));
  }
});

canvas.addEventListener('touchstart', (e) => {
  if (shell.state === 'playing' && e.touches.length > 0) {
    paddle.setPointerX(clientToLogicalX(e.touches[0].clientX));
  }
}, { passive: true });

// ---- Keyboard Input ----

document.addEventListener('keydown', (e) => {
  if (shell.state === 'playing') {
    paddle.keyDown(e.code);

    // Space/Enter to launch
    if ((e.code === 'Space' || e.code === 'Enter') && !launched) {
      launchBall();
    }
  }
});

document.addEventListener('keyup', (e) => {
  paddle.keyUp(e.code);
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
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
