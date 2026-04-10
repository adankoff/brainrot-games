/**
 * MEME MANCALA -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state & animations.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { lerp } from '../../shared/utils.js';
import {
  MancalaGame,
  PLAYER_STORE, AI_STORE,
  PLAYER_PITS_START, PLAYER_PITS_END,
} from './mancala.js';
import { render, getPitCenter, getPitHitRadius } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

const SOW_DELAY_MS = 180;       // delay between each stone drop
const AI_THINK_DELAY_MS = 600;  // pause before AI plays
const CAPTURE_ANIM_MS = 600;    // capture flash duration
const EXTRA_TURN_MSG_MS = 1200; // "EXTRA TURN" message duration
const GAME_END_DELAY_MS = 1500; // pause after game ends before shell game-over

// ---- Module State ----

let game = new MancalaGame();
let difficulty = 'medium';
let audioInitialized = false;

/** @type {Object} UI/animation state passed to renderer */
let uiState = {
  highlightedPits: new Set(),
  hoveredPit: -1,
  animating: false,
  animatingStones: [],
  captureAnim: null,
  message: '',
  difficulty: 'medium',
};

// Animation queue
let animQueue = [];
let animating = false;

// Timers
let messageTimer = 0;
let gameEndTimer = 0;
let gameEnding = false;

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME MANCALA',
  gameId: 'meme-mancala',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-mancala',
  subtitle: 'ancient board game. modern brainrot.',
  accentColor: '#f4a623',
  shareUrl: 'https://brainrotgames.com/games/game-126/',
});

// ---- Sound Registration ----

function registerGameSounds() {
  registerSound('sow', {
    notes: [
      { type: 'sine', frequency: 600, endFrequency: 400, duration: 0.06, gain: 0.12 },
      { type: 'sine', frequency: 200, duration: 0.03, delay: 0.04, gain: 0.08, noise: true },
    ],
  });

  registerSound('capture', {
    notes: [
      { type: 'triangle', frequency: 800, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 1000, duration: 0.08, delay: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 1200, duration: 0.12, delay: 0.16, gain: 0.25 },
    ],
  });

  registerSound('extraTurn', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.15, delay: 0.2, gain: 0.2 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.15, gain: 0.2 },
      { type: 'triangle', frequency: 659, duration: 0.15, delay: 0.15, gain: 0.2 },
      { type: 'triangle', frequency: 784, duration: 0.15, delay: 0.3, gain: 0.2 },
      { type: 'triangle', frequency: 1047, duration: 0.3, delay: 0.45, gain: 0.25 },
    ],
  });

  registerSound('lose', {
    notes: [
      { type: 'sawtooth', frequency: 400, endFrequency: 200, duration: 0.3, gain: 0.15 },
      { type: 'sawtooth', frequency: 200, endFrequency: 100, duration: 0.4, delay: 0.3, gain: 0.12 },
    ],
  });
}

// ---- Callbacks ----

shell.onStart = () => {
  game = new MancalaGame();
  animQueue = [];
  animating = false;
  gameEnding = false;
  gameEndTimer = 0;
  messageTimer = 0;

  uiState = {
    highlightedPits: new Set(),
    hoveredPit: -1,
    animating: false,
    animatingStones: [],
    captureAnim: null,
    message: '',
    difficulty,
  };

  updateHighlightedPits();
};

shell.onUpdate = (dt) => {
  const dtMs = dt * 16.67;

  // Message timer
  if (messageTimer > 0) {
    messageTimer -= dtMs;
    if (messageTimer <= 0) {
      uiState.message = '';
      messageTimer = 0;
    }
  }

  // Capture animation
  if (uiState.captureAnim && uiState.captureAnim.active) {
    uiState.captureAnim.progress += dtMs / CAPTURE_ANIM_MS;
    if (uiState.captureAnim.progress >= 1) {
      uiState.captureAnim.active = false;
    }
  }

  // Animate sowing stones in flight
  for (const stone of uiState.animatingStones) {
    if (!stone.arrived && stone.started) {
      stone.time += dtMs;
      const t = Math.min(stone.time / stone.duration, 1);
      // Arc trajectory
      const arcHeight = -40 * Math.sin(t * Math.PI);
      stone.x = lerp(stone.startX, stone.targetX, t);
      stone.y = lerp(stone.startY, stone.targetY, t) + arcHeight;
      stone.visible = true;
      if (t >= 1) {
        stone.arrived = true;
        stone.visible = false;
      }
    }
  }

  // Game end delay
  if (gameEnding) {
    gameEndTimer -= dtMs;
    if (gameEndTimer <= 0) {
      gameEnding = false;
      shell.setState('game-over');
    }
    return;
  }

  // Process animation queue
  processAnimQueue(dtMs);
};

