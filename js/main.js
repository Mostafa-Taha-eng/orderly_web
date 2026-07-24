/**
 * Orderly — Main Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollEffects();
  initFaqAccordion();
  initScreenshotLightbox();
  initContactForms();
  initContactTabs();
  initBillingToggle();
  setActiveNavLink();
});

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.revealDelay || '0';
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  const selectors = [
    '.feature-card',
    '.role-card',
    '.problem-card',
    '.testimonial-card',
    '.step-item',
    '.pricing-card',
    '.value-card',
    '.download-card',
    '.team-card',
    '.social-contact-card',
    '.faq-item',
    '.shot-card',
    '.section-header'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach((el) => {
    el.classList.add('reveal');
    if (!el.dataset.revealDelay) {
      const siblingIndex = [...(el.parentElement?.children || [])].indexOf(el);
      el.dataset.revealDelay = String(Math.min(siblingIndex, 6) * 70);
    }
    observer.observe(el);
  });
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function initScreenshotLightbox() {
  const gallery = document.querySelector('.screenshots-gallery');
  if (!gallery) return;

  let overlay = document.querySelector('.shot-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'shot-lightbox';
    overlay.innerHTML = '<button type="button" class="shot-lightbox-close" aria-label="Close">×</button><img alt="">';
    document.body.appendChild(overlay);
  }

  const img = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.shot-lightbox-close');

  const close = () => overlay.classList.remove('open');

  gallery.querySelectorAll('.shot-card img').forEach((thumb) => {
    thumb.parentElement?.addEventListener('click', () => {
      img.src = thumb.src;
      img.alt = thumb.alt || '';
      overlay.classList.add('open');
    });
  });

  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function setActiveNavLink() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  const map = {
    home: 'index.html',
    about: 'about.html',
    aboutUs: 'about-us.html',
    pricing: 'pricing.html',
    contact: 'contact.html',
    privacy: 'privacy.html',
    terms: 'terms.html'
  };

  const current = map[page];
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (page === 'home' && (href === 'index.html' || href === './'))) {
      link.classList.add('active');
    }
  });
}

function initContactTabs() {
  const tabs = document.querySelectorAll('.contact-tab');
  const panels = document.querySelectorAll('.contact-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
}

function initContactForms() {
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const successMsg = form.querySelector('.form-success');
      if (successMsg) successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg?.classList.remove('show'), 5000);
    });
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('.form-group').forEach((group) => group.classList.remove('error'));

  form.querySelectorAll('[required], [data-min], [data-pattern]').forEach((input) => {
    const group = input.closest('.form-group');
    if (!group) return;

    const val = input.value.trim();
    const min = input.dataset.min ? parseInt(input.dataset.min, 10) : 0;
    const pattern = input.dataset.pattern ? new RegExp(input.dataset.pattern) : null;

    if (input.hasAttribute('required') && !val) {
      group.classList.add('error');
      valid = false;
    } else if (min && val.length < min) {
      group.classList.add('error');
      valid = false;
    } else if (pattern && val && !pattern.test(val)) {
      group.classList.add('error');
      valid = false;
    }
  });

  return valid;
}

function initBillingToggle() {
  const toggle = document.querySelector('.billing-toggle');
  if (!toggle) return;

  const monthlyLabel = document.querySelector('[data-billing="monthly"]');
  const yearlyLabel = document.querySelector('[data-billing="yearly"]');
  const amounts = document.querySelectorAll('[data-monthly][data-yearly]');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('yearly');
    const isYearly = toggle.classList.contains('yearly');

    monthlyLabel?.classList.toggle('active', !isYearly);
    yearlyLabel?.classList.toggle('active', isYearly);

    amounts.forEach((el) => {
      el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
    });
  });
}
