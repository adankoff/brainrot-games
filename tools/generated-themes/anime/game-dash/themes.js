/**
 * ANIME DASH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME DASH",
  scoreLabel: "score",
  accentColor: "#FF6600",
  groundColor: "#8B4513",
  obstacleColor: "#1E90FF",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  getPlayerColor(pct) { return "#FF6600"; },
  getPlayerGlow(pct) { return { color: "rgba(255, 102, 0, 0.4)", radius: 8 + pct * 12 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.font = (size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐉", 0, 0);
    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0d0a1a");
    grad.addColorStop(1, "#050310");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, groundY, W, H);
    ctx.fillStyle = "#FF6600";
    ctx.fillRect(0, groundY, W, 2);
  },

  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#1E90FF";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  },

  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = "#0072e1";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#1E90FF";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#1E90FF";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
