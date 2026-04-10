/**
 * SKIBIDI TOILET NINJA -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET NINJA",
  accentColor: "#b44dff",
  trailColor: "rgba(180, 77, 255, 0.5)",
  scoreLabel: "score",
  bombLabel: "avoid: Skibidi",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],

  drawObject(ctx, x, y, r, variant) {
    const items = ["🔋", "📡", "💾", "⚡", "📶"];
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
    ctx.fillText("🚽", x, y);
    ctx.restore();
  },

  drawSliceEffect(ctx, x, y, particles) {
    ctx.save();
    ctx.fillStyle = "#b44dff";
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
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(1, "#0d0015");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
