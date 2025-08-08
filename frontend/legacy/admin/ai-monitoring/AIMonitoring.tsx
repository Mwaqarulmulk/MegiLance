'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import commonStyles from './AIMonitoring.common.module.css';
import lightStyles from './AIMonitoring.light.module.css';
import darkStyles from './AIMonitoring.dark.module.css';

// @AI-HINT: This is the AI Monitoring page for admins to oversee the platform's AI systems.
// It has been fully refactored to use CSS modules with camelCase conventions and the global theme context.

// Mock data for AI system alerts
const alerts = [
  { id: 1, icon: '⚠️', message: 'High API latency detected for GPT-4 model.', timestamp: '2 minutes ago', severity: 'High' },
  { id: 2, icon: '📈', message: 'Project matching accuracy increased by 3.2%.', timestamp: '1 hour ago', severity: 'Info' },
  { id: 3, icon: '📉', message: 'Content moderation model confidence dropped below threshold.', timestamp: '3 hours ago', severity: 'Medium' },
  { id: 4, icon: '💾', message: 'Vector DB memory usage at 85%.', timestamp: '5 hours ago', severity: 'Medium' },
];

// Mock data for metric widgets
const metrics = [
    { title: 'Model Accuracy', value: '98.7%', change: '+0.2%', isPositive: true },
    { title: 'API Latency', value: '120ms', change: '-15ms', isPositive: true },
    { title: 'Anomalies Detected', value: '12', change: '+3', isPositive: false },
    { title: 'Active Models', value: '8', change: '±0', isPositive: true },
];

const AIMonitoring: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  return (
    <div className={`${styles.aiMonitoringPage} ${theme === 'dark' ? styles.aiMonitoringPageDark : styles.aiMonitoringPageLight}`}>
      <header className={styles.header}>
        <h1>AI Systems Monitoring</h1>
        <p>Real-time overview of platform AI performance and health.</p>
      </header>

      <div className={styles.widgets}>
        {metrics.map(metric => (
            <div key={metric.title} className={styles.widgetCard}>
                <h3 className={styles.widgetTitle}>{metric.title}</h3>
                <p className={styles.widgetValue}>{metric.value}</p>
                <span className={`${styles.widgetChange} ${metric.isPositive ? styles.positive : styles.negative}`}>
                    {metric.change}
                </span>
            </div>
        ))}
      </div>

      <div className={styles.alertsListCard}>
        <h2>Recent AI Alerts</h2>
        <div className={styles.alertsList}>
          {alerts.map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <span className={styles.alertIcon}>{alert.icon}</span>
              <div className={styles.alertDetails}>
                <p>{alert.message}</p>
                <small>{alert.timestamp}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIMonitoring;
