# 30 New Casual Game Mechanics Catalog

**Date**: 2026-04-10
**Purpose**: Expansion catalog of proven casual/mobile game mechanics for HTML5 Canvas + vanilla JS implementation
**Excludes**: Flappy Bird, Whack-a-Mole, Idle Clicker, Endless Runner, Stack, Snake, 2048, Fruit Ninja, Breakout, Geometry Dash (already built)

---

## Master Ranking Table (Sorted by Total Score Descending)

Scoring: **(5 - Complexity) + Addictiveness + Monetization + Viral = Total (max 20)**

| Rank | Name | Category | Complexity | Addictiveness | Monetization | Viral | **Total** |
|------|------|----------|-----------|---------------|-------------|-------|-----------|
| 1 | Piano Tiles | B. Timing | 1 | 5 | 5 | 4 | **18** |
| 2 | Color Switch | B. Timing | 1 | 5 | 5 | 3 | **17** |
| 3 | Wordle Clone | F. Word | 1 | 5 | 3 | 5 | **17** |
| 4 | Memory Match | A. Puzzle | 1 | 4 | 4 | 4 | **16** |
| 5 | Match-3 (Bejeweled) | A. Puzzle | 2 | 5 | 5 | 3 | **16** |
| 6 | Hangman | F. Word | 1 | 4 | 3 | 4 | **15** |
| 7 | Merge/Evolution | E. Creative | 2 | 5 | 5 | 2 | **15** |
| 8 | Paper Toss | C. Physics | 1 | 4 | 5 | 3 | **15** |
| 9 | Basketball Shot | C. Physics | 1 | 4 | 5 | 3 | **15** |
| 10 | Ball Bounce Timing | B. Timing | 1 | 5 | 4 | 3 | **15** |
| 11 | Tetris (Falling Blocks) | A. Puzzle | 2 | 5 | 4 | 3 | **15** |
| 12 | Trivia Quiz | F. Word | 1 | 4 | 5 | 3 | **15** |
| 13 | Slither/Grow Arena | D. Survival | 2 | 5 | 4 | 3 | **15** |
| 14 | Don't Touch the Line | B. Timing | 1 | 4 | 4 | 3 | **14** |
| 15 | Type Racer | F. Word | 2 | 4 | 3 | 4 | **14** |
| 16 | Crossy Road (Frogger) | B. Timing | 2 | 5 | 5 | 3 | **14** |
| 17 | Bubble Shooter | C. Physics | 2 | 5 | 5 | 2 | **14** |
| 18 | Word Search | F. Word | 1 | 3 | 4 | 3 | **14** |
| 19 | Minesweeper | A. Puzzle | 1 | 4 | 3 | 3 | **14** |
| 20 | Hole.io (Black Hole) | D. Survival | 2 | 5 | 4 | 3 | **14** |
| 21 | Tycoon/Management | E. Creative | 3 | 4 | 5 | 2 | **13** |
| 22 | Bullet Hell Dodge | D. Survival | 2 | 4 | 3 | 4 | **13** |
| 23 | Sudoku | A. Puzzle | 2 | 4 | 3 | 2 | **12** |
| 24 | Cooking/Recipe Rush | E. Creative | 3 | 4 | 4 | 2 | **12** |
| 25 | Slingshot Launch (Angry Birds) | C. Physics | 3 | 4 | 4 | 3 | **12** |
| 26 | Doodle/Draw & Guess | E. Creative | 3 | 4 | 3 | 4 | **12** |
| 27 | Rhythm Tap (Tap Tap) | B. Timing | 3 | 4 | 3 | 3 | **11** |
| 28 | Tower Defense | D. Survival | 3 | 4 | 4 | 2 | **11** |
| 29 | Pool/Billiards | C. Physics | 4 | 4 | 3 | 3 | **11** |
| 30 | Vampire Survivors (Horde) | D. Survival | 3 | 5 | 4 | 3 | **11** |

---

## Quick-Reference: Top 10 "Build First" Picks

These have the best ratio of low build effort to high engagement. A solo dev can ship each in 1-3 days.

| # | Name | Build Days | Why Build It |
|---|------|-----------|-------------|
| 1 | Piano Tiles | 1 | Trivial to build, insane replay compulsion, ad after every death |
| 2 | Color Switch | 1 | 200M+ downloads proved the mechanic, one-tap input |
| 3 | Wordle Clone | 1 | Viral sharing built-in (emoji grid), daily retention hook |
| 4 | Memory Match | 1 | Ideal for meme character showcase, universal recognition |
| 5 | Paper Toss | 1 | One-gesture input, perfect ad cadence, easy theme swap |
| 6 | Basketball Shot | 1 | Same arc physics as Paper Toss, different skin, high ad fit |
| 7 | Hangman | 1 | Zero physics, pure word game, brainrot vocab potential |
| 8 | Ball Bounce Timing | 1 | One tap, pure timing, Color Switch variant |
| 9 | Trivia Quiz | 1 | Content-driven (meme trivia), high ad frequency |
| 10 | Don't Touch the Line | 1 | Maze/path avoidance, instant death = instant retry |

---

## Category A: Puzzle/Strategy (5 Mechanics)

---

### A1. Tetris (Falling Blocks / Line Clear)

| Field | Detail |
|-------|--------|
| **Name** | Tetris / Falling Blocks |
| **One-line description** | Rotate and place falling tetrominoes to complete horizontal lines |
| **Core loop** | Piece falls -> player rotates/moves -> piece locks -> lines clear -> next piece (5-8 sec) |
| **Input type** | Tap (rotate), swipe left/right (move), swipe down (hard drop) |
| **Session length** | 5-15 minutes |
| **Canvas complexity** | 2/5 -- grid-based rendering, piece rotation matrices, collision on a 10x20 grid. Well-documented. Dozens of open-source Canvas implementations exist. |
| **Addictiveness** | 5/5 -- "flow state" king. Speed escalation creates perfect difficulty curve. Universally recognized. |
| **Monetization fit** | 4/5 -- ad between games, rewarded video for "hold piece" or "preview next 3", cosmetic block skins |
| **Viral potential** | 3/5 -- high scores shareable, clutch line-clear moments are clip-worthy, Tetris Effect proved visual appeal |
| **What makes it fun** | Spatial reasoning under increasing time pressure. The satisfaction of a perfect 4-line clear (Tetris) triggers dopamine. Flow state emerges naturally as speed increases -- players enter a zone where conscious thought stops and muscle memory takes over. |
| **Best examples** | Tetris (1984, Alexey Pajitnov) -- 520M+ copies sold across all platforms; Tetris 99 (2019, Nintendo) -- battle royale variant; Tetris Effect (2018, Enhance) -- sensory/rhythm fusion |

---

### A2. Match-3 (Bejeweled / Candy Crush)

| Field | Detail |
|-------|--------|
| **Name** | Match-3 / Swap Puzzle |
| **One-line description** | Swap adjacent tiles to create rows/columns of 3+ matching items |
| **Core loop** | Scan board -> spot match -> swap tiles -> cascade/combo -> new tiles fall (5-8 sec) |
| **Input type** | Tap + drag (swap adjacent), or tap two tiles sequentially |
| **Session length** | 3-10 minutes per level, 15-30 min sessions |
| **Canvas complexity** | 2/5 -- grid logic, swap animation, cascade/gravity fill, match detection algorithm (flood fill). No physics. |
| **Addictiveness** | 5/5 -- pattern recognition triggers OCD-like completion drive. Cascading combos create unearned dopamine. Level gates create "just one more level" compulsion. |
| **Monetization fit** | 5/5 -- gold standard. Lives system (wait or pay), boosters as IAP, rewarded video for extra moves, interstitial between levels. Candy Crush generates $1B+/year. |
| **Viral potential** | 3/5 -- level completion screens shareable, "I'm stuck on level X" creates social conversation, but individual screenshots are visually repetitive |
| **What makes it fun** | The brain is wired for pattern recognition -- spotting a match feels like a micro-discovery. Cascading combos create the illusion of skill from luck. The board always looks "almost solved," creating perpetual near-miss motivation. |
| **Best examples** | Candy Crush Saga (2012, King) -- 3B+ downloads; Bejeweled (2001, PopCap) -- genre originator; Royal Match (2021, Dream Games) -- $600M+ revenue, modernized the formula |

