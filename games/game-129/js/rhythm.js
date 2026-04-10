/**
 * MEME RHYTHM -- Rhythm Engine
 * Procedural beat generation, note management, timing/scoring logic.
 */

import { readThemeColor } from '../../shared/theme-utils.js';

// ---- Constants ----

export const SONG_DURATION_MS = 60000;
export const NUM_LANES = 3;
export const LANE_COLORS = [
  readThemeColor('--game-lane-1', '#cccccc'),
  readThemeColor('--game-lane-2', '#999999'),
  readThemeColor('--game-lane-3', '#666666'),
];
export const LANE_NAMES = ['left', 'center', 'right'];

// BPM ramp: starts at 90, increases over time
const START_BPM = 90;
const END_BPM = 160;

// Timing windows (ms distance from perfect hit)
export const PERFECT_WINDOW = 30;
export const GREAT_WINDOW = 60;
export const GOOD_WINDOW = 100;
export const MISS_WINDOW = 140; // beyond this, note is auto-missed

// Points per grade
export const GRADE_POINTS = {
  perfect: 300,
  great: 200,
  good: 100,
  miss: 0,
};

// Combo multiplier thresholds
const COMBO_THRESHOLDS = [
  { combo: 50, multiplier: 4 },
  { combo: 25, multiplier: 3 },
  { combo: 10, multiplier: 2 },
  { combo: 0, multiplier: 1 },
];

// Note travel: spawn at y=0, hit zone at HIT_ZONE_Y, takes TRAVEL_TIME_MS to get there
export const HIT_ZONE_Y = 600;
export const TRAVEL_TIME_MS = 1200;

// Health
const MAX_HEALTH = 100;
const MISS_HEALTH_DRAIN = 12;
const GOOD_HEALTH_DRAIN = 0;
const GREAT_HEALTH_HEAL = 1;
const PERFECT_HEALTH_HEAL = 3;

/**
 * @typedef {'perfect'|'great'|'good'|'miss'} Grade
 */

/**
 * @typedef {Object} Note
 * @property {number} lane - 0, 1, or 2
 * @property {number} targetTime - Time (ms) when this note should be hit
 * @property {boolean} active - Still on screen and hittable
 * @property {boolean} hit - Was it hit by the player
 * @property {Grade|null} grade - Result of hit attempt
 * @property {number} y - Current y position for rendering
 */

/**
 * @typedef {Object} FeedbackPopup
 * @property {string} text
 * @property {string} color
 * @property {number} x
 * @property {number} y
 * @property {number} timer - Remaining ms
 */

// ---- Rhythm State ----

export class RhythmState {
  constructor() {
    this.reset();
  }

  reset() {
    /** @type {Note[]} */
    this.notes = [];
    /** @type {FeedbackPopup[]} */
    this.feedbacks = [];

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.health = MAX_HEALTH;
    this.elapsed = 0; // ms since song start
    this.songFinished = false;
    this.failed = false;

    // Grade counters
    this.perfects = 0;
    this.greats = 0;
    this.goods = 0;
    this.misses = 0;

    // Generate beat map
    this._generateBeatMap();
  }

  /**
   * Procedurally generate the full beat map for the song.
   * Notes are placed at BPM-derived intervals with random lane selection.
   * BPM ramps linearly from START_BPM to END_BPM over the song duration.
   */
  _generateBeatMap() {
    this.notes = [];
    let time = 500; // start after a brief intro

    while (time < SONG_DURATION_MS - 500) {
      // BPM at this point in the song
      const progress = time / SONG_DURATION_MS;
      const bpm = START_BPM + (END_BPM - START_BPM) * progress;
      const beatInterval = 60000 / bpm;

      // Pick a random lane
      const lane = Math.floor(Math.random() * NUM_LANES);

      // Occasionally spawn double notes (two lanes at once) at higher BPMs
      const lanes = [lane];
      if (bpm > 120 && Math.random() < 0.15) {
        let secondLane;
        do {
          secondLane = Math.floor(Math.random() * NUM_LANES);
        } while (secondLane === lane);
        lanes.push(secondLane);
      }

      for (const l of lanes) {
        this.notes.push({
          lane: l,
          targetTime: time,
          active: true,
          hit: false,
          grade: null,
          y: 0,
        });
      }

      time += beatInterval;
    }
  }

  /**
   * Get the current combo multiplier.
   * @returns {number}
   */
  getMultiplier() {
    for (const t of COMBO_THRESHOLDS) {
      if (this.combo >= t.combo) return t.multiplier;
    }
    return 1;
  }

