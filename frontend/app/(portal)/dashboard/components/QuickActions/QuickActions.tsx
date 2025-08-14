'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './QuickActions.common.module.css';
import light from './QuickActions.light.module.css';
import dark from './QuickActions.dark.module.css';

const actions = [
  { id: 'post', label: 'Post a Job' },
  { id: 'review', label: 'Review Proposals' },
  { id: 'message', label: 'Open Messages' },
];

const QuickActions: React.FC = () => {
  const { theme } = useTheme();
  if (!theme) return null;
  const themed = theme === 'dark' ? dark : light;

  return (
    <section aria-label="Quick actions" className={cn(common.container)}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          className={cn(common.button, themed.button)}
          aria-label={a.label}
        >
          <span className={cn(common.label, themed.label)}>{a.label}</span>
        </button>
      ))}
    </section>
  );
};

export default QuickActions;