shell.onRender = (ctx) => {
  render(ctx, game, uiState);
};

shell.onGameOver = () => {
  const playerScore = game.board[PLAYER_STORE];
  const score = playerScore * 10;
  let message;
  if (game.winner === 'player') {
    message = getWinMessage();
  } else if (game.winner === 'ai') {
    message = getLoseMessage();
  } else {
    message = 'a tie? mid.';
  }

  return {
    score,
    message,
    scoreLabel: 'meme points',
  };
};

shell.onGameOverRender = (ctx) => {
  render(ctx, game, uiState);
};

// ---- Input ----

function handleTapAt(pos) {
  if (shell.state !== 'playing') return;
  if (animating || gameEnding) return;
  if (game.gameOver) return;
  if (game.currentPlayer !== 'player') return;

  // Check which pit was tapped
  for (let i = PLAYER_PITS_START; i <= PLAYER_PITS_END; i++) {
    const center = getPitCenter(i);
    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= getPitHitRadius() && game.isValidMove(i, 'player')) {
      executePlayerMove(i);
      return;
    }
  }
}

// ---- Move Execution ----

function executePlayerMove(pitIndex) {
  animating = true;
  uiState.animating = true;
  uiState.highlightedPits.clear();

  const pitCenter = getPitCenter(pitIndex);
  const stoneColorsCopy = [...game.stoneColors[pitIndex]];

  // Execute the actual move
  const result = game.sow(pitIndex);
  if (!result) {
    animating = false;
    uiState.animating = false;
    updateHighlightedPits();
    return;
  }

  // Build animation sequence
  buildSowAnimation(pitCenter, result, stoneColorsCopy, () => {
    // After sowing animation completes
    if (result.capture) {
      playSoundSafe('capture');
      const captureCenter = getPitCenter(result.capturedFrom);
      uiState.captureAnim = {
        active: true,
        x: captureCenter.x,
        y: captureCenter.y,
        progress: 0,
      };
    }

    if (result.extraTurn && !game.gameOver) {
      playSoundSafe('extraTurn');
      showMessage('EXTRA TURN', EXTRA_TURN_MSG_MS);
    }

    if (game.gameOver) {
      handleGameEnd();
      return;
    }

    animating = false;
    uiState.animating = false;

    if (game.currentPlayer === 'player') {
      updateHighlightedPits();
    } else {
      // AI turn
      scheduleAIMove();
    }
  });
}

function buildSowAnimation(fromCenter, result, stoneColorsCopy, onComplete) {
  uiState.animatingStones = [];

  let delay = 0;
  const steps = result.steps;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const targetCenter = getPitCenter(step.pit);

    const stone = {
      startX: fromCenter.x,
      startY: fromCenter.y,
      targetX: targetCenter.x,
      targetY: targetCenter.y,
      colorIndex: step.stoneColorIndex,
      x: fromCenter.x,
      y: fromCenter.y,
      time: 0,
      duration: 150,
      delay: delay,
      arrived: false,
      visible: false,
      started: false,
    };

    uiState.animatingStones.push(stone);
    delay += SOW_DELAY_MS;
  }

  // Schedule delayed starts and sound effects
  for (let i = 0; i < uiState.animatingStones.length; i++) {
    const stone = uiState.animatingStones[i];
    const stoneDelay = stone.delay;

    setTimeout(() => {
      if (stone.arrived) return; // safety check
      stone.started = true;
      stone.time = 0;
      stone.visible = true;
      playSoundSafe('sow');
    }, stoneDelay);
  }

  // Complete callback after all stones have landed
  const totalDuration = delay + 200;
  setTimeout(() => {
    uiState.animatingStones = [];
    if (onComplete) onComplete();
  }, totalDuration);
}

