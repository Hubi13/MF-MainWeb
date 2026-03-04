/**
 * i18n.js - EN/PL language switcher with full-page translation
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'site_lang';
  var CACHE_KEY = 'i18n_translate_cache_v1';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = ['en', 'pl'];
  var APPLY_SEQ = 0;
  var ORIGINAL_TITLE = '';
  var NODE_CACHE = [];

  var UI_TRANSLATIONS = {
    en: {
      'nav.aria': 'Main navigation',
      'nav.work': 'Work',
      'nav.services': 'Services',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.lang_aria': 'Language switcher',
      'nav.menu_open': 'Open menu',
    },
    pl: {
      'nav.aria': 'Glowna nawigacja',
      'nav.work': 'Realizacje',
      'nav.services': 'Oferta',
      'nav.about': 'O mnie',
      'nav.contact': 'Kontakt',
      'nav.lang_aria': 'Przelacznik jezyka',
      'nav.menu_open': 'Otworz menu',
    },
  };

  var translationCache = {};
  try {
    translationCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {};
  } catch (err) {
    translationCache = {};
  }

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
    } catch (err) {
      // ignore storage errors
    }
  }

  function getInitialLang() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get('lang');
    if (SUPPORTED.indexOf(fromQuery) !== -1) return fromQuery;

    try {
      var fromStorage = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(fromStorage) !== -1) return fromStorage;
    } catch (err) {
      // ignore storage errors
    }

    return DEFAULT_LANG;
  }

  function getUiValue(lang, key) {
    var table = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS[DEFAULT_LANG];
    return table[key] || key;
  }

  function shouldSkipNode(node) {
    if (!node || !node.parentElement) return true;

    var parent = node.parentElement;
    if (parent.closest('script, style, noscript, code, pre, textarea, svg, [data-no-translate]')) return true;
    if (parent.closest('.lang-switch, .site-logo')) return true;

    var raw = node.nodeValue || '';
    var core = raw.trim();
    if (!core) return true;
    if (core === 'EN' || core === 'PL') return true;
    if (core.length < 2) return true;
    if (/@|https?:\/\/|www\.|\.pl\b|\.com\b/i.test(core)) return true;
    if (!/[A-Za-zÀ-ž]/.test(core)) return true;
    if (/^[0-9\s.,:;!?+\-_/()[\]{}'"“”„&%€$#@*<>|]+$/.test(core)) return true;

    return false;
  }

  function collectTranslatableNodes() {
    if (NODE_CACHE.length) return;

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node = walker.nextNode();
    while (node) {
      if (!shouldSkipNode(node)) {
        var raw = node.nodeValue || '';
        var match = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
        NODE_CACHE.push({
          node: node,
          lead: match ? match[1] : '',
          core: match ? match[2] : raw,
          trail: match ? match[3] : '',
        });
      }
      node = walker.nextNode();
    }
  }

  function splitText(input, maxLen) {
    if (input.length <= maxLen) return [input];
    var words = input.split(/\s+/);
    var parts = [];
    var current = '';
    words.forEach(function (word) {
      if ((current + ' ' + word).trim().length > maxLen) {
        if (current) parts.push(current.trim());
        current = word;
      } else {
        current += (current ? ' ' : '') + word;
      }
    });
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function parseTranslateResponse(payload, fallback) {
    try {
      if (!Array.isArray(payload) || !Array.isArray(payload[0])) return fallback;
      return payload[0].map(function (part) { return part[0] || ''; }).join('');
    } catch (err) {
      return fallback;
    }
  }

  async function translateChunk(text, targetLang) {
    var cacheId = targetLang + '::' + text;
    if (translationCache[cacheId]) return translationCache[cacheId];

    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
      encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);

    try {
      var response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('translate request failed');
      var payload = await response.json();
      var translated = parseTranslateResponse(payload, text);
      translationCache[cacheId] = translated;
      return translated;
    } catch (err) {
      return text;
    }
  }

  async function translateText(text, targetLang) {
    if (!text || !text.trim()) return text;
    var chunks = splitText(text, 380);
    var out = [];
    for (var i = 0; i < chunks.length; i += 1) {
      // Sequential to avoid API throttling
      out.push(await translateChunk(chunks[i], targetLang));
    }
    return out.join(' ');
  }

  async function translatePageContent(targetLang, seq) {
    collectTranslatableNodes();
    var unique = [];
    var seen = {};
    NODE_CACHE.forEach(function (item) {
      if (!seen[item.core]) {
        seen[item.core] = true;
        unique.push(item.core);
      }
    });

    var translatedMap = {};
    for (var i = 0; i < unique.length; i += 1) {
      if (seq !== APPLY_SEQ) return;
      translatedMap[unique[i]] = await translateText(unique[i], targetLang);
    }

    if (seq !== APPLY_SEQ) return;
    NODE_CACHE.forEach(function (item) {
      var value = translatedMap[item.core] || item.core;
      item.node.nodeValue = item.lead + value + item.trail;
    });
  }

  function setSwitchState(lang) {
    document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang-switch');
      var isActive = btnLang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyUiDictionary(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = getUiValue(lang, key);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria-label');
      el.setAttribute('aria-label', getUiValue(lang, key));
    });
  }

  async function applyLanguage(lang) {
    var resolved = SUPPORTED.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
    var seq = ++APPLY_SEQ;

    document.documentElement.lang = resolved;
    setSwitchState(resolved);

    await translatePageContent(resolved, seq);
    if (seq !== APPLY_SEQ) return;

    applyUiDictionary(resolved);

    if (!ORIGINAL_TITLE) ORIGINAL_TITLE = document.title;
    document.title = await translateText(ORIGINAL_TITLE, resolved);

    saveCache();
    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch (err) {
      // ignore storage errors
    }
  }

  function bindSwitcher() {
    document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selected = btn.getAttribute('data-lang-switch');
        applyLanguage(selected);
      });
    });
  }

  function initMobileNavFallback() {
    var toggle = document.querySelector('.nav-toggle');
    var navList = document.querySelector('.site-nav__list');
    if (!toggle || !navList) return;
    if (toggle.dataset.mobileNavInitialized === 'true') return;

    toggle.dataset.mobileNavInitialized = 'true';

    function openMenu() {
      navList.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu();
      else openMenu();
    });

    navList.querySelectorAll('a, button').forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.closest('.site-nav__lang')) return;
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ORIGINAL_TITLE = document.title;
    bindSwitcher();
    initMobileNavFallback();
    applyLanguage(getInitialLang());
  });
})();
