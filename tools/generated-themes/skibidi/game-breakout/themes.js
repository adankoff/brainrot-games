/**
 * SKIBIDI TOILET BREAKER -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET BREAKER",
  scoreLabel: "score",
  accentColor: "#b44dff",
  bgColor: "#0d0015",
  brickColors: ["#b44dff", "#00e5ff", "#ff6b6b", "#c8ff00", "#ff69b4"],
  paddleColor: "#b44dff",
  ballColor: "#00e5ff",
  catchphrases: ["bop bop bop", "yes yes yes", "signal acquired", "flush denied", "camera angle: perfect"],
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],

  drawBackground(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(1, "#0d0015");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = "#dc75ff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (hp > 1) {
      ctx.fillStyle = "#f0f0f0";
      ctx.font = (h * 0.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🚽", x + w / 2, y + h / 2);
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