function scheduleAIMove() {
  setTimeout(() => {
    if (shell.state !== 'playing' || game.gameOver) return;
    executeAIMove();
  }, AI_THINK_DELAY_MS);
}

function executeAIMove() {
  const move = game.getAIMove(difficulty);
  if (move < 0) {
    // No valid moves - game should be over
    if (game.gameOver) handleGameEnd();
    return;
  }

  animating = true;
  uiState.animating = true;

  const pitCenter = getPitCenter(move);
  const stoneColorsCopy = [...game.stoneColors[move]];
  const result = game.sow(move);

  if (!result) {
    animating = false;
    uiState.animating = false;
    updateHighlightedPits();
    return;
  }

  buildSowAnimation(pitCenter, result, stoneColorsCopy, () => {
    if (result.capture) {
      playSoundSafe('capture');
      const captureCenter = getPitCenter(result.capturedFrom);
      uiState.captureAnim = {
        active: true,
        x: captureCenter.x,
        y: captureCenter.y,
        progress: 0,
      };
    }

    if (result.extraTurn && !game.gameOver) {
      playSoundSafe('extraTurn');
      showMessage('AI EXTRA TURN', EXTRA_TURN_MSG_MS);
      // AI gets another turn
      setTimeout(() => {
        if (shell.state !== 'playing' || game.gameOver) return;
        executeAIMove();
      }, EXTRA_TURN_MSG_MS + 200);
      return;
    }

    if (game.gameOver) {
      handleGameEnd();
      return;
    }

    animating = false;
    uiState.animating = false;
    updateHighlightedPits();
  });
}

function handleGameEnd() {
  animating = false;
  uiState.animating = false;

  if (game.winner === 'player') {
    playSoundSafe('win');
  } else if (game.winner === 'ai') {
    playSoundSafe('lose');
  }

  gameEnding = true;
  gameEndTimer = GAME_END_DELAY_MS;
}

// ---- Animation Queue (unused, kept simple with setTimeout) ----

function processAnimQueue(dtMs) {
  // Currently using setTimeout-based animation; this is a no-op placeholder
}

// ---- Helpers ----

function updateHighlightedPits() {
  uiState.highlightedPits.clear();
  if (game.currentPlayer === 'player' && !game.gameOver && !animating) {
    const moves = game.getValidMoves('player');
    for (const m of moves) {
      uiState.highlightedPits.add(m);
    }
  }
}

function showMessage(msg, durationMs) {
  uiState.message = msg;
  messageTimer = durationMs;
}

function playSoundSafe(name) {
  if (audioInitialized) {
    playSound(name);
  }
}

function getWinMessage() {
  const messages = [
    'gg ez no re',
    'skill diff tbh',
    'AI got ratio\'d',
    'absolutely bussin victory',
    'sheesh you cooked',
    'AI is NOT him',
    'W player fr fr',
    'stone cold meme lord',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLoseMessage() {
  const messages = [
    'bruh. just bruh.',
    'AI caught you lackin',
    'down bad fr',
    'that\'s an L bestie',
    'skill issue detected',
    'AI said ratio + you fell off',
    'not very sigma of you',
    'cope. seethe. mald.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// ---- Initialize ----

shell.init();
registerGameSounds();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed, continue without sound
    }
  }
  handleTapAt(pos);
});

// ---- Difficulty Selector in Menu ----

setupDifficultySelect();

function setupDifficultySelect() {
  // Wait for menu DOM to build
  requestAnimationFrame(() => {
    const secondary = document.getElementById('menu-secondary');
    if (!secondary) return;

    secondary.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'difficulty-select';

    const difficulties = ['easy', 'medium', 'hard'];
    for (const diff of difficulties) {
      const btn = document.createElement('button');
      btn.className = 'difficulty-select__btn';
      if (diff === difficulty) btn.classList.add('difficulty-select__btn--active');
      btn.textContent = diff;
      btn.addEventListener('click', () => {
        difficulty = diff;
        uiState.difficulty = diff;
        // Update active state
        container.querySelectorAll('.difficulty-select__btn').forEach(b => {
          b.classList.toggle('difficulty-select__btn--active', b.textContent === diff);
        });
        playSoundSafe('uiclick');
      });
      container.appendChild(btn);
    }

    secondary.appendChild(container);
  });
}
