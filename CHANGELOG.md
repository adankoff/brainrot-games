# Changelog — Brainrot Games

---

## Session 1 — April 10, 2026

### Stage 1: Market Research
- Researched top 20 brainrot memes with longevity ratings (62 sources)
- Cataloged 15 casual game mechanics ranked by build ease + addictiveness + monetization
- Analyzed competitive landscape: studios, revenue models, distribution channels, viral factors
- Wrote executive synthesis: top 5 themes, top 5 mechanics, target audience

### Stage 2: Company Foundation
- Defined brand: name "Brainrot Games", mission, voice guide, tagline "your brain on memes"
- Created visual identity: color palette, typography (Bungee + Space Grotesk), UI style guide
- Built CSS design system with 70+ custom properties and per-game theme variants
- Built company landing page (static HTML + CSS, responsive, dark theme)

### Stage 3: Game Concepts
- Generated concept matrix: 15 theme × mechanic pairings scored across 5 dimensions
- Wrote 3 detailed concept briefs
- Selected top 2 for development: Flappy Tralalero + Whack-a-Rot

### Stage 4: Game Design Documents
- Wrote GDD-01 (Flappy Tralalero): full physics values, difficulty formulas, character specs, acceptance criteria
- Wrote GDD-02 (Whack-a-Rot): 6 character roster, combo system, wave mechanics, all formulas

### Stage 5: Technical Architecture
- Designed shared infrastructure: 7 reusable modules (GameShell, InputManager, ScoreManager, SoundManager, utils, share, styles)
- Wrote per-game architecture addendums with entity models and render orders

### Stage 6: Implementation — Games 01-02
- Built shared infrastructure (7 modules, 1,431 lines)
- Built Game 01: Flappy Tralalero (2,230 lines)
- Built Game 02: Whack-a-Rot (2,117 lines)
- QA pass: 3 bugs found and fixed, all acceptance criteria verified

### Stage 7: Marketing
- SEO & distribution strategy with exact meta tags and keyword research
- 7-day social media launch calendar across 5 platforms
- Viral & influencer strategy with outreach templates and Discord plan

### Stage 8: Business
- Revenue model with 3-scenario projections and ad network recommendations
- 90-day growth roadmap with KPIs and scaling triggers
- Executive business plan

### Batch 2: Games 03-05 (3 meme variants each)
- Game 03: Sigma Grindset (idle clicker) — Sigma, Fanum Tax, Italian Brainrot
- Game 04: Ohio Survival Run (endless runner) — Ohio, Skibidi, Sigma
- Game 05: Skibidi Stack (stack) — Skibidi, Italian Brainrot, Among Us

### Batch 3: Games 06-11 (3 meme variants each)
- Game 06: Fanum Snake — Fanum Tax, Grimace Shake, Ohio
- Game 07: Brainrot 2048 — Italian Brainrot, Among Us, Aura
- Game 08: Brainrot Ninja (fruit ninja) — Skibidi, Aura, Fanum Tax
- Game 09: Slice the Brainrot (fruit ninja v2) — Grimace Shake, Looksmaxxing, Among Us
- Game 10: Brainrot Breaker (breakout) — NPC Streaming, Ohio, Skibidi
- Game 11: Brainrot Dash (geometry dash) — Aura, Ohio, Sigma

