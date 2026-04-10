# Brainrot Games -- Shared Technical Architecture

## 1. Directory Structure

```
brainrot-games/
  index.html                         # Landing page (game catalogue)
  styles.css                         # Landing page styles
  package.json                       # Dev server script (npx live-server .)

  brand/
    design-system.css                # Design tokens, base reset, component styles
    og-image.png                     # Open Graph social preview (placeholder)

  architecture/
    ARCHITECTURE.md                  # This file -- shared infrastructure design
    game-01-architecture.md          # Flappy Tralalero implementation addendum
    game-02-architecture.md          # Whack-a-Rot implementation addendum

  design-docs/
    GDD-01.md                        # Flappy Tralalero game design document
    GDD-02.md                        # Whack-a-Rot game design document

  games/
    shared/
      game-shell.js                  # State machine, game loop, menu/game-over chrome
      utils.js                       # Math/collision/formatting utilities
      sound-manager.js               # Web Audio API oscillator synthesis wrapper
      score-manager.js               # localStorage high score persistence
      input-manager.js               # Unified tap/click/key input handling
      share.js                       # Web Share API with clipboard fallback
      styles.css                     # Shared game chrome styles (imports design-system.css)

    game-01/
      index.html                     # Entry point -- canvas, overlay divs, module loader
      style.css                      # Game-specific CSS (canvas sizing, overlay positioning)
      js/
        main.js                      # Entry point -- wire shell, register states, start
        player.js                    # Player entity (physics, hitbox, animation, draw)
        obstacle.js                  # Obstacle pair entity (scroll, gap, type, draw)
        background.js                # 3-layer parallax background with biome tinting
        characters.js                # 7 character definitions (draw fns, sounds, unlock cond)
        constants.js                 # All magic numbers (physics, colors, thresholds, messages)
        ui.js                        # Character select, HUD overlay, game-over extras

    game-02/
      index.html                     # Entry point -- canvas, overlay divs, module loader
      style.css                      # Game-specific CSS (canvas sizing, overlay positioning)
      js/
        main.js                      # Entry point -- wire shell, register states, start
        game.js                      # Spawn scheduler, wave system, timer, game loop core
        characters.js                # 6 character type defs (draw fns, points, timing, hitbox)
        holes.js                     # 3x3 grid positions, hole rendering, clip masking
        effects.js                   # Impact flash, floating text, screen shake, combo text
        constants.js                 # All magic numbers (grid, timing, scoring, messages)
        ui.js                        # HUD rendering (score, timer, combo), game-over extras

  business/                          # Business plans, financials (non-code)
  concepts/                          # Game concept briefs (pre-GDD)
  marketing/                         # Marketing assets, copy
  research/                          # Market research, competitive analysis
```

### Conventions

- **No build step.** All JS uses native ES modules (`type="module"` on script tags). Imports use relative paths with `.js` extensions.
- **No npm dependencies at runtime.** `package.json` exists only for the dev server script.
- **No image assets.** All game visuals are Canvas 2D primitives. No sprite sheets, no emoji rendering.
- **No audio files.** All sound is synthesized at runtime via Web Audio API oscillators.
- **Shared modules** live in `games/shared/` and are imported by each game via relative paths (e.g., `import { GameShell } from '../shared/game-shell.js'`).

---

## 2. Shared Modules

### 2a. `games/shared/game-shell.js`

The GameShell is the common wrapper every game uses. It owns the canvas, the game loop, the state machine, and the menu/game-over screen chrome. Each game plugs in game-specific logic via callbacks.

#### Exported Class: `GameShell`

