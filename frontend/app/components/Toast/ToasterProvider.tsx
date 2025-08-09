// @AI-HINT: ToasterProvider exposes a global context to enqueue/dismiss toasts and renders a portal-based toast stack.
'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps, ToastVariant } from './Toast';
import styles from './Toast.stack.module.css';

export interface ToasterItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToasterContextValue {
  notify: (item: Omit<ToasterItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);
export const useToaster = () => {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error('useToaster must be used within <ToasterProvider>');
  return ctx;
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToasterItem[]>([]);

  const notify = useCallback((item: Omit<ToasterItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [{ id, ...item }, ...prev].slice(0, 6));
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToasterContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined'
        ? createPortal(
            <div className={styles.stack} aria-live="polite" aria-atomic="false">
              {items.map(({ id, title, description, variant = 'info', duration = 4000 }) => (
                <Toast
                  key={id}
                  title={title}
                  description={description}
                  variant={variant}
                  show={true}
                  duration={duration}
                  onClose={() => dismiss(id)}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToasterContext.Provider>
  );
};
