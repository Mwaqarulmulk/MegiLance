// @AI-HINT: This component displays a banner to prompt users to install the PWA. All styles are per-component only.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import commonStyles from './InstallAppBanner.common.module.css';
import lightStyles from './InstallAppBanner.light.module.css';
import darkStyles from './InstallAppBanner.dark.module.css';

// @AI-HINT: This component displays a banner to prompt users to install the PWA. It is fully theme-aware and uses CSS modules.

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
      console.log('User accepted the PWA installation prompt');
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) {
    return null;
  }

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.installAppBanner, themeStyles.themeWrapper)}>
      <div className={commonStyles.content}>
        <p className={commonStyles.text}>Get the full MegiLance experience. Install the app on your device.</p>
        <Button variant="primary" onClick={handleInstallClick}>Install App</Button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
