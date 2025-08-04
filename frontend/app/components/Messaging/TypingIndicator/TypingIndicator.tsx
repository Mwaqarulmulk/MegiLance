// @AI-HINT: This component displays an animated typing indicator to show when a user is writing a message.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './TypingIndicator.common.css';
import './TypingIndicator.light.css';
import './TypingIndicator.dark.css';

const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`TypingIndicator-container TypingIndicator-container--${theme}`}>
      <div className="TypingIndicator-dot"></div>
      <div className="TypingIndicator-dot"></div>
      <div className="TypingIndicator-dot"></div>
    </div>
  );
};

export default TypingIndicator;
