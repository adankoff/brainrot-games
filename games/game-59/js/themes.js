/**
 * ANIME COLOR SWITCH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME COLOR SWITCH",
  accentColor: "#FF6600",
  bgColor: "#0a0500",
  bgColorAlt: "#1a0d00",
  particleColor: "rgba(255, 102, 0, 0.15)",
  colors: ["#FF6600", "#1E90FF", "#FF3366", "#00CC66"],
  colorNames: ["orange", "blue", "red", "green"],
  ballShape: "circle",
  glowColor: "#FF6600",
  scoreColor: "#FF6600",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
