/**
 * MEME DEFENSE -- Game Logic
 * Manages game state: cities, enemy missiles, counter-missiles, explosions, waves.
 */

import { randomBetween, randomInt } from '../../shared/utils.js';

const W = 400;
const H = 700;

// City positions (4 cities spread across the bottom)
const CITY_POSITIONS = [
  { x: 60, y: H - 40 },
  { x: 150, y: H - 40 },
  { x: 250, y: H - 40 },
  { x: 340, y: H - 40 },
];

const CITY_WIDTH = 40;
const CITY_HEIGHT = 24;

// Battery position (bottom center)
const BATTERY = { x: W / 2, y: H - 20 };

// Counter-missile speed (px per frame at 60fps)
const COUNTER_SPEED = 8;

// Explosion settings
const EXPLOSION_GROW_RATE = 1.2;   // radius growth per frame
const EXPLOSION_MAX_RADIUS = 40;
const EXPLOSION_SHRINK_RATE = 0.8;

// Enemy missile base speed
const ENEMY_BASE_SPEED = 1.0;
const ENEMY_SPEED_INCREMENT = 0.15;

export class DefenseGame {
  constructor() {
    this.reset();
  }

  reset() {
    // Cities: array of booleans (true = alive)
    this.cities = [true, true, true, true];

    // Game objects
    this.enemyMissiles = [];
    this.counterMissiles = [];
    this.explosions = [];
    this.particles = [];

    // Wave state
    this.wave = 0;
    this.waveTimer = 0;
    this.waveMissilesRemaining = 0;
    this.waveSpawnTimer = 0;
    this.waveActive = false;
    this.waveClearBonus = false;
    this.waveBannerTimer = 0;

    // Ammo
    this.ammo = 0;
    this.maxAmmo = 0;

    // Score
    this.score = 0;
    this.missilesDestroyedThisWave = 0;

    // State
    this.gameOver = false;
    this.started = false;
  }

  start() {
    this.reset();
    this.started = true;
    this.startNextWave();
  }

  startNextWave() {
    this.wave++;
    this.waveMissilesRemaining = this.wave * 3;
    this.waveSpawnTimer = 0;
    this.waveActive = true;
    this.waveClearBonus = false;
    this.missilesDestroyedThisWave = 0;

    // Ammo for this wave
    this.maxAmmo = 10 + this.wave * 2;
    this.ammo = this.maxAmmo;

    // Show wave banner
    this.waveBannerTimer = 120; // 2 seconds at 60fps

    return 'wave'; // sound cue
  }

  getEnemySpeed() {
    return ENEMY_BASE_SPEED + (this.wave - 1) * ENEMY_SPEED_INCREMENT;
  }

  getSpawnInterval() {
    // Frames between enemy missile spawns -- faster in later waves
    return Math.max(15, 60 - this.wave * 3);
  }

  /**
   * Tap at a position to launch a counter-missile.
   * @param {{ x: number, y: number }} pos - Tap position in logical coords
   * @returns {string|null} Sound cue or null
   */
  tap(pos) {
    if (this.gameOver) return null;
    if (!this.waveActive && this.waveBannerTimer > 0) return null;

    // Don't shoot below the cities
    if (pos.y > H - 80) return null;

    if (this.ammo <= 0) return null;

    this.ammo--;

    // Calculate direction from battery to tap point
    const dx = pos.x - BATTERY.x;
    const dy = pos.y - BATTERY.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return null;

    const vx = (dx / dist) * COUNTER_SPEED;
    const vy = (dy / dist) * COUNTER_SPEED;

    this.counterMissiles.push({
      x: BATTERY.x,
      y: BATTERY.y,
      vx,
      vy,
      targetX: pos.x,
      targetY: pos.y,
      trail: [],
    });

    return 'launch';
  }

  /**
   * Update game state by one frame.
   * @param {number} dt - Delta time (1.0 = one frame at 60fps)
   * @returns {string[]} Array of sound cues to play
   */
  update(dt) {
    if (this.gameOver) return [];

    const sounds = [];

    // Wave banner countdown
    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
    }

    // Spawn enemy missiles
    if (this.waveActive && this.waveMissilesRemaining > 0) {
      this.waveSpawnTimer -= dt;
      if (this.waveSpawnTimer <= 0) {
        this.spawnEnemyMissile();
        this.waveMissilesRemaining--;
        this.waveSpawnTimer = this.getSpawnInterval();
      }
    }

