/**
 * BRAINROT 2048 -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT 2048",
  scoreLabel: "aura",
  accentColor: "#c8ff00",
  bgColor: "#050008",
  boardBgColor: "#0f0a12",
  cellEmptyColor: "#19141c",
  textColor: "#f0f0f0",
  tiers: {
  2: { name: "Mewer", color: "#1a2000" },
  4: { name: "Maxxer", color: "#2a3010" },
  8: { name: "Ohio Man", color: "#3a4020" },
  16: { name: "Gronk", color: "#4a5030" },
  32: { name: "Fanum", color: "#5a6040" },
  64: { name: "Duke", color: "#6a7050" },
  128: { name: "Kai", color: "#8a9060" },
  256: { name: "Gyatt", color: "#a0b070" },
  512: { name: "Rizz God", color: "#b8d080" },
  1024: { name: "NPC", color: "#d0e890" },
  2048: { name: "SIGMA", color: "#c8ff00" },
  },
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],

  drawTileChar(ctx, cx, cy, size, value) {
    let emoji;
    switch (value) {
      case 2: emoji = "🗿"; break;
      case 4: emoji = "🧍"; break;
      case 8: emoji = "🚽"; break;
      case 16: emoji = "🍔"; break;
      case 32: emoji = "🏈"; break;
      case 64: emoji = "🎮"; break;
      case 128: emoji = "🎤"; break;
      case 256: emoji = "💀"; break;
      case 512: emoji = "🌽"; break;
      case 1024: emoji = "😏"; break;
      case 2048: emoji = "💪"; break;
      default: emoji = "🗿"; break;
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
