# Revenue Model: Brainrot Games
## Financial Model for HTML5 Browser Game Monetization
### April 2026

---

## Model Purpose

This model answers: **What is the realistic revenue potential for Brainrot Games across a 12-month horizon, and what is the recommended monetization strategy for a two-game HTML5 browser portfolio targeting ages 8-25?**

The model supports decisions on: which ad networks to implement, when to add revenue streams, and what traffic thresholds must be reached for the business to sustain itself.

## Methodology

Bottom-up revenue build using:
- eCPM benchmarks from industry reports (Udonis, Tenjin, Appodeal 2025 data), adjusted down 20-40% for web vs. mobile
- Per-user session and ad impression modeling based on casual web game behavioral benchmarks
- Poki/CrazyGames revenue share terms from their published developer documentation
- Licensing revenue ranges from HTML5 game developer case studies (Genieee 2025)
- Three-scenario framework (conservative, moderate, optimistic) with 6-month and 12-month cumulative projections

All numbers are directional estimates grounded in published benchmarks. They are not predictions.

---

## 1. Revenue Model Analysis for HTML5 Browser Games

### 1.1 Ad-Supported Revenue

Ad revenue is the primary and most accessible monetization path for free-to-play browser games. Revenue is a function of: traffic x sessions per user x ad impressions per session x eCPM.

#### Web Game eCPM Benchmarks (adjusted from mobile data)

Web browser eCPMs run 20-40% lower than mobile app eCPMs due to lower fill rates, less sophisticated targeting, and weaker SDK ecosystems.

| Ad Format | US Web eCPM | Global Web eCPM | Source |
|-----------|------------|-----------------|--------|
| Rewarded video | $5.00-10.00 | $2.00-5.00 | Competitive landscape report; Udonis/Tenjin 2025, adjusted -30% for web |
| Interstitial | $3.00-7.00 | $1.00-3.00 | Competitive landscape report; Tenjin 2025, adjusted -30% for web |
| Display/banner | $0.30-1.00 | $0.10-0.50 | Competitive landscape report; industry standard |

#### Blended eCPM Calculation

For a game with interstitials on death (every 3rd death) + optional rewarded video for continue + persistent banner:

| Traffic Mix | Assumed Mix | Blended eCPM |
|-------------|------------|--------------|
| Mostly US/Western | 60% interstitial, 25% rewarded, 15% banner | $4.00-6.00 |
| Global average | 60% interstitial, 25% rewarded, 15% banner | $1.50-3.00 |
| Realistic blend (launch) | Mixed geo, 70/30 global/US | **$2.00-4.00** |

**Key variable:** Blended eCPM is highly sensitive to geographic mix. A game that goes viral in the US generates 2-3x the ad revenue per user of one that goes viral in Southeast Asia or Latin America. At launch, with no paid UA and organic/social distribution, expect a predominantly global audience with US representing 20-35% of traffic.

#### Revenue Per User Benchmarks

| Metric | Casual Web Games (industry) | Our Estimate |
|--------|---------------------------|-------------|
| ARPDAU (ads only) | $0.01-0.05 | $0.02-0.04 |
| Monthly ARPU (ads only) | $0.05-0.30 | $0.08-0.20 |
| Sessions per user per month | 3-5 | 3-4 |
| Ad impressions per session | 2-3 | 2 (conservative to avoid churn) |

Source: Competitive landscape report, Section 5.3

### 1.2 Cosmetic Microtransactions (Future v2)

**Feasibility assessment: Possible but not for launch.**

| Factor | Assessment |
|--------|-----------|
| Technical feasibility | Medium. Requires account system or local storage for owned skins, payment integration (Stripe, web IAP). No server-side infrastructure currently. |
| Revenue potential | IAP conversion for casual web games: 1-3%. At 100K MAU with 1.5% conversion and $2 avg transaction: ~$3,000/month. |
| Audience fit | Ages 8-16 (core demo) have limited payment access. Conversion will be lower than mobile benchmarks where parents' cards are already linked to app stores. |
| Competitive benchmark | IAP represents ~62% of all HTML5 game revenue in 2025 (industry-wide), but this is skewed by deeper games with progression systems. |
| Implementation timeline | Month 3+ at earliest. Requires: skin system, localStorage or account persistence, payment flow, content creation. |
| Risk | Adding IAP to a meme game can feel exploitative given the young audience. Keep it cosmetic-only, no pay-to-win. |

