/**
 * MEME RHYTHM -- Main Entry Point
 * Creates GameShell, wires callbacks, manages game state.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { readThemeColor } from '../../shared/theme-utils.js';
import { RhythmState, NUM_LANES, SONG_DURATION_MS } from './rhythm.js';
import { renderGame, renderReadyScreen } from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const LANE_WIDTH = LOGICAL_WIDTH / NUM_LANES;

// ---- Module State ----

let rhythm = new RhythmState();
let internalState = 'ready'; // 'ready' | 'active'
let readyTime = 0;
let audioInitialized = false;

/** Per-lane tap flash timers (ms) */
let laneTapTimers = [0, 0, 0];

/** Queued lane taps from input (consumed each frame) */
let laneTapQueue = [];

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME RHYTHM',
  gameId: 'meme-rhythm',
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: 'meme-rhythm',
  subtitle: 'tap the beat. chase the combo.',
  accentColor: readThemeColor('--game-hit-zone', '#888888'),
  shareUrl: 'https://brainrotgames.com/games/game-129/',
});

// ---- Sound Registration ----

function ensureAudio() {
  if (audioInitialized) return;
  try {
    initAudio();

    // Register game-specific sounds
    registerSound('hit-left', {
      notes: [
        { type: 'sine', frequency: 440, duration: 0.08, gain: 0.2 },
        { type: 'triangle', frequency: 880, duration: 0.06, gain: 0.1 },
      ],
    });

    registerSound('hit-center', {
      notes: [
        { type: 'sine', frequency: 554, duration: 0.08, gain: 0.2 },
        { type: 'triangle', frequency: 1108, duration: 0.06, gain: 0.1 },
      ],
    });

    registerSound('hit-right', {
      notes: [
        { type: 'sine', frequency: 659, duration: 0.08, gain: 0.2 },
        { type: 'triangle', frequency: 1318, duration: 0.06, gain: 0.1 },
      ],
    });

    registerSound('miss', {
      notes: [
        { type: 'sawtooth', frequency: 100, endFrequency: 60, duration: 0.15, gain: 0.15 },
      ],
    });

    registerSound('combo-milestone', {
      notes: [
        { type: 'sine', frequency: 784, duration: 0.08, gain: 0.2 },
        { type: 'sine', frequency: 1047, duration: 0.08, delay: 0.08, gain: 0.2 },
        { type: 'sine', frequency: 1318, duration: 0.1, delay: 0.16, gain: 0.2 },
      ],
    });

    registerSound('finish', {
      notes: [
        { type: 'triangle', frequency: 523, duration: 0.15, gain: 0.25 },
        { type: 'triangle', frequency: 659, duration: 0.15, delay: 0.15, gain: 0.25 },
        { type: 'triangle', frequency: 784, duration: 0.15, delay: 0.3, gain: 0.25 },
        { type: 'triangle', frequency: 1047, duration: 0.3, delay: 0.45, gain: 0.3 },
      ],
    });

    audioInitialized = true;
  } catch {
    // Audio not available -- game still works
  }
}

// ---- Callbacks ----

shell.onStart = () => {
  internalState = 'ready';
  rhythm = new RhythmState();
  readyTime = 0;
  laneTapTimers = [0, 0, 0];
  laneTapQueue = [];
};

shell.onUpdate = (dt) => {
  const dtMs = dt * 16.67;

  // ---- READY sub-state ----
  if (internalState === 'ready') {
    readyTime += dtMs;

    // Any tap starts the game
    if (laneTapQueue.length > 0) {
      laneTapQueue = [];
      internalState = 'active';
      return;
    }
    return;
  }

  // ---- ACTIVE sub-state ----

  // Process queued lane taps
  const taps = laneTapQueue.splice(0);
  for (const lane of taps) {
    const grade = rhythm.tapLane(lane);
    laneTapTimers[lane] = 200; // flash duration

    if (grade === null || grade === 'miss') {
      playSound('miss');
    } else {
      const hitSounds = ['hit-left', 'hit-center', 'hit-right'];
      playSound(hitSounds[lane]);

      // Combo milestone sound
      if (rhythm.combo > 0 && rhythm.combo % 10 === 0) {
        playSound('combo-milestone');
      }
    }
  }

  // Update rhythm state
  rhythm.update(dtMs);

  // Update lane flash timers
  for (let i = 0; i < NUM_LANES; i++) {
    laneTapTimers[i] = Math.max(0, laneTapTimers[i] - dtMs);
  }

  // Check end conditions
  if (rhythm.failed) {
    playSound('miss');
    shell.setState('game-over');
    return;
  }

  if (rhythm.songFinished) {
    playSound('finish');
    shell.setState('game-over');
    return;
  }
};

