/**
 * BRAINROT COLOR SWITCH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT COLOR SWITCH",
  accentColor: "#c8ff00",
  bgColor: "#050008",
  bgColorAlt: "#0a0015",
  particleColor: "rgba(200, 255, 0, 0.15)",
  colors: ["#c8ff00", "#b44dff", "#ff6b6b", "#00e5ff"],
  colorNames: ["lime", "purple", "red", "cyan"],
  ballShape: "skull",
  glowColor: "#c8ff00",
  scoreColor: "#c8ff00",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
