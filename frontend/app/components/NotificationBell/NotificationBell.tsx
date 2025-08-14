// @AI-HINT: NotificationBell shows unread count and an accessible popover with recent notifications. Fully theme-aware and keyboard accessible.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './NotificationBell.common.module.css';
import light from './NotificationBell.light.module.css';
import dark from './NotificationBell.dark.module.css';

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  time?: string;
  read?: boolean;
};

interface NotificationBellProps {
  items: NotificationItem[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ items }) => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? dark : light;
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const unread = items.filter((i) => !i.read).length;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (open && panelRef.current && !panelRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      // Focus first focusable item inside panel
      const first = panelRef.current?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    } else {
      btnRef.current?.focus();
    }
  }, [open]);

  return (
    <div className={cn(common.root, styles.root)}>
      <button
        ref={btnRef}
        type="button"
        className={cn(common.button, styles.button)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notif-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={common.bell} aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className={common.badge} aria-label={`${unread} unread notifications`}>{unread}</span>
        )}
        <span className={common.srOnly}>Open notifications</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id="notif-panel"
          role="dialog"
          aria-label="Notifications"
          aria-modal="false"
          className={cn(common.panel, styles.panel)}
        >
          <div className={common.panelHeader}>Notifications</div>
          <ul className={common.list} role="list">
            {items.length === 0 && (
              <li className={common.empty}>You&apos;re all caught up.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className={cn(common.item, !n.read && common.itemUnread)}>
                {n.href ? (
                  <a href={n.href} className={cn(common.itemLink, styles.itemLink)}>
                    <div className={common.itemTitle}>{n.title}</div>
                    {n.description && <div className={common.itemDesc}>{n.description}</div>}
                    {n.time && <div className={common.itemTime}>{n.time}</div>}
                  </a>
                ) : (
                  <div className={common.itemBody}>
                    <div className={common.itemTitle}>{n.title}</div>
                    {n.description && <div className={common.itemDesc}>{n.description}</div>}
                    {n.time && <div className={common.itemTime}>{n.time}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
