# Game 02: WHACK-A-ROT -- Implementation Architecture

**Source GDD:** `/design-docs/GDD-02.md`
**Shared infrastructure:** `/architecture/ARCHITECTURE.md`

---

## 1. File Listing

```
games/game-02/
  index.html            Entry point. Canvas, overlay containers, module script tag.
                        Body: data-theme="italian-brainrot"
                        Loads: ../shared/styles.css, style.css, js/main.js (type=module)

  style.css             Game-specific overrides. HUD positioning, timer warning styles,
                        wave progress bar, combo display positioning.
                        Minimal -- most styling from shared/styles.css + design-system.css.

  js/
    main.js             Entry point. Creates GameShell, InputManager, registers sounds.
                        Wires onStart/onUpdate/onRender/onGameOver callbacks.
                        Manages round counter. Initializes audio on first gesture.

    game.js             Core game orchestrator. Spawn scheduler, wave system,
                        timer countdown, active character tracking. Exports functions
                        called by main.js callbacks.

    characters.js       6 character type definitions. Each: draw(ctx, cx, cy, time),
                        getHitboxCenter(cx, cy, time), basePoints, displayTimeMultiplier,
                        hitboxRadius, spawn weight tables.

    holes.js            3x3 grid. Hole position constants, hole state machine,
                        hole rendering (ellipse portal, swirl, rim), character clipping.

    effects.js          Visual effects: impact flash, floating score text, screen shake,
                        combo milestone text, ambient particles.

    constants.js        All tuning values: grid positions, timing formulas, scoring,
                        combo thresholds, colors, messages, dimensions.

    ui.js               Game-specific UI beyond what GameShell provides:
                        on-canvas HUD (score, timer, combo counter, wave progress),
                        hit stats display on game-over, mute toggle icon.
```

---

## 2. Game State Machine

Whack-a-Rot uses the GameShell's 3 states directly. No sub-states needed (unlike Flappy Tralalero's ready/active split).

```
                    +-----------+
          +-------->|   MENU    |<-----------+
          |         +-----+-----+            |
          |               |                  |
          |        tap "start game"          |
          |               |                  |
          |         +-----v-----+            |
          |         |  PLAYING  |            |
          |         |           |            |
          |         +-----+-----+            |
          |               |                  |
          |          timer = 0               |
          |               |                  |
          |         +-----v-----+            |
          +---------| GAME OVER |------------+
           "menu"   +-----------+   "retry"
```

### State Behaviors

| State | What Happens |
|-------|-------------|
| **MENU** | Shell shows menu overlay. Canvas draws static background with hole grid (no characters). Title "WHACK-A-ROT" in accent color. High score displayed. |
| **PLAYING** | Game loop active. 60-second countdown timer. Characters spawning from holes. Player taps to whack. Score, combo, timer updating every frame. Wave system advancing every 15s. |
| **GAME OVER** | Shell shows game-over overlay. Canvas shows final game frame (frozen). Score, high score, death message, hit stats displayed on overlay. |

### Transition Logic

```
MENU -> PLAYING (shell.setState('playing')):
  shell.onStart() fires:
    score = 0
    combo = 0
    maxCombo = 0
    timer = 60.0
    wave = 1
    round++ (or round = 1 if first)
    effectiveWave = wave + (round - 1) * 2
    Clear all holes to 'empty' state
    Reset hit stats to all zeros
    Clear all active effects
    Reset spawn timer

PLAYING -> GAME OVER (shell.setState('game-over')):
  Triggered when timer <= 0
  shell.onGameOver() fires:
    return { score, message, scoreLabel: 'aura points', extra: hitStats }

GAME OVER -> PLAYING (retry):
  shell.onStart() fires (same as above, round increments)

GAME OVER -> MENU:
  round resets to 0
```

---

## 3. Entity Definitions

### 3.1 Hole

The 3x3 grid is the playing field. Each hole is a state machine that manages character lifecycle.

