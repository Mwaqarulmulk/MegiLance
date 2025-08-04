// @AI-HINT: This is the Settings page for freelancers to manage their account. All styles are per-component only.
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

const Settings: React.FC<SettingsProps> = ({ theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className={`Settings Settings--${theme}`}>
      <div className="Settings-container">
        <header className="Settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences.</p>
        </header>

        <div className="Settings-layout">
          <nav className="Settings-nav">
            <button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>Account</button>
            <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? 'active' : ''}>Password</button>
            <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}>Notifications</button>
          </nav>

          <main className="Settings-content">
            {activeTab === 'account' && <AccountSettings theme={theme} />}
            {activeTab === 'password' && <PasswordSettings theme={theme} />}
            {activeTab === 'notifications' && <NotificationSettings theme={theme} />}
          </main>
        </div>
      </div>
    </div>
  );
};

const AccountSettings: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => (
  <div className="Settings-panel">
    <h2>Account Information</h2>
    <form className="Settings-form">
      <Input theme={theme} label="Full Name" type="text" defaultValue="John Doe" />
      <Input theme={theme} label="Email Address" type="email" defaultValue="john.doe@example.com" />
      <Button theme={theme} variant="primary">Save Changes</Button>
    </form>
  </div>
);

const PasswordSettings: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => (
  <div className="Settings-panel">
    <h2>Change Password</h2>
    <form className="Settings-form">
      <Input theme={theme} label="Current Password" type="password" placeholder="Enter current password" />
      <Input theme={theme} label="New Password" type="password" placeholder="Enter new password" />
      <Input theme={theme} label="Confirm New Password" type="password" placeholder="Confirm new password" />
      <Button theme={theme} variant="primary">Update Password</Button>
    </form>
  </div>
);

const NotificationSettings: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => (
  <div className="Settings-panel">
    <h2>Notification Preferences</h2>
    <form className="Settings-form">
      <div className="Toggle-group">
        <label htmlFor="project-invites">Project Invites</label>
        <input type="checkbox" id="project-invites" defaultChecked />
      </div>
      <div className="Toggle-group">
        <label htmlFor="message-alerts">New Message Alerts</label>
        <input type="checkbox" id="message-alerts" defaultChecked />
      </div>
      <div className="Toggle-group">
        <label htmlFor="newsletter">Platform Newsletter</label>
        <input type="checkbox" id="newsletter" />
      </div>
      <Button theme={theme} variant="primary">Save Preferences</Button>
    </form>
  </div>
);

export default Settings;
