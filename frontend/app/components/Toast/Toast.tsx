// @AI-HINT: Premium, theme-aware Toast component with accessible roles, micro-interactions, and per-theme CSS modules.
'use client';

import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './Toast.common.module.css';
import lightStyles from './Toast.light.module.css';
import darkStyles from './Toast.dark.module.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  title?: string;
  description?: string;
  show: boolean;
  variant?: ToastVariant;
  onClose?: () => void;
  duration?: number; // ms
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  show,
  variant = 'info',
  onClose,
  duration = 4000,
  className = '',
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    if (!show || !duration || !onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  if (!theme) return null;

  const baseClassName = cn(
    commonStyles.toast,
    themeStyles.toast,
    commonStyles[variant],
    themeStyles[variant],
    show ? commonStyles.enter : commonStyles.exit,
    className,
  );

  const content = (
    <>
      <div className={cn(commonStyles.toastBody, themeStyles.toastBody)}>
        {title && <div className={cn(commonStyles.toastTitle, themeStyles.toastTitle)}>{title}</div>}
        {description && (
          <div className={cn(commonStyles.toastDescription, themeStyles.toastDescription)}>{description}</div>
        )}
      </div>
      {onClose && (
        <button
          className={cn(commonStyles.toastClose, themeStyles.toastClose)}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </>
  );

  if (variant === 'danger' || variant === 'warning') {
    return (
      <div role="alert" aria-live="assertive" aria-atomic="true" className={baseClassName}>
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={baseClassName}>
      {content}
    </div>
  );
};

export default Toast;
