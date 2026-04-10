/**
 * MEME SOLITAIRE -- Solitaire Engine
 * Core Klondike Solitaire logic: deck, deal, moves, win detection.
 * Draw-1 variant.
 */

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * @param {string} suit
 * @returns {boolean}
 */
function isRed(suit) {
  return suit === 'hearts' || suit === 'diamonds';
}

/**
 * Create a standard 52-card deck.
 * @returns {Array<{suit: string, rank: string, faceUp: boolean}>}
 */
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle in place.
 * @param {Array} arr
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Get numeric value of a rank (A=1, 2=2, ..., K=13).
 * @param {string} rank
 * @returns {number}
 */
function rankValue(rank) {
  const idx = RANKS.indexOf(rank);
  return idx + 1;
}

export class SolitaireGame {
  constructor() {
    /** @type {Array<Array<{suit:string, rank:string, faceUp:boolean}>>} */
    this.tableau = [[], [], [], [], [], [], []];

    /** @type {Array<Array<{suit:string, rank:string, faceUp:boolean}>>} */
    this.foundations = [[], [], [], []];

    /** @type {Array<{suit:string, rank:string, faceUp:boolean}>} */
    this.stock = [];

    /** @type {Array<{suit:string, rank:string, faceUp:boolean}>} */
    this.waste = [];

    this.score = 0;
    this.moves = 0;
    this.stockRecycles = 0;
    this.startTime = 0;
    this.won = false;
  }

