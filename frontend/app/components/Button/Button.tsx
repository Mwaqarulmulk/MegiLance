// @AI-HINT: This is a versatile, enterprise-grade Button component for all user actions. It supports multiple variants (primary, secondary, outline, danger), sizes, loading/disabled states, and icons. All styles are per-component only. See Button.common.css, Button.light.css, and Button.dark.css for theming.

import React from 'react';
import './Button.common.css';
import './Button.light.css';
import './Button.dark.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  iconBefore,
  iconAfter,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const isDisabled = isLoading || disabled;

  const buttonClasses = [
    'Button',
    `Button--${variant}`,
    `Button--${size}`,
    isDisabled ? 'Button--disabled' : '',
    isLoading ? 'Button--loading' : '',
    fullWidth ? 'Button--fullWidth' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} disabled={isDisabled} {...props}>
      {isLoading && <div className="Button-spinner"></div>}
      <span className="Button-content">
        {iconBefore && <span className="Button-icon Button-icon--before">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="Button-icon Button-icon--after">{iconAfter}</span>}
      </span>
    </button>
  );
};

export default Button;
