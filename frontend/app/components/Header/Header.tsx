// @AI-HINT: This is the global Header component. It provides consistent navigation across the entire application and is fully theme-aware and responsive.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegiLanceLogo } from '@/app/components/MegiLanceLogo/MegiLanceLogo';

import commonStyles from './Header.common.module.css';
import lightStyles from './Header.light.module.css';
import darkStyles from './Header.dark.module.css';

const Header: React.FC = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <>
      <header className={cn(commonStyles.header, themeStyles.header)}>
        <nav className={commonStyles.nav}>
          <Link href="/" className={commonStyles.brandLink}>
            <MegiLanceLogo />
            <span className={commonStyles.brandName}>MegiLance</span>
          </Link>
          <div className={commonStyles.navLinks}>
            <Link href="/how-it-works" className={cn(commonStyles.navLink, themeStyles.navLink)}>How It Works</Link>
            <Link href="/pricing" className={cn(commonStyles.navLink, themeStyles.navLink)}>Pricing</Link>
            <Link href="/about" className={cn(commonStyles.navLink, themeStyles.navLink)}>About</Link>
            <Link href="/blog" className={cn(commonStyles.navLink, themeStyles.navLink)}>Blog</Link>
            <Link href="/contact" className={cn(commonStyles.navLink, themeStyles.navLink)}>Contact</Link>
            <Link href="/login" className={cn(commonStyles.navLink, commonStyles.signIn, themeStyles.signIn)}>Sign In</Link>
          </div>
          <button onClick={toggleMenu} className={cn(commonStyles.mobileMenuButton, themeStyles.mobileMenuButton)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>
      <div className={cn(commonStyles.mobileNavMenu, themeStyles.mobileNavMenu, isMenuOpen && commonStyles.mobileNavMenuActive)}>
        <Link href="/how-it-works" className={cn(commonStyles.navLink, themeStyles.navLink)}>How It Works</Link>
        <Link href="/pricing" className={cn(commonStyles.navLink, themeStyles.navLink)}>Pricing</Link>
        <Link href="/about" className={cn(commonStyles.navLink, themeStyles.navLink)}>About</Link>
        <Link href="/blog" className={cn(commonStyles.navLink, themeStyles.navLink)}>Blog</Link>
        <Link href="/contact" className={cn(commonStyles.navLink, themeStyles.navLink)}>Contact</Link>
        <Link href="/login" className={cn(commonStyles.navLink, commonStyles.signIn, themeStyles.signIn)}>Sign In</Link>
      </div>
    </>
  );
};

export default Header;
