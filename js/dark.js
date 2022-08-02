setTheme();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', function () {
  setTheme();
});

function setThemeLight() {
  localStorage.theme = 'light';
  setTheme();
}

function setThemeDark() {
  localStorage.theme = 'dark';
  setTheme();
}

function setThemePrefered() {
  localStorage.removeItem('theme');
  setTheme();
}

function setTheme() {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}