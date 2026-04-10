/**
 * ANIME 2048 -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME 2048",
  scoreLabel: "score",
  accentColor: "#FF6600",
  bgColor: "#0a0500",
  boardBgColor: "#140f0a",
  cellEmptyColor: "#1e1914",
  textColor: "#f0f0f0",
  tiers: {
  2: { name: "Genin", color: "#e0c8a0" },
  4: { name: "Chunin", color: "#d8b888" },
  8: { name: "Jonin", color: "#d0a870" },
  16: { name: "Captain", color: "#c89858" },
  32: { name: "Bankai", color: "#c08840" },
  64: { name: "Saiyan", color: "#ff9900" },
  128: { name: "Super Saiyan", color: "#ff8000" },
  256: { name: "SSJ God", color: "#ff6600" },
  512: { name: "SSJ Blue", color: "#ff4400" },
  1024: { name: "Ultra Ego", color: "#ff2200" },
  2048: { name: "ULTRA INSTINCT", color: "#FFD700" },
  },
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  drawTileChar(ctx, cx, cy, size, value) {
    let emoji;
    switch (value) {
      case 2: emoji = "🐉"; break;
      case 4: emoji = "👿"; break;
      case 8: emoji = "🍥"; break;
      case 16: emoji = "🏴‍☠️"; break;
      case 32: emoji = "🧢"; break;
      case 64: emoji = "👊"; break;
      case 128: emoji = "🔥"; break;
      case 256: emoji = "👁️"; break;
      case 512: emoji = "⚔️"; break;
      case 1024: emoji = "👑"; break;
      case 2048: emoji = "🗡️"; break;
      default: emoji = "🐉"; break;
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
