---
name: GDD-02 WHACK-A-ROT design decisions
description: Key design decisions and scope for WHACK-A-ROT game design document
type: project
---

GDD-02 written to design-docs/GDD-02.md on 2026-04-10. Key decisions:

- 60-second timed rounds (not lives-based) for predictable session length and ad placement
- 6 characters: Tralalero (100pt), Bombardiro (200pt fast), Tung Tung (150pt small hitbox), Ballerina Cappuccina (150pt sways), Brr Brr Patapim (-200pt penalty), Lirili Larila (500pt rare bonus)
- All characters drawn with Canvas 2D primitives, no image assets
- Combo system: 0.25x per consecutive hit, capped at 4.0x (combo 12)
- Difficulty via invisible 15-second waves, carry-over across rounds via effectiveWave formula
- Sound is OUT of scope for v1 (specced as Web Audio oscillator synthesis for v1.1)
- Boss character (Cappuccino Assassino) deferred to v1.1
- Italian Red (#ff3838) as per-game accent color

**Why:** Ship core loop fast, validate fun, add polish in v1.1.

**How to apply:** Developer implements from this GDD alone. 11 JS files, no dependencies, no build step.
