/**
 * MEME WORD SEARCH -- Procedural Grid Generator
 * Generates a word search grid with themed meme/brainrot words.
 */

const WORD_BANK = [
  'SIGMA', 'SKIBIDI', 'TOILET', 'BRAINROT', 'RIZZ', 'GYATT', 'OHIO',
  'FANUM', 'GRONK', 'MEWING', 'CLOUT', 'RATIO', 'AURA', 'SALTY',
  'CRINGE', 'BASED', 'VIRAL', 'TREND', 'MEMES', 'TROLL', 'DOGE',
  'PEPE', 'ANIME', 'MANGA', 'NARUTO', 'GOKU', 'LUFFY', 'JOJO',
  'SPLATOON', 'INKLING', 'WOOMY', 'VEEMO', 'BOOYAH', 'SQUAD',
  'POGGERS', 'YEET', 'BUSSIN', 'DRIP', 'FLEX', 'GOAT', 'SLAY',
  'VIBE', 'LOWKEY', 'HIGHKEY', 'SHEESH', 'BRUH', 'STAN', 'SIMP',
  'CHAD', 'KAREN', 'BOOMER', 'ZOOMER', 'ALPHA', 'BETA', 'OMEGA',
  'AMOGUS', 'IMPOSTER', 'CREEPER', 'NOOB', 'NERF', 'BUFF', 'META',
  'TOXIC', 'CLUTCH', 'SPAWN', 'GRIND', 'WAIFU', 'SENPAI', 'KAWAII',
  'NEKO', 'CHIBI', 'GLITCH', 'PIXEL', 'LEVEL', 'QUEST', 'CHILL',
  'RATIO', 'GHOST', 'SNACK', 'FIRE', 'EXTRA', 'MOOD', 'RENT',
  'VIBES', 'SQUAD', 'FERAL', 'ELITE', 'GRIND', 'SWAG', 'HYPE',
];

/**
 * All 8 possible directions: right, down-right, down, down-left,
 * left, up-left, up, up-right.
 */
const DIRECTIONS = [
  { dr: 0, dc: 1 },   // right
  { dr: 1, dc: 1 },   // down-right
  { dr: 1, dc: 0 },   // down
  { dr: 1, dc: -1 },  // down-left
  { dr: 0, dc: -1 },  // left
  { dr: -1, dc: -1 }, // up-left
  { dr: -1, dc: 0 },  // up
  { dr: -1, dc: 1 },  // up-right
];

/**
 * Shuffle an array in place (Fisher-Yates).
 * @param {any[]} arr
 * @returns {any[]}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Try to place a word on the grid.
 * @param {string[][]} grid
 * @param {string} word
 * @param {number} size
 * @returns {Object|null} placement or null if impossible
 */
function tryPlaceWord(grid, word, size) {
  const dirs = shuffle([...DIRECTIONS]);

  for (const { dr, dc } of dirs) {
    // Determine valid starting positions for this direction
    const positions = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const endR = r + dr * (word.length - 1);
        const endC = c + dc * (word.length - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
        positions.push({ r, c });
      }
    }

    shuffle(positions);

    for (const { r, c } of positions) {
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const cr = r + dr * i;
        const cc = c + dc * i;
        const cell = grid[cr][cc];
        if (cell !== '' && cell !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          grid[r + dr * i][c + dc * i] = word[i];
        }
        return {
          word,
          startRow: r,
          startCol: c,
          dirRow: dr,
          dirCol: dc,
        };
      }
    }
  }

  return null;
}

/**
 * Generate a word search grid.
 *
 * @param {number} size - Grid dimension (8, 10, or 12)
 * @param {number} wordCount - Number of words to place
 * @returns {{ grid: string[][], words: string[], placements: Object[] }}
 */
export function generateGrid(size, wordCount) {
  // Filter words that fit in the grid
  const candidates = [...new Set(WORD_BANK)].filter(w => w.length <= size);
  shuffle(candidates);

  // Create empty grid
  const grid = Array.from({ length: size }, () => Array(size).fill(''));

  const placements = [];
  const words = [];

  for (const word of candidates) {
    if (words.length >= wordCount) break;
    const placement = tryPlaceWord(grid, word, size);
    if (placement) {
      placements.push(placement);
      words.push(word);
    }
  }

  // Fill remaining empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * 26)];
      }
    }
  }

  return { grid, words: words.sort(), placements };
}
