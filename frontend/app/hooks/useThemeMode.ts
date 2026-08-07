'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export type ThemeMode = 'light' | 'dark';

function getThemeFromDOM(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Detects the current theme by reading the <html> class set by the inline
 * theme-init script in layout.tsx. Unlike `useTheme()` from next-themes
 * which may return `undefined` during the first client render, this hook
 * always returns the correct value because it reads directly from the DOM
 * (the class is already applied before React hydrates).
 *
 * A MutationObserver keeps the value in sync when the user toggles the theme.
 */
export function useThemeMode(): ThemeMode {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    setMounted(true);
    setMode(getThemeFromDOM());
    const observer = new MutationObserver(() => {
      setMode(getThemeFromDOM());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [resolvedTheme]);

  return mounted ? mode : 'light';
}

/**
 * Returns the active CSS module style object (lightStyles vs darkStyles)
 * based on the current theme mode without hydration delay.
 */
export function useThemeStyles<T>(lightStyles: T, darkStyles: T): T {
  const mode = useThemeMode();
  return mode === 'dark' ? darkStyles : lightStyles;
}

/**
 * Returns true if the current theme is dark mode.
 */
export function useIsDarkMode(): boolean {
  const mode = useThemeMode();
  return mode === 'dark';
}

