# viral & influencer strategy
## brainrot games | april 2026

---

## 1. micro-influencer outreach plan

### 1.1 target creator profiles

We are not going after mega-influencers. We are going after the 10K-100K tier — people whose followers actually watch their stuff, whose DMs are not buried under 500 brand pitches a day, and who will actually play the game because they think it is funny.

**Tier 1: brainrot / italian meme accounts (highest priority)**
- accounts that post Tralalero Tralala, Bombardiro Crocodilo, Tung Tung Sahur edits
- platforms: TikTok, Instagram Reels, YouTube Shorts
- follower range: 10K-100K
- they already speak the language. they already know the characters. zero explanation needed.
- search terms for finding them: "tralalero tralala," "italian brainrot," "bombardiro crocodilo," "brainrot characters," "brr brr patapim"
- example account types: pages named things like @italianbrainrot, @tralalero.edits, @bombardiro.daily

**Tier 2: casual gaming TikTokers**
- creators who play random browser games, io games, or mobile games on camera
- the "let me try this random game" format — reaction-based, short clips, authentic responses
- platforms: TikTok, YouTube Shorts
- follower range: 10K-80K
- search terms: "browser game," "addicting game," "random game I found," "worst game ever"
- example account types: pages that post themselves playing krunker, slither.io, flappy bird clones, random itch.io games

**Tier 3: meme compilation / brainrot commentary accounts**
- accounts that aggregate, remix, or commentate on brainrot culture
- they do "brainrot tier lists," "explaining brainrot to my mom," "this generation is cooked" format videos
- platforms: TikTok, YouTube, Twitter/X
- follower range: 15K-100K
- they provide the meta-commentary layer that makes something feel like a Moment

**Tier 4: school / student humor accounts**
- accounts that post school memes, teacher reactions, class group chat screenshots
- our primary persona (ages 8-16) follows these accounts
- platforms: TikTok, Instagram
- follower range: 10K-60K
- the angle: "this is the game that is going to get your phone taken away in class"

### 1.2 outreach approach

**The rule: no brand pitch. no media kit. no partnership proposal.**

These creators get corporate DMs daily. The moment the message reads like a brand pitch, it gets ignored. Our outreach should feel like a friend sending a link — because that is literally what we are doing.

We are not offering money. We are not offering sponsorship. We are offering something funnier: a game themed around their exact niche that they can react to. The game IS the pitch. If it is funny enough, they will post about it because it is content for them, not because we asked.

**Outreach channel priority:**
1. TikTok DM (highest open rate for this audience)
2. Instagram DM
3. Twitter/X DM
4. Discord DM (if they have a public server)
5. Email (last resort — feels too formal)

### 1.3 outreach message templates

**Template A: the zero-context friend link**

For brainrot meme accounts and gaming accounts. No introduction, no explanation. Just the energy of a friend texting at 2am.

```
yo someone made flappy bird but you're Tralalero Tralala

brainrotgames.com/games/game-01/

the death messages are unhinged
```

Alternate for Whack-a-Rot:
```
this game lets you whack Bombardiro Crocodilo and it gives you "aura points"

brainrotgames.com/games/game-02/

i got 3,200 on my first try which is apparently "certified NPC moment" level
```

**Template B: the specific callout**

For creators whose content directly relates to our characters. This one shows we actually watch their stuff.

```
[name] your [specific recent video reference] had me dead

someone literally made a flappy bird game with Tralalero and the obstacles are Skibidi Toilets and mewing jawlines. the game over screen told me i have "0 aura. absolute 0 aura."

brainrotgames.com

thought you'd appreciate this or at least roast it
```

Alternate:
```
[name] your brainrot tier list was accurate except you forgot that Brr Brr Patapim is now a penalty character in a whack-a-mole game

brainrotgames.com/games/game-02/

the combo system actually goes hard. hit 12 in a row and you get "MAXIMUM AURA" on screen
```

**Template C: the challenge bait**

For competitive gaming accounts. Give them something to prove.