```js
export class GameShell {
  /**
   * @param {Object} config
   * @param {string}          config.title        -- Game title displayed on menu/game-over (e.g., "FLAPPY TRALALERO")
   * @param {string}          config.gameId       -- Unique ID for score storage (e.g., "flappy-tralalero")
   * @param {number}          config.logicalWidth  -- Logical canvas width in px (e.g., 360)
   * @param {number}          config.logicalHeight -- Logical canvas height in px (e.g., 640)
   * @param {number}          [config.maxDisplayWidth=480] -- Max CSS width in px
   * @param {string}          [config.theme='']   -- data-theme value applied to <body> (e.g., "italian-brainrot")
   * @param {string}          [config.subtitle=''] -- Subtitle on menu screen (e.g., "tap. die. share. repeat.")
   * @param {string}          [config.accentColor='#c8ff00'] -- Primary accent for canvas-drawn UI
   * @param {string}          [config.shareUrl=''] -- URL included in share text
   * @param {Function|null}   [config.onMenuRender=null]  -- Optional: draw game-specific content on menu (e.g., idle character)
   * @param {Function|null}   [config.onMenuUpdate=null]  -- Optional: update game-specific menu state
   */
  constructor(config) {}

  // ---- State Machine ----

  /**
   * Get the current state name.
   * @returns {'menu'|'playing'|'game-over'}
   */
  get state() {}

  /**
   * Transition to a new state. Calls onExit for old state, onEnter for new state.
   * Throws if `name` is not one of: 'menu', 'playing', 'game-over'.
   *
   * Side effects by state:
   *   -> 'menu':      Stops game loop, shows menu DOM overlay, hides game-over overlay.
   *   -> 'playing':   Hides all overlays, starts game loop (requestAnimationFrame), calls onStart().
   *   -> 'game-over': Stops game loop, shows game-over DOM overlay, saves high score.
   *
   * @param {'menu'|'playing'|'game-over'} name
   */
  setState(name) {}

  // ---- Game Callbacks (set by the game) ----

  /**
   * Called once when state transitions to 'playing'.
   * The game should reset all its state here (score=0, clear entities, reset player position).
   * @type {Function}
   */
  onStart = () => {};

  /**
   * Called every frame while state is 'playing'.
   * @type {Function}
   * @param {number} dt -- Delta time in ms since last frame, normalized so 16.67ms = 1.0 at 60fps.
   *                       At 120fps, dt ~= 0.5. At 30fps, dt ~= 2.0.
   *                       Multiply all per-frame values by dt for frame-rate independence.
   *                       Raw milliseconds available as `dt * 16.67`.
   */
  onUpdate = (dt) => {};

  /**
   * Called every frame while state is 'playing', after onUpdate.
   * The canvas is NOT auto-cleared -- the game must clear or redraw the full canvas.
   * @type {Function}
   * @param {CanvasRenderingContext2D} ctx -- The 2D rendering context, already scaled for DPR.
   *                                          Coordinate system is logical (e.g., 360x640).
   */
  onRender = (ctx) => {};

  /**
   * Called when the game transitions to 'game-over'.
   * Must return a result object that the shell uses to populate the game-over screen.
   * @type {Function}
   * @returns {Object} result
   * @returns {number}  result.score       -- Final score for this run
   * @returns {string}  [result.message]   -- Death/game-over message to display (optional)
   * @returns {string}  [result.scoreLabel='score'] -- Label below score (e.g., "aura points")
   * @returns {Object}  [result.extra]     -- Any extra data the game wants to render on game-over
   *                                           (the game provides its own rendering via onGameOverRender)
   */
  onGameOver = () => ({ score: 0 });

  /**
   * Optional: Called every frame while state is 'game-over', for custom rendering
   * on the game-over screen (e.g., character hit stats in Whack-a-Rot).
   * The overlay DOM is positioned above the canvas; this draws ON the canvas behind the overlay.
   * @type {Function|null}
   * @param {CanvasRenderingContext2D} ctx
   */
  onGameOverRender = null;

  // ---- Public API ----

  /**
   * Initialize the shell. Call once on page load.
   *
   * Actions:
   *   1. Query DOM for canvas element (id="game-canvas") and overlay containers.
   *   2. Set up canvas sizing (logical dimensions, DPR scaling, responsive resize).
   *   3. Attach resize listener (debounced, recalculates canvas display size).
   *   4. Set body data-theme attribute.
   *   5. Initialize ScoreManager for this gameId.
   *   6. Transition to 'menu' state.
   *
   * @returns {void}
   */
  init() {}

  /**
   * Returns the canvas 2D rendering context. Available after init().
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {}

  /**
   * Returns the canvas element. Available after init().
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {}

  /**
   * Returns { logicalWidth, logicalHeight } for the game's coordinate system.
   * @returns {{ logicalWidth: number, logicalHeight: number }}
   */
  getDimensions() {}

  /**
   * Returns the current high score for this game (from ScoreManager).
   * @returns {number}
   */
  getHighScore() {}

  /**
   * Force a canvas resize recalculation. Called automatically on window resize.
   * Useful if the game changes the DOM layout.
   * @returns {void}
   */
  resize() {}

  /**
   * Destroy the shell. Removes event listeners, stops the game loop, cleans up.
   * @returns {void}
   */
  destroy() {}
}
```

