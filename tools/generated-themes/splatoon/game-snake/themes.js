/**
 * SPLATOON SNAKE -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON SNAKE",
  scoreLabel: "score",
  accentColor: "#FF4081",
  bgColor: "#0a0014",
  gridColor: "rgba(255, 64, 129, 0.06)",
  scoreColor: "#FF4081",
  hudColor: "#c070a0",
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  drawHead(ctx, x, y, s, dir) {
    ctx.save();
    ctx.font = (s * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🦑", x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawSegment(ctx, x, y, s, index) {
    ctx.save();
    const items = ["💣", "🫙", "🐚", "🥇", "🐟"];
    ctx.font = (s * 0.6) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(items[index % items.length], x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawFood(ctx, x, y, s, frame) {
    ctx.save();
    const scale = 1 + Math.sin(frame * 0.1) * 0.1;
    ctx.font = (s * 0.7 * scale) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🥚", x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    ctx.fillStyle = "#0a0014";
    ctx.fillRect(gridX, gridY, gridW, gridH);
    ctx.strokeStyle = "rgba(255, 64, 129, 0.06)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(gridX, gridY + r * cellSize);
      ctx.lineTo(gridX + gridW, gridY + r * cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(gridX + c * cellSize, gridY);
      ctx.lineTo(gridX + c * cellSize, gridY + gridH);
      ctx.stroke();
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
