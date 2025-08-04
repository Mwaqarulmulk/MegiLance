// @AI-HINT: This is a Badge component, an atomic element for displaying statuses, tags, or other small pieces of information.
'use client';

import React from 'react';
import './Badge.common.css';
import './Badge.light.css';
import './Badge.dark.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  theme?: 'light' | 'dark';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', theme = 'light' }) => {
  return (
    <span className={`Badge Badge--${variant} Badge--${theme}`}>
      {children}
    </span>
  );
};

export default Badge;
