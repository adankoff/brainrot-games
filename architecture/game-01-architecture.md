# Game 01: FLAPPY TRALALERO -- Implementation Architecture

**Source GDD:** `/design-docs/GDD-01.md`
**Shared infrastructure:** `/architecture/ARCHITECTURE.md`

---

## 1. File Listing

```
games/game-01/
  index.html            Entry point. Canvas, overlay containers, module script tag.
                        Body: data-theme="italian-brainrot"
                        Loads: ../shared/styles.css, style.css, js/main.js (type=module)

  style.css             Game-specific overrides. Positions character select row,
                        HUD canvas overlay, ready-state "tap to flap" hint text.
                        Minimal -- most styling from shared/styles.css + design-system.css.

  js/
    main.js             Entry point. Creates GameShell, InputManager, registers sounds.
                        Wires onStart/onUpdate/onRender/onGameOver callbacks.
                        Manages character select UI in menu. Initializes audio on first gesture.

    player.js           Player entity class. Gravity, velocity, position, rotation,
                        flap animation, hitbox, draw delegation to characters.js.

    obstacle.js         Obstacle pair class. Horizontal scrolling, gap generation,
                        type assignment, themed draw methods, hitbox getters.

    background.js       3-layer parallax background. Scrolling offsets, biome tinting,
                        floor rendering, skyline silhouettes, decorative shapes.

    characters.js       7 character definitions. Each: draw(ctx, x, y, animState),
                        flapSound config, deathSound config, unlock condition.
                        Exported as a keyed object for lookup by character ID.

    constants.js        All tuning values, colors, text content. Grouped by category:
                        PHYSICS, SCORING, DIFFICULTY, OBSTACLES, CHARACTERS, COLORS,
                        MESSAGES, DIMENSIONS, TIMING.

    ui.js               Game-specific UI beyond what GameShell provides:
                        character select row in menu, "tap to flap" ready hint,
                        score pop/flash effects (on-canvas), unlock notifications.
```

---

## 2. Game State Machine

Flappy Tralalero has 4 internal states. The GameShell provides 3 states (menu, playing, game-over). The game splits the shell's `playing` state into two sub-states internally: `ready` and `active`.

```
                        +-----------+
              +-------->|   MENU    |<-----------+
              |         +-----+-----+            |
              |               |                  |
              |         tap "start game"         |
              |               |                  |
              |         +-----v-----+            |
              |         |   READY   |            |
              |         | (sub-state|            |
              |         |  of shell |            |
              |         | 'playing')|            |
              |         +-----+-----+            |
              |               |                  |
              |          first tap               |
              |               |                  |
              |         +-----v-----+            |
              |         |  ACTIVE   |            |
              |         | (sub-state|            |
              |         |  of shell |            |
              |         | 'playing')|            |
              |         +-----+-----+            |
              |               |                  |
              |          collision                |
              |               |                  |
              |         +-----v-----+            |
              +---------| GAME OVER |------------+
               "menu"   +-----------+   "retry"
```

### State Behaviors

| State | Shell State | What Happens |
|-------|-------------|-------------|
| **MENU** | `'menu'` | Shell shows menu overlay. Background drawn on canvas behind overlay (idle character floating, parallax slowly scrolling). Character select row visible. High score shown. |
| **READY** | `'playing'` | Shell game loop running. Player hovers at start position (x=80, y=320). Background scrolls. No obstacles. "tap to flap" text pulses on canvas. Score shows 0. Waiting for first tap. |
| **ACTIVE** | `'playing'` | Full game loop. Physics active. Obstacles spawning and scrolling. Scoring live. Collision detection active. |
| **GAME OVER** | `'game-over'` | Shell shows game-over overlay. Canvas shows final death frame (player ragdolled, screen shake dissipating). Score count-up animation on overlay. Unlock check runs. |

### Transition Logic

