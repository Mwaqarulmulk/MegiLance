// @AI-HINT: This is the Terms of Service page root component. All styles are per-component only. See Terms.common.css, Terms.light.css, and Terms.dark.css for theming.
'use client';

import React from 'react';
import '@/app/styles/LegalPage.common.css';
import '@/app/styles/LegalPage.light.css';
import '@/app/styles/LegalPage.dark.css';

interface TermsProps {
  theme?: 'light' | 'dark';
}

const Terms: React.FC<TermsProps> = ({ theme = 'light' }) => {
  return (
    <div className={`LegalPage LegalPage--${theme}`}>
      <div className="LegalPage-container">
        <header className="LegalPage-header">
          <h1>Terms of Service</h1>
          <p>Last Updated: August 4, 2025</p>
        </header>

        <section className="LegalPage-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using the MegiLance platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the platform.</p>
        </section>

        <section className="LegalPage-section">
          <h2>2. Platform Services</h2>
          <p>MegiLance provides a marketplace connecting clients and freelancers. We use AI for matching and ranking and blockchain for payments. We are not a party to any agreements entered into between clients and freelancers.</p>
        </section>

        <section className="LegalPage-section">
          <h2>3. User Obligations</h2>
          <p>You agree to provide accurate information, comply with all applicable laws, and not engage in any fraudulent or harmful activities on the platform. You are responsible for the security of your account and wallet.</p>
        </section>

        <section className="LegalPage-section">
          <h2>4. Payments and Fees</h2>
          <p>Clients agree to pay a 5% platform fee on all project payments. All payments are made in USDC and are held in a smart contract escrow until the project is completed to the client's satisfaction.</p>
        </section>

        <section className="LegalPage-section">
          <h2>5. Disclaimers</h2>
          <p>The platform is provided 'as is'. We make no warranties regarding the quality of services provided by freelancers or the accuracy of our AI-powered recommendations.</p>
        </section>

        {/* Add more sections as required */}
      </div>
    </div>
  );
};

export default Terms;
