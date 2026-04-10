/**
 * ANIME NINJA -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME NINJA",
  accentColor: "#FF6600",
  trailColor: "rgba(255, 102, 0, 0.5)",
  scoreLabel: "score",
  bombLabel: "avoid: Frieza",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  drawObject(ctx, x, y, r, variant) {
    const items = ["🍜", "🫘", "🔪", "🍇", "📜"];
    ctx.save();
    ctx.font = (r * 1.4) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(items[variant % items.length], x, y);
    ctx.restore();
  },

  drawBomb(ctx, x, y, r) {
    ctx.save();
    ctx.font = (r * 1.4) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("👿", x, y);
    ctx.restore();
  },

  drawSliceEffect(ctx, x, y, particles) {
    ctx.save();
    ctx.fillStyle = "#FF6600";
    for (const p of particles) {
      ctx.globalAlpha = p.alpha || 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r || 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawBackground(ctx, W, H, time) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0d00");
    grad.addColorStop(1, "#0a0500");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
