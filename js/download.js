/**
 * Orderly — APK Downloads
 */
const APP_DOWNLOADS = {
  manager: { file: 'Manager.apk', name: 'Orderly-Manager.apk' },
  admin: { file: 'Admin.apk', name: 'Orderly-Admin.apk' },
  marketer: { file: 'Marketer.apk', name: 'Orderly-Marketer.apk' },
  warehouse: { file: 'communications stock.apk', name: 'Orderly-Stock-Comms.apk' }
};

document.addEventListener('DOMContentLoaded', () => {
  initDownloadButtons();
  initScrollToDownload();
});

function initScrollToDownload() {
  document.querySelectorAll('a[href="#download"], a[href="index.html#download"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const onHome = document.body.getAttribute('data-page') === 'home';
      const target = document.getElementById('download');

      if (onHome && target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (window.location.hash === '#download') {
    const target = document.getElementById('download');
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }
}

async function downloadApp(role, btn) {
  const app = APP_DOWNLOADS[role];
  if (!app) return;

  const href = `assets/apps/${encodeURIComponent(app.file)}`;

  btn.disabled = true;
  btn.classList.add('downloading');

  if (typeof OrderlyI18n !== 'undefined') {
    btn.textContent = OrderlyI18n.t('download.downloading');
  }

  try {
    const res = await fetch(href, { method: 'HEAD' });
    if (res.ok) {
      triggerDownload(href, app.name);
      showDownloadFeedback(btn, 'done');
      return;
    }
  } catch (_) {
    /* fall through to direct link attempt */
  }

  triggerDownload(href, app.name);
  showDownloadFeedback(btn, 'done');
}

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showDownloadFeedback(btn, state) {
  btn.classList.remove('downloading');
  if (state === 'done') {
    btn.classList.add('download-done');
    const original = btn.dataset.i18nOriginal || btn.textContent;
    btn.dataset.i18nOriginal = original;
    if (typeof OrderlyI18n !== 'undefined') {
      btn.textContent = OrderlyI18n.t('download.downloadDone');
    }
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('download-done');
      if (typeof OrderlyI18n !== 'undefined') {
        btn.textContent = OrderlyI18n.t('download.downloadBtn');
      } else {
        btn.textContent = original;
      }
    }, 2500);
  } else {
    btn.disabled = false;
  }
}

function initDownloadButtons() {
  document.querySelectorAll('.download-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      if (role) downloadApp(role, btn);
    });
  });
}
