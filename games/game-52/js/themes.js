/**
 * ANIME STACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME STACK",
  colors: ["#FF6600", "#1E90FF", "#FF3366", "#00CC66", "#FFD700"],
  comboTexts: ["power up!", "KAMEHAME...", "KAMEHAMEHA!", "PLUS ULTRA!", "BANKAI!", "ULTRA INSTINCT"],
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
  accentColor: "#FF6600",

  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ["🍥", "🏴‍☠️", "🧢", "👊", "🔥"];
    ctx.fillText(chars[index % chars.length], cx, cy);
    ctx.restore();
  },

  drawBackground(ctx, W, H, cameraY, score) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0d00");
    grad.addColorStop(0.5, "#291c0f");
    grad.addColorStop(1, "#0a0500");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#f0f0f0";
    ctx.globalAlpha = 0.04;
    ctx.font = '20px serif';
    for (let i = 0; i < 15; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      ctx.fillText("🐉", sx, sy);
    }
    ctx.globalAlpha = 1;
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
