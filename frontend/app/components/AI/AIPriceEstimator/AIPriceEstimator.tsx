// @AI-HINT: Premium AI Price Estimator component with glassmorphism and animated states
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Sparkles, DollarSign, Clock, BarChart2, Check } from 'lucide-react';
import commonStyles from './AIPriceEstimator.common.module.css';
import lightStyles from './AIPriceEstimator.light.module.css';
import darkStyles from './AIPriceEstimator.dark.module.css';

export interface PriceEstimate {
  low_estimate: number;
  high_estimate: number;
  estimated_hourly_rate: number;
  estimated_hours: number;
  complexity?: string;
  confidence?: number;
}

interface AIPriceEstimatorProps {
  estimate: PriceEstimate | null;
  isLoading?: boolean;
  onApply?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const AIPriceEstimator: React.FC<AIPriceEstimatorProps> = ({
  estimate,
  isLoading = false,
  onApply,
  onDismiss,
  className
}) => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  if (isLoading) {
    return (
      <div className={cn(commonStyles.container, themeStyles.container, className)}>
        <div className={commonStyles.loadingContainer}>
          <div className={cn(commonStyles.spinner, themeStyles.spinner)} />
          <span className={themeStyles.description}>Analyzing project requirements...</span>
        </div>
      </div>
    );
  }

  if (!estimate) return null;

  return (
    <div className={cn(commonStyles.container, themeStyles.container, className)}>
      <div className={commonStyles.header}>
        <div className={cn(commonStyles.iconWrapper, themeStyles.iconWrapper)}>
          <Sparkles size={18} />
          <div className={cn(commonStyles.iconPulse, themeStyles.iconPulse)} />
        </div>
        <div>
          <h3 className={cn(commonStyles.title, themeStyles.title)}>AI Price Estimation</h3>
          <p className={cn(commonStyles.description, themeStyles.description)}>
            Based on market rates and project complexity
          </p>
        </div>
      </div>

      <div className={cn(commonStyles.estimateGrid, themeStyles.estimateGrid)}>
        <div className={commonStyles.estimateItem}>
          <span className={cn(commonStyles.estimateLabel, themeStyles.estimateLabel)}>
            <DollarSign size={12} className={commonStyles.inlineIcon} />
            Hourly Rate
          </span>
          <span className={cn(commonStyles.estimateValue, themeStyles.estimateValue)}>
            ${estimate.estimated_hourly_rate}/hr
          </span>
        </div>
        <div className={commonStyles.estimateItem}>
          <span className={cn(commonStyles.estimateLabel, themeStyles.estimateLabel)}>
            <BarChart2 size={12} className={commonStyles.inlineIcon} />
            Total Budget
          </span>
          <span className={cn(commonStyles.estimateValue, themeStyles.estimateValue)}>
            ${estimate.low_estimate} - ${estimate.high_estimate}
          </span>
        </div>
        <div className={commonStyles.estimateItem}>
          <span className={cn(commonStyles.estimateLabel, themeStyles.estimateLabel)}>
            <Clock size={12} className={commonStyles.inlineIcon} />
            Est. Hours
          </span>
          <span className={cn(commonStyles.estimateValue, themeStyles.estimateValue)}>
            {estimate.estimated_hours} hrs
          </span>
        </div>
      </div>

      <div className={commonStyles.actions}>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className={cn(commonStyles.actionButton, themeStyles.actionButton)}
          >
            Dismiss
          </button>
        )}
        {onApply && (
          <button 
            onClick={onApply}
            className={cn(commonStyles.actionButton, themeStyles.primaryButton)}
          >
            <Check size={16} />
            Apply Suggested Budget
          </button>
        )}
      </div>
    </div>
  );
};

export default AIPriceEstimator;
