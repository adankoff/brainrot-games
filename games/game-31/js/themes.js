/**
 * BRAINROT FLAPPY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "FLAPPY SIGMA",
  accentColor: "#c8ff00",
  pipeColor: "#b44dff",
  bgColor: "#0a0015",
  groundColor: "#1a1030",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],

  drawPlayer(ctx, x, y, w, h, frame) {
    ctx.save();
    ctx.font = (Math.min(w, h) * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🗿", x + w / 2, y + h / 2);
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    ctx.fillStyle = "#b44dff";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#c861ff";
    ctx.fillRect(x - 3, y + (h > 0 ? 0 : h), w + 6, 20);
  },

  drawBackground(ctx, W, H, scrollX) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0015");
    grad.addColorStop(1, "#050008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
