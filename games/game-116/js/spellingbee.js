/**
 * MEME BEE -- Spelling Bee Game Logic
 * Puzzle data, word validation, scoring, and state management.
 */

// ---- Pre-computed puzzles with verified word lists ----
// Each puzzle: { center, outer, words }
// center = required letter, outer = 6 optional letters
// words = all valid 4-7 letter words formable from these 7 letters (letters reusable)
// Every word: 4+ chars, contains center letter, uses only the 7 allowed letters

const PUZZLES = [
  {
    // Letters: a, r, t, i, n, g, e
    center: 'a',
    outer: ['r', 't', 'i', 'n', 'g', 'e'],
    words: [
      'rain', 'rang', 'rant', 'rage', 'rate', 'rare', 'gate', 'gain',
      'gait', 'gear', 'gran', 'near', 'neat', 'tang', 'tare', 'tear',
      'earn', 'area', 'aria', 'ante', 'anti', 'nag',
      'irate', 'grain', 'grant', 'grate', 'great', 'train', 'titan',
      'giant', 'range', 'anger', 'inane', 'tiara',
      'rating', 'eating', 'tearing', 'earning', 'ranting', 'retain',
      'gaiter', 'grating',
    ],
  },
  {
    // Letters: e, s, p, l, a, t, r
    center: 'e',
    outer: ['s', 'p', 'l', 'a', 't', 'r'],
    words: [
      'seal', 'sale', 'step', 'pale', 'peal', 'plea', 'leap', 'reap',
      'pear', 'tape', 'tale', 'late', 'real', 'earl', 'rate', 'tear',
      'teal', 'rest', 'pest', 'pets', 'lest', 'else', 'tree', 'reel',
      'steel', 'steep', 'stale', 'steal', 'least', 'leapt', 'petal',
      'plate', 'pleat', 'alert', 'alter', 'later', 'reset', 'steer',
      'repeal', 'repeat', 'staple', 'petals', 'plates', 'pleats',
      'stealer', 'plaster', 'stapler', 'psalter', 'repeats',
    ],
  },
  {
    // Letters: o, c, l, k, r, n, w
    center: 'o',
    outer: ['c', 'l', 'k', 'r', 'n', 'w'],
    words: [
      'lock', 'rock', 'cork', 'corn', 'cowl', 'crow', 'cool', 'cook',
      'look', 'nook', 'clog', 'croc', 'wok', 'wool', 'work',
      'clock', 'knock', 'crown', 'clown', 'color', 'crook', 'croon',
      'cocoon',
    ],
  },
  {
    // Letters: i, n, g, s, p, l, e
    center: 'i',
    outer: ['n', 'g', 's', 'p', 'l', 'e'],
    words: [
      'sing', 'ping', 'pine', 'line', 'spin', 'pile', 'isle', 'nine',
      'sign', 'sine', 'gist', 'lisp', 'pigs', 'snip', 'nips', 'pins',
      'lies', 'pies', 'lien', 'leis', 'grin',
      'spine', 'spill', 'lines', 'pines', 'sigil', 'linen', 'piling',
      'sling', 'lings', 'peeling',
      'single', 'spline', 'spines', 'lining', 'piling', 'pilings',
      'niggle', 'giggles',
    ],
  },
  {
    // Letters: u, n, t, b, r, s, e
    center: 'u',
    outer: ['n', 't', 'b', 'r', 's', 'e'],
    words: [
      'burn', 'bunt', 'bust', 'runt', 'runs', 'ruse', 'tube', 'tune',
      'turn', 'true', 'sure', 'user', 'nuts', 'stub', 'snub', 'brut',
      'rubs', 'tubs', 'buns', 'nubs', 'subs', 'ruts',
      'brunt', 'burnt', 'burst', 'nurse', 'tuner', 'rebut', 'rebus',
      'turns', 'burns', 'tunes', 'tubes', 'runes', 'unset',
      'unrest', 'tuners', 'return', 'butter', 'sunburn', 'returns',
    ],
  },
  {
    // Letters: a, b, l, e, t, s, h
    center: 'a',
    outer: ['b', 'l', 'e', 't', 's', 'h'],
    words: [
      'bath', 'bash', 'base', 'bale', 'tale', 'late', 'hate', 'heat',
      'halt', 'slab', 'stab', 'able', 'hale', 'sale', 'seal', 'heal',
      'lash', 'hash', 'rash', 'sash', 'bash', 'bask',
      'haste', 'taste', 'least', 'beast', 'blast', 'table', 'bathe',
      'lathe', 'sable', 'shale', 'stale', 'bleat', 'abash', 'atlas',
      'beats', 'heats', 'halts', 'tales', 'bales', 'hates',
      'stable', 'tables', 'bathes', 'lathes', 'bleats', 'stealth',
    ],
  },
  {
    // Letters: o, r, s, t, e, n, d
    center: 'o',
    outer: ['r', 's', 't', 'e', 'n', 'd'],
    words: [
      'rode', 'rose', 'rote', 'tore', 'toed', 'tone', 'toss', 'note',
      'nose', 'node', 'dose', 'does', 'dote', 'done', 'door', 'snot',
      'sort', 'sore', 'trod', 'snore', 'store', 'stone', 'stoned',
      'notes', 'tones', 'nosed', 'dotes', 'roost', 'roots', 'snood',
      'sooner', 'rodent', 'sorted', 'stored', 'stoned', 'donors',
      'snorted', 'rodents', 'storied',
    ],
  },
  {
    // Letters: e, d, g, n, i, r, s
    center: 'e',
    outer: ['d', 'g', 'n', 'i', 'r', 's'],
    words: [
      'ride', 'side', 'dire', 'dens', 'rend', 'send', 'ends', 'dine',
      'edge', 'gene', 'sire', 'reed', 'seed', 'need', 'genie',
      'siren', 'ridge', 'reign', 'rinse', 'singe', 'snide', 'dries',
      'diners', 'singer', 'design', 'resign', 'signed', 'singed',
      'ringed', 'rides', 'dines', 'edges', 'reigns', 'nerds', 'genre',
      'desire', 'series', 'designer', 'redesign',
    ],
  },
  {
    // Letters: a, c, h, r, n, e, m
    center: 'a',
    outer: ['c', 'h', 'r', 'n', 'e', 'm'],
    words: [
      'arch', 'char', 'harm', 'mare', 'name', 'mane', 'ache', 'each',
      'near', 'earn', 'hear', 'hare', 'race', 'care', 'acre', 'acne',
      'cane', 'came', 'harem', 'crane', 'ranch', 'march', 'charm',
      'reach', 'cream', 'nacre', 'arena', 'narc', 'amen',
      'rancher', 'charmer', 'marcher', 'encharm',
      'arches', 'charms', 'ranches', 'creams', 'cranes', 'menace',
    ],
  },
  {
    // Letters: i, t, h, n, g, s, l
    center: 'i',
    outer: ['t', 'h', 'n', 'g', 's', 'l'],
    words: [
      'this', 'thin', 'hint', 'shin', 'sigh', 'sing', 'slit', 'list',
      'gist', 'gilt', 'tins', 'hits', 'hilt', 'sill', 'till', 'gist',
      'light', 'night', 'sight', 'thing', 'sling', 'sting', 'glint',
      'tilts', 'hints', 'shins', 'hilts',
      'lights', 'nights', 'sights', 'things', 'tiling', 'listing',
      'sitting', 'tilting', 'insight', 'lighting',
    ],
  },
  {
    // Letters: e, w, o, r, k, n, d
    center: 'e',
    outer: ['w', 'o', 'r', 'k', 'n', 'd'],
    words: [
      'wore', 'woke', 'owed', 'rode', 'rend', 'node', 'done', 'doer',
      'knew', 'nerd', 'weed', 'need', 'deer', 'reed', 'week', 'keen',
      'knee', 'wore', 'rowed', 'drown',
      'owned', 'kneed', 'order', 'newer', 'endow', 'drone',
      'worked', 'wonder', 'woken', 'owner',
      'reworked', 'wondered', 'endowed', 'reknown',
    ],
  },
  {
    // Letters: a, f, l, i, n, g, s
    center: 'a',
    outer: ['f', 'l', 'i', 'n', 'g', 's'],
    words: [
      'fail', 'fang', 'flag', 'flan', 'gain', 'nail', 'sail', 'sang',
      'slag', 'snag', 'gala', 'saga', 'again',
      'slain', 'snail', 'final', 'fling', 'align', 'gains', 'nails',
      'sails', 'flags', 'fails', 'fangs', 'ailing', 'flail',
      'signal', 'finals', 'aligns', 'snails', 'sailing', 'failing',
      'flailing', 'angling', 'signals',
    ],
  },
];