  /**
   * Update note positions and auto-miss notes that pass the window.
   * @param {number} dtMs - Delta time in milliseconds
   */
  update(dtMs) {
    this.elapsed += dtMs;

    // Update note y positions
    for (const note of this.notes) {
      if (!note.active) continue;

      // How far ahead of hit time is this note? Negative = past the hit zone
      const timeUntilHit = note.targetTime - this.elapsed;
      // Map time to y position: at TRAVEL_TIME_MS ahead, y=0; at hit time, y=HIT_ZONE_Y
      note.y = HIT_ZONE_Y - (timeUntilHit / TRAVEL_TIME_MS) * HIT_ZONE_Y;

      // Auto-miss: note passed too far below the hit zone
      if (this.elapsed - note.targetTime > MISS_WINDOW) {
        note.active = false;
        note.grade = 'miss';
        this._applyGrade('miss', note);
      }
    }

    // Update feedback popups
    for (const fb of this.feedbacks) {
      fb.timer -= dtMs;
      fb.y -= dtMs * 0.05; // float upward
    }
    this.feedbacks = this.feedbacks.filter(fb => fb.timer > 0);

    // Check if song finished (all notes resolved and past duration)
    if (this.elapsed >= SONG_DURATION_MS && this.notes.every(n => !n.active)) {
      this.songFinished = true;
    }
  }

  /**
   * Player taps a lane. Find the closest active note in that lane and grade it.
   * @param {number} lane - 0, 1, or 2
   * @returns {Grade|null} The grade, or null if no note to hit
   */
  tapLane(lane) {
    // Find the closest active note in this lane within the miss window
    let bestNote = null;
    let bestDist = Infinity;

    for (const note of this.notes) {
      if (!note.active || note.lane !== lane) continue;
      const dist = Math.abs(this.elapsed - note.targetTime);
      if (dist < MISS_WINDOW && dist < bestDist) {
        bestNote = note;
        bestDist = dist;
      }
    }

    if (!bestNote) return null;

    // Grade it
    let grade;
    if (bestDist <= PERFECT_WINDOW) {
      grade = 'perfect';
    } else if (bestDist <= GREAT_WINDOW) {
      grade = 'great';
    } else if (bestDist <= GOOD_WINDOW) {
      grade = 'good';
    } else {
      grade = 'miss';
    }

    bestNote.active = false;
    bestNote.hit = true;
    bestNote.grade = grade;
    this._applyGrade(grade, bestNote);

    return grade;
  }

  /**
   * Apply scoring, combo, health for a grade.
   * @param {Grade} grade
   * @param {Note} note
   */
  _applyGrade(grade, note) {
    // Combo
    if (grade === 'miss') {
      this.combo = 0;
      this.misses++;
      this.health = Math.max(0, this.health - MISS_HEALTH_DRAIN);
      if (this.health <= 0) {
        this.failed = true;
      }
    } else {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      const points = GRADE_POINTS[grade] * this.getMultiplier();
      this.score += points;

      if (grade === 'perfect') {
        this.perfects++;
        this.health = Math.min(MAX_HEALTH, this.health + PERFECT_HEALTH_HEAL);
      } else if (grade === 'great') {
        this.greats++;
        this.health = Math.min(MAX_HEALTH, this.health + GREAT_HEALTH_HEAL);
      } else {
        this.goods++;
      }
    }

    // Feedback popup
    const laneX = this._laneX(note.lane);
    const colors = {
      perfect: readThemeColor('--game-feedback-perfect', '#dddddd'),
      great: readThemeColor('--game-feedback-great', '#bbbbbb'),
      good: readThemeColor('--game-feedback-good', '#999999'),
      miss: readThemeColor('--game-feedback-miss', '#666666'),
    };
    const texts = {
      perfect: 'PERFECT!',
      great: 'GREAT!',
      good: 'GOOD',
      miss: 'MISS',
    };

    this.feedbacks.push({
      text: texts[grade],
      color: colors[grade],
      x: laneX,
      y: HIT_ZONE_Y - 40,
      timer: 600,
    });

    // Combo milestone feedback
    if (this.combo > 0 && this.combo % 10 === 0) {
      this.feedbacks.push({
        text: `${this.combo} COMBO!`,
        color: readThemeColor('--game-feedback-combo', '#888888'),
        x: 200, // center
        y: 300,
        timer: 800,
      });
    }
  }

  /**
   * Get the x center for a lane.
   * @param {number} lane
   * @returns {number}
   */
  _laneX(lane) {
    // 3 lanes spread across 400px width
    // lane 0 = 80, lane 1 = 200, lane 2 = 320
    return 80 + lane * 120;
  }
}