```js
class Hole {
  // ---- Properties ----

  id;                          // Index 0-8
  x;                           // Center X position (logical px)
  y;                           // Center Y position (logical px)
  state = 'empty';             // 'empty'|'rising'|'visible'|'sinking'|'hit'
  stateTimer = 0;              // ms elapsed in current state
  character = null;            // Character type object (from characters.js) or null
  displayTime = 0;             // Total ms this character will be visible (set on spawn)
  hitScale = 1.0;              // Scale multiplier for hit animation (1.0 normal, peaks at 1.3)
  hitFlashAlpha = 0;           // White flash overlay opacity during hit animation (0-0.6)

  // ---- Grid Position Constants (logical canvas 400x600) ----

  static POSITIONS = [
    { x: 80,  y: 227 },   // [0,0] top-left
    { x: 200, y: 227 },   // [1,0] top-center
    { x: 320, y: 227 },   // [2,0] top-right
    { x: 80,  y: 340 },   // [0,1] mid-left
    { x: 200, y: 340 },   // [1,1] mid-center
    { x: 320, y: 340 },   // [2,1] mid-right
    { x: 80,  y: 453 },   // [0,2] bot-left
    { x: 200, y: 453 },   // [1,2] bot-center
    { x: 320, y: 453 },   // [2,2] bot-right
  ];

  // ---- Timing Constants ----

  static RISE_DURATION = 200;     // ms for character to fully emerge from hole
  static SINK_DURATION = 150;     // ms for character to descend back into hole
  static HIT_ANIM_DURATION = 200; // ms for impact animation before sinking

  // ---- Constructor ----

  /**
   * @param {number} id -- Index 0-8
   */
  constructor(id) {
    this.id = id;
    this.x = Hole.POSITIONS[id].x;
    this.y = Hole.POSITIONS[id].y;
  }

  // ---- Methods ----

  /**
   * Spawn a character in this hole. Transition from 'empty' to 'rising'.
   *
   * @param {Object} characterType -- Character definition from characters.js
   * @param {number} displayTime   -- How long (ms) this character stays visible
   *
   * Precondition: state must be 'empty'. If not, this is a no-op.
   */
  spawn(characterType, displayTime) {}

  /**
   * Per-frame update. Advances state machine timers and transitions.
   *
   * @param {number} dt -- Normalized delta time (1.0 = 16.67ms)
   *
   * State transitions:
   *   'rising':  stateTimer += dt * 16.67
   *              If stateTimer >= RISE_DURATION -> state = 'visible', stateTimer = 0
   *
   *   'visible': stateTimer += dt * 16.67
   *              If stateTimer >= displayTime -> state = 'sinking', stateTimer = 0
   *              (Character was missed -- combo breaks)
   *              Returns { event: 'miss', characterType: this.character }
   *
   *   'sinking': stateTimer += dt * 16.67
   *              If stateTimer >= SINK_DURATION -> state = 'empty', character = null, stateTimer = 0
   *
   *   'hit':     stateTimer += dt * 16.67
   *              Animate: hitScale = lerp(1.3, 1.0, stateTimer / HIT_ANIM_DURATION)
   *              Animate: hitFlashAlpha = lerp(0.6, 0, stateTimer / HIT_ANIM_DURATION)
   *              If stateTimer >= HIT_ANIM_DURATION -> state = 'sinking', stateTimer = 0
   *
   *   'empty':   No-op.
   *
   * @returns {{ event: string, characterType: Object }|null}
   *   Returns { event: 'miss', characterType } when a character despawns untapped.
   *   Returns null otherwise.
   */
  update(dt) {}

  /**
   * Register a hit on this hole. Transition to 'hit' state.
   *
   * Precondition: state must be 'rising' or 'visible'. Otherwise returns null.
   *
   * @returns {{ characterType: Object, points: number }|null}
   *   Returns the character type and base points if hit was valid.
   *   Returns null if hole has no hittable character.
   *
   * Side effects:
   *   state = 'hit'
   *   stateTimer = 0
   *   hitScale = 1.3
   *   hitFlashAlpha = 0.6
   */
  hit() {}

  /**
   * Test if a tap at (tapX, tapY) in logical coordinates hits this hole's character.
   * Uses the character's hitbox (circle) and accounts for per-character modifiers.
   *
   * @param {number} tapX -- Tap X in logical canvas space
   * @param {number} tapY -- Tap Y in logical canvas space
   * @param {number} time -- Current game time in ms (for sway calculations)
   * @returns {boolean} true if tap is inside the character's hitbox
   *
   * Logic:
   *   If state is not 'rising' or 'visible': return false
   *   hitCenter = character.getHitboxCenter(this.x, this.y, time)
   *   radius = character.hitboxRadius
   *   dx = tapX - hitCenter.x
   *   dy = tapY - hitCenter.y
   *   return (dx*dx + dy*dy) <= (radius*radius)
   */
  isHit(tapX, tapY, time) {}

  /**
   * Draw the hole (portal) and any character currently in it.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time -- Game time in ms (for idle animations, swirl rotation)
   *
   * Draw order:
   *   1. Hole shadow ellipse (below hole)
   *   2. If character present (state != 'empty'):
   *        Calculate clipHeight based on state:
   *          'rising':  clipHeight = (stateTimer / RISE_DURATION) * 80  (0 to 80px)
   *          'visible': clipHeight = 80 (fully visible)
   *          'hit':     clipHeight = 80 (fully visible, with flash/scale)
   *          'sinking': clipHeight = (1 - stateTimer / SINK_DURATION) * 80  (80 to 0px)
   *        ctx.save()
   *        Create clipping region: rect from (x-35, y-clipHeight) to (x+35, y+20)
   *        Apply hitScale if in 'hit' state
   *        character.draw(ctx, this.x, this.y, time)
   *        If hitFlashAlpha > 0: overlay white rect at alpha
   *        ctx.restore()
   *   3. Hole opening ellipse (covers character's lower body for "emerging" effect)
   *   4. Hole rim highlight stroke
   *   5. Swirl detail arcs (animated, subtle)
   */
  draw(ctx, time) {}

  /**
   * Reset hole to empty state.
   */
  reset() {}

  /**
   * Check if this hole is available for spawning.
   * @returns {boolean} true if state === 'empty'
   */
  isAvailable() {}
}
```

### 3.2 Character Types

Defined as plain objects in `characters.js`. Not classes -- these are type definitions, not instances.

