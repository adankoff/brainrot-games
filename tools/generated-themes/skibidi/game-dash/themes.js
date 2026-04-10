/**
 * SKIBIDI TOILET DASH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET DASH",
  scoreLabel: "score",
  accentColor: "#b44dff",
  groundColor: "#2a1040",
  obstacleColor: "#00e5ff",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],

  getPlayerColor(pct) { return "#b44dff"; },
  getPlayerGlow(pct) { return { color: "rgba(180, 77, 255, 0.4)", radius: 8 + pct * 12 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.font = (size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("📷", 0, 0);
    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(1, "#0d0015");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    ctx.fillStyle = "#2a1040";
    ctx.fillRect(0, groundY, W, H);
    ctx.fillStyle = "#b44dff";
    ctx.fillRect(0, groundY, W, 2);
  },

  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#00e5ff";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  },

  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = "#00c7e1";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#00e5ff";
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
