// @AI-HINT: This component displays a banner to prompt users to install the PWA. All styles are per-component only.
'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/Button/Button';
import { useTheme } from '@/app/contexts/ThemeContext';
import './InstallAppBanner.common.css';
import './InstallAppBanner.light.css';
import './InstallAppBanner.dark.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

const InstallAppBanner: React.FC = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className={`InstallAppBanner InstallAppBanner--${theme}`}>
      <div className="InstallAppBanner-content">
        <p>Get the full MegiLance experience. Install the app on your device.</p>
        <Button theme={theme} variant="primary" onClick={handleInstallClick}>Install App</Button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