---

### A3. Sudoku / Logic Grid

| Field | Detail |
|-------|--------|
| **Name** | Sudoku / Number Logic |
| **One-line description** | Fill a 9x9 grid so each row, column, and 3x3 box contains digits 1-9 |
| **Core loop** | Scan grid -> identify constrained cell -> place number -> validate -> repeat (8-10 sec per move) |
| **Input type** | Tap cell, tap number (number pad overlay) |
| **Session length** | 5-30 minutes depending on difficulty |
| **Canvas complexity** | 2/5 -- pure grid rendering, no animation or physics. Input handling and puzzle generation are the main challenges. Validation logic is straightforward. |
| **Addictiveness** | 4/5 -- logical deduction creates satisfying "aha" moments. Difficulty tiers provide long-term progression. Daily puzzle format proven by newspapers for decades. |
| **Monetization fit** | 3/5 -- hint system (rewarded video), daily puzzles (retention), undo moves as IAP, minimal natural ad breaks (long focus sessions discourage interruption) |
| **Viral potential** | 2/5 -- completion times shareable, daily puzzle leaderboards, but visually static -- hard to make exciting clips |
| **What makes it fun** | Pure logic with zero luck. Each solved cell narrows possibilities for others, creating a satisfying cascade of deductions. The "breakthrough moment" when a stuck puzzle suddenly opens up is deeply rewarding. Appeals to completionist psychology. |
| **Best examples** | Sudoku.com (Easybrain) -- 300M+ downloads; Good Sudoku (Zach Gage, 2020) -- reinvented UX with smart highlighting; NYT Sudoku -- daily ritual format |

---

### A4. Memory / Card Matching

| Field | Detail |
|-------|--------|
| **Name** | Memory Match / Concentration |
| **One-line description** | Flip cards to find matching pairs; remember positions of previously revealed cards |
| **Core loop** | Flip card -> see image -> flip second card -> match or mismatch -> remember positions (4-6 sec) |
| **Input type** | Tap (flip card) |
| **Session length** | 1-5 minutes per round |
| **Canvas complexity** | 1/5 -- grid of rectangles with flip animation (simple scale transform). No physics, no collision. Card shuffle + pair tracking. One of the simplest Canvas games to build. |
| **Addictiveness** | 4/5 -- memory challenge creates personal performance pressure. Increasing grid sizes provide difficulty curve. Fast rounds encourage "one more." |
| **Monetization fit** | 4/5 -- ad between rounds (high frequency, short rounds), rewarded video for "peek" power-up, themed card packs as IAP (meme characters). |
| **Viral potential** | 4/5 -- perfect for meme content (brainrot characters on cards), "can you beat my time?" sharing, visually appealing card flip reveals |
| **What makes it fun** | Tests working memory -- a cognitive skill everyone thinks they're good at. The frustration of *just* missing a pair you saw 3 flips ago creates retry motivation. Meme character reveals create micro-surprise moments. |
| **Best examples** | Concentration (classic card game); Match Pair Mania (mobile); Simon (1978, electronic memory variant) |

---

### A5. Minesweeper

| Field | Detail |
|-------|--------|
| **Name** | Minesweeper |
| **One-line description** | Uncover grid tiles without hitting mines; numbers reveal adjacent mine counts |
| **Core loop** | Tap tile -> see number or mine -> deduce safe tiles -> flag suspected mines -> repeat (5-8 sec) |
| **Input type** | Tap (reveal), long-press or double-tap (flag mine) |
| **Session length** | 2-10 minutes |
| **Canvas complexity** | 1/5 -- pure grid, numbered tiles, mine/flag states. Flood-fill reveal for zero-tiles. No animation needed. Extremely well-documented implementation. |
| **Addictiveness** | 4/5 -- risk/reward tension of each click. Logical deduction satisfies puzzle brain. Instant death from wrong click creates tension. Speed-running community proves long-term engagement. |
| **Monetization fit** | 3/5 -- ad on death (less frequent than action games), rewarded video for "undo last click," hint reveals. Longer sessions mean fewer ad touchpoints. |
| **Viral potential** | 3/5 -- "I survived / I died on the last tile" moments are shareable. Nostalgia factor (Windows Minesweeper). Speed-run times create leaderboard competition. |
| **What makes it fun** | Every click is a calculated risk. The tension between "I know this is safe" and "but what if I'm wrong" creates constant low-grade anxiety that resolves satisfyingly. The endgame -- when only a few tiles remain -- is peak tension. |
| **Best examples** | Microsoft Minesweeper (1990) -- the original, installed on billions of PCs; Minesweeper Online (browser) -- modernized version; Antimine (2025, Android) -- modern mobile adaptation |

---

## Category B: Timing/Rhythm (5 Mechanics)

---

### B1. Piano Tiles (Don't Tap the White Tile)

| Field | Detail |
|-------|--------|
| **Name** | Piano Tiles / Don't Tap the White Tile |
| **One-line description** | Tap black tiles as they scroll down; miss one or tap white = game over |
| **Core loop** | Tiles scroll down -> identify black tile -> tap -> speed increases -> repeat or die (2-4 sec cycle) |
| **Input type** | Tap (multi-lane, up to 4 columns) |
| **Session length** | 1-3 minutes (high death frequency, instant restart) |
| **Canvas complexity** | 1/5 -- 4-column grid, rectangles scrolling down, tap hit detection, speed increment. No physics, no complex rendering. Arguably simpler than Flappy Bird. |
| **Addictiveness** | 5/5 -- speed escalation creates perfect flow ramp. Near-misses feel physical. Score shame drives retry. Sessions are so short that "one more" costs nothing psychologically. |
| **Monetization fit** | 5/5 -- death every 30-90 seconds = high-frequency interstitial placement. Rewarded video for "slow down" power-up or continue. Song/theme unlocks as IAP. |
| **Viral potential** | 4/5 -- "how fast can you go" challenges are TikTok-native. Speed-run clips are visually impressive. Easy to add meme sound effects. |
| **What makes it fun** | Primal hand-eye coordination test. The accelerating speed creates a moment where conscious processing fails and reflexes take over -- that edge-of-control feeling is addictive. The simplicity means failure feels 100% personal, not unfair. |
| **Best examples** | Piano Tiles 2 (Cheetah Mobile) -- 1B+ downloads; Magic Tiles 3 (Amanotes) -- hundreds of millions of downloads, 45K+ songs; Don't Tap the White Tile (original, 2014) |

---

### B2. Color Switch