#### Canvas Sizing Algorithm (internal)

```
On init and on window resize:
  dpr = window.devicePixelRatio || 1
  displayWidth = min(window.innerWidth, config.maxDisplayWidth)
  displayHeight = displayWidth * (logicalHeight / logicalWidth)

  if displayHeight > window.innerHeight:
    displayHeight = window.innerHeight
    displayWidth = displayHeight / (logicalHeight / logicalWidth)

  canvas.style.width  = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'
  canvas.width  = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  ctx.scale(dpr, dpr)
```

#### Menu Screen Rendering (DOM-based)

The shell renders the menu screen using DOM elements (not canvas) for accessibility and styling consistency with the design system. Structure:

```html
<div id="menu-overlay" class="menu-screen">
  <h1 class="menu-screen__title">{config.title}</h1>
  <p class="menu-screen__subtitle">{config.subtitle}</p>
  <div class="menu-screen__visual" id="menu-visual">
    <!-- Game-specific content injected here by onMenuRender -->
  </div>
  <div class="menu-screen__actions">
    <button class="btn btn-primary btn-lg" id="btn-start">start game</button>
  </div>
  <div class="menu-screen__secondary-actions" id="menu-secondary">
    <!-- Game-specific secondary actions (character select, mute, etc.) -->
  </div>
  <p class="menu-screen__watermark">BRAINROT GAMES</p>
</div>
```

The "start game" button transitions to 'playing'. Games can inject additional menu content (character select, mute toggle) into the secondary actions area.

#### Game-Over Screen Rendering (DOM-based)

```html
<div id="gameover-overlay" class="game-over-overlay" style="display:none;">
  <div class="game-over-overlay__backdrop"></div>
  <div class="game-over-overlay__card">
    <p id="gameover-message" class="text-secondary">{result.message}</p>
    <h2 class="game-over-overlay__title">GAME OVER</h2>
    <div class="game-over-overlay__score" id="gameover-score">{result.score}</div>
    <p class="game-over-overlay__score-label" id="gameover-score-label">{result.scoreLabel}</p>
    <p class="game-over-overlay__high-score" id="gameover-highscore">best: {highScore}</p>
    <p class="game-over-overlay__new-record" id="gameover-newrecord" style="display:none;">NEW HIGH SCORE</p>
    <div id="gameover-extra">
      <!-- Game-specific extra content (character stats, unlock notification) -->
    </div>
    <div class="game-over-overlay__actions">
      <button class="btn btn-primary" id="btn-share">flex this</button>
      <button class="btn btn-secondary" id="btn-retry">run it back</button>
    </div>
    <div class="game-over-overlay__secondary">
      <button class="btn btn-ghost" id="btn-menu">menu</button>
    </div>
  </div>
</div>
```

Behavior on entering 'game-over':
1. Call `onGameOver()` to get the result object.
2. Populate DOM elements with score, message, high score.
3. Animate score count-up from 0 to `result.score` over `min(result.score * 30, 1500)` ms.
4. If `result.score > highScore`, show "NEW HIGH SCORE" element, save via ScoreManager.
5. "flex this" button calls `shareScore()` from `share.js`.
6. "run it back" button calls `setState('playing')`.
7. "menu" button calls `setState('menu')`.

#### Game Loop (internal)

```
let lastTime = 0;

function loop(timestamp) {
  if (state !== 'playing') return;

  const rawDt = timestamp - lastTime;
  lastTime = timestamp;

  // Clamp dt to prevent spiral-of-death on tab switch
  // max 3 frames worth (~50ms), normalized to 60fps units
  const dt = Math.min(rawDt, 50) / 16.67;

  onUpdate(dt);
  onRender(ctx);

  requestAnimationFrame(loop);
}

// On entering 'playing':
lastTime = performance.now();
requestAnimationFrame(loop);
```

