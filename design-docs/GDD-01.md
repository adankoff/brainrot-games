# Game Design Document: FLAPPY TRALALERO
## GDD-01 | Brainrot Games | April 2026

---

## 1. Overview

**Game name:** FLAPPY TRALALERO

**Elevator pitch:** It's Flappy Bird but you're Tralalero Tralala -- the three-legged Nike-wearing shark from Italian brainrot -- kicking your way through gaps between Skibidi Toilets, mewing jawlines, and Bombardiro jaws. Every death is the funniest thing you've seen today.

**Platform:** HTML5 web (Canvas), mobile-first, playable in any modern browser. No download, no install, no signup.

**Target session:** 15-45 seconds per attempt. 2-5 minutes per session (multiple attempts). Death-to-restart in under 2 seconds.

**URL path:** `brainrotgames.com/games/game-01/`

**Per-game accent color:** Italian Red (`#ff3838`) via `data-theme="italian-brainrot"` on the body element.

---

## 2. Core Gameplay Loop

The loop runs on a ~10-15 second cycle:

1. **MENU** -- Player sees title screen with Tralalero Tralala floating idle. Taps "start game" or taps anywhere on the canvas.
2. **READY** -- Canvas transitions to gameplay view. Tralalero hovers in place. Score reads 0. Text reads "tap to flap." No obstacles yet. This state lasts until the player's first tap.
3. **TAP** -- Player taps the screen. Tralalero receives an upward velocity impulse. His legs kick. A flap sound plays.
4. **FALL** -- Gravity pulls Tralalero downward every frame. Velocity increases until terminal velocity. Player must tap again to stay airborne.
5. **NAVIGATE** -- Obstacles scroll from right to left. Each obstacle pair has a gap. Player must fly through the gap without touching the top obstacle, bottom obstacle, ceiling, or floor.
6. **SCORE** -- When Tralalero's x-position passes the center of an obstacle pair, score increments by 1. Score number pops (scale to 1.2, back to 1.0 over 150ms). A pass-through sound plays.
7. **DIE** -- Collision with any obstacle, the floor, or the ceiling triggers death. Screen shakes (4px, 200ms). Tralalero ragdolls downward with rotation. A death sound plays.
8. **GAME OVER** -- Game-over overlay appears with: score, high score, brainrot death message, share button, retry button. If score triggers a character unlock, an unlock notification appears.
9. **RESTART** -- Player taps "try again" (or taps canvas). Immediate reset to step 2. Under 2 seconds from death to gameplay.

**Ad insertion point:** After every 3rd death, show an interstitial ad BEFORE the game-over overlay transition. The overlay appears after the ad closes. This keeps the restart loop under 2 seconds for non-ad deaths.

---

## 3. Game Mechanics

### 3.1 Physics Model

All values assume a logical canvas of **360 x 640 pixels** (see Section 7 for scaling).

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Gravity** | `0.4 px/frame` (added to velocity each frame at 60fps) | Standard Flappy Bird gravity. At 60fps this equals ~24 px/sec^2 acceleration. Feels weighty but not sluggish. |
| **Tap impulse** | `-7.0 px/frame` (set velocity to this value, not additive) | Sets velocity directly to -7.0 on tap. This prevents "turbo tapping" from launching the character off screen. Rise rate is ~420 px/sec initially. |
| **Terminal velocity** | `10.0 px/frame` (max downward velocity) | Prevents absurd fall speed. Gives player a window to recover from long falls. |
| **Horizontal scroll speed** | `2.5 px/frame` base (increases with score, see 3.4) | Obstacles and background move left at this rate. Player's x-position is fixed on screen. |
| **Player x-position** | `80 px` from left edge (fixed) | ~22% of canvas width. Gives enough reaction time to see incoming obstacles. |
| **Player hitbox** | `30 x 30 px` centered on character (AABB) | Character is drawn at ~40x40 but the hitbox is 25% smaller than the visual sprite. This is the "forgiveness margin" that makes Flappy Bird playable. |
| **Rotation** | `velocity * 3` degrees, clamped to `[-30, 90]` | Character tilts up when rising, tilts down when falling. Nose-dives on death (90 degrees). Visual only -- does not affect hitbox. |

**Frame timing:** The game loop uses `requestAnimationFrame` with delta-time normalization. All physics values above are per-frame at 60fps. The update function multiplies by `dt / 16.67` to normalize across refresh rates.

```
// per frame:
velocity += GRAVITY * dt
velocity = min(velocity, TERMINAL_VELOCITY)
y += velocity * dt

// on tap:
velocity = TAP_IMPULSE
```

### 3.2 Scoring System

| Event | Points | Visual Feedback | Audio Feedback |
|-------|--------|----------------|----------------|
| Pass through obstacle gap | +1 | Score pops (scale 1.0 -> 1.2 -> 1.0, 150ms). Flash to Electric Lime then back to white. | "ding" tone + character reaction |
| Die | 0 | Screen shake (4px displacement, 200ms decay) | Character-specific death sound |

**Combo mechanics:** None. Keeping it pure Flappy Bird. One point per pipe. Simplicity is the feature. The score IS the flex.

**High score:** Stored in `localStorage`. Displayed on the game-over screen. If the current score exceeds the stored high score, display "NEW HIGH SCORE" in Brainrot Yellow (`#ffd000`) with pulse animation.

### 3.3 Obstacle Generation

**Obstacle structure:** Each obstacle is a pair -- a top element and a bottom element with a gap between them. They scroll from right to left.

| Parameter | Formula | Example at Score 0 | Example at Score 50 |
|-----------|---------|--------------------|--------------------|
| **Gap size** | `max(130, 200 - score * 1.4) px` | 200 px (31% of canvas) | 130 px (20% of canvas) |
| **Gap position** | Random Y between `gapSize/2 + 60` and `canvasHeight - gapSize/2 - 60` | Range: 160-480 | Range: 125-515 |
| **Obstacle spacing** | `max(180, 250 - score * 1.5) px` horizontal distance between centers | 250 px | 180 px |
| **Obstacle width** | `60 px` | Fixed | Fixed |