| Field | Detail |
|-------|--------|
| **Name** | Color Switch |
| **One-line description** | Tap to propel a colored ball through rotating obstacles, passing only through matching-color segments |
| **Core loop** | Tap to jump -> ball rises -> pass through matching color segment of rotating obstacle -> collect star -> repeat (3-5 sec) |
| **Input type** | Tap (single input, timing-based) |
| **Session length** | 1-3 minutes |
| **Canvas complexity** | 1/5 -- circle/arc rendering for obstacles, rotation animation, color matching on collision. Single ball physics (gravity + tap impulse). Very similar to Flappy Bird architecture. |
| **Addictiveness** | 5/5 -- 200M+ downloads prove the mechanic. Color-matching adds a cognitive layer on top of timing. Rotating obstacles create mesmerizing visual patterns. Instant death = instant retry. |
| **Monetization fit** | 5/5 -- fastest mobile game in history to 50M downloads. Death frequency matches Flappy Bird. 2600+ levels in the original = massive content depth. Character skins as IAP. |
| **Viral potential** | 3/5 -- colorful visual style is screenshot-friendly. "What's your high score?" sharing. Less clip-worthy than Piano Tiles but more visually striking. |
| **What makes it fun** | Dual challenge: timing (when to tap) + pattern recognition (which color segment is approaching). The rotating obstacles create a hypnotic visual that masks the difficulty ramp. Color-switching mechanic means you can't just develop one rhythm -- you must constantly adapt. |
| **Best examples** | Color Switch (Fortafy Games, 2015) -- 200M+ downloads, 34 modes; Color Bump 3D; Color Road (Voodoo) |

---

### B3. Ball Bounce Timing

| Field | Detail |
|-------|--------|
| **Name** | Bouncing Ball / Platform Timing |
| **One-line description** | Tap to bounce a ball between platforms; miss the platform and fall to death |
| **Core loop** | Ball falls -> tap to change direction/bounce -> land on platform -> repeat with increasing speed/gaps (3-5 sec) |
| **Input type** | Tap (single input, timing-only) |
| **Session length** | 1-3 minutes |
| **Canvas complexity** | 1/5 -- ball with gravity, platforms as rectangles, simple collision, side-scroll or vertical-scroll. Nearly identical architecture to Flappy Bird with different visual arrangement. |
| **Addictiveness** | 5/5 -- pure timing challenge with zero cognitive overhead. The ball's trajectory is always predictable, so failure is always "my fault." Speed ramp creates flow state. |
| **Monetization fit** | 4/5 -- frequent deaths enable interstitial placement. Continue tokens via rewarded video. Ball/platform skins as IAP. Slightly fewer ad opportunities than Piano Tiles due to marginally longer runs. |
| **Viral potential** | 3/5 -- high scores shareable, near-miss clips, but visually simple compared to more colorful games |
| **What makes it fun** | The satisfying physics of a perfect bounce. The ball's arc is elegant and predictable -- mastery feels attainable but the speed keeps pushing you past your limit. It's the platonic form of "easy to learn, hard to master." |
| **Best examples** | Bouncy Ball (mobile); Helix Jump (Voodoo, 2018) -- 500M+ downloads; Doodle Jump (Lima Sky, 2009) -- genre precursor with 30M+ downloads |

---

### B4. Crossy Road / Frogger (Endless Hopper)

| Field | Detail |
|-------|--------|
| **Name** | Crossy Road / Frogger |
| **One-line description** | Hop forward through lanes of traffic, rivers, and trains; one wrong move = death |
| **Core loop** | Tap to hop forward -> dodge car -> hop -> ride log -> hop -> dodge train -> repeat (3-6 sec per danger) |
| **Input type** | Tap (forward), swipe (directional hop: left, right, backward) |
| **Session length** | 2-5 minutes |
| **Canvas complexity** | 2/5 -- lane-based obstacle spawning, simple grid movement, collision detection per lane. No complex physics. Character is grid-locked. Similar to endless runner but discretized movement. |
| **Addictiveness** | 5/5 -- Crossy Road made $10M in 90 days with $0 marketing spend. Instant death + instant restart. The "I could see the gap" near-miss drives retries. Endless format means no skill ceiling. |
| **Monetization fit** | 5/5 -- Crossy Road proved the model: 70%+ revenue from ads, 30% from character unlocks (gacha machine). Rewarded video for coins. Interstitial on death. Emotion-responsive ad triggers (show "watch ad" only on new high score). |
| **Viral potential** | 3/5 -- character collection is shareable, funny death moments create clips, but visual style is specific (voxel art in original). Meme character skins increase shareability significantly. |
| **What makes it fun** | Decision-making under time pressure. Each lane presents a new "puzzle" of timing. The variety of hazard types (cars, trains, rivers, eagles) prevents monotony. The "just one more hop" feeling -- you can always see the next safe spot but reaching it is the challenge. |
| **Best examples** | Crossy Road (Hipster Whale, 2014) -- 200M+ downloads, $10M in 90 days; Frogger (Konami, 1981) -- arcade original; Crossy Road Castle (2020, Apple Arcade) |

---

### B5. Don't Touch the Line / Maze Path

| Field | Detail |
|-------|--------|
| **Name** | Don't Touch the Line / Maze Runner |
| **One-line description** | Navigate a dot/character through a scrolling maze without touching the walls |
| **Core loop** | Drag/move through gap -> walls scroll toward you -> find next gap -> pass through or die (3-5 sec) |
| **Input type** | Drag (continuous touch movement) or tap to change direction |
| **Session length** | 1-3 minutes |
| **Canvas complexity** | 1/5 -- line/wall rendering, point-in-polygon or distance collision detection, auto-scroll. No physics, no complex state. Extremely minimal rendering pipeline. |
| **Addictiveness** | 4/5 -- constant tension. Any wall contact = death. The continuous input means you're always engaged (no waiting). Speed escalation ramps difficulty smoothly. |
| **Monetization fit** | 4/5 -- frequent deaths, short runs. Interstitial on death. Rewarded video for shield/second chance. Maze themes/skins as IAP. |
| **Viral potential** | 3/5 -- "how far did you get" shareable, maze designs can be visually interesting, but less clip-worthy than physics-based games |
| **What makes it fun** | Primal avoidance instinct. The narrowing gaps create claustrophobic tension. Continuous input (drag) creates a physical connection to the game that tap-based games lack. Every death feels like it happened by millimeters. |
| **Best examples** | ZigZag (Ketchapp, 2015); Impossible Game (FlukeDude); aa (General Adaptive Apps) -- pin-placement variant |

---

## Category C: Physics/Trajectory (5 Mechanics)

---

### C1. Slingshot Launch (Angry Birds)

| Field | Detail |
|-------|--------|
| **Name** | Angry Birds / Slingshot Launcher |
| **One-line description** | Pull back slingshot to launch projectiles at destructible structures to eliminate targets |
| **Core loop** | Pull slingshot -> aim trajectory -> release -> projectile arcs -> structures collapse -> assess damage -> next shot (6-10 sec) |
| **Input type** | Drag (pull-back to aim), release (fire) |
| **Session length** | 5-15 minutes per session, 1-3 min per level |
| **Canvas complexity** | 3/5 -- requires physics simulation (gravity, velocity, collision), destructible structures (block stacking, break thresholds), particle effects for debris. A physics library (Matter.js) simplifies this significantly but adds dependency. Custom physics is doable but takes 3-5 days. |
| **Addictiveness** | 4/5 -- strategic puzzle solving with satisfying destruction physics. Star rating per level drives perfectionism. Angry Birds proved 5B+ downloads worth of engagement. |
| **Monetization fit** | 4/5 -- inter-level ads, power-up birds as IAP, hint system (rewarded video to show optimal angle), level packs. |
| **Viral potential** | 3/5 -- spectacular destruction moments are clip-worthy. Solution-sharing culture. Character IP drives merchandise (proven by Angry Birds movie franchise). |
| **What makes it fun** | Destruction is inherently satisfying. The physics simulation makes each shot feel unique -- trajectories are predictable but outcomes are chaotic. The gap between "good shot" and "perfect shot" drives replay of levels for 3-star ratings. |
| **Best examples** | Angry Birds (Rovio, 2009) -- 5B+ downloads; Crush the Castle (Armor Games, 2009) -- precursor; Angry Birds 2 (2015) -- modernized with card-based bird selection |

