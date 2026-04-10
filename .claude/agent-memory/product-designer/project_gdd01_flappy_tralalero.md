---
name: GDD-01 Flappy Tralalero completed
description: Game Design Document for Game 01 (Flappy Tralalero) written to design-docs/GDD-01.md on 2026-04-10. Italian brainrot Flappy Bird clone, HTML5 Canvas + vanilla JS, mobile-first.
type: project
---

GDD-01 for Flappy Tralalero completed and written to `design-docs/GDD-01.md`.

**Why:** This is Game 01 for Brainrot Games -- the first game to ship. Selected for fastest build time and strongest viral mechanic (Flappy Bird). Ships before Game 02 (Whack-a-Rot).

**How to apply:** All future design work on game-01 should reference this GDD as the source of truth. Key decisions: 360x640 logical canvas, AABB collision, 7 characters (3 for v1 launch), 5 obstacle types, Web Audio API oscillator synthesis for sound (out of scope for v1 launch but fully specced), shared infrastructure from games/shared/. Sound is explicitly out of scope for v1 -- gameplay ships first.
