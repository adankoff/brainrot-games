/**
 * MEME SOLITAIRE -- Main Entry Point
 * Creates GameShell, wires input, manages game state and rendering.
 */

import { GameShell } from '../../shared/game-shell.js';
import { createInputManager } from '../../shared/input-manager.js';
import { initAudio, playSound, registerSound } from '../../shared/sound-manager.js';
import { SolitaireGame } from './solitaire.js';
import {
  CARD_W, CARD_H, STACK_OFFSET_Y,
  MARGIN_X, MARGIN_TOP, COL_SPACING, TABLEAU_TOP,
  STOCK_X, STOCK_Y, WASTE_X, WASTE_Y,
  foundationX, FOUNDATION_Y, tableauX,
  drawCardBack, drawCardFace, drawEmptyPile,
  drawStockPile, drawWastePile, drawFoundations,
  drawTableau, drawHUD, drawNewDealButton, drawWinOverlay,
} from './renderer.js';

// ---- Constants ----

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;
const GAME_ID = 'meme-solitaire';

// ---- Game State ----

let game = new SolitaireGame();
let audioInitialized = false;

/**
 * Selection state for two-tap move.
 * @type {{source: string, col?: number, cardIdx?: number}|null}
 */
let selection = null;

/** Win animation state */
let winAnimAlpha = 0;
let winTriggered = false;
let winDismissReady = false;

/** Double-tap tracking */
let lastTapTime = 0;
let lastTapTarget = '';

// ---- Sound Registration ----

function registerGameSounds() {
  registerSound('deal', {
    notes: [
      { type: 'sine', frequency: 300, endFrequency: 350, duration: 0.04, gain: 0.08 },
      { type: 'sine', frequency: 350, endFrequency: 400, duration: 0.04, delay: 0.05, gain: 0.06 },
    ],
  });

  registerSound('move', {
    notes: [
      { type: 'sine', frequency: 500, duration: 0.05, gain: 0.1 },
    ],
  });

  registerSound('flip', {
    notes: [
      { type: 'square', frequency: 600, endFrequency: 800, duration: 0.04, gain: 0.06 },
    ],
  });

  registerSound('foundation', {
    notes: [
      { type: 'triangle', frequency: 660, duration: 0.08, gain: 0.15 },
      { type: 'triangle', frequency: 880, duration: 0.08, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('win', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 659, duration: 0.12, delay: 0.12, gain: 0.2 },
      { type: 'sine', frequency: 784, duration: 0.12, delay: 0.24, gain: 0.2 },
      { type: 'sine', frequency: 1047, duration: 0.2, delay: 0.36, gain: 0.25 },
    ],
  });

  registerSound('invalid', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 150, duration: 0.1, gain: 0.08 },
    ],
  });
}

// ---- Shell Setup ----

const shell = new GameShell({
  title: 'MEME SOLITAIRE',
  gameId: GAME_ID,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  maxDisplayWidth: 480,
  theme: '',
  subtitle: 'klondike but make it brainrot',
  accentColor: '#c8ff00',
  shareUrl: 'https://brainrotgames.com/games/game-123/',
});

// ---- Callbacks ----

shell.onStart = () => {
  game = new SolitaireGame();
  game.deal();
  selection = null;
  winAnimAlpha = 0;
  winTriggered = false;
  winDismissReady = false;
  lastTapTime = 0;
  lastTapTarget = '';
  playSound('deal');
};

shell.onUpdate = (dt) => {
  // Win animation
  if (game.won && !winTriggered) {
    winTriggered = true;
    winDismissReady = false;
    playSound('win');
    // Delay before dismiss is allowed
    setTimeout(() => { winDismissReady = true; }, 1500);
  }

  if (winTriggered) {
    winAnimAlpha = Math.min(1, winAnimAlpha + dt * 0.04);
  }
};