**Recommendation:** Design games to support skins from v1 (modular sprite system), but do not implement the purchase flow until traffic justifies the development effort. Threshold: 50K+ MAU.

Potential cosmetic items:
- Character skins for Flappy Tralalero: different brainrot characters as player sprite ($0.99-1.99)
- Theme packs for Whack-a-Rot: seasonal or character-set-themed backgrounds ($0.99-1.99)
- Sound packs: meme audio clips on hit/death ($0.49-0.99)

### 1.3 Sponsorship and Brand Deals

**Feasibility assessment: Realistic at scale, not at launch.**

| Type | Revenue Range | Requirements | Realistic Timeline |
|------|-------------|-------------|-------------------|
| Branded game reskin | $5,000-50,000 per project | Portfolio + audience proof + outbound sales | Month 6+ |
| In-game sponsor integration | $1,000-10,000/month | 100K+ MAU | Month 4-6 (if traffic hits) |
| Platform-exclusive launch deal | $2,000-15,000 one-time | Quality game + negotiation with Poki/CrazyGames | Month 6+ |

Source: Competitive landscape report, Section 2.4

**Honest evaluation:** Brand deals require a track record and proven audience. No brand will sponsor a site with 10K MAU. At 100K+ MAU with a clear Gen Z/Alpha audience demographic, branded game reskins become realistic. The cultural specificity of Italian brainrot characters could be a selling point for brands targeting this demographic -- but this is a month 6+ play.

### 1.4 Premium Content (Daily Challenges, Exclusive Games)

**Feasibility assessment: Not recommended for this audience or scale.**

| Factor | Assessment |
|--------|-----------|
| Audience willingness to pay | Very low. Ages 8-16, accustomed to free browser games, minimal payment access. |
| Premium web game precedent | Almost none for casual browser games. Premium works for Steam (Vampire Survivors at $4.99) and mobile app stores, not for web. |
| Daily challenges as gated content | Not viable without an account system. The zero-friction model (no signup) is a core advantage -- gating content behind accounts destroys it. |
| Exclusive games behind paywall | Contradicts the distribution model (viral sharing requires free access). |

**Recommendation:** Do not pursue premium content gating. If a game is good enough to charge for, put it on Steam as a separate product with additional polish. Keep the web versions free.

### 1.5 HTML5 Game Licensing

**Feasibility assessment: Viable and low-effort once games exist.**

| License Type | Revenue Range | Terms |
|-------------|-------------|-------|
| Non-exclusive (GameDistribution, Kongregate, etc.) | $200-2,000 per deal | Can sell to multiple portals; game hosted on their infrastructure |
| Revenue share via SDK (GameDistribution) | Developer share of ad revenue | Ongoing, traffic-dependent; lower upfront but passive |
| Exclusive license to single portal | $3,000-15,000+ | 6-24 month exclusivity; higher upfront but limits distribution |

Source: Competitive landscape report, Section 2.5; Genieee 2025 case studies

**Case study context:**
- Solo developer earned $30,000+ from non-exclusive licenses ($500-2,000 per deal across multiple portals)
- 3-person studio earned $80,000 in 18 months (some deals at $5,000+)

**Recommendation:** Pursue non-exclusive licensing via GameDistribution SDK starting month 3. Do NOT accept exclusive licenses -- multi-platform distribution is the strategy. Licensing revenue is modest per-deal but compounds across a growing game portfolio.

---

## 2. Revenue Projections (Monthly and Cumulative)

### Assumptions Table

