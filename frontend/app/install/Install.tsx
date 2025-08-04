// @AI-HINT: This is the PWA Install page root component. It prompts the user to install the app. All styles are per-component only.
'use client';

import React from 'react';
import Button from '@/app/components/Button/Button';
import './Install.common.css';
import './Install.light.css';
import './Install.dark.css';

interface InstallProps {
  theme?: 'light' | 'dark';
}

const Install: React.FC<InstallProps> = ({ theme = 'light' }) => {
  // In a real implementation, we would check if the app can be installed
  // and handle the beforeinstallprompt event.
  const handleInstallClick = () => {
    alert('PWA installation would be triggered here.');
  };

  return (
    <div className={`Install Install--${theme}`}>
      <div className="Install-container">
        <header className="Install-header">
          <h1>Install MegiLance</h1>
          <p>Get the best experience by installing the MegiLance app on your device.</p>
        </header>

        <div className="Install-features">
          <div className="Install-feature">
            <h3>Faster Access</h3>
            <p>Launch the app directly from your home screen.</p>
          </div>
          <div className="Install-feature">
            <h3>Offline Capabilities</h3>
            <p>Access key features even without an internet connection.</p>
          </div>
          <div className="Install-feature">
            <h3>Push Notifications</h3>
            <p>Stay updated on project updates and messages.</p>
          </div>
        </div>

        <Button theme={theme} variant="primary" onClick={handleInstallClick}>
          Install App
        </Button>
      </div>
    </div>
  );
};

export default Install;
