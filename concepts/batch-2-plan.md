# Batch 2 Plan -- Games 06, 07, 08
## April 2026

---

## Selection Rationale

### Catalog Analysis (Games 01-05)

| Mechanic | Feel | Input Type | Pacing |
|----------|------|-----------|--------|
| Flappy Bird | Timing / reflex | Tap | Frenetic, instant death |
| Whack-a-Mole | Reaction / target-hit | Tap | Fast bursts, timed |
| Idle Clicker | Passive / upgrade | Tap + menu | Slow, ambient |
| Endless Runner | Dodge / survive | Swipe / tap | Accelerating |
| Stack | Precision / timing | Tap | Rhythmic, steady |

**What is missing from the catalog:**
1. **Directional control** -- every game so far is tap-only. No game lets the player steer something around a 2D space.
2. **Puzzle / cognitive** -- everything is reflex-based. No game makes you think.
3. **Destruction / slicing** -- everything is about surviving or building. No game lets you destroy things satisfyingly.

### Mechanic Selections

| Game | Base Mechanic | Why | Complexity |
|------|---------------|-----|-----------|
| 06 | **Snake** | First directional-control game. Player steers in 2D. Self-generated difficulty. Universal recognition. | 1/5 |
| 07 | **2048** | First puzzle game. Cognitive engagement, longer sessions, zero reflex pressure. Proven meme-reskin potential (Doge 2048). | 2/5 |
| 08 | **Fruit Ninja** | First destruction game. Swipe input is completely new to the catalog. Tactile satisfaction, combo-chasing. | 3/5 |

### Theme Distribution After Batch 2

| Theme | Games 01-05 | Batch 2 Appearances | New Total |
|-------|-------------|---------------------|-----------|
| Italian Brainrot | 4 | 1 (Game 07) | 5 -- flagship, always present |
| Sigma/Rizz/Mewing | 3 | 0 | 3 -- already well-represented |
| Skibidi | 2 | 1 (Game 08) | 3 |
| Ohio | 1 | 1 (Game 06) | 2 |
| Fanum Tax | 1 | 1 (Game 06) | 2 |
| Among Us | 1 | 1 (Game 07) | 2 |
| **Aura Points** | 0 (label only) | **1 (Game 08)** | **1 -- finally a real theme** |
| **Grimace Shake** | 0 | **1 (Game 06)** | **1 -- debut** |

This achieves the objective of featuring every underused theme at least once while keeping Italian Brainrot as the constant anchor.

---

## Game 06: FANUM SNAKE

### Base Mechanic
**Snake** -- grow while avoiding yourself and walls.

### Why This Mechanic Next
Every game in the catalog is tap-to-do-one-thing. Snake is the first game where the player has **directional control** -- swipe or arrow keys to steer a continuously-moving entity around a 2D grid. It introduces spatial awareness, pathfinding instinct, and the uniquely cruel dynamic where **your own success creates your obstacles** (longer snake = less room). This is a fundamentally different play feel from anything in the catalog.

Complexity is 1/5 -- grid-based movement, array-based body tracking, simple collision. One of the easiest Canvas games to implement.

### 3 Theme Variants

---

#### Variant A: FANUM TAX (primary)

**Concept:** You are the Fanum Tax collector -- a hungry mouth snake slithering around a kitchen/party, eating everyone's food before they notice. Your tail is a trail of stolen food items. The longer your trail of stolen goods, the more likely you are to trip over your own loot and get caught.

**Currency/Score Label:** STOLEN BITES

