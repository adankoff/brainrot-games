/**
 * BRAINROT MEMORY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT MEMORY",
  accentColor: "#c8ff00",
  bgGradientTop: "#0a0015",
  bgGradientBottom: "#050008",
  cardFaceColor: "#19141c",
  cardBorderColor: "rgba(200, 255, 0, 0.3)",
  cardBackColor: "#0f0a12",
  cardBackBorderColor: "rgba(200, 255, 0, 0.15)",
  cardBackSymbol: "🗿",
  cardBackSymbolColor: "#607030",
  matchGlowColor: '#4ade80',
  mismatchFlashColor: '#f87171',
  hudColor: "#a0b060",
  timerColor: "#c8ff00",
  movesColor: "#a0b060",
  pairs: [
    { emoji: "🗿", label: "Sigma" },
    { emoji: "🧍", label: "NPC" },
    { emoji: "🚽", label: "Skibidi" },
    { emoji: "🍔", label: "Fanum" },
    { emoji: "🏈", label: "Gronk" },
    { emoji: "🎤", label: "Kai" },
    { emoji: "🌽", label: "Ohio" },
    { emoji: "😏", label: "Rizz" },
  ],
  winMessages: ["sigma grindset activated", "W + you have rizz", "that was lowkey bussin", "gyatt you actually won"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
