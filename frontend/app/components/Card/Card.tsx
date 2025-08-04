// @AI-HINT: This is a Card component, a molecular element used as a reusable container for content sections.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Card.common.css';
import './Card.light.css';
import './Card.dark.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div className={`Card Card--${theme} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
