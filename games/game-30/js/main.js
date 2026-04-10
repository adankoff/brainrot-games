/**
 * MEME IQ TEST -- Main
 * GameShell integration, answer handling, timer logic, sound registration.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { buildQuestionQueue } from './questions.js';
import { render, getAnswerRects } from './renderer.js';

// ---- Constants ----
const LOGICAL_W = 400;
const LOGICAL_H = 700;
const TIME_PER_QUESTION = 10; // seconds
const MAX_LIVES = 3;
const BASE_POINTS = 10;
const TIME_BONUS_MULT = 2; // bonus = remaining_seconds * this
const CORRECT_DELAY = 0.5; // seconds before next question after correct
const WRONG_DELAY = 1.0; // seconds before next question after wrong
const TICK_THRESHOLD = 3; // start ticking at this many seconds

// ---- Game State ----
const state = {
  questionQueue: [],
  questionIndex: 0,
  currentQuestion: null,
  score: 0,
  lives: MAX_LIVES,
  timeRemaining: TIME_PER_QUESTION,
  timePerQuestion: TIME_PER_QUESTION,
  answered: false,
  selectedAnswer: -1,
  feedbackText: '',
  feedbackTimer: 0,
  feedbackCorrect: false,
  lastBonus: 0,
  delayTimer: 0,
  waitingForNext: false,
  lastTickSecond: -1,
  gameActive: false,
};

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME IQ TEST',
  gameId: 'meme-iq-test',
  logicalWidth: LOGICAL_W,
  logicalHeight: LOGICAL_H,
  maxDisplayWidth: 480,
  theme: 'meme-iq',
  subtitle: 'how deep is your brainrot?',
  accentColor: '#ff6b9d',
  shareUrl: '',
});

let input = null;
let unsubTapAt = null;

// ---- Sound Registration ----
function registerSounds() {
  registerSound('correct', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 1100, duration: 0.1, delay: 0.08, gain: 0.2 },
      { type: 'sine', frequency: 1320, duration: 0.1, delay: 0.16, gain: 0.15 },
    ],
  });

  registerSound('wrong', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 120, duration: 0.25, gain: 0.2 },
      { type: 'square', frequency: 100, duration: 0.1, delay: 0.05, gain: 0.1 },
    ],
  });

  registerSound('tick', {
    notes: [
      { type: 'sine', frequency: 1000, duration: 0.04, gain: 0.08 },
    ],
  });

  registerSound('timeout', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 100, duration: 0.4, gain: 0.2 },
    ],
  });

  registerSound('gameover-iq', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.2, gain: 0.25 },
      { type: 'square', frequency: 370, duration: 0.2, delay: 0.2, gain: 0.25 },
      { type: 'square', frequency: 311, duration: 0.2, delay: 0.4, gain: 0.25 },
      { type: 'sawtooth', frequency: 200, endFrequency: 80, duration: 0.5, delay: 0.6, gain: 0.2 },
    ],
  });
}

// ---- Score Messages ----
function getScoreMessage(score) {
  if (score >= 200) return 'galaxy brain detected';
  if (score >= 150) return 'meme lord status unlocked';
  if (score >= 100) return 'certified brainrot expert';
  if (score >= 60) return 'decent brainrot knowledge';
  if (score >= 30) return "you've touched grass recently";
  if (score >= 10) return 'go watch more tiktok';
  return 'certified brainrot deficiency';
}

// ---- Load Next Question ----
function loadNextQuestion() {
  if (state.questionIndex >= state.questionQueue.length) {
    // Ran out of questions -- rebuild and continue
    const newQueue = buildQuestionQueue();
    state.questionQueue.push(...newQueue);
  }

  state.currentQuestion = state.questionQueue[state.questionIndex];
  state.timeRemaining = TIME_PER_QUESTION;
  state.answered = false;
  state.selectedAnswer = -1;
  state.feedbackText = '';
  state.feedbackTimer = 0;
  state.waitingForNext = false;
  state.delayTimer = 0;
  state.lastTickSecond = -1;
}

// ---- Handle Answer ----
function handleAnswer(answerIndex) {
  if (state.answered || !state.gameActive) return;

  state.answered = true;
  state.selectedAnswer = answerIndex;

  const isCorrect = answerIndex === state.currentQuestion.correct;

  if (isCorrect) {
    const timeBonus = Math.floor(state.timeRemaining) * TIME_BONUS_MULT;
    state.lastBonus = BASE_POINTS + timeBonus;
    state.score += state.lastBonus;
    state.feedbackText = 'CORRECT!';
    state.feedbackCorrect = true;
    state.delayTimer = CORRECT_DELAY;
    playSound('correct');
  } else {
    state.lives--;
    state.lastBonus = 0;
    state.feedbackText = 'WRONG!';
    state.feedbackCorrect = false;
    state.delayTimer = WRONG_DELAY;
    playSound('wrong');
  }

  state.feedbackTimer = 1;
  state.waitingForNext = true;
}

// ---- Handle Timeout ----
function handleTimeout() {
  if (state.answered) return;

  state.answered = true;
  state.selectedAnswer = -1;
  state.lives--;
  state.lastBonus = 0;
  state.feedbackText = "TIME'S UP!";
  state.feedbackCorrect = false;
  state.feedbackTimer = 1;
  state.waitingForNext = true;
  state.delayTimer = WRONG_DELAY;
  playSound('timeout');
}

// ---- Tap Handler ----
function handleTapAt(pos) {
  if (!state.gameActive || state.answered) return;

  initAudio();

  const rects = getAnswerRects();
  for (let i = 0; i < 4; i++) {
    const r = rects[i];
    if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
      handleAnswer(i);
      return;
    }
  }
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerSounds();

  // Reset state
  state.questionQueue = buildQuestionQueue();
  state.questionIndex = 0;
  state.score = 0;
  state.lives = MAX_LIVES;
  state.gameActive = true;

  loadNextQuestion();

  // Set up input
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
  }
  input = createInputManager(shell.getCanvas(), LOGICAL_W, LOGICAL_H);
  unsubTapAt = input.onTapAt(handleTapAt);
};

shell.onUpdate = (dt) => {
  if (!state.gameActive) return;

  const deltaSeconds = dt * (1 / 60); // dt=1.0 means 1 frame at 60fps = 1/60 second

  // Handle delay between questions
  if (state.waitingForNext) {
    state.delayTimer -= deltaSeconds;
    state.feedbackTimer = Math.max(0, state.feedbackTimer - deltaSeconds * 2);

    if (state.delayTimer <= 0) {
      // Check game over
      if (state.lives <= 0) {
        state.gameActive = false;
        playSound('gameover-iq');
        shell.setState('game-over');
        return;
      }

      state.questionIndex++;
      loadNextQuestion();
    }
    return;
  }

  // Countdown timer
  if (!state.answered) {
    state.timeRemaining -= deltaSeconds;

    // Tick sound at 3, 2, 1
    const currentSecond = Math.ceil(state.timeRemaining);
    if (currentSecond <= TICK_THRESHOLD && currentSecond > 0 && currentSecond !== state.lastTickSecond) {
      state.lastTickSecond = currentSecond;
      playSound('tick');
    }

    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      handleTimeout();
    }
  }
};

shell.onRender = (ctx) => {
  render(ctx, state);
};

shell.onGameOver = () => {
  if (input) {
    if (unsubTapAt) unsubTapAt();
    input.destroy();
    input = null;
    unsubTapAt = null;
  }

  return {
    score: state.score,
    message: getScoreMessage(state.score),
    scoreLabel: 'meme iq',
  };
};

// ---- Init ----
shell.init();
