'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'sf-theme';
const CHANGE_EVENT = 'sf-theme-change';

const readTheme = (): Theme => {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'light';
  } catch {
    return 'light';
  }
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'system') {
    root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
};

const subscribe = (onChange: () => void) => {
  const handler = () => onChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
  };
};

const getSnapshot = readTheme;
const getServerSnapshot = (): Theme => 'light';

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label="Change theme"
      className="shrink-0 w-10 h-10 rounded-xl glass-flat glass-hover flex items-center justify-center text-[var(--foreground)] transition-colors"
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' ? <Moon size={18} /> : theme === 'system' ? <Monitor size={18} /> : <Sun size={18} />}
    </button>
  );
}
