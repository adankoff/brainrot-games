/**
 * Brainrot Games -- Skin Switcher UI
 * Injects a floating button + bottom-sheet pack picker into any game page.
 * Self-contained: imports skin-manager, creates DOM, handles events.
 *
 * Usage:
 *   import { initSkinSwitcher } from '../../shared/skin-switcher.js';
 *   initSkinSwitcher();   // call once after DOM is ready
 */

import { skinManager } from './skin-manager.js';

let _initialized = false;

/**
 * Initialize the skin switcher UI.
 * Loads the skin manager, injects the button and picker into the page.
 * Safe to call multiple times (idempotent).
 */
export async function initSkinSwitcher() {
  if (_initialized) return;
  _initialized = true;

  // Inject the stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./skin-switcher.css', import.meta.url).href;
  document.head.appendChild(link);

  // Initialize skin manager (loads index + restores saved preference)
  await skinManager.init();

  // Build DOM
  const { button, overlay } = buildDOM();
  document.body.appendChild(button);
  document.body.appendChild(overlay);

  // Wire events
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePicker(overlay, button);
  });

  // Update button state when skin changes
  skinManager.onChange(() => {
    updateButtonState(button);
    renderPackList(overlay);
  });

  updateButtonState(button);
}

/**
 * Get the current skin pack (convenience re-export).
 * @returns {import('./skin-manager.js').SkinPack|null}
 */
export function getCurrentSkin() {
  return skinManager.current;
}

/**
 * Subscribe to skin changes (convenience re-export).
 * @param {Function} fn
 * @returns {Function} unsubscribe
 */
export function onSkinChange(fn) {
  return skinManager.onChange(fn);
}

// ---- DOM Construction ----

function buildDOM() {
  // Floating button
  const button = document.createElement('button');
  button.className = 'skin-switcher-btn';
  button.setAttribute('aria-label', 'Switch skin pack');
  button.setAttribute('title', 'Switch skin');
  button.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10a7 7 0 1 1-7-7"/><path d="M13.5 3l3.5 3.5-3.5 3.5"/><circle cx="7" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="13" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>';

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'skin-picker-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePicker(overlay);
  });

  // Panel
  const panel = document.createElement('div');
  panel.className = 'skin-picker';

  // Header
  const header = document.createElement('div');
  header.className = 'skin-picker__header';

  const title = document.createElement('h3');
  title.className = 'skin-picker__title';
  title.textContent = 'skin pack';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'skin-picker__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => closePicker(overlay));
  header.appendChild(closeBtn);

  panel.appendChild(header);

  // List container
  const list = document.createElement('div');
  list.className = 'skin-picker__list';
  list.id = 'skin-picker-list';
  panel.appendChild(list);

  overlay.appendChild(panel);

  // Render initial pack list
  renderPackList(overlay);

  return { button, overlay };
}


// ---- Pack List Rendering ----

function renderPackList(overlay) {
  const list = overlay.querySelector('#skin-picker-list');
  if (!list) return;

  list.innerHTML = '';

  const packs = skinManager.getAvailablePacks();
  const currentId = skinManager.current?.id || null;

  // "Default" option (no skin)
  const defaultItem = createPackItem({
    id: null,
    name: 'Default',
    description: 'Original canvas-drawn characters',
    thumbnail: null,
  }, currentId === null);

  defaultItem.addEventListener('click', () => {
    skinManager.clearSkin();
    closePicker(overlay);
  });
  list.appendChild(defaultItem);

  if (packs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'skin-picker__empty';
    empty.textContent = 'No skin packs available yet. Drop image folders into assets/packs/ to get started.';
    list.appendChild(empty);
    return;
  }

  // Pack items
  for (const pack of packs) {
    const isActive = pack.id === currentId;
    const item = createPackItem(pack, isActive);

    item.addEventListener('click', async () => {
      try {
        await skinManager.loadPack(pack.id);
      } catch (err) {
        console.error(`Failed to load skin pack "${pack.id}":`, err);
      }
      closePicker(overlay);
    });

    list.appendChild(item);
  }
}

function createPackItem(pack, isActive) {
  const item = document.createElement('div');
  item.className = 'skin-picker__item' + (isActive ? ' skin-picker__item--active' : '');

  // Thumbnail
  if (pack.thumbnail) {
    const thumb = document.createElement('img');
    thumb.className = 'skin-picker__thumb';
    thumb.src = pack.thumbnail;
    thumb.alt = pack.name;
    thumb.loading = 'lazy';
    // Fallback if image doesn't load
    thumb.onerror = () => {
      thumb.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'skin-picker__thumb skin-picker__thumb--default';
      fallback.textContent = pack.name?.[0] || '?';
      item.insertBefore(fallback, item.firstChild);
    };
    item.appendChild(thumb);
  } else {
    const thumb = document.createElement('div');
    thumb.className = 'skin-picker__thumb skin-picker__thumb--default';
    thumb.textContent = pack.id ? pack.name?.[0] || '?' : '\u2205';
    item.appendChild(thumb);
  }

  // Info
  const info = document.createElement('div');
  info.className = 'skin-picker__info';

  const name = document.createElement('div');
  name.className = 'skin-picker__name';
  name.textContent = pack.name;
  info.appendChild(name);

  if (pack.description) {
    const desc = document.createElement('div');
    desc.className = 'skin-picker__desc';
    desc.textContent = pack.description;
    info.appendChild(desc);
  }
  item.appendChild(info);

  // Check indicator
  const check = document.createElement('div');
  check.className = 'skin-picker__check';
  if (isActive) check.textContent = '\u2713';
  item.appendChild(check);

  return item;
}


// ---- Picker Toggle ----

function togglePicker(overlay, button) {
  const isOpen = overlay.classList.contains('skin-picker-overlay--open');
  if (isOpen) {
    closePicker(overlay);
  } else {
    renderPackList(overlay);
    overlay.classList.add('skin-picker-overlay--open');
  }
}

function closePicker(overlay) {
  overlay.classList.remove('skin-picker-overlay--open');
}

function updateButtonState(button) {
  if (skinManager.current) {
    button.classList.add('skin-switcher-btn--active');
    button.title = `Skin: ${skinManager.current.name}`;
  } else {
    button.classList.remove('skin-switcher-btn--active');
    button.title = 'Switch skin';
  }
}
