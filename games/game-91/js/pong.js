/**
 * MEME PONG -- Pong Engine
 * Core game logic: ball physics, paddle movement, AI, scoring.
 */

import { clamp, lerp } from '../../shared/utils.js';

// -- Constants --
export const W = 400;
export const H = 700;
export const PADDLE_W = 80;
export const PADDLE_H = 12;
export const PADDLE_RADIUS = 6;
export const BALL_RADIUS = 8;
export const PADDLE_MARGIN = 40; // distance from top/bottom edge
export const WALL_MARGIN = 0;
export const WIN_SCORE = 7;

const BALL_SPEED_INITIAL = 4;
const BALL_SPEED_INCREMENT = 0.2;
const BALL_SPEED_MAX = 10;
const TRAIL_LENGTH = 5;

// AI difficulty presets: speed factor (0-1) for how quickly AI tracks ball
const AI_DIFFICULTY = {
  easy: 0.04,
  medium: 0.07,
  hard: 0.12,
};

/**
 * Create a fresh pong game state.
 *
 * @param {string} [difficulty='medium'] - AI difficulty: 'easy', 'medium', 'hard'
 * @returns {Object} Game state
 */
export function createPongState(difficulty = 'medium') {
  const state = {
    // Ball
    ballX: W / 2,
    ballY: H / 2,
    ballVX: 0,
    ballVY: 0,
    ballSpeed: BALL_SPEED_INITIAL,
    ballTrail: [], // array of {x, y}

    // Paddles (x = center of paddle)
    playerX: W / 2,
    playerY: H - PADDLE_MARGIN,
    aiX: W / 2,
    aiY: PADDLE_MARGIN,

    // Paddle dimensions
    paddleWidth: PADDLE_W,
    paddleHeight: PADDLE_H,

    // Scores
    playerScore: 0,
    aiScore: 0,

    // Rally tracking
    rallyCount: 0,
    longestRally: 0,

    // AI config
    difficulty,
    aiSpeedFactor: AI_DIFFICULTY[difficulty] || AI_DIFFICULTY.medium,

    // State
    serving: true,       // waiting to launch ball
    serveDir: -1,        // -1 = toward AI, 1 = toward player
    gameOver: false,
    winner: null,        // 'player' or 'ai'
    scoreFlash: 0,       // countdown for score flash effect
    paused: false,
  };

  return state;
}

/**
 * Launch the ball from center in the serve direction.
 *
 * @param {Object} state
 */
export function serveBall(state) {
  state.ballX = W / 2;
  state.ballY = H / 2;
  state.ballSpeed = BALL_SPEED_INITIAL;
  state.rallyCount = 0;

  // Random angle between -45 and 45 degrees from vertical
  const angle = (Math.random() - 0.5) * Math.PI * 0.5;
  state.ballVX = Math.sin(angle) * state.ballSpeed;
  state.ballVY = Math.cos(angle) * state.ballSpeed * state.serveDir;
  state.serving = false;
  state.ballTrail = [];
}

/**
 * Update the pong game state by one frame.
 *
 * @param {Object} state - Pong state from createPongState
 * @param {number} playerTargetX - Target x position for player paddle (from input)
 * @param {number} dt - Delta time (1.0 = one frame at 60fps)
 * @returns {{ event: string|null }} Events: 'hit', 'wall', 'playerScore', 'aiScore', 'win', 'lose'
 */