| Assumption | Conservative | Moderate | Optimistic | Source | Confidence | Sensitivity |
|-----------|-------------|----------|-----------|--------|-----------|-------------|
| MAU (month 3 steady state) | 10,000 | 100,000 | 500,000 | Competitive benchmarks; SEO targets | L | H |
| Sessions per user per month | 3 | 4 | 5 | Industry casual web game benchmarks | M | M |
| Ad impressions per session | 1.5 | 2.5 | 3.5 | Based on ad frequency (every 3rd death + rewarded) | M | H |
| Blended eCPM (own site) | $2.00 | $3.50 | $5.00 | Web eCPM benchmarks, global traffic mix | M | H |
| Poki rev-share split (on Poki traffic) | 50/50 | 50/50 | 50/50 | Poki published terms | H | L |
| Poki MAU (if accepted) | 0 (not accepted) | 25,000 | 100,000 | Poki developer case studies | L | H |
| CrazyGames MAU (if accepted) | 0 | 10,000 | 40,000 | CG audience data | L | M |
| Licensing deals per quarter | 0 | 1 at $500 | 3 at $1,000 | Case study benchmarks | L | L |
| IAP revenue (month 6+) | $0 | $0 | $500/month | 1% conversion, $2 avg, only at optimistic scale | L | L |
| Traffic ramp | Flat from month 2 | Linear growth, 20% MoM | Viral spike month 2, plateau month 4 | Projection | L | H |

### Conservative Scenario: 10K MAU, Basic Ad Monetization

**Profile:** Games launch, get modest organic traffic from SEO and social posts. Not accepted to Poki. No viral moment. Typical outcome for a new indie game site.

| Month | MAU (own site) | Portal MAU | Ad Revenue (own site) | Portal Revenue | Licensing | Total Monthly |
|-------|---------------|-----------|----------------------|---------------|-----------|---------------|
| 1 | 1,000 | 0 | $9 | $0 | $0 | **$9** |
| 2 | 3,000 | 0 | $27 | $0 | $0 | **$27** |
| 3 | 6,000 | 0 | $54 | $0 | $0 | **$54** |
| 4 | 8,000 | 0 | $72 | $0 | $0 | **$72** |
| 5 | 9,000 | 0 | $81 | $0 | $0 | **$81** |
| 6 | 10,000 | 0 | $90 | $0 | $0 | **$90** |
| 7-12 | 10,000 | 0 | $90 | $0 | $0 | **$90/mo** |

**Calculation:** 10,000 MAU x 3 sessions x 1.5 impressions x ($2.00/1000) = $90/month

| Cumulative | Amount |
|-----------|--------|
| 6-month total | **$333** |
| 12-month total | **$873** |

### Moderate Scenario: 100K MAU, Optimized Ads + Poki Revenue Share

**Profile:** Games get accepted to Poki and CrazyGames. Moderate organic traction from SEO (game-specific keywords ranking). One Reddit post gains traction. Steady growth, no single viral moment.

| Month | MAU (own site) | Poki MAU | CG MAU | Ad Revenue (own) | Poki Revenue | CG Revenue | Licensing | Total Monthly |
|-------|---------------|---------|--------|-----------------|-------------|-----------|-----------|---------------|
| 1 | 2,000 | 0 | 0 | $35 | $0 | $0 | $0 | **$35** |
| 2 | 8,000 | 0 | 0 | $140 | $0 | $0 | $0 | **$140** |
| 3 | 15,000 | 5,000 | 2,000 | $263 | $44 | $14 | $0 | **$321** |
| 4 | 25,000 | 10,000 | 5,000 | $438 | $88 | $35 | $0 | **$561** |
| 5 | 35,000 | 15,000 | 8,000 | $613 | $131 | $56 | $250 | **$1,050** |
| 6 | 50,000 | 20,000 | 10,000 | $875 | $175 | $70 | $250 | **$1,370** |
| 7 | 55,000 | 22,000 | 10,000 | $963 | $193 | $70 | $0 | **$1,226** |
| 8 | 60,000 | 24,000 | 10,000 | $1,050 | $210 | $70 | $0 | **$1,330** |
| 9 | 65,000 | 25,000 | 10,000 | $1,138 | $219 | $70 | $500 | **$1,927** |
| 10 | 65,000 | 25,000 | 10,000 | $1,138 | $219 | $70 | $0 | **$1,427** |
| 11 | 65,000 | 25,000 | 10,000 | $1,138 | $219 | $70 | $0 | **$1,427** |
| 12 | 65,000 | 25,000 | 10,000 | $1,138 | $219 | $70 | $500 | **$1,927** |

