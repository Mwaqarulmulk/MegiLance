// @AI-HINT: This is a versatile, enterprise-grade Textarea component. It mirrors the Input component's features, supporting labels, validation states, and full theming for a consistent user experience across all forms.

'use client';

import React, { useId } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './Textarea.common.module.css';
import lightStyles from './Textarea.light.module.css';
import darkStyles from './Textarea.dark.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hideLabel?: boolean;
  error?: string | boolean;
  helpText?: string;
  wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  hideLabel,
  error,
  helpText,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const id = useId();
  const { theme } = useTheme();

  if (!theme) {
    return null; // Don't render until theme is resolved
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;
  const hasError = !!error;

  return (
    <div
      className={cn(
        commonStyles.textareaWrapper,
        themeStyles.textareaWrapper,
        hasError && commonStyles.textareaWrapperError,
        hasError && themeStyles.textareaWrapperError,
        props.disabled && commonStyles.textareaWrapperDisabled,
        props.disabled && themeStyles.textareaWrapperDisabled,
        wrapperClassName
      )}
    >
      {label && <label htmlFor={id} className={cn(commonStyles.textareaLabel, themeStyles.textareaLabel)}>{label}</label>}
      <textarea
        id={id}
        className={cn(
          commonStyles.textareaField,
          themeStyles.textareaField,
          className
        )}
        {...props}
      />
      {hasError && typeof error === 'string' && <p className={cn(commonStyles.errorMessage, themeStyles.errorMessage)}>{error}</p>}
      {!hasError && helpText && <p className={cn(commonStyles.helpText, themeStyles.helpText)}>{helpText}</p>}
    </div>
  );
};

export default Textarea;
