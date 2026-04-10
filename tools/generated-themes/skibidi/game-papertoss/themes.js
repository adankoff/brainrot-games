/**
 * SKIBIDI TOILET YEET -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET YEET",
  accentColor: "#b44dff",
  bgGradientTop: "#1a0a2e",
  bgGradientBottom: "#0d0015",
  floorColor: "#1a0a20",
  floorHighlight: "#332339",
  wallColor: "#0d0010",
  wallAccent: "rgba(180, 77, 255, 0.13)",
  scoreColor: "#b44dff",
  streakColor: "#dc75ff",

  projectileName: "Toilet Paper Roll",
  projectileColor: "#f089ff",
  projectileAccent: "#d26bff",
  projectileDetailColor: "#b44dff",

  binName: "Toilet Bowl",
  binColor: "#00d1eb",
  binAccent: "#00e5ff",
  binRimColor: "#1effff",
  binInnerColor: "#000001",
  binBaseColor: "#00bdd7",

  windArrowColor: "#b44dff",
  trailColor: "rgba(180, 77, 255, 0.3)",

  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
  winMessages: ["the alliance is saved", "titan-tier signal detected", "skibidi defeated... for now", "bop bop bop YES YES YES"],
  scoreLabel: "score",
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
