/**
 * Brainrot Games -- Game Shell
 * Common game wrapper: state machine, game loop, menu/game-over chrome.
 * Each game plugs in game-specific logic via callbacks.
 */

import { getHighScore, setHighScore, setLastScore } from './score-manager.js';
import { shareScore } from './share.js';
import { formatScore } from './utils.js';

/**
 * @typedef {'menu'|'playing'|'game-over'} GameState
 */

const VALID_STATES = ['menu', 'playing', 'game-over'];
const FRAME_MS = 16.67;
const MAX_DT_MS = 50;

export class GameShell {
  /**
   * @param {Object} config
   * @param {string}          config.title          - Game title displayed on menu/game-over
   * @param {string}          config.gameId         - Unique ID for score storage
   * @param {number}          config.logicalWidth   - Logical canvas width in px
   * @param {number}          config.logicalHeight  - Logical canvas height in px
   * @param {number}          [config.maxDisplayWidth=480] - Max CSS width in px
   * @param {string}          [config.theme='']     - data-theme value applied to <body>
   * @param {string}          [config.subtitle='']  - Subtitle on menu screen
   * @param {string}          [config.accentColor='#c8ff00'] - Primary accent for canvas-drawn UI
   * @param {string}          [config.shareUrl='']  - URL included in share text
   * @param {Function|null}   [config.onMenuRender=null]  - Draw game-specific content on menu
   * @param {Function|null}   [config.onMenuUpdate=null]  - Update game-specific menu state
   */
  constructor(config) {
    this._config = {
      maxDisplayWidth: 480,
      theme: '',
      subtitle: '',
      accentColor: '#c8ff00',
      shareUrl: '',
      onMenuRender: null,
      onMenuUpdate: null,
      ...config,
    };

    /** @type {GameState} */
    this._state = 'menu';

    /** @type {HTMLCanvasElement|null} */
    this._canvas = null;

    /** @type {CanvasRenderingContext2D|null} */
    this._ctx = null;

    /** @type {number} */
    this._lastTime = 0;

    /** @type {number} */
    this._rafId = 0;

    /** @type {Function|null} */
    this._resizeHandler = null;

    /** @type {HTMLElement|null} */
    this._menuOverlay = null;

    /** @type {HTMLElement|null} */
    this._gameoverOverlay = null;

    /** @type {number} */
    this._highScore = 0;

    /** @type {number|null} */
    this._scoreAnimId = null;

    /** @type {number} */
    this._lastScore = 0;
  }

  // ---- Game Callbacks (set by the game) ----

  /** @type {Function} */
  onStart = () => {};

  /**
   * @type {Function}
   * @param {number} dt - Delta time normalized to 60fps (1.0 = one frame at 60fps)
   */
  onUpdate = (dt) => {};

  /**
   * @type {Function}
   * @param {CanvasRenderingContext2D} ctx
   */
  onRender = (ctx) => {};

  /**
   * @type {Function}
   * @returns {{ score: number, message?: string, scoreLabel?: string, extra?: Object }}
   */
  onGameOver = () => ({ score: 0 });

  /**
   * @type {Function|null}
   * @param {CanvasRenderingContext2D} ctx
   */
  onGameOverRender = null;

  // ---- State Machine ----

  /**
   * Get the current state name.
   *
   * @returns {GameState}
   */
  get state() {
    return this._state;
  }

  /**
   * Transition to a new state.
   *
   * @param {GameState} name
   */
  setState(name) {
    if (!VALID_STATES.includes(name)) {
      throw new Error(`Invalid state: "${name}". Must be one of: ${VALID_STATES.join(', ')}`);
    }

    const prev = this._state;
    this._state = name;

    // Exit previous state
    if (prev === 'playing') {
      this._stopLoop();
    }

    // Enter new state
    switch (name) {
      case 'menu':
        this._enterMenu();
        break;
      case 'playing':
        this._enterPlaying();
        break;
      case 'game-over':
        this._enterGameOver();
        break;
    }
  }

  // ---- Public API ----

