/**
 * Brainrot Games -- Sound Manager
 * Web Audio API wrapper. Generates all sounds procedurally with oscillators.
 * No audio files loaded.
 */

/** @type {AudioContext|null} */
let audioCtx = null;

/** @type {GainNode|null} */
let masterGain = null;

/** @type {Map<string, Object>} */
const sounds = new Map();

/** @type {number} */
let volume = 1.0;

/** @type {boolean} */
let muted = false;

/**
 * Load persisted volume and mute state from localStorage.
 */
function loadPersistedState() {
  try {
    const storedVolume = localStorage.getItem('brainrot-master-volume');
    if (storedVolume !== null) {
      const parsed = parseFloat(storedVolume);
      if (Number.isFinite(parsed)) {
        volume = Math.max(0, Math.min(1, parsed));
      }
    }
    const storedMuted = localStorage.getItem('brainrot-master-muted');
    if (storedMuted !== null) {
      muted = storedMuted === 'true';
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Apply the current volume/mute state to the master gain node.
 */
function applyVolume() {
  if (masterGain) {
    masterGain.gain.setValueAtTime(muted ? 0 : volume, audioCtx.currentTime);
  }
}

/**
 * Register the built-in sound presets.
 */
function registerPresets() {
  registerSound('flap', {
    notes: [
      { type: 'square', frequency: 580, endFrequency: 620, duration: 0.06, gain: 0.12 },
    ],
  });

  registerSound('score', {
    notes: [
      { type: 'sine', frequency: 880, duration: 0.08, gain: 0.15 },
      { type: 'sine', frequency: 1100, duration: 0.08, delay: 0.08, gain: 0.15 },
    ],
  });

  registerSound('death', {
    notes: [
      { type: 'sawtooth', frequency: 200, endFrequency: 50, duration: 0.3, gain: 0.2 },
      { type: 'sine', frequency: 100, duration: 0.1, gain: 0.15, noise: true },
    ],
  });

  registerSound('hit', {
    notes: [
      { type: 'square', frequency: 440, duration: 0.08, gain: 0.3 },
    ],
  });

  registerSound('combo', {
    notes: [
      { type: 'triangle', frequency: 440, duration: 0.15, gain: 0.25 },
      { type: 'triangle', frequency: 660, duration: 0.15, gain: 0.25 },
    ],
  });

  registerSound('penalty', {
    notes: [
      { type: 'sawtooth', frequency: 150, endFrequency: 100, duration: 0.2, gain: 0.4 },
    ],
  });

  registerSound('bonus', {
    notes: [
      { type: 'triangle', frequency: 523, duration: 0.06, gain: 0.3 },
      { type: 'triangle', frequency: 659, duration: 0.06, delay: 0.06, gain: 0.3 },
      { type: 'triangle', frequency: 784, duration: 0.06, delay: 0.12, gain: 0.3 },
    ],
  });

  registerSound('gameover', {
    notes: [
      { type: 'square', frequency: 523, duration: 0.2, gain: 0.3 },
      { type: 'square', frequency: 440, duration: 0.2, delay: 0.2, gain: 0.3 },
      { type: 'square', frequency: 349, duration: 0.2, delay: 0.4, gain: 0.3 },
      { type: 'square', frequency: 261, duration: 0.2, delay: 0.6, gain: 0.3 },
    ],
  });

  registerSound('highscore', {
    notes: [
      { type: 'sine', frequency: 523, duration: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 659, duration: 0.1, delay: 0.1, gain: 0.15 },
      { type: 'sine', frequency: 784, duration: 0.1, delay: 0.2, gain: 0.15 },
      { type: 'sine', frequency: 1047, duration: 0.1, delay: 0.3, gain: 0.15 },
    ],
  });

  registerSound('uiclick', {
    notes: [
      { type: 'sine', frequency: 660, duration: 0.04, gain: 0.1 },
    ],
  });
}

/**
 * Initialize the audio system. MUST be called from a user gesture handler
 * to comply with browser autoplay policies.
 *
 * Safe to call multiple times -- subsequent calls are no-ops.
 *
 * @returns {void}
 */
export function initAudio() {
  if (audioCtx) {
    // Already initialized -- just make sure context is running
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }

  loadPersistedState();

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  applyVolume();

  // Resume on iOS Safari
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  registerPresets();
}

/**
 * Create a white noise buffer source.
 *
 * @param {number} duration - Duration in seconds
 * @returns {AudioBufferSourceNode}
 */
function createNoiseSource(duration) {
  const bufferSize = Math.ceil(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  return source;
}

/**
 * Play a registered sound by name.
 *
 * @param {string} name - Registered sound name (e.g., 'flap', 'score', 'death')
 * @returns {void}
 */
export function playSound(name) {
  if (!audioCtx || !masterGain) return;

  const config = sounds.get(name);
  if (!config) {
    console.warn(`[sound-manager] Sound not registered: "${name}"`);
    return;
  }

  const now = audioCtx.currentTime;

  for (const note of config.notes) {
    const delay = note.delay || 0;
    const startTime = now + delay;
    const noteGain = note.gain !== undefined ? note.gain : 0.15;
    const duration = note.duration;

    // Per-note gain node
    const gainNode = audioCtx.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.setValueAtTime(noteGain, startTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    let source;

    if (note.noise) {
      source = createNoiseSource(duration);
      source.connect(gainNode);
      source.start(startTime);
      source.stop(startTime + duration);
    } else {
      source = audioCtx.createOscillator();
      source.type = note.type || 'sine';
      source.frequency.setValueAtTime(note.frequency, startTime);

      if (note.detune) {
        source.detune.setValueAtTime(note.detune, startTime);
      }

      if (note.endFrequency !== undefined) {
        source.frequency.linearRampToValueAtTime(note.endFrequency, startTime + duration);
      }

      source.connect(gainNode);
      source.start(startTime);
      source.stop(startTime + duration);
    }
  }
}

/**
 * Register a sound with a synthesis configuration.
 *
 * @param {string} name - Unique sound name
 * @param {Object} config - Oscillator synthesis configuration
 * @param {Array<Object>} config.notes - Array of sequential notes to play
 * @returns {void}
 */
export function registerSound(name, config) {
  sounds.set(name, config);
}

/**
 * Set the master volume. Persists to localStorage.
 *
 * @param {number} v - 0.0 (silent) to 1.0 (full). Clamped to [0, 1].
 * @returns {void}
 */
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  applyVolume();
  try {
    localStorage.setItem('brainrot-master-volume', String(volume));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get the current master volume.
 *
 * @returns {number} Volume between 0.0 and 1.0
 */
export function getVolume() {
  return volume;
}

/**
 * Toggle mute on/off. Persists mute state to localStorage.
 *
 * @returns {boolean} New muted state (true = muted)
 */
export function toggleMute() {
  muted = !muted;
  applyVolume();
  try {
    localStorage.setItem('brainrot-master-muted', String(muted));
  } catch {
    // Ignore localStorage errors
  }
  return muted;
}

/**
 * Check if audio is currently muted.
 *
 * @returns {boolean}
 */
export function isMuted() {
  return muted;
}

/**
 * Resume the AudioContext. Call this on user gesture if audio was initialized
 * before a gesture. Needed for iOS Safari.
 *
 * @returns {Promise<void>}
 */
export async function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}
