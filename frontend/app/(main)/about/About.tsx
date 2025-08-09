// @AI-HINT: Premium About page with semantic main landmark, labeled sections, theme-aware styles, and micro-interactions.
'use client';
import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './About.common.module.css';
import light from './About.light.module.css';
import dark from './About.dark.module.css';

const About: React.FC = () => {
  const { theme } = useTheme();
  const t = theme === 'dark' ? dark : light;
  const styles = {
    root: cn(common.root, t.root),
    hero: cn(common.hero, t.hero),
    title: cn(common.title, t.title),
    subtitle: cn(common.subtitle, t.subtitle),
    grid: cn(common.grid, t.grid),
    card: cn(common.card, t.card),
    cardTitle: cn(common.cardTitle, t.cardTitle),
    cardBody: cn(common.cardBody, t.cardBody),
    sectionHeader: cn(common.sectionHeader, t.sectionHeader),
    sectionTitle: cn(common.sectionTitle, t.sectionTitle),
    sectionNote: cn(common.sectionNote, t.sectionNote),
    valuesGrid: cn(common.valuesGrid, t.valuesGrid),
    valueItem: cn(common.valueItem, t.valueItem),
    valueTitle: cn(common.valueTitle, t.valueTitle),
    valueDesc: cn(common.valueDesc, t.valueDesc),
    timeline: cn(common.timeline, t.timeline),
    milestone: cn(common.milestone, t.milestone),
    milestoneTitle: cn(common.milestoneTitle, t.milestoneTitle),
    cta: cn(common.cta, t.cta),
    ctaBtn: cn(common.ctaBtn, t.ctaBtn),
  };

  return (
    <main id="main-content" role="main" aria-labelledby="about-title" className={styles.root}>
      <header className={styles.hero}>
        <h1 id="about-title" className={styles.title}>About MegiLance</h1>
        <p className={styles.subtitle}>
          We’re building an investor‑grade, AI‑powered freelancing platform with secure payments, premium UX, and
          world‑class accessibility.
        </p>
      </header>

      <section aria-labelledby="mission-title">
        <div className={styles.sectionHeader}>
          <h2 id="mission-title" className={styles.sectionTitle}>Our Mission</h2>
          <span aria-hidden="true" className={styles.sectionNote}>Built for scale, designed for trust</span>
        </div>
        <div className={styles.grid}>
          <article className={styles.card} tabIndex={0} aria-labelledby="mission-ux-title">
            <h3 id="mission-ux-title" className={styles.cardTitle}>Delightful Experience</h3>
            <p className={styles.cardBody}>
              Every interaction is crafted with micro‑interactions, motion, and clarity to reduce friction and boost
              confidence.
            </p>
          </article>
          <article className={styles.card} tabIndex={0} aria-labelledby="mission-a11y-title">
            <h3 id="mission-a11y-title" className={styles.cardTitle}>Accessible by Design</h3>
            <p className={styles.cardBody}>
              Semantic landmarks, proper ARIA, keyboard navigation, and screen reader support are first‑class features.
            </p>
          </article>
          <article className={styles.card} tabIndex={0} aria-labelledby="mission-secure-title">
            <h3 id="mission-secure-title" className={styles.cardTitle}>Secure & Reliable</h3>
            <p className={styles.cardBody}>
              Enterprise‑ready architecture and secure payment foundations for clients and freelancers worldwide.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="values-title">
        <div className={styles.sectionHeader}>
          <h2 id="values-title" className={styles.sectionTitle}>Values</h2>
          <span aria-hidden="true" className={styles.sectionNote}>What guides our decisions</span>
        </div>
        <div className={styles.valuesGrid}>
          <article className={styles.valueItem} aria-labelledby="value-craft-title">
            <h3 id="value-craft-title" className={styles.valueTitle}>Craft</h3>
            <p className={styles.valueDesc}>Meticulous attention to detail with strong design systems and tokens.</p>
          </article>
          <article className={styles.valueItem} aria-labelledby="value-integrity-title">
            <h3 id="value-integrity-title" className={styles.valueTitle}>Integrity</h3>
            <p className={styles.valueDesc}>Transparent, fair, and respectful collaboration across all roles.</p>
          </article>
          <article className={styles.valueItem} aria-labelledby="value-performance-title">
            <h3 id="value-performance-title" className={styles.valueTitle}>Performance</h3>
            <p className={styles.valueDesc}>Fast, resilient, and consistent across devices and themes.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="timeline-title">
        <div className={styles.sectionHeader}>
          <h2 id="timeline-title" className={styles.sectionTitle}>Timeline</h2>
          <span aria-hidden="true" className={styles.sectionNote}>Milestones we’re delivering</span>
        </div>
        <div className={styles.timeline}>
          <article className={styles.milestone} aria-labelledby="ms-alpha-title">
            <h3 id="ms-alpha-title" className={styles.milestoneTitle}>Alpha</h3>
            <p>Core UI kits, accessibility, and theme parity across marketing and portals.</p>
          </article>
          <article className={styles.milestone} aria-labelledby="ms-beta-title">
            <h3 id="ms-beta-title" className={styles.milestoneTitle}>Beta</h3>
            <p>Complex workflows, collaboration features, and performance hardening.</p>
          </article>
          <article className={styles.milestone} aria-labelledby="ms-ga-title">
            <h3 id="ms-ga-title" className={styles.milestoneTitle}>General Availability</h3>
            <p>Investor‑grade polish across every surface and marketplace readiness.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="cta-title">
        <h2 id="cta-title" className={styles.sectionTitle}>Join the Journey</h2>
        <div className={styles.cta}>
          <button className={styles.ctaBtn} aria-label="Get started with MegiLance">
            Get Started
          </button>
          <span className={styles.sectionNote}>We’ll never spam you.</span>
        </div>
      </section>
    </main>
  );
};

export default About;
