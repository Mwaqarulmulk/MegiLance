// @AI-HINT: This is the Settings page for clients, featuring a tabbed interface. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './Settings.common.css';
import './Settings.light.css';
import './Settings.dark.css';

interface SettingsProps {
  theme?: 'light' | 'dark';
}

type Tab = 'account' | 'password' | 'notifications';

const Settings: React.FC<SettingsProps> = ({ theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="Settings-form">
            <Input theme={theme} label="Full Name" type="text" defaultValue="Emily Carter" />
            <Input theme={theme} label="Email Address" type="email" defaultValue="emily.carter@example.com" />
            <Input theme={theme} label="Company Name" type="text" defaultValue="Innovate Inc." />
            <Button theme={theme} variant="primary">Save Changes</Button>
          </div>
        );
      case 'password':
        return (
          <div className="Settings-form">
            <Input theme={theme} label="Current Password" type="password" />
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
            <Button theme={theme} variant="primary">Save Preferences</Button>
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
