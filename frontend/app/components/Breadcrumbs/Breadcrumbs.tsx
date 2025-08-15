'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { breadcrumbConfig } from '@/app/config/navigation';
import common from './Breadcrumbs.common.module.css';
import light from './Breadcrumbs.light.module.css';
import dark from './Breadcrumbs.dark.module.css';

const normalize = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  // Hooks must not be called conditionally. Compute crumbs first.
  const crumbs = useMemo(() => {
    if (!pathname) return [] as string[];
    // Use explicit map first
    if (breadcrumbConfig[pathname]) return breadcrumbConfig[pathname];
    // Fallback: build from segments
    const segments = pathname.split('?')[0].split('#')[0].split('/').filter(Boolean);
    const area = segments[0] && ['client','freelancer','admin'].includes(segments[0]) ? normalize(segments[0]) : 'Dashboard';
    const rest = segments.slice(1).map(normalize);
    return [area, ...rest];
  }, [pathname]);

  if (!theme) return null;
  const themed = theme === 'dark' ? dark : light;

  if (!crumbs || crumbs.length === 0) return null;

  return (
    <div className={cn(common.wrap, themed.wrap)}>
      <nav className={cn(common.nav)} aria-label="Breadcrumb">
        <span className={common.visuallyHidden}>You are here: </span>
        {crumbs.map((c, i) => (
          <React.Fragment key={`${c}-${i}`}>
            <span className={cn(common.crumb, themed.crumb)}>{c}</span>
            {i < crumbs.length - 1 && <span aria-hidden className={cn(common.sep, themed.sep)}>›</span>}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumbs;
