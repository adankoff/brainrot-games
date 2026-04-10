# Batch 3 Plan -- Games 09, 10, 11
## Brainrot Games Catalog Expansion
### April 2026

---

## Batch Strategy

Batch 3 pushes beyond the obvious tap-and-reflex pairings that dominate Batches 1-2. By this point the catalog has: tap-to-fly (Flappy), tap-targets (Whack), tap-and-upgrade (Idle), side-scroll (Runner), drop-blocks (Stack), grow-trail (Snake), slide-merge (2048), and likely one of Color Switch/Doodle Jump. Batch 3 introduces **three genuinely different interaction models**: swipe gestures, paddle/ball physics, and rhythm-platforming. Each game has 3 selectable meme theme variants instead of a single theme.

**Selection criteria applied:**
1. Mechanical diversity -- swipe, paddle-control, and tap-rhythm are all absent from the catalog
2. Fresh themes -- heavy rotation of Grimace Shake, Among Us/Sus, Looksmaxxing, NPC Streaming, and Ohio (all underused or unused)
3. Viral hooks -- combo counters, level destruction, and percentage-based death screens are all proven shareable formats
4. 3 genuine theme variants per game -- each variant meaningfully changes visuals, vocabulary, and end-screen humor

---

## Game 09: SLICE THE BRAINROT

### Base Mechanic
**Fruit Ninja.** Swipe/drag across objects tossed into the air. Slice for points, chain slices into combos. Avoid bombs. 60-second arcade timer.

### Why This Mechanic
Fruit Ninja is the only swipe-gesture game in the entire catalog. Every other game uses tap or directional input. The tactile satisfaction of swiping through objects is fundamentally different from tapping -- it engages a different motor pattern and produces a different emotional response (physical, visceral, destructive). The combo system rewards precision and creates clip-worthy moments. 1B+ downloads prove the mechanic. Implementation is moderate (3/5) due to swipe detection and trail rendering, but by Game 09 the team has shipped 8 games and can handle it.

The key insight: slicing meme characters in half is inherently funnier than slicing fruit. The splatter effects, the character reactions, the absurdity of bisecting Grimace -- this is screenshot/clip bait at a level that fruit never was.

### Theme Variant 1: GRIMACE SHAKE SLICE

**Theme:** Grimace Shake / McDonald's horror meme
**Scoring Label:** SHAKE POINTS
**Visual Description:** Purple-dominant screen. Objects tossed upward are Grimace Shake cups of various sizes, purple milkshake blobs, and cursed Grimace faces. Slicing a shake produces a purple splatter that stains the screen (accumulates over the round -- by 50 seconds the screen is dripping purple). Bombs are replaced by **golden arches** -- slice a golden arch and the screen goes to a fake "McDonald's cease & desist" overlay for a beat before the game continues (you lose your combo). Background is a dimly-lit McDonald's interior that gets progressively more corrupted/glitchy. The slice trail is neon purple.

**Color Palette:**
- Primary: #7B2D8E (Grimace purple)
- Secondary: #FFD700 (golden arches yellow)
- Background: #1A0A1F (dark purple-black)
- Splatter: #9B30FF (bright purple)
- Accent: #FF1744 (danger red for golden arches)

**Death/End Messages (60-second timer expiry):**
1. "grimace saw what you did. he's not happy."
2. "the shake was never just a shake."
3. "ronald is watching. he always was."
4. "you sliced [X] shakes. that's [X] too many. or not enough."
5. "the purple stains don't wash out. check your hands."

### Theme Variant 2: LOOKSMAXXING SLASH

**Theme:** Looksmaxxing / glow-up culture
**Scoring Label:** GLOW POINTS
**Visual Description:** Objects tossed upward are "bad trait" items that need to be sliced away: crooked jawlines, weak chins, asymmetrical faces, bad haircuts, unibrows, and acne clusters. Slicing produces a sparkle/glow-up effect instead of splatter. The background character (a silhouette face) gradually transforms from "before" to "after" as you slice more items -- jawline sharpens, cheekbones appear, hair improves. Bombs are replaced by **"already maxed" items** (perfect jawlines, ideal canthal tilt markers) -- slicing these removes glow points because you're cutting away perfection. The slice trail is a gleaming gold razor edge.

