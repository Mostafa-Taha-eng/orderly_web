/**
 * Orderly — Technical SEO, Open Graph, Twitter Cards, JSON-LD
 */
const OrderlySEO = (() => {
  const LOCALE_MAP = {
    ar: 'ar_EG',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE',
    zh: 'zh_CN',
    hi: 'hi_IN',
    ru: 'ru_RU',
    it: 'it_IT'
  };

  function site() {
    return window.ORDERLY_SITE || {};
  }

  function origin() {
    const cfg = site();
    if (cfg.url) return cfg.url.replace(/\/$/, '');
    if (typeof location !== 'undefined' && location.protocol.startsWith('http')) {
      return location.origin + (location.pathname.includes('/landing') ? '' : '');
    }
    return (cfg.defaultUrl || '').replace(/\/$/, '');
  }

  function basePath() {
    const script = document.querySelector('script[src*="seo.js"], script[src*="i18n.js"]');
    if (script?.src) {
      const url = new URL(script.src, window.location.href);
      return url.pathname.replace(/js\/[^/]+$/i, '');
    }
    const path = window.location.pathname;
    const lastSlash = path.lastIndexOf('/');
    return lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '/';
  }

  function absoluteUrl(path) {
    const o = origin();
    if (!path) return o + '/';
    if (/^https?:\/\//i.test(path)) return path;
    const clean = path.replace(/^\//, '');
    const base = basePath().replace(/^\//, '');
    // Prefer path relative to site root when using defaultUrl
    if (o && !location.protocol.startsWith('http')) {
      return `${o}/${clean}`;
    }
    try {
      return new URL(clean, location.href).href.split('#')[0];
    } catch {
      return `${o}/${clean}`;
    }
  }

  function pageKey() {
    return document.body?.getAttribute('data-page') || 'home';
  }

  function t(key) {
    if (typeof OrderlyI18n !== 'undefined') return OrderlyI18n.t(key);
    return key;
  }

  function upsertMeta(attr, key, content) {
    if (content == null || content === '') return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href, extra = {}) {
    if (!href) return;
    let el = document.head.querySelector(`link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ''}`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      if (extra.hreflang) el.setAttribute('hreflang', extra.hreflang);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function upsertJsonLd(id, data) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function pageMeta() {
    const key = pageKey();
    const title = t(`meta.title_${key}`);
    const description = t(`meta.desc_${key}`);
    const keywords = t(`meta.keywords_${key}`);
    const pageCfg = (site().pages || {})[key] || {};
    const file = pageCfg.file || 'index.html';
    const url = absoluteUrl(file === 'index.html' ? '' : file);
    const image = absoluteUrl(site().ogImagePath || 'assets/logos/manager_logo.png');
    const lang = typeof OrderlyI18n !== 'undefined' ? OrderlyI18n.getCurrentLang() : 'ar';
    const robots = pageCfg.robots || 'index,follow';

    return { key, title, description, keywords, url, image, lang, robots, file };
  }

  function applyBasicMeta(m) {
    document.title = m.title;
    upsertMeta('name', 'description', m.description);
    if (m.keywords && !m.keywords.startsWith('meta.')) {
      upsertMeta('name', 'keywords', m.keywords);
    }
    upsertMeta('name', 'author', site().author || site().name || 'Orderly');
    upsertMeta('name', 'robots', m.robots);
    upsertMeta('name', 'googlebot', m.robots);
    upsertMeta('name', 'language', m.lang);
    upsertMeta('http-equiv', 'content-language', m.lang);
    upsertMeta('name', 'theme-color', '#2A4ECA');
    upsertMeta('name', 'referrer', 'strict-origin-when-cross-origin');
    upsertMeta('name', 'format-detection', 'telephone=no');

    const analytics = site().analytics || {};
    if (analytics.googleSearchConsoleVerification) {
      upsertMeta('name', 'google-site-verification', analytics.googleSearchConsoleVerification);
    }
    if (analytics.bingVerification) {
      upsertMeta('name', 'msvalidate.01', analytics.bingVerification);
    }
  }

  function applyOpenGraph(m) {
    const locale = LOCALE_MAP[m.lang] || 'ar_EG';
    const cfg = site();
    upsertMeta('property', 'og:title', m.title);
    upsertMeta('property', 'og:description', m.description);
    upsertMeta('property', 'og:image', m.image);
    upsertMeta('property', 'og:url', m.url);
    upsertMeta('property', 'og:type', m.key === 'home' ? 'website' : 'article');
    upsertMeta('property', 'og:site_name', site().name || 'Orderly');
    upsertMeta('property', 'og:locale', locale);
    upsertMeta('property', 'og:image:alt', `${site().name || 'Orderly'} — ${m.title}`);
    if (cfg.ogImageWidth) upsertMeta('property', 'og:image:width', String(cfg.ogImageWidth));
    if (cfg.ogImageHeight) upsertMeta('property', 'og:image:height', String(cfg.ogImageHeight));
  }

  function applyTwitter(m) {
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', m.title);
    upsertMeta('name', 'twitter:description', m.description);
    upsertMeta('name', 'twitter:image', m.image);
    upsertMeta('name', 'twitter:image:alt', `${site().name || 'Orderly'} — ${m.title}`);
    if (site().twitterHandle) {
      upsertMeta('name', 'twitter:site', site().twitterHandle);
    }
  }

  function applyCanonical(m) {
    upsertLink('canonical', m.url);
    const pages = site().pages || {};
    Object.keys(pages).forEach((key) => {
      const file = pages[key].file;
      const href = absoluteUrl(file === 'index.html' ? '' : file);
      // Single-language site with client i18n — point hreflang to same URLs
      upsertLink('alternate', href, { hreflang: 'x-default' });
    });
  }

  function buildSchemas(m) {
    const orgId = `${origin()}/#organization`;
    const websiteId = `${origin()}/#website`;
    const name = site().name || 'Orderly';

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': orgId,
      name,
      url: origin() + '/',
      logo: absoluteUrl(site().ogImagePath || 'assets/logos/manager_logo.png'),
      sameAs: []
    };

    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name,
      url: origin() + '/',
      inLanguage: Object.keys(LOCALE_MAP),
      publisher: { '@id': orgId },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin()}/index.html#faq`,
        'query-input': 'required name=search_term_string'
      }
    };

    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': m.url + '#webpage',
      url: m.url,
      name: m.title,
      description: m.description,
      isPartOf: { '@id': websiteId },
      inLanguage: m.lang,
      primaryImageOfPage: m.image
    };

    const software = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EGP',
        description: t('meta.desc_pricing')
      },
      description: t('meta.desc_home')
    };

    const crumbs = [
      { name: t('nav.home'), item: absoluteUrl('') }
    ];
    if (m.key !== 'home') {
      crumbs.push({ name: m.title, item: m.url });
    }
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.item
      }))
    };

    upsertJsonLd('ld-organization', organization);
    upsertJsonLd('ld-website', website);
    upsertJsonLd('ld-webpage', webpage);
    upsertJsonLd('ld-breadcrumb', breadcrumb);

    if (m.key === 'home' || m.key === 'pricing') {
      upsertJsonLd('ld-software', software);
    }

    if (m.key === 'home') {
      const faqItems = [];
      for (let i = 1; i <= 14; i++) {
        const q = t(`faq.q${i}`);
        const a = t(`faq.a${i}`);
        if (!q.startsWith('faq.') && !a.startsWith('faq.')) {
          faqItems.push({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a }
          });
        }
      }
      if (faqItems.length) {
        upsertJsonLd('ld-faq', {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems
        });
      }
    }
  }

  function apply() {
    if (!document.head) return;
    const m = pageMeta();
    if (!m.title || m.title.startsWith('meta.')) return;
    applyBasicMeta(m);
    applyOpenGraph(m);
    applyTwitter(m);
    applyCanonical(m);
    buildSchemas(m);
  }

  function init() {
    document.addEventListener('orderly:i18n-ready', apply);
    if (typeof OrderlyI18n !== 'undefined' && OrderlyI18n.getCurrentLang) {
      // i18n may already be ready
      setTimeout(apply, 0);
    }
  }

  return { init, apply, absoluteUrl, origin };
})();

window.OrderlySEO = OrderlySEO;
document.addEventListener('DOMContentLoaded', () => OrderlySEO.init());
