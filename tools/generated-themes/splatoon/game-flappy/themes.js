/**
 * SPLATOON FLAPPY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "FLAPPY AGENT 3",
  accentColor: "#FF4081",
  pipeColor: "#00E676",
  bgColor: "#1a0028",
  groundColor: "#2a1040",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  drawPlayer(ctx, x, y, w, h, frame) {
    ctx.save();
    ctx.font = (Math.min(w, h) * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🦑", x + w / 2, y + h / 2);
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    ctx.fillStyle = "#00E676";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#14fa8a";
    ctx.fillRect(x - 3, y + (h > 0 ? 0 : h), w + 6, 20);
  },

  drawBackground(ctx, W, H, scrollX) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0028");
    grad.addColorStop(1, "#0a0014");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
