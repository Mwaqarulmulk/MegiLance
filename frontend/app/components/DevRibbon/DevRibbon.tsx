// @AI-HINT: DevRibbon shows when dev auth bypass is enabled. It allows role switching and quick links for smoke testing.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDevAuth, DevRole } from '@/app/providers/DevAuthProvider';
import { useTheme } from 'next-themes';
import common from './DevRibbon.common.module.css';
import light from './DevRibbon.light.module.css';
import dark from './DevRibbon.dark.module.css';
import { cn } from '@/lib/utils';

const DevRibbon: React.FC = () => {
  const { enabled, user, setRole, logout } = useDevAuth();
  const router = useRouter();
  const { theme } = useTheme();

  if (!enabled) return null;

  const onChangeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as DevRole);
  };

  return (
    <div className={cn(common.root, theme === 'dark' ? dark.root : light.root)} aria-live="polite" aria-label="Development auth bypass enabled">
      <strong className={common.title}>Dev Auth Bypass</strong>
      <span className={common.label}>Role:</span>
      <select aria-label="Select dev role" value={user?.role ?? 'guest'} onChange={onChangeRole} className={common.select}>
        <option value="guest">Guest</option>
        <option value="client">Client</option>
        <option value="freelancer">Freelancer</option>
        <option value="admin">Admin</option>
      </select>
      <button className={common.link} onClick={() => router.push('/dashboard')}>Dashboard</button>
      <button className={common.link} onClick={() => router.push('/client')}>Client</button>
      <button className={common.link} onClick={() => router.push('/freelancer')}>Freelancer</button>
      <button className={common.link} onClick={() => router.push('/admin')}>Admin</button>
      <button className={common.link} onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default DevRibbon;