---

### C2. Bubble Shooter

| Field | Detail |
|-------|--------|
| **Name** | Bubble Shooter / Bust-a-Move |
| **One-line description** | Aim and shoot colored bubbles to create clusters of 3+ matching colors, clearing them from the board |
| **Core loop** | Aim -> shoot bubble -> bubble snaps to hex grid -> match 3+ of same color -> they pop -> orphaned bubbles fall -> next bubble (5-8 sec) |
| **Input type** | Tap/drag to aim, release to shoot (angle-based aiming) |
| **Session length** | 5-15 minutes |
| **Canvas complexity** | 2/5 -- hexagonal grid logic, trajectory line rendering, bubble snap-to-grid, cluster detection (BFS/flood fill), gravity for orphaned bubbles. Well-documented with full Canvas tutorials available. |
| **Addictiveness** | 5/5 -- satisfying pop + cascade chain reactions. The board slowly descending adds time pressure. Easy early levels hook players before difficulty ramps. Proven engagement over 30+ years of the format. |
| **Monetization fit** | 5/5 -- lives system (wait or pay), extra bubbles via rewarded video, color-change power-ups as IAP, interstitial between levels. One of the highest-monetizing casual genres. |
| **Viral potential** | 2/5 -- less visually dramatic than physics games, but massive install bases prove broad appeal. Cascade chain reactions are the most clip-worthy moments. |
| **What makes it fun** | Skill expression through angle mastery. Bank shots off walls feel masterful. Chain reactions (clearing a cluster that drops orphaned bubbles that trigger more clears) create unearned "genius" moments. The descending ceiling creates escalating urgency. |
| **Best examples** | Bust-a-Move / Puzzle Bobble (Taito, 1994) -- genre originator; Bubble Witch Saga (King); Bubble Shooter (Ilyon, mobile) -- 100M+ downloads |

---

### C3. Paper Toss

| Field | Detail |
|-------|--------|
| **Name** | Paper Toss / Throw-into-Target |
| **One-line description** | Flick/swipe to throw a paper ball into a trash can, accounting for wind |
| **Core loop** | Judge wind direction/strength -> swipe to throw -> ball arcs through air -> lands in bin or misses -> repeat (4-6 sec) |
| **Input type** | Swipe (flick gesture determines angle and power) |
| **Session length** | 2-5 minutes |
| **Canvas complexity** | 1/5 -- parabolic arc trajectory, wind offset as simple horizontal force, collision with target rectangle. Minimal rendering: ball, bin, wind indicator. One of the simplest physics games. |
| **Addictiveness** | 4/5 -- satisfying "swish" when it goes in. Wind variation prevents memorization. Streak-based scoring (consecutive makes) adds pressure. Quick rounds = low commitment per attempt. |
| **Monetization fit** | 5/5 -- extremely fast rounds mean very high ad frequency. Interstitial every few throws. Rewarded video for "no wind" power-up. Different rooms/environments as progression (office, airport, bathroom). |
| **Viral potential** | 3/5 -- "I made 20 in a row" streak sharing. Satisfying arc physics look good in clips. Easy to meme-theme (throwing brainrot items into toilets, etc.). |
| **What makes it fun** | Extremely intuitive -- everyone has thrown paper into a trash can. The wind mechanic adds just enough variability to prevent skill ceiling. Streaks create "don't break the chain" tension. The swipe gesture feels physical and satisfying. |
| **Best examples** | Paper Toss (Backflip Studios, 2009) -- 100M+ downloads; Paper.io (Voodoo); Trick Shot (gaming studios) |

---

### C4. Basketball Shot / Arc Trajectory

| Field | Detail |
|-------|--------|
| **Name** | Basketball Shot / Hoop Shooter |
| **One-line description** | Flick a basketball into a hoop with the right arc, power, and angle |
| **Core loop** | Assess hoop distance/height -> swipe to set arc -> ball flies -> swish or miss -> hoop moves to new position -> repeat (4-6 sec) |
| **Input type** | Swipe/drag (arc trajectory), release to shoot |
| **Session length** | 2-5 minutes |
| **Canvas complexity** | 1/5 -- near-identical to Paper Toss. Parabolic arc, hoop collision (rim + net), ball bounce physics. Can add backboard ricochet for depth. Minimal rendering. |
| **Addictiveness** | 4/5 -- "nothing but net" swish is deeply satisfying. Streak mechanics (consecutive baskets) create escalating tension. Moving hoops prevent memorization. Universal sports appeal. |
| **Monetization fit** | 5/5 -- same fast-round model as Paper Toss. Interstitial between rounds. Rewarded video for "bigger hoop" or extra shots. Ball skins, court themes as IAP. |
| **Viral potential** | 3/5 -- streak clips are shareable ("I made 50 in a row"). Clean visual arc is aesthetically pleasing. Sports theme has broad appeal. |
| **What makes it fun** | The physics of a basketball arc are universally understood. The "swish" sound is one of the most satisfying audio cues in gaming. Progressive difficulty (hoop moves, shrinks, moves faster) prevents the game from feeling solved. |
| **Best examples** | TapTap Shots (CrazyGames); Basketball FRVR; Basket Random (RHM Interactive) -- 2-player variant |

---

### C5. Pool / Billiards

| Field | Detail |
|-------|--------|
| **Name** | Pool / 8-Ball Billiards |
| **One-line description** | Aim cue stick, set power, shoot balls into pockets using angle geometry |
| **Core loop** | Aim cue -> set power -> shoot -> balls collide and scatter -> assess table -> plan next shot (8-15 sec) |
| **Input type** | Drag (aim direction), pull-back (power), release (shoot) |
| **Session length** | 5-15 minutes per game |
| **Canvas complexity** | 4/5 -- ball-to-ball elastic collision physics, ball-to-cushion bounce angles, friction/deceleration, spin mechanics (optional), pocket detection, trajectory preview line. Significantly more complex than other physics games. Achievable but takes 4-5 days. |
| **Addictiveness** | 4/5 -- deep skill expression through geometry. Multi-ball planning rewards strategic thinking. 8 Ball Pool (Miniclip) proved massive engagement. Turn-based pacing works for longer sessions. |
| **Monetization fit** | 3/5 -- longer sessions mean fewer ad touchpoints. Works better with wagering mechanics (virtual coins bet per game). Cue skins, table themes as IAP. Rewarded video for hints/trajectory preview. |
| **Viral potential** | 3/5 -- trick shots are highly clip-worthy. 8 Ball Pool is one of the most-played mobile games globally. "Did you see that bank shot?" sharing. |
| **What makes it fun** | Geometry made tangible. Planning 2-3 shots ahead rewards strategic thinking. The satisfying click of ball-on-ball contact. Combo shots (potting multiple balls) create "genius" moments. The simplicity of the rules masks deep strategic depth. |
| **Best examples** | 8 Ball Pool (Miniclip) -- 800M+ downloads, $2B+ lifetime revenue; Pool Live Pro; Billiards (FRVR) -- HTML5 browser version |

---

## Category D: Survival/Arena (5 Mechanics)

---

### D1. Slither / Grow Arena (Agar.io Style)

