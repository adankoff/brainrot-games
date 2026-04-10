/**
 * SKIBIDI TOILET FLAPPY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "FLAPPY CAM",
  accentColor: "#b44dff",
  pipeColor: "#00e5ff",
  bgColor: "#1a0a2e",
  groundColor: "#2a1040",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],

  drawPlayer(ctx, x, y, w, h, frame) {
    ctx.save();
    ctx.font = (Math.min(w, h) * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("📷", x + w / 2, y + h / 2);
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#14f9ff";
    ctx.fillRect(x - 3, y + (h > 0 ? 0 : h), w + 6, 20);
  },

  drawBackground(ctx, W, H, scrollX) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(1, "#0d0015");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
