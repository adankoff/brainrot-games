/**
 * MEME DEFENSE -- Main Entry Point
 * Wires together GameShell, InputManager, SoundManager, and game logic.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { DefenseGame } from './defense.js';
import { renderGame, renderMenuBackground } from './renderer.js';

const W = 400;
const H = 700;

// ---- Game Shell Setup ----

const shell = new GameShell({
  title: 'MEME DEFENSE',
  gameId: 'meme-defense',
  logicalWidth: W,
  logicalHeight: H,
  maxDisplayWidth: 480,
  theme: 'memedefense',
  subtitle: 'protect the cities',
  accentColor: '#44ff88',
  shareUrl: '',
});

const game = new DefenseGame();
let input = null;
let unsubTapAt = null;
let menuAnimId = null;
let gameOverPending = false;

// ---- Register Game-Specific Sounds ----

function registerGameSounds() {
  registerSound('launch', {
    notes: [
      { type: 'sawtooth', frequency: 300, endFrequency: 600, duration: 0.12, gain: 0.12 },
      { type: 'sine', frequency: 800, endFrequency: 1200, duration: 0.08, delay: 0.04, gain: 0.06 },
    ],
  });

  registerSound('explode', {
    notes: [
      { type: 'sawtooth', frequency: 100, endFrequency: 40, duration: 0.3, gain: 0.25 },
      { type: 'square', frequency: 80, endFrequency: 30, duration: 0.2, gain: 0.15 },
      { duration: 0.25, gain: 0.2, noise: true },
    ],
  });

  registerSound('cityHit', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 30, duration: 0.4, gain: 0.3 },
      { duration: 0.3, gain: 0.25, noise: true },
      { type: 'square', frequency: 60, endFrequency: 20, duration: 0.3, delay: 0.1, gain: 0.2 },
    ],
  });

  registerSound('wave', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 550, duration: 0.1, delay: 0.1, gain: 0.2 },
      { type: 'triangle', frequency: 660, duration: 0.15, delay: 0.2, gain: 0.25 },
    ],
  });

  registerSound('gameover', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.25, gain: 0.3 },
      { type: 'square', frequency: 349, duration: 0.25, delay: 0.25, gain: 0.3 },
      { type: 'square', frequency: 261, duration: 0.25, delay: 0.5, gain: 0.3 },
      { type: 'sawtooth', frequency: 180, endFrequency: 60, duration: 0.5, delay: 0.75, gain: 0.25 },
    ],
  });
}

// ---- Shell Callbacks ----

shell.onStart = () => {
  initAudio();
  registerGameSounds();
  gameOverPending = false;
  game.start();

  // Set up input
  const canvas = shell.getCanvas();
  input = createInputManager(canvas, W, H);

  unsubTapAt = input.onTapAt((pos) => {
    const soundCue = game.tap(pos);
    if (soundCue) playSound(soundCue);
  });

  playSound('wave');
};

shell.onUpdate = (dt) => {
  const sounds = game.update(dt);
  for (const s of sounds) {
    playSound(s);
  }

  // Trigger game-over state transition (only once)
  if (game.gameOver && shell.state === 'playing' && !gameOverPending) {
    gameOverPending = true;
    setTimeout(() => {
      if (shell.state === 'playing') {
        shell.setState('game-over');
      }
      gameOverPending = false;
    }, 1200);
  }
};

shell.onRender = (ctx) => {
  renderGame(ctx, game);
};

shell.onGameOver = () => {
  // Clean up input
  if (unsubTapAt) {
    unsubTapAt();
    unsubTapAt = null;
  }
  if (input) {
    input.destroy();
    input = null;
  }

  const survivingCities = game.getCities().filter(c => c).length;

  return {
    score: game.score,
    message: `survived ${game.wave} wave${game.wave !== 1 ? 's' : ''}`,
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  renderGame(ctx, game);
};

// ---- Menu Animation ----

function animateMenu() {
  const ctx = shell.getContext();
  if (shell.state === 'menu') {
    renderMenuBackground(ctx);
  }
  menuAnimId = requestAnimationFrame(animateMenu);
}

// ---- Boot ----

shell.init();
menuAnimId = requestAnimationFrame(animateMenu);

// Clean up menu animation when leaving menu
const origSetState = shell.setState.bind(shell);
shell.setState = (state) => {
  if (state !== 'menu' && menuAnimId) {
    cancelAnimationFrame(menuAnimId);
    menuAnimId = null;
  }
  if (state === 'menu' && !menuAnimId) {
    menuAnimId = requestAnimationFrame(animateMenu);
  }
  origSetState(state);
};

// Re-init to apply the patched setState
shell.setState('menu');
