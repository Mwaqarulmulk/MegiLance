// @AI-HINT: This is a Card component, a molecular element used as a reusable container for content sections.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Card.common.css';
import './Card.light.css';
import './Card.dark.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  paddingSize?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  actions,
  footer,
  paddingSize = 'medium',
}) => {
  const { theme } = useTheme();

  const cardClasses = [
    'Card',
    `Card--${theme}`,
    `Card--padding-${paddingSize}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || actions) && (
        <div className="Card-header">
          {title && <h3 className="Card-title">{title}</h3>}
          {actions && <div className="Card-actions">{actions}</div>}
        </div>
      )}
      <div className="Card-body">{children}</div>
      {footer && <div className="Card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
