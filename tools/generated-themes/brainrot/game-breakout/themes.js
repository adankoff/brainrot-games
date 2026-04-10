/**
 * BRAINROT BREAKER -- Theme Definition (auto-generated)
 */

const theme = {
  id: "brainrot",
  name: "BRAINROT BREAKER",
  scoreLabel: "aura",
  accentColor: "#c8ff00",
  bgColor: "#050008",
  brickColors: ["#c8ff00", "#b44dff", "#ff6b6b", "#00e5ff", "#ff69b4"],
  paddleColor: "#c8ff00",
  ballColor: "#b44dff",
  catchphrases: ["skibidi", "fanum tax collected", "rizz activated", "only in ohio", "sigma grindset"],
  deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],

  drawBackground(ctx, W, H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0015");
    grad.addColorStop(1, "#050008");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  },

  drawBrick(ctx, x, y, w, h, color, hp) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = "#f0ff28";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (hp > 1) {
      ctx.fillStyle = "#f0f0f0";
      ctx.font = (h * 0.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🧍", x + w / 2, y + h / 2);
    }
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
