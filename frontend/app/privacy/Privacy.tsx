// @AI-HINT: This is the Privacy Policy page root component. It uses shared legal page styles. All styles are per-component only.
'use client';

import React from 'react';
import '@/app/styles/LegalPage.common.css';
import '@/app/styles/LegalPage.light.css';
import '@/app/styles/LegalPage.dark.css';

interface PrivacyProps {
  theme?: 'light' | 'dark';
}

const Privacy: React.FC<PrivacyProps> = ({ theme = 'light' }) => {
  return (
    <div className={`LegalPage LegalPage--${theme}`}>
      <div className="LegalPage-container">
        <header className="LegalPage-header">
          <h1>Privacy Policy</h1>
          <p>Last Updated: August 4, 2025</p>
        </header>

        <section className="LegalPage-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, fill out a profile, or post a project. This may include your name, email address, skills, and portfolio information. We also collect information automatically, such as your IP address and usage data.</p>
        </section>

        <section className="LegalPage-section">
          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to operate and improve our platform, including to facilitate project matching, process payments, and personalize your experience. Our AI models may process your data to generate your freelancer rank and provide recommendations.</p>
        </section>

        <section className="LegalPage-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal data. We may share information between clients and freelancers as necessary to facilitate a project. We may also share information with third-party service providers for functions like analytics and infrastructure, under strict confidentiality agreements.</p>
        </section>

        <section className="LegalPage-section">
          <h2>4. Data Security</h2>
          <p>We take reasonable measures to protect your information from loss, theft, misuse, and unauthorized access. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%.</p>
        </section>

        {/* Add more sections as required */}
      </div>
    </div>
  );
};

export default Privacy;
