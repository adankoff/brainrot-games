/**
 * SPLATOON PIANO -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON PIANO",
  accentColor: "#FF4081",
  bgGradientTop: "#1a0028",
  bgGradientBottom: "#0a0014",
  laneLineColor: "rgba(255, 64, 129, 0.25)",
  tileColor: "#140a1e",
  tileActiveColor: "#FF4081",
  tileBorderColor: "#e12263",
  tileEmoji: "🦑",
  tileEmojiAlt: "🐙",
  scoreColor: "#FF4081",
  comboColor: "#ff68a9",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],
  comboMessages: [
    { threshold: 3, text: "nice!", color: "#FF4081" },
    { threshold: 5, text: "BOOYAH!", color: "#FF4081" },
    { threshold: 10, text: "INK STORM", color: "#FF4081" },
    { threshold: 20, text: "SPLAT ZONE SECURED", color: "#FF4081" },
    { threshold: 35, text: "TOWER CONTROL", color: "#FF4081" },
    { threshold: 50, text: "KNOCKOUT WIN", color: "#FF4081" },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
