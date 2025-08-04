// @AI-HINT: This is the platform Settings page for admins. All styles are per-component only.
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

type Tab = 'general' | 'fees' | 'integrations';

const Settings: React.FC<SettingsProps> = ({ theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="Settings-form">
            <Input theme={theme} label="Platform Name" type="text" defaultValue="MegiLance" />
            <Input theme={theme} label="Support Email" type="email" defaultValue="support@megilance.com" />
            <label className="Checkbox-label">
              <input type="checkbox" defaultChecked />
              Enable new user registrations.
            </label>
            <Button theme={theme} variant="primary">Save General Settings</Button>
          </div>
        );
      case 'fees':
        return (
          <div className="Settings-form">
            <Input theme={theme} label="Freelancer Service Fee (%)" type="number" defaultValue="10" />
            <Input theme={theme} label="Client Payment Processing Fee (%)" type="number" defaultValue="2.9" />
            <Input theme={theme} label="Fixed Processing Fee (USD)" type="number" defaultValue="0.30" />
            <Button theme={theme} variant="primary">Save Fee Structure</Button>
          </div>
        );
      case 'integrations':
        return (
          <div className="Settings-form">
            <Input theme={theme} label="Stripe API Key" type="password" defaultValue="pk_test_1234567890"/>
            <Input theme={theme} label="Google Analytics ID" type="text" defaultValue="UA-12345678-1" />
            <Button theme={theme} variant="primary">Save Integrations</Button>
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
          <h1>Platform Settings</h1>
          <p>Configure global settings for the entire platform.</p>
        </header>

        <div className="Settings-layout">
          <nav className="Settings-nav">
            <button onClick={() => setActiveTab('general')} className={activeTab === 'general' ? 'active' : ''}>General</button>
            <button onClick={() => setActiveTab('fees')} className={activeTab === 'fees' ? 'active' : ''}>Fees & Charges</button>
            <button onClick={() => setActiveTab('integrations')} className={activeTab === 'integrations' ? 'active' : ''}>Integrations</button>
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