**dt convention:** All physics values in the GDDs are specified "per frame at 60fps." The dt value passed to `onUpdate` is a multiplier where `1.0 = one frame at 60fps (16.67ms)`. Games multiply all per-frame constants by dt. Example: `velocity += GRAVITY * dt`.

---

### 2b. `games/shared/utils.js`

Pure utility functions with no side effects and no state.

```js
/**
 * Axis-Aligned Bounding Box collision test.
 *
 * @param {{ x: number, y: number, width: number, height: number }} a -- First rectangle
 * @param {{ x: number, y: number, width: number, height: number }} b -- Second rectangle
 * @returns {boolean} true if the rectangles overlap (edges touching counts as collision)
 *
 * Edge case: If either rectangle has width=0 or height=0, returns false (degenerate rect).
 */
export function checkCollisionAABB(a, b) {}

/**
 * Circle-to-circle collision test.
 *
 * @param {{ x: number, y: number, radius: number }} a -- First circle (x,y = center)
 * @param {{ x: number, y: number, radius: number }} b -- Second circle (x,y = center)
 * @returns {boolean} true if the circles overlap (edges touching counts as collision)
 *
 * Uses squared-distance comparison (no Math.sqrt) for performance.
 * Edge case: If either radius is <= 0, returns false.
 */
export function checkCollisionCircle(a, b) {}

/**
 * Circle-to-point collision test. Useful for tap hit detection.
 *
 * @param {{ x: number, y: number, radius: number }} circle -- Circle (x,y = center)
 * @param {{ x: number, y: number }} point -- Point to test
 * @returns {boolean} true if the point is inside or on the edge of the circle
 */
export function checkCollisionCirclePoint(circle, point) {}

/**
 * Linear interpolation between two values.
 *
 * @param {number} a -- Start value
 * @param {number} b -- End value
 * @param {number} t -- Interpolation factor (0 = a, 1 = b). NOT clamped -- values outside [0,1]
 *                      produce extrapolation.
 * @returns {number} Interpolated value: a + (b - a) * t
 */
export function lerp(a, b, t) {}

/**
 * Clamp a value between a minimum and maximum (inclusive).
 *
 * @param {number} value -- The value to clamp
 * @param {number} min   -- Minimum bound
 * @param {number} max   -- Maximum bound. If min > max, behavior is undefined (caller error).
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {}

/**
 * Random floating-point number between min (inclusive) and max (exclusive).
 *
 * @param {number} min -- Minimum value (inclusive)
 * @param {number} max -- Maximum value (exclusive)
 * @returns {number} Random float in [min, max)
 *
 * Edge case: If min >= max, returns min.
 */
export function randomBetween(min, max) {}

/**
 * Random integer between min and max (both inclusive).
 *
 * @param {number} min -- Minimum value (inclusive). Floored if not integer.
 * @param {number} max -- Maximum value (inclusive). Floored if not integer.
 * @returns {number} Random integer in [min, max]
 *
 * Edge case: If min > max, returns min.
 */
export function randomInt(min, max) {}

/**
 * Format a number with commas as thousands separators.
 *
 * @param {number} n -- The number to format. Truncated to integer.
 * @returns {string} Comma-formatted string (e.g., 1234567 -> "1,234,567")
 *
 * Edge case: Negative numbers include the minus sign (e.g., -1234 -> "-1,234").
 * Edge case: NaN or Infinity returns "0".
 */
export function formatScore(n) {}

/**
 * Ease-out quadratic. Useful for animations.
 *
 * @param {number} t -- Progress from 0 to 1
 * @returns {number} Eased value (starts fast, decelerates)
 */
export function easeOutQuad(t) {}

/**
 * Ease-out cubic. Stronger deceleration than quadratic.
 *
 * @param {number} t -- Progress from 0 to 1
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {}
```

---

### 2c. `games/shared/sound-manager.js`

Web Audio API wrapper. Generates all sounds procedurally with oscillators. No audio files loaded.

