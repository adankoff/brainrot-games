---
name: Landing page created
description: Company landing page built at index.html with page-specific styles.css — hero, games grid, about, footer sections. Placeholder game cards for game-01 and game-02.
type: project
---

Built the Brainrot Games landing page on 2026-04-10:

- **index.html** — single-page site with hero, games grid (2 placeholder cards), about section, and footer with social link placeholders
- **styles.css** — page-specific styles building on brand/design-system.css

**Why:** This is the company's primary web presence. It needs to convert visitors into players with minimal friction.

**How to apply:** Future updates to the landing page should edit these two files. Game cards are placeholders (game-01, game-02) — update with real game titles, descriptions, and screenshots as games ship. Social links in the footer use # placeholders and need real URLs when accounts are created.

Key design decisions:
- Hero uses CSS-only animated gradient background (rotating radial gradient + ambient drift layer) with a subtle grid texture
- Bungee wordmark in Electric Lime with double-layer neon glow treatment
- Fixed header with gradient fade-out, compact "BRG" logo
- Game cards use Surface background with gradient placeholders, lift+glow hover state
- About section uses the mission statement from brand strategy verbatim ("we make games that are bad for you in all the right ways")
- All copy written in brand voice: lowercase, deadpan, self-aware, short
- Fully responsive with breakpoints at 768px and 480px
- Reduced-motion support kills all animations
- OG and Twitter meta tags included with placeholder image URL
