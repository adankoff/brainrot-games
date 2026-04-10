/**
 * FLAPPY DOGE -- Constants
 * All tuning values, colors, text content. Theme data for doge/nyan/troll.
 */

// ---- Dimensions ----
export const LOGICAL_WIDTH = 360;
export const LOGICAL_HEIGHT = 640;
export const FLOOR_HEIGHT = 60;

// ---- Physics ----
export const GRAVITY = 0.4;
export const TAP_IMPULSE = -7.0;
export const TERMINAL_VELOCITY = 10.0;

// ---- Player ----
export const PLAYER_X = 80;
export const PLAYER_VISUAL_SIZE = 40;
export const PLAYER_HITBOX_WIDTH = 30;
export const PLAYER_HITBOX_HEIGHT = 30;
export const FLAP_DURATION = 300;
export const FLAP_FRAME_INTERVAL = 100;
export const DEATH_SPIN_VELOCITY = 0.15;

// ---- Difficulty ----
export const BASE_SCROLL_SPEED = 2.5;
export const MAX_SCROLL_SPEED = 4.0;
export const SPEED_PER_SCORE = 0.03;

export const BASE_GAP_SIZE = 200;
export const MIN_GAP_SIZE = 130;
export const GAP_SHRINK_PER_SCORE = 1.4;

export const BASE_SPACING = 250;
export const MIN_SPACING = 180;
export const SPACING_SHRINK_PER_SCORE = 1.5;

// ---- Obstacles ----
export const OBSTACLE_WIDTH = 60;
export const GAP_BUFFER = 60;

// ---- Scoring ----
export const SCORE_POP_DURATION = 150;
export const SCORE_FLASH_DURATION = 200;

// ---- Screen shake ----
export const SHAKE_MAGNITUDE = 4;
export const SHAKE_DURATION = 200;

// ---- Death delay before game-over ----
export const DEATH_DELAY = 600;

// ---- Themes ----
export const THEMES = {
  doge: {
    name: 'DOGE',
    accent: '#c4a265',
    obstacle: 'bone',
    hasFloor: true,
    skyColor: '#87CEEB',
    floorColor: '#4a8c3f',
    floorLineColor: '#3a7c2f',
    scoreColor: '#f0f0f0',
    scoreFlashColor: '#c4a265',
    deathMessages: {
      0: [
        'such crash. very dead. wow.',
        'much fail. no fly. wow.',
        'the doge has grounded',
        'wow. 0 points. much shame.',
      ],
      1: [
        'such crash. very dead. wow.',
        'much flap. no survive.',
        'the doge has landed',
        'wow. that was bad.',
      ],
      6: [
        'to the ground, not the moon',
        'such average. very mid. wow.',
        'much effort. some result.',
        'wow. almost not terrible.',
      ],
      15: [
        'such skill. very almost. wow.',
        'much flap. decent survive.',
        'the doge is learning',
        'wow. actually okay.',
      ],
      25: [
        'such talent. very impress. wow.',
        'much moon. almost reach.',
        'the doge believes in you',
        'wow. actual skill detected.',
      ],
      50: [
        'such legend. very pro. wow.',
        'much flap. all survive.',
        'to the moon! almost!',
        'wow. the doge is proud.',
      ],
      100: [
        'such god. very ascend. wow.',
        'much flap. need grass. wow.',
        'the doge has transcended',
        'wow. touch grass immediately.',
        'to the moon and beyond. wow.',
      ],
    },
  },
  nyan: {
    name: 'NYAN CAT',
    accent: '#ff69b4',
    obstacle: 'spacerock',
    hasFloor: false,
    skyColor: '#0a0a2e',
    floorColor: null,
    floorLineColor: null,
    scoreColor: '#f0f0f0',
    scoreFlashColor: '#ff69b4',
    deathMessages: {
      0: [
        'nyan nyan nyan... splat',
        'the rainbow ended before it started',
        'pop-tart grounded',
        'no nyan at all',
      ],
      1: [
        'nyan nyan nyan... splat',
        'the rainbow ended',
        'pop-tart grounded',
        'nyan cat ran out of nyan',
      ],
      6: [
        'rainbow faded too soon',
        'the stars rejected you',
        'nyan cat needs more practice',
        'pop-tart crumbled',
      ],
      15: [
        'decent nyan detected',
        'the rainbow grew a little',
        'nyan cat is mildly impressed',
        'almost cosmic',
      ],
      25: [
        'nyan cat approves',
        'the rainbow stretches far',
        'cosmic pop-tart energy',
        'nyan nyan nyan!',
      ],
      50: [
        'NYAN NYAN NYAN NYAN!',
        'the rainbow is eternal',
        'pop-tart achieved orbit',
        'cosmic nyan achieved',
      ],
      100: [
        'nyan cat has reached the singularity',
        'infinite rainbow unlocked',
        'you are one with the nyan',
        'the pop-tart transcends space-time',
      ],
    },
  },
  troll: {
    name: 'TROLLFACE',
    accent: '#333333',
    obstacle: 'rageface',
    hasFloor: true,
    skyColor: '#f0f0f0',
    floorColor: '#333333',
    floorLineColor: '#555555',
    scoreColor: '#222222',
    scoreFlashColor: '#ff0000',
    deathMessages: {
      0: [
        'u mad bro? u dead bro.',
        'trolled by gravity. 0 points.',
        'problem? yes. everything.',
        'the troll got trolled',
      ],
      1: [
        'u mad bro? u dead bro.',
        'trolled by gravity',
        'problem? yes. gravity.',
        'the troll got trolled',
      ],
      6: [
        'le medium face',
        'not bad. not good. trolled.',
        'rage comic energy: mid',
        'the troll approves slightly',
      ],
      15: [
        'trollface.jpg loading...',
        'u less mad now bro',
        'the rage subsides briefly',
        'problem? maybe not.',
      ],
      25: [
        'coolface activated',
        'maximum troll detected',
        'the rage faces fear you',
        'u actually good bro',
      ],
      50: [
        'epic troll is epic',
        'the rage comics bow to you',
        'trollface final form',
        'problem? never.',
      ],
      100: [
        'u mad? no. u legend.',
        'the original meme salutes you',
        'trollface.exe has stopped working',
        'you trolled the entire game',
      ],
    },
  },
};

export const DEFAULT_THEME = 'doge';

// ---- Colors (defaults for doge theme -- overridden per theme at runtime) ----
export const COLOR_SCORE = '#f0f0f0';
export const COLOR_SCORE_FLASH = '#c4a265';
export const COLOR_SCORE_69 = '#ff2d78';

// ---- Pass Effect Durations (ms) ----
export const PASS_EFFECT_DURATIONS = {
  bone: 300,
  spacerock: 200,
  rageface: 400,
};
