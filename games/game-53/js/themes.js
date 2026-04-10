/**
 * ANIME SNAKE -- Theme Definition (auto-generated)
 */

const theme = {
  id: "anime",
  name: "ANIME SNAKE",
  scoreLabel: "score",
  accentColor: "#FF6600",
  bgColor: "#0a0500",
  gridColor: "rgba(255, 102, 0, 0.06)",
  scoreColor: "#FF6600",
  hudColor: "#b08050",
  deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],

  drawHead(ctx, x, y, s, dir) {
    ctx.save();
    ctx.font = (s * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🐉", x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawSegment(ctx, x, y, s, index) {
    ctx.save();
    const items = ["🍜", "🫘", "🔪", "🍇", "📜"];
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
    ctx.fillText("🟠", x + s / 2, y + s / 2);
    ctx.restore();
  },

  drawBackground(ctx, gridX, gridY, gridW, gridH, cellSize, cols, rows) {
    ctx.fillStyle = "#0a0500";
    ctx.fillRect(gridX, gridY, gridW, gridH);
    ctx.strokeStyle = "rgba(255, 102, 0, 0.06)";
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