```js
export const CHARACTER_TYPES = {

  tralalero: {
    id: 'tralalero',
    name: 'Tralalero Tralala',
    basePoints: 100,
    displayTimeMultiplier: 1.0,     // standard
    hitboxRadius: 40,               // standard
    spawnWeights: {                  // by effective wave range
      early: 0.35,                  // wave 1-2
      mid: 0.30,                    // wave 3-4
      late: 0.25,                   // wave 5+
    },
    appearsFromWave: 1,             // available from the start

    /**
     * Draw this character at the given center position.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cx -- Center X of hole
     * @param {number} cy -- Center Y of hole minus 40 (character center is 40px above hole)
     * @param {number} time -- Game time in ms (drives idle animation)
     *
     * Draws: blue shark body (ellipse), pointed head, 2 eyes with pupils,
     *        wide toothy grin, dorsal fin, 3 legs with Nike shoes.
     * Idle: body bobs cy + 3*sin(time*0.004)
     *
     * Full draw spec: GDD-02, Section 4.1, Character 1
     */
    draw(ctx, cx, cy, time) {},

    /**
     * Get the current hitbox center, accounting for any movement.
     * Tralalero is stationary (standard hitbox).
     *
     * @param {number} cx -- Hole center X
     * @param {number} cy -- Hole center Y
     * @param {number} time -- Game time (unused for this character)
     * @returns {{ x: number, y: number }} Hitbox center: { x: cx, y: cy - 40 }
     */
    getHitboxCenter(cx, cy, time) {
      return { x: cx, y: cy - 40 };
    },
  },

  bombardiro: {
    id: 'bombardiro',
    name: 'Bombardiro Crocodilo',
    basePoints: 200,
    displayTimeMultiplier: 0.6,     // fast -- 60% of standard display time
    hitboxRadius: 40,               // standard
    spawnWeights: { early: 0.20, mid: 0.20, late: 0.20 },
    appearsFromWave: 1,

    /**
     * Draws: olive green bomber fuselage body, wings with tips,
     *        bright green crocodile head, elongated snout with nostrils,
     *        yellow eyes with slit pupils, zigzag teeth, spinning propeller.
     * Idle: propeller spins (angle += time * 0.01), body rocks 2px at 1.5Hz
     *
     * Full draw spec: GDD-02, Section 4.1, Character 2
     */
    draw(ctx, cx, cy, time) {},

    getHitboxCenter(cx, cy, time) {
      return { x: cx, y: cy - 40 };
    },
  },

  tungtung: {
    id: 'tungtung',
    name: 'Tung Tung Tung Sahur',
    basePoints: 150,
    displayTimeMultiplier: 1.3,     // slow -- 130% of standard display time
    hitboxRadius: 30,               // SMALLER than standard (narrow plank body)
    spawnWeights: { early: 0.20, mid: 0.18, late: 0.15 },
    appearsFromWave: 1,

    /**
     * Draws: brown wooden plank body, wood grain lines, painted face
     *        (angry eyes, eyebrows, flat mouth), red headband with tail,
     *        baseball bat held to the right.
     * Idle: bat swings in repeating arc (+/-15deg at 4Hz, "tung tung tung" rhythm)
     *
     * Full draw spec: GDD-02, Section 4.1, Character 3
     */
    draw(ctx, cx, cy, time) {},

    getHitboxCenter(cx, cy, time) {
      return { x: cx, y: cy - 40 };
    },
  },

  ballerina: {
    id: 'ballerina',
    name: 'Ballerina Cappuccina',
    basePoints: 150,
    displayTimeMultiplier: 1.0,     // standard
    hitboxRadius: 40,               // standard
    spawnWeights: { early: 0.15, mid: 0.15, late: 0.15 },
    appearsFromWave: 1,

    /**
     * Draws: pink trapezoid torso, fan tutu skirt, curved ballet arms,
     *        white ceramic coffee cup head with handle, dark coffee inside,
     *        steam wisps (animated sine waves), happy face with blush.
     * Idle: sways left-right, entire character x += 15 * sin(time * 0.003)
     *
     * Full draw spec: GDD-02, Section 4.1, Character 4
     */
    draw(ctx, cx, cy, time) {},

    /**
     * Hitbox center SHIFTS with sway. This is the key mechanic:
     * the hitbox moves with the visual, so players must track the sway.
     *
     * @returns {{ x: number, y: number }}
     *   x = cx + 15 * Math.sin(time * 0.003)
     *   y = cy - 40
     */
    getHitboxCenter(cx, cy, time) {
      return { x: cx + 15 * Math.sin(time * 0.003), y: cy - 40 };
    },
  },

  brrbrr: {
    id: 'brrbrr',
    name: 'Brr Brr Patapim',
    basePoints: -200,               // PENALTY: negative points
    displayTimeMultiplier: 1.2,     // lingers slightly longer than standard (bait)
    hitboxRadius: 40,               // standard
    spawnWeights: { early: 0.10, mid: 0.15, late: 0.20 },
    appearsFromWave: 1,
    isPenalty: true,                // Flag for scoring logic

    /**
     * Draws: red spiky circle body (8 triangular spikes), cute face
     *        (large white eyes, big pupils with kawaii highlights, small frown),
     *        warning triangle with "!" above head, pulsing red glow shadow.
     * Idle: jitters +/-1px randomly each frame, spikes pulse (radius 32-36),
     *       blinks every 2s (eyes close for 100ms), lip quivers at 3Hz
     *
     * VISUALLY DISTINCT: red color, spikes, warning indicator.
     *
     * Full draw spec: GDD-02, Section 4.1, Character 5
     */
    draw(ctx, cx, cy, time) {},

    getHitboxCenter(cx, cy, time) {
      return { x: cx, y: cy - 40 };
    },
  },

  lirili: {
    id: 'lirili',
    name: 'Lirili Larila',
    basePoints: 500,                // RARE BONUS: high points
    displayTimeMultiplier: 0.4,     // very fast -- 40% of standard display time
    hitboxRadius: 40,               // standard
    spawnWeights: { early: 0, mid: 0.02, late: 0.05 },
    appearsFromWave: 3,             // Does NOT appear before wave 3
    isBonus: true,                  // Flag for effects logic

    /**
     * Draws: small gold oval body, 4 butterfly wings (ellipses, 70% opacity,
     *        sparkle dots blinking), small black dot eyes, tiny smile, curved
     *        antennae with tip dots, pulsing radial gold glow behind entire character.
     * Idle: wings flap (+/-10deg at 6Hz), character floats upward slowly
     *       (rises 15px total over display duration), wing sparkles shimmer randomly
     *
     * Full draw spec: GDD-02, Section 4.1, Character 6
     */
    draw(ctx, cx, cy, time) {},

    getHitboxCenter(cx, cy, time) {
      return { x: cx, y: cy - 40 };
    },
  },
};
```

