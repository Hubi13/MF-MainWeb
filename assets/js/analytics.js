/**
 * analytics.js - GA4 + event tracking (placeholder, gates on consent)
 */

(function () {
    'use strict';

    var GA_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID

    /* ============================================================
       LOAD GA4 (called only after consent)
       ============================================================ */
    function loadGA4() {
        if (window.gaLoaded) return;
        window.gaLoaded = true;

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { anonymize_ip: true });
    }

    /* ============================================================
       EVENT TRACKING
       ============================================================ */
    function trackEvent(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
    }

    /* ============================================================
       CTA CLICKS
       ============================================================ */
    function initCTATracking() {
        document.querySelectorAll('[data-track-cta]').forEach(function (el) {
            el.addEventListener('click', function () {
                trackEvent('cta_click', { cta_label: el.dataset.trackCta });
            });
        });
    }

    /* ============================================================
       CASE STUDY CLICKS
       ============================================================ */
    function initCaseStudyTracking() {
        document.querySelectorAll('.cs-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var title = card.querySelector('.cs-card__title');
                trackEvent('case_study_click', {
                    case_study_title: title ? title.textContent.trim() : 'unknown'
                });
            });
        });
    }

    /* ============================================================
       CONTACT LINK CLICKS
       ============================================================ */
    function initContactTracking() {
        document.querySelectorAll('[data-track-contact]').forEach(function (el) {
            el.addEventListener('click', function () {
                trackEvent('contact_link_click', { contact_type: el.dataset.trackContact });
            });
        });
    }

    /* ============================================================
       FORM SUBMIT
       ============================================================ */
    window.trackFormSubmit = function (formName) {
        trackEvent('form_submit', { form_name: formName || 'contact' });
    };

    /* ============================================================
       SCROLL DEPTH MILESTONES
       ============================================================ */
    function initScrollDepth() {
        var milestones = [25, 50, 75, 100];
        var reached = [];

        window.addEventListener('scroll', function () {
            var scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
            milestones.forEach(function (m) {
                if (scrolled >= m && reached.indexOf(m) === -1) {
                    reached.push(m);
                    trackEvent('scroll_depth', { depth_percent: m });
                }
            });
        }, { passive: true });
    }

    /* ============================================================
       PUBLIC API - called by consent.js after consent granted
       ============================================================ */
    window.Analytics = {
        init: function () {
            loadGA4();
            initCTATracking();
            initCaseStudyTracking();
            initContactTracking();
            initScrollDepth();
        }
    };
})();