**Calculation basis (month 6 own site):** 50,000 MAU x 4 sessions x 2.5 impressions x ($3.50/1000) = $1,750; adjusted to $875 because not all MAU are monetizable sessions (bounce rate, ad blockers, ~50% effective monetization rate)

**Poki calculation (month 6):** 20,000 MAU at Poki eCPMs, 50% rev-share to developer = ~$175/month

| Cumulative | Amount |
|-----------|--------|
| 6-month total | **$2,477** |
| 12-month total | **$12,741** |

### Optimistic Scenario: 500K MAU, Multiple Revenue Streams

**Profile:** One game goes modestly viral (Show HN hits front page or TikTok pickup). Poki features the game in brainrot category. Strong SEO ranking for game-specific and some category keywords. Portfolio expands to 4+ games by month 6.

| Month | MAU (all sources) | Ad Revenue (own) | Portal Revenue | Licensing | IAP (m6+) | Total Monthly |
|-------|------------------|-----------------|---------------|-----------|-----------|---------------|
| 1 | 5,000 | $70 | $0 | $0 | $0 | **$70** |
| 2 | 40,000 | $1,120 | $0 | $0 | $0 | **$1,120** |
| 3 | 120,000 | $3,150 | $525 | $0 | $0 | **$3,675** |
| 4 | 220,000 | $5,775 | $1,313 | $1,000 | $0 | **$8,088** |
| 5 | 350,000 | $8,750 | $2,188 | $1,000 | $0 | **$11,938** |
| 6 | 500,000 | $12,250 | $3,500 | $1,000 | $500 | **$17,250** |
| 7 | 450,000 | $11,025 | $3,150 | $0 | $500 | **$14,675** |
| 8 | 420,000 | $10,290 | $2,940 | $1,000 | $500 | **$14,730** |
| 9 | 400,000 | $9,800 | $2,800 | $1,000 | $500 | **$14,100** |
| 10 | 380,000 | $9,310 | $2,660 | $1,000 | $500 | **$13,470** |
| 11 | 380,000 | $9,310 | $2,660 | $0 | $500 | **$12,470** |
| 12 | 380,000 | $9,310 | $2,660 | $1,000 | $500 | **$13,470** |

**Calculation basis (month 6 own site):** 350,000 own-site MAU x 5 sessions x 3.5 impressions x ($5.00/1000) = $30,625; adjusted to $12,250 at ~40% effective monetization (ad blockers prevalent in tech-savvy audience, global eCPM dilution, not all sessions hit max impressions)

**Note on month 7+ decline:** Viral traffic decays. The optimistic scenario assumes a spike-and-settle pattern, not sustained exponential growth. Meme game traffic follows power-law decay after the viral window closes.

| Cumulative | Amount |
|-----------|--------|
| 6-month total | **$42,141** |
| 12-month total | **$125,057** |

### Scenario Comparison Summary

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| MAU at month 6 | 10,000 | 80,000 | 500,000 |
| Monthly revenue at month 6 | $90 | $1,370 | $17,250 |
| 6-month cumulative | $333 | $2,477 | $42,141 |
| 12-month cumulative | $873 | $12,741 | $125,057 |
| Monthly revenue at month 12 | $90 | $1,927 | $13,470 |
| Primary revenue source | Own-site ads | Own-site ads + Poki | Own-site ads + portals + licensing |
| Break-even month | Never (at this scale) | Month 1 (costs ~$15/yr) | Month 1 |
| Annualized revenue (month 12 run rate) | $1,080 | $23,124 | $161,640 |

**Probability weighting (subjective assessment):**
- Conservative: 50% likelihood. This is the most common outcome for new indie game sites.
- Moderate: 35% likelihood. Requires Poki acceptance + steady organic growth.
- Optimistic: 15% likelihood. Requires at least one viral moment + sustained execution.
- **Expected value (weighted 12-month):** $873(0.50) + $12,741(0.35) + $125,057(0.15) = $437 + $4,459 + $18,759 = **$23,655**

---

## 3. Recommended Monetization Stack

