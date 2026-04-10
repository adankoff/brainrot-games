/**
 * ANIME PIANO -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME PIANO",
  accentColor: "#FF6600",
  bgGradientTop: "#1a0d00",
  bgGradientBottom: "#0a0500",
  laneLineColor: "rgba(255, 102, 0, 0.25)",
  tileColor: "#140f0a",
  tileActiveColor: "#FF6600",
  tileBorderColor: "#e14800",
  tileEmoji: "🐉",
  tileEmojiAlt: "👿",
  scoreColor: "#FF6600",
  comboColor: "#ff8e28",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
  comboMessages: [
    { threshold: 3, text: "power up!", color: "#FF6600" },
    { threshold: 5, text: "KAMEHAME...", color: "#FF6600" },
    { threshold: 10, text: "KAMEHAMEHA!", color: "#FF6600" },
    { threshold: 20, text: "PLUS ULTRA!", color: "#FF6600" },
    { threshold: 35, text: "BANKAI!", color: "#FF6600" },
    { threshold: 50, text: "ULTRA INSTINCT", color: "#FF6600" },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
