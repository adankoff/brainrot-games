/**
 * SKIBIDI TOILET COLOR SWITCH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET COLOR SWITCH",
  accentColor: "#b44dff",
  bgColor: "#0d0015",
  bgColorAlt: "#1a0a2e",
  particleColor: "rgba(180, 77, 255, 0.15)",
  colors: ["#b44dff", "#00e5ff", "#ff6b6b", "#c8ff00"],
  colorNames: ["purple", "cyan", "red", "lime"],
  ballShape: "toilet",
  glowColor: "#b44dff",
  scoreColor: "#b44dff",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
