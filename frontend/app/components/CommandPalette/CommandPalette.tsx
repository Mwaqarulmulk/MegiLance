// @AI-HINT: CommandPalette provides a global searchable command menu (Cmd/Ctrl+K). Uses Modal and is ARIA-compliant.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Modal from '@/app/components/Modal/Modal';
import common from './CommandPalette.common.module.css';
import light from './CommandPalette.light.module.css';
import dark from './CommandPalette.dark.module.css';

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ items }) => {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? dark : light;
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => it.label.toLowerCase().includes(term) || (it.hint ?? '').toLowerCase().includes(term));
  }, [items, q]);

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Command Palette"
      size="large"
    >
      <div className={cn(common.root, styles.root)}>
        <div className={common.inputRow}>
          <input
            className={cn(common.input, styles.input)}
            type="text"
            placeholder="Search commands…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search commands"
            autoFocus
          />
          <div className={common.kbdHint} aria-hidden="true">
            <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd>
          </div>
        </div>
        <ul className={common.list} role="listbox" aria-label="Commands">
          {filtered.map((it) => (
            <li key={it.id} className={cn(common.item, styles.item)} role="option">
              <button
                type="button"
                className={cn(common.itemBtn, styles.itemBtn)}
                onClick={() => {
                  setOpen(false);
                  it.action();
                }}
              >
                <span className={common.itemLabel}>{it.label}</span>
                {it.hint && <span className={common.itemHint}>{it.hint}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className={common.empty} role="option" aria-disabled="true">No commands</li>
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default CommandPalette;