```
onStart():
  internalState = 'ready'
  reset player to x=80, y=logicalHeight/2, velocity=0
  clear obstacles array
  score = 0
  scrollSpeed = BASE_SCROLL_SPEED
  deathCount (in-memory) unchanged

onUpdate(dt):
  if internalState === 'ready':
    update background scroll (slow, decorative)
    update player idle hover (gentle sine bob)
    on tap -> internalState = 'active', player.flap(), playSound('flap')

  if internalState === 'active':
    on tap -> player.flap(), playSound('flap')
    update player physics (gravity, velocity, position)
    update obstacles (scroll, spawn new, remove off-screen)
    update background (scroll at current speed)
    check scoring (player.x passes obstacle center)
    check collisions (player vs obstacles, floor, ceiling)
    update difficulty parameters from score
    if collision -> shell.setState('game-over')
```

---

## 3. Entity Definitions

### 3.1 Player

```js
class Player {
  // ---- Properties ----

  x = 80;                      // Fixed horizontal position (logical px). Never changes during gameplay.
  y = 320;                     // Vertical position (logical px). Center of canvas at start.
  width = 30;                  // Hitbox width (px). 75% of visual 40px.
  height = 30;                 // Hitbox height (px). 75% of visual 40px.
  velocity = 0;                // Vertical velocity (px/frame at 60fps). Positive = downward.
  rotation = 0;                // Visual rotation in radians. Derived from velocity each frame.
  characterId = 'tralalero';   // Current character ID. Set from character select before run starts.
  animFrame = 0;               // Current flap animation frame (0, 1, or 2).
  animTimer = 0;               // Milliseconds since last animation frame change.
  flapTimer = 0;               // Milliseconds remaining in flap animation (total 300ms).
  alive = true;                // false after collision. Disables input and enables ragdoll.
  deathVelocity = 0;           // Rotational velocity during death ragdoll.

  // ---- Constants (from constants.js) ----

  static GRAVITY = 0.4;            // px/frame^2 at 60fps. Added to velocity each frame.
  static TAP_IMPULSE = -7.0;       // px/frame at 60fps. Set (not additive) on tap.
  static TERMINAL_VELOCITY = 10.0; // Max downward velocity (px/frame).
  static VISUAL_SIZE = 40;         // Draw size in px (hitbox is smaller).
  static FLAP_DURATION = 300;      // ms total for flap leg animation.
  static FLAP_FRAME_INTERVAL = 100;// ms per animation frame in flap cycle.

  // ---- Methods ----

  /**
   * Apply upward impulse. Called on player tap.
   * Sets velocity directly to TAP_IMPULSE (not additive).
   * Resets flapTimer to FLAP_DURATION.
   * Resets animFrame to 0.
   *
   * No-op if alive === false.
   */
  flap() {}

  /**
   * Per-frame physics and animation update.
   *
   * @param {number} dt -- Normalized delta time (1.0 = 1 frame at 60fps)
   *
   * If alive:
   *   velocity += GRAVITY * dt
   *   velocity = min(velocity, TERMINAL_VELOCITY)
   *   y += velocity * dt
   *   rotation = clamp(velocity * 3 * (Math.PI / 180), -30 * Math.PI/180, 90 * Math.PI/180)
   *   Advance flap animation if flapTimer > 0:
   *     flapTimer -= dt * 16.67
   *     animTimer += dt * 16.67
   *     if animTimer >= FLAP_FRAME_INTERVAL: animFrame = (animFrame + 1) % 3, animTimer = 0
   *   If flapTimer <= 0: animFrame = 0 (rest pose)
   *
   * If not alive (death ragdoll):
   *   velocity += GRAVITY * dt (still falls)
   *   y += velocity * dt
   *   rotation += deathVelocity * dt (spins during fall)
   *   rotation = min(rotation, 90 * Math.PI/180) (caps at nose-dive)
   */
  update(dt) {}

  /**
   * Draw the player character on the canvas.
   * Delegates to the draw function in characters.js for the current characterId.
   *
   * @param {CanvasRenderingContext2D} ctx
   *
   * Steps:
   *   ctx.save()
   *   ctx.translate(x, y)
   *   ctx.rotate(rotation)
   *   characters[characterId].draw(ctx, animFrame, flapTimer > 0)
   *   ctx.restore()
   */
  draw(ctx) {}

  /**
   * Reset all state for a new run.
   * y = logicalHeight / 2
   * velocity = 0, rotation = 0
   * alive = true
   * flapTimer = 0, animFrame = 0, animTimer = 0
   */
  reset(logicalHeight) {}

  /**
   * Returns the AABB hitbox for collision detection.
   * Centered on the player's position (x, y is the visual center).
   *
   * @returns {{ x: number, y: number, width: number, height: number }}
   *   x = this.x - this.width / 2
   *   y = this.y - this.height / 2
   *   width = this.width
   *   height = this.height
   */
  getHitbox() {}

  /**
   * Trigger death state. Called on collision.
   * alive = false
   * deathVelocity = 0.15 (radians per frame, creates death spin)
   */
  die() {}
}
```

