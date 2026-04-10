/**
 * BRAINROT PIANO -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT PIANO",
  accentColor: "#c8ff00",
  bgGradientTop: "#0a0015",
  bgGradientBottom: "#050008",
  laneLineColor: "rgba(200, 255, 0, 0.25)",
  tileColor: "#0f0a12",
  tileActiveColor: "#c8ff00",
  tileBorderColor: "#aae100",
  tileEmoji: "🗿",
  tileEmojiAlt: "🧍",
  scoreColor: "#c8ff00",
  comboColor: "#f0ff28",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
  comboMessages: [
    { threshold: 3, text: "no cap", color: "#c8ff00" },
    { threshold: 5, text: "BUSSIN", color: "#c8ff00" },
    { threshold: 10, text: "SIGMA STREAK", color: "#c8ff00" },
    { threshold: 20, text: "GYATT", color: "#c8ff00" },
    { threshold: 35, text: "OHIO FINAL BOSS", color: "#c8ff00" },
    { threshold: 50, text: "MAXIMUM RIZZ", color: "#c8ff00" },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
