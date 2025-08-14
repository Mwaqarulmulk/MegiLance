// @AI-HINT: This component displays an animated statistic for the GlobalImpact section.

'use client';

import React, { useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useAnimatedCounter from '@/hooks/useAnimatedCounter'; // Assuming this hook exists and works

import commonStyles from './ImpactStatCard.common.module.css';
import lightStyles from './ImpactStatCard.light.module.css';
import darkStyles from './ImpactStatCard.dark.module.css';

// --- Type Definitions ---
interface ImpactStat {
  icon: React.ElementType;
  number: string;
  label: string;
  description: string;
}

interface ImpactStatCardProps {
  stat: ImpactStat;
}

// --- Main Component ---
const ImpactStatCard: React.FC<ImpactStatCardProps> = ({ stat }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { icon: Icon, number, label, description } = stat;

  // --- Animated Counter Logic ---
  const match = number.match(/^([$]?)([,\d.]+)([KkMmBb]?\+?|\/5)?$/) || [];
  const prefix = match[1] || '';
  const targetValue = parseFloat((match[2] || '0').replace(/,/g, ''));
  const suffix = match[3] || '';
  const decimals = (match[2] || '').includes('.') ? (match[2] || '').split('.')[1].length : 0;
  const animatedValue = useAnimatedCounter(targetValue, 2500, decimals, ref);

  const titleId = `${label.replace(/\s+/g, '-').toLowerCase()}-label`;
  const descId = `${label.replace(/\s+/g, '-').toLowerCase()}-desc`;

  return (
    <div
      ref={ref}
      className={cn(commonStyles.statCard, themeStyles.statCard)}
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className={cn(commonStyles.iconWrapper, themeStyles.iconWrapper)}>
        <Icon className={commonStyles.icon} aria-hidden="true" focusable="false" />
      </div>
      <div className={commonStyles.content}>
        <p className={cn(commonStyles.number, themeStyles.number)}>
          {prefix}{animatedValue}{suffix}
        </p>
        <h4 id={titleId} className={cn(commonStyles.label, themeStyles.label)}>{label}</h4>
        <p id={descId} className={cn(commonStyles.description, themeStyles.description)}>{description}</p>
      </div>
    </div>
  );
};

export default ImpactStatCard;
