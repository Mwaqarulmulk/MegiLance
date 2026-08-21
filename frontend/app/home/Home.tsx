'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import Hero from './components/Hero/Hero';
import GoalSelector from './components/GoalSelector';
import AIToolsHub from './components/AIToolsHub';
import ToolResultShowcase from './components/ToolResultShowcase';
import AIResultToWork from './components/AIResultToWork';
import PainSolutions from './components/PainSolutions/PainSolutions';
import TrustIndicators from './components/TrustIndicators';
import DashboardShowcase from './components/DashboardShowcase/DashboardShowcase';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import HomeFAQ from './components/HomeFAQ';
import HomeFinalCTA from './components/HomeFinalCTA';
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
        {/* 1. Hero Section (Canvas) */}
        <section data-testid="hero-section" aria-labelledby="hero-title" className={cn(commonStyles.sectionCanvas, themeStyles.sectionCanvas)}>
          <ScrollReveal width="100%" direction="none" duration={0.8}>
            <Hero />
          </ScrollReveal>
        </section>

        {/* 2. Choose Your Goal (Alt Surface) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Choose your goal">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <GoalSelector />
            </ScrollReveal>
          </div>
        </section>

        {/* 3. Popular Free AI Tools Hub (Canvas) */}
        <section id="ai-tools" className={cn(commonStyles.homeSection, commonStyles.sectionCanvas, themeStyles.sectionCanvas)} aria-label="Popular free AI tools">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <AIToolsHub />
            </ScrollReveal>
          </div>
        </section>

        {/* 4. Example AI Tool Result Showcase (Alt Surface) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Example AI tool result demonstration">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <ToolResultShowcase />
            </ScrollReveal>
          </div>
        </section>

        {/* 5. How an AI Result Becomes Real Work (Canvas) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionCanvas, themeStyles.sectionCanvas)} aria-label="How an AI result becomes real work">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <AIResultToWork />
            </ScrollReveal>
          </div>
        </section>

        {/* 6. For Clients & Freelancers — Solutions & Workrooms (Alt Surface) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Why MegiLance — solutions for clients and freelancers">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <PainSolutions />
            </ScrollReveal>
          </div>
        </section>

        {/* 7. Interactive Interface Showcase (Canvas) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionCanvas, themeStyles.sectionCanvas)} aria-label="Interactive dashboard showcase">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up" delay={0.1}>
              <DashboardShowcase />
            </ScrollReveal>
          </div>
        </section>

        {/* 8. Trust & Escrow Protection (Alt Surface) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Platform trust, security and escrow">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" delay={0.2}>
              <TrustIndicators />
            </ScrollReveal>
          </div>
        </section>

        {/* 9. How It Works (Canvas) */}
        <section id="how-it-works" className={cn(commonStyles.homeSection, commonStyles.sectionCanvas, themeStyles.sectionCanvas)} aria-label="How it works">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="left">
              <HowItWorks />
            </ScrollReveal>
          </div>
        </section>

        {/* 10. Verified Testimonials & Social Proof (Alt Surface) */}
        <section id="testimonials" className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Client and freelancer testimonials">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up">
              <Testimonials />
            </ScrollReveal>
          </div>
        </section>

        {/* 11. FAQ (Canvas) */}
        <section id="faq" className={cn(commonStyles.homeSection, commonStyles.sectionCanvas, themeStyles.sectionCanvas)} aria-label="Frequently asked questions">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up">
              <HomeFAQ />
            </ScrollReveal>
          </div>
        </section>

        {/* 12. Final CTA (Alt Surface / Highlight) */}
        <section className={cn(commonStyles.homeSection, commonStyles.sectionAlt, themeStyles.sectionAlt)} aria-label="Get started CTA">
          <div className={commonStyles.sectionContainer}>
            <ScrollReveal width="100%" direction="up">
              <HomeFinalCTA />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