```
genuine question: can you beat 25 in this

brainrotgames.com/games/game-01/

it's flappy bird but with italian brainrot characters and it gets brutal after score 50. nobody i know has broken 100. someone needs to.
```

Alternate:
```
bet you can't hit 5,000 aura in Whack-a-Rot

brainrotgames.com/games/game-02/

the combo multiplier goes up to 4x and there's a penalty character that resets everything. it's mean.
```

### 1.4 what we offer

**Nothing. That is the point.**

No payment. No promo codes. No affiliate links. No "partnership" language. The games are free, instant, and browser-based. There is literally nothing to sell.

What we are actually offering (without saying it):
- **free content for their channel** — a funny game themed around their niche that their audience will recognize
- **built-in reaction bait** — the death messages, the score system, the character names are all clip-worthy
- **something their followers will actually want to play** — it is a link, not a download. zero friction.
- **bragging rights** — high score challenges give them an excuse to revisit

If a creator posts about the game organically, our response strategy:
1. Repost/stitch/duet their content (DO NOT ask permission first — just do it, credit them)
2. Comment something brief and on-brand: "working as intended" or "the death messages only get worse"
3. Do NOT reply with corporate thanks. No "Thanks for featuring us! We love your content!" — that kills the bit.

### 1.5 outreach volume and cadence

**Week 1 (launch week):**
- 50 outreach messages across all tiers
- Priority: Tier 1 (brainrot accounts) gets 25 messages, Tier 2 (gaming) gets 15, Tier 3 and 4 split the remaining 10
- Send in batches of 10/day to avoid looking like spam or getting rate-limited
- Track who opens, who responds, who posts

**Week 2-4:**
- 20 outreach messages per week
- Shift priority based on which tiers converted best in week 1
- Add any new accounts discovered through the algorithm (once one creator posts, their algorithm surfaces similar accounts)

**Ongoing:**
- Monitor for organic mentions. When someone posts about the game without us reaching out, engage immediately
- Every new game launch gets its own outreach wave using the same templates adapted for the new game

---

## 2. viral mechanics built into the games

### 2.1 shareable score cards

Both games already have the share mechanic built into the game-over screen. Here is how it works and how to promote it:

**Current implementation:**
- "flex this" button on every game-over screen
- Uses Web Share API on mobile (native share sheet) with clipboard fallback on desktop
- Share text format: `i got [SCORE] in FLAPPY TRALALERO` / `i got [SCORE] aura in WHACK-A-ROT` + game URL
- The share URL takes you directly to the game — zero friction from share to play

**Promotion strategy for the share mechanic:**

The share button should never feel like a marketing feature. It should feel like the obvious next step after getting a funny score. The existing "flex this" copy is correct — it frames sharing as bragging, not promoting.

Actions to amplify:
1. **Make the share text meme-ready.** The current format is clean. Consider A/B testing with the death message appended: `i got 3 in FLAPPY TRALALERO. "skill issue detected"` — the death message is the screenshot bait.
2. **Open Graph previews must be perfect.** When someone pastes the link in a group chat, Discord, or Twitter, the OG preview needs to sell the game in one glance. The current OG tags are set. Verify the preview image is eye-catching and meme-adjacent (not "professional game marketing").
3. **Seed the sharing behavior.** Our own social accounts should post scores constantly using the exact same format players use. This normalizes the format so when real players share, it looks native to the platform.

### 2.2 death screen messages as screenshot bait

This is our single strongest viral mechanic. The death messages are funny enough to screenshot and send to a group chat even if the recipient never plays the game. Every death screen is a potential social post.

**Flappy Tralalero death messages by tier (already implemented):**

| Score | Example Messages |
|-------|-----------------|
| 0 | "certified NPC moment" / "0 aura. absolute 0 aura." |
| 1-5 | "participation trophy incoming" / "even Tralalero is embarrassed" |
| 6-14 | "not terrible. not great. mid." / "the skibidi toilet claims another victim" |
| 15-24 | "slight aura detected" / "you're starting to lock in" |
| 25-49 | "actual rizz detected" / "the sigma grindset is working" |
| 50-99 | "the aura is immeasurable" / "okay you're actually goated" |
| 100+ | "you need to go outside" / "touch grass immediately" |

