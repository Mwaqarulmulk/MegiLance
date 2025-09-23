// @AI-HINT: This is the comprehensive Home page showcasing MegiLance's AI-powered freelancing platform with blockchain integration. Maximum scope implementation with premium sections.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import Hero from './components/Hero';
import ProductScreenshots from './components/ProductScreenshots';
import TrustIndicators from './components/TrustIndicators';


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
  // @AI-HINT: Scrollbar hidden on Home by using the page wrapper as the scroll container (see CSS module).

  return (
    <div className={cn(commonStyles.homePage, themeStyles.homePage)}>

        {/* Enhanced Hero Section with Animated Stats */}
        <section className={commonStyles.homeSection} aria-label="Hero">
          <div className={commonStyles.sectionContainer}>
            <Hero />
          </div>
        </section>
        
        {/* Product Screenshots Carousel */}
        <section className={commonStyles.homeSection} aria-label="Product screenshots">
          <div className={commonStyles.sectionContainer}>
            <ProductScreenshots />
          </div>
        </section>
        
        {/* Trust Indicators and Security Badges */}
        <section className={commonStyles.homeSection} aria-label="Trust indicators">
          <div className={commonStyles.sectionContainer}>
            <TrustIndicators />
          </div>
        </section>
        
        {/* Core Platform Features */}
        <section className={commonStyles.homeSection} aria-label="Core platform features">
          <div className={commonStyles.sectionContainer}>
            <Features />
          </div>
        </section>
        {/* AI-Powered Capabilities Showcase */}
        <section className={commonStyles.homeSection} aria-label="AI capabilities">
          <div className={commonStyles.sectionContainer}>
            <AIShowcase />
          </div>
        </section>
        {/* Blockchain & Crypto Payment Features */}
        <section className={commonStyles.homeSection} aria-label="Blockchain and crypto payments">
          <div className={commonStyles.sectionContainer}>
            <BlockchainShowcase />
          </div>
        </section>
        {/* How the Platform Works */}
        <section className={commonStyles.homeSection} aria-label="How it works">
          <div className={commonStyles.sectionContainer}>
            <HowItWorks />
          </div>
        </section>
        {/* Global Impact & Pakistani Focus */}
        <section className={commonStyles.homeSection} aria-label="Global impact">
          <div className={commonStyles.sectionContainer}>
            <GlobalImpact />
          </div>
        </section>
        {/* User Testimonials */}
        <section className={commonStyles.homeSection} aria-label="Testimonials">
          <div className={commonStyles.sectionContainer}>
            <Testimonials />
          </div>
        </section>
        {/* Final Call-to-Action */}
        <section className={commonStyles.homeSection} aria-label="Call to action">
          <div className={commonStyles.sectionContainer}>
            <CTA />
          </div>
        </section>

    </div>
  );
};

export default Home;