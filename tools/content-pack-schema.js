/**
 * BRAINROT GAMES — Universal Content Pack Schema
 * ================================================
 *
 * A Content Pack defines everything needed to re-skin ALL 17 game mechanics
 * from a single source of truth. One keyword → one pack → 17 playable games.
 *
 * ARCHITECTURE:
 *   content-packs/{id}.json  →  tools/generate-from-pack.js  →  games/game-XX/js/themes.js
 *
 * The pack is split into layers:
 *   1. Identity      — who is this IP/franchise/meme
 *   2. Characters    — protagonist, antagonist, supporting cast, items
 *   3. Palette       — colors derived from the IP
 *   4. Copy          — all text strings (names, messages, labels)
 *   5. Mechanic overrides — per-mechanic content that can't be auto-derived
 */

// =====================================================================
// FULL SCHEMA (annotated)
// =====================================================================

/**
 * @typedef {Object} ContentPack
 */
const SCHEMA = {

  // ==================================================================
  // 1. IDENTITY — What is this IP?
  // ==================================================================
  id: 'simpsons',                         // kebab-case, used for file paths + localStorage keys
  name: 'THE SIMPSONS',                   // display name (ALL CAPS per brand)
  tagline: 'eat my shorts',               // one-liner shown in menu subtitle
  bodyTheme: 'simpsons',                  // CSS data-theme value on <body>
  shareUrl: 'https://brainrotgames.com/packs/simpsons/',


  // ==================================================================
  // 2. CHARACTERS — The cast
  // ==================================================================
  characters: {

    /** Primary playable character — the "hero" in every mechanic */
    protagonist: {
      name: 'Homer Simpson',
      shortName: 'Homer',                 // for tight UI (scoreboards, tiles)
      emoji: '🍩',                         // fallback when no sprite available
      icon: 'assets/packs/simpsons/homer.png',  // optional sprite path
      /** Canvas draw function name — maps to a registry of draw functions */
      drawFn: 'drawHomer',
      /** Per-mechanic role (auto-mapped if omitted):
       *   flappy → the flyer
       *   runner → the runner
       *   clicker → tap target
       *   snake → the head
       *   breakout → the paddle
       *   dash → the cube
       *   colorSwitch → the ball
       *   paperToss → the thrower context
       */
    },

    /** Primary antagonist — appears as obstacle, bomb, penalty */
    antagonist: {
      name: 'Mr. Burns',
      shortName: 'Burns',
      emoji: '💰',
      icon: 'assets/packs/simpsons/burns.png',
      drawFn: 'drawBurns',
      /** Per-mechanic role (auto-mapped if omitted):
       *   flappy → the pipes/obstacles
       *   whack → penalty character (hit = lose points)
       *   ninja → the bomb (don't slice)
       *   breakout → boss brick / invincible brick
       *   runner → the obstacle
       */
    },

    /** Supporting cast — used for variety across mechanics */
    supporting: [
      // Minimum 6 for memory match (8 pairs = protagonist + antagonist + 6)
      // Minimum 5 for upgrade names in clicker
      // Minimum 6 for whack-a-mole character roster
      // Minimum 11 for 2048 tile progression
      {
        name: 'Marge Simpson',
        shortName: 'Marge',
        emoji: '💙',
        icon: 'assets/packs/simpsons/marge.png',
        drawFn: 'drawMarge',
        tier: 1,                           // importance/rarity: 1=common, 2=uncommon, 3=rare
      },
      {
        name: 'Bart Simpson',
        shortName: 'Bart',
        emoji: '⚡',
        icon: 'assets/packs/simpsons/bart.png',
        drawFn: 'drawBart',
        tier: 1,
      },
      {
        name: 'Lisa Simpson',
        shortName: 'Lisa',
        emoji: '🎷',
        icon: 'assets/packs/simpsons/lisa.png',
        drawFn: 'drawLisa',
        tier: 1,
      },
      {
        name: 'Maggie Simpson',
        shortName: 'Maggie',
        emoji: '🍼',
        icon: 'assets/packs/simpsons/maggie.png',
        drawFn: 'drawMaggie',
        tier: 2,
      },
      {
        name: 'Ned Flanders',
        shortName: 'Flanders',
        emoji: '✝️',
        icon: 'assets/packs/simpsons/flanders.png',
        drawFn: 'drawFlanders',
        tier: 2,
      },
      {
        name: 'Krusty the Clown',
        shortName: 'Krusty',
        emoji: '🤡',
        icon: 'assets/packs/simpsons/krusty.png',
        drawFn: 'drawKrusty',
        tier: 2,
      },
      {
        name: 'Milhouse',
        shortName: 'Milhouse',
        emoji: '👓',
        icon: 'assets/packs/simpsons/milhouse.png',
        drawFn: 'drawMilhouse',
        tier: 3,
      },
      {
        name: 'Ralph Wiggum',
        shortName: 'Ralph',
        emoji: '🤪',
        icon: 'assets/packs/simpsons/ralph.png',
        drawFn: 'drawRalph',
        tier: 3,
      },
      {
        name: 'Comic Book Guy',
        shortName: 'CBG',
        emoji: '📚',
        icon: 'assets/packs/simpsons/cbg.png',
        drawFn: 'drawCBG',
        tier: 3,
      },
      {
        name: 'Groundskeeper Willie',
        shortName: 'Willie',
        emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        icon: 'assets/packs/simpsons/willie.png',
        drawFn: 'drawWillie',
        tier: 3,
      },
    ],
  },


  // ==================================================================
  // 3. ITEMS — Collectibles, food, objects used across mechanics
  // ==================================================================
  items: {

    /** Primary collectible — coins in runner, food in snake, etc. */
    collectible: {
      name: 'Donut',
      emoji: '🍩',
      icon: 'assets/packs/simpsons/donut.png',
      drawFn: 'drawDonut',
    },

    /** Secondary collectibles (snake body segments, ninja slice targets, etc.) */
    collectibles: [
      { name: 'Beer', emoji: '🍺', drawFn: 'drawBeer' },
      { name: 'TV Remote', emoji: '📺', drawFn: 'drawRemote' },
      { name: 'Saxophone', emoji: '🎷', drawFn: 'drawSax' },
      { name: 'Skateboard', emoji: '🛹', drawFn: 'drawSkateboard' },
      { name: 'Inanimate Carbon Rod', emoji: '🏆', drawFn: 'drawRod' },
    ],

    /** Obstacle/hazard items (runner obstacles, breakout bricks, etc.) */
    obstacles: [
      { name: 'Nuclear Waste', emoji: '☢️', drawFn: 'drawWaste' },
      { name: 'Rake', emoji: '🪥', drawFn: 'drawRake' },
      { name: 'Springfield Sign', emoji: '🪧', drawFn: 'drawSign' },
    ],

    /** Projectile for paper toss mechanic */
    projectile: {
      name: 'Donut Box',
      emoji: '📦',
      drawFn: 'drawDonutBox',
    },

    /** Target/bin for paper toss mechanic */
    target: {
      name: "Homer's Mouth",
      emoji: '😮',
      drawFn: 'drawHomerMouth',
    },
  },


  // ==================================================================
  // 4. PALETTE — All colors derived from the IP
  // ==================================================================
  palette: {

    /** Primary brand color (accent, highlights, buttons) */
    primary: '#FFD800',          // Simpsons yellow

    /** Secondary accent */
    secondary: '#1E90FF',        // Marge hair blue

    /** Background gradient (dark theme) */
    bgTop: '#1a1200',
    bgBottom: '#0a0800',

    /** Surface colors */
    surface: 'rgba(255, 216, 0, 0.08)',
    surfaceBorder: 'rgba(255, 216, 0, 0.2)',

    /** Text */
    text: '#f0f0f0',
    textSecondary: '#b0a060',
    textTertiary: '#706030',

    /** Glow/shadow */
    glow: 'rgba(255, 216, 0, 0.3)',

    /** Game-specific color sets */

    /** 4 colors for color-switch barriers */
    colorSwitchSegments: ['#FFD800', '#1E90FF', '#FF6B6B', '#4ADE80'],
    colorSwitchNames: ['yellow', 'blue', 'red', 'green'],

    /** 5 colors for breakout bricks / stack blocks */
    blockColors: ['#FFD800', '#1E90FF', '#FF6B6B', '#4ADE80', '#C084FC'],

    /** Tile tier colors for 2048 (11 levels: 2 → 2048) */
    tileColors: [
      '#e8d4a0', '#e0c888', '#d4b860', '#c8a838',
      '#b89820', '#ffd700', '#ffb800', '#ff9800',
      '#ff6b00', '#ff3d00', '#FFD800',
    ],

    /** Ground/sky for runner + dash */
    sky: '#1a1830',
    skyGradient: '#0a0815',
    ground: '#8B6914',
    groundAccent: '#FFD800',
    groundLine: '#b89820',

    /** Snake grid */
    gridColor: 'rgba(255, 216, 0, 0.06)',

    /** Paper toss environment */
    floorColor: '#3a2a10',
    wallColor: '#2a1a08',
  },


  // ==================================================================
  // 5. COPY — All text strings
  // ==================================================================
  copy: {

    // --- Score labels ---
    scoreLabel: 'score',                   // default label under score number
    currencyName: 'DONUTS',                // clicker currency display name
    currencyShort: 'DNTS',                 // abbreviated for HUD
    prestigeName: 'FAME TOKENS',           // clicker prestige currency
    prestigeAction: 'Go to Hollywood',     // prestige button text

    // --- Death/game-over messages (pool, random selection) ---
    deathMessages: [
      "d'oh!",
      'worst. run. ever.',
      'you tried, and that is what counts. jk.',
      'homer would have eaten through that wall',
      'cowabunga, dude. wait wrong show.',
      'at least you\'re not milhouse',
      'the fingers you have used to play are too fat',
      'to be continued... after this word from our sponsors',
    ],

    // --- Win/success messages ---
    winMessages: [
      'excellent! — mr. burns voice',
      'woo hoo!',
      'brain as smooth as homer\'s head',
      'eat my shorts, leaderboard',
    ],

    // --- Combo/streak messages (threshold-triggered) ---
    comboMessages: [
      { threshold: 3, text: 'mmm... donuts' },
      { threshold: 5, text: "d'oh yeah!" },
      { threshold: 10, text: 'AY CARAMBA' },
      { threshold: 20, text: "DON'T HAVE A COW, MAN" },
      { threshold: 35, text: 'COWABUNGA' },
      { threshold: 50, text: 'EXCELLENT' },
    ],

    /** Breakout catchphrases (shown on brick break) */
    catchphrases: [
      "d'oh!",
      'why you little!',
      'eat my shorts',
      'ha ha! — nelson',
      'excellent',
    ],

    /** Floating symbols for clicker background */
    floatingSymbols: ['🍩', '🍺', '📺', '☢️', '⚡'],
  },


  // ==================================================================
  // 6. SOUNDS — Procedural audio overrides
  // ==================================================================
  sounds: {
    /**
     * Each key maps to a game event. Value is a SoundManager-compatible config.
     * Only override sounds that should differ from defaults.
     * Omitted keys fall back to the shared sound-manager presets.
     */
    tap:     { notes: [{ type: 'sine', frequency: 500, endFrequency: 600, duration: 0.05, gain: 0.12 }] },
    flap:    { notes: [{ type: 'square', frequency: 400, endFrequency: 500, duration: 0.06, gain: 0.12 }] },
    score:   { notes: [{ type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 }, { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 }] },
    death:   { notes: [{ type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.3, gain: 0.2 }] },
    combo:   { notes: [{ type: 'triangle', frequency: 440, duration: 0.15, gain: 0.25 }, { type: 'triangle', frequency: 660, duration: 0.15, delay: 0.1, gain: 0.25 }] },
    win:     { notes: [{ type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 }, { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 }, { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.15 }, { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.3, gain: 0.2 }] },
    // Keys: tap, flap, score, death, hit, combo, penalty, bonus, gameover,
    //        merge, slide, spawn, jump, collect, colorswitch, flip, match,
    //        mismatch, correct, wrong, tick, timeout, throw, miss, streak,
    //        type, delete, invalid, buy, cantbuy, prestige, pop, uiclick
  },


  // ==================================================================
  // 7. MECHANIC OVERRIDES — Per-mechanic content that can't be
  //    auto-derived from the universal fields above.
  //    Only specify what differs from the auto-mapping.
  // ==================================================================
  mechanics: {

    // --- CLICKER (games 03, 12, 18) ---
    clicker: {
      /** 5 upgrade tiers, names themed to the IP */
      upgrades: [
        { name: 'TV Remote Clicking', baseCost: 10, baseProduction: 1 },
        { name: 'Lard Lad Donuts', baseCost: 100, baseProduction: 5 },
        { name: 'Duff Beer Sponsor', baseCost: 1000, baseProduction: 25 },
        { name: 'Nuclear Plant Bonus', baseCost: 10000, baseProduction: 100 },
        { name: 'Monorail Investment', baseCost: 100000, baseProduction: 500 },
      ],
    },

    // --- 2048 (games 07, 20) ---
    tiles2048: {
      /**
       * 11 tile tiers: value → { name, color }
       * Names form a progression narrative.
       * Auto-fill: uses supporting[0..8] + antagonist + protagonist for names.
       * Colors: auto-fill from palette.tileColors if omitted.
       */
      tiers: {
        2:    { name: 'Ralph' },
        4:    { name: 'Milhouse' },
        8:    { name: 'Nelson' },
        16:   { name: 'Flanders' },
        32:   { name: 'Krusty' },
        64:   { name: 'Marge' },
        128:  { name: 'Lisa' },
        256:  { name: 'Maggie' },
        512:  { name: 'Bart' },
        1024: { name: 'Burns' },
        2048: { name: 'HOMER' },
      },
    },

    // --- MEMORY MATCH (game 27) ---
    memoryMatch: {
      /** 8 pairs for the 4x4 grid. Auto-fill from protagonist + antagonist + supporting[0..5] */
      pairs: [
        { emoji: '🍩', label: 'Homer' },
        { emoji: '💙', label: 'Marge' },
        { emoji: '⚡', label: 'Bart' },
        { emoji: '🎷', label: 'Lisa' },
        { emoji: '🍼', label: 'Maggie' },
        { emoji: '💰', label: 'Burns' },
        { emoji: '✝️', label: 'Flanders' },
        { emoji: '🤡', label: 'Krusty' },
      ],
      cardBackSymbol: '?',
    },

    // --- WHACK-A-MOLE (games 02, 23) ---
    whack: {
      /**
       * Character roster for popping up. 4-6 hittable + 1 penalty.
       * Auto-fill: supporting[0..4] as hittable, antagonist as bonus, protagonist as penalty-if-hit.
       */
      roster: [
        { id: 'bart', name: 'Bart', emoji: '⚡', basePoints: 10, isBonus: false, isPenalty: false },
        { id: 'krusty', name: 'Krusty', emoji: '🤡', basePoints: 20, isBonus: false, isPenalty: false },
        { id: 'flanders', name: 'Flanders', emoji: '✝️', basePoints: 10, isBonus: false, isPenalty: false },
        { id: 'ralph', name: 'Ralph', emoji: '🤪', basePoints: 15, isBonus: false, isPenalty: false },
        { id: 'burns', name: 'Burns', emoji: '💰', basePoints: 100, isBonus: true, isPenalty: false },
        { id: 'homer', name: 'Homer', emoji: '🍩', basePoints: -50, isBonus: false, isPenalty: true },
      ],
    },

    // --- NINJA / FRUIT NINJA (games 08, 09, 21) ---
    ninja: {
      /** Sliceable items — auto-fill from items.collectibles */
      sliceables: 'auto',  // or explicit override
      /** Bomb item — auto-fill from characters.antagonist */
      bomb: 'auto',
    },

    // --- SNAKE (games 06, 22) ---
    snake: {
      /** Food items that appear — auto-fill from items.collectibles (min 5) */
      foodItems: 'auto',
    },

    // --- PIANO TILES (game 24) ---
    pianoTiles: {
      tileEmoji: '🍩',    // what's drawn on each tile (auto: protagonist.emoji)
    },

    // --- COLOR SWITCH (game 25) ---
    colorSwitch: {
      /** Ball shape identifier — 'circle' (default) or custom */
      ballShape: 'circle',
      /** 4 barrier colors — auto-fill from palette.colorSwitchSegments */
      colors: 'auto',
    },

    // --- WORDLE (game 26) ---
    wordle: {
      /**
       * Answer words: 50+ five-letter words themed to the IP.
       * For non-meme IPs, these would be character names, catchphrases, locations.
       */
      answerWords: [
        'HOMER', 'MARGE', 'BURNS', 'FLINT', 'COUCH',
        'DONUT', 'PLANT', 'TOXIN', 'ATOMS', 'RALPH',
        'CLOWN', 'MAYOR', 'CHIEF', 'SNAKE', 'EDNA_',
        // ... 50+ total
      ],
      /** Additional valid guesses beyond the answer list */
      extraValidGuesses: [],
    },

    // --- HANGMAN (game 28) ---
    hangman: {
      /**
       * Word/phrase bank with categories and hints.
       * Auto-generate categories from the IP.
       */
      words: [
        { word: 'EAT MY SHORTS', category: 'catchphrase', hint: 'bart\'s signature line' },
        { word: 'NUCLEAR POWER PLANT', category: 'location', hint: 'where homer works' },
        { word: 'SPRINGFIELD', category: 'location', hint: 'the town' },
        { word: 'DOH', category: 'catchphrase', hint: 'homer\'s exclamation' },
        { word: 'KRUSTY BURGER', category: 'food', hint: 'fast food chain' },
        { word: 'TREEHOUSE OF HORROR', category: 'episode', hint: 'annual halloween special' },
        // ... 80+ total
      ],
    },

    // --- TRIVIA (game 30) ---
    trivia: {
      /**
       * Question bank. Min 60 questions across difficulty levels 1-3.
       */
      questions: [
        {
          question: 'What is Homer\'s middle name?',
          answers: ['Jay', 'James', 'John', 'Joseph'],
          correct: 0,
          difficulty: 1,
          category: 'characters',
        },
        {
          question: 'What instrument does Lisa play?',
          answers: ['Trumpet', 'Saxophone', 'Violin', 'Guitar'],
          correct: 1,
          difficulty: 1,
          category: 'characters',
        },
        // ... 60+ total
      ],
    },

    // --- PAPER TOSS (game 29) ---
    paperToss: {
      /** Override projectile/target if different from items.projectile/target */
      projectile: 'auto',
      target: 'auto',
    },

    // --- RUNNER (games 04, 13, 15, 19) ---
    runner: {
      /** Override obstacle types if needed */
      obstacles: 'auto',  // auto-fills from items.obstacles
    },

    // --- BREAKOUT (game 10) ---
    breakout: {
      catchphrases: 'auto',  // auto-fills from copy.catchphrases
    },

    // --- GEOMETRY DASH (games 11, 14) ---
    dash: {
      /** Player color progression with score % (optional override) */
      playerColorStops: null,  // null = use palette.primary as fixed color
    },

    // --- STACK (games 05, 16) ---
    stack: {
      comboTexts: null,  // null = use copy.comboMessages[].text
    },

    // --- FLAPPY (games 01, 17) ---
    flappy: {
      /** Obstacle color (pipes) */
      pipeColor: null,  // null = use palette.secondary
    },
  },
};


