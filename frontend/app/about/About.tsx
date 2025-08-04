// @AI-HINT: This is the About page root component. All styles are per-component only. See About.common.css, About.light.css, and About.dark.css for theming.
'use client';

import React from 'react';
import './About.common.css';
import './About.light.css';
import './About.dark.css';

interface AboutProps {
  theme?: 'light' | 'dark';
}

const About: React.FC<AboutProps> = ({ theme = 'light' }) => {
  return (
    <div className={`About About--${theme}`}>
      <div className="About-container">
        <header className="About-header">
          <h1>About MegiLance</h1>
          <p>The Future of Freelancing, Powered by AI and Web3.</p>
        </header>

        <section className="About-section">
          <h2>Our Mission</h2>
          <p>Our mission is to create a transparent, efficient, and fair freelance marketplace. We leverage cutting-edge AI to match the right talent with the right projects, and utilize blockchain technology for secure, instant payments, eliminating the need for traditional intermediaries.</p>
        </section>

        <section className="About-section">
          <h2>Why MegiLance?</h2>
          <div className="About-features-grid">
            <div className="About-feature">
              <h3>AI-Powered Matching</h3>
              <p>Our intelligent algorithms analyze project requirements and freelancer skills to create perfect matches, saving time and ensuring quality.</p>
            </div>
            <div className="About-feature">
              <h3>Decentralized Payments</h3>
              <p>With USDC on the blockchain, payments are fast, secure, and have lower fees. Funds are held in escrow and released automatically upon project completion.</p>
            </div>
            <div className="About-feature">
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
