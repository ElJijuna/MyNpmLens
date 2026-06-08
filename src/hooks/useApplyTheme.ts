import { useEffect } from 'react';
import { useSettings } from '@/modules/settings/hooks';

function getHeaderbarColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--gnome-headerbar-bg-color')
    .trim();
}

function setThemeColor(theme: 'light' | 'dark' | 'system') {
  const existing = document.querySelectorAll('meta[name="theme-color"]');
  existing.forEach((el) => {
    el.remove();
  });

  const head = document.head;

  if (theme === 'system') {
    // Can't read both light and dark tokens simultaneously — use known hex values
    const light = document.createElement('meta');
    light.name = 'theme-color';
    light.content = '#ebebeb';
    light.media = '(prefers-color-scheme: light)';
    head.appendChild(light);

    const dark = document.createElement('meta');
    dark.name = 'theme-color';
    dark.content = '#303030';
    dark.media = '(prefers-color-scheme: dark)';
    head.appendChild(dark);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = getHeaderbarColor();
    head.appendChild(meta);
  }
}

export function useApplyTheme() {
  const { data: settings } = useSettings();
  const theme = settings?.theme ?? 'system';

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    setThemeColor(theme);
  }, [theme]);
}
