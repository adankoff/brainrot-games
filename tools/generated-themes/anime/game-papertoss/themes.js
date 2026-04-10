/**
 * ANIME YEET -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME YEET",
  accentColor: "#FF6600",
  bgGradientTop: "#1a0d00",
  bgGradientBottom: "#0a0500",
  floorColor: "#2a1508",
  floorHighlight: "#432e21",
  wallColor: "#1a0d04",
  wallAccent: "rgba(255, 102, 0, 0.13)",
  scoreColor: "#FF6600",
  streakColor: "#ff8e28",

  projectileName: "Spirit Bomb",
  projectileColor: "#ffa23c",
  projectileAccent: "#ff841e",
  projectileDetailColor: "#FF6600",

  binName: "Training Dummy",
  binColor: "#0a7ceb",
  binAccent: "#1E90FF",
  binRimColor: "#3caeff",
  binInnerColor: "#000000",
  binBaseColor: "#0068d7",

  windArrowColor: "#FF6600",
  trailColor: "rgba(255, 102, 0, 0.3)",

  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
  winMessages: ["plus ultra!", "this is the power of friendship", "your training arc paid off", "you surpassed your limits"],
  scoreLabel: "score",
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
