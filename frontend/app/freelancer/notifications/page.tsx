// @AI-HINT: Freelancer Notifications page. Interactive list with read/unread toggles and filters. Uses portal AppLayout shell (no public navbar/footer).
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import Tooltip from '@/app/components/Tooltip/Tooltip';
import Modal from '@/app/components/Modal/Modal';
import { cn } from '@/lib/utils';
import commonStyles from './Notifications.common.module.css';
import lightStyles from './Notifications.light.module.css';
import darkStyles from './Notifications.dark.module.css';

interface NotiItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
}

const mockNotis: NotiItem[] = [
  { id: 'N-1', title: 'Proposal Accepted', message: 'Your proposal for "Acme Website" was accepted.', time: '2h ago', read: false, type: 'success' },
  { id: 'N-2', title: 'Payment Received', message: 'You received $1,200 from Globex.', time: '1d ago', read: true, type: 'success' },
  { id: 'N-3', title: 'Milestone Due', message: 'Mobile App Onboarding milestone is due today.', time: '3d ago', read: false, type: 'warning' },
];

export default function Page() {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All'|'Unread'|'Read'>('All');
  const [items, setItems] = useState<NotiItem[]>(mockNotis);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const data = useMemo(() => {
    return items.filter((n) => {
      const matchQ = q.trim().length === 0 || n.title.toLowerCase().includes(q.toLowerCase()) || n.message.toLowerCase().includes(q.toLowerCase());
      const matchF = filter === 'All' || (filter === 'Unread' ? !n.read : n.read);
      return matchQ && matchF;
    });
  }, [q, filter, items]);

  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) => setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <div className={cn(commonStyles.container, styles.container)}>
      <header className={cn(commonStyles.header)}>
        <div>
          <h1 className={cn(commonStyles.title, styles.title)}>Notifications</h1>
          <p className={cn(commonStyles.subtitle, styles.subtitle)}>Stay on top of proposals, payments, and project events.</p>
        </div>
        <div className={cn(commonStyles.actions)}>
          <Tooltip text="Mark all notifications as read">
            <button onClick={markAllRead} className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)}>Mark all read</button>
          </Tooltip>
          <Tooltip text="Notification settings">
            <button onClick={() => setIsSettingsOpen(true)} className={cn(commonStyles.primaryBtn, styles.primaryBtn)}>Settings</button>
          </Tooltip>
        </div>
      </header>

      <div className={cn(commonStyles.controls)}>
        <input
          type="search"
          placeholder="Search notifications…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={cn(commonStyles.search, styles.search)}
          aria-label="Search notifications"
        />
        <div
          role="radiogroup"
          aria-label="Read filter"
          className={cn(commonStyles.radioGroup)}
          onKeyDown={(e) => {
            const options = ['All','Unread','Read'] as const;
            const idx = options.indexOf(filter);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const next = options[(idx + 1) % options.length];
              setFilter(next);
              (document.getElementById(`noti-filter-${next}`) as HTMLButtonElement | null)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prev = options[(idx - 1 + options.length) % options.length];
              setFilter(prev);
              (document.getElementById(`noti-filter-${prev}`) as HTMLButtonElement | null)?.focus();
            }
          }}
        >
          {(['All','Unread','Read'] as const).map((f) => (
            <button
              key={f}
              id={`noti-filter-${f}`}
              role="radio"
              aria-checked={filter === f ? true : false}
              onClick={() => setFilter(f)}
              className={cn(commonStyles.radio, styles.radio, filter === f && cn(commonStyles.radioActive, styles.radioActive))}
              tabIndex={filter === f ? 0 : -1}
              type="button"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ul className={cn(commonStyles.list, styles.list)}>
        {data.map((n) => (
          <li key={n.id} className={cn(commonStyles.card, styles.card, !n.read && styles.radioActive)}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                {!n.read && <span className={cn(commonStyles.badge, styles.badge)}>New</span>}
              </div>
              <p className={cn(styles.subtitle)}>{n.message}</p>
              <span className={cn(commonStyles.meta, styles.meta)}>{n.time}</span>
            </div>
            <div className={cn(commonStyles.itemActions)}>
              <Tooltip text={n.read ? 'Mark as unread' : 'Mark as read'}>
                <button onClick={() => toggleRead(n.id)} className={cn(commonStyles.iconBtn, styles.iconBtn)}>
                  {n.read ? 'Unread' : 'Read'}
                </button>
              </Tooltip>
              <Tooltip text="Dismiss notification">
                <button onClick={() => setItems((arr) => arr.filter((x) => x.id !== n.id))} className={cn(commonStyles.iconBtn, styles.iconBtn)}>Dismiss</button>
              </Tooltip>
            </div>
          </li>
        ))}
        {data.length === 0 && (
          <li className={cn(styles.subtitle)}>No notifications match your filters.</li>
        )}
      </ul>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Notification Settings"
        footer={(
          <div className={cn(commonStyles.footer, styles.footer)}>
            <button className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)} onClick={() => setIsSettingsOpen(false)}>Close</button>
            <button className={cn(commonStyles.primaryBtn, styles.primaryBtn)} onClick={() => setIsSettingsOpen(false)}>Save</button>
          </div>
        )}
      >
        <form className={cn(commonStyles.modalForm)} onSubmit={(e) => e.preventDefault()}>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="pref-email">Email Notifications</label>
            <select id="pref-email" className={cn(commonStyles.input, styles.input)} defaultValue="Enabled">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="pref-push">Push Notifications</label>
            <select id="pref-push" className={cn(commonStyles.input, styles.input)} defaultValue="Enabled">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