    // Update enemy missiles
    for (let i = this.enemyMissiles.length - 1; i >= 0; i--) {
      const m = this.enemyMissiles[i];
      const speed = this.getEnemySpeed() * dt;
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < speed * 2) {
        // Missile reached target -- destroy city
        this.enemyMissiles.splice(i, 1);
        const cityIdx = m.targetCity;
        if (this.cities[cityIdx]) {
          this.cities[cityIdx] = false;
          sounds.push('cityHit');
          this.spawnCityDestroyParticles(CITY_POSITIONS[cityIdx].x, CITY_POSITIONS[cityIdx].y);

          // Check if all cities destroyed
          if (this.cities.every(c => !c)) {
            this.gameOver = true;
            sounds.push('gameover');
          }
        }
        continue;
      }

      m.x += (dx / dist) * speed;
      m.y += (dy / dist) * speed;

      // Update trail
      m.progress = 1 - (dist / m.totalDist);
    }

    // Update counter-missiles
    for (let i = this.counterMissiles.length - 1; i >= 0; i--) {
      const m = this.counterMissiles[i];

      // Store trail
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 12) m.trail.shift();

      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Check if reached target
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < COUNTER_SPEED * dt * 2) {
        // Explode at target
        this.counterMissiles.splice(i, 1);
        this.explosions.push({
          x: m.targetX,
          y: m.targetY,
          radius: 5,
          maxRadius: EXPLOSION_MAX_RADIUS,
          growing: true,
          alpha: 1.0,
        });
        sounds.push('explode');
      }
    }

    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];

      if (e.growing) {
        e.radius += EXPLOSION_GROW_RATE * dt;
        if (e.radius >= e.maxRadius) {
          e.growing = false;
        }
      } else {
        e.radius -= EXPLOSION_SHRINK_RATE * dt;
        e.alpha = Math.max(0, e.radius / e.maxRadius);
        if (e.radius <= 0) {
          this.explosions.splice(i, 1);
          continue;
        }
      }

      // Check collision with enemy missiles
      for (let j = this.enemyMissiles.length - 1; j >= 0; j--) {
        const m = this.enemyMissiles[j];
        const dx = m.x - e.x;
        const dy = m.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < e.radius + 4) {
          // Enemy missile destroyed
          this.enemyMissiles.splice(j, 1);
          this.score += 10;
          this.missilesDestroyedThisWave++;

          // Spawn debris particles
          this.spawnDestroyParticles(m.x, m.y);
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Check if wave is complete (all missiles spawned and none in flight)
    if (this.waveActive && this.waveMissilesRemaining <= 0 && this.enemyMissiles.length === 0 && this.explosions.length === 0) {
      this.waveActive = false;

      // Wave clear bonus: surviving cities x 100
      const survivingCities = this.cities.filter(c => c).length;
      this.score += survivingCities * 100;

      // Brief pause then start next wave
      this.waveTimer = 90; // 1.5 seconds
    }

    // Inter-wave timer
    if (!this.waveActive && !this.gameOver && this.waveTimer > 0) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        sounds.push(...[this.startNextWave()].filter(Boolean));
      }
    }

    return sounds;
  }

  spawnEnemyMissile() {
    // Pick a random alive city as target
    const aliveCities = [];
    for (let i = 0; i < 4; i++) {
      if (this.cities[i]) aliveCities.push(i);
    }
    if (aliveCities.length === 0) return;

    const targetIdx = aliveCities[randomInt(0, aliveCities.length - 1)];
    const target = CITY_POSITIONS[targetIdx];

    // Random start position along top
    const startX = randomBetween(20, W - 20);
    const startY = -10;

    const dx = target.x - startX;
    const dy = target.y - startY;
    const totalDist = Math.sqrt(dx * dx + dy * dy);

    this.enemyMissiles.push({
      x: startX,
      y: startY,
      startX,
      startY,
      targetX: target.x,
      targetY: target.y,
      targetCity: targetIdx,
      totalDist,
      progress: 0,
    });
  }

  spawnDestroyParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(1, 3);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(15, 30),
        maxLife: 30,
        color: Math.random() > 0.5 ? '#ffaa00' : '#ff4444',
        size: randomBetween(2, 4),
      });
    }
  }

  spawnCityDestroyParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(1, 4);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(20, 50),
        maxLife: 50,
        color: ['#ff4444', '#ff8800', '#ffcc00'][randomInt(0, 2)],
        size: randomBetween(3, 6),
      });
    }
  }

  getCities() { return this.cities; }
  getCityPositions() { return CITY_POSITIONS; }
  getBattery() { return BATTERY; }
  getCityDimensions() { return { width: CITY_WIDTH, height: CITY_HEIGHT }; }
}
