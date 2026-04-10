/**
 * SKIBIDI TOILET RUN -- Theme Definition (auto-generated from content pack "skibidi")
 */

export const THEMES = {
  "skibidi": {
    id: "skibidi",
    name: "SKIBIDI TOILET RUN",
    dataTheme: "skibidi",
    accentColor: "#b44dff",
    deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
    colors: {
      sky: "#1a0a2e",
      skyGradient: "#0d0015",
      ground: "#2a1040",
      groundAccent: "#b44dff",
      groundLine: "#6a3890",
    },

    drawPlayer(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("📷", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleGround(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🚽", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleFlying(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🪠", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleTall(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🌊", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawCoin(ctx, x, y, r, frame) {
      ctx.save();
      ctx.font = `${r * 1.4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🔵", x, y);
      ctx.restore();
    },

    drawBackgroundFar(ctx, W, H, offset) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a0a2e");
      grad.addColorStop(1, "#0d0015");
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
        ctx.fillText("📷", sx, sy);
      }
      ctx.restore();
    },

    drawGround(ctx, W, groundY, groundH, offset) {
      ctx.fillStyle = "#2a1040";
      ctx.fillRect(0, groundY, W, groundH);
      ctx.fillStyle = "#b44dff";
      ctx.fillRect(0, groundY, W, 2);
    },
  },
};

export const THEME_ORDER = ["skibidi"];
