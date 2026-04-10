/**
 * ANIME MEMORY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME MEMORY",
  accentColor: "#FF6600",
  bgGradientTop: "#1a0d00",
  bgGradientBottom: "#0a0500",
  cardFaceColor: "#1e1914",
  cardBorderColor: "rgba(255, 102, 0, 0.3)",
  cardBackColor: "#140f0a",
  cardBackBorderColor: "rgba(255, 102, 0, 0.15)",
  cardBackSymbol: "?",
  cardBackSymbolColor: "#705030",
  matchGlowColor: '#4ade80',
  mismatchFlashColor: '#f87171',
  hudColor: "#b08050",
  timerColor: "#FF6600",
  movesColor: "#b08050",
  pairs: [
    { emoji: "🐉", label: "Goku" },
    { emoji: "👿", label: "Frieza" },
    { emoji: "🍥", label: "Naruto" },
    { emoji: "🏴‍☠️", label: "Luffy" },
    { emoji: "🧢", label: "Jotaro" },
    { emoji: "👊", label: "Saitama" },
    { emoji: "🔥", label: "Tanjiro" },
    { emoji: "👁️", label: "Gojo" },
  ],
  winMessages: ["plus ultra!", "this is the power of friendship", "your training arc paid off", "you surpassed your limits"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
