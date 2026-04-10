/**
 * MEME TYPE -- Typing Engine
 * Word bank, word queue management, keystroke processing, and stats tracking.
 */

const COMMON_WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'did',
  'let', 'say', 'she', 'too', 'use', 'big', 'end', 'run', 'set', 'try',
  'ask', 'men', 'own', 'put', 'top', 'red', 'read', 'need', 'land',
  'home', 'hand', 'high', 'keep', 'last', 'long', 'make', 'much',
  'name', 'take', 'come', 'made', 'find', 'back', 'only', 'give',
  'most', 'very', 'when', 'them', 'been', 'have', 'many', 'some',
  'time', 'work', 'call', 'know', 'just', 'good', 'also', 'into',
  'year', 'your', 'over', 'such', 'like', 'then', 'will', 'each',
  'help', 'line', 'turn', 'move', 'live', 'real', 'left', 'same',
  'game', 'play', 'life', 'city', 'best', 'look', 'down', 'side',
  'head', 'long', 'form', 'book', 'word', 'open', 'fire', 'sure',
  'fast', 'love', 'mind', 'dark', 'wild', 'free', 'part', 'face',
  'deep', 'cool', 'hard', 'true', 'full', 'four', 'nice', 'near',
  'hold', 'plan', 'kind', 'must', 'next', 'even', 'more', 'want',
  'done', 'goes', 'feel', 'food', 'away', 'jump', 'king', 'drop',
  'pick', 'push', 'pull', 'rock', 'roll', 'wave', 'show', 'type',
  'speed', 'quick', 'brain', 'power', 'super', 'level', 'score',
  'point', 'right', 'about', 'think', 'would', 'could', 'after',
  'world', 'still', 'great', 'never', 'start', 'might', 'every',
  'being', 'place', 'where', 'thing', 'small', 'large', 'light',
  'story', 'water', 'young', 'night', 'heart', 'music', 'happy',
  'dream', 'magic', 'flash', 'storm', 'watch', 'space', 'sound',
  'earth', 'house', 'human', 'crazy', 'money', 'party', 'power',
  'break', 'clean', 'fresh', 'sharp', 'lucky', 'pixel', 'turbo',
];

const MEME_WORDS = [
  'sigma', 'skibidi', 'brainrot', 'rizz', 'gyatt', 'ohio', 'ratio',
  'based', 'cringe', 'salty', 'viral', 'goated', 'bussin', 'fanum',
  'mewing', 'aura', 'delulu', 'slay', 'vibes', 'bestie', 'yeet',
  'vibe', 'drip', 'fire', 'cap', 'nocap', 'lowkey', 'highkey',
  'simp', 'stan', 'snatched', 'shook', 'slaps', 'hits', 'banger',
  'boomer', 'zoomer', 'karen', 'chad', 'cope', 'copium', 'seethe',
  'mald', 'poggers', 'pog', 'kekw', 'monkas', 'pepega', 'sadge',
  'gigachad', 'amogus', 'sus', 'imposter', 'vent', 'uwu', 'owo',
  'weeb', 'waifu', 'anime', 'manga', 'npc', 'glitch', 'lag',
  'noob', 'clutch', 'nerf', 'buff', 'meta', 'gg', 'ggez',
  'toxic', 'troll', 'flex', 'grind', 'loot', 'spawn', 'sweat',
  'tryhard', 'bot', 'aimbot', 'hacker', 'rekt', 'owned', 'clapped',
  'ratio', 'diddy', 'edging', 'gooning', 'brat', 'demure',
  'hawk', 'tuah', 'fein', 'griddy', 'mog', 'mogging', 'looksmax',
  'maxxing', 'bonesmash', 'jelq', 'canthal', 'tilt', 'ick',
  'roman', 'empire', 'glaze', 'glazing', 'fanumtax', 'sticking',
  'understimulated', 'overstimulated', 'rotmaxx', 'braindead',
];

/**
 * Pick a random word from the combined bank, avoiding the last N words.
 *
 * @param {string[]} recentWords - Words to avoid repeating
 * @returns {string}
 */
function pickRandomWord(recentWords) {
  const bank = Math.random() < 0.4 ? MEME_WORDS : COMMON_WORDS;
  let word;
  let attempts = 0;
  do {
    word = bank[Math.floor(Math.random() * bank.length)];
    attempts++;
  } while (recentWords.includes(word) && attempts < 20);
  return word;
}