### 3.2 Obstacle

Each instance represents one obstacle pair (top and bottom).

```js
class Obstacle {
  // ---- Properties ----

  x;                          // Horizontal position of obstacle center (logical px).
                              // Starts at logicalWidth + OBSTACLE_WIDTH (off-screen right).
                              // Decreases each frame.
  gapY;                       // Vertical center of the gap (logical px). Randomized on creation.
  gapSize;                    // Height of the gap in px. Derived from difficulty formula.
  width = 60;                 // Obstacle width (px). Fixed.
  type;                       // Visual type string: 'bombardiro'|'mewing'|'skibidi'|'ohio'|'fanum'
  scored = false;             // true after player passes this obstacle. Prevents double-scoring.
  passEffectTimer = 0;        // ms remaining for pass-through visual effect.

  // ---- Constructor ----

  /**
   * @param {number} x        -- Initial x position
   * @param {number} gapY     -- Center Y of the gap
   * @param {number} gapSize  -- Height of the gap
   * @param {string} type     -- Visual type
   */
  constructor(x, gapY, gapSize, type) {}

  // ---- Methods ----

  /**
   * Move obstacle to the left.
   *
   * @param {number} dt    -- Normalized delta time
   * @param {number} speed -- Current scroll speed (px/frame at 60fps)
   *
   * x -= speed * dt
   * If passEffectTimer > 0: passEffectTimer -= dt * 16.67
   */
  update(dt, speed) {}

  /**
   * Draw the obstacle pair on canvas.
   * Delegates to type-specific draw functions.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasHeight -- Logical canvas height (640)
   *
   * Top obstacle: filled rectangle from y=0 to y=(gapY - gapSize/2), at x, width 60.
   *   Decorated per type (teeth, jawline, toilet shapes, portal swirls, fingers).
   * Bottom obstacle: filled rectangle from y=(gapY + gapSize/2) to y=canvasHeight.
   *   Decorated per type (mirrored).
   * If passEffectTimer > 0: render pass-through effect per type.
   */
  draw(ctx, canvasHeight) {}

  /**
   * Returns AABB hitbox for the TOP obstacle.
   * @returns {{ x: number, y: number, width: number, height: number }}
   *   x = this.x - this.width / 2
   *   y = 0
   *   width = this.width
   *   height = this.gapY - this.gapSize / 2
   */
  getTopHitbox() {}

  /**
   * Returns AABB hitbox for the BOTTOM obstacle.
   * @param {number} canvasHeight -- Logical canvas height
   * @returns {{ x: number, y: number, width: number, height: number }}
   *   x = this.x - this.width / 2
   *   y = this.gapY + this.gapSize / 2
   *   width = this.width
   *   height = canvasHeight - (this.gapY + this.gapSize / 2)
   */
  getBottomHitbox(canvasHeight) {}

  /**
   * Check if this obstacle is fully off-screen left (should be removed).
   * @returns {boolean} true if x + width/2 < 0
   */
  isOffScreen() {}

  /**
   * Trigger the pass-through visual effect.
   * Sets passEffectTimer based on type:
   *   bombardiro: 300, mewing: 200, skibidi: 250, ohio: 150, fanum: 500
   */
  triggerPassEffect() {}
}
```

