/**
 * main.js - Core JS: nav, scroll, reveal animations
 */

(function () {
  'use strict';

  /* ============================================================
     HEADER SCROLL BEHAVIOR
     ============================================================ */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const threshold = 40;

    function updateHeader() {
      if (window.scrollY > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ============================================================
     MOBILE NAV TOGGLE
     ============================================================ */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.site-nav__list');
    if (!toggle || !navList) return;

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
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ============================================================
     ACTIVE NAV LINK
     ============================================================ */
  function initActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.site-nav__link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPath = href.replace(/\/$/, '');
      if (
        currentPath === linkPath ||
        (linkPath !== '' && currentPath.startsWith(linkPath))
      ) {
        link.classList.add('is-active');
      }
    });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function initScrollReveal() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el, index) {
      const delay = el.dataset.delay || index * 80;
      el.style.transitionDelay = delay + 'ms';
      observer.observe(el);
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR (case study pages)
     ============================================================ */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ============================================================
     PORTFOLIO FILTERS
     ============================================================ */
  function initPortfolioFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const portfolioItems = document.querySelectorAll('.portfolio-grid-item');
    if (!filterTabs.length || !portfolioItems.length) return;

    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const filter = tab.dataset.filter;

        filterTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        portfolioItems.forEach(function (item) {
          const category = item.dataset.category;
          if (filter === 'all' || category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileNav();
    initActiveNav();
    initScrollReveal();
    initScrollProgress();
    initPortfolioFilters();
  });
})();
