// @AI-HINT: This component renders a single chat message bubble, styled differently for the sender and receiver.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './ChatMessageBubble.common.module.css';
import lightStyles from './ChatMessageBubble.light.module.css';
import darkStyles from './ChatMessageBubble.dark.module.css';

interface ChatMessageBubbleProps {
  text: string;
  timestamp: string;
  isSender: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ text, timestamp, isSender }) => {
  const { theme } = useTheme();
  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(
      commonStyles.container,
      isSender ? commonStyles.senderContainer : commonStyles.receiverContainer
    )}>
      <div className={cn(
        commonStyles.bubble,
        isSender ? themeStyles.sender : themeStyles.receiver
      )}>
        <p className={commonStyles.text}>{text}</p>
        <span className={cn(
          commonStyles.timestamp,
          isSender ? themeStyles.senderTimestamp : themeStyles.receiverTimestamp
        )}>{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
