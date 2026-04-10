/**
 * BRG Bridge — Native integration layer
 * Injected into every game page by the build pipeline.
 * Provides: localStorage namespacing, analytics, ad triggers,
 * back button, watermark override, platform detection.
 *
 * Placeholders (replaced at build time):
 *   __BRAND_ID__, __PLATFORM__, __WATERMARK__,
 *   __ADS_ENABLED__, __AD_FREQUENCY__, __ANALYTICS_ENABLED__,
 *   __ANALYTICS_PROVIDER__, __ANALYTICS_ID__
 */

(function () {
  'use strict';

  // ---- (a) localStorage namespacing ----

  var brandId = '__BRAND_ID__';
  var prefix = brandId + ':';

  var originalGetItem = Storage.prototype.getItem;
  var originalSetItem = Storage.prototype.setItem;
  var originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.getItem = function (key) {
    return originalGetItem.call(this, prefix + key);
  };

  Storage.prototype.setItem = function (key, value) {
    return originalSetItem.call(this, prefix + key, value);
  };

  Storage.prototype.removeItem = function (key) {
    return originalRemoveItem.call(this, prefix + key);
  };

  // ---- (b) Platform detection ----

  window.BRGBridge = {
    platform: '__PLATFORM__',
    brandId: brandId,
    version: '1.0.0',
  };

  // ---- (c) Analytics tracking ----

  BRGBridge.analytics = {
    trackEvent: function (name, params) {
      if (window._brgAnalyticsHandler) {
        window._brgAnalyticsHandler(name, params);
      }
    },
    trackScreen: function (name) {
      this.trackEvent('screen_view', { screen_name: name });
    },
  };

  // ---- (d) Ad management ----

  BRGBridge.ads = {
    _enabled: __ADS_ENABLED__,
    _frequency: __AD_FREQUENCY__,
    _gameOverCount: 0,
    _adFree: false,

    showInterstitial: function () {
      if (!this._enabled || this._adFree) return Promise.resolve(false);
      if (window._brgAdHandler) return Promise.resolve(window._brgAdHandler());
      return Promise.resolve(false);
    },

    isAdFree: function () {
      return this._adFree;
    },

    setAdFree: function (v) {
      this._adFree = v;
    },
  };

  // ---- (e) Game lifecycle listener ----

  window.addEventListener('brg:gamestart', function (e) {
    BRGBridge.analytics.trackEvent('game_start', {
      game_id: (e.detail && e.detail.gameId) || 'unknown',
    });
  });

  window.addEventListener('brg:gameover', function (e) {
    var detail = e.detail || {};
    BRGBridge.analytics.trackEvent('game_over', {
      game_id: detail.gameId || 'unknown',
      score: detail.score || 0,
      message: detail.message || '',
    });

    // Ad trigger
    BRGBridge.ads._gameOverCount++;
    if (BRGBridge.ads._gameOverCount % BRGBridge.ads._frequency === 0) {
      BRGBridge.ads.showInterstitial();
    }
  });

  // ---- (f) Back button handling ----

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (window.location.pathname.indexOf('/games/game-') !== -1) {
        window.location.href = '/';
      }
    }
  });
  // Capacitor back button will be handled by Capacitor App plugin (injected later)

  // ---- (g) Watermark override ----

  document.addEventListener('DOMContentLoaded', function () {
    var watermark = '__WATERMARK__';
    if (watermark) {
      var el = document.querySelector('.menu-screen__watermark');
      if (el) el.textContent = watermark;

      var observer = new MutationObserver(function () {
        var wm = document.querySelector('.menu-screen__watermark');
        if (wm && wm.textContent !== watermark) wm.textContent = watermark;
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
})();
