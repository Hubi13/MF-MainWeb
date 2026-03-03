/**
 * main.js - Core JS: nav, scroll, reveal animations
 */

(function () {
  'use strict';

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var threshold = 30;

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

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var navList = document.querySelector('.site-nav__list');
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
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function initActiveNav() {
    var currentPath = window.location.pathname.replace(/\/$/, '');

    document.querySelectorAll('.site-nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      var linkPath = href.replace(/\/$/, '');
      if (currentPath === linkPath || (linkPath !== '' && currentPath.startsWith(linkPath))) {
        link.classList.add('is-active');
      }
    });
  }

  function initScrollReveal() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach(function (el, index) {
      var delay = el.dataset.delay || index * 50;
      el.style.transitionDelay = delay + 'ms';
      observer.observe(el);
    });
  }

  function initScrollProgress() {
    var customBar = document.querySelector('.scroll-line__bar');
    var legacyBar = document.querySelector('.scroll-progress');
    if (!customBar && !legacyBar) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (customBar) customBar.style.width = progress + '%';
      if (legacyBar) legacyBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  function initPortfolioFilters() {
    var filterTabs = document.querySelectorAll('.filter-tab');
    var portfolioItems = document.querySelectorAll('.portfolio-grid-item');
    if (!filterTabs.length || !portfolioItems.length) return;

    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.dataset.filter;

        filterTabs.forEach(function (t) {
          t.classList.remove('is-active');
        });
        tab.classList.add('is-active');

        portfolioItems.forEach(function (item) {
          var category = item.dataset.category;
          if (filter === 'all' || category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  function initCustomCursor() {
    var ring = document.querySelector('.cursor-ring');
    var dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;

    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reducedMotion) return;

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;

    document.body.classList.add('cursor-ready');

    document.addEventListener('mousemove', function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px) translate(-50%, -50%)';
    });

    document.addEventListener('mouseover', function (event) {
      var target = event.target;
      if (target && target.closest('a, button, .project-square, .btn')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (event) {
      var target = event.target;
      if (target && target.closest('a, button, .project-square, .btn')) {
        document.body.classList.remove('cursor-hover');
      }
    });

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function initCardParallax() {
    var cards = document.querySelectorAll('.project-square');
    if (!cards.length) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var mx = ((x / rect.width) - 0.5) * 6;
        var my = ((y / rect.height) - 0.5) * -6;
        card.style.transform = 'perspective(700px) rotateX(' + my + 'deg) rotateY(' + mx + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileNav();
    initActiveNav();
    initScrollReveal();
    initScrollProgress();
    initPortfolioFilters();
    initCustomCursor();
    initCardParallax();
  });
})();
