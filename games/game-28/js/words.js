/**
 * MEME HANGMAN -- Word List
 * Brainrot/meme vocabulary with categories and hints.
 */

/** @type {Array<{ word: string, category: string, hint: string }>} */
export const WORDS = [
  // ---- brainrot ----
  { word: 'SKIBIDI TOILET', category: 'brainrot', hint: 'the thing that haunts your dreams' },
  { word: 'SIGMA GRINDSET', category: 'brainrot', hint: 'lone wolf productivity mindset' },
  { word: 'FANUM TAX', category: 'brainrot', hint: 'when your friend steals your food' },
  { word: 'GYATT', category: 'brainrot', hint: 'expression of sudden admiration' },
  { word: 'OHIO RIZZ', category: 'brainrot', hint: 'only in that one state' },
  { word: 'BABY GRONK', category: 'brainrot', hint: 'tiny football prodigy' },
  { word: 'LEVEL FIVE GYATT', category: 'brainrot', hint: 'the ultimate tier of admiration' },
  { word: 'DUKE DENNIS', category: 'brainrot', hint: 'basketball content creator' },
  { word: 'KAI CENAT', category: 'brainrot', hint: 'twitch streaming legend' },
  { word: 'SKIBIDI RIZZ', category: 'brainrot', hint: 'charisma from the toilet dimension' },
  { word: 'RIZZ GOD', category: 'brainrot', hint: 'ultimate charisma master' },
  { word: 'MEWING', category: 'brainrot', hint: 'jawline improvement technique' },
  { word: 'LOOKSMAXXING', category: 'brainrot', hint: 'optimizing your appearance' },
  { word: 'ALPHA MALE', category: 'brainrot', hint: 'self proclaimed top of the pack' },
  { word: 'BETA MALE', category: 'brainrot', hint: 'the opposite of dominant' },
  { word: 'EDGE LORD', category: 'brainrot', hint: 'tries too hard to be dark' },
  { word: 'SUSSY BAKA', category: 'brainrot', hint: 'suspicious fool in two languages' },
  { word: 'TRALALERO TRALALA', category: 'brainrot', hint: 'italian brainrot shark thing' },
  { word: 'BOMBARDIRO CROCODILO', category: 'brainrot', hint: 'italian brainrot bomber reptile' },
  { word: 'LIRILI LARILA', category: 'brainrot', hint: 'another italian brainrot creature' },

  // ---- memes ----
  { word: 'TROLLFACE', category: 'memes', hint: 'classic rage comic villain' },
  { word: 'DOGE COIN', category: 'memes', hint: 'much wow cryptocurrency' },
  { word: 'NYAN CAT', category: 'memes', hint: 'rainbow poptart feline' },
  { word: 'RICKROLL', category: 'memes', hint: 'never gonna give you up' },
  { word: 'HARAMBE', category: 'memes', hint: 'gorilla gone too soon' },
  { word: 'AMONG US', category: 'memes', hint: 'emergency meeting sus' },
  { word: 'PEPE THE FROG', category: 'memes', hint: 'feels good man' },
  { word: 'STONKS', category: 'memes', hint: 'meme man does finance' },
  { word: 'BIG CHUNGUS', category: 'memes', hint: 'thicc bugs bunny' },
  { word: 'DANK MEMES', category: 'memes', hint: 'the highest quality humor' },
  { word: 'DISTRACTED BOYFRIEND', category: 'memes', hint: 'man looking at another woman' },
  { word: 'LOSS DOT JPG', category: 'memes', hint: 'is this four panels' },
  { word: 'GRUMPY CAT', category: 'memes', hint: 'permanently annoyed feline' },
  { word: 'SHREK IS LOVE', category: 'memes', hint: 'the ogre who is life' },
  { word: 'CHAD THUNDERCOCK', category: 'memes', hint: 'the ultimate gigachad name' },
  { word: 'GIGACHAD', category: 'memes', hint: 'the most based man alive' },
  { word: 'WOJAK', category: 'memes', hint: 'the feels guy drawing' },
  { word: 'COPIUM', category: 'memes', hint: 'inhaling hopeless optimism' },
  { word: 'BASED AND REDPILLED', category: 'memes', hint: 'enlightened opinion haver' },
  { word: 'DEEZ NUTS', category: 'memes', hint: 'gottem joke from vine' },

  // ---- slang ----
  { word: 'NO CAP', category: 'slang', hint: 'speaking nothing but truth' },
  { word: 'SLAY QUEEN', category: 'slang', hint: 'absolutely dominating' },
  { word: 'ITS GIVING', category: 'slang', hint: 'the vibes are radiating' },
  { word: 'MAIN CHARACTER', category: 'slang', hint: 'protagonist of reality' },
  { word: 'RENT FREE', category: 'slang', hint: 'living in your head' },
  { word: 'TOUCH GRASS', category: 'slang', hint: 'go outside for once' },
  { word: 'SKILL ISSUE', category: 'slang', hint: 'just get better lol' },
  { word: 'CAUGHT IN 4K', category: 'slang', hint: 'recorded in high definition' },
  { word: 'BUSSIN', category: 'slang', hint: 'this food is incredible' },
  { word: 'SNATCHED', category: 'slang', hint: 'looking extremely good' },
  { word: 'VIBE CHECK', category: 'slang', hint: 'testing your energy' },
  { word: 'ON GOD', category: 'slang', hint: 'swearing its the truth' },
  { word: 'FR FR', category: 'slang', hint: 'for real for real' },
  { word: 'DEAD', category: 'slang', hint: 'laughing so hard you expired' },
  { word: 'MID', category: 'slang', hint: 'mediocre at best' },
  { word: 'NPC BEHAVIOR', category: 'slang', hint: 'acting like a background character' },
  { word: 'LOWKEY', category: 'slang', hint: 'secretly or subtly' },
  { word: 'HIGHKEY', category: 'slang', hint: 'obviously and openly' },
  { word: 'DOWN BAD', category: 'slang', hint: 'desperately down terrible' },
  { word: 'HITS DIFFERENT', category: 'slang', hint: 'uniquely satisfying experience' },

  // ---- anime ----
  { word: 'DRAGON BALL Z', category: 'anime', hint: 'charging up for five episodes' },
  { word: 'ONE PUNCH MAN', category: 'anime', hint: 'bald hero ends it in one hit' },
  { word: 'ATTACK ON TITAN', category: 'anime', hint: 'big naked giants eating people' },
  { word: 'DEMON SLAYER', category: 'anime', hint: 'breathing techniques vs evil' },
  { word: 'JOJO STAND', category: 'anime', hint: 'bizarre adventure spirit power' },
  { word: 'NARUTO RUN', category: 'anime', hint: 'arms back full speed' },
  { word: 'OVER NINE THOUSAND', category: 'anime', hint: 'vegeta power level meme' },
  { word: 'OMAE WA MOU', category: 'anime', hint: 'you are already done for' },
  { word: 'PLUS ULTRA', category: 'anime', hint: 'go beyond my hero academia' },
  { word: 'DEATH NOTE', category: 'anime', hint: 'write a name and they die' },
  { word: 'SAILOR MOON', category: 'anime', hint: 'fighting evil by moonlight' },
  { word: 'POKEMON MASTER', category: 'anime', hint: 'gotta catch them all trainer' },
  { word: 'KAMEHAMEHA', category: 'anime', hint: 'the og energy beam attack' },
  { word: 'RASENGAN', category: 'anime', hint: 'spinning ball of chakra' },
  { word: 'BANKAI', category: 'anime', hint: 'bleach final sword release' },
  { word: 'WAIFU', category: 'anime', hint: 'fictional character crush' },

  // ---- gaming ----
  { word: 'GG EZ', category: 'gaming', hint: 'good game it was easy' },
  { word: 'NOOB', category: 'gaming', hint: 'a beginner who needs practice' },
  { word: 'CLUTCH OR KICK', category: 'gaming', hint: 'win the round or get removed' },
  { word: 'RAGE QUIT', category: 'gaming', hint: 'leaving because youre angry' },
  { word: 'SPAWN CAMPING', category: 'gaming', hint: 'waiting where enemies appear' },
  { word: 'NERF THIS', category: 'gaming', hint: 'make it weaker please devs' },
  { word: 'PAY TO WIN', category: 'gaming', hint: 'money beats skill' },
  { word: 'BATTLE ROYALE', category: 'gaming', hint: 'last one standing wins' },
];

/**
 * Get a random word entry from the list.
 *
 * @param {Set<number>} [usedIndices] - Indices already used this session
 * @returns {{ word: string, category: string, hint: string, index: number }}
 */
export function getRandomWord(usedIndices = new Set()) {
  const available = [];
  for (let i = 0; i < WORDS.length; i++) {
    if (!usedIndices.has(i)) available.push(i);
  }

  // If all words used, reset
  const pool = available.length > 0 ? available : WORDS.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];

  return { ...WORDS[idx], index: idx };
}
