# Growth Roadmap — Brainrot Games
## 90-Day Post-Launch Plan + Long-Term Pipeline
### April 2026

---

## 90-Day Post-Launch Roadmap

### Month 1: Launch & Learn (Days 1-30)

**Week 1: Launch Sprint**
- Ship Flappy Tralalero and Whack-a-Rot to own domain (brainrotgames.com)
- Execute social media launch plan (TikTok primary, Reddit, Discord)
- Submit to Poki and CrazyGames developer portals
- Post on itch.io for indie community visibility
- Launch Discord server with high-score competition channel

**Week 2-3: Measure & Iterate**
- Add analytics (Plausible or Google Analytics) — track: game_start, game_over, score, share_click, session_duration
- Monitor metrics: DAU, session length, retry rate, share rate, bounce rate
- A/B test: death screen messaging, share card format, ad frequency
- Fix any reported bugs, polish based on feedback
- Submit "Show HN" post for Hacker News if game has a clever angle

**Week 4: Optimize**
- Implement basic ad monetization (interstitial on every 3rd death)
- Optimize for mobile performance (frame rate on low-end devices)
- Begin development on Game 3 (Sigma Grindset Simulator)
- Analyze which distribution channel drives highest-quality traffic

**Month 1 Targets:**
| Metric | Target | Stretch |
|--------|--------|---------|
| DAU | 500 | 2,000 |
| MAU | 5,000 | 20,000 |
| Avg session length | 3+ min | 5+ min |
| Share rate | 2% | 5% |
| D1 retention | 20% | 35% |

---

### Month 2: Expand & Monetize (Days 31-60)

**Game Pipeline:**
- Ship Game 3: **Sigma Grindset Simulator** (idle clicker, 2-3 day build)
- Ship Game 4: **Ohio Survival Run** (endless runner, 3-5 day build)
- Update landing page with new game cards

**Infrastructure Upgrades:**
- Add global leaderboards (Firebase Realtime Database — free tier handles 100K MAU)
- Implement "More Games" cross-promotion on all game-over screens
- Add daily challenge system (rotating target score for each game)
- Optimize ad stack: test rewarded video for "continue" mechanic

**Distribution Expansion:**
- Games live on Poki and CrazyGames (if approved in Month 1)
- Submit to GameDistribution for licensing to portal network
- Begin non-exclusive licensing conversations ($200-2000 per deal)
- Run micro-influencer outreach campaign (20 TikTok creators, 10K-100K followers)

**Month 2 Targets:**
| Metric | Target | Stretch |
|--------|--------|---------|
| DAU | 2,000 | 10,000 |
| MAU | 20,000 | 100,000 |
| Games live | 4 | 4 |
| Monthly revenue | $500 | $3,000 |
| D7 retention | 10% | 20% |

---

### Month 3: Scale & Diversify (Days 61-90)

**Game Pipeline:**
- Ship Game 5: **Skibidi Stack** (Stack game, 1-2 day build)
- Ship Game 6: **Brainrot 2048** (2048 with brainrot character tiles, 2-3 day build)
- Begin prototyping multiplayer for Whack-a-Rot (WebSocket real-time competitive mode)

**Monetization Refinement:**
- Full ad stack operational: interstitials + rewarded video + Poki rev-share
- Evaluate cosmetic IAP for top-performing game (character skins at $0.99-1.99)
- First game licensing deals closed
- Revenue reporting dashboard (simple spreadsheet or Notion)

**Platform Expansion:**
- Wrap best-performing game as Android TWA for Google Play
- Evaluate Steam launch for a premium "Brainrot Collection" bundle ($2.99)
- Community grown to 500+ Discord members
- UGC challenge: "design a brainrot character" contest

**Month 3 Targets:**
| Metric | Target | Stretch |
|--------|--------|---------|
| DAU | 5,000 | 25,000 |
| MAU | 50,000 | 250,000 |
| Games live | 6 | 6 |
| Monthly revenue | $2,000 | $15,000 |
| D30 retention | 3% | 8% |
| Poki monthly revenue | $500 | $5,000 |

---

## Game Pipeline: Next 5 Games

From the concept matrix (ranked by total score):

| Priority | Game | Mechanic | Theme | Score | Est. Build | Target Ship |
|----------|------|----------|-------|-------|-----------|-------------|
| **3** | **Sigma Grindset Simulator** | Idle Clicker | Sigma/Rizz/Mewing | 23/25 | 2-3 days | Month 2, Week 1 |
| **4** | **Ohio Survival Run** | Endless Runner | Ohio Memes | 22/25 | 3-5 days | Month 2, Week 3 |
| **5** | **Skibidi Stack** | Stack | Skibidi Toilet | 21/25 | 1-2 days | Month 3, Week 1 |
| **6** | **Brainrot 2048** | 2048 | Italian Brainrot | 19/25 | 2-3 days | Month 3, Week 2 |
| **7** | **Fanum Tax Snake** | Snake | Fanum Tax | 20/25 | 2-3 days | Month 3, Week 4 |

**Pipeline principles:**
- Alternate between trivial builds (1-2 days) and deeper games (3-5 days)
- Each game shares infrastructure, so marginal build cost decreases
- Theme diversity: don't release two same-theme games back-to-back
- Mechanical diversity: each new game should feel different to play

---

## Feature Roadmap for Shared Infrastructure