**Whack-a-Rot death messages by tier (already implemented):**

| Score | Example Messages |
|-------|-----------------|
| 0-500 | "certified NPC moment" / "Brr Brr Patapim sends his regards" |
| 501-2000 | "the Italian brainrot council acknowledges you" |
| 2001-5000 | "your reflexes are illegal in 12 countries" |
| 5001+ | "this score is a violation of the Geneva Convention" |

**How to weaponize these for virality:**

1. **Screenshot bait is already baked in.** The game-over screen displays the death message prominently above the score. The visual layout (message + score + game title) is a self-contained meme format.

2. **Encourage screenshot sharing explicitly.** On our social channels, regularly post game-over screenshots with captions like: "what's the worst death message you've gotten?" or "post your game-over screen, no context." This teaches the audience that the screenshot IS the shareable unit.

3. **Rotating seasonal/topical messages.** Add a few timely messages that get swapped in/out (e.g., during exam season: "your GPA died so you could get 14 in flappy tralalero"). These feel fresh and reward repeat players with new material to screenshot.

4. **Creator screenshot bait.** When reaching out to creators, lead with a screenshot of a funny death message. The message itself is the hook — they will want to see what message THEY get.

### 2.3 challenge modes

Challenges give people a reason to play again AND a reason to share. The challenge itself is the marketing.

**Score challenge format:**

Post a challenge on social / Discord with a specific score target. Simple, shareable, competitive.

- **"beat 25 in Flappy Tralalero — screenshot or it didn't happen"**
  - 25 is hard enough that most players cannot do it on their first session but achievable enough that it feels possible
  - The screenshot requirement drives game-over screen shares organically

- **"hit 5,000 aura in Whack-a-Rot — the brainrot council demands proof"**
  - 5,000 requires maintaining combos, which requires skill
  - "Aura points" as the scoring unit is inherently funny and shareable

- **"get a score of exactly 0 in Flappy Tralalero and screenshot the death message"**
  - Inverted challenge. Intentionally dying immediately is easy but the death message ("certified NPC moment" / "you literally didn't even try") is the punchline
  - Zero-effort participation threshold. Anyone can do this.

- **"hit a 20 combo in Whack-a-Rot — TRANSCENDENT or it didn't happen"**
  - The TRANSCENDENT text effect at combo 20+ is visually dramatic and screenshot-worthy

**Weekly challenge cadence:**
- Post one challenge per week across TikTok, Twitter, Discord
- Vary between Flappy Tralalero and Whack-a-Rot challenges
- Pin the challenge in the Discord server
- Repost the best entries (with credit)

**Creator-specific challenges:**
- DM a creator with a specific challenge: "bet you can't beat 50 in Flappy Tralalero on camera"
- If they post the attempt, duet/stitch it regardless of whether they succeed
- Failure content is often funnier and more shareable than success content

### 2.4 cross-promotion between games

Both games live on the same domain. Every player of one game is a potential player of the other.

**Current state:**
- The game-over screen in the game shell has a secondary button area. Currently has "menu" as a ghost button.
- The site index page lists both games as cards.

**Cross-promotion touchpoints (prioritized):**

1. **Game-over screen cross-link (highest impact, already structurally supported):**
   - Add an "other games" ghost button to the game-over overlay secondary actions
   - Flappy Tralalero game-over shows: "try WHACK-A-ROT" (links to `/games/game-02/`)
   - Whack-a-Rot game-over shows: "try FLAPPY TRALALERO" (links to `/games/game-01/`)
   - Copy should be casual: "you died. play something else?" or "need a break? go whack some brainrot characters instead"

2. **Share text cross-reference:**
   - Consider appending to share text: `i got [SCORE] in FLAPPY TRALALERO | more games at brainrotgames.com`
   - The root URL leads to the index page which shows both games
   - Keeps share text short but introduces the brand URL for discovery