// =====================================================================
// AUTO-MAPPING RULES
// =====================================================================
// These rules define how universal fields map to each mechanic when
// the mechanic override is set to 'auto' or omitted:
//
// ┌─────────────────────┬──────────────────────────────────────────────┐
// │ Universal Field      │ Mechanic Mapping                            │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ protagonist          │ flappy.player, runner.player, clicker.tap,  │
// │                      │ snake.head, dash.cube, colorSwitch.ball,    │
// │                      │ breakout.paddle, stack.blockDecor,          │
// │                      │ whack.penalty, memory.pairs[0],             │
// │                      │ tiles2048.tiers[2048]                       │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ antagonist           │ flappy.obstacle, runner.obstacle,           │
// │                      │ ninja.bomb, whack.bonus, breakout.bossBrick,│
// │                      │ tiles2048.tiers[1024], memory.pairs[1]      │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ supporting[0..N]     │ whack.roster[0..4], ninja.sliceTargets,     │
// │                      │ memory.pairs[2..7],                         │
// │                      │ tiles2048.tiers[2..512] (sorted by tier)    │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ items.collectible    │ runner.coin, snake.food, clicker.tapVisual  │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ items.collectibles   │ snake.bodySegments, ninja.sliceables        │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ items.obstacles      │ runner.obstacles, dash.spikes               │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ items.projectile     │ paperToss.projectile                        │
// │ items.target         │ paperToss.bin                               │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ palette.primary      │ accentColor (all), tileHighlight, scoreColor│
// │ palette.bgTop/Bottom │ background gradient (all)                   │
// │ palette.blockColors  │ breakout.brickColors, stack.blockColors     │
// │ palette.tileColors   │ tiles2048 tier colors                       │
// │ palette.colorSwitch* │ colorSwitch barrier segments                │
// │ palette.sky/ground   │ runner bg, dash bg                          │
// ├─────────────────────┼──────────────────────────────────────────────┤
// │ copy.deathMessages   │ game-over message pool (all)                │
// │ copy.winMessages     │ win message pool (memory, hangman, wordle)  │
// │ copy.comboMessages   │ streak text (ninja, piano, stack, clicker)  │
// │ copy.scoreLabel      │ score label (all)                           │
// │ copy.currencyName    │ clicker currency                            │
// │ copy.floatingSymbols │ clicker background particles                │
// │ copy.catchphrases    │ breakout brick-break text                   │
// └─────────────────────┴──────────────────────────────────────────────┘