### 3.3 SpawnScheduler (in `game.js`)

Manages when and where characters spawn.

```js
class SpawnScheduler {
  // ---- Properties ----

  spawnTimer = 0;                  // ms until next spawn attempt
  gameTime = 0;                    // Total ms elapsed in this round

  // ---- Methods ----

  /**
   * Per-frame update. Advances timer and spawns characters when ready.
   *
   * @param {number} dt         -- Normalized delta time
   * @param {Hole[]} holes      -- Array of 9 Hole instances
   * @param {number} effectiveWave -- Current effective wave number
   * @returns {void}
   *
   * Logic:
   *   gameTime += dt * 16.67
   *   spawnTimer -= dt * 16.67
   *
   *   If spawnTimer <= 0:
   *     spawnInterval = max(300, 900 - effectiveWave * 60)
   *     spawnTimer = spawnInterval + randomBetween(-50, 50)  // slight jitter
   *
   *     maxActive = min(5, 1 + floor(effectiveWave / 2))
   *     currentActive = count of holes where state != 'empty'
   *     If currentActive >= maxActive: return (skip spawn)
   *
   *     Pick random available hole (state === 'empty')
   *     Pick character type via weighted random (see selectCharacterType)
   *     Calculate displayTime for this character:
   *       baseDisplayTime = max(400, 1200 - effectiveWave * 80)
   *       displayTime = baseDisplayTime * character.displayTimeMultiplier
   *     hole.spawn(characterType, displayTime)
   */
  update(dt, holes, effectiveWave) {}

  /**
   * Select a character type using weighted random based on effective wave.
   *
   * @param {number} effectiveWave
   * @returns {Object} A character type object from CHARACTER_TYPES
   *
   * Logic:
   *   1. Build weight table from CHARACTER_TYPES:
   *      For each character:
   *        If effectiveWave < character.appearsFromWave: weight = 0
   *        Else: weight = interpolate between early/mid/late spawn weights
   *          effectiveWave 1-2: use 'early'
   *          effectiveWave 3-4: use 'mid'
   *          effectiveWave 5+:  use 'late'
   *   2. Override penalty weight with formula:
   *      penaltyWeight = min(0.25, 0.10 + effectiveWave * 0.02)
   *      (This overrides brrbrr's table weight for precise control)
   *   3. Normalize all weights to sum to 1.0
   *   4. Random select based on cumulative weights
   */
  selectCharacterType(effectiveWave) {}

  /**
   * Reset for new round.
   */
  reset() {}
}
```

### 3.4 Timer

```js
class GameTimer {
  // ---- Properties ----

  remaining = 60.0;           // Seconds remaining (float, tenths precision)
  isWarning = false;          // true when remaining < 10.0
  paused = false;             // true when tab is not visible

  // ---- Methods ----

  /**
   * Per-frame update. Counts down.
   *
   * @param {number} dt -- Normalized delta time
   * @returns {boolean} true if timer just reached 0 (game over trigger)
   *
   * If paused: return false (no update)
   * remaining -= (dt * 16.67) / 1000   // convert dt-ms to seconds
   * isWarning = remaining < 10.0
   * If remaining <= 0:
   *   remaining = 0
   *   return true  // game over
   * return false
   */
  update(dt) {}

  /**
   * Draw the timer on canvas.
   *
   * @param {CanvasRenderingContext2D} ctx
   *
   * Position: top-right, x=370, y=36
   * Font: Bungee, 28px
   * Format: "00:" + remaining.toFixed(0) padded to 2 digits (e.g., "00:42")
   *   When remaining < 10: show decimal "00:09.3"
   * Color: isWarning ? '#ff2d78' (Hot Magenta) : '#f0f0f0'
   * If isWarning: apply gentle pulse (scale 1.0 to 1.05 at 2Hz via sin(time * 0.012))
   */
  draw(ctx, time) {}

  /**
   * Reset to 60 seconds.
   */
  reset() {}

  /**
   * Pause/resume (for tab visibility changes).
   * @param {boolean} paused
   */
  setPaused(paused) {}
}
```

