/**
 * MEME MATCH -- Main Entry Point
 * Wires up GameShell, input, sounds, and game loop.
 */

import { GameShell } from '../../shared/game-shell.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { lerp, clamp } from '../../shared/utils.js';

import {
  createBoard, swapGems, areAdjacent, findMatches,
  clearMatches, applyGravity, fillEmpty, hasValidMoves,
  shuffleBoard, scoreForMatch, COLS, ROWS,
} from './match3.js';

import {
  render, cellToPixel, pixelToCell,
  CELL_SIZE, BOARD_TOP, BOARD_PADDING_X, CANVAS_W, CANVAS_H,
} from './renderer.js';

// ---- Constants ----
const GAME_TIME_MS = 60000;
const SWAP_DURATION_MS = 150;
const CLEAR_DURATION_MS = 200;
const FALL_DURATION_MS = 180;
const SPAWN_DURATION_MS = 200;
const CASCADE_PAUSE_MS = 80;

// ---- Game State Phases ----
const PHASE_IDLE = 'idle';
const PHASE_SWAPPING = 'swapping';
const PHASE_SWAP_BACK = 'swapBack';
const PHASE_CLEARING = 'clearing';
const PHASE_FALLING = 'falling';
const PHASE_SPAWNING = 'spawning';
const PHASE_CASCADE_PAUSE = 'cascadePause';

// ---- State ----
let state = {};

function resetState() {
  state = {
    board: null,
    selected: null,
    phase: PHASE_IDLE,
    score: 0,
    timeLeft: GAME_TIME_MS,
    totalTime: GAME_TIME_MS,
    cascadeLevel: 0,

    // Animation state
    animatingGems: [],
    clearingGems: [],
    floatingScores: [],
    animTimer: 0,
    animDuration: 0,

    // Swap tracking
    swapFrom: null,
    swapTo: null,

    // Gravity results
    fallMoves: [],
    spawnGems: [],

    // Shuffle message display
    shuffleMessage: 0,

    // Drag state
    dragStart: null,
    isDragging: false,
  };
}

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'MEME MATCH',
  gameId: 'meme-match',
  logicalWidth: CANVAS_W,
  logicalHeight: CANVAS_H,
  subtitle: 'match memes. stack combos. 60 seconds.',
  accentColor: '#ff6b9d',
});

// ---- Sound Registration ----
function registerSounds() {
  registerSound('swap', {
    notes: [
      { type: 'sine', frequency: 400, endFrequency: 500, duration: 0.08, gain: 0.15 },
    ],
  });
  registerSound('match', {
    notes: [
      { type: 'triangle', frequency: 600, duration: 0.08, gain: 0.2 },
      { type: 'triangle', frequency: 800, duration: 0.08, delay: 0.06, gain: 0.2 },
    ],
  });
  registerSound('cascade', {
    notes: [
      { type: 'triangle', frequency: 700, duration: 0.06, gain: 0.25 },
      { type: 'triangle', frequency: 900, duration: 0.06, delay: 0.06, gain: 0.25 },
      { type: 'triangle', frequency: 1100, duration: 0.06, delay: 0.12, gain: 0.25 },
    ],
  });
  registerSound('noMatch', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 150, duration: 0.15, gain: 0.15 },
    ],
  });
  registerSound('finish', {
    notes: [
      { type: 'square', frequency: 523, duration: 0.15, gain: 0.2 },
      { type: 'square', frequency: 440, duration: 0.15, delay: 0.15, gain: 0.2 },
      { type: 'square', frequency: 349, duration: 0.25, delay: 0.3, gain: 0.2 },
    ],
  });
}

// ---- Input ----
let inputSetup = false;

