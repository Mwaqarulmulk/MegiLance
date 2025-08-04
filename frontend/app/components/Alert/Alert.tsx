// @AI-HINT: This is an Alert component, an atomic element for displaying prominent messages to the user.
'use client';

import React from 'react';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiX } from 'react-icons/fi';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Alert.common.css';
import './Alert.light.css';
import './Alert.dark.css';

export interface AlertProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  onClose?: () => void;
  className?: string;
}

const ICONS: { [key: string]: React.ReactNode } = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  danger: <FiXCircle />,
};

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const { theme } = useTheme();

  const alertClasses = [
    'Alert',
    `Alert--${variant}`,
    `Alert--${theme}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} role="alert">
      <div className="Alert-icon">{ICONS[variant]}</div>
      <div className="Alert-content">
        <h3 className="Alert-title">{title}</h3>
        <div className="Alert-description">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="Alert-close-button" aria-label="Close alert">
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;
