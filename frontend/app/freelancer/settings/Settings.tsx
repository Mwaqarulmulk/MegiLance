// @AI-HINT: This is the Settings page for freelancers to manage their account. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import commonStyles from './Settings.common.module.css';
import lightStyles from './Settings.light.module.css';
import darkStyles from './Settings.dark.module.css';

// @AI-HINT: This is the Settings page for freelancers to manage their account. All styles are per-component only. Now fully theme-switchable using global theme context.

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className={commonStyles.settings}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences.</p>
        </header>

        <div className={commonStyles.layout}>
          <nav className={commonStyles.nav}>
            <button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? commonStyles.active : ''}>Account</button>
            <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? commonStyles.active : ''}>Password</button>
            <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? commonStyles.active : ''}>Notifications</button>
          </nav>

          <main className={commonStyles.content}>
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'password' && <PasswordSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
          </main>
        </div>
      </div>
    </div>
  );
};

const AccountSettings: React.FC = () => {
  return (
    <div className={commonStyles.panel}>
      <h2>Account Information</h2>
      <form className={commonStyles.form}>
        <Input label="Full Name" type="text" defaultValue="John Doe" />
        <Input label="Email Address" type="email" defaultValue="john.doe@example.com" />
        <Button variant="primary">Save Changes</Button>
      </form>
    </div>
  );
};

const PasswordSettings: React.FC = () => {
  return (
    <div className={commonStyles.panel}>
      <h2>Change Password</h2>
      <form className={commonStyles.form}>
        <Input label="Current Password" type="password" placeholder="Enter current password" />
        <Input label="New Password" type="password" placeholder="Enter new password" />
        <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
        <Button variant="primary">Change Password</Button>
      </form>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  return (
    <div className={commonStyles.panel}>
      <h2>Notification Preferences</h2>
      <form className={commonStyles.form}>
        <label>
          <input type="checkbox" defaultChecked /> Email me about new projects
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Email me about account activity
        </label>
        <Button variant="primary">Save Preferences</Button>
      </form>
    </div>
  );
};

export default Settings;