#### Obstacle Type Draw Specs (summary from GDD)

| Type | Top | Bottom | Pass Effect |
|------|-----|--------|-------------|
| `bombardiro` | Green rect + zigzag white teeth on bottom edge | Mirror (teeth on top edge) | Orange explosion particles (3-4 circles, expand+fade, 300ms) |
| `mewing` | Flesh-colored rect + angular jaw contour on bottom | Mirror (jaw pointing up) | Purple glow outline (#b44dff), 200ms |
| `skibidi` | White rect + gray toilet shapes stacked vertically | Inverted toilets | Swirl particles (2-3 white circles orbit, 250ms) |
| `ohio` | Dark purple rect + concentric ellipses (rotating) | Matching portal | Screen purple tint flash 150ms + player wobble 500ms |
| `fanum` | Flesh rect + five finger rects at bottom, slightly spread | Mirror (fingers point up) | "Taxed!" text floats up in #ffd000, fades 500ms |

### 3.3 Background

```js
class Background {
  // ---- Properties ----

  farOffset = 0;              // Horizontal scroll offset for far layer (px)
  midOffset = 0;              // Horizontal scroll offset for mid layer (px)
  floorOffset = 0;            // Horizontal scroll offset for floor/near layer (px)
  currentBiome = 0;           // Current biome index (0-4)
  biomeTransitionTimer = 0;   // ms remaining in biome color transition (0 = stable)
  previousBiomeTint = null;   // Previous biome colors (for lerp during transition)
  currentBiomeTint = null;    // Target biome colors

  // ---- Biome Tint Table ----

  static BIOMES = [
    { name: 'Italian Piazza',      far: '#12121a', mid: '#1a1a28' },   // score 0-24
    { name: 'Ohio Wasteland',      far: '#121a12', mid: '#1a281a' },   // score 25-49
    { name: 'Sigma Gym',           far: '#1a1220', mid: '#281a30' },   // score 50-74
    { name: 'Skibidi Battlefield', far: '#121220', mid: '#1a1a38' },   // score 75-99
    { name: 'Meme Void',           far: 'cycle',   mid: 'cycle'  },   // score 100+ (cycles)
  ];

  // ---- Speed Ratios (relative to obstacle scroll speed) ----

  static FAR_SPEED_RATIO = 0.15;
  static MID_SPEED_RATIO = 0.4;
  static NEAR_SPEED_RATIO = 1.0;  // Same as obstacles

  // ---- Methods ----

  /**
   * Scroll all layers and handle biome transitions.
   *
   * @param {number} dt    -- Normalized delta time
   * @param {number} speed -- Current obstacle scroll speed (px/frame at 60fps)
   * @param {number} score -- Current score (for biome selection)
   *
   * farOffset  -= speed * FAR_SPEED_RATIO * dt;  wraps at tile width (logicalWidth * 2)
   * midOffset  -= speed * MID_SPEED_RATIO * dt;  wraps at tile width
   * floorOffset -= speed * NEAR_SPEED_RATIO * dt; wraps at tile width
   *
   * Calculate target biome from score:
   *   score < 25 -> 0, score < 50 -> 1, score < 75 -> 2, score < 100 -> 3, else 4
   * If biome changed: start 2000ms transition, save previous tint, set new tint.
   * If transitioning: biomeTransitionTimer -= dt * 16.67, lerp colors.
   */
  update(dt, speed, score) {}

  /**
   * Draw all three layers (far, mid, near/floor).
   * Drawn BEFORE obstacles and player.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} logicalWidth  -- 360
   * @param {number} logicalHeight -- 640
   *
   * Layer order (back to front):
   *   1. Sky: solid fill #0a0a0f
   *   2. Far layer: city skyline silhouette rects at varying heights,
   *      tinted per biome. Draws two copies side-by-side for seamless scroll.
   *   3. Mid layer: ground hills as wavy line + fill, occasional brainrot
   *      character silhouettes, tinted per biome.
   *   4. Floor: flat rect at bottom 60px of canvas, #1e1e2e fill,
   *      dashed line pattern for motion illusion (#2a2a3e).
   */
  draw(ctx, logicalWidth, logicalHeight) {}

  /**
   * Reset scroll offsets (for new run). Does NOT reset biome (biome persists
   * based on score which resets to 0, so it naturally goes back to biome 0).
   */
  reset() {}
}
```

### 3.4 ScoreDisplay (on-canvas HUD)

```js
class ScoreDisplay {
  // ---- Properties ----

  score = 0;                  // Actual current score
  popTimer = 0;               // ms remaining of pop animation (total 150ms)
  flashTimer = 0;             // ms remaining of lime flash (total 200ms)
  popScale = 1.0;             // Current scale factor (1.0 normal, 1.2 peak)

  // ---- Methods ----

  /**
   * Increment the score by 1. Trigger pop and flash animations.
   *
   * score++
   * popTimer = 150
   * flashTimer = 200
   */
  increment() {}

  /**
   * Per-frame update for animations.
   *
   * @param {number} dt -- Normalized delta time
   *
   * If popTimer > 0:
   *   popTimer -= dt * 16.67
   *   progress = 1 - (popTimer / 150)
   *   popScale = progress < 0.5 ? lerp(1.0, 1.2, progress * 2) : lerp(1.2, 1.0, (progress - 0.5) * 2)
   * Else: popScale = 1.0
   *
   * If flashTimer > 0: flashTimer -= dt * 16.67
   */
  update(dt) {}

  /**
   * Draw the score on canvas.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth -- Logical canvas width (360)
   *
   * Position: centered horizontally, y=48 (16px from top to text baseline).
   * Font: Bungee, size = 56px * popScale.
   * Color: flashTimer > 0 ? '#c8ff00' (Electric Lime) : '#f0f0f0' (white).
   * Text shadow: 2px 2px 0 rgba(0,0,0,0.5).
   * Text align: center.
   *
   * Handles "69" easter egg: if score === 69, flash Hot Magenta, double pop.
   */
  draw(ctx, canvasWidth) {}

  /**
   * Reset to 0, clear all animation timers.
   */
  reset() {}
}
```

---

## 4. Game Loop Detail

### Update Order (inside `onUpdate(dt)`)

```
1.  Read input (tap detected this frame? set tapFlag = true)

2.  If internalState === 'ready':
      a. Player idle bob: y += sin(time * 0.003) * 0.5 * dt  (gentle hover)
      b. Background.update(dt, BASE_SCROLL_SPEED * 0.3, 0)  (slow decorative scroll)
      c. If tapFlag:
           internalState = 'active'
           player.flap()
           playSound('flap')
      d. Return (skip steps 3-10)

3.  Player input:
      If tapFlag && player.alive: player.flap(), playSound('flap')

4.  Player physics:
      player.update(dt)

5.  Obstacle management:
      a. Update existing obstacles: obstacle.update(dt, currentScrollSpeed)
      b. Remove off-screen obstacles: filter out where isOffScreen()
      c. Spawn new obstacle if needed:
           If obstacles.length === 0 OR last obstacle's x < logicalWidth - currentSpacing:
             gapSize = max(130, 200 - score * 1.4)
             gapY = randomBetween(gapSize/2 + 60, logicalHeight - gapSize/2 - 60)
             type = random from ['bombardiro','mewing','skibidi','ohio','fanum']
             obstacles.push(new Obstacle(logicalWidth + 60, gapY, gapSize, type))

6.  Scoring:
      For each obstacle where !obstacle.scored:
        If player.x > obstacle.x:
          obstacle.scored = true
          obstacle.triggerPassEffect()
          scoreDisplay.increment()
          playSound('score')

7.  Difficulty update:
      currentScrollSpeed = min(4.0, 2.5 + score * 0.03)
      currentSpacing = max(180, 250 - score * 1.5)

8.  Collision detection:
      playerHitbox = player.getHitbox()
      For each obstacle:
        If checkCollisionAABB(playerHitbox, obstacle.getTopHitbox()):    -> DIE
        If checkCollisionAABB(playerHitbox, obstacle.getBottomHitbox(logicalHeight)): -> DIE
      Floor: If player.y + player.height/2 > logicalHeight:  -> DIE
      Ceiling: If player.y - player.height/2 < 0:            -> DIE

9.  If DIE:
      player.die()
      playSound('death')
      screenShake.start(4, 200)  // 4px displacement, 200ms duration
      // Wait 200ms (via timer), then:
      shell.setState('game-over')

10. Background.update(dt, currentScrollSpeed, score)
    scoreDisplay.update(dt)
    screenShake.update(dt)
```

### Render Order (inside `onRender(ctx)`)

```
1.  Apply screen shake offset:
      ctx.save()
      ctx.translate(screenShake.offsetX, screenShake.offsetY)

2.  Background.draw(ctx, logicalWidth, logicalHeight)
      Draws: sky, far layer, mid layer, floor

3.  Obstacles:
      For each obstacle: obstacle.draw(ctx, logicalHeight)
      (Includes pass-through effects if active)

4.  Player:
      player.draw(ctx)
      (Character drawing with rotation and flap animation)

5.  Restore screen shake:
      ctx.restore()

6.  HUD (NOT affected by screen shake):
      scoreDisplay.draw(ctx, logicalWidth)
      If internalState === 'ready':
        Draw "tap to flap" text (centered, pulsing opacity)
```

---

## 5. Difficulty Curve Formulas

All values are "per frame at 60fps" and multiplied by dt in the game loop.

### Scroll Speed

```
scrollSpeed = clamp(2.5 + score * 0.03, 2.5, 4.0)
```

| Score | Speed (px/frame) | Speed (px/sec at 60fps) |
|-------|-----------------|------------------------|
| 0 | 2.50 | 150 |
| 10 | 2.80 | 168 |
| 25 | 3.25 | 195 |
| 50 | 4.00 (cap) | 240 |

### Gap Size

```
gapSize = clamp(200 - score * 1.4, 130, 200)
```

| Score | Gap (px) | Gap as % of 640px canvas |
|-------|----------|-------------------------|
| 0 | 200 | 31.3% |
| 10 | 186 | 29.1% |
| 25 | 165 | 25.8% |
| 50 | 130 (min) | 20.3% |

### Obstacle Spacing

```
spacing = clamp(250 - score * 1.5, 180, 250)
```

| Score | Spacing (px) | Time between obstacles at base speed |
|-------|-------------|-------------------------------------|
| 0 | 250 | ~1.67s |
| 10 | 235 | ~1.40s |
| 25 | 213 | ~1.09s |
| 47+ | 180 (min) | ~0.75s |

### Gap Y Position Range

```
minGapY = gapSize / 2 + 60
maxGapY = canvasHeight - gapSize / 2 - 60
gapY = randomBetween(minGapY, maxGapY)
```

The 60px buffer at top and bottom ensures gaps never clip the ceiling/floor edges.

### Difficulty Plateau

After score ~50, all three parameters hit their caps. The game is at maximum difficulty. Further score progression is pure skill.

---

## 6. GameShell Integration

### main.js Wiring

```js
import { GameShell } from '../shared/game-shell.js';
import { createInputManager } from '../shared/input-manager.js';
import { initAudio, registerSound, playSound } from '../shared/sound-manager.js';
import { shareScore } from '../shared/share.js';
import { checkCollisionAABB, clamp, randomBetween, randomInt } from '../shared/utils.js';
import { Player } from './player.js';
import { Obstacle } from './obstacle.js';
import { Background } from './background.js';
import { ScoreDisplay } from './ui.js';
import { CHARACTERS } from './characters.js';
import * as C from './constants.js';

// ---- Game State (module-scoped) ----
let player, background, scoreDisplay;
let obstacles = [];
let internalState = 'ready';   // 'ready' | 'active'
let currentScrollSpeed = C.BASE_SCROLL_SPEED;
let currentSpacing = C.BASE_SPACING;
let screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
let deathTimer = 0;
let tapFlag = false;

// ---- Shell Setup ----
const shell = new GameShell({
  title: 'FLAPPY TRALALERO',
  gameId: 'flappy-tralalero',
  logicalWidth: 360,
  logicalHeight: 640,
  maxDisplayWidth: 480,
  theme: 'italian-brainrot',
  subtitle: 'tap. die. share. repeat.',
  accentColor: '#ff3838',
  shareUrl: 'https://brainrotgames.com/games/game-01/',
});

// ---- Callbacks ----

shell.onStart = () => {
  internalState = 'ready';
  player = new Player();
  player.characterId = getSelectedCharacter();
  player.reset(640);
  obstacles = [];
  scoreDisplay = new ScoreDisplay();
  background = new Background();
  background.reset();
  currentScrollSpeed = C.BASE_SCROLL_SPEED;
  currentSpacing = C.BASE_SPACING;
  screenShake = { timer: 0, magnitude: 0, offsetX: 0, offsetY: 0 };
  deathTimer = 0;
};

shell.onUpdate = (dt) => {
  // ... full update loop as described in Section 4
};

shell.onRender = (ctx) => {
  // ... full render loop as described in Section 4
};

shell.onGameOver = () => {
  const score = scoreDisplay.score;
  const message = getDeathMessage(score);
  checkUnlocks(score);
  return {
    score,
    message,
    scoreLabel: 'aura points',
  };
};

// ---- Input ----
shell.init();
const input = createInputManager(shell.getCanvas(), 360, 640);
input.onTap(() => {
  tapFlag = true;
  initAudio(); // Safe to call multiple times, only initializes once
});

// ---- Character Select ----
// Render character select row in menu secondary actions area.
// 7 circular icons. Locked = silhouette. Selected = accent border.
// Selection stored in score-manager via getData/setData.

// ---- Sound Registration ----
// On first tap (inside onTap), after initAudio():
//   registerSound('flap-tralalero', { notes: [...] })
//   registerSound('death-tralalero', { notes: [...] })
//   ... per character from characters.js
```

### Callback Summary

| Shell Callback | Flappy Tralalero Behavior |
|---------------|--------------------------|
| `onStart()` | Reset player, obstacles, score, background, difficulty. Set internalState='ready'. |
| `onUpdate(dt)` | Run physics, spawning, scrolling, scoring, collision, difficulty scaling. Sub-state machine for ready/active. |
| `onRender(ctx)` | Draw background, obstacles, player, HUD (score, "tap to flap" hint). Apply screen shake. |
| `onGameOver()` | Return `{ score, message (random from tier), scoreLabel: "aura points" }`. Check character unlocks. |
| `onMenuRender` | Draw idle Tralalero on canvas behind menu overlay (floating animation). |

### Character Unlock Check (on game over)

```js
function checkUnlocks(score) {
  const unlocks = JSON.parse(getData('flappy-tralalero', 'unlocks') || '{}');

  const conditions = {
    bombardiro: score >= 10,
    lirili: score >= 25,
    tungtung: score >= 50,
    cappuccino: score >= 100,
    // brrbrr: requires 5 ad views (future)
    // lavaca: requires 10 title taps (handled in menu)
  };

  let newlyUnlocked = [];
  for (const [id, condition] of Object.entries(conditions)) {
    if (condition && !unlocks[id]) {
      unlocks[id] = true;
      newlyUnlocked.push(id);
    }
  }

  if (newlyUnlocked.length > 0) {
    setData('flappy-tralalero', 'unlocks', JSON.stringify(unlocks));
    // Render unlock notification in game-over extra area
  }
  return newlyUnlocked;
}
```

### localStorage Keys Used

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `flappy-tralalero-highscore` | number (string) | `'0'` | All-time high score |
| `flappy-tralalero-lastscore` | number (string) | `'0'` | Last run score |
| `flappy-tralalero-unlocks` | JSON string | `'{}'` | Character unlock map |
| `flappy-tralalero-selected` | string | `'tralalero'` | Selected character ID |
| `flappy-tralalero-deaths` | number (string) | `'0'` | Total deaths (for ad frequency) |
| `flappy-tralalero-ad-views` | number (string) | `'0'` | Rewarded ad views (Brr Brr unlock) |

---

## 7. Screen Shake

```js
const screenShake = {
  timer: 0,         // ms remaining
  magnitude: 0,     // max displacement in px
  offsetX: 0,       // current frame offset X
  offsetY: 0,       // current frame offset Y
};

function startScreenShake(magnitude, durationMs) {
  screenShake.timer = durationMs;
  screenShake.magnitude = magnitude;
}

function updateScreenShake(dt) {
  if (screenShake.timer <= 0) {
    screenShake.offsetX = 0;
    screenShake.offsetY = 0;
    return;
  }
  screenShake.timer -= dt * 16.67;
  const intensity = screenShake.timer / 200; // decay linearly
  screenShake.offsetX = (Math.random() * 2 - 1) * screenShake.magnitude * intensity;
  screenShake.offsetY = (Math.random() * 2 - 1) * screenShake.magnitude * intensity;
}
```

Used in render: `ctx.translate(screenShake.offsetX, screenShake.offsetY)` before drawing game world, `ctx.restore()` before drawing HUD.

---

## 8. Character Drawing Reference

Each character's draw function receives `(ctx, animFrame, isFlapping)` and draws at origin (0,0). The caller handles translate/rotate.

All 7 characters share identical physics. Differences are visual + audio only.

| ID | Name | Draw Size | Hitbox | Unlock |
|----|------|-----------|--------|--------|
| `tralalero` | Tralalero Tralala | 40x40 | 30x30 | Default |
| `bombardiro` | Bombardiro Crocodilo | 40x40 | 30x30 | Score 10+ |
| `lirili` | Lirili Larila | 40x40 | 30x30 | Score 25+ |
| `tungtung` | Tung Tung Tung Sahur | 40x40 | 30x30 | Score 50+ |
| `cappuccino` | Cappuccino Assassino | 40x40 | 30x30 | Score 100+ |
| `brrbrr` | Brr Brr Patapim | 40x40 | 30x30 | 5 rewarded ads |
| `lavaca` | La Vaca Saturno Saturnita | 40x40 | 30x30 | 10 title taps (easter egg) |

Full Canvas 2D drawing specs (coordinates, colors, shapes) are in GDD-01, Section 4.1. Each character is implemented as a function in `characters.js`:

```js
export const CHARACTERS = {
  tralalero: {
    name: 'Tralalero Tralala',
    draw(ctx, animFrame, isFlapping) { /* ... GDD spec 4.1 ... */ },
    flapSound: { notes: [{ type: 'square', frequency: 580, endFrequency: 620, duration: 0.06, gain: 0.12 }] },
    deathSound: { notes: [{ type: 'square', frequency: 400, endFrequency: 100, duration: 0.5, gain: 0.2 }] },
    unlockCondition: null, // default, always unlocked
  },
  bombardiro: {
    name: 'Bombardiro Crocodilo',
    draw(ctx, animFrame, isFlapping) { /* ... GDD spec ... */ },
    flapSound: { /* ... */ },
    deathSound: { notes: [
      { type: 'noise', duration: 0.2, gain: 0.15 }, // explosion
      { type: 'sine', frequency: 200, endFrequency: 600, duration: 0.3, delay: 0.1, gain: 0.2 }
    ]},
    unlockCondition: { type: 'score', value: 10 },
  },
  // ... remaining 5 characters follow same structure
};
```