```js
/**
 * Initialize the audio system. MUST be called from a user gesture handler
 * (click, touchstart) to comply with browser autoplay policies.
 *
 * Creates an AudioContext and a master GainNode.
 * Safe to call multiple times -- subsequent calls are no-ops if already initialized.
 * On iOS Safari, also calls audioCtx.resume() to leave the "suspended" state.
 *
 * @returns {void}
 */
export function initAudio() {}

/**
 * Play a registered sound by name.
 *
 * Creates fresh OscillatorNode(s) and GainNode(s) for each call.
 * Oscillators auto-disconnect and are garbage-collected after stopping.
 *
 * If audio has not been initialized (initAudio not yet called), this is a silent no-op.
 * If the sound name is not registered, logs a warning to console and returns.
 *
 * @param {string} name -- Registered sound name (e.g., 'flap', 'score', 'death')
 * @returns {void}
 */
export function playSound(name) {}

/**
 * Register a sound with a synthesis configuration.
 *
 * @param {string} name -- Unique sound name
 * @param {Object} config -- Oscillator synthesis configuration
 * @param {Array<Object>} config.notes -- Array of sequential notes to play
 * @param {string}  config.notes[].type       -- OscillatorNode type: 'sine'|'square'|'sawtooth'|'triangle'
 * @param {number}  config.notes[].frequency  -- Start frequency in Hz
 * @param {number}  [config.notes[].endFrequency] -- End frequency for sweep (if omitted, frequency is constant)
 * @param {number}  config.notes[].duration   -- Duration in seconds (e.g., 0.08 = 80ms)
 * @param {number}  [config.notes[].delay=0]  -- Delay before this note starts, in seconds (relative to playSound call)
 * @param {number}  [config.notes[].gain=0.15] -- Volume for this note (0.0 to 1.0)
 * @param {boolean} [config.notes[].noise=false] -- If true, play white noise instead of oscillator
 * @param {number}  [config.notes[].detune=0]  -- Detune in cents
 *
 * @returns {void}
 *
 * Example -- two-tone rising ding:
 *   registerSound('score', {
 *     notes: [
 *       { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
 *       { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 }
 *     ]
 *   });
 */
export function registerSound(name, config) {}

/**
 * Set the master volume. Persists to localStorage under key `brainrot-master-volume`.
 *
 * @param {number} volume -- 0.0 (silent) to 1.0 (full). Clamped to [0, 1].
 * @returns {void}
 */
export function setVolume(volume) {}

/**
 * Get the current master volume.
 * @returns {number} Volume between 0.0 and 1.0
 */
export function getVolume() {}

/**
 * Toggle mute on/off. When muted, master gain is 0. When unmuted, restores previous volume.
 * Persists mute state to localStorage under key `brainrot-master-muted`.
 *
 * @returns {boolean} New muted state (true = muted)
 */
export function toggleMute() {}

/**
 * Check if audio is currently muted.
 * @returns {boolean}
 */
export function isMuted() {}

/**
 * Resume the AudioContext. Call this on user gesture if audio was initialized
 * before a gesture (e.g., on page load). Needed for iOS Safari.
 *
 * @returns {Promise<void>}
 */
export function resumeAudio() {}
```

#### Built-in Sound Presets

The following sounds are pre-registered when `initAudio()` is called. Games can override them by calling `registerSound()` with the same name after init.

| Name | Description | Config Summary |
|------|-------------|----------------|
| `flap` | Short chirp (8-bit jump) | Square wave, 580Hz->620Hz sweep, 60ms, gain 0.12 |
| `score` | Two-tone rising ding | Sine 880Hz 80ms, then sine 1100Hz 80ms, gain 0.15 |
| `death` | Crunchy impact thud | Sawtooth 200Hz->50Hz sweep 300ms gain 0.2 + white noise burst 100ms gain 0.15 |
| `hit` | Bonk sound | Square 440Hz, 80ms, quick gain ramp-down, gain 0.3 |
| `combo` | Harmonic confirmation | Triangle 440Hz + 660Hz (perfect fifth), 150ms, gain 0.25 |
| `penalty` | Buzzy wrong sound | Sawtooth 150Hz->100Hz, 200ms, gain 0.4 |
| `bonus` | Sparkly rising arpeggio | Triangle 523->659->784Hz, each 60ms, gain 0.3 |
| `gameover` | Descending 4-note | Square 523->440->349->261Hz, each 200ms, gain 0.3 |
| `highscore` | Ascending 4-note celebration | Sine 523->659->784->1047Hz, each 100ms, gain 0.15 |
| `uiclick` | Subtle menu blip | Sine 660Hz, 40ms, gain 0.1 |

