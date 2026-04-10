/**
 * BRAINROT STACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT STACK",
  colors: ["#c8ff00", "#b44dff", "#ff6b6b", "#00e5ff", "#ff69b4"],
  comboTexts: ["no cap", "BUSSIN", "SIGMA STREAK", "GYATT", "OHIO FINAL BOSS", "MAXIMUM RIZZ"],
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
  accentColor: "#c8ff00",

  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ["🚽", "🍔", "🏈", "🎮", "🎤"];
    ctx.fillText(chars[index % chars.length], cx, cy);
    ctx.restore();
  },

  drawBackground(ctx, W, H, cameraY, score) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0015");
    grad.addColorStop(0.5, "#190f24");
    grad.addColorStop(1, "#050008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#f0f0f0";
    ctx.globalAlpha = 0.04;
    ctx.font = '20px serif';
    for (let i = 0; i < 15; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      ctx.fillText("🗿", sx, sy);
    }
    ctx.globalAlpha = 1;
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