### Phase 1 (Month 1): Foundation ✅ Built
- Game shell with state machine
- Score persistence (localStorage)
- Input manager (touch/click/keyboard)
- Sound manager (Web Audio API)
- Social sharing

### Phase 2 (Month 2): Engagement
- **Global Leaderboards** — Firebase Realtime Database
  - Anonymous leaderboards (no account required)
  - Top 100 per game, updated in real-time
  - Display name entry (3-letter arcade style or custom)
- **Daily Challenges** — Rotating target scores
  - "Score 50+ in Flappy Tralalero today"
  - Streak tracking in localStorage
  - Shared challenge results for social

### Phase 3 (Month 3): Retention
- **Achievement/Badge System**
  - Per-game achievements (e.g., "Score 100 in Flappy Tralalero")
  - Cross-game achievements (e.g., "Play all 6 games")
  - Visual badge display on profile/share cards
- **User Accounts** (optional, low-friction)
  - Social login (Google) via Firebase Auth
  - Sync scores across devices
  - NOT required to play — always free and anonymous first

### Phase 4 (Month 4+): Growth
- **Multiplayer Framework**
  - WebSocket server (Cloudflare Workers or Deno Deploy)
  - Real-time competitive Whack-a-Rot (2-player split screen)
  - Ghost replay for Flappy Tralalero (race against friend's run)
- **Level Editor / UGC**
  - User-created obstacle patterns for Flappy
  - Custom character submissions for Whack-a-Rot
  - Community voting on best levels/characters

---

## Scaling Plan

### When to Invest in Art (Month 3-4)
- **Trigger:** Any single game exceeds 50K MAU consistently
- **Investment:** Commission sprite artist for character redesigns ($200-500 per character sheet)
- **Why:** Canvas-drawn shapes are fine for launch but professional sprites dramatically improve perceived quality and social shareability

### When to Invest in Sound (Month 2-3)
- **Trigger:** Games are live and playable, retention data shows room for improvement
- **Investment:** Commission 8-bit sound effects package ($100-300 for full set)
- **Alternative:** Use royalty-free packs from Kenney.nl or OpenGameArt

### When to Consider Native App Wrappers (Month 3)
- **Trigger:** 100K+ MAU on web, clear demand from mobile users
- **Android first:** TWA (Trusted Web Activity) — wraps the web game in an app shell. Free, no code changes. Submit to Google Play.
- **iOS:** Requires actual native wrapper or Capacitor. Only invest if Android proves the model ($500-1000 for basic wrapper).

### When to Hire (Month 4-6)
- **First hire:** Part-time community manager (handles Discord, social media replies) — $500-1000/month
- **Second hire:** Contract game developer to parallelize game production — $2000-4000/month
- **Trigger for both:** Monthly revenue consistently exceeds $5K

---

## KPIs and Success Metrics

### Primary KPIs (Track Daily)

| KPI | Definition | Month 1 Target | Month 3 Target |
|-----|-----------|---------------|---------------|
| **DAU** | Unique players per day | 500 | 5,000 |
| **MAU** | Unique players per month | 5,000 | 50,000 |
| **Session Length** | Average time per visit | 3 min | 4 min |
| **Sessions/User/Day** | How often players return in one day | 1.5 | 2.0 |
| **Games Played/Session** | Average rounds per visit | 5 | 8 |

### Engagement KPIs (Track Weekly)

| KPI | Definition | Target |
|-----|-----------|--------|
| **D1 Retention** | % returning next day | 20-35% |
| **D7 Retention** | % returning after 7 days | 10-20% |
| **D30 Retention** | % returning after 30 days | 3-8% |
| **Share Rate** | % of game-over screens that lead to a share | 3-5% |
| **Cross-Game Rate** | % who play both games | 30% |

### Viral KPIs (Track Weekly)

| KPI | Definition | Target |
|-----|-----------|--------|
| **K-Factor** | Users acquired per existing user | > 0.3 (anything > 1.0 = organic growth) |
| **Viral Cycle Time** | Days between share → new user → their share | < 3 days |
| **Social Impressions** | Views on shared content (TikTok, tweets) | 100K/week by Month 2 |

### Revenue KPIs (Track Monthly)

| KPI | Definition | Month 1 Target | Month 3 Target |
|-----|-----------|---------------|---------------|
| **Revenue** | Total monthly revenue | $200 | $2,000 |
| **ARPDAU** | Revenue per daily active user | $0.01 | $0.03 |
| **Monthly ARPU** | Revenue per monthly active user | $0.05 | $0.10 |
| **CPM (blended)** | Revenue per 1000 ad impressions | $3.00 | $5.00 |
| **Ad Fill Rate** | % of ad requests that serve an ad | 60% | 80% |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Italian brainrot fades before Month 3 | Medium | High | Game mechanics stand alone; new meme themes can reskin existing games in <1 day |
| Poki/CrazyGames reject our games | Medium | Medium | Own website is primary; portals are bonus distribution |
| TikTok banned in US | Low-Medium | High | YouTube Shorts and Instagram Reels as backup; Reddit/Discord organic |
| Low initial traffic | High | Medium | Expected — most indie games start slow. Budget 3 months before judging |
| Copycats clone our games | Certain | Low | Speed of iteration is the moat, not IP protection. Ship faster. |

---

*Roadmap effective April 2026. Review and update monthly based on actual metrics.*
