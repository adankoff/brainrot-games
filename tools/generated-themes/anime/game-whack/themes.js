/**
 * ANIME WHACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME WHACK",
  accentColor: "#FF6600",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
  roster: [
    { id: "naruto", name: "Naruto", emoji: "🍥", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "luffy", name: "Luffy", emoji: "🏴‍☠️", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "jotaro", name: "Jotaro", emoji: "🧢", basePoints: 15, isBonus: false, isPenalty: false },
    { id: "saitama", name: "Saitama", emoji: "👊", basePoints: 20, isBonus: false, isPenalty: false },
    { id: "frieza", name: "Frieza", emoji: "👿", basePoints: 100, isBonus: true, isPenalty: false },
    { id: "goku", name: "Goku", emoji: "🐉", basePoints: -50, isBonus: false, isPenalty: true },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