| Field | Detail |
|-------|--------|
| **Name** | Slither.io / Agar.io (Grow Arena) |
| **One-line description** | Control a growing entity in an arena; eat smaller things, avoid bigger ones |
| **Core loop** | Move around arena -> eat pellets -> grow bigger -> encounter other player -> eat or flee (5-8 sec decision cycle) |
| **Input type** | Drag/mouse-follow (continuous directional control), tap for boost |
| **Session length** | 3-10 minutes per life |
| **Canvas complexity** | 2/5 -- viewport camera following player, circle rendering for entities, size-based collision (big eats small), pellet spawning. AI bots can substitute for multiplayer. No complex physics. |
| **Addictiveness** | 5/5 -- growth progression is inherently compelling. Risk/reward of approaching large enemies. "I was THIS big and then I died" creates strong retry motivation. Leaderboard position drives engagement. |
| **Monetization fit** | 4/5 -- ad on death, rewarded video for size boost or speed boost at start, cosmetic skins as IAP. Moderate session length. |
| **Viral potential** | 3/5 -- "I was #1 on the leaderboard" screenshots. Growth timelapse clips. Dramatic death moments when a large entity gets eaten. |
| **What makes it fun** | Power fantasy -- growing from tiny to dominant is satisfying. The arena creates natural drama: every encounter is a risk assessment. The "big fish eats little fish" dynamic is instinctively understood. Getting revenge on an entity that killed you in a past life is deeply satisfying. |
| **Best examples** | Agar.io (Matheus Valadares, 2015) -- pioneered the .io genre; Slither.io (Steve Howse, 2016) -- 100M+ players; Hole.io (Voodoo, 2018) -- 3D variant with swallowing mechanic |

---

### D2. Hole.io (Black Hole Swallow)

| Field | Detail |
|-------|--------|
| **Name** | Hole.io / Black Hole Arena |
| **One-line description** | Control a growing black hole that swallows objects and other players; biggest hole wins |
| **Core loop** | Move hole over small objects -> swallow them -> hole grows -> swallow bigger objects -> compete with other holes (3-5 sec per object) |
| **Input type** | Drag (continuous directional movement) |
| **Session length** | 2-5 minutes (timed rounds, typically 2 min) |
| **Canvas complexity** | 2/5 -- top-down city map, circle collision with size comparison, object scaling as hole grows, simple AI for competing holes. 2D rendering is straightforward; the original is 3D but a 2D version captures the same mechanic. |
| **Addictiveness** | 5/5 -- growth mechanic is inherently satisfying. Timed rounds create urgency. Swallowing a competing player's hole is a power rush. Short rounds = high replay. |
| **Monetization fit** | 4/5 -- interstitial between rounds (2-min rounds = 20+ ad opportunities per hour). Rewarded video for size boost at start. Hole skins/city themes as IAP. |
| **Viral potential** | 3/5 -- "I swallowed the entire city" clips. Growth progression is visually dramatic. Competitive moments against other holes create drama. |
| **What makes it fun** | Oddly satisfying consumption mechanic. The scale progression -- from swallowing lamp posts to swallowing buildings -- creates a power fantasy arc within each 2-minute round. The competitive element adds urgency beyond simple collection. |
| **Best examples** | Hole.io (Voodoo, 2018) -- #1 App Store in 20+ countries; Donut County (Ben Esposito, 2018) -- narrative single-player variant; Hole and Fill (casual mobile) |

---

### D3. Bullet Hell / Dodge Pattern

