// @AI-HINT: This component notifies the user when a new version of the PWA is available. All styles are per-component only.
'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/Button/Button';
import { useTheme } from '@/app/contexts/ThemeContext';
import './UpdateNotification.common.css';
import './UpdateNotification.light.css';
import './UpdateNotification.dark.css';

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

  return (
    <div className={`UpdateNotification UpdateNotification--${theme}`}>
      <div className="UpdateNotification-content">
        <p>A new version is available!</p>
        <Button theme={theme} variant="secondary" onClick={handleUpdate}>Refresh</Button>
      </div>
    </div>
  );
};

export default UpdateNotification;
