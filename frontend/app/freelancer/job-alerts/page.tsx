// @AI-HINT: This page allows freelancers to manage their job alerts, including saved filters and AI recommendations.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import './JobAlertsPage.common.css';
import './JobAlertsPage.light.css';
import './JobAlertsPage.dark.css';

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

const JobAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleDelete = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="JobAlertsPage-container">
      <header className="JobAlertsPage-header">
        <h1 className="JobAlertsPage-title">Job Alerts</h1>
        <p className="JobAlertsPage-subtitle">Never miss an opportunity. Get notified about jobs that match your skills.</p>
      </header>

      <main className="JobAlertsPage-main">
        <div className="JobAlertsPage-card">
          <h2 className="JobAlertsPage-card-title">Create New Alert</h2>
          {/* @AI-HINT: A form would go here in a full implementation */}
          <form className="JobAlertsPage-form">
            <label htmlFor="alert-keywords" className="visually-hidden">Keywords for job alert</label>
            <input id="alert-keywords" type="text" placeholder="Keywords (e.g., 'rust, defi')" className="JobAlertsPage-input" />
            <label htmlFor="alert-frequency" className="visually-hidden">Job alert frequency</label>
            <select id="alert-frequency" className="JobAlertsPage-input">
              <option>Daily</option>
              <option>Weekly</option>
            </select>
            <Button variant="primary">Create Alert</Button>
          </form>
        </div>

        <div className="JobAlertsPage-card">
          <h2 className="JobAlertsPage-card-title">Your Alerts</h2>
          <div className="JobAlertsPage-list">
            {alerts.map(alert => (
              <div key={alert.id} className="JobAlertsPage-list-item">
                <div className="JobAlertsPage-alert-info">
                  <span className="JobAlertsPage-alert-name">{alert.name}</span>
                  <span className="JobAlertsPage-alert-keywords">{alert.keywords}</span>
                </div>
                <div className="JobAlertsPage-alert-details">
                  {alert.isAiPowered && <Badge variant="info">AI</Badge>}
                  <span className="JobAlertsPage-alert-frequency">{alert.frequency}</span>
                  <div className="JobAlertsPage-alert-actions">
                    <Button variant="secondary" size="small">Edit</Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(alert.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobAlertsPage;
