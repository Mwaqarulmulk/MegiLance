// @AI-HINT: This component displays an animated typing indicator to show when a user is writing a message.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './TypingIndicator.common.module.css';
import lightStyles from './TypingIndicator.light.module.css';
import darkStyles from './TypingIndicator.dark.module.css';

const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();
  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.themeWrapper)}>
      <div className={commonStyles.dot}></div>
      <div className={commonStyles.dot}></div>
      <div className={commonStyles.dot}></div>
    </div>
  );
};

export default TypingIndicator;