**Gap minimum (130px):** At the minimum gap, the player hitbox (30px) has 50px of clearance above and below. This is tight but fair -- the original Flappy Bird had similar ratios.

**Obstacle type selection:** Each obstacle pair is randomly assigned one of 5 types (equal probability). Obstacle type affects visuals and pass-through sound only -- hitbox is always AABB rectangular.

### 3.4 Difficulty Progression

Difficulty scales linearly with score, with hard caps to prevent impossibility.

| Parameter | Formula | Min | Max | Notes |
|-----------|---------|-----|-----|-------|
| **Scroll speed** | `2.5 + score * 0.03 px/frame` | 2.5 | 4.0 | Capped at score ~50. Barely noticeable per-point but cumulative. |
| **Gap size** | `max(130, 200 - score * 1.4) px` | 130 | 200 | Reaches minimum at score ~50. |
| **Obstacle spacing** | `max(180, 250 - score * 1.5) px` | 180 | 250 | Tighter gaps mean less recovery time. |

**Difficulty plateau:** After score ~50, all parameters are at their caps. Further progression is pure player skill vs. constant difficulty. This is intentional -- the original Flappy Bird did the same thing. The "endgame" is surviving at max difficulty.

### 3.5 Collision Detection

**Approach: AABB (Axis-Aligned Bounding Box)**

Rationale: The obstacles are rectangular. The player's effective hitbox is a rectangle (even though the character is drawn with curves). AABB is:
- Trivial to implement (~5 lines of code)
- Zero performance cost (simple comparisons, no square roots)
- Sufficient precision given the forgiveness margin (hitbox is 75% of visual size)

Circle-based collision would require distance calculations per obstacle edge and offers no benefit for rectangular obstacles. AABB is the correct choice.

```
function collides(player, obstacle) {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  );
}
```

Additionally check:
- **Floor collision:** `player.y + player.height > canvasHeight`
- **Ceiling collision:** `player.y < 0`

### 3.6 Character Variants

7 playable characters. All share identical physics (gravity, impulse, terminal velocity, hitbox size). Differences are visual and audio only.

| # | Character | Unlock Condition | Draw Description | Flap Animation | Death Sound Description |
|---|-----------|-----------------|-----------------|----------------|------------------------|
| 1 | **Tralalero Tralala** | Default (free) | Blue-gray shark body (ellipse), 3 thick legs with white Nike swooshes, tiny fins, big round eye | Legs kick outward rapidly (3-frame cycle) | Descending pitch "TRALALERO" -- oscillator sweep from 400Hz to 100Hz over 500ms |
| 2 | **Bombardiro Crocodilo** | Score 10+ | Green crocodile body (ellipse), airplane wings, propeller nose, toothy grin | Whole body spins 360 degrees per flap | Explosion burst (white noise 200ms) + ascending "BOMBARDIRO" tone 200Hz to 600Hz |
| 3 | **Lirili Larila** | Score 25+ | Pink/purple butterfly body (small circle), large ornate wings (two arcs per side), sparkle trail | Wings flutter rapidly (4-frame cycle, wings go from spread to closed) | High-pitched descending "oh no" -- 800Hz to 400Hz sine wave, 300ms, quiet |
| 4 | **Tung Tung Tung Sahur** | Score 50+ | Black cylindrical body (tall rect with rounded top), two drumstick arms, wide eyes | Drumstick arms flail up and down alternately | Drum roll (rapid oscillator at 200Hz, 400ms) then crash cymbal (white noise burst 150ms) |
| 5 | **Cappuccino Assassino** | Score 100+ | Brown coffee cup body (trapezoid), assassin mask (black band across eyes), steam wisps above | Espresso squirts downward (brown particles below) as thrust visual | Machine grinding sound -- sawtooth wave 150Hz with rapid frequency modulation, 400ms |
| 6 | **Brr Brr Patapim** | Watch 5 ad reward videos (cumulative, tracked in localStorage) | Blue shivering blob (wobbly circle), chattering teeth, icicle accents | Whole body shivers/vibrates, moves in a wobbly sine wave pattern | Sad descending "patapim" -- triangle wave 300Hz to 80Hz, 600ms, with vibrato |
| 7 | **La Vaca Saturno Saturnita** | Hidden: tap the game title text on the menu screen 10 times | White cow body (large ellipse), Saturn ring around midsection (tilted ellipse), purple spots, floating pose | Cow floats upward serenely, Saturn ring tilts on each flap | Space reverb moo -- low square wave 80Hz, 800ms, with echo effect (delayed repeat at 50% volume) |

**Unlock persistence:** Character unlock state stored in `localStorage` as a JSON object. Key: `flappy-tralalero-unlocks`. Value: `{ "bombardiro": true, "lirili": false, ... }`.

**Character select:** Accessible from the menu screen. A row of character icons (circles with mini character faces). Locked characters show as silhouettes with the unlock condition as tooltip text. Selected character is highlighted with Electric Lime border.

---

## 4. Brainrot Theme Integration

### 4.1 Player Character: Tralalero Tralala (Default)

**Canvas drawing spec (all primitives, no images):**

The character is drawn at a base size of 40x40 pixels, centered on the entity position.