The timer pauses when the browser tab loses focus, detected via:
```js
document.addEventListener('visibilitychange', () => {
  timer.setPaused(document.hidden);
});
```

### 3.5 ComboCounter

```js
class ComboCounter {
  // ---- Properties ----

  count = 0;                   // Current consecutive hit count
  maxCombo = 0;                // Highest combo this round (for stats)
  multiplier = 1.0;            // Current score multiplier
  lastMilestoneShown = 0;      // Last combo milestone that triggered feedback

  // ---- Milestone Table ----

  static MILESTONES = [
    { threshold: 5,  text: 'NICE',          color: '#00e5ff' },  // Cyan Pulse
    { threshold: 10, text: 'SIGMA STREAK',  color: '#c8ff00' },  // Electric Lime
    { threshold: 15, text: 'MAXIMUM AURA',  color: '#ffd000' },  // Brainrot Yellow
    { threshold: 20, text: 'TRANSCENDENT',  color: '#c8ff00' },  // Electric Lime (continuous glow)
  ];

  // ---- Methods ----

  /**
   * Increment combo on successful (non-penalty) hit.
   *
   * @returns {{ milestone: Object|null }} Returns milestone object if a new milestone was reached.
   *
   * count++
   * if count > maxCombo: maxCombo = count
   * multiplier = min(4.0, 1 + count * 0.25)
   *
   * Check milestones:
   *   For each milestone where threshold <= count and threshold > lastMilestoneShown:
   *     lastMilestoneShown = threshold
   *     return { milestone }
   *   return { milestone: null }
   */
  increment() {}

  /**
   * Reset combo to 0. Called on miss or penalty hit.
   */
  resetCombo() {}

  /**
   * Calculate score for a hit.
   *
   * @param {number} basePoints -- Character's base point value
   * @returns {number} Math.floor(basePoints * multiplier)
   *
   * Note: For penalty characters (basePoints < 0), the multiplier is NOT applied.
   * Penalty is always flat -200 regardless of combo.
   */
  calculateScore(basePoints) {}

  /**
   * Draw the combo counter on the HUD (on-canvas).
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth -- 400
   *
   * Only visible when count > 0.
   * Position: centered horizontally, y=78
   * Font: Space Grotesk 500, 16px
   * Color: '#00ffaa' (Mint Aura)
   * Format: "combo x{count}" (e.g., "combo x5")
   *
   * If count >= 20: apply continuous lime glow to score display
   *   (communicated via a flag, not drawn here)
   */
  draw(ctx, canvasWidth) {}

  /**
   * Reset all state for new round.
   */
  reset() {}
}
```

### 3.6 Effects (in `effects.js`)

```js
/**
 * Manages all transient visual effects: floating text, impact flash, screen shake,
 * combo milestone announcements, ambient particles.
 */
class EffectsManager {
  // ---- Internal State ----

  floatingTexts = [];          // Array of { text, x, y, color, alpha, timer, maxTimer }
  screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
  particles = [];              // Ambient floating particles: { x, y, vx, vy, alpha, radius }

  // ---- Methods ----

  /**
   * Spawn a floating score text that rises and fades.
   *
   * @param {string} text   -- Text to display (e.g., "+100", "+200", "NICE")
   * @param {number} x      -- Center X position
   * @param {number} y      -- Start Y position
   * @param {string} color  -- Fill color hex
   * @param {number} [duration=500] -- Total duration in ms
   *
   * The text rises 40px and fades from alpha 1.0 to 0.0 over duration.
   * Font: Bungee, 20px for score numbers, 28px for milestone text.
   */
  spawnFloatingText(text, x, y, color, duration = 500) {}

  /**
   * Start screen shake effect.
   *
   * @param {number} magnitude  -- Max displacement in px (e.g., 4)
   * @param {number} durationMs -- Total duration in ms (e.g., 300)
   */
  startScreenShake(magnitude, durationMs) {}

  /**
   * Initialize ambient particles (call once on game start).
   * Creates 10-15 tiny circles that drift upward slowly.
   * Particles: radius 1-2px, fill #c8ff00 at 10-20% opacity.
   */
  initParticles(canvasWidth, canvasHeight) {}

  /**
   * Per-frame update for all effects.
   *
   * @param {number} dt -- Normalized delta time
   *
   * Floating texts: advance timer, update position (rise), update alpha (fade).
   *   Remove texts where timer >= maxTimer.
   * Screen shake: advance timer, calculate random offset * intensity.
   *   Intensity decays linearly to 0 over duration.
   * Particles: move upward slowly, wrap when they reach top.
   */
  update(dt) {}

  /**
   * Draw all active effects.
   *
   * @param {CanvasRenderingContext2D} ctx
   *
   * Draw order:
   *   1. Ambient particles (behind everything game-related, but EffectsManager
   *      should be called after background and before HUD)
   *   2. Floating texts
   *   (Screen shake is applied externally via ctx.translate before game draw)
   */
  draw(ctx) {}

  /**
   * Get current screen shake offset. Used by main render to apply ctx.translate.
   * @returns {{ x: number, y: number }}
   */
  getShakeOffset() {}

  /**
   * Clear all effects (for round reset).
   */
  reset() {}
}
```

