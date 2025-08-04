// @AI-HINT: This is the Button component for user actions. All styles are per-component only. See Button.common.css, Button.light.css, and Button.dark.css for theming.
import React, { ButtonHTMLAttributes } from 'react';
import './Button.common.css';
import './Button.light.css';
import './Button.dark.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'light' | 'dark';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  theme = 'light',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  ...rest
}) => {
  const className = `
    Button
    Button--${theme}
    Button--${variant}
    Button--${size}
    ${fullWidth ? 'Button--fullWidth' : ''}
  `;

  return (
    <button className={className.trim().replace(/\s+/g, ' ')} {...rest}>
      {children}
    </button>
  );
};

export default Button;
