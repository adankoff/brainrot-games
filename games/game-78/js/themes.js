/**
 * SPLATOON MEMORY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON MEMORY",
  accentColor: "#FF4081",
  bgGradientTop: "#1a0028",
  bgGradientBottom: "#0a0014",
  cardFaceColor: "#1e1428",
  cardBorderColor: "rgba(255, 64, 129, 0.3)",
  cardBackColor: "#140a1e",
  cardBackBorderColor: "rgba(255, 64, 129, 0.15)",
  cardBackSymbol: "🦑",
  cardBackSymbolColor: "#804070",
  matchGlowColor: '#4ade80',
  mismatchFlashColor: '#f87171',
  hudColor: "#c070a0",
  timerColor: "#FF4081",
  movesColor: "#c070a0",
  pairs: [
    { emoji: "🦑", label: "Inkling" },
    { emoji: "🐙", label: "Octavio" },
    { emoji: "🎤", label: "Callie" },
    { emoji: "🎶", label: "Marie" },
    { emoji: "👑", label: "Pearl" },
    { emoji: "🎧", label: "Marina" },
    { emoji: "❄️", label: "Shiver" },
    { emoji: "🐱", label: "Judd" },
  ],
  winMessages: ["stay fresh!", "booyah! total domination", "team squid wins the splatfest", "inkopolis plaza is cheering for you"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
