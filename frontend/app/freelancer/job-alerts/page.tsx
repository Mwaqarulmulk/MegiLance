// @AI-HINT: This page allows freelancers to manage their job alerts. It's now fully theme-aware and uses our premium, reusable form components.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import Input from '@/app/components/Input/Input';
import Select, { SelectOption } from '@/app/components/Select/Select';
import commonStyles from './JobAlerts.common.module.css';
import lightStyles from './JobAlerts.light.module.css';
import darkStyles from './JobAlerts.dark.module.css';

// @AI-HINT: Mock data for existing job alerts.
const mockAlerts = [
  {
    id: 1,
    name: 'Solidity Developer Jobs',
    keywords: 'solidity, smart contract, evm',
    frequency: 'daily',
    isAiPowered: false,
  },
  {
    id: 2,
    name: 'Web3 UI/UX Design',
    keywords: 'web3, ui, ux, figma, design',
    frequency: 'weekly',
    isAiPowered: false,
  },
  {
    id: 3,
    name: 'AI Smart Alert',
    keywords: 'Based on your profile and application history',
    frequency: 'daily',
    isAiPowered: true,
  },
];

const frequencyOptions: SelectOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const JobAlertsPage: React.FC = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState(mockAlerts);

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const handleDelete = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Job Alerts</h1>
        <p className={styles.subtitle}>Never miss an opportunity. Get notified about jobs that match your skills.</p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create New Alert</h2>
          <form className={styles.form}>
            <Input
              id="alert-keywords"
              placeholder="Keywords (e.g., 'rust, defi')"
              aria-label="Alert keywords"
              title="Alert keywords"
              fullWidth
            />
            <Select
              id="alert-frequency"
              options={frequencyOptions}
              aria-label="Alert frequency"
              title="Alert frequency"
            />
            <Button variant="primary" title="Create alert">Create Alert</Button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Your Alerts</h2>
          <div className={styles.list}>
            {alerts.map(alert => (
              <div key={alert.id} className={styles.listItem}>
                <div className={styles.alertInfo}>
                  <span className={styles.alertName}>{alert.name}</span>
                  <span className={styles.alertKeywords}>{alert.keywords}</span>
                </div>
                <div className={styles.alertDetails}>
                  {alert.isAiPowered && <Badge variant="info">AI</Badge>}
                  <span className={styles.alertFrequency}>{alert.frequency}</span>
                  <div className={styles.alertActions}>
                    <Button variant="secondary" size="small" aria-label={`Edit ${alert.name}`} title={`Edit ${alert.name}`}>Edit</Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(alert.id)} aria-label={`Delete ${alert.name}`} title={`Delete ${alert.name}`}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <span className={styles.srOnly} aria-live="polite">You have {alerts.length} job alert{alerts.length === 1 ? '' : 's'}.</span>
        </div>
      </main>
    </div>
  );
};

export default JobAlertsPage;
