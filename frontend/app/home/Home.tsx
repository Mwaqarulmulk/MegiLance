// @AI-HINT: Clean, focused Home page for MegiLance AI-powered freelancing platform.

'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import Hero from './components/Hero/Hero';
import TrustIndicators from './components/TrustIndicators';
import AIToolsHub from './components/AIToolsHub';
import Features from './components/Features';
import AIShowcase from './components/AIShowcase';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import { ScrollReveal } from '../components/Animations/ScrollReveal';

import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './Home.common.module.css';
import lightStyles from './Home.light.module.css';
import darkStyles from './Home.dark.module.css';

const Home: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.homePage, themeStyles.homePage)}>
        <main id="main-content" className={commonStyles.pageContent}>
          {/* Hero Section */}
          <section data-testid="hero-section" aria-labelledby="hero-title">
            <ScrollReveal width="100%" direction="none" duration={0.8}>
              <Hero />
            </ScrollReveal>
          </section>

          {/* Platform Visual Showcase — AI Deal Engine */}
          <section className={commonStyles.homeSection} aria-label="Platform AI deal engine visualization">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="up" delay={0.2}>
                <div style={{ textAlign: 'center', padding: '0 1rem 1rem' }}>
                  <Image
                    src="/images/hero/homepage-hero.png"
                    alt="MegiLance AI Deal Engine — AI-powered matching connects projects with top freelancers through smart contract escrow"
                    width={1100}
                    height={580}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
                    style={{ width: '100%', height: 'auto', maxWidth: '1100px', borderRadius: '24px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)', display: 'inline-block' }}
                  />
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className={commonStyles.homeSection} aria-label="Trust indicators">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" delay={0.2}>
                <TrustIndicators />
              </ScrollReveal>
            </div>
          </section>

          {/* AI Tools Hub */}
          <section id="ai-tools" className={commonStyles.homeSection} aria-label="AI tools hub">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="up" delay={0.1}>
                <AIToolsHub />
              </ScrollReveal>
            </div>
          </section>

          {/* Features */}
          <section id="features" className={commonStyles.homeSection} aria-label="Platform features">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="right">
                <Features />
              </ScrollReveal>
            </div>
          </section>

          {/* AI Showcase — AI services detail */}
          <section id="ai-services" className={commonStyles.homeSection} aria-label="AI services">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="left" delay={0.1}>
                <AIShowcase />
              </ScrollReveal>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className={commonStyles.homeSection} aria-label="How it works">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="left">
                <HowItWorks />
              </ScrollReveal>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className={commonStyles.homeSection} aria-label="User testimonials">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="up">
                <Testimonials />
              </ScrollReveal>
            </div>
          </section>
        </main>
    </div>
  );
};

export default Home;
