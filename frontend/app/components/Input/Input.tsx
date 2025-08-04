// @AI-HINT: This is the Input component entry point. All styles are per-component only. See Input.common.css, Input.light.css, and Input.dark.css for theming.
import React, { useId, InputHTMLAttributes } from 'react';
import './Input.common.css';
import './Input.light.css';
import './Input.dark.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'light' | 'dark';
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ theme = 'light', label, error, ...rest }) => {
  const id = useId();
  const inputClassName = `Input Input--${theme} ${error ? 'Input--error' : ''}`;

  return (
    <div className="Input-wrapper">
      <label htmlFor={id} className="Input-label">{label}</label>
      <input
        id={id}
        className={inputClassName}
        {...rest}
      />
      {error && <span className="Input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
