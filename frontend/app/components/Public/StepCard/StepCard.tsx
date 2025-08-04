// @AI-HINT: This component displays a single step in a process, used on the 'How It Works' page.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './StepCard.common.css';
import './StepCard.light.css';
import './StepCard.dark.css';

export interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, description, icon }) => {
  const { theme } = useTheme();

  return (
    <div className={`StepCard-container StepCard-container--${theme}`}>
      <div className="StepCard-header">
        <div className="StepCard-icon-wrapper">
          {icon}
        </div>
        <div className="StepCard-number">{stepNumber}</div>
      </div>
      <div className="StepCard-content">
        <h3 className="StepCard-title">{title}</h3>
        <p className="StepCard-description">{description}</p>
      </div>
    </div>
  );
};

export default StepCard;
