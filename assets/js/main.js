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
    var cardSelector = [
      '.glass-card',
      '.portfolio-card',
      '.model-card',
      '.testimonial-card',
      '.about-image',
      '.cta-card',
      '.work-project-card',
      '.mini-info-card',
      '.detail-panel',
      '.process-card',
      '.fit-card',
      '.work-story-card',
      '.work-signal-card',
      '.work-showcase',
      '.scope-card',
      '.faq-card',
      '.cs-card',
      '.cs-sidebar-box',
      '.cs-meta-item',
      '.offer-card',
      '.offer-note',
      '.offer-process-card',
      '.offer-fit-card'
    ].join(', ');

    document.querySelectorAll(cardSelector).forEach(function (item, index) {
      if (!item.classList.contains('reveal-card') && !item.classList.contains('reveal')) {
        item.classList.add('reveal-card');
      }

      if (!item.dataset.delay) {
        item.dataset.delay = String(Math.min((index % 4) * 110, 330));
      }
    });

    var textSelector = [
      'main h1',
      'main h2',
      'main h3',
      'main p',
      'main li',
      'main .btn',
      'main .breadcrumbs',
      'main .filter-tabs'
    ].join(', ');

    document.querySelectorAll(textSelector).forEach(function (item, index) {
      if (item.closest('.site-header, .site-footer, .site-nav')) return;
      if (!item.classList.contains('reveal') && !item.classList.contains('reveal-card') && !item.classList.contains('reveal-text')) {
        item.classList.add('reveal-text');
      }

      if (!item.dataset.delay) {
        item.dataset.delay = String(Math.min((index % 6) * 60, 300));
      }
    });
  }

  function initScrollReveal() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.querySelectorAll('.reveal, .reveal-card, .reveal-text').forEach(function (el) {
        el.classList.add('is-visible');
      });

      document.querySelectorAll('main section, .page-hero, .cs-header, .cs-narrative, .cs-body, .cta-closer').forEach(function (section) {
        section.classList.add('section-in-view');
      });
      return;
    }

    var elements = document.querySelectorAll('.reveal, .reveal-card, .reveal-text, main section, .page-hero, .cs-header, .cs-narrative, .cs-body, .cta-closer');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (entry.target.matches('main section, .page-hero, .cs-header, .cs-narrative, .cs-body, .cta-closer')) {
              entry.target.classList.add('section-in-view');
            } else {
              entry.target.classList.add('is-visible');
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
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
      if (target && target.closest('a, button, .btn, .glass-card, .portfolio-card, .model-card, .testimonial-card, .work-project-card, .fit-card, .process-card')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (event) {
      var target = event.target;
      if (target && target.closest('a, button, .btn, .glass-card, .portfolio-card, .model-card, .testimonial-card, .work-project-card, .fit-card, .process-card')) {
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
    var hero = document.querySelector('.hero-panel');
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
    var cards = document.querySelectorAll('.glass-card, .portfolio-card, .model-card, .testimonial-card, .cta-card, .work-project-card, .fit-card, .process-card, .scope-card, .offer-card');
    if (!cards.length) return;

    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reducedMotion) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var mx = ((x / rect.width) - 0.5) * 6;
        var my = ((y / rect.height) - 0.5) * -6;
        card.style.transform = 'perspective(760px) rotateX(' + my.toFixed(2) + 'deg) rotateY(' + mx.toFixed(2) + 'deg) translateY(-5px)';
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
