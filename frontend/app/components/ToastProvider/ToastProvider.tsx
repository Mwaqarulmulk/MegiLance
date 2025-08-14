/* @AI-HINT: ToastProvider supplies accessible, theme-aware toasts across the app. It uses ARIA live regions and per-component CSS modules (common, light, dark). */
"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './ToastProvider.common.module.css';
import lightStyles from './ToastProvider.light.module.css';
import darkStyles from './ToastProvider.dark.module.css';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  durationMs?: number;
};

type ToastContextValue = {
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

const genId = () => Math.random().toString(36).slice(2, 9);

const ToastProvider: React.FC<{ children?: React.ReactNode }>= ({ children }) => {
  const { theme } = useTheme();
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const styles = React.useMemo(() => ({
    viewport: cn(commonStyles.viewport, themeStyles.viewport),
    toast: cn(commonStyles.toast, themeStyles.toast),
    title: cn(commonStyles.title, themeStyles.title),
    desc: cn(commonStyles.desc, themeStyles.desc),
  }), [themeStyles]);

  const add: ToastContextValue['add'] = React.useCallback((t) => {
    const id = genId();
    const toast: Toast = { id, durationMs: 4000, variant: 'default', ...t };
    setToasts((prev) => [...prev, toast]);
    if (toast.durationMs && toast.durationMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, toast.durationMs);
    }
  }, []);

  const remove: ToastContextValue['remove'] = React.useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = React.useMemo(() => ({ add, remove }), [add, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* ARIA live region to announce new toasts to assistive tech */}
      <div className={styles.viewport} aria-live="polite" aria-atomic="false" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={cn(styles.toast, t.variant && commonStyles[`v_${t.variant}`])} role="group" aria-label="Notification">
            {t.title && <div className={styles.title}>{t.title}</div>}
            {t.description && <div className={styles.desc}>{t.description}</div>}
            <button className={commonStyles.closeBtn} aria-label="Dismiss notification" onClick={() => remove(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
