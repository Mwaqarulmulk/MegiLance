// @AI-HINT: This is the Onboarding page root component. It guides new users through setup. All styles are per-component only. See Onboarding.common.css, Onboarding.light.css, and Onboarding.dark.css for theming.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import './Onboarding.common.css';
import './Onboarding.light.css';
import './Onboarding.dark.css';

interface OnboardingProps {
  theme?: 'light' | 'dark';
}

const Onboarding: React.FC<OnboardingProps> = ({ theme = 'light' }) => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(prev => prev + 1);
  const finishOnboarding = () => {
    // Redirect to dashboard or another page
    console.log('Onboarding complete!');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="Onboarding-step">
            <h2>Welcome to MegiLance!</h2>
            <p>The AI-powered platform for the future of work. Let&apos;s get your profile set up.</p>
            <Button theme={theme} onClick={nextStep}>Get Started</Button>
          </div>
        );
      case 2:
        return (
          <div className="Onboarding-step">
            <h2>How Our AI Works For You</h2>
            <p>Our AI helps you find the perfect projects by analyzing your skills and ranking your profile. A higher rank means more visibility to clients!</p>
            <Button theme={theme} onClick={nextStep}>Next</Button>
          </div>
        );
      case 3:
        return (
          <div className="Onboarding-step">
            <h2>Connect Your Wallet</h2>
            <p>Securely connect your crypto wallet to receive USDC payments directly. All transactions are handled via smart contracts for your security.</p>
            {/* Placeholder for a WalletConnectButton component */}
            <Button theme={theme} onClick={finishOnboarding}>Connect Wallet & Finish</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`Onboarding Onboarding--${theme}`}>
      <div className="Onboarding-container">
        {renderStep()}
        <div className="Onboarding-progress">
          <div className={`Onboarding-progress-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`Onboarding-progress-dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`Onboarding-progress-dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
