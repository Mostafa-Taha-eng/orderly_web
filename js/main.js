/**
 * Orderly — Main Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollEffects();
  initFaqAccordion();
  initScreenshotCarousel();
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
    '.shots-carousel',
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

function initScreenshotCarousel() {
  const carousel = document.querySelector('.shots-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.shots-track');
  const slides = [...carousel.querySelectorAll('.shot-slide')];
  const prevBtn = carousel.querySelector('.shots-prev');
  const nextBtn = carousel.querySelector('.shots-next');
  const viewport = carousel.querySelector('.shots-viewport');
  if (!track || !slides.length || !viewport) return;

  let index = 0;
  let slideStep = 0;
  let visibleCount = 1;
  let pageCount = 1;

  let overlay = document.querySelector('.shot-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'shot-lightbox';
    overlay.innerHTML = `
      <button type="button" class="shot-lightbox-close" aria-label="Close">×</button>
      <button type="button" class="shot-lightbox-arrow shot-lightbox-prev" aria-label="Previous">‹</button>
      <div class="shot-lightbox-stage">
        <div class="shot-lightbox-frame">
          <img alt="">
        </div>
        <span class="shot-lightbox-counter"></span>
      </div>
      <button type="button" class="shot-lightbox-arrow shot-lightbox-next" aria-label="Next">›</button>
    `;
    document.body.appendChild(overlay);
  }

  const lightboxImg = overlay.querySelector('img');
  const lightboxClose = overlay.querySelector('.shot-lightbox-close');
  const lightboxPrev = overlay.querySelector('.shot-lightbox-prev');
  const lightboxNext = overlay.querySelector('.shot-lightbox-next');
  const lightboxCounter = overlay.querySelector('.shot-lightbox-counter');

  let lightboxIndex = 0;

  function renderLightbox() {
    const slide = slides[lightboxIndex];
    const img = slide?.querySelector('img');
    if (!img || !lightboxImg) return;
    lightboxImg.style.opacity = '0';
    window.requestAnimationFrame(() => {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      lightboxImg.style.opacity = '1';
    });
    if (lightboxCounter) {
      lightboxCounter.textContent = `${lightboxIndex + 1} / ${slides.length}`;
    }
  }

  function openLightbox(slideIndex) {
    lightboxIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    renderLightbox();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lightboxStep(dir) {
    lightboxIndex = (lightboxIndex + dir + slides.length) % slides.length;
    renderLightbox();
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => lightboxStep(-1));
  lightboxNext?.addEventListener('click', () => lightboxStep(1));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('shot-lightbox-stage')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxStep(-1);
    if (e.key === 'ArrowRight') lightboxStep(1);
  });

  function getMaxIndex() {
    return Math.max(0, pageCount - 1);
  }

  function measure() {
    const slide = slides[0];
    if (!slide) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 20;
    slideStep = slide.offsetWidth + gap;
    visibleCount = Math.max(1, Math.floor((viewport.offsetWidth + gap) / slideStep));
    pageCount = Math.max(1, slides.length - visibleCount + 1);

    index = Math.min(index, getMaxIndex());
    update(false);
  }

  function update(animate = true) {
    track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    track.style.transform = `translateX(${-index * slideStep}px)`;
    prevBtn?.toggleAttribute('disabled', index <= 0);
    nextBtn?.toggleAttribute('disabled', index >= getMaxIndex());
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, getMaxIndex()));
    update();
  }

  function step(dir) {
    goTo(index + dir);
  }

  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  let startX = 0;
  let dragging = false;
  let moved = false;
  let pressedPhone = null;

  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    pressedPhone = e.target.closest('.shot-phone');
    track.setPointerCapture(e.pointerId);
    track.style.transition = 'none';
  });

  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 8) moved = true;

    const minX = -getMaxIndex() * slideStep;
    const maxX = 0;
    let offset = -index * slideStep + delta;
    offset = Math.max(minX, Math.min(maxX, offset));
    track.style.transform = `translateX(${offset}px)`;
  });

  track.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const delta = e.clientX - startX;
    const phone = pressedPhone;
    pressedPhone = null;

    if (moved && Math.abs(delta) > 40) {
      step(delta > 0 ? -1 : 1);
      return;
    }

    update();

    if (!moved && phone) {
      const slideIndex = slides.indexOf(phone.closest('.shot-slide'));
      if (slideIndex >= 0) openLightbox(slideIndex);
    }
  });

  track.addEventListener('pointercancel', () => {
    dragging = false;
    moved = false;
    pressedPhone = null;
    update();
  });

  slides.forEach((slide, i) => {
    const phone = slide.querySelector('.shot-phone');
    if (!phone) return;
    phone.setAttribute('role', 'button');
    phone.setAttribute('tabindex', '0');
    phone.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openLightbox(i);
    });
  });

  window.addEventListener('resize', () => measure());
  measure();
}

function setActiveNavLink() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  const map = {
    home: 'index.html',
    about: 'about.html',
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
