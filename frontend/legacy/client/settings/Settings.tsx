// @AI-HINT: This is the Settings page for client account management. All styles are per-component only. Now fully theme-switchable using global theme context.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import commonStyles from './Settings.common.module.css';
import lightStyles from './Settings.light.module.css';
import darkStyles from './Settings.dark.module.css';


interface SettingsProps {
}

type Tab = 'account' | 'password' | 'notifications';

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const [activeTab, setActiveTab] = useState<Tab>('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className={styles.settingsForm}>
            <Input label="Full Name" type="text" defaultValue="Emily Carter" />
            <Input label="Email Address" type="email" defaultValue="emily.carter@example.com" />
            <Input label="Company Name" type="text" defaultValue="Innovate Inc." />
            <Button variant="primary">Save Changes</Button>
          </div>
        );
      case 'password':
        return (
          <div className={styles.settingsForm}>
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button variant="primary">Update Password</Button>
          </div>
        );
      case 'notifications':
        return (
          <div className={styles.settingsForm}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Email me when a freelancer sends a proposal.
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Email me for project milestones and updates.
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              Receive weekly platform newsletters.
            </label>
            <Button variant="primary">Save Preferences</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.settingsContainer}>
        <header className={styles.settingsHeader}>
          <h1>Settings</h1>
          <p>Manage your account and preferences.</p>
        </header>

        <div className={styles.settingsLayout}>
          <nav className={styles.settingsNav}>
            <button
              onClick={() => setActiveTab('account')}
              className={activeTab === 'account' ? styles.active : ''}
              aria-current={activeTab === 'account' ? 'page' : undefined}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={activeTab === 'password' ? styles.active : ''}
              aria-current={activeTab === 'password' ? 'page' : undefined}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={activeTab === 'notifications' ? styles.active : ''}
              aria-current={activeTab === 'notifications' ? 'page' : undefined}
            >
              Notifications
            </button>
          </nav>
          <main className={styles.settingsContent}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
