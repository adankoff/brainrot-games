/**
 * Brainrotle -- Word Lists
 * Answer words: brainrot/meme-themed 5-letter words.
 * Valid guesses: includes answer words + common English 5-letter words.
 */

/** @type {string[]} */
export const ANSWER_WORDS = [
  'SIGMA', 'RATIO', 'BRAIN', 'SKULL', 'AURAS',
  'GLAZE', 'BASED', 'QUEEN', 'SALTY', 'GRIND',
  'ALPHA', 'COOKA', 'MANGO', 'VIBES', 'DRIPS',
  'GOATS', 'CLOUT', 'FLAME', 'GHOST', 'TROLL',
  'CHILL', 'FRAUD', 'MEMES', 'MOODS', 'EXTRA',
  'BASIC', 'TOXIC', 'STUNT', 'SWIPE', 'CHAOS',
  'OMEGA', 'CREED', 'FEAST', 'TREND', 'VIRAL',
  'SHARE', 'BOOST', 'POWER', 'LEVEL', 'WORLD',
  'MANGA', 'ANIME', 'PRIMO', 'EDITS', 'SAUCE',
  'ELITE', 'REGAL', 'BEAST', 'FREAK', 'STEAM',
  'SPICY', 'CANON', 'CHIEF', 'CROWN', 'DANCE',
  'GAMER', 'HATER', 'JUICE', 'KARMA', 'LOGIN',
  'MONEY', 'NICHE', 'NERFS', 'PIXEL', 'QUEST',
  'REIGN', 'STORM', 'ULTRA', 'VENOM', 'WIRED',
];

/**
 * Extended set of valid guesses (includes common English words).
 * All uppercase, 5 letters each.
 * @type {Set<string>}
 */