```
Body:
- Ellipse: cx=0, cy=0, rx=18, ry=14
- Fill: #6B7B8D (blue-gray)
- Stroke: #4A5568, lineWidth=2

Eye:
- Circle: cx=10, cy=-4, r=5
- Fill: #FFFFFF
- Pupil circle: cx=12, cy=-4, r=2.5
- Fill: #0a0a0f

Mouth:
- Arc: cx=12, cy=4, r=4, startAngle=0, endAngle=PI
- Stroke: #0a0a0f, lineWidth=1.5 (menacing grin)

Dorsal fin:
- Triangle: points at (-8,-14), (-4,-22), (0,-14)
- Fill: #5A6A7D

Legs (3 total, the signature feature):
- Left leg: Line from (-8, 12) to (-12, 28), lineWidth=4, stroke=#6B7B8D
  - Foot: Rect at (-16, 26), 8x4, fill=#FFFFFF (Nike shoe)
  - Swoosh: Small arc on shoe, stroke=#ff3838, lineWidth=1
- Center leg: Line from (0, 14) to (0, 30), lineWidth=4, stroke=#6B7B8D
  - Foot: Rect at (-4, 28), 8x4, fill=#FFFFFF
  - Swoosh: Same as left
- Right leg: Line from (8, 12) to (12, 28), lineWidth=4, stroke=#6B7B8D
  - Foot: Rect at (8, 26), 8x4, fill=#FFFFFF
  - Swoosh: Same as left

Flap animation (3 frames, cycle every 100ms during flap):
- Frame 1: Legs at rest (as above)
- Frame 2: Legs splay outward (left to -18,24; right to 18,24; center stays)
- Frame 3: Legs kick inward (left to -4,26; right to 4,26; center tucks)
```

**Rotation:** The entire character drawing rotates around cx=0, cy=0 based on velocity. Apply `ctx.rotate(angle)` before drawing. The kick animation continues independent of rotation.

### 4.2 Obstacles

Each obstacle pair is one of 5 themed types. The hitbox is always a 60px-wide rectangle regardless of visual decoration.

