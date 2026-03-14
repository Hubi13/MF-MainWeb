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

  function initMotionTargets() {
    var cardGroups = document.querySelectorAll('.about-section, .about-stats, .glass-grid, .portfolio-grid, .models-grid');
    cardGroups.forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, index) {
        if (!child.classList.contains('reveal') && !child.classList.contains('reveal-card')) {
          child.classList.add('reveal-card');
        }

        if (!child.dataset.delay) {
          child.dataset.delay = String(Math.min(index * 90, 360));
        }
      });
    });

    var textSelector = [
      '.hero-title',
      '.hero-sub',
      '.section-head__label',
      '.section-head h2',
      '.about-content h2',
      '.about-content p',
      '.portfolio-card__title',
      '.portfolio-card__desc',
      '.model-card h3',
      '.model-card p',
      '.testimonial-card__quote',
      '.cta-box h2'
    ].join(', ');

    var scopes = document.querySelectorAll('.hero-v2, .section, .cta-box');
    scopes.forEach(function (scope) {
      var items = scope.querySelectorAll(textSelector);
      items.forEach(function (item, index) {
        if (!item.classList.contains('reveal-text')) {
          item.classList.add('reveal-text');
        }

        if (!item.dataset.delay) {
          item.dataset.delay = String(Math.min(index * 60, 320));
        }
      });
    });
  }

  function initScrollReveal() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.querySelectorAll('.reveal, .reveal-card, .reveal-text').forEach(function (el) {
        el.classList.add('is-visible');
      });

      document.querySelectorAll('.section').forEach(function (section) {
        section.classList.add('section-in-view');
      });
      return;
    }

    var elements = document.querySelectorAll('.reveal, .reveal-card, .reveal-text, .section');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('section')) {
              entry.target.classList.add('section-in-view');
            } else {
              entry.target.classList.add('is-visible');
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -12% 0px' }
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

    var target = 0;
    var current = 0;
    var ticking = false;

    function measureProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    }

    function render() {
      current += (target - current) * 0.18;

      if (customBar) customBar.style.width = current + '%';
      if (legacyBar) legacyBar.style.width = current + '%';

      if (Math.abs(target - current) > 0.08) {
        requestAnimationFrame(render);
      } else {
        ticking = false;
      }
    }

    function updateProgress() {
      target = measureProgress();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
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

    document.addEventListener('mousedown', function () {
      document.body.classList.add('cursor-press');
    });

    document.addEventListener('mouseup', function () {
      document.body.classList.remove('cursor-press');
    });

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-ready');
      document.body.classList.remove('cursor-hover');
      document.body.classList.remove('cursor-press');
    });

    document.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-ready');
    });

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function initHeroSpotlight() {
    var hero = document.querySelector('.hero-v3');
    if (!hero) return;

    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reducedMotion) return;

    hero.addEventListener('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--spot-x', x.toFixed(2) + '%');
      hero.style.setProperty('--spot-y', y.toFixed(2) + '%');
    });

    hero.addEventListener('mouseleave', function () {
      hero.style.removeProperty('--spot-x');
      hero.style.removeProperty('--spot-y');
    });
  }

  function initMagneticButtons() {
    var buttons = document.querySelectorAll('.btn--magnetic');
    if (!buttons.length) return;

    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reducedMotion) return;

    buttons.forEach(function (button) {
      button.addEventListener('mousemove', function (event) {
        var rect = button.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;
        var mx = (x / rect.width) * 14;
        var my = (y / rect.height) * 10;
        button.style.transform = 'translate(' + mx.toFixed(2) + 'px, ' + my.toFixed(2) + 'px)';
      });

      button.addEventListener('mouseleave', function () {
        button.style.transform = '';
      });
    });
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
    initMotionTargets();
    initScrollReveal();
    initScrollProgress();
    initPortfolioFilters();
    initCustomCursor();
    initCardParallax();
    initHeroSpotlight();
    initMagneticButtons();
  });
})();