---

## 4. Game Loop Detail

### Update Order (inside `onUpdate(dt)`)

```
1.  Timer:
      gameOver = timer.update(dt)
      If gameOver: shell.setState('game-over'), return

2.  Wave calculation:
      elapsedSeconds = 60 - timer.remaining
      wave = min(4, 1 + floor(elapsedSeconds / 15))
      effectiveWave = wave + (round - 1) * 2

3.  Spawn scheduler:
      spawnScheduler.update(dt, holes, effectiveWave)

4.  Hole updates (all 9 holes):
      For each hole:
        result = hole.update(dt)
        If result && result.event === 'miss':
          combo.resetCombo()
          // Optionally: playSound('miss')

5.  Input processing:
      (Handled via inputManager.onTapAt callback, which sets a pending tap queue)
      For each pending tap { x, y }:
        hitFound = false
        For each hole (front-to-back, bottom row first for z-order):
          If hole.isHit(tapX, tapY, gameTime):
            result = hole.hit()
            If result:
              hitFound = true
              If result.characterType.isPenalty:
                score = max(0, score - 200)
                combo.resetCombo()
                effects.startScreenShake(4, 300)
                playSound('penalty')
                hitStats.brrbrr++
              Else:
                milestoneResult = combo.increment()
                points = combo.calculateScore(result.characterType.basePoints)
                score += points
                effects.spawnFloatingText('+' + points, hole.x, hole.y - 60, '#c8ff00')
                playSound(result.characterType.isBonus ? 'bonus' : 'hit')
                hitStats[result.characterType.id]++
                If milestoneResult.milestone:
                  effects.spawnFloatingText(milestoneResult.milestone.text,
                    200, 140, milestoneResult.milestone.color, 800)
                  playSound('combo')
            break  // Only hit one character per tap

6.  Score display update:
      scoreDisplay.update(dt, score)

7.  Effects update:
      effects.update(dt)
```

### Render Order (inside `onRender(ctx)`)

```
1.  Apply screen shake:
      shakeOffset = effects.getShakeOffset()
      ctx.save()
      ctx.translate(shakeOffset.x, shakeOffset.y)

2.  Background:
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, 400, 600)
      Draw far background (Italian cityscape silhouette, drifting)
      Draw mid background (radial gradient spotlight)
      Draw ground plane strip

3.  Ambient particles:
      effects.drawParticles(ctx)

4.  Holes and characters (draw order: top row first, bottom row last for overlap):
      For row = 0 to 2:
        For col = 0 to 2:
          holes[row * 3 + col].draw(ctx, gameTime)

5.  Restore screen shake:
      ctx.restore()

6.  HUD (NOT affected by screen shake):
      Draw "AURA POINTS" label: Space Grotesk 500, 14px, #8888a0, centered, y=16
      Draw score number: Bungee, 48px, #f0f0f0 (or #c8ff00 during flash), centered, y=58
      combo.draw(ctx, 400)
      timer.draw(ctx, gameTime)
      Draw mute icon button: top-left, 36x36px
      Draw wave progress bar: bottom, y=585, 4 segments

7.  Floating text effects (drawn above everything):
      effects.drawFloatingTexts(ctx)
```

---

## 5. Difficulty Progression Formulas

All formulas use `effectiveWave = wave + (round - 1) * 2` where:
- `wave` = 1 to 4 within a round (changes every 15 seconds)
- `round` = increments each time the player replays (starts at 1)

### Display Time (how long a character stays visible)

```
baseDisplayTime = max(400, 1200 - effectiveWave * 80) ms
actualDisplayTime = baseDisplayTime * character.displayTimeMultiplier
```

| Effective Wave | Base Display Time | Tralalero (1.0x) | Bombardiro (0.6x) | Lirili (0.4x) |
|---------------|-------------------|------------------|--------------------|----------------|
| 1 | 1120ms | 1120ms | 672ms | -- (not yet) |
| 2 | 1040ms | 1040ms | 624ms | -- |
| 3 | 960ms | 960ms | 576ms | 384ms |
| 4 | 880ms | 880ms | 528ms | 352ms |
| 5 | 800ms | 800ms | 480ms | 320ms |
| 10 | 400ms (min) | 400ms | 240ms | 160ms |

### Spawn Interval (time between spawns)

```
spawnInterval = max(300, 900 - effectiveWave * 60) ms
```

