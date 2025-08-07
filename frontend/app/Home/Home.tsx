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


  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
  <div style={{ width: '100vw', overflowX: 'hidden' }}>
 
 
    <header className={commonStyles.header}>
      <nav className={commonStyles.nav}>
        <Link href="/" className={commonStyles.brandLink}>
          <span className={commonStyles.brand}>MegiLance</span>
        </Link>
        <div className={commonStyles.navLinks}>
          {/* Other nav items here if needed */}
          
        </div>
      </nav>
    </header>
    <main className={commonStyles.homeContainer}>
      {/* Enhanced Hero Section with Animated Stats */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Hero />
      </section>
      {/* Core Platform Features */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Features />
      </section>
      {/* AI-Powered Capabilities Showcase */}
      <section style={{ marginBottom: '3.5rem' }}>
        <AIShowcase />
      </section>
      {/* Blockchain & Crypto Payment Features */}
      <section style={{ marginBottom: '3.5rem' }}>
        <BlockchainShowcase />
      </section>
      {/* How the Platform Works */}
      <section style={{ marginBottom: '3.5rem' }}>
        <HowItWorks />
      </section>
      {/* Global Impact & Pakistani Focus */}
      <section style={{ marginBottom: '3.5rem' }}>
        <GlobalImpact />
      </section>
      {/* User Testimonials */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Testimonials />
      </section>
      {/* Final Call-to-Action */}
      <section>
        <CTA />
      </section>
    </main>
  </div>
);
};

export default Home;