3. **Menu screen mention:**
   - Small text on each game's menu screen: "also: [other game name]" with a link
   - Not prominent — players should not feel redirected before they even play. But present for anyone looking.

4. **Character overlap:**
   - Tralalero Tralala appears in both games (playable character in Flappy, whackable target in Whack-a-Rot)
   - Bombardiro Crocodilo appears in both (unlockable character in Flappy, target in Whack-a-Rot)
   - Use this in marketing: "you've been flying as Tralalero. now whack him."

---

## 3. discord server launch

### 3.1 server structure

Server name: **brainrot games**
Server icon: brain emoji or stylized BRG logo
Server description: "your brain on memes. home of flappy tralalero, whack-a-rot, and whatever cursed game we make next."

**Channels:**

```
INFORMATION
  #rules              -- short, non-corporate. "don't be weird. that's it."
  #announcements      -- new games, updates, events. locked to admin posts.
  #faq                -- "how do i play?" "click the link." "that's it."

GAMES
  #flappy-tralalero   -- scores, screenshots, strategies, clips
  #whack-a-rot        -- scores, screenshots, strategies, clips
  #high-scores        -- weekly leaderboard posts (manual or bot-assisted)
  #bug-reports        -- "the game is broken" "have you tried tapping"

HANG OUT
  #general            -- off-topic brainrot discussion
  #memes              -- brainrot memes, fan art, edits
  #suggestions        -- game ideas, feature requests, character nominations

EVENTS
  #challenges         -- weekly challenges posted here
  #contest-entries    -- where people submit challenge screenshots
```

**Roles:**

| Role | How to Get It | Perks |
|------|---------------|-------|
| @player | auto-assigned on join | access to all channels |
| @sigma (verified high scorer) | post a screenshot of 50+ in Flappy or 5,000+ in Whack-a-Rot | special color, access to #sigma-lounge (hidden channel for flex) |
| @transcendent | post a screenshot of 100+ in Flappy or combo 20+ in Whack-a-Rot | rarest role, different color, bragging rights |
| @meme council | given to the best meme posters by mods | can post in #announcements during meme contests |
| @og | first 100 members | permanent badge of being early |

### 3.2 launch events

**Event 1: "the great aura race" (launch day, runs 48 hours)**
- Both games count. Players post their highest score screenshot in #contest-entries.
- Highest Flappy Tralalero score and highest Whack-a-Rot score each win a custom role + shoutout on social.
- No prizes beyond clout. The point is participation and screenshot generation.

**Event 2: "worst score competition" (week 1)**
- Lowest non-zero score in Flappy Tralalero wins. Score of 1 beats score of 2.
- Players post their game-over screenshot. The death messages at low scores are the funniest, so this generates the best screenshot content.
- Highlight: the winner gets the @certified-npc role for a week.

**Event 3: "meme contest" (week 2)**
- Submit an original meme using a game-over screenshot, gameplay clip, or brainrot character from the games.
- Posted in #memes, voted on by reaction count.
- Winner gets @meme-council role.

**Event 4: "combo marathon" (week 3)**
- Whack-a-Rot only. Highest combo in a single round.
- The TRANSCENDENT threshold (20+ combo) is the target. Anyone who hits it gets @transcendent.

**Ongoing weekly events:**
- **Monday: new challenge posted** — score target for the week, pinned in #challenges
- **Friday: leaderboard update** — top scores from the week posted in #high-scores
- **Sunday: meme roundup** — best memes from #memes get reposted to social channels with credit

### 3.3 growth strategy

**Phase 1: Seed (week 1, target 100 members)**
- Include Discord link in game-over screens (small text, not intrusive)
- Include Discord link in social bios across all platforms
- Include Discord link in the site footer (already has a placeholder link)
- Mention Discord in outreach messages to creators: "there's also a Discord if you want to see people losing their minds over this game"
- Every influencer who posts about the game funnels their audience toward the Discord

