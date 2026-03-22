/**
 * main.js - Core UI behavior: nav, reveal, cursor, filters, scroll motion
 */

function initMobileNav(rootDocument) {
  var doc = rootDocument || (typeof document !== 'undefined' ? document : null);
  if (!doc) return;

  var toggle = doc.querySelector('.nav-toggle');
  var navList = doc.querySelector('.site-nav__list');
  if (!toggle || !navList) return;
  if (toggle.dataset.mobileNavInitialized === 'true') return;

  toggle.dataset.mobileNavInitialized = 'true';

  function closeMenu() {
    navList.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    doc.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    navList.classList.toggle('is-open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
    doc.body.style.overflow = isOpen ? '' : 'hidden';
  });

  navList.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initMobileNav: initMobileNav };
}

(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function updateHeader() {
      header.classList.toggle('is-scrolled', window.scrollY > 30);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  function normalizePath(path) {
    if (!path) return '/';
    return path.replace(/\/+$/, '') || '/';
  }

  function initActiveNav() {
    var currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll('.site-nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      var url = new URL(href, window.location.origin);
      var linkPath = normalizePath(url.pathname);

      if (url.hash) {
        if (currentPath === linkPath && window.location.hash === url.hash) {
          link.classList.add('is-active');
        }
        return;
      }

      if (currentPath === linkPath || (linkPath !== '/' && currentPath.indexOf(linkPath + '/') === 0)) {
        link.classList.add('is-active');
      }
    });
  }

  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (prefersReducedMotion()) {
      elements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (element, index) {
      var delay = element.dataset.delay || String(index * 40);
      element.style.transitionDelay = delay + 'ms';
      observer.observe(element);
    });
  }

  function initHeroFlight() {
    var hero = document.querySelector('[data-hero-flight]');
    if (!hero || prefersReducedMotion()) return;

    var ticking = false;

    function render() {
      var rect = hero.getBoundingClientRect();
      var viewport = Math.max(window.innerHeight, 1);
      var progress = Math.min(Math.max((0 - rect.top) / (viewport * 0.9), 0), 1);
      var tilt = progress * 12;
      var shift = progress * -34;
      var scale = 1 - progress * 0.06;
      var opacity = 1 - progress * 0.16;

      hero.style.setProperty('--hero-tilt', tilt.toFixed(2) + 'deg');
      hero.style.setProperty('--hero-shift', shift.toFixed(2) + 'px');
      hero.style.setProperty('--hero-scale', scale.toFixed(3));
      hero.style.setProperty('--hero-opacity', opacity.toFixed(3));
      ticking = false;
    }

    function requestRender() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(render);
    }

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender);
    requestRender();
  }

  function initPortfolioFilters() {
    var filterTabs = document.querySelectorAll('.filter-tab');
    var portfolioItems = document.querySelectorAll('.portfolio-grid-item');
    if (!filterTabs.length || !portfolioItems.length) return;

    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = tab.dataset.filter;

        filterTabs.forEach(function (item) {
          item.classList.remove('is-active');
        });
        tab.classList.add('is-active');

        portfolioItems.forEach(function (item) {
          var category = item.dataset.category;
          item.style.display = filter === 'all' || category === filter ? '' : 'none';
        });
      });
    });
  }

  function initCustomCursor() {
    var ring = document.querySelector('.cursor-ring');
    var dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion()) return;

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
      if (event.target.closest('a, button, .portfolio-card, .cs-card, .glass-card, .model-card')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (event) {
      if (event.target.closest('a, button, .portfolio-card, .cs-card, .glass-card, .model-card')) {
        document.body.classList.remove('cursor-hover');
      }
    });

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  }

  function initMagneticButtons() {
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.btn--magnetic').forEach(function (button) {
      button.addEventListener('mousemove', function (event) {
        var rect = button.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = 'translate(' + (x / rect.width * 12).toFixed(2) + 'px, ' + (y / rect.height * 10).toFixed(2) + 'px)';
      });

      button.addEventListener('mouseleave', function () {
        button.style.transform = '';
      });
    });
  }

  function initCardParallax() {
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.portfolio-card, .cs-card, .glass-card, .model-card').forEach(function (card) {
      if (card.classList.contains('cs-card--locked')) return;

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
      });

      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var rotateY = ((x / rect.width) - 0.5) * 8;
        var rotateX = (0.5 - (y / rect.height)) * 8;
        card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = '';
        card.style.transform = '';
      });
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-line__bar, .scroll-progress');
    if (!bar) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  function initYear() {
    document.querySelectorAll('#year').forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeader();
      initMobileNav();
      initActiveNav();
      initScrollReveal();
      initHeroFlight();
      initPortfolioFilters();
      initCustomCursor();
      initMagneticButtons();
      initCardParallax();
      initScrollProgress();
      initYear();
    });
  }
})();