  /**
   * Deal a new game.
   */
  deal() {
    const deck = createDeck();
    shuffle(deck);

    this.tableau = [[], [], [], [], [], [], []];
    this.foundations = [[], [], [], []];
    this.stock = [];
    this.waste = [];
    this.score = 0;
    this.moves = 0;
    this.stockRecycles = 0;
    this.startTime = Date.now();
    this.won = false;

    // Deal tableau: column i gets i+1 cards, top face-up
    let idx = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck[idx++];
        card.faceUp = (row === col);
        this.tableau[col].push(card);
      }
    }

    // Remaining cards go to stock
    for (let i = idx; i < deck.length; i++) {
      deck[i].faceUp = false;
      this.stock.push(deck[i]);
    }
  }

  /**
   * Draw one card from stock to waste.
   * @returns {'draw'|'recycle'|'empty'}
   */
  drawFromStock() {
    if (this.stock.length > 0) {
      const card = this.stock.pop();
      card.faceUp = true;
      this.waste.push(card);
      this.moves++;
      return 'draw';
    } else if (this.waste.length > 0) {
      // Recycle waste back to stock
      while (this.waste.length > 0) {
        const card = this.waste.pop();
        card.faceUp = false;
        this.stock.push(card);
      }
      this.stockRecycles++;
      this.score = Math.max(0, this.score - 15);
      this.moves++;
      return 'recycle';
    }
    return 'empty';
  }

  /**
   * Check if a card can go on a foundation pile.
   * @param {{suit:string, rank:string}} card
   * @param {number} foundIdx
   * @returns {boolean}
   */
  canMoveToFoundation(card, foundIdx) {
    const pile = this.foundations[foundIdx];
    if (pile.length === 0) {
      return card.rank === 'A';
    }
    const top = pile[pile.length - 1];
    return top.suit === card.suit && rankValue(card.rank) === rankValue(top.rank) + 1;
  }

  /**
   * Check if a card can go on a tableau column.
   * @param {{suit:string, rank:string}} card
   * @param {number} colIdx
   * @returns {boolean}
   */
  canMoveToTableau(card, colIdx) {
    const col = this.tableau[colIdx];
    if (col.length === 0) {
      return card.rank === 'K';
    }
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return isRed(card.suit) !== isRed(top.suit) &&
           rankValue(card.rank) === rankValue(top.rank) - 1;
  }

  /**
   * Try to move the top waste card to a foundation.
   * @returns {number} foundation index or -1
   */
  tryWasteToFoundation() {
    if (this.waste.length === 0) return -1;
    const card = this.waste[this.waste.length - 1];
    for (let f = 0; f < 4; f++) {
      if (this.canMoveToFoundation(card, f)) {
        this.waste.pop();
        this.foundations[f].push(card);
        this.score += 10;
        this.moves++;
        this._checkWin();
        return f;
      }
    }
    return -1;
  }

  /**
   * Try to move the top waste card to a tableau column.
   * @returns {number} column index or -1
   */
  tryWasteToTableau() {
    if (this.waste.length === 0) return -1;
    const card = this.waste[this.waste.length - 1];
    for (let c = 0; c < 7; c++) {
      if (this.canMoveToTableau(card, c)) {
        this.waste.pop();
        this.tableau[c].push(card);
        this.score += 5;
        this.moves++;
        return c;
      }
    }
    return -1;
  }

  /**
   * Try to auto-move a card from a specific source.
   * Priority: foundation first, then tableau.
   * @param {'waste'|'tableau'} source
   * @param {number} [colIdx] - for tableau source
   * @param {number} [cardIdx] - for tableau source (index within column)
   * @returns {{type: string, dest: number}|null}
   */
  tryAutoMove(source, colIdx, cardIdx) {
    if (source === 'waste') {
      let f = this.tryWasteToFoundation();
      if (f >= 0) return { type: 'foundation', dest: f };
      let c = this.tryWasteToTableau();
      if (c >= 0) return { type: 'tableau', dest: c };
      return null;
    }

    if (source === 'tableau') {
      const col = this.tableau[colIdx];
      if (!col || col.length === 0) return null;

      // If cardIdx is provided and it's the top card, try foundation
      if (cardIdx === undefined || cardIdx === col.length - 1) {
        const card = col[col.length - 1];
        if (!card.faceUp) return null;

        // Try foundation
        for (let f = 0; f < 4; f++) {
          if (this.canMoveToFoundation(card, f)) {
            col.pop();
            this.foundations[f].push(card);
            this.score += 10;
            this.moves++;
            this._flipTopCard(colIdx);
            this._checkWin();
            return { type: 'foundation', dest: f };
          }
        }

        // Try tableau (single card)
        for (let c = 0; c < 7; c++) {
          if (c === colIdx) continue;
          if (this.canMoveToTableau(card, c)) {
            col.pop();
            this.tableau[c].push(card);
            this.score += 5;
            this.moves++;
            this._flipTopCard(colIdx);
            return { type: 'tableau', dest: c };
          }
        }
        return null;
      }

      // Moving a stack from cardIdx to end of column
      if (cardIdx < col.length - 1 && col[cardIdx].faceUp) {
        const movingCards = col.slice(cardIdx);
        const bottomCard = movingCards[0];

        for (let c = 0; c < 7; c++) {
          if (c === colIdx) continue;
          if (this.canMoveToTableau(bottomCard, c)) {
            // Remove from source
            this.tableau[colIdx] = col.slice(0, cardIdx);
            // Add to destination
            this.tableau[c].push(...movingCards);
            this.score += 5;
            this.moves++;
            this._flipTopCard(colIdx);
            return { type: 'tableau', dest: c };
          }
        }
      }

      return null;
    }

    return null;
  }

  /**
   * Try to send a tableau card to foundation (double-tap).
   * Only works for the top card.
   * @param {number} colIdx
   * @returns {number} foundation index or -1
   */
  tryTableauToFoundation(colIdx) {
    const col = this.tableau[colIdx];
    if (!col || col.length === 0) return -1;
    const card = col[col.length - 1];
    if (!card.faceUp) return -1;

    for (let f = 0; f < 4; f++) {
      if (this.canMoveToFoundation(card, f)) {
        col.pop();
        this.foundations[f].push(card);
        this.score += 10;
        this.moves++;
        this._flipTopCard(colIdx);
        this._checkWin();
        return f;
      }
    }
    return -1;
  }

  /**
   * Move a stack of cards from one tableau column to another.
   * @param {number} fromCol
   * @param {number} cardIdx - index of the bottom card in the stack
   * @param {number} toCol
   * @returns {boolean}
   */
  moveTableauStack(fromCol, cardIdx, toCol) {
    const from = this.tableau[fromCol];
    if (!from || cardIdx < 0 || cardIdx >= from.length) return false;
    if (!from[cardIdx].faceUp) return false;
    if (fromCol === toCol) return false;

    const movingCards = from.slice(cardIdx);
    const bottomCard = movingCards[0];

    if (!this.canMoveToTableau(bottomCard, toCol)) return false;

    this.tableau[fromCol] = from.slice(0, cardIdx);
    this.tableau[toCol].push(...movingCards);
    this.score += 5;
    this.moves++;
    this._flipTopCard(fromCol);
    return true;
  }

  /**
   * Move waste card to a specific tableau column.
   * @param {number} toCol
   * @returns {boolean}
   */
  moveWasteToTableau(toCol) {
    if (this.waste.length === 0) return false;
    const card = this.waste[this.waste.length - 1];
    if (!this.canMoveToTableau(card, toCol)) return false;

    this.waste.pop();
    this.tableau[toCol].push(card);
    this.score += 5;
    this.moves++;
    return true;
  }

  /**
   * Move waste card to a specific foundation.
   * @param {number} foundIdx
   * @returns {boolean}
   */
  moveWasteToFoundation(foundIdx) {
    if (this.waste.length === 0) return false;
    const card = this.waste[this.waste.length - 1];
    if (!this.canMoveToFoundation(card, foundIdx)) return false;

    this.waste.pop();
    this.foundations[foundIdx].push(card);
    this.score += 10;
    this.moves++;
    this._checkWin();
    return true;
  }

  /**
   * Flip the top card of a tableau column if it's face-down.
   * @param {number} colIdx
   */
  _flipTopCard(colIdx) {
    const col = this.tableau[colIdx];
    if (col.length > 0 && !col[col.length - 1].faceUp) {
      col[col.length - 1].faceUp = true;
    }
  }

  /**
   * Check win condition.
   */
  _checkWin() {
    let total = 0;
    for (const f of this.foundations) {
      total += f.length;
    }
    if (total === 52) {
      this.won = true;
    }
  }

  /**
   * Get elapsed time in seconds.
   * @returns {number}
   */
  getElapsedSeconds() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get final score with time bonus.
   * @returns {number}
   */
  getFinalScore() {
    if (!this.won) return this.score;
    const elapsed = this.getElapsedSeconds();
    // Time bonus: max 700 points, decreasing over 10 minutes
    const timeBonus = Math.max(0, Math.floor(700 - (elapsed / 600) * 700));
    return this.score + timeBonus;
  }
}
