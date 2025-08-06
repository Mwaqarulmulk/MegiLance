// @AI-HINT: This is the Navbar component entry point. All styles are per-component only. See Navbar.common.css, Navbar.light.css, and Navbar.dark.css for theming.
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';
import ProfileMenu from '@/app/components/ProfileMenu/ProfileMenu';
import type { ProfileMenuItem } from '@/app/components/ProfileMenu/ProfileMenu';
import ThemeSwitcher from '@/app/components/ThemeSwitcher/ThemeSwitcher';
import Input from '@/app/components/Input/Input';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import MegiLanceLogo from '../MegiLanceLogo/MegiLanceLogo';
import { cn } from '@/lib/utils';

import commonStyles from './Navbar.common.module.css';
import lightStyles from './Navbar.light.module.css';
import darkStyles from './Navbar.dark.module.css';

export interface NavItem {
  label: string;
  href: string;
}

export interface User {
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
  notificationCount: number;
}

export interface NavbarProps {
  navItems: NavItem[];
  profileMenuItems: ProfileMenuItem[];
  user: User;
}

const Navbar: React.FC<NavbarProps> = ({ navItems, profileMenuItems, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const noScrollClass = commonStyles.noScroll || 'no-scroll';
    if (isMobileMenuOpen) {
      document.body.classList.add(noScrollClass);
    } else {
      document.body.classList.remove(noScrollClass);
    }
    return () => {
      document.body.classList.remove(noScrollClass);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  if (!theme) return null;

  return (
    <header
      className={cn(
        commonStyles.navbar,
        themeStyles.navbar,
        isMobileMenuOpen && commonStyles.navbarMobileOpen
      )}
      role="banner"
    >
      <div className={cn(commonStyles.navbarContainer, themeStyles.navbarContainer)}>
        <div className={cn(commonStyles.navbarLeft, themeStyles.navbarLeft)}>
          <Link href="/dashboard" aria-label="Go to dashboard" className={cn(commonStyles.navbarLogo, themeStyles.navbarLogo)}>
            <MegiLanceLogo />
          </Link>
          <nav className={cn(commonStyles.desktopNav, themeStyles.desktopNav)} aria-label="Main navigation">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={cn(commonStyles.navLink, themeStyles.navLink)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={cn(commonStyles.navbarCenter, themeStyles.navbarCenter)}>
          <div className={cn(commonStyles.navbarSearch, themeStyles.navbarSearch, commonStyles.searchInput, themeStyles.searchInput)}>
            <FaSearch className={cn(commonStyles.searchIcon, themeStyles.searchIcon)} />
            <Input name="search" type="search" placeholder="Search..." />
          </div>
        </div>

        <div className={cn(commonStyles.navbarRight, themeStyles.navbarRight)}>
          <div className={cn(commonStyles.navbarActions, themeStyles.navbarActions)}>
            <ThemeSwitcher />
            <ProfileMenu
              userName={user.fullName}
              userEmail={user.email}
              menuItems={profileMenuItems}
            />
          </div>
          <div className={cn(commonStyles.mobileToggle, themeStyles.mobileToggle)}>
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className={cn(commonStyles.mobileToggleButton, themeStyles.mobileToggleButton)}
            >
              {isMobileMenuOpen ? <FaTimes className={cn(commonStyles.mobileToggleIcon, themeStyles.mobileToggleIcon)} /> : <FaBars className={cn(commonStyles.mobileToggleIcon, themeStyles.mobileToggleIcon)} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(commonStyles.mobileMenu, themeStyles.mobileMenu)}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className={cn(commonStyles.mobileNav, themeStyles.mobileNav)} aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={cn(commonStyles.mobileLink, themeStyles.mobileLink)} onClick={toggleMobileMenu}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
