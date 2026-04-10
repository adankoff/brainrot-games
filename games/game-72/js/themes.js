/**
 * SPLATOON NINJA -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON NINJA",
  accentColor: "#FF4081",
  trailColor: "rgba(255, 64, 129, 0.5)",
  scoreLabel: "score",
  bombLabel: "avoid: Octavio",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  drawObject(ctx, x, y, r, variant) {
    const items = ["💣", "🫙", "🐚", "🥇", "🐟"];
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
    ctx.fillText("🐙", x, y);
    ctx.restore();
  },

  drawSliceEffect(ctx, x, y, particles) {
    ctx.save();
    ctx.fillStyle = "#FF4081";
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
    grad.addColorStop(0, "#1a0028");
    grad.addColorStop(1, "#0a0014");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
