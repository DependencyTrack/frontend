import { ref } from 'vue';
import { getStyle } from './utils';

const STORAGE_KEY = 'Theme';
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

export const resolvedTheme = ref(
  document.documentElement.getAttribute('data-bs-theme'),
);

// Reads resolvedTheme, so a computed property that calls this re-runs when the theme changes.
export function themeColor(property) {
  return resolvedTheme.value && getStyle(property);
}

export function getTheme() {
  const theme = localStorage.getItem(STORAGE_KEY);
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

function apply(theme) {
  const resolved =
    theme === 'system' ? (prefersLight.matches ? 'light' : 'dark') : theme;
  document.documentElement.setAttribute('data-bs-theme', resolved);
  resolvedTheme.value = resolved;
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  apply(theme);
}

export function followSystemTheme() {
  prefersLight.addEventListener('change', () => {
    if (getTheme() === 'system') {
      apply('system');
    }
  });
}
