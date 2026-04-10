/**
 * SPLATOON 2048 -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON 2048",
  scoreLabel: "score",
  accentColor: "#FF4081",
  bgColor: "#0a0014",
  boardBgColor: "#140a1e",
  cellEmptyColor: "#1e1428",
  textColor: "#f0f0f0",
  tiers: {
  2: { name: "Recruit", color: "#2a1830" },
  4: { name: "Apprentice", color: "#3a2040" },
  8: { name: "Part-Timer", color: "#4a2850" },
  16: { name: "Go-Getter", color: "#5a3060" },
  32: { name: "Overachiever", color: "#6a3870" },
  64: { name: "Profreshional", color: "#8a4090" },
  128: { name: "Hazard Level", color: "#aa48b0" },
  256: { name: "Splattershot", color: "#cc50d0" },
  512: { name: "Hero Shot", color: "#e858e0" },
  1024: { name: "Octobrush", color: "#ff60f0" },
  2048: { name: "GOLDEN TOOTHPICK", color: "#FF4081" },
  },
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  drawTileChar(ctx, cx, cy, size, value) {
    let emoji;
    switch (value) {
      case 2: emoji = "🦑"; break;
      case 4: emoji = "🐙"; break;
      case 8: emoji = "🎤"; break;
      case 16: emoji = "🎶"; break;
      case 32: emoji = "👑"; break;
      case 64: emoji = "🎧"; break;
      case 128: emoji = "❄️"; break;
      case 256: emoji = "🔥"; break;
      case 512: emoji = "🐡"; break;
      case 1024: emoji = "🐱"; break;
      case 2048: emoji = "🦴"; break;
      default: emoji = "🦑"; break;
    }
    ctx.save();
    ctx.font = (size * 0.35) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, cx, cy + 2);
    ctx.restore();
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