| Effective Wave | Spawn Interval | Spawns per Minute |
|---------------|---------------|-------------------|
| 1 | 840ms | ~71 |
| 2 | 780ms | ~77 |
| 3 | 720ms | ~83 |
| 4 | 660ms | ~91 |
| 5 | 600ms | ~100 |
| 10 | 300ms (min) | ~200 |

### Max Active Characters

```
maxActive = min(5, 1 + floor(effectiveWave / 2))
```

| Effective Wave | Max Active |
|---------------|-----------|
| 1 | 1 |
| 2 | 2 |
| 3 | 2 |
| 4 | 3 |
| 5 | 3 |
| 6 | 4 |
| 8 | 5 (cap) |

### Penalty Spawn Weight (Brr Brr Patapim)

```
penaltyWeight = min(0.25, 0.10 + effectiveWave * 0.02)
```

| Effective Wave | Penalty % |
|---------------|-----------|
| 1 | 12% |
| 2 | 14% |
| 3 | 16% |
| 4 | 18% |
| 5 | 20% |
| 8+ | 25% (cap) |

### Combo Multiplier

```
multiplier = min(4.0, 1 + comboCount * 0.25)
```

| Combo | Multiplier | 100pt Character | 200pt Character | 500pt Character |
|-------|-----------|-----------------|-----------------|-----------------|
| 0 | 1.00x | 100 | 200 | 500 |
| 1 | 1.25x | 125 | 250 | 625 |
| 4 | 2.00x | 200 | 400 | 1000 |
| 8 | 3.00x | 300 | 600 | 1500 |
| 12+ | 4.00x (cap) | 400 | 800 | 2000 |

Penalty (Brr Brr Patapim) is always flat -200, never multiplied.

### Round Progression Table (first 3 rounds)

| Round | Wave | Effective Wave | Display | Spawn Int | Max Active | Penalty % |
|-------|------|---------------|---------|-----------|-----------|-----------|
| 1 | 1 | 1 | 1120ms | 840ms | 1 | 12% |
| 1 | 2 | 2 | 1040ms | 780ms | 2 | 14% |
| 1 | 3 | 3 | 960ms | 720ms | 2 | 16% |
| 1 | 4 | 4 | 880ms | 660ms | 3 | 18% |
| 2 | 1 | 3 | 960ms | 720ms | 2 | 16% |
| 2 | 2 | 4 | 880ms | 660ms | 3 | 18% |
| 2 | 3 | 5 | 800ms | 600ms | 3 | 20% |
| 2 | 4 | 6 | 720ms | 540ms | 4 | 22% |
| 3 | 1 | 5 | 800ms | 600ms | 3 | 20% |
| 3 | 2 | 6 | 720ms | 540ms | 4 | 22% |
| 3 | 3 | 7 | 640ms | 480ms | 4 | 24% |
| 3 | 4 | 8 | 560ms | 420ms | 5 | 25% |

---

## 6. GameShell Integration

### main.js Wiring

```js
import { GameShell } from '../shared/game-shell.js';
import { createInputManager } from '../shared/input-manager.js';
import { initAudio, registerSound, playSound } from '../shared/sound-manager.js';
import { checkCollisionCirclePoint, clamp, randomBetween, randomInt, formatScore } from '../shared/utils.js';
import { CHARACTER_TYPES } from './characters.js';
import { Hole } from './holes.js';
import { SpawnScheduler } from './game.js';
import { GameTimer } from './game.js';
import { ComboCounter } from './ui.js';
import { EffectsManager } from './effects.js';
import * as C from './constants.js';

// ---- Game State (module-scoped) ----
let holes = [];
let spawnScheduler, timer, combo, effects;
let score = 0;
let wave = 1;
let round = 0;
let effectiveWave = 1;
let gameTime = 0;
let hitStats = { tralalero: 0, bombardiro: 0, tungtung: 0, ballerina: 0, brrbrr: 0, lirili: 0 };
let pendingTaps = [];

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'WHACK-A-ROT',
  gameId: 'whack-a-rot',
  logicalWidth: 400,
  logicalHeight: 600,
  maxDisplayWidth: 500,
  theme: 'italian-brainrot',
  subtitle: 'whack brainrot. earn aura. flex.',
  accentColor: '#ff3838',
  shareUrl: 'https://brainrotgames.com/games/game-02/',
});

// ---- Callbacks ----

shell.onStart = () => {
  round++;
  score = 0;
  wave = 1;
  effectiveWave = wave + (round - 1) * 2;
  gameTime = 0;

  holes = Array.from({ length: 9 }, (_, i) => new Hole(i));
  spawnScheduler = new SpawnScheduler();
  timer = new GameTimer();
  combo = new ComboCounter();
  effects = new EffectsManager();
  effects.initParticles(400, 600);

  hitStats = { tralalero: 0, bombardiro: 0, tungtung: 0, ballerina: 0, brrbrr: 0, lirili: 0 };
  pendingTaps = [];

  // Tab visibility pause
  document.addEventListener('visibilitychange', onVisibilityChange);
};

shell.onUpdate = (dt) => {
  gameTime += dt * 16.67;
  // ... full update loop as described in Section 4
};

shell.onRender = (ctx) => {
  // ... full render loop as described in Section 4
};

shell.onGameOver = () => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  const message = getGameOverMessage(score);
  return {
    score,
    message,
    scoreLabel: 'aura points',
    extra: { hitStats, maxCombo: combo.maxCombo },
  };
};

// Custom game-over rendering: hit stats
shell.onGameOverRender = (ctx) => {
  // Draw character hit stat icons + counts on the game-over extra area
  // Row of 6 mini character icons (24x24) with hit count below each
};

// ---- Input ----
shell.init();
const input = createInputManager(shell.getCanvas(), 400, 600);
input.onTap(() => {
  initAudio(); // Safe to call multiple times
});
input.onTapAt(({ x, y }) => {
  pendingTaps.push({ x, y });
});

// ---- Sound Registration ----
// After initAudio(), register game-specific sounds:
//   registerSound('hit', { ... })      -- standard bonk (overrides built-in)
//   registerSound('bonus', { ... })    -- Lirili sparkle arpeggio
//   registerSound('penalty', { ... })  -- Brr Brr buzzy wrong
//   registerSound('miss', { ... })     -- subtle womp
//   registerSound('combo', { ... })    -- milestone harmonic
//   registerSound('gameover', { ... }) -- descending 4-note
//   registerSound('highscore', { ... })-- ascending celebration
```