**Color Palette:**
- Primary: #C4A265 (gold/bronze)
- Secondary: #FF6B9D (skin-tone pink)
- Background: #0D0D0D (pitch black, surgical theater vibe)
- Glow effect: #FFE066 (bright gold sparkle)
- Accent: #00E5FF (clinical cyan, like a cosmetic surgery laser)

**Death/End Messages (60-second timer expiry):**
1. "jawline status: could be worse. is worse."
2. "you removed [X] flaws. [X * 10] remain. sorry."
3. "mewing alone can't fix this. you need the blade."
4. "glow-up progress: 12%. see you tomorrow."
5. "the mirror called. it wants an apology."

### Theme Variant 3: SUS SLICE

**Theme:** Among Us / "sus" / imposter culture
**Scoring Label:** TRUST POINTS
**Visual Description:** Crewmate-shaped objects in various colors are tossed upward. Regular crewmates can be sliced for points. But some are **imposters** -- visually identical except for a brief tell (a tiny fang, a shadow flicker, a slightly wrong color shade) that appears for ~200ms when they reach peak height. Slicing an imposter gives 3x points. Slicing a crewmate gives normal points. Bombs are replaced by **emergency meeting buttons** -- hit one and ALL objects currently on screen freeze for 1 second (useful but costs your combo). The splatter is colored blood matching the crewmate's color. Background is a spaceship interior with vents that occasionally open.

**Color Palette:**
- Primary: #C51111 (Among Us red)
- Secondary: #132ED1 (Among Us blue)
- Background: #1B1B2F (dark space-station interior)
- Splatter: varies per crewmate color
- Accent: #FFFF00 (emergency meeting yellow)

**Death/End Messages (60-second timer expiry):**
1. "you were not the imposter. you were the victim."
2. "[X] crewmates sliced. reported to admin."
3. "emergency meeting called. the evidence is you."
4. "kinda sus that you enjoyed that."
5. "vented out of the game. [X] trust points ejected."

### Core Loop
1. Objects launch upward from the bottom of the screen in arcing trajectories (1-4 at a time)
2. Player swipes across the screen to create a slice trail
3. Any object the trail intersects is sliced in half -- halves separate and fall with physics
4. Themed splatter/effect on slice, points fly up as floating text
5. Multi-object slices in a single swipe = combo multiplier (2x, 3x, 4x+)
6. Avoid the "bomb" equivalent (golden arches / perfect traits / emergency buttons) -- hitting one breaks combo
7. 60-second arcade timer counts down
8. End screen: total score, best combo, objects sliced count, shareable card

### Difficulty Curve
- **0-15s:** 1-2 objects at a time, slow arc, no bombs. Tutorial feel.
- **15-30s:** 2-3 objects, faster arcs, first bombs appear. Combos become possible.
- **30-45s:** 3-4 objects, varied arc speeds (some fast/high, some slow/low), bombs more frequent. Player must choose which clusters to swipe and which to dodge.
- **45-60s:** 4-5 objects, rapid fire, multiple bombs mixed in. Pure chaos. The "clippable" window where skilled players rack up massive combos and casual players are just surviving.
- **Bonus:** 3+ perfect combos (4+ objects in one swipe) trigger a brief slow-motion "BRAINROT TIME" where everything floats for 2 seconds, allowing one massive multi-slice.

### Estimated Complexity: 3/5

The swipe/touch gesture detection is the hard part. Core components:
- Touch/mouse event tracking to build swipe path (array of points over time)
- Line-segment vs. circle intersection for hit detection (swipe path vs. object hitboxes)
- Parabolic arc physics for object trajectories
- Object splitting animation (two halves falling with rotation)
- Particle system for splatter/sparkle effects
- Trail rendering (fading line behind the swipe)
- Combo detection (multiple hits within a single swipe gesture)
- 60-second timer with difficulty ramping

