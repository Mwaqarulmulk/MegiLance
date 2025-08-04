// @AI-HINT: This page explains the step-by-step process for both clients and freelancers on the platform.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import StepCard from '@/app/components/Public/StepCard/StepCard';
import './HowItWorksPage.common.css';
import './HowItWorksPage.light.css';
import './HowItWorksPage.dark.css';

// @AI-HINT: Using text/emoji for icons as placeholders. In a real app, use an icon library like react-icons.
const clientSteps = [
  {
    stepNumber: 1,
    title: 'Post a Job',
    description: 'Describe your project, set your budget, and post it for our global network of talent to see.',
    icon: <span>📝</span>,
  },
  {
    stepNumber: 2,
    title: 'Hire a Freelancer',
    description: 'Review proposals, check profiles, and hire the perfect freelancer for your needs. Fund the project via a secure smart contract.',
    icon: <span>🤝</span>,
  },
  {
    stepNumber: 3,
    title: 'Approve & Pay',
    description: 'Once you are satisfied with the work, approve the milestone, and the payment is released from the smart contract.',
    icon: <span>✅</span>,
  },
];

const freelancerSteps = [
  {
    stepNumber: 1,
    title: 'Create Your Profile',
    description: 'Showcase your skills, experience, and portfolio to attract high-quality clients from around the world.',
    icon: <span>👤</span>,
  },
  {
    stepNumber: 2,
    title: 'Find & Win Work',
    description: 'Browse jobs, send compelling proposals, and get hired for projects that match your expertise.',
    icon: <span>💼</span>,
  },
  {
    stepNumber: 3,
    title: 'Get Paid in Crypto',
    description: 'Complete the work, get milestone approval, and receive your payment instantly and securely in your crypto wallet.',
    icon: <span>💸</span>,
  },
];

const HowItWorksPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`HowItWorksPage-container HowItWorksPage-container--${theme}`}>
      <header className="HowItWorksPage-header">
        <h1 className="HowItWorksPage-title">How MegiLance Works</h1>
        <p className="HowItWorksPage-subtitle">A simple, secure, and decentralized way to get work done.</p>
      </header>

      <main className="HowItWorksPage-main">
        <section className="HowItWorksPage-section">
          <h2 className="HowItWorksPage-section-title">For Clients</h2>
          <div className="HowItWorksPage-grid">
            {clientSteps.map(step => <StepCard key={step.stepNumber} {...step} />)}
          </div>
        </section>

        <section className="HowItWorksPage-section">
          <h2 className="HowItWorksPage-section-title">For Freelancers</h2>
          <div className="HowItWorksPage-grid">
            {freelancerSteps.map(step => <StepCard key={step.stepNumber} {...step} />)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;