export function updatePong(state, playerTargetX, dt) {
  if (state.gameOver || state.serving) {
    // Still move player paddle while serving
    state.playerX = lerp(state.playerX, playerTargetX, clamp(0.2 * dt, 0, 1));
    state.playerX = clamp(state.playerX, PADDLE_W / 2, W - PADDLE_W / 2);
    return { event: null };
  }

  let event = null;

  // -- Move player paddle (smooth lerp to target) --
  state.playerX = lerp(state.playerX, playerTargetX, clamp(0.2 * dt, 0, 1));
  state.playerX = clamp(state.playerX, PADDLE_W / 2, W - PADDLE_W / 2);

  // -- Move AI paddle --
  const aiTarget = state.ballX;
  state.aiX = lerp(state.aiX, aiTarget, clamp(state.aiSpeedFactor * dt, 0, 1));
  state.aiX = clamp(state.aiX, PADDLE_W / 2, W - PADDLE_W / 2);

  // -- Update ball trail --
  state.ballTrail.push({ x: state.ballX, y: state.ballY });
  if (state.ballTrail.length > TRAIL_LENGTH) {
    state.ballTrail.shift();
  }

  // -- Move ball --
  state.ballX += state.ballVX * dt;
  state.ballY += state.ballVY * dt;

  // -- Wall collisions (left/right) --
  if (state.ballX - BALL_RADIUS <= WALL_MARGIN) {
    state.ballX = WALL_MARGIN + BALL_RADIUS;
    state.ballVX = Math.abs(state.ballVX);
    event = 'wall';
  } else if (state.ballX + BALL_RADIUS >= W - WALL_MARGIN) {
    state.ballX = W - WALL_MARGIN - BALL_RADIUS;
    state.ballVX = -Math.abs(state.ballVX);
    event = 'wall';
  }

  // -- Player paddle collision (bottom) --
  if (state.ballVY > 0) {
    const paddleTop = state.playerY - PADDLE_H / 2;
    if (
      state.ballY + BALL_RADIUS >= paddleTop &&
      state.ballY - BALL_RADIUS <= state.playerY + PADDLE_H / 2 &&
      state.ballX >= state.playerX - PADDLE_W / 2 - BALL_RADIUS &&
      state.ballX <= state.playerX + PADDLE_W / 2 + BALL_RADIUS
    ) {
      // Reflect
      state.ballY = paddleTop - BALL_RADIUS;
      const hitResult = computeReflection(state, state.playerX);
      state.ballVX = hitResult.vx;
      state.ballVY = -hitResult.vy; // ball goes upward after hitting player paddle
      state.rallyCount++;
      state.longestRally = Math.max(state.longestRally, state.rallyCount);

      // Increase speed
      state.ballSpeed = Math.min(state.ballSpeed + BALL_SPEED_INCREMENT, BALL_SPEED_MAX);
      event = 'hit';
    }
  }

  // -- AI paddle collision (top) --
  if (state.ballVY < 0) {
    const paddleBottom = state.aiY + PADDLE_H / 2;
    if (
      state.ballY - BALL_RADIUS <= paddleBottom &&
      state.ballY + BALL_RADIUS >= state.aiY - PADDLE_H / 2 &&
      state.ballX >= state.aiX - PADDLE_W / 2 - BALL_RADIUS &&
      state.ballX <= state.aiX + PADDLE_W / 2 + BALL_RADIUS
    ) {
      // Reflect
      state.ballY = paddleBottom + BALL_RADIUS;
      const hitResult = computeReflection(state, state.aiX);
      state.ballVX = hitResult.vx;
      state.ballVY = hitResult.vy; // ball goes downward after hitting AI paddle
      state.rallyCount++;
      state.longestRally = Math.max(state.longestRally, state.rallyCount);

      // Increase speed
      state.ballSpeed = Math.min(state.ballSpeed + BALL_SPEED_INCREMENT, BALL_SPEED_MAX);
      event = 'hit';
    }
  }

  // -- Scoring: ball passes top edge (player scores) --
  if (state.ballY - BALL_RADIUS <= 0) {
    state.playerScore++;
    state.scoreFlash = 60; // frames
    state.rallyCount = 0;
    if (state.playerScore >= WIN_SCORE) {
      state.gameOver = true;
      state.winner = 'player';
      event = 'win';
    } else {
      state.serving = true;
      state.serveDir = -1; // toward AI
      state.ballTrail = [];
      event = 'playerScore';
    }
  }

  // -- Scoring: ball passes bottom edge (AI scores) --
  if (state.ballY + BALL_RADIUS >= H) {
    state.aiScore++;
    state.scoreFlash = 60;
    state.rallyCount = 0;
    if (state.aiScore >= WIN_SCORE) {
      state.gameOver = true;
      state.winner = 'ai';
      event = 'lose';
    } else {
      state.serving = true;
      state.serveDir = 1; // toward player
      state.ballTrail = [];
      event = 'aiScore';
    }
  }

  // Decrease score flash
  if (state.scoreFlash > 0) {
    state.scoreFlash -= dt;
  }

  return { event };
}

/**
 * Compute ball reflection off a paddle.
 * The angle depends on where the ball hits the paddle.
 * Center = straight, edges = steep angle.
 *
 * @param {Object} state
 * @param {number} paddleCenterX
 * @returns {{ vx: number, vy: number }}
 */
function computeReflection(state, paddleCenterX) {
  // Normalized offset: -1 (left edge) to +1 (right edge)
  const offset = (state.ballX - paddleCenterX) / (PADDLE_W / 2);
  const clampedOffset = clamp(offset, -1, 1);

  // Max angle from vertical: 60 degrees
  const maxAngle = Math.PI * 0.33;
  const angle = clampedOffset * maxAngle;

  const vx = Math.sin(angle) * state.ballSpeed;
  const vy = Math.cos(angle) * state.ballSpeed;

  return { vx, vy };
}
