# GDD-02: WHACK-A-ROT

## 1. Overview

**Game name:** WHACK-A-ROT

**Elevator pitch:** Whack-a-mole but the moles are Italian brainrot characters popping out of holes and you slap them back to whatever cursed dimension they came from. Different characters have different point values, speeds, and behaviors. Whack the wrong one and you lose AURA POINTS. Chase combos. Beat your high score. Screenshot it. Send it to every group chat you're in.

**Platform:** HTML5 web, mobile-first. Canvas rendering. Works on any device with a browser. No install, no sign-up. Tap a link, tap play, you're whacking.

**Target session:** 45-90 seconds per round. Full session (play, die, score screen, replay) is 3-5 minutes across 3-5 rounds.

**File path:** `games/game-02/`

---

## 2. Core Gameplay Loop

One round plays out in a tight cycle. Every decision takes under 500ms.

```
1. SPAWN       A character pops up from a random hole (200ms rise animation)
2. VISIBLE     Character is hittable for `displayTime` ms (starts at 1200ms, shrinks with waves)
3. DECIDE      Player identifies character type: whack for points or avoid (penalty)
4. TAP/MISS    Player taps the character OR the display window expires
   - HIT correct target  -> +points, combo++, impact effect, floating score text
   - HIT penalty target  -> -200 points, combo reset, screen shake, sad sound
   - MISS (no tap)       -> combo resets, character does taunt animation, ducks back down
5. RETREAT     Character descends back into hole (150ms sink animation)
6. REPEAT      Next spawn starts after a random delay of `spawnInterval` ms
```

Multiple holes are active simultaneously. At any given moment, 1-3 characters may be visible, requiring prioritization.

**Timing budget per round:**
- Round duration: 60 seconds (fixed timer, counts down)
- Characters spawned per round: 40-70 depending on wave
- Average active characters at once: 1.5 (wave 1) to 3.0 (wave 5+)

---

## 3. Game Mechanics

### 3.1 Character Roster

Six characters. Each has unique point value, display time, spawn weight, and visual behavior.

| # | Character | Points | Display Time (ms) | Spawn Weight (wave 1) | Spawn Weight (wave 5+) | Behavior |
|---|-----------|--------|-------------------|----------------------|----------------------|----------|
| 1 | Tralalero Tralala | 100 | `displayTime` (standard) | 35% | 25% | Standard. Pops up, idle bounce, ducks down. The bread and butter. |
| 2 | Bombardiro Crocodilo | 200 | `displayTime * 0.6` (fast) | 20% | 20% | Fast. Pops up quickly, barely stays visible. Reward for quick reflexes. |
| 3 | Tung Tung Tung Sahur | 150 | `displayTime * 1.3` (slow) | 20% | 15% | Drums on the hole edge while visible. Longer display but smaller hitbox (see 3.5). |
| 4 | Ballerina Cappuccina | 150 | `displayTime` (standard) | 15% | 15% | Sways left-right during display, shifting the hitbox center by +/-15px. |
| 5 | Brr Brr Patapim | -200 (penalty) | `displayTime * 1.2` (lingering) | 10% | 20% | PENALTY. Stays visible longer to bait taps. Hitting costs 200 points AND resets combo. |
| 6 | Lirili Larila | 500 | `displayTime * 0.4` (very fast) | 0% (wave 3+) | 5% | RARE BONUS. Golden glow. Blink-and-miss display time. Appears starting wave 3. |

**Spawn weight normalization:** Weights are normalized to 100% per wave. When Lirili Larila joins in wave 3, all other weights reduce proportionally.

### 3.2 Scoring System

**Base score:**
Each character awards its base point value on hit. Points are labeled "AURA POINTS" in the HUD.

**Combo multiplier:**
Consecutive successful hits (hitting a non-penalty character) build a combo counter.

```
comboMultiplier = 1 + (comboCount * 0.25)
// combo 0 = 1.0x, combo 1 = 1.25x, combo 2 = 1.5x, combo 3 = 1.75x, ...
// Cap at 4.0x (combo 12)
```

**Score per hit:**
```
scoreAwarded = Math.floor(basePoints * comboMultiplier)
```

**Combo breaks:**
- Hitting Brr Brr Patapim: combo resets to 0, player loses 200 points (unaffected by multiplier)
- Missing a character (it despawns without being tapped): combo resets to 0
- Player score cannot go below 0

**Combo milestones with feedback:**
| Combo | Feedback |
|-------|----------|
| 5 | "NICE" floating text in Cyan Pulse |
| 10 | "SIGMA STREAK" floating text in Electric Lime + screen border flash |
| 15 | "MAXIMUM AURA" floating text in Brainrot Yellow + background pulse |
| 20+ | "TRANSCENDENT" + continuous lime glow on score display |

### 3.3 Difficulty Progression

The game uses a wave system. Each wave lasts 15 seconds. A 60-second round has 4 waves.

**Wave parameters:**

```javascript
// Wave number: 1, 2, 3, 4 within a round
// Round number: increments each time the player replays (persists via gameState)

const effectiveWave = wave + (round - 1) * 2; // Rounds get progressively harder

// How long a standard character stays visible (ms)
const displayTime = Math.max(400, 1200 - effectiveWave * 80);

// Time between spawns across the full grid (ms)
const spawnInterval = Math.max(300, 900 - effectiveWave * 60);

// Maximum characters visible simultaneously
const maxActive = Math.min(5, 1 + Math.floor(effectiveWave / 2));

// Probability that a spawn is a penalty character (Brr Brr Patapim)
const penaltyWeight = Math.min(0.25, 0.10 + effectiveWave * 0.02);
```

**Progression table (first playthrough, round 1):**

| Wave | Effective Wave | Display Time | Spawn Interval | Max Active | Penalty % |
|------|---------------|-------------|----------------|------------|-----------|
| 1 | 1 | 1120ms | 840ms | 1 | 12% |
| 2 | 2 | 1040ms | 780ms | 2 | 14% |
| 3 | 3 | 960ms | 720ms | 2 | 16% |
| 4 | 4 | 880ms | 660ms | 3 | 18% |

**Round 2 starts at effective wave 3, round 3 at effective wave 5, etc.** The game never becomes literally impossible but approaches a human reaction-time ceiling around effective wave 10 (display time 400ms, spawn interval 300ms, max 5 active, 30% penalty).

### 3.4 Grid Layout

3x3 grid of holes. 9 total positions.

**Canvas coordinate system (based on 400x600 logical canvas):**

```
Grid starts at y=200 (below HUD) and ends at y=540 (above bottom padding).
Grid starts at x=40 and ends at x=360.
Column spacing: 160px center-to-center
Row spacing: 113px center-to-center

Hole positions (center x, center y):
  [0,0] = (80,  227)    [1,0] = (200, 227)    [2,0] = (320, 227)
  [0,1] = (80,  340)    [1,1] = (200, 340)    [2,1] = (320, 340)
  [0,2] = (80,  453)    [1,2] = (200, 453)    [2,2] = (320, 453)
```

