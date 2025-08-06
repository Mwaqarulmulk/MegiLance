// @AI-HINT: This is the Settings page for client account management. All styles are per-component only. Now fully theme-switchable using global theme context.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import commonStyles from './Settings.common.module.css';
import lightStyles from './Settings.light.module.css';
import darkStyles from './Settings.dark.module.css';


interface SettingsProps {
}

type Tab = 'account' | 'password' | 'notifications';

const Settings: React.FC<SettingsProps> = () => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className={commonStyles['Settings-form']}>
            <Input label="Full Name" type="text" defaultValue="Emily Carter" />
            <Input label="Email Address" type="email" defaultValue="emily.carter@example.com" />
            <Input label="Company Name" type="text" defaultValue="Innovate Inc." />
            <Button variant="primary">Save Changes</Button>
          </div>
        );
      case 'password':
        return (
          <div className="Settings-form">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button variant="primary">Update Password</Button>
            <Input theme={theme} label="New Password" type="password" />
            <Input theme={theme} label="Confirm New Password" type="password" />
            <Button theme={theme} variant="primary">Update Password</Button>
          </div>
        );
      case 'notifications':
        return (
          <div className="Settings-form">
            <label className="Checkbox-label">
              <input type="checkbox" defaultChecked />
              Email me when a freelancer sends a proposal.
            </label>
            <label className="Checkbox-label">
              <input type="checkbox" defaultChecked />
              Email me for project milestones and updates.
            </label>
            <label className="Checkbox-label">
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
    <div className={`Settings Settings--${theme}`}>
      <div className="Settings-container">
        <header className="Settings-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences.</p>
        </header>

        <div className="Settings-layout">
          <nav className="Settings-nav">
            <button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>Account</button>
            <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? 'active' : ''}>Password</button>
            <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}>Notifications</button>
          </nav>
          <main className={`Settings-content Settings-content--${theme}`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
