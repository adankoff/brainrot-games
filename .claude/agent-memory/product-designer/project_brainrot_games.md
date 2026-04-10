---
name: Brainrot Games project context
description: Core project structure, tech stack decisions, and game pipeline for Brainrot Games casual web games
type: project
---

Brainrot Games is a casual HTML5 web game studio targeting Gen Z/Alpha with meme-themed games. Tech stack: HTML5 Canvas + vanilla JavaScript, no frameworks, no build step. Mobile-first, dark UI (visual identity in brand/visual-identity.md).

**Why:** Fast ship cycle, SEO play on "brainrot games" search term, distribution via social sharing.

**How to apply:** All designs should be zero-dependency, Canvas 2D primitives for rendering, localStorage for persistence, no backend in v1. Games live in games/game-NN/ directories. Shared utilities in games/shared/.

Game pipeline:
- Game 01: FLAPPY TRALALERO (Flappy Bird + Italian brainrot) -- games/game-01/
- Game 02: WHACK-A-ROT (Whack-a-Mole + Italian brainrot) -- games/game-02/
- Game 03: Sigma Grindset Simulator (idle clicker) -- future

Brand voice: self-aware, lowercase, deadpan humor. Score label = "AURA POINTS". Per-game accent colors from extended palette. Fonts: Bungee (display), Space Grotesk (body).
