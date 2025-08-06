// @AI-HINT: This component notifies the user when a new version of the PWA is available. All styles are per-component only.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import commonStyles from './UpdateNotification.common.module.css';
import lightStyles from './UpdateNotification.light.module.css';
import darkStyles from './UpdateNotification.dark.module.css';

// @AI-HINT: This component notifies the user when a new version of the PWA is available. It is fully theme-aware and uses CSS modules.

const UpdateNotification: React.FC = () => {
  const { theme } = useTheme();
  const [isUpdateAvailable, setUpdateAvailable] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setServiceWorkerRegistration(reg);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // The page will reload once the new service worker has taken control.
      window.location.reload();
    }
  };

  if (!isUpdateAvailable) {
    return null;
  }

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.updateNotification, themeStyles.themeWrapper)}>
      <div className={commonStyles.content}>
        <p className={commonStyles.text}>A new version is available!</p>
        <Button variant="secondary" size="small" onClick={handleUpdate}>Refresh</Button>
      </div>
    </div>
  );
};

export default UpdateNotification;
