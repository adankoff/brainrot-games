/**
 * SKIBIDI TOILET 2048 -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET 2048",
  scoreLabel: "score",
  accentColor: "#b44dff",
  bgColor: "#0d0015",
  boardBgColor: "#170a1f",
  cellEmptyColor: "#211429",
  textColor: "#f0f0f0",
  tiers: {
  2: { name: "Plunger", color: "#3a2040" },
  4: { name: "Speaker", color: "#4a2850" },
  8: { name: "TV Man", color: "#5a3060" },
  16: { name: "Cameraman", color: "#6a3870" },
  32: { name: "Buzzsaw", color: "#7a4080" },
  64: { name: "Scientist", color: "#8a4890" },
  128: { name: "G-Man", color: "#9a50a0" },
  256: { name: "Astro", color: "#aa58b0" },
  512: { name: "Titan Cam", color: "#ba60c0" },
  1024: { name: "Titan TV", color: "#ca68d0" },
  2048: { name: "TITAN SPEAKER", color: "#b44dff" },
  },
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],

  drawTileChar(ctx, cx, cy, size, value) {
    let emoji;
    switch (value) {
      case 2: emoji = "📷"; break;
      case 4: emoji = "🚽"; break;
      case 8: emoji = "📺"; break;
      case 16: emoji = "🔊"; break;
      case 32: emoji = "🪠"; break;
      case 64: emoji = "🤖"; break;
      case 128: emoji = "💻"; break;
      case 256: emoji = "🎩"; break;
      case 512: emoji = "🧪"; break;
      case 1024: emoji = "🚀"; break;
      case 2048: emoji = "🪚"; break;
      default: emoji = "📷"; break;
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