### Phase 1: Launch (Month 1)

**Revenue streams:** Interstitial ads + rewarded video only

| Implementation | Details |
|---------------|---------|
| Interstitial ads | Show between games, triggered on every 3rd death. NOT every death -- aggressive ad frequency drives churn in the first session. After session 3+, consider every 2nd death. |
| Rewarded video | Offer "watch ad to continue" after death with score > 5 (or equivalent). Player-initiated, not forced. This is the highest-eCPM format ($5-10 US web). |
| Banner ads | Do NOT implement at launch. Banners earn $0.30-1.00 eCPM and degrade the visual experience. Add only if overall eCPMs underperform. |
| Ad network | Start with Google AdSense for Games (H5) as baseline. Low barrier, reliable fill. See Section 4 for network recommendations. |
| Frequency cap | Maximum 1 interstitial per 60 seconds. Maximum 3 rewarded videos per session. Industry standard to avoid policy violations. |

**Expected Phase 1 revenue:** Near-zero. Traffic is too low in month 1 to generate meaningful ad revenue. Focus is on getting the ad integration working and collecting eCPM data.

### Phase 2: Portal Distribution (Month 2-3)

**Revenue streams:** Phase 1 + Poki/CrazyGames revenue share

| Implementation | Details |
|---------------|---------|
| Poki SDK integration | Separate build from own-site version. Poki handles ad serving via their SDK. Developer receives 50% of Poki-driven traffic revenue, 100% of direct-traffic revenue. |
| CrazyGames SDK integration | Similar to Poki. Rev-share terms are less transparent but competitive. Do NOT accept exclusivity terms. |
| GameDistribution SDK | Submit games for distribution to their 2,000+ publisher network. Revenue share on ads served in distributed versions. |
| Own-site ad optimization | By month 2-3, switch from AdSense alone to AdinPlay or Venatus as primary ad partner, with AdSense as backfill. Gaming-specific networks have better fill rates and higher eCPMs for game content. |

**Expected Phase 2 revenue:** Poki/CrazyGames acceptance is not guaranteed. If accepted, expect $50-500/month from portals. Own-site revenue depends entirely on traffic.

### Phase 3: Expansion (Month 3+)

**Revenue streams:** Phase 1 + Phase 2 + cosmetic IAP + game licensing

| Implementation | Details |
|---------------|---------|
| Cosmetic IAP | Only if MAU > 50K. Implement Stripe checkout or web-based payment. Offer character skins ($0.99-1.99), theme packs ($0.99). Keep it cosmetic-only. |
| Game licensing | Submit to non-exclusive licensing marketplaces. Target $200-2,000 per deal. Each new game in the portfolio creates another licensable asset. |
| Portfolio expansion | Each new game (target: 1 per month) adds to the catalog and compounds traffic + licensing revenue. This is the Voodoo/neal.fun playbook at small scale. |
| Premium Steam release | Only if a game hits 100K+ MAU on web. Polish it, add features, sell on Steam for $2.99-4.99. Follow the Cookie Clicker/Vampire Survivors path. |

---

## 4. Ad Network Recommendations for Web Games

### Recommended Stack

| Priority | Network | Type | Why | Est. eCPM (web) | Min Traffic |
|----------|---------|------|-----|-----------------|------------|
| 1 | **Google AdSense for Games** | Baseline | Reliable fill, easy setup, broad demand. Every web game should start here. | $1.50-4.00 blended | None |
| 2 | **AdinPlay** | Gaming-specific | Specializes in HTML5 game monetization. Offers interstitials, rewarded video, and site skins. Higher eCPMs than generic ad networks for game content. | $3.00-7.00 blended | ~50K monthly pageviews |
| 3 | **GameDistribution SDK** | Distribution + ads | Not just an ad network -- distributes your game to 2,000+ portals with integrated ads. Revenue share model. Passive reach expansion. | Varies (rev-share) | None (submit game) |
| 4 | **Venatus** | Gaming/entertainment | Premium gaming ad network. Good for web games with US/UK traffic. Often cited alongside AdinPlay for HTML5 games. | $3.00-6.00 blended | Application-based |
| 5 | **Poki SDK** | Portal-integrated | Handles all ad serving on Poki-hosted versions. You don't choose the ad network -- Poki optimizes it. 50/50 split. | N/A (rev-share) | Poki acceptance |
| 6 | **CrazyGames SDK** | Portal-integrated | Same as Poki -- SDK handles ad serving on their platform. | N/A (rev-share) | CG acceptance |