**Phase 2: Activate (weeks 2-4, target 500 members)**
- Run the launch events listed above — events give people a reason to join AND stay
- Cross-post challenge results to social — showing Discord activity makes it look alive
- Engage personally in conversations. The server should feel like a group chat, not a corporate community.
- Pin the best moments: funny screenshots, absurd scores, good memes

**Phase 3: Self-sustain (month 2+, target 1,000+ members)**
- By this point, members should be generating their own conversations and memes
- Mod team from active members (grant @meme-council or mod roles to consistent contributors)
- Tease new games in Discord first — make the server feel like an insider channel
- "The Discord knew about [new game] two days before anyone else" — this incentivizes joining

**Growth rules:**
- Never buy members or run "join for giveaway" schemes. Inflated member counts with zero activity is worse than a small active server.
- Never over-moderate. The server should feel chaotic in a fun way. Delete spam and truly offensive stuff. Let everything else ride.
- Never make the server feel required. The games work without Discord. Discord is a bonus for people who want more.

---

## 4. cross-promotion strategy

### 4.1 game-over screen cross-links

This is the highest-leverage cross-promotion point. Every player sees the game-over screen multiple times per session (Flappy Tralalero averages 5-10 deaths per session, Whack-a-Rot 3-5 rounds).

**Implementation:**

The existing `GameShell` in `games/shared/game-shell.js` builds the game-over overlay with a secondary actions area. Add a cross-promo link there.

**Flappy Tralalero game-over screen addition:**
- Below the "menu" ghost button, add: **"or go whack some brainrot characters"** as a ghost button linking to `/games/game-02/`
- The text is casual, on-brand, and frames the other game as an alternative activity rather than an ad

**Whack-a-Rot game-over screen addition:**
- Below the "menu" ghost button, add: **"or go flap as Tralalero"** as a ghost button linking to `/games/game-01/`

**Contextual cross-promo copy variants (rotate randomly):**

For Flappy Tralalero -> Whack-a-Rot:
- "tired of dying? go whack stuff instead"
- "Bombardiro Crocodilo is waiting to be whacked"
- "same characters, less gravity, more whacking"

For Whack-a-Rot -> Flappy Tralalero:
- "done whacking? try flapping"
- "Tralalero wants to fly. help him (you won't)"
- "same brainrot, different suffering"

### 4.2 share text cross-promotion

**Current share text:** `i got [SCORE] in [GAME TITLE]` + game URL

**Proposed enhancement:** `i got [SCORE] in [GAME TITLE]` + root URL instead of game-specific URL

Change the share URL from `brainrotgames.com/games/game-01/` to `brainrotgames.com` for maximum discovery. The root URL shows both games. Anyone clicking the shared link sees the full catalog instead of just one game.

Trade-off: game-specific URL has less friction (they land on the exact game). Root URL has more discovery (they see both games). Recommendation: keep game-specific URL for the share text but append a line break and `more at brainrotgames.com` only when sharing via clipboard (not via Web Share API, where brevity matters more).

### 4.3 character-based cross-promotion

The character roster overlaps between games. Use this.

**Social content that bridges both games:**
- "Tralalero Tralala's week: Monday — flying through Skibidi Toilets. Tuesday — getting whacked for 100 aura points."
- Character spotlight posts that show the same character in both games
- "which game is harder for Bombardiro?" poll format

**In-game hint (future feature):**
- When a player unlocks Bombardiro Crocodilo in Flappy Tralalero (score 10+), the unlock notification could read: "BOMBARDIRO UNLOCKED. he's also in WHACK-A-ROT if you want to hit him instead."
- Non-intrusive. Funny. Contextual.

---

## 5. PR / media targets

### 5.1 gaming and indie game press

These publications cover indie games, browser games, and gaming culture. The pitch angle: "free browser game themed around the Italian brainrot meme trend."

