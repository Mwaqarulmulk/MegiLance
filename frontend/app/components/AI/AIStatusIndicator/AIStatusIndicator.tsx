// @AI-HINT: AI Connection Status indicator component with real-time status, latency, and mode display
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Zap,
  Clock,
  Server,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import commonStyles from './AIStatusIndicator.common.module.css';
import lightStyles from './AIStatusIndicator.light.module.css';
import darkStyles from './AIStatusIndicator.dark.module.css';

// ============================================================================
// Types
// ============================================================================

export interface AIConnectionStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastPing: Date | null;
  latency: number | null;
  mode: 'online' | 'offline' | 'degraded';
  backendAvailable: boolean;
  aiServiceAvailable: boolean;
  error: string | null;
}

export interface AIStatusIndicatorProps {
  status: AIConnectionStatus;
  onRetry?: () => void;
  showDetails?: boolean;
  variant?: 'badge' | 'card' | 'minimal';
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  status,
  onRetry,
  showDetails = false,
  variant = 'badge',
  className,
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getStatusIcon = () => {
    if (status.isConnecting) {
      return <RefreshCw size={14} className={commonStyles.spinIcon} />;
    }
    switch (status.mode) {
      case 'online':
        return <Wifi size={14} />;
      case 'degraded':
        return <AlertTriangle size={14} />;
      case 'offline':
      default:
        return <WifiOff size={14} />;
    }
  };

  const getStatusText = () => {
    if (status.isConnecting) return 'Connecting...';
    switch (status.mode) {
      case 'online':
        return 'Online';
      case 'degraded':
        return 'Limited';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    if (status.isConnecting) return 'connecting';
    return status.mode;
  };

  const formatLatency = (ms: number | null) => {
    if (ms === null) return '--';
    if (ms < 100) return `${ms}ms 🚀`;
    if (ms < 300) return `${ms}ms ✓`;
    return `${ms}ms ⚠️`;
  };

  const formatLastPing = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  // Minimal variant - just a dot
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          commonStyles.minimal,
          commonStyles[getStatusColor()],
          themeStyles[getStatusColor()],
          className
        )}
        title={`AI Status: ${getStatusText()}`}
      >
        <span className={cn(commonStyles.dot, themeStyles.dot)} />
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div
        className={cn(
          commonStyles.badge,
          commonStyles[getStatusColor()],
          themeStyles.badge,
          themeStyles[getStatusColor()],
          className
        )}
        onClick={() => showDetails && setExpanded(!expanded)}
        role={showDetails ? 'button' : undefined}
        tabIndex={showDetails ? 0 : undefined}
      >
        <span className={cn(commonStyles.dot, themeStyles.dot)} />
        <span className={commonStyles.badgeIcon}>{getStatusIcon()}</span>
        <span className={commonStyles.badgeText}>{getStatusText()}</span>
        
        {status.latency !== null && status.mode === 'online' && (
          <span className={cn(commonStyles.latency, themeStyles.latency)}>
            {status.latency}ms
          </span>
        )}

        {/* Expanded Details Dropdown */}
        <AnimatePresence>
          {showDetails && expanded && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(commonStyles.dropdown, themeStyles.dropdown)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={commonStyles.dropdownHeader}>
                <Bot size={16} />
                <span>AI Service Status</span>
              </div>
              
              <div className={commonStyles.dropdownBody}>
                <div className={commonStyles.statusRow}>
                  <Server size={14} />
                  <span>Backend API</span>
                  <span className={cn(
                    commonStyles.statusDot,
                    status.backendAvailable ? themeStyles.statusOnline : themeStyles.statusOffline
                  )} />
                </div>
                
                <div className={commonStyles.statusRow}>
                  <Zap size={14} />
                  <span>AI Service</span>
                  <span className={cn(
                    commonStyles.statusDot,
                    status.aiServiceAvailable ? themeStyles.statusOnline : themeStyles.statusOffline
                  )} />
                </div>
                
                <div className={commonStyles.statusRow}>
                  <Clock size={14} />
                  <span>Latency</span>
                  <span className={themeStyles.latencyValue}>
                    {formatLatency(status.latency)}
                  </span>
                </div>
                
                <div className={commonStyles.statusRow}>
                  <RefreshCw size={14} />
                  <span>Last Check</span>
                  <span className={themeStyles.lastPing}>
                    {formatLastPing(status.lastPing)}
                  </span>
                </div>
              </div>

              {status.error && (
                <div className={cn(commonStyles.errorBox, themeStyles.errorBox)}>
                  <AlertTriangle size={14} />
                  <span>{status.error}</span>
                </div>
              )}

              {onRetry && !status.isConnecting && (
                <button
                  className={cn(commonStyles.retryButton, themeStyles.retryButton)}
                  onClick={onRetry}
                >
                  <RefreshCw size={14} />
                  Retry Connection
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Card variant - full details
  return (
    <div className={cn(commonStyles.card, themeStyles.card, className)}>
      <div className={commonStyles.cardHeader}>
        <div className={cn(
          commonStyles.cardStatus,
          commonStyles[getStatusColor()],
          themeStyles[getStatusColor()]
        )}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
        
        {onRetry && !status.isConnecting && (
          <button
            className={cn(commonStyles.cardRetryButton, themeStyles.cardRetryButton)}
            onClick={onRetry}
            aria-label="Retry connection"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      <div className={commonStyles.cardGrid}>
        <div className={cn(commonStyles.cardItem, themeStyles.cardItem)}>
          <Server size={18} />
          <div>
            <span className={commonStyles.cardLabel}>Backend</span>
            <span className={cn(
              commonStyles.cardValue,
              status.backendAvailable ? themeStyles.valueOnline : themeStyles.valueOffline
            )}>
              {status.backendAvailable ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className={cn(commonStyles.cardItem, themeStyles.cardItem)}>
          <Zap size={18} />
          <div>
            <span className={commonStyles.cardLabel}>AI Engine</span>
            <span className={cn(
              commonStyles.cardValue,
              status.aiServiceAvailable ? themeStyles.valueOnline : themeStyles.valueOffline
            )}>
              {status.aiServiceAvailable ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        <div className={cn(commonStyles.cardItem, themeStyles.cardItem)}>
          <Clock size={18} />
          <div>
            <span className={commonStyles.cardLabel}>Latency</span>
            <span className={commonStyles.cardValue}>
              {formatLatency(status.latency)}
            </span>
          </div>
        </div>

        <div className={cn(commonStyles.cardItem, themeStyles.cardItem)}>
          <RefreshCw size={18} />
          <div>
            <span className={commonStyles.cardLabel}>Last Check</span>
            <span className={commonStyles.cardValue}>
              {formatLastPing(status.lastPing)}
            </span>
          </div>
        </div>
      </div>

      {status.error && (
        <div className={cn(commonStyles.cardError, themeStyles.cardError)}>
          <AlertTriangle size={14} />
          <span>{status.error}</span>
        </div>
      )}

      {status.mode === 'offline' && (
        <div className={cn(commonStyles.offlineNote, themeStyles.offlineNote)}>
          <Bot size={14} />
          <span>Using offline mode with limited features</span>
        </div>
      )}
    </div>
  );
};

export default AIStatusIndicator;