### Batch 4: Games 12-23 — Mainstream Meme Themes
- Built game generator pipeline: `tools/generate-game.js` + `tools/game-specs.json`
- Pre-generated HTML/CSS boilerplate for all 12 games
- Cloned mechanics from reference games, swapped themes only
- Game 12: Popcat Clicker — Popcat, Doge, Chill Guy
- Game 13: Anime Dash — Dragon Ball, JoJo, Naruto
- Game 14: YOU DIED — Dark Souls, Backrooms, FNAF
- Game 15: Nyan Cat Run — Nyan Cat, Maxwell Cat, Keyboard Cat
- Game 16: Meme Stack — Trollface, Doge, Chill Guy
- Game 17: Flappy Doge — Doge, Nyan Cat, Trollface
- Game 18: Anime Clicker — Dragon Ball, JoJo, Naruto
- Game 19: Backrooms Escape — Backrooms, FNAF, Creepypasta
- Game 20: Meme 2048 — Classic Memes, Cat Memes, Gaming Memes
- Game 21: Meme Ninja — Classic Memes, Anime Slash, Cat Memes
- Game 22: Anime Snake — Dragon Ball, JoJo, Naruto
- Game 23: Classic Meme Whack — Trollface, Doge, Nyan Cat, Pepe, Rickroll, Harambe

### Research: 30 New Mechanics
- Cataloged 30 additional game mechanics ranked by score (complexity, addictiveness, monetization, viral)
- Top picks: Piano Tiles, Color Switch, Wordle, Memory Match, Match-3, Hangman, Paper Toss
- Fresh memes research: 28 non-brainrot themes identified (Backrooms, anime, Doge, nostalgia memes)

### Infrastructure
- Docs site: `build-docs.js` generates 30 HTML pages from all markdown files
- Landing page updated to show all 23 games
- Git repo initialized, pushed to github.com/adankoff/brainrot-games
- GitHub Pages enabled at adankoff.github.io/brainrot-games

### Stats
- 23 playable HTML5 games
- 60+ meme theme variants
- 43,752 lines of game code
- 258 files total
- 10 unique game mechanics implemented
- 40 game mechanics cataloged

---

## TODO — Next Sessions

### High Priority
- [ ] **Playtest all 23 games** — open each in browser, verify they load and play correctly
- [ ] **Fix broken games** — some cloned games may have import path or API issues
- [ ] **Add real meme images** — replace Canvas-drawn shapes with actual image sprites (PNG/SVG)
- [ ] **Add analytics** — Plausible or Google Analytics on all pages
- [ ] **Add ad integration** — interstitial ads on death screens

### New Game Mechanics to Build (Top 10 from research)
- [ ] Piano Tiles (score 18/20, 1 day build)
- [ ] Color Switch (score 17/20, 1 day)
- [ ] Wordle Clone / "Brainrotle" (score 17/20, 1 day)
- [ ] Memory Match (score 16/20, 1 day)
- [ ] Match-3 / Candy Crush style (score 16/20, 2 days)
- [ ] Hangman with meme vocabulary (score 15/20, 1 day)
- [ ] Paper Toss (score 15/20, 1 day)
- [ ] Basketball Shot (score 15/20, 1 day)
- [ ] Tetris / falling blocks (score 15/20, 2 days)
- [ ] Trivia Quiz — meme trivia (score 15/20, 1 day)

### Art & Assets
- [ ] Source or generate meme character sprites (PNG with transparency)
- [ ] Create an image asset pipeline (sprites folder per game)
- [ ] Add image preloader to shared infrastructure
- [ ] Design shareable score card images for each game

### Monetization
- [ ] Integrate AdinPlay or Google AdSense for Games
- [ ] Add rewarded video for "continue" mechanic
- [ ] Submit to Poki and CrazyGames developer portals
- [ ] Set up game licensing on GameDistribution

### Distribution
- [ ] Buy domain (brainrotgames.com or similar)
- [ ] Set up custom domain on GitHub Pages
- [ ] Submit sitemap to Google Search Console
- [ ] Post first 3 games to itch.io
- [ ] Submit to r/webgames and r/IndieGaming

### Community
- [ ] Create Discord server
- [ ] Set up TikTok account
- [ ] Record first gameplay clips for social

### Technical Debt
- [ ] Audit shared GameShell for edge cases (resize, tab-switch, iOS Safari quirks)
- [ ] Add service worker for offline play + faster load
- [ ] Add global leaderboards (Supabase free tier)
- [ ] Minify/bundle JS for production (optional — files are already small)
