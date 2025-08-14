// @AI-HINT: AnnouncementBanner shows a global, dismissible message with theme-aware styles and ARIA semantics.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './AnnouncementBanner.common.module.css';
import light from './AnnouncementBanner.light.module.css';
import dark from './AnnouncementBanner.dark.module.css';

interface AnnouncementBannerProps {
  id: string; // unique id used for localStorage dismissal key
  message: React.ReactNode;
  cta?: { label: string; href: string };
}

const storageKey = (id: string) => `ml_announce_dismissed_${id}`;

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ id, message, cta }) => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? dark : light;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(storageKey(id));
    setOpen(!dismissed);
  }, [id]);

  const onClose = () => {
    try { window.localStorage.setItem(storageKey(id), '1'); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div role="region" aria-label="Site announcement" className={cn(common.root, styles.root)}>
      <div className={common.container}>
        <div className={common.message}>{message}</div>
        <div className={common.actions}>
          {cta && (
            <a className={cn(common.cta, styles.cta)} href={cta.href}>
              {cta.label}
            </a>
          )}
          <button type="button" className={cn(common.close, styles.close)} onClick={onClose} aria-label="Dismiss announcement">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
