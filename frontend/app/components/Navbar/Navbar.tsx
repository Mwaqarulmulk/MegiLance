// @AI-HINT: This is the Navbar component entry point. All styles are per-component only. See Navbar.common.css, Navbar.light.css, and Navbar.dark.css for theming.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';
import ProfileMenu from '@/app/components/ProfileMenu/ProfileMenu';
import type { ProfileMenuItem } from '@/app/components/ProfileMenu/ProfileMenu';
import ThemeSwitcher from '@/app/components/ThemeSwitcher/ThemeSwitcher';
import Input from '@/app/components/Input/Input';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { MegiLanceLogo } from '../Public/MegiLanceLogo';

import './Navbar.common.css';
import './Navbar.light.css';
import './Navbar.dark.css';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  navItems: NavItem[];
  profileMenuItems: ProfileMenuItem[];
  userName: string;
  userEmail?: string;
}

const Navbar: React.FC<NavbarProps> = ({ navItems, profileMenuItems, userName, userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const toggleMobileMenu = () => {
    const newMenuState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newMenuState);
    if (newMenuState) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  };

  return (
    <header className={`Navbar ${isMobileMenuOpen ? 'Navbar-mobile-open' : ''}`} role="banner">
      <div className="Navbar-container">
        <div className="Navbar-left">
          <Link href="/dashboard" aria-label="Go to dashboard" className="Navbar-logo">
            <MegiLanceLogo />
          </Link>
          <nav className="Navbar-desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="Navbar-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="Navbar-center">
          <div className="Navbar-search">
            <FaSearch className="Navbar-search-icon" />
            <Input name="search" type="search" placeholder="Search..." />
          </div>
        </div>

        <div className="Navbar-right">
          <div className="Navbar-actions">
            <ThemeSwitcher />
            <ProfileMenu
              theme={theme}
              userName={userName}
              userEmail={userEmail}
              menuItems={profileMenuItems}
            />
          </div>
          <div className="Navbar-mobile-toggle">
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" className="Navbar-mobile-menu" aria-hidden={!isMobileMenuOpen}>
        <nav className="Navbar-mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="Navbar-mobile-link" onClick={toggleMobileMenu}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
