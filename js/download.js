/**
 * Orderly — Mock / Real APK Downloads
 */
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

function getBasePath() {
  return '';
}

async function downloadApp(role, btn) {
  const base = getBasePath();
  const filename = `orderly-${role}.apk`;
  const apkPath = `${base}downloads/${filename}`;

  btn.disabled = true;
  btn.classList.add('downloading');

  try {
    const head = await fetch(apkPath, { method: 'HEAD' });
    if (head.ok) {
      triggerDownload(apkPath, filename);
      showDownloadFeedback(btn, 'done');
      return;
    }
  } catch (_) {
    /* real APK not available yet */
  }

  const placeholder = [
    'Orderly Mobile Application',
    `Role: ${role}`,
    '',
    'This is a placeholder file.',
    'Replace with the real APK in /downloads/ folder.',
    '',
    '© 2026 Orderly'
  ].join('\n');

  const blob = new Blob([placeholder], { type: 'application/vnd.android.package-archive' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
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
