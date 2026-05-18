// @AI-HINT: Clean, focused Home page for MegiLance AI-powered freelancing platform.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import Hero from './components/Hero/Hero';
import TrustIndicators from './components/TrustIndicators';
import AIToolsHub from './components/AIToolsHub';
import Features from './components/Features';
import AIShowcase from './components/AIShowcase';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import { ScrollReveal } from '../components/Animations/ScrollReveal';

import { useMounted } from '@/app/hooks/useMounted';
import commonStyles from './Home.common.module.css';
import lightStyles from './Home.light.module.css';
import darkStyles from './Home.dark.module.css';

const Home: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const themeStyles = (mounted && resolvedTheme === 'dark') ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.homePage, themeStyles.homePage)}>
        <main id="main-content" className={commonStyles.pageContent}>
          {/* Hero Section */}
          <section data-testid="hero-section" aria-labelledby="hero-title">
            <ScrollReveal width="100%" direction="none" duration={0.8}>
              <Hero />
            </ScrollReveal>
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
