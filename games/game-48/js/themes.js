/**
 * ANIME FLAPPY -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "FLAPPY GOKU",
  accentColor: "#FF6600",
  pipeColor: "#1E90FF",
  bgColor: "#1a0d00",
  groundColor: "#8B4513",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  drawPlayer(ctx, x, y, w, h, frame) {
    ctx.save();
    ctx.font = (Math.min(w, h) * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐉", x + w / 2, y + h / 2);
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    ctx.fillStyle = "#1E90FF";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#32a4ff";
    ctx.fillRect(x - 3, y + (h > 0 ? 0 : h), w + 6, 20);
  },

  drawBackground(ctx, W, H, scrollX) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0d0a1a");
    grad.addColorStop(1, "#050310");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
