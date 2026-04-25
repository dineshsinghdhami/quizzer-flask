  const html = document.documentElement;
  function setTheme(mode) {
    html.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }

  const currentTheme = localStorage.getItem('theme') || 'light';
  setTheme(currentTheme);