  /**
   * Initialize the shell. Call once on page load.
   *
   * @returns {void}
   */
  init() {
    // Query DOM elements
    this._canvas = document.getElementById('game-canvas');
    this._menuOverlay = document.getElementById('menu-overlay');
    this._gameoverOverlay = document.getElementById('gameover-overlay');

    if (!this._canvas) {
      throw new Error('GameShell: #game-canvas element not found');
    }

    this._ctx = this._canvas.getContext('2d');

    // Set up canvas sizing
    this.resize();

    // Debounced resize listener
    let resizeTimeout = 0;
    this._resizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => this.resize(), 100);
    };
    window.addEventListener('resize', this._resizeHandler);

    // Set body data-theme
    if (this._config.theme) {
      document.body.setAttribute('data-theme', this._config.theme);
    }

    // Load high score
    this._highScore = getHighScore(this._config.gameId);

    // Build overlay DOM
    this._buildMenuDOM();
    this._buildGameOverDOM();

    // Transition to menu
    this.setState('menu');
  }

  /**
   * Returns the canvas 2D rendering context.
   *
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this._ctx;
  }

  /**
   * Returns the canvas element.
   *
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this._canvas;
  }

  /**
   * Returns { logicalWidth, logicalHeight } for the game's coordinate system.
   *
   * @returns {{ logicalWidth: number, logicalHeight: number }}
   */
  getDimensions() {
    return {
      logicalWidth: this._config.logicalWidth,
      logicalHeight: this._config.logicalHeight,
    };
  }

  /**
   * Returns the current high score for this game.
   *
   * @returns {number}
   */
  getHighScore() {
    return this._highScore;
  }

  /**
   * Force a canvas resize recalculation.
   *
   * @returns {void}
   */
  resize() {
    const { logicalWidth, logicalHeight, maxDisplayWidth } = this._config;
    const dpr = window.devicePixelRatio || 1;
    const aspectRatio = logicalHeight / logicalWidth;

    let displayWidth = Math.min(window.innerWidth, maxDisplayWidth);
    let displayHeight = displayWidth * aspectRatio;

    if (displayHeight > window.innerHeight) {
      displayHeight = window.innerHeight;
      displayWidth = displayHeight / aspectRatio;
    }

    this._canvas.style.width = displayWidth + 'px';
    this._canvas.style.height = displayHeight + 'px';
    this._canvas.width = logicalWidth * dpr;
    this._canvas.height = logicalHeight * dpr;

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.scale(dpr, dpr);
  }

  /**
   * Destroy the shell. Removes event listeners, stops the game loop, cleans up.
   *
   * @returns {void}
   */
  destroy() {
    this._stopLoop();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._scoreAnimId !== null) {
      cancelAnimationFrame(this._scoreAnimId);
      this._scoreAnimId = null;
    }
  }

  // ---- Internal: State Transitions ----

  /**
   * Enter menu state.
   */
  _enterMenu() {
    this._highScore = getHighScore(this._config.gameId);
    this._showOverlay(this._menuOverlay);
    this._hideOverlay(this._gameoverOverlay);

    // Update high score display in menu
    const hsEl = this._menuOverlay.querySelector('#menu-highscore');
    if (hsEl) {
      hsEl.textContent = this._highScore > 0
        ? `best: ${formatScore(this._highScore)}`
        : '';
    }
  }

  /**
   * Enter playing state.
   */
  _enterPlaying() {
    this._hideOverlay(this._menuOverlay);
    this._hideOverlay(this._gameoverOverlay);
    this.onStart();
    this._startLoop();
  }

  /**
   * Enter game-over state.
   */
  _enterGameOver() {
    const result = this.onGameOver();
    const score = result.score || 0;
    const message = result.message || '';
    const scoreLabel = result.scoreLabel || 'score';

    // Store for share button
    this._lastScore = score;

    // Save scores
    setLastScore(this._config.gameId, score);
    const isNewHigh = setHighScore(this._config.gameId, score);
    if (isNewHigh) {
      this._highScore = score;
    }

    // Populate game-over DOM
    const messageEl = this._gameoverOverlay.querySelector('#gameover-message');
    const scoreEl = this._gameoverOverlay.querySelector('#gameover-score');
    const scoreLabelEl = this._gameoverOverlay.querySelector('#gameover-score-label');
    const hsEl = this._gameoverOverlay.querySelector('#gameover-highscore');
    const newRecordEl = this._gameoverOverlay.querySelector('#gameover-newrecord');

    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.display = message ? '' : 'none';
    }
    if (scoreLabelEl) scoreLabelEl.textContent = scoreLabel;
    if (hsEl) hsEl.textContent = `best: ${formatScore(this._highScore)}`;
    if (newRecordEl) newRecordEl.style.display = isNewHigh ? '' : 'none';

    // Animate score count-up
    if (scoreEl) {
      this._animateScoreCountUp(scoreEl, score);
    }

    // Reset share button text
    const shareBtn = this._gameoverOverlay.querySelector('#btn-share');
    if (shareBtn) shareBtn.textContent = 'flex this';

    this._showOverlay(this._gameoverOverlay);

    // Render game-over canvas background if callback provided
    if (this.onGameOverRender) {
      this.onGameOverRender(this._ctx);
    }
  }

  // ---- Internal: Game Loop ----

  /**
   * Start the game loop.
   */
  _startLoop() {
    this._lastTime = performance.now();
    const loop = (timestamp) => {
      if (this._state !== 'playing') return;

      const rawDt = timestamp - this._lastTime;
      this._lastTime = timestamp;

      // Clamp dt to prevent spiral-of-death on tab switch
      const dt = Math.min(rawDt, MAX_DT_MS) / FRAME_MS;

      this.onUpdate(dt);
      this.onRender(this._ctx);

      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  /**
   * Stop the game loop.
   */
  _stopLoop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
  }

  // ---- Internal: DOM Construction ----

  /**
   * Build the menu overlay DOM content.
   */
  _buildMenuDOM() {
    if (!this._menuOverlay) return;

    this._menuOverlay.innerHTML = '';

    // Title
    const title = document.createElement('h1');
    title.className = 'menu-screen__title';
    title.textContent = this._config.title;
    this._menuOverlay.appendChild(title);

    // Subtitle
    if (this._config.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'menu-screen__subtitle';
      subtitle.textContent = this._config.subtitle;
      this._menuOverlay.appendChild(subtitle);
    }

    // Visual area (for game-specific idle content)
    const visual = document.createElement('div');
    visual.className = 'menu-screen__visual';
    visual.id = 'menu-visual';
    this._menuOverlay.appendChild(visual);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'menu-screen__actions';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary btn-lg';
    startBtn.id = 'btn-start';
    startBtn.textContent = 'start game';
    startBtn.addEventListener('click', () => {
      this.setState('playing');
    });
    actions.appendChild(startBtn);

    this._menuOverlay.appendChild(actions);

    // High score display
    const hs = document.createElement('p');
    hs.id = 'menu-highscore';
    hs.className = 'text-secondary text-sm';
    hs.textContent = this._highScore > 0
      ? `best: ${formatScore(this._highScore)}`
      : '';
    this._menuOverlay.appendChild(hs);

    // Secondary actions area
    const secondary = document.createElement('div');
    secondary.className = 'menu-screen__secondary-actions';
    secondary.id = 'menu-secondary';
    this._menuOverlay.appendChild(secondary);

    // Watermark
    const watermark = document.createElement('p');
    watermark.className = 'menu-screen__watermark';
    watermark.textContent = 'BRAINROT GAMES';
    this._menuOverlay.appendChild(watermark);
  }

  /**
   * Build the game-over overlay DOM content.
   */
  _buildGameOverDOM() {
    if (!this._gameoverOverlay) return;

    this._gameoverOverlay.innerHTML = '';

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'game-over-overlay__backdrop';
    this._gameoverOverlay.appendChild(backdrop);

    // Card
    const card = document.createElement('div');
    card.className = 'game-over-overlay__card';

    // Message
    const message = document.createElement('p');
    message.id = 'gameover-message';
    message.className = 'text-secondary';
    message.style.display = 'none';
    card.appendChild(message);

    // Title
    const title = document.createElement('h2');
    title.className = 'game-over-overlay__title';
    title.textContent = 'GAME OVER';
    card.appendChild(title);

    // Score
    const scoreEl = document.createElement('div');
    scoreEl.className = 'game-over-overlay__score';
    scoreEl.id = 'gameover-score';
    scoreEl.textContent = '0';
    card.appendChild(scoreEl);

    // Score label
    const scoreLabel = document.createElement('p');
    scoreLabel.className = 'game-over-overlay__score-label';
    scoreLabel.id = 'gameover-score-label';
    scoreLabel.textContent = 'score';
    card.appendChild(scoreLabel);

    // High score
    const hs = document.createElement('p');
    hs.className = 'game-over-overlay__high-score';
    hs.id = 'gameover-highscore';
    card.appendChild(hs);

    // New record
    const newRecord = document.createElement('p');
    newRecord.className = 'game-over-overlay__new-record';
    newRecord.id = 'gameover-newrecord';
    newRecord.textContent = 'NEW HIGH SCORE';
    newRecord.style.display = 'none';
    card.appendChild(newRecord);

    // Extra content area
    const extra = document.createElement('div');
    extra.id = 'gameover-extra';
    card.appendChild(extra);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'game-over-overlay__actions';

    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-primary';
    shareBtn.id = 'btn-share';
    shareBtn.textContent = 'flex this';
    shareBtn.addEventListener('click', async () => {
      const status = await shareScore(
        this._config.title,
        this._lastScore,
        this._config.shareUrl
      );
      if (status === 'shared') {
        shareBtn.textContent = 'shared!';
      } else if (status === 'copied') {
        shareBtn.textContent = 'copied!';
      } else {
        shareBtn.textContent = 'failed :(';
      }
      setTimeout(() => {
        shareBtn.textContent = 'flex this';
      }, 2000);
    });
    actions.appendChild(shareBtn);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-secondary';
    retryBtn.id = 'btn-retry';
    retryBtn.textContent = 'run it back';
    retryBtn.addEventListener('click', () => {
      this.setState('playing');
    });
    actions.appendChild(retryBtn);

    card.appendChild(actions);

    // Secondary actions
    const secondary = document.createElement('div');
    secondary.className = 'game-over-overlay__secondary';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn btn-ghost';
    menuBtn.id = 'btn-menu';
    menuBtn.textContent = 'menu';
    menuBtn.addEventListener('click', () => {
      this.setState('menu');
    });
    secondary.appendChild(menuBtn);

    card.appendChild(secondary);

    this._gameoverOverlay.appendChild(card);
  }

  // ---- Internal: Score Count-Up Animation ----

  /**
   * Animate a score counting up from 0 to the target value.
   *
   * @param {HTMLElement} el - Element to update textContent on
   * @param {number} target - Target score value
   */
  _animateScoreCountUp(el, target) {
    if (this._scoreAnimId !== null) {
      cancelAnimationFrame(this._scoreAnimId);
    }

    if (target <= 0) {
      el.textContent = '0';
      return;
    }

    const duration = Math.min(target * 30, 1500);
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quad for natural deceleration
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(eased * target);

      el.textContent = formatScore(current);

      if (progress < 1) {
        this._scoreAnimId = requestAnimationFrame(animate);
      } else {
        el.textContent = formatScore(target);
        this._scoreAnimId = null;
      }
    };

    this._scoreAnimId = requestAnimationFrame(animate);
  }

  // ---- Internal: Overlay Helpers ----

  /**
   * Show an overlay element.
   *
   * @param {HTMLElement|null} el
   */
  _showOverlay(el) {
    if (el) el.style.display = '';
  }

  /**
   * Hide an overlay element.
   *
   * @param {HTMLElement|null} el
   */
  _hideOverlay(el) {
    if (el) el.style.display = 'none';
  }
}