**Hole dimensions:**
- Hole opening: ellipse, radiusX=50, radiusY=20, centered at hole position
- Character pop-up zone: 70px wide, extends 80px above hole center
- Hole visual depth: 10px dark gradient below the ellipse

### 3.5 Collision Detection

Tap/click position is tested against each active (visible) character's hitbox.

**Standard hitbox:** Circle centered at `(hole.x, hole.y - 40)` with radius 40px.

```javascript
function isHit(tapX, tapY, hole) {
  const hitCenterX = hole.x;
  const hitCenterY = hole.y - 40; // Character center is 40px above hole center
  const radius = 40;
  const dx = tapX - hitCenterX;
  const dy = tapY - hitCenterY;
  return (dx * dx + dy * dy) <= (radius * radius);
}
```

**Per-character hitbox modifiers:**
- Tung Tung Tung Sahur: radius = 30 (smaller, he's a narrow plank)
- Ballerina Cappuccina: hitCenterX shifts by `15 * Math.sin(elapsed * 0.005)` (she sways)
- All others: standard radius 40

**Tap coordinate conversion:**
Canvas coordinates must account for CSS scaling. Convert DOM event coordinates to canvas space:
```javascript
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const canvasX = (event.clientX - rect.left) * scaleX;
const canvasY = (event.clientY - rect.top) * scaleY;
```

Touch events use `event.touches[0].clientX` and `event.touches[0].clientY`. Both `mousedown` and `touchstart` are bound. `touchstart` calls `preventDefault()` to avoid double-firing.

### 3.6 Wave System

**Structure:** Continuous 60-second timer. No explicit wave transitions visible to the player. Internally, difficulty parameters step up every 15 seconds (waves 1-4). The player sees only the countdown timer.

**Wave transitions are invisible** -- no pause, no announcement. The game just gets subtly harder. This keeps the flow unbroken.

**Wave indicator:** A subtle horizontal progress bar at the very bottom of the screen. 4 segments. Fills left-to-right as waves progress. Color: Text Tertiary (`#555570`). This is decorative, not critical information.

### 3.7 Timer

**60-second countdown.** Displayed top-right of HUD in Bungee font.

- Starts at 60.0, counts down by tenths of a second
- At 10 seconds remaining: timer text turns Hot Magenta (`#ff2d78`), pulses gently (scale 1.0 to 1.05 at 2Hz)
- At 0.0: game over. No lives system. The round is purely time-boxed.
- Timer pauses if the browser tab loses focus (`document.hidden` check via `visibilitychange` event)

---

## 4. Brainrot Theme Integration

### 4.1 Character Drawing Instructions (Canvas Primitives)

Every character is drawn procedurally with Canvas 2D primitives. No image assets. Each character is drawn within a 70x80px bounding box, positioned relative to its hole center. The character "rises" from the hole via a clipping mask (the hole ellipse clips the lower portion during the rise/sink animation).

All colors are specified as hex. All coordinates are relative to the character's origin point `(cx, cy)` where `cx = hole.x` and `cy = hole.y - 40` (the character center).

---

#### Character 1: Tralalero Tralala

*Blue shark with 3 legs, Nike-like swooshes on the shoes, wide toothy grin.*

**Body (shark torso):**
- Ellipse centered at `(cx, cy - 5)`, radiusX=28, radiusY=22
- Fill: `#4488dd` (medium blue)
- Stroke: `#335599`, lineWidth 2

**Head (shark head, pointed):**
- Draw a triangle-ish shape above the body:
  - `moveTo(cx, cy - 42)` (top of head, pointed)
  - `quadraticCurveTo(cx + 22, cy - 30, cx + 20, cy - 18)` (right side curves down)
  - `lineTo(cx - 20, cy - 18)` (across bottom of head)
  - `quadraticCurveTo(cx - 22, cy - 30, cx, cy - 42)` (left side curves up)
- Fill: `#4488dd`
- Stroke: `#335599`, lineWidth 2

**Eyes:**
- Two white circles: `(cx - 10, cy - 28)` and `(cx + 10, cy - 28)`, radius 6
- Fill: `#ffffff`
- Pupils: two black circles at same centers, radius 3
- Fill: `#000000`

**Mouth (wide grin):**
- Arc from `(cx - 15, cy - 16)` to `(cx + 15, cy - 16)`, curving downward
- `ctx.arc(cx, cy - 16, 15, 0, Math.PI)` -- semicircle opening downward
- Fill: `#cc2222` (red mouth interior)
- Teeth: 5 small white triangles along the top edge of the mouth arc, each 4px wide, 5px tall
  - Draw at x positions: cx-12, cx-6, cx, cx+6, cx+12
  - Each: `moveTo(x-2, cy-16)`, `lineTo(x, cy-11)`, `lineTo(x+2, cy-16)`
  - Fill: `#ffffff`

**Dorsal fin:**
- Triangle on top-right of body:
  - `moveTo(cx + 10, cy - 20)`, `lineTo(cx + 20, cy - 35)`, `lineTo(cx + 18, cy - 15)`
- Fill: `#3377cc`

**Legs (3 legs, the meme feature):**
- Three legs extending below the body at x positions: cx-15, cx, cx+15
- Each leg: `fillRect(legX - 3, cy + 12, 6, 20)` -- Fill: `#4488dd`
- Each foot: `fillRect(legX - 5, cy + 30, 10, 6)` -- Fill: `#ffffff` (white shoe)
- Nike swoosh on each shoe: small curved line
  - `moveTo(legX - 4, cy + 33)`, `quadraticCurveTo(legX, cy + 30, legX + 5, cy + 33)`
  - Stroke: `#ff4400` (orange-red swoosh), lineWidth 1.5

**Idle animation:** Body bobs up and down 3px at 2Hz (`cy + 3 * Math.sin(time * 0.004)`)

---

#### Character 2: Bombardiro Crocodilo

*Green crocodile head with propeller/wings on top, bomber plane body.*

**Body (bomber fuselage):**
- Rounded rect centered at `(cx, cy + 5)`, width 50, height 24, borderRadius 10
- Fill: `#556b55` (military olive green)
- Stroke: `#3d4d3d`, lineWidth 2

**Wings:**
- Left wing: `fillRect(cx - 35, cy + 2, 16, 8)` -- Fill: `#556b55`
- Right wing: `fillRect(cx + 19, cy + 2, 16, 8)` -- Fill: `#556b55`
- Wing tips are angled: small triangles at the ends
  - Left: `moveTo(cx-35, cy+2)`, `lineTo(cx-40, cy+6)`, `lineTo(cx-35, cy+10)`
  - Right: mirror of left

**Crocodile head:**
- Elongated ellipse centered at `(cx, cy - 18)`, radiusX=18, radiusY=14
- Fill: `#44aa44` (bright green)
- Stroke: `#338833`, lineWidth 2

**Snout:**
- Rounded rect: `(cx - 12, cy - 14)`, width 24, height 10, borderRadius 4
- Fill: `#44aa44`
- Nostrils: two small dark circles at `(cx - 5, cy - 10)` and `(cx + 5, cy - 10)`, radius 2
- Fill: `#226622`

**Eyes:**
- Two yellow circles: `(cx - 8, cy - 24)` and `(cx + 8, cy - 24)`, radius 5
- Fill: `#ffdd00`
- Vertical slit pupils: thin black ellipses, radiusX=1.5, radiusY=4
- Fill: `#000000`

**Teeth:**
- Zigzag line along the bottom of the snout (the croc grin):
  - 6 teeth alternating up/down along `y = cy - 8`, each 4px wide, 3px tall
  - Fill: `#ffffff`

**Propeller (on top of head):**
- Hub: small circle at `(cx, cy - 32)`, radius 3, fill `#888888`
- Two blades: rotating lines from hub, length 18px each, opposite directions
  - Blade fill: `#aaaaaa`, rounded ends
  - Rotation: `angle += deltaTime * 0.01` (spins continuously)

**Idle animation:** Propeller spins. Body rocks left-right 2px at 1.5Hz.

---

#### Character 3: Tung Tung Tung Sahur

*Brown wooden plank body (like a 2x4 lumber plank), holding a baseball bat, wearing a headband.*

**Body (wooden plank):**
- Rect centered at `(cx, cy)`, width 24, height 55
- Fill: `#b5813a` (wood brown)
- Stroke: `#8b6324`, lineWidth 2
- Wood grain lines: 3 horizontal lines across the plank body
  - `moveTo(cx-10, cy-15)` to `(cx+10, cy-15)`, and at cy-2, cy+12
  - Stroke: `#9a7030`, lineWidth 1

**Face (painted/carved on the plank):**
- Eyes: two dots at `(cx - 5, cy - 18)` and `(cx + 5, cy - 18)`, radius 3
- Fill: `#000000`
- Angry eyebrows: angled lines above each eye
  - Left: `moveTo(cx-9, cy-24)` to `(cx-2, cy-22)` -- angled down-inward
  - Right: `moveTo(cx+9, cy-24)` to `(cx+2, cy-22)` -- mirror
  - Stroke: `#000000`, lineWidth 2
- Mouth: small flat line at `(cx - 4, cy - 12)` to `(cx + 4, cy - 12)`
  - Stroke: `#000000`, lineWidth 2

**Headband:**
- Rect across the top of the plank: `(cx - 14, cy - 28)`, width 28, height 6
- Fill: `#dd2222` (red)
- Tail of headband fluttering to the right:
  - Two small lines from `(cx + 14, cy - 28)` curving right and down
  - Stroke: `#dd2222`, lineWidth 3

**Baseball bat (held to the right):**
- Bat handle: `fillRect(cx + 14, cy - 10, 5, 25)` -- Fill: `#8b6324`
- Bat barrel: rounded rect at `(cx + 12, cy - 25)`, width 12, height 18, borderRadius 4
- Fill: `#c4a265` (lighter wood)
- Stroke: `#8b6324`, lineWidth 1

**Idle animation:** Drums the bat on the hole edge. Bat swings down and up in a repeating arc (rotation around handle base, +/-15 degrees at 4Hz). Produces the "tung tung tung" rhythm visual.

---

#### Character 4: Ballerina Cappuccina

*Coffee cup for a head, pink tutu, ballet pose with arms raised.*

**Body (ballerina torso):**
- Trapezoid centered at `(cx, cy + 8)`:
  - `moveTo(cx - 8, cy - 2)`, `lineTo(cx + 8, cy - 2)`, `lineTo(cx + 6, cy + 16)`, `lineTo(cx - 6, cy + 16)`
- Fill: `#ffccdd` (light pink)
- Stroke: `#dd88aa`, lineWidth 1

**Tutu (skirt):**
- Series of overlapping triangles fanning out from the waist at `cy + 16`:
  - 7 triangles, each 14px wide at base, 12px tall, evenly spaced around the waist
  - Fan from angle -80deg to +80deg
  - Fill: `#ff88bb` (bright pink)
  - Stroke: `#dd6699`, lineWidth 1
- A slightly darker underlayer: same shape at `#ee77aa`, offset 2px lower, for depth

**Arms (ballet pose, raised):**
- Left arm: curved line from `(cx - 8, cy)` arcing up to `(cx - 20, cy - 25)`
  - `quadraticCurveTo(cx - 18, cy - 10, cx - 20, cy - 25)`
- Right arm: mirror, arcing to `(cx + 20, cy - 25)`
- Stroke: `#ffccdd`, lineWidth 4
- Hands: small circles at arm tips, radius 3, fill `#ffccdd`

**Head (coffee cup):**
- Cup body: trapezoid
  - `moveTo(cx - 10, cy - 14)`, `lineTo(cx + 10, cy - 14)`, `lineTo(cx + 8, cy - 32)`, `lineTo(cx - 8, cy - 32)`
- Fill: `#ffffff` (white ceramic)
- Stroke: `#cccccc`, lineWidth 1.5
- Cup rim: rect `(cx - 11, cy - 34)`, width 22, height 3
- Fill: `#eeeeee`
- Handle: small arc on right side of cup
  - `ctx.arc(cx + 12, cy - 24, 5, -Math.PI/2, Math.PI/2)` (open arc, right side)
  - Stroke: `#cccccc`, lineWidth 2, no fill
- Coffee inside: dark ellipse visible at top of cup
  - Ellipse at `(cx, cy - 32)`, radiusX=7, radiusY=2
  - Fill: `#4a2c0a` (dark coffee brown)
- Steam: 2-3 wavy lines rising from coffee surface
  - Sine wave paths from `(cx - 3, cy - 35)` and `(cx + 3, cy - 35)`, rising 10px
  - Stroke: `#cccccc` at 50% opacity, lineWidth 1
  - Animated: phase shifts over time for rising steam effect

**Face (on the cup):**
- Eyes: two small arcs (happy closed eyes, like `^  ^`)
  - Left: arc at `(cx - 4, cy - 24)`, opening downward, radius 3
  - Right: arc at `(cx + 4, cy - 24)`, same
  - Stroke: `#4a2c0a`, lineWidth 1.5
- Blush: two small pink circles at `(cx - 7, cy - 21)` and `(cx + 7, cy - 21)`, radius 2.5
  - Fill: `#ffaacc` at 60% opacity
- Mouth: small "o" circle at `(cx, cy - 20)`, radius 2
  - Stroke: `#4a2c0a`, lineWidth 1

**Idle animation:** Sways left and right. Entire character translates `x += 15 * Math.sin(time * 0.003)`. Steam continues animating.

---

#### Character 5: Brr Brr Patapim (PENALTY)

*Spiky, red/warning-colored creature. Visually screams "DO NOT TAP." But also cute enough to bait mistakes.*

**Body (round, spiky):**
- Main body circle at `(cx, cy)`, radius 22
- Fill: `#ff3838` (Italian Red from extended palette)
- Stroke: `#cc2020`, lineWidth 2

**Spikes (8 spikes radiating from body):**
- 8 triangular spikes evenly around the body (every 45 degrees):
  - For each spike at angle `a = i * Math.PI / 4`:
    - Base points: two points on the circle edge at `a - 0.15` and `a + 0.15`, radius 22
    - Tip: point at radius 34 at angle `a`
    - Draw triangle connecting these three points
  - Fill: `#ff5555`
  - Stroke: `#cc2020`, lineWidth 1

**Face (cute but evil):**
- Eyes: two large circles at `(cx - 8, cy - 6)` and `(cx + 8, cy - 6)`, radius 6
  - Fill: `#ffffff`
  - Pupils: large black circles, radius 4 (big puppy eyes -- the bait)
  - Fill: `#000000`
  - Highlight dots: tiny white circles at `(pupilX + 1.5, pupilY - 1.5)`, radius 1.5
    - Fill: `#ffffff` (the kawaii eye highlight that makes it look cute)
- Mouth: small curved frown
  - `ctx.arc(cx, cy + 6, 6, Math.PI * 0.15, Math.PI * 0.85)` -- upside-down arc
  - Stroke: `#880000`, lineWidth 2
- Bottom lip quiver: mouth oscillates +/- 1px vertically at 3Hz (trembling, as if cold -- "brrr")

**Warning indicators:**
- Small exclamation mark above head: triangle `(cx, cy - 40)` with `!` inside
  - Triangle: fill `#ffd000` (Brainrot Yellow), 12px wide, 10px tall
  - `!` text: Bungee, 8px, fill `#000000`
- Pulsing red glow: shadow around the body
  - `ctx.shadowColor = '#ff3838'`, `shadowBlur = 8 + 4 * Math.sin(time * 0.006)`

**Idle animation:** Shivers/vibrates. Position jitters +/- 1px randomly each frame on both axes. Spikes pulse slightly (radius oscillates 32-36). Cute blink every 2 seconds (eyes close for 100ms).

---

#### Character 6: Lirili Larila (RARE BONUS)

*Golden, glowing, ethereal butterfly-fairy creature. Shimmers. Appears only briefly.*

**Body (small, delicate):**
- Oval body at `(cx, cy + 2)`, radiusX=10, radiusY=14
- Fill: `#ffd700` (gold)
- Stroke: `#daa520`, lineWidth 1.5

**Wings (butterfly-style, 4 wings):**
- Upper-left wing: large ellipse at `(cx - 18, cy - 8)`, radiusX=14, radiusY=10, rotated -20deg
- Upper-right wing: mirror
- Lower-left wing: smaller ellipse at `(cx - 14, cy + 6)`, radiusX=10, radiusY=7, rotated -30deg
- Lower-right wing: mirror
- Wing fill: `#ffd700` at 70% opacity
- Wing stroke: `#daa520`, lineWidth 1
- Wing sparkle: 3-4 tiny white dots at random positions within each wing, blinking on/off at staggered intervals

**Face:**
- Eyes: two small black dots at `(cx - 4, cy - 4)` and `(cx + 4, cy - 4)`, radius 2
- Smile: tiny upward arc at `(cx, cy + 1)`, radius 3, top-half arc
  - Stroke: `#8b6914`, lineWidth 1

**Antennae:**
- Two curved lines from top of body:
  - Left: `moveTo(cx - 3, cy - 12)`, `quadraticCurveTo(cx - 10, cy - 25, cx - 6, cy - 28)`
  - Right: mirror
  - Stroke: `#daa520`, lineWidth 1
  - Tip dots: circles at antenna ends, radius 2, fill `#ffd700`

**Glow effect:**
- Radial gradient behind entire character:
  - Center: `rgba(255, 215, 0, 0.3)`, outer: `rgba(255, 215, 0, 0.0)`
  - Radius: 50px, centered on character
  - Pulsing: gradient opacity oscillates 0.15-0.35 at 3Hz

**Idle animation:** Wings flap (rotate +/-10deg at 6Hz). Entire character floats upward slowly during display (rises 15px total over display duration). Sparkles on wings shimmer randomly.

---

### 4.2 Hole Design

The holes are dark oval portals with a subtle swirl effect.

**Hole rendering (per hole):**

1. **Shadow/depth** -- dark ellipse beneath the hole:
   - Ellipse at `(hole.x, hole.y + 4)`, radiusX=52, radiusY=22
   - Fill: `#000000` at 40% opacity

2. **Hole opening** -- main dark portal:
   - Ellipse at `(hole.x, hole.y)`, radiusX=50, radiusY=20
   - Fill: radial gradient center `#0a0a0f` (Void), edge `#16161f` (Surface)

3. **Rim highlight** -- subtle edge:
   - Ellipse stroke at same position, radiusX=50, radiusY=20
   - Stroke: `#2a2a3f` (slightly lighter than Surface), lineWidth 2

4. **Swirl detail** -- two subtle curved lines inside the hole:
   - Small arcs in `#1a1a2f` at 30% opacity, suggesting a portal void
   - Animated: rotate slowly (0.5 RPM) for a living portal effect

**Character clipping:** When a character rises from or sinks into a hole, use `ctx.save()` / `ctx.clip()` with the hole ellipse as clipping region for the lower portion of the character sprite. This creates the illusion of emerging from the hole.

### 4.3 Background

**Playing field layers (back to front):**

1. **Base fill:** Solid `#0a0a0f` (Void)

2. **Far background (parallax layer 1, moves at 0.1x speed of... nothing, just a subtle drift):**
   - Abstract Italian cityscape silhouette along the bottom third
   - Simple rectangles and triangles in `#12121a` representing buildings
   - A leaning tower shape (Pisa reference) off to one side
   - Drifts left at 0.2px/frame, wraps around

3. **Mid background (static):**
   - Subtle radial gradient from center: `#0f0f18` at center to `#0a0a0f` at edges
   - Creates a "spotlight on the grid" feel
   - Optional: very faint grid lines connecting the hole positions, stroke `#111118` at 20% opacity

4. **Ground plane:**
   - A slightly elevated surface strip behind the bottom row of holes
   - Color: `#13131d`
   - Gives the 3x3 grid a slight depth illusion

5. **Particle layer (over everything, under HUD):**
   - 10-15 tiny floating particles drifting upward slowly
   - Small circles, radius 1-2px, fill `#c8ff00` at 10-20% opacity
   - Adds "aura energy" ambiance without being distracting

### 4.4 Sound Effects (Web Audio API)

All sounds are synthesized. No audio file assets. Each sound is described as an oscillator configuration for Web Audio API.

**Sound architecture:**
```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// Resume on first user interaction (required by browsers)
```

| Sound | Trigger | Synthesis |
|-------|---------|-----------|
| **Hit (standard)** | Tap any point character | 440Hz square wave, 80ms duration, quick volume ramp down. Gain: 0.3. Feels like a "bonk." |
| **Hit (bonus/Lirili)** | Tap Lirili Larila | Rising arpeggio: 523Hz -> 659Hz -> 784Hz, each 60ms, triangle wave. Gain: 0.3. Sparkly. |
| **Hit (penalty)** | Tap Brr Brr Patapim | 150Hz sawtooth wave, 200ms, slight pitch bend down to 100Hz. Gain: 0.4. Buzzy and wrong-sounding. |
| **Miss** | Character despawns untapped | 300Hz sine wave, pitch bend down to 200Hz over 150ms. Gain: 0.15. Subtle "womp." |
| **Combo milestone (5+)** | Combo counter hits 5, 10, 15, 20 | Base note + perfect fifth (e.g., 440 + 660Hz), both triangle waves, 150ms, slight chorus via detuning one by 5 cents. Gain: 0.25. |
| **Game over** | Timer reaches 0 | Descending 4-note sequence: 523 -> 440 -> 349 -> 261Hz, each 200ms, square wave. Gain: 0.3. Classic "you died" feel. |
| **New high score** | Score exceeds stored best | Ascending 4-note sequence: 523 -> 659 -> 784 -> 1047Hz, each 150ms, triangle wave. Gain: 0.3. Celebratory. |
| **Tap feedback** | Any tap on canvas (no hit) | 800Hz sine, 20ms, gain 0.05. Near-silent click confirmation. |

**Sound toggle:** All sound is OFF by default (see Scope -- sound is nice-to-have). When implemented, a mute toggle button (icon button, top-left) controls a master gain node.

### 4.5 UI Theming

**HUD layout during gameplay (on-canvas, drawn every frame):**

```
+------------------------------------------+
| [mute]          AURA POINTS        00:60 |
|              *** 4,250 ***               |
|                combo x3                  |
|                                          |
|    (O)         (O)         (O)           |
|                                          |
|    (O)         (O)         (O)           |
|                                          |
|    (O)         (O)         (O)           |
|                                          |
| [====|====|====|    ] wave progress      |
+------------------------------------------+
```

**Elements:**

1. **"AURA POINTS" label:** Space Grotesk 500, 14px, Text Secondary (`#8888a0`), centered, y=16
2. **Score number:** Bungee, 48px, Text Primary (`#f0f0f0`), centered, y=58. On score change: flash to Electric Lime (`#c8ff00`) then fade back over 200ms + scale to 1.15x then back over 150ms.
3. **Combo counter:** Space Grotesk 500, 16px, Mint Aura (`#00ffaa`), centered, y=78. Format: `"combo x{n}"`. Hidden when combo is 0.
4. **Timer:** Bungee, 28px, Text Primary, top-right (x=370, y=36). Format: `"00:XX"`. Turns Hot Magenta at 10s.
5. **Mute button:** top-left, 36x36px tap target, icon: speaker/muted glyph drawn with lines.
6. **Wave progress bar:** bottom of canvas, y=585, width=320, height=4, centered. Background `#1e1e2e`, fill `#555570`.

**Per-game accent color:** Italian Red (`#ff3838`) from the extended palette. Used for:
- Penalty hit screen-edge flash
- Brr Brr Patapim glow
- "GAME OVER" text on the game-over screen (actually Hot Magenta as per visual identity, Italian Red reserved for in-game danger states)

### 4.6 Game-Over Messages

Displayed on the game-over overlay. Selected randomly. The message corresponds to score tiers but includes random variety within each tier.

**Score 0-500 (low):**
1. "certified NPC moment"
2. "the brainrot was too powerful"
3. "you have negative aura right now"
4. "Brr Brr Patapim sends his regards"
5. "skill issue detected"

**Score 501-2000 (mid):**
6. "not bad. not good. but not bad."
7. "your aura is... acceptable"
8. "the Italian brainrot council acknowledges you"
9. "Tralalero would be mildly impressed"
10. "somewhere, Bombardiro nods respectfully"

**Score 2001-5000 (high):**
11. "okay you actually kind of cooked"
12. "sigma-tier aura detected"
13. "the brainrot bows before you"
14. "Lirili Larila wrote a song about this"
15. "your reflexes are illegal in 12 countries"

**Score 5001+ (elite):**
16. "you've transcended brainrot. you ARE brainrot."
17. "the aura readings are off the charts"
18. "touch grass immediately (after sharing this)"
19. "Tung Tung Tung Sahur plays a drum solo in your honor"
20. "this score is a violation of the Geneva Convention"

---

## 5. User Stories

| # | User Story | Priority |
|---|-----------|----------|
| US-1 | As a player, I want to tap characters that pop up from holes so that I can earn AURA POINTS and feel the satisfaction of whacking them. | Must-have |
| US-2 | As a player, I want different characters to be worth different points and have different behaviors so that I have to make quick decisions about which to prioritize. | Must-have |
| US-3 | As a player, I want a penalty character that costs me points if I tap it so that the game requires restraint, not just speed. | Must-have |
| US-4 | As a player, I want a combo system that rewards consecutive hits so that I'm motivated to maintain focus and not miss. | Must-have |
| US-5 | As a player, I want the game to get harder over time (faster spawns, shorter display, more penalties) so that every round feels progressively more intense. | Must-have |
| US-6 | As a player, I want my high score saved locally so that I have a persistent personal best to chase across sessions. | Must-have |
| US-7 | As a player, I want a share button on the game-over screen so that I can flex my AURA POINTS in group chats and social media. | Must-have |
| US-8 | As a player, I want the game to be playable on my phone with responsive touch targets and proper canvas scaling so that it works well on any screen size. | Must-have |

---

## 6. Acceptance Criteria

### US-1: Tap characters for points
- [ ] AC-1.1: Tapping a visible character within its hitbox increments the score by that character's base points (modified by combo multiplier)
- [ ] AC-1.2: A hit character plays a 200ms impact animation (scale to 1.3x + white flash) and floating score text (+N) that rises and fades over 500ms
- [ ] AC-1.3: The character descends back into the hole over 150ms after being hit
- [ ] AC-1.4: Tapping an empty hole or area with no active character has no effect on score or combo

### US-2: Different character behaviors
- [ ] AC-2.1: Tralalero Tralala appears at standard display time and awards 100 base points
- [ ] AC-2.2: Bombardiro Crocodilo appears at 60% of standard display time and awards 200 base points
- [ ] AC-2.3: Tung Tung Tung Sahur appears at 130% display time with a reduced hitbox radius (30px vs 40px) and awards 150 base points
- [ ] AC-2.4: Ballerina Cappuccina sways left-right during display (hitbox center shifts +/-15px sinusoidally) and awards 150 base points
- [ ] AC-2.5: Lirili Larila appears at 40% display time, glows gold, and awards 500 base points. Does not appear before wave 3 (effective wave 3)
- [ ] AC-2.6: Each character is visually distinct and identifiable within 200ms of appearing

### US-3: Penalty character
- [ ] AC-3.1: Hitting Brr Brr Patapim subtracts 200 points from the score (score cannot go below 0)
- [ ] AC-3.2: Hitting Brr Brr Patapim resets the combo counter to 0
- [ ] AC-3.3: Hitting Brr Brr Patapim triggers a screen shake effect (canvas translates +/-4px for 300ms) and penalty sound
- [ ] AC-3.4: Brr Brr Patapim is visually distinct: red, spiky, has warning indicator above head
- [ ] AC-3.5: Brr Brr Patapim's spawn weight increases with difficulty (10% at wave 1 to 20%+ at wave 5+)

### US-4: Combo system
- [ ] AC-4.1: Each consecutive hit (non-penalty) increments the combo counter by 1
- [ ] AC-4.2: The score multiplier equals `1 + (comboCount * 0.25)`, capped at 4.0x (combo 12)
- [ ] AC-4.3: Missing a character (despawn without tap) resets combo to 0
- [ ] AC-4.4: The combo counter is displayed on the HUD when combo >= 1, hidden when combo is 0
- [ ] AC-4.5: Combo milestones (5, 10, 15, 20) display floating text feedback with distinct styling

### US-5: Difficulty progression
- [ ] AC-5.1: Display time decreases each wave per formula: `max(400, 1200 - effectiveWave * 80)` ms
- [ ] AC-5.2: Spawn interval decreases each wave per formula: `max(300, 900 - effectiveWave * 60)` ms
- [ ] AC-5.3: Maximum simultaneously active characters increases per formula: `min(5, 1 + floor(effectiveWave / 2))`
- [ ] AC-5.4: Penalty character spawn weight increases per formula: `min(0.25, 0.10 + effectiveWave * 0.02)`
- [ ] AC-5.5: Wave transitions occur every 15 seconds without visible interruption to gameplay

### US-6: High score persistence
- [ ] AC-6.1: After each round, if the current score exceeds the stored high score, the new high score is saved to localStorage under key `whackARotHighScore`
- [ ] AC-6.2: The game-over screen displays the current score and the all-time high score
- [ ] AC-6.3: If the player achieves a new high score, the game-over screen displays "NEW HIGH SCORE" in Brainrot Yellow (`#ffd000`) with a flash animation
- [ ] AC-6.4: High score persists across browser sessions (page reload, close/reopen)

### US-7: Share functionality
- [ ] AC-7.1: The game-over screen includes a "share score" button (primary button style)
- [ ] AC-7.2: Tapping "share score" copies the following text to clipboard: `"i got [SCORE] aura in WHACK-A-ROT [URL]"` (where URL is the game page)
- [ ] AC-7.3: If the Web Share API is available (mobile), it invokes `navigator.share()` with the share text instead of clipboard
- [ ] AC-7.4: After share action, the button text changes to "copied!" or "shared!" for 2 seconds, then reverts

### US-8: Responsive mobile play
- [ ] AC-8.1: The canvas renders at a logical resolution of 400x600 and scales to fill the viewport width (max 100vw) while maintaining aspect ratio
- [ ] AC-8.2: On viewports wider than 500px, the canvas is capped at 500px width and centered
- [ ] AC-8.3: Touch targets (characters) have a minimum effective tap area of 48x48px at any screen size
- [ ] AC-8.4: Both `mousedown` and `touchstart` events are handled. `touchstart` calls `preventDefault()` to prevent double-firing and ghost clicks
- [ ] AC-8.5: The game prevents page scroll/bounce on touch devices during gameplay (CSS `touch-action: none` on the canvas, `overflow: hidden` on body)
- [ ] AC-8.6: The canvas is not letterboxed on common phone aspect ratios (16:9 through 19.5:9). The 400x600 (2:3) logical ratio fits within all of these with minimal black bars.

---

## 7. Technical Spec

### 7.1 Canvas Size and Scaling

**Logical canvas:** 400 x 600 pixels. All game coordinates use this space.

**CSS scaling:**
```css
canvas {
  width: 100%;
  max-width: 500px;
  height: auto;
  aspect-ratio: 2 / 3;
  display: block;
  margin: 0 auto;
  touch-action: none;
}
```

The `canvas.width` and `canvas.height` attributes are set to 400 and 600 respectively. CSS scales the display. Input coordinates are converted from DOM space to canvas space (see section 3.5).

**Device pixel ratio:** For crisp rendering on Retina/high-DPI screens:
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = 400 * dpr;
canvas.height = 600 * dpr;
ctx.scale(dpr, dpr);
// CSS size remains 400x600 logical
```

### 7.2 Game State Machine

```
                    +-----------+
                    |   MENU    |
                    |           |
                    +-----+-----+
                          |
                    tap "start"
                          |
                    +-----v-----+
                    |  PLAYING  |<---+
                    |           |    |
                    +-----+-----+    |
                          |          |
                   timer = 0         |
                          |          |
                    +-----v-----+    |
                    | GAME_OVER |    |
                    |           |----+
                    +-----------+
                     tap "retry"
```

**States:**
- `MENU`: Title screen. "start game" button. High score display. Static, no game loop running.
- `PLAYING`: Active game loop (requestAnimationFrame). Timer counting down. Characters spawning. Input active.
- `GAME_OVER`: Overlay on dimmed final game frame. Score, high score, share button, retry button. Game loop paused.

**Transitions:**
- `MENU` -> `PLAYING`: on "start game" tap. Initialize: score=0, combo=0, timer=60, wave=1, round++ (or round=1 if first).
- `PLAYING` -> `GAME_OVER`: when timer reaches 0. Calculate final score. Check/save high score. Select game-over message.
- `GAME_OVER` -> `PLAYING`: on "retry" tap. Reset game state, increment round counter.
- `GAME_OVER` -> `MENU`: on "menu" tap. Reset round counter.

### 7.3 File Structure

```
games/game-02/
  index.html          -- Entry point. Canvas element, font imports, meta tags, script loading
  css/
    style.css         -- Canvas container, body reset, font declarations, responsive rules
  js/
    main.js           -- Entry point. Initializes canvas, state machine, starts menu
    game.js           -- Game loop (update + render), timer, wave management, spawn scheduler
    characters.js     -- Character type definitions (points, timing, hitbox, draw functions)
    holes.js          -- Hole grid positions, hole rendering, character rise/sink clipping
    input.js          -- Mouse and touch event handling, coordinate conversion, hit testing
    scoring.js        -- Score tracking, combo multiplier logic, high score (localStorage)
    ui.js             -- HUD rendering (score, timer, combo), menu screen, game-over overlay
    audio.js          -- Web Audio API synthesis, sound definitions, mute toggle
    effects.js        -- Impact animations, floating text, screen shake, combo milestone effects
    sharing.js        -- Web Share API / clipboard copy, share text generation
    utils.js          -- Helper functions: lerp, clamp, random range, easing functions
```

**Total: 1 HTML, 1 CSS, 11 JS files.** No build step. No bundler. Script tags in index.html load in order (utils first, main last) or use a single `type="module"` entry point with imports.

### 7.4 Entity Model

```
Game
  state: 'menu' | 'playing' | 'game_over'
  score: number
  highScore: number
  combo: number
  timer: number (seconds remaining, float)
  wave: number (1-4 within round)
  round: number (increments on retry)
  effectiveWave: number (computed)
  holes: Hole[9]

Hole
  id: number (0-8)
  x: number (center x)
  y: number (center y)
  character: Character | null
  state: 'empty' | 'rising' | 'visible' | 'sinking' | 'hit'
  stateTimer: number (ms elapsed in current state)

Character
  type: 'tralalero' | 'bombardiro' | 'tungtung' | 'ballerina' | 'brrbrr' | 'lirili'
  basePoints: number
  displayTimeMultiplier: number
  hitboxRadius: number
  draw(ctx, cx, cy, time): void  -- renders this character
  getHitboxCenter(cx, cy, time): {x, y}  -- returns current hitbox center (accounts for sway etc.)

ScoreDisplay
  currentDisplay: number (animated, lerps toward actual score)
  flashTimer: number (ms remaining for lime flash on change)
  scaleTimer: number (ms remaining for scale pulse)

ComboCounter
  count: number
  display: boolean (visible when count > 0)
  milestoneTriggered: number (last milestone shown, to avoid repeats)

Timer
  remaining: number (float, seconds)
  isWarning: boolean (true when < 10s)
  paused: boolean (true when tab not visible)
```

### 7.5 Character Drawing (Sprite Approach)

Characters are drawn entirely with Canvas 2D primitives. Each character type has a `draw(ctx, cx, cy, time)` method defined in `characters.js` that renders the character at the given center position.

The `time` parameter (ms since game start) drives idle animations (bobbing, swaying, spinning propellers, wing flapping, etc.).

**Character state rendering:**
- `rising`: character drawn with increasing `clipHeight` from 0 to full over 200ms. Clipped by hole ellipse.
- `visible`: character fully visible, idle animation running.
- `sinking`: reverse of rising. `clipHeight` decreases from full to 0 over 150ms.
- `hit`: 200ms impact animation. Character scales to 1.3x, white overlay flash (globalCompositeOperation = 'source-atop' fill with white at 60% opacity, fading), then transitions to `sinking`.

No sprite sheets. No image loading. Pure procedural drawing.

### 7.6 Audio Approach

Web Audio API oscillator synthesis. No audio files.

**Architecture:**
```javascript
// audio.js exports:
function initAudio()        // Create AudioContext (call on first user gesture)
function playHitSound()     // Standard hit
function playBonusSound()   // Lirili Larila hit
function playPenaltySound() // Brr Brr Patapim hit
function playMissSound()    // Character despawned
function playComboSound()   // Combo milestone
function playGameOver()     // Game over jingle
function playHighScore()    // New high score jingle
function toggleMute()       // Toggle master gain between 0 and 1
function isMuted()          // Returns current mute state
```

Each sound function creates a new OscillatorNode, connects it to a GainNode, connects that to the master GainNode, and schedules start/stop times. Oscillators are garbage-collected after stopping.

**AudioContext resume:** On iOS/Safari, AudioContext starts in "suspended" state. On first `touchstart` or `mousedown` in the `MENU` state, call `audioCtx.resume()`.

### 7.7 Score Persistence

**localStorage keys:**
| Key | Type | Description |
|-----|------|-------------|
| `whackARotHighScore` | number (string) | All-time high score |
| `whackARotRoundCount` | number (string) | Total rounds played (for analytics / ad frequency) |
| `whackARotSoundMuted` | 'true' \| 'false' | Sound mute preference |

**Read on init:**
```javascript
const highScore = parseInt(localStorage.getItem('whackARotHighScore') || '0', 10);
```

**Write on game over:**
```javascript
if (score > highScore) {
  localStorage.setItem('whackARotHighScore', String(score));
}
```

### 7.8 Responsive Design

**Breakpoints and behavior:**

| Viewport Width | Canvas CSS Width | Behavior |
|---------------|-----------------|----------|
| < 400px | 100vw | Canvas stretches to fill. Very small phones. |
| 400-500px | 100vw | Optimal mobile. Canvas fills width. |
| 500-1024px | 500px, centered | Tablet. Canvas centered with dark margin. |
| > 1024px | 500px, centered | Desktop. Canvas centered. |

**Touch targets:** The minimum hitbox radius of 30px (Tung Tung Tung Sahur) at the smallest supported canvas width (320px physical on a small phone) scales to `30 * (320/400) = 24px` physical. With the tap tolerance inherent in circular hit detection, this remains tappable. All other characters have 40px radius = 32px physical minimum, well above the 24px minimum recommended for touch.

**Viewport meta tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

**Prevent pull-to-refresh on mobile:**
```css
html, body {
  overscroll-behavior: none;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}
```

---

## 8. Monetization Hooks

Ads are NOT in v1 scope. These are placement specifications for when ads are integrated.

| Placement | Type | Trigger | Frequency | Notes |
|-----------|------|---------|-----------|-------|
| **Post-round interstitial** | Interstitial (full screen) | After game-over screen dismiss | Every 3rd round (`roundCount % 3 === 0`) | Never after the first round. Player needs to feel the loop before seeing ads. |
| **Continue rewarded video** | Rewarded video (opt-in) | "watch to add 15 seconds" button on game-over screen | Once per round max | Adds 15 seconds to the timer and resumes gameplay. High-value to player on good runs. |
| **Score doubler rewarded video** | Rewarded video (opt-in) | "double your aura" button on game-over screen | Once per round max | Doubles the final score (for share purposes and high score). |

**Key constraint:** No ads during gameplay. The 60-second round is sacred. All ad placements are on the game-over screen or between rounds at natural pause points.

**Integration point:** `main.js` state machine checks `roundCount` on `GAME_OVER` entry and calls `showInterstitial()` if the condition is met. The ad SDK integration is a separate module (`ads.js`) that is not part of v1.

---

## 9. Social Sharing

### Share Button

Primary button on the game-over overlay. Label: "share score" (sentence case per brand guide).

**Share text format:**
```
i got {score} aura in WHACK-A-ROT
{url}
```

Example:
```
i got 4,250 aura in WHACK-A-ROT
brainrotgames.com/whack-a-rot
```

**Implementation:**
```javascript
async function shareScore(score, url) {
  const text = `i got ${score.toLocaleString()} aura in WHACK-A-ROT\n${url}`;

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e) {
      // User cancelled or API failed, fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(text);
  return 'copied';
}
```

### Score Card (v1 -- text only)

The share text is the v1 implementation. No canvas-rendered image card in v1.

**Future enhancement (out of scope):** Render a 1080x1920 image card with:
- Dark background (`#0a0a0f`)
- Game title in Bungee, Electric Lime
- Score in Bungee, large
- Character breakdown stats (Tralalero x12, Bombardiro x5, etc.)
- Brainrot Games logo watermark

### Character Hit Stats

During gameplay, track hits per character type:
```javascript
const hitStats = {
  tralalero: 0,
  bombardiro: 0,
  tungtung: 0,
  ballerina: 0,
  brrbrr: 0,   // penalty hits
  lirili: 0
};
```

Display on the game-over screen below the score as a compact row of character icons with hit counts. Each icon is a 24x24 mini rendering of the character with the count below it. This is screenshot-friendly visual data.

---

## 10. Analytics Events

No analytics SDK in v1. These are the event definitions for when analytics is integrated. Events fire to a `trackEvent(name, properties)` function stub that can be wired to any analytics provider.

| Event Name | Trigger | Properties |
|-----------|---------|------------|
| `game_start` | Player taps "start game" from menu | `{ round: number }` |
| `game_over` | Timer reaches 0 | `{ score, highScore, isNewHighScore, combo_max, round, wave, hits: hitStats }` |
| `character_hit` | Player taps a character successfully | `{ character_type, points_awarded, combo_count }` |
| `character_penalty` | Player taps Brr Brr Patapim | `{ points_lost, combo_lost }` |
| `character_missed` | Character despawns without being tapped | `{ character_type }` |
| `share_tap` | Player taps share button | `{ method: 'web_share' \| 'clipboard', score }` |
| `retry` | Player taps "try again" | `{ previous_score, round }` |
| `menu_return` | Player taps "menu" from game-over | `{ previous_score }` |
| `mute_toggle` | Player toggles sound | `{ muted: boolean }` |

---

## 11. Scope Boundaries

### IN Scope (v1)

- 6 characters with distinct behaviors, point values, and Canvas-drawn visuals
- 3x3 hole grid with portal-style hole rendering
- Tap/click hit detection with per-character hitboxes
- Scoring with AURA POINTS label
- Combo multiplier system (up to 4.0x)
- 60-second countdown timer per round
- Difficulty progression via wave system (display time, spawn interval, max active, penalty frequency)
- Game state machine: menu -> playing -> game-over
- Menu screen with title, start button, high score display
- Game-over screen with score, high score, message, share button, retry button, character hit stats
- 20 random game-over messages across 4 score tiers
- High score persistence via localStorage
- Share functionality (Web Share API with clipboard fallback)
- Responsive canvas scaling (mobile-first, works on desktop)
- Touch and mouse input handling
- Impact animations (scale flash, floating score text)
- Screen shake on penalty hit
- Combo milestone floating text
- Background with layered depth and ambient particles
- Character idle animations (bob, sway, spin, drum, shiver, flutter)
- Character rise/sink hole clipping animations
- All character rendering via Canvas 2D primitives (no image assets)

### OUT of Scope (v1)

| Feature | Reason | Target |
|---------|--------|--------|
| **Sound effects** | Nice-to-have. Game is fully playable without audio. Web Audio synthesis can be added post-launch without any structural changes since `audio.js` is already specced as a standalone module. | v1.1 |
| **Leaderboards** | Requires backend. Out of scope for static HTML5 game. | v2 |
| **Daily challenges** | Requires backend for daily seed and validation. | v2 |
| **Character unlocks** | Adds complexity to first version. All 6 characters available from start. | v1.1 |
| **Boss character (Cappuccino Assassino)** | Multi-tap mechanic adds a different interaction pattern. Defer to avoid scope creep. | v1.1 |
| **Background scene changes per wave** | Single static background is sufficient for v1. | v1.1 |
| **Canvas-rendered share image card** | Text share is sufficient for v1. Image card is a polish feature. | v1.1 |
| **Ad integration** | Monetization layer is separate. Hooks are specced but not implemented. | v2 |
| **Cross-game character unlocks** | Requires shared state layer between games. | v2 |
| **Entrance/exit character-specific animations** | Characters use the same generic rise/sink. Per-character animations are polish. | v1.1 |
| **Taunt animation on miss** | Polish feature. Character just sinks back on miss in v1. | v1.1 |

### Decision Rationale

v1 ships the core loop: tap characters, earn aura, build combos, beat your score, share it. Everything that makes the game *work* is in scope. Everything that makes the game *better* is v1.1. This gets the game live and testable as fast as possible.

---

## 12. Shared Infrastructure Usage

**Target directory:** `games/shared/`

The following shared modules are expected to be available across all Brainrot Games titles. WHACK-A-ROT uses these where they exist.

| Shared Module | Usage in WHACK-A-ROT | Status |
|--------------|---------------------|--------|
| **Game shell HTML template** | `index.html` base structure: meta tags, viewport, font imports, canvas container, script loading pattern | To be created with Game 01 (Flappy Tralalero) and reused |
| **CSS reset / base styles** | Body reset, dark background, font declarations, canvas container centering, responsive rules, scroll prevention | To be created with Game 01 and reused |
| **Share utility** | `sharing.js` — Web Share API with clipboard fallback. Identical across games, only the share text content differs. | To be created. Can live in `games/shared/sharing.js` |
| **Audio utility** | `audio.js` — Web Audio API context management, oscillator helper, mute toggle with localStorage persistence. The sound definitions are game-specific but the synthesis engine is shared. | To be created as shared. Sound definitions remain in each game's `audio.js` |
| **Score persistence pattern** | localStorage read/write pattern. Not a shared module (too simple to abstract), but key naming convention is shared: `{gameSlug}HighScore`, `{gameSlug}RoundCount`, `{gameSlug}SoundMuted` | Convention only |
| **Analytics event stub** | `trackEvent(name, properties)` no-op function that future analytics SDK wires into. Shared interface, game-specific events. | To be created in `games/shared/analytics.js` |
| **Visual identity tokens** | Color hex values, font names, spacing values referenced from `brand/visual-identity.md`. Not a CSS variables file in v1 — just documented constants that each game hard-codes. | Convention only. CSS variables file is a v2 shared asset. |

**Cross-game asset reuse with Flappy Tralalero (Game 01):**
- Character drawing code is NOT shared. Whack-a-Rot characters are drawn front-facing (popping up from holes). Flappy Tralalero characters are drawn side-facing (flying). Different proportions, different animations.
- Character color palettes and design language ARE shared (same blue for Tralalero, same green for Bombardiro, etc.) to maintain visual consistency across the universe.
- Sound synthesis utilities can be shared. The oscillator-based approach is identical.

---

## Open Questions

None blocking. The following are noted for Product Head awareness:

1. **Round structure vs. continuous play:** This GDD specifies a 60-second timed round. The concept brief mentioned "3 misses" as an alternative end condition. The timed round is simpler, more predictable for ad placement, and avoids the frustration of "I died because I missed 3 in a row" which feels punishing in a fast-paced game. If playtesting reveals the timer feels too relaxed, a hybrid (timer + lives) can be added in v1.1.

2. **Effective wave carry-over across rounds:** Currently, round 2 starts at effective wave 3 (harder than round 1). This means each subsequent round is noticeably harder. An alternative is to reset difficulty each round and let only the score/high-score chase drive replay. Recommend keeping the carry-over for now; it creates a natural skill ceiling where the game becomes very hard by round 3-4, which drives sharing of high scores.

3. **Sound as out-of-scope:** The concept brief heavily features sound design. This GDD specifies it as out-of-scope for v1 but includes full synthesis specs so it can be added rapidly. The game is fully playable and fun without audio. If the team has bandwidth, sound is the highest-impact v1.1 feature.
