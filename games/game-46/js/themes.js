/**
 * BRAINROT YEET -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT YEET",
  accentColor: "#c8ff00",
  bgGradientTop: "#0a0015",
  bgGradientBottom: "#050008",
  floorColor: "#0d0818",
  floorHighlight: "#262131",
  wallColor: "#08050f",
  wallAccent: "rgba(200, 255, 0, 0.13)",
  scoreColor: "#c8ff00",
  streakColor: "#f0ff28",

  projectileName: "Ratio Ball",
  projectileColor: "#ffff3c",
  projectileAccent: "#e6ff1e",
  projectileDetailColor: "#c8ff00",

  binName: "NPC Crowd",
  binColor: "#a039eb",
  binAccent: "#b44dff",
  binRimColor: "#d26bff",
  binInnerColor: "#000000",
  binBaseColor: "#8c25d7",

  windArrowColor: "#c8ff00",
  trailColor: "rgba(200, 255, 0, 0.3)",

  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
  winMessages: ["sigma grindset activated", "W + you have rizz", "that was lowkey bussin", "gyatt you actually won"],
  scoreLabel: "aura",
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
