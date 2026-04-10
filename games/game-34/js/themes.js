/**
 * BRAINROT RUN -- Theme Definition (auto-generated from content pack "brainrot")
 */

export const THEMES = {
  "brainrot": {
    id: "brainrot",
    name: "BRAINROT RUN",
    dataTheme: "brainrot",
    accentColor: "#c8ff00",
    deathMessages: ["you fell off + ratio", "negative aura detected", "that was not sigma of you", "only in ohio", "skill issue fr fr", "caught lacking in 4k", "the NPC won this round", "zero rizz moment"],
    colors: {
      sky: "#0a0015",
      skyGradient: "#050008",
      ground: "#1a1030",
      groundAccent: "#c8ff00",
      groundLine: "#b44dff",
    },

    drawPlayer(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🗿", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleGround(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🧱", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleFlying(ctx, x, y, w, h, frame) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🧢", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawObstacleTall(ctx, x, y, w, h) {
      ctx.save();
      ctx.font = `${Math.min(w, h) * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("☠️", x + w / 2, y + h / 2);
      ctx.restore();
    },

    drawCoin(ctx, x, y, r, frame) {
      ctx.save();
      ctx.font = `${r * 1.4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("🏆", x, y);
      ctx.restore();
    },

    drawBackgroundFar(ctx, W, H, offset) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0a0015");
      grad.addColorStop(1, "#050008");
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
        ctx.fillText("🗿", sx, sy);
      }
      ctx.restore();
    },

    drawGround(ctx, W, groundY, groundH, offset) {
      ctx.fillStyle = "#1a1030";
      ctx.fillRect(0, groundY, W, groundH);
      ctx.fillStyle = "#c8ff00";
      ctx.fillRect(0, groundY, W, 2);
    },
  },
};

export const THEME_ORDER = ["brainrot"];
