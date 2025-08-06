// @AI-HINT: This is the Security page root component. It uses shared legal page styles. All styles are per-component only.
'use client';

import React from 'react';
import commonStyles from '@/app/styles/LegalPage.common.module.css';
import lightStyles from '@/app/styles/LegalPage.light.module.css';
import darkStyles from '@/app/styles/LegalPage.dark.module.css';

interface SecurityProps {
  theme?: 'light' | 'dark';
}

const Security: React.FC<SecurityProps> = ({ theme = 'light' }) => {
  return (
    <div className={`LegalPage LegalPage--${theme}`}>
      <div className="LegalPage-container">
        <header className="LegalPage-header">
          <h1>Security Overview</h1>
          <p>Last Updated: August 4, 2025</p>
        </header>

        <section className="LegalPage-section">
          <h2>1. Smart Contract Security</h2>
          <p>Our payment and escrow systems are built on audited smart contracts. All contracts undergo rigorous internal testing and multiple external audits from leading security firms before deployment. Audit reports are available upon request.</p>
        </section>

        <section className="LegalPage-section">
          <h2>2. Platform Security</h2>
          <p>We employ industry-standard security practices to protect our platform, including encryption of data in transit and at rest, regular security scans, and protection against common web vulnerabilities like XSS and CSRF.</p>
        </section>

        <section className="LegalPage-section">
          <h2>3. Account Protection</h2>
          <p>User accounts are protected with password hashing. We strongly recommend all users enable two-factor authentication (2FA) for an additional layer of security. You are responsible for the security of your own account credentials and connected wallets.</p>
        </section>

        <section className="LegalPage-section">
          <h2>4. Responsible Disclosure</h2>
          <p>If you discover a security vulnerability, please report it to us at security@megilance.com. We appreciate the community's help in keeping our platform safe and may offer bounties for valid, responsibly disclosed vulnerabilities.</p>
        </section>
      </div>
    </div>
  );
};

export default Security;
