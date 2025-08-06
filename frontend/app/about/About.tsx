// @AI-HINT: This is the About page root component, now refactored to use next-themes and modular CSS.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import styles from './About.module.css';

const About: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>About MegiLance</h1>
          <p className={styles.subtitle}>The Future of Freelancing, Powered by AI and Web3.</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p>Our mission is to create a transparent, efficient, and fair freelance marketplace. We leverage cutting-edge AI to match the right talent with the right projects, and utilize blockchain technology for secure, instant payments, eliminating the need for traditional intermediaries.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why MegiLance?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <h3>AI-Powered Matching</h3>
              <p>Our intelligent algorithms analyze project requirements and freelancer skills to create perfect matches, saving time and ensuring quality.</p>
            </div>
            <div className={styles.feature}>
              <h3>Decentralized Payments</h3>
              <p>With USDC on the blockchain, payments are fast, secure, and have lower fees. Funds are held in escrow and released automatically upon project completion.</p>
            </div>
            <div className={styles.feature}>
              <h3>Objective AI Ranking</h3>
              <p>We use a proprietary AI model to rank freelancers based on skill, performance, and reliability, providing clients with an unbiased measure of quality.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