/**
 * @typedef {Object} TypingState
 * @property {string[]} queue - Words in the queue (index 0 = current)
 * @property {number} charIndex - Current character position in current word
 * @property {number} wordsCompleted - Total words typed correctly
 * @property {number} charsTyped - Total correct characters typed
 * @property {number} errors - Total error keystrokes
 * @property {number} totalKeystrokes - Total keystrokes (correct + errors)
 * @property {boolean} errorFlash - Whether the current word is flashing red
 * @property {number} errorFlashTimer - Countdown for error flash
 * @property {number} streak - Current consecutive correct words
 * @property {number} maxStreak - Best streak this session
 */

/**
 * Create a new typing engine instance.
 *
 * @returns {Object} Typing engine API
 */
export function createTypingEngine() {
  /** @type {TypingState} */
  const state = {
    queue: [],
    charIndex: 0,
    wordsCompleted: 0,
    charsTyped: 0,
    errors: 0,
    totalKeystrokes: 0,
    errorFlash: false,
    errorFlashTimer: 0,
    streak: 0,
    maxStreak: 0,
  };

  const QUEUE_SIZE = 5;

  /**
   * Reset all state and fill the queue.
   */
  function reset() {
    state.queue = [];
    state.charIndex = 0;
    state.wordsCompleted = 0;
    state.charsTyped = 0;
    state.errors = 0;
    state.totalKeystrokes = 0;
    state.errorFlash = false;
    state.errorFlashTimer = 0;
    state.streak = 0;
    state.maxStreak = 0;

    // Fill initial queue
    const recent = [];
    for (let i = 0; i < QUEUE_SIZE; i++) {
      const word = pickRandomWord(recent);
      state.queue.push(word);
      recent.push(word);
      if (recent.length > 5) recent.shift();
    }
  }

  /**
   * Process a keystroke. Returns an event string.
   *
   * @param {string} key - The character typed
   * @returns {'correct'|'wordComplete'|'error'}
   */
  function processKey(key) {
    if (state.queue.length === 0) return 'error';

    const currentWord = state.queue[0];
    const expectedChar = currentWord[state.charIndex];

    state.totalKeystrokes++;

    if (key === expectedChar) {
      state.charIndex++;
      state.charsTyped++;

      // Check if word is complete
      if (state.charIndex >= currentWord.length) {
        state.wordsCompleted++;
        state.streak++;
        if (state.streak > state.maxStreak) {
          state.maxStreak = state.streak;
        }
        state.charIndex = 0;

        // Remove completed word, add new one
        state.queue.shift();
        const recent = state.queue.slice(0, 5);
        state.queue.push(pickRandomWord(recent));

        return 'wordComplete';
      }

      return 'correct';
    } else {
      state.errors++;
      state.errorFlash = true;
      state.errorFlashTimer = 12; // frames
      state.streak = 0;
      return 'error';
    }
  }

  /**
   * Update per-frame state (error flash countdown).
   *
   * @param {number} dt - Delta time (1.0 = one frame at 60fps)
   */
  function update(dt) {
    if (state.errorFlashTimer > 0) {
      state.errorFlashTimer -= dt;
      if (state.errorFlashTimer <= 0) {
        state.errorFlash = false;
        state.errorFlashTimer = 0;
      }
    }
  }

  /**
   * Get current word being typed.
   *
   * @returns {string}
   */
  function getCurrentWord() {
    return state.queue[0] || '';
  }

  /**
   * Get upcoming words (not including current).
   *
   * @param {number} count - How many preview words
   * @returns {string[]}
   */
  function getPreviewWords(count) {
    return state.queue.slice(1, 1 + count);
  }

  /**
   * Calculate WPM given elapsed seconds.
   * Standard: 1 word = 5 characters.
   *
   * @param {number} elapsedSeconds
   * @returns {number}
   */
  function calculateWPM(elapsedSeconds) {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    return Math.round((state.charsTyped / 5) / minutes);
  }

  /**
   * Calculate accuracy percentage.
   *
   * @returns {number} 0-100
   */
  function calculateAccuracy() {
    if (state.totalKeystrokes === 0) return 100;
    return Math.round(((state.totalKeystrokes - state.errors) / state.totalKeystrokes) * 100);
  }

  /**
   * Get the full state object (read-only snapshot).
   *
   * @returns {TypingState}
   */
  function getState() {
    return { ...state };
  }

  return {
    reset,
    processKey,
    update,
    getCurrentWord,
    getPreviewWords,
    calculateWPM,
    calculateAccuracy,
    getState,
  };
}
