// @AI-HINT: This is the AI Monitoring page for admins to oversee the platform's AI systems. All styles are per-component only.
'use client';

import React from 'react';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import './AIMonitoring.common.css';
import './AIMonitoring.light.css';
import './AIMonitoring.dark.css';

interface AIMonitoringProps {
  theme?: 'light' | 'dark';
}

// Mock data for AI systems
const aiStats = {
  rankModelAccuracy: '98.2%',
  fraudDetections: 42,
  priceEstimations: 1205,
  chatbotSessions: 850,
};

const recentFraudAlerts = [
  { id: 'f1', projectId: 'p5', reason: 'Suspicious login pattern from client account.', timestamp: '2025-08-04 10:30' },
  { id: 'f2', projectId: 'p3', reason: 'Project description matches known spam templates.', timestamp: '2025-08-04 09:15' },
  { id: 'f3', freelancerId: 'u3', reason: 'Multiple failed withdrawal attempts.', timestamp: '2025-08-03 18:00' },
];

const AIMonitoring: React.FC<AIMonitoringProps> = ({ theme = 'light' }) => {
  return (
    <div className={`AIMonitoring AIMonitoring--${theme}`}>
      <header className="AIMonitoring-header">
        <h1>AI Systems Monitoring</h1>
        <p>Oversee the performance and status of platform AI models.</p>
      </header>

      <div className="AIMonitoring-widgets">
        <DashboardWidget theme={theme} title="Rank Model Accuracy" value={aiStats.rankModelAccuracy} />
        <DashboardWidget theme={theme} title="Fraud Detections (24h)" value={aiStats.fraudDetections.toLocaleString()} />
        <DashboardWidget theme={theme} title="Price Estimations (24h)" value={aiStats.priceEstimations.toLocaleString()} />
        <DashboardWidget theme={theme} title="Chatbot Sessions (24h)" value={aiStats.chatbotSessions.toLocaleString()} />
      </div>

      <div className={`Alerts-list-card Alerts-list-card--${theme}`}>
        <h2>Recent Fraud Alerts</h2>
        <div className="Alerts-list">
          {recentFraudAlerts.map(alert => (
            <div key={alert.id} className={`Alert-item Alert-item--${theme}`}>
              <div className="Alert-icon">⚠️</div>
              <div className="Alert-details">
                <p>{alert.reason}</p>
                <small>Reference: {alert.projectId || alert.freelancerId} | Timestamp: {alert.timestamp}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIMonitoring;