Games register additional game-specific sounds (e.g., character-specific death sounds) in their own `main.js` after calling `initAudio()`.

---

### 2d. `games/shared/score-manager.js`

Thin localStorage wrapper with graceful fallback. All keys are namespaced by gameId.

```js
/**
 * Get the all-time high score for a game.
 *
 * @param {string} gameId -- Game identifier (e.g., "flappy-tralalero", "whack-a-rot")
 * @returns {number} The stored high score, or 0 if none exists or localStorage is unavailable.
 *
 * localStorage key: `{gameId}-highscore`
 * Stored as string, parsed with parseInt. Returns 0 if parse fails (NaN).
 */
export function getHighScore(gameId) {}

/**
 * Save a high score for a game. Only writes if the new score is strictly greater
 * than the currently stored high score.
 *
 * @param {string} gameId -- Game identifier
 * @param {number} score  -- The score to save
 * @returns {boolean} true if a new high score was saved, false if it was not higher or storage failed.
 *
 * localStorage key: `{gameId}-highscore`
 */
export function setHighScore(gameId, score) {}

/**
 * Get the last played score for a game (not necessarily the high score).
 *
 * @param {string} gameId -- Game identifier
 * @returns {number} The last played score, or 0 if none exists.
 *
 * localStorage key: `{gameId}-lastscore`
 */
export function getLastScore(gameId) {}

/**
 * Save the last played score for a game. Always overwrites.
 *
 * @param {string} gameId -- Game identifier
 * @param {number} score  -- The score to save
 * @returns {void}
 *
 * localStorage key: `{gameId}-lastscore`
 */
export function setLastScore(gameId, score) {}

/**
 * Generic get for game-specific data (unlocks, settings, etc.).
 *
 * @param {string} gameId -- Game identifier
 * @param {string} key    -- Data key (e.g., "unlocks", "selected-character", "muted")
 * @returns {string|null} Raw string value from localStorage, or null if not found.
 *
 * localStorage key: `{gameId}-{key}`
 * Caller is responsible for parsing (JSON.parse, parseInt, etc.).
 */
export function getData(gameId, key) {}

/**
 * Generic set for game-specific data.
 *
 * @param {string} gameId -- Game identifier
 * @param {string} key    -- Data key
 * @param {string} value  -- Value to store (must be a string; caller serializes)
 * @returns {void}
 *
 * localStorage key: `{gameId}-{key}`
 * Silently fails if localStorage is unavailable.
 */
export function setData(gameId, key, value) {}
```

All reads are wrapped in try/catch. If localStorage is unavailable (private browsing, storage full, SecurityError), functions return default values and never throw.

---

### 2e. `games/shared/input-manager.js`

Unified input handling. Normalizes touch, mouse, and keyboard into a simple callback API. Handles coordinate conversion from DOM space to logical canvas space.

```js
/**
 * Create an InputManager bound to a canvas element.
 *
 * @param {HTMLCanvasElement} canvas -- The game canvas
 * @param {number} logicalWidth      -- Logical canvas width (e.g., 360)
 * @param {number} logicalHeight     -- Logical canvas height (e.g., 640)
 * @returns {Object} InputManager instance
 */
export function createInputManager(canvas, logicalWidth, logicalHeight) {
  /**
   * Register a callback for simple tap events (no position needed).
   * Fires on: mousedown, touchstart, keydown (Space or Enter).
   * touchstart calls preventDefault() to prevent double-firing and scroll.
   *
   * Multiple callbacks can be registered; all fire on each tap.
   *
   * @param {Function} callback -- Called with no arguments on each tap.
   * @returns {Function} Unsubscribe function. Call it to remove this specific callback.
   */
  function onTap(callback) {}

  /**
   * Register a callback for positioned tap events.
   * Fires on: mousedown, touchstart (NOT keyboard -- keyboard has no position).
   *
   * Coordinates are converted to logical canvas space:
   *   logicalX = (clientX - canvasRect.left) * (logicalWidth / canvasRect.width)
   *   logicalY = (clientY - canvasRect.top) * (logicalHeight / canvasRect.height)
   *
   * For touch events, uses event.changedTouches[0].
   * touchstart calls preventDefault().
   *
   * @param {Function} callback -- Called with { x: number, y: number } in logical coordinates.
   * @returns {Function} Unsubscribe function.
   */
  function onTapAt(callback) {}

  /**
   * Remove all event listeners and clear all callbacks.
   * Call this when the game is torn down to prevent memory leaks.
   *
   * @returns {void}
   */
  function destroy() {}

  return { onTap, onTapAt, destroy };
}
```

