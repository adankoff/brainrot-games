/**
 * Brainrot Games -- Skin Manager
 * Loads image-based skin packs from assets/packs/{id}/ and provides
 * draw helpers that replace canvas draw functions with preloaded images.
 *
 * Usage:
 *   import { skinManager } from '../../shared/skin-manager.js';
 *
 *   // On init:
 *   await skinManager.init();
 *
 *   // In draw code:
 *   const skin = skinManager.current;
 *   if (skin) {
 *     skin.drawImage(ctx, 'protagonist', x, y, w, h);
 *   } else {
 *     // fallback to canvas draw function
 *   }
 */

// ---- Resolve base path to assets/packs/ relative to any game ----

function resolvePacksBase() {
  // Works from games/game-XX/ (2 levels deep) or games/shared/
  const loc = window.location.pathname;
  if (loc.includes('/games/game-')) {
    return '../../assets/packs';
  }
  if (loc.includes('/games/shared/')) {
    return '../../assets/packs';
  }
  // Fallback: assume site root
  return '/assets/packs';
}

const PACKS_BASE = resolvePacksBase();
const STORAGE_KEY = 'brainrot-skin-pack';

// ---- Image preloader ----

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// ---- SkinPack: a loaded, ready-to-use pack ----

export class SkinPack {
  /**
   * @param {Object} manifest - Parsed manifest.json
   * @param {Map<string, HTMLImageElement>} images - Loaded images keyed by role
   * @param {string} basePath - URL base for this pack's folder
   */
  constructor(manifest, images, basePath) {
    this.manifest = manifest;
    this.id = manifest.id;
    this.name = manifest.name;
    this.description = manifest.description || '';
    this.palette = manifest.palette || {};
    this._images = images;
    this._basePath = basePath;
  }

  /**
   * Check if an image is available for a given role.
   * @param {string} role - 'protagonist', 'antagonist', 'supporting-01', 'collectible', etc.
   * @returns {boolean}
   */
  has(role) {
    return this._images.has(role);
  }

  /**
   * Get the raw Image element for a role.
   * @param {string} role
   * @returns {HTMLImageElement|null}
   */
  getImage(role) {
    return this._images.get(role) || null;
  }

  /**
   * Draw a skin image centered at (cx, cy) with given dimensions.
   * Drop-in replacement for canvas draw functions that render at origin.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} role - Image role key
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} w - Width to draw
   * @param {number} h - Height to draw
   */
  drawCentered(ctx, role, cx, cy, w, h) {
    const img = this._images.get(role);
    if (!img) return false;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    return true;
  }

  /**
   * Draw a skin image at (x, y) corner with given dimensions.
   * For entities that use corner-based positioning (runner, etc.).
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} role - Image role key
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} w - Width
   * @param {number} h - Height
   */
  drawAt(ctx, role, x, y, w, h) {
    const img = this._images.get(role);
    if (!img) return false;
    ctx.drawImage(img, x, y, w, h);
    return true;
  }

  /**
   * Draw at origin (0,0) — for flappy-style characters where
   * the caller has already done ctx.translate(x,y) + ctx.rotate().
   * Draws centered on origin.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} role
   * @param {number} w - Width
   * @param {number} h - Height
   */
  drawAtOrigin(ctx, role, w, h) {
    const img = this._images.get(role);
    if (!img) return false;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    return true;
  }

  /**
   * Get character info for a role (name, emoji, etc.).
   * @param {string} role
   * @returns {Object|null}
   */
  getCharacterInfo(role) {
    const m = this.manifest;
    if (role === 'protagonist') return m.characters?.protagonist || null;
    if (role === 'antagonist') return m.characters?.antagonist || null;
    if (role.startsWith('supporting-')) {
      const idx = parseInt(role.split('-')[1], 10) - 1;
      return m.characters?.supporting?.[idx] || null;
    }
    if (role === 'collectible') return m.items?.collectible || null;
    if (role.startsWith('collectible-')) {
      const idx = parseInt(role.split('-')[1], 10) - 1;
      return m.items?.collectibles?.[idx] || null;
    }
    if (role.startsWith('obstacle-')) {
      const idx = parseInt(role.split('-')[1], 10) - 1;
      return m.items?.obstacles?.[idx] || null;
    }
    if (role === 'projectile') return m.items?.projectile || null;
    if (role === 'target') return m.items?.target || null;
    return null;
  }

