// @AI-HINT: This is an Alert component, an atomic element for displaying prominent messages to the user.
'use client';

import React from 'react';
import './Alert.common.css';
import './Alert.light.css';
import './Alert.dark.css';

interface AlertProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  theme?: 'light' | 'dark';
}

const ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  danger: '🚫',
};

const Alert: React.FC<AlertProps> = ({ title, children, variant = 'info', theme = 'light' }) => {
  return (
    <div className={`Alert Alert--${variant} Alert--${theme}`}>
      <div className="Alert-icon">{ICONS[variant]}</div>
      <div className="Alert-content">
        <h3 className="Alert-title">{title}</h3>
        <div className="Alert-description">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
