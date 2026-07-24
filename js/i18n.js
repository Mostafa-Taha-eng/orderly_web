/**
 * Orderly â€” Simple i18n System
 */
const OrderlyI18n = (() => {
  const STORAGE_KEY = 'orderly-lang';
  const DEFAULT_LANG = 'ar';
  const LOCALE_VERSION = '4';

  const LANGUAGES = [
    { code: 'ar', name: 'ط§ظ„ط¹ط±ط¨ظٹط©', flag: 'ًں‡¸ًں‡¦' },
    { code: 'en', name: 'English', flag: 'ًں‡¬ًں‡§' },
    { code: 'fr', name: 'Franأ§ais', flag: 'ًں‡«ًں‡·' },
    { code: 'de', name: 'Deutsch', flag: 'ًں‡©ًں‡ھ' },
    { code: 'zh', name: 'ن¸­و–‡', flag: 'ًں‡¨ًں‡³' },
    { code: 'hi', name: 'à¤¹à¤؟à¤¨à¥چà¤¦à¥€', flag: 'ًں‡®ًں‡³' },
    { code: 'ru', name: 'ذ رƒرپرپذ؛ذ¸ذ¹', flag: 'ًں‡·ًں‡؛' },
    { code: 'it', name: 'Italiano', flag: 'ًں‡®ًں‡¹' }
  ];

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  let translations = {};

  function getBasePath() {
    const script = document.querySelector('script[src*="i18n.js"]');
    if (script?.src) {
      const url = new URL(script.src, window.location.href);
      return url.pathname.replace(/js\/i18n\.js.*$/i, '');
    }

    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    return lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '/';
  }

  function t(key) {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('data-i18n-placeholder')) {
        return;
      }
      el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    const pageKey = document.body.getAttribute('data-page');
    if (pageKey) {
      document.title = t(`meta.title_${pageKey}`);
    }

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    document.dispatchEvent(new CustomEvent('orderly:i18n-ready', {
      detail: { lang: currentLang }
    }));
  }

  function updateLangSwitcher() {
    const current = LANGUAGES.find((l) => l.code === currentLang);
    const label = document.querySelector('.lang-btn-label');
    if (label && current) {
      label.textContent = `${current.flag} ${current.name}`;
    }

    document.querySelectorAll('.lang-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  async function loadLanguage(lang) {
    const base = getBasePath();
    const url = `${base}locales/${lang}.json?v=${LOCALE_VERSION}`;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load locale: ${url}`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
      updateLangSwitcher();
    } catch (err) {
      console.error('i18n load error:', err);
      if (lang !== DEFAULT_LANG) await loadLanguage(DEFAULT_LANG);
    }
  }

  function buildLangDropdown() {
    const switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;

    const dropdown = switcher.querySelector('.lang-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = LANGUAGES.map(
      (l) =>
        `<button class="lang-option" data-lang="${l.code}" type="button">${l.flag} ${l.name}</button>`
    ).join('');

    dropdown.querySelectorAll('.lang-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        loadLanguage(btn.dataset.lang);
        switcher.classList.remove('open');
      });
    });
  }

  function initLangSwitcher() {
    const switcher = document.querySelector('.lang-switcher');
    const btn = document.querySelector('.lang-btn');
    if (!switcher || !btn) return;

    buildLangDropdown();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      switcher.classList.remove('open');
    });
  }

  async function init() {
    initLangSwitcher();
    await loadLanguage(currentLang);
  }

  return { init, t, loadLanguage, getCurrentLang: () => currentLang, LANGUAGES };
})();

window.OrderlyI18n = OrderlyI18n;

document.addEventListener('DOMContentLoaded', () => OrderlyI18n.init());