export const VALID_GUESSES = new Set([
  // All answer words are valid guesses
  ...ANSWER_WORDS,
  // Common 5-letter English words
  'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT',
  'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT',
  'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLEY', 'ALLOW', 'ALONE', 'ALONG',
  'ALTER', 'AMONG', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'ANKLE', 'APART',
  'APPLE', 'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMOR', 'ARRAY', 'ASSET',
  'AVOID', 'AWAKE', 'AWARD', 'AWARE', 'AWFUL',
  'BADGE', 'BADLY', 'BAKER', 'BASES', 'BATCH', 'BEACH', 'BEGIN', 'BEING',
  'BELOW', 'BENCH', 'BIBLE', 'BLACK', 'BLADE', 'BLAME', 'BLAND', 'BLANK',
  'BLAST', 'BLAZE', 'BLEED', 'BLEND', 'BLIND', 'BLOCK', 'BLOND', 'BLOOD',
  'BLOOM', 'BLOWN', 'BLUES', 'BLUFF', 'BOARD', 'BONUS', 'BOOTH', 'BOUND',
  'BRAIN', 'BRAND', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIEF',
  'BRING', 'BROAD', 'BROKE', 'BROOK', 'BROWN', 'BRUSH', 'BUILD', 'BUILT',
  'BUNCH', 'BURST', 'BUYER',
  'CABIN', 'CABLE', 'CAMEL', 'CANDY', 'CARRY', 'CATCH', 'CAUSE', 'CEDAR',
  'CHAIN', 'CHAIR', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEEK',
  'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHUNK', 'CIVIL', 'CLAIM', 'CLASS',
  'CLEAN', 'CLEAR', 'CLERK', 'CLICK', 'CLIFF', 'CLIMB', 'CLING', 'CLOCK',
  'CLONE', 'CLOSE', 'CLOTH', 'CLOUD', 'COACH', 'COAST', 'COLOR', 'COMET',
  'CORAL', 'COUCH', 'COUNT', 'COURT', 'COVER', 'CRACK', 'CRAFT', 'CRANE',
  'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CRUEL', 'CRUSH',
  'CURVE', 'CYCLE',
  'DAILY', 'DAIRY', 'DEALT', 'DEATH', 'DEBUT', 'DECAY', 'DELAY', 'DELTA',
  'DENSE', 'DEPTH', 'DERBY', 'DEVIL', 'DIARY', 'DIRTY', 'DISCO', 'DODGE',
  'DOUBT', 'DOUGH', 'DRAFT', 'DRAIN', 'DRAMA', 'DRANK', 'DRAWN', 'DREAM',
  'DRESS', 'DRIED', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DRUNK',
  'DYING',
  'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELDER', 'ELECT', 'ELITE', 'EMPTY',
  'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY',
  'EXACT', 'EXAMS', 'EXILE', 'EXIST',
  'FAINT', 'FAIRY', 'FAITH', 'FALSE', 'FANCY', 'FATAL', 'FAULT', 'FAVOR',
  'FENCE', 'FETCH', 'FEVER', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT',
  'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLESH', 'FLIES', 'FLOAT',
  'FLOOD', 'FLOOR', 'FLOUR', 'FLUID', 'FLUSH', 'FOCAL', 'FOCUS', 'FORCE',
  'FORGE', 'FORTH', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRESH', 'FRONT',
  'FROZE', 'FRUIT', 'FULLY', 'FUNNY', 'FUZZY',
  'GAUGE', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GLORY', 'GOING', 'GRACE',
  'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRAPH', 'GRASP', 'GRASS', 'GRAVE',
  'GREAT', 'GREEN', 'GREET', 'GRILL', 'GROSS', 'GROUP', 'GROWN', 'GUARD',
  'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILT',
  'HABIT', 'HAPPY', 'HARDY', 'HARRY', 'HARSH', 'HASN', 'HAVEN', 'HEART',
  'HEAVY', 'HEDGE', 'HENCE', 'HERBS', 'HONOR', 'HORSE', 'HOTEL', 'HOUSE',
  'HUMAN', 'HUMOR', 'HURRY',
  'IDEAL', 'IMAGE', 'IMPLY', 'INDEX', 'INDIE', 'INNER', 'INPUT', 'ISSUE',
  'IVORY',
  'JENNY', 'JEWEL', 'JIMMY', 'JOINT', 'JOKER', 'JUDGE', 'JUICE',
  'KNACK', 'KNEEL', 'KNIFE', 'KNOCK', 'KNOWN',
  'LABEL', 'LABOR', 'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEAST',
  'LEAVE', 'LEGAL', 'LEMON', 'LIGHT', 'LIMIT', 'LINER', 'LINUX', 'LIVER',
  'LOCAL', 'LOGIC', 'LOOSE', 'LOVER', 'LOWER', 'LOYAL', 'LUCKY', 'LUNAR',
  'LUNCH', 'LYING',
  'MAGIC', 'MAJOR', 'MAKER', 'MANOR', 'MAPLE', 'MARCH', 'MARRY', 'MATCH',
  'MAYOR', 'MEDIA', 'MERCY', 'MERIT', 'METAL', 'METER', 'MIGHT', 'MINER',
  'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOUNT',
  'MOUSE', 'MOUTH', 'MOVED', 'MOVIE', 'MUSIC', 'MYTHS',
  'NAIVE', 'NAMED', 'NERVE', 'NEVER', 'NIGHT', 'NOBLE', 'NOISE', 'NORTH',
  'NOTED', 'NOVEL', 'NURSE',
  'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'OLIVE', 'OPERA', 'ORDER', 'OTHER',
  'OUGHT', 'OUTER', 'OWNER',
  'PAINT', 'PANEL', 'PANIC', 'PAPER', 'PARTY', 'PASTA', 'PATCH', 'PAUSE',
  'PEACE', 'PEACH', 'PEARL', 'PENNY', 'PHASE', 'PHONE', 'PHOTO', 'PIANO',
  'PIECE', 'PILOT', 'PITCH', 'PIXEL', 'PLACE', 'PLAIN', 'PLANE', 'PLANT',
  'PLATE', 'PLAZA', 'PLEAD', 'PLUMB', 'POINT', 'POLAR', 'POUND', 'PRESS',
  'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROBE', 'PROOF',
  'PROUD', 'PROVE', 'PSALM', 'PUNCH', 'PUPIL', 'PURSE',
  'QUEEN', 'QUERY', 'QUEUE', 'QUICK', 'QUIET', 'QUITE', 'QUOTA', 'QUOTE',
  'RADAR', 'RADIO', 'RAISE', 'RALLY', 'RANGE', 'RAPID', 'RATIO', 'REACH',
  'REACT', 'READY', 'REALM', 'REBEL', 'REFER', 'REIGN', 'RELAX', 'REPLY',
  'RIDER', 'RIDGE', 'RIFLE', 'RIGHT', 'RIGID', 'RIVAL', 'RIVER', 'ROBIN',
  'ROBOT', 'ROCKY', 'ROGER', 'ROMAN', 'ROUGE', 'ROUGH', 'ROUND', 'ROUTE',
  'ROYAL', 'RUGBY', 'RULER', 'RURAL',
  'SADLY', 'SAINT', 'SALAD', 'SALON', 'SANDY', 'SAUCE', 'SCALE', 'SCARE',
  'SCENE', 'SCOPE', 'SCORE', 'SCOUT', 'SCREW', 'SEIZE', 'SENSE', 'SERVE',
  'SETUP', 'SEVEN', 'SHALL', 'SHAME', 'SHAPE', 'SHARP', 'SHEER', 'SHEET',
  'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT',
  'SHOUT', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SKULL',
  'SLASH', 'SLEEP', 'SLICE', 'SLIDE', 'SLOPE', 'SMALL', 'SMART', 'SMELL',
  'SMILE', 'SMITH', 'SMOKE', 'SNACK', 'SNAKE', 'SOLAR', 'SOLID', 'SOLVE',
  'SONIC', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPARK', 'SPEAK',
  'SPEED', 'SPEND', 'SPENT', 'SPICE', 'SPIKE', 'SPINE', 'SPLIT', 'SPOKE',
  'SPOON', 'SPORT', 'SPRAY', 'SQUAD', 'STACK', 'STAFF', 'STAGE', 'STAIN',
  'STAKE', 'STALE', 'STALL', 'STAMP', 'STAND', 'STARE', 'START', 'STATE',
  'STAYS', 'STEAL', 'STEEP', 'STEER', 'STICK', 'STIFF', 'STILL', 'STOCK',
  'STONE', 'STOOD', 'STORE', 'STORY', 'STOVE', 'STRAP', 'STRAW', 'STRIP',
  'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUNNY', 'SUPER',
  'SURGE', 'SWEET', 'SWEPT', 'SWIFT', 'SWING', 'SWORD',
  'TABLE', 'TAKEN', 'TASTE', 'TEACH', 'TEETH', 'TEMPO', 'TENDS', 'TENSE',
  'TERMS', 'THANK', 'THEFT', 'THEME', 'THERE', 'THICK', 'THING', 'THINK',
  'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'THUMB', 'TIDAL', 'TIGER',
  'TIGHT', 'TIMER', 'TIRED', 'TITLE', 'TODAY', 'TOKEN', 'TOTAL', 'TOUCH',
  'TOUGH', 'TOWER', 'TRACE', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT',
  'TRASH', 'TREAT', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TROOP', 'TRUCK',
  'TRULY', 'TRUMP', 'TRUNK', 'TRUST', 'TRUTH', 'TUMOR', 'TWICE',
  'UNCLE', 'UNDER', 'UNFIT', 'UNION', 'UNITE', 'UNITY', 'UNTIL', 'UPPER',
  'UPSET', 'URBAN', 'USAGE', 'USUAL', 'UTTER',
  'VAGUE', 'VALID', 'VALUE', 'VAULT', 'VIDEO', 'VIGOR', 'VIRUS', 'VISIT',
  'VITAL', 'VIVID', 'VOCAL', 'VOICE', 'VOTER',
  'WAGES', 'WASTE', 'WATCH', 'WATER', 'WEARY', 'WEAVE', 'WEDGE', 'WHEAT',
  'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WIDER',
  'WITCH', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH',
  'WOULD', 'WOUND', 'WRATH', 'WRITE', 'WRONG', 'WROTE',
  'YACHT', 'YIELD', 'YOUNG', 'YOUTH',
  'ZEBRA', 'ZONES',
  // Additional brainrot/internet slang
  'POGRS', 'DEGEN', 'NOOBS', 'SIMPS', 'STANS', 'SKBDI', 'BUSSI',
  'FINMA', 'GYATT', 'RIZZY', 'CAPPS', 'LITTY', 'CRUNK', 'YEETS',
  'DRIPS', 'GOATS', 'COOKA', 'MEMES', 'MOODS', 'VIBES', 'CLOUT',
]);

/**
 * Get the daily word based on a date seed.
 * Uses a simple hash of the date string to pick from ANSWER_WORDS.
 *
 * @returns {{ word: string, dayIndex: number }}
 */
export function getDailyWord() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const index = hash % ANSWER_WORDS.length;
  return { word: ANSWER_WORDS[index], dayIndex: hash };
}

/**
 * Check if a word is a valid guess.
 *
 * @param {string} word - Uppercase 5-letter word
 * @returns {boolean}
 */
export function isValidGuess(word) {
  return VALID_GUESSES.has(word);
}