shell.onRender = (ctx) => {
  if (internalState === 'ready') {
    renderReadyScreen(ctx, readyTime);
    return;
  }

  renderGame(ctx, rhythm, laneTapTimers);
};

shell.onGameOver = () => {
  const score = rhythm.score;
  const totalNotes = rhythm.perfects + rhythm.greats + rhythm.goods + rhythm.misses;
  const accuracy = totalNotes > 0
    ? Math.round((rhythm.perfects + rhythm.greats) / totalNotes * 100)
    : 0;

  let message;
  if (rhythm.failed) {
    message = 'your rhythm died. RIP.';
  } else if (accuracy >= 95) {
    message = 'certified rhythm lord.';
  } else if (accuracy >= 80) {
    message = 'solid vibes only.';
  } else if (accuracy >= 60) {
    message = 'mid tempo energy.';
  } else {
    message = 'offbeat but you tried.';
  }

  // Populate extra stats
  requestAnimationFrame(() => {
    const extra = document.getElementById('gameover-extra');
    if (extra) {
      extra.innerHTML = `
        <div class="gameover-stats">
          <div class="gameover-stat"><strong>${rhythm.perfects}</strong>perfect</div>
          <div class="gameover-stat"><strong>${rhythm.greats}</strong>great</div>
          <div class="gameover-stat"><strong>${rhythm.goods}</strong>good</div>
          <div class="gameover-stat"><strong>${rhythm.misses}</strong>miss</div>
          <div class="gameover-stat"><strong>${rhythm.maxCombo}</strong>max combo</div>
          <div class="gameover-stat"><strong>${accuracy}%</strong>accuracy</div>
        </div>
      `;
    }
  });

  return {
    score,
    message,
    scoreLabel: 'rhythm points',
  };
};

// ---- Initialize ----

shell.init();

// ---- Input: Touch / Mouse ----

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);

input.onTapAt((pos) => {
  ensureAudio();

  if (shell.state !== 'playing') return;

  // Determine lane from x position
  const lane = Math.floor(pos.x / LANE_WIDTH);
  const clampedLane = Math.max(0, Math.min(NUM_LANES - 1, lane));
  laneTapQueue.push(clampedLane);
});

// Also handle generic taps (for starting from ready state via keyboard space/enter)
input.onTap(() => {
  ensureAudio();
  if (shell.state === 'playing' && internalState === 'ready') {
    // Push a dummy tap to trigger start
    laneTapQueue.push(1);
  }
});

// ---- Input: Keyboard (multi-lane) ----
// The input manager only handles Space/Enter. We need A/S/D and J/K/L for lanes.

const keyLaneMap = {
  KeyA: 0, KeyJ: 0,
  KeyS: 1, KeyK: 1,
  KeyD: 2, KeyL: 2,
};

/** Track pressed keys to avoid key-repeat spam */
const keysDown = new Set();

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (shell.state !== 'playing') return;

  const lane = keyLaneMap[e.code];
  if (lane !== undefined) {
    e.preventDefault();
    ensureAudio();

    if (!keysDown.has(e.code)) {
      keysDown.add(e.code);
      laneTapQueue.push(lane);
    }
  }
});

document.addEventListener('keyup', (e) => {
  keysDown.delete(e.code);
});

// ---- Multi-touch support ----
// The default input manager only takes the first touch.
// We need to handle all simultaneous touches for multi-lane tapping.

const canvas = shell.getCanvas();

canvas.addEventListener('touchstart', (e) => {
  // Don't prevent default here -- the input manager already does that
  // Process ALL changed touches, not just the first
  if (shell.state !== 'playing') return;
  ensureAudio();

  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (LOGICAL_WIDTH / rect.width);
    const lane = Math.floor(x / LANE_WIDTH);
    const clampedLane = Math.max(0, Math.min(NUM_LANES - 1, lane));

    // Avoid double-processing the first touch (input manager already queued it via onTapAt)
    if (i > 0) {
      laneTapQueue.push(clampedLane);
    }
  }
}, { passive: true });
