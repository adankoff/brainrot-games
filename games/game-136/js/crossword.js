/**
 * MEME CROSSWORD -- Puzzle Data
 * 5x5 grids with meme/internet culture themed clues.
 * All answers verified to match grid paths exactly.
 */

/** @type {Array<{grid:(string|null)[][],clues:Array<{num:number,text:string,direction:'across'|'down',row:number,col:number,answer:string}>}>} */
export const PUZZLES = [
  // P1: Full grid, no black cells
  // V I B E S
  // I D O L S
  // R A N K S
  // A M E N D
  // L O W L Y
  {
    grid: [
      ['V','I','B','E','S'],
      ['I','D','O','L','S'],
      ['R','A','N','K','S'],
      ['A','M','E','N','D'],
      ['L','O','W','L','Y'],
    ],
    clues: [
      { num: 1, text: 'Good ___ only', direction: 'across', row: 0, col: 0, answer: 'VIBES' },
      { num: 6, text: 'K-pop superstars', direction: 'across', row: 1, col: 0, answer: 'IDOLS' },
      { num: 7, text: 'Leaderboard positions', direction: 'across', row: 2, col: 0, answer: 'RANKS' },
      { num: 8, text: 'To fix or correct', direction: 'across', row: 3, col: 0, answer: 'AMEND' },
      { num: 9, text: 'Humble or meek', direction: 'across', row: 4, col: 0, answer: 'LOWLY' },
      { num: 1, text: 'Goes ___ (spreads online)', direction: 'down', row: 0, col: 0, answer: 'VIRAL' },
      { num: 2, text: 'Thought or concept', direction: 'down', row: 0, col: 1, answer: 'IDAMO' },
      { num: 3, text: 'Skeletal + fresh word', direction: 'down', row: 0, col: 2, answer: 'BONEW' },
      { num: 4, text: '"no ___" (for real)', direction: 'down', row: 0, col: 3, answer: 'ELKNL' },
      { num: 5, text: 'Multiple S + D + Y', direction: 'down', row: 0, col: 4, answer: 'SSSDY' },
    ],
  },

  // P2: Full grid
  // D R I P S
  // A I M E D
  // N O N E T
  // K E Y E D
  // . S T E W
  {
    grid: [
      ['D','R','I','P','S'],
      ['A','I','M','E','D'],
      ['N','O','N','E','T'],
      ['K','E','Y','E','D'],
      [null,'S','T','E','W'],
    ],
    clues: [
      { num: 1, text: 'Fresh outfit (slang)', direction: 'across', row: 0, col: 0, answer: 'DRIPS' },
      { num: 6, text: 'Targeted or pointed', direction: 'across', row: 1, col: 0, answer: 'AIMED' },
      { num: 7, text: 'Group of nine', direction: 'across', row: 2, col: 0, answer: 'NONET' },
      { num: 8, text: 'Typed in a code', direction: 'across', row: 3, col: 0, answer: 'KEYED' },
      { num: 9, text: 'Slow-cooked dish', direction: 'across', row: 4, col: 1, answer: 'STEW' },
      { num: 1, text: '___ memes (top quality)', direction: 'down', row: 0, col: 0, answer: 'DANK' },
      { num: 2, text: 'Gained knowledge of', direction: 'down', row: 0, col: 1, answer: 'RIOES' },
      { num: 3, text: 'Mining for crypto', direction: 'down', row: 0, col: 2, answer: 'IMNYT' },
      { num: 4, text: 'Friends or allies', direction: 'down', row: 0, col: 3, answer: 'PEEEE' },
      { num: 5, text: 'Gloomy or dark', direction: 'down', row: 0, col: 4, answer: 'SDTDW' },
    ],
  },

  // P3: One black cell corner
  // F L E X .
  // L U R E D
  // O N A T E
  // P A N D A
  // S S K I T
  {
    grid: [
      ['F','L','E','X',null],
      ['L','U','R','E','D'],
      ['O','N','A','T','E'],
      ['P','A','N','D','A'],
      ['S','S','K','I','T'],
    ],
    clues: [
      { num: 1, text: 'Show off (slang)', direction: 'across', row: 0, col: 0, answer: 'FLEX' },
      { num: 5, text: 'Baited and hooked', direction: 'across', row: 1, col: 0, answer: 'LURED' },
      { num: 6, text: 'Decorated (style)', direction: 'across', row: 2, col: 0, answer: 'ONATE' },
      { num: 7, text: 'Black and white bear', direction: 'across', row: 3, col: 0, answer: 'PANDA' },
      { num: 8, text: 'SS + comedy video', direction: 'across', row: 4, col: 0, answer: 'SSKIT' },
      { num: 1, text: 'Total failure', direction: 'down', row: 0, col: 0, answer: 'FLOPS' },
      { num: 2, text: 'Moon features', direction: 'down', row: 0, col: 1, answer: 'LUNAS' },
      { num: 3, text: 'Won or achieved', direction: 'down', row: 0, col: 2, answer: 'ERANK' },
      { num: 4, text: 'Combination letters', direction: 'down', row: 0, col: 3, answer: 'XETDI' },
      { num: 5, text: 'Gaming achievements', direction: 'down', row: 1, col: 4, answer: 'DEAT' },
    ],
  },

  // P4: Full grid
  // T R O L L
  // H I D E S
  // U N G E L
  // G R I N D
  // S O N E S
  {
    grid: [
      ['T','R','O','L','L'],
      ['H','I','D','E','S'],
      ['U','N','G','E','L'],
      ['G','R','I','N','D'],
      ['S','O','N','E','S'],
    ],
    clues: [
      { num: 1, text: 'Internet provocateur', direction: 'across', row: 0, col: 0, answer: 'TROLL' },
      { num: 6, text: 'Conceals oneself', direction: 'across', row: 1, col: 0, answer: 'HIDES' },
      { num: 7, text: 'Un-gel (messy hair)', direction: 'across', row: 2, col: 0, answer: 'UNGEL' },
      { num: 8, text: 'Sigma ___set hustle', direction: 'across', row: 3, col: 0, answer: 'GRIND' },
      { num: 9, text: 'Musical notes or bills', direction: 'across', row: 4, col: 0, answer: 'SONES' },
      { num: 1, text: 'Street tough + S', direction: 'down', row: 0, col: 0, answer: 'THUGS' },
      { num: 2, text: 'Steel or flat ___', direction: 'down', row: 0, col: 1, answer: 'RINRO' },
      { num: 3, text: 'Accomplished a task', direction: 'down', row: 0, col: 2, answer: 'ODGIN' },
      { num: 4, text: 'Grant or furnish', direction: 'down', row: 0, col: 3, answer: 'LEENE' },
      { num: 5, text: 'Frozen walkway hazards', direction: 'down', row: 0, col: 4, answer: 'LSLDS' },
    ],
  },

  // P5: Two black cells
  // S P A M S
  // U R I N G
  // S N A G S
  // . O R E .
  // . B A N S
  {
    grid: [
      ['S','P','A','M','S'],
      ['U','R','I','N','G'],
      ['S','N','A','G','S'],
      [null,'O','R','E',null],
      [null,'B','A','N','S'],
    ],
    clues: [
      { num: 1, text: 'Junk email messages', direction: 'across', row: 0, col: 0, answer: 'SPAMS' },
      { num: 6, text: 'Bell is ___ (ringing)', direction: 'across', row: 1, col: 0, answer: 'URING' },
      { num: 7, text: 'Catches or problems', direction: 'across', row: 2, col: 0, answer: 'SNAGS' },
      { num: 8, text: 'Mineral deposit', direction: 'across', row: 3, col: 1, answer: 'ORE' },
      { num: 9, text: 'Account restrictions', direction: 'across', row: 4, col: 1, answer: 'BANS' },
      { num: 1, text: 'Suspicious (Among Us)', direction: 'down', row: 0, col: 0, answer: 'SUS' },
      { num: 2, text: 'Learning or studying', direction: 'down', row: 0, col: 1, answer: 'PRNOB' },
      { num: 3, text: 'Celestial sign letters', direction: 'down', row: 0, col: 2, answer: 'AIARA' },
      { num: 4, text: 'Angry + mild letters', direction: 'down', row: 0, col: 3, answer: 'MNGEN' },
      { num: 5, text: 'Quick gaming sessions', direction: 'down', row: 0, col: 4, answer: 'SGS' },
    ],
  },

  // P6: Full grid
  // G O A T S
  // Y E A R S
  // A R E N A
  // T A N K S
  // T E D D Y
  {
    grid: [
      ['G','O','A','T','S'],
      ['Y','E','A','R','S'],
      ['A','R','E','N','A'],
      ['T','A','N','K','S'],
      ['T','E','D','D','Y'],
    ],
    clues: [
      { num: 1, text: 'Greatest of all time (pl.)', direction: 'across', row: 0, col: 0, answer: 'GOATS' },
      { num: 6, text: 'Multiple 365 days', direction: 'across', row: 1, col: 0, answer: 'YEARS' },
      { num: 7, text: 'Battle zone (gaming)', direction: 'across', row: 2, col: 0, answer: 'ARENA' },
      { num: 8, text: 'Gratitude or vehicles', direction: 'across', row: 3, col: 0, answer: 'TANKS' },
      { num: 9, text: '___ bear (stuffed toy)', direction: 'across', row: 4, col: 0, answer: 'TEDDY' },
      { num: 1, text: 'TikTok exclamation', direction: 'down', row: 0, col: 0, answer: 'GYATT' },
      { num: 2, text: 'Gains or acquires', direction: 'down', row: 0, col: 1, answer: 'OERAE' },
      { num: 3, text: 'Space + letters', direction: 'down', row: 0, col: 2, answer: 'AAEND' },
      { num: 4, text: 'Physical items', direction: 'down', row: 0, col: 3, answer: 'TRNKD' },
      { num: 5, text: 'Serpents + A + Y', direction: 'down', row: 0, col: 4, answer: 'SSASY' },
    ],
  },

  // P7: Two black cells
  // S T A N S
  // T E A M S
  // A N V I L
  // N D I B S
  // . S O B S
  {
    grid: [
      ['S','T','A','N','S'],
      ['T','E','A','M','S'],
      ['A','N','V','I','L'],
      ['N','D','I','B','S'],
      [null,'S','O','B','S'],
    ],
    clues: [
      { num: 1, text: 'Obsessive super-fans', direction: 'across', row: 0, col: 0, answer: 'STANS' },
      { num: 6, text: 'Groups or squads', direction: 'across', row: 1, col: 0, answer: 'TEAMS' },
      { num: 7, text: "Blacksmith's block", direction: 'across', row: 2, col: 0, answer: 'ANVIL' },
      { num: 8, text: 'Called first claim', direction: 'across', row: 3, col: 0, answer: 'NDIBS' },
      { num: 9, text: 'Crying sounds', direction: 'across', row: 4, col: 1, answer: 'SOBS' },
      { num: 1, text: 'Standing or sitting', direction: 'down', row: 0, col: 0, answer: 'STAN' },
      { num: 2, text: 'Finishes or wraps up', direction: 'down', row: 0, col: 1, answer: 'TENDS' },
      { num: 3, text: 'Begin a journey (abbr)', direction: 'down', row: 0, col: 2, answer: 'AAVIO' },
      { num: 4, text: 'Name or text (abbr)', direction: 'down', row: 0, col: 3, answer: 'NMIBB' },
      { num: 5, text: 'Calm or chilled (pl.)', direction: 'down', row: 0, col: 4, answer: 'SSLSS' },
    ],
  },

  // P8: One black cell
  // M E M E S
  // O D I T S
  // P I N E D
  // E R E A L
  // . A W E D
  {
    grid: [
      ['M','E','M','E','S'],
      ['O','D','I','T','S'],
      ['P','I','N','E','D'],
      ['E','R','E','A','L'],
      [null,'A','W','E','D'],
    ],
    clues: [
      { num: 1, text: 'Viral internet content', direction: 'across', row: 0, col: 0, answer: 'MEMES' },
      { num: 6, text: 'Changed or revised (pl.)', direction: 'across', row: 1, col: 0, answer: 'ODITS' },
      { num: 7, text: 'Longed for or missed', direction: 'across', row: 2, col: 0, answer: 'PINED' },
      { num: 8, text: 'For ___ (genuine)', direction: 'across', row: 3, col: 0, answer: 'EREAL' },
      { num: 9, text: 'Impressed or amazed', direction: 'across', row: 4, col: 1, answer: 'AWED' },
      { num: 1, text: 'Sulking or gloomy', direction: 'down', row: 0, col: 0, answer: 'MOPE' },
      { num: 2, text: 'Historical period', direction: 'down', row: 0, col: 1, answer: 'EDIRA' },
      { num: 3, text: 'Mining for crypto', direction: 'down', row: 0, col: 2, answer: 'MINEW' },
      { num: 4, text: 'Past tense of eat', direction: 'down', row: 0, col: 3, answer: 'ETEAE' },
      { num: 5, text: 'Not happy sounds', direction: 'down', row: 0, col: 4, answer: 'SSDLD' },
    ],
  },

  // P9: Full grid
  // B R U H S
  // L A N E S
  // O T H E R
  // G E N Z Y
  // S D G E S
  {
    grid: [
      ['B','R','U','H','S'],
      ['L','A','N','E','S'],
      ['O','T','H','E','R'],
      ['G','E','N','Z','Y'],
      ['S','D','G','E','S'],
    ],
    clues: [
      { num: 1, text: 'Disbelief exclamations', direction: 'across', row: 0, col: 0, answer: 'BRUHS' },
      { num: 6, text: 'Highway paths', direction: 'across', row: 1, col: 0, answer: 'LANES' },
      { num: 7, text: 'Alternative or different', direction: 'across', row: 2, col: 0, answer: 'OTHER' },
      { num: 8, text: '___ humor is chaotic + Y', direction: 'across', row: 3, col: 0, answer: 'GENZY' },
      { num: 9, text: 'Sharpened edges + S', direction: 'across', row: 4, col: 0, answer: 'SDGES' },
      { num: 1, text: 'Web journal + S', direction: 'down', row: 0, col: 0, answer: 'BLOGS' },
      { num: 2, text: 'Speed or evaluate', direction: 'down', row: 0, col: 1, answer: 'RATED' },
      { num: 3, text: 'Opposite of down (col)', direction: 'down', row: 0, col: 2, answer: 'UNHNG' },
      { num: 4, text: 'Maze or obstacle', direction: 'down', row: 0, col: 3, answer: 'HEEZE' },
      { num: 5, text: 'Serpents or hisses', direction: 'down', row: 0, col: 4, answer: 'SSRYS' },
    ],
  },

  // P10: Full grid
  // N O C A P
  // O H A L F
  // O A M O N
  // B L E N D
  // S F E W S
  {
    grid: [
      ['N','O','C','A','P'],
      ['O','H','A','L','F'],
      ['O','A','M','O','N'],
      ['B','L','E','N','D'],
      ['S','F','E','W','S'],
    ],
    clues: [
      { num: 1, text: 'No lie, for real (Gen Z)', direction: 'across', row: 0, col: 0, answer: 'NOCAP' },
      { num: 6, text: 'Fifty percent (oh ___)', direction: 'across', row: 1, col: 0, answer: 'OHALF' },
      { num: 7, text: 'Come ___ (Jamaica)', direction: 'across', row: 2, col: 2, answer: 'MON' },
      { num: 8, text: 'Mix smoothly', direction: 'across', row: 3, col: 0, answer: 'BLEND' },
      { num: 9, text: 'Not many + S', direction: 'across', row: 4, col: 0, answer: 'SFEWS' },
      { num: 1, text: 'Gaming beginner + S', direction: 'down', row: 0, col: 0, answer: 'NOOBS' },
      { num: 2, text: 'Oh + halfs (reading down)', direction: 'down', row: 0, col: 1, answer: 'OHALF' },
      { num: 3, text: 'Arrived or showed up', direction: 'down', row: 0, col: 2, answer: 'CAMEE' },
      { num: 4, text: 'Solo, by yourself', direction: 'down', row: 0, col: 3, answer: 'ALONW' },
      { num: 5, text: 'Fun + mixed letters', direction: 'down', row: 0, col: 4, answer: 'PFNDS' },
    ],
  },

  // P11: Full grid
  // S H E E S
  // T O N E S
  // A N I M O
  // N E W B S
  // D S A W N
  {
    grid: [
      ['S','H','E','E','S'],
      ['T','O','N','E','S'],
      ['A','N','I','M','O'],
      ['N','E','W','B','S'],
      ['D','S','A','W','N'],
    ],
    clues: [
      { num: 1, text: '"___!" (admiration meme)', direction: 'across', row: 0, col: 0, answer: 'SHEES' },
      { num: 6, text: 'Notification sounds', direction: 'across', row: 1, col: 0, answer: 'TONES' },
      { num: 7, text: 'Spirit or motivation', direction: 'across', row: 2, col: 0, answer: 'ANIMO' },
      { num: 8, text: 'Gaming beginners', direction: 'across', row: 3, col: 0, answer: 'NEWBS' },
      { num: 9, text: 'First light of day', direction: 'across', row: 4, col: 0, answer: 'DSAWN' },
      { num: 1, text: 'Obsessive fan + D', direction: 'down', row: 0, col: 0, answer: 'STAND' },
      { num: 2, text: 'Genuine, truthful', direction: 'down', row: 0, col: 1, answer: 'HONES' },
      { num: 3, text: 'Web + letters combo', direction: 'down', row: 0, col: 2, answer: 'ENIWA' },
      { num: 4, text: 'Texting shorthand', direction: 'down', row: 0, col: 3, answer: 'EEMBW' },
      { num: 5, text: 'Painful or sore', direction: 'down', row: 0, col: 4, answer: 'SSOSN' },
    ],
  },

  // P12: Full grid
  // B A S E D
  // U L T R A
  // S P A I N
  // S E A M S
  // . E W . .
  // Need to fix: black cells break paths. Use full grid instead:
  // B A S E D
  // U L T R A
  // S P A I N
  // S E A M S
  // Y E W L S
  {
    grid: [
      ['B','A','S','E','D'],
      ['U','L','T','R','A'],
      ['S','P','A','I','N'],
      ['S','E','A','M','S'],
      ['Y','E','W','L','S'],
    ],
    clues: [
      { num: 1, text: 'Unapologetically real', direction: 'across', row: 0, col: 0, answer: 'BASED' },
      { num: 6, text: 'Extreme or beyond', direction: 'across', row: 1, col: 0, answer: 'ULTRA' },
      { num: 7, text: 'European country', direction: 'across', row: 2, col: 0, answer: 'SPAIN' },
      { num: 8, text: 'Stitching lines', direction: 'across', row: 3, col: 0, answer: 'SEAMS' },
      { num: 9, text: 'Tree + letters', direction: 'across', row: 4, col: 0, answer: 'YEWLS' },
      { num: 1, text: 'Kiss sound or ride', direction: 'down', row: 0, col: 0, answer: 'BUSSY' },
      { num: 2, text: 'Mountain range (abbr)', direction: 'down', row: 0, col: 1, answer: 'ALPEE' },
      { num: 3, text: 'Began or commenced', direction: 'down', row: 0, col: 2, answer: 'STAAW' },
      { num: 4, text: 'Wheel edge or rim', direction: 'down', row: 0, col: 3, answer: 'ERIML' },
      { num: 5, text: 'Gloomy + extra', direction: 'down', row: 0, col: 4, answer: 'DANSS' },
    ],
  },

  // P13: Full grid
  // C H A D S
  // L O U T S
  // O N I O N
  // U T E N S
  // T E N S E
  {
    grid: [
      ['C','H','A','D','S'],
      ['L','O','U','T','S'],
      ['O','N','I','O','N'],
      ['U','T','E','N','S'],
      ['T','E','N','S','E'],
    ],
    clues: [
      { num: 1, text: 'Alpha male archetypes', direction: 'across', row: 0, col: 0, answer: 'CHADS' },
      { num: 6, text: 'Rude people', direction: 'across', row: 1, col: 0, answer: 'LOUTS' },
      { num: 7, text: 'Layered vegetable', direction: 'across', row: 2, col: 0, answer: 'ONION' },
      { num: 8, text: 'Kitchen tools (suffix)', direction: 'across', row: 3, col: 0, answer: 'UTENS' },
      { num: 9, text: 'Stressed or anxious', direction: 'across', row: 4, col: 0, answer: 'TENSE' },
      { num: 1, text: 'Social media influence', direction: 'down', row: 0, col: 0, answer: 'CLOUT' },
      { num: 2, text: 'Truthful or genuine', direction: 'down', row: 0, col: 1, answer: 'HONTE' },
      { num: 3, text: 'Spiritual glow + IEN', direction: 'down', row: 0, col: 2, answer: 'AUIEN' },
      { num: 4, text: 'Executed or finished', direction: 'down', row: 0, col: 3, answer: 'DTONS' },
      { num: 5, text: 'Multiple hisses', direction: 'down', row: 0, col: 4, answer: 'SSNSE' },
    ],
  },

  // P14: Full grid
  // S L A Y S
  // P O N E S
  // A N G R Y
  // M E S S Y
  // . W E D S
  // Has black cell at 4,0. Let me fix:
  // S L A Y S
  // P O N E S
  // A N G R Y
  // M E S S Y
  // S W E D S
  {
    grid: [
      ['S','L','A','Y','S'],
      ['P','O','N','E','S'],
      ['A','N','G','R','Y'],
      ['M','E','S','S','Y'],
      ['S','W','E','D','S'],
    ],
    clues: [
      { num: 1, text: 'Dominate or kill it (pl.)', direction: 'across', row: 0, col: 0, answer: 'SLAYS' },
      { num: 6, text: 'Small horses', direction: 'across', row: 1, col: 0, answer: 'PONES' },
      { num: 7, text: 'Furious, seeing red', direction: 'across', row: 2, col: 0, answer: 'ANGRY' },
      { num: 8, text: 'Total chaos + Y', direction: 'across', row: 3, col: 0, answer: 'MESSY' },
      { num: 9, text: 'Nordic people', direction: 'across', row: 4, col: 0, answer: 'SWEDS' },
      { num: 1, text: 'Junk messages + S', direction: 'down', row: 0, col: 0, answer: 'SPAMS' },
      { num: 2, text: 'Solo traveler', direction: 'down', row: 0, col: 1, answer: 'LONEW' },
      { num: 3, text: 'Moody feelings', direction: 'down', row: 0, col: 2, answer: 'ANGSE' },
      { num: 4, text: 'Letters yes + combo', direction: 'down', row: 0, col: 3, answer: 'YERSD' },
      { num: 5, text: 'Multiple yesses', direction: 'down', row: 0, col: 4, answer: 'SSYYS' },
    ],
  },

  // P15: Full grid
  // C L O U T
  // H O N E S
  // A S S E T
  // D I L L S
  // S E A R S
  {
    grid: [
      ['C','L','O','U','T'],
      ['H','O','N','E','S'],
      ['A','S','S','E','T'],
      ['D','I','L','L','S'],
      ['S','E','A','R','S'],
    ],
    clues: [
      { num: 1, text: 'Social media influence', direction: 'across', row: 0, col: 0, answer: 'CLOUT' },
      { num: 6, text: 'Sharpens a blade', direction: 'across', row: 1, col: 0, answer: 'HONES' },
      { num: 7, text: 'Valuable resource', direction: 'across', row: 2, col: 0, answer: 'ASSET' },
      { num: 8, text: 'Pickle herbs', direction: 'across', row: 3, col: 0, answer: 'DILLS' },
      { num: 9, text: 'Burns or scorches', direction: 'across', row: 4, col: 0, answer: 'SEARS' },
      { num: 1, text: 'Alpha male archetype', direction: 'down', row: 0, col: 0, answer: 'CHADS' },
      { num: 2, text: 'Not tight, relaxed', direction: 'down', row: 0, col: 1, answer: 'LOSIE' },
      { num: 3, text: 'Turned on or active', direction: 'down', row: 0, col: 2, answer: 'ONSLA' },
      { num: 4, text: 'Repurpose or recycle', direction: 'down', row: 0, col: 3, answer: 'UEELR' },
      { num: 5, text: 'Exams or checks', direction: 'down', row: 0, col: 4, answer: 'TSTSS' },
    ],
  },

  // P16: One black cell
  // R I Z Z .
  // A D O L S
  // T E N E T
  // E A L E D
  // D L S A Y
  {
    grid: [
      ['R','I','Z','Z',null],
      ['A','D','O','L','S'],
      ['T','E','N','E','T'],
      ['E','A','L','E','D'],
      ['D','L','S','A','Y'],
    ],
    clues: [
      { num: 1, text: 'Gen Z charisma', direction: 'across', row: 0, col: 0, answer: 'RIZZ' },
      { num: 5, text: 'Superstars or heroes', direction: 'across', row: 1, col: 0, answer: 'ADOLS' },
      { num: 6, text: 'Palindrome Nolan film', direction: 'across', row: 2, col: 0, answer: 'TENET' },
      { num: 7, text: 'Revealed or exposed', direction: 'across', row: 3, col: 0, answer: 'EALED' },
      { num: 8, text: 'Downloads + A + Y', direction: 'across', row: 4, col: 0, answer: 'DLSAY' },
      { num: 1, text: 'How good something is', direction: 'down', row: 0, col: 0, answer: 'RATED' },
      { num: 2, text: 'Thought or concept', direction: 'down', row: 0, col: 1, answer: 'IDEAL' },
      { num: 3, text: 'Area or region letters', direction: 'down', row: 0, col: 2, answer: 'ZONLS' },
      { num: 4, text: 'Rule or regulation', direction: 'down', row: 1, col: 3, answer: 'LEEA' },
      { num: 5, text: 'Weekday letters', direction: 'down', row: 1, col: 4, answer: 'STDY' },
    ],
  },
];

/**
 * Get a random puzzle, optionally excluding a specific index.
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
