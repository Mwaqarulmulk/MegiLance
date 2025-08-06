// @AI-HINT: This is the Notification component for displaying alerts and system messages. All styles are per-component only. See Notification.common.css, Notification.light.css, and Notification.dark.css for theming.
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import commonStyles from './Notification.common.module.css';
import lightStyles from './Notification.light.module.css';
import darkStyles from './Notification.dark.module.css';

export interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
  className?: string;
  persistent?: boolean; // If true, won't auto-dismiss even with duration set
}

const iconMap = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const positionMap = {
  'top-right': commonStyles.topRight,
  'top-left': commonStyles.topLeft,
  'bottom-right': commonStyles.bottomRight,
  'bottom-left': commonStyles.bottomLeft,
  'top-center': commonStyles.topCenter,
  'bottom-center': commonStyles.bottomCenter,
};

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'info', 
  title,
  duration = 5000,
  position = 'top-right',
  onClose,
  className = '',
  persistent = false
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  const IconComponent = iconMap[type];
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for exit animation
  };

  const startTimer = () => {
    if (duration > 0 && !persistent && onClose) {
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, remainingTimeRef.current);
    }
  };

  const pauseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const resumeTimer = () => {
    if (remainingTimeRef.current > 0) {
      startTimer();
    }
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, persistent, onClose]);

  useEffect(() => {
    if (isPaused) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isPaused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      handleClose();
    }
  };

  if (!theme) return null;

  return (
    <div 
      className={cn(
        commonStyles.notification,
        themeStyles.notification,
        commonStyles[type],
        themeStyles[type],
        positionMap[position],
        !isVisible && commonStyles.hidden,
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={onClose ? 0 : -1}
    >
      <div className={cn(commonStyles.notificationContent, themeStyles.notificationContent)}>
        <div className={cn(commonStyles.notificationIcon, themeStyles.notificationIcon)}>
          <IconComponent size={20} />
        </div>
        <div className={cn(commonStyles.notificationBody, themeStyles.notificationBody)}>
          {title && (
            <div className={cn(commonStyles.notificationTitle, themeStyles.notificationTitle)}>{title}</div>
          )}
          <div className={cn(commonStyles.notificationMessage, themeStyles.notificationMessage)}>{message}</div>
        </div>
        {onClose && (
          <button 
            className={cn(commonStyles.notificationClose, themeStyles.notificationClose)} 
            onClick={handleClose}
            aria-label="Close notification"
            type="button"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
      {duration > 0 && !persistent && (
        <div 
          className={cn(commonStyles.notificationProgress, themeStyles.notificationProgress)} 
          style={{
            '--notification-duration': `${duration}ms`,
            '--notification-play-state': isPaused ? 'paused' : 'running'
          } as React.CSSProperties}
        />
      )}
    </div>
  );
};

export default Notification;