| Publication | Pitch Angle | Contact Method |
|-------------|-------------|----------------|
| **Kotaku** | "Italian brainrot memes are now playable browser games and they're actually good" — culture angle, meme-meets-gaming | tips@kotaku.com or DM gaming reporters on Twitter |
| **PC Gamer** | "These free browser games turn Tralalero Tralala and Bombardiro Crocodilo into Flappy Bird and Whack-a-Mole" — straightforward indie coverage | news tips form on site |
| **Rock Paper Shotgun** | "The best worst thing to happen to your browser tab this week" — their tone is dry and British, match it | tips or news section contacts |
| **Polygon** | Cultural angle: "How Italian brainrot memes became playable games" — Polygon covers internet culture x gaming intersections | tips@polygon.com |
| **IGN** | Quick-hit coverage: "You can now play Flappy Bird as Tralalero Tralala for free in your browser" — straightforward news item | tips form |
| **Destructoid** | Indie games coverage, they write about weird browser games regularly | news tips |
| **Game Jolt / itch.io featured** | List the games on these platforms for organic discovery. Both platforms feature browser games and have active communities. | Upload/submit through platform |
| **IndieGamesPlus** | Pure indie coverage, covers small free games with interesting themes | contact form |

### 5.2 meme culture and internet media

These outlets cover meme culture, internet trends, and viral phenomena. The pitch angle: "someone turned the Italian brainrot meme into actual games."

| Publication | Pitch Angle | Why They'd Cover It |
|-------------|-------------|---------------------|
| **Know Your Meme** | Submit entries for both games as derivatives of the Italian brainrot characters. KYM documents meme evolution — games built from memes are exactly their coverage area. | Submit through their entry system + reach out to editors |
| **Dexerto** | "Italian brainrot characters are now in free browser games and TikTok is losing it" — they cover TikTok trends and gaming overlap | tips@dexerto.com |
| **Daily Dot** | Internet culture coverage. "Brainrot memes have officially become a gaming genre." | news tips |
| **Mashable** | "These browser games turn your favorite brainrot memes into actual gameplay" — lifestyle/culture section | mashable pitches |
| **Vice / Motherboard** (if still active) | "A game studio built entirely around internet brainrot" — the meta-story of building a company on meme culture | editorial contacts |
| **MEL Magazine / Input Mag** | Deeper cultural take: "What does it mean that brainrot is now a game genre?" | pitch editors directly |

### 5.3 youtube and podcast coverage

| Target | Pitch Angle |
|--------|-------------|
| **Dunkey / videogamedunkey** | He covers absurd indie games. Flappy Tralalero is exactly his format. Do not pitch — just make the game visible enough that it reaches him organically. DM is a hail mary. |
| **Jacksepticeye / Markiplier** | They play random indie games. Browser games with reaction-bait death screens are content gold for them. Reach out through management. |
| **SmallAnt** | Challenge-focused gaming content. "Can I beat 100 in Flappy Tralalero?" is a video format he already does. |
| **Ludwig** | Covers internet culture and gaming. Would cover it as a "look at this thing the internet made." |
| **Various "I played the worst games on the internet" creators** | There is an entire genre of TikTok/YouTube content that is just playing weird free games. Our games are made for this format. Search "worst browser games" on TikTok and DM the top 20. |

### 5.4 pitch template for press

Keep it short. Journalists get hundreds of pitches. This is not a press release.

```
Subject: free browser games themed around italian brainrot memes

hey [name],

someone had to do it — we made Flappy Bird but you're Tralalero Tralala
(the three-legged shark), and a whack-a-mole game where you slap
Bombardiro Crocodilo for "aura points."

both games are free, instant, browser-based. no download, no signup.
the death messages alone are worth a look ("certified NPC moment,"
"touch grass immediately," "this score is a violation of the Geneva Convention").

play them: brainrotgames.com

that's the whole pitch. happy to send screenshots or answer questions
but honestly the games explain themselves.

[name]
brainrot games
```

**What NOT to include in the pitch:**
- A press release
- Business metrics or player count projections
- The words "innovative," "revolutionary," "disruptive," or anything on the banned words list
- An embargo or NDA request — we want coverage whenever they want to write it
- A media kit PDF attachment (provide a link to screenshots/assets if asked, not proactively)