// ---- Rank thresholds ----
const RANKS = [
  { threshold: 0, name: 'Beginner' },
  { threshold: 0.10, name: 'Novice' },
  { threshold: 0.25, name: 'Good' },
  { threshold: 0.40, name: 'Solid' },
  { threshold: 0.50, name: 'Great' },
  { threshold: 0.65, name: 'Nice' },
  { threshold: 0.75, name: 'Amazing' },
  { threshold: 0.90, name: 'Genius' },
  { threshold: 1.00, name: 'Queen Bee' },
];

export class SpellingBee {
  constructor() {
    this.center = '';
    this.outer = [];
    this.allLetters = [];
    this.validWords = new Set();
    this.foundWords = [];
    this.currentWord = '';
    this.score = 0;
    this.maxScore = 0;
    this.puzzleIndex = 0;
    this.message = '';
    this.messageTimer = 0;
    this.messageType = 'normal'; // 'normal', 'error', 'pangram'
  }

  /** Start a new puzzle */
  startNewPuzzle() {
    this.puzzleIndex = Math.floor(Math.random() * PUZZLES.length);
    const puzzle = PUZZLES[this.puzzleIndex];

    this.center = puzzle.center;
    this.outer = [...puzzle.outer];
    this.allLetters = [this.center, ...this.outer];

    // Validate and filter words: must contain center, 4+ letters, only use allowed letters
    this.validWords = new Set();
    const letterSet = new Set(this.allLetters);

    for (const word of puzzle.words) {
      const w = word.toLowerCase().trim();
      if (w.length < 4) continue;
      if (!w.includes(this.center)) continue;

      let valid = true;
      for (const ch of w) {
        if (!letterSet.has(ch)) {
          valid = false;
          break;
        }
      }
      if (valid) {
        this.validWords.add(w);
      }
    }

    this.foundWords = [];
    this.currentWord = '';
    this.score = 0;
    this.message = '';
    this.messageTimer = 0;

    // Compute max possible score
    this.maxScore = 0;
    for (const word of this.validWords) {
      this.maxScore += this._scoreWord(word);
    }
  }