function setupInput() {
  if (inputSetup) return;
  inputSetup = true;

  const canvas = shell.getCanvas();

  // We need mousedown/touchstart for tap, and also drag support
  // The input manager gives us onTapAt for simple taps.
  // For drag, we need custom listeners.

  let pointerDown = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startCell = null;
  let dragHandled = false;

  function getLogicalPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (CANVAS_W / rect.width),
      y: (clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }

  function handlePointerDown(clientX, clientY) {
    initAudio();
    if (state.phase !== PHASE_IDLE) return;

    const pos = getLogicalPos(clientX, clientY);
    const cell = pixelToCell(pos.x, pos.y);
    if (!cell) return;

    pointerDown = true;
    pointerStartX = pos.x;
    pointerStartY = pos.y;
    startCell = cell;
    dragHandled = false;
  }

  function handlePointerMove(clientX, clientY) {
    if (!pointerDown || dragHandled || state.phase !== PHASE_IDLE) return;
    if (!startCell) return;

    const pos = getLogicalPos(clientX, clientY);
    const dx = pos.x - pointerStartX;
    const dy = pos.y - pointerStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > CELL_SIZE * 0.35) {
      // Determine drag direction
      let dr = 0, dc = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        dc = dx > 0 ? 1 : -1;
      } else {
        dr = dy > 0 ? 1 : -1;
      }

      const targetR = startCell.r + dr;
      const targetC = startCell.c + dc;

      if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
        dragHandled = true;
        pointerDown = false;
        attemptSwap(startCell.r, startCell.c, targetR, targetC);
      }
    }
  }

  function handlePointerUp(clientX, clientY) {
    if (!pointerDown) return;
    pointerDown = false;

    if (dragHandled || state.phase !== PHASE_IDLE) return;
    if (!startCell) return;

    // This is a tap (not a drag)
    handleTap(startCell);
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    handlePointerDown(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', (e) => {
    handlePointerUp(e.clientX, e.clientY);
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handlePointerDown(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handlePointerMove(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handlePointerUp(t.clientX, t.clientY);
  }, { passive: false });
}

function handleTap(cell) {
  if (state.phase !== PHASE_IDLE) return;

  if (!state.selected) {
    // Select first gem
    state.selected = { r: cell.r, c: cell.c };
  } else {
    if (state.selected.r === cell.r && state.selected.c === cell.c) {
      // Deselect
      state.selected = null;
    } else if (areAdjacent(state.selected.r, state.selected.c, cell.r, cell.c)) {
      // Attempt swap
      attemptSwap(state.selected.r, state.selected.c, cell.r, cell.c);
    } else {
      // Select new gem
      state.selected = { r: cell.r, c: cell.c };
    }
  }
}

function attemptSwap(r1, c1, r2, c2) {
  state.selected = null;
  state.swapFrom = { r: r1, c: c1 };
  state.swapTo = { r: r2, c: c2 };

  // Start swap animation
  const from = cellToPixel(r1, c1);
  const to = cellToPixel(r2, c2);

  state.animatingGems = [
    { r: r1, c: c1, type: state.board[r1][c1], x: from.x, y: from.y, startX: from.x, startY: from.y, endX: to.x, endY: to.y, scale: 1, alpha: 1 },
    { r: r2, c: c2, type: state.board[r2][c2], x: to.x, y: to.y, startX: to.x, startY: to.y, endX: from.x, endY: from.y, scale: 1, alpha: 1 },
  ];
  state.animTimer = 0;
  state.animDuration = SWAP_DURATION_MS;
  state.phase = PHASE_SWAPPING;
  state.cascadeLevel = 0;

  playSound('swap');
}

// ---- Game Loop ----

let soundsRegistered = false;

shell.onStart = () => {
  resetState();
  state.board = createBoard();
  initAudio();
  if (!soundsRegistered) {
    registerSounds();
    soundsRegistered = true;
  }
  setupInput();
};

shell.onUpdate = (dt) => {
  const dtMs = dt * (1000 / 60);

  // Timer always counts down (animations don't pause the clock)
  state.timeLeft -= dtMs;

  if (state.timeLeft <= 0 && state.phase === PHASE_IDLE) {
    state.timeLeft = 0;
    playSound('finish');
    shell.setState('game-over');
    return;
  }

  // Shuffle message
  if (state.shuffleMessage > 0) {
    state.shuffleMessage -= dtMs;
  }

  // Floating scores
  for (let i = state.floatingScores.length - 1; i >= 0; i--) {
    const fs = state.floatingScores[i];
    fs.y -= dtMs * 0.04;
    fs.life -= dtMs;
    fs.alpha = clamp(fs.life / 500, 0, 1);
    if (fs.life <= 0) {
      state.floatingScores.splice(i, 1);
    }
  }

  // Phase state machine
  switch (state.phase) {
    case PHASE_SWAPPING:
      updateSwapAnim(dtMs);
      break;
    case PHASE_SWAP_BACK:
      updateSwapBackAnim(dtMs);
      break;
    case PHASE_CLEARING:
      updateClearAnim(dtMs);
      break;
    case PHASE_FALLING:
      updateFallAnim(dtMs);
      break;
    case PHASE_SPAWNING:
      updateSpawnAnim(dtMs);
      break;
    case PHASE_CASCADE_PAUSE:
      updateCascadePause(dtMs);
      break;
    case PHASE_IDLE:
      // Check if no moves remain
      if (state.board && !hasValidMoves(state.board)) {
        shuffleBoard(state.board);
        state.shuffleMessage = 1500;
      }
      break;
  }
};

function updateSwapAnim(dtMs) {
  state.animTimer += dtMs;
  const t = clamp(state.animTimer / state.animDuration, 0, 1);
  const eased = easeInOutQuad(t);

  for (const ag of state.animatingGems) {
    ag.x = lerp(ag.startX, ag.endX, eased);
    ag.y = lerp(ag.startY, ag.endY, eased);
  }

  if (t >= 1) {
    // Complete the swap on the board
    const { r: r1, c: c1 } = state.swapFrom;
    const { r: r2, c: c2 } = state.swapTo;
    swapGems(state.board, r1, c1, r2, c2);

    // Check for matches
    const matches = findMatches(state.board);
    if (matches.length > 0) {
      startClearing(matches);
    } else {
      // Invalid swap -- swap back
      swapGems(state.board, r1, c1, r2, c2);
      playSound('noMatch');

      // Animate swap back
      const from = cellToPixel(r1, c1);
      const to = cellToPixel(r2, c2);
      state.animatingGems = [
        { r: r1, c: c1, type: state.board[r1][c1], x: to.x, y: to.y, startX: to.x, startY: to.y, endX: from.x, endY: from.y, scale: 1, alpha: 1 },
        { r: r2, c: c2, type: state.board[r2][c2], x: from.x, y: from.y, startX: from.x, startY: from.y, endX: to.x, endY: to.y, scale: 1, alpha: 1 },
      ];
      state.animTimer = 0;
      state.animDuration = SWAP_DURATION_MS;
      state.phase = PHASE_SWAP_BACK;
    }
  }
}

function updateSwapBackAnim(dtMs) {
  state.animTimer += dtMs;
  const t = clamp(state.animTimer / state.animDuration, 0, 1);
  const eased = easeInOutQuad(t);

  for (const ag of state.animatingGems) {
    ag.x = lerp(ag.startX, ag.endX, eased);
    ag.y = lerp(ag.startY, ag.endY, eased);
  }

  if (t >= 1) {
    state.animatingGems = [];
    state.phase = PHASE_IDLE;
  }
}

function startClearing(matchGroups) {
  if (state.cascadeLevel > 0) {
    playSound('cascade');
  } else {
    playSound('match');
  }

  // Score
  let totalAdded = 0;
  for (const group of matchGroups) {
    const pts = scoreForMatch(group.length, state.cascadeLevel);
    totalAdded += pts;

    // Floating score at center of match group
    let cx = 0, cy = 0;
    for (const { r, c } of group) {
      const p = cellToPixel(r, c);
      cx += p.x;
      cy += p.y;
    }
    cx /= group.length;
    cy /= group.length;
    state.floatingScores.push({
      x: cx, y: cy, value: pts, life: 1200, alpha: 1,
    });
  }
  state.score += totalAdded;

  // Build clearing animation
  const cleared = clearMatches(state.board, matchGroups);
  state.clearingGems = cleared.map(({ r, c, type }) => {
    const p = cellToPixel(r, c);
    return { r, c, type, x: p.x, y: p.y, scale: 1, alpha: 1 };
  });

  state.animatingGems = [];
  state.animTimer = 0;
  state.animDuration = CLEAR_DURATION_MS;
  state.phase = PHASE_CLEARING;
}

function updateClearAnim(dtMs) {
  state.animTimer += dtMs;
  const t = clamp(state.animTimer / state.animDuration, 0, 1);

  // Pop: scale up then fade out
  for (const cg of state.clearingGems) {
    if (t < 0.4) {
      cg.scale = 1 + (t / 0.4) * 0.3; // scale to 1.3
      cg.alpha = 1;
    } else {
      const fadeT = (t - 0.4) / 0.6;
      cg.scale = 1.3 - fadeT * 0.3;
      cg.alpha = 1 - fadeT;
    }
  }

  if (t >= 1) {
    state.clearingGems = [];
    startFalling();
  }
}

function startFalling() {
  const fallMoves = applyGravity(state.board);

  if (fallMoves.length === 0) {
    startSpawning();
    return;
  }

  state.animatingGems = fallMoves.map(({ fromR, fromC, toR, toC }) => {
    const from = cellToPixel(fromR, fromC);
    const to = cellToPixel(toR, toC);
    return {
      r: toR, c: toC, type: state.board[toR][toC],
      x: from.x, y: from.y,
      startX: from.x, startY: from.y,
      endX: to.x, endY: to.y,
      scale: 1, alpha: 1,
    };
  });

  state.animTimer = 0;
  state.animDuration = FALL_DURATION_MS;
  state.phase = PHASE_FALLING;
}

function updateFallAnim(dtMs) {
  state.animTimer += dtMs;
  const t = clamp(state.animTimer / state.animDuration, 0, 1);
  const eased = easeOutBounce(t);

  for (const ag of state.animatingGems) {
    ag.x = lerp(ag.startX, ag.endX, eased);
    ag.y = lerp(ag.startY, ag.endY, eased);
  }

  if (t >= 1) {
    state.animatingGems = [];
    startSpawning();
  }
}

function startSpawning() {
  const spawns = fillEmpty(state.board);

  if (spawns.length === 0) {
    checkForCascade();
    return;
  }

  state.animatingGems = spawns.map(({ r, c, type, fallDistance }) => {
    const to = cellToPixel(r, c);
    const from = cellToPixel(r - fallDistance, c);
    return {
      r, c, type,
      x: to.x, y: from.y,
      startX: to.x, startY: from.y,
      endX: to.x, endY: to.y,
      scale: 1, alpha: 0,
    };
  });

  state.animTimer = 0;
  state.animDuration = SPAWN_DURATION_MS;
  state.phase = PHASE_SPAWNING;
}

function updateSpawnAnim(dtMs) {
  state.animTimer += dtMs;
  const t = clamp(state.animTimer / state.animDuration, 0, 1);
  const eased = easeOutBounce(t);

  for (const ag of state.animatingGems) {
    ag.y = lerp(ag.startY, ag.endY, eased);
    ag.alpha = clamp(t * 2, 0, 1);
  }

  if (t >= 1) {
    state.animatingGems = [];
    checkForCascade();
  }
}

function checkForCascade() {
  const matches = findMatches(state.board);
  if (matches.length > 0) {
    state.cascadeLevel++;
    // Brief pause before cascade
    state.animTimer = 0;
    state.animDuration = CASCADE_PAUSE_MS;
    state.phase = PHASE_CASCADE_PAUSE;
    state._pendingMatches = matches;
  } else {
    state.cascadeLevel = 0;
    state.phase = PHASE_IDLE;
  }
}

function updateCascadePause(dtMs) {
  state.animTimer += dtMs;
  if (state.animTimer >= state.animDuration) {
    startClearing(state._pendingMatches);
    state._pendingMatches = null;
  }
}

// ---- Render ----

shell.onRender = (ctx) => {
  render(ctx, state);
};

// ---- Game Over ----

shell.onGameOver = () => {
  return {
    score: state.score,
    message: 'time\'s up!',
    scoreLabel: 'points',
  };
};

// ---- Easing ----

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutBounce(t) {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  }
}

// ---- Init ----
shell.init();
