/**
 * SPLATOON WHACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON WHACK",
  accentColor: "#FF4081",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],
  roster: [
    { id: "callie", name: "Callie", emoji: "🎤", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "marie", name: "Marie", emoji: "🎶", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "pearl", name: "Pearl", emoji: "👑", basePoints: 15, isBonus: false, isPenalty: false },
    { id: "marina", name: "Marina", emoji: "🎧", basePoints: 15, isBonus: false, isPenalty: false },
    { id: "octavio", name: "DJ Octavio", emoji: "🐙", basePoints: 100, isBonus: true, isPenalty: false },
    { id: "inkling", name: "Agent 3", emoji: "🦑", basePoints: -50, isBonus: false, isPenalty: true },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
