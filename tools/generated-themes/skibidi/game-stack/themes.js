/**
 * SKIBIDI TOILET STACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET STACK",
  colors: ["#b44dff", "#00e5ff", "#ff6b6b", "#c8ff00", "#ff69b4"],
  comboTexts: ["bop bop", "BOP BOP BOP", "YES YES YES", "TITAN MODE", "UPGRADED", "SIGMA SKIBIDI"],
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
  accentColor: "#b44dff",

  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ["📺", "🔊", "🪠", "🤖", "💻"];
    ctx.fillText(chars[index % chars.length], cx, cy);
    ctx.restore();
  },

  drawBackground(ctx, W, H, cameraY, score) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(0.5, "#29193d");
    grad.addColorStop(1, "#0d0015");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#f0f0f0";
    ctx.globalAlpha = 0.04;
    ctx.font = '20px serif';
    for (let i = 0; i < 15; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      ctx.fillText("📷", sx, sy);
    }
    ctx.globalAlpha = 1;
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
