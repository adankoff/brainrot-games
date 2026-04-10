/**
 * SPLATOON BREAKER -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON BREAKER",
  scoreLabel: "score",
  accentColor: "#FF4081",
  bgColor: "#0a0014",
  brickColors: ["#FF4081", "#00E676", "#FF9100", "#536DFE", "#FFEA00"],
  paddleColor: "#FF4081",
  ballColor: "#00E676",
  catchphrases: ["booyah!", "this way!", "ouch!", "stay fresh!", "don't get cooked"],
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],

  drawBackground(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0028");
    grad.addColorStop(1, "#0a0014");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = "#ff68a9";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (hp > 1) {
      ctx.fillStyle = "#f0f0f0";
      ctx.font = (h * 0.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🐙", x + w / 2, y + h / 2);
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
