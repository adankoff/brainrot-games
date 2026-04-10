/**
 * SKIBIDI TOILET HANGMAN -- Word List (auto-generated)
 */

export const WORDS = [
  { word: "SKIBIDI TOILET", category: "character", hint: "the original brainrot antagonist" },
  { word: "CAMERAMAN", category: "character", hint: "the alliance's frontline soldier" },
  { word: "TV MAN", category: "character", hint: "has a screen for a head" },
  { word: "SPEAKER MAN", category: "character", hint: "attacks with sound waves" },
  { word: "TITAN CAMERAMAN", category: "character", hint: "the biggest alliance hero" },
  { word: "G MAN TOILET", category: "character", hint: "the most powerful skibidi" },
  { word: "BOP BOP BOP", category: "catchphrase", hint: "the skibidi soundtrack" },
  { word: "YES YES YES", category: "catchphrase", hint: "the response to bop" },
  { word: "PLUNGER MAN", category: "character", hint: "melee fighter with a plunger" },
  { word: "BUZZSAW MAN", category: "character", hint: "cuts through toilets" },
  { word: "SCIENTIST TOILET", category: "character", hint: "creates mutations" },
  { word: "ASTRO TOILET", category: "character", hint: "attacks from space" },
  { word: "TITAN TV MAN", category: "character", hint: "teleports the alliance" },
  { word: "SIGNAL LOST", category: "event", hint: "when cameraman goes dark" },
  { word: "FLUSHED", category: "event", hint: "what happens when you lose" },
  { word: "UPGRADE CORE", category: "item", hint: "powers up the alliance" },
  { word: "ALLIANCE", category: "faction", hint: "the good guys" },
  { word: "INFECTION", category: "event", hint: "how toilets recruit" },
  { word: "PARASITE", category: "character", hint: "small toilet that takes over" },
  { word: "MULTIVERSE", category: "concept", hint: "where skibidi spreads" },
];

/**
 * Get a random word, avoiding recently used indices.
 * @param {Set<number>} usedIndices
 * @returns {{ word: string, category: string, hint: string }}
 */
export function getRandomWord(usedIndices = new Set()) {
  const available = WORDS.map((w, i) => i).filter(i => !usedIndices.has(i));
  if (available.length === 0) {
    usedIndices.clear();
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  usedIndices.add(idx);
  return WORDS[idx];
}