Estimated build: 3-4 days for a polished version. The swipe detection logic is well-documented (GitHub repos and Canvas tutorials exist). The visual polish (splatter accumulation, trail glow, split animations) is what separates good from great.

### Key Canvas Drawing Notes
- Swipe trail: render as a series of connected line segments with decreasing opacity and width (most recent = brightest/widest). Use `ctx.lineWidth` gradient and `ctx.globalAlpha` fade.
- Object splitting: when sliced, create two clip paths (one for each half of the object along the slice angle), then apply gravity + rotation to each half independently.
- Splatter: particle system with 15-30 small circles per slice, random velocity vectors, gravity, and decreasing opacity. For Grimace variant, splatters persist on screen (draw to a separate offscreen canvas that accumulates).
- Arc trajectories: standard projectile motion -- `x = x0 + vx*t`, `y = y0 + vy*t + 0.5*g*t^2`. Vary initial velocity and angle per object.
- Hit detection: for each frame of a swipe, check if the line segment from previous touch point to current touch point intersects any object's bounding circle. Use line-circle intersection math.

### Viral Hook
The **combo counter** is the viral engine. A 6x combo where the player slices through a cluster of Grimace Shakes in one smooth swipe, purple splatter exploding everywhere, "BRAINROT TIME" triggering slow-mo -- that is a 5-second clip that gets 500K views on TikTok. The accumulated screen splatter by the end of a round (especially in Grimace variant) is visually absurd and screenshot-worthy. The Looksmaxxing variant has the additional hook of the face transformation -- players share their "glow-up progress" end screen.

---

## Game 10: BRAINROT BREAKER

### Base Mechanic
**Breakout / Brick Breaker.** Move a paddle to bounce a ball into a grid of bricks. Destroy all bricks to clear the level. Power-ups drop from destroyed bricks. This is the MDN Canvas tutorial game -- literally the most documented HTML5 Canvas implementation in existence.

### Why This Mechanic
Breakout introduces **level-based structure** to the catalog for the first time. Every other game is endless/timed. Levels create a fundamentally different motivation: completion. "I almost beat level 7" is a different kind of shareability than "my high score is 47." The progressive destruction of a brick wall is deeply satisfying in a way that no other mechanic in the catalog delivers -- you watch your progress happen in real-time as the wall crumbles. Power-ups add a variable-reward layer. And the ball-bouncing physics create genuine "how did THAT happen" moments when the ball ricochets through a narrow gap and clears a whole row.

Implementation is 2/5 -- this is literally the beginner Canvas tutorial. Paddle movement, ball physics (angle of reflection), rectangle collision detection, brick grid rendering. The team can build this in their sleep by Game 10.

### Theme Variant 1: NPC STREAMING BREAKER

**Theme:** NPC Streaming / TikTok Live / gifting culture
**Scoring Label:** GIFT POINTS
**Visual Description:** The brick wall is a grid of **NPC streamer faces** frozen in their signature expressions (the "ice cream so good" face, the "gang gang" face, the "yes yes yes" face). Each face-brick has a different NPC expression. The paddle is a **chat bar** at the bottom. The ball is a **TikTok gift** (rose, lion, universe). Destroying a face-brick triggers the NPC's catchphrase as floating text ("ice cream so good!", "gang gang!", "slay queen!"). Power-ups are **premium gifts**: a Universe gift = multi-ball, a Lion gift = bigger paddle (wider chat bar), a Rose gift = fireball (ball passes through bricks instead of bouncing). Background is a phone screen frame with fake chat scrolling on the sides ("user_8847 sent a rose", "ohio_boy_99: NPC MODE ACTIVATED").

**Color Palette:**
- Primary: #FF0050 (TikTok pink)
- Secondary: #00F2EA (TikTok cyan)
- Background: #000000 (phone screen black)
- Bricks: flesh tones + varied expression colors
- Accent: #FFD700 (gift gold)

