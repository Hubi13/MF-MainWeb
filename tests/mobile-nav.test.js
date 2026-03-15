const test = require('node:test');
const assert = require('node:assert/strict');

function createClassList() {
  const classes = new Set();

  return {
    add(name) {
      classes.add(name);
    },
    remove(name) {
      classes.delete(name);
    },
    toggle(name, force) {
      if (typeof force === 'boolean') {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      }

      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }

      classes.add(name);
      return true;
    },
    contains(name) {
      return classes.has(name);
    },
  };
}

function createClickableElement() {
  return {
    listeners: {},
    addEventListener(type, handler) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(handler);
    },
  };
}

function createTestDocument() {
  const links = [createClickableElement(), createClickableElement()];
  const navList = {
    classList: createClassList(),
    querySelectorAll(selector) {
      return selector === 'a' ? links : [];
    },
  };

  const toggle = {
    dataset: {},
    listeners: {},
    attributes: { 'aria-expanded': 'false' },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    addEventListener(type, handler) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(handler);
    },
    click() {
      (this.listeners.click || []).forEach(function (handler) {
        handler({ type: 'click' });
      });
    },
  };

  const document = {
    body: {
      style: {},
    },
    querySelector(selector) {
      if (selector === '.nav-toggle') return toggle;
      if (selector === '.site-nav__list') return navList;
      return null;
    },
    addEventListener() {},
  };

  return { document, toggle, navList };
}

test('initMobileNav binds the toggle only once', function () {
  const { document, toggle, navList } = createTestDocument();
  const { initMobileNav } = require('../assets/js/main.js');

  assert.equal(typeof initMobileNav, 'function');

  initMobileNav(document);
  initMobileNav(document);

  assert.equal(toggle.listeners.click.length, 1);

  toggle.click();

  assert.equal(navList.classList.contains('is-open'), true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(document.body.style.overflow, 'hidden');
});