### 5.5 pitch timing

**Wave 1: launch day**
- Send to Tier 1 press targets (gaming press that covers indie/browser games)
- Send to meme culture outlets simultaneously
- These two groups have different audiences with minimal overlap, so simultaneous coverage is additive

**Wave 2: 1 week post-launch**
- Send to Tier 2 targets (larger publications) WITH social proof
- "X thousand people played this in the first week" gives them a news angle, not just a product pitch
- Include links to any creator content or organic social traction

**Wave 3: ongoing**
- Every new game launch gets its own press wave
- Any organic viral moment (a creator's video blows up, a meme takes off) gets a follow-up pitch: "hey, that thing that went viral? here's more context if you want to write about it"

---

## 6. social channel strategy (supporting virality)

### 6.1 TikTok (primary channel)

This is where the audience lives. Every piece of content on TikTok should feel native to the platform.

**Content types:**
1. **Gameplay clips** — 15-30 second clips of playing, dying, showing the death message. No commentary needed.
2. **Score challenge posts** — "can you beat this?" with a score on screen.
3. **Death message compilations** — rapid cuts between different death messages. "every death message in Flappy Tralalero, ranked."
4. **Duets/stitches** — react to creators playing the game. Keep reactions minimal (thumbs up, head nod, "working as intended").
5. **"POV" format** — "pov: you opened a link in the group chat and now you can't stop playing" over gameplay footage.

**Posting cadence:** 1-2 posts per day during launch week. 3-5 posts per week ongoing.

### 6.2 Twitter/X (secondary, for press and gaming audience)

**Content types:**
1. **Game launch announcements** — deadpan, lowercase, one sentence. "new game just dropped. it's flappy bird but the bird is Tralalero Tralala. you're welcome"
2. **Score screenshots** — post scores using the same share format players use, normalizing the behavior
3. **Quote tweets of anyone playing the game** — brief, on-brand replies
4. **Patch notes as comedy** — "patch notes: added Bombardiro Crocodilo. fixed nothing else."

**Posting cadence:** 1 post per day. More during launch week. Responsive QTs as they come.

### 6.3 Instagram (tertiary, for reach)

**Content types:**
1. **Reels** — repurpose TikTok content
2. **Story polls** — "which game is harder?" / "what's your high score?"
3. **Carousel posts** — "every brainrot character in our games, explained in one sentence each"

**Posting cadence:** 3-4 posts per week. Daily stories during active campaigns.

---

## 7. measurement

### 7.1 metrics that matter

| Metric | Target (Month 1) | How to Measure |
|--------|-------------------|----------------|
| Total game plays (both games) | 100,000 | Analytics on game page loads |
| Share button taps | 10% of game-over screens | Event tracking on "flex this" button |
| Organic social mentions | 200+ across platforms | Social listening (manual or tool-based) |
| Creator posts (from outreach) | 15-20 creators posting | Track outreach conversion |
| Discord members | 500 | Discord server analytics |
| Press coverage | 3-5 articles | Google Alerts + manual tracking |
| Referral traffic from social | 30% of total traffic | UTM tracking on shared links |

### 7.2 metrics that don't matter

- Follower count on brand social accounts (we are optimizing for game plays, not follows)
- "Impressions" or "reach" in isolation (a million impressions with zero game plays is a failure)
- Influencer follower count (a 10K account that gets 50 people to play is worth more than a 500K account that gets zero)

### 7.3 feedback loops

- **Death messages drive screenshots drive social posts drive new players drive more death messages.** This is the core loop. Every optimization should support it.
- **Creator content drives more creator content.** Once one creator posts, the algorithm shows it to similar creators. Our job is to light the first match.
- **High scores drive challenges drive competition drive return visits.** The Discord leaderboard is the retention mechanism.

---

*this document defines distribution tactics, not brand voice. for brand guidelines see `/brand/brand-strategy.md`. for game mechanics see `/design-docs/GDD-01.md` and `/design-docs/GDD-02.md`.*