shell.onRender = (ctx) => {
  // Clear
  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // HUD
  drawHUD(ctx, game.score, game.moves, game.getElapsedSeconds(), LOGICAL_WIDTH);

  // Stock
  drawStockPile(ctx, game.stock.length);

  // Waste
  const wasteHighlighted = selection !== null && selection.source === 'waste';
  drawWastePile(ctx, game.waste, wasteHighlighted);

  // Foundations
  drawFoundations(ctx, game.foundations);

  // Tableau
  const tableauSel = (selection && selection.source === 'tableau')
    ? { col: selection.col, cardIdx: selection.cardIdx }
    : null;
  drawTableau(ctx, game.tableau, tableauSel);

  // New deal button
  drawNewDealButton(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Win overlay
  if (winTriggered) {
    drawWinOverlay(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, winAnimAlpha);
  }
};

shell.onGameOver = () => {
  const finalScore = game.getFinalScore();
  return {
    score: finalScore,
    message: game.won ? 'solitaire? more like soliGOAT' : 'at least you tried fr',
    scoreLabel: 'score',
  };
};

shell.onGameOverRender = (ctx) => {
  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
};

// ---- Hit Testing ----

/**
 * Determine what was tapped.
 * @param {{x: number, y: number}} pos
 * @returns {{zone: string, col?: number, cardIdx?: number, foundIdx?: number}|null}
 */
function hitTest(pos) {
  const { x, y } = pos;

  // New deal button area (bottom 30px)
  if (y > LOGICAL_HEIGHT - 30) {
    return { zone: 'newdeal' };
  }

  // Stock pile
  if (x >= STOCK_X && x <= STOCK_X + CARD_W &&
      y >= STOCK_Y && y <= STOCK_Y + CARD_H) {
    return { zone: 'stock' };
  }

  // Waste pile
  if (x >= WASTE_X && x <= WASTE_X + CARD_W &&
      y >= WASTE_Y && y <= WASTE_Y + CARD_H) {
    return { zone: 'waste' };
  }

  // Foundation piles
  for (let f = 0; f < 4; f++) {
    const fx = foundationX(f);
    if (x >= fx && x <= fx + CARD_W &&
        y >= FOUNDATION_Y && y <= FOUNDATION_Y + CARD_H) {
      return { zone: 'foundation', foundIdx: f };
    }
  }

  // Tableau columns
  for (let col = 0; col < 7; col++) {
    const tx = tableauX(col);
    if (x < tx || x > tx + CARD_W) continue;

    const pile = game.tableau[col];
    if (pile.length === 0) {
      // Empty column area
      if (y >= TABLEAU_TOP && y <= TABLEAU_TOP + CARD_H) {
        return { zone: 'tableau-empty', col };
      }
      continue;
    }

    // Check from bottom card up (topmost visually)
    for (let i = pile.length - 1; i >= 0; i--) {
      const cardY = TABLEAU_TOP + i * STACK_OFFSET_Y;
      const cardBottom = (i === pile.length - 1) ? cardY + CARD_H : cardY + STACK_OFFSET_Y;
      if (y >= cardY && y < cardBottom) {
        return { zone: 'tableau', col, cardIdx: i };
      }
    }
  }

  return null;
}

// ---- Input Handling ----

function handleTap(pos) {
  if (game.won) {
    if (winDismissReady) {
      shell.setState('game-over');
    }
    return;
  }

  const hit = hitTest(pos);
  if (!hit) {
    selection = null;
    return;
  }

  const now = Date.now();
  const tapKey = `${hit.zone}-${hit.col ?? ''}-${hit.cardIdx ?? ''}`;
  const isDoubleTap = (now - lastTapTime < 400) && (tapKey === lastTapTarget);
  lastTapTime = now;
  lastTapTarget = tapKey;

  // New deal
  if (hit.zone === 'newdeal') {
    selection = null;
    game.deal();
    playSound('deal');
    winAnimAlpha = 0;
    winTriggered = false;
    winDismissReady = false;
    return;
  }

  // Stock tap
  if (hit.zone === 'stock') {
    selection = null;
    const result = game.drawFromStock();
    if (result === 'draw') {
      playSound('flip');
    } else if (result === 'recycle') {
      playSound('deal');
    }
    return;
  }

  // If we have a selection, try to move to tapped destination
  if (selection) {
    const moved = tryMoveSelection(hit);
    if (moved) {
      selection = null;
      return;
    }
    // If tapped same thing, deselect
    if (hit.zone === selection.source &&
        hit.col === selection.col &&
        hit.cardIdx === selection.cardIdx) {
      selection = null;
      return;
    }
    // Otherwise, clear selection and fall through to handle new tap
    selection = null;
  }

  // Double-tap: try to send to foundation
  if (isDoubleTap) {
    if (hit.zone === 'waste' && game.waste.length > 0) {
      const f = game.tryWasteToFoundation();
      if (f >= 0) {
        playSound('foundation');
        return;
      }
    }
    if (hit.zone === 'tableau' && hit.cardIdx === game.tableau[hit.col].length - 1) {
      const f = game.tryTableauToFoundation(hit.col);
      if (f >= 0) {
        playSound('foundation');
        return;
      }
    }
  }

  // Waste tap: select or auto-move
  if (hit.zone === 'waste' && game.waste.length > 0) {
    // Try auto-move first
    const result = game.tryAutoMove('waste');
    if (result) {
      playSound(result.type === 'foundation' ? 'foundation' : 'move');
      return;
    }
    // Select waste card
    selection = { source: 'waste' };
    playSound('flip');
    return;
  }

  // Foundation tap: destination only (no picking up from foundation)
  if (hit.zone === 'foundation') {
    // If nothing selected, ignore
    playSound('invalid');
    return;
  }

  // Tableau tap
  if (hit.zone === 'tableau') {
    const col = game.tableau[hit.col];
    const card = col[hit.cardIdx];

    // Can't interact with face-down cards (except by tapping the top face-down to flip)
    if (!card.faceUp) {
      // Top face-down card auto-flips (handled by game logic when stack moved off)
      playSound('invalid');
      return;
    }

    // Top card: try auto-move
    if (hit.cardIdx === col.length - 1) {
      const result = game.tryAutoMove('tableau', hit.col);
      if (result) {
        playSound(result.type === 'foundation' ? 'foundation' : 'move');
        return;
      }
    }

    // Select for manual move
    selection = { source: 'tableau', col: hit.col, cardIdx: hit.cardIdx };
    playSound('flip');
    return;
  }

  // Empty tableau column
  if (hit.zone === 'tableau-empty') {
    // If we have a selection, try move is already handled above
    // Otherwise nothing to do
    return;
  }
}

/**
 * Try to move the current selection to the given hit target.
 * @param {Object} hit
 * @returns {boolean}
 */
function tryMoveSelection(hit) {
  if (!selection) return false;

  // Move to tableau column
  if (hit.zone === 'tableau' || hit.zone === 'tableau-empty') {
    const destCol = hit.col;

    if (selection.source === 'waste') {
      if (game.moveWasteToTableau(destCol)) {
        playSound('move');
        return true;
      }
    } else if (selection.source === 'tableau') {
      if (game.moveTableauStack(selection.col, selection.cardIdx, destCol)) {
        playSound('move');
        return true;
      }
    }
  }

  // Move to foundation
  if (hit.zone === 'foundation') {
    const foundIdx = hit.foundIdx;

    if (selection.source === 'waste') {
      if (game.moveWasteToFoundation(foundIdx)) {
        playSound('foundation');
        return true;
      }
    } else if (selection.source === 'tableau') {
      // Only top card can go to foundation
      const col = game.tableau[selection.col];
      if (selection.cardIdx === col.length - 1) {
        const f = game.tryTableauToFoundation(selection.col);
        if (f >= 0) {
          playSound('foundation');
          return true;
        }
      }
    }
  }

  playSound('invalid');
  return false;
}

// ---- Initialize ----

shell.init();

const input = createInputManager(shell.getCanvas(), LOGICAL_WIDTH, LOGICAL_HEIGHT);
input.onTapAt((pos) => {
  if (!audioInitialized) {
    try {
      initAudio();
      registerGameSounds();
      audioInitialized = true;
    } catch {
      // Audio failed -- game plays fine without sound
    }
  }

  if (shell.state === 'playing') {
    handleTap(pos);
  }
});
