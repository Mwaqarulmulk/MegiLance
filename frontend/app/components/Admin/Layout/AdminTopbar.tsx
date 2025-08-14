"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './AdminTopbar.common.module.css';
import light from './AdminTopbar.light.module.css';
import dark from './AdminTopbar.dark.module.css';

interface Crumb { label: string; href?: string }
interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  right?: React.ReactNode; // actions area
  className?: string;
  sticky?: boolean; // enable sticky header with shadow on scroll
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ title, subtitle, breadcrumbs, right, className, sticky = true }) => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);
  return (
    <div
      className={cn(common.topbar, themed.topbar, sticky && common.sticky, scrolled && common.scrolled, className)}
      role="region"
      aria-label={`${title} header`}
    >
      <div className={common.left}>
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={common.breadcrumbs}>
            {breadcrumbs.map((c: Crumb, i: number) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${c.label}-${i}`}>
                  {c.href && !isLast ? (
                    <a className={common.crumb} href={c.href}>{c.label}</a>
                  ) : (
                    <span className={isLast ? common.crumbCurrent : common.crumb}>{c.label}</span>
                  )}
                  {!isLast && <span aria-hidden className={common.sep}>/</span>}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <div className={cn(common.title, themed.title)}>{title}</div>
        {subtitle && <div className={cn(common.subtitle, themed.subtitle)}>{subtitle}</div>}
      </div>
      {/* Desktop/right-side controls */}
      <div className={common.right}>
        {right}
      </div>
      {/* Small-screen overflow menu */}
      <div className={common.menuWrap} ref={menuRef}>
        <button
          type="button"
          className={common.menuBtn}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="More actions"
          onClick={() => setMenuOpen(o => !o)}
        >
          •••
        </button>
        <div className={cn(common.menu, !menuOpen && common.hidden)} role="menu" aria-label="Actions">
          {right}
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
