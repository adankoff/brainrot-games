# visual identity guide
## brainrot games
### april 2026

---

## 1. color palette

dark backgrounds. electric accents. the visual language of playing games at 2am when you should be sleeping.

the entire palette is built around a dark base because: (a) games look better on dark backgrounds, (b) our audience lives on Discord, TikTok dark mode, and dimmed-phone-in-bed browsing, (c) neon accents on dark surfaces create the energy this brand needs, and (d) dark backgrounds make game elements pop without competing for attention.

### primary palette

| Role | Name | Hex | Usage | Rationale |
|------|------|-----|-------|-----------|
| **Background** | Void | `#0a0a0f` | Page backgrounds, game canvas default | Nearly black with a slight blue-purple undertone. Not pure black (#000) because that's harsh and lifeless. The undertone gives it depth — feels like a screen, not a hole. |
| **Surface** | Charcoal | `#16161f` | Cards, menus, overlays, modals | One step up from void. Provides layering without leaving the dark world. The slight warmth makes UI elements feel like objects floating on the background. |
| **Surface Elevated** | Slate | `#1e1e2e` | Hovered cards, active states, input fields | Third layer. Creates enough contrast hierarchy for complex menus without introducing light colors. |
| **Primary** | Electric Lime | `#c8ff00` | Primary buttons, key actions, score highlights, main accent | This is the brand's signature color. Lime on dark is arresting — it vibrates. It says "tap this" without saying a word. Lime green reads as gaming (Xbox, Razer, Mountain Dew) and energy without being the cliche electric blue of every other tech brand. It's also unusual enough to be ownable. |
| **Secondary** | Hot Magenta | `#ff2d78` | Secondary actions, error states, health/damage, destruction themes | The chaos complement to lime's energy. Magenta reads as playful and slightly dangerous. On dark backgrounds it glows. It's the "you died" color, the "new high score" color, the accent that keeps the palette from being one-note. |
| **Accent** | Cyan Pulse | `#00e5ff` | Links, info states, collectibles, ice/water themes, tertiary highlights | Adds a cooler dimension to the palette. Cyan is the universal "information" color in gaming UI and it reads as futuristic and digital. Balances the warm-leaning primary/secondary pair. |
| **Warning** | Brainrot Yellow | `#ffd000` | Warnings, coins, XP, special items, achievement flashes | Every game needs gold. This warm, saturated yellow is the "you earned something" color. Reads instantly as currency/reward across all gaming contexts. |
| **Text Primary** | White Smoke | `#f0f0f0` | Body text, headings | Not pure white (#fff) which causes eye strain on dark backgrounds. Slightly softened for comfortable reading during long sessions. |
| **Text Secondary** | Muted | `#8888a0` | Captions, labels, inactive UI, helper text | Low enough contrast to recede but still readable. The slight purple undertone keeps it feeling integrated with the palette rather than just "gray." |
| **Text Tertiary** | Ghost | `#555570` | Disabled states, decorative text, watermarks | For elements that need to be present but not demanding attention. |

### the extended palette (per-game theming)

each game can introduce 1-2 additional accent colors from this approved extended palette. these are pre-tested against our dark backgrounds for contrast and energy.

| Name | Hex | Suggested Use |
|------|-----|---------------|
| Sigma Purple | `#b44dff` | Sigma/rizz themed games, premium/rare items |
| Ohio Orange | `#ff6b2b` | Ohio themed games, fire/explosion effects |
| Skibidi Blue | `#4d7dff` | Skibidi themed games, faction coloring |
| Italian Red | `#ff3838` | Italian brainrot themed games, danger states |
| Mint Aura | `#00ffaa` | Aura-themed scoring, positive streaks, healing |

### color contrast checks (WCAG AA)

all text/background pairings meet WCAG AA minimum contrast (4.5:1 for body text, 3:1 for large text):

- White Smoke (#f0f0f0) on Void (#0a0a0f) — 17.8:1 (passes AAA)
- White Smoke (#f0f0f0) on Surface (#16161f) — 15.2:1 (passes AAA)
- Muted (#8888a0) on Void (#0a0a0f) — 5.6:1 (passes AA)
- Electric Lime (#c8ff00) on Void (#0a0a0f) — 14.9:1 (passes AAA)
- Hot Magenta (#ff2d78) on Void (#0a0a0f) — 5.1:1 (passes AA for large text, use 18px+)
- Cyan Pulse (#00e5ff) on Void (#0a0a0f) — 10.8:1 (passes AAA)

note: Hot Magenta should be used at 18px+ font size or with a slight text-shadow for body text on dark backgrounds. for smaller text, pair it with the Surface background instead of Void.

### light mode? no.

the brand does not have a light mode. games are played on dark backgrounds. the website uses a dark background. if a light context is ever needed (print, email templates), use Void as the text color on a #fafafa background with Electric Lime accents.

---

## 2. typography

### display font: Bungee

```
Google Fonts import:
<link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet">
```

**what it is:** a blocky, all-caps display face designed by David Jonathan Ross for the Google Fonts library. originally inspired by urban signage — marquees, storefronts, gym lettering.

**why it works for brainrot games:**
- it looks like an arcade cabinet had a baby with a protest sign. loud, chunky, unapologetic.
- all-caps by nature, which aligns with the "game title screen" vibe without us forcing uppercase.
- it has weight and presence at large sizes but doesn't try to be cute or whimsical — it's blunt.
- it's distinctive without being illegible. you can read "BRAINROT GAMES" in Bungee from across a room.
- it pairs naturally with neon/glow effects because the thick strokes catch light/shadow treatments.
- it has a subtle mechanical quality that says "built" not "designed" — matches the operator brand tone.

**usage:**
- game titles
- main headings (h1, h2 on marketing pages)
- score displays and large numbers
- logo treatment (the wordmark is Bungee)
- button text on oversized/hero buttons ONLY (not standard UI buttons)
- NEVER used for body text. NEVER used below 20px. this font is a headline or nothing.

### body font: Space Grotesk

```
Google Fonts import:
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**what it is:** a geometric sans-serif by Florian Karsten. proportional counterpart to Space Mono. has a slightly technical, slightly retro quality.

**why it works:**
- geometric DNA makes it pair naturally with Bungee's blockiness. they share structural logic.
- but it's softer and more readable at small sizes — the slight humanist touches in the letterforms keep it warm.
- the "space" aesthetic gives it a vaguely digital/sci-fi feeling without being an actual monospace or pixel font.
- excellent weight range (400-700) gives us flexibility for UI hierarchy.
- renders cleanly on mobile screens at 14-16px, which is where most of our text lives.
- it doesn't try to be fun. that's important. the display font is the personality. the body font is the clarity.

**usage:**
- all body text, descriptions, menu items
- button labels
- score labels (not the score number itself — that's Bungee)
- navigation
- form inputs
- captions, helper text, metadata

### type scale

based on a 1.25 ratio (major third) from a 16px base. this scale gives enough differentiation between levels without getting too large too fast — important because our UI is often inside game canvases with limited real estate.

| Token | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| `--text-xs` | 12px | 400 | Space Grotesk | Fine print, timestamps, version numbers |
| `--text-sm` | 14px | 400 | Space Grotesk | Captions, helper text, secondary labels |
| `--text-base` | 16px | 400 | Space Grotesk | Body text default |
| `--text-md` | 18px | 500 | Space Grotesk | Large body, emphasized paragraphs |
| `--text-lg` | 20px | 600 | Space Grotesk | Section headings in-game, small card titles |
| `--text-xl` | 24px | 700 | Space Grotesk or Bungee | Sub-headings, menu titles |
| `--text-2xl` | 32px | — | Bungee | Page headings, game-over text |
| `--text-3xl` | 40px | — | Bungee | Hero headings, game titles |
| `--text-4xl` | 56px | — | Bungee | Score displays, splash text |
| `--text-5xl` | 72px | — | Bungee | Giant score numbers, title screens |

### type rules

1. **Bungee is always uppercase.** the font is designed for it. lowercase Bungee looks broken.
2. **Space Grotesk body text is always sentence case.** no title case on menu items, buttons, or labels. lowercase is the brand. "start game" not "Start Game."
3. **letter-spacing on Bungee: +0.02em at display sizes, +0.05em at text sizes.** the tight default spacing gets muddy on dark backgrounds. a little breathing room helps.
4. **line-height for body text: 1.6.** generous leading is non-negotiable for readability on screens. for headings: 1.1-1.2 (tighter because Bungee is already chunky).
5. **max body text width: 65ch.** reading long lines on a screen is miserable. this keeps paragraphs comfortable.
6. **never use font-weight below 400 for body text on dark backgrounds.** thin type on dark surfaces becomes invisible.

---

## 3. logo concept

### the wordmark

the logo is the words **BRAINROT GAMES** set in Bungee. that's it. no symbol, no mascot, no abstract mark.

**why text-only:**
- the company name IS the brand signal. "Brainrot Games" communicates everything instantly. a symbol adds nothing.
- a wordmark in Bungee is distinctive enough to function as a logo at any size.
- text logos are easier to render in HTML (no image assets), faster to load, and work in every context: favicon, social avatar, game splash screen, watermark.
- trying to design a "brainrot icon" would either be too literal (a melting brain) or too abstract to mean anything. the words do the work.

**treatment:**
- always set in Bungee, always uppercase (the font's natural state)
- primary version: Electric Lime (#c8ff00) on dark backgrounds
- the text should have a subtle glow effect: `text-shadow: 0 0 20px rgba(200, 255, 0, 0.3)` — like neon signage, not like a Photoshop tutorial
- on very small surfaces (favicon, app icon), abbreviate to **BRG** in the same style
- the tagline "your brain on memes" appears below the wordmark in Space Grotesk, weight 400, Text Secondary color (#8888a0), at roughly 40% of the wordmark's size

**lockup variations:**
1. **full lockup** — "BRAINROT GAMES" + tagline below. for website header, about pages, press kit.
2. **compact** — "BRAINROT GAMES" only. for game splash screens, social headers.
3. **minimal** — "BRG" monogram. for favicons, app icons, watermarks on score cards.
4. **inline** — "brainrot games" in Space Grotesk bold (not Bungee) for running text contexts where the display font would be overkill. lowercase.

**clear space:** maintain padding equal to the height of the "B" in BRAINROT on all sides. nothing crowds the wordmark.

---

## 4. game UI style guide

every brainrot games title should feel like it belongs to the same family while having its own flavor. this is achieved through a shared UI system with per-game theming.

### 4.1 buttons

**primary button:**
- background: Electric Lime (#c8ff00)
- text: Void (#0a0a0f) — black text on lime for maximum contrast
- font: Space Grotesk, 600 weight, 16px, sentence case
- padding: 12px 24px
- border-radius: 12px (--radius-md)
- no border
- hover: brightness increases slightly (filter: brightness(1.1)), subtle box-shadow glow in primary color
- active/pressed: scale(0.97) transform, brightness drops slightly (filter: brightness(0.9))
- disabled: opacity 0.4, no hover effect
- the primary button is the loudest element on any screen. there should be only ONE primary button visible at a time.

**secondary button:**
- background: transparent
- border: 2px solid current text color (adapts to context)
- text: Text Primary (#f0f0f0)
- same font, padding, radius as primary
- hover: background fills to Surface Elevated (#1e1e2e), border color shifts to Electric Lime
- active: scale(0.97)
- use for: secondary actions, "back," "settings," "how to play"

**icon button:**
- 48x48px minimum tap target (mobile accessibility)
- circular: border-radius 50%
- background: Surface (#16161f)
- icon color: Text Secondary (#8888a0)
- hover: background shifts to Surface Elevated, icon color to Text Primary
- use for: close, mute, settings gear, share, pause

**ghost button:**
- no background, no border
- text: Text Secondary (#8888a0)
- hover: text shifts to Text Primary
- use for: less important navigation, "skip," "maybe later"

### 4.2 score / HUD display

the HUD (heads-up display) is what the player sees DURING gameplay. it must be readable at a glance without distracting from the game.

**positioning:**
- score: top-center of the canvas, 16px from the top edge
- secondary info (lives, level, timer): top-left or top-right corners, 12px from edges
- pause button: top-right corner, always accessible

**score number style:**
- font: Bungee
- size: --text-4xl (56px) for the primary score, scaling down on smaller screens
- color: Text Primary (#f0f0f0) with a subtle drop shadow for readability over game backgrounds
- text-shadow: `2px 2px 0 rgba(0,0,0,0.5)` — ensures readability over any game background
- when score changes: brief scale animation (scale up to 1.2 then back to 1.0, 150ms) + flash to Electric Lime then back to white. keeps the score feeling alive.

**score label (e.g., "score" or "aura points"):**
- font: Space Grotesk, 500 weight
- size: --text-sm (14px)
- color: Text Secondary (#8888a0)
- positioned directly above or below the score number
- optional — if the context is obvious (it's a score, everyone knows), skip the label

**lives / health:**
- represented as icons (hearts, character faces, etc.) not numbers
- max 3-5 icons, positioned top-left
- lost lives are ghost colored (#555570), remaining are Hot Magenta (#ff2d78)
- losing a life triggers a screen-edge flash in Hot Magenta (CSS only, no JS animation library needed — use a pseudo-element with animation)

### 4.3 menu screen layout

the menu screen is what players see before the game starts. it's also the first impression. it needs to load instantly and communicate "tap to play" within 1 second.

**layout (top to bottom, centered):**
1. game title — Bungee, --text-3xl, Electric Lime, centered
2. subtitle or tagline — Space Grotesk, --text-sm, Text Secondary, centered
3. game character or visual — centered, takes up middle 40% of screen height
4. "start game" primary button — big, impossible to miss
5. secondary actions row — "how to play," "leaderboard," "settings" as ghost buttons in a horizontal row
6. brainrot games logo watermark — bottom center, minimal lockup, Ghost color (#555570)

**rules:**
- no scrolling. the entire menu fits in one viewport.
- the primary action (start game) is in the thumb zone on mobile (lower half of screen).
- the game character or visual should have a subtle idle animation (CSS only — a gentle float or pulse).
- background: Void (#0a0a0f) with optional subtle pattern or gradient per game theme.
- no loading spinner is visible. if the game hasn't loaded yet, the menu still appears with the button disabled + "loading..." text. the player should always see something instantly.

### 4.4 game-over screen layout

this is the most important screen in the entire game because it's the screen people screenshot and share. design it for screenshots.

**layout (centered overlay on dimmed game canvas):**
1. "game over" or equivalent — Bungee, --text-2xl, Hot Magenta
2. final score — Bungee, --text-5xl, Electric Lime, the biggest thing on screen
3. score label (e.g., "aura points") — Space Grotesk, --text-sm, Text Secondary
4. high score — if new high score, flash "NEW HIGH SCORE" in Brainrot Yellow with animation. if not, show "best: [X]" in Text Secondary.
5. share button — primary button style, "share score" or "flex this." this opens share functionality (Web Share API or copy-to-clipboard with pre-written share text + score).
6. retry button — secondary button style, "try again" or "run it back"
7. other actions — ghost buttons: "menu," "other games"

**overlay style:**
- the game canvas behind the overlay should dim to ~20% brightness
- overlay background: Surface (#16161f) at 95% opacity, centered, max-width 400px, padded 32px, border-radius --radius-lg (16px)
- optional: subtle border-glow in the game's accent color
- animation: the overlay slides or fades in (200ms ease-out). the score counts up from 0 to final (if applicable — adds drama).

**share card design:**
when a player shares, the output should be a pre-formatted text string (for platforms that don't support image sharing) or a canvas-rendered image card. the text format:

```
i got [SCORE] in [GAME NAME] 💀
[URL]
```

the image card (if rendered): dark background, game title, score in Bungee, character graphic, brainrot games logo. keep it vertical (story-format ratio, 1080x1920) for Instagram/TikTok sharing.

### 4.5 modal / overlay style

for settings panels, "how to play" screens, confirmation dialogs, etc.

- background: Surface (#16161f) at 95% opacity
- border-radius: --radius-lg (16px)
- padding: 24px
- max-width: 420px, centered
- backdrop: Void at 70% opacity (dark scrim behind the modal)
- close button: icon button (X) in the top-right corner of the modal
- title: Space Grotesk, --text-lg, 600 weight, Text Primary
- body text: Space Grotesk, --text-base, 400 weight, Text Primary
- actions: at the bottom of the modal, right-aligned (or centered on mobile)
- entry animation: fade in + slight scale up (from 0.95 to 1.0), 200ms ease-out
- exit animation: fade out, 150ms

### 4.6 color usage rules

| Context | Color to Use | Why |
|---------|-------------|-----|
| Primary action (the ONE thing you want the player to do) | Electric Lime | It's the loudest color. One per screen. |
| Secondary actions | Transparent/border or Surface | Quieter. Doesn't compete with primary. |
| Destructive/negative (death, damage, lose life) | Hot Magenta | Reads as danger/loss without being boring red. |
| Informational (tutorials, hints, tooltips) | Cyan Pulse | Cool, calm, "here's some info." |
| Reward/achievement (coins, XP, high scores, unlocks) | Brainrot Yellow | Universal "you earned this" color. |
| Score / primary number displays | Electric Lime or Text Primary | Depends on context. Lime for emphasis, white for neutral. |
| Background layers | Void → Surface → Surface Elevated | Each layer up = slightly lighter. Never more than 3 layers. |
| Disabled elements | Ghost (#555570) or 40% opacity | Clearly communicates "you can't interact with this." |
| Per-game accent | Pick ONE from the extended palette | Games can have their own flavor but only add one extra color, not five. |

**the one-primary-button rule:** on any given screen, only ONE element should use Electric Lime as its background. everything else is secondary. this creates an instant visual hierarchy — the player always knows what to do.

---

## 5. design principles

five rules. apply them to every screen of every game.

### 1. readable at arm's length

73% of our players are on phones. UI text must be legible at 14px minimum. Buttons must be 48px tall minimum. Score numbers must be visible even in a shaky-hand playing-on-the-bus context. if you have to squint, it's too small.

### 2. every screen is a screenshot

the game-over screen, the title screen, even the gameplay itself — any of these could end up as a TikTok thumbnail, a Discord embed, or a group chat screenshot. design every screen as if it might be the image that goes viral. that means: clean composition, the score visible, the game title visible, no half-rendered UI elements.

### 3. dark, electric, not edgy

the brand is playful-chaotic, not grimdark. we use dark backgrounds because they make neon colors pop and games look better, not because we're trying to look like a hacker movie. the accents should feel energetic and fun. if a screen looks more like a cyberpunk dystopia than a game you'd play on the toilet, pull it back.

### 4. one tap to the action

the fastest path from "I opened this link" to "I'm playing the game" should be ONE tap. the menu exists to orient, not to gatekeep. no mandatory tutorials, no sign-up walls, no splash screens you have to wait through. load the menu, tap play, you're in. everything else (settings, leaderboards, how to play) is optional and secondary.

### 5. consistent skeleton, unique skin

every game shares the same structural bones: where the score goes, where the buttons go, how the game-over screen is laid out, how modals work. this means a player who's played one brainrot game instinctively knows how to navigate the next one. but each game has its own color accent, character art, and atmosphere. the skeleton is the system. the skin is the personality.
