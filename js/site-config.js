/**
 * Orderly — Site configuration (edit for production)
 * Plain HTML static site — not Laravel.
 */
window.ORDERLY_SITE = Object.freeze({
  name: 'Orderly',
  tagline: 'Accounting system for online sellers',
  /** Production site origin without trailing slash. Leave empty to auto-detect. */
  url: '',
  /** Fallback used in sitemap.xml / static meta when origin unknown */
  defaultUrl: 'https://mostafa-taha-eng.github.io/orderly_web',
  author: 'Orderly',
  twitterHandle: '',
  ogImagePath: 'assets/logos/manager_logo.png',
  localeDefault: 'ar_EG',
  /** Placeholders — replace with real IDs when ready */
  analytics: {
    googleAnalyticsId: '', // e.g. G-XXXXXXXXXX
    googleSearchConsoleVerification: '', // meta verification content
    bingVerification: '',
    facebookAppId: ''
  },
  pages: {
    home: { file: 'index.html', changefreq: 'weekly', priority: '1.0', robots: 'index,follow' },
    about: { file: 'about.html', changefreq: 'monthly', priority: '0.8', robots: 'index,follow' },
    pricing: { file: 'pricing.html', changefreq: 'weekly', priority: '0.9', robots: 'index,follow' },
    contact: { file: 'contact.html', changefreq: 'monthly', priority: '0.7', robots: 'index,follow' },
    privacy: { file: 'privacy.html', changefreq: 'yearly', priority: '0.3', robots: 'index,follow' },
    terms: { file: 'terms.html', changefreq: 'yearly', priority: '0.3', robots: 'index,follow' }
  }
});
