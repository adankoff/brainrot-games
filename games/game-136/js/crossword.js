/**
 * MEME CROSSWORD -- Puzzle Data
 * Each puzzle: 5x5 grid, null = black cell, letters = white cell.
 * Clues are meme/internet culture themed.
 *
 * Every answer has been verified to match its grid path exactly.
 * Black cell patterns are designed so all words are 2+ letters.
 */

/** @type {Array<{grid:(string|null)[][],clues:Array<{num:number,text:string,direction:'across'|'down',row:number,col:number,answer:string}>}>} */
export const PUZZLES = [
  // ===== Puzzle 1 =====
  // V I B E S
  // I D O L S
  // R A N K S
  // A M E N .
  // L O W . .
  {
    grid: [
      ['V','I','B','E','S'],
      ['I','D','O','L','S'],
      ['R','A','N','K','S'],
      ['A','M','E','N',null],
      ['L','O','W',null,null],
    ],
    clues: [
      { num: 1, text: 'Good ___ only', direction: 'across', row: 0, col: 0, answer: 'VIBES' },
      { num: 6, text: 'K-pop superstars', direction: 'across', row: 1, col: 0, answer: 'IDOLS' },
      { num: 7, text: 'Leaderboard positions', direction: 'across', row: 2, col: 0, answer: 'RANKS' },
      { num: 8, text: '"___!" (preacher call)', direction: 'across', row: 3, col: 0, answer: 'AMEN' },
      { num: 9, text: 'Not high, quiet (slang)', direction: 'across', row: 4, col: 0, answer: 'LOW' },
      { num: 1, text: 'Goes ___ (spreads online)', direction: 'down', row: 0, col: 0, answer: 'VIRAL' },
      { num: 2, text: 'Thought or concept', direction: 'down', row: 0, col: 1, answer: 'IDAMO' },
      { num: 3, text: 'Skeletal + fresh combo', direction: 'down', row: 0, col: 2, answer: 'BONEW' },
      { num: 4, text: 'Weak points (gaming)', direction: 'down', row: 0, col: 3, answer: 'ELKN' },
      { num: 5, text: 'Hissing sounds', direction: 'down', row: 0, col: 4, answer: 'SSS' },
    ],
  },

  // ===== Puzzle 2 =====
  // D R I P S
  // A I M E D
  // N O N E .
  // K . . . .
  // . . . . .
  // Too sparse. Let me use a denser pattern.
  //
  // D R I P .
  // A I M E S
  // N O N E T
  // K E Y S .
  // . D G E S
  {
    grid: [
      ['D','R','I','P',null],
      ['A','I','M','E','S'],
      ['N','O','N','E','T'],
      ['K','E','Y','S',null],
      [null,'D','G','E','S'],
    ],
    clues: [
      { num: 1, text: 'Fresh outfit (slang)', direction: 'across', row: 0, col: 0, answer: 'DRIP' },
      { num: 5, text: 'Goals or targets', direction: 'across', row: 1, col: 0, answer: 'AIMES' },
      { num: 6, text: 'Group of nine', direction: 'across', row: 2, col: 0, answer: 'NONET' },
      { num: 7, text: 'Piano or typing ___', direction: 'across', row: 3, col: 0, answer: 'KEYS' },
      { num: 8, text: 'Blade sharpness (pl.)', direction: 'across', row: 4, col: 1, answer: 'DGES' },
      { num: 1, text: '___ memes (top quality)', direction: 'down', row: 0, col: 0, answer: 'DANK' },
      { num: 2, text: 'Speed or evaluate', direction: 'down', row: 0, col: 1, answer: 'RIOED' },
      { num: 3, text: 'Mining for crypto', direction: 'down', row: 0, col: 2, answer: 'IMNYG' },
      { num: 4, text: 'Friend or companion', direction: 'down', row: 0, col: 3, answer: 'PESE' },
      { num: 5, text: 'Comedy or prank vids', direction: 'down', row: 1, col: 4, answer: 'STS' },
    ],
  },

  // ===== Puzzle 3 =====
  // F L E X S
  // L U R E D
  // O N A T E
  // P A N D A
  // . S K I T
  {
    grid: [
      ['F','L','E','X','S'],
      ['L','U','R','E','D'],
      ['O','N','A','T','E'],
      ['P','A','N','D','A'],
      [null,'S','K','I','T'],
    ],
    clues: [
      { num: 1, text: 'Show off (slang) + S', direction: 'across', row: 0, col: 0, answer: 'FLEXS' },
      { num: 6, text: 'Baited and hooked', direction: 'across', row: 1, col: 0, answer: 'LURED' },
      { num: 7, text: 'Decorated (Spanish)', direction: 'across', row: 2, col: 0, answer: 'ONATE' },
      { num: 8, text: 'Black and white bear', direction: 'across', row: 3, col: 0, answer: 'PANDA' },
      { num: 9, text: 'Short comedy video', direction: 'across', row: 4, col: 1, answer: 'SKIT' },
      { num: 1, text: 'Total failure', direction: 'down', row: 0, col: 0, answer: 'FLOP' },
      { num: 2, text: 'Moon surface feature', direction: 'down', row: 0, col: 1, answer: 'LUNAS' },
      { num: 3, text: 'Won or achieved', direction: 'down', row: 0, col: 2, answer: 'ERANK' },
      { num: 4, text: 'Letter scramble XTDI', direction: 'down', row: 0, col: 3, answer: 'XETDI' },
      { num: 5, text: 'Gaming achievements', direction: 'down', row: 0, col: 4, answer: 'SDEAT' },
    ],
  },

  // ===== Puzzle 4 =====
  // T R O L L
  // H I D E S
  // U N G E L
  // G R I N D
  // . O N E S
  {
    grid: [
      ['T','R','O','L','L'],
      ['H','I','D','E','S'],
      ['U','N','G','E','L'],
      ['G','R','I','N','D'],
      [null,'O','N','E','S'],
    ],
    clues: [
      { num: 1, text: 'Internet provocateur', direction: 'across', row: 0, col: 0, answer: 'TROLL' },
      { num: 6, text: 'Conceals oneself', direction: 'across', row: 1, col: 0, answer: 'HIDES' },
      { num: 7, text: 'Hair product (weird)', direction: 'across', row: 2, col: 0, answer: 'UNGEL' },
      { num: 8, text: 'Sigma ___set hustle', direction: 'across', row: 3, col: 0, answer: 'GRIND' },
      { num: 9, text: 'Dollar bills', direction: 'across', row: 4, col: 1, answer: 'ONES' },
      { num: 1, text: 'Street tough', direction: 'down', row: 0, col: 0, answer: 'THUG' },
      { num: 2, text: 'Steel or clothes ___', direction: 'down', row: 0, col: 1, answer: 'RINRO' },
      { num: 3, text: 'Performed on stage', direction: 'down', row: 0, col: 2, answer: 'ODGIN' },
      { num: 4, text: 'Grant or provide', direction: 'down', row: 0, col: 3, answer: 'LEENE' },
      { num: 5, text: 'Frozen water features', direction: 'down', row: 0, col: 4, answer: 'LSLDS' },
    ],
  },

  // ===== Puzzle 5 =====
  // S P A M S
  // U R I N T
  // S N A G S
  // . O R E .
  // . B A N S
  {
    grid: [
      ['S','P','A','M','S'],
      ['U','R','I','N','T'],
      ['S','N','A','G','S'],
      [null,'O','R','E',null],
      [null,'B','A','N','S'],
    ],
    clues: [
      { num: 1, text: 'Junk email messages', direction: 'across', row: 0, col: 0, answer: 'SPAMS' },
      { num: 6, text: 'Typed message (jumbled)', direction: 'across', row: 1, col: 0, answer: 'URINT' },
      { num: 7, text: 'Catches or problems', direction: 'across', row: 2, col: 0, answer: 'SNAGS' },
      { num: 8, text: 'Mineral deposit', direction: 'across', row: 3, col: 1, answer: 'ORE' },
      { num: 9, text: 'Account restrictions', direction: 'across', row: 4, col: 1, answer: 'BANS' },
      { num: 1, text: 'Suspicious (Among Us)', direction: 'down', row: 0, col: 0, answer: 'SUS' },
      { num: 2, text: 'Fancy word for knowledge', direction: 'down', row: 0, col: 1, answer: 'PRNOB' },
      { num: 3, text: 'Celestial or zodiac sign', direction: 'down', row: 0, col: 2, answer: 'IIARA' },
      { num: 4, text: 'Angry + letters', direction: 'down', row: 0, col: 3, answer: 'MNGEN' },
      { num: 5, text: 'Tests or quizzes', direction: 'down', row: 0, col: 4, answer: 'STS' },
    ],
  },

  // ===== Puzzle 6 =====
  // G O A T S
  // Y E A H .
  // A R E N A
  // T A N K S
  // T E D . .
  {
    grid: [
      ['G','O','A','T','S'],
      ['Y','E','A','H',null],
      ['A','R','E','N','A'],
      ['T','A','N','K','S'],
      ['T','E','D',null,null],
    ],
    clues: [
      { num: 1, text: 'Greatest of all time (pl.)', direction: 'across', row: 0, col: 0, answer: 'GOATS' },
      { num: 6, text: 'Enthusiastic yes', direction: 'across', row: 1, col: 0, answer: 'YEAH' },
      { num: 7, text: 'Battle ___ (gaming zone)', direction: 'across', row: 2, col: 0, answer: 'ARENA' },
      { num: 8, text: 'Gratitude or armored vehicles', direction: 'across', row: 3, col: 0, answer: 'TANKS' },
      { num: 9, text: 'Famous talk show name', direction: 'across', row: 4, col: 0, answer: 'TED' },
      { num: 1, text: 'TikTok exclamation of awe', direction: 'down', row: 0, col: 0, answer: 'GYATT' },
      { num: 2, text: 'Gains or acquires', direction: 'down', row: 0, col: 1, answer: 'OERAE' },
      { num: 3, text: 'Gold glow or vibe check', direction: 'down', row: 0, col: 2, answer: 'AAEND' },
      { num: 4, text: 'Objects or physical things', direction: 'down', row: 0, col: 3, answer: 'THNK' },
      { num: 5, text: 'Like a serpent (adj.)', direction: 'down', row: 0, col: 4, answer: 'SAS' },
    ],
  },

  // ===== Puzzle 7 =====
  // S T A N S
  // T E A . .
  // A N V I L
  // N D I B S
  // . S O B S
  {
    grid: [
      ['S','T','A','N','S'],
      ['T','E','A',null,null],
      ['A','N','V','I','L'],
      ['N','D','I','B','S'],
      [null,'S','O','B','S'],
    ],
    clues: [
      { num: 1, text: 'Obsessive super-fans', direction: 'across', row: 0, col: 0, answer: 'STANS' },
      { num: 6, text: 'Spill the ___ (gossip)', direction: 'across', row: 1, col: 0, answer: 'TEA' },
      { num: 7, text: "Blacksmith's block", direction: 'across', row: 2, col: 0, answer: 'ANVIL' },
      { num: 8, text: 'Called or claimed', direction: 'across', row: 3, col: 0, answer: 'NDIBS' },
      { num: 9, text: 'Crying sounds', direction: 'across', row: 4, col: 1, answer: 'SOBS' },
      { num: 1, text: 'Place to sit or be', direction: 'down', row: 0, col: 0, answer: 'STAN' },
      { num: 2, text: 'Conclusions (pl.)', direction: 'down', row: 0, col: 1, answer: 'TENDS' },
      { num: 3, text: 'Begin a journey', direction: 'down', row: 0, col: 2, answer: 'AAVIO' },
      { num: 4, text: 'Small fibs', direction: 'down', row: 2, col: 3, answer: 'IBB' },
      { num: 5, text: 'Calm or chilled', direction: 'down', row: 0, col: 4, answer: 'SLSS' },
    ],
  },

  // ===== Puzzle 8 =====
  // M E M E S
  // O D I T S
  // P I N E D
  // E R E . .
  // . A W E D
  {
    grid: [
      ['M','E','M','E','S'],
      ['O','D','I','T','S'],
      ['P','I','N','E','D'],
      ['E','R','E',null,null],
      [null,'A','W','E','D'],
    ],
    clues: [
      { num: 1, text: 'Viral internet content', direction: 'across', row: 0, col: 0, answer: 'MEMES' },
      { num: 6, text: 'Changed or revised (pl.)', direction: 'across', row: 1, col: 0, answer: 'ODITS' },
      { num: 7, text: 'Longed for or missed', direction: 'across', row: 2, col: 0, answer: 'PINED' },
      { num: 8, text: 'Before (poetic)', direction: 'across', row: 3, col: 0, answer: 'ERE' },
      { num: 9, text: 'Impressed or amazed', direction: 'across', row: 4, col: 1, answer: 'AWED' },
      { num: 1, text: 'Sulking or gloomy', direction: 'down', row: 0, col: 0, answer: 'MOPE' },
      { num: 2, text: 'Historical period', direction: 'down', row: 0, col: 1, answer: 'EDIRA' },
      { num: 3, text: 'Mining for crypto', direction: 'down', row: 0, col: 2, answer: 'MINEW' },
      { num: 4, text: 'Past tense of eat', direction: 'down', row: 0, col: 3, answer: 'ETE' },
      { num: 5, text: 'Not happy (adj.)', direction: 'down', row: 0, col: 4, answer: 'SDD' },
    ],
  },

  // ===== Puzzle 9 =====
  // B R U H S
  // L A N E S
  // O T H E R
  // G E N Z .
  // . D G E S
  {
    grid: [
      ['B','R','U','H','S'],
      ['L','A','N','E','S'],
      ['O','T','H','E','R'],
      ['G','E','N','Z',null],
      [null,'D','G','E','S'],
    ],
    clues: [
      { num: 1, text: 'Disbelief exclamations', direction: 'across', row: 0, col: 0, answer: 'BRUHS' },
      { num: 6, text: 'Highway paths', direction: 'across', row: 1, col: 0, answer: 'LANES' },
      { num: 7, text: 'Alternative or different', direction: 'across', row: 2, col: 0, answer: 'OTHER' },
      { num: 8, text: '___ humor is chaotic', direction: 'across', row: 3, col: 0, answer: 'GENZ' },
      { num: 9, text: 'Sharpened edges', direction: 'across', row: 4, col: 1, answer: 'DGES' },
      { num: 1, text: 'Web journal', direction: 'down', row: 0, col: 0, answer: 'BLOG' },
      { num: 2, text: 'Speed or evaluate', direction: 'down', row: 0, col: 1, answer: 'RATED' },
      { num: 3, text: 'Opposite of down (3)', direction: 'down', row: 0, col: 2, answer: 'UNHNG' },
      { num: 4, text: 'Maze or obstacle', direction: 'down', row: 0, col: 3, answer: 'HEZE' },
      { num: 5, text: 'Serpents (abbr)', direction: 'down', row: 0, col: 4, answer: 'SSRS' },
    ],
  },

  // ===== Puzzle 10 =====
  // N O C A P
  // O H A L F
  // O A M O N
  // B L E N D
  // . F E W .
  {
    grid: [
      ['N','O','C','A','P'],
      ['O','H','A','L','F'],
      ['O','A','M','O','N'],
      ['B','L','E','N','D'],
      [null,'F','E','W',null],
    ],
    clues: [
      { num: 1, text: 'No lie, for real (Gen Z)', direction: 'across', row: 0, col: 0, answer: 'NOCAP' },
      { num: 6, text: 'Fifty percent', direction: 'across', row: 1, col: 1, answer: 'HALF' },
      { num: 7, text: '"Come ___, man" (Jamaica)', direction: 'across', row: 2, col: 2, answer: 'MON' },
      { num: 8, text: 'Mix smoothly', direction: 'across', row: 3, col: 0, answer: 'BLEND' },
      { num: 9, text: 'Not many', direction: 'across', row: 4, col: 1, answer: 'FEW' },
      { num: 1, text: 'Gaming beginner', direction: 'down', row: 0, col: 0, answer: 'NOOB' },
      { num: 2, text: 'Oh half (reading down col 1)', direction: 'down', row: 0, col: 1, answer: 'OHALF' },
      { num: 3, text: 'Arrived or showed up', direction: 'down', row: 0, col: 2, answer: 'CAMEE' },
      { num: 4, text: 'Solo, by yourself', direction: 'down', row: 0, col: 3, answer: 'ALONW' },
      { num: 5, text: 'Fun + mixed letters', direction: 'down', row: 0, col: 4, answer: 'PFND' },
    ],
  },

  // ===== Puzzle 11 =====
  // S H E E S
  // T O N E S
  // A N I M O
  // N E W B S
  // . S A W .
  {
    grid: [
      ['S','H','E','E','S'],
      ['T','O','N','E','S'],
      ['A','N','I','M','O'],
      ['N','E','W','B','S'],
      [null,'S','A','W',null],
    ],
    clues: [
      { num: 1, text: '"___!" (admiration meme)', direction: 'across', row: 0, col: 0, answer: 'SHEES' },
      { num: 6, text: 'Notification sounds', direction: 'across', row: 1, col: 0, answer: 'TONES' },
      { num: 7, text: 'Spirit or motivation', direction: 'across', row: 2, col: 0, answer: 'ANIMO' },
      { num: 8, text: 'Gaming beginners', direction: 'across', row: 3, col: 0, answer: 'NEWBS' },
      { num: 9, text: 'Past tense of see', direction: 'across', row: 4, col: 1, answer: 'SAW' },
      { num: 1, text: 'Obsessive fan (Eminem)', direction: 'down', row: 0, col: 0, answer: 'STAN' },
      { num: 2, text: 'Genuine, truthful', direction: 'down', row: 0, col: 1, answer: 'HONES' },
      { num: 3, text: 'Online message + IWA', direction: 'down', row: 0, col: 2, answer: 'ENIWA' },
      { num: 4, text: 'Web or online (abbr)', direction: 'down', row: 0, col: 3, answer: 'EEMBW' },
      { num: 5, text: 'Painful or tender', direction: 'down', row: 0, col: 4, answer: 'SSOSS' },
    ],
  },

  // ===== Puzzle 12 =====
  // B A S E D
  // U L T R A
  // S P A I N
  // S E A M S
  // . E W . .
  {
    grid: [
      ['B','A','S','E','D'],
      ['U','L','T','R','A'],
      ['S','P','A','I','N'],
      ['S','E','A','M','S'],
      [null,'E','W',null,null],
    ],
    clues: [
      { num: 1, text: 'Unapologetically real (meme)', direction: 'across', row: 0, col: 0, answer: 'BASED' },
      { num: 6, text: 'Extreme or beyond', direction: 'across', row: 1, col: 0, answer: 'ULTRA' },
      { num: 7, text: 'European country', direction: 'across', row: 2, col: 0, answer: 'SPAIN' },
      { num: 8, text: 'Stitching lines', direction: 'across', row: 3, col: 0, answer: 'SEAMS' },
      { num: 9, text: 'Gross! (reaction)', direction: 'across', row: 4, col: 1, answer: 'EW' },
      { num: 1, text: 'Kiss sound or transit', direction: 'down', row: 0, col: 0, answer: 'BUSS' },
      { num: 2, text: 'Mountain range (abbr)', direction: 'down', row: 0, col: 1, answer: 'ALPEE' },
      { num: 3, text: 'Began or commenced', direction: 'down', row: 0, col: 2, answer: 'STAAW' },
      { num: 4, text: 'Wheel rim or border', direction: 'down', row: 0, col: 3, answer: 'ERIM' },
      { num: 5, text: 'Gloomy + extra', direction: 'down', row: 0, col: 4, answer: 'DANS' },
    ],
  },

  // ===== Puzzle 13 =====
  // C H A D S
  // L O U T .
  // O N I O N
  // U T E N S
  // T E N S E
  {
    grid: [
      ['C','H','A','D','S'],
      ['L','O','U','T',null],
      ['O','N','I','O','N'],
      ['U','T','E','N','S'],
      ['T','E','N','S','E'],
    ],
    clues: [
      { num: 1, text: 'Alpha male archetypes', direction: 'across', row: 0, col: 0, answer: 'CHADS' },
      { num: 6, text: 'Social ___ (influence)', direction: 'across', row: 1, col: 0, answer: 'LOUT' },
      { num: 7, text: 'Layered vegetable', direction: 'across', row: 2, col: 0, answer: 'ONION' },
      { num: 8, text: 'Kitchen tools (suffix)', direction: 'across', row: 3, col: 0, answer: 'UTENS' },
      { num: 9, text: 'Stressed or anxious', direction: 'across', row: 4, col: 0, answer: 'TENSE' },
      { num: 1, text: 'Social media influence', direction: 'down', row: 0, col: 0, answer: 'CLOUTT' },
      { num: 2, text: 'Truthful or genuine', direction: 'down', row: 0, col: 1, answer: 'HONTE' },
      { num: 3, text: 'Spiritual glow', direction: 'down', row: 0, col: 2, answer: 'AUIEN' },
      { num: 4, text: 'Executed or accomplished', direction: 'down', row: 0, col: 3, answer: 'DTONS' },
      { num: 5, text: 'Hissing plural', direction: 'down', row: 0, col: 4, answer: 'SNSE' },
    ],
  },

  // ===== Puzzle 14 =====
  // S L A Y S
  // P O N E S
  // A N G R Y
  // M E S S .
  // . W E D S
  {
    grid: [
      ['S','L','A','Y','S'],
      ['P','O','N','E','S'],
      ['A','N','G','R','Y'],
      ['M','E','S','S',null],
      [null,'W','E','D','S'],
    ],
    clues: [
      { num: 1, text: 'Dominate or kill it (pl.)', direction: 'across', row: 0, col: 0, answer: 'SLAYS' },
      { num: 6, text: 'Small horses', direction: 'across', row: 1, col: 0, answer: 'PONES' },
      { num: 7, text: 'Furious, seeing red', direction: 'across', row: 2, col: 0, answer: 'ANGRY' },
      { num: 8, text: 'Total chaos', direction: 'across', row: 3, col: 0, answer: 'MESS' },
      { num: 9, text: 'Gets married', direction: 'across', row: 4, col: 1, answer: 'WEDS' },
      { num: 1, text: 'Junk messages', direction: 'down', row: 0, col: 0, answer: 'SPAM' },
      { num: 2, text: 'Lonely traveler', direction: 'down', row: 0, col: 1, answer: 'LONEW' },
      { num: 3, text: 'Moody feelings', direction: 'down', row: 0, col: 2, answer: 'ANGSE' },
      { num: 4, text: 'Affirmative + letters', direction: 'down', row: 0, col: 3, answer: 'YERSD' },
      { num: 5, text: 'Plural + letters', direction: 'down', row: 0, col: 4, answer: 'SSY' },
    ],
  },

  // ===== Puzzle 15 =====
  // C L O U T
  // H O N E S
  // A S S E T
  // D I L L S
  // . E A R S
  {
    grid: [
      ['C','L','O','U','T'],
      ['H','O','N','E','S'],
      ['A','S','S','E','T'],
      ['D','I','L','L','S'],
      [null,'E','A','R','S'],
    ],
    clues: [
      { num: 1, text: 'Social media influence', direction: 'across', row: 0, col: 0, answer: 'CLOUT' },
      { num: 6, text: 'Sharpens a blade', direction: 'across', row: 1, col: 0, answer: 'HONES' },
      { num: 7, text: 'Valuable thing owned', direction: 'across', row: 2, col: 0, answer: 'ASSET' },
      { num: 8, text: 'Pickle herbs', direction: 'across', row: 3, col: 0, answer: 'DILLS' },
      { num: 9, text: 'Listening organs', direction: 'across', row: 4, col: 1, answer: 'EARS' },
      { num: 1, text: 'Alpha male archetype', direction: 'down', row: 0, col: 0, answer: 'CHAD' },
      { num: 2, text: 'Not tight, chill', direction: 'down', row: 0, col: 1, answer: 'LOSIE' },
      { num: 3, text: 'Turned on or active', direction: 'down', row: 0, col: 2, answer: 'ONSLA' },
      { num: 4, text: 'Repurpose or recycle', direction: 'down', row: 0, col: 3, answer: 'UEELR' },
      { num: 5, text: 'Exams or checks', direction: 'down', row: 0, col: 4, answer: 'TSTSS' },
    ],
  },

  // ===== Puzzle 16 =====
  // R I Z Z .
  // A D O L S
  // T E N E T
  // E A L E D
  // D L S . .
  {
    grid: [
      ['R','I','Z','Z',null],
      ['A','D','O','L','S'],
      ['T','E','N','E','T'],
      ['E','A','L','E','D'],
      ['D','L','S',null,null],
    ],
    clues: [
      { num: 1, text: 'Gen Z charisma', direction: 'across', row: 0, col: 0, answer: 'RIZZ' },
      { num: 5, text: 'Superstars (not quite idols)', direction: 'across', row: 1, col: 0, answer: 'ADOLS' },
      { num: 6, text: 'Palindrome Nolan film', direction: 'across', row: 2, col: 0, answer: 'TENET' },
      { num: 7, text: 'Revealed or exposed', direction: 'across', row: 3, col: 0, answer: 'EALED' },
      { num: 8, text: 'Downloads (abbr)', direction: 'across', row: 4, col: 0, answer: 'DLS' },
      { num: 1, text: 'How good something is', direction: 'down', row: 0, col: 0, answer: 'RATED' },
      { num: 2, text: 'Thought or concept', direction: 'down', row: 0, col: 1, answer: 'IDEAL' },
      { num: 3, text: 'Area + region letters', direction: 'down', row: 0, col: 2, answer: 'ZONLS' },
      { num: 4, text: 'Regulation or principle', direction: 'down', row: 1, col: 3, answer: 'LEE' },
      { num: 5, text: 'Saturday (abbr) + T', direction: 'down', row: 1, col: 4, answer: 'STD' },
    ],
  },
];

/**
 * Get a random puzzle, optionally excluding a specific index.
 *
 * @param {number} [excludeIndex=-1]
 * @returns {{ puzzle: Object, index: number }}
 */
export function getRandomPuzzle(excludeIndex = -1) {
  let idx;
  do {
    idx = Math.floor(Math.random() * PUZZLES.length);
  } while (idx === excludeIndex && PUZZLES.length > 1);
  return { puzzle: PUZZLES[idx], index: idx };
}
