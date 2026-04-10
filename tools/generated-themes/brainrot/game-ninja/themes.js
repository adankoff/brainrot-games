/**
 * BRAINROT NINJA -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT NINJA",
  accentColor: "#c8ff00",
  trailColor: "rgba(200, 255, 0, 0.5)",
  scoreLabel: "aura",
  bombLabel: "avoid: NPC",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],

  drawObject(ctx, x, y, r, variant) {
    const items = ["💎", "🪙", "🔮", "⭐", "✨"];
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
    ctx.fillText("🧍", x, y);
    ctx.restore();
  },

  drawSliceEffect(ctx, x, y, particles) {
    ctx.save();
    ctx.fillStyle = "#c8ff00";
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
    grad.addColorStop(0, "#0a0015");
    grad.addColorStop(1, "#050008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