**Death/End Messages (lose all lives):**
1. "stream ended. 0 viewers. as expected."
2. "the NPCs won. you are now one of them."
3. "chat is typing... 'L'. just 'L'."
4. "your gifting privileges have been revoked."
5. "NPC mode: deactivated. you weren't ready."

### Theme Variant 2: OHIO BREAKER

**Theme:** Ohio Memes / "Only in Ohio" / surreal Midwest horror
**Scoring Label:** SURVIVAL POINTS
**Visual Description:** The brick wall is a map/grid of **Ohio landmarks and hazards** -- each brick is a cursed Ohio thing (mutant corn, haunted barn, interdimensional portal, suspicious deer, corn maze entrance, "Welcome to Ohio" sign). The paddle is a **highway guardrail**. The ball is a **mysterious Ohio orb** (glowing, slightly pulsating, leaves a faint trail). Destroying bricks reveals the Ohio landscape behind them -- as you clear more bricks, you can see further into Ohio (and it gets worse). Power-ups drop as **Ohio survival gear**: flashlight = the ball glows brighter and moves through dark bricks, corn shield = paddle gets wider, portal gun = ball teleports through walls. Background is a cornfield at dusk with unsettling movement in the far distance.

**Color Palette:**
- Primary: #4A7C2E (corn/field green)
- Secondary: #8B4513 (barn brown)
- Background: #1A1A2E (Ohio night sky, ominous)
- Ball: #00FF88 (eerie green glow)
- Accent: #FF4500 (warning orange)

**Death/End Messages (lose all lives):**
1. "you could not escape ohio. nobody escapes ohio."
2. "the corn remembers your name now."
3. "only in ohio would you lose at brick breaker."
4. "ohio consumed [X] of your survival points. ohio is full now."
5. "you broke [X] bricks. ohio broke you."

### Theme Variant 3: GREAT MEME RESET BREAKER

