(function () {
  const theme = localStorage.getItem('orderly-theme');
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const lang = localStorage.getItem('orderly-lang') || 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
})();