### Implementation Strategy

**Month 1:** Google AdSense for Games only. Get baseline eCPM data.

**Month 2:** Apply to AdinPlay. Layer AdinPlay as primary demand with AdSense as backfill. A $4.50 eCPM with 85% fill outperforms a $5.00 eCPM with 60% fill -- optimize for effective RPM (eCPM x fill rate), not headline eCPM.

**Month 3+:** Add GameDistribution for passive licensing distribution. Apply to Venatus if traffic warrants.

### Ad Blocker Impact

**Harsh reality:** Ad blocker usage among ages 13-25 runs 30-50% on desktop browsers. On mobile browsers it is lower (10-20%). For a meme game audience that skews young and tech-literate, assume 25-40% of desktop sessions generate zero ad revenue. This is already factored into the effective monetization rates in the projections above.

Mitigation options (not recommended for launch):
- Polite ad blocker detection with a message asking users to whitelist (low conversion, ~5-10%)
- Gate rewarded video behind ad blocker check (technically complex, user-hostile)
- Accept the loss. Mobile traffic typically has lower ad block rates -- if/when the TWA Android app launches, that channel has near-zero ad blocking.

---

## 5. Cost Structure

### Fixed Costs

| Cost | Amount | Frequency | Annual Total | Notes |
|------|--------|-----------|-------------|-------|
| Domain (brainrotgames.com) | ~$15 | Annual | **$15** | Standard .com pricing |
| Hosting (Vercel/Netlify/GitHub Pages) | $0 | Monthly | **$0** | Static HTML5 games on free tier. No server-side logic. Vercel free tier: 100GB bandwidth/month, more than sufficient for launch. |
| SSL certificate | $0 | N/A | **$0** | Included with Vercel/Netlify/GitHub Pages |
| Analytics (GA4) | $0 | N/A | **$0** | Free tier |
| Google Search Console | $0 | N/A | **$0** | Free |

### Variable Costs

| Cost | Amount | When | Notes |
|------|--------|------|-------|
| Content creation (games) | $0 | Ongoing | AI-assisted development, no external contracts |
| Art assets | $0 | Ongoing | AI-generated sprites and assets |
| Sound/music | $0-50 | Per game | Free/CC-licensed assets or AI-generated |
| Paid advertising (optional) | $0-500 | Launch month | TikTok/Reddit ads for initial traffic. Not required. |
| Paid keyword tool (optional) | $0-120/month | Month 3+ | Semrush/Ahrefs for SEO tracking. Not required at launch -- Search Console is free. |

### Potential Future Costs (Scale-Dependent)

| Cost | Trigger | Amount |
|------|---------|--------|
| Hosting upgrade (Vercel Pro) | >100GB bandwidth/month | $20/month |
| Custom domain email | When doing brand outreach | $6/month (Google Workspace) |
| Stripe fees (if IAP implemented) | Enabling payments | 2.9% + $0.30 per transaction |
| Steam Direct fee | Submitting to Steam | $100 one-time per game |
| Google Play developer account | TWA app submission | $25 one-time |
| Legal (terms of service, privacy policy) | At launch (can use templates) | $0-500 |

### Total Cost Summary

| Period | Minimum Costs | Maximum Costs (with optionals) |
|--------|--------------|-------------------------------|
| Year 1 | **$15** (domain only) | **$1,940** (domain + $500 ad spend + $120/mo keyword tool + $100 Steam + $25 Play Store) |
| Monthly operating cost | **$1.25** | **$146** (with keyword tool + hosting upgrade) |

The cost structure is the single greatest advantage of this business model. Near-zero fixed costs mean any revenue is almost entirely margin.

---

## 6. Break-Even Analysis

### What Does "Break-Even" Mean Here?