**Theme:** The Great Meme Reset / meme archaeology / dead memes coming back
**Scoring Label:** REVIVAL POINTS
**Visual Description:** The brick wall is a **meme graveyard** -- each brick is a dead/classic meme (Trollface, Nyan Cat, Doge, Rage Comics, Harambe, Dat Boi, Ugandan Knuckles, Loss, Keyboard Cat, Rickroll). The bricks are arranged chronologically: oldest memes at the top, most recent dead memes at the bottom. The paddle is a **scroll bar** (like you're scrolling through internet history). The ball is a **"revive" orb** with a resurrection glow. Destroying a meme brick "revives" it -- the meme briefly animates to life with its original context (Nyan Cat flies across, Trollface laughs, Doge text appears) before dissolving. Power-ups are **internet artifacts**: dial-up modem = ball speeds up with dial-up sound, WiFi signal = multi-ball spreading in a signal pattern, Blue Screen of Death = clears an entire row. Background is an old Windows XP desktop that degrades as you play (more popups, more toolbars).

**Color Palette:**
- Primary: #3A86FF (hyperlink blue)
- Secondary: #FF006E (old-internet magenta)
- Background: #3A6EA5 (Windows XP blue) degrading to #000000
- Bricks: varied per meme era (pixelated pastels for early memes, HD for recent)
- Accent: #32CD32 (old-web green, like early forum text)

**Death/End Messages (lose all lives):**
1. "the memes stay dead. you failed them."
2. "harambe is still gone. this changes nothing."
3. "you revived [X] memes. the internet felt that."
4. "ctrl+z doesn't work on real life. or this game."
5. "the great meme reset cannot be stopped. you tried."

### Core Loop
1. Ball launches from paddle at game start (player taps to release)
2. Ball bounces off walls, ceiling, and paddle according to reflection physics
3. Ball destroys bricks on contact, bouncing back
4. Destroyed bricks occasionally drop power-ups that fall toward the paddle
5. Player moves paddle left/right (touch drag or arrow keys) to catch ball and power-ups
6. Missing the ball costs a life (3 lives total)
7. Clear all bricks to advance to next level
8. Each level introduces new brick layouts, more durable bricks (2-3 hits), and faster ball speed
9. Level completion screen with score + share card

### Difficulty Curve
- **Levels 1-3:** Single-hit bricks, simple rectangular layouts, slow ball, wide paddle. Learn the controls.
- **Levels 4-6:** 2-hit bricks introduced (different visual state on first hit), L-shaped and diamond layouts, ball speed +15%. First power-ups appear.
- **Levels 7-9:** 3-hit bricks (boss bricks, themed as the variant's "strongest" element), moving bricks in some rows, ball speed +30%, paddle shrinks slightly. Power-ups critical for survival.
- **Level 10:** Boss level. A single massive brick that takes 20+ hits, spawns mini-bricks as debris, and the ball speed is at maximum. Clearing this is the "I beat Brainrot Breaker" achievement.
- **Endless mode unlocked after level 10:** Procedurally generated levels with increasing speed and complexity. This is where high scores live.

### Estimated Complexity: 2/5

This is literally the MDN beginner Canvas tutorial with a theme layer on top. Core components:
- Ball position and velocity (2D vector), reflection on wall/ceiling/paddle contact
- Paddle position tracking from touch/mouse/keyboard input
- Brick grid: 2D array, each cell has a type, hit points, and position
- Collision detection: ball vs. rectangles (bricks and paddle), ball vs. walls
- Power-up drop system: random chance on brick destruction, gravity fall, paddle catch detection
- Level data: array of brick layouts (can be hand-designed or procedurally generated)
- Life counter and level progression

Estimated build: 2-3 days. The core Breakout engine is a weekend project. The theme variants (NPC expressions, Ohio hazards, meme animations on brick death) are the polish layer that makes it worth playing.

### Key Canvas Drawing Notes
- Brick grid: draw as filled rectangles with themed sprites/icons inside. Use `ctx.drawImage()` for brick face content, `ctx.strokeRect()` for borders. Hit-state bricks get a crack overlay.
- Ball: circle with `ctx.arc()`. Add a subtle glow trail using decreasing-opacity circles at previous positions (store last 5-8 positions).
- Paddle: rounded rectangle with themed texture. Responsive to touch (track `touchmove` clientX) and keyboard (left/right arrows).
- Power-up drops: small themed icons that fall with gravity from destroyed brick positions. Collision with paddle = activate.
- Ball reflection angle: when ball hits paddle, the reflection angle depends on WHERE on the paddle it hits. Center = straight up, edges = angled. This gives the player directional control. Formula: `angle = (ballX - paddleCenter) / (paddleWidth / 2) * maxAngle`.
- Brick destruction animation: brief flash, then particles scatter outward. For meme variant, play a 0.5s animation of the meme before the particles.

### Viral Hook
**Level completion screenshots** with the themed end-screen. "I just freed Harambe in Brainrot Breaker" hits different. The meme revival variant is especially shareable because each brick-death produces a nostalgic micro-moment -- older Gen Z will share "they put Trollface in a game" content unprompted. The NPC variant has clip potential when multiple NPC catchphrases fire simultaneously during a multi-ball power-up. The Ohio variant's gradually-revealed Ohio landscape (progressively more cursed as you clear bricks) is screenshot bait at every level.

---

## Game 11: BRAINROT DASH

### Base Mechanic
**Geometry Dash (simplified).** Character auto-scrolls rightward. Tap to jump. One-touch controls. Obstacles are precisely placed in a pattern. One collision = restart from the beginning. Progress shown as a percentage. No strict rhythm-sync requirement (simplified from full Geometry Dash to avoid Web Audio API latency issues -- the music accompanies but obstacles are pattern-based, not beat-mapped).

### Why This Mechanic
Geometry Dash has the **highest addictiveness rating (5/5)** in the research and the strongest "one more try" factor of any mechanic analyzed, tied only with Flappy Bird and Color Switch. The percentage-based progress display is arguably the most powerful retry mechanic ever designed -- "I died at 87%" is an almost physically painful statement that makes restart inevitable. The mechanic introduces **level memorization and mastery** to the catalog -- every other game is procedurally generated or random. Here, the level is fixed, and the player improves through repetition and muscle memory. That is a fundamentally different engagement model.

The research flagged this as 4/5 complexity due to rhythm sync. We simplify: no beat-mapping, just a hard platformer with a soundtrack. The music is hype but decorative. Obstacle patterns are hand-designed. This drops complexity to 2.5-3/5 while keeping the core psychology intact.

### Theme Variant 1: AURA DASH

**Theme:** Aura Points / aura measurement / social status energy
**Scoring Label:** AURA LEVEL
**Visual Description:** The player character is a **glowing orb** whose aura color and intensity change based on how far through the level they are. Start as a dim gray orb (0% = zero aura). At 25% it glows faint blue. At 50% it pulses green. At 75% it radiates gold. At 90%+ it blazes white-hot with particle trails. Obstacles are **aura drains** -- matte black geometric shapes that absorb light. The background is a gradient that shifts from cold gray (start) to vibrant cosmic purple (end). Spikes are replaced by void patches. Platforms are luminescent. The entire screen brightness correlates with progress -- dying at 90% and restarting at 0% is viscerally jarring because the screen goes dark again.

**Color Palette:**
- Primary: #7C3AED (aura purple)
- Secondary: varies with progress (gray -> blue -> green -> gold -> white)
- Background: gradient from #1A1A2E (start) to #4A00E0 (end)
- Obstacles: #0A0A0A (void black)
- Accent: #FFD700 (peak aura gold)

**Death/End Messages (on collision):**
1. "aura check failed at [X]%. the void noticed."
2. "[X]% aura accumulated. [100-X]% aura wasted."
3. "you peaked at [X]%. that's your ceiling."
4. "the glow was temporary. the darkness is permanent."
5. "aura status: revoked. start grinding."

### Theme Variant 2: SLAY OR SASHAY DASH

**Theme:** Sigma grindset meets drag/slay culture mashup
**Scoring Label:** SLAY METER
**Visual Description:** The player character alternates between two visual modes as they pass through **transformation portals**: SIGMA MODE (dark, angular, stoic cube with sunglasses) and SLAY MODE (sparkly, rounded, fabulous star shape with glitter trail). The level is designed so you must be in the correct mode to pass through certain obstacles -- sigma walls (dark, angular, only sigma-shaped character fits through) and slay walls (sparkly, curved, only slay-shaped character fits through). Portals that switch your mode are placed before each obstacle type. The skill is reacting to the portal-obstacle sequence. Background alternates between a dark gym aesthetic and a glittering runway. Music shifts between phonk and house beats at each portal.

**Color Palette:**
- Sigma mode: #1A1A2E (dark navy), #4A4A4A (gunmetal), #FF0000 (laser red eyes)
- Slay mode: #FF69B4 (hot pink), #FFD700 (gold glitter), #E040FB (magenta sparkle)
- Background: alternates between dark/angular and bright/curved
- Portals: swirling gradient of both palettes

**Death/End Messages (on collision):**
1. "you were neither sigma nor slay. you were just wrong."
2. "the grindset doesn't grind itself. [X]% and you stopped."
3. "slay attempt: denied. sigma attempt: also denied."
4. "mode confusion at [X]%. the runway and the gym both reject you."
5. "the portals giveth and the portals taketh. mostly taketh."

### Theme Variant 3: OHIO GAUNTLET

**Theme:** Ohio survival / "Only in Ohio" obstacle course
**Scoring Label:** OHIO METERS
**Visual Description:** The player character is a **terrified stick figure** running through Ohio. The level is a horizontal cross-section of Ohio's most cursed landscape. Obstacles are surreal Ohio hazards: **giant corn stalks** that thrust upward from the ground (spikes), **flying deer** that glide across the screen (moving obstacles), **interdimensional portals** that teleport the player backward if touched, **lake erie tentacles** that sweep from the ceiling, and **construction zones** that are just walls (Ohio is always under construction). The background is a continuous Ohio landscape: cornfields, suburban sprawl, abandoned malls, mysterious fog. At 50% the sky turns red. At 75% the ground starts floating. At 90% everything is upside down. A "MILES INTO OHIO" counter replaces the percentage.

**Color Palette:**
- Primary: #2D5016 (corn green)
- Secondary: #8B6914 (wheat/field gold)
- Background: #87CEEB (midwest sky) degrading to #4A0000 (hellish red)
- Obstacles: #654321 (earthy brown), #1B1B1B (construction black)
- Accent: #FF4500 (danger orange, construction cones)

**Death/End Messages (on collision):**
1. "you made it [X] miles into ohio. ohio won."
2. "the corn got you. the corn always gets them."
3. "only in ohio would a deer fly at you at mach 2."
4. "ohio is not a place. ohio is a state of suffering. [X]%."
5. "you lasted [X] miles. the ohio record is [best]."

### Core Loop
1. Level begins. Character auto-scrolls rightward at constant speed.
2. Player taps to jump. Hold for higher jump (or tap rapidly for repeated short hops).
3. Obstacles approach from the right. Player must jump over, duck under, or (in Slay/Sigma variant) be in the correct mode.
4. One collision = instant death. Screen shows percentage reached. Tap to restart from 0%.
5. Percentage counter climbs from 0% to 100%. The closer to 100%, the more painful death feels.
6. Reach 100% = level complete. Unlock next level.
7. Each level has a fixed obstacle pattern that the player memorizes through repetition.
8. 3 levels per theme variant (9 total levels at launch). Each level is 45-90 seconds long.

### Difficulty Curve
- **Level 1 (per variant):** Simple jump patterns. Single obstacle types. Generous spacing. Any player can reach 50%+ on first try, 100% within 5-10 attempts.
- **Level 2:** Combined obstacle types. Tighter spacing. Requires some memorization. Most players need 15-30 attempts. The "I died at 94%" moments start here.
- **Level 3:** Full obstacle vocabulary. Fake-out patterns (obstacle that looks like it needs a jump but actually needs a duck). Speed increase. Some sections require frame-perfect timing. 50-100+ attempts for most players. Completing level 3 is the flex.
- **Speed modifier:** Ball speed increases by 5% every 25% of the level, so the back half is always harder than the front.

### Estimated Complexity: 3/5

Simplified from full Geometry Dash (4/5) by removing rhythm sync and vehicle mode transformations. Core components:
- Auto-scroll camera system (fixed-speed rightward movement)
- Jump physics (tap = upward impulse, gravity pulls down, ground collision)
- Level data format: array of obstacle positions and types along a horizontal timeline
- Obstacle rendering: rectangles, triangles (spikes), moving platforms
- Collision detection: player hitbox vs. obstacle hitboxes (rectangle and triangle intersection)
- Percentage counter: `playerX / levelLength * 100`
- Level select screen with completion status
- For Slay/Sigma variant: mode state variable, portal triggers, mode-specific collision rules

Estimated build: 3-4 days. The level design is the time-consuming part, not the code. Each of the 9 levels needs to be hand-crafted and playtested for fairness and fun. The code itself is a side-scrolling platformer with fixed-speed scrolling -- simpler than a full platformer because there's no backtracking or exploration.

### Key Canvas Drawing Notes
- Auto-scroll: the level is stored as a long horizontal array. The camera `offsetX` increases at a constant rate each frame. All obstacles are drawn at `obstacle.x - offsetX`. Simple and performant.
- Jump physics: `velocityY -= jumpForce` on tap, `velocityY += gravity` each frame, `playerY += velocityY`. Clamp to ground level.
- Spike/triangle obstacles: draw with `ctx.beginPath(); ctx.moveTo(); ctx.lineTo(); ctx.closePath(); ctx.fill()`. Collision detection uses point-in-triangle test for the player's corners.
- Percentage bar: horizontal bar at the top of the screen, `width = (offsetX / levelLength) * screenWidth`. Animate fill color based on progress tiers.
- Death effect: brief screen flash red, player character shatters into particles at collision point, camera freezes for 0.3 seconds before showing the percentage overlay.
- Aura variant glow: draw the player orb, then draw 3-4 concentric circles with increasing radius and decreasing opacity around it. Particle trail = store last 15 positions, draw small circles at each with decreasing opacity.
- Parallax: 2-3 background layers scrolling at 0.2x, 0.5x, and 0.8x of the camera speed. Gives depth without complexity.

### Viral Hook
The **percentage death screen** is the entire viral strategy. "I died at 97% on Ohio Gauntlet level 3" is a sentence that makes people (a) feel sympathy, (b) feel competitive, and (c) want to try it themselves. Geometry Dash proved this -- percentage screenshots are one of the most shared game formats on social media. The Ohio variant adds geographic humor ("I made it 97 miles into Ohio"). The Aura variant adds the visual gut-punch of going from blazing white-gold back to dim gray on death. The Slay/Sigma variant has the mode-confusion deaths that are funny to watch ("WHY DID IT SWITCH ME TO SIGMA RIGHT BEFORE THE SLAY WALL").

---

## Batch 3 Summary

| # | Game | Mechanic | Theme Variants | Complexity | Unique Addition to Catalog |
|---|------|----------|---------------|------------|---------------------------|
| 09 | SLICE THE BRAINROT | Fruit Ninja (swipe) | Grimace Shake, Looksmaxxing, Among Us/Sus | 3/5 | First swipe-gesture game; tactile destruction |
| 10 | BRAINROT BREAKER | Breakout (paddle+ball) | NPC Streaming, Ohio, Great Meme Reset | 2/5 | First level-based game; progressive destruction |
| 11 | BRAINROT DASH | Geometry Dash (simplified) | Aura Points, Slay/Sigma, Ohio | 3/5 | First memorization/mastery game; percentage death |

### Theme Coverage in Batch 3

| Theme | Game(s) | Prior Usage (Batches 1-2) |
|-------|---------|--------------------------|
| Grimace Shake | Game 09 (variant 1) | None -- first appearance |
| Looksmaxxing | Game 09 (variant 2) | None -- first appearance |
| Among Us / Sus | Game 09 (variant 3) | None -- first appearance |
| NPC Streaming | Game 10 (variant 1) | None -- first appearance |
| Ohio | Game 10 (variant 2), Game 11 (variant 3) | Game 04 (Endless Runner) -- 1 prior |
| Great Meme Reset | Game 10 (variant 3) | None -- first appearance |
| Aura Points | Game 11 (variant 1) | Used as scoring label, not as theme |
| Sigma/Slay | Game 11 (variant 2) | Game 03 (Idle Clicker) -- 1 prior |

**6 completely new themes introduced.** Ohio gets its deserved second game. Sigma gets a creative mashup variant. The Italian Brainrot universe gets a rest -- it anchored Batches 1-2, and variety matters.

### Build Order Recommendation

1. **Game 10: BRAINROT BREAKER** -- lowest complexity (2/5), MDN-tutorial-level code, fastest to ship. Proves the multi-variant system works.
2. **Game 09: SLICE THE BRAINROT** -- moderate complexity, but the swipe mechanic needs the most playtesting for feel. Ship second to allow tuning time.
3. **Game 11: BRAINROT DASH** -- highest design effort (9 hand-crafted levels). Ship last. Level design can happen in parallel with Games 09-10 development.

### Cross-Batch Mechanical Diversity Check

| Input Type | Games |
|------------|-------|
| Tap (reflex) | 01 Flappy, 02 Whack, 05 Stack |
| Tap (upgrade) | 03 Idle Clicker |
| Directional | 04 Runner, 06 Snake |
| Slide | 07 2048 |
| Swipe gesture | **09 Slice** (NEW) |
| Drag/steer | **10 Breaker** (NEW) |
| Tap (rhythm/memorize) | **11 Dash** (NEW) |

No overlap. Batch 3 fills three empty input-type slots.

---

*Batch 3 plan generated 2026-04-10. Three games, nine theme variants, zero mechanical overlap with Batches 1-2. Submit to Product Head for review.*
