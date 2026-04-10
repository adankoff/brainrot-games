/**
 * SPLATOON STACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "splatoon",
  name: "SPLATOON STACK",
  colors: ["#FF4081", "#00E676", "#FF9100", "#536DFE", "#FFEA00"],
  comboTexts: ["nice!", "BOOYAH!", "INK STORM", "SPLAT ZONE SECURED", "TOWER CONTROL", "KNOCKOUT WIN"],
  deathMessages: ["splatted!", "you got inked", "wiped out by the splat zone", "octolings got the best of you", "ran out of ink at the worst time", "DJ Octavio sends his regards", "your turf has been claimed", "not so fresh anymore"],
  accentColor: "#FF4081",

  drawBlockDecoration(ctx, x, y, width, height, index) {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ["🎤", "🎶", "👑", "🎧", "❄️"];
    ctx.fillText(chars[index % chars.length], cx, cy);
    ctx.restore();
  },

  drawBackground(ctx, W, H, cameraY, score) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a0028");
    grad.addColorStop(0.5, "#290f37");
    grad.addColorStop(1, "#0a0014");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#f0f0f0";
    ctx.globalAlpha = 0.04;
    ctx.font = '20px serif';
    for (let i = 0; i < 15; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = ((i * 97.3 + cameraY * 0.02) % H + H) % H;
      ctx.fillText("🦑", sx, sy);
    }
    ctx.globalAlpha = 1;
  },
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