| Field | Detail |
|-------|--------|
| **Name** | Bullet Hell / Pattern Dodge |
| **One-line description** | Dodge dense patterns of projectiles while surviving as long as possible |
| **Core loop** | Projectiles spawn in patterns -> player navigates through gaps -> pattern intensifies -> survive or die (continuous, 3-5 sec per wave) |
| **Input type** | Drag (continuous precise movement), or tap to teleport/dash |
| **Session length** | 1-5 minutes |
| **Canvas complexity** | 2/5 -- spawn projectiles in geometric patterns, move them along vectors, player hitbox collision with small circles. The art is in pattern design, not code complexity. Rendering many circles is trivial for Canvas. |
| **Addictiveness** | 4/5 -- pattern memorization + reflex creates deep mastery curve. Near-misses feel dramatic. The visual spectacle of dodging dense bullet fields is inherently thrilling. |
| **Monetization fit** | 3/5 -- ad on death (moderate frequency). Rewarded video for shield/continue. Ship/character skins as IAP. Less natural ad integration than simpler games (interrupting flow is costly). |
| **Viral potential** | 4/5 -- dense bullet patterns are visually spectacular in clips. "I can't believe I survived that" moments. The Touhou community proves decades-long clip-sharing culture. |
| **What makes it fun** | The "dance" of weaving through seemingly impossible bullet patterns. When you're in the zone, it feels like a meditation -- pure spatial awareness. The visual contrast between the dense field of danger and the tiny safe gaps creates constant tension. Survival feels earned, not lucky. |
| **Best examples** | Touhou series (ZUN, 1997+) -- genre-defining; Just Shapes & Beats (Berzerk Studio); Vampire Survivors (poncle) -- reversed the formula (you're the bullet hell) |

---

### D4. Tower Defense

| Field | Detail |
|-------|--------|
| **Name** | Tower Defense |
| **One-line description** | Place defensive towers along a path to destroy waves of enemies before they reach your base |
| **Core loop** | Wave starts -> enemies walk path -> place/upgrade tower -> tower shoots enemies -> earn gold -> spend gold on more towers (8-15 sec per decision) |
| **Input type** | Tap (place tower), tap (upgrade/sell), drag (some variants for aiming) |
| **Session length** | 10-30 minutes per map |
| **Canvas complexity** | 3/5 -- pathfinding (or pre-defined paths), tower targeting logic, projectile rendering, wave spawning system, upgrade trees, resource management. More systems than most casual games but each system is simple. |
| **Addictiveness** | 4/5 -- "just one more wave" compulsion. Strategic depth from tower placement and upgrade decisions. Failure on wave 19/20 creates strong retry motivation. Optimizing builds is endlessly replayable. |
| **Monetization fit** | 4/5 -- premium tower/hero unlocks as IAP, rewarded video for bonus gold or extra life, interstitial between waves or on defeat. Speed-up button behind rewarded ad. |
| **Viral potential** | 2/5 -- less clip-friendly than action games. Strategy discussion and build-sharing has niche appeal. "I beat impossible mode" screenshots. |
| **What makes it fun** | Strategic planning with real-time feedback. Watching your defensive network shred enemy waves is deeply satisfying. The tension of "will my towers hold?" as a boss enemy approaches creates dramatic moments. Each replay allows a different strategic approach. |
| **Best examples** | Bloons TD 6 (Ninja Kiwi, 2018) -- genre benchmark, $100M+ revenue; Kingdom Rush (Ironhide, 2011) -- mobile classic; Plants vs. Zombies (PopCap, 2009) -- lane-defense variant |

---

### D5. Vampire Survivors (Horde Survival / Auto-Attack)

| Field | Detail |
|-------|--------|
| **Name** | Vampire Survivors / Horde Survival |
| **One-line description** | Auto-attacking character vs. growing hordes; choose upgrades to survive as long as possible |
| **Core loop** | Move to dodge enemies -> auto-attacks fire -> collect XP gems -> level up -> choose upgrade from 3 options -> repeat (10-15 sec between upgrades) |
| **Input type** | Drag/joystick (movement only; attacks are automatic) |
| **Session length** | 15-30 minutes per run |
| **Canvas complexity** | 3/5 -- entity spawning system (hundreds of enemies), auto-targeting projectiles, XP/loot collection, upgrade system with weapon combinations, performance optimization for rendering 500+ sprites simultaneously. The enemy count is the main technical challenge. |
| **Addictiveness** | 5/5 -- "$7M revenue in first month" proves engagement. Roguelike upgrade choices create unique runs. The power fantasy of mowing down thousands of enemies is viscerally satisfying. "One more run to try this build" is extremely compelling. |
| **Monetization fit** | 4/5 -- character/weapon unlocks as IAP, rewarded video for bonus upgrade choice or continue, interstitial on death. Longer sessions mean fewer but higher-value ad touchpoints. |
| **Viral potential** | 3/5 -- screen-filling projectile chaos is visually spectacular. Build discussion generates content. "I got the broken combo" clips. Genre exploded on TikTok in 2022-2023. |
| **What makes it fun** | The power ramp. You start weak and fragile, and 20 minutes later you're an unstoppable force of destruction. The upgrade choices create meaningful decisions that feel impactful. The "bullet heaven" visual spectacle of your attacks covering the screen is uniquely satisfying. Movement-only input means low barrier to entry. |
| **Best examples** | Vampire Survivors (poncle, 2022) -- $7M first month, 10M+ copies; Brotato (Blobfish); Halls of Torment -- dark fantasy variant |

---

## Category E: Creative/Building (5 Mechanics)

---

### E1. Merge / Evolution

| Field | Detail |
|-------|--------|
| **Name** | Merge / Evolution Chain |
| **One-line description** | Drag identical items together to merge them into higher-tier versions; discover the evolution chain |
| **Core loop** | Spawn new item -> drag onto matching item -> they merge into next tier -> board fills up -> manage space -> repeat (4-6 sec) |
| **Input type** | Drag and drop |
| **Session length** | 5-20 minutes (can run passively) |
| **Canvas complexity** | 2/5 -- grid-based board, drag-and-drop mechanics, tier system (item A + item A = item B), spawn timer. No physics. Visual simplicity -- each tier just needs a different sprite/icon. |
| **Addictiveness** | 5/5 -- "What's the next evolution?" discovery drive. Merge Dragons proves years-long engagement. The board always feels close to a breakthrough merge. Idle elements (auto-spawning) keep pulling players back. |
| **Monetization fit** | 5/5 -- premium currency for instant merges, extra board space, speed-up spawning. Rewarded video for bonus items. Time-gated content (energy/hearts). One of the highest ARPU casual genres. |
| **Viral potential** | 2/5 -- less visually dramatic, but "look what I evolved" reveals have sharing appeal. Merge chains involving meme characters would be highly shareable in brainrot context. |
| **What makes it fun** | Collection and discovery instinct. Each merge is a micro-surprise. The board management creates a constant puzzle of space optimization. The evolution chain taps into completionist psychology -- you must see the final tier. Idle elements mean progress happens even when away. |
| **Best examples** | Merge Dragons! (Gram Games, 2017) -- genre pioneer; Merge Mansion (Metacore); Triple Town (Spry Fox) -- original merge mechanic |

---

### E2. Tycoon / Idle Management

| Field | Detail |
|-------|--------|
| **Name** | Tycoon / Idle Management Sim |
| **One-line description** | Build and manage a business by tapping to serve customers, upgrading facilities, and automating operations |
| **Core loop** | Customer arrives -> tap to serve -> earn money -> spend on upgrades -> unlock new areas -> automate previous areas (6-10 sec active, then idle) |
| **Input type** | Tap (serve/collect), drag (place items) |
| **Session length** | 5-15 minutes active, then checks every 1-4 hours for idle earnings |
| **Canvas complexity** | 3/5 -- multi-area rendering, character pathing (customers walk to service points), upgrade state management, idle timer system, prestige/reset mechanics. More systems to manage than action games but each is simple. |
| **Addictiveness** | 4/5 -- "just one more upgrade" loop. Idle earnings create check-in habit. Prestige systems (reset for permanent bonuses) add long-term depth. Watching numbers go up is inherently satisfying. |
| **Monetization fit** | 5/5 -- highest monetization ceiling. Premium currency for speed-ups, ad-free offline earnings multiplier, rewarded video for 2x earnings, time-skip IAP. The idle loop creates natural "impatience" monetization. |
| **Viral potential** | 2/5 -- "look at my empire" screenshots. Less clip-friendly but "I reached $1 Trillion" milestones are shareable. Tycoon themes (meme factory, brainrot studio) add personality. |
| **What makes it fun** | The dopamine of optimization -- making systems run more efficiently. The numbers-going-up feedback loop. The satisfying arc from manual tapping to fully automated empire. Prestige resets create "I know a better path this time" motivation. |
| **Best examples** | Idle Supermarket Tycoon (Codigames); Adventure Capitalist (Hyper Hippo); Idle Hotel Empire (Kolibri Games) |

---

### E3. Cooking / Recipe Rush

| Field | Detail |
|-------|--------|
| **Name** | Cooking / Time Management Rush |
| **One-line description** | Prepare and serve food orders under time pressure by tapping through recipe steps |
| **Core loop** | Order appears -> tap ingredients -> tap cook -> tap serve -> collect payment -> next order (5-8 sec per order) |
| **Input type** | Tap (select ingredients, cook, serve), drag (optional for plating) |
| **Session length** | 3-10 minutes per level |
| **Canvas complexity** | 3/5 -- multiple interactive stations, order queue UI, timer per order, multi-step recipe logic, customer patience meter, combo scoring. More UI complexity than most mechanics. |
| **Addictiveness** | 4/5 -- time pressure creates flow state. Multi-order juggling ramps difficulty naturally. "I almost served them all" near-miss drives replay. Level-based progression provides clear goals. |
| **Monetization fit** | 4/5 -- extra lives/continues via rewarded video, kitchen upgrades as IAP, interstitial between levels, ingredient boosts. Time-pressure creates "just let me try again" impulse purchases. |
| **Viral potential** | 2/5 -- less clip-friendly than action games. "Chaos kitchen" moments can be funny. Recipe themes with meme ingredients (skibidi sauce, sigma grindset smoothie) add shareability. |
| **What makes it fun** | Multitasking under pressure. The satisfaction of completing a rush of orders perfectly. Overcooked proved this creates hilarious failure moments. The cooking metaphor is universally relatable. Progressive recipe complexity adds learning curve. |
| **Best examples** | Overcooked (Team17, 2016) -- co-op classic; Cooking Mama (Office Create); Cooking Fever (Nordcurrent) -- 200M+ downloads |

---

### E4. Doodle / Draw and Guess

| Field | Detail |
|-------|--------|
| **Name** | Draw and Guess / Pictionary |
| **One-line description** | Draw a given word/prompt for others to guess, or guess what others are drawing |
| **Core loop** | Receive prompt -> draw on canvas -> others guess in real-time -> points for speed -> rotate drawer (15-60 sec per round) |
| **Input type** | Drag (drawing strokes), tap (guess letters or select answer) |
| **Session length** | 5-15 minutes per game |
| **Canvas complexity** | 3/5 -- freeform drawing on canvas (stroke capture, line rendering, undo), word prompt system, timer, scoring. Single-player variant: draw and AI guesses, or guess what a pre-drawn image is. Multiplayer requires networking (adds significant complexity). |
| **Addictiveness** | 4/5 -- social games create laughter and memorable moments. The creative expression + guessing combo engages both sides of the brain. Skribbl.io proves long-term engagement. |
| **Monetization fit** | 3/5 -- ad between rounds, word hint IAP, custom color/brush packs, premium word packs. Harder to monetize aggressively without breaking social flow. |
| **Viral potential** | 4/5 -- funny drawings are inherently shareable. Gartic Phone proved this is TikTok-native content. AI-guess variants create hilarious misinterpretation clips. Meme prompts increase shareability. |
| **What makes it fun** | Creative expression without artistic pressure (bad drawings are funnier). The social dynamic of miscommunication creates organic comedy. Time pressure forces quick, imperfect drawings that are inherently entertaining. The "how did they guess that from THIS?" moments are memorable. |
| **Best examples** | Skribbl.io (browser) -- millions of daily players; Gartic Phone -- telephone variant; Quick, Draw! (Google) -- AI guesses your drawing |

---

### E5. Sandbox Builder / Destruction

| Field | Detail |
|-------|--------|
| **Name** | Sandbox / Physics Playground |
| **One-line description** | Build structures from blocks/shapes, then optionally destroy them with physics forces |
| **Core loop** | Place block -> stack/arrange -> test stability -> add force (bomb/ball/gravity) -> watch destruction -> rebuild (varies, 10-30 sec per build) |
| **Input type** | Drag (place blocks), tap (activate destruction), pinch (zoom, optional) |
| **Session length** | 5-20 minutes (open-ended) |
| **Canvas complexity** | 3/5 -- physics stacking (gravity, collision), block placement grid, destruction forces (explosions, projectiles). Can range from simple (no physics, just stacking) to complex (full rigid body simulation). Basic version is 2-3 days; physics-rich version is 4-5 days. |
| **Addictiveness** | 3/5 -- creative freedom is engaging but lacks the "one more try" compulsion of score-based games. Destruction satisfaction adds replay value. Challenge modes (build X with Y blocks) add structure. |
| **Monetization fit** | 3/5 -- block/material packs as IAP, premium destruction tools, rewarded video for special blocks. Less natural ad frequency than score-based games. |
| **Viral potential** | 4/5 -- "look what I built" sharing. Spectacular destruction clips. "Build and destroy" format is TikTok-native (satisfying destruction videos get millions of views). |
| **What makes it fun** | Creative freedom + destructive satisfaction. Building something takes effort; watching it get destroyed is cathartic. The physics simulation makes each destruction unique. Open-ended play allows personal expression. |
| **Best examples** | Bad Piggies (Rovio, 2012) -- vehicle building; Poly Bridge (Dry Cactus) -- bridge construction; Demolition 3D (casual mobile) -- pure destruction |

---

## Category F: Word/Trivia (5 Mechanics)

---

### F1. Wordle Clone (Daily Word Guess)

| Field | Detail |
|-------|--------|
| **Name** | Wordle / Daily Word Guess |
| **One-line description** | Guess a 5-letter word in 6 tries; colored feedback shows correct/misplaced/wrong letters |
| **Core loop** | Type word -> submit -> see green/yellow/gray feedback -> narrow possibilities -> guess again (15-30 sec per guess) |
| **Input type** | Tap (on-screen keyboard) |
| **Session length** | 2-5 minutes per puzzle |
| **Canvas complexity** | 1/5 -- grid of letter tiles with color states, keyboard UI, word validation against dictionary. Zero physics, zero animation needed (though flip animations add polish). Can be built with DOM instead of Canvas. The simplest game in this entire catalog. |
| **Addictiveness** | 5/5 -- scarcity (one puzzle per day) creates anticipation. Streak maintenance drives daily return. The puzzle is always solvable with logic, creating satisfying "I figured it out" moments. Grew from 90 to 2M+ daily players in 2 months. |
| **Monetization fit** | 3/5 -- daily format limits ad impressions. Endless/practice mode enables more ads. Hint system via rewarded video. Premium word packs. NYT paid $1M+ to acquire it. Lower ad frequency than action games but very high retention. |
| **Viral potential** | 5/5 -- the emoji-grid sharing format was a viral innovation that drove Wordle from 90 to 300K players in 2 months. Built-in sharing mechanic is the gold standard. Spoiler-free result sharing is genius. Brainrot vocabulary variant has huge meme potential. |
| **What makes it fun** | Cognitive puzzle that rewards vocabulary AND deduction. The colored feedback creates an information cascade -- each guess teaches you something. The daily format makes it a ritual, not a grind. Solving in 2-3 guesses feels like genius. The social sharing creates community and gentle competition. |
| **Best examples** | Wordle (Josh Wardle, 2021) -- acquired by NYT; Connections (NYT) -- group-finding variant; Quordle -- 4 simultaneous Wordles |

---

### F2. Trivia Quiz

| Field | Detail |
|-------|--------|
| **Name** | Trivia Quiz / Question Challenge |
| **One-line description** | Answer multiple-choice questions against a timer; streak bonuses for consecutive correct answers |
| **Core loop** | Question appears -> read 4 options -> tap answer -> right/wrong feedback -> next question (5-10 sec) |
| **Input type** | Tap (select answer from 4 choices) |
| **Session length** | 3-10 minutes |
| **Canvas complexity** | 1/5 -- text rendering, 4 button areas, timer bar, score display. The complexity is in content (questions), not code. Question database can be JSON. Simplest game to build after Wordle. |
| **Addictiveness** | 4/5 -- knowledge validation is inherently satisfying ("I knew that!"). Streak mechanics create "don't break the chain" tension. Timer adds urgency to prevent deliberation. Topic variety keeps it fresh. |
| **Monetization fit** | 5/5 -- interstitial between rounds (high frequency), rewarded video for extra life/skip question, premium topic packs as IAP, 50/50 lifeline via ad. HQ Trivia proved the model (before it collapsed for non-game reasons). |
| **Viral potential** | 3/5 -- "I got 20/20 on the Brainrot Quiz" sharing. Topic-specific quizzes (meme knowledge, character identification) are highly shareable in niche communities. Challenge-a-friend format. |
| **What makes it fun** | Knowledge validation ego boost. The timer creates tension even on easy questions. Wrong answers teach something new. Brainrot/meme-specific trivia (identify the character, name the meme, complete the catchphrase) taps directly into community identity. |
| **Best examples** | HQ Trivia (Intermedia Labs, 2017) -- live trivia with real money prizes; Trivia Crack (Etermax) -- 700M+ downloads; QuizUp (Plain Vanilla) |

---

### F3. Word Search

| Field | Detail |
|-------|--------|
| **Name** | Word Search / Word Find |
| **One-line description** | Find hidden words in a grid of letters by swiping across them |
| **Core loop** | Scan grid -> spot word -> swipe across letters -> word highlights -> check word list -> find next (5-10 sec per word) |
| **Input type** | Swipe/drag (across letter grid to select word) |
| **Session length** | 3-10 minutes per puzzle |
| **Canvas complexity** | 1/5 -- letter grid rendering, swipe gesture detection across grid cells, word validation, highlight animation. Pure grid logic, no physics. Grid generation algorithm (place words, fill remaining with random letters) is the only non-trivial part. |
| **Addictiveness** | 3/5 -- relaxing "zen" gameplay. Satisfying to find a word you missed. Less "one more try" compulsion than action games but strong in "just one more word" territory. Good for wind-down sessions. |
| **Monetization fit** | 4/5 -- hint system (reveal first letter) via rewarded video, themed puzzle packs as IAP, interstitial between puzzles. Longer sessions than action games but consistent engagement. |
| **Viral potential** | 3/5 -- "I found them all in 45 seconds" time-sharing. Themed word searches (brainrot terms, meme character names) tap into community knowledge. Completion screenshots. |
| **What makes it fun** | Pattern recognition in a relaxed context. The "aha!" moment of spotting a word hiding in plain sight. Themed puzzles create contextual fun (finding brainrot terms in a grid). Completionist satisfaction of finding every word. No failure state reduces anxiety while maintaining engagement. |
| **Best examples** | Word Search Pro (Word Game Studio); Wordscapes (PeopleFun) -- crossword variant; CodyCross (Fanatee) -- themed word puzzles |

---

### F4. Hangman

| Field | Detail |
|-------|--------|
| **Name** | Hangman / Letter Guess |
| **One-line description** | Guess a hidden word one letter at a time; too many wrong guesses and the character is complete (game over) |
| **Core loop** | See blank spaces -> guess a letter -> revealed or wrong -> update figure -> guess again (5-8 sec per guess) |
| **Input type** | Tap (letter selection from alphabet) |
| **Session length** | 1-3 minutes per word |
| **Canvas complexity** | 1/5 -- alphabet buttons, blank word display, stick figure drawing (6-8 body parts). Zero physics, zero animation needed. Can add meme character reveal instead of stick figure. One of the simplest possible games. |
| **Addictiveness** | 4/5 -- word-guessing is universally engaging. The visual death countdown creates urgency. Fast rounds encourage "one more word." Brainrot vocabulary (guess meme terms) creates knowledge-flex appeal for target audience. |
| **Monetization fit** | 3/5 -- ad between words (high frequency, short rounds), rewarded video for "reveal a letter" hint, themed word packs as IAP. Lower CPM potential than action games but decent frequency. |
| **Viral potential** | 4/5 -- "I guessed SKIBIDI TOILET in 3 letters" sharing. The stick figure / character drawing is visual and amusing. Brainrot vocabulary makes it a community knowledge test. Easy to screenshot and share. |
| **What makes it fun** | Deduction from partial information. Each correct letter is a dopamine hit. Each wrong letter raises the stakes. The word reveal at game over (when you lose) teaches new vocabulary. Using meme/brainrot vocabulary transforms it from educational to cultural. |
| **Best examples** | Hangman (classic paper game); Evil Hangman (algorithmic variant that cheats); Wheel of Fortune (TV show variant with bonus letter buying) |

---

### F5. Type Racer / Speed Typing

| Field | Detail |
|-------|--------|
| **Name** | Type Racer / Typing Speed |
| **One-line description** | Type a displayed phrase as fast and accurately as possible; race against clock or opponents |
| **Core loop** | Phrase appears -> type characters -> correct chars highlight green -> mistakes flash red -> complete phrase -> see WPM score (15-30 sec per phrase) |
| **Input type** | Keyboard input (physical or on-screen keyboard) |
| **Session length** | 2-10 minutes |
| **Canvas complexity** | 2/5 -- text rendering with per-character color states, cursor position tracking, WPM calculation, accuracy tracking, race visualization (cars/characters moving across screen based on typing speed). Keyboard input handling is the main consideration. Mobile on-screen keyboard works but is less satisfying than desktop. |
| **Addictiveness** | 4/5 -- WPM score creates personal benchmark to beat. Competitive racing format adds urgency. Accuracy pressure (mistakes slow you down) creates tension. "I can do better" drives immediate replay. |
| **Monetization fit** | 3/5 -- ad between races, premium phrase packs, rewarded video for "slow motion" mode or practice rounds. Less monetizable than tap games but strong in competitive context. |
| **Viral potential** | 4/5 -- "I type at 120 WPM" is a flex worth sharing. Speed-typing clips are satisfying to watch. Meme phrase typing (type brainrot copypasta) creates community-specific content. Leaderboard competition drives engagement. |
| **What makes it fun** | Speed mastery is inherently satisfying. The race metaphor (cars/characters advancing) makes abstract skill concrete. Typing meme phrases adds cultural relevance. The WPM number is a universal benchmark everyone understands. Competitive typing has a surprisingly passionate community. |
| **Best examples** | TypeRacer (play.typeracer.com) -- original competitive typing; MonkeyType (monkeytype.com) -- modern minimalist typing test; Typer.io -- 50+ player racing |

---

## Category Comparison Matrix

| Category | Avg Complexity | Avg Addictiveness | Avg Monetization | Avg Viral | Avg Total | Best For |
|----------|---------------|-------------------|-----------------|-----------|-----------|----------|
| **B. Timing** | 1.2 | 4.8 | 4.6 | 3.0 | **15.6** | High-volume quick sessions, maximum ad frequency |
| **F. Word** | 1.2 | 4.0 | 3.6 | 3.8 | **14.2** | Meme vocabulary showcase, daily retention, sharing |
| **A. Puzzle** | 1.6 | 4.4 | 3.8 | 3.0 | **14.6** | Longer sessions, broad demographic, proven formats |
| **C. Physics** | 2.2 | 4.2 | 4.4 | 2.8 | **13.4** | Satisfying feel, sports themes, clip-worthy moments |
| **D. Survival** | 2.4 | 4.6 | 3.8 | 3.0 | **12.8** | Deep engagement, competitive play, spectacle |
| **E. Creative** | 2.8 | 4.0 | 4.0 | 2.8 | **12.4** | Long-term retention, high ARPU, passive play |

---

## Build Order Recommendation

### Phase 1: Ship This Week (Complexity 1, Score 15+)
1. **Piano Tiles** (18) -- reskin as "Tap the Skibidi" with brainrot sound effects
2. **Color Switch** (17) -- brainrot color palette, meme character as ball
3. **Wordle Clone** (17) -- "Brainrotle" with meme vocabulary dictionary
4. **Memory Match** (16) -- brainrot character card pairs

### Phase 2: Next Sprint (Complexity 1-2, Score 14+)
5. **Paper Toss** (15) -- throw brainrot items into toilets
6. **Basketball Shot** (15) -- meme basketball variant
7. **Hangman** (15) -- brainrot vocabulary gallows
8. **Match-3** (16) -- meme character gems
9. **Tetris** (15) -- falling brainrot blocks
10. **Trivia Quiz** (15) -- "How Brainrotted Are You?" quiz

### Phase 3: Depth Builders (Complexity 2-3, Score 12+)
11-20. Merge, Crossy Road, Bubble Shooter, Slither, Hole.io, Type Racer, Minesweeper, Bullet Hell, Sudoku, Word Search

### Phase 4: Premium Builds (Complexity 3-4, Score 11+)
21-30. Tycoon, Cooking Rush, Slingshot, Doodle, Sandbox, Rhythm Tap, Tower Defense, Pool, Vampire Survivors, Don't Touch Line

---

## Sources

- Piano Tiles / Magic Tiles 3 -- App Store listings, 2024-2025
- Color Switch -- Fortafy Games, 200M+ downloads (RocketGames.io, 2025)
- Wordle viral growth -- Smithsonian Magazine, January 2022; CNBC, February 2022; Wikipedia
- Match-3 psychology -- GameRefinery analysis, 2024; Renatus Studio, 2024
- Tetris -- HTML5 Canvas tutorials (DEV Community, CodeProject, GitHub gists)
- Crossy Road revenue model -- MobileDevMemo case study; Medium (Kenneth Ng); $10M in 90 days
- Bubble Shooter -- Rembound HTML5 tutorial; Bust-a-Move heritage
- Paper Toss / Basketball -- Backflip Studios; MarketJS HTML5 games
- Agar.io / Slither.io -- Wikipedia; GitHub vanilla JS implementations
- Hole.io -- Voodoo; CrazyGames listings
- Vampire Survivors -- Wikipedia; BulletHaven genre analysis, 2026; $7M first month revenue
- Tower Defense -- HTML5 Canvas tutorials (Curtision, Chris Courses, GitHub implementations)
- Merge games -- Udonis market analysis, 2024; MobileFreeToPlay mechanics guide
- Wordle psychology -- Tufts University neuroscience analysis; Big Think; Smithsonian
- Trivia -- HQ Trivia Wikipedia; Sensor Tower Q2 2024 trivia report
- Cooking games -- Overcooked Wikipedia; Game Developer featured blog
- Drawing games -- Skribbl.io; Gartic Phone; DoodleDuel.ai 2026 guide
- Minesweeper / Memory -- GitHub implementations (zuramai, mmenavas)
- TypeRacer -- play.typeracer.com; Typer.io
- Ad monetization -- Tenjin Ad Monetization Benchmark Report 2025; CAS.ai hybrid guide 2025
- Viral gaming -- TikTok trending games 2025; Dead As Disco 300M+ views (GamesPress)
- Casual games market -- AppMagic Casual Games Report 2025; MAF top mobile games 2025
