/**
 * i18n.js - lightweight EN/PL language switcher for shared UI
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'site_lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = ['en', 'pl'];

  var TRANSLATIONS = {
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

  function getInitialLang() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get('lang');
    if (SUPPORTED.indexOf(fromQuery) !== -1) {
      return fromQuery;
    }

    try {
      var fromStorage = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(fromStorage) !== -1) {
        return fromStorage;
      }
    } catch (err) {
      // ignore storage access errors
    }

    return DEFAULT_LANG;
  }

  function getValue(lang, key) {
    var table = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    return table[key] || key;
  }

  function applyLanguage(lang) {
    var resolved = SUPPORTED.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
    document.documentElement.lang = resolved;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = getValue(resolved, key);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria-label');
      el.setAttribute('aria-label', getValue(resolved, key));
    });

    document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang-switch');
      var isActive = btnLang === resolved;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch (err) {
      // ignore storage access errors
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
    bindSwitcher();
    applyLanguage(getInitialLang());
    initMobileNavFallback();
  });
})();

