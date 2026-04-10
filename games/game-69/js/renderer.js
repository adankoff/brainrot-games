/**
 * SKIBIDI STACK -- Renderer
 * All Canvas drawing: background, placed blocks, moving block,
 * slice-off animation, combo text, score display, flash effects.
 */

import { LOGICAL_WIDTH, LOGICAL_HEIGHT, BLOCK_HEIGHT } from './stack.js';
import { clamp, lerp } from '../../shared/utils.js';

/**
 * Render the full game frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./stack.js').StackState} stack
 * @param {Object} theme - Current theme definition
 * @param {string} internalState - 'ready' | 'active'
 * @param {number} readyTime - Time in ready state (ms)
 */
export function renderFrame(ctx, stack, theme, internalState, readyTime) {
  const W = LOGICAL_WIDTH;
  const H = LOGICAL_HEIGHT;

  ctx.save();

  // ---- Background ----
  theme.drawBackground(ctx, W, H, stack.cameraY, stack.score);

  // ---- Camera transform ----
  ctx.save();
  ctx.translate(0, stack.cameraY);

  // ---- Placed blocks ----
  const colors = theme.colors;
  for (let i = 0; i < stack.blocks.length; i++) {
    const block = stack.blocks[i];

    // Cull blocks far off-screen
    const screenY = block.y + stack.cameraY;
    if (screenY > H + 50 || screenY + BLOCK_HEIGHT < -50) continue;

    drawBlock(ctx, block, colors[block.colorIndex % colors.length], theme, i);
  }

  // ---- Slice pieces ----
  for (const sp of stack.slicePieces) {
    drawSlicePiece(ctx, sp, colors[sp.colorIndex % colors.length]);
  }

  // ---- Moving block ----
  if (stack.movingActive && !stack.gameOver) {
    const nextY = stack.getNextBlockY();
    const colorIndex = stack.blocks.length % colors.length;
    const color = colors[colorIndex];

    drawMovingBlock(ctx, stack.movingX, nextY, stack.movingWidth, BLOCK_HEIGHT, color, readyTime);
  }

  // ---- Combo text effects ----
  for (const ct of stack.comboTexts) {
    drawComboText(ctx, ct, theme.accentColor);
  }

  ctx.restore(); // camera

  // ---- Flash effect ----
  if (stack.flash) {
    drawFlash(ctx, stack.flash, W, H);
  }

  // ---- HUD ----
  drawHUD(ctx, stack, W, theme, internalState, readyTime);

  ctx.restore();
}

/**
 * Draw a placed block with theme decoration.
 */
function drawBlock(ctx, block, color, theme, index) {
  const { x, y, width, height } = block;

  // Block body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Subtle top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x, y, width, 3);

  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x, y + height - 3, width, 3);

  // Left edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x, y, 2, height);

  // Right edge shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x + width - 2, y, 2, height);

  // Theme-specific decoration
  theme.drawBlockDecoration(ctx, x, y, width, height, index);
}

/**
 * Draw the moving block with glow effect.
 */
function drawMovingBlock(ctx, x, y, width, height, color, time) {
  // Glow
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 + Math.sin(time * 0.005) * 4;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.restore();

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x, y, width, 3);

  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x, y + height - 3, width, 3);

  // Pulsing outline
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  ctx.restore();
}

/**
 * Draw a falling slice piece.
 */
function drawSlicePiece(ctx, sp, color) {
  ctx.save();
  ctx.globalAlpha = sp.alpha;
  ctx.translate(sp.x + sp.width / 2, sp.y + sp.height / 2);
  ctx.rotate(sp.rotation);
  ctx.fillStyle = color;
  ctx.fillRect(-sp.width / 2, -sp.height / 2, sp.width, sp.height);
  ctx.restore();
}

/**
 * Draw a combo text popup.
 */
function drawComboText(ctx, ct, accentColor) {
  const progress = 1 - ct.timer / ct.maxTimer;

  // Scale in then hold
  let scale;
  if (progress < 0.2) {
    scale = lerp(0.3, 1.2, progress / 0.2);
  } else if (progress < 0.3) {
    scale = lerp(1.2, 1.0, (progress - 0.2) / 0.1);
  } else {
    scale = 1.0;
  }

  // Fade out in last 30%
  let alpha = 1;
  if (progress > 0.7) {
    alpha = lerp(1, 0, (progress - 0.7) / 0.3);
  }

  // Size grows with combo
  const baseSize = 18 + Math.min(ct.comboCount, 10) * 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(ct.x, ct.y);
  ctx.scale(scale, scale);

  // Text shadow
  ctx.font = `bold ${baseSize}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(ct.text, 2, 2);

  ctx.fillStyle = accentColor;
  ctx.fillText(ct.text, 0, 0);

  // Combo counter if 2+
  if (ct.comboCount >= 2) {
    const comboStr = `x${ct.comboCount}`;
    ctx.font = `bold ${baseSize - 4}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(comboStr, 0, baseSize + 2);
  }

  ctx.restore();
}

/**
 * Draw the screen flash effect on perfect placement.
 */
function drawFlash(ctx, flash, W, H) {
  const progress = 1 - flash.timer / flash.maxTimer;
  const alpha = lerp(0.3, 0, progress);
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Draw the HUD (score, combo counter, ready hint).
 */
function drawHUD(ctx, stack, W, theme, internalState, readyTime) {
  // Score
  ctx.save();
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(String(stack.score), W / 2 + 2, 22);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(stack.score), W / 2, 20);
  ctx.restore();

  // Combo counter (if active)
  if (stack.combo >= 2) {
    ctx.save();
    const comboAlpha = Math.min(1, stack.combo * 0.3);
    ctx.globalAlpha = comboAlpha;
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`COMBO x${stack.combo}`, W / 2, 60);
    ctx.restore();
  }

  // Ready hint
  if (internalState === 'ready') {
    const pulse = 0.5 + Math.sin(readyTime * 0.005) * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.4 + pulse * 0.6;
    ctx.font = '20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('tap to stack', W / 2, LOGICAL_HEIGHT / 2 + 30);
    ctx.restore();
  }
}
