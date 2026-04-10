/**
 * MEME TAC TOE -- Main Entry Point
 * Creates GameShell, wires callbacks, manages series state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { getData, setData } from '../../shared/score-manager.js';
import { TicTacToe } from './tictactoe.js';
import { Renderer } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const MAX_ROUNDS = 5;
const AI_MOVE_DELAY_MS = 500;
const ROUND_END_DELAY_MS = 1200;
const NEXT_ROUND_DELAY_MS = 800;

// ---- Module State ----

let game = new TicTacToe();
let renderer = new Renderer(LOGICAL_WIDTH, LOGICAL_HEIGHT);
let difficulty = 'medium';
let audioInitialized = false;

/** @type {'player-turn'|'ai-turn'|'round-end'|'series-end'} */
let turnState = 'player-turn';

let aiMoveTimer = 0;
let roundEndTimer = 0;
let statusText = '';

// Series tracking
let round = 1;
let playerWins = 0;
let aiWins = 0;
let draws = 0;
/** @type {Array<'win'|'loss'|'draw'>} */
let results = [];

// ---- Sound Registration ----

function registerGameSounds() {
  registerSound('place', {
    notes: [
      { type: 'square', frequency: 440, endFrequency: 460, duration: 0.06, gain: 0.15 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.25 },
      { type: 'triangle', frequency: 784, duration: 0.15, delay: 0.2, gain: 0.3 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 150, duration: 0.3, gain: 0.2 },
      { type: 'sawtooth', frequency: 200, endFrequency: 100, duration: 0.2, delay: 0.3, gain: 0.15 },
    ],
  });

  registerSound('draw', {
    notes: [
      { type: 'sine', frequency: 440, duration: 0.15, gain: 0.15 },
      { type: 'sine', frequency: 440, duration: 0.15, delay: 0.2, gain: 0.1 },
    ],
  });
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME TAC TOE',
  gameId: 'meme-tac-toe',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-tac-toe',
  subtitle: 'tic-tac-toe but make it brainrot',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-101/',
});

// ---- Shell Callbacks ----

shell.onStart = () => {
  // Reset series
  round = 1;
  playerWins = 0;
  aiWins = 0;
  draws = 0;
  results = [];

  // Start first round
  startNewRound();
};

shell.onUpdate = (dt) => {
  renderer.update(dt, game.winLine !== null);

  switch (turnState) {
    case 'ai-turn':
      aiMoveTimer -= dt * 16.67;
      if (aiMoveTimer <= 0) {
        executeAIMove();
      }
      break;

    case 'round-end':
      roundEndTimer -= dt * 16.67;
      if (roundEndTimer <= 0) {
        if (round > MAX_ROUNDS) {
          turnState = 'series-end';
          shell.setState('game-over');
        } else {
          startNewRound();
        }
      }
      break;
  }
};

shell.onRender = (ctx) => {
  const seriesState = {
    round,
    maxRounds: MAX_ROUNDS,
    playerWins,
    aiWins,
    draws,
    difficulty,
    results,
  };

  renderer.draw(ctx, game, seriesState, statusText);
};

shell.onGameOver = () => {
  const score = playerWins * 100;
  let message;

  if (playerWins > aiWins) {
    message = 'you cooked the AI fr fr';
  } else if (aiWins > playerWins) {
    message = 'AI had you in a chokehold';
  } else {
    message = 'perfectly balanced, as all things should be';
  }

  // Show tally in extra area
  requestAnimationFrame(() => {
    const extra = document.getElementById('gameover-extra');
    if (extra) {
      extra.innerHTML = '';
      const tally = document.createElement('div');
      tally.className = 'round-tally';
      tally.innerHTML =
        `wins: ${playerWins} &nbsp; losses: ${aiWins} &nbsp; draws: ${draws}`;
      extra.appendChild(tally);
    }
  });

  return {
    score,
    message,
    scoreLabel: 'aura points',
  };
};

shell.onGameOverRender = (ctx) => {
  // Render the final board state behind the overlay
  const seriesState = {
    round: MAX_ROUNDS,
    maxRounds: MAX_ROUNDS,
    playerWins,
    aiWins,
    draws,
    difficulty,
    results,
  };
  renderer.draw(ctx, game, seriesState, '');
};

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();
  handleTap(pos);
});

input.onTap(() => {
  ensureAudio();
});

// Build difficulty selector in menu
setupDifficultySelect();

// ---- Game Logic ----

function startNewRound() {
  game.reset();
  renderer.resetAnimations();
  turnState = 'player-turn';
  statusText = 'your turn (X)';
}

function handleTap(pos) {
  if (shell.state !== 'playing') return;
  if (turnState !== 'player-turn') return;

  const cell = renderer.getCellFromPos(pos);
  if (cell === -1) return;

  const valid = game.makeMove(cell);
  if (!valid) return;

  renderer.animateMark(cell, 'X');
  playSound('place');

  if (game.status !== 'playing') {
    onRoundEnd();
    return;
  }

  // Switch to AI turn
  turnState = 'ai-turn';
  statusText = 'AI thinking...';
  aiMoveTimer = AI_MOVE_DELAY_MS;
}

function executeAIMove() {
  const cell = game.getAIMove(difficulty);
  if (cell === -1 || cell === undefined) return;

  game.makeMove(cell);
  renderer.animateMark(cell, 'O');
  playSound('place');

  if (game.status !== 'playing') {
    onRoundEnd();
    return;
  }

  turnState = 'player-turn';
  statusText = 'your turn (X)';
}

function onRoundEnd() {
  turnState = 'round-end';
  round++;

  if (game.status === 'win-x') {
    playerWins++;
    results.push('win');
    statusText = 'you won this round!';
    playSound('win');
  } else if (game.status === 'win-o') {
    aiWins++;
    results.push('loss');
    statusText = 'AI won this round';
    playSound('lose');
  } else {
    draws++;
    results.push('draw');
    statusText = 'draw!';
    playSound('draw');
  }

  roundEndTimer = round > MAX_ROUNDS ? ROUND_END_DELAY_MS : ROUND_END_DELAY_MS + NEXT_ROUND_DELAY_MS;
}

// ---- Audio ----

function ensureAudio() {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game works fine without it
    }
  }
}

// ---- Difficulty Select UI ----

function setupDifficultySelect() {
  // Load saved difficulty
  const saved = getData('meme-tac-toe', 'difficulty');
  if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
    difficulty = saved;
  }

  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    const levels = ['easy', 'medium', 'hard'];
    for (const level of levels) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (level === difficulty) {
        btn.classList.add('difficulty-select__btn--selected');
      }
      btn.textContent = level;

      btn.addEventListener('click', () => {
        difficulty = level;
        setData('meme-tac-toe', 'difficulty', level);

        // Update selection styling
        container.querySelectorAll('.difficulty-select__btn').forEach((b) => {
          b.classList.remove('difficulty-select__btn--selected');
        });
        btn.classList.add('difficulty-select__btn--selected');

        playSound('uiclick');
      });

      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
