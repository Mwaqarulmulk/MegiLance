'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import Hero from './components/Hero/Hero';
import PainSolutions from './components/PainSolutions/PainSolutions';
import TrustIndicators from './components/TrustIndicators';
import DashboardShowcase from './components/DashboardShowcase/DashboardShowcase';
import AIToolsHub from './components/AIToolsHub';
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

          {/* Interactive Interface Showcase */}
          <section className={commonStyles.homeSection} aria-label="Interactive dashboard showcase">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="up" delay={0.1}>
                <DashboardShowcase />
              </ScrollReveal>
            </div>
          </section>

          {/* Pain points → solutions (high-conversion value section) */}
          <section className={commonStyles.homeSection} aria-label="Why MegiLance — problems we solve">
            <div className={commonStyles.sectionContainer}>
              <ScrollReveal width="100%" direction="up" delay={0.1}>
                <PainSolutions />
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
