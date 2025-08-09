// @AI-HINT: Notifications page under portal layout. Theme-aware, accessible, animated list with simple filters.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import common from './Notifications.common.module.css';
import light from './Notifications.light.module.css';
import dark from './Notifications.dark.module.css';

const ALL = 'All';
const CATEGORIES = [ALL, 'System', 'Messages', 'Billing'] as const;

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  category: (typeof CATEGORIES)[number] | 'All';
  time: string;
  unread?: boolean;
};

const items: NotificationItem[] = [
  { id: 'n1', title: 'New message from Alex', body: 'Can we review the proposal by tomorrow?', category: 'Messages', time: '2h ago', unread: true },
  { id: 'n2', title: 'Invoice paid', body: 'Your invoice INV-204 has been paid successfully.', category: 'Billing', time: 'Yesterday' },
  { id: 'n3', title: 'Security update', body: 'We have updated our security policy effective next week.', category: 'System', time: '2d ago' },
  { id: 'n4', title: 'Message from Priya', body: 'Shared design files for the sprint.', category: 'Messages', time: '3d ago' },
];

const Notifications: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { notify } = useToaster();
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>(ALL);
  const [notifs, setNotifs] = useState<NotificationItem[]>(items);
  const [status, setStatus] = useState<string>('');

  const filtered = useMemo(
    () => (selected === ALL ? notifs : notifs.filter((i) => i.category === selected)),
    [selected, notifs]
  );

  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const listVisible = useIntersectionObserver(listRef, { threshold: 0.1 });

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    setStatus('All notifications marked as read');
    notify({ title: 'Marked as read', description: 'All notifications are now read.', variant: 'success', duration: 2500 });
  };

  const clearAll = () => {
    setNotifs([]);
    setStatus('All notifications cleared');
    notify({ title: 'Notifications cleared', description: 'Your list is now empty.', variant: 'info', duration: 2500 });
  };

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    const n = notifs.find((x) => x.id === id);
    setStatus(n ? `${n.title} marked as read` : 'Notification marked as read');
    notify({ title: 'Marked read', description: n ? n.title : 'Notification', variant: 'success', duration: 2200 });
  };

  const archive = (id: string) => {
    const n = notifs.find((x) => x.id === id);
    setNotifs((prev) => prev.filter((x) => x.id !== id));
    setStatus(n ? `${n.title} archived` : 'Notification archived');
    notify({ title: 'Archived', description: n ? n.title : 'Notification archived', variant: 'info', duration: 2200 });
  };

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <h1 className={common.title}>Notifications</h1>
          <div className={common.filters} role="toolbar" aria-label="Filter notifications">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={common.chip}
                aria-pressed={selected === c}
                onClick={() => setSelected(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className={common.actionsBar} role="toolbar" aria-label="Notification actions">
            <button type="button" className={common.button} onClick={markAllRead}>Mark all read</button>
            <button type="button" className={cn(common.button, common.buttonSecondary)} onClick={clearAll}>Clear all</button>
            <p className={common.srOnly} aria-live="polite">{status}</p>
          </div>
        </div>

        {notifs.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
            action={
              <button
                type="button"
                className={common.button}
                onClick={() => notify({ title: 'All caught up', description: 'Nothing to review right now.', variant: 'info', duration: 2200 })}
              >
                Refresh
              </button>
            }
          />
        ) : (
          <div ref={listRef} className={cn(common.list, listVisible ? common.isVisible : common.isNotVisible)} role="list" aria-label="Notification list">
            {filtered.map((n) => (
              <div key={n.id} role="listitem" className={common.item}>
                <div>
                  <div className={common.itemHeader}>
                    <span className={common.dot} aria-hidden="true" />
                    <div>
                      <div className={common.itemTitle}>{n.title}</div>
                      <div className={common.meta}>{n.time} • {n.category}</div>
                    </div>
                  </div>
                  <div className={common.itemBody}>{n.body}</div>
                </div>
                <div className={common.actions} aria-label={`Actions for ${n.title}`}>
                  <button className={common.button} onClick={() => markRead(n.id)}>Mark read</button>
                  <button className={cn(common.button, common.buttonSecondary)} onClick={() => archive(n.id)}>Archive</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Notifications;
