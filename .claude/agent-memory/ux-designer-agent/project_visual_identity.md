---
name: Visual identity system created
description: Brainrot Games visual identity guide and CSS design system created April 2026 — dark palette, Bungee + Space Grotesk, Electric Lime primary, per-game theming via data attributes
type: project
---

Created the foundational visual identity for Brainrot Games on 2026-04-10:

- **Visual identity guide** at `brand/visual-identity.md` — full spec covering color palette, typography, logo concept, game UI style guide, and 5 design principles
- **CSS design system** at `brand/design-system.css` — complete implementation with custom properties, base styles, button system, game UI components (HUD, menu screen, game-over overlay, modals, toasts), layout utilities, CSS-only animations, and per-game theming hooks via `data-theme` attributes

**Why:** This is the shared foundation that every game and the company website imports. The system is designed to be consistent across titles while allowing per-game color personality through CSS custom property overrides.

**How to apply:** All future game UIs and web pages should import `design-system.css` as their base. Per-game customization happens through `data-theme` attributes on the body element, not by overriding individual properties manually.

Key design decisions:
- Dark-first (no light mode) — audience lives on Discord/TikTok dark mode
- Electric Lime (#c8ff00) as signature primary — ownable, gaming-native, high contrast on dark
- Bungee for display, Space Grotesk for body — bold/readable pairing
- One-primary-button rule enforced across all screens
- Mobile-first with responsive token scaling at 480px and 360px breakpoints
- prefers-reduced-motion respected