### Callback Summary

| Shell Callback | Whack-a-Rot Behavior |
|---------------|---------------------|
| `onStart()` | Increment round. Reset score=0, combo=0, timer=60, wave=1. Create 9 holes (empty). Init spawn scheduler. Init effects with ambient particles. Clear hit stats. |
| `onUpdate(dt)` | Update timer (check game-over). Calculate wave/effectiveWave. Run spawn scheduler. Update holes (check misses). Process tap queue (hit detection, scoring, effects). Update effects. |
| `onRender(ctx)` | Draw background. Draw ambient particles. Draw holes (top-to-bottom row order). Draw HUD (score, combo, timer, mute, wave bar). Draw floating text effects. |
| `onGameOver()` | Return `{ score, message, scoreLabel: "aura points", extra: { hitStats, maxCombo } }`. |
| `onGameOverRender(ctx)` | Draw character hit stats row (6 mini icons with counts) on canvas behind game-over overlay. |

### Tap Hit Detection Priority

When multiple characters overlap (rare but possible at adjacent holes), the tap is tested against holes in a specific order:

1. Bottom row first (row 2, indices 6-7-8) -- visually in front
2. Middle row (row 1, indices 3-4-5)
3. Top row (row 0, indices 0-1-2)

Within a row, left-to-right. First hit found wins -- one tap can only hit one character.

### localStorage Keys Used

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `whack-a-rot-highscore` | number (string) | `'0'` | All-time high score |
| `whack-a-rot-lastscore` | number (string) | `'0'` | Last round score |
| `whack-a-rot-rounds` | number (string) | `'0'` | Total rounds played (for ad frequency) |
| `whack-a-rot-muted` | `'true'`/`'false'` | `'false'` | Sound mute preference |

---

## 7. Background Rendering

```
Layer stack (back to front):

1. Base fill: #0a0a0f (Void)

2. Far background:
   - Italian cityscape silhouette: rectangles + triangles in #12121a
   - Includes a leaning tower shape (Pisa reference)
   - Drifts left at 0.2px/frame, wraps at canvas width * 2

3. Mid background:
   - Radial gradient: center #0f0f18, edge #0a0a0f
   - Creates spotlight-on-grid effect
   - Optional: faint grid lines connecting hole positions, #111118 at 20% opacity

4. Ground plane:
   - Elevated strip behind bottom hole row
   - Color: #13131d
   - Subtle depth illusion

5. Ambient particles (drawn by EffectsManager):
   - 10-15 tiny circles drifting upward
   - Radius 1-2px, fill #c8ff00 at 10-20% opacity
   - "Aura energy" ambiance
```

---

## 8. Wave Progress Bar

Visual indicator at the bottom of the canvas showing wave progression through the round.

```
Position: y=585, centered, width=320, height=4
Background: #1e1e2e (Surface Elevated)
Fill: #555570 (Text Tertiary)

4 segments, each 80px wide, separated by 1px gaps.
Fill percentage = (elapsed time within current wave) / 15 seconds.

Segment 1 fills during wave 1 (0-15s)
Segment 2 fills during wave 2 (15-30s)
Segment 3 fills during wave 3 (30-45s)
Segment 4 fills during wave 4 (45-60s)

Completed segments are fully filled. Current segment fills progressively.
Future segments are empty (background color only).
```

This is decorative information -- not critical to gameplay. Players primarily watch the timer.

---

## 9. Hit Stats (Game-Over Extra)

Tracked during gameplay in the `hitStats` object. Displayed on the game-over screen below the score.

```
Layout: horizontal row of 6 items, centered

Each item:
  - 24x24 mini character rendering (simplified version of the full draw function)
  - Below: hit count in Space Grotesk 500, 14px, Text Secondary
  - Penalty hits (brrbrr) shown in Hot Magenta color

Example visual:
  [shark] [croc] [plank] [cup] [spike] [butterfly]
    12      5      8       7     3!       1

This is screenshot-friendly -- players can flex their breakdown stats.
```
