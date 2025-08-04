// @AI-HINT: This is the Pricing page root component. All styles are per-component only. See Pricing.common.css, Pricing.light.css, and Pricing.dark.css for theming.
'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import './Pricing.common.css';
import './Pricing.light.css';
import './Pricing.dark.css';

interface PricingProps {
  theme?: 'light' | 'dark';
}

const Pricing: React.FC<PricingProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Pricing Pricing--${theme}`}>
      <div className="Pricing-container">
        <header className="Pricing-header">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the plan that&apos;s right for you. All payments are secured via blockchain.</p>
        </header>

        <div className="Pricing-grid">
          <div className="Pricing-card">
            <h2>Freelancer</h2>
            <p className="Pricing-card-price">Free</p>
            <p className="Pricing-card-desc">For individuals looking for work.</p>
            <ul>
              <li>Create a profile</li>
              <li>Browse and apply for projects</li>
              <li>Receive secure USDC payments</li>
              <li>Benefit from AI Profile Ranking</li>
            </ul>
            <Link href="/signup">
              <Button theme={theme} variant="secondary" fullWidth>Get Started</Button>
            </Link>
          </div>

          <div className="Pricing-card popular">
            <div className="Pricing-card-badge">Most Popular</div>
            <h2>Client</h2>
            <p className="Pricing-card-price">5% <span className="Pricing-card-fee">Platform Fee</span></p>
            <p className="Pricing-card-desc">For businesses looking to hire top talent.</p>
            <ul>
              <li>Post unlimited jobs</li>
              <li>Access AI-vetted freelancers</li>
              <li>Secure project funding with smart contract escrow</li>
              <li>Provide AI-analyzed reviews</li>
            </ul>
            <Link href="/signup">
              <Button theme={theme} variant="primary" fullWidth>Post a Job</Button>
            </Link>
          </div>
        </div>

        <section className="Pricing-estimator-promo">
          <h2>Not Sure About Your Project&apos;s Cost?</h2>
          <p>Use our AI-powered price estimator to get a data-driven budget recommendation for your project based on its scope, complexity, and required skills.</p>
          <Link href="/ai/price-estimator">
            <Button theme={theme} variant="outline">Try the AI Estimator</Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
