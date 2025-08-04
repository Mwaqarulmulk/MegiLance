// @AI-HINT: This component displays a warning banner for potentially fraudulent activity. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './FraudAlertBanner.common.css';
import './FraudAlertBanner.light.css';
import './FraudAlertBanner.dark.css';

interface FraudAlertBannerProps {
  message: string;
}

const FraudAlertBanner: React.FC<FraudAlertBannerProps> = ({ message }) => {
  const { theme } = useTheme();

  return (
    <div className={`FraudAlertBanner FraudAlertBanner--${theme}`}>
      <div className="FraudAlertBanner-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 1.917l-9.423 16.333h18.846l-9.423-16.333zm0 3.833l6.438 11.167h-12.876l6.438-11.167zm-1 6.25h2v4h-2v-4zm0 5h2v2h-2v-2z"/>
        </svg>
      </div>
      <div className="FraudAlertBanner-content">
        <strong>Security Alert:</strong>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default FraudAlertBanner;
