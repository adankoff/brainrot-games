/**
 * BRAINROT DASH -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT DASH",
  scoreLabel: "aura",
  accentColor: "#c8ff00",
  groundColor: "#1a1030",
  obstacleColor: "#b44dff",
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],

  getPlayerColor(pct) { return "#c8ff00"; },
  getPlayerGlow(pct) { return { color: "rgba(200, 255, 0, 0.4)", radius: 8 + pct * 12 }; },

  drawPlayer(ctx, x, y, size, rotation, pct) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.font = (size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🗿", 0, 0);
    ctx.restore();
  },

  drawBackground(ctx, W, H, scrollX, pct) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0015");
    grad.addColorStop(1, "#050008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawGround(ctx, W, groundY, H, scrollX, pct) {
    ctx.fillStyle = "#1a1030";
    ctx.fillRect(0, groundY, W, H);
    ctx.fillStyle = "#c8ff00";
    ctx.fillRect(0, groundY, W, 2);
  },

  drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#b44dff";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  },

  drawBlock(ctx, x, y, w, h) {
    ctx.fillStyle = "#962fe1";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#b44dff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  drawFlyingSpike(ctx, x, y, w, h) {
    ctx.fillStyle = "#b44dff";
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
