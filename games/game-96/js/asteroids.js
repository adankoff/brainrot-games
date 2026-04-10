/**
 * MEME ASTEROIDS -- Game Engine
 * Pure game logic: ship, bullets, asteroids, collision, scoring.
 */

const W = 400;
const H = 700;

const SHIP_ROTATE_SPEED = 0.07;   // radians per frame
const SHIP_THRUST = 0.15;
const SHIP_FRICTION = 0.99;
const SHIP_RADIUS = 12;
const SHIP_INVULN_TIME = 120;     // 2 seconds at 60fps

const BULLET_SPEED = 7;
const BULLET_LIFE = 60;
const MAX_BULLETS = 5;

const ASTEROID_SIZES = {
  large:  { radius: 40, score: 20,  speed: 1.0 },
  medium: { radius: 20, score: 50,  speed: 1.8 },
  small:  { radius: 10, score: 100, speed: 2.5 },
};

const STARTING_ASTEROIDS = 4;

/**
 * Generate random vertices for an asteroid shape.
 * Returns array of radius multipliers (0.7 - 1.3).
 */
function generateAsteroidShape() {
  const numVerts = 8 + Math.floor(Math.random() * 5);
  const verts = [];
  for (let i = 0; i < numVerts; i++) {
    verts.push(0.7 + Math.random() * 0.6);
  }
  return verts;
}

/**
 * Create a new asteroid entity.
 */
function createAsteroid(x, y, size) {
  const config = ASTEROID_SIZES[size];
  const angle = Math.random() * Math.PI * 2;
  const speed = config.speed * (0.5 + Math.random() * 0.5);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: config.radius,
    size,
    score: config.score,
    shape: generateAsteroidShape(),
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
  };
}

/**
 * Spawn asteroids for a wave, avoiding the center where the ship spawns.
 */
function spawnWave(count) {
  const asteroids = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = Math.random() * W;
      y = Math.random() * H;
    } while (Math.hypot(x - W / 2, y - H / 2) < 150);
    asteroids.push(createAsteroid(x, y, 'large'));
  }
  return asteroids;
}

/**
 * Wrap an entity's position around screen edges.
 */
function wrap(entity) {
  if (entity.x < -50) entity.x += W + 100;
  if (entity.x > W + 50) entity.x -= W + 100;
  if (entity.y < -50) entity.y += H + 100;
  if (entity.y > H + 50) entity.y -= H + 100;
}

/**
 * Circle-circle collision.
 */
function collides(a, aRadius, b, bRadius) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= (aRadius + bRadius) * (aRadius + bRadius);
}

/**
 * Create the initial game state.
 */
export function createAsteroidsState() {
  const wave = 1;
  return {
    ship: {
      x: W / 2,
      y: H / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2, // pointing up
      thrusting: false,
      alive: true,
      invulnTimer: SHIP_INVULN_TIME,
      respawnTimer: 0,
    },
    bullets: [],
    asteroids: spawnWave(STARTING_ASTEROIDS),
    particles: [],
    score: 0,
    lives: 3,
    wave,
    waveTimer: 0,
    gameOver: false,
    shootCooldown: 0,
    // Events for sound triggers
    events: [],
  };
}

/**
 * Update game state by one tick.
 *
 * @param {Object} state - Game state from createAsteroidsState()
 * @param {Object} input - { left, right, thrust, shoot }
 * @param {number} dt - Delta time (1.0 = one frame at 60fps)
 * @returns {Object} Updated state (mutated in place)
 */
