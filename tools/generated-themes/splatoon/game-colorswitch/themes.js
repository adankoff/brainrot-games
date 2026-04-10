/**
 * SPLATOON COLOR SWITCH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON COLOR SWITCH",
  accentColor: "#FF4081",
  bgColor: "#0a0014",
  bgColorAlt: "#1a0028",
  particleColor: "rgba(255, 64, 129, 0.15)",
  colors: ["#FF4081", "#00E676", "#FF9100", "#536DFE"],
  colorNames: ["pink", "green", "orange", "blue"],
  ballShape: "circle",
  glowColor: "#FF4081",
  scoreColor: "#FF4081",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
