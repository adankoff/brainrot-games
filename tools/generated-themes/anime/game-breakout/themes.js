/**
 * ANIME BREAKER -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME BREAKER",
  scoreLabel: "score",
  accentColor: "#FF6600",
  bgColor: "#0a0500",
  brickColors: ["#FF6600", "#1E90FF", "#FF3366", "#00CC66", "#FFD700"],
  paddleColor: "#FF6600",
  ballColor: "#1E90FF",
  catchphrases: ["believe it!", "plus ultra!", "ora ora ora!", "gomu gomu no!", "kamehameha!"],
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  drawBackground(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0d00");
    grad.addColorStop(1, "#0a0500");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = "#ff8e28";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (hp > 1) {
      ctx.fillStyle = "#f0f0f0";
      ctx.font = (h * 0.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("👿", x + w / 2, y + h / 2);
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
