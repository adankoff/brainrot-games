/**
 * BRAINROT WHACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT WHACK",
  accentColor: "#c8ff00",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
  roster: [
    { id: "skibidi", name: "Skibidi Toilet", emoji: "🚽", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "fanum", name: "Fanum Tax", emoji: "🍔", basePoints: 15, isBonus: false, isPenalty: false },
    { id: "gronk", name: "Baby Gronk", emoji: "🏈", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "ohio", name: "Ohio Man", emoji: "🌽", basePoints: 20, isBonus: false, isPenalty: false },
    { id: "rizz", name: "Rizz God", emoji: "😏", basePoints: 100, isBonus: true, isPenalty: false },
    { id: "sigma", name: "Sigma Male", emoji: "🗿", basePoints: -50, isBonus: false, isPenalty: true },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
