/**
 * SKIBIDI TOILET PIANO -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET PIANO",
  accentColor: "#b44dff",
  bgGradientTop: "#1a0a2e",
  bgGradientBottom: "#0d0015",
  laneLineColor: "rgba(180, 77, 255, 0.25)",
  tileColor: "#170a1f",
  tileActiveColor: "#b44dff",
  tileBorderColor: "#962fe1",
  tileEmoji: "🚽",
  tileEmojiAlt: "🚽",
  scoreColor: "#b44dff",
  comboColor: "#dc75ff",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
  comboMessages: [
    { threshold: 3, text: "bop bop", color: "#b44dff" },
    { threshold: 5, text: "BOP BOP BOP", color: "#b44dff" },
    { threshold: 10, text: "YES YES YES", color: "#b44dff" },
    { threshold: 20, text: "TITAN MODE", color: "#b44dff" },
    { threshold: 35, text: "UPGRADED", color: "#b44dff" },
    { threshold: 50, text: "SIGMA SKIBIDI", color: "#b44dff" },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