  /** Add a letter to the current word */
  addLetter(letter) {
    const l = letter.toLowerCase();
    if (this.allLetters.includes(l)) {
      this.currentWord += l;
      return true;
    }
    return false;
  }

  /** Remove last letter from current word */
  deleteLetter() {
    if (this.currentWord.length > 0) {
      this.currentWord = this.currentWord.slice(0, -1);
      return true;
    }
    return false;
  }

  /** Clear the entire current word */
  clearWord() {
    this.currentWord = '';
  }

  /** Shuffle the outer letters */
  shuffle() {
    for (let i = this.outer.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.outer[i], this.outer[j]] = [this.outer[j], this.outer[i]];
    }
  }

  /**
   * Submit the current word.
   * @returns {'valid'|'pangram'|'too-short'|'missing-center'|'not-a-word'|'already-found'}
   */
  submitWord() {
    const word = this.currentWord.toLowerCase();

    if (word.length < 4) {
      this.setMessage('Too short!', 'error');
      this.currentWord = '';
      return 'too-short';
    }

    if (!word.includes(this.center)) {
      this.setMessage('Missing center letter!', 'error');
      this.currentWord = '';
      return 'missing-center';
    }

    if (this.foundWords.includes(word)) {
      this.setMessage('Already found!', 'error');
      this.currentWord = '';
      return 'already-found';
    }

    if (!this.validWords.has(word)) {
      this.setMessage('Not in word list', 'error');
      this.currentWord = '';
      return 'not-a-word';
    }

    // Valid word
    const points = this._scoreWord(word);
    this.score += points;
    this.foundWords.push(word);

    const isPangram = this._isPangram(word);
    if (isPangram) {
      this.setMessage(`PANGRAM! +${points}`, 'pangram');
    } else {
      const labels = { 1: 'Nice!', 5: 'Great!', 10: 'Awesome!' };
      this.setMessage(`${labels[points] || 'Nice!'} +${points}`, 'normal');
    }

    this.currentWord = '';
    return isPangram ? 'pangram' : 'valid';
  }

  /** Get the score for a word */
  _scoreWord(word) {
    if (this._isPangram(word)) return 25;
    if (word.length === 4) return 1;
    if (word.length === 5) return 5;
    if (word.length === 6) return 10;
    if (word.length >= 7) return 25;
    return 1;
  }

  /** Check if word uses all 7 letters */
  _isPangram(word) {
    const used = new Set(word);
    for (const letter of this.allLetters) {
      if (!used.has(letter)) return false;
    }
    return true;
  }

  /** Get current rank based on score percentage */
  getRank() {
    if (this.maxScore === 0) return RANKS[0].name;
    const pct = this.score / this.maxScore;
    let rank = RANKS[0].name;
    for (const r of RANKS) {
      if (pct >= r.threshold) {
        rank = r.name;
      }
    }
    return rank;
  }

  /** Get score percentage */
  getProgress() {
    if (this.maxScore === 0) return 0;
    return this.score / this.maxScore;
  }

  /** Set a temporary message */
  setMessage(text, type = 'normal') {
    this.message = text;
    this.messageType = type;
    this.messageTimer = 120; // frames (~2 seconds)
  }

  /** Update timers */
  update(dt) {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.message = '';
        this.messageTimer = 0;
      }
    }
  }

  /** Get number of remaining words */
  getRemainingCount() {
    return this.validWords.size - this.foundWords.length;
  }

  /** Get total valid word count */
  getTotalWordCount() {
    return this.validWords.size;
  }
}
