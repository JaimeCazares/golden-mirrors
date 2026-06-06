function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('gestanut-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('gestanut-theme', 'dark');
  }
  _syncThemeIcon();
}

function _syncThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', _syncThemeIcon);
