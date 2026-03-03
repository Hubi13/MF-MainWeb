/**
 * consent.js - Cookie consent banner, analytics gate
 */

(function () {
    'use strict';

    var CONSENT_KEY = 'analytics_consent';
    var banner = null;

    function getConsent() {
        try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    }

    function setConsent(value) {
        try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { }
    }

    function hideBanner() {
        if (banner) {
            banner.classList.remove('is-visible');
        }
    }

    function grantAnalytics() {
        setConsent('granted');
        hideBanner();
        if (window.Analytics && typeof window.Analytics.init === 'function') {
            window.Analytics.init();
        }
    }

    function denyAnalytics() {
        setConsent('denied');
        hideBanner();
    }

    function initConsent() {
        var existing = getConsent();
        if (existing === 'granted') {
            if (window.Analytics) window.Analytics.init();
            return;
        }
        if (existing === 'denied') return;

        banner = document.querySelector('.consent-banner');
        if (!banner) return;

        banner.classList.add('is-visible');

        var acceptBtn = banner.querySelector('[data-consent="accept"]');
        var denyBtn = banner.querySelector('[data-consent="deny"]');

        if (acceptBtn) acceptBtn.addEventListener('click', grantAnalytics);
        if (denyBtn) denyBtn.addEventListener('click', denyAnalytics);
    }

    document.addEventListener('DOMContentLoaded', initConsent);
})();
