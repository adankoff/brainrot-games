/**
 * ANIME RUN -- Theme Definition (auto-generated from content pack "anime")
 */

export const THEMES = {
  "anime": {
    id: "anime",
    name: "ANIME RUN",
    dataTheme: "anime",
    accentColor: "#FF6600",
    deathMessages: ["omae wa mou shindeiru", "your power level is... pathetic", "even yamcha lasted longer", "you need more training arcs", "that was your filler episode", "this isn't even your final form... oh wait it is", "the talk no jutsu failed", "you got isekai'd to the shadow realm"],
    colors: {
      sky: "#0d0a1a",
      skyGradient: "#050310",
      ground: "#8B4513",
      groundAccent: "#FF6600",
      groundLine: "#c07020",
    },

    drawPlayer(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🐉", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleGround(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🔴", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleFlying(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("👹", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleTall(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("📓", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawCoin(ctx, x, y, r, frame) {
      ctx.save();
      ctx.font = `${r * 1.4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🟠", x, y);
      ctx.restore();
    },

    drawBackgroundFar(ctx, W, H, offset) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0d0a1a");
      grad.addColorStop(1, "#050310");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    },

    drawBackgroundMid(ctx, W, H, offset) {
      // Subtle floating symbols in parallax
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.font = '24px serif';
      ctx.fillStyle = "#f0f0f0";
      for (let i = 0; i < 6; i++) {
        const sx = ((i * 173 + offset * 0.1) % (W + 100)) - 50;
        const sy = 60 + (i * 67) % (H * 0.5);
        ctx.fillText("🐉", sx, sy);
      }
      ctx.restore();
    },

    drawGround(ctx, W, groundY, groundH, offset) {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, groundY, W, groundH);
      ctx.fillStyle = "#FF6600";
      ctx.fillRect(0, groundY, W, 2);
    },
  },
};

export const THEME_ORDER = ["anime"];