#### Implementation Notes

- Event listeners are attached to `canvas` for mouse/touch, and to `document` for keyboard.
- `touchstart` always calls `event.preventDefault()` to suppress ghost clicks and scroll/zoom.
- Keyboard fires `onTap` callbacks only (not `onTapAt`), and only for Space and Enter keys.
- The InputManager does NOT consume events -- other listeners on the same elements still fire.
- Coordinate conversion recalculates `canvas.getBoundingClientRect()` on each tap (not cached) to handle dynamic resizing.

---

### 2f. `games/shared/share.js`

Score sharing via Web Share API with clipboard fallback.

```js
/**
 * Share a score. Tries Web Share API first (mobile), falls back to clipboard copy.
 *
 * @param {string} gameTitle -- Game name for share text (e.g., "FLAPPY TRALALERO")
 * @param {number} score     -- Player's score (will be formatted with commas)
 * @param {number} highScore -- Player's high score (included if it equals score, indicating new record)
 * @returns {Promise<'shared'|'copied'|'failed'>}
 *   - 'shared':  Web Share API was used successfully.
 *   - 'copied':  Clipboard fallback was used successfully.
 *   - 'failed':  Both methods failed (e.g., clipboard denied, no HTTPS).
 *
 * Behavior:
 *   1. Generate share text via generateShareText().
 *   2. If navigator.share exists, call it with { text }.
 *      - If user cancels the share sheet, fall through to clipboard.
 *   3. If navigator.share is unavailable or failed, copy text to clipboard via navigator.clipboard.writeText().
 *   4. If clipboard also fails, return 'failed'.
 */
export async function shareScore(gameTitle, score, shareUrl) {}

/**
 * Generate the share text string.
 *
 * @param {string} gameTitle -- Game name (e.g., "FLAPPY TRALALERO")
 * @param {number} score     -- Player's score
 * @returns {string} Formatted text, e.g.:
 *   "i got 42 in FLAPPY TRALALERO\nhttps://brainrotgames.com/games/game-01/"
 *
 * The score is formatted with commas for numbers >= 1000.
 * Text is always lowercase except the game title (uppercase per brand).
 * No emoji. Matches brand voice.
 */
export function generateShareText(gameTitle, score, shareUrl) {}
```

---

### 2g. `games/shared/styles.css`

Imports the design system and adds shared game chrome styles.

```css
/* Import the design system (path relative to games/shared/) */
@import url('../../brand/design-system.css');

/* ---- Game Container ---- */
.game-container {
  position: relative;
  width: 100%;
  max-width: var(--max-width-game); /* 480px */
  margin: 0 auto;
  overflow: hidden;
}

#game-canvas {
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* ---- Prevent scroll/bounce on game pages ---- */
html, body {
  overscroll-behavior: none;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* ---- Canvas centering on desktop ---- */
body {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 3. Data Flow Diagram

### Game Initialization Sequence

```
  Page Load
      |
      v
  index.html loads <script type="module" src="js/main.js">
      |
      v
  main.js:
    1. import { GameShell } from '../shared/game-shell.js'
    2. import { createInputManager } from '../shared/input-manager.js'
    3. import { initAudio, registerSound } from '../shared/sound-manager.js'
    4. import game-specific modules (player.js, obstacle.js, etc.)
      |
      v
  Create GameShell instance with config { title, gameId, logicalWidth, logicalHeight, ... }
      |
      v
  shell.init()
    -> Query DOM: <canvas id="game-canvas">, overlay containers
    -> Set canvas logical size, apply DPR scaling
    -> Attach window resize listener
    -> Set body data-theme
    -> Load high score from ScoreManager
    -> setState('menu')
      |
      v
  createInputManager(canvas, logicalWidth, logicalHeight)
    -> Attach mousedown, touchstart, keydown listeners
      |
      v
  [User gesture: first tap on "start game" button]
      |
      v
  initAudio()  <-- MUST happen inside user gesture handler
    -> Create AudioContext + master GainNode
    -> Register built-in sound presets
      |
      v
  Register game-specific sounds via registerSound()
      |
      v
  shell.setState('playing')
    -> Hide menu overlay
    -> Call shell.onStart()  <-- game resets state (score=0, entities cleared, player at start)
    -> Start requestAnimationFrame loop
