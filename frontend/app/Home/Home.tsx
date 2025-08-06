// @AI-HINT: This is the comprehensive Home page showcasing MegiLance's AI-powered freelancing platform with blockchain integration. Maximum scope implementation with premium sections.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import Hero from './components/Hero';
import Features from './components/Features';
import AIShowcase from './components/AIShowcase';
import BlockchainShowcase from './components/BlockchainShowcase';
import HowItWorks from './components/HowItWorks';
import GlobalImpact from './components/GlobalImpact';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';

import commonStyles from './Home.common.module.css';
import lightStyles from './Home.light.module.css';
import darkStyles from './Home.dark.module.css';

const Home: React.FC = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.homeContainer, themeStyles.home)}>
      {/* Navigation Header */}
      <header className={commonStyles.header}>
        <nav className={commonStyles.nav}>
          <div className={commonStyles.brandLink}>
            <Link href="/" className={commonStyles.brandLink}>
              <h1 className={commonStyles.brand}>MegiLance</h1>
            </Link>
          </div>
          <div className={commonStyles.navLinks}>
            <Link href="/how-it-works" className={commonStyles.navLink}>How It Works</Link>
            <Link href="/pricing" className={commonStyles.navLink}>Pricing</Link>
            <Link href="/about" className={commonStyles.navLink}>About</Link>
            <Link href="/blog" className={commonStyles.navLink}>Blog</Link>
            <Link href="/contact" className={commonStyles.navLink}>Contact</Link>
            <Link href="/Login" className={cn(commonStyles.navLink, commonStyles.navLinkPrimary)}>Sign In</Link>
          </div>
          <button onClick={toggleMenu} className={commonStyles.mobileMenuButton}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={cn(commonStyles.mobileNavMenu, isMenuOpen && commonStyles.mobileNavMenuActive)}>
        <Link href="/how-it-works" className={commonStyles.navLink}>How It Works</Link>
        <Link href="/pricing" className={commonStyles.navLink}>Pricing</Link>
        <Link href="/about" className={commonStyles.navLink}>About</Link>
        <Link href="/blog" className={commonStyles.navLink}>Blog</Link>
        <Link href="/contact" className={commonStyles.navLink}>Contact</Link>
        <Link href="/Login" className={cn(commonStyles.navLink, commonStyles.navLinkPrimary)}>Sign In</Link>
      </div>

      {/* Enhanced Hero Section with Animated Stats */}
      <Hero />

      {/* Core Platform Features */}
      <Features />

      {/* AI-Powered Capabilities Showcase */}
      <AIShowcase />

      {/* Blockchain & Crypto Payment Features */}
      <BlockchainShowcase />

      {/* How the Platform Works */}
      <HowItWorks />

      {/* Global Impact & Pakistani Focus */}
      <GlobalImpact />

      {/* User Testimonials */}
      <Testimonials />

      {/* Final Call-to-Action */}
      <CTA />

      {/* Footer */}
      <footer className={commonStyles.footer}>
        <div className={commonStyles.footerContainer}>
          <p>&copy; 2024 MegiLance. All rights reserved.</p>
          <div className={commonStyles.footerLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

