// @AI-HINT: This is a reusable Checkbox component. It is designed to be themeable and accessible.
'use client';
import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Checkbox.common.module.css';
import lightStyles from './Checkbox.light.module.css';
import darkStyles from './Checkbox.dark.module.css';

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, checked, onChange, children, error }) => {
  const { theme } = useTheme();
  
  if (!theme) {
    return null; // Don't render until theme is resolved
  }
  
  const themeStyles = theme === 'light' ? lightStyles : darkStyles;
  
  return (
    <div className={cn(commonStyles.checkboxWrapper, themeStyles.checkboxWrapper)}>
      <label className={cn(commonStyles.checkboxLabel, themeStyles.checkboxLabel)}>
        <input
          type="checkbox"
          name={name}
          className={cn(commonStyles.checkboxInput, themeStyles.checkboxInput)}
          checked={checked}
          onChange={onChange}
        />
        <span className={cn(commonStyles.checkboxCustom, themeStyles.checkboxCustom)}></span>
        <span className={cn(commonStyles.checkboxText, themeStyles.checkboxText)}>{children}</span>
      </label>
      {error && <p className={cn(commonStyles.checkboxError, themeStyles.checkboxError)}>{error}</p>}
    </div>
  );
};

export default Checkbox;