```

### Game Loop (per frame, while state='playing')

```
  requestAnimationFrame fires
      |
      v
  Calculate dt = (timestamp - lastTimestamp) / 16.67
  Clamp dt to max 3.0 (prevents spiral on tab-switch)
      |
      v
  shell.onUpdate(dt)
    |
    +---> Game reads input state
    +---> Update entities (player physics, obstacle scroll, spawn timers, etc.)
    +---> Check collisions
    +---> Update score, combo, timers
    +---> Check game-over conditions (collision, timer=0)
    +---> If game over: shell.setState('game-over')
      |
      v
  shell.onRender(ctx)
    |
    +---> Clear canvas (ctx.clearRect or background fill)
    +---> Draw background layers
    +---> Draw entities (obstacles, holes, characters)
    +---> Draw player
    +---> Draw effects (particles, floating text, screen shake)
    +---> Draw HUD (score, timer, combo -- on canvas)
      |
      v
  requestAnimationFrame(loop)  <-- schedule next frame
```

### Game-Over Flow

```
  Game-over condition detected (collision / timer = 0)
      |
      v
  shell.setState('game-over')
    -> Stop requestAnimationFrame loop
    -> Call shell.onGameOver() -> returns { score, message, scoreLabel }
    -> ScoreManager.setHighScore(gameId, score)
    -> ScoreManager.setLastScore(gameId, score)
    -> Populate game-over overlay DOM
    -> Animate score count-up
    -> Show overlay (fade in)
      |
      v
  [Player taps "run it back"]
    -> shell.setState('playing')
    -> shell.onStart() resets all game state
    -> Game loop restarts
      |
  OR
      v
  [Player taps "menu"]
    -> shell.setState('menu')
    -> Show menu overlay
      |
  OR
      v
  [Player taps "flex this"]
    -> shareScore(gameTitle, score, shareUrl)
    -> Update button text: "copied!" or "shared!" for 2 seconds
```

---

## 4. Dev Server Setup

### `package.json`

```json
{
  "name": "brainrot-games",
  "version": "1.0.0",
  "description": "Meme-themed HTML5 browser games",
  "private": true,
  "scripts": {
    "dev": "npx live-server . --port=3000 --no-browser",
    "start": "npx live-server . --port=3000"
  }
}
```

### Usage

```bash
# Start dev server with auto-reload on file changes
npm run dev

# Then open:
#   http://localhost:3000/               -- Landing page
#   http://localhost:3000/games/game-01/ -- Flappy Tralalero
#   http://localhost:3000/games/game-02/ -- Whack-a-Rot
```

No build step. No bundler. No compilation. Save a file, the browser reloads automatically.

### HTML Template Pattern (used by each game's `index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>{GAME TITLE} -- brainrot games</title>
  <meta name="description" content="{game description}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="{GAME TITLE}">
  <meta property="og:description" content="{game description}">
  <meta property="og:url" content="https://brainrotgames.com/games/game-NN/">

  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">
  <link rel="stylesheet" href="../shared/styles.css">
  <link rel="stylesheet" href="style.css">
</head>
<body data-theme="{theme-name}">
  <div class="game-container">
    <canvas id="game-canvas"></canvas>

    <!-- Menu overlay (populated by GameShell) -->
    <div id="menu-overlay" class="menu-screen">
      <!-- Shell injects title, subtitle, buttons -->
    </div>

    <!-- Game-over overlay (populated by GameShell) -->
    <div id="gameover-overlay" class="game-over-overlay" style="display:none;">
      <!-- Shell injects score, message, buttons -->
    </div>
  </div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```
