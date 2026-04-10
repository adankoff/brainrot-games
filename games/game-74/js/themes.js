/**
 * SPLATOON DASH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON DASH",
  scoreLabel: "score",
  accentColor: "#FF4081",
  groundColor: "#2a1040",
  obstacleColor: "#00E676",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  getPlayerColor(pct) { return "#FF4081"; },
  getPlayerGlow(pct) { return { color: "rgba(255, 64, 129, 0.4)", radius: 8 + pct * 12 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.font = (size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🦑", 0, 0);
    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0028");
    grad.addColorStop(1, "#0a0014");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    ctx.fillStyle = "#2a1040";
    ctx.fillRect(0, groundY, W, H);
    ctx.fillStyle = "#FF4081";
    ctx.fillRect(0, groundY, W, 2);
  },

  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#00E676";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  },

  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = "#00c858";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#00E676";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#00E676";
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