**Visual Description:**
- **Player (snake head):** Round head with a wide grinning mouth, small beady eyes, wearing a backwards cap. Drawn as a circle with arc-mouth and two dot-eyes. ~20 lines of Canvas.
- **Snake body segments:** Each segment is a different stolen food item rendered as simple shapes -- pizza slice (triangle + circle), burger (stacked rectangles), fries (yellow rectangles), drink cup (trapezoid), donut (torus). Segments alternate through the food types. ~30 lines total for 5 food shapes.
- **Food pickups (spawned items):** The same food items but with a glow ring around them, sitting on small plate circles.
- **Walls/border:** Kitchen counter tile pattern -- simple alternating light/dark gray rectangles.
- **Background:** Dark kitchen surface (#1a1a2e) with subtle grid lines.

**Color Palette:**
- Background: `#1a1a2e` (dark navy kitchen)
- Grid lines: `#2a2a3e`
- Snake head: `#ff9800` (orange) with `#ffffff` eyes
- Food items: `#ff5252` (pizza), `#ffb74d` (burger), `#fff176` (fries), `#4fc3f7` (drink), `#f48fb1` (donut)
- Accent: `#ff6b2b`
- Score text: `#ff9800`

**5 Death/Game-Over Messages:**
1. "you got caught stealing food. fanum tax denied."
2. "tripped over your own stolen pizza. embarrassing."
3. "the food trail was too long. greed is your downfall."
4. "someone noticed their burger was missing."
5. "fanum tax audit complete. you failed."

---

#### Variant B: GRIMACE SNAKE

**Concept:** You are the Grimace Shake -- a big purple blob snake slithering through a cursed McDonald's, consuming milkshakes. Your body is a chain of increasingly cursed purple shake cups. The longer you get, the more cursed and glitchy the screen becomes (subtle screen shake, color aberration on the border). The "grimace shake challenge" aesthetic -- something is deeply wrong.

**Currency/Score Label:** SHAKES CONSUMED

**Visual Description:**
- **Player (snake head):** Large purple circle with a wide, unsettling smile (arc), two big white eyes with tiny pupils. Simple but creepy-cute. ~15 lines of Canvas.
- **Snake body segments:** Purple milkshake cups -- trapezoid body, dome top, straw line poking out. Each subsequent segment slightly darker purple (gets more "cursed" as the chain grows). ~15 lines per segment template.
- **Food pickups:** Milkshake cups with swirl effect (concentric circles) and a pulsing glow.
- **Walls/border:** McDonald's-style red and yellow striped border, but the colors get increasingly desaturated the longer the snake is (the curse spreads).
- **Background:** Dark purple-black (`#1a0a1e`) with faint golden arches shapes drawn as decorative background elements.

**Color Palette:**
- Background: `#1a0a1e` (deep cursed purple)
- Grid lines: `#2a1a2e`
- Snake head: `#7b1fa2` (grimace purple) with `#ffffff` eyes
- Body segments: gradient from `#7b1fa2` to `#4a0072`
- Food: `#ce93d8` (light purple shake)
- Border: `#d32f2f` / `#fdd835` (McDonald's red/yellow)
- Accent: `#7b1fa2`

**5 Death/Game-Over Messages:**
1. "the grimace shake got you in the end."
2. "you choked on your own cursed trail."
3. "the shake was not worth it. it never was."
4. "grimace consumed himself. poetic."
5. "another one lost to the purple curse."

---

#### Variant C: OHIO SNAKE

**Concept:** You are a sentient Ohio cornstalk snaking through a cursed Ohio landscape, eating mutant corn kernels to grow longer. The background is a flat, eerie Ohio field. Obstacles on the grid include random "only in Ohio" hazards -- floating portals, mysterious fog patches, corn maze walls. The vibe is desolate, absurd, and slightly ominous.

**Currency/Score Label:** CORN CONSUMED

**Visual Description:**
- **Player (snake head):** Corn cob with a face -- elongated yellow oval, two rows of kernel bumps (small circles), angry eyebrows, determined expression. ~20 lines of Canvas.
- **Snake body segments:** Individual corn kernels, each a rounded yellow rectangle with a subtle highlight. Clean, simple.
- **Food pickups:** Glowing mutant corn kernels -- bright green or purple (mutant colors) with small radiation lines around them.
- **Walls/border:** Cornfield fence posts -- brown vertical lines with horizontal wire.
- **Background:** Dark desaturated green-brown (`#1a2a1a`) Ohio field. Subtle fog overlay (semi-transparent white gradient at edges).

**Color Palette:**
- Background: `#1a2a1a` (dark Ohio field)
- Grid lines: `#2a3a2a`
- Snake head: `#fdd835` (corn yellow) with `#2e1a00` eyes
- Body segments: `#f9a825` (darker corn)
- Mutant food: `#76ff03` (radioactive green)
- Accent: `#ff6b2b` (Ohio orange)
- Fog: `rgba(200, 200, 200, 0.05)`

**5 Death/Game-Over Messages:**
1. "only in ohio do the cornstalks eat themselves."
2. "ohio is undefeated. even the corn loses."
3. "the ohio curse claimed another crop."
4. "you got lost in the ohio corn maze. forever."
5. "average tuesday in an ohio cornfield."

---

### Core Loop (every 5-10 seconds)
Player swipes or presses arrow keys to change the snake's direction. The snake moves forward one grid cell per tick (~150ms at start, faster as score increases). A food item sits on a random empty cell. Player steers toward it, eats it (score +1, body grows by one segment), a new food spawns. Player must avoid hitting their own growing body or the grid walls. Every ~10 food items, the tick rate decreases by 10ms (snake speeds up). The tension is the shrinking safe space as the body fills the grid.

### Difficulty Curve
| Score Range | Tick Interval | What Changes |
|-------------|--------------|--------------|
| 0-9 | 150ms | Learning phase. Grid feels spacious. |
| 10-19 | 135ms | Noticeable speed bump. Body is getting in the way. |
| 20-29 | 120ms | Medium difficulty. Strategic pathing required. |
| 30-39 | 105ms | Fast. Mistakes are costly. |
| 40-49 | 90ms | Very fast. Only deliberate paths work. |
| 50+ | 80ms (floor) | Max speed. The grid is half-full. Survival mode. |

### Estimated Build Complexity: 1/5
Grid-based movement eliminates continuous physics. Snake body is a simple array (push head, pop tail). Collision is head-position vs. body-array lookup. Food spawn is random-empty-cell. The draw loop iterates the body array and renders each segment. Total core logic: ~150 lines.

### Key Canvas Drawing Notes
- **Grid:** 18x18 cells on a 360x640 canvas = 20px cells, grid occupies rows 2-19 (leaving top rows for HUD). Draw grid lines with `ctx.strokeStyle` at low opacity.
- **Snake head:** Each theme has a `drawHead(ctx, x, y, cellSize, direction)` function. Direction enum (up/down/left/right) rotates the face. ~15-25 lines per theme.
- **Snake body segments:** Each theme has a `drawSegment(ctx, x, y, cellSize, index)` function. Index determines which food-item variant to draw for Fanum, shade for Grimace, etc.
- **Food pickup:** `drawFood(ctx, x, y, cellSize, frame)` with a pulsing glow effect (sin-wave alpha on an outer circle).
- **Grid border:** `drawBorder(ctx, width, height)` for the themed wall.
- **Animations:** Minimal. Head slight bob on eat (scale tween). Score float text on eat. Screen flash on death. No complex sprite animation.

### How It Uses Shared Infrastructure
- **GameShell:** Standard 3-state machine (menu -> playing -> game-over). `onStart` resets snake to center, spawns first food. `onUpdate` handles tick timing and movement. `onRender` draws grid + snake + food + HUD.
- **InputManager:** Uses swipe detection (already supports swipe via touch start/end delta) for mobile. Arrow keys for desktop. Maps swipe direction to snake direction change. Ignores reverse-direction input (can't turn 180 degrees).
- **ScoreManager:** High score per theme variant, stored as `fanum-snake-{themeId}`.
- **SoundManager:** Eat sound (short rising tone), death sound (descending buzz), direction-change click (subtle tick).
- **Share:** Score card: "{themeName} -- {score} STOLEN BITES / SHAKES CONSUMED / CORN CONSUMED -- brainrotgames.io/snake"

---

## Game 07: BRAINROT 2048

### Base Mechanic
**2048** -- slide tiles on a 4x4 grid to merge matching pairs. 2+2=4, 4+4=8, etc. Reach 2048 to win. No valid moves remaining = game over.

### Why This Mechanic Next
This is the first **puzzle / cognitive** game in the catalog. Every existing game is reflex-based (tap fast, react fast, time it right). 2048 requires strategic thinking, spatial planning, and patience. It produces the longest average sessions (8-15 minutes vs. 1-4 minutes for reflex games) -- this is important for engagement metrics and ad revenue per session. It also opens a completely different mood: contemplative instead of frantic.

The meme-reskin angle is proven. Doge 2048 got millions of plays by simply putting Doge faces on the tiles. Our version makes each tile a progressively more powerful brainrot character, turning the merge tree into a collectible discovery mechanic ("what character is the 2048 tile?!").

Complexity is 2/5 -- the 4x4 grid logic and merge algorithm require careful state management but no physics, no real-time collision, no continuous rendering. The slide animation is the most complex visual element.

### 3 Theme Variants

---

#### Variant A: ITALIAN BRAINROT 2048 (primary)

**Concept:** Each tile is an Italian brainrot character. Merging two of the same character evolves them into a more powerful, more absurd character. The progression is a tier list of the Italian brainrot universe -- starting from a basic "Tung Tung Tung Sahur" (value 2) and merging your way up to the legendary "Tralalero Tralala" (value 2048). Each merge is a character reveal moment. The tile art for each tier is a simple Canvas portrait of the character.

**Currency/Score Label:** BRAINROT LEVEL

**Tile Progression (value -> character):**
| Tile Value | Character | Visual (Canvas) |
|-----------|-----------|-----------------|
| 2 | Tung Tung Tung Sahur | Small drum shape, two dot eyes |
| 4 | Lirili Larila | Butterfly wings (two triangles), round head |
| 8 | Spongebobini Squarepantaloni | Yellow square, big eyes, Italian mustache |
| 16 | Bombombini Gusini | Goose shape (oval body, long neck), bomb fuse on head |
| 32 | Cappuccino Assassino | Coffee cup shape, angry eyes, knife line |
| 64 | La Vaca Saturno Saturnita | Cow (oval body, horns, Saturn ring around it) |
| 128 | Glorbo Fruttodrago | Dragon head (triangles for horns, flame arc) |
| 256 | Chimpanzini Bananini | Monkey circle face, banana on head |
| 512 | Bombardiro Crocodilo | Crocodile snout (long rectangle), airplane wings |
| 1024 | Brr Brr Patapim | Refrigerator rectangle, legs, face |
| 2048 | Tralalero Tralala | Shark fin, muscular arms (rectangles), sneakers |

**Visual Description:**
- **Tiles:** Rounded rectangles with background color intensity increasing with value. Each tile contains a ~30x30px character face drawn with Canvas primitives (circles, rectangles, arcs, lines). Characters are deliberately crude -- 10-15 lines of draw code per character.
- **Board:** 4x4 grid with dark rounded-rectangle cells. Thin gap between cells.
- **Background:** Deep dark navy (`#0d1117`) with subtle Italian flag stripe accents (green-white-red) as thin horizontal lines at top and bottom of the board.

**Color Palette:**
- Background: `#0d1117`
- Board bg: `#1a1a2e`
- Cell empty: `#2a2a3e`
- Tile colors by tier: `#4a3728` (2) -> `#5a4030` (4) -> `#6b4f2a` (8) -> `#8b6914` (16) -> `#a67c00` (32) -> `#c89b3c` (64) -> `#e6b800` (128) -> `#ffd700` (256) -> `#ff9800` (512) -> `#ff5722` (1024) -> `#c8ff00` (2048 -- the site accent)
- Text: `#f0f0f0`
- Accent: `#c8ff00`

**5 Death/Game-Over Messages:**
1. "the brainrot consumed all available brain cells."
2. "no more room for characters. the lore is complete."
3. "your brainrot universe collapsed under its own weight."
4. "even tralalero couldn't save this board."
5. "game over. touch grass. (you won't.)"

---

#### Variant B: AMONG US 2048

**Concept:** Each tile is a crewmate in a different SUS level. Merging two crewmates makes them progressively more suspicious until the 2048 tile is THE IMPOSTOR. The tile characters go from "not sus" (plain crewmate) to "mega sus" (red crewmate with knife). Every merge is an escalation of sus-ness. Tiles occasionally get a "?" overlay when adjacent to a high-value tile (suspicion spreading).

**Currency/Score Label:** SUS LEVEL

**Tile Progression (value -> sus level):**
| Tile Value | Character | Visual |
|-----------|-----------|--------|
| 2 | Innocent Crewmate | Simple bean shape, visor, white |
| 4 | Slightly Nervous | Bean shape, visor, sweat drop |
| 8 | Side-Eye Crewmate | Bean shape, visor shifted to one side |
| 16 | Hiding Crewmate | Bean shape partially behind a vent rectangle |
| 32 | Sweating Hard | Bean with multiple sweat drops, red tint starting |
| 64 | Fake Tasking | Bean next to a task panel (small rectangle), looking away |
| 128 | Caught Venting | Bean halfway in vent, exclamation mark |
| 256 | Self-Report | Bean next to a dead bean (X eyes) |
| 512 | Double Kill | Bean with two dead beans nearby |
| 1024 | Mega Sus | Red bean, glowing eyes, knife shape visible |
| 2048 | THE IMPOSTOR | Red bean, full knife, evil grin arc, "SUS" text floating |

**Visual Description:**
- **Crewmate shape:** Rounded rectangle body (bean), rectangular visor, small backpack bump. ~8 lines of Canvas. Color shifts from white -> yellow -> orange -> red through the tiers.
- **Board:** Dark spaceship interior. Grid cells look like floor panels (dark gray with subtle rivet dots in corners).
- **Background:** `#0a0a1a` (deep space black) with star dots and a vent grate drawn at the bottom.

**Color Palette:**
- Background: `#0a0a1a`
- Board: `#1a1a2a`
- Cell empty: `#252535`
- Tile colors: `#e0e0e0` (2, white) -> `#c8e6c9` (4, green tint) -> `#fff9c4` (8, yellow) -> `#ffe082` (16) -> `#ffcc02` (32) -> `#ffab40` (64) -> `#ff7043` (128) -> `#ef5350` (256) -> `#e53935` (512) -> `#c62828` (1024) -> `#b71c1c` (2048, blood red)
- Accent: `#ef5350`

**5 Death/Game-Over Messages:**
1. "emergency meeting! your board is dead."
2. "you were the impostor of puzzle games."
3. "ejected. no more moves remaining."
4. "the crewmates voted you out. 0 moves left."
5. "sus level maxed. brain capacity zero."

---

#### Variant C: ITALIAN BRAINROT 2048 -- CROSSOVER (Duo Merge)

Wait, let me reconsider. We already have Italian Brainrot as Variant A. The third theme should be one we're underusing.

#### Variant C: AURA 2048

**Concept:** Every tile is an "Aura Level." Merging tiles increases your aura. The visual metaphor is glowing energy levels -- tiles are concentric circles that get brighter and more complex with each tier. The progression goes from "NPC energy" (value 2, dim gray) to "Main Character Energy" (value 2048, blinding gold with particle effects). This is the mystical/spiritual take on 2048 -- the board feels like a meditation grid.

This is the first time Aura Points is treated as a full THEME, not just a score label.

**Currency/Score Label:** AURA

**Tile Progression (value -> aura level):**
| Tile Value | Aura Level | Visual |
|-----------|-----------|--------|
| 2 | NPC | Dim gray circle, flat, lifeless |
| 4 | Background Character | Slightly brighter circle, faint ring |
| 8 | Side Character | Light blue glow, single ring |
| 16 | Recurring Character | Green glow, double ring |
| 32 | Fan Favorite | Yellow glow, triple ring, small sparkles |
| 64 | Protagonist Energy | Orange glow, pulsing rings |
| 128 | Main Character | Bright gold, radiating lines |
| 256 | Anime Protagonist | Intense gold, spiky aura lines (like DBZ) |
| 512 | Chosen One | White-gold, multiple aura rings, screen-glow effect on tile |
| 1024 | Ascended | Prismatic/rainbow cycling outline, intense center |
| 2048 | GOD-TIER AURA | Full rainbow gradient, particle burst, tile slightly larger than cell |

**Visual Description:**
- **Tiles:** Each tile is a circle (not a character) -- pure energy visualization. Inner circle + outer ring(s) + radial lines for higher tiers. Color and number of rings increase with value. Very clean, minimal, almost meditative.
- **Board:** Black grid with thin gold cell borders. Elegant, sparse.
- **Background:** Pure black (`#0a0a0a`) -- lets the aura colors pop.

**Color Palette:**
- Background: `#0a0a0a`
- Board: `#111111`
- Cell empty: `#1a1a1a`
- Tile colors: `#666666` (2) -> `#888888` (4) -> `#64b5f6` (8) -> `#66bb6a` (16) -> `#fdd835` (32) -> `#ff9800` (64) -> `#ffc107` (128) -> `#ffd700` (256) -> `#ffffcc` (512) -> rainbow cycle (1024) -> rainbow burst (2048)
- Accent: `#ffd700` (gold)

**5 Death/Game-Over Messages:**
1. "aura depleted. you are now an npc."
2. "negative aura detected. seek grass immediately."
3. "the aura grid collapsed. main character arc over."
4. "your rizz could not save your spatial reasoning."
5. "aura check failed. back to background character."

---

### Core Loop (every 5-10 seconds)
Player swipes in one of four directions (or presses arrow keys). All tiles slide in that direction. Matching adjacent tiles merge, doubling their value. A new "2" tile (90% chance) or "4" tile (10% chance) spawns in a random empty cell. Player evaluates the new board state, plans the next swipe. The strategic tension: every swipe spawns a new tile, filling the board. Merges clear space. The player must balance creating merges with not letting the board fill up.

### Difficulty Curve
2048's difficulty is inherent to its mechanics -- no external acceleration needed.

| Phase | Board State | Player Experience |
|-------|-------------|-------------------|
| Opening (0-500 pts) | Mostly empty, small tiles | Low stakes. Learning merge patterns. |
| Midgame (500-5000 pts) | Half full, medium tiles | Strategic decisions start mattering. One bad swipe can trap a high tile. |
| Lategame (5000-20000 pts) | Nearly full, high-value tiles cornered | Every move is critical. One wrong direction can end the game. |
| Endgame (20000+ pts) | Attempting 2048. Board is packed. | Maximum tension. The discovery moment of seeing the 2048 character/aura is the payoff. |

### Estimated Build Complexity: 2/5
The grid logic is the main challenge: implementing the slide-and-merge algorithm correctly (handling cascading merges, preventing double-merges in one swipe). The tile slide animation requires lerping tile positions between frames. No physics, no real-time collision. Total core logic: ~250 lines. Tile animation: ~80 lines. Character draw functions: ~200 lines across all themes.

### Key Canvas Drawing Notes
- **Grid:** 4x4 on 360x640 canvas. Board centered horizontally, positioned in upper-center. Each cell ~80px with 8px gaps. Board total: ~344px wide, ~344px tall. Rounded rectangles for cells and tiles.
- **Tiles:** `drawTile(ctx, x, y, size, value, themeId, animFrame)` dispatches to theme-specific character draw. Each character is 10-20 lines of Canvas primitives -- deliberately crude, charming pixel-art-by-math aesthetic.
- **Slide animation:** Tiles lerp from old position to new position over ~150ms. Use a tween array: `[{fromX, fromY, toX, toY, progress}]`. Render tiles at interpolated position during animation. Block input during animation.
- **Merge animation:** Brief scale-up pulse (1.0 -> 1.2 -> 1.0 over 200ms) when two tiles combine. Plus a floating "+{value}" text that fades upward.
- **New tile spawn:** Fade-in + scale from 0.5 to 1.0 over 150ms.
- **Swipe trail:** No swipe visualization needed (unlike Fruit Ninja). Swipe is input-only.

### How It Uses Shared Infrastructure
- **GameShell:** Standard 3-state machine. `onStart` initializes empty 4x4 grid, spawns two random tiles. `onUpdate` processes queued swipe inputs, runs merge logic, checks win/loss. `onRender` draws board, tiles (with animation interpolation), HUD score.
- **InputManager:** Swipe detection for mobile (threshold 30px to distinguish from accidental touch). Arrow keys for desktop. Input is queued -- swipes during animation are buffered and executed after animation completes.
- **ScoreManager:** High score per theme variant: `brainrot-2048-{themeId}`. Also tracks "highest tile reached" as a secondary stat.
- **SoundManager:** Merge sound (ascending tone, pitch increases with tile value). Slide sound (soft whoosh). New tile spawn (subtle plop). Win fanfare (ascending arpeggio). Loss sound (descending).
- **Share:** Score card includes highest tile character name: "BRAINROT 2048 -- reached Bombardiro Crocodilo (512) -- 12,480 BRAINROT LEVEL -- brainrotgames.io/2048". The character name in the share text is the viral hook -- people will want to reach higher characters.

---

## Game 08: BRAINROT NINJA

### Base Mechanic
**Fruit Ninja** -- swipe across the screen to slice objects tossed into the air. Slice meme objects for points. Avoid bombs. Chain multi-slices for combos.

### Why This Mechanic Next
This is the first game with **swipe/drag input** -- every other game uses taps or directional presses. The swipe-to-slice gesture is uniquely satisfying and tactile in a way that no other mechanic in the catalog provides. It is also the first **destruction-oriented** game -- instead of building (Stack), surviving (Runner, Flappy), or growing (Snake), the player is actively destroying things. This is cathartic and visually spectacular with minimal art effort (slice effects are just lines and particles).

Fruit Ninja also has the strongest "clip moment" potential after Flappy Bird -- a perfect multi-slice combo in slow motion is inherently satisfying to watch. TikTok content creation potential is high.

Complexity is 3/5 -- the swipe gesture detection and object-swipe intersection math are the main challenges. But the game has no persistent state (no grid, no body tracking), making each frame self-contained.

### 3 Theme Variants

---

#### Variant A: SKIBIDI SLICER (primary)

**Concept:** Skibidi Toilets are being launched into the air and you are a Cameraman slicing them in half with your camera beam (the swipe trail). Toilets fly up, you slash them. Cameraman allies are the "bombs" -- slice one and you lose (friendly fire). Multi-toilet combos trigger "CAMERA CREW COMBO" text. The fiction: you are defending the camera faction by intercepting launched toilet projectiles.

**Currency/Score Label:** TOILETS SLICED

**Visual Description:**
- **Slice objects (toilets):** Skibidi Toilet -- oval bowl, rectangular tank, small head poking out the top. ~15 lines of Canvas. Drawn in various sizes (small=fast, large=slow). When sliced, the toilet splits into two halves that tumble off-screen with a brief water-splash particle effect (blue dots).
- **Bombs (cameramen):** Camera-headed figure -- rectangular body, camera-lens circle for head, tripod legs. ~12 lines. Flash red briefly when they enter screen to warn player.
- **Swipe trail:** Electric blue beam (`#00e5ff`) with white-hot center. Fades over 200ms. Looks like a camera flash beam cutting through the air.
- **Background:** Dark cityscape silhouette (a few rectangular buildings along the bottom, dark sky above). Simple, non-distracting.
- **Slice effect:** When a toilet is cut, two halves separate with a spray of blue droplet particles (4-6 small circles that arc outward and fade).

**Color Palette:**
- Background: `#0a0a1a` (dark sky)
- Building silhouettes: `#1a1a2a`
- Toilet body: `#e0e0e0` (white porcelain)
- Toilet head: `#f5deb3` (skin tone)
- Cameraman: `#333333` (dark body), `#78909c` (camera lens)
- Swipe trail: `#00e5ff` center, `#0088cc` outer glow
- Combo text: `#00e5ff`
- Accent: `#00e5ff`

**5 Death/Game-Over Messages:**
1. "you sliced a cameraman. friendly fire is not sigma."
2. "the toilets won this round. skibidi 1, camera 0."
3. "your camera beam has been revoked."
4. "three toilets escaped. the invasion continues."
5. "skill issue. the cameramen are disappointed."

---

#### Variant B: AURA SLICER

**Concept:** Objects flying through the air are "negative aura" entities -- cringe moments, L's, NPC behaviors, ratio'd tweets. You slice them to gain aura. The positive-aura objects are the "bombs" -- glowing golden orbs that you must NOT slice (they represent W's, rizz moments, main character energy). Slicing a positive aura = you just destroyed good vibes = game over.

This gives Aura Points its second themed appearance and makes it a gameplay concept, not just a label.

**Currency/Score Label:** AURA GAINED

**Visual Description:**
- **Slice objects (negative aura):** Dark purple/gray orbs with downward-pointing arrows and "L" text on them. Sad face emoticons. Cringe clouds (lumpy gray shapes with "NPC" text). 3 visual variants, each ~10 lines of Canvas. When sliced, they burst into dark purple particles that quickly fade (negative energy dissipating).
- **Bombs (positive aura):** Bright golden orbs with upward arrows, sparkle effects, "W" text. Warm glow ring around them. Must NOT be sliced.
- **Swipe trail:** Gold-white gradient, sparkle particles along the trail. Represents your aura energy beam.
- **Background:** Gradient from deep navy (`#0a0a2a`) at bottom to slightly lighter at top. Clean, mystical.
- **Slice effect:** Dark orbs burst into purple particles that dissolve. Satisfying "aura cleansed" visual.

**Color Palette:**
- Background: `#0a0a2a` to `#1a1a3a` gradient
- Negative aura orbs: `#4a148c` (dark purple), `#616161` (gray), `#37474f` (dark teal)
- Positive aura orbs: `#ffd700` (gold) with `#fff8e1` glow
- Swipe trail: `#ffd700` to `#ffffff` gradient
- Text: `#f0f0f0`
- Accent: `#ffd700`

**5 Death/Game-Over Messages:**
1. "you destroyed positive aura. negative aura check."
2. "you sliced a W. that was a self-ratio."
3. "aura obliterated. npc behavior detected."
4. "three L's escaped. your aura is in the negatives."
5. "main character arc: cancelled."

---

#### Variant C: FANUM FOOD FIGHT

**Concept:** Food items are being tossed into the air and you are collecting the Fanum Tax by slicing through them mid-air to claim them. The food you must NOT slice: empty plates (already taxed, nothing left). Slicing an empty plate = embarrassment = game over. Multi-food combos = "TAX COLLECTOR COMBO." The swipe trail looks like grabbing hands reaching out.

**Currency/Score Label:** FOOD TAXED

**Visual Description:**
- **Slice objects (food):** Pizza slices (triangle + circle), burgers (stacked rectangles), tacos (arc shape), chicken drumsticks (circle + rectangle), ice cream cones (triangle + circle). 5 food types, ~10 lines each. When sliced, food splits into two halves with sauce/crumb particle spray (colored dots matching the food).
- **Bombs (empty plates):** White/gray circle (plate) with a sad face and "EMPTY" text. Small dust cloud around it. Hitting this = you tried to tax nothing.
- **Swipe trail:** Orange-red gradient trail with small hand/finger shapes along the edge (simplified: just the orange trail is fine).
- **Background:** Kitchen/restaurant dark interior. Counter silhouette at bottom. Dark warm tones.
- **Slice effect:** Food-colored particle burst (red for pizza sauce, yellow for cheese, brown for burger, etc.).

**Color Palette:**
- Background: `#1a1210` (dark kitchen brown)
- Counter: `#2a1a10`
- Food items: `#ff5252` (pizza), `#ffb74d` (burger), `#fdd835` (taco), `#8d6e63` (drumstick), `#f48fb1` (ice cream)
- Empty plate: `#9e9e9e` (gray) with `#757575` sad face
- Swipe trail: `#ff6b2b` (orange)
- Accent: `#ff6b2b`

**5 Death/Game-Over Messages:**
1. "you tried to tax an empty plate. embarrassing."
2. "the food got away. fanum tax evaded."
3. "three meals escaped your grasp. hunger wins."
4. "your tax collector license has been revoked."
5. "no food left to steal. the fridge is empty."

---

### Core Loop (every 5-10 seconds)
Objects are launched upward from below the screen in parabolic arcs (randomized launch angle and velocity). They hang at the apex for a beat, then fall. Player swipes across the screen to create a slice line. Any sliceable object intersecting the swipe line is destroyed (score + particle effect). Bombs intersecting the line trigger a strike (3 strikes = game over in Classic mode). Objects that fall off-screen un-sliced also count as a strike (in Classic mode). Every 15-20 seconds, a "frenzy wave" launches 6-8 objects simultaneously for a combo opportunity. The game runs on a 60-second timer in Arcade mode or infinite with 3-strikes in Classic mode.

### Difficulty Curve

**Classic Mode (3 strikes):**
| Time | Launch Rate | What Changes |
|------|------------|--------------|
| 0-20s | 1 object/1.5s | Learning. Big, slow arcs. Few bombs. |
| 20-40s | 1 object/1.0s | Faster launches. Bombs appear 15% of the time. |
| 40-60s | 1 object/0.7s | Fast. Bombs at 20%. Multi-object launches start. |
| 60-90s | 2 objects/0.7s | Intense. Must distinguish targets from bombs quickly. |
| 90s+ | 2-3 objects/0.5s | Survival. Screen is full. Combo opportunities everywhere but so are bombs. |

**Arcade Mode (60-second timer):**
Fixed time, increasing launch rate. Score as many as possible. No "missed object" strikes -- only bomb strikes end the game early.

### Estimated Build Complexity: 3/5
The main challenges:
1. **Swipe detection:** Track touch/mouse start and end points over ~200ms window. Compute the swipe line segment. This is more complex than tap detection but well-documented.
2. **Object-swipe intersection:** For each active object, test if the swipe line segment intersects the object's circular hitbox. Standard line-circle intersection math (~20 lines of utility code).
3. **Parabolic trajectories:** Each object has launch velocity (vx, vy) and gravity. Position updates: `x += vx * dt`, `y += vy * dt`, `vy += gravity * dt`. Simple but many objects are in flight simultaneously.
4. **Particle system:** Slice effects require a simple particle array. Each particle: {x, y, vx, vy, life, color}. Update positions, fade alpha by life, remove dead particles. ~40 lines.
5. **Two game modes:** Classic (strikes) and Arcade (timer) share 90% of logic, just different end conditions.

### Key Canvas Drawing Notes
- **Objects in flight:** Each object drawn at its current (x, y) with rotation based on angular velocity (adds tumble: `ctx.rotate(angle)`). Objects are 40-60px diameter. 5-8 objects on screen at peak.
- **Swipe trail rendering:** Store last N touch points (10-15 points over 200ms). Draw a tapered line through them -- thick at start, thin at end. Use `ctx.lineWidth` tapering or draw successive line segments with decreasing width. Glow effect via shadow blur. Fade trail alpha over 300ms after swipe ends.
- **Slice effect:** When an object is sliced, compute the slice angle from the swipe direction. Split the object into two halves -- draw each half using `ctx.clip()` with a rectangle rotated to the slice angle. Each half gets opposite velocity to tumble apart. Alternatively, simpler: just spawn 8-12 particles in the object's color and hide the object.
- **Particle system:** Simple circle particles. Each has position, velocity, gravity, life (0-1), color. Draw as small filled circles with `globalAlpha = life`. ~30 particles active at peak. Trivial performance impact.
- **Background:** Static. Draw once to an offscreen canvas, blit each frame. City silhouette or kitchen counter is just `fillRect` shapes.
- **HUD:** Score top-left. Strikes (X marks) top-right for Classic. Timer bar for Arcade. Combo text (e.g., "3x COMBO!") center-screen, fades up over 500ms.

### How It Uses Shared Infrastructure
- **GameShell:** Standard 3-state machine. Menu screen shows mode select (Classic / Arcade) -- can be a simple toggle in the menu overlay. `onStart` clears all objects and particles, resets score/strikes/timer. `onUpdate` spawns objects on schedule, updates trajectories, processes swipe intersections, checks game-over conditions. `onRender` draws background, objects, swipe trail, particles, HUD.
- **InputManager:** Needs swipe path tracking (not just swipe direction). The existing InputManager tracks touch start/end for swipe direction -- this game needs the intermediate points too. **Extension needed:** add `onSwipe(points[])` callback that fires when a swipe gesture is detected, passing the array of {x, y, time} points along the path. Alternatively, the game can directly listen to `touchmove`/`mousemove` events on the canvas for this specific input pattern. Recommendation: game-local input handling for the swipe trail, using InputManager only for menu taps.
- **ScoreManager:** High score per mode per theme: `brainrot-ninja-{themeId}-{mode}`.
- **SoundManager:** Slice sound (sharp high-pitched "shing"). Bomb hit sound (low buzz + warning). Combo sound (ascending quick notes, pitch based on combo count). Miss sound (whoosh). Background: no music, just effects.
- **Share:** Score card: "SKIBIDI SLICER -- sliced 47 TOILETS -- 3x best combo -- brainrotgames.io/ninja"

---

## Summary: Batch 2 at a Glance

| | Game 06 | Game 07 | Game 08 |
|---|---------|---------|---------|
| **Name** | FANUM SNAKE | BRAINROT 2048 | BRAINROT NINJA |
| **Base Mechanic** | Snake | 2048 | Fruit Ninja |
| **New to Catalog** | Directional control | Puzzle / cognitive | Swipe / destruction |
| **Themes** | Fanum Tax, Grimace Shake, Ohio | Italian Brainrot, Among Us, Aura Points | Skibidi, Aura Points, Fanum Tax |
| **Complexity** | 1/5 | 2/5 | 3/5 |
| **Avg Session** | 3-7 min | 8-15 min | 2-5 min |
| **Retry Factor** | 4/5 | 4/5 | 3/5 |
| **Input Type** | Swipe direction / arrows | Swipe direction / arrows | Swipe path / mouse drag |
| **Core Feel** | Growing tension | Strategic planning | Satisfying destruction |

### Build Order Recommendation
1. **Game 06 (Snake)** first -- complexity 1/5, shares swipe-direction input pattern with existing games, fastest to ship.
2. **Game 07 (2048)** second -- complexity 2/5, also uses swipe-direction, but the merge algorithm and tile animation need more careful implementation.
3. **Game 08 (Fruit Ninja)** third -- complexity 3/5, requires new swipe-path input handling and a particle system. Most complex but most visually impressive.

### Shared Infrastructure Additions Needed
1. **Particle system utility** (`games/shared/particles.js`) -- Games 06 and 07 need minimal particles (score floats, merge pulses). Game 08 needs a proper particle system. Building a shared lightweight particle manager benefits all three and future games.
2. **Swipe path tracking** -- InputManager currently tracks swipe start/end for direction detection. Game 08 needs intermediate touch points. Either extend InputManager with a `getSwipePath()` method or let Game 08 handle its own touch events directly on the canvas (recommended -- keeps InputManager simple for the majority of games that only need direction).
3. **Grid utility** (`games/shared/grid.js`) -- Both Game 06 (18x18) and Game 07 (4x4) use grid-based logic. A small shared utility for grid rendering (draw grid lines, cell coordinate math) could reduce duplication, but the grids are different enough that game-local implementations are also fine. Optional.

---

*Batch 2 plan produced 2026-04-10. Ready for GDD authoring per game.*