With costs as low as $15/year (minimum) to ~$140/month (with optional tools), break-even is trivially achievable -- the real question is when revenue becomes *meaningful*, not when it covers a $15 domain.

### Break-Even Against Minimum Costs ($15/year = $1.25/month)

| Scenario | Monthly Revenue Exceeds $1.25 | Month |
|----------|-------------------------------|-------|
| Conservative | $9/month in month 1 | **Month 1** |
| Moderate | $35/month in month 1 | **Month 1** |
| Optimistic | $70/month in month 1 | **Month 1** |

**All scenarios break even against minimum costs in month 1**, assuming ads are implemented and generating any traffic at all.

### Break-Even Against Realistic Operating Costs ($140/month with keyword tool + hosting)

| Scenario | Revenue Reaches $140/month | Month |
|----------|---------------------------|-------|
| Conservative | Never (peaks at $90/month) | **Never** |
| Moderate | $140/month at ~16K MAU | **Month 2-3** |
| Optimistic | Exceeds $140 in month 2 | **Month 2** |

### Break-Even Against Optional Ad Spend ($500 one-time launch spend)

| Scenario | Cumulative Revenue Exceeds $500 | Month |
|----------|-------------------------------|-------|
| Conservative | Cumulative $333 at month 6; never recovers $500 within year 1 | **Never in year 1** |
| Moderate | Cumulative $496 at month 4; recovers $500 in month 5 | **Month 5** |
| Optimistic | Cumulative $4,865 at month 3 | **Month 3** |

### Meaningful Revenue Thresholds

Rather than break-even (which is trivial given near-zero costs), here are the traffic thresholds needed for revenue to become meaningful:

| Revenue Target | Required MAU (own site, ads only) | Required MAU (with portals) | Context |
|---------------|----------------------------------|---------------------------|---------|
| $100/month | ~12,000 | ~8,000 | Covers domain + minor costs |
| $500/month | ~60,000 | ~40,000 | Noticeable side income |
| $1,000/month | ~120,000 | ~80,000 | Meaningful side income |
| $5,000/month | ~500,000 | ~300,000 | Part-time income equivalent |
| $10,000/month | ~1,000,000 | ~600,000 | "Sustainable" per competitive benchmarks |

**Calculation basis:** Own-site ads only at $3.00 blended eCPM, 3.5 sessions/user/month, 2 impressions/session, 50% effective monetization rate. Effective monthly ARPU = ~$0.0105.

---

## 7. Sensitivity Analysis

### Which Assumptions Matter Most?

The following sensitivity table shows how 12-month cumulative revenue in the moderate scenario ($12,741 base) changes when individual assumptions shift +/- one level:

| Assumption | Downside Value | Base Value | Upside Value | Downside Revenue | Base Revenue | Upside Revenue | Impact |
|-----------|---------------|-----------|-------------|-----------------|-------------|---------------|--------|
| **MAU growth rate** | 50% of base | Base | 150% of base | $6,371 | $12,741 | $19,112 | **HIGH** |
| **Blended eCPM** | $2.00 | $3.50 | $5.00 | $7,280 | $12,741 | $18,201 | **HIGH** |
| **Poki acceptance** | Rejected | Accepted (25K MAU) | Featured (75K MAU) | $10,614 | $12,741 | $18,748 | **MEDIUM** |
| **Sessions per user** | 2.5 | 4 | 5.5 | $7,963 | $12,741 | $17,519 | **MEDIUM** |
| **Ad blocker rate** | 45% | 30% | 20% | $10,894 | $12,741 | $14,209 | **LOW-MEDIUM** |
| **Licensing deals** | 0 deals | 4 deals at $500 | 8 deals at $1,000 | $10,741 | $12,741 | $20,741 | **MEDIUM** |
| **Impressions per session** | 1.5 | 2.5 | 3.5 | $7,645 | $12,741 | $17,837 | **MEDIUM** |

### Key Finding

**MAU and eCPM are the two variables that most affect outcomes.** This means:

1. **Traffic acquisition is the #1 priority.** A 50% increase in MAU matters more than any monetization optimization.
2. **Geographic mix matters almost as much as total traffic.** US traffic at $5+ eCPM generates 2-3x the revenue of global traffic at $2 eCPM. Distribution channels that skew US (Reddit, HN) are more valuable per-user than those that skew global.
3. **Ad network optimization (eCPM improvement) is the highest-ROI monetization action.** Switching from AdSense-only to AdinPlay + AdSense backfill could shift blended eCPM from $2 to $4 -- doubling revenue without adding a single user.

### Model Fragility Warning

The optimistic scenario is fragile. It depends on a viral moment that may not happen. If the viral spike in month 2-3 does not materialize, the optimistic scenario collapses to something between moderate and conservative. Do not plan expenditures based on optimistic projections.

---

## 8. Limitations and Caveats

### What This Model Does NOT Capture

1. **Viral dynamics.** Viral growth is non-linear and unpredictable. The model uses linear ramps and plateaus. Real viral traffic follows power-law spikes and exponential decay. The optimistic scenario attempts to model this but is inherently imprecise.

2. **Meme lifecycle risk.** Italian brainrot could peak and decline within 6-12 months. The model assumes steady cultural relevance through month 12. If the meme declines, traffic will decline faster than projected, particularly for new user acquisition.

3. **Ad network approval timing.** AdinPlay and premium ad networks may take 2-4 weeks to approve. The model assumes ad monetization is live from month 1, but effective monetization may lag by 2-4 weeks.

4. **Seasonality.** Web game traffic for the school-age demographic follows academic calendars: higher during school hours (yes, they play at school) and summer break, lower during holidays when they have other activities. The model uses flat monthly estimates.

5. **Competitive response.** If the games gain traction, clones will appear within days. The model does not account for traffic dilution from copycats.

6. **Portfolio expansion effects.** The model is based on 2 games. Each additional game added to the portfolio compounds traffic (cross-game navigation, broader keyword coverage, more licensable assets). The moderate and optimistic scenarios should improve if the portfolio grows to 4-6 games.

7. **Platform risk.** If Poki changes its rev-share terms or delists games, portal revenue disappears. The model treats Poki revenue as stable once established.

8. **Ad blocker trajectory.** Ad blocker adoption is increasing among young users. The 25-40% estimate may be conservative over a 12-month horizon.

---

## Source Appendix

### Monetization and eCPM Data
- Competitive landscape report (internal), Section 2 and Section 5 -- primary source for all eCPM benchmarks, ARPU data, and revenue model comparisons
- Udonis eCPM Benchmarks 2025 (cited in competitive report)
- Tenjin Ad Monetization Gaming Benchmark 2025 (cited in competitive report)

### Platform Revenue Terms
- Poki developer monetization documentation (developers.poki.com) -- 50/50 rev-share on Poki traffic, 100% on direct traffic
- CrazyGames developer portal (developer.crazygames.com) -- rev-share with SDK + exclusivity bonuses
- GameDistribution developer terms (gamedistribution.com/developers) -- rev-share on distributed game ad revenue

### Licensing Benchmarks
- Genieee: "The State of HTML5 Game Licensing in 2025" -- $200-2,000 non-exclusive, $3,000-15,000+ exclusive
- Genieee: Case studies on HTML5 game licensing revenue -- solo dev $30K+, 3-person studio $80K/18mo

### Market Context
- Poki: 625M annual players, 100M MAU (March 2026 announcement)
- CrazyGames: 35-45M MAU
- HTML5 games market: $6.02B (2026) to $10.42B (2035) at 6.34% CAGR (Business Research Insights)
- Poki developer earnings: $50,000 to $1M annually for top developers (Poki, Mobidictum interview 2025)

### Indie Game Economics
- GDC 2021 survey: 20% of game developers earned under $15,000 annually
- Median Steam game: <$25,000 lifetime gross revenue
- 80% of Steam games fail to reach $5,000 in first two weeks

### Distribution Strategy
- SEO and distribution strategy (internal) -- traffic targets, channel plan, and timeline used for MAU growth assumptions

---

*Model drafted April 2026. All projections are estimates based on published benchmarks and stated assumptions. Treat as directional analysis for planning purposes, not as financial forecasts. Update assumptions monthly with actual traffic and revenue data once live.*
