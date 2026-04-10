/**
 * HIGHER LOWER -- Game Engine
 * Pure game logic: deck, guessing, streaks, scoring.
 */

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Numeric value of a rank: A=1, 2-10, J=11, Q=12, K=13.
 *
 * @param {string} rank
 * @returns {number}
 */
export function rankValue(rank) {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank, 10);
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
 * Draw a card from the deck, reshuffling if empty.
 *
 * @param {Object} state
 * @returns {{rank: string, suit: string}}
 */
function drawCard(state) {
  if (state.deck.length === 0) {
    state.deck = createDeck();
  }
  return state.deck.pop();
}

/**
 * Create the initial game state.
 *
 * @returns {Object}
 */
export function createState() {
  const deck = createDeck();
  const currentCard = deck.pop();

  return {
    deck,
    currentCard,
    nextCard: null,
    score: 0,
    streak: 0,
    phase: 'guessing',  // 'guessing' | 'revealing' | 'gameover'
    lastResult: null,    // 'correct' | 'wrong' | null
    sounds: [],
  };
}

/**
 * Get the current card.
 *
 * @param {Object} state
 * @returns {{rank: string, suit: string}}
 */
export function getCurrentCard(state) {
  return state.currentCard;
}

/**
 * Make a guess: 'higher' or 'lower'.
 * Equal value = player wins (generous rule).
 *
 * @param {Object} state
 * @param {'higher'|'lower'} direction
 * @returns {{correct: boolean, card: {rank: string, suit: string}, streak: number}}
 */
export function guess(state, direction) {
  if (state.phase !== 'guessing') {
    return { correct: false, card: state.currentCard, streak: state.streak };
  }

  state.sounds = [];

  const nextCard = drawCard(state);
  state.nextCard = nextCard;

  const currentVal = rankValue(state.currentCard.rank);
  const nextVal = rankValue(nextCard.rank);

  let correct = false;
  if (nextVal === currentVal) {
    // Equal = player wins (generous)
    correct = true;
  } else if (direction === 'higher') {
    correct = nextVal > currentVal;
  } else {
    correct = nextVal < currentVal;
  }

  if (correct) {
    state.streak++;
    state.score += state.streak;
    state.lastResult = 'correct';
    state.sounds.push('correct');

    // Milestone streaks
    if (state.streak > 0 && state.streak % 5 === 0) {
      state.sounds.push('streak');
    }
  } else {
    state.lastResult = 'wrong';
    state.sounds.push('wrong');
  }

  state.sounds.push('flip');
  state.phase = 'revealing';

  return { correct, card: nextCard, streak: state.streak };
}

/**
 * Advance after reveal: if correct, next card becomes current.
 * If wrong, transition to gameover.
 *
 * @param {Object} state
 */
export function advanceAfterReveal(state) {
  if (state.phase !== 'revealing') return;

  if (state.lastResult === 'correct') {
    state.currentCard = state.nextCard;
    state.nextCard = null;
    state.phase = 'guessing';
  } else {
    state.phase = 'gameover';
  }
}
