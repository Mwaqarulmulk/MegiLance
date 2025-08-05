// @AI-HINT: This is a versatile, enterprise-grade Input component. It supports labels, icons, validation states (error), and is fully themed. All styles are per-component only. See Input.common.css, Input.light.css, and Input.dark.css for theming.

import React, { useId } from 'react';
import './Input.common.css';
import './Input.light.css';
import './Input.dark.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  error?: string | boolean;
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  iconBefore,
  iconAfter,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const id = useId();
  const hasError = !!error;

  const wrapperClasses = [
    'Input-wrapper',
    hasError ? 'Input-wrapper--error' : '',
    props.disabled ? 'Input-wrapper--disabled' : '',
    wrapperClassName,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'Input-field',
    iconBefore ? 'Input-field--with-icon-before' : '',
    iconAfter ? 'Input-field--with-icon-after' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && <label htmlFor={id} className="Input-label">{label}</label>}
      <div className="Input-container">
        {iconBefore && <span className="Input-icon Input-icon--before">{iconBefore}</span>}
        <input id={id} className={inputClasses} {...props} />
        {iconAfter && <span className="Input-icon Input-icon--after">{iconAfter}</span>}
      </div>
      {hasError && typeof error === 'string' && <p className="Input-error-message">{error}</p>}
    </div>
  );
};

export default Input;
