/**
 * MEME BLACKJACK -- Game Engine
 * Pure game logic: deck, dealing, hitting, standing, scoring.
 */

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BET_OPTIONS = [50, 100, 200, 500];
const STARTING_CHIPS = 1000;
const RESHUFFLE_THRESHOLD = 15;

/**
 * Get the numerical value of a hand, with aces optimized.
 *
 * @param {Array<{rank: string, suit: string, faceUp: boolean}>} cards
 * @returns {number}
 */
export function getHandValue(cards) {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank, 10);
    }
  }

  // Demote aces from 11 to 1 as needed
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Create a fresh shuffled deck.
 *
 * @returns {Array<{rank: string, suit: string}>}
 */
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Draw a card from the deck, reshuffling if needed.
 *
 * @param {Object} state
 * @param {boolean} faceUp
 * @returns {{rank: string, suit: string, faceUp: boolean}}
 */
function drawCard(state, faceUp = true) {
  if (state.deck.length < RESHUFFLE_THRESHOLD) {
    state.deck = createDeck();
  }
  const card = state.deck.pop();
  return { ...card, faceUp };
}

/**
 * Create initial game state.
 *
 * @returns {Object}
 */
export function createBlackjackState() {
  return {
    deck: createDeck(),
    playerHand: [],
    dealerHand: [],
    chips: STARTING_CHIPS,
    peakChips: STARTING_CHIPS,
    currentBet: 0,
    phase: 'betting', // 'betting' | 'playing' | 'dealerTurn' | 'result' | 'gameOver'
    resultMessage: '',
    resultType: '', // 'win' | 'lose' | 'push' | 'blackjack'
    betOptions: BET_OPTIONS,
    canDoubleDown: false,
    sounds: [], // sounds to play this frame
    dealerRevealTimer: 0, // timer for dealer card reveals
    dealerDone: false,
    gameOver: false,
  };
}

/**
 * Place a bet and deal initial cards.
 *
 * @param {Object} state
 * @param {number} betAmount
 * @returns {Object} state
 */
export function deal(state, betAmount) {
  if (state.phase !== 'betting') return state;
  if (betAmount > state.chips) return state;

  state.sounds = [];
  state.currentBet = betAmount;
  state.chips -= betAmount;
  state.playerHand = [];
  state.dealerHand = [];
  state.resultMessage = '';
  state.resultType = '';
  state.dealerDone = false;

  // Deal 2 to player (face up), 2 to dealer (1 up, 1 down)
  state.playerHand.push(drawCard(state, true));
  state.dealerHand.push(drawCard(state, true));
  state.playerHand.push(drawCard(state, true));
  state.dealerHand.push(drawCard(state, false));

  state.sounds.push('deal');

  // Check for natural blackjack
  const playerValue = getHandValue(state.playerHand);
  const dealerUpValue = getHandValue([state.dealerHand[0]]);

  if (playerValue === 21) {
    // Reveal dealer hole card
    state.dealerHand[1].faceUp = true;
    const dealerValue = getHandValue(state.dealerHand);

    if (dealerValue === 21) {
      // Both have blackjack - push
      state.chips += state.currentBet;
      state.resultMessage = 'PUSH - both got 21 fr';
      state.resultType = 'push';
      state.sounds.push('push');
    } else {
      // Player natural blackjack - 1.5x payout
      const payout = state.currentBet + Math.floor(state.currentBet * 1.5);
      state.chips += payout;
      state.resultMessage = 'BLACKJACK no cap';
      state.resultType = 'blackjack';
      state.sounds.push('blackjack');
    }

    if (state.chips > state.peakChips) {
      state.peakChips = state.chips;
    }
    state.phase = 'result';
    return state;
  }

  state.canDoubleDown = state.chips >= state.currentBet;
  state.phase = 'playing';
  return state;
}

/**
 * Player hits (draws a card).
 *
 * @param {Object} state
 * @returns {Object} state
 */
export function hit(state) {
  if (state.phase !== 'playing') return state;

  state.sounds = [];
  state.playerHand.push(drawCard(state, true));
  state.canDoubleDown = false;
  state.sounds.push('hit');

  const value = getHandValue(state.playerHand);

  if (value > 21) {
    // Bust
    state.dealerHand[1].faceUp = true;
    state.resultMessage = 'BUST - skill issue';
    state.resultType = 'lose';
    state.sounds.push('bust');
    state.phase = 'result';

    if (state.chips <= 0) {
      state.gameOver = true;
    }
  } else if (value === 21) {
    // Auto-stand on 21
    return stand(state);
  }

  return state;
}

/**
 * Player stands. Dealer plays out.
 *
 * @param {Object} state
 * @returns {Object} state
 */
export function stand(state) {
  if (state.phase !== 'playing') return state;

  state.sounds = [];

  // Reveal dealer hole card
  state.dealerHand[1].faceUp = true;
  state.sounds.push('deal');

  // Dealer hits on 16 or less, stands on 17+
  while (getHandValue(state.dealerHand) < 17) {
    state.dealerHand.push(drawCard(state, true));
    state.sounds.push('hit');
  }

  const playerValue = getHandValue(state.playerHand);
  const dealerValue = getHandValue(state.dealerHand);

  if (dealerValue > 21) {
    // Dealer bust
    state.chips += state.currentBet * 2;
    state.resultMessage = 'DEALER BUSTS - W';
    state.resultType = 'win';
    state.sounds.push('win');
  } else if (playerValue > dealerValue) {
    state.chips += state.currentBet * 2;
    state.resultMessage = 'YOU WIN - goated';
    state.resultType = 'win';
    state.sounds.push('win');
  } else if (dealerValue > playerValue) {
    state.resultMessage = 'DEALER WINS - L';
    state.resultType = 'lose';
    state.sounds.push('bust');
  } else {
    // Push
    state.chips += state.currentBet;
    state.resultMessage = 'PUSH - mid outcome';
    state.resultType = 'push';
    state.sounds.push('push');
  }

  if (state.chips > state.peakChips) {
    state.peakChips = state.chips;
  }

  state.dealerDone = true;
  state.phase = 'result';

  if (state.chips <= 0) {
    state.gameOver = true;
  }

  return state;
}

/**
 * Player doubles down: double bet, draw exactly 1 card, then stand.
 *
 * @param {Object} state
 * @returns {Object} state
 */
export function doubleDown(state) {
  if (state.phase !== 'playing') return state;
  if (!state.canDoubleDown) return state;
  if (state.chips < state.currentBet) return state;

  state.sounds = [];
  state.chips -= state.currentBet;
  state.currentBet *= 2;
  state.canDoubleDown = false;

  // Draw exactly one card
  state.playerHand.push(drawCard(state, true));
  state.sounds.push('hit');

  const value = getHandValue(state.playerHand);

  if (value > 21) {
    // Bust
    state.dealerHand[1].faceUp = true;
    state.resultMessage = 'DOUBLE BUST - rip bozo';
    state.resultType = 'lose';
    state.sounds.push('bust');
    state.phase = 'result';

    if (state.chips <= 0) {
      state.gameOver = true;
    }

    return state;
  }

  // Auto-stand after double down
  return stand(state);
}

/**
 * Move from result phase back to betting for next hand.
 *
 * @param {Object} state
 * @returns {Object} state
 */
export function nextHand(state) {
  if (state.phase !== 'result') return state;

  state.sounds = [];
  state.playerHand = [];
  state.dealerHand = [];
  state.currentBet = 0;
  state.resultMessage = '';
  state.resultType = '';
  state.canDoubleDown = false;
  state.dealerDone = false;
  state.phase = 'betting';

  return state;
}
