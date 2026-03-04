/**
 * form.js - Contact form validation, honeypot, Netlify + mailto fallback
 */

(function () {
    'use strict';

    var NETLIFY_ENABLED = true; // Set false to force mailto fallback

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    }

    function getFieldGroup(input) {
        return input.closest('.form-group');
    }

    function showError(input, message) {
        var group = getFieldGroup(input);
        if (!group) return;
        group.classList.add('has-error');
        var errorEl = group.querySelector('.form-error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(input) {
        var group = getFieldGroup(input);
        if (!group) return;
        group.classList.remove('has-error');
    }

    function validateForm(form) {
        var valid = true;

        var nameInput = form.querySelector('[name="name"]');
        var emailInput = form.querySelector('[name="email"]');
        var messageInput = form.querySelector('[name="message"]');
        var botField = form.querySelector('[name="bot-field"]');

        if (botField && botField.value) return false;

        if (nameInput) {
            if (nameInput.value.trim().length < 2) {
                showError(nameInput, 'Podaj imie i nazwisko.');
                valid = false;
            } else {
                clearError(nameInput);
            }
        }

        if (emailInput) {
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Podaj poprawny adres e-mail.');
                valid = false;
            } else {
                clearError(emailInput);
            }
        }

        if (messageInput) {
            if (messageInput.value.trim().length < 20) {
                showError(messageInput, 'Wiadomosc jest zbyt krotka - minimum 20 znakow.');
                valid = false;
            } else {
                clearError(messageInput);
            }
        }

        return valid;
    }

    function setFormState(form, state) {
        var submitBtn = form.querySelector('[type="submit"]');
        var successEl = form.querySelector('.form-success');
        var errorEl = form.querySelector('.form-submit-error');

        if (state === 'loading') {
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysylanie...'; }
        } else if (state === 'success') {
            if (submitBtn) submitBtn.disabled = true;
            form.style.display = 'none';
            if (successEl) successEl.style.display = 'block';
            if (typeof window.trackFormSubmit === 'function') window.trackFormSubmit('contact');
        } else if (state === 'error') {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Wyslij wiadomosc'; }
            if (errorEl) errorEl.style.display = 'block';
        } else {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Wyslij wiadomosc'; }
        }
    }

    function submitNetlify(form) {
        var data = new FormData(form);

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString()
        })
            .then(function (response) {
                if (response.ok) {
                    setFormState(form, 'success');
                } else {
                    setFormState(form, 'error');
                }
            })
            .catch(function () {
                fallbackMailto(form);
            });
    }

    function fallbackMailto(form) {
        var nameInput = form.querySelector('[name="name"]');
        var emailInput = form.querySelector('[name="email"]');
        var messageInput = form.querySelector('[name="message"]');
        var budgetInput = form.querySelector('[name="budget"]');

        var subject = encodeURIComponent('Zapytanie o wspolprace - ' + (nameInput ? nameInput.value.trim() : ''));
        var body = encodeURIComponent(
            'Imie: ' + (nameInput ? nameInput.value.trim() : '') + '\n' +
            'Email: ' + (emailInput ? emailInput.value.trim() : '') + '\n' +
            'Budzet: ' + (budgetInput ? budgetInput.value : '') + '\n\n' +
            (messageInput ? messageInput.value.trim() : '')
        );

        window.location.href = 'mailto:mafi14@proton.me?subject=' + subject + '&body=' + body;
        setFormState(form, 'success');
    }

    function initForm() {
        var form = document.querySelector('.contact-form');
        if (!form) return;

        form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (input) {
            input.addEventListener('input', function () { clearError(input); });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!validateForm(form)) return;

            setFormState(form, 'loading');

            if (NETLIFY_ENABLED && form.getAttribute('data-netlify') === 'true') {
                submitNetlify(form);
            } else {
                setTimeout(function () { fallbackMailto(form); }, 400);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initForm);
})();
