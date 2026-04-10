/**
 * SPLATOON YEET -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON YEET",
  accentColor: "#FF4081",
  bgGradientTop: "#1a0028",
  bgGradientBottom: "#0a0014",
  floorColor: "#1a0820",
  floorHighlight: "#332139",
  wallColor: "#0d0410",
  wallAccent: "rgba(255, 64, 129, 0.13)",
  scoreColor: "#FF4081",
  streakColor: "#ff68a9",

  projectileName: "Splat Bomb",
  projectileColor: "#ff7cbd",
  projectileAccent: "#ff5e9f",
  projectileDetailColor: "#FF4081",

  binName: "Ink Bucket",
  binColor: "#00d262",
  binAccent: "#00E676",
  binRimColor: "#1eff94",
  binInnerColor: "#000000",
  binBaseColor: "#00be4e",

  windArrowColor: "#FF4081",
  trailColor: "rgba(255, 64, 129, 0.3)",

  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],
  winMessages: ["stay fresh!", "booyah! total domination", "team squid wins the splatfest", "inkopolis plaza is cheering for you"],
  scoreLabel: "score",
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