| Type | Top Obstacle | Bottom Obstacle | Pass-Through Effect |
|------|-------------|-----------------|-------------------|
| **Bombardiro Jaws** | Green crocodile upper jaw pointing down. Draw: green rect (60px wide) + triangular teeth along bottom edge (zigzag path, fill white). | Lower jaw pointing up, mirrored. Same teeth pattern along top edge. | Small explosion particles (3-4 orange circles, expand and fade, 300ms) |
| **Mewing Jawlines** | Jawline silhouette in profile facing left. Draw: flesh-colored rect + angular jaw contour along bottom edge (strong square jaw shape). | Mirror jawline, chin pointing up. The gap is between two chins "mewing." | Brief glow outline in Sigma Purple (`#b44dff`), 200ms |
| **Skibidi Toilets** | Stack of toilet shapes. Draw: white rect body + gray rect tank on top + small gray semicircle lid, repeated vertically to fill height. | Same toilet stack, inverted (lids face down into the gap). | Swirl particle effect (2-3 small white circles orbit briefly, 250ms) |
| **Ohio Portals** | Dark purple rect with swirling void effect. Draw: dark rect + 2-3 concentric ellipses in decreasing opacity (#b44dff at 0.6, 0.3, 0.1), slowly rotating. | Matching dark portal below. | Screen briefly tints purple (overlay flash, 150ms) + character wobbles for 0.5s |
| **Fanum Hands** | Large hand reaching down. Draw: flesh-colored rect + five finger rects at bottom, slightly spread. | Hand reaching up from below, mirrored. Fingers point up into gap. | "Taxed!" text floats up from gap position in Brainrot Yellow, fades over 500ms |

**Type selection:** `obstacleTypes[Math.floor(Math.random() * 5)]` for each new pair. No weighting, no sequencing rules.

### 4.3 Background (Parallax)

Three layers scrolling left at different speeds, creating depth.

| Layer | Speed (relative to obstacle scroll) | Content | Colors |
|-------|-------------------------------------|---------|--------|
| **Far (Layer 1)** | 0.15x obstacle speed | City skyline silhouette. Draw: series of rectangles at varying heights along the bottom 30% of canvas. Some with dome tops (Italian architecture). Simple geometric shapes. | Fill: `#12121a` (slightly lighter than Void). Against the `#0a0a0f` sky. |
| **Mid (Layer 2)** | 0.4x obstacle speed | Ground-level buildings and occasional brainrot character silhouettes (small, recognizable shapes walking/standing). Hills terrain as a wavy line with solid fill. | Fill: `#1a1a28`. Character silhouettes: `#222238`. |
| **Near (Layer 3)** | 1.0x (same as obstacles) | The gameplay layer -- obstacles, player, floor. The floor is a flat rectangle at the bottom of the canvas with a simple repeating pattern (dashes or lines to convey motion). | Floor fill: `#1e1e2e`. Floor line pattern: `#2a2a3e`. |

**Sky / canvas background:** Solid `#0a0a0f` (Void).

**Biome shifts:** Every 25 points, the far and mid layer colors shift slightly to indicate a new "zone." This is cosmetic only -- no gameplay change. Implemented as a color tint that transitions over 2 seconds.

| Score Range | Biome | Far Layer Tint | Mid Layer Tint |
|-------------|-------|---------------|----------------|
| 0-24 | Italian Piazza | Default (blue-dark) | Default |
| 25-49 | Ohio Wasteland | Greenish tint (`#121a12`) | (`#1a281a`) |
| 50-74 | Sigma Gym | Purple tint (`#1a1220`) | (`#281a30`) |
| 75-99 | Skibidi Battlefield | Blue tint (`#121220`) | (`#1a1a38`) |
| 100+ | Meme Void | Slowly cycling hue (rotate through all tints, one per 10 frames) | Same cycling |

### 4.4 Sound Effects (Web Audio API Oscillator Synthesis)

All sounds are generated procedurally using the Web Audio API. No audio files to load. Each sound is a function that creates oscillator nodes, sets parameters, and auto-disconnects after playback.

**Audio context:** Created on first user interaction (tap/click) to comply with browser autoplay policies. Stored as a singleton.

| Sound | Trigger | Oscillator Config |
|-------|---------|-------------------|
| **Flap** | Player taps | Type: `square`. Frequency: `580Hz -> 620Hz` sweep over `60ms`. Gain: `0.12`. Short chirp -- the classic 8-bit jump sound. |
| **Score ding** | Pass through gap | Type: `sine`. Frequency: `880Hz` for `80ms`, then `1100Hz` for `80ms` (two-tone rising ding). Gain: `0.15`. Clean, satisfying. |
| **Death thud** | Hit obstacle/floor | Type: `sawtooth`. Frequency: `200Hz -> 50Hz` sweep over `300ms`. Gain: `0.2`. Add white noise burst (via `createBuffer` with random samples) at `0.15` gain for `100ms`. Crunchy impact. |
| **Death voice** | 200ms after death thud | Character-specific (see character table). Default Tralalero: `square` wave, `400Hz -> 100Hz` sweep over `500ms`, gain `0.2`. |
| **Menu select** | Button tap | Type: `sine`. Frequency: `660Hz` for `40ms`. Gain: `0.1`. Subtle confirmation blip. |
| **High score** | New record achieved | Type: `sine`. Arpeggio: `523Hz -> 659Hz -> 784Hz -> 1047Hz`, each note `100ms`, gain `0.15`. Rising major chord. |
| **Unlock** | Character unlocked | Same as high score but with added `triangle` wave one octave below for richness. Duration `500ms`. Gain `0.18`. |

**Master volume:** Controlled by a `GainNode` between the oscillators and `AudioContext.destination`. Default: `0.5`. Stored in `localStorage` key `flappy-tralalero-volume`.

**Mute toggle:** Icon button (speaker icon) in the top-right of the menu screen. Toggles master gain between stored value and `0`. State stored in `localStorage` key `flappy-tralalero-muted`.

### 4.5 UI Theming

All UI follows the design system (`brand/design-system.css`) with `data-theme="italian-brainrot"` applied to the body, which overrides `--color-primary` to Italian Red (`#ff3838`).

**Menu screen (follows `.menu-screen` layout from design system):**
1. Title: "FLAPPY TRALALERO" in Bungee, `--text-3xl`, Italian Red, with `text-shadow: 0 0 30px rgba(255, 56, 56, 0.3)`
2. Subtitle: "tap. die. share. repeat." in Space Grotesk, `--text-sm`, Text Secondary
3. Visual: Tralalero Tralala character drawn on canvas, floating with `animate-float` CSS class (gentle 3s up/down)
4. Character select row: horizontal scroll of 7 circular icons (40px diameter). Unlocked = character face. Locked = `#555570` silhouette with lock icon. Selected = Italian Red border ring.
5. Primary button: "start game" -- `.btn.btn-primary.btn-lg`
6. Secondary row: "how to play" (ghost button) | mute toggle (icon button)
7. Watermark: "BRAINROT GAMES" in `--text-xs`, Ghost color, bottom center

**HUD (during gameplay):**
- Score: top-center, 16px from top. Bungee, `--text-4xl`. White with `text-shadow: 2px 2px 0 rgba(0,0,0,0.5)`. Pops on increment.
- No other HUD elements needed. Flappy Bird's genius is its clean screen.

**Game-over screen (follows `.game-over-overlay` layout):**
1. Brainrot message (see 4.6): Space Grotesk, `--text-md`, `500` weight, Text Secondary. Positioned above the title.
2. "GAME OVER" in Bungee, `--text-2xl`, Hot Magenta (`#ff2d78`)
3. Final score: Bungee, `--text-5xl`, Electric Lime (`#c8ff00`), with glow shadow. Counts up from 0 to final over `score * 30ms` (capped at 1500ms).
4. Score label: "aura points" in Space Grotesk, `--text-sm`, Text Secondary
5. High score line: "best: [N]" in Space Grotesk, `--text-sm`, Text Secondary. OR "NEW HIGH SCORE" in Bungee, `--text-lg`, Brainrot Yellow, with `animate-pulse`.
6. Character unlock notification (if triggered): "UNLOCKED: [CHARACTER NAME]" in Bungee, `--text-md`, Mint Aura (`#00ffaa`), with brief scale animation.
7. Share button: `.btn.btn-primary` -- "flex this"
8. Retry button: `.btn.btn-secondary` -- "run it back"
9. Secondary row: "menu" (ghost button) | "other games" (ghost button, links to `/`)

### 4.6 Death Screen Messages

Randomly selected from the pool matching the player's score tier. One message per death.

**Score 0:**
- "certified NPC moment"
- "skill issue detected"
- "you literally didn't even try"
- "0 aura. absolute 0 aura."

**Score 1-5:**
- "you tried. that's... something"
- "participation trophy incoming"
- "the mewing wasn't strong enough"
- "even Tralalero is embarrassed"

**Score 6-14:**
- "not terrible. not great. mid."
- "your aura is... detectable"
- "a humble beginning to a mediocre career"
- "the skibidi toilet claims another victim"

**Score 15-24:**
- "okay that was lowkey decent"
- "slight aura detected"
- "Bombardiro would be mildly impressed"
- "you're starting to lock in"

**Score 25-49:**
- "actual rizz detected"
- "the sigma grindset is working"
- "Tralalero salutes you from beyond"
- "that was genuinely not terrible"

**Score 50-99:**
- "the aura is immeasurable"
- "okay you're actually goated"
- "Cappuccino Assassino tips his cup to you"
- "certified sigma. the grind is real."

**Score 100+:**
- "you need to go outside"
- "this is no longer a game. this is a lifestyle."
- "what Tralalero Tralala would've wanted"
- "bro thinks he's a professional flappy player"
- "touch grass immediately"

### 4.7 Easter Eggs

1. **La Vaca unlock:** Tapping the title text "FLAPPY TRALALERO" on the menu screen 10 times reveals La Vaca Saturno Saturnita with a space sound effect (low reverb moo) and a brief Saturn ring animation around the title. A toast notification reads: "la vaca has been summoned."

2. **Konami sequence:** On the menu screen, if the player taps a specific pattern (top-top-bottom-bottom-left-right-left-right on the canvas quadrants, then taps twice), all obstacle types for the next run become Ohio Portals only, and the background immediately starts at the "Meme Void" biome. A toast reads: "only in ohio." Resets on death.

3. **Score 69:** When the player's score hits exactly 69, the score briefly flashes Hot Magenta and the score pop animation plays twice. The score label temporarily changes to "nice" for 1 second before reverting to "aura points."

4. **Bombardiro propeller:** If playing as Bombardiro Crocodilo and the player taps more than 8 times per second (detected via tap timestamp tracking), a small propeller sound effect plays (oscillating `triangle` wave, 300Hz with 20Hz modulation) and the character's spin animation doubles in speed for 2 seconds. A toast reads: "TURBO BOMBARDIRO."

---

## 5. User Stories

| # | Story | Priority |
|---|-------|----------|
| US-01 | As a player, I want to tap the screen to make my character fly upward so that I can navigate through obstacles. | Must have |
| US-02 | As a player, I want to see my score increase each time I pass through a gap so that I know how well I'm doing. | Must have |
| US-03 | As a player, I want to restart instantly after dying so that I can try again without friction. | Must have |
| US-04 | As a player, I want to see a funny brainrot-themed death message so that dying feels entertaining rather than frustrating. | Must have |
| US-05 | As a player, I want to share my score from the game-over screen so that I can challenge my friends. | Must have |
| US-06 | As a player, I want my high score saved between sessions so that I can track my progress over time. | Must have |
| US-07 | As a player, I want to unlock new characters by reaching score milestones so that I have a reason to keep improving. | Should have |
| US-08 | As a player, I want the game to look and play correctly on my phone regardless of screen size so that I get a consistent experience. | Must have |

---

## 6. Acceptance Criteria

### US-01: Tap to flap
- [ ] Tapping the canvas applies an upward velocity impulse of -7.0 px/frame to the character
- [ ] Character falls due to gravity (0.4 px/frame^2) when not tapping
- [ ] Character does not rise above the top of the canvas (ceiling collision triggers death)
- [ ] Character does not fall below the bottom of the canvas (floor collision triggers death)
- [ ] Tap input works via both `touchstart` and `mousedown` events
- [ ] Flap animation plays on the character for 300ms after each tap
- [ ] Flap sound effect plays on each tap

### US-02: Scoring
- [ ] Score starts at 0 when a run begins
- [ ] Score increments by 1 when the player character's x-center passes the x-center of an obstacle pair
- [ ] Score display is visible at top-center of the canvas during gameplay
- [ ] Score number plays a pop animation (scale 1.0 -> 1.2 -> 1.0, 150ms) and flashes Electric Lime on each increment
- [ ] A "ding" sound plays on each score increment

### US-03: Instant restart
- [ ] Tapping "run it back" on the game-over screen restarts gameplay within 500ms
- [ ] Score resets to 0 on restart
- [ ] Obstacles are cleared and regenerated from scratch
- [ ] Character position resets to starting position (x=80, y=canvas midpoint)
- [ ] No page reload occurs -- state resets in memory

### US-04: Death messages
- [ ] A death message from the correct score tier appears on every game-over screen
- [ ] Messages are randomly selected from the tier pool (no two consecutive identical messages)
- [ ] Messages are displayed in Space Grotesk, --text-md, Text Secondary color

### US-05: Score sharing
- [ ] A "flex this" button appears on the game-over screen
- [ ] Tapping the button triggers the Web Share API (if available) with text: `i got [SCORE] in FLAPPY TRALALERO\n[URL]`
- [ ] If Web Share API is unavailable, the share text is copied to clipboard and a toast reads "copied to clipboard"
- [ ] The share URL is `https://brainrotgames.com/games/game-01/`

### US-06: Score persistence
- [ ] High score is stored in `localStorage` under key `flappy-tralalero-highscore`
- [ ] High score is loaded on game init and displayed on the game-over screen as "best: [N]"
- [ ] When a new high score is achieved, the stored value updates and "NEW HIGH SCORE" text appears with pulse animation in Brainrot Yellow
- [ ] If localStorage is unavailable, the game still functions (high score shows as 0, no errors thrown)

### US-07: Character unlocks
- [ ] Unlock conditions are checked on every game-over (comparing run score to thresholds)
- [ ] Newly unlocked characters trigger a notification on the game-over screen
- [ ] Unlock state persists in `localStorage` under key `flappy-tralalero-unlocks`
- [ ] Locked characters appear as silhouettes on the character select screen
- [ ] Selecting an unlocked character changes the player sprite and associated sounds for the next run
- [ ] La Vaca Saturno Saturnita unlocks when the title text is tapped 10 times (tracked per session, resets on page reload)

### US-08: Responsive canvas
- [ ] The canvas scales to fill the viewport width up to a maximum of 480px
- [ ] The canvas maintains a 9:16 aspect ratio (360:640 logical)
- [ ] The game is playable on screens as small as 320px wide
- [ ] All tap targets (buttons) are at least 48px tall
- [ ] Canvas rendering uses `devicePixelRatio` scaling for sharp rendering on high-DPI screens
- [ ] No horizontal scrollbar appears at any viewport size

---

## 7. Technical Spec

### 7.1 Canvas Size and Scaling

| Property | Value |
|----------|-------|
| **Logical width** | 360 px |
| **Logical height** | 640 px |
| **Aspect ratio** | 9:16 (0.5625) |
| **Max display width** | 480 px (`--max-width-game` from design system) |
| **Scaling approach** | CSS sets canvas display size to `min(100vw, 480px)` width and `height: auto`. Canvas internal resolution is `360 * devicePixelRatio` x `640 * devicePixelRatio`. `ctx.scale(dpr, dpr)` applied once on init. All game logic uses the 360x640 logical coordinate system. |

**Responsive behavior:**
- On phones (< 480px wide): Canvas fills the full viewport width. Height determined by aspect ratio. If viewport is shorter than the canvas (landscape orientation), the canvas shrinks to fit height and centers horizontally.
- On tablets/desktop (>= 480px): Canvas is 480px wide, centered on screen with Void-colored background on either side.

### 7.2 Game State Machine

```
                    +--------+
          +---------+  MENU  +<----------+
          |         +----+---+           |
          |  (tap start) |               |
          |              v               |
          |         +--------+           |
          |         | READY  |           |
          |         +----+---+           |
          |  (first tap) |               |
          |              v               |
          |        +---------+           |
          |        | PLAYING |           |
          |        +----+----+           |
          |  (collision) |               |
          |              v               |
          |       +-----------+          |
          +-------+ GAME_OVER +----------+
           (menu)  +----------+ (retry)
```

States:
- **MENU**: Title screen visible. Canvas draws idle character + background. Listens for "start game" tap.
- **READY**: Gameplay view visible. Character hovers at start position. "tap to flap" text visible. Obstacles not moving. Waits for first tap.
- **PLAYING**: Game loop active. Physics, obstacles, scoring, collision all running. Listens for tap input.
- **GAME_OVER**: Overlay visible. Score displayed. Listens for retry or menu tap.

No pause state. Flappy Bird games don't need pause -- runs are 15-45 seconds. Reducing scope.

### 7.3 File Structure

```
games/game-01/
  index.html          -- Entry point. Loads CSS + JS. Contains canvas element and UI overlay divs.
  style.css           -- Game-specific CSS (imports design-system.css). Overlay positioning, canvas sizing.
  js/
    main.js           -- Entry point. Initializes canvas, state machine, game loop. Wires up input.
    game.js           -- Core game class. Update + render loop. Owns state machine transitions.
    player.js         -- Player entity. Position, velocity, physics, hitbox, draw method, animation state.
    obstacle.js       -- Obstacle pair entity. Position, gap, type, draw method, scroll logic.
    background.js     -- Parallax background. Three layers, scroll speeds, biome tinting.
    characters.js     -- Character definitions. Array of 7 objects with draw functions, sounds, unlock conditions.
    audio.js          -- Web Audio API wrapper. Sound effect functions. Master volume, mute toggle.
    ui.js             -- DOM-based UI. Menu screen, game-over overlay, character select, share button, toasts.
    storage.js        -- localStorage wrapper. High score, unlocks, volume, mute state. Graceful fallback.
    constants.js      -- All magic numbers. Physics values, colors, dimensions, score thresholds, messages.
```

**Total: 1 HTML + 1 CSS + 10 JS files.**

Each JS file is a module (`type="module"` on the script tag in `index.html`). No build step. No bundler. Raw ES modules loaded by the browser.

### 7.4 Entity Model

#### Player

```
class Player {
  // Properties
  x: number           // Fixed at 80 (logical px)
  y: number           // Vertical position (starts at canvasHeight / 2)
  width: number       // Hitbox width: 30
  height: number      // Hitbox height: 30
  velocity: number    // Current vertical velocity (px/frame, positive = down)
  rotation: number    // Visual rotation in degrees, derived from velocity
  character: string   // Current character ID (e.g., "tralalero")
  animFrame: number   // Current animation frame (0-2 for flap cycle)
  animTimer: number   // ms since last frame change
  alive: boolean      // false after collision

  // Methods
  flap()              // Set velocity to TAP_IMPULSE, reset animFrame to 0, play flap sound
  update(dt)          // Apply gravity, clamp velocity, update position, update rotation, advance animation
  draw(ctx)           // Delegate to character-specific draw function from characters.js
  reset()             // Reset position, velocity, rotation, alive state for new run
  getHitbox()         // Returns {x, y, width, height} for collision checks (centered on visual)
}
```

#### Obstacle (one pair = one instance)

```
class Obstacle {
  // Properties
  x: number           // Horizontal position (starts off-screen right at canvasWidth + 60)
  gapY: number        // Center Y of the gap
  gapSize: number     // Height of the gap in px
  width: number       // Always 60
  type: string        // One of: "bombardiro", "mewing", "skibidi", "ohio", "fanum"
  scored: boolean     // Has this obstacle already been scored (prevents double-count)

  // Methods
  update(dt, speed)   // Move left by speed * dt. Mark for removal when x < -width.
  draw(ctx)           // Draw top and bottom obstacle based on type. Top: rect from y=0 to gapY - gapSize/2. Bottom: rect from gapY + gapSize/2 to canvasHeight.
  getTopHitbox()      // Returns {x, y: 0, width, height: gapY - gapSize/2}
  getBottomHitbox()   // Returns {x, y: gapY + gapSize/2, width, height: canvasHeight - (gapY + gapSize/2)}
}
```

#### Background

```
class Background {
  // Properties
  layers: Array<{offset: number, speed: number, drawFn: Function}>
  biome: number       // Current biome index (0-4), derived from score

  // Methods
  update(dt, speed)   // Scroll each layer by its speed ratio * base speed * dt. Wrap offset at tile width.
  draw(ctx)           // Draw each layer. Layer 1 (far) first, then layer 2 (mid). Layer 3 is the floor only.
  setBiome(score)     // Calculate biome from score. Transition tint colors over 2 seconds if biome changed.
}
```

#### ScoreDisplay

```
class ScoreDisplay {
  // Properties
  score: number
  displayScore: number  // For count-up animation on game-over
  popTimer: number      // Remaining ms of pop animation
  flashTimer: number    // Remaining ms of lime flash

  // Methods
  increment()           // score++, trigger pop and flash timers, play ding sound
  update(dt)            // Decay pop and flash timers. On game-over, animate displayScore toward score.
  draw(ctx)             // Draw score number at top-center. Apply scale transform if popTimer > 0. Apply lime color if flashTimer > 0.
  reset()               // Score = 0, displayScore = 0, clear timers
}
```

### 7.5 Sprite Approach

All characters and obstacles are drawn with Canvas 2D primitives:
- `fillRect`, `strokeRect` for rectangular shapes
- `arc`, `ellipse` for circular/rounded shapes
- `beginPath`, `moveTo`, `lineTo`, `closePath`, `fill` for triangles and custom polygons
- `ctx.save()` / `ctx.restore()` with `ctx.translate()` and `ctx.rotate()` for character rotation

No sprite sheets. No image loading. No emoji rendering (removed to keep cross-platform consistency). This means:
- Zero asset loading time
- No CORS issues
- Consistent rendering across all browsers and devices
- Easy to modify character designs by changing draw function parameters

### 7.6 Audio Approach

**Web Audio API oscillator synthesis.** All sounds generated at runtime. No audio files.

Architecture:
```
AudioManager (singleton)
  audioCtx: AudioContext     // Created on first user gesture
  masterGain: GainNode       // Connected to audioCtx.destination
  muted: boolean

  playFlap(character)        // Create oscillator, apply character-specific params, connect to masterGain, start, stop after duration
  playScore()                // Two-tone rising ding
  playDeath(character)       // Thud + character voice
  playUIClick()              // Menu blip
  playHighScore()            // Arpeggio
  playUnlock()               // Rich arpeggio

  setVolume(val)             // Set masterGain.gain.value, persist to localStorage
  toggleMute()               // Toggle muted, persist to localStorage
  resume()                   // Call audioCtx.resume() (for browsers that suspend context)
```

Each `play*` method creates fresh oscillator nodes (they're lightweight and auto-garbage-collected after stopping). No pooling needed for a game with this few simultaneous sounds.

### 7.7 Score Persistence

| localStorage Key | Type | Default | Description |
|-----------------|------|---------|-------------|
| `flappy-tralalero-highscore` | `number` (stored as string) | `0` | All-time high score |
| `flappy-tralalero-unlocks` | `JSON string` | `{"tralalero":true,"bombardiro":false,"lirili":false,"tungtung":false,"cappuccino":false,"brrbrr":false,"lavaca":false}` | Character unlock states |
| `flappy-tralalero-selected` | `string` | `"tralalero"` | Currently selected character ID |
| `flappy-tralalero-volume` | `number` (stored as string) | `0.5` | Master volume (0.0 - 1.0) |
| `flappy-tralalero-muted` | `boolean` (stored as string) | `"false"` | Mute state |
| `flappy-tralalero-deaths` | `number` (stored as string) | `0` | Total death count (for ad frequency and Brr Brr Patapim unlock) |
| `flappy-tralalero-ad-views` | `number` (stored as string) | `0` | Rewarded ad views count (for Brr Brr Patapim unlock -- 5 needed) |

All reads wrapped in try/catch. If localStorage is unavailable (private browsing, storage full), the game functions with in-memory defaults. No errors surfaced to the player.

### 7.8 Responsive Strategy

```
// On init and on window resize:
const maxWidth = 480;
const aspectRatio = 640 / 360; // 1.778
const dpr = window.devicePixelRatio || 1;

let displayWidth = Math.min(window.innerWidth, maxWidth);
let displayHeight = displayWidth * aspectRatio;

// If taller than viewport, constrain by height
if (displayHeight > window.innerHeight) {
  displayHeight = window.innerHeight;
  displayWidth = displayHeight / aspectRatio;
}

canvas.style.width = displayWidth + 'px';
canvas.style.height = displayHeight + 'px';
canvas.width = 360 * dpr;
canvas.height = 640 * dpr;
ctx.scale(dpr, dpr);
```

All game logic operates in the 360x640 logical space. Input coordinates are converted from screen space to logical space:

```
function getLogicalPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches ? event.touches[0] : event;
  return {
    x: (touch.clientX - rect.left) * (360 / rect.width),
    y: (touch.clientY - rect.top) * (640 / rect.height)
  };
}
```

---

## 8. Monetization Hooks

### Interstitial Ads

**Trigger:** Every 3rd death. Tracked via an in-memory counter (`deathsSinceLastAd`), reset to 0 after showing an ad.

**Placement:** After the death animation completes (200ms) and BEFORE the game-over overlay appears. The ad provider's interstitial takes over the screen. On ad close/skip, the game-over overlay appears normally.

**Frequency math:** Average attempt is 15 seconds. Every 3rd death = one ad per ~45 seconds of play. A 5-minute session = ~6-7 ad impressions.

**Implementation stub:** The game calls `window.showInterstitialAd()` (a function the ad SDK will provide). If the function doesn't exist or fails, the game-over overlay appears immediately. The game never breaks because of ad infrastructure.

### Rewarded Video (Future -- Out of Scope for v1)

**Design spec for future implementation:**
- "Continue" option on game-over: "watch ad to continue from where you died." One continue per run.
- "Unlock character" option on character select: "watch 3 ads to unlock [character]." Alternative to score-based unlock.
- Brr Brr Patapim requires 5 rewarded ad views (tracked in localStorage).

These are designed but not implemented in v1. The UI space for the "continue" button is reserved in the game-over layout (between the score and the action buttons).

---

## 9. Social Sharing

### Share Button

Located on the game-over overlay. Primary button style. Label: "flex this."

**Implementation:**

```javascript
async function shareScore(score, url) {
  const text = `i got ${score} in FLAPPY TRALALERO\n${url}`;

  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      trackEvent('share_click', { method: 'native', score });
    } catch (e) {
      // User cancelled -- not an error
    }
  } else {
    await navigator.clipboard.writeText(text);
    showToast('copied to clipboard');
    trackEvent('share_click', { method: 'clipboard', score });
  }
}
```

### Share Text Template

```
i got [SCORE] in FLAPPY TRALALERO
https://brainrotgames.com/games/game-01/
```

Lowercase. No emoji. Matches brand voice (deadpan, short, assumes the reader knows what Tralalero is).

### Score Card (Future -- Out of Scope for v1)

**Design spec for future implementation:** A canvas-rendered image (1080x1920, story format) with:
- Dark background (`#0a0a0f`)
- "FLAPPY TRALALERO" title in Italian Red
- Score in Bungee, Electric Lime, giant
- Character graphic
- Death message
- "BRAINROT GAMES" watermark
- Shareable via Web Share API `files` parameter

Not in v1 because image generation adds complexity. The text share is sufficient for launch.

---

## 10. Analytics Events

All events fire to a `trackEvent(name, properties)` function in `main.js`. The implementation of `trackEvent` is a stub in v1 (console.log). The ad/analytics SDK will replace it.

| Event Name | Properties | When Fired |
|------------|-----------|------------|
| `game_start` | `{ character: string }` | Player transitions from READY to PLAYING (first tap) |
| `game_over` | `{ score: number, character: string, highScore: number, isNewHighScore: boolean, obstacleType: string }` | Collision detected |
| `share_click` | `{ method: "native" \| "clipboard", score: number }` | Share button tapped |
| `character_select` | `{ character: string, wasLocked: boolean }` | Player selects a character on the menu |
| `character_unlock` | `{ character: string, method: "score" \| "ad" \| "easter_egg" }` | Character unlock condition met |
| `ad_shown` | `{ type: "interstitial", deathCount: number }` | Ad displayed |
| `menu_view` | `{}` | Menu screen shown (including on page load) |
| `retry` | `{ previousScore: number }` | "run it back" tapped |

---

## 11. Scope Boundaries

### In Scope (v1 ship)

- Core Flappy Bird gameplay: gravity, tap-to-flap, obstacle scrolling, collision, scoring
- Tralalero Tralala as default playable character (fully drawn with Canvas primitives)
- 2 additional launch characters: Bombardiro Crocodilo (unlock at score 10) and Lirili Larila (unlock at score 25) -- the rest unlock but the draw functions can ship as simplified silhouettes/shapes in v1
- 5 obstacle visual types (all with AABB hitbox)
- 3-layer parallax background with biome tinting
- Difficulty progression (speed, gap, spacing scaling with score)
- Game-over overlay with score, high score, death message, share button, retry
- Score persistence (localStorage)
- Character unlock persistence (localStorage)
- Social sharing (Web Share API with clipboard fallback)
- Responsive canvas scaling (320px to 480px wide)
- Interstitial ad hook (stub function, every 3rd death)
- Analytics event stubs (console.log)
- Italian brainrot theme (Italian Red accent, brainrot death messages, themed obstacles)

### Out of Scope (v1)

| Feature | Why Deferred |
|---------|-------------|
| **Sound/audio** | Nice to have. The game is fully playable without sound. Audio implementation (Web Audio API oscillators) is designed in this doc and ready to build, but the developer should ship gameplay first and layer sound in as a fast-follow if time permits. Not blocking launch. |
| **Leaderboards** | Requires backend. v1 is static files only. Future consideration with a serverless function. |
| **User accounts** | Same as leaderboards. Not needed for core loop. |
| **Multiplayer** | Not applicable to Flappy Bird mechanic. |
| **Score card image generation** | Canvas-to-image adds complexity. Text share is sufficient for launch. |
| **Rewarded video ads** | Requires ad SDK integration. Interstitial stub is enough for v1. |
| **Background music** | Lower priority than SFX. Can be added later as a looping oscillator pattern. |
| **Animated obstacle parts** | Bombardiro jaws snapping, Fanum hands reaching. v1 obstacles are static. Moving parts are a polish pass. |
| **Cross-game unlocks** | Requires a shared unlock system across game-01 and game-02. Design later when both games ship. |

---

## 12. Shared Infrastructure Usage

The game uses utilities from `games/shared/` to avoid reinventing common patterns. These shared modules are designed to be used across all Brainrot Games titles.

| Module | Path | Usage in Flappy Tralalero |
|--------|------|--------------------------|
| **game-shell** | `games/shared/game-shell.js` | State machine framework. Provides `GameShell` class with `setState(name)`, `onEnter(state, fn)`, `onUpdate(state, fn)`, `onRender(state, fn)` hooks. Flappy Tralalero registers 4 states: `menu`, `ready`, `playing`, `gameover`. The shell owns the `requestAnimationFrame` loop and delta-time calculation. |
| **input-manager** | `games/shared/input-manager.js` | Unified input handling. Normalizes `touchstart`, `mousedown`, and `keydown` (spacebar) into a single `onTap(callback)` interface. Handles coordinate conversion from screen space to logical canvas space. Prevents default on touch events to avoid scroll/zoom. |
| **collision** | `games/shared/collision.js` | AABB collision detection utility. Exports `aabbCollides(a, b)` taking two `{x, y, width, height}` objects. Used for player-vs-obstacle and player-vs-bounds checks. |
| **score-manager** | `games/shared/score-manager.js` | localStorage wrapper for score persistence. Exports `ScoreManager` class with `getHighScore(gameId)`, `setHighScore(gameId, score)`, `getUnlocks(gameId)`, `setUnlock(gameId, characterId)`. Handles try/catch, JSON parsing, and graceful fallback. All localStorage keys are namespaced by `gameId` (e.g., `flappy-tralalero-highscore`). |
| **share** | `games/shared/share.js` | Share utility. Exports `shareScore({ text, url })` which tries `navigator.share()` first, falls back to `navigator.clipboard.writeText()`, and returns `{ method: "native" \| "clipboard" \| "failed" }`. |
| **analytics** | `games/shared/analytics.js` | Analytics stub. Exports `trackEvent(name, properties)` which logs to console in dev. The ad/analytics SDK replaces this function at integration time. |

**Game-specific code** (player, obstacles, characters, background, audio, UI) lives entirely in `games/game-01/js/`. Shared modules are imported via relative path: `import { GameShell } from '../../shared/game-shell.js'`.

---

## Open Questions

None blocking. The following are noted for future consideration but do not require answers before development begins:

1. **Ad SDK selection:** Which ad provider (AdSense, AdMob web, GameDistribution)? The interstitial hook is provider-agnostic -- just a function call. Decision can be made post-ship.
2. **Domain and hosting:** Is the game served from `brainrotgames.com/games/game-01/` or a subdomain? Affects share URL. Defaulting to the path-based URL per `index.html` link structure.
3. **Cross-game character unlocks:** The concept doc mentions unlocking characters across games. This requires a shared localStorage schema or a lightweight backend. Deferring to when game-02 ships.

---

*This document is the single source of truth for Flappy Tralalero development. A developer should be able to build the complete game from this spec without asking questions. If something is ambiguous, the simplest interpretation is correct.*
