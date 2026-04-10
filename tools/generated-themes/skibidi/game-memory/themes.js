/**
 * SKIBIDI TOILET MEMORY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET MEMORY",
  accentColor: "#b44dff",
  bgGradientTop: "#1a0a2e",
  bgGradientBottom: "#0d0015",
  cardFaceColor: "#211429",
  cardBorderColor: "rgba(180, 77, 255, 0.3)",
  cardBackColor: "#170a1f",
  cardBackBorderColor: "rgba(180, 77, 255, 0.15)",
  cardBackSymbol: "🚽",
  cardBackSymbolColor: "#604080",
  matchGlowColor: '#4ade80',
  mismatchFlashColor: '#f87171',
  hudColor: "#9070b0",
  timerColor: "#b44dff",
  movesColor: "#9070b0",
  pairs: [
    { emoji: "📷", label: "Cameraman" },
    { emoji: "🚽", label: "Skibidi" },
    { emoji: "📺", label: "TV Man" },
    { emoji: "🔊", label: "Speaker" },
    { emoji: "🤖", label: "Titan Cam" },
    { emoji: "🎩", label: "G-Man" },
    { emoji: "🪠", label: "Plunger" },
    { emoji: "🚀", label: "Astro" },
  ],
  winMessages: ["the alliance is saved", "titan-tier signal detected", "skibidi defeated... for now", "bop bop bop YES YES YES"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
