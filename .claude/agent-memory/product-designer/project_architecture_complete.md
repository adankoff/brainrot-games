---
name: Architecture documents completed
description: Three architecture docs produced 2026-04-10 -- shared ARCHITECTURE.md, game-01-architecture.md, game-02-architecture.md
type: project
---

Architecture documents completed 2026-04-10 in /architecture/:
- ARCHITECTURE.md: shared infrastructure (GameShell, utils, sound-manager, score-manager, input-manager, share, styles), directory structure, data flow, dev server
- game-01-architecture.md: Flappy Tralalero implementation addendum (Player/Obstacle/Background entities, 4-state machine with ready/active sub-states, difficulty formulas, character system)
- game-02-architecture.md: Whack-a-Rot implementation addendum (Hole/SpawnScheduler/Timer/ComboCounter/Effects entities, 3-state machine, wave system, difficulty formulas)

**Why:** Developer agents need implementation-ready specs with complete API definitions, no ambiguity.

**How to apply:** Reference these docs when reviewing implementation PRs or designing new features that touch shared modules. The shared module APIs are contracts -- changes need cross-game impact analysis.