// =====================================================================
// MINIMUM CONTENT REQUIREMENTS
// =====================================================================
// To generate ALL 17 mechanics from a single pack, you need:
//
// ┌────────────────────────────┬─────────┬────────────────────────────┐
// │ Field                      │ Min     │ Used By                    │
// ├────────────────────────────┼─────────┼────────────────────────────┤
// │ protagonist                │ 1       │ all 17 mechanics           │
// │ antagonist                 │ 1       │ all 17 mechanics           │
// │ supporting characters      │ 10      │ 2048(9), memory(6), whack  │
// │ collectible items          │ 5       │ snake, ninja               │
// │ obstacle items             │ 3       │ runner, dash               │
// │ projectile + target        │ 1 each  │ paper toss                 │
// │ palette colors             │ 15+     │ all 17 mechanics           │
// │ death messages             │ 8       │ all 17 mechanics           │
// │ win messages               │ 4       │ memory, hangman, wordle    │
// │ combo messages             │ 5       │ piano, ninja, stack, click │
// │ clicker upgrades           │ 5       │ clicker                    │
// │ 2048 tier names            │ 11      │ 2048                       │
// │ memory pairs               │ 8       │ memory match               │
// │ whack roster               │ 6       │ whack-a-mole               │
// │ wordle answer words        │ 50      │ wordle                     │
// │ hangman words + hints      │ 80      │ hangman                    │
// │ trivia questions            │ 60      │ trivia quiz                │
// │ floating symbols (emoji)   │ 5       │ clicker background         │
// │ catchphrases               │ 5       │ breakout                   │
// │ color switch segments      │ 4       │ color switch               │
// │ block colors               │ 5       │ breakout, stack            │
// │ tile colors (2048)         │ 11      │ 2048                       │
// └────────────────────────────┴─────────┴────────────────────────────┘
//
// TOTAL: ~15 identity/character fields + ~50 palette values + ~40 copy
//        strings + ~200 mechanic-specific content items (words, questions)
//
// The word/question content is the bulk. The visual identity + characters
// is a small, reusable core that powers most mechanics automatically.


// =====================================================================
// EXPORT — this file documents the schema. Actual packs go in:
//   tools/content-packs/{id}.json
// =====================================================================

export { SCHEMA };