export function update(state, input, dt) {
  state.events = [];

  if (state.gameOver) return state;

  const ship = state.ship;

  // ---- Ship respawn ----
  if (!ship.alive) {
    ship.respawnTimer -= dt;
    if (ship.respawnTimer <= 0) {
      if (state.lives > 0) {
        ship.x = W / 2;
        ship.y = H / 2;
        ship.vx = 0;
        ship.vy = 0;
        ship.angle = -Math.PI / 2;
        ship.alive = true;
        ship.invulnTimer = SHIP_INVULN_TIME;
        ship.thrusting = false;
      } else {
        state.gameOver = true;
        return state;
      }
    }
    // Still update asteroids/bullets while dead
    updateAsteroids(state, dt);
    updateBullets(state, dt);
    updateParticles(state, dt);
    return state;
  }

  // ---- Ship rotation ----
  if (input.left) {
    ship.angle -= SHIP_ROTATE_SPEED * dt;
  }
  if (input.right) {
    ship.angle += SHIP_ROTATE_SPEED * dt;
  }

  // ---- Ship thrust ----
  ship.thrusting = input.thrust;
  if (input.thrust) {
    ship.vx += Math.cos(ship.angle) * SHIP_THRUST * dt;
    ship.vy += Math.sin(ship.angle) * SHIP_THRUST * dt;
    state.events.push('thrust');
  }

  // ---- Ship friction & movement ----
  const friction = Math.pow(SHIP_FRICTION, dt);
  ship.vx *= friction;
  ship.vy *= friction;
  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
  wrap(ship);

  // ---- Invulnerability timer ----
  if (ship.invulnTimer > 0) {
    ship.invulnTimer -= dt;
  }

  // ---- Shooting ----
  if (state.shootCooldown > 0) {
    state.shootCooldown -= dt;
  }
  if (input.shoot && state.shootCooldown <= 0 && state.bullets.length < MAX_BULLETS) {
    const bullet = {
      x: ship.x + Math.cos(ship.angle) * SHIP_RADIUS,
      y: ship.y + Math.sin(ship.angle) * SHIP_RADIUS,
      vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx * 0.3,
      vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy * 0.3,
      life: BULLET_LIFE,
    };
    state.bullets.push(bullet);
    state.shootCooldown = 8;
    state.events.push('shoot');
  }

  // ---- Update bullets ----
  updateBullets(state, dt);

  // ---- Update asteroids ----
  updateAsteroids(state, dt);

  // ---- Bullet-asteroid collisions ----
  for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
    const bullet = state.bullets[bi];
    for (let ai = state.asteroids.length - 1; ai >= 0; ai--) {
      const asteroid = state.asteroids[ai];
      if (collides(bullet, 2, asteroid, asteroid.radius * 0.8)) {
        // Remove bullet
        state.bullets.splice(bi, 1);
        // Score
        state.score += asteroid.score;
        // Spawn particles
        spawnExplosion(state, asteroid.x, asteroid.y, asteroid.radius);
        // Split asteroid
        if (asteroid.size === 'large') {
          state.asteroids.push(createAsteroid(asteroid.x, asteroid.y, 'medium'));
          state.asteroids.push(createAsteroid(asteroid.x, asteroid.y, 'medium'));
          state.events.push('explodeBig');
        } else if (asteroid.size === 'medium') {
          state.asteroids.push(createAsteroid(asteroid.x, asteroid.y, 'small'));
          state.asteroids.push(createAsteroid(asteroid.x, asteroid.y, 'small'));
          state.events.push('explodeBig');
        } else {
          state.events.push('explodeSmall');
        }
        // Remove asteroid
        state.asteroids.splice(ai, 1);
        break;
      }
    }
  }

  // ---- Ship-asteroid collisions ----
  if (ship.invulnTimer <= 0) {
    for (let ai = state.asteroids.length - 1; ai >= 0; ai--) {
      const asteroid = state.asteroids[ai];
      if (collides(ship, SHIP_RADIUS * 0.7, asteroid, asteroid.radius * 0.8)) {
        // Ship destroyed
        state.lives--;
        ship.alive = false;
        ship.respawnTimer = 90; // 1.5 seconds
        spawnExplosion(state, ship.x, ship.y, 20);
        state.events.push('death');
        break;
      }
    }
  }

  // ---- Next wave ----
  if (state.asteroids.length === 0) {
    state.waveTimer += dt;
    if (state.waveTimer > 60) { // 1 second delay
      state.wave++;
      state.asteroids = spawnWave(STARTING_ASTEROIDS + state.wave - 1);
      state.waveTimer = 0;
      state.events.push('wave');
    }
  }

  // ---- Update particles ----
  updateParticles(state, dt);

  return state;
}

function updateBullets(state, dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    wrap(b);
    if (b.life <= 0) {
      state.bullets.splice(i, 1);
    }
  }
}

function updateAsteroids(state, dt) {
  for (const a of state.asteroids) {
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.rotation += a.rotSpeed * dt;
    wrap(a);
  }
}

function spawnExplosion(state, x, y, size) {
  const count = 8 + Math.floor(size / 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      size: 1 + Math.random() * 2,
    });
  }
}

function updateParticles(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

/**
 * Get all renderable entities from the state.
 */
export function getEntities(state) {
  return {
    ship: state.ship,
    bullets: state.bullets,
    asteroids: state.asteroids,
    particles: state.particles,
    score: state.score,
    lives: state.lives,
    wave: state.wave,
    gameOver: state.gameOver,
    events: state.events,
  };
}
