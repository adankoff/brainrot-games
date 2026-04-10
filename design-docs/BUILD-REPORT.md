# Build Report: Brainrot Games v1

**Date:** 2026-04-10

---

## 1. What Was Built

### Landing Page (`/index.html`)
- Marketing homepage for Brainrot Games
- Hero section, game cards grid (2 games), about section, footer
- Responsive design with design system tokens
- Links to both games

### Game 01: Flappy Tralalero (`/games/game-01/`)
- Flappy Bird clone with Italian brainrot meme characters
- 7 playable characters (Tralalero Tralala, Bombardiro Crocodilo, Lirili Larila, Tung Tung Tung Sahur, Cappuccino Assassino, Brr Brr Patapim, La Vaca Saturno Saturnita)
- Character unlock system (score milestones + hidden easter egg)
- 5 themed obstacle types with pass-through visual effects
- 3-layer parallax background with biome transitions every 25 points
- Procedural audio via Web Audio API
- Score persistence, sharing, death messages by tier

### Game 02: Whack-a-Rot (`/games/game-02/`)
- Whack-a-mole game with brainrot characters
- 6 character types with unique behaviors (standard, fast, slow/small hitbox, swaying, penalty, rare bonus)
- Combo multiplier system (up to 4.0x) with milestone feedback
- 60-second rounds with 4-wave difficulty progression
- 3x3 hole grid with character rise/sink clipping animations
- Ambient particles, floating score text, screen shake effects
- Procedural audio, score persistence, sharing

### Shared Infrastructure (`/games/shared/`)
- `game-shell.js` -- State machine (menu/playing/game-over), game loop with delta-time normalization, canvas resize, DOM overlay management, score count-up animation
- `input-manager.js` -- Unified touch/mouse/keyboard input with logical coordinate conversion
- `score-manager.js` -- localStorage wrapper for high scores and game data with graceful fallback
- `sound-manager.js` -- Web Audio API oscillator synthesis with preset sounds and custom registration
- `share.js` -- Web Share API with clipboard fallback
- `utils.js` -- Collision detection (AABB, circle, point), math utilities (lerp, clamp, random, easing)
- `styles.css` -- Shared game chrome (scroll prevention, canvas centering, overlay layout)

### Brand Assets (`/brand/`)
- `design-system.css` -- Full design token system: colors, typography, spacing, components, animations, theme hooks

---

## 2. How to Run

```bash
cd /Users/alex/www/brainrot-games
npx live-server
```

This starts a local HTTP server (required for ES module imports). The landing page opens at `http://localhost:8080/` (or whichever port live-server selects).

Direct game URLs:
- Flappy Tralalero: `http://localhost:8080/games/game-01/`
- Whack-a-Rot: `http://localhost:8080/games/game-02/`

**Requirements:**
- Node.js (for npx)
- Modern browser (Chrome 99+, Firefox 112+, Safari 16+)
- No build step, no dependencies to install

---

## 3. Architecture Overview

```
brainrot-games/
  index.html                    Landing page
  styles.css                    Landing page styles
  brand/
    design-system.css           Design tokens + base components
  games/
    shared/
      game-shell.js             State machine + game loop framework
      input-manager.js          Touch/mouse/keyboard normalization
      score-manager.js          localStorage persistence
      sound-manager.js          Web Audio API synthesis
      share.js                  Social sharing
      utils.js                  Math/collision utilities
      styles.css                Shared game chrome
    game-01/                    Flappy Tralalero
      index.html                Entry point
      style.css                 Game-specific styles
      js/
        main.js                 Entry point, game state orchestration
        player.js               Player entity (physics, hitbox, draw)
        obstacle.js             Obstacle pair entity (gap, types, effects)
        background.js           3-layer parallax + biome system
        characters.js           7 character draw functions + metadata
        ui.js                   ScoreDisplay (on-canvas HUD)
        constants.js            All tuning values
    game-02/                    Whack-a-Rot
      index.html                Entry point
      style.css                 Game-specific styles
      js/
        main.js                 Entry point, game state orchestration
        game.js                 SpawnScheduler + GameTimer
        characters.js           6 character types with draw + hitbox
        holes.js                Hole state machine + clipping
        ui.js                   ComboCounter, ScoreDisplay, HUD elements
        effects.js              Floating text, screen shake, particles
        constants.js            All tuning values
```

**Key architectural decisions:**
- Pure ES modules, no bundler. Each game has a single `<script type="module">` entry point.
- All visuals are Canvas 2D primitives. Zero image assets. Zero loading time.
- All audio is Web Audio API oscillator synthesis. Zero audio files.
- Shared infrastructure is imported by relative path from each game's js/ directory.
- Game-specific logic plugs into GameShell via callbacks (onStart, onUpdate, onRender, onGameOver).
- Delta-time normalization ensures consistent behavior across 60Hz/120Hz/144Hz displays.

---

## 4. Known Limitations

1. **No ad integration.** The monetization hooks described in GDD-01 are not implemented. The `Brr Brr Patapim` character unlock (requires watching 5 reward videos) is effectively inaccessible without an ad SDK.

2. **No analytics.** No event tracking, session tracking, or performance monitoring is in place.

3. **No service worker / offline support.** Games require a network connection to load (Google Fonts, ES module resolution).

4. **No image assets.** All characters are procedurally drawn. This means they look consistent but lack the visual fidelity of authored sprites. This is by design per the GDDs.

5. **`roundRect()` requirement.** The Canvas `roundRect()` method is used in several draw functions. Browsers older than Chrome 99 / Firefox 112 / Safari 16 will fail. No polyfill is included. For a 2026 release, this covers effectively all active browsers.

6. **Font loading.** Google Fonts (Bungee, Space Grotesk) are loaded via CSS `@import`. On slow connections, text may flash or render in fallback fonts before the web fonts load. No preloading or font-display optimization is applied.

7. **No pause functionality.** Flappy Tralalero has no pause (by design -- runs are 15-45 seconds). Whack-a-Rot pauses the timer when the browser tab loses focus but has no manual pause button.