  /**
   * Get all available supporting character roles.
   * @returns {string[]}
   */
  getSupportingRoles() {
    const roles = [];
    const supporting = this.manifest.characters?.supporting || [];
    for (let i = 0; i < supporting.length; i++) {
      const role = `supporting-${String(i + 1).padStart(2, '0')}`;
      if (this._images.has(role)) roles.push(role);
    }
    return roles;
  }
}


// ---- SkinManager singleton ----

class SkinManager {
  constructor() {
    /** @type {SkinPack|null} */
    this.current = null;

    /** @type {Object[]|null} - Cached index of available packs */
    this._index = null;

    /** @type {Map<string, SkinPack>} - Cache of loaded packs */
    this._cache = new Map();

    /** @type {Function[]} - Listeners for skin change events */
    this._listeners = [];

    /** @type {boolean} */
    this._initialized = false;
  }

  /**
   * Initialize: load the packs index and restore last-used skin.
   * Safe to call multiple times (idempotent).
   */
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    try {
      const res = await fetch(`${PACKS_BASE}/index.json`);
      if (res.ok) {
        this._index = await res.json();
      }
    } catch {
      // No index available — skin switching disabled, games work normally
      this._index = null;
    }

    // Restore saved skin
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId && this._index) {
      try {
        await this.loadPack(savedId);
      } catch {
        // Pack no longer available — clear preference
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  /**
   * Get list of available packs (id + name + description).
   * @returns {Object[]}
   */
  getAvailablePacks() {
    if (!this._index) return [];
    return this._index.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      thumbnail: `${PACKS_BASE}/${p.id}/protagonist.png`,
    }));
  }

  /**
   * Load and activate a skin pack by ID.
   * @param {string} packId
   * @returns {Promise<SkinPack>}
   */
  async loadPack(packId) {
    // Check cache
    if (this._cache.has(packId)) {
      this.current = this._cache.get(packId);
      localStorage.setItem(STORAGE_KEY, packId);
      this._notify();
      return this.current;
    }

    const basePath = `${PACKS_BASE}/${packId}`;

    // Load manifest
    const res = await fetch(`${basePath}/manifest.json`);
    if (!res.ok) throw new Error(`Pack "${packId}" not found`);
    const manifest = await res.json();

    // Collect all image paths to preload
    const imageEntries = [];

    const addImage = (role, fileRef) => {
      if (fileRef?.file) {
        imageEntries.push({ role, src: `${basePath}/${fileRef.file}` });
      }
    };

    // Characters
    addImage('protagonist', manifest.characters?.protagonist);
    addImage('antagonist', manifest.characters?.antagonist);
    const supporting = manifest.characters?.supporting || [];
    supporting.forEach((s, i) => {
      addImage(`supporting-${String(i + 1).padStart(2, '0')}`, s);
    });

    // Items
    addImage('collectible', manifest.items?.collectible);
    const collectibles = manifest.items?.collectibles || [];
    collectibles.forEach((c, i) => {
      addImage(`collectible-${String(i + 1).padStart(2, '0')}`, c);
    });
    const obstacles = manifest.items?.obstacles || [];
    obstacles.forEach((o, i) => {
      addImage(`obstacle-${String(i + 1).padStart(2, '0')}`, o);
    });
    addImage('projectile', manifest.items?.projectile);
    addImage('target', manifest.items?.target);

    // Background
    if (manifest.background?.file) {
      imageEntries.push({ role: 'background', src: `${basePath}/${manifest.background.file}` });
    }

    // Preload all images (fail gracefully per image)
    const images = new Map();
    const loadPromises = imageEntries.map(async ({ role, src }) => {
      try {
        const img = await loadImage(src);
        images.set(role, img);
      } catch {
        // Image missing — this role just won't be available
        console.warn(`Skin pack "${packId}": missing image for "${role}"`);
      }
    });

    await Promise.all(loadPromises);

    const pack = new SkinPack(manifest, images, basePath);
    this._cache.set(packId, pack);
    this.current = pack;
    localStorage.setItem(STORAGE_KEY, packId);
    this._notify();
    return pack;
  }

  /**
   * Clear the active skin — games revert to default canvas rendering.
   */
  clearSkin() {
    this.current = null;
    localStorage.removeItem(STORAGE_KEY);
    this._notify();
  }

  /**
   * Subscribe to skin change events.
   * @param {Function} fn - Called with (SkinPack|null) on change
   * @returns {Function} unsubscribe function
   */
  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  /** @private */
  _notify() {
    for (const fn of this._listeners) {
      try { fn(this.current); } catch { /* ignore listener errors */ }
    }
  }
}

/** Singleton instance */
export const skinManager = new SkinManager();
