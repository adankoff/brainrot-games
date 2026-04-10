/**
 * MEME SCRAMBLE -- Anagram / Word Bank Module
 * Provides word selection, shuffling, and validation.
 */

/** Word bank: 150+ words, 4-7 letters. Mix of common + meme/internet culture words. */
const WORD_BANK = [
  // 4-letter words
  'meme', 'yeet', 'cope', 'based', 'vibe', 'drip', 'fire', 'flex',
  'goat', 'king', 'boss', 'mood', 'clap', 'glow', 'hype', 'slay',
  'dank', 'peak', 'rekt', 'noob', 'spam', 'buff', 'nerf', 'loot',
  'frog', 'salt', 'rage', 'doge', 'pepe', 'cringe', 'grid', 'blob',
  'chat', 'doom', 'edit', 'fade', 'giga', 'hack', 'jazz', 'kink',
  'lamp', 'musk', 'nuke', 'orca', 'punk', 'quiz', 'riot', 'snap',
  'trap', 'uber', 'woke', 'zero', 'bomb', 'cook', 'duke', 'epic',
  // 5-letter words
  'sigma', 'bruh', 'ratio', 'cringe', 'brain', 'queen', 'alpha',
  'omega', 'delta', 'grind', 'blaze', 'orbit', 'toast', 'pixel',
  'cyber', 'glitch', 'spawn', 'quest', 'valor', 'chaos', 'steal',
  'swift', 'bliss', 'royal', 'storm', 'flame', 'frost', 'shine',
  'crown', 'magic', 'power', 'trick', 'viral', 'trend', 'emoji',
  'squad', 'clutch', 'swipe', 'block', 'share', 'clash', 'boost',
  // 6-letter words
  'skibidi', 'gigachad', 'savage', 'legend', 'brainrot', 'clutch',
  'cancel', 'clown', 'comply', 'cringe', 'debate', 'divine',
  'energy', 'evolve', 'fandom', 'freeze', 'gravel', 'humble',
  'insane', 'jungle', 'launch', 'master', 'mayhem', 'nebula',
  'octane', 'plasma', 'quartz', 'rascal', 'shield', 'throne',
  'unreal', 'velvet', 'wizard', 'zenith', 'action', 'battle',
  'cosmic', 'dragon', 'goblin', 'knight', 'mystic', 'pirate',
  'shadow', 'spirit', 'temple', 'vortex', 'wonder', 'zombie',
  // 7-letter words
  'bussin', 'rizz', 'sheeesh', 'trigger', 'network', 'phantom',
  'thunder', 'volcano', 'warrior', 'crystal', 'diamond', 'eclipse',
  'fantasy', 'gravity', 'harmony', 'inferno', 'journey', 'kingdom',
  'liberty', 'monster', 'mystery', 'nirvana', 'organic', 'phoenix',
  'quantum', 'rampage', 'samurai', 'tempest', 'unicorn', 'villain',
  'whisper', 'zephyr', 'alchemy', 'ancient', 'banshee', 'captain',
];

/**
 * Filter out duplicates and normalize all words to uppercase.
 * Also re-validate lengths so only 4-7 letter words remain.
 */
const WORDS_BY_LENGTH = new Map();

(function init() {
  const seen = new Set();
  for (const raw of WORD_BANK) {
    const w = raw.toUpperCase().trim();
    if (w.length >= 4 && w.length <= 7 && !seen.has(w)) {
      seen.add(w);
      if (!WORDS_BY_LENGTH.has(w.length)) {
        WORDS_BY_LENGTH.set(w.length, []);
      }
      WORDS_BY_LENGTH.get(w.length).push(w);
    }
  }
})();

/**
 * Fisher-Yates shuffle (in-place).
 *
 * @param {Array} arr
 * @returns {Array} The same array, shuffled.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick a random word from the bank, avoiding recently used words.
 *
 * @param {Set<string>} usedWords - Words already used this session
 * @returns {string} An uppercase word (4-7 letters)
 */
export function pickWord(usedWords) {
  // Weighted pick: favour longer words slightly less often for variety
  const weights = [
    { len: 4, weight: 4 },
    { len: 5, weight: 3 },
    { len: 6, weight: 2 },
    { len: 7, weight: 1 },
  ];

  // Build candidate pool
  let candidates = [];
  for (const { len, weight } of weights) {
    const words = WORDS_BY_LENGTH.get(len) || [];
    const available = words.filter(w => !usedWords.has(w));
    for (let i = 0; i < weight; i++) {
      candidates.push(...available);
    }
  }

  // If we've used everything, reset
  if (candidates.length === 0) {
    usedWords.clear();
    for (const { len, weight } of weights) {
      const words = WORDS_BY_LENGTH.get(len) || [];
      for (let i = 0; i < weight; i++) {
        candidates.push(...words);
      }
    }
  }

  const word = candidates[Math.floor(Math.random() * candidates.length)];
  usedWords.add(word);
  return word;
}

/**
 * Scramble a word so it differs from the original.
 *
 * @param {string} word - Uppercase word to scramble
 * @returns {string[]} Array of individual characters, scrambled
 */
export function scrambleWord(word) {
  const letters = word.split('');
  let attempts = 0;
  do {
    shuffle(letters);
    attempts++;
  } while (letters.join('') === word && attempts < 20);
  return letters;
}

/**
 * Get the score value for a word based on its length.
 *
 * @param {string} word
 * @returns {number}
 */
export function getWordScore(word) {
  switch (word.length) {
    case 4: return 100;
    case 5: return 200;
    case 6: return 400;
    case 7: return 800;
    default: return 100;
  }
}

/**
 * Check if the player's answer matches the target word.
 *
 * @param {string[]} answerLetters - Array of letters the player has placed
 * @param {string} targetWord - The correct word (uppercase)
 * @returns {boolean}
 */
export function checkAnswer(answerLetters, targetWord) {
  return answerLetters.join('') === targetWord;
}
